// "use client";

// import Link from "next/link";

// const SeasonalPropertyContent = () => {
//   const carouselData = [
//     {
//       src: "/wp-admin/uploads/seasonal.webp",
//       alt: "Seasonal property cleaning and care",
//     },
//     {
//       src: "/wp-admin/uploads/seasonal-1.webp",
//       alt: "Winter property access support",
//     },
//     {
//       src: "/wp-admin/uploads/residential-hero.webp",
//       alt: "Seasonal home interior cleaning",
//     },
//     {
//       src: "/wp-admin/uploads/residential-bg.webp",
//       alt: "Seasonal property cleanup",
//     },
//   ];

//   return (
//     <div className="space-y-12 text-gray-700">
//       {/* Introduction */}
//       <section className="space-y-6">
//         <h2 className="text-3xl font-extrabold leading-tight text-[#0B4E9B] md:text-4xl">
//           Year-Round Care for Seasonal and Rental Properties
//         </h2>

//         <div className="overflow-hidden rounded-[2rem] shadow-md">
//           <img
//             src="/wp-admin/uploads/seasonal.webp"
//             alt="Seasonal property and vacation rental cleaning"
//             width={1200}
//             height={800}
//             className="h-[350px] w-full object-cover md:h-[450px]"
//           />
//         </div>

//         <p className="font-medium leading-relaxed">
//           Camz Cleaning supports seasonal homes and vacation rentals in Calgary,
//           with service also available in Airdrie, Cochrane and Chestermere.
//           Choose the tasks needed for the property, season and guest schedule.
//         </p>
//       </section>

//       {/* Seasonal Services */}
//       <section className="space-y-8">
//         <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//           Seasonal Property Services Available
//         </h2>

//         <div className="space-y-7">
//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-[#0B4E9B]">
//               Winter Snow and Access Support
//             </h3>

//             <p className="leading-relaxed">
//               Snow-related property support may be arranged according to the
//               property, conditions, access and team availability.
//             </p>
//           </div>

//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-[#0B4E9B]">
//               Spring and Summer Property Cleanup
//             </h3>

//             <p className="leading-relaxed">
//               Seasonal cleanup for outdoor and indoor areas helps prepare a
//               property for warmer weather, guests or regular use.
//             </p>
//           </div>

//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-[#0B4E9B]">
//               Yard and Garden Area Care
//             </h3>

//             <p className="leading-relaxed">
//               Basic cleanup for agreed yard and garden areas can be included
//               when the requested work is within Camz Cleaning&apos;s actual
//               service scope.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Vacation Rentals */}
//       <section className="space-y-8">
//         <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//           Vacation Rental and Guest Turnover Cleaning
//         </h2>

//         <div className="space-y-7">
//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-[#0B4E9B]">
//               Indoor Cleaning Between Guests
//             </h3>

//             <p className="leading-relaxed">
//               Cleaning for kitchens, bathrooms, bedrooms and living areas
//               between guest stays, based on the property checklist.
//             </p>
//           </div>

//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-[#0B4E9B]">
//               Floors, Windows and Debris Removal
//             </h3>

//             <p className="leading-relaxed">
//               Floor care, accessible window cleaning and removal of ordinary
//               waste or debris according to the agreed turnover scope.
//             </p>
//           </div>

//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-[#0B4E9B]">
//               Guest-Ready Property Preparation
//             </h3>

//             <p className="leading-relaxed">
//               Final presentation checks can help prepare the property for the
//               next arrival. Linen, restocking and damage reporting must be
//               confirmed separately.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Images */}
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
//             height={800}
//             className="h-full w-full rounded-2xl object-cover"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Property Preparation */}
//       <section className="space-y-4">
//         <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//           Property Preparation for a New Season, Rental or Sale
//         </h2>

//         <p className="leading-relaxed">
//           Seasonal property service can help prepare a property for guests,
//           tenants, buyers or a change in season. The exact cleaning and
//           preparation tasks are confirmed according to the property and
//           requested scope.
//         </p>

//         <p className="leading-relaxed">
//           Where more detailed interior work is needed, explore our{" "}
//           <Link
//             href="/residential-cleaning-services/"
//             className="font-bold text-[#0B4E9B] hover:underline"
//           >
//             deep cleaning
//           </Link>{" "}
//           options.
//         </p>
//       </section>

//       {/* Service Plans */}
//       <section className="space-y-4">
//         <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//           One-Time and Recurring Seasonal Service
//         </h2>

//         <p className="leading-relaxed">
//           One-time and recurring arrangements may be available depending on the
//           property, requested tasks, season, access and team availability.
//         </p>
//       </section>

//       {/* Service Areas */}
//       <section className="space-y-4">
//         <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//           Seasonal Property Service Areas
//         </h2>

//         <p className="leading-relaxed">
//           Service is available in{" "}
//           <Link
//             href="/calgary-cleaning-services/"
//             className="font-bold text-[#0B4E9B] hover:underline"
//           >
//             Calgary
//           </Link>{" "}
//           and may also be scheduled in{" "}
//           <Link
//             href="/airdrie-cleaning-services/"
//             className="font-bold text-[#0B4E9B] hover:underline"
//           >
//             Airdrie
//           </Link>
//           ,{" "}
//           <Link
//             href="/cochrane-cleaning-services/"
//             className="font-bold text-[#0B4E9B] hover:underline"
//           >
//             Cochrane
//           </Link>{" "}
//           and{" "}
//           <Link
//             href="/chestermere-cleaning-services/"
//             className="font-bold text-[#0B4E9B] hover:underline"
//           >
//             Chestermere
//           </Link>
//           .
//         </p>
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

// export default SeasonalPropertyContent;


"use client";

import React, { useState } from "react";
import Link from "next/link";

const SeasonalPropertyContent = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const generalSeasonalServices = [
    "Interior property cleaning",
    "Seasonal home cleanup",
    "Kitchen and bathroom cleaning",
    "Bedroom and living-area cleaning",
    "Floor vacuuming and mopping",
    "Accessible surface cleaning",
    "Window and glass cleaning where included",
    "Removal of ordinary household waste and debris",
    "Guest or rental property preparation",
    "Selected yard and garden-area cleanup",
    "Property access support related to agreed cleaning work",
    "Preparation for a new season, occupancy or rental use",
  ];

  const springInterior = [
    "Dusting accessible surfaces",
    "Cleaning kitchens",
    "Cleaning bathrooms",
    "Vacuuming carpets and rugs",
    "Mopping suitable hard floors",
    "Cleaning bedrooms and living areas",
    "Cleaning accessible fixtures and surfaces",
    "Removing ordinary household waste",
  ];

  const springPropertyCleanup = [
    "Entry areas",
    "Accessible storage areas",
    "Windows and window areas",
    "Floors and floor edges",
    "General dust and debris removal",
    "Other agreed seasonal cleaning tasks",
  ];

  const summerCleaning = [
    "Kitchen cleaning",
    "Bathroom cleaning",
    "Bedroom preparation",
    "Living-area cleaning",
    "Floor cleaning",
    "Dusting and surface wiping",
    "Window cleaning where included",
    "General property cleanup",
    "Guest-area preparation",
    "Selected outdoor-area cleanup",
  ];

  const fallCleaning = [
    "Cleaning kitchens and bathrooms",
    "Vacuuming and mopping floors",
    "Dusting accessible surfaces",
    "Cleaning living areas and bedrooms",
    "Removing ordinary waste",
    "Cleaning entry areas",
    "Cleaning accessible windows and surfaces where included",
    "General seasonal property cleanup",
    "Other agreed preparation tasks",
  ];

  const winterFactors = [
    "Weather conditions",
    "Property access",
    "Snow and ice conditions",
    "Property location",
    "Required equipment",
    "Team availability",
    "The specific work requested",
  ];

  const rentalTurnoverTasks = [
    "Kitchen cleaning",
    "Bathroom cleaning",
    "Bedroom cleaning",
    "Living-area cleaning",
    "Vacuuming carpets and rugs",
    "Mopping suitable hard floors",
    "Cleaning accessible surfaces",
    "Removing ordinary guest waste",
    "General tidying of guest areas",
  ];

  const rentalPrepTasks = [
    "Making beds where clean linens are provided",
    "Preparing bedrooms",
    "Cleaning bathrooms",
    "Resetting kitchen and living areas",
    "Removing waste",
    "Cleaning floors",
    "Returning accessible areas to their designated condition",
    "Completing the agreed property checklist",
  ];

  const kitchenItems = [
    "Countertops",
    "Sinks",
    "Stovetop",
    "Appliance exteriors",
    "Cabinet fronts",
    "Accessible surfaces",
    "Kitchen floors",
  ];

  const bathroomItems = [
    "Toilets",
    "Sinks",
    "Vanities",
    "Showers",
    "Tubs",
    "Mirrors",
    "Fixtures",
    "Bathroom floors",
  ];

  const bedroomLivingItems = [
    "Accessible furniture surfaces",
    "Dusting",
    "Vacuuming",
    "Floor cleaning",
    "General surface cleaning",
    "Light tidying",
  ];

  const entryCommonItems = [
    "Entry floors",
    "Accessible surfaces",
    "Doors and handles",
    "High-use areas",
    "Visible dust and debris",
  ];

  const outdoorTasks = [
    "Yard areas",
    "Garden areas",
    "Property entrances",
    "Outdoor debris",
    "Accessible outdoor surfaces",
  ];

  const salePrepTasks = [
    "Kitchen cleaning",
    "Bathroom cleaning",
    "Floor cleaning",
    "Dusting",
    "Surface wiping",
    "Living-area cleaning",
    "Bedroom cleaning",
    "Accessible window cleaning where included",
    "Removal of ordinary household debris",
  ];

  const newOccupantPrepTasks = [
    "Kitchen cleaning",
    "Bathroom cleaning",
    "Bedroom cleaning",
    "Living-area cleaning",
    "Floor cleaning",
    "Surface dusting",
    "Waste removal",
    "Accessible window cleaning",
    "General property cleanup",
  ];

  const oneTimeReasons = [
    "Preparing a property for spring or summer",
    "Opening a seasonal home after limited use",
    "Preparing a rental property",
    "Getting a property ready for sale",
    "Cleaning after a change in occupancy",
    "Completing a general seasonal refresh",
  ];

  const recurringFactors = [
    "Property use",
    "Occupancy",
    "Guest turnover",
    "Property size",
    "Condition",
    "Seasonal requirements",
    "Requested cleaning tasks",
  ];

  const pricingFactors = [
    "Property size",
    "Property condition",
    "Number of bedrooms and bathrooms",
    "Interior cleaning requirements",
    "Outdoor-area requirements",
    "Cleaning frequency",
    "Guest turnover requirements",
    "Additional cleaning tasks",
    "Property location",
    "Time required to complete scope",
  ];

  const timeFactors = [
    "Length of time the property has been unused",
    "Amount of accumulated dust or debris",
    "Property size",
    "Number of rooms",
    "Number of bathrooms",
    "Furniture and accessibility",
    "Condition of kitchens and bathrooms",
    "Number of windows requiring cleaning",
    "Outdoor cleanup requirements",
    "Guest turnover condition",
    "Additional requested tasks",
  ];

  const carouselData = [
    { src: "/wp-admin/uploads/seasonal.webp", alt: "Seasonal property cleaning and care in Calgary" },
    { src: "/wp-admin/uploads/seasonal-1.webp", alt: "Winter property access support" },
    { src: "/wp-admin/uploads/residential-hero.webp", alt: "Seasonal home interior cleaning" },
    { src: "/wp-admin/uploads/residential-bg.webp", alt: "Seasonal property cleanup" },
  ];

  const faqs = [
    {
      q: "What is seasonal property cleaning?",
      a: "Seasonal property cleaning is cleaning and preparation performed when a property changes from one season or period of use to another. It can include interior cleaning, property cleanup, rental preparation and selected outdoor tasks according to the property's requirements.",
    },
    {
      q: "When should I schedule seasonal cleaning?",
      a: "The ideal timing depends on how and when the property is used. Many property owners schedule cleaning before a seasonal home is occupied, before guests arrive, after a period of vacancy or when preparing the property for a new season.",
    },
    {
      q: "Do you clean homes that have been vacant?",
      a: "Yes. Seasonal cleaning can be requested for properties that have been unused for a period of time. The cleaning scope and time required depend on the property's condition and the amount of accumulated dust or debris.",
    },
    {
      q: "Do you provide spring cleaning for seasonal homes?",
      a: "Yes. Spring cleaning can be arranged for seasonal properties and can include interior cleaning, floors, kitchens, bathrooms, bedrooms, living areas and other agreed tasks.",
    },
    {
      q: "Do you provide winter property support?",
      a: "Winter-related property support may be available for agreed tasks depending on weather, property access, equipment and team availability. The exact service should be confirmed before booking.",
    },
    {
      q: "Do you provide yard or garden cleanup?",
      a: "Selected yard and garden-area cleanup may be available when the requested work falls within Camz Cleaning's service scope. Specialized landscaping or maintenance work should be confirmed separately.",
    },
    {
      q: "Can you prepare my vacation rental between guests?",
      a: "Yes. Seasonal and vacation rental cleaning can include cleaning kitchens, bathrooms, bedrooms, living areas and floors between guest stays according to the property's turnover checklist.",
    },
    {
      q: "Do you provide Airbnb turnover cleaning?",
      a: "Yes. Camz Cleaning provides Airbnb and short-term rental cleaning as a dedicated service. The turnover scope can include guest-area cleaning, kitchen and bathroom cleaning, floor care, waste removal and other agreed tasks.",
    },
    {
      q: "Can seasonal cleaning be scheduled regularly?",
      a: "Yes. Recurring seasonal cleaning may be available when ongoing property maintenance is required. Frequency depends on the property, requested tasks and scheduling availability.",
    },
    {
      q: "Do you clean seasonal properties in Calgary?",
      a: "Yes. Camz Cleaning provides seasonal property cleaning throughout Calgary, including Downtown, Southeast, Northeast, Northwest and Southwest Calgary, subject to service availability.",
    },
    {
      q: "Do you provide seasonal cleaning in Airdrie?",
      a: "Yes. Airdrie is currently included in Camz Cleaning's seasonal property cleaning service area, subject to availability.",
    },
    {
      q: "Do you provide seasonal cleaning in Chestermere?",
      a: "Yes. Chestermere is currently included in Camz Cleaning's seasonal property cleaning service area, subject to availability and property requirements.",
    },
    {
      q: "How much does seasonal property cleaning cost?",
      a: "Pricing depends on the property size, condition, requested tasks, cleaning frequency, location and time required. A quote can be provided based on your specific property and cleaning requirements.",
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
            Seasonal &amp; Vacation Care
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0B4E9B] sm:text-3xl md:text-3xl lg:text-4xl">
            Seasonal Property Cleaning and Care in Calgary
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-md border border-slate-100">
          <img
            src="/wp-admin/uploads/seasonal.webp"
            alt="Seasonal property cleaning and vacation rental care in Calgary"
            width={1200}
            height={650}
            className="h-[260px] w-full object-cover transition-transform duration-500 hover:scale-[1.02] sm:h-[320px]"
          />
        </div>

        <p className="text-base leading-relaxed text-slate-700">
          Seasonal properties can need different types of cleaning and preparation throughout the year. A property that is closed during part of the year may need attention before it is occupied again, while a vacation rental may require cleaning and preparation between guest stays.
        </p>

        <div className="rounded-xl border-l-4 border-[#0B4E9B] bg-blue-50/70 p-4 sm:p-5 text-slate-800 text-sm leading-relaxed">
          <p className="font-medium">
            <strong className="font-semibold text-slate-900">Camz Cleaning</strong> provides seasonal property cleaning and care services in Calgary and selected surrounding areas for homeowners, property owners and rental-property operators who need help preparing and maintaining their properties throughout the year.
          </p>
        </div>

        <p className="text-sm text-slate-700">
          Our services can include seasonal interior cleaning, property cleanup, guest turnover cleaning and selected outdoor-area tasks, depending on the property, season, access and requested scope. Whether you are preparing a property for the next season, getting a rental ready for guests or arranging a one-time property cleanup, the service can be planned around the work your property requires.
        </p>

        <div className="pt-1">
          <Link
            href="/contact-us/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B4E9B] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#083b77] hover:shadow-md focus:ring-4 focus:ring-blue-100"
          >
            <span>Request Seasonal Cleaning in Calgary</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* SECTION 2: Seasonal Property Cleaning Services We Offer */}
      <section className="space-y-6">
        <div className="space-y-1.5 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            Seasonal Property Cleaning Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Every seasonal property has different requirements. Some need detailed interior cleaning after being closed for months, while others need preparation before arrivals.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Our seasonal services may include:</h3>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {generalSeasonalServices.map((task) => (
              <li key={task} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <svg className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{task}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-100">
            The exact service scope is confirmed according to the property, access conditions and requested work.
          </p>
        </div>
      </section>

      {/* SECTION 3: Visual Showcase Carousel */}
      <section aria-label="Seasonal Property Care Gallery" className="space-y-3">
        <h3 className="text-base font-bold text-slate-800">Seasonal Care in Action</h3>
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

      {/* SECTION 4: 4 Seasons Care (Spring, Summer, Fall, Winter) */}
      <section className="space-y-6">
        <div className="space-y-1.5 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            Year-Round Seasonal Care Solutions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Tailored cleaning solutions that adapt to Calgary&apos;s changing climate across every season.
          </p>
        </div>

        {/* 1. Spring Property Cleaning */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-sm">
              01
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Spring Property Cleaning and Preparation</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Spring can be a useful time to prepare a seasonal home or property after the winter period. A spring cleaning service focuses on removing accumulated dust, debris and general build-up.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B4E9B]">Interior Cleaning:</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {springInterior.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B4E9B]">Property Cleanup:</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {springPropertyCleanup.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Summer Property Cleaning */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-extrabold text-sm">
              02
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Summer Property Cleaning</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Summer properties experience increased use from homeowners, visitors, tenants and short-term rental guests. Summer cleaning helps maintain the interior and selected areas during periods of higher occupancy.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 pt-2">
            {summerCleaning.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-[#0B4E9B] font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 italic pt-1">
            For vacation and rental properties, cleaning can also be coordinated around guest turnover requirements where scheduling allows.
          </p>
        </div>

        {/* 3. Fall Property Preparation */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-800 font-extrabold text-sm">
              03
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Fall Property Preparation</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Fall is when seasonal properties are prepared for reduced use, winter occupancy or a change in property routine. A fall cleaning service organizes and cleans before the next stage of the season.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 pt-2">
            {fallCleaning.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-[#0B4E9B] font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 italic pt-1">
            If a property will remain vacant for an extended period, owners should provide any property-specific access or preparation instructions before the service.
          </p>
        </div>

        {/* 4. Winter Property Cleaning & Access Support */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#0B4E9B] font-extrabold text-sm">
              04
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Winter Property Cleaning and Access Support</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Winter conditions create additional challenges where snow and weather affect property access. Where available, winter-related support may be discussed as part of seasonal service (cleaning-related access preparation or agreed snow/debris support within actual scope).
          </p>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Availability and work depend on:</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
              {winterFactors.map((factor) => (
                <li key={factor} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-500 italic">
            Any winter property support should be confirmed before the appointment.
          </p>
        </div>
      </section>

      {/* SECTION 5: Vacation Rental and Seasonal Rental Cleaning */}
      <section className="space-y-6">
        <div className="space-y-1.5 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            Vacation Rental and Seasonal Rental Cleaning
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Seasonal and vacation rental properties often need cleaning and guest preparation between occupants.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0B4E9B]" />
              Cleaning Between Guests
            </h3>
            <p className="text-xs text-slate-600">
              Turnover cleaning based on property condition and manager checklist:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {rentalTurnoverTasks.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0B4E9B]" />
              Preparing for Next Guest
            </h3>
            <p className="text-xs text-slate-600">
              Guest-ready presentation checks before the next arrival:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {rentalPrepTasks.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-blue-50/70 p-4 text-xs text-slate-700 space-y-2 border border-blue-100">
          <p>
            Linen laundry, supply restocking, amenity placement and other rental-management tasks should be confirmed separately before they are included in the service.
          </p>
          <p className="font-semibold">
            For dedicated Airbnb and short-term rental turnover services, explore our{" "}
            <Link href="/residential-cleaning-services/" className="text-[#0B4E9B] underline">
              Airbnb &amp; Short-Term Rental Cleaning
            </Link>{" "}
            options.
          </p>
        </div>
      </section>

      {/* SECTION 6: Seasonal Home Interior Cleaning (Room Breakdown) */}
      <section className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            Seasonal Home Interior Cleaning
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A property unused for a period of time collects dust and requires additional cleaning before reoccupation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Kitchen</h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {kitchenItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Bathrooms</h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {bathroomItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Bedrooms and Living Areas</h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {bedroomLivingItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Entry and Common Areas</h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {entryCommonItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 7: Yard and Garden Area Cleanup */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-xl font-extrabold text-[#0B4E9B]">
          Yard and Garden Area Cleanup
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Some seasonal properties require basic attention to accessible outdoor areas as part of seasonal preparation. Where requested work falls within Camz Cleaning&apos;s scope, tasks may include:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {outdoorTasks.map((task) => (
            <span key={task} className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200">
              ✓ {task}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 italic pt-2">
          Availability depends on property, season, weather and equipment. Camz Cleaning does not treat specialized landscaping or heavy property-maintenance as standard seasonal cleaning; these must be confirmed before booking.
        </p>
      </section>

      {/* SECTION 8: Preparing for Sale or New Occupants */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Property Preparation for Sale or New Occupants
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Ensure your property makes an exceptional impression on prospective buyers, tenants or incoming owners.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Preparing for Sale
            </h3>
            <p className="text-xs text-slate-600">
              Improves presentation of accessible interior spaces before photographs and viewings:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {salePrepTasks.map((task) => (
                <li key={task} className="flex items-center gap-2">
                  <span className="text-[#0B4E9B] font-bold">✓</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Preparing for New Occupants
            </h3>
            <p className="text-xs text-slate-600">
              Makes accessible areas of the property thoroughly clean and ready for immediate use:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {newOccupantPrepTasks.map((task) => (
                <li key={task} className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 9: Seasonal Property Cleaning Checklist */}
      <section className="rounded-3xl bg-slate-50 p-5 sm:p-7 border border-slate-200/80 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Seasonal Property Cleaning Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A property-specific checklist communicates required seasonal tasks clearly:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-xl bg-white p-3.5 shadow-sm border border-slate-100 space-y-2">
            <strong className="block font-bold text-slate-900 text-[13px]">Interior</strong>
            <ul className="space-y-1 text-slate-600">
              {["Kitchen", "Bathrooms", "Bedrooms", "Living areas", "Floors & windows"].map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white p-3.5 shadow-sm border border-slate-100 space-y-2">
            <strong className="block font-bold text-slate-900 text-[13px]">Rental Prep</strong>
            <ul className="space-y-1 text-slate-600">
              {["Guest bedrooms", "Beds/linens", "Bathrooms", "Kitchen resets", "Waste removal"].map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white p-3.5 shadow-sm border border-slate-100 space-y-2">
            <strong className="block font-bold text-slate-900 text-[13px]">Outdoor Areas</strong>
            <ul className="space-y-1 text-slate-600">
              {["Accessible yard", "Garden areas", "Entryways", "Outdoor debris"].map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white p-3.5 shadow-sm border border-slate-100 space-y-2">
            <strong className="block font-bold text-slate-900 text-[13px]">Property Specific</strong>
            <p className="text-slate-600 leading-relaxed">
              Custom tasks added to scope based on individual home needs.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 10: One-Time and Recurring Seasonal Cleaning */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            One-Time and Recurring Seasonal Cleaning
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Arranged as a single opening/closing service or recurring upkeep throughout the season.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">One-Time Seasonal Cleaning</h3>
            <p className="text-xs text-slate-600">Useful when:</p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {oneTimeReasons.map((r) => (
                <li key={r} className="flex items-center gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Recurring Seasonal Service</h3>
            <p className="text-xs text-slate-600">Frequency depends on:</p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {recurringFactors.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 11: Pricing and Cleaning Time Factors */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B4E9B]">
            Seasonal Cleaning Pricing Factors
          </h2>
          <p className="text-xs text-slate-600">Pricing varies based on:</p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {pricingFactors.map((factor) => (
              <li key={factor} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B4E9B]">
            What Affects Cleaning Time?
          </h2>
          <p className="text-xs text-slate-600">Time required depends on:</p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {timeFactors.map((factor) => (
              <li key={factor} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 12: Why Choose Camz Cleaning */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
          Why Choose Camz Cleaning for Seasonal Care?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: "Property-Specific Cleaning",
              desc: "Tasks selected according to condition, use and seasonal requirements.",
            },
            {
              title: "Flexible Service Options",
              desc: "One-time and recurring arrangements based on your scheduling capacity.",
            },
            {
              title: "Indoor & Selected Outdoor",
              desc: "Covers interior cleaning and selected accessible outdoor-area cleanup.",
            },
            {
              title: "Rental Property Support",
              desc: "Dedicated turnovers and guest-preparation tailored to manager checklists.",
            },
            {
              title: "Clear Cleaning Scope",
              desc: "Every task is agreed upon in advance for complete transparency.",
            },
            {
              title: "Calgary & Area Service",
              desc: "Dependable local coverage across Calgary, Airdrie, and Chestermere.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs sm:text-sm font-bold text-[#0B4E9B]">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 13: Service Areas */}
      <section className="rounded-2xl bg-slate-900 p-5 sm:p-6 text-white space-y-3">
        <h2 className="text-lg font-bold text-white">
          Seasonal Property Service Areas
        </h2>
        <p className="text-xs text-slate-300">
          Seasonal cleaning is available across <strong>Calgary (Downtown, Southeast, Northeast, Northwest, Southwest), Airdrie, and Chestermere</strong>.
        </p>
      </section>

      {/* SECTION 14: Frequently Asked Questions (Accordion) */}
    

      {/* SECTION 15: Final Call To Action Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-[#0B4E9B] to-[#125eb5] p-6 text-center text-white shadow-md space-y-4">
        <h2 className="text-xl sm:text-2xl font-extrabold">
          Prepare Your Property for the Next Season
        </h2>
        <p className="mx-auto max-w-xl text-xs sm:text-sm text-blue-100 leading-relaxed">
          Whether your seasonal home needs a spring refresh, summer preparation, fall cleanup, rental turnover service or general cleaning after a period of limited use, Camz Cleaning is here to help.
        </p>
        <p className="text-xs font-semibold text-white">
          Tell us about your property, location, current condition and required tasks.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/contact-us/"
            className="rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#0B4E9B] shadow transition-all hover:bg-blue-50"
          >
            Request a Quote
          </Link>
          <Link
            href="/booking/"
            className="rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Book Seasonal Cleaning
          </Link>
        </div>
      </section>

      {/* Regional Footnote */}
      <div className="rounded-xl bg-slate-100 p-3.5 text-center text-xs font-semibold text-slate-600">
        Calgary • Downtown Calgary • Southeast Calgary • Northeast Calgary • Northwest Calgary • Southwest Calgary • Airdrie • Chestermere
      </div>

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

export default SeasonalPropertyContent;
