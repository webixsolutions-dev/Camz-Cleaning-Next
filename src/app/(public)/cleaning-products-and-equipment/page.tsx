import React from "react";
import Link from "next/link";
import PageJsonLd from "@/components/seo/PageJsonLd";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Products & Equipment We Use | Camz Cleaning Calgary",
  description:
    "Learn about the professional cleaning products, microfiber towels, mops, vacuums, carpet extractors, and pet/eco-conscious options used by Camz Cleaning in Calgary.",
  path: "/cleaning-products-and-equipment/",
});

export default function ProductsAndEquipmentPage() {
  const commonProducts = [
    {
      title: "Microfiber Towels",
      description:
        "Professional towels for dusting, wiping and polishing. Separate or colour-coded cloths are used for kitchens, bathrooms, glass and general surfaces to avoid cross-contamination.",
      icon: "🧹",
      tag: "Colour-Coded Hygiene",
    },
    {
      title: "Glass Cleaner",
      description:
        "Used with appropriate microfiber glass cloths on compatible mirrors, interior glass and glass tables to reduce streaks, residue and fingerprints.",
      icon: "✨",
      tag: "Streak-Free",
    },
    {
      title: "Disinfectant Spray",
      description:
        "Lysol or a comparable commercial-grade disinfectant used on suitable high-touch surfaces according to label directions and required antimicrobial contact time.",
      icon: "🛡️",
      tag: "Sanitization",
    },
    {
      title: "Professional Degreaser",
      description:
        "Formulated for compatible kitchen surfaces to break down heavy grease and cooking buildup. Heavy or burned-on grease may require extra dwell time.",
      icon: "🍳",
      tag: "Kitchen Power",
    },
    {
      title: "Multi-Surface Cleaner",
      description:
        "Selected for compatible countertops, shelves, doors, handles, baseboards and other washable household surfaces.",
      icon: "🧼",
      tag: "Everyday Care",
    },
    {
      title: "Bathroom & Toilet Products",
      description:
        "Dedicated descaling and sanitizing products with separate tools used specifically for sinks, tubs, showers, tiles, vanities and toilets.",
      icon: "🚿",
      tag: "Dedicated Tools",
    },
    {
      title: "Floor Cleaner",
      description:
        "Selected according to the known flooring type (hardwood, vinyl, laminate, tile) and manufacturer care instructions where available.",
      icon: "🪵",
      tag: "Surface-Matched",
    },
    {
      title: "Detailing Tools",
      description:
        "Non-scratch sponges, grout brushes, duster extensions and detailing tools used carefully according to the specific task and surface delicate level.",
      icon: "🧽",
      tag: "Precision Care",
    },
  ];

  const carpetSteps = [
    "A professional carpet-extraction machine with high-power recovery.",
    "Professional carpet pre-spray to loosen deep soil and traffic buildup.",
    "Suitable targeted spot-treatment products for specific stain types.",
    "Professional extraction detergent or neutral pH rinse.",
    "Hot-water extraction to recover water, loosened soil and cleaning residue.",
  ];

  const requestChecklist = [
    "Eco-conscious or reduced-fragrance products",
    "Pet-conscious cleaning options",
    "Camz Cleaning semi-professional mop or vacuum",
    "Professional carpet steam cleaning",
    "Use of a customer-provided preferred product",
    "Special care for a delicate surface (natural stone, unsealed wood)",
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-800">
       <PageJsonLd path="/cleaning-products-and-equipment/" /> 

      {/* Hero Header */}
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/cleaned kitchen.webp"
        title="Cleaning Products & Equipment We Use"
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8 space-y-16">
        
        {/* SECTION 1: Intro & 3 Core Trust Pillars */}
        <section className="rounded-3xl border border-blue-100 bg-white p-6 md:p-10 shadow-sm space-y-6 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <span className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B4E9B]">
                Customer Information Guide
              </span>
              <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl md:text-4xl">
                Clear Information About Our Products &amp; Tools
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Safe, clearly labelled, and surface-matched cleaning for Calgary homes and businesses.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="rounded-lg bg-blue-50 px-3.5 py-2 text-[#0B4E9B] border border-blue-100">
                ✓ Professional Products
              </span>
              <span className="rounded-lg bg-blue-50 px-3.5 py-2 text-[#0B4E9B] border border-blue-100">
                ✓ Clearly Labelled
              </span>
              <span className="rounded-lg bg-blue-50 px-3.5 py-2 text-[#0B4E9B] border border-blue-100">
                ✓ Special Requests
              </span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-700 md:text-base">
            At <strong>Camz Cleaning</strong>, we use professional cleaning products, microfiber towels and equipment selected for the booked service, surface type and property condition. Products and tools may vary depending on availability and special requests confirmed before the appointment.
          </p>
        </section>

        {/* SECTION 2: Common Cleaning Products Grid */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
              Our Common Cleaning Products
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Explore the core solutions, disinfectants, and specialized tools our teams use on every appointment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {commonProducts.map((prod) => (
              <div
                key={prod.title}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{prod.icon}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {prod.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{prod.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-600">{prod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Bottles, Labelling & Safety Procedures */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Professional Bottles & Camz Labels */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-[#0B4E9B] md:text-2xl">
              Professional Bottles &amp; Camz Labels
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Some products are transferred into professional reusable spray bottles, including Zep bottles, for practical use by our cleaning team. Each bottle receives a Camz Cleaning label identifying the actual product inside, its intended use, relevant safety information and applicable preparation, inspection or expiry details.
            </p>

            <div className="rounded-2xl border-l-4 border-[#0B4E9B] bg-blue-50/70 p-4 text-xs text-slate-700">
              <strong className="font-bold text-[#0B4E9B] block mb-1">Important Clarification</strong>
              A Zep bottle does not necessarily mean the cleaning solution inside is manufactured by Zep. The Camz Cleaning label identifies the actual contents.
            </div>

            <p className="text-xs text-slate-600">
              Our team regularly checks reusable bottles for correct identification, readable labels, proper dilution, leaks, damage and applicable inspection or replacement dates. We do not intentionally use unidentified products or bottles with missing or unreadable labels.
            </p>
          </div>

          {/* Gloves & Safe Product Use */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-[#0B4E9B] md:text-2xl">
                Gloves &amp; Safe Product Use
              </h2>
              <p className="text-sm leading-relaxed text-slate-700">
                Our cleaners wear protective gloves when required by the product instructions or cleaning task, including bathroom cleaning, waste handling or situations involving possible skin contact.
              </p>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-600 space-y-2">
                <p>
                  ✓ Products are used strictly according to manufacturer labels, including dilution rates, required contact dwell times, proper room ventilation and surface suitability.
                </p>
                <p>
                  ✓ <strong>Strict Chemical Safety:</strong> We do not intentionally mix incompatible cleaning products (such as bleach and ammonia).
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-500 italic border-t border-slate-100 pt-3">
              Safety first for both our cleaners and your home environment.
            </div>
          </div>
        </section>

        {/* SECTION 4: Mop & Vacuum Cross-Contamination Policy */}
        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-6 md:p-10 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0B4E9B]">
              Hygiene &amp; Floor Protection
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">
              Mop &amp; Vacuum Policy
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 text-sm text-slate-700">
            <div className="space-y-3">
              <p>
                For residential cleaning, we generally prefer to use the customer&apos;s own mop and vacuum, provided they are safe, reasonably clean, accessible and working properly.
              </p>
              <p className="font-semibold text-slate-900">
                This helps match the equipment to your specific flooring and eliminates the risk of transferring dust, pet dander, hair and allergens between properties.
              </p>
              <p className="text-xs text-slate-600">
                Camz Cleaning does not normally use heavy commercial mopping equipment inside homes because certain commercial pads, machines or methods may be unsuitable for residential hardwood, laminate or specialty flooring.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-100 space-y-3">
              <h3 className="text-base font-bold text-[#0B4E9B]">
                Camz Equipment Available by Request
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Camz Cleaning has semi-professional mops and vacuum cleaners that are lighter than heavy commercial equipment and more suitable for residential cleaning.
              </p>
              <p className="text-xs font-semibold text-slate-800">
                Please request our mop or vacuum when booking so the equipment can be assigned to the team. Availability and any applicable charge will be confirmed before the appointment.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: Carpet Steam Cleaning */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm space-y-8">
          <div className="space-y-2">
            <div className="inline-block rounded-md bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">
              Specialized Extraction Service
            </div>
            <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-3xl">
              Professional Carpet Steam Cleaning
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Camz Cleaning offers professional carpet hot-water extraction, commonly called carpet steam cleaning, as a separately booked service.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Depending on the carpet and service selected, we may use:</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {carpetSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#0B4E9B] font-bold">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 italic pt-2">
                Only carpet-compatible products are used with the machine. We do not place dish soap, laundry detergent or unapproved household products inside the extractor. Professional carpet equipment is brought only when specifically booked.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl bg-slate-50 p-6 border border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Carpet Results &amp; Drying Expectations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Carpet cleaning improves appearance and freshness, but complete removal of every stain or odour cannot be guaranteed. Results depend on carpet material, condition, stain type, age, previous treatments and whether contamination has reached the backing or underlay.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Carpets remain damp after extraction. Drying time varies with carpet thickness, temperature, humidity and ventilation. Children and pets should remain away until completely dry.
              </p>
              <div className="rounded-xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900">
                <strong>Tell Us Before Booking:</strong> Advise us if the carpet is wool, handmade, antique, damaged, recently installed, or affected by significant pet urine, flooding or mould.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: Eco-Conscious, Pet-Conscious & Allergen Protocols */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Eco-Conscious */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="text-2xl">🌱</div>
            <h3 className="text-lg font-bold text-slate-900">Eco-Conscious by Request</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Customers may request eco-conscious or reduced-fragrance products before the appointment. We will review availability, surface compatibility and cleaning requirements. Any additional costs will be confirmed in advance.
            </p>
          </div>

          {/* Pet-Conscious */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="text-2xl">🐾</div>
            <h3 className="text-lg font-bold text-slate-900">Pet-Conscious Cleaning</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              If you have pets, please tell us when booking. Subject to availability, we arrange milder products marketed for homes with pets. Pets and food bowls should remain away from active cleaning areas until dry.
            </p>
          </div>

          {/* Allergies & Sensitivities */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="text-2xl">🌿</div>
            <h3 className="text-lg font-bold text-slate-900">Allergies &amp; Sensitivities</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              Notify us about chemical/fragrance sensitivities, respiratory concerns, or skin allergies. We will review reasonable alternatives, but cannot guarantee a 100% allergen-free or chemical-free environment.
            </p>
          </div>
        </section>

        {/* SECTION 7: Surface Protection & Customer-Provided Products */}
        <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Help Us Protect Your Surfaces */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-[#0B4E9B]">
              Help Us Protect Your Surfaces
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Please tell us before cleaning about natural stone (marble, granite, slate), unsealed wood, specialty flooring, antiques, custom finishes, recently painted surfaces or anything requiring manufacturer-specific care.
            </p>
            <p className="text-xs text-slate-600">
              When compatibility is uncertain, we may use a milder method, test a small inconspicuous area, request instructions or avoid applying the product to prevent damage.
            </p>
          </div>

          {/* Customer-Provided Products */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-[#0B4E9B]">
              Customer-Provided Products
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Customers may ask our cleaners to use a preferred product. It must be supplied in its original labelled container, have readable directions, be suitable for the intended surface, and not be expired, leaking or damaged.
            </p>
            <p className="text-xs text-amber-800 font-semibold bg-amber-50 p-3 rounded-xl border border-amber-100">
              Note: Camz Cleaning may decline to use an unlabelled, mixed, damaged or potentially unsafe product.
            </p>
          </div>
        </section>

        {/* SECTION 8: Request Special Products or Equipment & Arrive Prepared */}
        <section className="rounded-3xl bg-slate-900 p-8 md:p-12 text-white shadow-xl space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Before Your Appointment
            </span>
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              Request Special Products or Equipment
            </h2>
            <p className="text-slate-300 text-sm md:text-base">
              When booking your cleaning, please tell us if you require any of the following:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {requestChecklist.map((item) => (
              <div key={item} className="flex items-center gap-2.5 rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10 text-xs font-semibold text-white">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Arrive Prepared Box */}
          <div className="rounded-2xl bg-gradient-to-r from-[#0B4E9B] to-blue-700 p-6 md:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Arrive Prepared</h3>
              <p className="text-xs text-blue-100 max-w-xl">
                Tell us about your surfaces, flooring, pets, sensitivities and equipment requirements before the appointment so our team can prepare the appropriate products and tools for your service.
              </p>
            </div>
            <Link
              href="/booking/"
              className="flex-shrink-0 rounded-xl bg-white px-6 py-3 text-xs font-bold text-[#0B4E9B] shadow-lg transition-transform hover:scale-105"
            >
              Book Online with Notes
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 italic text-center">
            Specific brands and products may change because of availability, supplier changes or surface requirements. The terms professional, eco-conscious, reduced-fragrance and pet-conscious do not mean a product is completely risk-free. All products must be used according to their labels.
          </p>
        </section>

      </div>
    </div>
  );
}
