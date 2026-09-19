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
import Image from "next/image";
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
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  return (
    <article className="space-y-16 text-slate-700 leading-relaxed">
      {/* Schema Injection for SEO Ranking Defense */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* SECTION 1: Introduction */}
      <section className="space-y-6">
        <div className="space-y-3">
          <div className="inline-block rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold tracking-wide text-[#0B4E9B]">
            Calgary Home Care Specialists
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0B4E9B] md:text-4xl">
            Residential Cleaning Services in Calgary
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-900/5">
          <img
            src="/wp-admin/uploads/residential-hero.webp"
            alt="Professional residential house cleaning service in Calgary"
            width={1200}
            height={700}
            className="h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>

        <p className="text-lg leading-relaxed text-slate-700">
          Keeping a home clean takes time, especially when work, family, errands and everyday responsibilities leave little time for detailed household cleaning. <strong className="font-semibold text-slate-900">Camz Cleaning</strong> provides residential cleaning services in Calgary for homeowners, tenants and households looking for dependable cleaning support that fits the condition and needs of their home.
        </p>

        <div className="rounded-xl border-l-4 border-[#0B4E9B] bg-blue-50/60 p-5 text-slate-800">
          <p className="font-medium">
            Our residential cleaning services cover the areas you use every day, including kitchens, bathrooms, bedrooms, living areas and floors. Depending on what your home needs, you can choose <strong>standard cleaning for regular upkeep, deep cleaning for a more detailed reset, or move-in/move-out cleaning when a home is changing occupants.</strong>
          </p>
        </div>

        <p className="text-slate-700">
          Whether you need a one-time cleaning or ongoing home cleaning, our team works according to the agreed cleaning scope and the condition of the property.
        </p>

        <div className="pt-2">
          <Link
            href="/booking/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B4E9B] px-6 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-[#083b77] hover:shadow-lg focus:ring-4 focus:ring-blue-200"
          >
            <span>Book residential cleaning in Calgary</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* SECTION 2: Residential Cleaning Services We Offer */}
      <section className="space-y-8">
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Residential Cleaning Services We Offer
          </h2>
          <p className="text-slate-600">
            Every home is different, which is why residential cleaning can range from routine maintenance to a more detailed clean.
          </p>
        </div>

        {/* 1. Standard Cleaning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#0B4E9B] font-bold">
              01
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Standard House Cleaning</h3>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Standard cleaning is designed for homes that need regular maintenance rather than an intensive top-to-bottom cleaning. It focuses on the areas and surfaces that collect everyday dust, dirt and household build-up.
          </p>
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Depending on the agreed scope, standard residential cleaning may include:
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {standardCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-700">
            Standard cleaning can be arranged as a <strong>one-time service or recurring cleaning</strong>, depending on availability and the cleaning requirements of the property.
          </p>
        </div>

        {/* 2. Deep House Cleaning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-[#0B4E9B] font-bold">
              02
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Deep House Cleaning</h3>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Deep cleaning is intended for homes that need more detailed attention than routine cleaning provides. It can be useful when a property has accumulated additional dust, grime or build-up, or when you want to give the home a more thorough refresh.
          </p>
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Deep cleaning may include additional attention to areas such as:
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {deepCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-indigo-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-sm text-slate-600">
            The exact scope of a deep cleaning depends on the condition of the home, accessibility and the tasks included in the booking.
          </p>
          <p className="mt-2 rounded-lg bg-blue-50/70 p-4 text-sm font-semibold text-[#0B4E9B]">
            Deep cleaning is particularly suitable for homes that need more than routine maintenance or have not received a detailed cleaning recently.
          </p>
        </div>

        {/* 3. Move-In / Move-Out Cleaning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
              03
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Move-In / Move-Out Cleaning</h3>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Moving can leave a long list of cleaning tasks behind. Camz Cleaning provides move-in and move-out residential cleaning for homes that need detailed cleaning before a new occupant arrives or after a previous occupant leaves.
          </p>
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Move-related cleaning can include additional attention to:
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {moveCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 space-y-2 text-sm text-slate-600">
            <p>
              Move-in cleaning can help prepare a home before you settle in, while move-out cleaning can help leave a property clean and presentable for the next occupant, landlord or property manager.
            </p>
            <p className="italic">
              The cleaning scope may vary depending on whether the property is furnished, empty, occupied or in need of additional work.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Visual Showcase Continuous Carousel */}
      <section aria-label="Camz Cleaning In Action" className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Our Cleaning in Action</h3>
        <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
          <div className="flex h-full w-[400%] animate-slide gap-4">
            {[...carouselData, ...carouselData].map((img, index) => (
              <div
                key={`${img.src}-${index}`}
                className="relative h-full w-1/4 flex-shrink-0 px-1"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full rounded-xl object-cover shadow-sm"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: What Does Residential Cleaning Include (Room Breakdown) */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            What Does Residential Cleaning Include?
          </h2>
          <p className="text-slate-600">
            Residential cleaning is more than simply vacuuming and mopping. Our service focuses on the practical areas of the home where regular cleaning makes the biggest difference.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Kitchen Cleaning */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5 text-[#0B4E9B]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Kitchen Cleaning</h3>
              </div>
              <p className="text-sm text-slate-600">
                The kitchen is one of the most frequently used areas of a home and can quickly collect food residue, dust and everyday build-up.
              </p>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {["Countertops", "Sinks and surrounding areas", "Stovetop surfaces", "Appliance exteriors", "Cabinet fronts", "Accessible surfaces", "Floors", "Removal of household garbage from the serviced area"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 italic">
              Additional appliance or interior cleaning can be included when it forms part of the selected cleaning scope.
            </p>
          </div>

          {/* Bathroom Cleaning */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 text-[#0B4E9B] p-2.5">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Bathroom Cleaning</h3>
              </div>
              <p className="text-sm text-slate-600">
                Bathrooms require regular attention because of moisture, soap residue and everyday use.
              </p>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {["Toilets", "Sinks and vanities", "Tubs", "Showers", "Mirrors", "Faucets and fixtures", "Accessible bathroom surfaces", "Floors", "Visible dust and everyday build-up"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 italic">
              For deep cleaning, additional attention can be given to detailed areas such as grout, edges and other accessible surfaces.
            </p>
          </div>

          {/* Bedrooms and Living Areas */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 text-[#0B4E9B] p-2.5">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Bedrooms and Living Areas</h3>
              </div>
              <p className="text-sm text-slate-600">
                Bedrooms and living spaces can collect dust, hair, debris and everyday clutter over time.
              </p>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {["Accessible furniture surfaces", "Tables and other accessible surfaces", "Bed areas", "Floors", "Carpets and rugs", "Accessible corners and edges", "General living-area surfaces"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 italic">
              Light tidying can be included where it falls within the agreed service scope.
            </p>
          </div>

          {/* Floors, Rugs and Carpets */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 text-[#0B4E9B] p-2.5">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Floors, Rugs and Carpets</h3>
              </div>
              <p className="text-sm text-slate-600">
                Floor cleaning is an important part of maintaining a comfortable home.
              </p>
              <ul className="space-y-1.5 text-sm text-slate-700">
                {["Vacuuming carpets", "Vacuuming rugs", "Removing visible dust and debris", "Mopping suitable hard floors", "Cleaning accessible floor edges", "Additional floor attention as included in the selected service"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 italic">
              Cleaning methods are selected according to the type and condition of the surface.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Choosing the Right Residential Cleaning Service */}
      <section className="space-y-8 rounded-3xl bg-slate-50 p-6 md:p-10 border border-slate-200/80">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Choosing the Right Residential Cleaning Service
          </h2>
          <p className="text-slate-600">
            Not every home needs the same level of cleaning. Choosing the appropriate service can make it easier to match the cleaning work with the current condition of your property.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm border-t-4 border-blue-500">
            <h3 className="text-lg font-bold text-slate-900">Choose Standard Cleaning When:</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {["Your home receives regular cleaning", "You mainly need everyday dust and dirt removed", "You want ongoing household maintenance", "The property does not require extensive detailing", "You want a recurring cleaning schedule"].map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border-t-4 border-indigo-600">
            <h3 className="text-lg font-bold text-slate-900">Choose Deep Cleaning When:</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {["Your home needs more detailed attention", "It has been a while since the last thorough cleaning", "You are preparing for a seasonal refresh", "You want additional attention to detailed surfaces", "Regular cleaning alone is not enough for the current condition"].map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border-t-4 border-amber-500">
            <h3 className="text-lg font-bold text-slate-900">Choose Move-In / Move-Out When:</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {["You are moving into a new home", "You are preparing a rental property for handover", "You are moving out of a property", "A property is empty or nearly empty", "You need detailed cleaning before the next occupant arrives"].map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-center text-sm font-medium text-slate-600">
          If you are unsure which service fits your property, the cleaning scope can be discussed before the appointment.
        </p>
      </section>

      {/* SECTION 6: One-Time and Recurring House Cleaning in Calgary */}
      <section className="space-y-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-6 md:p-8">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B]">
          One-Time and Recurring House Cleaning in Calgary
        </h2>
        <p className="text-slate-700 leading-relaxed">
          Camz Cleaning offers residential cleaning options based on the needs of your household and the availability of the service.
        </p>
        <p className="text-slate-700 leading-relaxed">
          A <strong className="font-semibold text-slate-900">one-time cleaning</strong> can be useful when your home needs attention for a particular occasion, while <strong className="font-semibold text-slate-900">recurring cleaning</strong> can help maintain the property on an ongoing basis.
        </p>
        <p className="text-slate-700 leading-relaxed">
          Recurring cleaning may be suitable for households that prefer regular maintenance rather than waiting until significant dirt or dust has accumulated.
        </p>
        <p className="text-sm font-medium text-slate-600">
          The appropriate cleaning frequency depends on factors such as household size, occupancy, lifestyle, pets, foot traffic and the condition of the property.
        </p>
      </section>

      {/* SECTION 7: Pricing Section */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Residential Cleaning Pricing
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Residential cleaning pricing depends on factors such as the size and condition of the property, the selected cleaning service, the required cleaning scope and any additional work requested. Rather than applying the same price to every home, Camz Cleaning calculates the service according to the property's specific cleaning requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Standard Cleaning</h3>
            <p className="mt-2 text-sm text-slate-600">
              Suitable for routine residential maintenance and recurring household cleaning.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Deep Cleaning</h3>
            <p className="mt-2 text-sm text-slate-600">
              Suitable when additional time and attention are required for detailed cleaning and accumulated build-up.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Move-In / Move-Out</h3>
            <p className="mt-2 text-sm text-slate-600">
              Suitable for properties requiring detailed cleaning before moving in or after moving out.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 p-6 text-center text-white">
          <p className="text-base font-semibold">Your final cleaning price may vary depending on the property and the selected service.</p>
          <p className="mt-1 text-sm text-slate-300">For the most accurate price, use our online booking or request a quote with your property details.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <Link href="/booking/" className="rounded-lg bg-[#0B4E9B] px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-colors">
              Online Booking
            </Link>
            <Link href="/contact-us/" className="rounded-lg bg-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition-colors border border-white/20">
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8: Factors Affecting Time & Property Types */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Factors */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-extrabold text-[#0B4E9B]">
            What Can Affect the Cleaning Time?
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            The time required for residential cleaning can vary from one property to another. Home size is only one factor:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {[
              "Number of bedrooms and bathrooms",
              "Overall condition of the home",
              "Amount of accumulated dirt or dust",
              "Floor and surface types",
              "Whether the property is furnished",
              "Amount of accessible furniture",
              "Additional cleaning requests",
              "Selected cleaning service",
              "Whether the cleaning is routine or a first-time/deep service",
            ].map((factor) => (
              <li key={factor} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500 italic">
            Providing accurate information when booking helps us understand the property and determine the appropriate cleaning scope.
          </p>
        </div>

        {/* Home Types */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-xl font-extrabold text-[#0B4E9B]">
            Residential Cleaning for Different Types of Homes
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Our residential cleaning service can be suitable for a variety of Calgary homes:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "Houses",
              "Apartments",
              "Condominiums",
              "Townhomes",
              "Rental properties",
              "Family homes",
              "Homes being prepared for new occupants",
              "Homes requiring regular maintenance",
            ].map((type) => (
              <span
                key={type}
                className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#0B4E9B] border border-blue-100"
              >
                {type}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-600">
            The available service and cleaning scope can depend on the property, access and requested work.
          </p>
        </div>
      </section>

      {/* SECTION 9: Why Choose Camz Cleaning */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Why Choose Camz Cleaning for Residential Cleaning?
          </h2>
          <p className="text-slate-600">
            Choosing a cleaning service is about more than simply having someone clean the floors and surfaces. You also need a clear understanding of what is being cleaned and what to expect from the appointment.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Clear Cleaning Scope",
              desc: "The cleaning service is based on the selected service and the tasks agreed for the property.",
            },
            {
              title: "Flexible Service Options",
              desc: "Choose between standard, deep and move-in/move-out cleaning depending on what your home currently needs.",
            },
            {
              title: "One-Time or Recurring Cleaning",
              desc: "Residential cleaning can be arranged for individual cleaning needs or ongoing household maintenance, subject to availability.",
            },
            {
              title: "Online Booking",
              desc: "Request your preferred appointment through our online booking system and provide the information needed for your residential cleaning service.",
            },
            {
              title: "Calgary Residential Service",
              desc: "Camz Cleaning focuses on residential and other cleaning services for customers in Calgary and the surrounding service areas we currently cover.",
            },
            {
              title: "Dedicated Quality Care",
              desc: "Every visit is organized around the high standards of your property, your schedule, and your individual priorities.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-[#0B4E9B]">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: Frequently Asked Questions (Accordion + Rich Data) */}
      {/* <section className="space-y-6">
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Frequently Asked Questions About Residential Cleaning in Calgary
          </h2>
          <p className="text-slate-600">
            Find answers to common questions about our house cleaning services in Calgary.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-slate-900 transition-colors hover:text-[#0B4E9B]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base md:text-lg">{faq.q}</span>
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5 pt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section> */}

      {/* SECTION 11: Final Booking Call To Action Section */}
      <section className="rounded-3xl bg-gradient-to-r from-[#0B4E9B] to-[#125eb5] p-8 text-center text-white shadow-xl md:p-12">
        <h2 className="text-2xl font-extrabold md:text-4xl">
          Book Residential Cleaning in Calgary
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100 md:text-lg">
          Whether your home needs routine maintenance, a detailed deep clean or cleaning before or after a move, Camz Cleaning provides residential cleaning options designed around the property and the work required.
        </p>
        <p className="mt-4 font-semibold text-white">
          Choose the residential cleaning service that fits your home and request your appointment today.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/booking/"
            className="rounded-xl bg-white px-8 py-4 text-base font-bold text-[#0B4E9B] shadow-md transition-all hover:bg-blue-50 hover:shadow-lg"
          >
            Book Residential Cleaning
          </Link>
          <Link
            href="/contact-us/"
            className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Request a Quote
          </Link>
        </div>
      </section>

      {/* Keyframe Animation for Slide Carousel */}
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
