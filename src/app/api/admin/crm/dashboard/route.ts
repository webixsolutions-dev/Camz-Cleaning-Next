import { getCrmActor } from "@/lib/crm/staff";
import { NextRequest, NextResponse } from "next/server";

function cents(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function customer(invoice: any) {
  return Array.isArray(invoice?.crm_customers) ? invoice.crm_customers[0] : invoice?.crm_customers;
}

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const params = new URL(request.url).searchParams;
    const from = params.get("from") || "";
    const to = params.get("to") || "";
    const createdBy = params.get("created_by") || "all";
    const today = new Date().toISOString().slice(0, 10);

    let invoiceQuery = supabase
      .from("crm_invoices")
      .select("id, invoice_number, status, is_void, invoice_date, due_date, total_cents, tax_cents, amount_paid_cents, balance_cents, created_by, created_at, crm_customers(display_name)")
      .order("created_at", { ascending: false });
    if (from) invoiceQuery = invoiceQuery.gte("invoice_date", from);
    if (to) invoiceQuery = invoiceQuery.lte("invoice_date", to);
    if (createdBy !== "all") invoiceQuery = invoiceQuery.eq("created_by", createdBy);

    let paymentQuery = supabase
      .from("crm_payments")
      .select("id, invoice_id, amount_cents, received_at, is_void, created_by, crm_invoices(total_cents, tax_cents)")
      .eq("is_void", false);
    if (from) paymentQuery = paymentQuery.gte("received_at", `${from}T00:00:00.000Z`);
    if (to) paymentQuery = paymentQuery.lte("received_at", `${to}T23:59:59.999Z`);

    let eventQuery = supabase
      .from("crm_invoice_events")
      .select("id, invoice_id, event_type, payload, created_at, created_by, crm_invoices(invoice_number, status, crm_customers(display_name))")
      .in("event_type", ["created", "issued", "sent", "emailed", "reminder_sent", "payment_recorded", "paid", "payment_reversed", "payment_voided", "voided", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(30);
    if (createdBy !== "all") eventQuery = eventQuery.eq("created_by", createdBy);

    const [{ data: invoices, error: invoiceError }, { data: payments, error: paymentError }, { data: events, error: eventError }, { data: staffRows, error: staffError }] = await Promise.all([
      invoiceQuery,
      paymentQuery,
      eventQuery,
      supabase.from("users").select("id, name, email").in("role", ["admin", "super_admin", "cleaner", "data_entry"]),
    ]);
    if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 400 });
    if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 400 });
    if (eventError) return NextResponse.json({ error: eventError.message }, { status: 400 });
    if (staffError) console.error("CRM dashboard staff lookup failed:", staffError);

    const invoiceRows = invoices || [];
    const paymentRows = payments || [];
    const active = invoiceRows.filter((row: any) => !row.is_void);
    const draft = active.filter((row: any) => row.status === "draft");
    const sentUnpaid = active.filter((row: any) => ["issued", "sent", "unpaid"].includes(row.status) && cents(row.balance_cents) > 0);
    const partial = active.filter((row: any) => row.status === "partially_paid" && cents(row.balance_cents) > 0);
    const overdue = active.filter((row: any) => cents(row.balance_cents) > 0 && row.due_date && String(row.due_date).slice(0, 10) < today);
    const paid = active.filter((row: any) => row.status === "paid" || (cents(row.total_cents) > 0 && cents(row.balance_cents) === 0));
    const open = active.filter((row: any) => row.status !== "draft" && cents(row.balance_cents) > 0);
    const collected = paymentRows.reduce((sum: number, row: any) => sum + cents(row.amount_cents), 0);
    const gstCollected = paymentRows.reduce((sum: number, row: any) => {
      const invoice = Array.isArray(row.crm_invoices) ? row.crm_invoices[0] : row.crm_invoices;
      return sum + (cents(invoice?.total_cents) > 0 ? Math.round(cents(row.amount_cents) * cents(invoice?.tax_cents) / cents(invoice.total_cents)) : 0);
    }, 0);
    const staff = new Map((staffRows || []).map((row: any) => [row.id, row.name || row.email || "Staff"]));

    return NextResponse.json({
      cards: {
        draft_count: draft.length,
        draft_cents: draft.reduce((sum: number, row: any) => sum + cents(row.total_cents), 0),
        sent_unpaid_count: sentUnpaid.length,
        sent_unpaid_cents: sentUnpaid.reduce((sum: number, row: any) => sum + cents(row.balance_cents), 0),
        partial_count: partial.length,
        partial_cents: partial.reduce((sum: number, row: any) => sum + cents(row.balance_cents), 0),
        overdue_count: overdue.length,
        overdue_cents: overdue.reduce((sum: number, row: any) => sum + cents(row.balance_cents), 0),
        paid_count: paid.length,
        paid_cents: paid.reduce((sum: number, row: any) => sum + cents(row.total_cents), 0),
        collected_count: paymentRows.length,
        collected_cents: collected,
        outstanding_count: open.length,
        outstanding_cents: open.reduce((sum: number, row: any) => sum + cents(row.balance_cents), 0),
        gst_charged_cents: active.filter((row: any) => row.status !== "draft").reduce((sum: number, row: any) => sum + cents(row.tax_cents), 0),
        gst_collected_cents: gstCollected,
      },
      overdue: overdue.slice(0, 8).map((row: any) => ({
        id: row.id,
        invoice_number: row.invoice_number,
        customer: customer(row)?.display_name || "Unknown customer",
        due_date: row.due_date,
        balance_cents: cents(row.balance_cents),
      })),
      recent_activity: (events || []).map((event: any) => {
        const invoice = Array.isArray(event.crm_invoices) ? event.crm_invoices[0] : event.crm_invoices;
        return {
          id: event.id,
          invoice_id: event.invoice_id,
          invoice_number: invoice?.invoice_number || "Draft",
          customer: customer(invoice)?.display_name || "Unknown customer",
          event_type: event.event_type,
          created_at: event.created_at,
          created_by: staff.get(event.created_by) || "System",
          payload: event.payload || {},
        };
      }),
      staff_options: (staffRows || []).map((row: any) => ({ id: row.id, label: row.name || row.email || "Staff" })),
      basis: { invoice_totals: "invoice_date", collected: "payment_date", from, to },
    });
  } catch (err) {
    console.error("CRM dashboard GET failed:", err);
    return NextResponse.json({ error: "Unable to load the CRM dashboard." }, { status: 500 });
  }
}
