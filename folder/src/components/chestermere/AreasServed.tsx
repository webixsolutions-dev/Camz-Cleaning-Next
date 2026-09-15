"use client";

import React from "react";
import Link from "next/link";

const AreasServed = () => {
  const serviceAreas = [
    {
      city: "Cochrane",
      description:
        "Professional residential and commercial cleaning services.",
    },
    {
      city: "Calgary",
      description: "Reliable home, office, and vehicle cleaning solutions.",
    },
    {
      city: "Airdrie",
      description:
        "Trusted deep cleaning, steam cleaning, and maintenance services.",
    },
    {
      city: "Chestermere",
      description:
        "Expert residential, commercial, and seasonal cleaning services.",
    },
  ];

  return (
    <section className="bg-white px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <img
            src="/wp-admin/uploads/Room cleaning.webp"
            alt="Room cleaning"
            className="block h-auto w-full"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col space-y-6">
          <h2 className="mb-2 text-4xl font-extrabold text-[#004A8C] md:text-5xl">
            Areas We Serve
          </h2>

          <p className="pt-2 text-sm font-medium text-gray-700 md:text-base">
            We proudly bring our professional cleaning services to communities
            across the region. No matter where you are, Camz Cleaning ensures
            every home, office, and vehicle is spotless, hygienic, and
            welcoming.
          </p>

          <div className="space-y-4">
            {serviceAreas.map((area) => (
              <p
                key={area.city}
                className="text-sm leading-relaxed text-gray-700 md:text-base"
              >
                <span className="font-black text-slate-800">
                  {area.city}:
                </span>{" "}
                {area.description}
              </p>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/contact-us"
              className="inline-block rounded-xl bg-gradient-to-r from-[#0091C1] to-[#004A8C] px-8 py-3 font-bold text-white transition-all duration-300 hover:shadow-lg active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AreasServed;