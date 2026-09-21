"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const Airbnb = () => {
  const checklistItems = [
    "Fast turnover cleaning between guest check-out and check-in",
    "Fresh linen replacement, crisp bed making and towel staging",
    "Deep bathroom sanitizing, kitchen reset and guest waste removal",
  ];

  return (
    <section className="bg-[#EEF5F7] py-20">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Image Showcase - Clean & Seamless */}
          <div className="relative order-2 lg:order-1 w-full">
            <div className="overflow-hidden rounded-3xl h-[380px] sm:h-[460px] md:h-[520px] lg:h-[560px] w-full">
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKzcynglU4kLB5dW0m_3GP0VT2CzcW9tRQ_fvIx2ScLQ&s=10"
                alt="Airbnb and Short-Term Rental Cleaning in Calgary"
                width={800}
                height={800}
                className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* Content Narrative */}
          <div className="order-1 lg:order-2">
            <span className="inline-flex rounded-full bg-[#02C0E6] px-5 py-1 text-sm font-semibold text-white mb-6">
              Airbnb &amp; Short-Term Rental Cleaning
            </span>

            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-[#0B4E9B] mb-8">
              5-Star Airbnb Turnover <br />Experts in Calgary
            </h2>

            <p className="text-[#1A1A1A] text-lg leading-9 mb-5">
              Camz Cleaning provides professional turnover cleaning for Airbnb hosts and vacation rental managers in Calgary, ensuring every incoming guest arrives to an immaculate, staged, and welcoming space.
            </p>

            <p className="text-[#1A1A1A] text-lg leading-9 mb-6">
              Our dedicated team handles tight turnover windows with meticulous attention to detail — from sanitized bathrooms and spotless kitchens to crisp bed preparation and amenity staging.
            </p>

            {/* Checklist Highlights */}
            <div className="space-y-4 mb-10">
              {checklistItems.map((item) => (
                <div key={item} className="flex items-start gap-3 text-[#1A1A1A]">
                  <IoCheckmarkCircleOutline
                    size={24}
                    className="text-[#0B4E9B] mt-1 flex-shrink-0"
                  />
                  <p className="text-lg leading-8">{item}</p>
                </div>
              ))}
            </div>

            {/* Read More Link */}
            <Link
              href="/airbnb-cleaning-services/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0B4E9B] to-[#02C0E6] px-8 py-4 text-lg font-semibold text-white hover:opacity-90 transition"
            >
              Explore Airbnb Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Airbnb;
