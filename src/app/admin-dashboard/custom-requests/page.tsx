import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckSquare2,
  ChevronRight,
  Clock3,
  FileImage,
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { serviceTypes } from "@/data/customCleaning";

type ChecklistSection = {
  tasks?: string[];
  notes?: string;
  photo_paths?: string[];
};

type RequestRow = {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  service_types: string[];
  property_details: Record<string, unknown> & { estimate?: EstimatorSnapshot };
  checklist: Record<string, unknown> & {
    selected_tasks?: SelectedTask[];
    photo_paths?: string[];
    priority_order?: string[];
    carpet?: Record<string, unknown>;
    consent?: { terms_accepted?: boolean; accepted_at?: string };
  };
  if_time_allows: string | null;
  additional_notes: string | null;
  preferred_contact: string;
  preferred_date: string | null;
  status: string;
  created_at: string;
};

type SelectedTask = {
  task_id: string;
  category: string;
  label: string;
  minutes_min: number;
  minutes_max: number;
  quantity: number;
  quantity_basis: string;
};

type EstimatorSnapshot = {
  mode: "time" | "price";
  general_minutes_min: number;
  general_minutes_max: number;
  cleaner_count: number;
  onsite_minutes_min: number;
  onsite_minutes_max: number;
  base_price_cents: number;
  general_price_min_cents: number | null;
  general_price_max_cents: number | null;
  carpet_price_cents: number | null;
  subtotal_min_cents: number | null;
  subtotal_max_cents: number | null;
  gst_min_cents: number | null;
  gst_max_cents: number | null;
  total_min_cents: number | null;
  total_max_cents: number | null;
  requires_manual_quote: boolean;
  budget_choice: string;
};

type RangeKey = "24h" | "7d" | "30d" | "all";

const sectionLabels: Record<string, string> = {
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  powder_rooms: "Powder room",
  kitchens: "Kitchen",
  kitchen: "Kitchen",
  basement: "Basement",
  garage: "Garage",
};

const rangeFilters: Array<{
  key: RangeKey;
  label: string;
}> = [
  { key: "24h", label: "Last 24 Hours" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "all", label: "All Requests" },
];

function serviceLabel(id: string) {
  if (id === "professional_cleaning") return "Cleaning estimator";
  return serviceTypes.find((service) => service.id === id)?.name || id;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  return String(value).replaceAll("_", " ");
}

function durationValue(minutes: number | null | undefined) {
  const value = Math.max(0, Number(minutes) || 0);
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${hours ? `${hours} hr` : ""}${hours && mins ? " " : ""}${mins ? `${mins} min` : ""}` || "0 min";
}

function cents(value: number | null | undefined) {
  return typeof value === "number" ? new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value / 100) : "—";
}

function centsRange(min: number | null | undefined, max: number | null | undefined) {
  return min === max ? cents(min) : `${cents(min)} – ${cents(max)}`;
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-blue-100 bg-white p-3"><div className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 text-[11px] font-bold text-[#13263A]">{value}</div></div>;
}

function normalizeRange(value?: string): RangeKey {
  if (value === "24h" || value === "7d" || value === "30d" || value === "all") {
    return value;
  }

  return "7d";
}

function rangeStart(range: RangeKey) {
  if (range === "all") return null;

  const now = new Date();

  if (range === "24h") {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  }

  if (range === "7d") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
}

function requestStatusStyles(status?: string) {
  const value = String(status || "").toLowerCase();

  if (value === "new") {
    return {
      badge: "border-cyan-100 bg-cyan-50 text-cyan-700",
      dot: "bg-cyan-500",
    };
  }

  if (["completed", "resolved", "closed"].includes(value)) {
    return {
      badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    };
  }

  if (["cancelled", "canceled", "rejected"].includes(value)) {
    return {
      badge: "border-rose-100 bg-rose-50 text-rose-700",
      dot: "bg-rose-500",
    };
  }

  return {
    badge: "border-slate-200 bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };
}

function timeAgo(dateValue: string) {
  const created = new Date(dateValue);
  const diff = Date.now() - created.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return created.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: created.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

export default async function CustomRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{
    id?: string;
    range?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  const selectedId = params.id;
  const range = normalizeRange(params.range);
  const searchText = String(params.q || "").trim();

  const supabase = await createClient();

  /*
   * DETAIL VIEW:
   * Fetch the selected record directly from Supabase.
   * This keeps the request real/backend-driven and independent of list filters.
   */
  if (selectedId) {
    const { data: selectedData, error: selectedError } = await supabase
      .from("custom_cleaning_requests")
      .select("*")
      .eq("id", selectedId)
      .maybeSingle();

    const selected = selectedData as RequestRow | null;

    const photoUrls: Record<string, string> = {};

    if (selected) {
      const currentPaths = Array.isArray(selected.checklist?.photo_paths) ? selected.checklist.photo_paths : [];
      const legacyPaths = Object.values(selected.checklist || {}).flatMap((section) => {
        if (!section || Array.isArray(section) || typeof section !== "object") return [];
        const candidate = (section as ChecklistSection).photo_paths;
        return Array.isArray(candidate) ? candidate : [];
      });
      const paths = Array.from(new Set([...currentPaths, ...legacyPaths]));

      await Promise.all(
        paths.map(async (path) => {
          const { data: signed } = await supabase.storage
            .from("custom-cleaning-photos")
            .createSignedUrl(path, 3600);

          if (signed?.signedUrl) {
            photoUrls[path] = signed.signedUrl;
          }
        }),
      );
    }

    return (
      <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1500px]">
          {/* DETAIL TOP BAR */}
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/admin-dashboard/custom-requests?range=${range}${
                  searchText ? `&q=${encodeURIComponent(searchText)}` : ""
                }`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
                aria-label="Back to requests"
              >
                <ArrowLeft size={16} />
              </Link>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#4A86F7]">
                  Customer request
                </p>

                <h1 className="mt-0.5 font-bold text-[#13263A]">
                  Request details
                </h1>
              </div>
            </div>

            <Link
              href={`/admin-dashboard/custom-requests?range=${range}${
                searchText ? `&q=${encodeURIComponent(searchText)}` : ""
              }`}
              className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={14} />
              Back to requests
            </Link>
          </div>

          {selectedError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[11px] font-medium text-red-700">
              Request could not be loaded from Supabase.
            </div>
          )}

          {!selectedError && !selected && (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <CheckSquare2 className="mx-auto text-slate-300" size={32} />
              <h2 className="mt-3 font-bold text-[#13263A]">
                Request not found
              </h2>
              <p className="mt-1 text-slate-500">
                This request may have been removed.
              </p>
            </div>
          )}

          {!selectedError && selected && (
            <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {/* CUSTOMER HEADER */}
              <header className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-[#13263A]">
                        {selected.customer_name}
                      </h2>

                      <span
                        className={`rounded-md border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.05em] ${
                          requestStatusStyles(selected.status).badge
                        }`}
                      >
                        {selected.status}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        Submitted{" "}
                        {new Date(selected.created_at).toLocaleString("en-CA", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {timeAgo(selected.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${selected.phone}`}
                      className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0B4E9B] px-3.5 text-[11px] font-bold text-white transition hover:bg-[#0A65BD]"
                    >
                      <Phone size={15} />
                      Call customer
                    </a>

                    <a
                      href={`mailto:${selected.email}`}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[11px] font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B4E9B]"
                    >
                      <Mail size={15} />
                      Send email
                    </a>
                  </div>
                </div>

                <div className="mt-4 grid overflow-hidden rounded-lg border border-slate-200 bg-[#F8FAFD] sm:grid-cols-2 xl:grid-cols-3">
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex min-w-0 items-center gap-2 border-b border-slate-200 px-3 py-2.5 text-[11px] text-slate-700 transition hover:bg-blue-50 hover:text-[#0B4E9B] sm:border-r xl:border-b-0"
                  >
                    <Phone className="shrink-0 text-slate-400" size={14} />
                    <span className="truncate">{selected.phone}</span>
                  </a>

                  <a
                    href={`mailto:${selected.email}`}
                    className="flex min-w-0 items-center gap-2 border-b border-slate-200 px-3 py-2.5 text-[11px] text-slate-700 transition hover:bg-blue-50 hover:text-[#0B4E9B] xl:border-b-0 xl:border-r"
                  >
                    <Mail className="shrink-0 text-slate-400" size={14} />
                    <span className="truncate">{selected.email}</span>
                  </a>

                  <div className="flex min-w-0 items-start gap-2 px-3 py-2.5 text-[11px] text-slate-700">
                    <MapPin
                      className="mt-0.5 shrink-0 text-slate-400"
                      size={14}
                    />
                    <span className="break-words">{selected.address}</span>
                  </div>
                </div>
              </header>

              <div className="space-y-5 p-5 sm:p-6">
                {selected.property_details.estimate && (() => {
                  const estimate = selected.property_details.estimate;
                  return <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-[#13263A]">Estimator summary</h3><div className="flex gap-2"><span className="rounded-md bg-white px-2 py-1 text-[9px] font-extrabold uppercase text-[#0B4E9B]">{estimate.mode === "price" ? "Time + price" : "Time only"}</span>{estimate.requires_manual_quote && <span className="rounded-md bg-amber-100 px-2 py-1 text-[9px] font-extrabold uppercase text-amber-800">Manual review</span>}</div></div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <SummaryMetric label="General labour" value={`${durationValue(estimate.general_minutes_min)} – ${durationValue(estimate.general_minutes_max)}`} />
                      <SummaryMetric label={`On-site · ${estimate.cleaner_count} cleaner${estimate.cleaner_count === 1 ? "" : "s"}`} value={`${durationValue(estimate.onsite_minutes_min)} – ${durationValue(estimate.onsite_minutes_max)}`} />
                      <SummaryMetric label="General cleaning" value={estimate.mode === "price" ? centsRange(estimate.general_price_min_cents, estimate.general_price_max_cents) : "Price hidden"} />
                      <SummaryMetric label="Estimated total incl. GST" value={estimate.mode === "price" ? centsRange(estimate.total_min_cents, estimate.total_max_cents) : "Quote requested"} />
                    </div>
                    {estimate.mode === "price" && <div className="mt-3 grid gap-2 rounded-lg border border-blue-100 bg-white p-3 text-[10px] text-slate-600 sm:grid-cols-4"><span>Base: <b>{cents(estimate.base_price_cents)}</b></span><span>Carpet: <b>{cents(estimate.carpet_price_cents)}</b></span><span>Subtotal: <b>{centsRange(estimate.subtotal_min_cents, estimate.subtotal_max_cents)}</b></span><span>GST: <b>{centsRange(estimate.gst_min_cents, estimate.gst_max_cents)}</b></span></div>}
                  </section>;
                })()}
                {/* SERVICES */}
                <section>
                  <h3 className="font-bold text-[#13263A]">
                    Service types
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {selected.service_types.map((service) => (
                      <span
                        key={service}
                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-[#0B4E9B]"
                      >
                        {serviceLabel(service)}
                      </span>
                    ))}
                  </div>
                </section>

                {/* PROPERTY */}
                <section>
                  <h3 className="font-bold text-[#13263A]">
                    Property details
                  </h3>

                  <div className="mt-2 grid overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(selected.property_details || {}).filter(([key]) => key !== "estimate").map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="border-b border-r border-slate-200 bg-white p-3"
                        >
                          <div className="text-[9px] font-bold uppercase tracking-[0.04em] text-slate-400">
                            {sectionLabels[key] ||
                              key.replaceAll("_", " ")}
                          </div>

                          <div className="mt-1 text-[11px] font-bold capitalize text-[#263A4D]">
                            {formatValue(value)}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </section>

                {/* CLEANING WORK */}
                <section>
                  <h3 className="font-bold text-[#13263A]">
                    Selected cleaning work
                  </h3>

                  <div className="mt-2 space-y-3">
                    {!!selected.checklist.selected_tasks?.length && Object.entries(
                      selected.checklist.selected_tasks.reduce<Record<string, SelectedTask[]>>((groups, task) => {
                        (groups[task.category] ||= []).push(task); return groups;
                      }, {}),
                    ).map(([category, tasks]) => <div key={category} className="rounded-lg border border-slate-200 bg-white p-3.5"><div className="text-[11px] font-bold capitalize text-[#0B4E9B]">{sectionLabels[category] || category}</div><ul className="mt-2.5 grid gap-2 sm:grid-cols-2">{tasks.map(task => <li key={task.task_id} className="flex items-start gap-2 text-[10px] text-slate-700"><CheckSquare2 className="mt-0.5 shrink-0 text-emerald-600" size={14}/><span>{task.label}<span className="block text-[9px] text-slate-400">Qty {task.quantity} · {task.minutes_min}–{task.minutes_max} min {task.quantity_basis === "item" ? "each" : "base"}</span></span></li>)}</ul></div>)}
                    {Object.entries(selected.checklist || {}).map(
                      ([areaId, rawSection]) => {
                        if (["selected_tasks","photo_paths","priority_order","carpet","consent"].includes(areaId)) return null;
                        if (!rawSection || (typeof rawSection !== "object" && !Array.isArray(rawSection))) return null;
                        const section: ChecklistSection = Array.isArray(
                          rawSection,
                        )
                          ? { tasks: rawSection }
                          : rawSection as ChecklistSection;

                        if (
                          !section.tasks?.length &&
                          !section.notes &&
                          !section.photo_paths?.length
                        ) {
                          return null;
                        }

                        return (
                          <div
                            key={areaId}
                            className="rounded-lg border border-slate-200 bg-white p-3.5"
                          >
                            <div className="text-[11px] font-bold text-[#0B4E9B]">
                              {sectionLabels[areaId] || areaId}
                            </div>

                            {!!section.tasks?.length && (
                              <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                                {section.tasks.map((task) => (
                                  <li
                                    key={task}
                                    className="flex items-start gap-2 text-[10px] text-slate-700"
                                  >
                                    <CheckSquare2
                                      className="mt-0.5 shrink-0 text-emerald-600"
                                      size={14}
                                    />
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {section.notes && (
                              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                                <div className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                                  Customer notes
                                </div>

                                <div className="mt-1 whitespace-pre-wrap text-[10px] leading-relaxed text-slate-700">
                                  {section.notes}
                                </div>
                              </div>
                            )}

                            {!!section.photo_paths?.length && (
                              <div className="mt-3">
                                <div className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                                  Attachments
                                </div>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {section.photo_paths.map((path, index) =>
                                    photoUrls[path] ? (
                                      <a
                                        key={path}
                                        href={photoUrls[path]}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-[#0B4E9B] transition hover:border-blue-300 hover:bg-blue-50"
                                      >
                                        <FileImage size={14} />
                                        Photo {index + 1}
                                      </a>
                                    ) : null,
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                  {!!selected.checklist.priority_order?.length && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-[10px] text-slate-600"><b className="text-[#13263A]">Customer priority:</b> {selected.checklist.priority_order.map(formatValue).join(" → ")}</p>}
                  {!!selected.checklist.photo_paths?.length && <div className="mt-3 flex flex-wrap gap-2">{selected.checklist.photo_paths.map((path,index)=>photoUrls[path]?<a key={path} href={photoUrls[path]} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-[#0B4E9B]"><FileImage size={14}/>Photo {index+1}</a>:null)}</div>}
                </section>

                {/* NOTES */}
                {(selected.if_time_allows || selected.additional_notes) && (
                  <section className="grid gap-3 md:grid-cols-2">
                    {selected.if_time_allows && (
                      <div className="rounded-lg border border-slate-200 bg-[#F8FAFD] p-3.5">
                        <h3 className="font-bold text-[#13263A]">
                          If time allows
                        </h3>

                        <div className="mt-1.5 whitespace-pre-wrap text-[10px] leading-relaxed text-slate-600">
                          {selected.if_time_allows}
                        </div>
                      </div>
                    )}

                    {selected.additional_notes && (
                      <div className="rounded-lg border border-slate-200 bg-[#F8FAFD] p-3.5">
                        <h3 className="font-bold text-[#13263A]">
                          Additional notes
                        </h3>

                        <div className="mt-1.5 whitespace-pre-wrap text-[10px] leading-relaxed text-slate-600">
                          {selected.additional_notes}
                        </div>
                      </div>
                    )}
                  </section>
                )}

                {/* PREFERENCES */}
                <section className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3.5 py-3 text-[10px] text-slate-600 sm:flex-row sm:items-center">
                  <span>
                    <span className="font-bold text-[#13263A]">
                      Preferred contact:
                    </span>{" "}
                    {formatValue(selected.preferred_contact)}
                  </span>

                  {selected.preferred_date && (
                    <>
                      <span className="hidden text-slate-300 sm:inline">
                        |
                      </span>

                      <span>
                        <span className="font-bold text-[#13263A]">
                          Preferred date:
                        </span>{" "}
                        {new Date(
                          `${selected.preferred_date}T00:00:00`,
                        ).toLocaleDateString("en-CA", {
                          dateStyle: "long",
                        })}
                      </span>
                    </>
                  )}
                </section>
              </div>
            </article>
          )}
        </div>
      </div>
    );
  }

  /*
   * LIST VIEW:
   * Build Supabase query from the selected time filter.
   * No mock data is used anywhere on this page.
   */
  let requestsQuery = supabase
    .from("custom_cleaning_requests")
    .select("*")
    .order("created_at", { ascending: false });

  const start = rangeStart(range);

  if (start) {
    requestsQuery = requestsQuery.gte("created_at", start);
  }

  if (searchText) {
    const safeSearch = searchText.replaceAll(",", " ");
    requestsQuery = requestsQuery.or(
      `customer_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,phone.ilike.%${safeSearch}%`,
    );
  }

  const { data, error } = await requestsQuery;

  const requests = (data || []) as RequestRow[];

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
            Customer enquiries
          </p>

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-bold tracking-tight text-[#13263A]">
                Custom cleaning requests
              </h1>

              <p className="mt-1 text-slate-500">
                Review customer submissions and open a request to view full
                details.
              </p>
            </div>

            <div className="flex h-9 w-fit items-center gap-2 rounded-lg bg-blue-50 px-3 text-[10px] font-bold text-[#4A86F7]">
              <Filter size={14} />
              {requests.length} request{requests.length === 1 ? "" : "s"}
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {rangeFilters.map((filter) => {
                const active = range === filter.key;

                return (
                  <Link
                    key={filter.key}
                    href={`/admin-dashboard/custom-requests?range=${filter.key}${
                      searchText
                        ? `&q=${encodeURIComponent(searchText)}`
                        : ""
                    }`}
                    className={`inline-flex h-8 items-center rounded-lg border px-3 text-[10px] font-bold transition ${
                      active
                        ? "border-[#4A86F7] bg-[#4A86F7] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
                    }`}
                  >
                    {filter.label}
                  </Link>
                );
              })}
            </div>

            <form
              action="/admin-dashboard/custom-requests"
              method="get"
              className="flex w-full items-center gap-2 xl:w-auto"
            >
              <input type="hidden" name="range" value={range} />

              <div className="relative w-full xl:w-[300px]">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  name="q"
                  defaultValue={searchText}
                  placeholder="Search customer, email or phone..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] pl-9 pr-3 text-[10px] text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="h-9 rounded-lg bg-[#13263A] px-4 text-[10px] font-bold text-white transition hover:bg-[#1B354D]"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-[11px] font-medium text-red-700 shadow-sm">
            Requests could not be loaded from Supabase.
          </div>
        )}

        {/* EMPTY */}
        {!error && !requests.length && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <CheckSquare2 className="mx-auto text-slate-300" size={32} />

            <h2 className="mt-3 font-bold text-[#13263A]">
              No requests found
            </h2>

            <p className="mt-1 text-slate-500">
              No customer requests match the selected filter.
            </p>
          </div>
        )}

        {/* REQUEST LIST */}
        {!error && !!requests.length && (
          <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* TABLE HEADER - DESKTOP */}
            <div className="hidden grid-cols-[minmax(180px,1.2fr)_minmax(180px,1fr)_minmax(150px,.8fr)_130px_90px_28px] items-center gap-4 border-b border-slate-200 bg-[#F8FAFD] px-4 py-2.5 lg:grid">
              <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                Customer
              </div>

              <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                Request
              </div>

              <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                Contact
              </div>

              <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                Submitted
              </div>

              <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                Status
              </div>

              <div />
            </div>

            <div className="divide-y divide-slate-100">
              {requests.map((request) => {
                const styles = requestStatusStyles(request.status);
                const listEstimate = request.property_details?.estimate;

                const serviceText = listEstimate
                  ? `${listEstimate.mode === "price" ? "Time + price" : "Time only"} · ${durationValue(listEstimate.general_minutes_min)}–${durationValue(listEstimate.general_minutes_max)}${listEstimate.mode === "price" ? ` · ${centsRange(listEstimate.total_min_cents, listEstimate.total_max_cents)}` : ""}`
                  : request.service_types?.length
                  ? request.service_types.map(serviceLabel).join(", ")
                  : "Custom cleaning";

                return (
                  <Link
                    key={request.id}
                    href={`/admin-dashboard/custom-requests?id=${request.id}&range=${range}${
                      searchText
                        ? `&q=${encodeURIComponent(searchText)}`
                        : ""
                    }`}
                    className="group block transition hover:bg-blue-50/50"
                  >
                    {/* DESKTOP ROW */}
                    <div className="hidden grid-cols-[minmax(180px,1.2fr)_minmax(180px,1fr)_minmax(150px,.8fr)_130px_90px_28px] items-center gap-4 px-4 py-3.5 lg:grid">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`}
                        />

                        <div className="min-w-0">
                          <div className="truncate text-[11px] font-bold text-[#13263A]">
                            {request.customer_name}
                          </div>

                          <div className="mt-0.5 truncate text-[9px] text-slate-400">
                            {request.address || "No address provided"}
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-[10px] font-semibold text-slate-700">
                          {serviceText}
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-400">
                          Preferred: {formatValue(request.preferred_contact)}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-[10px] text-slate-700">
                          {request.phone || "No phone"}
                        </div>

                        <div className="mt-0.5 truncate text-[9px] text-slate-400">
                          {request.email || "No email"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-semibold text-slate-700">
                          {new Date(request.created_at).toLocaleDateString(
                            "en-CA",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-400">
                          {timeAgo(request.created_at)}
                        </div>
                      </div>

                      <div>
                        <span
                          className={`inline-flex rounded-md border px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.05em] ${styles.badge}`}
                        >
                          {request.status || "New"}
                        </span>
                      </div>

                      <ChevronRight
                        size={15}
                        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#4A86F7]"
                      />
                    </div>

                    {/* MOBILE/TABLET CARD */}
                    <div className="p-4 lg:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <span
                            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`}
                          />

                          <div className="min-w-0">
                            <div className="truncate text-[12px] font-bold text-[#13263A]">
                              {request.customer_name}
                            </div>

                            <div className="mt-1 truncate text-[10px] text-slate-500">
                              {serviceText}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-md border px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.05em] ${styles.badge}`}
                        >
                          {request.status || "New"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 rounded-lg bg-[#F8FAFD] p-3 sm:grid-cols-3">
                        <div>
                          <div className="text-[8px] font-bold uppercase text-slate-400">
                            Contact
                          </div>
                          <div className="mt-0.5 truncate text-[10px] text-slate-700">
                            {request.phone || request.email || "Not provided"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[8px] font-bold uppercase text-slate-400">
                            Address
                          </div>
                          <div className="mt-0.5 truncate text-[10px] text-slate-700">
                            {request.address || "Not provided"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[8px] font-bold uppercase text-slate-400">
                            Submitted
                          </div>
                          <div className="mt-0.5 text-[10px] text-slate-700">
                            {timeAgo(request.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
