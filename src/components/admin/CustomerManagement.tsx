"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";

export type CustomerRecord = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  source: string | null;
  created_at: string;
  is_blocked: boolean;
  address: string;
};

type FormState = {
  id?: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  source: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone_number: "",
  address: "",
  source: "Manual",
};

const sources = ["Manual", "Google", "Facebook", "Referral", "Other"];

const fieldClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] pl-9 pr-3 text-[10px] font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white";

function sourceBadge(source?: string | null) {
  const value = String(source || "Unknown").toLowerCase();

  if (value === "web") {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }

  if (value === "app") {
    return "border-violet-100 bg-violet-50 text-violet-700";
  }

  if (value === "google") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (value === "facebook") {
    return "border-indigo-100 bg-indigo-50 text-indigo-700";
  }

  if (value === "referral") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (value === "manual") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CustomerManagement({
  customers = [],
}: {
  customers?: CustomerRecord[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [source, setSource] = useState("All");
  const [date, setDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      customers.filter((customer) => {
        const text = `${customer.name} ${customer.email} ${
          customer.phone_number || ""
        } ${customer.address || ""}`.toLowerCase();

        const textMatch =
          !query.trim() || text.includes(query.trim().toLowerCase());

        const sourceMatch =
          source === "All" ||
          (customer.source || "Unknown").toLowerCase() === source.toLowerCase();

        const dateMatch =
          !date || customer.created_at.slice(0, 10) === date;

        return textMatch && sourceMatch && dateMatch;
      }),
    [customers, query, source, date],
  );

  const activeCustomers = customers.filter(
    (customer) => !customer.is_blocked,
  ).length;

  const blockedCustomers = customers.filter(
    (customer) => customer.is_blocked,
  ).length;

  const webCustomers = customers.filter(
    (customer) => (customer.source || "").toLowerCase() === "web",
  ).length;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (customer: CustomerRecord) => {
    setForm({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone_number: customer.phone_number || "",
      address: customer.address,
      source: customer.source || "Manual",
    });

    setError("");
    setModalOpen(true);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/customers", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok && response.status !== 207) {
        setError(result.error || "Unable to save customer.");
        return;
      }

      setModalOpen(false);
      router.refresh();
    } catch {
      setError("Unable to save customer.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (customer: CustomerRecord) => {
    if (
      !window.confirm(
        `Delete ${customer.name}? This also removes their login account.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/customers?id=${customer.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        window.alert(result.error || "Unable to delete customer.");
        return;
      }

      router.refresh();
    } catch {
      window.alert("Unable to delete customer.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
                Management
              </p>

              <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">
                Customer Management
              </h1>

              <p className="mt-1 text-slate-500">
                View customer accounts, create manual customers, and prepare
                invoices.
              </p>
            </div>

            <button
              type="button"
              onClick={openAdd}
              className="inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-[#4A86F7] px-3.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-600"
            >
              <Plus size={14} />
              Add Customer
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Customers"
            value={customers.length}
            tone="text-[#13263A]"
          />

          <StatCard
            label="Active"
            value={activeCustomers}
            tone="text-emerald-600"
          />

          <StatCard
            label="Blocked"
            value={blockedCustomers}
            tone="text-rose-600"
          />

          <StatCard
            label="Web Customers"
            value={webCustomers}
            tone="text-blue-600"
          />
        </section>

        {/* FILTERS */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_170px_auto]">
            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 transition focus-within:border-blue-300 focus-within:bg-white">
              <Search size={14} className="text-slate-400" />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer, email, phone or address..."
                className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
            >
              <option>All</option>
              {sources.map((item) => (
                <option key={item}>{item}</option>
              ))}
              <option>App</option>
              <option>Web</option>
            </select>

            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3">
              <CalendarDays size={14} className="text-slate-400" />

              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-700 outline-none"
              />
            </label>

            <button
              type="button"
              aria-label="Reset filters"
              onClick={() => {
                setQuery("");
                setSource("All");
                setDate("");
              }}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={14} />
              <span className="lg:hidden xl:inline">Reset</span>
            </button>
          </div>
        </section>

        {/* CUSTOMER LIST */}
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-[#13263A]">
                Customers
              </h2>

              <p className="mt-0.5 text-slate-500">
                {filtered.length} customer
                {filtered.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full table-fixed text-left">
              <thead className="bg-[#F8FAFD]">
                <tr>
                  {[
                    "Customer",
                    "Contact",
                    "Source",
                    "Address",
                    "Joined",
                    "Status",
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      className={`border-b border-slate-200 px-2 py-2.5 text-[8px] font-extrabold uppercase tracking-[0.06em] text-slate-400 ${
                        head === "Customer"
                          ? "w-[27%]"
                          : head === "Contact"
                            ? "w-[14%]"
                            : head === "Source"
                              ? "w-[10%]"
                              : head === "Address"
                                ? "w-[15%]"
                                : head === "Joined"
                                  ? "w-[11%]"
                                  : head === "Status"
                                    ? "w-[9%]"
                                    : "w-[14%]"
                      }`}
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition hover:bg-blue-50/40"
                  >
                    <td className="px-2 py-2.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-extrabold text-[#4A86F7]">
                          {customer.name?.charAt(0).toUpperCase() || "C"}
                        </span>

                        <div className="min-w-0">
                          <div className="truncate text-[10px] font-bold text-[#13263A]">
                            {customer.name}
                          </div>

                          <div className="mt-0.5 truncate text-[8px] text-slate-400">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-2.5">
                      {customer.phone_number ? (
                        <a
                          href={`tel:${customer.phone_number}`}
                          className="inline-flex items-center gap-1.5 text-[9px] text-slate-600 hover:text-[#4A86F7]"
                        >
                          <Phone size={11} />
                          <span className="truncate">
                            {customer.phone_number}
                          </span>
                        </a>
                      ) : (
                        <span className="text-[9px] text-slate-400">
                          No phone
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-2.5">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.04em] ${sourceBadge(
                          customer.source,
                        )}`}
                      >
                        {customer.source || "Unknown"}
                      </span>
                    </td>

                    <td className="px-2 py-2.5">
                      <div className="max-w-[220px] truncate text-[9px] text-slate-600">
                        {customer.address || "Not provided"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-2 py-2.5 text-[9px] text-slate-600">
                      {formatDate(customer.created_at)}
                    </td>

                    <td className="px-2 py-2.5">
                      <span
                        className={`inline-flex rounded-md border px-2 py-1 text-[7px] font-extrabold uppercase ${
                          customer.is_blocked
                            ? "border-rose-100 bg-rose-50 text-rose-700"
                            : "border-emerald-100 bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {customer.is_blocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-1.5 py-2.5">
                      <div className="flex flex-nowrap items-center justify-start gap-0.5">
                        <a
                          href={`/admin-dashboard/manage/invoices?customer=${customer.id}`}
                          className="inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-md bg-[#4A86F7] px-1.5 text-[7px] font-bold text-white transition hover:bg-blue-600"
                        >
                          <FileText size={10} />
                          Invoice
                        </a>

                        <button
                          type="button"
                          aria-label={`Edit ${customer.name}`}
                          onClick={() => openEdit(customer)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-amber-100 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                        >
                          <Pencil size={11} />
                        </button>

                        <button
                          type="button"
                          aria-label={`Delete ${customer.name}`}
                          onClick={() => remove(customer)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-rose-100 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!filtered.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-12 text-center text-[10px] text-slate-400"
                    >
                      No customers match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE/TABLET */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {filtered.map((customer) => (
              <article key={customer.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-extrabold text-[#4A86F7]">
                      {customer.name?.charAt(0).toUpperCase() || "C"}
                    </span>

                    <div className="min-w-0">
                      <h3 className="truncate text-[11px] font-bold text-[#13263A]">
                        {customer.name}
                      </h3>

                      <a
                        href={`mailto:${customer.email}`}
                        className="mt-0.5 block truncate text-[9px] text-slate-500"
                      >
                        {customer.email}
                      </a>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-md border px-2 py-1 text-[7px] font-extrabold uppercase ${sourceBadge(
                      customer.source,
                    )}`}
                  >
                    {customer.source || "Unknown"}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 rounded-lg bg-[#F8FAFD] p-3 sm:grid-cols-3">
                  <div>
                    <div className="text-[8px] font-bold uppercase text-slate-400">
                      Phone
                    </div>
                    <div className="mt-0.5 truncate text-[9px] text-slate-700">
                      {customer.phone_number || "Not provided"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[8px] font-bold uppercase text-slate-400">
                      Joined
                    </div>
                    <div className="mt-0.5 text-[9px] text-slate-700">
                      {formatDate(customer.created_at)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[8px] font-bold uppercase text-slate-400">
                      Status
                    </div>
                    <div
                      className={`mt-0.5 text-[9px] font-bold ${
                        customer.is_blocked
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {customer.is_blocked ? "Blocked" : "Active"}
                    </div>
                  </div>
                </div>

                {customer.address && (
                  <div className="mt-2 flex items-start gap-1.5 text-[9px] text-slate-500">
                    <MapPin
                      size={11}
                      className="mt-0.5 shrink-0"
                    />
                    <span>{customer.address}</span>
                  </div>
                )}

                <div className="mt-3 flex gap-1.5">
                  <a
                    href={`/admin-dashboard/manage/invoices?customer=${customer.id}`}
                    className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#4A86F7] text-[9px] font-bold text-white"
                  >
                    <FileText size={11} />
                    Create Invoice
                  </a>

                  <button
                    type="button"
                    onClick={() => openEdit(customer)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"
                  >
                    <Pencil size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(customer)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600"
                  >
                    <Trash2 size={12} />
                  </button>

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                    <ChevronRight size={14} />
                  </span>
                </div>
              </article>
            ))}

            {!filtered.length && (
              <div className="px-5 py-12 text-center">
                <Users size={28} className="mx-auto text-slate-300" />
                <p className="mt-2 text-[10px] text-slate-400">
                  No customers match these filters.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 sm:items-center sm:p-5"
          onMouseDown={(event) =>
            event.target === event.currentTarget && setModalOpen(false)
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">
                  Customer
                </p>

                <h2
                  id="customer-modal-title"
                  className="mt-1 font-bold text-[#13263A]"
                >
                  {form.id ? "Edit Customer" : "Add New Customer"}
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close customer form"
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
              >
                <X size={15} />
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-[10px] font-medium text-red-700"
              >
                {error}
              </p>
            )}

            <form onSubmit={submit} className="mt-4 space-y-3">
              <ModalField
                label="Full Name"
                icon={User}
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
                placeholder="John Doe"
              />

              <ModalField
                label="Email Address"
                icon={Mail}
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
                placeholder="john@example.com"
                type="email"
              />

              <ModalField
                label="Phone Number"
                icon={Phone}
                value={form.phone_number}
                onChange={(value) =>
                  setForm({ ...form, phone_number: value })
                }
                placeholder="+1 234 567 890"
                type="tel"
              />

              <ModalField
                label="Address"
                icon={MapPin}
                value={form.address}
                onChange={(value) => setForm({ ...form, address: value })}
                placeholder="123 Main St, Calgary"
              />

              <div>
                <label className="mb-1.5 block text-[9px] font-bold text-slate-600">
                  Acquisition Source
                </label>

                <select
                  value={form.source}
                  onChange={(event) =>
                    setForm({ ...form, source: event.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-medium text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
                >
                  {sources.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 flex h-10 w-full items-center justify-center rounded-lg bg-[#4A86F7] text-[10px] font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : form.id
                    ? "Update Customer"
                    : "Save Customer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </div>

      <div className={`mt-1 text-[20px] font-extrabold leading-none ${tone}`}>
        {value}
      </div>
    </div>
  );
}

function ModalField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  icon: typeof User;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[9px] font-bold text-slate-600">
        {label}
      </label>

      <div className="relative">
        <Icon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          size={14}
        />

        <input
          required
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={fieldClass}
        />
      </div>
    </div>
  );
}
