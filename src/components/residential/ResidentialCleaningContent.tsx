"use client";

const ResidentialCleaningContent = () => {
  const whyChooseItems = [
    "A clear cleaning scope based on the home and requested tasks.",
    "One-time and recurring options subject to availability.",
    "Online booking with preferred appointment selection.",
    "A respectful team focused on consistent home care.",
  ];

  const standardCleaning = [
    {
      title: "Kitchen Cleaning",
      description:
        "We clean counters, sinks, appliance exteriors, cabinet fronts and other accessible kitchen surfaces, with attention to everyday build-up and frequently used areas.",
    },
    {
      title: "Bathroom Cleaning",
      description:
        "Bathroom cleaning covers sinks, toilets, tubs, showers, mirrors and accessible surfaces, helping keep the space fresh, hygienic and well maintained.",
    },
    {
      title: "Bedrooms and Living Areas",
      description:
        "We dust, wipe surfaces, tidy accessible areas and clean floors throughout bedrooms and living spaces for a cleaner, more comfortable home.",
    },
    {
      title: "Floors, Rugs and Carpets",
      description:
        "We vacuum rugs and carpets and mop suitable hard floors based on the floor type, with attention to visible dust and debris.",
    },
  ];

  const detailedCleaning = [
    {
      title: "Cabinets, Appliances and Detailed Surfaces",
      description:
        "Extra attention for build-up, cabinet surfaces, appliance areas and other tasks confirmed as part of a deep-cleaning scope.",
    },
    {
      title: "Move-In and Move-Out Cleaning",
      description:
        "Detailed cleaning for an empty or nearly empty home before moving in or after moving out, based on the condition and access.",
    },
  ];

  const carouselData = [
    {
      src: "/wp-admin/uploads/residential-hero.webp",
      alt: "Residential home prepared for professional cleaning",
    },
    {
      src: "/wp-admin/uploads/residential-bg.webp",
      alt: "Clean residential living area",
    },
    {
      src: "/wp-admin/uploads/help-bg.webp",
      alt: "Residential cleaning service in progress",
    },
    {
      src: "/wp-admin/uploads/stairs-cleaning.webp",
      alt: "Residential stairs being cleaned",
    },
  ];

  return (
    <div className="space-y-12 text-gray-700">
      {/* Restored Residential Introduction */}
      <section className="space-y-6">
        <h2 className="text-3xl font-extrabold leading-tight text-[#0B4E9B] md:text-4xl">
          Professional House Cleaning Services in Calgary
        </h2>

        <div className="overflow-hidden rounded-[2rem] shadow-md">
          <img
            src="/wp-admin/uploads/residential-hero.webp"
            alt="Professional house cleaning service in Calgary"
            width={1200}
            height={800}
            className="block h-auto w-full"
          />
        </div>

        <p className="font-medium leading-relaxed">
          Keeping your home clean and comfortable takes time, especially when
          daily routines leave little room for detailed cleaning. Camz Cleaning
          provides professional house cleaning services in Calgary for
          homeowners who want reliable, consistent care without the added
          stress. Our residential cleaning service covers essential areas
          throughout the home, including kitchens, bathrooms, bedrooms and
          living spaces, with the cleaning scope tailored to your property,
          condition and priorities. Whether you need regular upkeep, a detailed
          deep clean or move-in/move-out cleaning, our team focuses on creating
          a cleaner, fresher and more comfortable home with careful attention to
          the areas that matter most.
        </p>
      </section>

      {/* Why Choose */}
      <section className="space-y-6">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          Why Choose Camz Cleaning?
        </h2>

        <p className="leading-relaxed">
          With Camz Cleaning’s residential cleaning services, your home stays
          cleaner, healthier and easier to maintain. Every visit is planned
          around your space, schedule and priorities.
        </p>

        <ul className="grid grid-cols-1 gap-4">
          {whyChooseItems.map((item, index) => (
            <li
              key={item}
              className="flex items-start gap-3 font-medium text-gray-700"
            >
              <span className="font-bold text-[#0B4E9B]">{index + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Standard Cleaning Scope */}
      <section className="space-y-8">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          What Is Included in Residential Cleaning?
        </h2>

        <div className="space-y-7">
          {standardCleaning.map((item) => (
            <div key={item.title} className="space-y-2">
              <h3 className="text-xl font-bold text-[#0B4E9B]">
                {item.title}
              </h3>
              <p className="leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Residential Images */}
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

      {/* Deep Cleaning */}
      <section className="space-y-8">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          Deep Cleaning and Detailed Home Care
        </h2>

        <div className="space-y-7">
          {detailedCleaning.map((item) => (
            <div key={item.title} className="space-y-2">
              <h3 className="text-xl font-bold text-[#0B4E9B]">
                {item.title}
              </h3>
              <p className="leading-relaxed">{item.description}</p>
            </div>
          ))}
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

export default ResidentialCleaningContent;
