"use client";

import React from "react";
import Link from "next/link";

const AirbnbCleaningContent = () => {
  const servicesWeOffer = [
    "Cleaning after guest check-out",
    "Preparation between short-term rental stays",
    "Kitchen cleaning and sanitizing",
    "Bathroom cleaning and deep disinfection",
    "Bedroom cleaning and bed preparation",
    "Living-area cleaning and general tidy",
    "Vacuuming and floor mopping",
    "Removal of guest garbage and food waste",
    "Surface dusting and high-touch wiping",
    "Towel and linen replacement where included",
    "General property reset to host standards",
    "Reporting visible maintenance or damage concerns",
  ];

  const bedroomTasks = [
    "Removing used bed linens",
    "Making beds with clean linens supplied by the host",
    "Dusting accessible surfaces & nightstands",
    "Cleaning bedside areas and lamp fixtures",
    "Vacuuming carpets and rugs thoroughly",
    "Cleaning suitable hard-floor surfaces",
    "Checking general condition of the room",
  ];

  const bathroomTasks = [
    "Disinfecting and cleaning toilets",
    "Cleaning sinks, countertops and vanities",
    "Scrubbing tubs and glass shower enclosures",
    "Polishing faucets and chrome fixtures",
    "Cleaning mirrors streak-free",
    "Wiping accessible bathroom surfaces",
    "Mopping floors and edges",
    "Emptying waste baskets",
    "Neatly replacing towels where provided",
  ];

  const kitchenTasks = [
    "Cleaning and wiping countertops",
    "Scrubbing and polishing sinks",
    "Wiping the stovetop and backsplashes",
    "Cleaning appliance exteriors (fridge, oven, microwave)",
    "Cleaning accessible cabinet surfaces",
    "Washing or organizing guest dishes per scope",
    "Cleaning dining tables and chairs",
    "Removing leftover food and waste",
    "Vacuuming and mopping kitchen floors",
    "Checking the general condition of the kitchen",
  ];

  const livingTasks = [
    "Dusting accessible furniture and media units",
    "Wiping coffee tables and hard surfaces",
    "Vacuuming rugs, carpets and cushions",
    "Mopping hard floors",
    "Removing visible debris and trash",
    "Cleaning frequently touched switches and remotes",
    "General tidying and staging of accessible areas",
  ];

  const linenPrepTasks = [
    "Removing used bed linens",
    "Replacing beds with clean linens supplied for property",
    "Making beds with crisp presentation",
    "Replacing used towels",
    "Folding and arranging clean towels",
    "Preparing guest sleeping areas for next reservation",
  ];

  const guestReadyPrepTasks = [
    "Making beds neatly",
    "Arranging clean towels in bathrooms",
    "Returning accessible items to designated locations",
    "Cleaning and staging guest-use surfaces",
    "Emptying garbage bins & replacing liners",
    "Final visual check of kitchens and bathrooms",
    "Vacuuming and mopping all floors",
    "General tidying of guest areas",
    "Preparing property according to host instructions",
  ];

  const pricingFactors = [
    "Property square footage",
    "Number of bedrooms and bathrooms",
    "Overall property condition",
    "Turnover requirements & turnover window",
    "Linen and towel handling requirements",
    "Kitchen dishware & appliance scope",
    "Amount of post-guest cleaning required",
    "Additional custom cleaning tasks",
    "Booking frequency (regular vs occasional)",
    "Property location in Calgary / surrounding areas",
  ];

  const additionalReqs = [
    "Heavy post-party cleaning after a guest stay",
    "Excessive food, spills or unbagged waste",
    "Significant surface grease or bathroom build-up",
    "Deep interior appliance cleaning (oven/fridge interior)",
    "Extra offsite linen washing or laundry management",
    "Outdoor patio or balcony debris cleanup",
    "Cleaning requested outside standard turnover scope",
  ];

  const hostPrepList = [
    "Property access codes (smart lock, lockbox, keypad)",
    "Number of bedrooms and bathrooms to service",
    "Clean linen and towel arrangements & storage location",
    "Specific cleaning checklist or turnover priorities",
    "Location of host-provided supplies (if applicable)",
    "Instructions for guest amenities placement",
    "Special property rules or restricted private closets",
    "Direct contact info for fast service communication",
  ];

  const turnoverSteps = [
    {
      num: "1",
      title: "Provide Property Details",
      desc: "Share your property location, unit size, number of bedrooms and bathrooms, and standard turnover timeline.",
    },
    {
      num: "2",
      title: "Share Cleaning Requirements",
      desc: "Specify linen details, guest staging preferences, amenity placement, and custom turnover checklist tasks.",
    },
    {
      num: "3",
      title: "Cleaning After Guest Departure",
      desc: "Our team cleans the property thoroughly according to the confirmed turnover scope and condition of the space.",
    },
    {
      num: "4",
      title: "Reset Guest Areas",
      desc: "Bedrooms, bathrooms, kitchen, and living areas are staged, restocked, and reset to host standards.",
    },
    {
      num: "5",
      title: "Final Verification Check",
      desc: "The property undergoes a final visual inspection against the agreed checklist before completion.",
    },
  ];

  const carouselData = [
    {
      src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      alt: "Clean Airbnb modern living room in Calgary",
    },
    {
      src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
      alt: "Immaculate Airbnb bathroom sanitized and prepared",
    },
    {
      src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      alt: "Freshly made Airbnb bed with clean linens",
    },
    {
      src: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
      alt: "Spotless vacation rental kitchen reset",
    },
  ];

  return (
    <article className="w-full space-y-12 text-slate-700 leading-relaxed overflow-hidden">
      
      {/* SECTION 1: Introduction */}
      <section className="space-y-5">
        <div className="space-y-2">
          <div className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B4E9B]">
            5-Star Guest Turnovers
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0B4E9B] sm:text-3xl md:text-3xl lg:text-4xl">
            Airbnb &amp; Short-Term Rental Cleaning in Calgary
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-2xl shadow-md border border-slate-100">
          <img
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
            alt="Airbnb and short-term rental cleaning service in Calgary"
            width={1200}
            height={650}
            className="h-[260px] w-full object-cover transition-transform duration-500 hover:scale-[1.02] sm:h-[320px]"
          />
        </div>

        <p className="text-base leading-relaxed text-slate-700">
          Managing a short-term rental means preparing the property for every new guest, often within a limited window between check-out and the next check-in. <strong className="font-semibold text-slate-900">Camz Cleaning</strong> provides Airbnb and short-term rental cleaning services in Calgary to help hosts and rental property managers keep their properties clean, organized and ready for the next stay.
        </p>

        <div className="rounded-xl border-l-4 border-[#0B4E9B] bg-blue-50/70 p-4 sm:p-5 text-slate-800 text-sm leading-relaxed">
          <p className="font-medium">
            Our vacation rental cleaning service focuses on the areas guests notice most, including kitchens, bathrooms, bedrooms, living spaces, floors and frequently used surfaces. The cleaning process can also include bed preparation, towel replacement, removal of guest waste and general preparation according to the agreed service scope.
          </p>
        </div>

        <p className="text-sm text-slate-700">
          Whether you manage one Airbnb property or several short-term rentals, the cleaning requirements can be planned around your property&apos;s turnover schedule and the condition of the space.
        </p>

        <div className="pt-1">
          <Link
            href="/contact-us/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B4E9B] px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#083b77] hover:shadow-md focus:ring-4 focus:ring-blue-100"
          >
            <span>Request Airbnb Cleaning in Calgary</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* SECTION 2: Services We Offer */}
      <section className="space-y-6">
        <div className="space-y-1.5 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            Airbnb Cleaning Services We Offer
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Short-term rental cleaning is designed to clean and reset the space between stays for incoming guests.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Our Airbnb cleaning services may include:</h3>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {servicesWeOffer.map((task) => (
              <li key={task} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <svg className="h-4 w-4 flex-shrink-0 text-emerald-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{task}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-100">
            The exact cleaning checklist depends on the property, turnover requirements and services requested by the host or manager.
          </p>
        </div>
      </section>

      {/* SECTION 3: Visual Showcase Carousel */}
      <section aria-label="Airbnb Cleaning Showcase" className="space-y-3">
        <h3 className="text-base font-bold text-slate-800">Turnover Operations in Action</h3>
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

      {/* SECTION 4: Airbnb Turnover Cleaning (Room by Room) */}
      <section className="space-y-6">
        <div className="space-y-1.5 border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl md:text-3xl">
            Airbnb Turnover Cleaning Scope
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A successful turnover requires preparing every room so it is pristine and welcoming for the next reservation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Guest Bedrooms */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0B4E9B]" />
              Guest Bedrooms
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {bedroomTasks.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
              Creates a clean and organized environment for arriving guests.
            </p>
          </div>

          {/* Bathrooms */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0B4E9B]" />
              Bathrooms
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {bathroomTasks.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
              High-priority sanitization for 5-star cleanliness ratings.
            </p>
          </div>

          {/* Kitchen */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0B4E9B]" />
              Kitchen &amp; Dining
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {kitchenTasks.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
              Interior appliance cleaning can be requested when needed.
            </p>
          </div>

          {/* Living and Common Areas */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0B4E9B]" />
              Living and Common Areas
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {livingTasks.map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
              Personal belongings remain in designated owner storage.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 5: Linen, Towels & Specialized Resets */}
      <section className="space-y-5 rounded-3xl bg-slate-50 p-5 sm:p-7 border border-slate-200/80">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Linen, Towel &amp; Guest-Ready Setup
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Clean bedding, fresh towels and staged presentation for upcoming reservations.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Linen and Towel Prep */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Linen &amp; Towel Preparation</h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {linenPrepTasks.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-[#0B4E9B] font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
              Hosts should provide clean linens/towels. If off-site laundry or storage handling is required, discuss before service.
            </p>
          </div>

          {/* Guest-Ready Property Preparation */}
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Guest-Ready Preparation</h3>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {guestReadyPrepTasks.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-100">
              Hosts can provide specific setup instructions for amenities and welcome arrangements.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: Airbnb Cleaning Checklist (2-Column Balanced) */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Airbnb Cleaning Checklist
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A property-specific checklist maintains consistency from one turnover to another.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200 space-y-2">
            <strong className="block font-bold text-slate-900 text-sm text-[#0B4E9B]">Bedrooms</strong>
            <ul className="space-y-1 text-slate-600">
              {["Used linen removal", "Fresh linen placement", "Bed making", "Surface dusting", "Floor cleaning", "Room reset"].map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200 space-y-2">
            <strong className="block font-bold text-slate-900 text-sm text-[#0B4E9B]">Bathrooms</strong>
            <ul className="space-y-1 text-slate-600">
              {["Toilet cleaning", "Sink & vanity", "Shower & tub", "Mirror cleaning", "Floor cleaning", "Towel placement"].map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200 space-y-2">
            <strong className="block font-bold text-slate-900 text-sm text-[#0B4E9B]">Kitchen</strong>
            <ul className="space-y-1 text-slate-600">
              {["Counter cleaning", "Sink scrub", "Stovetop wipe", "Appliance wipe", "Dish tasks per scope", "Food/waste removal"].map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200 space-y-2">
            <strong className="block font-bold text-slate-900 text-sm text-[#0B4E9B]">Living Areas</strong>
            <ul className="space-y-1 text-slate-600">
              {["Surface dusting", "Furniture wipe", "Vacuuming", "Floor mopping", "General tidying", "Guest reset"].map((i) => (
                <li key={i}>• {i}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900 p-4 text-white text-xs">
          <strong>Final Property Check:</strong> Before completing turnover, the property is checked against the agreed cleaning checklist to confirm every detail is guest-ready.
        </div>
      </section>

      {/* SECTION 7: Cleaning for Hosts and Property Managers */}
      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Cleaning for Hosts &amp; Property Managers
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Tailored support for individual hosts, rental management companies and multi-unit operators.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Individual Hosts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Reduces the personal workload between bookings and keeps your property consistently prepared for 5-star reviews.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Property Managers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Provides reliable cleaning across multiple portfolios organized by address, linen rules, and custom checklists.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Vacation Operators</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Structured turnovers coordinated around guest calendars, seasonal peak occupancy, and custom check-in times.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: One-Time and Recurring Schedules */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            Flexible Rental Scheduling
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Turnover cleaning scheduled whenever one guest checks out and the next arrives:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Turnover Cleaning</h3>
            <p className="mt-1 text-xs text-slate-600">
              Scheduled right after check-out and completed before check-in.
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Recurring Rental</h3>
            <p className="mt-1 text-xs text-slate-600">
              Ongoing turnover arrangement for properties with regular guest bookings.
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">One-Time Listing Refresh</h3>
            <p className="mt-1 text-xs text-slate-600">
              Deep preparation before listing on Airbnb or refreshing after long stays.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 9: How Airbnb Turnover Cleaning Works (Responsive Horizontal Cards) */}
      <section className="rounded-3xl bg-slate-50 p-5 sm:p-7 border border-slate-200/80 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
            How Airbnb Turnover Cleaning Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A dependable 5-step process engineered for smooth, hassle-free turnovers:
          </p>
        </div>

        <div className="space-y-2.5">
          {turnoverSteps.map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-3.5 rounded-xl bg-white p-4 shadow-sm border border-slate-200 transition-colors hover:border-blue-300"
            >
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#0B4E9B] text-white font-extrabold text-xs">
                {step.num}
              </span>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 break-words">{step.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: What Hosts Should Provide */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-3">
        <h2 className="text-base sm:text-lg font-extrabold text-[#0B4E9B]">
          What Hosts Should Provide Before Cleaning
        </h2>
        <p className="text-xs text-slate-600">
          Clear property instructions make turnover cleaning smooth and efficient:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
          {hostPrepList.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-100">
          If using a smart lock or lockbox, ensure access details are confirmed prior to the turnover window.
        </p>
      </section>

      {/* SECTION 11: Pricing & Additional Requirements */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pricing */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B4E9B]">
            Airbnb Cleaning Pricing Factors
          </h2>
          <p className="text-xs text-slate-600">Pricing is calculated based on:</p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {pricingFactors.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B]" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Additional Requirements */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-base sm:text-lg font-extrabold text-[#0B4E9B]">
            Additional Cleaning Requirements
          </h2>
          <p className="text-xs text-slate-600">Items outside standard turnover scope:</p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {additionalReqs.map((req) => (
              <li key={req} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 12: Why Choose Camz Cleaning */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-[#0B4E9B] sm:text-2xl">
          Why Choose Camz Cleaning for Airbnb Cleaning?
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              title: "Property-Specific Cleaning",
              desc: "Every rental has its own layout, rules and setup organized around the property.",
            },
            {
              title: "Turnover-Focused Service",
              desc: "Engineered around preparing the space between checkout and incoming checkin.",
            },
            {
              title: "Clear Cleaning Checklist",
              desc: "Hosts communicate exact tasks for transparent, consistent standards.",
            },
            {
              title: "Flexible Service Options",
              desc: "One-time turnover or recurring calendar arrangements based on your bookings.",
            },
            {
              title: "Calgary & Area Service",
              desc: "Dedicated coverage across Calgary, Airdrie, and Chestermere.",
            },
            {
              title: "Reliable Quality Control",
              desc: "Experienced cleaners focused on the high-touch details guests review.",
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
          Airbnb Cleaning Service Areas
        </h2>
        <p className="text-xs text-slate-300">
          We provide turnover cleaning across <strong>Calgary (Downtown, Southeast, Northeast, Northwest, Southwest), Airdrie, and Chestermere</strong>.
        </p>
      </section>

      {/* SECTION 15: Final Action Call To Action */}
      <section className="rounded-2xl bg-gradient-to-r from-[#0B4E9B] to-[#125eb5] p-6 text-center text-white shadow-md space-y-4">
        <h2 className="text-xl sm:text-2xl font-extrabold">
          Get Your Airbnb Ready for the Next Guest
        </h2>
        <p className="mx-auto max-w-xl text-xs sm:text-sm text-blue-100 leading-relaxed">
          A short-term rental needs to be clean, organized and prepared every time a new guest arrives. Camz Cleaning provides turnover scopes designed around your property and booking schedule.
        </p>
        <p className="text-xs font-semibold text-white">
          Whether you manage one rental or multiple properties, tell us about your requirements.
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
            Book Airbnb Cleaning
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

export default AirbnbCleaningContent;
