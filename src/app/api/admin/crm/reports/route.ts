import { getCrmActor } from "@/lib/crm/staff";
import { NextRequest, NextResponse } from "next/server";

type StaffRow = { id: string; name?: string | null; email?: string | null };
const ACTIVE_FINANCIAL_STATUSES = new Set(["issued", "sent", "unpaid", "partially_paid", "overdue", "paid"]);

function number(value: unknown) {
  const result = Number(value || 0);
  return Number.isFinite(result) ? result : 0;
}

function day(value: unknown) {
  return typeof value === "string" ? value.slice(0, 10) : "";
}

function staffLabel(staff: Map<string, StaffRow>, id: unknown) {
  const row = staff.get(String(id || ""));
  return row?.name || row?.email || "Unknown staff";
}

function customerName(invoice: any) {
  return invoice?.crm_customers?.display_name || "Unknown customer";
}

function matchesCustomer(invoice: any, search: string) {
  if (!search) return true;
  const customer = invoice?.crm_customers || {};
  return [customer.display_name, customer.email, customer.phone, invoice?.invoice_number]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(search));
}

function ageBucket(dueDate: string, today: string) {
  if (!dueDate || dueDate >= today) return "current";
  const elapsed = Math.max(1, Math.floor((Date.parse(`${today}T12:00:00Z`) - Date.parse(`${dueDate}T12:00:00Z`)) / 86_400_000));
  if (elapsed <= 7) return "1_7";
  if (elapsed <= 30) return "8_30";
  if (elapsed <= 60) return "31_60";
  return "60_plus";
}

export async function GET(request: NextRequest) {
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const search = new URL(request.url).searchParams;
    const from = search.get("from") || "";
    const to = search.get("to") || "";
    const invoiceStatus = search.get("status") || "all";
    const paymentMethod = search.get("method") || "all";
    const createdBy = search.get("created_by") || "all";
    const paymentRecordedBy = search.get("payment_recorded_by") || "all";
    const customerSearch = String(search.get("customer") || "").trim().toLowerCase();

    let invoiceQuery = supabase
      .from("crm_invoices")
      .select("id, invoice_number, customer_id, status, is_void, invoice_date, due_date, total_cents, discount_cents, tax_cents, amount_paid_cents, balance_cents, created_by, created_at, crm_customers(id, display_name, email, phone)")
      .order("invoice_date", { ascending: false });
    if (from) invoiceQuery = invoiceQuery.gte("invoice_date", from);
    if (to) invoiceQuery = invoiceQuery.lte("invoice_date", to);
    if (createdBy !== "all") invoiceQuery = invoiceQuery.eq("created_by", createdBy);

    let paymentQuery = supabase
      .from("crm_payments")
      .select("id, invoice_id, amount_cents, method, reference, received_at, created_at, created_by, is_void, voided_at, crm_invoices(id, invoice_number, status, is_void, total_cents, tax_cents, customer_id, crm_customers(id, display_name, email, phone))")
      .order("received_at", { ascending: false });
    if (from) paymentQuery = paymentQuery.gte("received_at", `${from}T00:00:00.000Z`);
    if (to) paymentQuery = paymentQuery.lte("received_at", `${to}T23:59:59.999Z`);
    if (paymentMethod !== "all") paymentQuery = paymentQuery.eq("method", paymentMethod);
    if (paymentRecordedBy !== "all") paymentQuery = paymentQuery.eq("created_by", paymentRecordedBy);

    const [{ data: rawInvoices, error: invoiceError }, { data: rawPayments, error: paymentError }, { data: rawStaff, error: staffError }] = await Promise.all([
      invoiceQuery,
      paymentQuery,
      supabase.from("users").select("id, name, email").in("role", ["admin", "super_admin"]),
    ]);
    if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 400 });
    if (paymentError) return NextResponse.json({ error: paymentError.message }, { status: 400 });
    if (staffError) console.error("CRM report staff lookup failed:", staffError);

    const staffRows = (rawStaff || []) as StaffRow[];
    const staff = new Map(staffRows.map((row) => [row.id, row]));
    const invoices = (rawInvoices || []).filter((invoice: any) => {
      const statusValue = invoice.is_void ? "void" : invoice.status;
      return (invoiceStatus === "all" || statusValue === invoiceStatus) && matchesCustomer(invoice, customerSearch);
    });
    const payments = (rawPayments || []).filter((payment: any) => {
      const invoice = payment.crm_invoices;
      const statusValue = invoice?.is_void ? "void" : invoice?.status;
      return !payment.is_void && (invoiceStatus === "all" || statusValue === invoiceStatus) && matchesCustomer(invoice, customerSearch);
    });

    const financialInvoices = invoices.filter((invoice: any) => !invoice.is_void && ACTIVE_FINANCIAL_STATUSES.has(String(invoice.status)));
    const openInvoices = financialInvoices.filter((invoice: any) => number(invoice.balance_cents) > 0);
    const today = new Date().toISOString().slice(0, 10);
    const overdueInvoices = openInvoices.filter((invoice: any) => day(invoice.due_date) && day(invoice.due_date) < today);

    const byStatus: Record<string, { count: number; total_cents: number; balance_cents: number }> = {};
    for (const invoice of invoices) {
      const key = invoice.is_void ? "void" : String(invoice.status || "unknown");
      const bucket = byStatus[key] || { count: 0, total_cents: 0, balance_cents: 0 };
      bucket.count += 1;
      bucket.total_cents += number(invoice.total_cents);
      bucket.balance_cents += number(invoice.balance_cents);
      byStatus[key] = bucket;
    }

    const aging: Record<string, { count: number; balance_cents: number }> = {
      current: { count: 0, balance_cents: 0 },
      "1_7": { count: 0, balance_cents: 0 },
      "8_30": { count: 0, balance_cents: 0 },
      "31_60": { count: 0, balance_cents: 0 },
      "60_plus": { count: 0, balance_cents: 0 },
    };
    for (const invoice of openInvoices) {
      const key = ageBucket(day(invoice.due_date), today);
      aging[key].count += 1;
      aging[key].balance_cents += number(invoice.balance_cents);
    }

    const paymentMethods: Record<string, { count: number; amount_cents: number }> = {};
    const invoicesByStaff: Record<string, { staff_id: string; staff_name: string; count: number; total_cents: number }> = {};
    const paymentsByStaff: Record<string, { staff_id: string; staff_name: string; count: number; amount_cents: number }> = {};
    for (const invoice of invoices) {
      const id = String(invoice.created_by || "unknown");
      const row = invoicesByStaff[id] || { staff_id: id, staff_name: staffLabel(staff, id), count: 0, total_cents: 0 };
      row.count += 1;
      row.total_cents += number(invoice.total_cents);
      invoicesByStaff[id] = row;
    }
    for (const payment of payments) {
      const method = String(payment.method || "other");
      const methodRow = paymentMethods[method] || { count: 0, amount_cents: 0 };
      methodRow.count += 1;
      methodRow.amount_cents += number(payment.amount_cents);
      paymentMethods[method] = methodRow;
      const id = String(payment.created_by || "unknown");
      const staffRow = paymentsByStaff[id] || { staff_id: id, staff_name: staffLabel(staff, id), count: 0, amount_cents: 0 };
      staffRow.count += 1;
      staffRow.amount_cents += number(payment.amount_cents);
      paymentsByStaff[id] = staffRow;
    }

    const gstCollectedCents = payments.reduce((sum: number, payment: any) => {
      const invoice = payment.crm_invoices;
      const total = number(invoice?.total_cents);
      const tax = number(invoice?.tax_cents);
      return sum + (total > 0 ? Math.round(number(payment.amount_cents) * tax / total) : 0);
    }, 0);

    return NextResponse.json({
      summary: {
        invoice_count: invoices.length,
        invoice_total_cents: financialInvoices.reduce((sum: number, row: any) => sum + number(row.total_cents), 0),
        payment_count: payments.length,
        payments_received_cents: payments.reduce((sum: number, row: any) => sum + number(row.amount_cents), 0),
        outstanding_count: openInvoices.length,
        outstanding_cents: openInvoices.reduce((sum: number, row: any) => sum + number(row.balance_cents), 0),
        overdue_count: overdueInvoices.length,
        overdue_cents: overdueInvoices.reduce((sum: number, row: any) => sum + number(row.balance_cents), 0),
        gst_charged_cents: financialInvoices.reduce((sum: number, row: any) => sum + number(row.tax_cents), 0),
        gst_collected_cents: gstCollectedCents,
        discounts_cents: financialInvoices.reduce((sum: number, row: any) => sum + number(row.discount_cents), 0),
        void_cancelled_count: invoices.filter((row: any) => row.is_void || row.status === "cancelled").length,
      },
      aging,
      by_status: byStatus,
      payment_methods: paymentMethods,
      invoices_by_staff: Object.values(invoicesByStaff),
      payments_by_staff: Object.values(paymentsByStaff),
      staff_options: staffRows.map((row) => ({ id: row.id, label: row.name || row.email || "Staff" })),
      invoice_rows: invoices.slice(0, 200).map((invoice: any) => ({
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        customer: customerName(invoice),
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        status: invoice.is_void ? "void" : invoice.status,
        total_cents: number(invoice.total_cents),
        paid_cents: number(invoice.amount_paid_cents),
        balance_cents: number(invoice.balance_cents),
        tax_cents: number(invoice.tax_cents),
        discount_cents: number(invoice.discount_cents),
        created_by: staffLabel(staff, invoice.created_by),
      })),
      payment_rows: payments.slice(0, 200).map((payment: any) => ({
        id: payment.id,
        invoice_id: payment.invoice_id,
        invoice_number: payment.crm_invoices?.invoice_number,
        customer: customerName(payment.crm_invoices),
        received_at: payment.received_at,
        amount_cents: number(payment.amount_cents),
        method: payment.method,
        reference: payment.reference,
        recorded_by: staffLabel(staff, payment.created_by),
      })),
    });
  } catch (err) {
    console.error("CRM reports GET failed:", err);
    return NextResponse.json({ error: "Unable to load reports." }, { status: 500 });
  }
}
