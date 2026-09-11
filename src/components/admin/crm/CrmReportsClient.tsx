"use client";

import { useEffect, useState } from "react";
import { formatCad } from "@/lib/crm/money";

type Report = {
  invoice_count: number;
  issued_count: number;
  open_balance_cents: number;
  collected_cents: number;
  by_status: Record<string, number>;
};

export default function CrmReportsClient() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/admin/crm/reports/", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) {
          setError(payload.error || "Unable to load reports");
          return;
        }
        setReport(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load reports");
      }
    };
    void load();
  }, []);

  if (!report) return <p className="p-6 text-slate-500">{error || "Loading reports..."}</p>;

  return (
    <div className="p-6">
      <h1 className="text-slate-900">Invoice reports</h1>
      {error ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{error}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[12px]">
          <p className="text-slate-500">Invoices</p>
          <p className="mt-1 text-lg font-bold">{report.invoice_count}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[12px]">
          <p className="text-slate-500">Issued</p>
          <p className="mt-1 text-lg font-bold">{report.issued_count}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[12px]">
          <p className="text-slate-500">Collected</p>
          <p className="mt-1 text-lg font-bold">{formatCad(report.collected_cents)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[12px]">
          <p className="text-slate-500">Open balance</p>
          <p className="mt-1 text-lg font-bold">{formatCad(report.open_balance_cents)}</p>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-[12px]">
        <p className="mb-2 font-bold">By status</p>
        {Object.entries(report.by_status).map(([status, count]) => (
          <p key={status}>
            {status}: {count}
          </p>
        ))}
      </div>
    </div>
  );
}
