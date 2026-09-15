"use client";

/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, Check, CheckCircle2, Clock3, ClipboardList, DollarSign, Download, Eye, Lock, Mail, MapPin, Pencil, Phone, Plus, Search, ShieldCheck, Sparkles, Trash2, UserPlus, UsersRound, UserRound, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { optimizeImageForUpload, uploadImageToBucket } from "@/lib/images/upload";
import { labelRole } from "@/components/admin/users/userUiHelpers";

export type CleanerUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  role_key?: string;
  role_label?: string;
};

export type BookingRoleDefinition = {
  key: string;
  name: string;
  base_role: "admin" | "cleaner" | "data_entry";
  is_system: boolean;
  created_at?: string | null;
};

export type PortalUser = {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  role: string;
  booking_role_key?: string | null;
  role_label?: string | null;
  approval_status: string | null;
  source: string | null;
  is_blocked: boolean | null;
  verified: boolean | null;
  is_online: boolean | null;
  is_available: boolean | null;
  is_working: boolean | null;
  offering_fixed?: boolean | null;
  offering_hourly?: boolean | null;
  hourly_rate?: string | number | null;
  created_at: string;
};
export type BookingImage = {
  id: string;
  booking_id: string;
  image_type: "before" | "after";
  url: string;
  storage_path: string | null;
  name: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  uploaded_at: string;
};
export type BookingRecord = {
  id: string;
  full_name: string;
  cleaning_type: string;
  area: string;
  focus_details: string | null;
  service_date: string;
  service_time: string;
  full_address: string;
  price: string | number;
  show_price_to_cleaner: boolean;
  use_manpower_time: boolean;
  manpower_min_hours: string | number | null;
  manpower_max_hours: string | number | null;
  email: string;
  phone: string;
  added_by: string | null;
  added_by_user: string | null;
  scope_of_work: string | null;
  parking_instructions: string | null;
  status: "pending" | "ongoing" | "completed";
  start_date: string | null;
  start_time: string | null;
  end_date: string | null;
  end_time: string | null;
  completion_remarks: string | null;
  completed_by: string | null;
  worked_hours: string | number;
  hours_approved: boolean;
  approved_hours: string | number;
  created_at: string;
  updated_at: string;
  assigned_cleaners: CleanerUser[];
  service_images: BookingImage[];
};

type CurrentUser = { id: string; name: string; role: string } | null;
type FormState = Omit<BookingRecord, "id" | "created_at" | "updated_at" | "assigned_cleaners" | "service_images" | "added_by_user"> & { id?: string; assigned_cleaner_ids: string[] };

const areas = ["NE Calgary", "SE Calgary", "NW Calgary", "SW Calgary", "Downtown", "Other area in Calgary"];
const cleaningTypeOptions = ["Standard Cleaning", "Deep Cleaning", "Move Out / Move In"];
const emptyForm: FormState = {
  full_name: "", cleaning_type: "", area: "", focus_details: "", service_date: "", service_time: "", full_address: "", price: "", show_price_to_cleaner: false,
  use_manpower_time: false, manpower_min_hours: "", manpower_max_hours: "",
  email: "", phone: "", added_by: "", scope_of_work: "", parking_instructions: "", status: "pending", start_date: "", start_time: "", end_date: "", end_time: "",
  completion_remarks: "", completed_by: null, worked_hours: 0, hours_approved: false, approved_hours: 0, assigned_cleaner_ids: [],
};

export default function BookingRecordsPortal({ bookings, cleaners, assignedUsers, roleDefinitions, currentUser }: { bookings: BookingRecord[]; cleaners: CleanerUser[]; assignedUsers: PortalUser[]; roleDefinitions: BookingRoleDefinition[]; currentUser: CurrentUser }) {
  const router = useRouter();
  const [records, setRecords] = useState(bookings);
  useEffect(() => {
    setRecords(bookings);
  }, [bookings]);

  const [users, setUsers] = useState(assignedUsers);
  useEffect(() => {
    setUsers(assignedUsers);
  }, [assignedUsers]);
  const role = currentUser?.role?.toLowerCase() || "admin";
  const isCleaner = role === "cleaner";
  const isDataEntry = role === "data_entry";
  const canCreate = role === "admin" || isDataEntry;
  const canEdit = role === "admin";
  const canAssign = role === "admin";
  const canDelete = role === "admin";
  const canManageUsers = role === "admin";
  const ownBookings = useMemo(() => {
    if (isCleaner) return records.filter((booking) => booking.assigned_cleaners.some((cleaner) => cleaner.id === currentUser?.id));
    if (isDataEntry) return records.filter((booking) => booking.added_by_user === currentUser?.id);
    return records;
  }, [records, currentUser?.id, isCleaner, isDataEntry]);
  // Cleaners must only see bookings assigned to themselves.
  // Admins keep access to all bookings; Data Entry keeps its own records.
  const scopedBookings = isCleaner ? ownBookings : records;

  const [query, setQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [quickFilter, setQuickFilter] = useState("all");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateInput(new Date()));
  const [formOpen, setFormOpen] = useState(false);
  const [details, setDetails] = useState<BookingRecord | null>(null);
  const [assigning, setAssigning] = useState<BookingRecord | null>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm, added_by: currentUser?.name || "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [manageUsersOpen, setManageUsersOpen] = useState(false);

  const filtered = useMemo(() => scopedBookings.filter((booking) => {
    const today = toDateInput(new Date());
    const textMatch = !query || `${booking.full_name} ${booking.cleaning_type} ${booking.email} ${booking.phone}`.toLowerCase().includes(query.toLowerCase());
    const areaMatch = areaFilter === "all" || booking.area === areaFilter;
    const dateMatch = quickFilter === "all" || (quickFilter === "my" && ownBookings.some((ownBooking) => ownBooking.id === booking.id)) || (quickFilter === "today" && booking.service_date === today) || (quickFilter === "past" && booking.service_date < today) || (quickFilter === "upcoming" && booking.service_date > today);
    return textMatch && areaMatch && dateMatch;
  }), [areaFilter, ownBookings, query, quickFilter, scopedBookings]);

  const stats = useMemo(() => {
    const today = toDateInput(new Date());
    const statsBookings = isCleaner || isDataEntry ? ownBookings : scopedBookings;
    return {
      total: statsBookings.length,
      allTotal: scopedBookings.length,
      pending: statsBookings.filter((booking) => booking.status === "pending").length,
      completed: statsBookings.filter((booking) => booking.status === "completed").length,
      upcoming: statsBookings.filter((booking) => booking.service_date > today).length,
      todayCount: statsBookings.filter((booking) => booking.service_date === today).length,
      todayHours: statsBookings.filter((booking) => booking.service_date === today).reduce((sum, booking) => sum + Number(booking.approved_hours || 0), 0),
      weekHours: statsBookings.reduce((sum, booking) => sum + (isDateInCurrentWeek(booking.service_date) ? Number(booking.approved_hours || 0) : 0), 0),
      monthHours: statsBookings.reduce((sum, booking) => sum + (isDateInCurrentMonth(booking.service_date) ? Number(booking.approved_hours || 0) : 0), 0),
    };
  }, [isCleaner, isDataEntry, ownBookings, scopedBookings]);

  const selectedDayBookings = scopedBookings.filter((booking) => booking.service_date === selectedDate);
  const quickFilters = [["today", "Today"], ["past", "Past"], ["upcoming", "Upcoming"], ["all", "All Bookings"], ...((isCleaner || isDataEntry) ? [["my", "My Bookings"]] : [])];
  const theme = isCleaner
    ? { page: "bg-[radial-gradient(circle_at_top_left,#d1fae5,transparent_32%),#ecfdf5]", hero: "from-emerald-800 via-teal-700 to-cyan-500", active: "bg-emerald-700", accent: "text-emerald-700", button: "bg-teal-700", soft: "bg-emerald-100 text-emerald-800", stat: "text-emerald-700" }
    : isDataEntry
      ? { page: "bg-[radial-gradient(circle_at_top_left,#ffedd5,transparent_32%),#fff7ed]", hero: "from-orange-700 via-orange-600 to-amber-400", active: "bg-orange-600", accent: "text-orange-600", button: "bg-orange-600", soft: "bg-orange-100 text-orange-800", stat: "text-orange-600" }
      : { page: "bg-slate-100", hero: "from-blue-800 via-blue-700 to-cyan-500", active: "bg-blue-700", accent: "text-blue-700", button: "bg-blue-700", soft: "bg-blue-100 text-blue-800", stat: "text-blue-700" };

  const openAdd = (serviceDate = "") => { setForm({ ...emptyForm, service_date: serviceDate, added_by: currentUser?.name || "" }); setError(""); setFormOpen(true); };
  const openEdit = (booking: BookingRecord) => { setForm({ ...booking, assigned_cleaner_ids: booking.assigned_cleaners.map((cleaner) => cleaner.id) }); setError(""); setFormOpen(true); };
  const saveBooking = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.id && form.service_date && form.service_date < todayInBusinessTz()) {
      setError("Service date cannot be in the past.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/booking-records", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Camz-Request": "booking-record",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiError = String(result?.error || "");
        if (apiError.toLowerCase().includes("password")) {
          setError(
            "Booking API route mismatch detected. Replace src/app/api/admin/booking-records/route.ts with the file included in this fix, clear .next, and restart the app.",
          );
        } else {
          setError(apiError || "Unable to save booking.");
        }
        return;
      }

      if (!form.id && result.booking) {
        const assigned_cleaners = cleaners.filter((cleaner) =>
          form.assigned_cleaner_ids.includes(cleaner.id),
        );
        setRecords((current) => [
          {
            ...result.booking,
            assigned_cleaners,
            service_images: [],
          } as BookingRecord,
          ...current,
        ]);
        setQuickFilter("all");
        setAreaFilter("all");
        setQuery("");
        setSelectedDate(result.booking.service_date || form.service_date);
      } else if (form.id) {
        const assigned_cleaners = cleaners.filter((cleaner) =>
          form.assigned_cleaner_ids.includes(cleaner.id),
        );
        setRecords((current) =>
          current.map((booking) =>
            booking.id === form.id
              ? ({ ...booking, ...form, assigned_cleaners } as BookingRecord)
              : booking,
          ),
        );
      }

      setFormOpen(false);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to connect to the booking API.",
      );
    } finally {
      setSaving(false);
    }
  };
  const deleteBooking = async (booking: BookingRecord) => {
    if (!window.confirm(`Delete booking for ${booking.full_name}?`)) return;
    const response = await fetch(`/api/admin/booking-records?id=${booking.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) window.alert(result.error || "Unable to delete booking."); else router.refresh();
  };

  if (formOpen && canCreate) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1500px]">
          <BookingFormPanel
            form={form}
            setForm={setForm}
            cleaners={cleaners}
            saving={saving}
            error={error}
            onClose={() => {
              setFormOpen(false);
              setError("");
            }}
            onSubmit={saveBooking}
            currentUser={currentUser}
          />
        </div>
      </div>
    );
  }

  if (manageUsersOpen && canManageUsers) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1500px]">
          <ManageUsersPanel
            users={users}
            roleDefinitions={roleDefinitions}
            currentUser={currentUser}
            onClose={() => setManageUsersOpen(false)}
            onChanged={() => router.refresh()}
            onUsersChange={(updater) => setUsers((current) => updater(current))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* PAGE HEADER */}
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
                {isCleaner
                  ? "Cleaner Calendar"
                  : isDataEntry
                    ? "Data Entry Calendar"
                    : "Admin Calendar"}
              </p>

              <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">
                {isCleaner ? "My Booking Calendar" : "Booking Records"}
              </h1>

              <p className="mt-1 max-w-2xl text-slate-500">
                {isCleaner
                  ? "View assigned bookings, schedules, progress and service details."
                  : isDataEntry
                    ? `Logged in as ${currentUser?.name || "Data Entry User"}. Add and maintain booking records.`
                    : "Manage booking records, schedules, assignments and operations."}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                  {stats.allTotal} visible
                </span>
                <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
                  {stats.pending} pending
                </span>
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-[9px] font-bold text-blue-700">
                  {stats.upcoming} upcoming
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canManageUsers && (
                <button
                  type="button"
                  onClick={() => setManageUsersOpen(true)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
                >
                  <UsersRound size={14} />
                  Manage Users
                </button>
              )}

              {canCreate && (
                <button
                  type="button"
                  onClick={() => openAdd()}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#4A86F7] px-3.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-600"
                >
                  <Plus size={14} />
                  Add Booking
                </button>
              )}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {isCleaner ? (
            <>
              <Stat
                label="Today's Hours"
                value={`${stats.todayHours.toFixed(1)} hrs`}
                sub="Approved hours worked today"
              />
              <Stat
                label="This Week"
                value={`${stats.weekHours.toFixed(1)} hrs`}
                sub="Approved hours this week"
              />
              <Stat
                label="This Month"
                value={`${stats.monthHours.toFixed(1)} hrs`}
                sub="Approved hours this month"
              />
              <Stat
                label="Upcoming Jobs"
                value={stats.upcoming}
                sub="Assigned bookings after today"
              />
            </>
          ) : (
            <>
              <Stat
                label={isDataEntry ? "Total Added" : "Total Bookings"}
                value={stats.total}
                sub={
                  isDataEntry
                    ? `${stats.allTotal} total bookings visible`
                    : "All visible booking records"
                }
              />
              <Stat
                label="Today"
                value={stats.todayCount}
                sub="Scheduled for today"
              />
              <Stat
                label="Upcoming"
                value={stats.upcoming}
                sub="Scheduled after today"
              />
              <Stat
                label="Pending"
                value={stats.pending}
                sub="Awaiting action"
              />
            </>
          )}
        </section>

        {/* FILTERS */}
        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_auto]">
            <FilterInput
              placeholder="Search customer, service, email or phone..."
              value={query}
              onChange={setQuery}
            />

            <select
              value={areaFilter}
              onChange={(event) => setAreaFilter(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
            >
              <option value="all">All Areas</option>
              {areas.map((area) => (
                <option key={area}>{area}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setAreaFilter("all");
              }}
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {quickFilters.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setQuickFilter(value)}
                className={`h-8 rounded-lg px-3 text-[9px] font-bold transition ${
                  quickFilter === value
                    ? "bg-[#13263A] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* CALENDAR FIRST */}
        <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.55fr)]">
          <BookingCalendar
            bookings={scopedBookings}
            month={calendarMonth}
            setMonth={setCalendarMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            activeClass="bg-[#4A86F7]"
          />

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="border-b border-slate-100 pb-3">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#4A86F7]">
                Selected Date
              </p>

              <h2 className="mt-1 font-bold text-[#13263A]">
                {formatDate(selectedDate)}
              </h2>

              <p className="mt-0.5 text-slate-500">
                {selectedDayBookings.length} booking
                {selectedDayBookings.length === 1 ? "" : "s"}
              </p>

              {canCreate && selectedDate >= todayInBusinessTz() && (
                <button
                  type="button"
                  onClick={() => openAdd(selectedDate)}
                  className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#4A86F7] px-3.5 text-[9px] font-bold text-white shadow-sm transition hover:bg-blue-600"
                >
                  <Plus size={13} />
                  Book Selected Date
                </button>
              )}
            </div>

            <div className="mt-3 max-h-[430px] space-y-2 overflow-y-auto pr-1">
              {selectedDayBookings.map((booking) => (
                <button
                  type="button"
                  key={booking.id}
                  onClick={() => setDetails(booking)}
                  className="group w-full rounded-lg border border-slate-200 bg-[#F8FAFD] p-3 text-left transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-[11px] font-bold text-[#13263A]">
                        {booking.full_name}
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-500">
                        <Clock3 size={11} />
                        {formatTime(booking.service_time)}
                      </div>
                    </div>

                    <StatusPill status={booking.status} />
                  </div>

                  <div className="mt-2 truncate text-[9px] text-slate-500">
                    {booking.cleaning_type} • {booking.area}
                  </div>

                  {!isCleaner && (
                    <div className="mt-2 truncate text-[8px] text-slate-400">
                      Assigned:{" "}
                      {booking.assigned_cleaners
                        .map((cleaner) => cleaner.name)
                        .join(", ") || "Unassigned"}
                    </div>
                  )}
                </button>
              ))}

              {!selectedDayBookings.length && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-[10px] text-slate-400">
                  No bookings on this date.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BOOKINGS LIST */}
        <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-[#13263A]">
                {quickFilter === "my"
                  ? "My Bookings"
                  : isCleaner
                    ? "All Bookings"
                    : "Booking List"}
              </h2>

              <p className="mt-0.5 text-slate-500">
                {filtered.length} booking
                {filtered.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* MOBILE */}
          <div className="divide-y divide-slate-100 lg:hidden">
            {filtered.map((booking) => (
              <article key={booking.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[12px] font-bold text-[#13263A]">
                      {booking.full_name}
                    </h3>
                    <p className="mt-1 truncate text-[10px] text-slate-500">
                      {booking.cleaning_type}
                    </p>
                  </div>

                  <StatusPill status={booking.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <InfoChip icon={MapPin} label={booking.area} />
                  <InfoChip
                    icon={CalendarClock}
                    label={formatDate(booking.service_date)}
                  />
                  <InfoChip
                    icon={Clock3}
                    label={formatTime(booking.service_time)}
                  />
                  <InfoChip
                    icon={DollarSign}
                    label={
                      isCleaner && !booking.show_price_to_cleaner
                        ? "Hidden"
                        : `$${Number(booking.price).toFixed(2)}`
                    }
                  />
                </div>

                {!isCleaner && (
                  <p className="mt-3 text-[9px] text-slate-500">
                    Assigned:{" "}
                    <span className="font-semibold text-slate-700">
                      {booking.assigned_cleaners
                        .map((cleaner) => cleaner.name)
                        .join(", ") || "Unassigned"}
                    </span>
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Action
                    onClick={() => setDetails(booking)}
                    label="View"
                    className="bg-[#4A86F7]"
                  />
                  {canAssign && (
                    <Action
                      onClick={() => setAssigning(booking)}
                      label="Assign"
                      className="bg-violet-600"
                    />
                  )}
                  {canEdit && (
                    <Action
                      onClick={() => openEdit(booking)}
                      label="Edit"
                      className="bg-amber-500"
                    />
                  )}
                  {canDelete && (
                    <Action
                      onClick={() => deleteBooking(booking)}
                      label="Delete"
                      className="bg-rose-600"
                    />
                  )}
                </div>
              </article>
            ))}

            {!filtered.length && (
              <p className="p-8 text-center text-[10px] font-semibold text-slate-400">
                No bookings match these filters.
              </p>
            )}
          </div>

          {/* DESKTOP */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[900px] table-fixed text-left">
              <thead className="bg-[#F8FAFD]">
                <tr>
                  {[
                    "Customer",
                    "Cleaning",
                    "Area",
                    "Date",
                    "Time",
                    "Price",
                    "Status",
                    ...(!isCleaner ? ["Assigned To"] : []),
                    "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      className="border-b border-slate-200 px-3 py-2.5 text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((booking) => (
                  <tr
                    key={booking.id}
                    className="transition hover:bg-blue-50/40"
                  >
                    <td className="px-3 py-3">
                      <span
                        className="block truncate text-[10px] font-bold text-[#13263A]"
                        title={booking.full_name}
                      >
                        {booking.full_name}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className="block truncate text-[9px] text-slate-600"
                        title={booking.cleaning_type}
                      >
                        {booking.cleaning_type}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className="block truncate rounded-md bg-blue-50 px-2 py-1 text-[8px] font-bold text-blue-700"
                        title={booking.area}
                      >
                        {booking.area}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-[9px] text-slate-600">
                      {formatDateCompact(booking.service_date)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3 text-[9px] text-slate-600">
                      {formatTime(booking.service_time)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      {isCleaner && !booking.show_price_to_cleaner ? (
                        <span className="text-[9px] text-slate-400">
                          Hidden
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-700">
                          ${Number(booking.price).toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-3 py-3">
                      <StatusPill status={booking.status} />
                    </td>

                    {!isCleaner && (
                      <td className="px-3 py-3">
                        <div className="max-w-[170px] truncate text-[8px] text-slate-600">
                          {booking.assigned_cleaners
                            .map((cleaner) => cleaner.name)
                            .join(", ") || "Unassigned"}
                        </div>
                      </td>
                    )}

                    <td className="whitespace-nowrap px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <CompactAction
                          onClick={() => setDetails(booking)}
                          label="View"
                          className="bg-[#4A86F7]"
                        />

                        {canAssign && (
                          <CompactAction
                            onClick={() => setAssigning(booking)}
                            label="Assign"
                            className="bg-violet-600"
                          />
                        )}

                        {canEdit && (
                          <CompactAction
                            onClick={() => openEdit(booking)}
                            label="Edit"
                            className="bg-amber-500"
                          />
                        )}

                        {canDelete && (
                          <CompactAction
                            onClick={() => deleteBooking(booking)}
                            label="Delete"
                            className="bg-rose-600"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {!filtered.length && (
                  <tr>
                    <td
                      colSpan={isCleaner ? 8 : 9}
                      className="px-4 py-12 text-center text-[10px] text-slate-400"
                    >
                      No bookings match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {assigning && canAssign && (
        <AssignModal
          booking={assigning}
          cleaners={cleaners}
          onClose={() => setAssigning(null)}
          onSaved={() => {
            setAssigning(null);
            router.refresh();
          }}
        />
      )}

      {details && (
        <DetailsModal
          booking={details}
          canDelete={canDelete}
          canEdit={canEdit}
          onClose={() => setDetails(null)}
          onEdit={() => {
            openEdit(details);
            setDetails(null);
          }}
          onDeleted={() => {
            setDetails(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>

          <div className="mt-1.5 text-[20px] font-extrabold leading-none text-[#13263A]">
            {value}
          </div>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]">
          <Sparkles size={14} />
        </span>
      </div>

      {sub && (
        <p className="mt-2 text-[9px] leading-4 text-slate-500">
          {sub}
        </p>
      )}
    </div>
  );
}

function FilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 transition focus-within:border-blue-300 focus-within:bg-white">
      <Search size={14} className="text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[10px] font-medium text-slate-700 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "completed"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : status === "ongoing"
        ? "border-blue-100 bg-blue-50 text-blue-700"
        : "border-amber-100 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-[7px] font-extrabold uppercase tracking-[0.04em] ${tone}`}
    >
      {status}
    </span>
  );
}

function Action({
  label,
  className,
  onClick,
}: {
  label: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 rounded-lg px-3 text-[9px] font-bold text-white transition hover:opacity-90 ${className}`}
    >
      {label}
    </button>
  );
}

function CompactAction({
  label,
  className,
  onClick,
}: {
  label: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 rounded-md px-2 text-[8px] font-bold text-white transition hover:opacity-90 ${className}`}
    >
      {label}
    </button>
  );
}

function InfoChip({
  icon: Icon,
  label,
}: {
  icon: typeof CalendarClock;
  label: string;
}) {
  return (
    <span className="flex min-h-8 items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 text-[9px] font-semibold text-slate-600">
      <Icon size={12} className="text-slate-400" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function BookingCalendar({
  bookings,
  month,
  setMonth,
  selectedDate,
  setSelectedDate,
  activeClass,
}: {
  bookings: BookingRecord[];
  month: Date;
  setMonth: (date: Date) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeClass: string;
}) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const days = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  const cells: Array<Date | null> = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from(
      { length: days },
      (_, index) =>
        new Date(
          month.getFullYear(),
          month.getMonth(),
          index + 1,
        ),
    ),
  ];

  const counts = bookings.reduce<Record<string, number>>(
    (acc, booking) => {
      acc[booking.service_date] =
        (acc[booking.service_date] || 0) + 1;
      return acc;
    },
    {},
  );

  const today = toDateInput(new Date());

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#4A86F7]">
            Calendar
          </p>

          <h2 className="mt-1 font-bold text-[#13263A]">
            {month.toLocaleDateString("en-CA", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <p className="mt-0.5 text-slate-500">
            Select a date to view scheduled bookings.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setMonth(
                new Date(
                  month.getFullYear(),
                  month.getMonth() - 1,
                  1,
                ),
              )
            }
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setMonth(
                new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  1,
                ),
              );
              setSelectedDate(toDateInput(now));
            }}
            className="h-8 rounded-lg bg-slate-100 px-3 text-[9px] font-bold text-slate-600 transition hover:bg-slate-200"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() =>
              setMonth(
                new Date(
                  month.getFullYear(),
                  month.getMonth() + 1,
                  1,
                ),
              )
            }
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
          (day) => (
            <div
              key={day}
              className="py-1 text-center text-[8px] font-extrabold uppercase tracking-[0.05em] text-slate-400"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ),
        )}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1.5">
        {cells.map((date, index) => {
          const key = date ? toDateInput(date) : "";
          const active = key === selectedDate;
          const isToday = key === today;
          const count = counts[key] || 0;

          if (!date) {
            return (
              <div
                key={`blank-${index}`}
                className="aspect-square rounded-lg bg-slate-50/40"
              />
            );
          }

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setSelectedDate(key)}
              className={`relative aspect-square min-h-[46px] rounded-lg border p-1 text-left transition sm:min-h-[58px] ${
                active
                  ? `${activeClass} border-transparent text-white shadow-sm`
                  : count
                    ? "border-blue-100 bg-blue-50/70 text-slate-700 hover:border-blue-300"
                    : isToday
                      ? "border-[#4A86F7] bg-white text-[#13263A]"
                      : "border-slate-100 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/40"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-bold ${
                  active
                    ? "bg-white/15 text-white"
                    : isToday
                      ? "bg-[#4A86F7] text-white"
                      : ""
                }`}
              >
                {date.getDate()}
              </span>

              {count > 0 && (
                <span
                  className={`absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-center rounded-md px-1 py-1 text-[7px] font-extrabold ${
                    active
                      ? "bg-white/15 text-white"
                      : "bg-white text-[#4A86F7]"
                  }`}
                >
                  {count} booking{count === 1 ? "" : "s"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingFormPanel({
  form,
  setForm,
  cleaners,
  saving,
  error,
  onClose,
  onSubmit,
  currentUser,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
  cleaners: CleanerUser[];
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  currentUser: CurrentUser;
}) {
  const update = (
    key: keyof FormState,
    value: string | boolean | string[] | number | null,
  ) => setForm({ ...form, [key]: value });

  const [cleaningTypeMode, setCleaningTypeMode] = useState(() =>
    cleaningTypeOptions.includes(form.cleaning_type)
      ? form.cleaning_type
      : form.cleaning_type
        ? "Other"
        : "",
  );

  const toggleManpower = (enabled: boolean) =>
    setForm({
      ...form,
      use_manpower_time: enabled,
      manpower_min_hours: enabled ? form.manpower_min_hours : "",
      manpower_max_hours: enabled ? form.manpower_max_hours : "",
    });

  const isEdit = Boolean(form.id);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
            Booking Operations
          </p>
          <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">
            {isEdit ? form.full_name || "Edit Booking" : "Add Booking"}
          </h1>
          <p className="mt-1 max-w-2xl text-[11px] text-slate-500">
            {isEdit
              ? "Update customer, schedule, assignment and booking details."
              : "Create a booking using the same compact admin workflow."
            }
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
        >
          <ArrowLeft size={14} />
          Back to Bookings
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 p-4">
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-semibold text-red-700">
            {error}
          </p>
        )}

        <FormSection title="Customer Details" icon={UserRound}>
          <div className="grid gap-3 md:grid-cols-3">
            <Field
              label="Full Name"
              value={form.full_name}
              onChange={(v) => update("full_name", v)}
              required
            />
            <Field
              label="Email Address"
              value={form.email}
              onChange={(v) => update("email", v)}
              type="email"
              required
            />
            <Field
              label="Phone Number"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              required
            />
          </div>

          <Field
            label="Full Address"
            value={form.full_address}
            onChange={(v) => update("full_address", v)}
            required
          />
        </FormSection>

        <FormSection title="Booking Details" icon={CalendarClock}>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
                Cleaning Type
              </span>

              <select
                required
                value={cleaningTypeMode}
                onChange={(event) => {
                  const value = event.target.value;
                  setCleaningTypeMode(value);
                  update("cleaning_type", value === "Other" ? "" : value);
                }}
                className="h-9 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
              >
                <option value="">Select cleaning type</option>
                {cleaningTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </label>

            {cleaningTypeMode === "Other" && (
              <Field
                label="Other Cleaning Name"
                value={form.cleaning_type}
                onChange={(v) => update("cleaning_type", v)}
                placeholder="Deep cleaning"
                required
              />
            )}

            <label className="block">
              <span className="mb-1.5 block text-[9px] font-bold text-slate-600">
                Calgary Area
              </span>

              <select
                required
                value={form.area}
                onChange={(event) => update("area", event.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white"
              >
                <option value="">Select Calgary Area</option>
                {areas.map((area) => (
                  <option key={area}>{area}</option>
                ))}
              </select>
            </label>

            <Field
              label="Service Date"
              value={form.service_date}
              onChange={(v) => update("service_date", v)}
              type="date"
              required
              min={form.id ? undefined : todayInBusinessTz()}
            />

            <Field
              label="Service Time"
              value={form.service_time}
              onChange={(v) => update("service_time", v)}
              type="time"
              required
            />

            <Field
              label="Price (CAD)"
              value={String(form.price)}
              onChange={(v) => update("price", v)}
              type="number"
              required
            />

            <Field
              label="Added By"
              value={form.added_by || currentUser?.name || ""}
              onChange={() => {}}
              readOnly
            />
          </div>

          <label className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-[#F8FAFD] p-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <b className="text-[10px] text-[#13263A]">Apply manpower time</b>
              <span className="block text-[9px] text-slate-500">
                Set a minimum and maximum service window.
              </span>
            </span>

            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                form.use_manpower_time ? "bg-cyan-700" : "bg-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={form.use_manpower_time}
                onChange={(event) => toggleManpower(event.target.checked)}
                className="peer sr-only"
              />
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                  form.use_manpower_time ? "left-6" : "left-1"
                }`}
              />
            </span>
          </label>

          {form.use_manpower_time && (
            <div className="grid gap-3 md:grid-cols-2">
              <Field
                label="Minimum Hours"
                value={String(form.manpower_min_hours || "")}
                onChange={(v) => update("manpower_min_hours", v)}
                type="number"
                placeholder="4"
                required
              />
              <Field
                label="Maximum Hours"
                value={String(form.manpower_max_hours || "")}
                onChange={(v) => update("manpower_max_hours", v)}
                type="number"
                placeholder="5"
                required
              />
            </div>
          )}
        </FormSection>

        <FormSection title="Instructions" icon={ClipboardList}>
          <div className="grid gap-3 lg:grid-cols-3">
            <TextArea
              label="Scope Of Work"
              value={form.scope_of_work || ""}
              onChange={(v) => update("scope_of_work", v)}
            />
            <TextArea
              label="Focus Details"
              value={form.focus_details || ""}
              onChange={(v) => update("focus_details", v)}
            />
            <TextArea
              label="Parking Instructions"
              value={form.parking_instructions || ""}
              onChange={(v) => update("parking_instructions", v)}
            />
          </div>
        </FormSection>

        <FormSection title="Assignment & Visibility" icon={UserRound}>
          <label className="mb-3 flex flex-col gap-3 rounded-lg border border-slate-200 bg-[#F8FAFD] p-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <b className="text-[10px] text-[#13263A]">Show price to assigned user</b>
              <span className="block text-[9px] text-slate-500">
                Enable this when the assigned team member should see the booking price.
              </span>
            </span>

            <span
              className={`relative h-7 w-12 rounded-full transition ${
                form.show_price_to_cleaner ? "bg-blue-700" : "bg-slate-300"
              }`}
            >
              <input
                type="checkbox"
                checked={form.show_price_to_cleaner}
                onChange={(event) =>
                  update("show_price_to_cleaner", event.target.checked)
                }
                className="peer sr-only"
              />
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                  form.show_price_to_cleaner ? "left-6" : "left-1"
                }`}
              />
            </span>
          </label>

          <CleanerPicker
            cleaners={cleaners}
            selected={form.assigned_cleaner_ids}
            onChange={(ids) => update("assigned_cleaner_ids", ids)}
          />
        </FormSection>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            disabled={saving}
            className="h-9 rounded-lg bg-[#4A86F7] px-4 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-600 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Save Booking"}
          </button>
        </div>
      </form>
    </section>
  );
}

function AssignModal({ booking, cleaners, onClose, onSaved }: { booking: BookingRecord; cleaners: CleanerUser[]; onClose: () => void; onSaved: () => void }) { const [selected, setSelected] = useState(booking.assigned_cleaners.map((cleaner) => cleaner.id)); const [saving, setSaving] = useState(false); const save = async () => { setSaving(true); await fetch("/api/admin/booking-records", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: booking.id, assigned_cleaner_ids: selected }) }); setSaving(false); onSaved(); }; return <Modal title="Assign Cleaner" subtitle={booking.full_name} onClose={onClose}><CleanerPicker cleaners={cleaners} selected={selected} onChange={setSelected} /><div className="mt-6 flex gap-3"><button onClick={save} disabled={saving} className="h-12 flex-1 rounded-xl bg-purple-700 font-bold text-white">{saving ? "Saving..." : "Confirm"}</button><button onClick={onClose} className="h-12 rounded-xl border px-8 font-bold">Cancel</button></div></Modal>; }

function DetailsModal({ booking, canDelete, canEdit, onClose, onEdit, onDeleted }: { booking: BookingRecord; canDelete: boolean; canEdit: boolean; onClose: () => void; onEdit: () => void; onDeleted: () => void }) {
  const router = useRouter();
  const [status, setStatus] = useState(booking.status);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [serviceImages, setServiceImages] = useState<BookingImage[]>(booking.service_images);
  const [replacingImage, setReplacingImage] = useState<BookingImage | null>(null);
  const beforeInput = useRef<HTMLInputElement>(null);
  const afterInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const before = serviceImages.filter((image) => image.image_type === "before");
  const after = serviceImages.filter((image) => image.image_type === "after");
  const assignedNames = booking.assigned_cleaners.map((cleaner) => cleaner.name).join(", ") || "Unassigned";

  const uploadImage = async (file: File, type: "before" | "after") => {
    setUploading(true);
    setUploadMessage(`Uploading ${type} image...`);
    try {
      const supabase = createClient();
      const optimized = await optimizeImageForUpload(file);
      const ext = optimized.name.split(".").pop() || "jpg";
      const path = `booking_records/${booking.id}/${type}_${Date.now()}_${crypto.randomUUID()}.${ext}`;
      const url = await uploadImageToBucket(supabase, "job-images", path, optimized);
      setUploadMessage("Saving image record...");
      const response = await fetch("/api/admin/booking-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: {
            booking_id: booking.id,
            image_type: type,
            url,
            storage_path: path,
            name: file.name,
            format: ext,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save image.");
      if (result.image) {
        setServiceImages((current) => [...current, result.image as BookingImage]);
      }
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to upload image.");
    } finally {
      setUploading(false);
      setUploadMessage("");
    }
  };

  const replaceImage = async (file: File, image: BookingImage) => {
    setUploading(true);
    setUploadMessage(`Replacing ${image.image_type} image...`);

    let newStoragePath = "";

    try {
      const supabase = createClient();
      const optimized = await optimizeImageForUpload(file);
      const ext = optimized.name.split(".").pop() || "jpg";
      newStoragePath = `booking_records/${booking.id}/${image.image_type}_${Date.now()}_${crypto.randomUUID()}.${ext}`;
      const url = await uploadImageToBucket(supabase, "job-images", newStoragePath, optimized);

      setUploadMessage("Updating image record...");
      const response = await fetch("/api/admin/booking-records", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_update: {
            id: image.id,
            url,
            storage_path: newStoragePath,
            name: file.name,
            format: ext,
          },
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to replace image.");

      if (result.image) {
        setServiceImages((current) =>
          current.map((item) => (item.id === image.id ? (result.image as BookingImage) : item)),
        );
      }

      setReplacingImage(null);
      router.refresh();
    } catch (err) {
      if (newStoragePath) {
        try {
          const supabase = createClient();
          await supabase.storage.from("job-images").remove([newStoragePath]);
        } catch {
          // Best-effort cleanup only.
        }
      }
      window.alert(err instanceof Error ? err.message : "Unable to replace image.");
    } finally {
      setUploading(false);
      setUploadMessage("");
    }
  };

  const deleteImage = async (image: BookingImage) => {
    if (!window.confirm(`Delete this ${image.image_type} image?`)) return;

    setUploading(true);
    setUploadMessage("Deleting image...");

    try {
      const response = await fetch(`/api/admin/booking-records?imageId=${encodeURIComponent(image.id)}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to delete image.");

      setServiceImages((current) => current.filter((item) => item.id !== image.id));
      router.refresh();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to delete image.");
    } finally {
      setUploading(false);
      setUploadMessage("");
    }
  };

  const openReplaceImage = (image: BookingImage) => {
    setReplacingImage(image);
    window.requestAnimationFrame(() => replaceInput.current?.click());
  };

  const saveStatus = async () => {
    const response = await fetch("/api/admin/booking-records", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: booking.id, status }),
    });
    const result = await response.json();
    if (!response.ok) {
      window.alert(result.error || "Unable to update booking status.");
      return;
    }
    router.refresh();
  };

  return (
    <Modal title="Booking Details" subtitle={booking.full_name} onClose={onClose} wide>
      <div className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">Booking Summary</p>
              <h3 className="mt-1 text-[13px] font-bold text-[#13263A]">Service & customer information</h3>
            </div>
            <StatusPill status={booking.status} />
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            <Detail label="Customer" value={booking.full_name} />
            <Detail label="Email" value={booking.email} />
            <Detail label="Phone" value={booking.phone} />
            <Detail label="Cleaning Type" value={booking.cleaning_type} />
            <Detail label="Area" value={booking.area} />
            <Detail label="Service Date" value={formatDate(booking.service_date)} />
            <Detail label="Service Time" value={`${formatTime(booking.service_time)} Calgary`} />
            <Detail label="Price" value={`$${Number(booking.price || 0).toFixed(2)}`} />
            <Detail label="Assigned To" value={assignedNames} />
            <Detail label="Added By" value={booking.added_by || "Portal User"} />
            <Detail label="Show Price" value={booking.show_price_to_cleaner ? "Yes" : "No"} />
            <Detail label="Manpower Time" value={booking.use_manpower_time ? formatManpowerTime(booking) : "Not applied"} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 border-b border-slate-100 pb-3">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">Location & Instructions</p>
            <h3 className="mt-1 text-[13px] font-bold text-[#13263A]">Job notes</h3>
          </div>
          <div className="grid gap-2.5 lg:grid-cols-2">
            <Detail label="Full Address" value={booking.full_address} wide />
            <Detail label="Scope Of Work" value={booking.scope_of_work} wide />
            <Detail label="Focus Details" value={booking.focus_details} wide />
            <Detail label="Parking Instructions" value={booking.parking_instructions} wide />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 border-b border-slate-100 pb-3">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">Work Tracking</p>
            <h3 className="mt-1 text-[13px] font-bold text-[#13263A]">Progress and hours</h3>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            <Detail label="Start Date" value={booking.start_date ? formatDate(booking.start_date) : "-"} />
            <Detail label="Start Time" value={booking.start_time ? formatTime(booking.start_time) : "-"} />
            <Detail label="End Date" value={booking.end_date ? formatDate(booking.end_date) : "-"} />
            <Detail label="End Time" value={booking.end_time ? formatTime(booking.end_time) : "-"} />
            <Detail label="Worked Hours" value={String(booking.worked_hours || 0)} />
            <Detail label="Approved Hours" value={String(booking.approved_hours || 0)} />
            <Detail label="Hours Approved" value={booking.hours_approved ? "Yes" : "No"} />
            <Detail label="Completed By" value={booking.completed_by || "-"} />
          </div>
          {booking.completion_remarks && (
            <div className="mt-2.5">
              <Detail label="Completion Remarks" value={booking.completion_remarks} wide />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">Service Images</p>
              <h3 className="mt-1 text-[13px] font-bold text-[#13263A]">Before & after photos</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => beforeInput.current?.click()}
                disabled={uploading}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-[#4A86F7] px-3 text-[9px] font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
              >
                + Before Image
              </button>
              <button
                type="button"
                onClick={() => afterInput.current?.click()}
                disabled={uploading}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[9px] font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
              >
                + After Image
              </button>
            </div>
          </div>
          <input ref={beforeInput} type="file" multiple accept="image/*" onChange={(e) => { Array.from(e.target.files || []).forEach((file) => uploadImage(file, "before")); e.currentTarget.value = ""; }} className="hidden" />
          <input ref={afterInput} type="file" multiple accept="image/*" onChange={(e) => { Array.from(e.target.files || []).forEach((file) => uploadImage(file, "after")); e.currentTarget.value = ""; }} className="hidden" />
          <input
            ref={replaceInput}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              const image = replacingImage;
              e.currentTarget.value = "";
              if (file && image) void replaceImage(file, image);
              else setReplacingImage(null);
            }}
            className="hidden"
          />
          {uploading && (
            <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[9px] font-semibold text-blue-700">
              {uploadMessage || "Uploading..."}
            </p>
          )}
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <ImageGroup
              title="Before"
              images={before}
              disabled={uploading}
              onReplace={openReplaceImage}
              onDelete={deleteImage}
            />
            <ImageGroup
              title="After"
              images={after}
              disabled={uploading}
              onReplace={openReplaceImage}
              onDelete={deleteImage}
            />
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">Status</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {["pending", "ongoing", "completed"].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setStatus(item as BookingRecord["status"])}
                    className={`h-8 rounded-lg px-3 text-[9px] font-bold capitalize transition ${status === item ? "bg-[#13263A] text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={saveStatus}
              className="h-8 rounded-lg bg-[#4A86F7] px-4 text-[9px] font-bold text-white transition hover:bg-blue-600"
            >
              Save Status
            </button>
          </div>
        </section>

        <section className="sticky bottom-0 z-10 -mx-4 -mb-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:-mb-5 sm:px-5">
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 rounded-lg border border-slate-200 bg-white px-4 text-[9px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="h-8 rounded-lg bg-amber-500 px-4 text-[9px] font-bold text-white transition hover:bg-amber-600"
              >
                Edit Booking
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm("Delete this booking?")) return;
                  const response = await fetch(`/api/admin/booking-records?id=${booking.id}`, { method: "DELETE" });
                  const result = await response.json();
                  if (!response.ok) {
                    window.alert(result.error || "Unable to delete booking.");
                    return;
                  }
                  onDeleted();
                }}
                className="h-8 rounded-lg bg-rose-600 px-4 text-[9px] font-bold text-white transition hover:bg-rose-700"
              >
                Delete
              </button>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}

type UserEditorState = {
  id?: string;
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role: "admin" | "cleaner" | "data_entry";
  role_key: string;
  approval_status: string;
  source: string;
  is_blocked: boolean;
  is_available: boolean;
  offering_fixed: boolean;
  offering_hourly: boolean;
  hourly_rate: string;
};

const emptyUserEditor: UserEditorState = {
  name: "",
  email: "",
  phone_number: "",
  password: "",
  role: "cleaner",
  role_key: "cleaner",
  approval_status: "approved",
  source: "Web",
  is_blocked: false,
  is_available: false,
  offering_fixed: true,
  offering_hourly: false,
  hourly_rate: "0",
};

const operationalBaseRoles = ["admin", "cleaner", "data_entry"];

function roleName(roles: BookingRoleDefinition[], key: string | null | undefined, baseRole?: string) {
  const found = roles.find((role) => role.key === key);
  if (found) return found.name;
  return labelRole(baseRole || key || "cleaner");
}

function ManageUsersPanel({
  users,
  roleDefinitions,
  currentUser,
  onClose,
  onChanged,
  onUsersChange,
}: {
  users: PortalUser[];
  roleDefinitions: BookingRoleDefinition[];
  currentUser: CurrentUser;
  onClose: () => void;
  onChanged: () => void;
  onUsersChange: (updater: (current: PortalUser[]) => PortalUser[]) => void;
}) {
  const [screen, setScreen] = useState<"list" | "add" | "view" | "edit">("list");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);
  const [editForm, setEditForm] = useState<UserEditorState>(emptyUserEditor);
  const [addForm, setAddForm] = useState<UserEditorState>(emptyUserEditor);
  const [roles, setRoles] = useState<BookingRoleDefinition[]>(roleDefinitions);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => setRoles(roleDefinitions), [roleDefinitions]);

  const operationalUsers = useMemo(
    () =>
      users.filter((user) =>
        operationalBaseRoles.includes(String(user.role || "").toLowerCase()),
      ),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();

    return operationalUsers.filter((user) => {
      const roleKey = String(user.booking_role_key || user.role).toLowerCase();
      const label = roleName(roles, roleKey, user.role);
      const text = `${user.name} ${user.email} ${user.phone_number || ""} ${label}`.toLowerCase();

      return (
        (!q || text.includes(q)) &&
        (roleFilter === "all" || roleKey === roleFilter)
      );
    });
  }, [operationalUsers, query, roleFilter, roles]);

  const openList = () => {
    setScreen("list");
    setSelectedUser(null);
    setError("");
  };

  const openView = (user: PortalUser) => {
    setSelectedUser(user);
    setScreen("view");
    setError("");
    setMessage("");
  };

  const openEdit = (user: PortalUser) => {
    const roleKey = user.booking_role_key || user.role || "cleaner";
    const roleDef = roles.find((item) => item.key === roleKey);
    const baseRole = (roleDef?.base_role || user.role || "cleaner") as "admin" | "cleaner" | "data_entry";

    setSelectedUser(user);
    setEditForm({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      password: "",
      role: baseRole,
      role_key: roleKey,
      approval_status: user.approval_status || "approved",
      source: user.source || "Web",
      is_blocked: Boolean(user.is_blocked),
      is_available: Boolean(user.is_available),
      offering_fixed: Boolean(user.offering_fixed ?? true),
      offering_hourly: Boolean(user.offering_hourly),
      hourly_rate: String(user.hourly_rate ?? "0"),
    });
    setScreen("edit");
    setError("");
    setMessage("");
  };

  const saveEditedUser = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedUser) return;

    setSaving(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/booking-record-users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedUser.id,
        name: editForm.name,
        email: editForm.email,
        phone_number: editForm.phone_number,
        role: editForm.role,
        role_key: editForm.role_key,
        approval_status: editForm.approval_status,
        source: editForm.source,
        is_blocked: editForm.is_blocked,
        is_available: editForm.role === "cleaner" ? editForm.is_available : false,
        offering_fixed: editForm.role === "cleaner" ? editForm.offering_fixed : false,
        offering_hourly: editForm.role === "cleaner" ? editForm.offering_hourly : false,
        hourly_rate: editForm.role === "cleaner" ? editForm.hourly_rate : "0",
      }),
    });

    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(result.error || "Unable to update user.");
      return;
    }

    setMessage("User updated successfully.");
    setScreen("list");
    setSelectedUser(null);
    onChanged();
  };

  const deleteUser = async (user: PortalUser) => {
    if (!window.confirm(`Delete ${user.name}? This permanently removes the booking user account.`)) return;

    setError("");
    setMessage("");

    const response = await fetch(
      `/api/admin/booking-record-users?id=${encodeURIComponent(user.id)}`,
      { method: "DELETE" },
    );
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Unable to delete user.");
      return;
    }

    // Remove immediately from the Booking Users list.
    onUsersChange((current) => current.filter((item) => item.id !== user.id));
    setMessage(`${user.name} deleted successfully.`);
    setSelectedUser(null);
    setScreen("list");
    onChanged();
  };

  const addUser = async (event: FormEvent) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/booking-record-users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        phone_number: addForm.phone_number,
        role: addForm.role,
        role_key: addForm.role_key,
        source: addForm.source,
        approval_status: addForm.approval_status,
        is_available: addForm.role === "cleaner" ? addForm.is_available : false,
        offering_fixed: addForm.role === "cleaner" ? addForm.offering_fixed : false,
        offering_hourly: addForm.role === "cleaner" ? addForm.offering_hourly : false,
        hourly_rate: addForm.role === "cleaner" ? addForm.hourly_rate : "0",
      }),
    });

    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(result.error || "Unable to create user.");
      return;
    }

    // Show the newly-created booking user immediately instead of waiting
    // only for a server refresh.
    if (result.user?.id) {
      const createdRoleKey =
        result.user.booking_role_key ||
        addForm.role_key ||
        addForm.role ||
        "cleaner";
      const createdRoleDef = roles.find(
        (item) => item.key === createdRoleKey,
      );

      const createdUser: PortalUser = {
        id: result.user.id,
        name: result.user.name || addForm.name,
        email: result.user.email || addForm.email,
        phone_number:
          result.user.phone_number || addForm.phone_number || null,
        role:
          result.user.role ||
          createdRoleDef?.base_role ||
          addForm.role ||
          "cleaner",
        booking_role_key: createdRoleKey,
        role_label:
          createdRoleDef?.name || labelRole(addForm.role),
        approval_status:
          result.user.approval_status ||
          addForm.approval_status ||
          "approved",
        source: result.user.source || addForm.source || "Web",
        is_blocked: result.user.is_blocked ?? false,
        verified:
          result.user.verified ??
          ((result.user.role || addForm.role) !== "cleaner"),
        is_online: result.user.is_online ?? false,
        is_available:
          result.user.is_available ?? addForm.is_available ?? false,
        is_working: result.user.is_working ?? false,
        offering_fixed:
          result.user.offering_fixed ?? addForm.offering_fixed ?? false,
        offering_hourly:
          result.user.offering_hourly ?? addForm.offering_hourly ?? false,
        hourly_rate:
          result.user.hourly_rate ?? addForm.hourly_rate ?? "0",
        created_at:
          result.user.created_at || new Date().toISOString(),
      };

      onUsersChange((current) => {
        if (current.some((user) => user.id === createdUser.id)) {
          return current.map((user) =>
            user.id === createdUser.id ? createdUser : user,
          );
        }
        return [createdUser, ...current];
      });
    }

    setAddForm({ ...emptyUserEditor });
    setScreen("list");
    setMessage("Booking user created successfully.");
    onChanged();
  };

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#4A86F7]">Booking Operations</p>
          <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">Booking Users</h1>
          <p className="mt-1 text-slate-500">Manage admins and operational booking users from the calendar. Customers stay outside this module.</p>
        </div>

        <button type="button" onClick={onClose} className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={14} /> Back to Bookings
        </button>
      </div>

      <div className="space-y-4 p-4">
        {(screen === "list" || screen === "add") && (
          <div className="grid gap-2 rounded-xl border border-slate-200 bg-[#F8FAFD] p-1 sm:grid-cols-2">
            <button type="button" onClick={openList} className={`flex h-9 items-center justify-center gap-2 rounded-lg text-[10px] font-bold ${screen === "list" ? "bg-[#13263A] text-white" : "text-slate-600 hover:bg-white"}`}>
              <UsersRound size={14} /> Booking Users
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[8px]">{operationalUsers.length}</span>
            </button>
            <button type="button" onClick={() => { setScreen("add"); setError(""); setMessage(""); }} className={`flex h-9 items-center justify-center gap-2 rounded-lg text-[10px] font-bold ${screen === "add" ? "bg-[#4A86F7] text-white" : "text-slate-600 hover:bg-white"}`}>
              <UserPlus size={14} /> Add User
            </button>
          </div>
        )}

        {message && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[10px] font-semibold text-emerald-700">{message}</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] font-semibold text-red-700">{error}</p>}

        {screen === "list" && (
          <>
            <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_230px]">
              <FilterInput value={query} onChange={setQuery} placeholder="Search booking user or role..." />
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 text-[10px] font-semibold text-slate-700 outline-none">
                <option value="all">All roles</option>
                {roles.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-[#F8FAFD]"><tr>{["User", "Role", "Status", "Activity", "Actions"].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-2.5 text-[8px] font-extrabold uppercase tracking-[0.08em] text-slate-400">{head}</th>)}</tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-blue-50/40">
                        <td className="px-3 py-3"><div className="text-[10px] font-bold text-[#13263A]">{user.name}</div><div className="mt-0.5 max-w-[280px] truncate text-[8px] text-slate-400">{user.email}{user.phone_number ? ` • ${user.phone_number}` : ""}</div></td>
                        <td className="px-3 py-3"><RoleBadgeInline baseRole={user.role} label={roleName(roles, user.booking_role_key || user.role, user.role)} /></td>
                        <td className="px-3 py-3"><UserStatusBadge blocked={user.is_blocked} status={user.approval_status} /></td>
                        <td className="px-3 py-3 text-[9px] text-slate-600">{userActivity(user)}</td>
                        <td className="px-3 py-3"><div className="flex flex-wrap gap-1">
                          <MiniUserAction label="View" icon={Eye} onClick={() => openView(user)} className="bg-[#4A86F7]" />
                          <MiniUserAction label="Edit" icon={Pencil} onClick={() => openEdit(user)} className="bg-amber-500" />
                          <MiniUserAction label="Delete" icon={Trash2} onClick={() => deleteUser(user)} className="bg-rose-600" disabled={user.id === currentUser?.id} />
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {filteredUsers.map((user) => (
                  <article key={user.id} className="bg-white p-3.5">
                    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-[11px] font-bold text-[#13263A]">{user.name}</h3><p className="mt-1 truncate text-[9px] text-slate-500">{user.email}</p></div><RoleBadgeInline baseRole={user.role} label={roleName(roles, user.booking_role_key || user.role, user.role)} /></div>
                    <div className="mt-3 flex items-center justify-between gap-3"><UserStatusBadge blocked={user.is_blocked} status={user.approval_status} /><span className="text-[9px] text-slate-500">{userActivity(user)}</span></div>
                    <div className="mt-3 grid grid-cols-3 gap-1.5"><MiniUserAction label="View" icon={Eye} onClick={() => openView(user)} className="bg-[#4A86F7]" /><MiniUserAction label="Edit" icon={Pencil} onClick={() => openEdit(user)} className="bg-amber-500" /><MiniUserAction label="Delete" icon={Trash2} onClick={() => deleteUser(user)} className="bg-rose-600" disabled={user.id === currentUser?.id} /></div>
                  </article>
                ))}
              </div>

              {!filteredUsers.length && <div className="bg-white px-5 py-12 text-center text-[10px] font-semibold text-slate-400">No booking users found.</div>}
            </div>
          </>
        )}

        {screen === "add" && (
          <UserEditorForm title="Add User" subtitle="Create a booking user and choose an existing or custom role." form={addForm} setForm={setAddForm} roles={roles} setRoles={setRoles} saving={saving} submitLabel="Create User" onSubmit={addUser} showPassword />
        )}

        {screen === "view" && selectedUser && (
          <section className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#4A86F7]">Booking User</p><h2 className="mt-1 font-bold text-[#13263A]">{selectedUser.name}</h2></div><button type="button" onClick={openList} className="h-9 rounded-lg border border-slate-200 px-3 text-[10px] font-bold text-slate-600"><ArrowLeft size={14} className="inline" /> Booking Users</button></div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Name" value={selectedUser.name} />
              <Detail label="Role" value={roleName(roles, selectedUser.booking_role_key || selectedUser.role, selectedUser.role)} />
              <Detail label="Base Permission" value={labelRole(selectedUser.role)} />
              <Detail label="Email" value={selectedUser.email} />
              <Detail label="Phone" value={selectedUser.phone_number || "-"} />
              <Detail label="Approval" value={selectedUser.approval_status || "approved"} />
              <Detail label="Status" value={selectedUser.is_blocked ? "Blocked" : "Active"} />
              <Detail label="Activity" value={userActivity(selectedUser)} />
              <Detail label="Joined" value={formatDateTime(selectedUser.created_at)} />
            </div>
            <div className="mt-4 flex gap-2"><button type="button" onClick={() => openEdit(selectedUser)} className="h-9 rounded-lg bg-amber-500 px-4 text-[10px] font-bold text-white">Edit User</button><button type="button" onClick={() => deleteUser(selectedUser)} disabled={selectedUser.id === currentUser?.id} className="h-9 rounded-lg bg-rose-600 px-4 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Delete User</button></div>
          </section>
        )}

        {screen === "edit" && selectedUser && (
          <div><button type="button" onClick={openList} className="mb-3 h-9 rounded-lg border border-slate-200 px-3 text-[10px] font-bold text-slate-600"><ArrowLeft size={14} className="inline" /> Booking Users</button><UserEditorForm title={`Edit ${selectedUser.name}`} subtitle="Update user details and operational role." form={editForm} setForm={setEditForm} roles={roles} setRoles={setRoles} saving={saving} submitLabel="Save Changes" onSubmit={saveEditedUser} /></div>
        )}
      </div>
    </section>
  );
}

function withAdminRole(roles: BookingRoleDefinition[]) {
  const adminRole: BookingRoleDefinition = {
    key: "admin",
    name: "Admin",
    base_role: "admin",
    is_system: true,
    created_at: null,
  };

  return [
    adminRole,
    ...roles.filter((role) => role.key !== "admin"),
  ];
}

function UserEditorForm({
  title,
  subtitle,
  form,
  setForm,
  roles,
  setRoles,
  saving,
  submitLabel,
  onSubmit,
  showPassword = false,
}: {
  title: string;
  subtitle: string;
  form: UserEditorState;
  setForm: (value: UserEditorState) => void;
  roles: BookingRoleDefinition[];
  setRoles: (roles: BookingRoleDefinition[]) => void;
  saving: boolean;
  submitLabel: string;
  onSubmit: (event: FormEvent) => void;
  showPassword?: boolean;
}) {
  const [rolesOpen, setRolesOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newBaseRole, setNewBaseRole] = useState<"cleaner" | "data_entry">("cleaner");
  const [roleBusy, setRoleBusy] = useState(false);
  const [roleError, setRoleError] = useState("");

  const update = <K extends keyof UserEditorState,>(key: K, value: UserEditorState[K]) => setForm({ ...form, [key]: value });

  const selectRole = (key: string) => {
    const definition = roles.find((role) => role.key === key);
    if (!definition) return;
    setForm({ ...form, role_key: definition.key, role: definition.base_role });
  };

  const addRole = async () => {
    if (!newRoleName.trim()) return;
    setRoleBusy(true);
    setRoleError("");
    const response = await fetch("/api/admin/booking-roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoleName, base_role: newBaseRole }),
    });
    const result = await response.json();
    setRoleBusy(false);
    if (!response.ok) { setRoleError(result.error || "Unable to add role."); return; }
    const nextRoles = withAdminRole(
      (result.roles || []) as BookingRoleDefinition[],
    );
    setRoles(nextRoles);
    const createdKey = newRoleName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48);
    const created = nextRoles.find((role) => role.key === createdKey);
    if (created) setForm({ ...form, role_key: created.key, role: created.base_role });
    setNewRoleName("");
  };

  const deleteRole = async (role: BookingRoleDefinition) => {
    if (role.is_system) return;
    if (!window.confirm(`Delete role "${role.name}"? Users using it will fall back to ${labelRole(role.base_role)}.`)) return;
    setRoleBusy(true);
    setRoleError("");
    const response = await fetch(`/api/admin/booking-roles?key=${encodeURIComponent(role.key)}`, { method: "DELETE" });
    const result = await response.json();
    setRoleBusy(false);
    if (!response.ok) { setRoleError(result.error || "Unable to delete role."); return; }
    const nextRoles = withAdminRole(
      (result.roles || []) as BookingRoleDefinition[],
    );
    setRoles(nextRoles);
    if (form.role_key === role.key) {
      setForm({ ...form, role_key: role.base_role, role: role.base_role });
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-5"><h3 className="text-lg font-bold text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>

      <div className="grid gap-4 sm:grid-cols-2">
        <UserInput icon={UserRound} label="Full Name" value={form.name} onChange={(v) => update("name", v)} required />
        <UserInput icon={Mail} label="Email" value={form.email} onChange={(v) => update("email", v)} type="email" required />
        <UserInput icon={Phone} label="Phone Number" value={form.phone_number} onChange={(v) => update("phone_number", v)} required />
        {showPassword && <UserInput icon={Lock} label="Password" value={form.password} onChange={(v) => update("password", v)} type="password" required />}

        <div className="block">
          <div className="mb-2 flex items-center justify-between gap-2"><span className="text-sm font-bold text-slate-700">Role</span><button type="button" onClick={() => setRolesOpen((value) => !value)} className="rounded-lg bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#4A86F7]">{rolesOpen ? "Close Roles" : "+ Manage Roles"}</button></div>
          <select value={form.role_key} onChange={(event) => selectRole(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-blue-500">
            {roles.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}
          </select>
          <p className="mt-1 text-[10px] text-slate-400">Permission: {labelRole(form.role)}</p>
        </div>

        <label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Approval Status</span><select value={form.approval_status} onChange={(event) => update("approval_status", event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none"><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option></select></label>
        <UserInput icon={ShieldCheck} label="Source" value={form.source} onChange={(v) => update("source", v)} />
      </div>

      {rolesOpen && (
        <section className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
          <div className="flex items-center justify-between gap-3"><div><h4 className="font-bold text-[#13263A]">Manage Booking Roles</h4><p className="text-xs text-slate-500">Like product categories: add a role, select it, or delete custom roles.</p></div></div>
          {roleError && <p className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">{roleError}</p>}
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_190px_auto]">
            <input value={newRoleName} onChange={(event) => setNewRoleName(event.target.value)} placeholder="e.g. Senior Cleaner" className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none" />
            <select value={newBaseRole} onChange={(event) => setNewBaseRole(event.target.value as "cleaner" | "data_entry")} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold"><option value="cleaner">Cleaner Permission</option><option value="data_entry">Data Entry Permission</option></select>
            <button type="button" onClick={addRole} disabled={roleBusy || !newRoleName.trim()} className="h-10 rounded-lg bg-[#4A86F7] px-4 text-xs font-bold text-white disabled:opacity-50"><Plus size={13} className="mr-1 inline" /> Add Role</button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => <div key={role.key} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3"><div className="min-w-0"><div className="truncate text-xs font-bold text-[#13263A]">{role.name}</div><div className="mt-0.5 text-[10px] text-slate-400">{labelRole(role.base_role)} permission</div></div>{role.is_system ? <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">Built-in</span> : <button type="button" onClick={() => deleteRole(role)} disabled={roleBusy} className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600"><Trash2 size={13} /></button>}</div>)}
          </div>
        </section>
      )}

      {!showPassword && <label className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"><span><b className="text-sm text-slate-900">Blocked</b><span className="block text-xs text-slate-500">Block or restore portal access.</span></span><input type="checkbox" checked={form.is_blocked} onChange={(event) => update("is_blocked", event.target.checked)} className="h-5 w-5" /></label>}

      {form.role === "cleaner" && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4"><h4 className="font-bold text-slate-900">Cleaner Settings</h4><div className="mt-4 grid gap-3 sm:grid-cols-3"><SmallToggle label="Available" checked={form.is_available} onChange={(v) => update("is_available", v)} /><SmallToggle label="Fixed Jobs" checked={form.offering_fixed} onChange={(v) => update("offering_fixed", v)} /><SmallToggle label="Hourly Jobs" checked={form.offering_hourly} onChange={(v) => update("offering_hourly", v)} /></div><div className="mt-4 max-w-xs"><UserInput icon={DollarSign} label="Hourly Rate" value={form.hourly_rate} onChange={(v) => update("hourly_rate", v)} type="number" /></div></div>
      )}

      <div className="mt-5 flex justify-end"><button disabled={saving || roleBusy} className="h-11 rounded-xl bg-blue-700 px-6 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving..." : submitLabel}</button></div>
    </form>
  );
}

function UserInput({
  icon: Icon,
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  icon: typeof UserRound;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <div className="relative">
        <Icon
          size={17}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          required={required}
          type={type}
          step={type === "number" ? "0.25" : undefined}
          min={type === "number" ? "0" : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>
    </label>
  );
}

function SmallToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white p-3 text-xs font-bold text-slate-700">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4"
      />
    </label>
  );
}

function RoleBadgeInline({ baseRole, label }: { baseRole: string; label: string }) {
  const tone =
    baseRole === "admin"
      ? "bg-violet-100 text-violet-700"
      : baseRole === "cleaner"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-cyan-100 text-cyan-700";

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tone}`}>
      {label}
    </span>
  );
}

function UserStatusBadge({
  blocked,
  status,
}: {
  blocked: boolean | null;
  status: string | null;
}) {
  if (blocked) {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700">
        Blocked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold capitalize text-emerald-700">
      <CheckCircle2 size={11} />
      {status || "approved"}
    </span>
  );
}

function MiniUserAction({
  label,
  icon: Icon,
  onClick,
  className,
  disabled = false,
}: {
  label: string;
  icon: typeof Eye;
  onClick: () => void;
  className: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 items-center justify-center gap-1 rounded-lg px-2.5 text-[10px] font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35 ${className}`}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function userActivity(user: PortalUser) {
  if (user.role !== "cleaner") {
    return user.is_online ? "Online" : "Offline";
  }

  if (user.is_working) return "Working";
  if (user.is_available) return "Available";
  return user.is_online ? "Online" : "Offline";
}

function Modal({ title, subtitle, wide, children, onClose }: { title: string; subtitle?: string; wide?: boolean; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-2 backdrop-blur-[2px] sm:p-4">
      <div className={`flex max-h-[92vh] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ${wide ? "w-full max-w-6xl" : "w-full max-w-xl"}`}>
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-[#4A86F7]">{title}</p>
            {subtitle && <h2 className="mt-0.5 truncate text-[16px] font-bold tracking-tight text-[#13263A]">{subtitle}</h2>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-[#F4F7FB] p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
function FormSection({ title, icon: Icon, children }: { title: string; icon: typeof UserRound; children: React.ReactNode }) { return <section className="rounded-xl border border-slate-200 bg-white p-3.5"><div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]"><Icon size={14} /></span><h3 className="text-[11px] font-bold text-[#13263A]">{title}</h3></div><div className="space-y-3">{children}</div></section>; }
function Field({ label, value, onChange, type = "text", required = false, placeholder = "", readOnly = false, min }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; placeholder?: string; readOnly?: boolean; min?: string }) { return <label className="block"><span className="mb-1.5 block text-[9px] font-bold text-slate-600">{label}</span><input required={required} value={value} type={type} step={type === "number" ? "0.25" : undefined} min={type === "number" ? "0" : min} readOnly={readOnly} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`h-9 w-full rounded-lg border border-slate-200 px-3 text-[10px] font-medium outline-none transition placeholder:text-slate-400 ${readOnly ? "cursor-not-allowed bg-slate-100 text-slate-500" : "bg-[#F8FAFD] text-slate-700 focus:border-blue-300 focus:bg-white"}`} /></label>; }
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block"><span className="mb-1.5 block text-[9px] font-bold text-slate-600">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="min-h-20 w-full resize-y rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2.5 text-[10px] font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white" /></label>; }
function CleanerPicker({ cleaners, selected, onChange }: { cleaners: CleanerUser[]; selected: string[]; onChange: (ids: string[]) => void }) {
  return <div>
    <div className="mb-2 flex items-center justify-between gap-3">
      <p className="text-[10px] font-bold text-[#13263A]">Assign Cleaner <span className="font-normal text-slate-400">(one or more)</span></p>
      <span className="rounded-md bg-slate-100 px-2 py-1 text-[8px] font-bold text-slate-500">{selected.length} selected</span>
    </div>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {cleaners.map((cleaner) => {
        const active = selected.includes(cleaner.id);
        return <button
          type="button"
          key={cleaner.id}
          onClick={() => onChange(active ? selected.filter((id) => id !== cleaner.id) : [...selected, cleaner.id])}
          className={`flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition ${active ? "border-[#4A86F7] bg-blue-50 text-[#13263A]" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/40"}`}
        >
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 truncate text-[10px] font-bold">{active && <Check size={12} className="text-[#4A86F7]" />}{cleaner.name}</span>
            <span className="mt-0.5 block truncate text-[8px] text-slate-400">{cleaner.email}</span>
          </span>
          <span className={`shrink-0 rounded-md px-2 py-1 text-[7px] font-extrabold uppercase ${active ? "bg-[#4A86F7] text-white" : "bg-emerald-50 text-emerald-700"}`}>{cleaner.role_label || labelRole(cleaner.role)}</span>
        </button>;
      })}
      {!cleaners.length && <div className="col-span-full rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[9px] text-slate-400">No active booking users are available for assignment.</div>}
    </div>
    {!!selected.length && <button type="button" onClick={() => onChange([])} className="mt-2 text-[9px] font-bold text-rose-500">Clear all</button>}
  </div>;
}
function Detail({ label, value, wide = false }: { label: string; value: string | null; wide?: boolean }) {
  return <div className={`min-w-0 rounded-lg border border-slate-100 bg-[#F8FAFD] px-3 py-2.5 ${wide ? "min-h-[64px]" : "min-h-[58px]"}`}><p className="text-[7px] font-extrabold uppercase tracking-[0.07em] text-slate-400">{label}</p><p className={`mt-1 break-words text-[9px] font-semibold leading-4 text-[#13263A] ${wide ? "whitespace-pre-wrap" : ""}`}>{value || "-"}</p></div>;
}
function ImageGroup({
  title,
  images,
  disabled = false,
  onReplace,
  onDelete,
}: {
  title: string;
  images: BookingImage[];
  disabled?: boolean;
  onReplace: (image: BookingImage) => void;
  onDelete: (image: BookingImage) => void | Promise<void>;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#F8FAFD] p-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10px] font-bold text-[#13263A]">{title}</h4>
        <span className="rounded-md bg-white px-2 py-1 text-[7px] font-bold text-slate-400">
          {images.length} image{images.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
            <a
              href={image.url}
              target="_blank"
              rel="noreferrer"
              className="group relative block aspect-[4/3] overflow-hidden rounded-md bg-slate-100"
              title={`View ${title.toLowerCase()} image`}
            >
              <img
                src={image.url}
                alt={image.name || `${title} service image`}
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/60 px-2 py-1 text-[7px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                <Eye size={9} /> View
              </span>
            </a>

            <div className="mt-1.5 grid grid-cols-3 gap-1">
              <a
                href={image.url}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-blue-50 px-1 text-[7px] font-bold text-[#4A86F7] transition hover:bg-blue-100"
              >
                <Download size={9} /> Download
              </a>

              <button
                type="button"
                onClick={() => onReplace(image)}
                disabled={disabled}
                className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-amber-50 px-1 text-[7px] font-bold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Pencil size={9} /> Replace
              </button>

              <button
                type="button"
                onClick={() => void onDelete(image)}
                disabled={disabled}
                className="inline-flex h-7 items-center justify-center gap-1 rounded-md bg-rose-50 px-1 text-[7px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={9} /> Delete
              </button>
            </div>
          </div>
        ))}

        {!images.length && (
          <p className="col-span-full rounded-lg border border-dashed border-slate-200 bg-white px-3 py-8 text-center text-[8px] text-slate-400">
            No {title.toLowerCase()} images.
          </p>
        )}
      </div>
    </div>
  );
}

function formatDate(date: string) { return new Date(`${date}T00:00:00`).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", year: "numeric" }); }
function formatDateCompact(date: string) { return new Date(`${date}T00:00:00`).toLocaleDateString("en-CA", { month: "short", day: "numeric" }); }
function formatTime(time: string) {
  const [hourValue = "0", minuteValue = "0"] = time.split(":");
  const hour24 = Number(hourValue);
  const minute = Number(minuteValue);
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}
function formatDateTime(value: string) { return new Date(value).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Edmonton" }); }
function formatManpowerTime(booking: Pick<BookingRecord, "manpower_min_hours" | "manpower_max_hours">) {
  const min = Number(booking.manpower_min_hours || 0);
  const max = Number(booking.manpower_max_hours || 0);
  if (!min && !max) return "-";
  const clean = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
  return `${clean(min)}-${clean(max)} hrs`;
}
function todayInBusinessTz() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Edmonton", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
function toDateInput(date: Date) { return date.toISOString().slice(0, 10); }
function isDateInCurrentWeek(value: string) { const date = new Date(`${value}T00:00:00`); const now = new Date(); const start = new Date(now); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); const end = new Date(start); end.setDate(start.getDate() + 7); return date >= start && date < end; }
function isDateInCurrentMonth(value: string) { const date = new Date(`${value}T00:00:00`); const now = new Date(); return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear(); }
