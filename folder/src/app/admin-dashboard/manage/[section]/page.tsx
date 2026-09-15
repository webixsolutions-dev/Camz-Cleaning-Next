import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  FileText,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Config = {
  title: string;
  description: string;
  table: string;
  filter?: {
    column: string;
    value: string;
  };
  preferred: string[];
};

type CustomerMini = {
  id: string;
  name: string | null;
  email: string | null;
};

const sections: Record<string, Config> = {
  bookings: {
    title: "Bookings",
    description: "Review all scheduled and submitted cleaning jobs.",
    table: "jobs",
    preferred: [
      "id",
      "service_name",
      "status",
      "customer_id",
      "cleaner_id",
      "date",
      "address",
      "total_price",
    ],
  },

  customers: {
    title: "Customers",
    description: "Customer accounts registered across the platform.",
    table: "users",
    filter: {
      column: "role",
      value: "customer",
    },
    preferred: [
      "name",
      "email",
      "phone_number",
      "approval_status",
      "is_blocked",
      "created_at",
    ],
  },

  cleaners: {
    title: "Cleaners",
    description: "Cleaner accounts, approval, and availability details.",
    table: "users",
    filter: {
      column: "role",
      value: "cleaner",
    },
    preferred: [
      "name",
      "email",
      "phone_number",
      "approval_status",
      "is_blocked",
      "created_at",
    ],
  },

  payments: {
    title: "Payments",
    description: "Payment transactions and their current status.",
    table: "payments",
    preferred: [
      "id",
      "job_id",
      "customer_id",
      "amount",
      "currency",
      "status",
      "payment_method",
      "created_at",
    ],
  },

  reports: {
    title: "Booking Reports",
    description: "Operational booking data for reporting and analysis.",
    table: "jobs",
    preferred: [
      "id",
      "service_name",
      "status",
      "billing_type",
      "total_price",
      "customer_id",
      "cleaner_id",
      "created_at",
    ],
  },

  services: {
    title: "Services",
    description: "Cleaning services available to customers.",
    table: "services",
    preferred: [
      "id",
      "title",
      "service_type",
      "price",
      "pricing_type",
      "is_active",
      "created_at",
    ],
  },

  users: {
    title: "All Users",
    description: "Customers, cleaners, and administrators.",
    table: "users",
    preferred: [
      "name",
      "email",
      "phone_number",
      "role",
      "approval_status",
      "is_blocked",
    ],
  },

  verification: {
    title: "User Verification",
    description: "Review account approval and verification status.",
    table: "users",
    preferred: [
      "name",
      "email",
      "role",
      "approval_status",
      "is_blocked",
      "created_at",
    ],
  },

  support: {
    title: "Support Tickets",
    description: "Customer issues submitted through the help centre.",
    table: "help_tickets",
    preferred: [
      "id",
      "subject",
      "category",
      "status",
      "user_id",
      "description",
      "created_at",
    ],
  },

  leave: {
    title: "Leave Requests",
    description: "Cleaner leave and availability requests.",
    table: "leave_requests",
    preferred: [
      "id",
      "cleaner_id",
      "start_date",
      "end_date",
      "reason",
      "status",
      "created_at",
    ],
  },

  invoices: {
    title: "Manual Invoices",
    description: "Invoices prepared outside automatic payment flows.",
    table: "manual_invoices",
    preferred: [
      "id",
      "customer_id",
      "service_name",
      "amount",
      "status",
      "due_date",
      "created_at",
      "notes",
    ],
  },

  gallery: {
    title: "Gallery",
    description: "Images displayed in the public project gallery.",
    table: "gallery",
    preferred: ["id", "image_url", "title", "created_at"],
  },

  blogs: {
    title: "Blog",
    description: "Published and draft website articles.",
    table: "blogs",
    preferred: ["id", "title", "description", "image_url", "created_at"],
  },

  "before-after": {
    title: "Before / After",
    description: "Cleaning transformation image pairs.",
    table: "before_after_pairs",
    preferred: [
      "id",
      "before_image_url",
      "after_image_url",
      "title",
      "created_at",
    ],
  },

  settings: {
    title: "App Settings",
    description: "Platform-wide application configuration.",
    table: "app_settings",
    preferred: ["id", "key", "value", "updated_at"],
  },
};

function basicDisplay(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  const text = String(value);

  return text.length > 90
    ? `${text.slice(0, 87)}...`
    : text;
}

function shortId(value: unknown) {
  if (!value) return "-";

  const text = String(value);

  if (text.length <= 12) return text;

  return `${text.slice(0, 8)}…${text.slice(-4)}`;
}

function formatDateValue(value: unknown) {
  if (!value) return "-";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return basicDisplay(value);
  }

  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTimeValue(value: unknown) {
  if (!value) return "-";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return basicDisplay(value);
  }

  return date.toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClass(value: unknown) {
  const status = String(value || "").toLowerCase();

  if (
    ["paid", "completed", "approved", "active", "resolved"].includes(
      status,
    )
  ) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (
    ["pending", "unpaid", "waiting", "processing"].includes(status)
  ) {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (
    ["cancelled", "canceled", "failed", "rejected", "blocked"].includes(
      status,
    )
  ) {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function titleColumn(column: string) {
  if (column === "id") return "Invoice ID";
  if (column === "customer_id") return "Customer";
  if (column === "created_at") return "Created";
  if (column === "due_date") return "Due Date";

  return column.replaceAll("_", " ");
}

function renderCell({
  section,
  column,
  value,
  customerMap,
}: {
  section: string;
  column: string;
  value: unknown;
  customerMap: Map<string, CustomerMini>;
}) {
  if (column === "status") {
    return (
      <span
        className={`inline-flex rounded-md border px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.04em] ${statusClass(
          value,
        )}`}
      >
        {basicDisplay(value)}
      </span>
    );
  }

  if (
    column === "created_at" ||
    column === "updated_at"
  ) {
    return formatDateTimeValue(value);
  }

  if (
    column === "due_date" ||
    column === "date" ||
    column === "start_date" ||
    column === "end_date"
  ) {
    return formatDateValue(value);
  }

  if (
    column === "amount" ||
    column === "price" ||
    column === "total_price"
  ) {
    const numeric = Number(value);

    if (Number.isFinite(numeric)) {
      return (
        <span className="font-extrabold text-[#13263A]">
          CAD ${numeric.toFixed(2)}
        </span>
      );
    }
  }

  if (section === "invoices" && column === "customer_id") {
    const customer = customerMap.get(String(value || ""));

    if (customer) {
      return (
        <div className="min-w-0">
          <div className="truncate font-bold text-[#13263A]">
            {customer.name || "Unnamed customer"}
          </div>

          <div className="mt-0.5 truncate text-[8px] text-slate-400">
            {customer.email || shortId(value)}
          </div>
        </div>
      );
    }

    return shortId(value);
  }

  if (
    column === "id" ||
    column.endsWith("_id")
  ) {
    return shortId(value);
  }

  return basicDisplay(value);
}

export default async function AdminManagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { section } = await params;
  const { q = "" } = await searchParams;

  const config = sections[section];

  if (!config) {
    notFound();
  }

  const supabase = await createClient();

  let query = supabase
    .from(config.table)
    .select("*")
    .limit(200);

  if (config.filter) {
    query = query.eq(
      config.filter.column,
      config.filter.value,
    );
  }

  const [{ data, error }, customersResult] =
    await Promise.all([
      query,

      section === "invoices"
        ? supabase
            .from("users")
            .select("id, name, email")
            .eq("role", "customer")
        : Promise.resolve({
            data: [] as CustomerMini[],
            error: null,
          }),
    ]);

  const customerMap = new Map<string, CustomerMini>();

  for (const customer of
    (customersResult.data || []) as CustomerMini[]) {
    customerMap.set(customer.id, customer);
  }

  const records = (
    (data || []) as Record<string, unknown>[]
  ).filter((record) => {
    if (!q) return true;

    const queryText = q.toLowerCase();

    const recordMatch = Object.values(record).some(
      (value) =>
        basicDisplay(value)
          .toLowerCase()
          .includes(queryText),
    );

    if (recordMatch) return true;

    if (section === "invoices") {
      const customer = customerMap.get(
        String(record.customer_id || ""),
      );

      return `${customer?.name || ""} ${
        customer?.email || ""
      }`
        .toLowerCase()
        .includes(queryText);
    }

    return false;
  });

  const available = new Set(
    records.flatMap((record) =>
      Object.keys(record),
    ),
  );

  const columns = [
    ...config.preferred.filter((column) =>
      available.has(column),
    ),

    ...Array.from(available).filter(
      (column) =>
        !config.preferred.includes(column),
    ),
  ].slice(0, 8);

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
                Management
              </p>

              <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">
                {config.title}
              </h1>

              <p className="mt-1 text-slate-500">
                {config.description}
              </p>
            </div>

            {section === "invoices" && (
              <div className="inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-blue-50 px-3 text-[10px] font-bold text-[#4A86F7]">
                <FileText size={14} />
                {records.length} invoice
                {records.length === 1 ? "" : "s"}
              </div>
            )}
          </div>
        </section>

        {/* SEARCH */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <form className="flex items-center gap-2">
            <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 focus-within:border-blue-300 focus-within:bg-white">
              <Search
                size={14}
                className="shrink-0 text-slate-400"
              />

              <input
                name="q"
                defaultValue={q}
                placeholder={
                  section === "invoices"
                    ? "Search invoice, customer, service or status..."
                    : "Search records..."
                }
                className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <button
              type="submit"
              className="h-9 rounded-lg bg-[#13263A] px-4 text-[10px] font-bold text-white transition hover:bg-[#1B354D]"
            >
              Search
            </button>
          </form>
        </section>

        {/* TABLE */}
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h2 className="font-bold text-[#13263A]">
                {records.length} record
                {records.length === 1 ? "" : "s"}
              </h2>

              <p className="mt-0.5 text-slate-500">
                Showing up to 200 records
              </p>
            </div>
          </div>

          {error ? (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[10px] text-red-700">
              <p className="font-bold">
                Unable to read {config.table}.
              </p>
              <p className="mt-1">
                Apply the admin dashboard RLS migration, then refresh.
              </p>
            </div>
          ) : !records.length ? (
            <p className="px-5 py-12 text-center text-[10px] text-slate-400">
              No visible records in this table.
            </p>
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-[#F8FAFD]">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="whitespace-nowrap border-b border-slate-200 px-2.5 py-2.5 text-[8px] font-extrabold uppercase tracking-[0.06em] text-slate-400"
                        >
                          {titleColumn(column)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {records.map((record, index) => (
                      <tr
                        key={String(record.id || index)}
                        className="transition hover:bg-blue-50/40"
                      >
                        {columns.map((column) => (
                          <td
                            key={column}
                            className="max-w-[210px] px-2.5 py-2.5 align-middle text-[9px] leading-4 text-slate-600"
                          >
                            <div className="line-clamp-2 break-words">
                              {renderCell({
                                section,
                                column,
                                value: record[column],
                                customerMap,
                              })}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-slate-100 md:hidden">
                {records.map((record, index) => (
                  <div
                    key={String(record.id || index)}
                    className="p-4"
                  >
                    <div className="space-y-2">
                      {columns
                        .slice(0, 6)
                        .map((column) => (
                          <div
                            key={column}
                            className="grid grid-cols-[90px_1fr] gap-2 text-[9px]"
                          >
                            <span className="font-bold capitalize text-slate-400">
                              {titleColumn(column)}
                            </span>

                            <span className="min-w-0 break-words text-slate-700">
                              {renderCell({
                                section,
                                column,
                                value: record[column],
                                customerMap,
                              })}
                            </span>
                          </div>
                        ))}
                    </div>

                    {typeof record.image_url ===
                      "string" && (
                      <Link
                        href={record.image_url}
                        target="_blank"
                        className="mt-3 inline-flex items-center gap-1 text-[9px] font-bold text-[#4A86F7]"
                      >
                        Open image
                        <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
