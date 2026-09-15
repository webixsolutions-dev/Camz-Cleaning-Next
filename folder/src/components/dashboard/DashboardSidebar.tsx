"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  PlusCircle,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  {
    name: "Overview",
    href: "/customer-dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Bookings",
    href: "/customer-dashboard/bookings",
    icon: CalendarCheck,
  },
  {
    name: "Book Service",
    href: "/customer-dashboard/booking",
    icon: PlusCircle,
  },
  {
    name: "Favorites",
    href: "/customer-dashboard/favorites",
    icon: Heart,
  },
  {
    name: "Settings",
    href: "/customer-dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.assign("/login");
    }
  };

  const isActive = (href: string) => {
    if (href === "/customer-dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[236px] flex-col border-r border-white/[0.08] bg-[#0C2134] px-4 py-4 text-white lg:flex">
      <Link
        href="/"
        className="mb-4 flex h-[58px] shrink-0 items-center border-b border-white/[0.07] pb-3"
      >
        <Image
          src="/logo.webp"
          alt="Camz Cleaning"
          width={145}
          height={54}
          priority
          className="h-[43px] w-auto object-contain brightness-0 invert"
        />
      </Link>

      <div className="min-h-0 flex-1 overflow-y-auto pr-2">
        <div className="mb-5">
          <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#718296]">
            Customer
          </p>

          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "group relative flex h-10 items-center gap-3 overflow-hidden rounded-xl px-3",
                    "text-[12.5px] font-semibold transition-all duration-200",
                    active
                      ? "bg-[#F7F9FC] text-[#10243A] shadow-sm"
                      : "text-[#9CACBC] hover:bg-[#17344D] hover:text-white",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-[#4A86F7]" />
                  )}

                  <Icon
                    size={17}
                    strokeWidth={1.9}
                    className={
                      active
                        ? "text-[#4A86F7]"
                        : "text-[#8294A6] transition group-hover:text-white"
                    }
                  />

                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="mt-2 shrink-0 border-t border-white/[0.07] pt-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#30485F] bg-[#142B40] px-3 text-[13px] font-bold text-white transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-wait disabled:opacity-50"
        >
          <LogOut size={17} />
          {loggingOut ? "Logging out..." : "Sign out"}
        </button>
      </div>
    </aside>
  );
}
