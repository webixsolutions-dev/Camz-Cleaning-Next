"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  MapPin,
  ChevronRight,
  CalendarCheck2,
  CheckCircle2,
  Headphones,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeCount, setActiveCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      setLoading(false);
      router.push("/login?redirect=/customer-dashboard/settings");
    }
  }, [authLoading, user, router]);

  // Fetch booking counts
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchBookingCounts = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        // Fetch active bookings count (pending, assigned, in_progress, accepted)
        const { count: activeCountData, error: activeError } = await supabase
          .from("jobs")
          .select("*", { count: "exact", head: true })
          .eq("customer_id", user.id)
          .in("status", ["pending", "assigned", "in_progress", "accepted"]);

        if (activeError) throw activeError;
        if (!cancelled) setActiveCount(activeCountData || 0);

        // Fetch completed bookings count
        const { count: completedCountData, error: completedError } =
          await supabase
            .from("jobs")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", user.id)
            .eq("status", "completed");

        if (completedError) throw completedError;
        if (!cancelled) setCompletedCount(completedCountData || 0);
      } catch (err) {
        console.error("Error fetching booking counts:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBookingCounts();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  // Get user's display name (from userData if available, else email)
  const displayName = userData?.name || user?.email?.split("@")[0] || "User";

  // Get first letter for avatar
  const initial = displayName.charAt(0).toUpperCase();

  // Get user email
  const userEmail = user?.email || "No email";

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#4A86F7] mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 pb-10">
      {/* Top Gradient */}
      <div className="mx-4 mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:mx-5 lg:mx-6">
        {/* Blur Circle */}
        <div className="absolute right-[-50px] top-[-50px] h-[160px] w-[160px] rounded-full bg-blue-50" />

        {/* Avatar */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-slate-300 bg-white text-4xl font-bold text-[#4A86F7] shadow-xl">
            {initial}
          </div>

          <h2 className="mt-4 text-2xl font-bold">{displayName}</h2>

          <p className="mt-1 text-sm text-slate-500">{userEmail}</p>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5 lg:px-6">
        {/* Stats */}
        <div className="mb-7 grid grid-cols-2 gap-3">
          {/* Active */}
          <div className="rounded-xl border border-[#4A86F7]/20 bg-white p-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-[#4A86F7]">
              <CalendarCheck2 size={22} />
            </div>

            <h3 className="text-3xl font-bold">{activeCount}</h3>

            <p className="mt-1 text-xs uppercase tracking-[3px] text-slate-500">
              Active
            </p>
          </div>

          {/* Done */}
          <div className="rounded-xl border border-green-500/20 bg-white p-4 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-green-500">
              <CheckCircle2 size={22} />
            </div>

            <h3 className="text-3xl font-bold">{completedCount}</h3>

            <p className="mt-1 text-xs uppercase tracking-[3px] text-slate-500">
              Done
            </p>
          </div>
        </div>

        {/* ACCOUNT SETTINGS */}
        <div className="mb-8">
          <h4 className="mb-3 text-[11px] uppercase tracking-[4px] text-slate-500">
            Account Settings
          </h4>

          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
            {/* Personal */}
            <Link
              href="/customer-dashboard/settings/personal-information"
              className="flex items-center justify-between border-b border-slate-200 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-[#4A86F7]">
                  <User size={18} />
                </div>

                <span className="text-sm font-medium">
                  Personal Information
                </span>
              </div>

              <ChevronRight size={18} className="text-slate-500" />
            </Link>

            {/* Addresses */}
            <Link
              href="/customer-dashboard/settings/saved-addresses"
              className="flex items-center justify-between border-b border-slate-200 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-[#4A86F7]">
                  <MapPin size={18} />
                </div>

                <span className="text-sm font-medium">Saved Addresses</span>
              </div>

              <ChevronRight size={18} className="text-slate-500" />
            </Link>

            {/* Help */}
            <Link
              href="/customer-dashboard/settings/help-center"
              className="flex items-center justify-between px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-[#4A86F7]">
                  <Headphones size={18} />
                </div>

                <span className="text-sm font-medium">Help Center</span>
              </div>

              <ChevronRight size={18} className="text-slate-500" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
