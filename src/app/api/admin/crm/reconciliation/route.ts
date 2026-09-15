import { writeCrmAudit } from "@/lib/crm/services/audit";
import { getCrmActor } from "@/lib/crm/staff";
import { enforceMutationSecurity, readJsonBody, securityErrorResponse } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

function cents(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const params = new URL(request.url).searchParams;
    const today = new Date().toISOString().slice(0, 10);
    const from = params.get("from") || today;
    const to = params.get("to") || today;
    const state = params.get("state") || "all";

    const [{ data: payments, error: paymentError }, { data: reconciliation, error: reconciliationError }, { data: staffRows }] = await Promise.all([
      supabase
        .from("crm_payments")
        .select("id, invoice_id, amount_cents, method, reference, notes, received_at, created_at, created_by, is_void, crm_invoices(invoice_number, crm_customers(display_name))")
        .eq("is_void", false)
        .gte("received_at", `${from}T00:00:00.000Z`)
        .lte("received_at", `${to}T23:59:59.999Z`)
        .order("received_at", { ascending: false }),
      supabase.from("crm_reconciliation").select("*").order("created_at", { ascending: false }),
      supabase.from("users").select("id, name, email").in("role", ["admin", "super_admin"]),
    ]);
    if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 400 });
    if (reconciliationError) return NextResponse.json({ error: reconciliationError.message }, { status: 400 });

    const staff = new Map((staffRows || []).map((row: any) => [row.id, row.name || row.email || "Staff"]));
    const entriesByPayment = new Map<string, any>();
    for (const row of reconciliation || []) {
      if (row.payment_id && !entriesByPayment.has(row.payment_id)) entriesByPayment.set(row.payment_id, row);
    }

    const rows = (payments || []).map((payment: any) => {
      const entry = entriesByPayment.get(payment.id);
      const reconciled = Boolean(entry?.reconciled ?? entry?.status === "matched");
      return {
        id: payment.id,
        invoice_id: payment.invoice_id,
        invoice_number: payment.crm_invoices?.invoice_number || "",
        customer: payment.crm_invoices?.crm_customers?.display_name || "Unknown customer",
        amount_cents: cents(payment.amount_cents),
        method: payment.method,
        reference: payment.reference,
        received_at: payment.received_at,
        recorded_by: staff.get(payment.created_by) || "Unknown staff",
        reconciled,
        reconciliation_id: entry?.id || null,
        reconciliation_notes: entry?.notes || "",
        reconciled_at: entry?.reconciled_at || entry?.updated_at || null,
        reconciled_by: entry?.reconciled_by ? staff.get(entry.reconciled_by) || "Staff" : null,
      };
    }).filter((row: any) => state === "all" || (state === "reconciled" ? row.reconciled : !row.reconciled));

    return NextResponse.json({
      from,
      to,
      rows,
      summary: {
        total_count: rows.length,
        total_cents: rows.reduce((sum: number, row: any) => sum + row.amount_cents, 0),
        reconciled_count: rows.filter((row: any) => row.reconciled).length,
        reconciled_cents: rows.filter((row: any) => row.reconciled).reduce((sum: number, row: any) => sum + row.amount_cents, 0),
        unreconciled_count: rows.filter((row: any) => !row.reconciled).length,
        unreconciled_cents: rows.filter((row: any) => !row.reconciled).reduce((sum: number, row: any) => sum + row.amount_cents, 0),
      },
      legacy_periods: (reconciliation || []).filter((row: any) => !row.payment_id).slice(0, 50),
    });
  } catch (err) {
    console.error("CRM reconciliation GET failed:", err);
    return NextResponse.json({ error: "Unable to load reconciliation." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-recon-post", limit: 30, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = await readJsonBody<any>(request);
    if (!body.period_start || !body.period_end) return NextResponse.json({ error: "Period start and end are required." }, { status: 400 });
    const { data: paid, error: paymentError } = await supabase.from("crm_payments").select("amount_cents, received_at, is_void").gte("received_at", `${body.period_start}T00:00:00.000Z`).lte("received_at", `${body.period_end}T23:59:59.999Z`);
    if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 400 });
    const received = (paid || []).filter((row: any) => !row.is_void).reduce((sum: number, row: any) => sum + cents(row.amount_cents), 0);
    const expected = body.expected_cents == null ? received : cents(body.expected_cents);
    const variance = received - expected;
    const { data, error: insertError } = await supabase.from("crm_reconciliation").insert({
      period_start: body.period_start,
      period_end: body.period_end,
      expected_cents: expected,
      received_cents: received,
      variance_cents: variance,
      status: variance === 0 ? "matched" : "unmatched",
      notes: String(body.notes || "").trim() || null,
      created_by: actor.userId,
    }).select("*").single();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
    await writeCrmAudit(supabase, { entity_type: "crm_reconciliation", entity_id: data.id, action: "period_created", after: data, actor_id: actor.userId });
    return NextResponse.json({ period: data });
  } catch (err) {
    const response = securityErrorResponse(err);
    if (response) return response;
    console.error("CRM reconciliation POST failed:", err);
    return NextResponse.json({ error: "Unable to create reconciliation period." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "crm-recon-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const body = await readJsonBody<any>(request);
    if (body.payment_id) {
      const { data: payment, error: paymentError } = await supabase.from("crm_payments").select("id, invoice_id, amount_cents, method, reference, received_at, is_void").eq("id", body.payment_id).maybeSingle();
      if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 400 });
      if (!payment || payment.is_void) return NextResponse.json({ error: "Active payment not found." }, { status: 404 });
      const reconciled = Boolean(body.reconciled);
      const payload = {
        payment_id: payment.id,
        period_start: String(payment.received_at).slice(0, 10),
        period_end: String(payment.received_at).slice(0, 10),
        expected_cents: cents(payment.amount_cents),
        received_cents: cents(payment.amount_cents),
        variance_cents: 0,
        status: reconciled ? "matched" : "unmatched",
        reconciled,
        reconciled_at: reconciled ? new Date().toISOString() : null,
        reconciled_by: reconciled ? actor.userId : null,
        notes: String(body.notes || "").trim() || null,
        updated_at: new Date().toISOString(),
      };
      const { data: existing } = await supabase.from("crm_reconciliation").select("*").eq("payment_id", payment.id).maybeSingle();
      const operation = existing
        ? supabase.from("crm_reconciliation").update(payload).eq("id", existing.id).select("*").single()
        : supabase.from("crm_reconciliation").insert({ ...payload, created_by: actor.userId }).select("*").single();
      const { data, error: updateError } = await operation;
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
      await writeCrmAudit(supabase, { entity_type: "crm_reconciliation", entity_id: data.id, action: reconciled ? "payment_reconciled" : "payment_unreconciled", before: existing || null, after: data, actor_id: actor.userId });
      return NextResponse.json({ reconciliation: data });
    }

    if (!body.id) return NextResponse.json({ error: "Payment or period id is required." }, { status: 400 });
    const { data: before } = await supabase.from("crm_reconciliation").select("*").eq("id", body.id).maybeSingle();
    const { data, error: updateError } = await supabase.from("crm_reconciliation").update({ status: body.status, notes: body.notes, updated_at: new Date().toISOString() }).eq("id", body.id).select("*").single();
    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
    await writeCrmAudit(supabase, { entity_type: "crm_reconciliation", entity_id: data.id, action: "period_updated", before, after: data, actor_id: actor.userId });
    return NextResponse.json({ period: data });
  } catch (err) {
    const response = securityErrorResponse(err);
    if (response) return response;
    console.error("CRM reconciliation PATCH failed:", err);
    return NextResponse.json({ error: "Unable to update reconciliation." }, { status: 500 });
  }
}
