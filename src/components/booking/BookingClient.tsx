"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Home,
  Info,
  Lock,
  ShieldCheck,
  Sofa,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

import BookingModal from "@/components/models/Booking";
import { useAuth } from "@/hooks/useAuth";
import type { CleaningPricingConfig } from "@/lib/pricing/config";
import {
  resolveCleaningPricingScope,
  type CleaningPricingScope,
} from "@/lib/pricing/serviceScope";

export interface Category {
  id: string;
  name: string;
  icon_str: string;
  color_hex: string;
  type: string;
}

export interface Service {
  id: string;
  category_id: string;
  title: string;
  description: string;
  price: string;
  icon_str: string;
  pricing_type: string;
  service_type: string;
  is_active: boolean;
  has_addons: boolean;
  tax_rate: number;
  base_rate?: number;
  bedroom_rate?: number;
  washroom_rate?: number;
  hourly_rate?: number;
  sqft_rate?: number;
  vehicle_sedan_rate?: number;
  vehicle_suv_rate?: number;
  fridge_price?: number;
  oven_price?: number;
  window_price?: number;
}

interface BookingClientProps {
  services: Service[];
  // Kept optional for backward compatibility with older booking pages
  // and the customer-dashboard booking flow.
  categories?: Category[];
}

type ServiceCardDefinition = {
  scope: CleaningPricingScope;
  eyebrow: string;
  title: string;
  priceLabel: string;
  description: string;
  features: string[];
  badge?: string;
  icon: React.ReactNode;
  accentClass: string;
  iconClass: string;
};

const money0 = (cents: number) => `$${Math.round(cents / 100)}`;

const BookingClient = ({ services }: BookingClientProps) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [publicPricing, setPublicPricing] = useState<CleaningPricingConfig | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuestBooking, setIsGuestBooking] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showPricingPopup, setShowPricingPopup] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPricing = async () => {
      try {
        const response = await fetch("/api/pricing", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { config?: CleaningPricingConfig };
        if (!cancelled && payload.config) setPublicPricing(payload.config);
      } catch {
        // Keep the documented customer-facing fallback prices if the API is temporarily unavailable.
      }
    };

    void loadPricing();
    return () => {
      cancelled = true;
    };
  }, []);

  const serviceByScope = useMemo(() => {
    const result: Partial<Record<CleaningPricingScope, Service>> = {};

    for (const service of services) {
      const scope = resolveCleaningPricingScope(service);
      if (!scope) continue;

      if (!result[scope]) {
        result[scope] = service;
        continue;
      }

      // Prefer an explicitly named Standard service over a generic residential row.
      if (
        scope === "standard" &&
        /standard/i.test(service.title) &&
        !/standard/i.test(result.standard?.title ?? "")
      ) {
        result.standard = service;
      }
    }

    return result;
  }, [services]);

  const standardEssential =
    publicPricing?.services.standard.packages.find(
      (pkg) => pkg.id === "essential_standard",
    )?.basePriceCents ?? 9900;
  const standardComplete =
    publicPricing?.services.standard.packages.find(
      (pkg) => pkg.id === "complete_standard",
    )?.basePriceCents ?? 14900;
  const deepStart = publicPricing?.services.deep.startingPriceCents ?? 15900;
  const moveStart = publicPricing?.services.move_in_out.startingPriceCents ?? 19900;
  const carpetMinimum = publicPricing?.carpet.standaloneMinimumCents ?? 10000;

  const serviceCards: ServiceCardDefinition[] = [
    {
      scope: "standard",
      eyebrow: "Standard Cleaning",
      title: "Essential & Complete Standard Clean",
      priceLabel: `From ${money0(standardEssential)}`,
      description:
        "Choose the package that fits your home, then customize rooms and optional services with a live price update.",
      features: [
        `Essential: 1 bedroom + 1 full bathroom + kitchen + living area — ${money0(standardEssential)}`,
        `Complete: up to 2 bedrooms + 2 full bathrooms + kitchen + living area — ${money0(standardComplete)}`,
        "Vacuuming or sweeping and mopping in included areas",
        "Additional rooms are charged only when they exceed the package allowance",
      ],
      badge: "Most flexible",
      icon: <Home className="h-7 w-7" />,
      accentClass: "border-blue-200 bg-blue-50/70",
      iconClass: "bg-blue-600 text-white",
    },
    {
      scope: "deep",
      eyebrow: "Deep Cleaning",
      title: "Detailed Deep Clean",
      priceLabel: `From ${money0(deepStart)}`,
      description:
        "A dedicated deep-cleaning price based on property size, with extra attention to detailed surfaces and buildup.",
      features: [
        "Detailed baseboards, door frames, doors and switches",
        "Edges and corners with detailed bathroom attention",
        "Dedicated Deep Cleaning room increments",
        "Price increases according to the actual property size",
      ],
      icon: <Sparkles className="h-7 w-7" />,
      accentClass: "border-violet-200 bg-violet-50/70",
      iconClass: "bg-violet-600 text-white",
    },
    {
      scope: "move_in_out",
      eyebrow: "Move-In / Move-Out",
      title: "Empty-Home Turnover Clean",
      priceLabel: `From ${money0(moveStart)}`,
      description:
        "Designed for empty properties with size-based tiers and selected inside-appliance and cabinet cleaning already included.",
      features: [
        "Baseboards, doors, frames, switches and accessible floors",
        "Inside empty refrigerator and microwave included",
        "Inside oven in normal condition included",
        "Inside empty kitchen cabinets and drawers included",
      ],
      icon: <Building2 className="h-7 w-7" />,
      accentClass: "border-cyan-200 bg-cyan-50/70",
      iconClass: "bg-cyan-600 text-white",
    },
    {
      scope: "carpet",
      eyebrow: "Carpet Steam Cleaning",
      title: "Standalone or Add-On Carpet Care",
      priceLabel: `${money0(carpetMinimum)} minimum`,
      description:
        "Select carpeted rooms and areas individually. Standalone carpet cleaning always respects the minimum service price.",
      features: [
        "Standard carpeted rooms",
        "Living/larger rooms, hallways and carpeted stairs",
        "Small area rugs and heavy stain treatment",
        "Pet urine or odour treatment is sent for a custom quote",
      ],
      icon: <Sofa className="h-7 w-7" />,
      accentClass: "border-emerald-200 bg-emerald-50/70",
      iconClass: "bg-emerald-600 text-white",
    },
  ];

  const beginBooking = (scope: CleaningPricingScope) => {
    if (authLoading) return;

    const service = serviceByScope[scope];
    if (!service) return;

    setSelectedService(service);
    setSelectedServiceTitle(
      serviceCards.find((card) => card.scope === scope)?.eyebrow ?? service.title,
    );

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setIsGuestBooking(false);
    setIsModalOpen(true);
  };

  const scrollToServices = () => {
    document.getElementById("cleaning-services")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, 18, 0], y: [0, 10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl"
        />
        <motion.div
          aria-hidden="true"
          animate={{ x: [0, -16, 0], y: [0, -8, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl"
        />

        <div className="relative mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="max-w-4xl text-4xl font-black leading-[1.05] text-slate-950 sm:text-5xl lg:text-[3.45rem]"
            >
              Professional Home Cleaning From {money0(standardEssential)}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg"
            >
              Our {money0(standardEssential)} Essential Standard Clean is a real package for 1 bedroom,
              1 full bathroom, 1 kitchen and 1 living area. Customize your home and see the updated
              price before you confirm.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <button
                type="button"
                onClick={scrollToServices}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B4E9B] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-[#073f7d] active:scale-[0.985]"
              >
                Choose a service
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowPricingPopup(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.985]"
              >
                <Info className="h-4 w-4 text-blue-600" />
                How pricing works
              </button>
            </motion.div>
          </motion.div>

        </div>
      </section>

      <section className="relative z-10 -mt-2 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60 sm:p-7 lg:p-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
                How your price is built
              </span>
              <h2 className="mt-2 text-[2rem] font-black leading-tight text-slate-950 sm:text-[2.5rem]">
                Four simple steps from service to final total
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-500">
              Pick a plan, tailor it to your property and see every charge before you submit.
            </p>
          </div>

          <div className="relative mt-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  number: "01",
                  title: "Select service",
                  copy: "Pick the cleaning type that matches your home and the result you need.",
                  icon: <Home className="h-5 w-5" />,
                  tone: "bg-blue-50 text-blue-700",
                },
                {
                  number: "02",
                  title: "Customize property",
                  copy: "Add bedrooms, bathrooms, extra areas and only the add-ons that apply.",
                  icon: <Sparkles className="h-5 w-5" />,
                  tone: "bg-violet-50 text-violet-700",
                },
                {
                  number: "03",
                  title: "See live total",
                  copy: "Watch your subtotal and GST update instantly as you tailor the service.",
                  icon: <ShieldCheck className="h-5 w-5" />,
                  tone: "bg-emerald-50 text-emerald-700",
                },
                {
                  number: "04",
                  title: "Review & submit",
                  copy: "Check every detail, make edits if needed, then send your booking request.",
                  icon: <CheckCircle2 className="h-5 w-5" />,
                  tone: "bg-amber-50 text-amber-700",
                },
              ].map((step, index, arr) => (
                <div key={step.number} className="relative">
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    whileHover={{ y: -4 }}
                    className="relative h-full rounded-[1.45rem] border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.tone}`}>
                        {step.icon}
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-black tracking-[0.16em] text-slate-500">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="mt-6 text-[1.6rem] font-black leading-tight text-slate-900">{step.title}</h3>
                    <p className="mt-3 text-[15px] leading-7 text-slate-600">{step.copy}</p>
                  </motion.article>

                  {index < arr.length - 1 && (
                    <motion.div
                      aria-hidden="true"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 }}
                      className="pointer-events-none absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 xl:flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <section id="cleaning-services" className="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Step 1 — Select Cleaning Service
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
              Choose the service that matches your property
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Starting prices are shown with their real included scope. Your total updates when you
              select additional rooms, services or carpet areas.
            </p>
          </motion.div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 lg:grid-cols-2">
            {serviceCards.map((card, index) => {
              const available = Boolean(serviceByScope[card.scope]);

              return (
                <motion.article
                  key={card.scope}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  whileHover={{ y: -5 }}
                  className={`group relative flex h-full flex-col rounded-[1.4rem] border p-5 shadow-sm transition-shadow hover:shadow-xl sm:p-6 ${card.accentClass}`}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${card.iconClass}`}>
                      {card.icon}
                    </div>
                    {card.badge && (
                      <span className="rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 shadow-sm">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="pr-2">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                        {card.eyebrow}
                      </p>
                      <h3 className="mt-1 text-xl font-black leading-tight text-slate-900 sm:text-[1.35rem]">
                        {card.title}
                      </h3>
                    </div>
                    <span className="w-fit shrink-0 rounded-full bg-white px-4 py-2 text-sm font-black text-[#073f7d] shadow-sm">
                      {card.priceLabel}
                    </span>
                  </div>

                  <p className="mt-4 leading-7 text-slate-600">{card.description}</p>

                  <ul className="mt-5 space-y-3">
                    {card.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm leading-6 text-slate-700">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-7">
                    <button
                      type="button"
                      onClick={() => beginBooking(card.scope)}
                      disabled={!available || authLoading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B4E9B] px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#073f7d] active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {available ? "Customize & see price" : "Service unavailable"}
                      {available && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>


      <AnimatePresence>
        {showPricingPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4"
            onClick={() => setShowPricingPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setShowPricingPopup(false)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                aria-label="Close pricing info"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="pr-10">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Pricing information
                </span>
                <h3 className="mt-2 text-2xl font-black text-slate-900">How pricing works</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Each cleaning service has its own plan and included scope. Optional add-ons are charged separately only when you select them.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  "Live pricing updates as you customize your booking",
                  "Applicable GST is shown before confirmation",
                  "Optional add-ons are charged only when selected",
                  "Included services are not charged twice",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-blue-100">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold leading-6 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsGuestBooking(false);
        }}
        service={selectedService}
        isGuest={isGuestBooking}
      />

      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.97 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl sm:p-8"
            >
              <button
                type="button"
                onClick={() => setShowLoginPrompt(false)}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Lock className="h-7 w-7" />
              </div>
              <div className="mt-5 text-center">
                <h2 className="text-2xl font-black text-slate-900">Continue your booking</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Customize <span className="font-bold text-blue-700">{selectedServiceTitle}</span> as
                  a guest, or log in to keep the booking in your account.
                </p>
              </div>

              <div className="mt-7 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginPrompt(false);
                    setIsGuestBooking(true);
                    setIsModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B4E9B] py-3.5 text-sm font-black text-white transition hover:bg-[#073f7d]"
                >
                  Continue as Guest
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginPrompt(false);
                    router.push("/login?redirect=/booking");
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Log in to continue
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default BookingClient;
