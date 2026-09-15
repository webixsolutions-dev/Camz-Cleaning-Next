"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, LoaderCircle, RefreshCw } from "lucide-react";
import { formatCad } from "@/lib/crm/money";

type Filters = { from: string; to: string; status: string; method: string; created_by: string; payment_recorded_by: string; customer: string };
type Summary = { invoice_count: number; invoice_total_cents: number; payment_count: number; payments_received_cents: number; outstanding_count: number; outstanding_cents: number; overdue_count: number; overdue_cents: number; gst_charged_cents: number; gst_collected_cents: number; discounts_cents: number; void_cancelled_count: number };
type Report = {
  summary: Summary;
  aging: Record<string, { count: number; balance_cents: number }>;
  by_status: Record<string, { count: number; total_cents: number; balance_cents: number }>;
  payment_methods: Record<string, { count: number; amount_cents: number }>;
  invoices_by_staff: Array<{ staff_id: string; staff_name: string; count: number; total_cents: number }>;
  payments_by_staff: Array<{ staff_id: string; staff_name: string; count: number; amount_cents: number }>;
  staff_options: Array<{ id: string; label: string }>;
  invoice_rows: Array<{ id: string; invoice_number: string; customer: string; invoice_date: string; due_date: string | null; status: string; total_cents: number; paid_cents: number; balance_cents: number; tax_cents: number; discount_cents: number; created_by: string }>;
  payment_rows: Array<{ id: string; invoice_id: string; invoice_number: string; customer: string; received_at: string; amount_cents: number; method: string; reference: string | null; recorded_by: string }>;
};

function iso(date: Date) { return date.toISOString().slice(0, 10); }
function initialFilters(): Filters {
  const now = new Date();
  return { from: iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))), to: iso(now), status: "all", method: "all", created_by: "all", payment_recorded_by: "all", customer: "" };
}

function range(name: string) {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (name === "today") return { from: iso(today), to: iso(today) };
  if (name === "week") { const start = new Date(today); start.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7)); return { from: iso(start), to: iso(today) }; }
  if (name === "last_month") { const first = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)); const last = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0)); return { from: iso(first), to: iso(last) }; }
  return { from: iso(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))), to: iso(today) };
}

const inputClass = "min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-800 outline-none focus:border-[#4A86F7] sm:text-[12px]";

export default function CrmReportsClient() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState("");
  const [tab, setTab] = useState<"invoices" | "payments">("invoices");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    return params.toString();
  }, [filters]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/crm/reports/?${query}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load reports.");
      setReport(payload);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load reports."); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void load(); }, [load]);

  const download = async (type: string, format: "csv" | "xlsx") => {
    const key = `${type}-${format}`; setExporting(key); setError("");
    try {
      const response = await fetch(`/api/admin/crm/exports/?type=${type}&format=${format}&${query}`, { cache: "no-store" });
      if (!response.ok) { const payload = await response.json().catch(() => ({})); throw new Error(payload.error || "Export failed."); }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const filename = disposition.match(/filename="([^"]+)"/)?.[1] || `camz-${type}.${format}`;
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    } catch (err) { setError(err instanceof Error ? err.message : "Export failed."); }
    finally { setExporting(""); }
  };

  const cards = report ? [
    ["Invoice totals", formatCad(report.summary.invoice_total_cents), `${report.summary.invoice_count} invoices`],
    ["Payments received", formatCad(report.summary.payments_received_cents), `${report.summary.payment_count} payments`],
    ["Outstanding", formatCad(report.summary.outstanding_cents), `${report.summary.outstanding_count} invoices`],
    ["Overdue", formatCad(report.summary.overdue_cents), `${report.summary.overdue_count} invoices`],
    ["GST charged", formatCad(report.summary.gst_charged_cents), "Invoice basis"],
    ["GST collected", formatCad(report.summary.gst_collected_cents), "Payment basis"],
    ["Discounts", formatCad(report.summary.discounts_cents), "Total given"],
    ["Void / cancelled", String(report.summary.void_cancelled_count), "Invoices"],
  ] : [];

  return (
    <div className="overflow-x-hidden p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-900">Reports & operational metrics</h1><p className="mt-1 text-[13px] text-slate-500">Invoice-date totals and payment-date collections remain separate for accurate reconciliation.</p></div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/>Refresh</button>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex flex-wrap gap-2">{[["today","Today"],["week","This week"],["month","This month"],["last_month","Last month"]].map(([value,label]) => <button key={value} type="button" onClick={() => setFilters((current) => ({ ...current, ...range(value) }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 hover:border-[#4A86F7]">{label}</button>)}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input aria-label="From date" type="date" className={inputClass} value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}/>
          <input aria-label="To date" type="date" className={inputClass} value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}/>
          <select aria-label="Invoice status" className={inputClass} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="all">All statuses</option>{["draft","unpaid","sent","partially_paid","overdue","paid","cancelled","void"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
          <select aria-label="Payment method" className={inputClass} value={filters.method} onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value }))}><option value="all">All payment methods</option>{["e_transfer","cash","card","cheque","other"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
          <select aria-label="Created by" className={inputClass} value={filters.created_by} onChange={(event) => setFilters((current) => ({ ...current, created_by: event.target.value }))}><option value="all">Created by: anyone</option>{report?.staff_options.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}</select>
          <select aria-label="Payment recorded by" className={inputClass} value={filters.payment_recorded_by} onChange={(event) => setFilters((current) => ({ ...current, payment_recorded_by: event.target.value }))}><option value="all">Payment by: anyone</option>{report?.staff_options.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}</select>
          <input className={`${inputClass} sm:col-span-2`} placeholder="Customer, email, phone or invoice number" value={filters.customer} onChange={(event) => setFilters((current) => ({ ...current, customer: event.target.value }))}/>
        </div>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</p> : null}
      {loading && !report ? <p className="mt-6 flex items-center gap-2 text-[13px] text-slate-500"><LoaderCircle size={16} className="animate-spin"/>Loading reports...</p> : null}

      {report ? <>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,note]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[12px] font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p><p className="mt-1 text-[11px] text-slate-400">{note}</p></div>)}</div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-bold text-slate-900">Outstanding aging</h2><div className="mt-3 grid gap-2 sm:grid-cols-5">{[["current","Current"],["1_7","1-7"],["8_30","8-30"],["31_60","31-60"],["60_plus","60+"]].map(([key,label]) => <div key={key} className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-500">{label} days</p><p className="mt-1 text-[13px] font-bold">{formatCad(report.aging[key]?.balance_cents || 0)}</p><p className="text-[10px] text-slate-400">{report.aging[key]?.count || 0} invoices</p></div>)}</div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="font-bold text-slate-900">Payment methods</h2><div className="mt-3 grid gap-2 sm:grid-cols-2">{Object.entries(report.payment_methods).map(([method,row]) => <div key={method} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-[12px]"><span className="capitalize">{method.replaceAll("_", " ")} ({row.count})</span><strong>{formatCad(row.amount_cents)}</strong></div>)}{!Object.keys(report.payment_methods).length ? <p className="text-[12px] text-slate-400">No payments in this period.</p> : null}</div></section>
        </div>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Secure exports</h2><p className="text-[11px] text-slate-500">Downloads use current filters and are recorded in the audit log.</p></div></div>
          <div className="mt-3 flex flex-wrap gap-2">{["invoices","payments","customers","outstanding","gst","audit"].flatMap((type) => (["csv","xlsx"] as const).map((format) => { const key = `${type}-${format}`; return <button key={key} type="button" disabled={Boolean(exporting)} onClick={() => void download(type, format)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-slate-700 hover:border-[#4A86F7] disabled:opacity-50">{exporting === key ? <LoaderCircle size={14} className="animate-spin"/> : <Download size={14}/>} {type.replaceAll("_", " ")} {format.toUpperCase()}</button>; }))}</div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex gap-2 border-b border-slate-100 p-3"><button type="button" onClick={() => setTab("invoices")} className={`rounded-lg px-4 py-2 text-[12px] font-bold ${tab === "invoices" ? "bg-[#4A86F7] text-white" : "text-slate-600"}`}>Invoices ({report.invoice_rows.length})</button><button type="button" onClick={() => setTab("payments")} className={`rounded-lg px-4 py-2 text-[12px] font-bold ${tab === "payments" ? "bg-[#4A86F7] text-white" : "text-slate-600"}`}>Payments ({report.payment_rows.length})</button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-[12px]"><thead className="bg-slate-50 text-slate-500"><tr>{(tab === "invoices" ? ["Invoice","Customer","Invoice date","Due date","Status","Total","Paid","Balance","Created by"] : ["Received","Invoice","Customer","Method","Reference","Amount","Recorded by"]).map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{tab === "invoices" ? report.invoice_rows.map((row) => <tr key={row.id} className="border-t border-slate-100"><td className="px-4 py-3 font-bold text-[#285db8]">{row.invoice_number || "Draft"}</td><td className="px-4 py-3">{row.customer}</td><td className="px-4 py-3">{row.invoice_date}</td><td className="px-4 py-3">{row.due_date || "-"}</td><td className="px-4 py-3 capitalize">{row.status.replaceAll("_", " ")}</td><td className="px-4 py-3">{formatCad(row.total_cents)}</td><td className="px-4 py-3">{formatCad(row.paid_cents)}</td><td className="px-4 py-3 font-bold">{formatCad(row.balance_cents)}</td><td className="px-4 py-3">{row.created_by}</td></tr>) : report.payment_rows.map((row) => <tr key={row.id} className="border-t border-slate-100"><td className="px-4 py-3">{row.received_at?.slice(0,10)}</td><td className="px-4 py-3 font-bold text-[#285db8]">{row.invoice_number}</td><td className="px-4 py-3">{row.customer}</td><td className="px-4 py-3 capitalize">{row.method?.replaceAll("_", " ")}</td><td className="px-4 py-3">{row.reference || "-"}</td><td className="px-4 py-3 font-bold">{formatCad(row.amount_cents)}</td><td className="px-4 py-3">{row.recorded_by}</td></tr>)}</tbody></table></div>
        </section>
      </> : null}
    </div>
  );
}
