"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  StickyNote,
  Users,
  Wallet,
  X,
} from "lucide-react";
import CrmAddressAutocomplete, { type GoogleAddressSelection } from "./CrmAddressAutocomplete";

export type CrmAddress = {
  id: string;
  label: string | null;
  line1: string;
  line2: string | null;
  formatted_address?: string | null;
  street_number?: string | null;
  route?: string | null;
  unit?: string | null;
  access_detail?: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country?: string | null;
  place_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_billing: boolean;
  is_service: boolean;
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

type InvoiceRow = {
  id: string;
  invoice_number: string | null;
  status: string;
  invoice_date: string | null;
  service_date: string | null;
  due_date: string | null;
  total_cents: number;
  amount_paid_cents: number;
  balance_cents: number;
  is_void: boolean;
  created_at: string;
  crm_payments?: Array<{
    id: string;
    amount_cents: number;
    method: string | null;
    reference: string | null;
    received_at: string;
    is_void: boolean;
  }>;
};

type CustomerDetail = {
  customer: CrmCustomer;
  invoices: InvoiceRow[];
  internal_notes: Array<{ id: string; note: string; created_at: string; edited_at: string | null }>;
  profile: {
    invoice_count: number;
    total_billed_cents: number;
    total_paid_cents: number;
    outstanding_cents: number;
    last_invoice_date: string | null;
    last_service_date: string | null;
  };
};

type Duplicate = Pick<CrmCustomer, "id" | "customer_code" | "display_name" | "email" | "phone">;

const fieldClass =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-[#F8FAFD] px-3.5 text-[16px] font-medium text-slate-700 outline-none transition focus:border-[#4A86F7] focus:bg-white focus:ring-4 focus:ring-[#4A86F7]/10 sm:text-[13px]";

const blankCustomer = {
  display_name: "",
  legal_name: "",
  email: "",
  phone: "",
  notes: "",
  line1: "",
  line2: "",
  formatted_address: "",
  street_number: "",
  route: "",
  unit: "",
  access_detail: "",
  city: "",
  province: "AB",
  postal_code: "",
  country: "CA",
  place_id: "",
  latitude: null as number | null,
  longitude: null as number | null,
};

const blankAddress = {
  id: "",
  label: "Service address",
  line1: "",
  line2: "",
  formatted_address: "",
  street_number: "",
  route: "",
  unit: "",
  access_detail: "",
  city: "",
  province: "AB",
  postal_code: "",
  country: "CA",
  place_id: "",
  latitude: null as number | null,
  longitude: null as number | null,
  is_service: true,
  is_billing: false,
};

function formatCad(cents?: number | null) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(Number(cents || 0) / 100);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

function addressText(address?: CrmAddress | null) {
  if (!address) return "No address saved";
  return [address.unit ? `Unit ${address.unit}` : null, address.line1, address.line2, address.city, address.province, address.postal_code]
    .filter(Boolean)
    .join(", ");
}

async function readApi(response: Response) {
  return (await response.json().catch(() => ({}))) as Record<string, unknown>;
}

export default function CrmCustomersClient() {
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customerModal, setCustomerModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(blankCustomer);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [addressModal, setAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState(blankAddress);
  const [note, setNote] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/crm/customers", { cache: "no-store" });
      const payload = await readApi(response);
      if (!response.ok) throw new Error(String(payload.error || "Failed to load customers"));
      setCustomers((payload.customers as CrmCustomer[]) || []);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  const loadDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/crm/customers?id=${encodeURIComponent(id)}`, { cache: "no-store" });
      const payload = await readApi(response);
      if (!response.ok) throw new Error(String(payload.error || "Failed to load customer"));
      setDetail(payload as unknown as CustomerDetail);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customer");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const customerId = new URLSearchParams(window.location.search).get("customer");
    if (customerId) void loadDetail(customerId);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return customers;
    return customers.filter((customer) => {
      const addresses = (customer.crm_customer_addresses || [])
        .map((address) => [address.label, address.line1, address.line2, address.city, address.province, address.postal_code].join(" "))
        .join(" ");
      return [customer.customer_code, customer.display_name, customer.legal_name, customer.email, customer.phone, addresses]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [customers, query]);

  const openCreate = () => {
    setEditingId(null);
    setForm(blankCustomer);
    setDuplicates([]);
    setCustomerModal(true);
  };

  const openEdit = () => {
    if (!detail) return;
    setEditingId(detail.customer.id);
    setForm({
      ...blankCustomer,
      display_name: detail.customer.display_name,
      legal_name: detail.customer.legal_name || "",
      email: detail.customer.email || "",
      phone: detail.customer.phone || "",
      notes: detail.customer.notes || "",
    });
    setDuplicates([]);
    setCustomerModal(true);
  };

  const saveCustomer = async (event?: FormEvent, confirmDuplicate = false) => {
    event?.preventDefault();
    setSaving(true);
    setError("");
    try {
      const initialAddress = !editingId && form.line1
        ? {
            label: "Primary",
            line1: form.line1,
            line2: form.line2,
            formatted_address: form.formatted_address,
            street_number: form.street_number,
            route: form.route,
            unit: form.unit,
            access_detail: form.access_detail,
            city: form.city,
            province: form.province,
            postal_code: form.postal_code,
            country: form.country,
            place_id: form.place_id,
            latitude: form.latitude,
            longitude: form.longitude,
            is_billing: true,
            is_service: true,
          }
        : undefined;
      const response = await fetch("/api/admin/crm/customers", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          display_name: form.display_name,
          legal_name: form.legal_name,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
          address: initialAddress,
          confirm_duplicate: confirmDuplicate,
        }),
      });
      const payload = await readApi(response);
      if (response.status === 409 && payload.code === "POSSIBLE_DUPLICATE") {
        setDuplicates((payload.duplicates as Duplicate[]) || []);
        return;
      }
      if (!response.ok) throw new Error(String(payload.error || "Failed to save customer"));
      const saved = payload.customer as CrmCustomer;
      setCustomerModal(false);
      setDuplicates([]);
      await load();
      if (saved?.id) await loadDetail(saved.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save customer");
    } finally {
      setSaving(false);
    }
  };

  const openAddress = (address?: CrmAddress) => {
    setAddressForm(
      address
        ? {
            ...blankAddress,
            id: address.id,
            label: address.label || "",
            line1: address.line1,
            line2: address.line2 || "",
            formatted_address: address.formatted_address || "",
            street_number: address.street_number || "",
            route: address.route || "",
            unit: address.unit || "",
            access_detail: address.access_detail || "",
            city: address.city || "",
            province: address.province || "AB",
            postal_code: address.postal_code || "",
            country: address.country || "CA",
            place_id: address.place_id || "",
            latitude: address.latitude ?? null,
            longitude: address.longitude ?? null,
            is_service: address.is_service,
            is_billing: address.is_billing,
          }
        : blankAddress,
    );
    setAddressModal(true);
  };

  const saveAddress = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_address", customer_id: detail.customer.id, address: addressForm }),
      });
      const payload = await readApi(response);
      if (!response.ok) throw new Error(String(payload.error || "Failed to save address"));
      setAddressModal(false);
      await Promise.all([load(), loadDetail(detail.customer.id)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save address");
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async (event: FormEvent) => {
    event.preventDefault();
    if (!detail || !note.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/admin/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_note", customer_id: detail.customer.id, note }),
      });
      const payload = await readApi(response);
      if (!response.ok) throw new Error(String(payload.error || "Failed to save note"));
      setNote("");
      await loadDetail(detail.customer.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-x-hidden p-4 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-slate-900">Invoice customers</h1>
          <p className="mt-1 text-slate-500">Customer profiles, saved addresses, invoice history, payments and internal notes.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#4A86F7] px-4 text-[12px] font-bold text-white">
          <Plus size={16} /> Add customer
        </button>
      </div>

      <div className="mb-4 flex items-center rounded-xl border border-slate-200 bg-white px-3">
        <Search size={16} className="text-slate-400" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID, name, email, phone, street or postal code" className="h-11 w-full bg-transparent px-3 text-[12px] outline-none" />
      </div>
      {error ? <p className="mb-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <p className="p-6 text-slate-500">Loading customers...</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-slate-500"><Users size={28} /><p>No matching CRM customers.</p></div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map((customer) => (
                <button key={customer.id} type="button" onClick={() => void loadDetail(customer.id)} className="block w-full p-4 text-left">
                  <p className="font-mono text-[12px] font-bold text-[#4A86F7]">{customer.customer_code || "—"}</p>
                  <p className="mt-1 font-semibold text-slate-800">{customer.display_name}</p>
                  <p className="mt-1 break-all text-[13px] text-slate-600">{customer.email || customer.phone || "—"}</p>
                  <p className="mt-1 text-[13px] text-slate-500">{addressText(customer.crm_customer_addresses?.[0])}</p>
                </button>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[820px] text-left text-[12px]">
                <thead className="bg-slate-50 text-slate-500">
                  <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Address</th><th className="px-4 py-3" /></tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr key={customer.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-mono font-bold text-[#4A86F7]">{customer.customer_code || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{customer.display_name}</td>
                      <td className="px-4 py-3">{customer.email || "—"}</td>
                      <td className="px-4 py-3">{customer.phone || "—"}</td>
                      <td className="max-w-[260px] truncate px-4 py-3">{addressText(customer.crm_customer_addresses?.[0])}</td>
                      <td className="px-4 py-3 text-right"><button type="button" onClick={() => void loadDetail(customer.id)} className="font-bold text-[#4A86F7]">View profile</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {detail || detailLoading ? (
        <div className="fixed inset-0 z-40 bg-slate-950/40" onClick={() => !detailLoading && setDetail(null)}>
          <section className="ml-auto h-full w-full max-w-4xl overflow-y-auto bg-[#F4F7FB] p-4 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
            {detailLoading && !detail ? <p className="p-8 text-slate-500">Loading customer profile...</p> : detail ? (
              <>
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div><p className="font-mono text-[12px] font-bold text-[#4A86F7]">{detail.customer.customer_code || "Customer"}</p><h2 className="mt-1 text-slate-900">{detail.customer.display_name}</h2><p className="mt-1 text-[13px] text-slate-500">{detail.customer.legal_name || "Customer profile"}</p></div>
                  <div className="flex gap-2"><button type="button" onClick={openEdit} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-bold"><Edit3 size={14} /> Edit</button><button type="button" onClick={() => setDetail(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white"><X size={17} /></button></div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Invoices", String(detail.profile.invoice_count), FileText],
                    ["Total billed", formatCad(detail.profile.total_billed_cents), Building2],
                    ["Total paid", formatCad(detail.profile.total_paid_cents), Wallet],
                    ["Outstanding", formatCad(detail.profile.outstanding_cents), AlertTriangle],
                  ].map(([label, value, Icon]) => {
                    const CardIcon = Icon as typeof FileText;
                    return <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4"><CardIcon size={17} className="text-[#4A86F7]" /><p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{String(label)}</p><p className="mt-1 font-bold text-slate-900">{String(value)}</p></div>;
                  })}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between"><h3 className="text-slate-900">Contact</h3></div>
                    <div className="mt-3 space-y-2 text-[13px] text-slate-600">
                      <p className="flex items-center gap-2"><Mail size={14} /> {detail.customer.email || "No email — add one before sending"}</p>
                      <p className="flex items-center gap-2"><Phone size={14} /> {detail.customer.phone || "No phone"}</p>
                      <p>Last invoice: {formatDate(detail.profile.last_invoice_date)}</p>
                      <p>Last service: {formatDate(detail.profile.last_service_date)}</p>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between"><h3 className="text-slate-900">Saved addresses</h3><button type="button" onClick={() => openAddress()} className="inline-flex items-center gap-1 text-[12px] font-bold text-[#4A86F7]"><Plus size={14} /> Add</button></div>
                    <div className="mt-3 space-y-2">
                      {(detail.customer.crm_customer_addresses || []).map((address) => (
                        <button key={address.id} type="button" onClick={() => openAddress(address)} className="w-full rounded-xl bg-slate-50 p-3 text-left">
                          <div className="flex items-start justify-between gap-2"><p className="flex items-center gap-2 text-[12px] font-bold text-slate-700"><MapPin size={14} /> {address.label || "Address"}</p><span className="text-[10px] font-bold uppercase text-[#4A86F7]">{[address.is_service ? "Service" : "", address.is_billing ? "Default billing" : ""].filter(Boolean).join(" · ")}</span></div>
                          <p className="mt-1 text-[12px] leading-5 text-slate-500">{addressText(address)}</p>
                          {address.access_detail ? <p className="mt-1 text-[11px] text-slate-400">Access: {address.access_detail}</p> : null}
                        </button>
                      ))}
                      {!detail.customer.crm_customer_addresses?.length ? <p className="text-[12px] text-slate-500">No saved addresses.</p> : null}
                    </div>
                  </section>
                </div>

                <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between"><h3 className="text-slate-900">Invoice and payment history</h3><Link href={`/admin-dashboard/crm/invoices/new?customer=${detail.customer.id}`} className="text-[12px] font-bold text-[#4A86F7]">Create invoice</Link></div>
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-[12px]">
                      <thead className="text-slate-400"><tr><th className="py-2">Invoice</th><th>Status</th><th>Date</th><th>Total</th><th>Paid</th><th>Balance</th></tr></thead>
                      <tbody>
                        {detail.invoices.map((invoice) => (
                          <tr key={invoice.id} className="border-t border-slate-100">
                            <td className="py-3"><Link href={`/admin-dashboard/crm/invoices/${invoice.id}`} className="font-bold text-[#4A86F7]">{invoice.invoice_number || "Draft"}</Link></td><td className="capitalize">{invoice.status.replaceAll("_", " ")}</td><td>{formatDate(invoice.invoice_date || invoice.created_at)}</td><td>{formatCad(invoice.total_cents)}</td><td className="text-emerald-700">{formatCad(invoice.amount_paid_cents)}</td><td>{formatCad(invoice.balance_cents)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!detail.invoices.length ? <p className="py-5 text-[12px] text-slate-500">No invoices yet.</p> : null}
                  </div>
                  {detail.invoices.some((invoice) => invoice.crm_payments?.some((payment) => !payment.is_void)) ? (
                    <div className="mt-4 border-t border-slate-100 pt-3"><p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Payments</p><div className="grid gap-2 sm:grid-cols-2">{detail.invoices.flatMap((invoice) => (invoice.crm_payments || []).filter((payment) => !payment.is_void).map((payment) => <div key={payment.id} className="rounded-xl bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800"><span className="font-bold">{formatCad(payment.amount_cents)}</span> · {payment.method || "payment"} · {formatDate(payment.received_at)}{payment.reference ? ` · ${payment.reference}` : ""}</div>))}</div></div>
                  ) : null}
                </section>

                <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
                  <h3 className="flex items-center gap-2 text-slate-900"><StickyNote size={17} className="text-amber-600" /> Internal notes</h3>
                  <p className="mt-1 text-[11px] font-semibold text-amber-800">Internal — never shown on customer invoices or emails.</p>
                  <form onSubmit={saveNote} className="mt-3 flex flex-col gap-2 sm:flex-row"><textarea value={note} onChange={(event) => setNote(event.target.value)} className="min-h-20 flex-1 rounded-xl border border-amber-200 bg-white p-3 text-[13px] outline-none" placeholder="Add an internal customer note" /><button disabled={saving || !note.trim()} className="h-11 rounded-xl bg-slate-900 px-4 text-[12px] font-bold text-white disabled:opacity-50">Add note</button></form>
                  <div className="mt-3 space-y-2">{detail.internal_notes.map((item) => <div key={item.id} className="rounded-xl bg-white p-3"><p className="whitespace-pre-wrap text-[13px] text-slate-700">{item.note}</p><p className="mt-1 text-[10px] text-slate-400">{new Date(item.created_at).toLocaleString()}</p></div>)}</div>
                </section>
              </>
            ) : null}
          </section>
        </div>
      ) : null}

      {customerModal ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
          <form onSubmit={(event) => void saveCustomer(event)} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="flex items-center justify-between"><h2 className="text-slate-900">{editingId ? "Edit customer" : "New CRM customer"}</h2><button type="button" onClick={() => setCustomerModal(false)}><X size={18} /></button></div>
            <p className="mt-1 text-[12px] text-slate-500">Name and at least one contact method are required. Email is only required when sending an invoice.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-[11px] font-semibold text-slate-500">Name *<input className={`${fieldClass} mt-1`} value={form.display_name} onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))} required /></label>
              <label className="text-[11px] font-semibold text-slate-500">Legal/company name<input className={`${fieldClass} mt-1`} value={form.legal_name} onChange={(event) => setForm((current) => ({ ...current, legal_name: event.target.value }))} /></label>
              <label className="text-[11px] font-semibold text-slate-500">Email<input className={`${fieldClass} mt-1`} type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
              <label className="text-[11px] font-semibold text-slate-500">Phone<input className={`${fieldClass} mt-1`} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
              <label className="sm:col-span-2 text-[11px] font-semibold text-slate-500">Customer-visible CRM note<textarea className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 bg-[#F8FAFD] p-3 text-[13px] outline-none" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label>
              {!editingId ? (
                <>
                  <p className="sm:col-span-2 mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Optional primary address</p>
                  <label className="sm:col-span-2 text-[11px] font-semibold text-slate-500">
                    Street address
                    <CrmAddressAutocomplete
                      value={form.line1}
                      inputClassName={`${fieldClass} mt-1 pr-10`}
                      onChange={(line1) => setForm((current) => ({ ...current, line1 }))}
                      onSelect={(address: GoogleAddressSelection) => setForm((current) => ({ ...current, ...address }))}
                    />
                  </label>
                  <input className={fieldClass} placeholder="Unit / suite" value={form.unit || form.line2} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value, line2: event.target.value }))} />
                  <input className={fieldClass} placeholder="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
                  <input className={fieldClass} placeholder="Province" value={form.province} onChange={(event) => setForm((current) => ({ ...current, province: event.target.value }))} />
                  <input className={fieldClass} placeholder="Postal code" value={form.postal_code} onChange={(event) => setForm((current) => ({ ...current, postal_code: event.target.value }))} />
                </>
              ) : null}
            </div>
            {duplicates.length ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="flex items-center gap-2 text-[13px] font-bold text-amber-900"><AlertTriangle size={16} /> Possible duplicate customer</p>{duplicates.map((item) => <p key={item.id} className="mt-2 text-[12px] text-amber-800">{item.customer_code ? `#${item.customer_code} · ` : ""}{item.display_name} · {item.email || item.phone}</p>)}<p className="mt-2 text-[11px] text-amber-700">The existing record will not be changed or merged.</p></div> : null}
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setCustomerModal(false)} className="h-10 rounded-xl border px-4 text-[12px] font-bold">Cancel</button>{duplicates.length ? <button type="button" disabled={saving} onClick={() => void saveCustomer(undefined, true)} className="h-10 rounded-xl bg-amber-600 px-4 text-[12px] font-bold text-white">Create separate record</button> : <button type="submit" disabled={saving || !form.display_name.trim() || (!form.email.trim() && !form.phone.trim())} className="h-10 rounded-xl bg-[#4A86F7] px-4 text-[12px] font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save customer"}</button>}</div>
          </form>
        </div>
      ) : null}

      {addressModal && detail ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
          <form onSubmit={saveAddress} className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
            <div className="flex items-center justify-between"><h2 className="text-slate-900">{addressForm.id ? "Edit address" : "Add address"}</h2><button type="button" onClick={() => setAddressModal(false)}><X size={18} /></button></div>
            <p className="mt-1 text-[12px] text-slate-500">Manual entry is always available. Structured Google fields are retained when autocomplete is connected.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className={fieldClass} placeholder="Label (Home, Office...)" value={addressForm.label} onChange={(event) => setAddressForm((current) => ({ ...current, label: event.target.value }))} />
              <input className={fieldClass} placeholder="Unit / suite" value={addressForm.unit} onChange={(event) => setAddressForm((current) => ({ ...current, unit: event.target.value }))} />
              <div className="sm:col-span-2">
                <CrmAddressAutocomplete
                  value={addressForm.line1}
                  inputClassName={`${fieldClass} pr-10`}
                  placeholder="Start typing the street address *"
                  required
                  onChange={(line1) => setAddressForm((current) => ({ ...current, line1 }))}
                  onSelect={(address: GoogleAddressSelection) => setAddressForm((current) => ({ ...current, ...address }))}
                />
              </div>
              <input className={fieldClass} placeholder="City" value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} />
              <input className={fieldClass} placeholder="Province" value={addressForm.province} onChange={(event) => setAddressForm((current) => ({ ...current, province: event.target.value }))} />
              <input className={fieldClass} placeholder="Postal code" value={addressForm.postal_code} onChange={(event) => setAddressForm((current) => ({ ...current, postal_code: event.target.value }))} />
              <input className={fieldClass} placeholder="Country" value={addressForm.country} onChange={(event) => setAddressForm((current) => ({ ...current, country: event.target.value }))} />
              <textarea className="sm:col-span-2 min-h-20 rounded-xl border border-slate-200 bg-[#F8FAFD] p-3 text-[13px] outline-none" placeholder="Access detail (buzzer, parking, entry instructions)" value={addressForm.access_detail} onChange={(event) => setAddressForm((current) => ({ ...current, access_detail: event.target.value }))} />
              <label className="flex items-center gap-2 text-[12px] text-slate-600"><input type="checkbox" checked={addressForm.is_service} onChange={(event) => setAddressForm((current) => ({ ...current, is_service: event.target.checked }))} /> Service address</label>
              <label className="flex items-center gap-2 text-[12px] text-slate-600"><input type="checkbox" checked={addressForm.is_billing} onChange={(event) => setAddressForm((current) => ({ ...current, is_billing: event.target.checked }))} /> Default billing address</label>
            </div>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setAddressModal(false)} className="h-10 rounded-xl border px-4 text-[12px] font-bold">Cancel</button><button disabled={saving} className="h-10 rounded-xl bg-[#4A86F7] px-4 text-[12px] font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save address"}</button></div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
