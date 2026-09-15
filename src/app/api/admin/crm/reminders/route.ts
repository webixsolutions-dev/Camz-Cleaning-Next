import { isDeliverableEmail } from "@/lib/crm/emailAddress";
import { sendCrmPaymentReminder } from "@/lib/crm/services/reminders";
import { getCrmActor } from "@/lib/crm/staff";
import { enforceMutationSecurity, readJsonBody, securityErrorResponse } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

function clean(value: unknown, max = 20_000) {
  return String(value ?? "").trim().slice(0, max);
}

async function loadInvoice(supabase: any, invoiceId: string) {
  return supabase
    .from("crm_invoices")
    .select("*, crm_customers(display_name, email), crm_invoice_items(*), crm_payments(*)")
    .eq("id", invoiceId)
    .maybeSingle();
}

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });
  const invoiceId = clean(new URL(request.url).searchParams.get("invoice_id"), 80);
  if (!invoiceId) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });

  const [{ data: invoice, error: invoiceError }, { data: settings }, { data: emails }] = await Promise.all([
    loadInvoice(supabase, invoiceId),
    supabase.from("crm_company_settings").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("crm_invoice_emails")
      .select("id, to_email, subject, status, sent_at, error, created_at")
      .eq("invoice_id", invoiceId)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);
  if (invoiceError || !invoice) {
    return NextResponse.json({ error: invoiceError?.message || "Invoice not found." }, { status: 404 });
  }
  return NextResponse.json({
    invoice: {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      status: invoice.status,
      is_void: invoice.is_void,
      balance_cents: invoice.balance_cents,
      due_date: invoice.due_date,
      automatic_reminders_disabled: Boolean(invoice.automatic_reminders_disabled),
      last_reminder_at: invoice.last_reminder_at,
      customer_email: Array.isArray(invoice.crm_customers)
        ? invoice.crm_customers[0]?.email || ""
        : invoice.crm_customers?.email || "",
    },
    defaults: {
      subject: settings?.reminder_email_subject_template || "Payment reminder - Invoice {{invoice_number}}",
      body: settings?.reminder_email_body_template || "",
      attach_pdf: true,
    },
    emails: emails || [],
  });
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: "crm-reminder-send",
    limit: 20,
    windowSeconds: 60,
  });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = await readJsonBody<Record<string, unknown>>(request, 64 * 1024);
    const invoiceId = clean(body.invoice_id, 80);
    const to = clean(body.to, 320);
    const requestId = clean(body.request_id, 100) || crypto.randomUUID();
    if (!invoiceId) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });
    if (!isDeliverableEmail(to)) return NextResponse.json({ error: "Enter a valid customer email." }, { status: 400 });

    const { data: invoice, error: invoiceError } = await loadInvoice(supabase, invoiceId);
    if (invoiceError || !invoice) {
      return NextResponse.json({ error: invoiceError?.message || "Invoice not found." }, { status: 404 });
    }

    const result = await sendCrmPaymentReminder({
      supabase,
      invoice,
      actorId: actor.userId,
      to,
      subjectOverride: clean(body.subject, 500) || undefined,
      bodyOverride: clean(body.body) || undefined,
      attachPdf: body.attach_pdf !== false,
      idempotencyKey: `manual-reminder:${invoiceId}:${requestId}`,
      automatic: false,
    });
    if (!result.ok) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (caught) {
    const response = securityErrorResponse(caught);
    if (response) return response;
    return NextResponse.json({ error: caught instanceof Error ? caught.message : "Unable to send reminder." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: "crm-reminder-toggle",
    limit: 30,
    windowSeconds: 60,
  });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = await readJsonBody<Record<string, unknown>>(request);
    const invoiceId = clean(body.invoice_id, 80);
    if (!invoiceId) return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });
    const { data, error: updateError } = await supabase
      .from("crm_invoices")
      .update({ automatic_reminders_disabled: Boolean(body.disabled), updated_at: new Date().toISOString() })
      .eq("id", invoiceId)
      .select("id, automatic_reminders_disabled")
      .single();
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
    return NextResponse.json({ invoice: data });
  } catch (caught) {
    const response = securityErrorResponse(caught);
    if (response) return response;
    return NextResponse.json({ error: "Unable to update reminder preference." }, { status: 400 });
  }
}
