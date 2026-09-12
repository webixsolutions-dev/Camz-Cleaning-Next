import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  ClipboardCheck,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

import "./admin.css";

export const metadata: Metadata = {
  title: "Admin Dashboard | Camz Cleaning",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin-dashboard");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role?.toLowerCase();

  if (
    !profile ||
    profile.is_blocked ||
    !["admin", "data_entry", "cleaner"].includes(role || "")
  ) {
    redirect("/customer-dashboard");
  }

  const shell =
    role === "cleaner"
      ? {
          title: "Cleaner Dashboard",
          subtitle:
            "View bookings, schedules, service progress, and before/after images.",
          icon: UserCheck,
          iconClass:
            "bg-emerald-50 text-emerald-600",
        }
      : role === "data_entry"
        ? {
            title: "Data Entry Dashboard",
            subtitle:
              "Create booking records and manage submitted job details.",
            icon: ClipboardCheck,
            iconClass:
              "bg-orange-50 text-orange-600",
          }
        : {
            title: "Admin Dashboard",
            subtitle:
              "Manage customer requests and operations.",
            icon: ShieldCheck,
            iconClass:
              "bg-blue-50 text-[#4A86F7]",
          };

  const ShellIcon = shell.icon;

  return (
    <AuthProvider>
      <div className="admin-dashboard-scope min-h-screen bg-[#F4F7FB]">
        <AdminSidebar role={role || "admin"} />

        <div className="lg:ml-[236px]">
          {/* DESKTOP HEADER */}
          <header className="admin-dashboard-header sticky top-0 z-30 hidden h-[68px] items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm lg:flex">
            <div>
              <h1 className="font-bold text-[#13263A]">
                {shell.title}
              </h1>

              <p className="mt-1 text-slate-500">
                {shell.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/admin-dashboard/booking-records"
                aria-label="Refresh dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
              >
                <RefreshCw size={17} />
              </a>

              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${shell.iconClass}`}
              >
                <ShellIcon size={17} />
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="min-h-[calc(100vh-68px)] bg-[#F4F7FB]">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}