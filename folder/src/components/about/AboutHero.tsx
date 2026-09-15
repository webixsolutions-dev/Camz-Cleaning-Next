import React from "react";
import Image from "next/image";

const AboutHero = () => {
  return (
    <section className="relative flex h-[260px] items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/wp-admin/uploads/commercial-kitchen-cleaning.webp"
          alt="Camz Cleaning team and cleaning services"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[#255892]/80" />
      </div>

      <div className="relative z-10 px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md md:text-6xl">
          About Camz Cleaning
        </h1>
      </div>
    </section>
  );
};

export default AboutHero;