"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Car,
  CheckCircle2,
  Clock3,
  Home,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import BookingModal from "@/components/models/Booking";
import { useAuth } from "@/hooks/useAuth";
import type { Category, Service } from "@/components/booking/BookingClient";

type Props = {
  categories: Category[];
  services: Service[];
  initialCategoryId?: string;
  initialServiceId?: string;
};

const serviceImageMap: Record<string, string> = {
  residential: "/residential.webp",
  move_in_out: "/seasonal.webp",
  commercial: "/commercial-cleaning.webp",
  vehicle: "/vehicle.webp",
  specialty: "/work.webp",
};

const categoryIcon = (icon: string) => {
  switch (icon) {
    case "building2":
      return Building2;
    case "truck":
      return Car;
    case "sparkles":
      return Sparkles;
    default:
      return Home;
  }
};

export default function CustomerBookingClient({
  categories,
  services,
  initialCategoryId,
  initialServiceId,
}: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const autoOpened = useRef(false);

  const validInitialCategory =
    initialCategoryId && categories.some((item) => item.id === initialCategoryId)
      ? initialCategoryId
      : "All";

  const [activeCategory, setActiveCategory] = useState(validInitialCategory);
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/customer-dashboard/booking");
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      !initialServiceId ||
      autoOpened.current
    ) {
      return;
    }

    const service = services.find((item) => item.id === initialServiceId);

    if (service) {
      autoOpened.current = true;
      setSelectedService(service);
      setActiveCategory(service.category_id || "All");
      setBookingOpen(true);
    }
  }, [authLoading, initialServiceId, services, user]);

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return services.filter((service) => {
      const categoryMatch =
        activeCategory === "All" || service.category_id === activeCategory;
      const textMatch =
        !normalized ||
        service.title.toLowerCase().includes(normalized) ||
        service.description?.toLowerCase().includes(normalized);

      return categoryMatch && textMatch;
    });
  }, [activeCategory, query, services]);

  const openBooking = (service: Service) => {
    setSelectedService(service);
    setBookingOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#4A86F7]" />
          <p className="mt-3 text-sm text-slate-500">Loading booking options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FB] px-4 py-4 text-slate-900 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#4A86F7]">
            Customer Booking
          </p>
          <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#13263A]">
                Book a Cleaning Service
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Choose a service and submit your preferred appointment without leaving your dashboard.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/customer-dashboard/bookings")}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#4A86F7]"
            >
              View My Bookings
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-bold text-[#13263A]">Choose a service</h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Filter by category or search for the service you need.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search services..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setActiveCategory("All")}
              className={`h-9 shrink-0 rounded-lg px-3 text-[11px] font-bold transition ${
                activeCategory === "All"
                  ? "bg-[#4A86F7] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              All Services
            </button>

            {categories.map((category) => {
              const Icon = categoryIcon(category.icon_str);
              const active = activeCategory === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[11px] font-bold transition ${
                    active
                      ? "bg-[#4A86F7] text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-4">
          {filteredServices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
              <p className="font-bold text-[#13263A]">No services found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try another category or search term.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service) => {
                const Icon = categoryIcon(service.icon_str);

                return (
                  <article
                    key={service.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="relative h-40 bg-slate-100">
                      <Image
                        src={serviceImageMap[service.service_type] || "/p4.webp"}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                      <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-[#13263A] shadow-sm">
                        {service.price}
                      </span>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#4A86F7]">
                          <Icon size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold leading-5 text-[#13263A]">
                            {service.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
                          <Clock3 size={13} className="text-[#4A86F7]" />
                          Preferred time
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-2">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          Scope reviewed
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openBooking(service)}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#4A86F7] px-4 text-[11px] font-bold text-white transition hover:bg-[#2563EB]"
                      >
                        Book This Service
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        isGuest={false}
      />
    </div>
  );
}
