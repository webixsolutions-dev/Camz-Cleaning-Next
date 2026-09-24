import React from "react";
import Image from "next/image";

const ResidentialHero = () => {
  return (
    <section className="relative flex h-[300px] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/wp-admin/uploads/residential-bg.webp"
          alt="Residential home cleaning service"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[#265995] opacity-92" />
      </div>

      <div className="relative z-10 px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md md:text-6xl">
          Affordable Residential Cleaning Services in Calgary
        </h1>
      </div>
    </section>
  );
};

export default ResidentialHero;