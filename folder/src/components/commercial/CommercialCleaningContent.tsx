"use client";

import Link from "next/link";

const CommercialCleaningContent = () => {
  const coverageItems = [
    {
      title: "Work Areas and Shared Spaces",
      description:
        "Dusting, surface wiping and general cleaning for workstations, meeting rooms, reception areas and shared spaces.",
    },
    {
      title: "Washrooms and Staff Kitchens",
      description:
        "Cleaning and sanitizing for washrooms, break areas and staff kitchens based on the agreed service checklist.",
    },
    {
      title: "Floors, Waste and High-Touch Surfaces",
      description:
        "Vacuuming, mopping, waste removal and attention to frequently touched surfaces throughout the property.",
    },
  ];

  const carouselData = [
    {
      src: "/wp-admin/uploads/stairs-cleaning.webp",
      alt: "Commercial stairs and shared-area cleaning",
    },
    {
      src: "/wp-admin/uploads/floor-cleaning-of-home.webp",
      alt: "Commercial floor cleaning",
    },
    {
      src: "/wp-admin/uploads/floor cleaning of home-2.webp",
      alt: "Floor and surface cleaning",
    },
    {
      src: "/wp-admin/uploads/floor-cleaning-of-home-3.webp",
      alt: "Professional floor maintenance",
    },
  ];

  return (
    <div className="space-y-12 text-gray-700">
      {/* Introduction */}
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] shadow-md">
          <img
            src="/commercial-cleaning.webp"
            alt="Commercial workspace prepared for professional cleaning"
            width={1200}
            height={800}
            className="h-[300px] w-full object-cover md:h-[400px]"
          />
        </div>

        <p className="font-medium leading-relaxed">
          Camz Cleaning provides commercial cleaning for workplaces and shared
          facilities, with each service planned around the property, schedule
          and agreed cleaning requirements.
        </p>
      </section>

      {/* Commercial Properties */}
      <section className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
            Commercial Properties We Clean
          </h2>

          <p className="leading-relaxed">
            Explore our commercial cleaning options, each tailored to your
            property, schedule and day-to-day requirements.
          </p>
        </div>

        <div className="space-y-7">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B4E9B]">
              Offices and Corporate Workspaces
            </h3>

            <p className="leading-relaxed">
              Detailed cleaning for offices, meeting rooms, reception areas and
              shared workspaces, helping maintain a tidy and welcoming business
              environment.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B4E9B]">
              Shops and Shared Facilities
            </h3>

            <p className="leading-relaxed">
              Flexible cleaning for shops and shared facilities, covering floors,
              washrooms, high-touch surfaces and common areas.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#0B4E9B]">
              Post-Construction and Renovated Spaces
            </h3>

            <p className="leading-relaxed">
              Post-construction cleaning removes dust, debris and surface
              residue after renovations, helping prepare commercial spaces for
              use.
            </p>
          </div>

        </div>
      </section>

      {/* Cleaning Scope */}
      <section className="space-y-8">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          What Is Included in Commercial Cleaning?
        </h2>

        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="space-y-7">
            {coverageItems.map((item) => (
              <div key={item.title} className="space-y-2">
                <h3 className="text-xl font-bold text-[#0B4E9B]">
                  {item.title}
                </h3>

                <p className="leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

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
        </div>
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

export default CommercialCleaningContent;