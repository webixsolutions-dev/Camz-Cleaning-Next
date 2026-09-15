"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Banknote, BarChart3, Bell, CheckCircle2, Clock3, FileText, LoaderCircle, Plus, ReceiptText, RefreshCw, Search, Settings2, Users, Wallet, X } from "lucide-react";
import { formatCad } from "@/lib/crm/money";

type Filters = { from: string; to: string; created_by: string };
type Cards = { draft_count: number; draft_cents: number; sent_unpaid_count: number; sent_unpaid_cents: number; partial_count: number; partial_cents: number; overdue_count: number; overdue_cents: number; paid_count: number; paid_cents: number; collected_count: number; collected_cents: number; outstanding_count: number; outstanding_cents: number; gst_charged_cents: number; gst_collected_cents: number };
type Dashboard = {
  cards: Cards;
  overdue: Array<{ id: string; invoice_number: string; customer: string; due_date: string; balance_cents: number }>;
  recent_activity: Array<{ id: string; invoice_id: string; invoice_number: string; customer: string; event_type: string; created_at: string; created_by: string }>;
  staff_options: Array<{ id: string; label: string }>;
};
type SearchResult = { type: "invoice" | "customer"; id: string; title: string; subtitle: string; href: string; status?: string; address?: string; total_cents?: number; balance_cents?: number };

function iso(date: Date) { return date.toISOString().slice(0, 10); }
function startFilters(): Filters { const now = new Date(); return { from: iso(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))), to: iso(now), created_by: "all" }; }
function preset(name: string) {
  const now = new Date(); const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (name === "today") return { from: iso(today), to: iso(today) };
  if (name === "week") { const from = new Date(today); from.setUTCDate(from.getUTCDate() - ((from.getUTCDay() + 6) % 7)); return { from: iso(from), to: iso(today) }; }
  if (name === "last_month") return { from: iso(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1))), to: iso(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0))) };
  return { from: iso(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))), to: iso(today) };
}

const eventLabels: Record<string, string> = {
  created: "Invoice created", issued: "Invoice issued", sent: "Invoice sent", emailed: "Invoice emailed", reminder_sent: "Reminder sent", payment_recorded: "Payment recorded", paid: "Invoice paid", payment_reversed: "Payment reversed", payment_voided: "Payment reversed", voided: "Invoice voided", cancelled: "Invoice cancelled",
};

function dateTime(value: string) { return new Date(value).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); }
const inputClass = "min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-[14px] outline-none focus:border-[#4A86F7] sm:text-[12px]";

export default function CrmDashboardClient() {
  const [filters, setFilters] = useState<Filters>(startFilters);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchBox = useRef<HTMLDivElement>(null);

  const query = useMemo(() => new URLSearchParams(filters).toString(), [filters]);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/admin/crm/dashboard/?${query}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Unable to load the dashboard.");
      setDashboard(payload);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load the dashboard."); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!searchBox.current?.contains(event.target as Node)) setSearchOpen(false); };
    document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close);
  }, []);
  useEffect(() => {
    const value = search.trim();
    if (value.length < 2) { setResults([]); setSearching(false); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/admin/crm/search/?q=${encodeURIComponent(value)}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Search failed.");
        setResults([...(payload.invoices || []), ...(payload.customers || [])]); setSearchOpen(true);
      } catch (err) { if (!(err instanceof DOMException && err.name === "AbortError")) setError(err instanceof Error ? err.message : "Search failed."); }
      finally { setSearching(false); }
    }, 300);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [search]);

  const cards = dashboard ? [
    { label: "Draft", value: String(dashboard.cards.draft_count), note: formatCad(dashboard.cards.draft_cents), color: "bg-slate-50 text-slate-700" },
    { label: "Sent / unpaid", value: formatCad(dashboard.cards.sent_unpaid_cents), note: `${dashboard.cards.sent_unpaid_count} invoices`, color: "bg-blue-50 text-blue-700" },
    { label: "Partially paid", value: formatCad(dashboard.cards.partial_cents), note: `${dashboard.cards.partial_count} invoices`, color: "bg-amber-50 text-amber-700" },
    { label: "Overdue", value: formatCad(dashboard.cards.overdue_cents), note: `${dashboard.cards.overdue_count} invoices`, color: "bg-orange-50 text-orange-700" },
    { label: "Paid", value: formatCad(dashboard.cards.paid_cents), note: `${dashboard.cards.paid_count} invoices · invoice date`, color: "bg-emerald-50 text-emerald-700" },
    { label: "Collected", value: formatCad(dashboard.cards.collected_cents), note: `${dashboard.cards.collected_count} payments · payment date`, color: "bg-cyan-50 text-cyan-700" },
    { label: "Outstanding", value: formatCad(dashboard.cards.outstanding_cents), note: `${dashboard.cards.outstanding_count} invoices`, color: "bg-violet-50 text-violet-700" },
    { label: "GST", value: formatCad(dashboard.cards.gst_charged_cents), note: `${formatCad(dashboard.cards.gst_collected_cents)} collected`, color: "bg-indigo-50 text-indigo-700" },
  ] : [];
  const quickLinks = [
    { href: "/admin-dashboard/crm/invoices/new", label: "New invoice", icon: Plus },
    { href: "/admin-dashboard/crm/invoices", label: "Invoices", icon: ReceiptText },
    { href: "/admin-dashboard/crm/customers", label: "Customers", icon: Users },
    { href: "/admin-dashboard/crm/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin-dashboard/crm/reconciliation", label: "Reconciliation", icon: Banknote },
    { href: "/admin-dashboard/crm/settings", label: "Settings", icon: Settings2 },
  ];

  return <div className="overflow-x-hidden p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-bold text-slate-900">Invoice CRM dashboard</h1><p className="mt-1 text-[13px] text-slate-500">Invoices, collections and payment status in one operational view.</p></div><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/>Refresh</button></div>

    <div ref={searchBox} className="relative z-20 mt-5 max-w-3xl">
      <div className="flex min-h-12 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm focus-within:border-[#4A86F7] focus-within:ring-4 focus-within:ring-blue-50"><Search size={18} className="shrink-0 text-slate-400"/><input value={search} onFocus={() => setSearchOpen(true)} onChange={(event) => setSearch(event.target.value)} placeholder="Search invoices, customers, email, phone, address or postal code" className="h-12 w-full bg-transparent px-3 text-[14px] outline-none"/>{searching ? <LoaderCircle size={17} className="animate-spin text-[#4A86F7]"/> : search ? <button type="button" aria-label="Clear search" onClick={() => { setSearch(""); setResults([]); }}><X size={17} className="text-slate-400"/></button> : null}</div>
      {searchOpen && search.trim().length >= 2 ? <div className="absolute left-0 right-0 top-[56px] max-h-[430px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">{results.map((row) => <Link key={`${row.type}-${row.id}`} href={row.href} onClick={() => setSearchOpen(false)} className="flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50"><span className={`mt-0.5 rounded-lg p-2 ${row.type === "invoice" ? "bg-blue-50 text-blue-600" : "bg-violet-50 text-violet-600"}`}>{row.type === "invoice" ? <FileText size={16}/> : <Users size={16}/>}</span><span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><strong className="text-[13px] text-slate-900">{row.title}</strong><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase text-slate-500">{row.type}</span>{row.status ? <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] capitalize text-blue-700">{row.status.replaceAll("_", " ")}</span> : null}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{row.subtitle}{row.address ? ` · ${row.address}` : ""}</span></span>{row.type === "invoice" ? <span className="text-right text-[11px]"><strong className="block text-slate-800">{formatCad(row.total_cents)}</strong><span className="text-slate-400">{formatCad(row.balance_cents)} due</span></span> : null}</Link>)}{!searching && !results.length ? <p className="px-4 py-8 text-center text-[12px] text-slate-400">No matching customers or invoices.</p> : null}</div> : null}
    </div>

    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 flex flex-wrap gap-2">{[["today","Today"],["week","This week"],["month","This month"],["last_month","Last month"]].map(([value,label]) => <button key={value} type="button" onClick={() => setFilters((current) => ({ ...current, ...preset(value) }))} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 hover:border-[#4A86F7]">{label}</button>)}</div><div className="grid gap-3 sm:grid-cols-3"><input aria-label="From date" type="date" className={inputClass} value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}/><input aria-label="To date" type="date" className={inputClass} value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}/><select aria-label="Created by" className={inputClass} value={filters.created_by} onChange={(event) => setFilters((current) => ({ ...current, created_by: event.target.value }))}><option value="all">Created by: anyone</option>{dashboard?.staff_options.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}</select></div><p className="mt-2 text-[10px] text-slate-400">Invoice cards use invoice date. Collected and GST-collected cards use payment date.</p></div>

    {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</p> : null}
    {loading && !dashboard ? <p className="mt-6 flex items-center gap-2 text-[13px] text-slate-500"><LoaderCircle size={16} className="animate-spin"/>Loading dashboard...</p> : null}
    {dashboard ? <>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map((card) => <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4"><span className={`inline-flex rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${card.color}`}>{card.label}</span><p className="mt-3 text-xl font-bold text-slate-900">{card.value}</p><p className="mt-1 text-[11px] text-slate-400">{card.note}</p></div>)}</div>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4"><h2 className="text-[14px] font-bold text-slate-900">Quick actions</h2><div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">{quickLinks.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[12px] font-bold text-slate-700 hover:border-[#4A86F7] hover:text-[#285db8]"><Icon size={15}/>{item.label}</Link>; })}</div></section>
      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white"><div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3"><AlertTriangle size={17} className="text-orange-500"/><h2 className="text-[14px] font-bold">Overdue invoices</h2></div><div className="divide-y divide-slate-100">{dashboard.overdue.map((row) => <Link key={row.id} href={`/admin-dashboard/crm/invoices/${row.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"><span className="min-w-0"><strong className="block text-[12px] text-[#285db8]">{row.invoice_number}</strong><span className="block truncate text-[11px] text-slate-500">{row.customer} · Due {row.due_date}</span></span><strong className="shrink-0 text-[12px] text-orange-700">{formatCad(row.balance_cents)}</strong></Link>)}{!dashboard.overdue.length ? <p className="flex items-center gap-2 p-5 text-[12px] text-emerald-700"><CheckCircle2 size={16}/>No overdue invoices in this range.</p> : null}</div></section>
        <section className="rounded-2xl border border-slate-200 bg-white"><div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3"><Clock3 size={17} className="text-[#4A86F7]"/><h2 className="text-[14px] font-bold">Recent activity</h2></div><div className="max-h-[430px] divide-y divide-slate-100 overflow-y-auto">{dashboard.recent_activity.map((event) => <Link key={event.id} href={`/admin-dashboard/crm/invoices/${event.invoice_id}`} className="flex gap-3 p-4 hover:bg-slate-50"><span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#4A86F7]">{event.event_type.includes("reminder") ? <Bell size={14}/> : event.event_type.includes("payment") || event.event_type === "paid" ? <Wallet size={14}/> : <FileText size={14}/>}</span><span className="min-w-0 flex-1"><strong className="text-[12px] text-slate-900">{eventLabels[event.event_type] || event.event_type.replaceAll("_", " ")}</strong><span className="ml-2 text-[11px] font-semibold text-[#285db8]">{event.invoice_number}</span><span className="mt-1 block truncate text-[11px] text-slate-500">{event.customer} · {event.created_by}</span></span><span className="shrink-0 text-[10px] text-slate-400">{dateTime(event.created_at)}</span></Link>)}{!dashboard.recent_activity.length ? <p className="p-5 text-[12px] text-slate-400">No recent invoice activity.</p> : null}</div></section>
      </div>
    </> : null}
  </div>;
}
