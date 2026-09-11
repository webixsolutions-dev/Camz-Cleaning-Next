"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatCad } from "@/lib/crm/money";

type Period = {
  id: string;
  period_start: string;
  period_end: string;
  expected_cents: number;
  received_cents: number;
  variance_cents: number;
  status: string;
  notes: string | null;
};

export default function CrmReconciliationClient({ isAdmin }: { isAdmin: boolean }) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ period_start: "", period_end: "", expected_cents: "" });

  const load = async () => {
    try {
      const response = await fetch("/api/admin/crm/reconciliation", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to load reconciliation");
      setPeriods(payload.periods || []);
      setError("");
    } catch (err) {
      console.error("CRM reconciliation load failed:", err);
      setError(err instanceof Error ? err.message : "Unable to load reconciliation");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/admin/crm/reconciliation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period_start: form.period_start,
          period_end: form.period_end,
          expected_cents: form.expected_cents ? Number(form.expected_cents) : undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to create period");
      setForm({ period_start: "", period_end: "", expected_cents: "" });
      await load();
    } catch (err) {
      console.error("CRM reconciliation create failed:", err);
      setError(err instanceof Error ? err.message : "Unable to create period");
    }
  };

  const closePeriod = async (id: string, status: string) => {
    if (!isAdmin) return;
    try {
      const response = await fetch("/api/admin/crm/reconciliation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to update period");
      await load();
    } catch (err) {
      console.error("CRM reconciliation update failed:", err);
      setError(err instanceof Error ? err.message : "Unable to update period");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-slate-900">Reconciliation</h1>
      <p className="mt-1 mb-5 text-slate-500">Compare received CRM payments against an expected total for a date range.</p>
      {error ? <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{error}</p> : null}

      <form onSubmit={submit} className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <input type="date" required className="h-10 rounded-lg border px-3 text-[12px]" value={form.period_start} onChange={(event) => setForm((current) => ({ ...current, period_start: event.target.value }))} />
        <input type="date" required className="h-10 rounded-lg border px-3 text-[12px]" value={form.period_end} onChange={(event) => setForm((current) => ({ ...current, period_end: event.target.value }))} />
        <input className="h-10 rounded-lg border px-3 text-[12px]" placeholder="Expected cents (optional)" value={form.expected_cents} onChange={(event) => setForm((current) => ({ ...current, expected_cents: event.target.value }))} />
        <button type="submit" className="h-10 rounded-xl bg-[#4A86F7] text-[12px] font-bold text-white">
          Create period
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Variance</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {periods.map((period) => (
              <tr key={period.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{period.period_start} → {period.period_end}</td>
                <td className="px-4 py-3">{formatCad(period.expected_cents)}</td>
                <td className="px-4 py-3">{formatCad(period.received_cents)}</td>
                <td className="px-4 py-3">{formatCad(period.variance_cents)}</td>
                <td className="px-4 py-3">
                  {period.status}
                  {isAdmin && period.status !== "matched" ? (
                    <button type="button" className="ml-2 text-[#4A86F7]" onClick={() => void closePeriod(period.id, "matched")}>
                      Mark matched
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
