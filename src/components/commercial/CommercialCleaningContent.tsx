// "use client";

// import Link from "next/link";

// const CommercialCleaningContent = () => {
//   const coverageItems = [
//     {
//       title: "Work Areas and Shared Spaces",
//       description:
//         "Dusting, surface wiping and general cleaning for workstations, meeting rooms, reception areas and shared spaces.",
//     },
//     {
//       title: "Washrooms and Staff Kitchens",
//       description:
//         "Cleaning and sanitizing for washrooms, break areas and staff kitchens based on the agreed service checklist.",
//     },
//     {
//       title: "Floors, Waste and High-Touch Surfaces",
//       description:
//         "Vacuuming, mopping, waste removal and attention to frequently touched surfaces throughout the property.",
//     },
//   ];

//   const carouselData = [
//     {
//       src: "/wp-admin/uploads/stairs-cleaning.webp",
//       alt: "Commercial stairs and shared-area cleaning",
//     },
//     {
//       src: "/wp-admin/uploads/floor-cleaning-of-home.webp",
//       alt: "Commercial floor cleaning",
//     },
//     {
//       src: "/wp-admin/uploads/floor cleaning of home-2.webp",
//       alt: "Floor and surface cleaning",
//     },
//     {
//       src: "/wp-admin/uploads/floor-cleaning-of-home-3.webp",
//       alt: "Professional floor maintenance",
//     },
//   ];

//   return (
//     <div className="space-y-12 text-gray-700">
//       {/* Introduction */}
//       <section className="space-y-6">
//         <div className="overflow-hidden rounded-[2rem] shadow-md">
//           <img
//             src="/commercial-cleaning.webp"
//             alt="Commercial workspace prepared for professional cleaning"
//             width={1200}
//             height={800}
//             className="h-[300px] w-full object-cover md:h-[400px]"
//           />
//         </div>

//         <p className="font-medium leading-relaxed">
//           Camz Cleaning provides commercial cleaning for workplaces and shared
//           facilities, with each service planned around the property, schedule
//           and agreed cleaning requirements.
//         </p>
//       </section>

//       {/* Commercial Properties */}
//       <section className="space-y-8">
//         <div className="space-y-4">
//           <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//             Commercial Properties We Clean
//           </h2>

//           <p className="leading-relaxed">
//             Explore our commercial cleaning options, each tailored to your
//             property, schedule and day-to-day requirements.
//           </p>
//         </div>

//         <div className="space-y-7">
//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-[#0B4E9B]">
//               Offices and Corporate Workspaces
//             </h3>

//             <p className="leading-relaxed">
//               Detailed cleaning for offices, meeting rooms, reception areas and
//               shared workspaces, helping maintain a tidy and welcoming business
//               environment.
//             </p>
//           </div>

//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-[#0B4E9B]">
//               Shops and Shared Facilities
//             </h3>

//             <p className="leading-relaxed">
//               Flexible cleaning for shops and shared facilities, covering floors,
//               washrooms, high-touch surfaces and common areas.
//             </p>
//           </div>

//           <div className="space-y-2">
//             <h3 className="text-xl font-bold text-[#0B4E9B]">
//               Post-Construction and Renovated Spaces
//             </h3>

//             <p className="leading-relaxed">
//               Post-construction cleaning removes dust, debris and surface
//               residue after renovations, helping prepare commercial spaces for
//               use.
//             </p>
//           </div>

//         </div>
//       </section>

//       {/* Cleaning Scope */}
//       <section className="space-y-8">
//         <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
//           What Is Included in Commercial Cleaning?
//         </h2>

//         <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
//           <div className="space-y-7">
//             {coverageItems.map((item) => (
//               <div key={item.title} className="space-y-2">
//                 <h3 className="text-xl font-bold text-[#0B4E9B]">
//                   {item.title}
//                 </h3>

//                 <p className="leading-relaxed">{item.description}</p>
//               </div>
//             ))}
//           </div>

//           <div className="relative h-[250px] w-full overflow-hidden rounded-2xl">
//             <div className="flex h-full w-[400%] animate-slide gap-4">
//               {[...carouselData, ...carouselData].map((img, index) => (
//                 <div
//                   key={`${img.src}-${index}`}
//                   className="h-full w-1/2 flex-shrink-0 px-2"
//                 >
//                   <img
//                     src={img.src}
//                     alt={img.alt}
//                     width={1200}
//             height={800}
//             className="h-full w-full rounded-2xl object-cover"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
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

// export default CommercialCleaningContent;

"use client";

import React from "react";
import Link from "next/link";

const CommercialCleaningContent = () => {
  const officeCleaningTasks = [
    "Cleaning desks and accessible workstation surfaces",
    "Dusting accessible furniture and fixtures",
    "Cleaning meeting rooms",
    "Cleaning reception and waiting areas",
    "Vacuuming carpets and rugs",
    "Mopping suitable hard floors",
    "Cleaning interior glass and accessible partitions",
    "Cleaning common areas",
    "Removing garbage and recycling",
    "Cleaning frequently touched surfaces",
  ];

  const retailCleaningTasks = [
    "Floor vacuuming and mopping",
    "Entrance and reception-area cleaning",
    "Surface dusting and wiping",
    "High-touch surface cleaning",
    "Washroom cleaning",
    "Waste and recycling removal",
    "Interior glass cleaning",
    "Common-area cleaning",
    "General upkeep of accessible customer areas",
  ];

  const facilityCleaningTasks = [
    "Common areas",
    "Hallways and accessible spaces",
    "Washrooms",
    "Staff areas",
    "Break rooms",
    "Reception areas",
    "Floors",
    "Frequently touched surfaces",
    "Waste and recycling areas",
  ];

  const postConstructionTasks = [
    "Removal of construction-related dust and debris",
    "Cleaning accessible surfaces",
    "Floor cleaning",
    "Cleaning interior glass",
    "Removing visible residue from suitable surfaces",
    "Cleaning fixtures and accessible areas",
    "Cleaning common areas",
    "Final cleaning of the accessible space according to scope",
  ];

  const carouselData = [
    { src: "/wp-admin/uploads/stairs-cleaning.webp", alt: "Commercial stairs and shared-area cleaning" },
    { src: "/wp-admin/uploads/floor-cleaning-of-home.webp", alt: "Commercial hard-floor scrubbing and cleaning" },
    { src: "/wp-admin/uploads/floor cleaning of home (2).webp", alt: "Floor and high-traffic surface cleaning" },
    { src: "/wp-admin/uploads/floor-cleaning-of-home-3.webp", alt: "Professional commercial floor maintenance" },
  ];

  const businessTypes = [
    "Office buildings",
    "Corporate workplaces",
    "Small businesses",
    "Retail stores",
    "Professional offices",
    "Shared workspaces",
    "Managed facilities",
    "Staff break areas",
    "Customer spaces",
    "Renovated spaces",
  ];

  return (
    <article className="w-full space-y-12 text-slate-700 leading-relaxed overflow-hidden">
      
      {/* SECTION 1: Introduction */}
      <section className="space-y-5">
        <div className="space-y-2">
          <div className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B4E9B]">
            Calgary Workplace Specialists
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0B4E9B] sm:text-3xl md:text-3xl lg:text-4xl">
            Commercial Cleaning Services in Calgary
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-md border border-slate-100">
          <img
            src="/commercial-cleaning.webp"
            alt="Commercial workspace prepared for professional cleaning in Calgary"
            width={1200}
            height={650}
            className="h-[260px] w-full object-cover transition-transform duration-500 hover:scale-[1.02] sm:h-[320px]"
          />
        </div>

        <p className="text-base leading-relaxed text-slate-700">
          A clean commercial space creates a more comfortable environment for employees, customers, visitors and other people using your facility. <strong className="font-semibold text-slate-900">Camz Cleaning</strong> provides professional commercial cleaning services in Calgary and selected surrounding areas for businesses that need dependable cleaning based on their property, schedule and day-to-day requirements.
        </p>

        <div className="rounded-xl border-l-4 border-[#0B4E9B] bg-blue-50/70 p-4 sm:p-5 text-slate-800 text-sm leading-relaxed">
          <p className="font-medium">
            Our commercial cleaning services can cover offices, retail spaces, shared facilities, workplaces and other commercial properties. Cleaning can be arranged around your operating hours and facility requirements, with the service scope agreed according to property type and condition.
          </p>
        </div>

        <p className="text-sm text-slate-700">
          Whether you need regular office cleaning, ongoing janitorial support, detailed cleaning for a shared facility or cleaning after construction or renovations, Camz Cleaning can provide a cleaning plan based on your commercial space.
        </p>

        <div className="pt-1">
          <Link
            href="/contact-us/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B4E9B] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#083b77] hover:shadow-md focus:ring-4 focus:ring-blue-100"
          >
            <span>Request a Quote in Calgary</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* SECTION 2: Commercial Cleaning Services We Offer */}
      <section className="space-y-6">
        <div className="space-y-1.5 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            Commercial Cleaning Services We Offer
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Different businesses have different cleaning requirements tailored around facility layout and traffic.
          </p>
        </div>

        {/* 1. Office and Workplace Cleaning */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-300 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#0B4E9B] font-extrabold text-sm">
              01
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Office and Workplace Cleaning</h3>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            A clean workplace helps maintain an organized and welcoming environment for employees, clients and visitors.
          </p>
          <div className="mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Office cleaning may include:
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {officeCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <svg className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            The exact cleaning checklist can be adjusted according to the size, layout and requirements of the workplace.
          </p>
        </div>

        {/* 2. Retail and Commercial Space Cleaning */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-300 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-[#0B4E9B] font-extrabold text-sm">
              02
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Retail and Commercial Space Cleaning</h3>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Retail stores and customer-facing businesses need clean floors, entrances, displays and shared areas throughout their operating cycle.
          </p>
          <div className="mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Depending on the agreed scope, commercial cleaning may include:
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {retailCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-indigo-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            Cleaning schedules can be arranged according to the needs and operating requirements of the business.
          </p>
        </div>

        {/* 3. Commercial Facility Cleaning */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-300 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-extrabold text-sm">
              03
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Commercial Facility Cleaning</h3>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Shared and managed facilities can require regular cleaning across several areas of the property.
          </p>
          <div className="mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Our commercial cleaning service can include cleaning for:
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {facilityCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-teal-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            The service scope can be established around the property&apos;s layout, traffic levels and cleaning priorities.
          </p>
        </div>

        {/* 4. Post-Construction and Renovation Cleaning */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-blue-300 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-extrabold text-sm">
              04
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Post-Construction and Renovation Cleaning</h3>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Construction and renovation work can leave behind dust, debris and surface residue that requires additional cleaning before a commercial space is ready for regular use.
          </p>
          <div className="mt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Post-construction or renovation cleaning may include:
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {postConstructionTasks.map((task) => (
                <li key={task} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 rounded-lg bg-blue-50/70 p-3 text-xs font-semibold text-[#0B4E9B]">
            Post-construction cleaning requirements can vary significantly depending on the project size, materials used and condition of the property.
          </p>
        </div>
      </section>

      {/* SECTION 3: Visual Showcase Carousel */}
      <section aria-label="Commercial Operations" className="space-y-3">
        <h3 className="text-base font-bold text-slate-800">Commercial Operations in Action</h3>
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

      {/* SECTION 4: What Is Included in Commercial Cleaning? (Sidebar-friendly 2-col) */}
      <section className="space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            What Is Included in Commercial Cleaning?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            The cleaning tasks included in a commercial appointment depend on the selected service and the requirements agreed for the property.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Workstations & Office Areas */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0B4E9B]"></span>
                Workstations &amp; Office Areas
              </h3>
              <p className="text-xs text-slate-600">
                We clean accessible work areas and office surfaces to maintain a tidy workplace.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {["Desks and accessible surfaces", "Meeting tables", "Office furniture", "Reception areas", "Meeting rooms", "Shared workspaces", "Accessible fixtures"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-500 italic">
              Personal documents and sensitive materials should be secured before service.
            </p>
          </div>

          {/* Common Areas and Break Rooms */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0B4E9B]"></span>
                Common Areas &amp; Break Rooms
              </h3>
              <p className="text-xs text-slate-600">
                Shared spaces receive regular daily use and require consistent sanitation.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {["Break rooms", "Staff kitchens", "Common areas", "Tables and counters", "Sinks & faucet areas", "Accessible appliance exteriors", "Floors & waste bins"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-500 italic">
              Cleaning frequency can be adjusted according to facility use levels.
            </p>
          </div>

          {/* Washroom Cleaning */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0B4E9B]"></span>
                Washroom Cleaning
              </h3>
              <p className="text-xs text-slate-600">
                Hygienic, fresh washrooms are vital for a professional business standard.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {["Toilets & urinals", "Sinks & vanities", "Counters & mirrors", "Faucets and fixtures", "Accessible surfaces", "Floors mopping", "Waste removal"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-500 italic">
              Restocking consumable supplies can be included where requested.
            </p>
          </div>

          {/* Floors and High-Traffic Areas */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0B4E9B]"></span>
                Floors &amp; High-Traffic Areas
              </h3>
              <p className="text-xs text-slate-600">
                Dedicated care for high-wear entrances, hallways, and aisles.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {["Carpet vacuuming", "Rug vacuuming", "Hard-floor mopping", "Cleaning floor edges", "Debris removal", "Entrance mat care"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-2 text-[11px] text-slate-500 italic">
              Methods are adapted to specific tile, hardwood, vinyl or commercial carpet.
            </p>
          </div>

          {/* Waste and Recycling Removal (Full Width) */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:col-span-2">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#0B4E9B]"></span>
                Waste and Recycling Removal
              </h3>
              <p className="text-xs text-slate-600">
                Regular disposal keeps your commercial facilities tidy, sanitary and organized.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                {["Emptying designated waste bins", "Removing recycling from serviced areas", "Replacing liners where required", "Wiping surrounding waste areas"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-[#0B4E9B] font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Commercial Cleaning Schedules & Off-Hours Support */}
      <section className="space-y-6 rounded-3xl bg-slate-50 p-5 sm:p-7 border border-slate-200/80">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Commercial Cleaning Schedules
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Flexible service frequencies planned around your business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm border-t-4 border-blue-600">
            <h3 className="text-sm font-bold text-slate-900">Regular Cleaning</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Ongoing maintenance for businesses needing consistent upkeep throughout the week.
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border-t-4 border-indigo-600">
            <h3 className="text-sm font-bold text-slate-900">Weekly Cleaning</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Scheduled cleaning for workplaces that do not require daily janitorial service.
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border-t-4 border-teal-600">
            <h3 className="text-sm font-bold text-slate-900">Custom Schedule</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Tailored schedules based on specific shifts, peak traffic or facility requirements.
            </p>
          </div>
        </div>

        {/* Cleaning Around Your Business Hours (Flex-wrap pills) */}
        <div className="rounded-2xl border border-blue-100 bg-white p-5 space-y-3">
          <h3 className="text-base font-bold text-slate-900">Cleaning Around Your Business Hours</h3>
          <p className="text-xs text-slate-600">
            Where scheduling allows, cleaning is planned to minimize disruption to staff and visitors:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {["Before opening", "After closing", "During lower-traffic periods", "On selected weekdays", "On a recurring schedule"].map((slot) => (
              <span key={slot} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0B4E9B] border border-blue-100">
                {slot}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: Commercial Cleaning for Different Types of Businesses */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Types of Commercial Properties We Clean
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            We adapt to diverse business operations and layouts across Calgary:
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          {businessTypes.map((type) => (
            <div
              key={type}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3 text-center text-[11px] font-bold text-slate-800 shadow-sm transition-colors hover:border-blue-400 hover:text-[#0B4E9B]"
            >
              {type}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 7: Choosing the Right Commercial Cleaning Service */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Choosing the Right Service Plan
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Match the scope of work with your facility size and routine:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Regular Office</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              {["Workplace needs ongoing care", "Daily shared workstation use", "Regular washroom sanitizing", "Consistent weekly schedule"].map((pt) => (
                <li key={pt} className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Custom Facility</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              {["Multiple distinct areas", "Specific operating hours", "Higher traffic frequencies", "Specialized task lists"].map((pt) => (
                <li key={pt} className="flex items-start gap-1.5">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Post-Construction</h3>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
              {["Recent remodel or build", "Fine dust on surfaces", "Floors needing preparation", "Final cleaning pre-opening"].map((pt) => (
                <li key={pt} className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 8: Pricing Factors */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-[#0B4E9B]">
          Commercial Cleaning Pricing Factors
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Commercial cleaning pricing varies according to property requirements. Your customized quote takes into account:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {[
            "Property square footage & layout",
            "Type of commercial facility",
            "Number of work areas & washrooms",
            "Service frequency (daily/weekly)",
            "Floor and surface types",
            "Traffic levels & operating hours",
            "Post-construction requirements",
            "Specialized equipment requests",
          ].map((factor) => (
            <div key={factor} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-xs font-semibold text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 9: Why Businesses Choose Camz Cleaning */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
          Why Businesses Choose Camz Cleaning
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: "Property-Based Cleaning", desc: "Planned around the exact size, condition, and nature of your facility." },
            { title: "Flexible Scheduling", desc: "Arranged around opening/closing hours to prevent operational disruption." },
            { title: "Clear Service Scope", desc: "Detailed checklists established before service so expectations are aligned." },
            { title: "Recurring Options", desc: "Predictable, ongoing maintenance programs for consistent standards." },
            { title: "Calgary Service Area", desc: "Dedicated local coverage across Calgary, Airdrie, and Chestermere." },
            { title: "Quality Control", desc: "Experienced cleaners focused on hygiene protocols and high-touch points." },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs sm:text-sm font-bold text-[#0B4E9B]">{item.title}</h3>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: Service Areas Strip */}
      <section className="rounded-2xl bg-slate-900 p-5 sm:p-6 text-white space-y-3">
        <h2 className="text-lg font-bold text-white">
          Commercial Cleaning Service Areas
        </h2>
        <p className="text-xs text-slate-300">
          We service commercial properties in <strong>Calgary (Downtown, SE, NE, NW, SW), Airdrie, and Chestermere</strong>.
        </p>
      </section>

      {/* SECTION 11: Call to Action Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-[#0B4E9B] to-[#125eb5] p-6 text-center text-white shadow-md space-y-4">
        <h2 className="text-xl sm:text-2xl font-extrabold">
          Request a Commercial Cleaning Quote
        </h2>
        <p className="mx-auto max-w-xl text-xs sm:text-sm text-blue-100">
          Tell us about your business, property type, and cleaning frequency. Let us build a plan around your schedule.
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
            Book Online
          </Link>
        </div>
      </section>

      {/* Continuous Animation Style */}
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

export default CommercialCleaningContent;
