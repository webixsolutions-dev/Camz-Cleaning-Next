"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react";
import { formatCad } from "@/lib/crm/money";

type PaymentRow = {
  id: string;
  invoice_id: string;
  invoice_number: string;
  customer: string;
  amount_cents: number;
  method: string;
  reference: string | null;
  received_at: string;
  recorded_by: string;
  reconciled: boolean;
  reconciliation_notes: string;
  reconciled_at: string | null;
  reconciled_by: string | null;
};

type Payload = {
  rows: PaymentRow[];
  summary: { total_count: number; total_cents: number; reconciled_count: number; reconciled_cents: number; unreconciled_count: number; unreconciled_cents: number };
};

function today() { return new Date().toISOString().slice(0, 10); }

export default function CrmReconciliationClient({ isAdmin }: { isAdmin: boolean }) {
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [state, setState] = useState("all");
  const [payload, setPayload] = useState<Payload | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ from, to, state });
      const response = await fetch(`/api/admin/crm/reconciliation/?${params}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load reconciliation.");
      setPayload(data);
      setNotes(Object.fromEntries((data.rows || []).map((row: PaymentRow) => [row.id, row.reconciliation_notes || ""])));
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to load reconciliation."); }
    finally { setLoading(false); }
  }, [from, state, to]);

  useEffect(() => { void load(); }, [load]);

  const update = async (row: PaymentRow, reconciled: boolean) => {
    if (!isAdmin) return;
    setSaving(row.id); setError("");
    try {
      const response = await fetch("/api/admin/crm/reconciliation/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: row.id, reconciled, notes: notes[row.id] || "" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update reconciliation.");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to update reconciliation."); }
    finally { setSaving(""); }
  };

  const inputClass = "min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-[14px] outline-none focus:border-[#4A86F7] sm:text-[12px]";
  const summary = payload?.summary;

  return (
    <div className="overflow-x-hidden p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-xl font-bold text-slate-900">Daily payment reconciliation</h1><p className="mt-1 text-[13px] text-slate-500">Confirm each manually recorded CRM payment against the real e-transfer, cash, cheque or card record.</p></div>
        <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-bold text-slate-700 disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""}/>Refresh</button>
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
        <label className="grid gap-1 text-[11px] font-bold text-slate-500">FROM<input type="date" className={inputClass} value={from} onChange={(event) => setFrom(event.target.value)}/></label>
        <label className="grid gap-1 text-[11px] font-bold text-slate-500">TO<input type="date" className={inputClass} value={to} onChange={(event) => setTo(event.target.value)}/></label>
        <label className="grid gap-1 text-[11px] font-bold text-slate-500">STATUS<select className={inputClass} value={state} onChange={(event) => setState(event.target.value)}><option value="all">All payments</option><option value="unreconciled">Unreconciled only</option><option value="reconciled">Reconciled only</option></select></label>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-[13px] text-rose-700">{error}</p> : null}
      {summary ? <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[12px] text-slate-500">Recorded payments</p><p className="mt-1 text-lg font-bold">{formatCad(summary.total_cents)}</p><p className="text-[11px] text-slate-400">{summary.total_count} records</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-[12px] text-emerald-700">Reconciled</p><p className="mt-1 text-lg font-bold text-emerald-900">{formatCad(summary.reconciled_cents)}</p><p className="text-[11px] text-emerald-600">{summary.reconciled_count} records</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-[12px] text-amber-700">Needs review</p><p className="mt-1 text-lg font-bold text-amber-900">{formatCad(summary.unreconciled_cents)}</p><p className="text-[11px] text-amber-600">{summary.unreconciled_count} records</p></div></div> : null}

      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[1050px] text-left text-[12px]">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="px-4 py-3">Reconciled?</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Method / reference</th><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Recorded by</th><th className="px-4 py-3">Notes</th><th className="px-4 py-3">Action</th></tr></thead>
          <tbody>
            {payload?.rows.map((row) => <tr key={row.id} className="border-t border-slate-100 align-top">
              <td className="px-4 py-4">{row.reconciled ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 font-bold text-emerald-700"><CheckCircle2 size={13}/>Yes</span> : <span className="rounded-full bg-amber-100 px-2 py-1 font-bold text-amber-700">No</span>}</td>
              <td className="px-4 py-4"><strong>{formatCad(row.amount_cents)}</strong><p className="mt-1 text-[10px] text-slate-400">{row.received_at?.slice(0,10)}</p></td>
              <td className="px-4 py-4 capitalize">{row.method?.replaceAll("_", " ")}<p className="mt-1 text-[10px] text-slate-400">{row.reference || "No reference"}</p></td>
              <td className="px-4 py-4 font-bold text-[#285db8]">{row.invoice_number || "-"}</td><td className="px-4 py-4">{row.customer}</td><td className="px-4 py-4">{row.recorded_by}</td>
              <td className="px-4 py-3"><input className="min-h-10 w-52 rounded-lg border border-slate-200 px-3 text-[12px]" placeholder="Bank/cash check note" value={notes[row.id] || ""} onChange={(event) => setNotes((current) => ({ ...current, [row.id]: event.target.value }))}/>{row.reconciled_at ? <p className="mt-1 text-[10px] text-slate-400">By {row.reconciled_by || "staff"} on {row.reconciled_at.slice(0,10)}</p> : null}</td>
              <td className="px-4 py-3"><button type="button" disabled={!isAdmin || saving === row.id} onClick={() => void update(row, !row.reconciled)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 font-bold text-white disabled:opacity-50 ${row.reconciled ? "bg-slate-600" : "bg-[#4A86F7]"}`}>{saving === row.id ? <LoaderCircle size={14} className="animate-spin"/> : null}{row.reconciled ? "Undo" : "Mark reconciled"}</button></td>
            </tr>)}
            {!loading && !payload?.rows.length ? <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">No payments match this date range and status.</td></tr> : null}
          </tbody>
        </table>
        {loading ? <p className="flex items-center gap-2 px-4 py-8 text-[13px] text-slate-500"><LoaderCircle size={16} className="animate-spin"/>Loading payments...</p> : null}
      </div>
    </div>
  );
}
