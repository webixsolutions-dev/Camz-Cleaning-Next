"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Building2,
  Home,
  Car,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sofa,
  Lock,
  X,
} from "lucide-react";

import CommonHeroSection from "@/components/common/CommonHeroSection";
import BookingModal from "@/components/models/Booking";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

// --- Types ---
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
  categories: Category[];
  services: Service[];
}

const BookingClient = ({
  categories: initialCategories,
  services: initialServices,
}: BookingClientProps) => {
  const serviceImageMap: Record<string, string> = {
    residential: "/residential.webp",
    move_in_out: "/seasonal.webp",
    commercial: "/commercial-cleaning.webp",
    vehicle: "/vehicle.webp",
    seasonal: "/seasonal.webp",
    specialty: "/work.webp",
  };

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuestBooking, setIsGuestBooking] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const categories = initialCategories;
  const services = initialServices;

  const handleBookNow = (service: Service) => {
    if (authLoading) return;

    if (!user) {
      setSelectedService(service);
      setSelectedServiceTitle(service.title);
      setShowLoginPrompt(true);
      return;
    }

    setSelectedService(service);
    setSelectedServiceTitle(service.title);
    setIsGuestBooking(false);
    setIsModalOpen(true);
  };

  const getIconForCategory = (iconStr: string) => {
    switch (iconStr) {
      case "home":
        return <Home className="h-8 w-8" />;

      case "building2":
        return <Building2 className="h-8 w-8" />;

      case "truck":
        return <Car className="h-8 w-8" />;

      case "sparkles":
        return <Sofa className="h-8 w-8" />;

      default:
        return <Home className="h-8 w-8" />;
    }
  };

  const getIconForService = (iconStr: string) => {
    switch (iconStr) {
      case "home":
        return <Home className="h-5 w-5 text-blue-600" />;

      case "building2":
        return <Building2 className="h-5 w-5 text-blue-600" />;

      case "truck":
        return <Car className="h-5 w-5 text-blue-600" />;

      case "sparkles":
        return <Sofa className="h-5 w-5 text-blue-600" />;

      default:
        return <Home className="h-5 w-5 text-blue-600" />;
    }
  };

  const getCategoryDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      Residential: "Home cleaning services",
      Commercial: "Workplace cleaning services",
      Vehicle: "Mobile vehicle cleaning",
      "Seasonal Property": "Seasonal property cleaning services",
      Specialty: "Additional cleaning services",
    };

    return descriptions[name] || name;
  };

  const getServiceDuration = (service: Service) => {
    if (service.pricing_type === "hourly") {
      return "Flexible";
    }

    return "Duration varies";
  };

  const getServiceFeatures = (serviceType: string): string[] => {
    const featureMap: Record<string, string[]> = {
      residential: [
        "Cleaning scope reviewed",
        "Home details confirmed",
        "Preferred appointment",
        "Special requests can be added",
      ],

      move_in_out: [
        "Property condition reviewed",
        "Requested areas confirmed",
        "Access details provided",
        "Preferred appointment",
      ],

      commercial: [
        "Property scope reviewed",
        "Cleaning requirements confirmed",
        "Schedule preferences",
        "Special requests can be added",
      ],

      vehicle: [
        "Vehicle details reviewed",
        "Selected cleaning package",
        "Location and parking details",
        "Preferred appointment",
      ],

      specialty: [
        "Requested service reviewed",
        "Scope confirmed before service",
        "Preferred appointment",
        "Special requests can be added",
      ],
    };

    return (
      featureMap[serviceType] || [
        "Service scope reviewed",
        "Details confirmed before service",
      ]
    );
  };

  const getActiveCategoryName = () => {
    if (activeCategory === "All") {
      return "All";
    }

    const category = categories.find((item) => item.id === activeCategory);

    return category?.name || "All";
  };

  const filteredServices =
    activeCategory === "All"
      ? services
      : services.filter((service) => service.category_id === activeCategory);

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <>
      {/* Hero */}
      <CommonHeroSection
        backgroundImage="/p4.webp"
        title={<>Book a Cleaning Service Online</>}
      />

      <main className="min-h-screen bg-[#F8FAFC] px-6 py-6 pb-32 md:px-12 lg:px-24">
        <div className="container-custom mx-auto">
          {/* Page Introduction */}
          <div className="mx-auto max-w-4xl text-center">
            <span className="rounded-full bg-[#00B7EB] px-4 py-1 text-sm font-bold uppercase text-white">
              Online Booking
            </span>

            <h2 className="mb-4 mt-6 text-4xl font-extrabold text-[#004A8C] md:text-5xl">
              Choose Your Service and Preferred Appointment
            </h2>

            <p className="mx-auto max-w-3xl leading-7 text-gray-600">
              Select the cleaning service you need, provide the required details
              and choose your preferred appointment. Camz Cleaning reviews the
              request before confirming availability, scope and price.
            </p>

            <div className="mx-auto mt-6 max-w-3xl rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
              <p className="text-sm font-medium leading-6 text-[#0B4E9B]">
                A submitted request is not a confirmed appointment until Camz
                Cleaning reviews it and sends confirmation.
              </p>
            </div>
          </div>

          {/* Category Cards */}
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;

              return (
                <div
                  key={cat.id}
                  onClick={() =>
                    setActiveCategory(isActive ? "All" : cat.id)
                  }
                  className={`relative min-h-[220px] cursor-pointer overflow-hidden rounded-[22px] border bg-[#0B4E9B] p-6 transition-all duration-300 ${
                    isActive
                      ? "border-white ring-2 ring-[#2F80FF]"
                      : "border-transparent"
                  }`}
                >
                  {/* Selected */}
                  {isActive && (
                    <div className="absolute right-5 top-5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 fill-current text-[#2F80FF]"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mb-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-white">
                      {getIconForCategory(cat.icon_str)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 text-3xl font-bold leading-tight text-white">
                    {cat.name}
                  </h3>

                  {/* Description */}
                  <p className="mb-8 leading-7 text-white/80">
                    {getCategoryDescription(cat.name)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Services Heading */}
          <div className="mt-12 text-center">
            <h2 className="text-4xl font-bold text-[#004A8C]">
              {getActiveCategoryName()} Services
            </h2>

            <p className="my-4 text-gray-500">
              Review the available services below and choose the option that
              matches your cleaning needs.
            </p>
          </div>

          {/* Services Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg"
              >
                {/* Image */}
                <div className="relative h-64 w-full">
                  <Image
                    src={
                      serviceImageMap[service.service_type] || "/p4.webp"
                    }
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />

                  {/* Price */}
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-gray-800 shadow-sm backdrop-blur">
                    {service.price}
                  </div>

                  {/* Duration */}
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-[#0B4E9B]/90 px-3 py-1 text-sm font-bold text-white shadow-sm backdrop-blur">
                    <Clock size={14} />
                    {getServiceDuration(service)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex grow flex-col p-8">
                  <div className="mb-4 flex items-center gap-2">
                    {getIconForService(service.icon_str)}

                    <h3 className="text-2xl font-extrabold text-[#004A8C]">
                      {service.title}
                    </h3>
                  </div>

                  <p className="mb-6 text-gray-500">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="mb-8 space-y-3">
                    {getServiceFeatures(service.service_type).map(
                      (feature, index) => (
                        <li
                          key={`${service.id}-${feature}-${index}`}
                          className="flex items-center gap-2 text-sm font-medium text-gray-600"
                        >
                          <CheckCircle2
                            size={18}
                            className="shrink-0 text-[#1F5BA0]"
                          />

                          <span>{feature}</span>
                        </li>
                      ),
                    )}
                  </ul>

                  {/* Book Button */}
                  <button
                    onClick={() => handleBookNow(service)}
                    disabled={authLoading}
                    className="group mt-auto flex cursor-pointer items-center gap-2 font-bold text-[#1F5BA0] transition-colors hover:text-[#004A8C] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Book now

                    <ArrowRight
                      size={20}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              No services found in this category yet.
            </div>
          )}
        </div>

        {/* Booking Modal */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setIsGuestBooking(false);
          }}
          service={selectedService}
          isGuest={isGuestBooking}
        />

        {/* Login Required Modal */}
        <AnimatePresence>
          {showLoginPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
              onClick={() => setShowLoginPrompt(false)}
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                  scale: 0.95,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                  scale: 0.95,
                }}
                onClick={(event) => event.stopPropagation()}
                className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl"
              >
                {/* Close */}
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-all hover:bg-slate-200"
                  aria-label="Close"
                >
                  <X size={16} className="text-slate-600" />
                </button>

                <div className="text-center">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50"
                  >
                    <Lock className="h-10 w-10 text-blue-600" />
                  </motion.div>

                  <h2 className="mb-2 text-2xl font-black text-slate-800">
                    Login Required
                  </h2>

                  <p className="mb-2 text-sm text-slate-500">
                    Please log in to book{" "}
                    <span className="font-bold text-blue-600">
                      {selectedServiceTitle}
                    </span>
                  </p>

                  <p className="mb-8 text-xs text-slate-400">
                    Your account helps us track your bookings and provide better
                    service.
                  </p>

                  <div className="flex flex-col gap-3">
                    {/* Login */}
                    <button
                      onClick={() => {
                        setShowLoginPrompt(false);
                        router.push("/login?redirect=/booking");
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700"
                    >
                      Continue to Login
                      <ArrowRight size={16} />
                    </button>

                    {/* Guest */}
                    <button
                      onClick={() => {
                        setShowLoginPrompt(false);
                        setIsGuestBooking(true);
                        setIsModalOpen(true);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3.5 text-sm font-black text-white transition-all hover:bg-slate-900"
                    >
                      Continue as Guest
                      <ArrowRight size={16} />
                    </button>

                    {/* Cancel */}
                    <button
                      onClick={() => setShowLoginPrompt(false)}
                      className="w-full rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                    >
                      Maybe Later
                    </button>
                  </div>

                  <p className="mt-6 text-[11px] text-slate-400">
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => {
                        setShowLoginPrompt(false);
                        router.push("/register");
                      }}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
};

export default BookingClient;