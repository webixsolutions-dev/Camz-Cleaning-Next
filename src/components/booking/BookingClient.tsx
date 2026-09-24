"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
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
  categories?: Category[];
}

type ServiceCardDefinition = {
  scope: CleaningPricingScope;
  title: string;
  priceLabel: string;
  description: string;
  features: string[];
  note: string;
  icon: React.ReactNode;
  accent: string;
  soft: string;
  border: string;
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
  const [heroPreviewIndex, setHeroPreviewIndex] = useState(0);
  const [activeMobileCardScope, setActiveMobileCardScope] = useState<CleaningPricingScope>("standard");

  useEffect(() => {
    let cancelled = false;
    const loadPricing = async () => {
      try {
        const response = await fetch("/api/pricing", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { config?: CleaningPricingConfig };
        if (!cancelled && payload.config) setPublicPricing(payload.config);
      } catch {
        // Customer-facing fallback prices remain available if pricing API is unavailable.
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
    publicPricing?.services.standard.packages.find((pkg) => pkg.id === "essential_standard")
      ?.basePriceCents ?? 9900;
  const standardComplete =
    publicPricing?.services.standard.packages.find((pkg) => pkg.id === "complete_standard")
      ?.basePriceCents ?? 14900;
  const deepStart = publicPricing?.services.deep.startingPriceCents ?? 15900;
  const moveStart = publicPricing?.services.move_in_out.startingPriceCents ?? 19900;
  const carpetMinimum = publicPricing?.carpet.standaloneMinimumCents ?? 10000;

  const serviceCards: ServiceCardDefinition[] = [
    {
      scope: "standard",
      title: "Standard Cleaning",
      priceLabel: `From ${money0(standardEssential)}`,
      description: "Routine cleaning for regularly maintained homes, with a clear included scope and optional extras.",
      features: [
        "Accessible dusting & wiping",
        "Kitchen surfaces",
        "General bathroom cleaning",
        "Vacuuming, sweeping & mopping",
      ],
      note: `Essential ${money0(standardEssential)} · Complete ${money0(standardComplete)}`,
      icon: <Home className="h-6 w-6" />,
      accent: "text-teal-700",
      soft: "bg-teal-50",
      border: "border-teal-100",
    },
    {
      scope: "deep",
      title: "Deep Cleaning",
      priceLabel: `From ${money0(deepStart)}`,
      description: "More detailed cleaning for buildup, seasonal resets and a fuller home refresh.",
      features: [
        "Detailed kitchen cleaning",
        "Detailed bathroom cleaning",
        "Baseboards & door frames",
        "Edges, corners & extra detail",
      ],
      note: "Room-based pricing with live updates",
      icon: <Sparkles className="h-6 w-6" />,
      accent: "text-sky-700",
      soft: "bg-sky-50",
      border: "border-sky-100",
    },
    {
      scope: "move_in_out",
      title: "Move-In / Move-Out",
      priceLabel: `From ${money0(moveStart)}`,
      description: "Turnover cleaning for empty homes before or after a move, sale or tenant change.",
      features: [
        "Empty-home turnover cleaning",
        "Inside fridge, oven & microwave",
        "Inside empty cabinets",
        "Baseboards & accessible floors",
      ],
      note: "Best for empty properties",
      icon: <Building2 className="h-6 w-6" />,
      accent: "text-violet-700",
      soft: "bg-violet-50",
      border: "border-violet-100",
    },
    {
      scope: "carpet",
      title: "Carpet Cleaning",
      priceLabel: `${money0(carpetMinimum)} minimum`,
      description: "Steam cleaning for selected carpeted rooms, hallways, stairs and smaller carpet areas.",
      features: [
        "Standard carpeted rooms",
        "Living / larger rooms",
        "Hallways & carpeted stairs",
        "Rugs & stain treatment options",
      ],
      note: "Standalone or add-on service",
      icon: <Sofa className="h-6 w-6" />,
      accent: "text-cyan-700",
      soft: "bg-cyan-50",
      border: "border-cyan-100",
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroPreviewIndex((current) => (current + 1) % 4);
    }, 2800);

    return () => window.clearInterval(timer);
  }, []);

  const heroPreviewCards = serviceCards.map((card) => ({
    scope: card.scope,
    title: card.title,
    priceLabel: card.priceLabel,
    icon: card.icon,
    accent: card.accent,
    soft: card.soft,
  }));

  const activeMobileCard =
    serviceCards.find((card) => card.scope === activeMobileCardScope) ?? serviceCards[0];

  const beginBooking = (scope: CleaningPricingScope) => {
    if (authLoading) return;
    const service = serviceByScope[scope];
    if (!service) return;

    setSelectedService(service);
    setSelectedServiceTitle(serviceCards.find((card) => card.scope === scope)?.title ?? service.title);

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setIsGuestBooking(false);
    setIsModalOpen(true);
  };

  const scrollToServices = () => {
    document.getElementById("cleaning-services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7fbfc] pb-20 text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-14">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-sky-100/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-teal-600">Professional home cleaning</p>
            <h1 className="mt-3 max-w-3xl text-[2.35rem] font-black leading-[1.06] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.65rem]">
              A Cleaner Home for a Happier You
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Reliable, detailed and transparent cleaning services with clear starting prices, included scope and a live total before you book.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToServices}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#08aebc] to-[#0d9ecf] px-6 text-sm font-black text-white shadow-lg shadow-cyan-200/70 transition hover:-translate-y-0.5"
              >
                Book Your Cleaning
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowPricingPopup(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Info className="h-4 w-4 text-teal-600" />
                How pricing works
              </button>
            </div>

            <div className="mt-6 grid max-w-2xl grid-cols-3 gap-2 sm:gap-2.5">
              {["Transparent pricing", "Customize your service", "Trusted & insured"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 + index * 0.07 }}
                  className="flex min-h-[72px] flex-col items-start justify-start gap-2 rounded-2xl border border-slate-200 bg-white/85 px-3 py-3 text-[10px] font-bold leading-4 text-slate-700 shadow-sm sm:min-h-0 sm:flex-row sm:items-center sm:px-3.5 sm:text-xs"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0 text-teal-600" />
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Animated service selector inspired by the approved UX mockup. */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative mx-auto w-full max-w-[520px]"
          >
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-teal-100 via-white to-violet-100 opacity-90 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/50 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600">Choose your service</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Start with the clean you need</h2>
                </div>
                <span className="hidden rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 sm:inline-flex">4 services</span>
              </div>

              <div className="mt-5 space-y-2.5">
                {heroPreviewCards.map((item, index) => {
                  const active = index === heroPreviewIndex;
                  return (
                    <motion.button
                      key={item.scope}
                      type="button"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0, scale: active ? 1.015 : 1 }}
                      transition={{ duration: 0.35, delay: index * 0.07 }}
                      onMouseEnter={() => setHeroPreviewIndex(index)}
                      onFocus={() => setHeroPreviewIndex(index)}
                      onClick={() => beginBooking(item.scope)}
                      className={`relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border px-3.5 py-3 text-left transition-all duration-300 ${
                        active
                          ? "border-teal-300 bg-gradient-to-r from-teal-50 to-cyan-50 shadow-md shadow-teal-100/70"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="hero-service-active"
                          className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-teal-500"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.soft} ${item.accent}`}>
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-slate-900">{item.title}</span>
                        <span className="mt-0.5 block text-[11px] font-semibold text-slate-500">Tap to customize</span>
                      </span>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${active ? "bg-white text-teal-700 shadow-sm" : "bg-slate-50 text-slate-600"}`}>
                        {item.priceLabel}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black text-slate-900">Customize only what you need</p>
                    <p className="mt-0.5 text-[11px] leading-5 text-slate-500">Rooms, areas and optional add-ons update your live total before booking.</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-teal-600" />
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Three core UX promises from the supplied guide. */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { icon: <CheckCircle2 className="h-5 w-5" />, title: "Clear pricing", copy: "Starting prices and live calculation shown clearly." },
            { icon: <Sparkles className="h-5 w-5" />, title: "Easy customization", copy: "Choose only the rooms, areas and add-ons you need." },
            { icon: <ShieldCheck className="h-5 w-5" />, title: "Trust through transparency", copy: "See what is included and not included before booking." },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.06 }}
              className={`rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm ${index === 2 ? "col-span-2 md:col-span-1" : ""}`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">{item.icon}</div>
              <h3 className="mt-4 text-lg font-black text-slate-950">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{item.copy}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Service overview */}
      <section id="cleaning-services" className="scroll-mt-24 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-600">Our cleaning services</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Choose the service that fits your home</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              Clear starting prices, included scope and relevant add-ons before you begin customizing.
            </p>
          </div>

          <div className="mt-9 hidden gap-5 lg:grid lg:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((card, index) => {
              const available = Boolean(serviceByScope[card.scope]);
              return (
                <motion.article
                  key={card.scope}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  whileHover={{ y: -5 }}
                  className={`flex h-full flex-col overflow-hidden rounded-[1.55rem] border ${card.border} bg-white shadow-sm transition-shadow hover:shadow-xl`}
                >
                  <div className={`${card.soft} flex h-[288px] flex-col p-5`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ${card.accent}`}>{card.icon}</div>
                      <span className={`rounded-full bg-white px-3 py-1.5 text-xs font-black shadow-sm ${card.accent}`}>{card.priceLabel}</span>
                    </div>
                    <h3 className="mt-5 min-h-[58px] text-xl font-black leading-tight text-slate-950">{card.title}</h3>
                    <p className="mt-2 min-h-[104px] text-sm leading-6 text-slate-600">{card.description}</p>
                  </div>

                  <div className="flex min-h-[350px] flex-1 flex-col p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Included highlights</p>
                    <ul className="mt-3 space-y-2.5">
                      {card.features.map((feature) => (
                        <li key={feature} className="flex gap-2.5 text-sm leading-5 text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600"><Check className="h-3.5 w-3.5" /></span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-5">
                      <div className="border-t border-slate-100 pt-4 text-xs font-bold text-slate-500">{card.note}</div>
                      <button
                        type="button"
                        onClick={() => beginBooking(card.scope)}
                        disabled={!available || authLoading}
                        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#08aebc] px-4 text-sm font-black text-white transition hover:bg-[#078f9b] disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {available ? "Customize your clean" : "Service unavailable"}
                        {available && <ArrowRight className="h-4 w-4 shrink-0" />}
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          <div className="mt-7 lg:hidden">
            <div className="grid grid-cols-2 gap-4">
              {serviceCards.map((card, index) => {
                const available = Boolean(serviceByScope[card.scope]);
                const active = activeMobileCardScope === card.scope;
                return (
                  <motion.button
                    key={card.scope}
                    type="button"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    onClick={() => setActiveMobileCardScope(card.scope)}
                    className={`overflow-hidden rounded-[1.45rem] border text-left shadow-sm transition-all ${
                      active ? `${card.border} ring-2 ring-teal-200` : "border-slate-200"
                    } bg-white`}
                  >
                    <div className={`${card.soft} flex h-full min-h-[250px] flex-col p-4`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm ${card.accent}`}>{card.icon}</div>
                        <span className={`rounded-full bg-white px-2.5 py-1 text-[10px] font-black shadow-sm ${card.accent}`}>{card.priceLabel}</span>
                      </div>
                      <h3 className="mt-4 min-h-[50px] text-[1.05rem] font-black leading-tight text-slate-950">{card.title}</h3>
                      <p className="mt-2 text-[13px] leading-5 text-slate-600">{card.description}</p>
                      <div className="mt-auto pt-4">
                        <span className="inline-flex min-h-9 items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[11px] font-extrabold tracking-[0.01em] text-blue-700 shadow-sm">
                          Tap to view details
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.div
              key={activeMobileCard.scope}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className={`mt-5 overflow-hidden rounded-[1.55rem] border ${activeMobileCard.border} bg-white shadow-sm`}
            >
              <div className={`${activeMobileCard.soft} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-teal-600">Selected service</p>
                    <h3 className="mt-2 text-2xl font-black leading-tight text-slate-950">{activeMobileCard.title}</h3>
                  </div>
                  <span className={`rounded-full bg-white px-3 py-1.5 text-xs font-black shadow-sm ${activeMobileCard.accent}`}>{activeMobileCard.priceLabel}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{activeMobileCard.description}</p>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Included highlights</p>
                <ul className="mt-3 space-y-2.5">
                  {activeMobileCard.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-sm leading-5 text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600"><Check className="h-3.5 w-3.5" /></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold leading-5 text-slate-500">{activeMobileCard.note}</div>
                <button
                  type="button"
                  onClick={() => beginBooking(activeMobileCard.scope)}
                  disabled={!serviceByScope[activeMobileCard.scope] || authLoading}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#08aebc] px-4 text-sm font-black text-white transition hover:bg-[#078f9b] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {serviceByScope[activeMobileCard.scope] ? "Customize your clean" : "Service unavailable"}
                  {serviceByScope[activeMobileCard.scope] && <ArrowRight className="h-4 w-4 shrink-0" />}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simple flow bar matching the guide's recommended journey. */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-teal-100 bg-white shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { icon: <Home className="h-5 w-5" />, title: "Select your service", copy: "Choose the right cleaning type" },
              { icon: <Sparkles className="h-5 w-5" />, title: "Customize your clean", copy: "Rooms, areas and add-ons" },
              { icon: <CalendarDays className="h-5 w-5" />, title: "Book in minutes", copy: "Date, time and location" },
              { icon: <CheckCircle2 className="h-5 w-5" />, title: "Review & confirm", copy: "See scope, GST and total" },
            ].map((item, index) => {
              const mobileBorder = index < 2 ? "border-b border-slate-100" : "";
              const mobileColumnBorder = index % 2 === 0 ? "border-r border-slate-100" : "";
              const desktopBorder = index < 3 ? "md:border-b-0 md:border-r md:border-slate-100" : "";
              return (
                <div key={item.title} className={`relative min-h-[168px] p-5 ${mobileBorder} ${mobileColumnBorder} ${desktopBorder}`}>
                  <div className="flex h-full flex-col items-start justify-start">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">{item.icon}</div>
                    <p className="mt-3 text-sm font-black leading-5 text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.copy}</p>
                  </div>
                  {index < 3 && <ArrowRight className="absolute right-[-10px] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-white text-slate-300 md:block" />}
                </div>
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
            className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm"
            onClick={() => setShowPricingPopup(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="relative w-full max-w-lg rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" onClick={() => setShowPricingPopup(false)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Close pricing information">
                <X className="h-4 w-4" />
              </button>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-600">Pricing information</p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">Clear pricing before you book</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Each service has its own included scope. Extra rooms and optional add-ons are only charged when they apply to your selection.</p>
              <div className="mt-6 space-y-3">
                {["Live subtotal updates while you customize", "Applicable GST is shown before confirmation", "Only relevant add-ons are displayed", "Included services are protected from duplicate charges"].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
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
              <button type="button" onClick={() => setShowLoginPrompt(false)} className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600"><Lock className="h-7 w-7" /></div>
              <div className="mt-5 text-center">
                <h2 className="text-2xl font-black text-slate-900">Continue your booking</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Customize <span className="font-bold text-teal-700">{selectedServiceTitle}</span> as a guest, or log in to keep the booking in your account.</p>
              </div>
              <div className="mt-7 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginPrompt(false);
                    setIsGuestBooking(true);
                    setIsModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#08aebc] py-3.5 text-sm font-black text-white hover:bg-[#078f9b]"
                >
                  Continue as Guest <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginPrompt(false);
                    router.push("/login?redirect=/booking");
                  }}
                  className="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white py-3.5 text-sm font-black text-slate-700 hover:bg-slate-50"
                >
                  Log in to continue
                </button>
                <button type="button" onClick={() => setShowLoginPrompt(false)} className="w-full py-2 text-sm font-bold text-slate-400 hover:text-slate-600">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default BookingClient;
