import { createClient } from "@supabase/supabase-js";
import { sendCrmPaymentReminder } from "@/lib/crm/services/reminders";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function dateKey(timezone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function daysBetween(date: string, dueDate: string) {
  const current = Date.parse(`${date}T00:00:00Z`);
  const due = Date.parse(`${String(dueDate).slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(current) || !Number.isFinite(due)) return null;
  return Math.floor((current - due) / 86_400_000);
}

function authorize(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return bearer === secret || request.headers.get("x-cron-secret") === secret;
}

async function run(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized reminder job." }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase server credentials are not configured." }, { status: 500 });
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const [{ data: settings, error: settingsError }, { data: rules, error: rulesError }] = await Promise.all([
    supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("crm_reminder_rules")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 });
  if (rulesError) return NextResponse.json({ error: rulesError.message }, { status: 500 });
  if (!settings?.automatic_reminders_enabled) {
    return NextResponse.json({ ok: true, skipped: true, reason: "Automatic reminders are disabled." });
  }

  const today = dateKey(settings.timezone || "America/Edmonton");
  const { data: invoices, error: invoiceError } = await supabase
    .from("crm_invoices")
    .select("*, crm_customers(display_name, email), crm_invoice_items(*), crm_payments(*)")
    .in("status", ["issued", "unpaid", "partially_paid", "overdue"])
    .eq("is_void", false)
    .eq("automatic_reminders_disabled", false)
    .gt("balance_cents", 0)
    .not("due_date", "is", null)
    .limit(200);
  if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 500 });

  const results: Array<Record<string, unknown>> = [];

  for (const invoice of invoices || []) {
    const overdueDays = daysBetween(today, invoice.due_date);
    if (overdueDays === null || overdueDays < 0) continue;
    const customer = Array.isArray(invoice.crm_customers) ? invoice.crm_customers[0] : invoice.crm_customers;
    const to = String(customer?.email || "").trim();

    for (const rule of rules || []) {
      if (Number(rule.days_after_due) !== overdueDays) continue;
      const idempotencyKey = `auto-reminder:${invoice.id}:${rule.id}:${today}`;
      const { data: runRow, error: runInsertError } = await supabase
        .from("crm_reminder_runs")
        .insert({
          invoice_id: invoice.id,
          rule_id: rule.id,
          run_date: today,
          status: "processing",
          idempotency_key: idempotencyKey,
        })
        .select("id")
        .maybeSingle();

      if (runInsertError && /duplicate|unique/i.test(runInsertError.message || "")) {
        results.push({ invoice_id: invoice.id, rule_id: rule.id, status: "duplicate_skipped" });
        continue;
      }
      if (runInsertError) {
        console.error("CRM reminder run insert failed:", runInsertError);
      }

      const sent = await sendCrmPaymentReminder({
        supabase,
        invoice,
        to,
        attachPdf: rule.attach_pdf !== false,
        idempotencyKey,
        automatic: true,
        ruleId: rule.id,
      });

      if (runRow?.id) {
        await supabase
          .from("crm_reminder_runs")
          .update({
            status: sent.ok ? (sent.duplicate ? "duplicate_skipped" : "sent") : "failed",
            email_id: "email_id" in sent ? sent.email_id : null,
            error: sent.ok ? null : sent.error,
            completed_at: new Date().toISOString(),
          })
          .eq("id", runRow.id);
      }

      results.push({
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        rule_id: rule.id,
        days_after_due: overdueDays,
        status: sent.ok ? (sent.duplicate ? "duplicate_skipped" : "sent") : "failed",
        error: sent.ok ? null : sent.error,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    date: today,
    processed: results.length,
    sent: results.filter((row) => row.status === "sent").length,
    failed: results.filter((row) => row.status === "failed").length,
    duplicates_skipped: results.filter((row) => row.status === "duplicate_skipped").length,
    results,
  });
}

export async function GET(request: NextRequest) {
  return run(request);
}

export async function POST(request: NextRequest) {
  return run(request);
}
