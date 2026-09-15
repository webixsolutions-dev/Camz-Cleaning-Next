import { getCrmActor } from "@/lib/crm/staff";
import { enforceRateLimit } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

function text(values: unknown[]) {
  return values.filter(Boolean).join(" ").toLowerCase();
}

function addresses(customer: any) {
  const rows = Array.isArray(customer?.crm_customer_addresses) ? customer.crm_customer_addresses : [];
  return rows.map((row: any) => text([row.label, row.line1, row.line2, row.formatted_address, row.city, row.province, row.postal_code])).join(" ");
}

function customerOf(invoice: any) {
  return Array.isArray(invoice?.crm_customers) ? invoice.crm_customers[0] : invoice?.crm_customers;
}

export async function GET(request: NextRequest) {
  const rateError = await enforceRateLimit(request, { bucket: "crm-global-search", limit: 90, windowSeconds: 60 });
  if (rateError) return rateError;
  const { actor, supabase, error, status } = await getCrmActor();
  if (!actor) return NextResponse.json({ error }, { status });

  try {
    const params = new URL(request.url).searchParams;
    const query = String(params.get("q") || "").trim().toLowerCase();
    if (query.length < 2) return NextResponse.json({ query, customers: [], invoices: [], total: 0 });

    const [{ data: rawCustomers, error: customerError }, { data: rawInvoices, error: invoiceError }] = await Promise.all([
      supabase
        .from("crm_customers")
        .select("id, customer_code, display_name, legal_name, email, phone, is_active, crm_customer_addresses(id, label, line1, line2, formatted_address, city, province, postal_code)")
        .order("updated_at", { ascending: false })
        .limit(500),
      supabase
        .from("crm_invoices")
        .select("id, invoice_number, status, is_void, invoice_date, due_date, total_cents, balance_cents, crm_customers(id, customer_code, display_name, email, phone, crm_customer_addresses(label, line1, line2, formatted_address, city, province, postal_code))")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);
    if (customerError) return NextResponse.json({ error: customerError.message }, { status: 400 });
    if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 400 });

    const customers = (rawCustomers || []).filter((row: any) => text([row.customer_code, row.display_name, row.legal_name, row.email, row.phone, addresses(row)]).includes(query)).slice(0, 10).map((row: any) => ({
      type: "customer",
      id: row.id,
      customer_code: row.customer_code,
      title: row.display_name,
      subtitle: [row.email, row.phone].filter(Boolean).join(" · ") || "No contact details",
      address: (row.crm_customer_addresses || []).map((address: any) => [address.line1, address.city, address.postal_code].filter(Boolean).join(", ")).filter(Boolean)[0] || "",
      active: row.is_active !== false,
      href: `/admin-dashboard/crm/customers?customer=${encodeURIComponent(row.id)}`,
    }));

    const invoices = (rawInvoices || []).filter((row: any) => {
      const customer = customerOf(row);
      const statusValue = row.is_void ? "void" : row.status;
      return text([row.invoice_number, statusValue, row.invoice_date, row.due_date, customer?.customer_code, customer?.display_name, customer?.email, customer?.phone, addresses(customer)]).includes(query);
    }).slice(0, 10).map((row: any) => {
      const customer = customerOf(row);
      return {
        type: "invoice",
        id: row.id,
        title: row.invoice_number || "Draft invoice",
        subtitle: customer?.display_name || "Unknown customer",
        status: row.is_void ? "void" : row.status,
        invoice_date: row.invoice_date,
        total_cents: Number(row.total_cents || 0),
        balance_cents: Number(row.balance_cents || 0),
        href: `/admin-dashboard/crm/invoices/${encodeURIComponent(row.id)}`,
      };
    });

    return NextResponse.json({ query, customers, invoices, total: customers.length + invoices.length });
  } catch (err) {
    console.error("CRM global search failed:", err);
    return NextResponse.json({ error: "Unable to search CRM records." }, { status: 500 });
  }
}
