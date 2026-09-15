"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Car,
  Sparkles,
  Home,
  Building2,
  CalendarCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const iconMap: Record<string, any> = {
  home: Home,
  building2: Building2,
  truck: Car,
  sparkles: Sparkles,
};

const colorMap: Record<string, string> = {
  home: "text-blue-400",
  building2: "text-emerald-700",
  truck: "text-rose-700",
  sparkles: "text-purple-400",
};

interface Category {
  id: string;
  name: string;
  icon_str: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  pricing_type: string;
  icon_str: string;
  is_active: boolean;
}

interface Stats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
}

export default function DashboardHomePage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/customer-dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        // Fetch categories
        const { data: catData } = await supabase
          .from("categories")
          .select("id, name, icon_str")
          .order("created_at", { ascending: true });

        // Fetch services
        const { data: svcData } = await supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        // Fetch user's job stats
        const { data: jobsData } = await supabase
          .from("jobs")
          .select("status")
          .eq("customer_id", user.id);

        setCategories(catData || []);
        setServices(svcData || []);

        if (jobsData) {
          setStats({
            total: jobsData.length,
            pending: jobsData.filter((j) => j.status === "pending").length,
            completed: jobsData.filter((j) => j.status === "completed").length,
            cancelled: jobsData.filter(
              (j) => j.status === "cancelled" || j.status === "canceled",
            ).length,
          });
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const displayName = userData?.name || user?.email?.split("@")[0] || "User";

  const filteredServices = searchQuery.trim()
    ? services.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : services;

  if (loading && user) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#4A86F7]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 px-4 py-4 sm:px-5 lg:px-6">
      {/* Greeting */}
      <div className="mb-8">
        <p className="text-slate-500 text-sm">Welcome back,</p>
        <h2 className="text-2xl font-bold mt-1">{displayName} 👋</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          {
            label: "Total Bookings",
            value: stats.total,
            icon: CalendarCheck,
            color: "text-blue-700 bg-blue-50",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock3,
            color: "text-amber-700 bg-amber-50",
          },
          {
            label: "Completed",
            value: stats.completed,
            icon: CheckCircle2,
            color: "text-emerald-700 bg-emerald-50",
          },
          {
            label: "Cancelled",
            value: stats.cancelled,
            icon: XCircle,
            color: "text-rose-700 bg-rose-50",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}
              >
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-slate-500 text-xs mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
          size={24}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder='Search for "Deep Cleaning"'
          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-14 pr-5 text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Banner */}
      <div className="relative mb-8 overflow-hidden rounded-xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
        <div className="relative z-10 max-w-md">
          <span className="mb-3 inline-block rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A86F7] shadow-sm">
            LIMITED OFFER
          </span>
          <h2 className="text-4xl font-bold leading-tight mb-3">
            Kitchen Sanitization Starts at $49
          </h2>
          <p className="text-slate-600">Expert deep cleaning service</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-[35%] bg-white/60 blur-3xl" />
      </div>

      {/* Categories */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-bold">Service Categories</h3>
        <Link href="/customer-dashboard/booking" className="text-[#4A86F7] font-semibold">
          See All
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-12">
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon_str] || Home;
          const color = colorMap[cat.icon_str] || "text-blue-400";
          return (
            <div
              key={cat.id}
              className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm hover:border-blue-500 transition cursor-pointer"
              onClick={() => router.push(`/customer-dashboard/booking?category=${cat.id}`)}
            >
              <div
                className={`mx-auto mb-4 w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center ${color}`}
              >
                <Icon size={30} />
              </div>
              <p className="font-semibold">{cat.name}</p>
            </div>
          );
        })}
      </div>

      {/* Services */}
      <h3 className="text-3xl font-bold mb-8">
        {searchQuery ? "Search Results" : "Recommended Services"}
      </h3>

      {filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-500">
            No services found for &quot;{searchQuery}&quot;
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {filteredServices.map((service) => {
            const Icon = iconMap[service.icon_str] || Home;
            return (
              <div
                key={service.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-blue-400 flex-shrink-0 mx-auto sm:mx-0">
                    <Icon size={24} />
                  </div>

                  <div className="flex-1">
                    <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-blue-400 mb-3">
                      {service.pricing_type === "both"
                        ? "FIXED & HOURLY"
                        : service.pricing_type?.toUpperCase()}
                    </span>

                    <h4 className="text-lg md:text-xl font-bold mb-2 leading-tight">
                      {service.title}
                    </h4>

                    <p className="text-slate-500 leading-6 mb-5 text-sm">
                      {service.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                      <div>
                        <h5 className="text-xl md:text-2xl font-bold text-blue-400">
                          CAD ${service.price}
                        </h5>
                      </div>

                      <Link
                        href={`/customer-dashboard/booking?service=${service.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-[#4A86F7] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#2563EB]"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
