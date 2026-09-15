"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  MapPin,
  Phone,
  Search,
  User,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";

export type BookingRecord = {
  id: string;
  customer_id: string | null;
  cleaner_id: string | null;
  service_name: string | null;
  service_type: string | null;
  date: string | null;
  address: string | null;
  price: string | number | null;
  final_price: string | number | null;
  total_price: string | number | null;
  status: string | null;
  created_at: string;
  payment_method: string | null;
  billing_type: string | null;
  booking_type: string | null;
  customer_name: string;
  customer_phone: string;
  cleaner_name: string;
};

export type CleanerOption = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  approval_status: string | null;
  verified: boolean | null;
  is_online: boolean | null;
  is_available: boolean | null;
  is_working: boolean | null;
  last_available_at: string | null;
  average_rating: string | number | null;
  total_reviews: number | null;
  jobs_completed: number | null;
  address: string;
};

type StatusFilter =
  | "All"
  | "Pending"
  | "Assigned"
  | "Completed"
  | "Cancelled";

type RangeFilter = "24h" | "7d" | "30d" | "all";

const statusTabs: StatusFilter[] = [
  "All",
  "Pending",
  "Assigned",
  "Completed",
  "Cancelled",
];

const rangeTabs: Array<{ key: RangeFilter; label: string }> = [
  { key: "24h", label: "Last 24 Hours" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "all", label: "All Time" },
];

function money(booking: BookingRecord) {
  const value =
    booking.total_price || booking.final_price || booking.price || 0;

  const numeric = Number(value);

  return `CAD $${Number.isFinite(numeric) ? numeric.toFixed(2) : value}`;
}

function shortOrder(id: string) {
  return id.replaceAll("-", "").slice(-8).toUpperCase();
}

function normalizeStatus(status: string | null) {
  return (status || "pending").toLowerCase();
}

function isCancelled(status: string | null) {
  return ["cancelled", "canceled"].includes(normalizeStatus(status));
}

function isCompleted(status: string | null) {
  return ["completed", "complete"].includes(normalizeStatus(status));
}

function isAssigned(status: string | null) {
  return ["assigned", "accepted", "in_progress"].includes(
    normalizeStatus(status),
  );
}

function matchesStatus(
  bookingStatus: string | null,
  filter: StatusFilter,
) {
  if (filter === "All") return true;

  if (filter === "Completed") return isCompleted(bookingStatus);
  if (filter === "Cancelled") return isCancelled(bookingStatus);
  if (filter === "Assigned") return isAssigned(bookingStatus);

  return normalizeStatus(bookingStatus) === "pending";
}

function statusTone(status: string | null) {
  const normalized = normalizeStatus(status);

  if (isCompleted(status)) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (isCancelled(status)) {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }

  if (isAssigned(status)) {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }

  if (normalized === "pending") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function statusDot(status: string | null) {
  if (isCompleted(status)) return "bg-emerald-500";
  if (isCancelled(status)) return "bg-rose-500";
  if (isAssigned(status)) return "bg-blue-500";
  return "bg-amber-500";
}

function cleanerStatus(cleaner: CleanerOption) {
  if (cleaner.is_working) {
    return {
      label: "Working",
      className: "border-blue-100 bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    };
  }

  if (cleaner.is_online || cleaner.is_available) {
    return {
      label: "Available",
      className:
        "border-emerald-100 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    };
  }

  return {
    label: "Offline",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };
}

function rangeStart(range: RangeFilter) {
  if (range === "all") return null;

  const now = Date.now();

  if (range === "24h") {
    return now - 24 * 60 * 60 * 1000;
  }

  if (range === "7d") {
    return now - 7 * 24 * 60 * 60 * 1000;
  }

  return now - 30 * 24 * 60 * 60 * 1000;
}

function timeAgo(value: string) {
  const time = new Date(value).getTime();
  const diff = Date.now() - time;

  const minutes = Math.floor(diff / (60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

export default function BookingsManagement({
  bookings = [],
  cleaners = [],
}: {
  bookings?: BookingRecord[];
  cleaners?: CleanerOption[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [range, setRange] = useState<RangeFilter>("7d");

  const [selectedBooking, setSelectedBooking] =
    useState<BookingRecord | null>(null);

  const [assignmentMode, setAssignmentMode] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const counts = useMemo(() => {
    return {
      all: bookings.length,
      pending: bookings.filter(
        (booking) =>
          normalizeStatus(booking.status) === "pending",
      ).length,
      assigned: bookings.filter((booking) =>
        isAssigned(booking.status),
      ).length,
      completed: bookings.filter((booking) =>
        isCompleted(booking.status),
      ).length,
      cancelled: bookings.filter((booking) =>
        isCancelled(booking.status),
      ).length,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const start = rangeStart(range);
    const lowerQuery = query.trim().toLowerCase();

    return bookings.filter((booking) => {
      const statusMatch = matchesStatus(booking.status, status);

      const createdAt = new Date(booking.created_at).getTime();

      const rangeMatch =
        start === null ||
        (Number.isFinite(createdAt) && createdAt >= start);

      const text = [
        booking.service_name,
        booking.service_type,
        booking.customer_name,
        booking.customer_phone,
        booking.address,
        booking.cleaner_name,
        booking.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const queryMatch =
        !lowerQuery || text.includes(lowerQuery);

      return statusMatch && rangeMatch && queryMatch;
    });
  }, [bookings, query, range, status]);

  const updateBooking = async (
    bookingId: string,
    payload: Record<string, string | null>,
  ) => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bookingId,
          ...payload,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Unable to update booking.");
        return false;
      }

      router.refresh();
      return true;
    } catch {
      setError("Unable to update booking.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openBooking = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setAssignmentMode(false);
    setSelectedCleaner(booking.cleaner_id || "");
    setError("");
  };

  const openAssignment = () => {
    if (!selectedBooking) return;

    setSelectedCleaner(selectedBooking.cleaner_id || "");
    setAssignmentMode(true);
    setError("");
  };

  const confirmAssignment = async () => {
    if (!selectedBooking || !selectedCleaner) return;

    const ok = await updateBooking(selectedBooking.id, {
      cleaner_id: selectedCleaner,
    });

    if (ok) {
      setAssignmentMode(false);
      setSelectedBooking(null);
    }
  };

  const cancelBooking = async (booking: BookingRecord) => {
    const confirmed = window.confirm(
      `Cancel ${booking.service_name || "this booking"}?`,
    );

    if (!confirmed) return;

    const ok = await updateBooking(booking.id, {
      status: "cancelled",
    });

    if (ok) {
      setAssignmentMode(false);
      setSelectedBooking(null);
    }
  };

  if (selectedBooking) {
    const cancelled = isCancelled(selectedBooking.status);

    return (
      <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1500px]">
          {/* DETAIL TOP BAR */}
          <section className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedBooking(null);
                  setAssignmentMode(false);
                  setError("");
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
                aria-label="Back to bookings"
              >
                <ArrowLeft size={16} />
              </button>

              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#4A86F7]">
                  Booking #{shortOrder(selectedBooking.id)}
                </p>

                <h1 className="mt-0.5 font-bold text-[#13263A]">
                  Booking Details
                </h1>
              </div>
            </div>

            <span
              className={`inline-flex w-fit rounded-lg border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.05em] ${statusTone(
                selectedBooking.status,
              )}`}
            >
              {selectedBooking.status || "Pending"}
            </span>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* BOOKING CUSTOMER HEADER */}
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]">
                      <ClipboardList size={17} />
                    </span>

                    <div>
                      <h2 className="font-bold text-[#13263A]">
                        {selectedBooking.service_name ||
                          selectedBooking.service_type ||
                          "Cleaning Service"}
                      </h2>

                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                        <User size={13} />
                        {selectedBooking.customer_name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-left xl:text-right">
                  <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-slate-400">
                    Booking Total
                  </div>

                  <div className="mt-1 text-[20px] font-extrabold text-[#13263A]">
                    {money(selectedBooking)}
                  </div>
                </div>
              </div>

              {/* QUICK DETAILS */}
              <div className="mt-4 grid overflow-hidden rounded-lg border border-slate-200 bg-[#F8FAFD] sm:grid-cols-2 xl:grid-cols-4">
                <div className="border-b border-slate-200 px-3 py-2.5 sm:border-r xl:border-b-0">
                  <div className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-slate-400">
                    Order ID
                  </div>

                  <div className="mt-1 text-[10px] font-bold text-slate-700">
                    {shortOrder(selectedBooking.id)}
                  </div>
                </div>

                <div className="border-b border-slate-200 px-3 py-2.5 xl:border-b-0 xl:border-r">
                  <div className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-slate-400">
                    Created
                  </div>

                  <div className="mt-1 text-[10px] font-bold text-slate-700">
                    {new Date(
                      selectedBooking.created_at,
                    ).toLocaleDateString("en-CA", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="border-b border-slate-200 px-3 py-2.5 sm:border-r xl:border-b-0">
                  <div className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-slate-400">
                    Payment
                  </div>

                  <div className="mt-1 text-[10px] font-bold capitalize text-slate-700">
                    {selectedBooking.payment_method ||
                      selectedBooking.billing_type ||
                      "Not provided"}
                  </div>
                </div>

                <div className="px-3 py-2.5">
                  <div className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-slate-400">
                    Booking Type
                  </div>

                  <div className="mt-1 text-[10px] font-bold capitalize text-slate-700">
                    {selectedBooking.booking_type || "Standard"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
              {/* MAIN DETAILS */}
              <div className="space-y-4 p-5 xl:border-r xl:border-slate-200">
                {/* SCHEDULE */}
                <section className="rounded-lg border border-slate-200 bg-[#F8FAFD] p-3.5">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={15}
                      className="text-[#4A86F7]"
                    />
                    <h3 className="font-bold text-[#13263A]">
                      Schedule
                    </h3>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-[8px] font-extrabold uppercase text-slate-400">
                        Date & Time
                      </div>

                      <div className="mt-1 text-[10px] font-semibold text-slate-700">
                        {selectedBooking.date
                          ? new Date(
                              selectedBooking.date,
                            ).toLocaleString("en-CA", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Not scheduled"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[8px] font-extrabold uppercase text-slate-400">
                        Added
                      </div>

                      <div className="mt-1 text-[10px] font-semibold text-slate-700">
                        {timeAgo(selectedBooking.created_at)}
                      </div>
                    </div>
                  </div>
                </section>

                {/* LOCATION */}
                <section className="rounded-lg border border-slate-200 bg-white p-3.5">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={15}
                      className="text-[#4A86F7]"
                    />
                    <h3 className="font-bold text-[#13263A]">
                      Service Location
                    </h3>
                  </div>

                  <div className="mt-2 text-[10px] leading-relaxed text-slate-600">
                    {selectedBooking.address ||
                      "No address provided"}
                  </div>
                </section>

                {/* CUSTOMER */}
                <section className="rounded-lg border border-slate-200 bg-white p-3.5">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-[#4A86F7]" />
                    <h3 className="font-bold text-[#13263A]">
                      Customer
                    </h3>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-[8px] font-extrabold uppercase text-slate-400">
                        Name
                      </div>

                      <div className="mt-1 text-[10px] font-semibold text-slate-700">
                        {selectedBooking.customer_name}
                      </div>
                    </div>

                    <div>
                      <div className="text-[8px] font-extrabold uppercase text-slate-400">
                        Phone
                      </div>

                      {selectedBooking.customer_phone ? (
                        <a
                          href={`tel:${selectedBooking.customer_phone}`}
                          className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#0B4E9B]"
                        >
                          <Phone size={12} />
                          {selectedBooking.customer_phone}
                        </a>
                      ) : (
                        <div className="mt-1 text-[10px] text-slate-500">
                          Not provided
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* ACTIONS / ASSIGNMENT */}
              <aside className="bg-[#FBFCFE] p-5">
                {!assignmentMode ? (
                  <>
                    <h3 className="font-bold text-[#13263A]">
                      Booking Actions
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Manage cleaner assignment and customer contact.
                    </p>

                    <div className="mt-4 space-y-2.5">
                      {selectedBooking.cleaner_name && (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                          <div className="flex items-center gap-2">
                            <UserCheck
                              size={14}
                              className="text-emerald-600"
                            />

                            <div>
                              <div className="text-[8px] font-extrabold uppercase text-emerald-600">
                                Assigned Cleaner
                              </div>

                              <div className="mt-0.5 text-[10px] font-bold text-emerald-800">
                                {selectedBooking.cleaner_name}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedBooking.customer_phone && (
                        <a
                          href={`tel:${selectedBooking.customer_phone}`}
                          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B4E9B]"
                        >
                          <Phone size={14} />
                          Call Customer
                        </a>
                      )}

                      {!cancelled && (
                        <button
                          type="button"
                          onClick={openAssignment}
                          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#4A86F7] text-[10px] font-bold text-white transition hover:bg-blue-600"
                        >
                          <UserPlus size={14} />
                          {selectedBooking.cleaner_id
                            ? "Change Cleaner"
                            : "Assign Cleaner"}
                        </button>
                      )}

                      {!cancelled && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            cancelBooking(selectedBooking)
                          }
                          className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white text-[10px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          Cancel Booking
                        </button>
                      )}
                    </div>

                    {error && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-[10px] font-medium text-red-700">
                        {error}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#13263A]">
                          Select Cleaner
                        </h3>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Choose a real cleaner account from Supabase.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAssignmentMode(false);
                          setError("");
                        }}
                        className="text-[10px] font-bold text-slate-500 hover:text-[#13263A]"
                      >
                        Cancel
                      </button>
                    </div>

                    {error && (
                      <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-[10px] font-medium text-red-700">
                        {error}
                      </div>
                    )}

                    <div className="mt-4 max-h-[460px] space-y-2 overflow-y-auto pr-1">
                      {cleaners.map((cleaner) => {
                        const state = cleanerStatus(cleaner);
                        const selected =
                          selectedCleaner === cleaner.id;

                        return (
                          <button
                            key={cleaner.id}
                            type="button"
                            onClick={() =>
                              setSelectedCleaner(cleaner.id)
                            }
                            className={`w-full rounded-lg border p-3 text-left transition ${
                              selected
                                ? "border-[#4A86F7] bg-blue-50"
                                : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[12px] font-extrabold text-[#4A86F7]">
                                {cleaner.name
                                  .charAt(0)
                                  .toUpperCase() || "C"}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-[#13263A]">
                                    {cleaner.name}
                                  </span>

                                  <span
                                    className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[7px] font-extrabold uppercase ${state.className}`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${state.dot}`}
                                    />
                                    {state.label}
                                  </span>

                                  {!cleaner.verified && (
                                    <span className="rounded-md border border-rose-100 bg-rose-50 px-1.5 py-0.5 text-[7px] font-extrabold uppercase text-rose-600">
                                      Not Verified
                                    </span>
                                  )}
                                </div>

                                <div className="mt-1 truncate text-[9px] text-slate-500">
                                  {cleaner.email}
                                </div>

                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[8px] text-slate-400">
                                  <span>
                                    Jobs:{" "}
                                    {cleaner.jobs_completed || 0}
                                  </span>

                                  <span>
                                    Rating:{" "}
                                    {cleaner.total_reviews
                                      ? cleaner.average_rating || 0
                                      : "No reviews"}
                                  </span>
                                </div>

                                {cleaner.address && (
                                  <div className="mt-1 truncate text-[8px] text-slate-400">
                                    {cleaner.address}
                                  </div>
                                )}
                              </div>

                              <span
                                className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                  selected
                                    ? "border-[#4A86F7] bg-[#4A86F7]"
                                    : "border-slate-300 bg-white"
                                }`}
                              >
                                {selected && (
                                  <CheckCircle2
                                    size={11}
                                    className="text-white"
                                  />
                                )}
                              </span>
                            </div>
                          </button>
                        );
                      })}

                      {!cleaners.length && (
                        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-[10px] text-slate-500">
                          No cleaner accounts are visible yet.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!selectedCleaner || saving}
                      onClick={confirmAssignment}
                      className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-[#4A86F7] text-[10px] font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {saving
                        ? "Assigning..."
                        : "Confirm Assignment"}
                    </button>
                  </>
                )}
              </aside>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
            Management
          </p>

          <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-bold tracking-tight text-[#13263A]">
                All Bookings
              </h1>

              <p className="mt-1 text-slate-500">
                Review customer bookings, assign cleaners, and manage
                booking status.
              </p>
            </div>

            <div className="inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-blue-50 px-3 text-[10px] font-bold text-[#4A86F7]">
              <ClipboardList size={14} />
              {filtered.length} booking
              {filtered.length === 1 ? "" : "s"}
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: "Total",
              value: counts.all,
              tone: "text-[#13263A]",
            },
            {
              label: "Pending",
              value: counts.pending,
              tone: "text-amber-600",
            },
            {
              label: "Assigned",
              value: counts.assigned,
              tone: "text-blue-600",
            },
            {
              label: "Completed",
              value: counts.completed,
              tone: "text-emerald-600",
            },
            {
              label: "Cancelled",
              value: counts.cancelled,
              tone: "text-rose-600",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                {item.label}
              </div>

              <div
                className={`mt-1 text-[20px] font-extrabold leading-none ${item.tone}`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </section>

        {/* FILTERS */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-[minmax(260px,1fr)_auto]">
            <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3">
              <Search size={14} className="text-slate-400" />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search service, customer, phone, address or order ID..."
                className="min-w-0 flex-1 bg-transparent text-[10px] text-slate-700 outline-none placeholder:text-slate-400"
              />
            </label>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatus(tab)}
                  className={`h-9 whitespace-nowrap rounded-lg border px-3 text-[10px] font-bold transition ${
                    status === tab
                      ? "border-[#4A86F7] bg-[#4A86F7] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {rangeTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRange(tab.key)}
                className={`h-8 rounded-lg px-3 text-[9px] font-bold transition ${
                  range === tab.key
                    ? "bg-[#13263A] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* BOOKINGS LIST */}
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* DESKTOP HEADER */}
          <div className="hidden grid-cols-[minmax(190px,1.25fr)_minmax(150px,.9fr)_minmax(160px,1fr)_140px_110px_80px_28px] items-center gap-4 border-b border-slate-200 bg-[#F8FAFD] px-4 py-2.5 lg:grid">
            {[
              "Booking",
              "Customer",
              "Schedule",
              "Cleaner",
              "Amount",
              "Status",
              "",
            ].map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-100">
            {filtered.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => openBooking(booking)}
                className="group block w-full text-left transition hover:bg-blue-50/50"
              >
                {/* DESKTOP */}
                <div className="hidden grid-cols-[minmax(190px,1.25fr)_minmax(150px,.9fr)_minmax(160px,1fr)_140px_110px_80px_28px] items-center gap-4 px-4 py-3.5 lg:grid">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDot(
                        booking.status,
                      )}`}
                    />

                    <div className="min-w-0">
                      <div className="truncate text-[11px] font-bold text-[#13263A]">
                        {booking.service_name ||
                          booking.service_type ||
                          "Cleaning Service"}
                      </div>

                      <div className="mt-0.5 text-[8px] font-semibold uppercase text-slate-400">
                        #{shortOrder(booking.id)}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-[10px] font-semibold text-slate-700">
                      {booking.customer_name}
                    </div>

                    <div className="mt-0.5 truncate text-[8px] text-slate-400">
                      {booking.customer_phone || "No phone"}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-700">
                      <CalendarDays
                        size={12}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="truncate">
                        {booking.date
                          ? new Date(
                              booking.date,
                            ).toLocaleString("en-CA", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Not scheduled"}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[8px] text-slate-400">
                      <Clock3 size={11} />
                      {timeAgo(booking.created_at)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    {booking.cleaner_name ? (
                      <div className="flex items-center gap-1.5 text-[9px] font-semibold text-emerald-700">
                        <UserCheck size={12} />
                        <span className="truncate">
                          {booking.cleaner_name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-slate-400">
                        Unassigned
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] font-extrabold text-[#13263A]">
                    {money(booking)}
                  </div>

                  <div>
                    <span
                      className={`inline-flex rounded-md border px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.04em] ${statusTone(
                        booking.status,
                      )}`}
                    >
                      {booking.status || "Pending"}
                    </span>
                  </div>

                  <ChevronRight
                    size={15}
                    className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#4A86F7]"
                  />
                </div>

                {/* MOBILE / TABLET */}
                <div className="p-4 lg:hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <span
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${statusDot(
                          booking.status,
                        )}`}
                      />

                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-bold text-[#13263A]">
                          {booking.service_name ||
                            booking.service_type ||
                            "Cleaning Service"}
                        </div>

                        <div className="mt-1 truncate text-[10px] text-slate-500">
                          {booking.customer_name}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-md border px-2 py-1 text-[7px] font-extrabold uppercase ${statusTone(
                        booking.status,
                      )}`}
                    >
                      {booking.status || "Pending"}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 rounded-lg bg-[#F8FAFD] p-3 sm:grid-cols-3">
                    <div>
                      <div className="text-[8px] font-bold uppercase text-slate-400">
                        Schedule
                      </div>

                      <div className="mt-0.5 text-[9px] text-slate-700">
                        {booking.date
                          ? new Date(
                              booking.date,
                            ).toLocaleDateString("en-CA", {
                              month: "short",
                              day: "numeric",
                            })
                          : "Not scheduled"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[8px] font-bold uppercase text-slate-400">
                        Cleaner
                      </div>

                      <div className="mt-0.5 truncate text-[9px] text-slate-700">
                        {booking.cleaner_name || "Unassigned"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[8px] font-bold uppercase text-slate-400">
                        Amount
                      </div>

                      <div className="mt-0.5 text-[9px] font-bold text-slate-700">
                        {money(booking)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {!filtered.length && (
              <div className="px-5 py-14 text-center">
                <ClipboardList
                  size={30}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-3 font-bold text-[#13263A]">
                  No bookings found
                </h2>

                <p className="mt-1 text-slate-500">
                  No bookings match the selected filters.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
