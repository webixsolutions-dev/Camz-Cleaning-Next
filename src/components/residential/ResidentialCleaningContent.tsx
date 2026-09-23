// "use client";

// const ResidentialCleaningContent = () => {
//   const whyChooseItems = [
//     "A clear cleaning scope based on the home and requested tasks.",
//     "One-time and recurring options subject to availability.",
//     "Online booking with preferred appointment selection.",
//     "A respectful team focused on consistent home care.",
//   ];

//   const standardCleaning = [
//     {
//       title: "Kitchen Cleaning",
//       description:
//         "We clean counters, sinks, appliance exteriors, cabinet fronts and other accessible kitchen surfaces, with attention to everyday build-up and frequently used areas.",
//     },
//     {
//       title: "Bathroom Cleaning",
//       description:
//         "Bathroom cleaning covers sinks, toilets, tubs, showers, mirrors and accessible surfaces, helping keep the space fresh, hygienic and well maintained.",
//     },
//     {
//       title: "Bedrooms and Living Areas",
//       description:
//         "We dust, wipe surfaces, tidy accessible areas and clean floors throughout bedrooms and living spaces for a cleaner, more comfortable home.",
//     },
//     {
//       title: "Floors, Rugs and Carpets",
//       description:
//         "We vacuum rugs and carpets and mop suitable hard floors based on the floor type, with attention to visible dust and debris.",
//     },
//   ];

//   const detailedCleaning = [
//     {
//       title: "Cabinets, Appliances and Detailed Surfaces",
//       description:
//         "Extra attention for build-up, cabinet surfaces, appliance areas and other tasks confirmed as part of a deep-cleaning scope.",
//     },
//     {
//       title: "Move-In and Move-Out Cleaning",
//       description:
//         "Detailed cleaning for an empty or nearly empty home before moving in or after moving out, based on the condition and access.",
//     },
//   ];

//   const carouselData = [
//     {
//       src: "/wp-admin/uploads/residential-hero.webp",
//       alt: "Residential home prepared for professional cleaning",
//     },
//     {
//       src: "/wp-admin/uploads/residential-bg.webp",
//       alt: "Clean residential living area",
//     },
//     {
//       src: "/wp-admin/uploads/help-bg.webp",
//       alt: "Residential cleaning service in progress",
//     },
//     {
//       src: "/wp-admin/uploads/stairs-cleaning.webp",
//       alt: "Residential stairs being cleaned",
//     },
//   ];

//   return (
//     <div className="space-y-12 text-gray-700">
//       {/* Restored Residential Introduction */}
//       <section className="space-y-6">
//         <h2 className="text-3xl font-extrabold leading-tight text-[#0B4E9B] md:text-4xl">
//           Professional House Cleaning Services in Calgary
//         </h2>

//         <div className="overflow-hidden rounded-[2rem] shadow-md">
//           <img
//             src="/wp-admin/uploads/residential-hero.webp"
//             alt="Professional house cleaning service in Calgary"
//             width={1200}
//             height={800}
//             className="block h-auto w-full"
//           />
//         </div>

//         <p className="font-medium leading-relaxed">
//           Keeping your home clean and comfortable takes time, especially when
//           daily routines leave little room for detailed cleaning. Camz Cleaning
//           provides professional house cleaning services in Calgary for
//           homeowners who want reliable, consistent care without the added
//           stress. Our residential cleaning service covers essential areas
//           throughout the home, including kitchens, bathrooms, bedrooms and
//           living spaces, with the cleaning scope tailored to your property,
//           condition and priorities. Whether you need regular upkeep, a detailed
//           deep clean or move-in/move-out cleaning, our team focuses on creating
//           a cleaner, fresher and more comfortable home with careful attention to
//           the areas that matter most.
//         </p>
//       </section>

//       {/* Why Choose */}
//       <section className="space-y-6">
//         <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//           Why Choose Camz Cleaning?
//         </h2>

//         <p className="leading-relaxed">
//           With Camz Cleaning’s residential cleaning services, your home stays
//           cleaner, healthier and easier to maintain. Every visit is planned
//           around your space, schedule and priorities.
//         </p>

//         <ul className="grid grid-cols-1 gap-4">
//           {whyChooseItems.map((item, index) => (
//             <li
//               key={item}
//               className="flex items-start gap-3 font-medium text-gray-700"
//             >
//               <span className="font-bold text-[#0B4E9B]">{index + 1}.</span>
//               <span>{item}</span>
//             </li>
//           ))}
//         </ul>
//       </section>

//       {/* Standard Cleaning Scope */}
//       <section className="space-y-8">
//         <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//           What Is Included in Residential Cleaning?
//         </h2>

//         <div className="space-y-7">
//           {standardCleaning.map((item) => (
//             <div key={item.title} className="space-y-2">
//               <h3 className="text-xl font-bold text-[#0B4E9B]">
//                 {item.title}
//               </h3>
//               <p className="leading-relaxed">{item.description}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Residential Images */}
//       <section>
//         <div className="relative h-[250px] w-full overflow-hidden rounded-2xl">
//           <div className="flex h-full w-[400%] animate-slide gap-4">
//             {[...carouselData, ...carouselData].map((img, index) => (
//               <div
//                 key={`${img.src}-${index}`}
//                 className="h-full w-1/2 flex-shrink-0 px-2"
//               >
//                 <img
//                   src={img.src}
//                   alt={img.alt}
//                   width={1200}
//                   height={800}
//                   className="h-full w-full rounded-2xl object-cover"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Deep Cleaning */}
//       <section className="space-y-8">
//         <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//           Deep Cleaning and Detailed Home Care
//         </h2>

//         <div className="space-y-7">
//           {detailedCleaning.map((item) => (
//             <div key={item.title} className="space-y-2">
//               <h3 className="text-xl font-bold text-[#0B4E9B]">
//                 {item.title}
//               </h3>
//               <p className="leading-relaxed">{item.description}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       <style>{`
//         @keyframes slide {
//           0% {
//             transform: translateX(0);
//           }
//           100% {
//             transform: translateX(-50%);
//           }
//         }
//         .animate-slide {
//           animation: slide 20s linear infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ResidentialCleaningContent;


"use client";

import React, { useState } from "react";
import Link from "next/link";

const ResidentialCleaningContent = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const standardCleaningTasks = [
    "Dusting accessible surfaces",
    "Vacuuming carpets, rugs and floors",
    "Mopping suitable hard-floor surfaces",
    "Cleaning kitchen counters and sinks",
    "Wiping appliance exteriors",
    "Cleaning bathroom sinks, toilets and accessible surfaces",
    "Cleaning mirrors and other accessible glass surfaces",
    "Removing household garbage from serviced areas",
    "Light tidying of accessible spaces",
    "General cleaning of bedrooms and living areas",
  ];

  const deepCleaningTasks = [
    "Baseboards and trim",
    "Door frames and other detailed surfaces",
    "Cabinet fronts and accessible cabinet areas",
    "Appliance surfaces and selected appliance interiors",
    "Window sills and tracks",
    "Light fixtures and ceiling fans",
    "Bathroom grout and detailed bathroom surfaces",
    "Areas behind or underneath accessible furniture",
    "Built-up dirt around frequently used areas",
    "Other detailed cleaning tasks agreed before the appointment",
  ];

  const moveCleaningTasks = [
    "Kitchen surfaces and cabinets",
    "Interior and exterior appliance areas",
    "Bathrooms and sanitary fixtures",
    "Floors and accessible floor edges",
    "Baseboards, trim and doors",
    "Closets and storage areas",
    "Window sills and accessible interior window areas",
    "Light switches and other frequently touched surfaces",
    "Empty rooms and accessible areas that require detailed cleaning",
    "Final cleaning of the property according to the agreed scope",
  ];

  const carouselData = [
    { src: "/wp-admin/uploads/residential-hero.webp", alt: "Residential home prepared for professional cleaning" },
    { src: "/wp-admin/uploads/residential-bg.webp", alt: "Clean residential living area in Calgary" },
    { src: "/wp-admin/uploads/help-bg.webp", alt: "Residential cleaning service in progress" },
    { src: "/wp-admin/uploads/stairs-cleaning.webp", alt: "Residential stairs being cleaned" },
  ];

  const faqs = [
    {
      q: "How much does residential cleaning cost in Calgary?",
      a: "Residential cleaning costs vary according to the size and condition of the property, selected service, cleaning scope and additional requirements. Standard, deep and move-in/move-out cleaning can require different amounts of time and work. Use the Camz Cleaning booking or quote process for pricing based on your property details.",
    },
    {
      q: "What is the difference between standard and deep cleaning?",
      a: "Standard cleaning focuses on routine household maintenance such as dusting, vacuuming, mopping, kitchen cleaning and bathroom cleaning. Deep cleaning adds more detailed work to areas that may require additional attention, such as baseboards, detailed surfaces, appliance areas, grout and other accessible build-up.",
    },
    {
      q: "What is included in move-in or move-out cleaning?",
      a: "Move-in and move-out cleaning is designed for homes changing occupants and can include detailed cleaning of kitchens, bathrooms, floors, cabinets, closets, appliances and other accessible areas according to the agreed scope and property condition.",
    },
    {
      q: "Can I book residential cleaning regularly?",
      a: "Yes. Recurring residential cleaning may be available for households that want ongoing maintenance. The appropriate frequency depends on the property and your cleaning requirements.",
    },
    {
      q: "Do I need to clean before the cleaner arrives?",
      a: "You do not need to perform another full cleaning before the appointment. However, removing personal items, valuables and unnecessary clutter from areas you want cleaned can make more surfaces accessible and allow the cleaning team to work more efficiently.",
    },
    {
      q: "Can I request additional cleaning tasks?",
      a: "Additional tasks may be available depending on the service, property condition, time required and booking scope. It is best to mention additional requirements when requesting your service so the cleaning work can be planned appropriately.",
    },
    {
      q: "Do you clean apartments and condos?",
      a: "Residential cleaning can be provided for different types of homes, including houses, apartments, condos and townhomes, subject to service availability and access requirements.",
    },
    {
      q: "How often should a home be professionally cleaned?",
      a: "There is no single cleaning schedule that works for every household. Factors such as the number of occupants, pets, lifestyle, foot traffic and the home's condition can affect how frequently professional cleaning is useful. Some households may prefer recurring cleaning, while others may only require occasional or one-time service.",
    },
  ];

  // Schema for FAQ Rich Snippets in Google Search
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <article className="w-full space-y-12 text-slate-700 leading-relaxed overflow-hidden">
      {/* Schema Injection for SEO Ranking Defense */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* SECTION 1: Introduction */}
      <section className="space-y-5">
        <div className="space-y-2">
          <div className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B4E9B]">
            Calgary Home Care Specialists
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0B4E9B] sm:text-3xl md:text-3xl lg:text-4xl">
            Residential Cleaning Services in Calgary
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-md border border-slate-100">
          <img
            src="/wp-admin/uploads/residential-hero.webp"
            alt="Professional residential house cleaning service in Calgary"
            width={1200}
            height={650}
            className="h-[260px] w-full object-cover transition-transform duration-500 hover:scale-[1.02] sm:h-[320px]"
          />
        </div>

        <p className="text-base leading-relaxed text-slate-700">
          Keeping a home clean takes time, especially when work, family, errands and everyday responsibilities leave little time for detailed household cleaning. <strong className="font-semibold text-slate-900">Camz Cleaning</strong> provides residential cleaning services in Calgary for homeowners, tenants and households looking for dependable cleaning support that fits the condition and needs of their home.
        </p>

        <div className="rounded-xl border-l-4 border-[#0B4E9B] bg-blue-50/70 p-4 sm:p-5 text-slate-800 text-sm leading-relaxed">
          <p className="font-medium">
            Our residential cleaning services cover the areas you use every day, including kitchens, bathrooms, bedrooms, living areas and floors. Depending on what your home needs, you can choose <strong>standard cleaning for regular upkeep, deep cleaning for a more detailed reset, or move-in/move-out cleaning when a home is changing occupants.</strong>
          </p>
        </div>

        <p className="text-sm text-slate-700">
          Whether you need a one-time cleaning or ongoing home cleaning, our team works according to the agreed cleaning scope and the condition of the property.
        </p>

        <div className="pt-1">
          <Link
            href="/booking/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B4E9B] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#083b77] hover:shadow-md focus:ring-4 focus:ring-blue-100"
          >
            <span>Book Residential Cleaning in Calgary</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* SECTION 2: Residential Cleaning Services We Offer */}
      <section className="space-y-6">
        <div className="space-y-1.5 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            Residential Cleaning Services We Offer
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every home is different, which is why residential cleaning can range from routine maintenance to a more detailed clean.
          </p>
        </div>

        {/* 1. Standard House Cleaning */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-300 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#0B4E9B] font-extrabold text-sm">
              01
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Standard House Cleaning</h3>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Standard cleaning is designed for homes that need regular maintenance rather than an intensive top-to-bottom cleaning. It focuses on the areas and surfaces that collect everyday dust, dirt and household build-up.
          </p>
          <div className="mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Depending on the agreed scope, standard residential cleaning may include:
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {standardCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <svg className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-700">
            Standard cleaning can be arranged as a <strong>one-time service or recurring cleaning</strong>, depending on availability and property requirements.
          </p>
        </div>

        {/* 2. Deep House Cleaning */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-300 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-[#0B4E9B] font-extrabold text-sm">
              02
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Deep House Cleaning</h3>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Deep cleaning is intended for homes that need more detailed attention than routine cleaning provides. It can be useful when a property has accumulated additional dust, grime or build-up, or when you want to give the home a more thorough refresh.
          </p>
          <div className="mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Deep cleaning may include additional attention to areas such as:
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {deepCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <svg className="h-4 w-4 flex-shrink-0 text-indigo-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-xs text-slate-600">
            The exact scope of a deep cleaning depends on the condition of the home, accessibility and the tasks included in the booking.
          </p>
          <p className="mt-2 rounded-lg bg-blue-50/70 p-3 text-xs font-semibold text-[#0B4E9B]">
            Deep cleaning is particularly suitable for homes that need more than routine maintenance or have not received a detailed cleaning recently.
          </p>
        </div>

        {/* 3. Move-In / Move-Out Cleaning */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-300 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-extrabold text-sm">
              03
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Move-In / Move-Out Cleaning</h3>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Moving can leave a long list of cleaning tasks behind. Camz Cleaning provides move-in and move-out residential cleaning for homes that need detailed cleaning before a new occupant arrives or after a previous occupant leaves.
          </p>
          <div className="mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Move-related cleaning can include additional attention to:
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {moveCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <svg className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 space-y-1.5 text-xs text-slate-600">
            <p>
              Move-in cleaning prepares a home before you settle in, while move-out cleaning leaves a property clean and presentable for the next occupant, landlord or property manager.
            </p>
            <p className="italic">
              The cleaning scope may vary depending on whether the property is furnished, empty, occupied or in need of additional work.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Visual Showcase Carousel */}
      <section aria-label="Residential Cleaning Showcase" className="space-y-3">
        <h3 className="text-base font-bold text-slate-800">Our Cleaning in Action</h3>
        <div className="relative h-[200px] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner sm:h-[240px]">
          <div className="flex h-full w-[400%] animate-slide gap-3">
            {[...carouselData, ...carouselData].map((img, index) => (
              <div
                key={`${img.src}-${index}`}
                className="relative h-full w-1/4 flex-shrink-0"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: What Does Residential Cleaning Include (Room Breakdown - 2 Col Sidebar Optimized) */}
      <section className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            What Does Residential Cleaning Include?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Residential cleaning focuses on the practical areas of the home where regular cleaning makes the biggest difference.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Kitchen Cleaning */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0B4E9B]"></span>
                Kitchen Cleaning
              </h3>
              <p className="text-xs text-slate-600">
                The kitchen is frequently used and quickly collects food residue, dust and everyday build-up.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {[
                  "Countertops",
                  "Sinks and surrounding areas",
                  "Stovetop surfaces",
                  "Appliance exteriors",
                  "Cabinet fronts",
                  "Accessible surfaces",
                  "Floors",
                  "Removal of household garbage",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-500 italic">
              Additional appliance or interior cleaning can be included when part of scope.
            </p>
          </div>

          {/* Bathroom Cleaning */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0B4E9B]"></span>
                Bathroom Cleaning
              </h3>
              <p className="text-xs text-slate-600">
                Bathrooms require regular attention because of moisture, soap residue and everyday use.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {[
                  "Toilets",
                  "Sinks and vanities",
                  "Tubs",
                  "Showers",
                  "Mirrors",
                  "Faucets and fixtures",
                  "Accessible surfaces & floors",
                  "Visible dust and build-up",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-500 italic">
              Deep cleaning adds detailed attention to grout and edges.
            </p>
          </div>

          {/* Bedrooms and Living Areas */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0B4E9B]"></span>
                Bedrooms &amp; Living Areas
              </h3>
              <p className="text-xs text-slate-600">
                Living spaces collect dust, hair, debris and everyday clutter over time.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {[
                  "Accessible furniture surfaces",
                  "Tables and accessible surfaces",
                  "Bed areas",
                  "Floors, carpets and rugs",
                  "Accessible corners and edges",
                  "General living-area surfaces",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-500 italic">
              Light tidying can be included within agreed scope.
            </p>
          </div>

          {/* Floors, Rugs and Carpets */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0B4E9B]"></span>
                Floors, Rugs &amp; Carpets
              </h3>
              <p className="text-xs text-slate-600">
                Floor care is essential for maintaining a clean and comfortable home.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {[
                  "Vacuuming carpets & rugs",
                  "Removing visible dust and debris",
                  "Mopping suitable hard floors",
                  "Cleaning accessible floor edges",
                  "Surface-matched cleaning methods",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-500 italic">
              Methods adapted to hardwood, laminate, tile or vinyl.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Choosing the Right Residential Cleaning Service */}
      <section className="space-y-5 rounded-3xl bg-slate-50 p-5 sm:p-7 border border-slate-200/80">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Choosing the Right Cleaning Service
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Match the cleaning work with the current condition of your property:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm border-t-4 border-blue-500">
            <h3 className="text-sm font-bold text-slate-900">Standard Cleaning</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              {[
                "Home receives regular cleaning",
                "Mainly need everyday dust/dirt removed",
                "Want ongoing household upkeep",
                "Property doesn't need detailing",
                "Recurring cleaning schedule",
              ].map((pt) => (
                <li key={pt} className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border-t-4 border-indigo-600">
            <h3 className="text-sm font-bold text-slate-900">Deep Cleaning</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              {[
                "Needs more detailed attention",
                "Long time since last thorough clean",
                "Preparing for seasonal refresh",
                "Extra focus on detailed surfaces",
                "Routine cleaning alone isn't enough",
              ].map((pt) => (
                <li key={pt} className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border-t-4 border-amber-500">
            <h3 className="text-sm font-bold text-slate-900">Move-In / Out</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              {[
                "Moving into a new home",
                "Preparing rental for handover",
                "Moving out of a property",
                "Property is empty or nearly empty",
                "Detailed cleaning before arrival",
              ].map((pt) => (
                <li key={pt} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-center text-xs font-medium text-slate-600 pt-1">
          If you are unsure which service fits, the cleaning scope can be discussed before the appointment.
        </p>
      </section>

      {/* SECTION 6: One-Time and Recurring House Cleaning in Calgary */}
      <section className="space-y-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#0B4E9B]">
          One-Time and Recurring House Cleaning in Calgary
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          Camz Cleaning offers residential cleaning options based on household needs and scheduling availability.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          A <strong className="font-semibold text-slate-900">one-time cleaning</strong> is useful for particular occasions, while <strong className="font-semibold text-slate-900">recurring cleaning</strong> maintains the property on an ongoing basis without waiting for significant build-up.
        </p>
        <p className="text-xs font-medium text-slate-600 pt-1">
          Appropriate frequency depends on household size, occupancy, lifestyle, pets, and foot traffic.
        </p>
      </section>

      {/* SECTION 7: Pricing Section */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Residential Cleaning Pricing
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Residential cleaning pricing depends on property size, condition, service scope, and any additional tasks. Camz Cleaning calculates the service according to specific requirements:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Standard Cleaning</h3>
            <p className="mt-1.5 text-xs text-slate-600">
              Suitable for routine maintenance and recurring household cleaning.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Deep Cleaning</h3>
            <p className="mt-1.5 text-xs text-slate-600">
              Suitable when additional time and detailing are required for accumulated build-up.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Move-In / Move-Out</h3>
            <p className="mt-1.5 text-xs text-slate-600">
              Suitable for properties requiring detailed turnover cleaning before/after moves.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 p-5 text-center text-white space-y-2">
          <p className="text-sm font-semibold">Your final cleaning price may vary depending on the property and selected service.</p>
          <p className="text-xs text-slate-300">For the most accurate price, use our online booking or request a quote with your property details.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/booking/" className="rounded-lg bg-[#0B4E9B] px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-600 transition-colors">
              Online Booking
            </Link>
            <Link href="/contact-us/" className="rounded-lg bg-white/10 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-colors border border-white/20">
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8: Factors Affecting Time & Property Types */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Factors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B4E9B]">
            What Can Affect Cleaning Time?
          </h2>
          <p className="text-xs text-slate-600">
            Home size is only one factor. Time required can also depend on:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {[
              "Number of bedrooms and bathrooms",
              "Overall condition of the home",
              "Amount of accumulated dirt or dust",
              "Floor and surface types",
              "Whether property is furnished",
              "Amount of accessible furniture",
              "Additional cleaning requests",
              "Selected cleaning service tier",
              "Routine vs first-time/deep service",
            ].map((factor) => (
              <li key={factor} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Home Types */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B4E9B]">
            Types of Homes We Clean
          </h2>
          <p className="text-xs text-slate-600">
            Our residential cleaning services suit a variety of Calgary properties:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              "Houses",
              "Apartments",
              "Condominiums",
              "Townhomes",
              "Rental properties",
              "Family homes",
              "Turnover properties",
              "Routine maintenance homes",
            ].map((type) => (
              <span
                key={type}
                className="rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#0B4E9B] border border-blue-100"
              >
                {type}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 italic pt-2">
            Available scope depends on access, layout and requested tasks.
          </p>
        </div>
      </section>

      {/* SECTION 9: Why Choose Camz Cleaning (Sidebar 2-col Grid) */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Why Choose Camz Cleaning?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Residential cleaning organized around your space, schedule and priorities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: "Clear Cleaning Scope",
              desc: "The cleaning service is based on the selected service and the tasks agreed for the property.",
            },
            {
              title: "Flexible Service Options",
              desc: "Choose between standard, deep and move-in/move-out cleaning depending on what your home needs.",
            },
            {
              title: "One-Time or Recurring",
              desc: "Arranged for individual needs or ongoing maintenance, subject to availability.",
            },
            {
              title: "Online Booking",
              desc: "Request your preferred appointment easily through our online booking system.",
            },
            {
              title: "Calgary Service",
              desc: "Dedicated to homes in Calgary and surrounding communities with consistent care.",
            },
            {
              title: "Dedicated Quality Care",
              desc: "Every visit is organized around high standards, your schedule, and individual priorities.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs sm:text-sm font-bold text-[#0B4E9B]">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: Frequently Asked Questions (Accordion) */}
    

      {/* SECTION 11: Final Booking Call To Action Section */}
      <section className="rounded-2xl bg-gradient-to-r from-[#0B4E9B] to-[#125eb5] p-6 text-center text-white shadow-md space-y-4">
        <h2 className="text-xl sm:text-2xl font-extrabold">
          Book Residential Cleaning in Calgary
        </h2>
        <p className="mx-auto max-w-xl text-xs sm:text-sm text-blue-100 leading-relaxed">
          Whether your home needs routine maintenance, a detailed deep clean or cleaning before or after a move, Camz Cleaning provides residential cleaning options designed around your property.
        </p>
        <p className="text-xs font-semibold text-white">
          Choose the service that fits your home and request your appointment today.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/booking/"
            className="rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#0B4E9B] shadow transition-all hover:bg-blue-50"
          >
            Book Residential Cleaning
          </Link>
          <Link
            href="/contact-us/"
            className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Request a Quote
          </Link>
        </div>
      </section>

      {/* Slide Animation Keyframe */}
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-slide {
          animation: slide 25s linear infinite;
        }
        .animate-slide:hover {
          animation-play-state: paused;
        }
      `}</style>
    </article>
  );
};

export default ResidentialCleaningContent;
