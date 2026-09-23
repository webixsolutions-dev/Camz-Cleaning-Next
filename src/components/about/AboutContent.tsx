// "use client";

// import Link from "next/link";
// import { AnimatePresence, motion } from "framer-motion";
// import { useEffect, useState } from "react";

// const AboutContent = () => {
//   const images = [
//     "/wp-admin/uploads/stairs-cleaning.webp",
//     "/wp-admin/uploads/whole-kitchen-cleaning.webp",
//   ];

//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentIndex((prevValue) => (prevValue + 1) % images.length);
//     }, 5000);

//     return () => clearInterval(timer);
//   }, [images.length]);

//   return (
//     <section className="bg-white px-6 py-20 md:px-12 lg:px-24">
//       <div className="container-custom mx-auto space-y-20">
//         {/* Introduction */}
//         <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
//           <div className="space-y-6">
//             <div className="inline-block rounded-full bg-[#00B7EB] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
//               Who We Are
//             </div>

//             <h2 className="text-3xl font-extrabold leading-tight text-[#0B4E9B] md:text-5xl">
//               A Dependable Approach to Cleaning
//             </h2>

//             <p className="text-lg leading-relaxed text-gray-600">
//               Camz Cleaning plans each service around the space, requested
//               cleaning tasks and appointment details. Clear communication helps
//               confirm the service scope before work begins and ensures the team
//               understands the priorities for each home, business, vehicle or
//               property.
//             </p>

//             <p className="leading-relaxed text-gray-600">
//               Our approach is focused on practical service planning,
//               communication and careful attention to the agreed cleaning scope.
//             </p>
//           </div>

//           <div className="relative h-[400px] w-full md:h-[600px]">
//             <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
//               <AnimatePresence mode="wait">
//                 <motion.img
//                   key={currentIndex}
//                   src={images[currentIndex]}
//                   alt={
//                     currentIndex === 0
//                       ? "Detailed cleaning of residential stairs"
//                       : "Detailed kitchen cleaning service"
//                   }
//                   initial={{ opacity: 0, scale: 1.1 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 1.05 }}
//                   transition={{ duration: 1.2, ease: "easeInOut" }}
//                   width={1200}
//             height={800}
//             className="absolute inset-0 h-full w-full object-cover"
//                 />
//               </AnimatePresence>

//               <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
//             </div>
//           </div>
//         </div>

//         {/* Standards */}
//         <div className="mx-auto max-w-5xl space-y-6">
//           <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
//             Our Cleaning Standards
//           </h2>

//           <p className="leading-relaxed text-gray-600">
//             Cleaning requirements can vary between properties and services.
//             Camz Cleaning confirms the requested scope, access details and other
//             important service information before the appointment.
//           </p>

//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//             <div className="rounded-2xl border border-[#0B4E9B]/20 bg-[#EFFAFC] p-6">
//               <h3 className="mb-2 text-xl font-bold text-[#0B4E9B]">
//                 Clear Service Scope
//               </h3>

//               <p className="leading-relaxed text-gray-600">
//                 Requested tasks and service details are reviewed so the
//                 cleaning scope is clear before the appointment.
//               </p>
//             </div>

//             <div className="rounded-2xl border border-[#0B4E9B]/20 bg-[#EFFAFC] p-6">
//               <h3 className="mb-2 text-xl font-bold text-[#0B4E9B]">
//                 Access and Instructions
//               </h3>

//               <p className="leading-relaxed text-gray-600">
//                 Property access, parking and other relevant instructions can be
//                 provided during booking when needed.
//               </p>
//             </div>

//             <div className="rounded-2xl border border-[#0B4E9B]/20 bg-[#EFFAFC] p-6">
//               <h3 className="mb-2 text-xl font-bold text-[#0B4E9B]">
//                 Cleaning Preferences
//               </h3>

//               <p className="leading-relaxed text-gray-600">
//                 Important cleaning priorities or product preferences can be
//                 shared so they can be reviewed with the requested service.
//               </p>
//             </div>

//             <div className="rounded-2xl border border-[#0B4E9B]/20 bg-[#EFFAFC] p-6">
//               <h3 className="mb-2 text-xl font-bold text-[#0B4E9B]">
//                 Service Communication
//               </h3>

//               <p className="leading-relaxed text-gray-600">
//                 Booking and service details are communicated so customers know
//                 what has been requested and what still needs confirmation.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Services */}
//         <div className="mx-auto max-w-5xl space-y-6">
//           <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
//             The Services We Provide
//           </h2>

//           <p className="leading-relaxed text-gray-600">
//             Camz Cleaning provides cleaning options for homes, businesses,
//             vehicles and seasonal properties. Explore each service to review
//             the available work and booking information.
//           </p>

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//             <Link
//               href="/residential-cleaning-services/"
//               className="rounded-xl border border-[#0B4E9B]/20 p-5 font-bold text-[#0B4E9B] transition-colors hover:bg-[#EFFAFC]"
//             >
//               Residential Cleaning
//             </Link>

//             <Link
//               href="/commercial-cleaning-services/"
//               className="rounded-xl border border-[#0B4E9B]/20 p-5 font-bold text-[#0B4E9B] transition-colors hover:bg-[#EFFAFC]"
//             >
//               Commercial Cleaning
//             </Link>

//             <Link
//               href="/vehicle-cleaning-service/"
//               className="rounded-xl border border-[#0B4E9B]/20 p-5 font-bold text-[#0B4E9B] transition-colors hover:bg-[#EFFAFC]"
//             >
//               Vehicle Cleaning
//             </Link>

//             <Link
//               href="/seasonal-property-service/"
//               className="rounded-xl border border-[#0B4E9B]/20 p-5 font-bold text-[#0B4E9B] transition-colors hover:bg-[#EFFAFC]"
//             >
//               Seasonal Property Service
//             </Link>
//           </div>
//         </div>

//         {/* Areas */}
//         <div className="mx-auto max-w-5xl space-y-6">
//           <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
//             Areas We Serve
//           </h2>

//           <p className="leading-relaxed text-gray-600">
//             Explore cleaning service information for Calgary and surrounding
//             service areas.
//           </p>

//           <div className="flex flex-wrap gap-4">
//             <Link
//               href="/calgary-cleaning-services/"
//               className="font-bold text-[#0B4E9B] hover:underline"
//             >
//               Calgary
//             </Link>

//             <Link
//               href="/airdrie-cleaning-services/"
//               className="font-bold text-[#0B4E9B] hover:underline"
//             >
//               Airdrie
//             </Link>

//             <Link
//               href="/cochrane-cleaning-services/"
//               className="font-bold text-[#0B4E9B] hover:underline"
//             >
//               Cochrane
//             </Link>

//             <Link
//               href="/chestermere-cleaning-services/"
//               className="font-bold text-[#0B4E9B] hover:underline"
//             >
//               Chestermere
//             </Link>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AboutContent;.

"use client"; 

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const AboutContent = () => {
  const servicesList = [
    {
      title: "Standard House Cleaning",
      desc: "Routine cleaning for regularly maintained homes, condos and apartments.",
      badge: "Maintenance",
    },
    {
      title: "Deep Cleaning",
      desc: "More detailed attention for buildup, high-use areas and selected priority tasks.",
      badge: "Intensive",
    },
    {
      title: "Move-In / Move-Out",
      desc: "Cleaning support before occupancy or property handover, based on the booked scope.",
      badge: "Turnover",
    },
    {
      title: "Airbnb & Short-Term Rentals",
      desc: "Turnover cleaning options for hosts and property managers between stays.",
      badge: "Hospitality",
    },
    {
      title: "Commercial Cleaning",
      desc: "Service options for offices, businesses and managed commercial properties.",
      badge: "Workplace",
    },
    {
      title: "Customized Cleaning",
      desc: "Extra time and individually priced add-ons for property-specific needs.",
      badge: "Tailored",
    },
  ];

  const qualitySteps = [
    {
      step: "1",
      title: "Inspect On-Site",
      desc: "Review the completed areas before the cleaners leave whenever possible so any immediate touch-ups can be addressed on the spot.",
    },
    {
      step: "2",
      title: "Send Details",
      desc: "If you notice a potential missed area later, contact us promptly and provide clear photos of the specific area.",
    },
    {
      step: "3",
      title: "We Review",
      desc: "We compare the concern with the agreed scope of work and available on-site service documentation.",
    },
    {
      step: "4",
      title: "We Correct",
      desc: "When a qualifying issue is confirmed, we arrange a return visit at no additional cleaning charge to make it right.",
    },
  ];

  const whyConsiderItems = [
    { title: "Locally Operated", desc: "A Calgary-based cleaning company serving our local nearby communities." },
    { title: "Insured Service", desc: "Cleaning operations are insured for added customer confidence." },
    { title: "Two-Cleaner Team", desc: "Two professional cleaners are normally scheduled for each appointment (or 1 depending on availability)." },
    { title: "Transparent Pricing", desc: "The selected service, scope, on-site time and price are explained clearly before work starts." },
    { title: "Flexible Options", desc: "Customers can add extra time, fixed-price add-ons or customized services." },
    { title: "Quality Documentation", desc: "Before-and-after photos may be used for verification and quality control." },
    { title: "Practical Resolution", desc: "Verified concerns are reviewed promptly with a focus on quick on-site correction." },
    { title: "Easy Booking", desc: "Choose a service, review inclusions and see transparent pricing before confirming." },
  ];

  const serviceAreas = [
    { name: "Calgary", desc: "Downtown, Southeast, Northeast, Northwest & Southwest Calgary", link: "/calgary-cleaning-services/" },
    { name: "Airdrie", desc: "Full residential and commercial coverage", link: "/airdrie-cleaning-services/" },
    { name: "Chestermere", desc: "Turnover, routine and deep cleaning options", link: "/chestermere-cleaning-services/" },
    { name: "Cochrane", desc: "Dependable home and business services", link: "/cochrane-cleaning-services/" },
    { name: "Okotoks", desc: "Subject to appointment scheduling availability", link: "/okotoks-cleaning-services/" },
  ];

  return (
    <article className="bg-white px-6 py-20 md:px-12 lg:px-24 text-slate-700 leading-relaxed">
      <div className="mx-auto max-w-6xl space-y-20">

        {/* SECTION 1: Clear, Customer-Friendly Pricing & How Cleaning Time Works */}
        <section className="space-y-8">
          <div className="space-y-3">
            <div className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#0B4E9B]">
              No Hidden Formulas
            </div>
            <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
              Clear, Customer-Friendly Pricing
            </h2>
          </div>

          <p className="text-base text-slate-600 md:text-lg">
            We believe customers should understand what they are booking and what they are expected to pay before the cleaning begins. Our website and booking system show the selected service, general scope, on-site cleaning time and price in a simple format.
          </p>

          <p className="text-slate-600">
            Customer-facing time is displayed as on-site cleaning time with two cleaners. For example, a two-hour booking means that two cleaners are scheduled to work at the property for up to two hours. This keeps the pricing easy to understand without confusing labour-hour calculations.
          </p>

          {/* Pricing Model Highlight Box */}
          <div className="overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/40 p-6 md:p-10 shadow-sm">
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#0B4E9B]">How Cleaning Time Works</span>
                <h3 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
                  2 Cleaners × Selected On-Site Time
                </h3>
                <p className="text-sm text-slate-600">
                  Choose the service and the amount of time that fits your property. Internal staffing calculations remain behind the scenes.
                </p>
                <p className="text-xs font-bold text-slate-500 italic">
                  *Single cleaner appointments may be scheduled based on availability and property requirements.
                </p>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl bg-[#0B4E9B] p-6 text-center text-white shadow-md">
                <span className="text-lg font-bold tracking-wide">Simple. Clear. Transparent.</span>
                <p className="mt-2 text-xs text-blue-100">
                  Know exactly how long our team will be on-site with zero surprises on your final invoice.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 space-y-2">
            <p>
              <strong>Property Condition Note:</strong> Because every property has a different size, layout and condition, some bookings may require more cleaning than the selected package includes. Heavy grease, excessive buildup, additional rooms or tasks outside the confirmed scope may require additional service.
            </p>
            <p>
              If extra work is recommended, we explain the available options and price before proceeding. Depending on the request, you may add extra on-site cleaning time, choose a fixed-price add-on, pay for an individual item, or receive a customized quote based on the property&apos;s condition.
            </p>
          </div>
        </section>

        {/* SECTION 2: Cleaning Services Designed Around Your Property */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
              Cleaning Services Designed Around Your Property
            </h2>
            <p className="text-slate-600">
              Tailored residential, rental, and commercial solutions for Calgary homeowners and managers.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicesList.map((srv) => (
              <div
                key={srv.title}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#0B4E9B]">
                    {srv.badge}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">{srv.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{srv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Our Cleaning Quality Commitment & 4-Step Resolution */}
        <section className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
              Our Cleaning Quality Commitment
            </h2>
            <p className="text-base text-slate-600 md:text-lg">
              Your satisfaction matters to us. Whenever possible, we encourage customers to inspect the cleaning while our team is still at the property. If an area included in the agreed scope needs additional attention, please let the cleaners know before they leave so it can be reviewed and addressed promptly.
            </p>
            <p className="text-sm text-slate-500 italic">
              Before-and-after photographs may be taken for quality control, service verification and documentation. These records help confirm the property&apos;s condition and the work completed.
            </p>
          </div>

          {/* 4-Step Workflow Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {qualitySteps.map((step) => (
              <div
                key={step.step}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B4E9B] text-base font-extrabold text-white">
                  {step.step}
                </span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Our Resolution Approach Callout Box */}
          <div className="rounded-2xl border-l-4 border-[#0B4E9B] bg-slate-50 p-6 md:p-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0B4E9B]">
              Our Resolution Approach
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Our priority is to correct verified cleaning concerns rather than leave a customer dissatisfied. For completed cleaning services, our resolution process focuses on reviewing and correcting qualifying issues instead of providing a monetary refund. Full eligibility, notice periods and service conditions are stated in our separate Terms &amp; Conditions.
            </p>
          </div>
        </section>

        {/* SECTION 4: Professional Products & Equipment */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
              Professional Products &amp; Equipment
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Our cleaners arrive with professional cleaning products and supplies selected for different areas and surfaces, as specified for the booked service.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {[
              "Degreasers",
              "Bathroom Cleaners",
              "Surface Disinfectants",
              "Glass & Mirror Cleaners",
              "Multi-Surface Solutions",
              "Color-Coded Microfiber Cloths",
              "Specialized Cleaning Gear",
            ].map((item) => (
              <span key={item} className="rounded-lg bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-[#0B4E9B] border border-blue-100">
                ✓ {item}
              </span>
            ))}
          </div>

          <div className="rounded-xl bg-blue-50/50 p-4 text-xs text-slate-600 leading-relaxed border border-blue-100">
            <strong>Sensitivities &amp; Surface Care:</strong> Customers with allergies, sensitivities, fragrance preferences, pets or surfaces requiring special care should notify us before the appointment. A separate Products &amp; Equipment page provides detailed product names, intended uses and important safety limitations.
          </div>
        </section>

        {/* SECTION 5: Why Customers Consider Camz Cleaning (8-Pillar Grid) */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
              Why Customers Consider Camz Cleaning
            </h2>
            <p className="text-slate-600">
              Straightforward, dependable service standards tailored to your home and business.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyConsiderItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-400"
              >
                <h3 className="text-base font-bold text-[#0B4E9B]">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Areas We Serve */}
        <section className="space-y-6 rounded-3xl bg-slate-900 p-6 md:p-10 text-white">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              Areas We Serve
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              Camz Cleaning provides residential and commercial cleaning services across <strong>Calgary, Airdrie, Chestermere, Cochrane and Okotoks</strong>. Service availability may vary by location, appointment date and service type.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {serviceAreas.map((area) => (
              <Link
                key={area.name}
                href={area.link}
                className="rounded-xl bg-white/10 p-5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/15 hover:border-blue-400"
              >
                <h3 className="text-lg font-bold text-blue-300">{area.name}</h3>
                <p className="mt-1 text-xs text-slate-300">{area.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </article>
  );
};

export default AboutContent;
