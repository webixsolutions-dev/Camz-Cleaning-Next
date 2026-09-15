import { buildCsv, buildXlsx, type ExportTable } from "@/lib/crm/exportFiles";
import { writeCrmAudit } from "@/lib/crm/services/audit";
import { getCrmActor } from "@/lib/crm/staff";
import { enforceRateLimit } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["invoices", "payments", "customers", "outstanding", "gst", "audit"]);
const ALLOWED_FORMATS = new Set(["csv", "xlsx"]);

function cents(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function money(value: unknown) {
  return (cents(value) / 100).toFixed(2);
}

function date(value: unknown) {
  return typeof value === "string" ? value.slice(0, 10) : "";
}

function inDateRange(value: unknown, from: string, to: string) {
  const current = date(value);
  return (!from || current >= from) && (!to || current <= to);
}

function customerText(invoice: any) {
  const customer = invoice?.crm_customers || {};
  return [invoice?.invoice_number, customer.display_name, customer.email, customer.phone].filter(Boolean).join(" ").toLowerCase();
}

function matchesInvoice(invoice: any, filters: Record<string, string>) {
  const status = invoice?.is_void ? "void" : String(invoice?.status || "");
  return (filters.status === "all" || status === filters.status) &&
    (filters.created_by === "all" || String(invoice?.created_by || "") === filters.created_by) &&
    (!filters.customer || customerText(invoice).includes(filters.customer.toLowerCase()));
}

function invoiceTable(rows: any[], outstandingOnly = false): ExportTable {
  const filtered = outstandingOnly ? rows.filter((row) => !row.is_void && cents(row.balance_cents) > 0) : rows;
  return {
    sheetName: outstandingOnly ? "Outstanding Invoices" : "Invoices",
    headers: ["Invoice", "Customer", "Email", "Invoice Date", "Due Date", "Status", "Subtotal", "Discount", "GST", "Total", "Paid", "Balance"],
    rows: filtered.map((row) => [
      row.invoice_number || "Draft",
      row.crm_customers?.display_name || "",
      row.crm_customers?.email || "",
      date(row.invoice_date),
      date(row.due_date),
      row.is_void ? "void" : row.status,
      money(row.subtotal_cents),
      money(row.discount_cents),
      money(row.tax_cents),
      money(row.total_cents),
      money(row.amount_paid_cents),
      money(row.balance_cents),
    ]),
  };
}

function paymentTable(rows: any[]): ExportTable {
  return {
    sheetName: "Payments",
    headers: ["Received Date", "Invoice", "Customer", "Amount", "Method", "Reference", "Deposit", "Recorded By"],
    rows: rows.map((row) => [
      date(row.received_at),
      row.crm_invoices?.invoice_number || "",
      row.crm_invoices?.crm_customers?.display_name || "",
      money(row.amount_cents),
      row.method || "",
      row.reference || "",
      Boolean(row.is_deposit),
      row.created_by || "",
    ]),
  };
}

function customerTable(rows: any[]): ExportTable {
  return {
    sheetName: "Customers",
    headers: ["Customer Code", "Name", "Email", "Phone", "Billing Address", "Service Address", "Created Date"],
    rows: rows.map((row) => {
      const addresses = Array.isArray(row.crm_customer_addresses) ? row.crm_customer_addresses : [];
      const format = (address: any) => [address?.address_line1 || address?.street, address?.city, address?.province, address?.postal_code].filter(Boolean).join(", ");
      return [
        row.customer_code || "",
        row.display_name || "",
        row.email || "",
        row.phone || "",
        format(addresses.find((address: any) => address.is_default_billing) || addresses.find((address: any) => address.address_type === "billing")),
        format(addresses.find((address: any) => address.is_default_service) || addresses.find((address: any) => address.address_type === "service")),
        date(row.created_at),
      ];
    }),
  };
}

function gstTable(invoices: any[], payments: any[]): ExportTable {
  const months = new Map<string, { invoice_count: number; taxable_sales: number; gst_charged: number; payments: number; gst_collected: number }>();
  for (const invoice of invoices.filter((row) => !row.is_void && row.status !== "draft")) {
    const key = date(invoice.invoice_date).slice(0, 7) || "Unknown";
    const row = months.get(key) || { invoice_count: 0, taxable_sales: 0, gst_charged: 0, payments: 0, gst_collected: 0 };
    row.invoice_count += 1;
    row.taxable_sales += cents(invoice.subtotal_cents) - cents(invoice.discount_cents);
    row.gst_charged += cents(invoice.tax_cents);
    months.set(key, row);
  }
  for (const payment of payments) {
    const key = date(payment.received_at).slice(0, 7) || "Unknown";
    const row = months.get(key) || { invoice_count: 0, taxable_sales: 0, gst_charged: 0, payments: 0, gst_collected: 0 };
    const invoice = payment.crm_invoices;
    const total = cents(invoice?.total_cents);
    row.payments += cents(payment.amount_cents);
    row.gst_collected += total > 0 ? Math.round(cents(payment.amount_cents) * cents(invoice?.tax_cents) / total) : 0;
    months.set(key, row);
  }
  return {
    sheetName: "GST Summary",
    headers: ["Month", "Invoices", "Taxable Sales", "GST Charged", "Payments Received", "Estimated GST Collected"],
    rows: [...months.entries()].sort(([first], [second]) => first.localeCompare(second)).map(([month, row]) => [month, row.invoice_count, money(row.taxable_sales), money(row.gst_charged), money(row.payments), money(row.gst_collected)]),
  };
}

export async function GET(request: NextRequest) {
  const rateError = await enforceRateLimit(request, { bucket: "crm-exports", limit: 20, windowSeconds: 60 });
  if (rateError) return rateError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const params = new URL(request.url).searchParams;
    const type = params.get("type") || "invoices";
    const format = params.get("format") || "csv";
    if (!ALLOWED_TYPES.has(type) || !ALLOWED_FORMATS.has(format)) {
      return NextResponse.json({ error: "Unsupported export type or format." }, { status: 400 });
    }

    const filters = {
      from: params.get("from") || "",
      to: params.get("to") || "",
      status: params.get("status") || "all",
      method: params.get("method") || "all",
      created_by: params.get("created_by") || "all",
      payment_recorded_by: params.get("payment_recorded_by") || "all",
      customer: String(params.get("customer") || "").trim(),
    };
    let table: ExportTable;

    if (type === "customers") {
      const { data, error: queryError } = await supabase.from("crm_customers").select("id, customer_code, display_name, email, phone, created_at, crm_customer_addresses(*)").order("display_name");
      if (queryError) throw queryError;
      const customer = filters.customer.toLowerCase();
      const rows = (data || []).filter((row: any) => !customer || [row.customer_code, row.display_name, row.email, row.phone].filter(Boolean).some((value) => String(value).toLowerCase().includes(customer)));
      table = customerTable(rows);
    } else if (type === "audit") {
      let query = supabase.from("crm_audit_logs").select("id, entity_type, entity_id, action, actor_id, created_at, correlation_id").order("created_at", { ascending: false });
      if (filters.from) query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
      if (filters.to) query = query.lte("created_at", `${filters.to}T23:59:59.999Z`);
      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      table = { sheetName: "Audit Log", headers: ["Time", "Entity", "Entity ID", "Action", "Actor", "Correlation ID"], rows: (data || []).map((row: any) => [row.created_at, row.entity_type, row.entity_id, row.action, row.actor_id, row.correlation_id || ""]) };
    } else {
      const [{ data: rawInvoices, error: invoiceError }, { data: rawPayments, error: paymentError }] = await Promise.all([
        supabase.from("crm_invoices").select("id, invoice_number, status, is_void, invoice_date, due_date, subtotal_cents, discount_cents, tax_cents, total_cents, amount_paid_cents, balance_cents, created_by, crm_customers(display_name, email, phone)").order("invoice_date", { ascending: false }),
        supabase.from("crm_payments").select("id, invoice_id, amount_cents, method, reference, received_at, created_by, is_deposit, is_void, crm_invoices(invoice_number, status, is_void, total_cents, tax_cents, crm_customers(display_name, email, phone))").eq("is_void", false).order("received_at", { ascending: false }),
      ]);
      if (invoiceError) throw invoiceError;
      if (paymentError) throw paymentError;
      const invoices = (rawInvoices || []).filter((row: any) => inDateRange(row.invoice_date, filters.from, filters.to) && matchesInvoice(row, filters));
      const payments = (rawPayments || []).filter((row: any) => inDateRange(row.received_at, filters.from, filters.to) && (filters.method === "all" || row.method === filters.method) && (filters.payment_recorded_by === "all" || row.created_by === filters.payment_recorded_by) && matchesInvoice(row.crm_invoices, filters));
      if (type === "payments") table = paymentTable(payments);
      else if (type === "gst") table = gstTable(invoices, payments);
      else table = invoiceTable(invoices, type === "outstanding");
    }

    const generatedAt = new Date().toISOString();
    const filename = `camz-${type}-${generatedAt.slice(0, 10)}.${format}`;
    const bytes = format === "xlsx" ? buildXlsx(table) : buildCsv(table);
    const mime = format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv; charset=utf-8";

    const { data: exportLog, error: logError } = await supabase.from("crm_export_logs").insert({
      export_type: type,
      format,
      filters,
      row_count: table.rows.length,
      created_by: actor.userId,
    }).select("id").maybeSingle();
    if (logError) console.error("CRM export log failed:", logError);
    await writeCrmAudit(supabase, {
      entity_type: "crm_export_logs",
      entity_id: exportLog?.id || null,
      action: "export_downloaded",
      after: { type, format, filters, row_count: table.rows.length, filename },
      actor_id: actor.userId,
    });

    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("CRM export failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unable to create export." }, { status: 500 });
  }
}
