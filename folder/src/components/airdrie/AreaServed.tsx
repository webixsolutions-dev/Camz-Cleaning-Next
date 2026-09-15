"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const sliderImages = [
  {
    src: "/wp-admin/uploads/clean wadrobe.webp",
    alt: "Clean wardrobe after cleaning service",
  },
  {
    src: "/wp-admin/uploads/cleaned floor.webp",
    alt: "Clean floor after cleaning service",
  },
  {
    src: "/wp-admin/uploads/whole bathroom cleaning.webp",
    alt: "Clean bathroom after cleaning service",
  },
];

const AreasServed = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentIndex(
        (current) => (current + 1) % sliderImages.length,
      );
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const serviceAreas = [
    {
      city: "Airdrie",
      description: "Fireplace & furnace cleaning",
    },
    {
      city: "Cochrane",
      description: "Vent cleaning & inspection",
    },
    {
      city: "Chestermere",
      description: "Safe, efficient cleaning with honest pricing",
    },
    {
      city: "Calgary",
      description: "Complete fireplace & furnace solutions",
    },
  ];

  const currentImage = sliderImages[currentIndex];

  return (
    <section className="bg-white px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Image Slider */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
            >
              <img
                src={currentImage.src}
                alt={currentImage.alt}
                className="block h-auto w-full"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="flex flex-col space-y-6">
          <h2 className="mb-2 text-4xl font-extrabold text-[#004A8C] md:text-5xl">
            Areas We Serve
          </h2>

          <p className="font-medium leading-relaxed text-gray-700">
            Camz Cleaning offers professional fireplace, furnace, and vent
            cleaning to keep your home safe, efficient, and fresh. Our expert
            team provides inspections, maintenance, and honest pricing for homes
            across multiple locations.
          </p>

          <div className="space-y-4">
            {serviceAreas.map((area) => (
              <div
                key={area.city}
                className="flex items-center gap-3 text-sm leading-relaxed text-gray-700 md:text-lg"
              >
                <IoCheckmarkCircleOutline
                  size={24}
                  className="shrink-0 text-[#004A8C]"
                />

                <p>
                  <span className="font-bold text-slate-800">
                    {area.city}
                  </span>{" "}
                  – {area.description}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/contact-us"
              className="inline-block rounded-lg bg-gradient-to-r from-[#0091C1] to-[#004A8C] px-10 py-3 font-bold text-white transition-all duration-300 hover:shadow-lg active:scale-95"
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