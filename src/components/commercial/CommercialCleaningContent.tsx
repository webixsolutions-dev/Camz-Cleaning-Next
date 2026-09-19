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
    "Final cleaning of the accessible space according to the agreed scope",
  ];

  const carouselData = [
    { src: "/wp-admin/uploads/stairs-cleaning.webp", alt: "Commercial stairs and shared-area cleaning" },
    { src: "/wp-admin/uploads/floor-cleaning-of-home.webp", alt: "Commercial hard-floor scrubbing and cleaning" },
    { src: "/wp-admin/uploads/floor cleaning of home-2.webp", alt: "Floor and high-traffic surface cleaning" },
    { src: "/wp-admin/uploads/floor-cleaning-of-home-3.webp", alt: "Professional commercial floor maintenance" },
  ];

  const businessTypes = [
    "Office buildings",
    "Corporate workplaces",
    "Small businesses",
    "Retail stores",
    "Professional offices",
    "Shared workspaces",
    "Managed commercial facilities",
    "Staff areas",
    "Customer-facing businesses",
    "Renovated commercial spaces",
  ];

  return (
    <article className="space-y-16 text-slate-700 leading-relaxed">
      {/* SECTION 1: Introduction */}
      <section className="space-y-6">
        <div className="space-y-3">
          <div className="inline-block rounded-md bg-blue-50 px-3 py-1 text-sm font-semibold tracking-wide text-[#0B4E9B]">
            Professional Calgary Workplace Care
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0B4E9B] md:text-4xl">
            Commercial Cleaning Services in Calgary
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-900/5">
          <img
            src="/commercial-cleaning.webp"
            alt="Commercial workspace prepared for professional cleaning in Calgary"
            width={1200}
            height={700}
            className="h-[320px] w-full object-cover transition-transform duration-500 hover:scale-[1.02] md:h-[420px]"
          />
        </div>

        <p className="text-lg leading-relaxed text-slate-700">
          A clean commercial space creates a more comfortable environment for employees, customers, visitors and other people using your facility. <strong className="font-semibold text-slate-900">Camz Cleaning</strong> provides professional commercial cleaning services in Calgary and selected surrounding areas for businesses that need dependable cleaning based on their property, schedule and day-to-day requirements.
        </p>

        <div className="rounded-xl border-l-4 border-[#0B4E9B] bg-blue-50/60 p-5 text-slate-800">
          <p className="font-medium">
            Our commercial cleaning services can cover offices, retail spaces, shared facilities, workplaces and other commercial properties. Cleaning can be arranged around your operating hours and the requirements of your facility, with the service scope agreed according to the type of property and level of cleaning required.
          </p>
        </div>

        <p className="text-slate-700">
          Whether you need regular office cleaning, ongoing janitorial support, detailed cleaning for a shared facility or cleaning after construction or renovations, Camz Cleaning can provide a cleaning plan based on your commercial space.
        </p>

        <div className="pt-2">
          <Link
            href="/contact/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B4E9B] px-6 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-[#083b77] hover:shadow-lg focus:ring-4 focus:ring-blue-200"
          >
            <span>Request a commercial cleaning service in Calgary</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* SECTION 2: Commercial Cleaning Services We Offer */}
      <section className="space-y-8">
        <div className="space-y-2 border-b border-slate-200 pb-4">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Commercial Cleaning Services We Offer
          </h2>
          <p className="text-slate-600">
            Different businesses have different cleaning requirements. An office may need regular workstation and meeting-room cleaning, while a retail or shared facility may require greater attention to floors, entrances, washrooms and high-traffic areas.
          </p>
        </div>

        {/* 1. Office and Workplace Cleaning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-[#0B4E9B] font-bold">
              01
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Office and Workplace Cleaning</h3>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            A clean workplace helps maintain an organized and welcoming environment for employees, clients and visitors.
          </p>
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Office cleaning may include:
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {officeCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm font-medium text-slate-600">
            The exact cleaning checklist can be adjusted according to the size, layout and requirements of the workplace.
          </p>
        </div>

        {/* 2. Retail and Commercial Space Cleaning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-[#0B4E9B] font-bold">
              02
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Retail and Commercial Space Cleaning</h3>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Retail stores and other customer-facing businesses need clean floors, entrances, displays and shared areas throughout their operating cycle.
          </p>
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Depending on the agreed scope, commercial cleaning may include:
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {retailCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-indigo-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm font-medium text-slate-600">
            Cleaning schedules can be arranged according to the needs and operating requirements of the business.
          </p>
        </div>

        {/* 3. Commercial Facility Cleaning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-bold">
              03
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Commercial Facility Cleaning</h3>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Shared and managed facilities can require regular cleaning across several areas of the property.
          </p>
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Our commercial cleaning service can include cleaning for:
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {facilityCleaningTasks.map((task) => (
                <li key={task} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-teal-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 rounded-lg bg-slate-50 p-4 text-sm font-medium text-slate-600">
            The service scope can be established around the property's layout, traffic levels and cleaning priorities.
          </p>
        </div>

        {/* 4. Post-Construction and Renovation Cleaning */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-bold">
              04
            </span>
            <h3 className="text-2xl font-bold text-slate-900">Post-Construction and Renovation Cleaning</h3>
          </div>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Construction and renovation work can leave behind dust, debris and surface residue that requires additional cleaning before a commercial space is ready for regular use.
          </p>
          <div className="mt-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Post-construction or renovation cleaning may include:
            </h4>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {postConstructionTasks.map((task) => (
                <li key={task} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <svg className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 rounded-lg bg-blue-50/70 p-4 text-sm font-semibold text-[#0B4E9B]">
            Post-construction cleaning requirements can vary significantly depending on the size of the project, materials used and condition of the property.
          </p>
        </div>
      </section>

      {/* SECTION 3: Visual Showcase Carousel */}
      <section aria-label="Commercial Cleaning Showcase" className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Commercial Operations in Action</h3>
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

      {/* SECTION 4: What Is Included in Commercial Cleaning? */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            What Is Included in Commercial Cleaning?
          </h2>
          <p className="text-slate-600">
            The cleaning tasks included in a commercial appointment depend on the selected service and the requirements agreed for the property.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Workstations & Office Areas */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5 text-[#0B4E9B]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Workstations & Office Areas</h3>
              </div>
              <p className="text-xs text-slate-600">
                We clean accessible work areas and office surfaces to help maintain a tidy and comfortable workplace.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {["Desks and accessible surfaces", "Meeting tables", "Office furniture", "Reception areas", "Meeting rooms", "Shared workspaces", "Accessible fixtures and surfaces"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 italic">
              Personal documents, equipment and sensitive materials should be secured or moved when necessary before cleaning.
            </p>
          </div>

          {/* Common Areas and Break Rooms */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5 text-[#0B4E9B]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Common Areas & Break Rooms</h3>
              </div>
              <p className="text-xs text-slate-600">
                Shared spaces receive regular use throughout the day and can require frequent cleaning.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {["Break rooms", "Staff kitchens", "Common areas", "Tables and counters", "Sinks", "Accessible appliances and exteriors", "Floors", "Waste bins", "High-touch surfaces"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 italic">
              The cleaning frequency can be adjusted according to the level of use and the property's requirements.
            </p>
          </div>

          {/* Washroom Cleaning */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5 text-[#0B4E9B]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Washroom Cleaning</h3>
              </div>
              <p className="text-xs text-slate-600">
                Clean and well-maintained washrooms maintain a professional commercial environment.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {["Toilets", "Sinks", "Counters and vanities", "Mirrors", "Faucets and fixtures", "Accessible surfaces", "Floors", "Waste removal", "High-touch areas"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 italic">
              Restocking of consumable supplies can be discussed as part of requirements where applicable.
            </p>
          </div>

          {/* Floors and High-Traffic Areas */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5 text-[#0B4E9B]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Floors & High-Traffic Areas</h3>
              </div>
              <p className="text-xs text-slate-600">
                Commercial floors experience high traffic at entrances, hallways, and reception.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {["Carpet vacuuming", "Rug vacuuming", "Hard-floor mopping", "Cleaning accessible floor edges", "Removal of visible dirt and debris", "Entrance-area cleaning", "Additional floor care per agreed scope"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 italic">
              The appropriate cleaning method depends on the floor material and condition.
            </p>
          </div>

          {/* Waste and Recycling Removal */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2.5 text-[#0B4E9B]">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Waste and Recycling Removal</h3>
              </div>
              <p className="text-xs text-slate-600">
                Regular removal of garbage and recycling helps keep commercial spaces organized and ready for employees and clients.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                {["Emptying designated waste bins", "Removing recycling from serviced areas", "Replacing liners where required", "Cleaning accessible areas around waste containers"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] text-slate-500 italic">
              Waste handling requirements should be discussed when establishing the commercial cleaning scope.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Commercial Cleaning Schedules & Off-Hours Support */}
      <section className="space-y-8 rounded-3xl bg-slate-50 p-6 md:p-10 border border-slate-200/80">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Commercial Cleaning Schedules
          </h2>
          <p className="text-slate-600">
            Businesses operate on different schedules, so commercial cleaning does not have to follow a single routine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm border-t-4 border-blue-600">
            <h3 className="text-lg font-bold text-slate-900">Regular Cleaning</h3>
            <p className="mt-3 text-sm text-slate-600">
              Ongoing cleaning for businesses that require consistent maintenance throughout the week or according to an agreed schedule.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border-t-4 border-indigo-600">
            <h3 className="text-lg font-bold text-slate-900">Weekly Cleaning</h3>
            <p className="mt-3 text-sm text-slate-600">
              A suitable option for businesses that need scheduled cleaning but do not require service every single day.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border-t-4 border-teal-600">
            <h3 className="text-lg font-bold text-slate-900">Custom Schedule</h3>
            <p className="mt-3 text-sm text-slate-600">
              Tailored schedules based on operating hours, occupancy peaks, high foot traffic or facility-specific cleaning needs.
            </p>
          </div>
        </div>

        {/* Cleaning Around Your Business Hours */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6 md:p-8 space-y-4">
          <h3 className="text-xl font-bold text-slate-900">Cleaning Around Your Business Hours</h3>
          <p className="text-slate-600">
            Commercial cleaning needs to fit into the way your business operates. Where scheduling allows, cleaning can be planned around your operating hours to reduce disruption to employees, customers and visitors.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {["Before opening", "After closing", "During lower-traffic periods", "On selected weekdays", "On a recurring schedule"].map((slot) => (
              <div key={slot} className="rounded-lg bg-blue-50/60 p-3 text-center text-xs font-bold text-[#0B4E9B] border border-blue-100">
                {slot}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 italic">
            The available appointment times depend on the property, location, service requirements and current scheduling capacity.
          </p>
        </div>
      </section>

      {/* SECTION 6: Commercial Cleaning for Different Types of Businesses */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Commercial Cleaning for Different Types of Businesses
          </h2>
          <p className="text-slate-600">
            Camz Cleaning provides commercial cleaning for a variety of workplaces and business environments:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {businessTypes.map((type) => (
            <div
              key={type}
              className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-4 text-center text-xs font-bold text-slate-800 shadow-sm transition-all hover:border-blue-400 hover:text-[#0B4E9B]"
            >
              {type}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 italic">
          The cleaning requirements of each property are different, so the final service scope should be based on the actual facility and requested tasks.
        </p>
      </section>

      {/* SECTION 7: Choosing the Right Commercial Cleaning Service */}
      <section className="space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Choosing the Right Commercial Cleaning Service
          </h2>
          <p className="text-slate-600">
            The right cleaning scope depends on how your business uses its space, how frequently the property needs attention and which areas require regular service.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Regular Office Cleaning May Be Suitable When:</h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              {["Your workplace needs ongoing maintenance", "Employees use shared workspaces every day", "Reception and meeting areas require regular attention", "Washrooms and staff areas need scheduled cleaning", "You want a consistent cleaning routine"].map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">A Custom Commercial Plan May Be Suitable When:</h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              {["Your facility has multiple areas with different needs", "Your business operates on a specific schedule", "Certain areas require more frequent cleaning", "You manage a larger or shared facility", "You need specific tasks included in the checklist"].map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Post-Construction Cleaning May Be Suitable When:</h3>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              {["Renovation work has recently been completed", "Construction dust remains on accessible surfaces", "Floors require cleaning before occupancy", "A commercial area needs preparation before reopening", "The property needs a final clean post-construction"].map((pt) => (
                <li key={pt} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 8: Commercial Cleaning Pricing */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Commercial Cleaning Pricing
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Commercial cleaning pricing varies according to the property and the work required. Factors can include the size of the facility, number of areas, cleaning frequency, floor types, washroom requirements, traffic levels and the selected cleaning scope. For this reason, commercial cleaning is not priced the same way for every business.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Your commercial cleaning quote may take into account:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              "Property size",
              "Type of commercial facility",
              "Number of rooms or work areas",
              "Number of washrooms",
              "Cleaning frequency",
              "Required cleaning tasks",
              "Floor and surface types",
              "Traffic and occupancy",
              "Post-construction requirements",
              "Additional services requested",
            ].map((factor) => (
              <div key={factor} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2.5 text-xs font-semibold text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]"></span>
                <span>{factor}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 italic pt-2">
            Providing accurate information about your facility helps us understand the work involved and determine the appropriate cleaning scope.
          </p>
        </div>
      </section>

      {/* SECTION 9: Why Businesses Choose Camz Cleaning */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
            Why Businesses Choose Camz Cleaning
          </h2>
          <p className="text-slate-600">
            Commercial cleaning requires consistency, clear expectations and a service plan that works seamlessly with your business operations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Property-Based Cleaning",
              desc: "The cleaning scope is planned around the type, size and condition of the commercial property.",
            },
            {
              title: "Flexible Scheduling",
              desc: "Cleaning schedules can be discussed around your business hours and operational requirements, subject to availability.",
            },
            {
              title: "Clear Service Scope",
              desc: "The requested cleaning tasks can be established before service so the property and cleaning requirements are clearly understood.",
            },
            {
              title: "Recurring Cleaning Options",
              desc: "Businesses that need ongoing maintenance can request recurring commercial cleaning according to their operational needs.",
            },
            {
              title: "Calgary & Surrounding Area",
              desc: "Camz Cleaning provides commercial cleaning services in Calgary and selected surrounding communities within our current service area.",
            },
            {
              title: "Reliable Quality Control",
              desc: "Experienced cleaners focused on high-touch points, hygiene protocols, and consistent presentation for clients and team members.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-[#0B4E9B]">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: Commercial Cleaning Service Areas */}
      <section className="space-y-6 rounded-3xl bg-slate-900 p-6 md:p-10 text-white">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white md:text-3xl">
            Commercial Cleaning Service Areas
          </h2>
          <p className="text-slate-300">
            Camz Cleaning provides commercial cleaning services in <strong>Calgary and selected surrounding communities</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white/10 p-5 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg font-bold text-blue-300">Calgary</h3>
            <p className="mt-2 text-xs text-slate-300">Commercial cleaning services are available across Calgary, including:</p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-200">
              {["Downtown Calgary", "Southeast Calgary", "Northeast Calgary", "Northwest Calgary", "Southwest Calgary"].map((area) => (
                <li key={area} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-blue-400"></span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white/10 p-5 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg font-bold text-blue-300">Airdrie</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Commercial cleaning services are also available in Airdrie for businesses and commercial properties within our service area.
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-5 backdrop-blur-sm border border-white/10">
            <h3 className="text-lg font-bold text-blue-300">Chestermere</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Camz Cleaning also provides commercial cleaning services in Chestermere, subject to service availability and property requirements.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 italic">
          If you are located in one of these areas and are unsure whether your property is covered, contact Camz Cleaning before booking.
        </p>
      </section>

      {/* SECTION 11: Request a Commercial Cleaning Quote (Action Box) */}
      <section className="rounded-3xl bg-gradient-to-r from-[#0B4E9B] to-[#125eb5] p-8 text-center text-white shadow-xl md:p-12">
        <h2 className="text-2xl font-extrabold md:text-4xl">
          Request a Commercial Cleaning Quote
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100 md:text-lg">
          Whether you manage an office, retail space, shared facility or commercial property that needs cleaning after renovation, Camz Cleaning can help establish a cleaning scope around your property and schedule.
        </p>
        <p className="mt-4 font-semibold text-white">
          Tell us about your business, the type of property, the areas that require cleaning and how frequently you need service.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact/"
            className="rounded-xl bg-white px-8 py-4 text-base font-bold text-[#0B4E9B] shadow-md transition-all hover:bg-blue-50 hover:shadow-lg"
          >
            Request a Commercial Cleaning Quote
          </Link>
          <Link
            href="/booking/"
            className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
          >
            Book Commercial Cleaning
          </Link>
        </div>
      </section>

      {/* Regional Service Footnote Strip */}
      <div className="rounded-xl bg-slate-100 p-4 text-center text-xs font-semibold text-slate-600">
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

export default CommercialCleaningContent;
