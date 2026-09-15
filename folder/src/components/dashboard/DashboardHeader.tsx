"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, RefreshCw, UserRound } from "lucide-react";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardHeader() {
  const [open, setOpen] = useState(false);
  const { user, userData } = useAuth();

  const displayName = userData?.name || user?.email?.split("@")[0] || "Customer";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <MobileSidebar open={open} setOpen={setOpen} />

      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0C2134] px-4 lg:hidden">
        <Link href="/customer-dashboard">
          <Image
            src="/logo.webp"
            alt="Camz Cleaning"
            width={130}
            height={48}
            priority
            className="h-8 w-auto brightness-0 invert"
          />
        </Link>

        <button
          type="button"
          aria-label="Open customer menu"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white"
        >
          <Menu size={19} />
        </button>
      </header>

      {/* DESKTOP HEADER */}
      <header className="customer-dashboard-header sticky top-0 z-30 hidden h-[68px] items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm lg:flex">
        <div>
          <h1 className="font-bold text-[#13263A]">Customer Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Manage your bookings, favorites, and account settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            aria-label="Refresh dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
          >
            <RefreshCw size={17} />
          </button>

          <div
            className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-50 px-2.5 text-[12px] font-bold text-[#4A86F7]"
            title={displayName}
          >
            <UserRound size={16} className="mr-1.5" />
            <span className="max-w-[120px] truncate">{displayName || initial}</span>
          </div>
        </div>
      </header>
    </>
  );
}
