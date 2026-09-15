"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const AboutContent = () => {
  const images = [
    "/wp-admin/uploads/stairs-cleaning.webp",
    "/wp-admin/uploads/whole-kitchen-cleaning.webp",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevValue) => (prevValue + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="bg-white px-6 py-20 md:px-12 lg:px-24">
      <div className="container-custom mx-auto space-y-20">
        {/* Introduction */}
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-block rounded-full bg-[#00B7EB] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              Who We Are
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-[#0B4E9B] md:text-5xl">
              A Dependable Approach to Cleaning
            </h2>

            <p className="text-lg leading-relaxed text-gray-600">
              Camz Cleaning plans each service around the space, requested
              cleaning tasks and appointment details. Clear communication helps
              confirm the service scope before work begins and ensures the team
              understands the priorities for each home, business, vehicle or
              property.
            </p>

            <p className="leading-relaxed text-gray-600">
              Our approach is focused on practical service planning,
              communication and careful attention to the agreed cleaning scope.
            </p>
          </div>

          <div className="relative h-[400px] w-full md:h-[600px]">
            <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  alt={
                    currentIndex === 0
                      ? "Detailed cleaning of residential stairs"
                      : "Detailed kitchen cleaning service"
                  }
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  width={1200}
            height={800}
            className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* Standards */}
        <div className="mx-auto max-w-5xl space-y-6">
          <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
            Our Cleaning Standards
          </h2>

          <p className="leading-relaxed text-gray-600">
            Cleaning requirements can vary between properties and services.
            Camz Cleaning confirms the requested scope, access details and other
            important service information before the appointment.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#0B4E9B]/20 bg-[#EFFAFC] p-6">
              <h3 className="mb-2 text-xl font-bold text-[#0B4E9B]">
                Clear Service Scope
              </h3>

              <p className="leading-relaxed text-gray-600">
                Requested tasks and service details are reviewed so the
                cleaning scope is clear before the appointment.
              </p>
            </div>

            <div className="rounded-2xl border border-[#0B4E9B]/20 bg-[#EFFAFC] p-6">
              <h3 className="mb-2 text-xl font-bold text-[#0B4E9B]">
                Access and Instructions
              </h3>

              <p className="leading-relaxed text-gray-600">
                Property access, parking and other relevant instructions can be
                provided during booking when needed.
              </p>
            </div>

            <div className="rounded-2xl border border-[#0B4E9B]/20 bg-[#EFFAFC] p-6">
              <h3 className="mb-2 text-xl font-bold text-[#0B4E9B]">
                Cleaning Preferences
              </h3>

              <p className="leading-relaxed text-gray-600">
                Important cleaning priorities or product preferences can be
                shared so they can be reviewed with the requested service.
              </p>
            </div>

            <div className="rounded-2xl border border-[#0B4E9B]/20 bg-[#EFFAFC] p-6">
              <h3 className="mb-2 text-xl font-bold text-[#0B4E9B]">
                Service Communication
              </h3>

              <p className="leading-relaxed text-gray-600">
                Booking and service details are communicated so customers know
                what has been requested and what still needs confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mx-auto max-w-5xl space-y-6">
          <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
            The Services We Provide
          </h2>

          <p className="leading-relaxed text-gray-600">
            Camz Cleaning provides cleaning options for homes, businesses,
            vehicles and seasonal properties. Explore each service to review
            the available work and booking information.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              href="/residential-cleaning-services/"
              className="rounded-xl border border-[#0B4E9B]/20 p-5 font-bold text-[#0B4E9B] transition-colors hover:bg-[#EFFAFC]"
            >
              Residential Cleaning
            </Link>

            <Link
              href="/commercial-cleaning-services/"
              className="rounded-xl border border-[#0B4E9B]/20 p-5 font-bold text-[#0B4E9B] transition-colors hover:bg-[#EFFAFC]"
            >
              Commercial Cleaning
            </Link>

            <Link
              href="/vehicle-cleaning-service/"
              className="rounded-xl border border-[#0B4E9B]/20 p-5 font-bold text-[#0B4E9B] transition-colors hover:bg-[#EFFAFC]"
            >
              Vehicle Cleaning
            </Link>

            <Link
              href="/seasonal-property-service/"
              className="rounded-xl border border-[#0B4E9B]/20 p-5 font-bold text-[#0B4E9B] transition-colors hover:bg-[#EFFAFC]"
            >
              Seasonal Property Service
            </Link>
          </div>
        </div>

        {/* Areas */}
        <div className="mx-auto max-w-5xl space-y-6">
          <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
            Areas We Serve
          </h2>

          <p className="leading-relaxed text-gray-600">
            Explore cleaning service information for Calgary and surrounding
            service areas.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/calgary-cleaning-services/"
              className="font-bold text-[#0B4E9B] hover:underline"
            >
              Calgary
            </Link>

            <Link
              href="/airdrie-cleaning-services/"
              className="font-bold text-[#0B4E9B] hover:underline"
            >
              Airdrie
            </Link>

            <Link
              href="/cochrane-cleaning-services/"
              className="font-bold text-[#0B4E9B] hover:underline"
            >
              Cochrane
            </Link>

            <Link
              href="/chestermere-cleaning-services/"
              className="font-bold text-[#0B4E9B] hover:underline"
            >
              Chestermere
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutContent;