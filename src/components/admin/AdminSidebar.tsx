"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  GalleryHorizontal,
  Headphones,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings2,
  ShieldCheck,
  UserCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type AdminLink = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: string[];
  crmAccess?: boolean;
};

type AdminGroup = {
  label: string;
  links: AdminLink[];
};

const groups: AdminGroup[] = [
  {
    label: "Workspace",
    links: [
      {
        label: "Overview",
        href: "/admin-dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Custom Requests",
        href: "/admin-dashboard/custom-requests",
        icon: ClipboardList,
      },
      {
        label: "Bookings",
        href: "/admin-dashboard/bookings",
        icon: CalendarDays,
      },
      {
        label: "Calendar",
        href: "/admin-dashboard/booking-records",
        icon: ClipboardCheck,
        roles: ["admin", "data_entry", "cleaner"],
      },
      {
        label: "Customers",
        href: "/admin-dashboard/customers",
        icon: Users,
      },
      {
        label: "Cleaners",
        href: "/admin-dashboard/manage/cleaners",
        icon: UserCheck,
      },
      {
        label: "Payments",
        href: "/admin-dashboard/manage/payments",
        icon: Banknote,
      },
      {
        label: "Reports",
        href: "/admin-dashboard/manage/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Operations",
    links: [
      {
        label: "Services",
        href: "/admin-dashboard/services",
        icon: Wrench,
      },
      {
        label: "All Users",
        href: "/admin-dashboard/users",
        icon: UserCheck,
      },
      {
        label: "Verification",
        href: "/admin-dashboard/manage/verification",
        icon: ShieldCheck,
      },
      {
        label: "Support",
        href: "/admin-dashboard/manage/support",
        icon: Headphones,
      },
      {
        label: "Leave Requests",
        href: "/admin-dashboard/manage/leave",
        icon: ClipboardCheck,
      },
      {
        label: "CRM Dashboard",
        href: "/admin-dashboard/crm",
        icon: LayoutDashboard,
        crmAccess: true,
      },
      {
        label: "Invoices",
        href: "/admin-dashboard/crm/invoices",
        icon: ReceiptText,
        crmAccess: true,
      },
      {
        label: "CRM Reports",
        href: "/admin-dashboard/crm/reports",
        icon: BarChart3,
        crmAccess: true,
      },
      {
        label: "Reconciliation",
        href: "/admin-dashboard/crm/reconciliation",
        icon: Banknote,
        roles: ["admin"],
      },
      {
        label: "Email & Reminders",
        href: "/admin-dashboard/crm/email-settings",
        icon: Settings2,
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Content",
    links: [
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
        roles: ["admin", "data_entry", "cleaner"],
      },
      {
        label: "App Settings",
        href: "/admin-dashboard/manage/settings",
        icon: Settings2,
      },
      {
        label: "Estimator Settings",
        href: "/admin-dashboard/estimator-settings",
        icon: Settings2,
        roles: ["admin"],
      },
    ],
  },
];

export default function AdminSidebar({
  role = "admin",
  canAccessCrm = false,
}: {
  role?: string;
  canAccessCrm?: boolean;
}) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    setOpen(false);

    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.assign("/login");
    }
  };

  const isActive = (href: string) => {
    if (href === "/admin-dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navigation = (
    <>
      <div
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pr-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#4F6478 transparent",
          scrollbarGutter: "stable",
        }}
      >
        {groups.map((group) => {
          const visibleLinks = group.links.filter((item) => {
            if (role === "admin") return true;
            if (item.crmAccess) return canAccessCrm;
            return Boolean(item.roles?.includes(role));
          });

          if (!visibleLinks.length) return null;

          return (
            <div
              key={group.label}
              className="mb-5"
            >
              <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#718296]">
                {group.label}
              </p>

              <nav className="space-y-1">
                {visibleLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
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

                      <span className="truncate">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
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
    </>
  );

  return (
    <>
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0C2134] px-4 lg:hidden">
        {/* Changed href from /admin-dashboard to / */}
        <Link href="/">
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
          aria-label="Open admin menu"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-white"
        >
          <Menu size={19} />
        </button>
      </header>

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[236px] flex-col border-r border-white/[0.08] bg-[#0C2134] px-4 py-4 lg:flex">
        {/* Changed href from /admin-dashboard to / */}
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

        {navigation}
      </aside>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"
          />

          <aside className="relative flex h-full w-[255px] max-w-[82vw] flex-col border-r border-white/10 bg-[#0C2134] px-4 py-4 text-white shadow-2xl">
            <div className="mb-4 flex h-[54px] shrink-0 items-center justify-between border-b border-white/[0.07] pb-3">
              {/* Added Link wrapper here pointing to / */}
              <Link href="/">
                <Image
                  src="/logo.webp"
                  alt="Camz Cleaning"
                  width={135}
                  height={50}
                  className="h-9 w-auto brightness-0 invert"
                />
              </Link>

              <button
                type="button"
                aria-label="Close admin menu"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.07] transition hover:bg-white/10"
              >
                <X size={17} />
              </button>
            </div>

            {navigation}
          </aside>
        </div>
      )}
    </>
  );
}
