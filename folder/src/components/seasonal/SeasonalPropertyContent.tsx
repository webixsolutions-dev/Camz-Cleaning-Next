"use client";

import Link from "next/link";

const SeasonalPropertyContent = () => {
  const carouselData = [
    {
      src: "/wp-admin/uploads/seasonal.webp",
      alt: "Seasonal property cleaning and care",
    },
    {
      src: "/wp-admin/uploads/seasonal-1.webp",
      alt: "Winter property access support",
    },
    {
      src: "/wp-admin/uploads/residential-hero.webp",
      alt: "Seasonal home interior cleaning",
    },
    {
      src: "/wp-admin/uploads/residential-bg.webp",
      alt: "Seasonal property cleanup",
    },
  ];

  return (
    <div className="space-y-12 text-gray-700">
      {/* Introduction */}
      <section className="space-y-6">
        <h2 className="text-3xl font-extrabold leading-tight text-[#0B4E9B] md:text-4xl">
          Year-Round Care for Seasonal and Rental Properties
        </h2>

        <div className="overflow-hidden rounded-[2rem] shadow-md">
          <img
            src="/wp-admin/uploads/seasonal.webp"
            alt="Seasonal property and vacation rental cleaning"
            width={1200}
            height={800}
            className="h-[350px] w-full object-cover md:h-[450px]"
          />
        </div>

        <p className="font-medium leading-relaxed">
          Camz Cleaning supports seasonal homes and vacation rentals in Calgary,
          with service also available in Airdrie, Cochrane and Chestermere.
          Choose the tasks needed for the property, season and guest schedule.
        </p>
      </section>

      {/* Seasonal Services */}
      <section className="space-y-8">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          Seasonal Property Services Available
        </h2>

        <div className="space-y-7">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B4E9B]">
              Winter Snow and Access Support
            </h3>

            <p className="leading-relaxed">
              Snow-related property support may be arranged according to the
              property, conditions, access and team availability.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B4E9B]">
              Spring and Summer Property Cleanup
            </h3>

            <p className="leading-relaxed">
              Seasonal cleanup for outdoor and indoor areas helps prepare a
              property for warmer weather, guests or regular use.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B4E9B]">
              Yard and Garden Area Care
            </h3>

            <p className="leading-relaxed">
              Basic cleanup for agreed yard and garden areas can be included
              when the requested work is within Camz Cleaning&apos;s actual
              service scope.
            </p>
          </div>
        </div>
      </section>

      {/* Vacation Rentals */}
      <section className="space-y-8">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          Vacation Rental and Guest Turnover Cleaning
        </h2>

        <div className="space-y-7">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B4E9B]">
              Indoor Cleaning Between Guests
            </h3>

            <p className="leading-relaxed">
              Cleaning for kitchens, bathrooms, bedrooms and living areas
              between guest stays, based on the property checklist.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B4E9B]">
              Floors, Windows and Debris Removal
            </h3>

            <p className="leading-relaxed">
              Floor care, accessible window cleaning and removal of ordinary
              waste or debris according to the agreed turnover scope.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B4E9B]">
              Guest-Ready Property Preparation
            </h3>

            <p className="leading-relaxed">
              Final presentation checks can help prepare the property for the
              next arrival. Linen, restocking and damage reporting must be
              confirmed separately.
            </p>
          </div>
        </div>
      </section>

      {/* Images */}
      <section>
        <div className="relative h-[250px] w-full overflow-hidden rounded-2xl">
          <div className="flex h-full w-[400%] animate-slide gap-4">
            {[...carouselData, ...carouselData].map((img, index) => (
              <div
                key={`${img.src}-${index}`}
                className="h-full w-1/2 flex-shrink-0 px-2"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  width={1200}
            height={800}
            className="h-full w-full rounded-2xl object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Preparation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          Property Preparation for a New Season, Rental or Sale
        </h2>

        <p className="leading-relaxed">
          Seasonal property service can help prepare a property for guests,
          tenants, buyers or a change in season. The exact cleaning and
          preparation tasks are confirmed according to the property and
          requested scope.
        </p>

        <p className="leading-relaxed">
          Where more detailed interior work is needed, explore our{" "}
          <Link
            href="/residential-cleaning-services/"
            className="font-bold text-[#0B4E9B] hover:underline"
          >
            deep cleaning
          </Link>{" "}
          options.
        </p>
      </section>

      {/* Service Plans */}
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          One-Time and Recurring Seasonal Service
        </h2>

        <p className="leading-relaxed">
          One-time and recurring arrangements may be available depending on the
          property, requested tasks, season, access and team availability.
        </p>
      </section>

      {/* Service Areas */}
      <section className="space-y-4">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          Seasonal Property Service Areas
        </h2>

        <p className="leading-relaxed">
          Service is available in{" "}
          <Link
            href="/calgary-cleaning-services/"
            className="font-bold text-[#0B4E9B] hover:underline"
          >
            Calgary
          </Link>{" "}
          and may also be scheduled in{" "}
          <Link
            href="/airdrie-cleaning-services/"
            className="font-bold text-[#0B4E9B] hover:underline"
          >
            Airdrie
          </Link>
          ,{" "}
          <Link
            href="/cochrane-cleaning-services/"
            className="font-bold text-[#0B4E9B] hover:underline"
          >
            Cochrane
          </Link>{" "}
          and{" "}
          <Link
            href="/chestermere-cleaning-services/"
            className="font-bold text-[#0B4E9B] hover:underline"
          >
            Chestermere
          </Link>
          .
        </p>
      </section>

      <style>{`
        @keyframes slide {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }

        .animate-slide {
          animation: slide 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SeasonalPropertyContent;