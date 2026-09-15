"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IoCheckmarkCircleOutline } from "react-icons/io5";

const Commercial = () => {
  const checklistItems = [
    "Office workstations, meeting rooms, and reception areas",
    "Restroom sanitation and surface disinfection",
    "Floor maintenance, trash removal, and full-area sanitization",
  ];

  return (
    <section className="bg-[#EEF5F7] max-w-7xl mx-auto py-20">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-flex rounded-full bg-[#02C0E6] px-5 py-1 text-sm font-semibold text-white mb-6">Commercial Cleaning</span>
            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight text-[#0B4E9B] mb-8">Guaranteed Spotless<br />Commercial Cleaning</h2>
            <p className="text-[#1A1A1A] text-lg leading-9 mb-5">
              Our commercial cleaning services are designed to fit your business schedule, including after-hours options. We tackle high-traffic zones, shared areas, and every detail with precision, delivering consistently spotless results.
            </p>
            <div className="space-y-4 mb-10">
              {checklistItems.map((item) => (
                <div key={item} className="flex items-start gap-3 text-[#1A1A1A]">
                  <IoCheckmarkCircleOutline size={24} className="text-[#0B4E9B] mt-1 flex-shrink-0" />
                  <p className="text-lg leading-8">{item}</p>
                </div>
              ))}
            </div>
            <Link href="/commercial-cleaning-services" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#0B4E9B] to-[#02C0E6] px-8 py-4 text-lg font-semibold text-white hover:opacity-90 transition">Read More</Link>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-2xl h-[350px] md:h-[500px]">
              <Image src="/commercial.webp" alt="Commercial Cleaning" width={700} height={700} className="h-full w-full object-cover" priority />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Commercial;
