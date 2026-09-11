"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users } from "lucide-react";

export type CrmAddress = {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  is_billing: boolean;
};

export type CrmCustomer = {
  id: string;
  customer_code?: string | null;
  display_name: string;
  legal_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  user_id: string | null;
  crm_customer_addresses?: CrmAddress[];
};

const fieldClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[12px] font-medium text-slate-700 outline-none focus:border-blue-300 focus:bg-white";

export default function CrmCustomersClient() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    display_name: "",
    email: "",
    phone: "",
    line1: "",
    city: "",
    province: "",
    postal_code: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/crm/customers", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to load customers");
      setCustomers(payload.customers || []);
      setError("");
    } catch (err) {
      console.error("CRM customers load failed:", err);
      setError(err instanceof Error ? err.message : "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) =>
      [customer.customer_code, customer.display_name, customer.email, customer.phone].join(" ").toLowerCase().includes(needle),
    );
  }, [customers, query]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/admin/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: form.display_name,
          email: form.email,
          phone: form.phone,
          address: form.line1
            ? {
                line1: form.line1,
                city: form.city,
                province: form.province,
                postal_code: form.postal_code,
                is_billing: true,
              }
            : undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Failed to create customer");
      setOpen(false);
      setForm({ display_name: "", email: "", phone: "", line1: "", city: "", province: "", postal_code: "" });
      await load();
      router.refresh();
    } catch (err) {
      console.error("CRM customer create failed:", err);
      setError(err instanceof Error ? err.message : "Unable to create customer");
    }
  };

  return (
    <div className="overflow-x-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-900">Invoice customers</h1>
          <p className="mt-1 text-slate-500">Billing contacts for the Invoice CRM only. This is separate from app user accounts.</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4A86F7] px-4 text-[12px] font-bold text-white"
        >
          <Plus size={16} />
          Add customer
        </button>
      </div>

      <div className="mb-4 flex items-center rounded-xl border border-slate-200 bg-white px-3">
        <Search size={16} className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search ID, name, email, or phone"
          className="h-11 w-full bg-transparent px-3 text-[12px] outline-none"
        />
      </div>

      {error ? <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-slate-500">Loading customers...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-slate-500">
            <Users size={28} />
            <p>No CRM customers yet.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map((customer) => {
                const address = customer.crm_customer_addresses?.[0];
                return (
                  <article key={customer.id} className="p-4">
                    <p className="font-mono text-[12px] font-bold text-[#4A86F7]">{customer.customer_code || "—"}</p>
                    <p className="mt-1 font-semibold text-slate-800">{customer.display_name}</p>
                    <p className="mt-1 break-all text-[13px] text-slate-600">{customer.email || "-"}</p>
                    <p className="mt-1 text-[13px] text-slate-600">{customer.phone || "-"}</p>
                    <p className="mt-1 text-[13px] text-slate-500">{address ? [address.line1, address.city].filter(Boolean).join(", ") : "-"}</p>
                  </article>
                );
              })}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-[12px]">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const address = customer.crm_customer_addresses?.[0];
                return (
                  <tr key={customer.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono font-bold text-[#4A86F7]">{customer.customer_code || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{customer.display_name}</td>
                    <td className="px-4 py-3">{customer.email || "-"}</td>
                    <td className="px-4 py-3">{customer.phone || "-"}</td>
                    <td className="px-4 py-3">{address ? [address.line1, address.city].filter(Boolean).join(", ") : "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
            </div>
          </>
        )}
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
          <form onSubmit={submit} className="max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <h2 className="mb-4 text-slate-900">New CRM customer</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2 text-[11px] font-semibold text-slate-500">
                Name
                <input className={`${fieldClass} mt-1`} value={form.display_name} onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))} required />
              </label>
              <label className="text-[11px] font-semibold text-slate-500">
                Email
                <input className={`${fieldClass} mt-1`} type="email" value={form.email} required onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label className="text-[11px] font-semibold text-slate-500">
                Phone
                <input className={`${fieldClass} mt-1`} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </label>
              <label className="sm:col-span-2 text-[11px] font-semibold text-slate-500">
                Billing address
                <input className={`${fieldClass} mt-1`} value={form.line1} onChange={(event) => setForm((current) => ({ ...current, line1: event.target.value }))} />
              </label>
              <input className={fieldClass} placeholder="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
              <input className={fieldClass} placeholder="Province" value={form.province} onChange={(event) => setForm((current) => ({ ...current, province: event.target.value }))} />
              <input className={fieldClass} placeholder="Postal code" value={form.postal_code} onChange={(event) => setForm((current) => ({ ...current, postal_code: event.target.value }))} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-xl border px-4 text-[12px] font-bold">
                Cancel
              </button>
              <button type="submit" className="h-10 rounded-xl bg-[#4A86F7] px-4 text-[12px] font-bold text-white">
                Save
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
