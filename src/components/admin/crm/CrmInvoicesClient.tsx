"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye, FileClock, FileDown, Pencil, Plus, ReceiptText, Search } from "lucide-react";
import { formatCad } from "@/lib/crm/money";

type Address = {
  id?: string;
  label?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
};

type Customer = {
  display_name?: string | null;
  email?: string | null;
  phone?: string | null;
  crm_customer_addresses?: Address[] | null;
};

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  status: string;
  is_void?: boolean;
  invoice_date?: string | null;
  service_date?: string | null;
  service_type?: string | null;
  due_date?: string | null;
  total_cents: number;
  amount_paid_cents: number;
  balance_cents: number;
  service_address_id?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by_label?: string | null;
  last_edited_by_label?: string | null;
  last_updated_at?: string | null;
  crm_customers?: Customer | Customer[] | null;
  crm_invoice_items?: Array<{ description?: string | null; position?: number | null }> | null;
};

const statusClass: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  issued: "bg-blue-50 text-blue-700",
  partially_paid: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-orange-50 text-orange-700",
  void: "bg-rose-50 text-rose-700",
  cancelled: "bg-rose-50 text-rose-700",
};

function customerOf(invoice: InvoiceRow) {
  return Array.isArray(invoice.crm_customers) ? invoice.crm_customers[0] : invoice.crm_customers;
}

function serviceTypeOf(invoice: InvoiceRow) {
  return (
    invoice.service_type?.trim() ||
    [...(invoice.crm_invoice_items || [])]
      .sort((a, b) => Number(a.position || 0) - Number(b.position || 0))[0]
      ?.description?.trim() ||
    "—"
  );
}

function serviceAddressOf(invoice: InvoiceRow) {
  const customer = customerOf(invoice);
  const addresses = customer?.crm_customer_addresses || [];
  const address = addresses.find((row) => row.id === invoice.service_address_id);
  if (!address) return "—";
  return [address.line1, address.line2, address.city, address.province, address.postal_code]
    .filter(Boolean)
    .join(", ");
}

function dateText(value?: string | null) {
  if (!value) return "—";
  const date = new Date(`${value.length === 10 ? `${value}T12:00:00` : value}`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

function dateTimeText(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function CrmInvoicesClient() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/crm/invoices", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Failed to load invoices");
        setInvoices(payload.invoices || []);
      } catch (err) {
        console.error("CRM invoices load failed:", err);
        setError(err instanceof Error ? err.message : "Unable to load invoices");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const serviceOptions = useMemo(
    () => Array.from(new Set(invoices.map(serviceTypeOf).filter((value) => value && value !== "—"))).sort(),
    [invoices],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const customer = customerOf(invoice);
      const serviceType = serviceTypeOf(invoice);
      const address = serviceAddressOf(invoice);
      const searchable = [invoice.invoice_number, customer?.display_name, invoice.status, serviceType, address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (needle && !searchable.includes(needle)) return false;
      if (statusFilter !== "all" && invoice.status !== statusFilter) return false;
      if (serviceFilter !== "all" && serviceType !== serviceFilter) return false;
      if (fromDate && String(invoice.invoice_date || "") < fromDate) return false;
      if (toDate && String(invoice.invoice_date || "") > toDate) return false;

      if (paymentFilter === "paid" && Number(invoice.balance_cents || 0) > 0) return false;
      if (paymentFilter === "unpaid" && Number(invoice.amount_paid_cents || 0) > 0) return false;
      if (
        paymentFilter === "partial" &&
        !(Number(invoice.amount_paid_cents || 0) > 0 && Number(invoice.balance_cents || 0) > 0)
      ) {
        return false;
      }

      return true;
    });
  }, [fromDate, invoices, paymentFilter, query, serviceFilter, statusFilter, toDate]);

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-900">Invoices</h1>
          <p className="mt-1 text-slate-500">Create, edit, track payments, download PDFs, and review full invoice history.</p>
        </div>
        <Link href="/admin-dashboard/crm/invoices/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4A86F7] px-4 text-[12px] font-bold text-white">
          <Plus size={16} />
          New invoice
        </Link>
      </div>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.3fr)_160px_150px_180px_150px_150px]">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3">
            <Search size={16} className="text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Invoice #, customer, address..." className="min-w-0 flex-1 bg-transparent text-[12px] outline-none" />
          </label>
          <select className="h-10 rounded-xl border border-slate-200 px-3 text-[12px]" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            {["draft", "issued", "partially_paid", "paid", "overdue", "void", "cancelled"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
          </select>
          <select className="h-10 rounded-xl border border-slate-200 px-3 text-[12px]" value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)}>
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="partial">Partially paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <select className="h-10 rounded-xl border border-slate-200 px-3 text-[12px]" value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
            <option value="all">All service types</option>
            {serviceOptions.map((service) => <option key={service} value={service}>{service}</option>)}
          </select>
          <input aria-label="From invoice date" type="date" className="h-10 rounded-xl border border-slate-200 px-3 text-[12px]" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          <input aria-label="To invoice date" type="date" className="h-10 rounded-xl border border-slate-200 px-3 text-[12px]" value={toDate} onChange={(event) => setToDate(event.target.value)} />
        </div>
      </section>

      {error ? <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-slate-500">Loading invoices...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-slate-500"><ReceiptText size={28} /><p>No invoices match these filters.</p></div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 lg:hidden">
              {filtered.map((invoice) => {
                const customer = customerOf(invoice);
                return (
                  <article key={invoice.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/admin-dashboard/crm/invoices/${invoice.id}`} className="font-bold text-[#4A86F7]">{invoice.invoice_number || "Draft"}</Link>
                        <p className="mt-1 text-[13px] font-semibold text-slate-700">{customer?.display_name || "—"}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{serviceTypeOf(invoice)} · {dateText(invoice.service_date || invoice.invoice_date)}</p>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusClass[invoice.status] || "bg-slate-100"}`}>{invoice.status.replaceAll("_", " ")}</span>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-slate-500">{serviceAddressOf(invoice)}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-[11px]">
                      <span><b className="block text-slate-400">Total</b>{formatCad(invoice.total_cents)}</span>
                      <span><b className="block text-slate-400">Paid</b>{formatCad(invoice.amount_paid_cents)}</span>
                      <span><b className="block text-slate-400">Balance</b>{formatCad(invoice.balance_cents)}</span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400">Last edited by {invoice.last_edited_by_label || "System"} · {dateTimeText(invoice.last_updated_at)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-bold" href={`/admin-dashboard/crm/invoices/${invoice.id}`}><Eye size={13}/>View</Link>
                      <Link className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-bold" href={`/admin-dashboard/crm/invoices/${invoice.id}`}><Pencil size={13}/>Edit</Link>
                      <Link className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-bold" href={`/admin-dashboard/crm/invoices/${invoice.id}/history`}><FileClock size={13}/>History</Link>
                      <Link className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-bold" href={`/admin-dashboard/crm/invoices/${invoice.id}/preview`}><FileDown size={13}/>PDF</Link>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1420px] text-left text-[11px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    {["Invoice", "Customer", "Service address", "Invoice / Service date", "Service type", "Status", "Total", "Paid", "Balance", "Created / Last edited", "Updated", "Actions"].map((label) => (
                      <th key={label} className="px-3 py-3 font-semibold">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((invoice) => {
                    const customer = customerOf(invoice);
                    return (
                      <tr key={invoice.id} className="border-t border-slate-100 align-top">
                        <td className="px-3 py-3 font-bold text-[#4A86F7]">{invoice.invoice_number || "Draft"}</td>
                        <td className="px-3 py-3 font-semibold text-slate-700">{customer?.display_name || "—"}</td>
                        <td className="max-w-[230px] px-3 py-3 text-slate-600">{serviceAddressOf(invoice)}</td>
                        <td className="px-3 py-3 text-slate-600"><span className="block">Inv: {dateText(invoice.invoice_date)}</span><span className="mt-1 block">Svc: {dateText(invoice.service_date)}</span></td>
                        <td className="px-3 py-3 text-slate-700">{serviceTypeOf(invoice)}</td>
                        <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${statusClass[invoice.status] || "bg-slate-100"}`}>{invoice.status.replaceAll("_", " ")}</span></td>
                        <td className="px-3 py-3 font-semibold">{formatCad(invoice.total_cents)}</td>
                        <td className="px-3 py-3 text-emerald-700">{formatCad(invoice.amount_paid_cents)}</td>
                        <td className="px-3 py-3 font-semibold">{formatCad(invoice.balance_cents)}</td>
                        <td className="max-w-[240px] px-3 py-3 text-slate-600"><span className="block">Created: {invoice.created_by_label || "System"}</span><span className="mt-1 block">Edited: {invoice.last_edited_by_label || "System"}</span></td>
                        <td className="whitespace-nowrap px-3 py-3 text-slate-500">{dateTimeText(invoice.last_updated_at)}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <Link title="View invoice" href={`/admin-dashboard/crm/invoices/${invoice.id}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Eye size={14}/></Link>
                            <Link title="Edit invoice" href={`/admin-dashboard/crm/invoices/${invoice.id}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><Pencil size={14}/></Link>
                            <Link title="Activity history" href={`/admin-dashboard/crm/invoices/${invoice.id}/history`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><FileClock size={14}/></Link>
                            <Link title="PDF" href={`/admin-dashboard/crm/invoices/${invoice.id}/preview`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><FileDown size={14}/></Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
