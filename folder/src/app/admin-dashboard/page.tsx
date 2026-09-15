import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GalleryHorizontal,
  Headphones,
  Images,
  ShieldCheck,
  TrendingUp,
  Umbrella,
  UserCheck,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const consoleItems = [
  {
    label: "Users",
    href: "/admin-dashboard/customers",
    icon: Users,
  },
  {
    label: "Verify",
    href: "/admin-dashboard/manage/verification",
    icon: UserCheck,
  },
  {
    label: "Support",
    href: "/admin-dashboard/manage/support",
    icon: ClipboardCheck,
  },
  {
    label: "Leave",
    href: "/admin-dashboard/manage/leave",
    icon: Umbrella,
  },
  {
    label: "Financials",
    href: "/admin-dashboard/manage/payments",
    icon: Banknote,
  },
  {
    label: "Gallery",
    href: "/admin-dashboard/manage/gallery",
    icon: GalleryHorizontal,
  },
  {
    label: "Blog",
    href: "/admin-dashboard/blogs",
    icon: BookOpen,
  },
  {
    label: "Before / After",
    href: "/admin-dashboard/before-after",
    icon: Images,
  },
];

function statusClasses(status?: string | null) {
  const value = String(status || "").toLowerCase();

  if (value === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (["cancelled", "canceled", "rejected"].includes(value)) {
    return "bg-rose-50 text-rose-700";
  }

  if (["confirmed", "approved", "accepted"].includes(value)) {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { data: users },
    { data: jobs },
    { data: availability },
    { data: requests },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id, name, role, approval_status, is_blocked"),

    supabase
      .from("jobs")
      .select("id, service_name, status, customer_id, created_at, date")
      .order("created_at", { ascending: false }),

    supabase.from("cleaner_availability").select("*"),

    supabase
      .from("custom_cleaning_requests")
      .select("id, status"),
  ]);

  const allUsers = users || [];
  const allJobs = jobs || [];
  const allRequests = requests || [];

  const customers = allUsers.filter(
    (user) => user.role?.toLowerCase() === "customer",
  ).length;

  const cleaners = allUsers.filter(
    (user) => user.role?.toLowerCase() === "cleaner",
  ).length;

  const admins = allUsers.filter(
    (user) => user.role?.toLowerCase() === "admin",
  ).length;

  const completed = allJobs.filter(
    (job) => job.status?.toLowerCase() === "completed",
  ).length;

  const pending = allJobs.filter(
    (job) => job.status?.toLowerCase() === "pending",
  ).length;

  const total = allJobs.length;

  const completedPercent = total
    ? Math.round((completed / total) * 100)
    : 0;

  const pendingPercent = total
    ? Math.round((pending / total) * 100)
    : 0;

  const working = (availability || []).filter((row) =>
    ["working", "busy", "on_job"].includes(
      String(row.status || row.availability_status || "").toLowerCase(),
    ),
  ).length;

  const available = (availability || []).filter(
    (row) =>
      row.is_available === true ||
      String(row.status || row.availability_status || "").toLowerCase() ===
        "available",
  ).length;

  const dayKeys = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });

  const weekly = dayKeys.map((date) => {
    const nextDay = new Date(date.getTime() + 86400000);

    return allJobs.filter((job) => {
      if (!job.created_at) return false;

      const created = new Date(job.created_at);

      return created >= date && created < nextDay;
    }).length;
  });

  const maxWeekly = Math.max(...weekly, 1);
  const weeklyTotal = weekly.reduce((sum, value) => sum + value, 0);

  const highestWeeklyValue = Math.max(...weekly);
  const busiestDayIndex = weekly.indexOf(highestWeeklyValue);

  const busiestDay =
    weeklyTotal > 0
      ? dayKeys[busiestDayIndex].toLocaleDateString("en-CA", {
          weekday: "short",
        })
      : "—";

  const health = [
    {
      label: "Customers",
      value: customers,
      icon: Users,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Cleaners",
      value: cleaners,
      icon: UserCheck,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Admins",
      value: admins,
      icon: ShieldCheck,
      iconClass: "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Total Bookings",
      value: total,
      icon: CalendarDays,
      iconClass: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        {/* INTRO */}
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#4A86F7]">
              Camz Cleaning
            </p>

            <h1 className="mt-1 font-bold tracking-tight text-[#13263A]">
              Admin Overview
            </h1>

            <p className="mt-1 text-slate-500">
              Live overview of customers, bookings, staff and requests.
            </p>
          </div>

          <Link
            href="/admin-dashboard/custom-requests"
            className="inline-flex h-9 w-fit items-center gap-2 rounded-lg bg-[#4A86F7] px-4 text-[11px] font-bold text-white shadow-sm transition hover:bg-blue-600"
          >
            {allRequests.length} custom requests
            <ArrowRight size={14} />
          </Link>
        </section>

        {/* PLATFORM HEALTH */}
        <section className="mt-5">
          <div className="mb-3">
            <h2 className="font-bold tracking-tight text-[#13263A]">
              Platform Health
            </h2>

            <p className="mt-0.5 text-slate-500">
              Current platform totals
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {health.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
                        {item.label}
                      </p>

                      <div className="mt-2 text-[22px] font-bold leading-none text-[#13263A]">
                        {item.value}
                      </div>
                    </div>

                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.iconClass}`}
                    >
                      <Icon size={17} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* BOOKING ANALYTICS + CLEANER STATUS */}
        <section className="mt-5 grid gap-4 xl:grid-cols-[1.45fr_.55fr]">
          {/* BOOKING ANALYTICS */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]">
                  <TrendingUp size={17} />
                </span>

                <div>
                  <h2 className="font-bold text-[#13263A]">
                    Booking Analytics
                  </h2>

                  <p className="mt-0.5 text-slate-500">
                    Last 7 days booking performance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-1.5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    This Week
                  </span>

                  <span className="ml-2 text-[13px] font-extrabold text-[#13263A]">
                    {weeklyTotal}
                  </span>
                </div>

                <Link
                  href="/admin-dashboard/bookings"
                  className="inline-flex h-8 items-center rounded-lg px-2.5 text-[10px] font-bold text-[#4A86F7] transition hover:bg-blue-50"
                >
                  View bookings
                </Link>
              </div>
            </div>

            <div className="p-5">
              {/* SMALL SUMMARY CARDS */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2.5">
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                    Total Bookings
                  </div>

                  <div className="mt-1 text-[19px] font-extrabold leading-none text-[#13263A]">
                    {total}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2.5">
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                    This Week
                  </div>

                  <div className="mt-1 text-[19px] font-extrabold leading-none text-[#13263A]">
                    {weeklyTotal}
                  </div>
                </div>

                <div className="col-span-2 rounded-lg border border-slate-200 bg-[#F8FAFD] px-3 py-2.5 sm:col-span-1">
                  <div className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                    Busiest Day
                  </div>

                  <div className="mt-1 text-[19px] font-extrabold leading-none text-[#13263A]">
                    {busiestDay}
                  </div>
                </div>
              </div>

              {/* WEEKLY CHART */}
              <div className="mt-4 rounded-xl border border-slate-100 bg-[#F8FAFD] px-4 pb-3 pt-4">
                <div className="flex h-[170px] items-end justify-between gap-2 sm:gap-3">
                  {weekly.map((value, index) => {
                    const isHighest =
                      value === highestWeeklyValue && value > 0;

                    return (
                      <div
                        key={dayKeys[index].toISOString()}
                        className="group flex h-full flex-1 flex-col items-center justify-end"
                      >
                        <div className="mb-1.5 flex min-h-[20px] items-center justify-center">
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold ${
                              isHighest
                                ? "bg-blue-100 text-blue-700"
                                : "text-slate-500"
                            }`}
                          >
                            {value}
                          </span>
                        </div>

                        <div className="flex h-[110px] w-full items-end justify-center">
                          <div
                            className={`w-full max-w-[34px] rounded-t-md transition-all duration-300 ${
                              isHighest
                                ? "bg-[#4A86F7] shadow-[0_5px_12px_rgba(74,134,247,0.22)]"
                                : value > 0
                                  ? "bg-blue-300 group-hover:bg-blue-400"
                                  : "bg-slate-200"
                            }`}
                            style={{
                              height: `${Math.max(
                                (value / maxWeekly) * 105,
                                value ? 18 : 4,
                              )}px`,
                            }}
                          />
                        </div>

                        <div className="mt-2 text-[9px] font-extrabold uppercase tracking-[0.04em] text-slate-400">
                          {dayKeys[index].toLocaleDateString("en-CA", {
                            weekday: "short",
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COMPLETED / PENDING */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm">
                        <CheckCircle2 size={15} />
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-[#263A4D]">
                          Completed
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-500">
                          {completed} of {total} bookings
                        </div>
                      </div>
                    </div>

                    <div className="text-[20px] font-extrabold text-emerald-600">
                      {completedPercent}%
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${completedPercent}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
                        <CalendarDays size={15} />
                      </div>

                      <div>
                        <div className="text-[11px] font-bold text-[#263A4D]">
                          Pending
                        </div>

                        <div className="mt-0.5 text-[9px] text-slate-500">
                          {pending} awaiting action
                        </div>
                      </div>
                    </div>

                    <div className="text-[20px] font-extrabold text-amber-600">
                      {pendingPercent}%
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{
                        width: `${pendingPercent}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CLEANER STATUS */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-bold text-[#13263A]">
              Cleaner Status
            </h2>

            <p className="mt-0.5 text-slate-500">
              Live availability overview
            </p>

            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/60 p-3.5">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                    Working Now
                  </p>

                  <div className="mt-1 text-[21px] font-bold text-blue-600">
                    {working}
                  </div>
                </div>

                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Headphones size={17} />
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/60 p-3.5">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                    Available
                  </p>

                  <div className="mt-1 text-[21px] font-bold text-emerald-600">
                    {available}
                  </div>
                </div>

                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={17} />
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* MANAGEMENT CONSOLE */}
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-bold text-[#13263A]">
            Management Console
          </h2>

          <p className="mt-0.5 text-slate-500">
            Quick access to admin modules
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-8">
            {consoleItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex min-h-[82px] flex-col items-center justify-center rounded-lg border border-slate-200 bg-[#F8FAFD] p-2.5 text-center transition hover:border-[#4A86F7]/40 hover:bg-blue-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#4A86F7] shadow-sm transition group-hover:bg-[#4A86F7] group-hover:text-white">
                    <Icon size={16} />
                  </span>

                  <span className="mt-2 text-[10px] font-bold text-[#23384C]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* RECENT ACTIVITY */}
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#13263A]">
                Recent Activity
              </h2>

              <p className="mt-0.5 text-slate-500">
                Latest booking records
              </p>
            </div>

            <Link
              href="/admin-dashboard/bookings"
              className="text-[10px] font-bold text-[#4A86F7] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
            {allJobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                className="flex items-center gap-3 border-b border-slate-100 bg-white px-3.5 py-2.5 last:border-b-0 hover:bg-slate-50"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#4A86F7]" />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[11px] font-bold text-[#21364A]">
                    {job.service_name || "Cleaning service"}
                  </div>

                  <div className="mt-0.5 text-[9px] text-slate-400">
                    {job.created_at
                      ? new Date(job.created_at).toLocaleString("en-CA", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "No date"}
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-[8px] font-bold uppercase ${statusClasses(
                    job.status,
                  )}`}
                >
                  {job.status || "Pending"}
                </span>
              </div>
            ))}

            {!allJobs.length && (
              <p className="px-5 py-8 text-center text-slate-400">
                No booking activity yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
