"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, ReceiptText, Search } from "lucide-react";
import { formatCad } from "@/lib/crm/money";

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  status: string;
  total_cents: number;
  balance_cents: number;
  created_at: string;
  crm_customers?: { display_name?: string } | null;
};

const statusClass: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  issued: "bg-blue-50 text-blue-700",
  partially_paid: "bg-amber-50 text-amber-700",
  paid: "bg-emerald-50 text-emerald-700",
  overdue: "bg-orange-50 text-orange-700",
  void: "bg-rose-50 text-rose-700",
};

export default function CrmInvoicesClient() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return invoices;
    return invoices.filter((invoice) =>
      [invoice.invoice_number, invoice.status, invoice.crm_customers?.display_name].join(" ").toLowerCase().includes(needle),
    );
  }, [invoices, query]);

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-900">Invoices</h1>
          <p className="mt-1 text-slate-500">Draft, issue, send, and collect payment. Issued invoices are never hard-deleted.</p>
        </div>
        <Link href="/admin-dashboard/crm/invoices/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4A86F7] px-4 text-[12px] font-bold text-white">
          <Plus size={16} />
          New invoice
        </Link>
      </div>

      <div className="mb-4 flex items-center rounded-xl border border-slate-200 bg-white px-3">
        <Search size={16} className="text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search invoice or customer" className="h-11 w-full bg-transparent px-3 text-[12px] outline-none" />
      </div>

      {error ? <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-slate-500">Loading invoices...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-slate-500">
            <ReceiptText size={28} />
            <p>No invoices yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-[12px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Number</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => (
                <tr key={invoice.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <Link href={`/admin-dashboard/crm/invoices/${invoice.id}`} className="font-bold text-[#4A86F7]">
                      {invoice.invoice_number || "Draft"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{invoice.crm_customers?.display_name || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusClass[invoice.status] || "bg-slate-100"}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatCad(invoice.total_cents)}</td>
                  <td className="px-4 py-3">{formatCad(invoice.balance_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
