"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const Vehicle = () => {
  const checklistItems = ["Exterior wash and hand drying", "Interior vacuuming and detailing", "Dashboard, glass, and tire care"];

  return (
    <section className="bg-[#EEF5F7] py-20">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl h-[350px] md:h-[500px]">
              <Image src="/p3.webp" alt="Vehicle Cleaning" width={700} height={700} className="h-full w-full object-cover" priority />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <span className="inline-flex rounded-full bg-[#02C0E6] px-5 py-1 text-sm font-semibold text-white mb-6">Vehicle Cleaning Services</span>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-[#0B4E9B] mb-8">Trusted Vehicle Cleaning<br />Experts</h2>
            <p className="text-[#1A1A1A] text-lg leading-9 mb-5">Camz Cleaning provides expert vehicle cleaning, bringing back shine, freshness, and comfort with meticulous interior and exterior care every time.</p>
            <p className="text-[#1A1A1A] text-lg leading-9 mb-2">Our skilled team uses gentle, effective products and techniques to keep your vehicle spotless, protected, and looking its absolute best every time.</p>
            <div className="space-y-4 mb-10">
              {checklistItems.map((item) => (
                <div key={item} className="flex items-start gap-3 text-[#1A1A1A]">
                  <IoCheckmarkCircleOutline size={24} className="text-[#0B4E9B] mt-1 flex-shrink-0" />
                  <p className="text-lg leading-8">{item}</p>
                </div>
              ))}
            </div>
            <Link href="/vehicle-cleaning-service" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0B4E9B] to-[#02C0E6] px-8 py-4 text-lg font-semibold text-white hover:opacity-90 transition">Read More</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vehicle;
