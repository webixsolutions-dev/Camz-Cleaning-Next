// import React from "react";
// import Image from "next/image";

// const AboutHero = () => {
//   return (
//     <section className="relative flex h-[260px] items-center justify-center overflow-hidden">
//       <div className="absolute inset-0 z-0">
//         <Image
//           src="/wp-admin/uploads/commercial-kitchen-cleaning.webp"
//           alt="Camz Cleaning team and cleaning services"
//           fill
//           priority
//           sizes="100vw"
//           className="object-cover"
//         />

//         <div className="absolute inset-0 bg-[#255892]/80" />
//       </div>

//       <div className="relative z-10 px-4 text-center">
//         <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md md:text-6xl">
//           About Camz Cleaning
//         </h1>
//       </div>
//     </section>
//   );
// };

// export default AboutHero;

import React from "react";
import Image from "next/image";
import Link from "next/link";

const AboutHero = () => {
  return (
    <section className="relative flex min-h-[380px] items-center justify-center overflow-hidden py-16 md:min-h-[440px] md:py-24">
      {/* Background Image with Depth Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/wp-admin/uploads/commercial-kitchen-cleaning.webp"
          alt="Camz Cleaning professional team and cleaning services in Calgary"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#072d5c]/95 via-[#0B4E9B]/85 to-[#072d5c]/90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-blue-100 backdrop-blur-md">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-blue-300">About Us</span>
        </nav>

        {/* H1 Heading */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl">
          About Camz Cleaning
        </h1>

        <p className="mx-auto mt-4 max-w-3xl text-base text-blue-100 md:text-xl font-medium leading-relaxed">
          Local, insured and professional cleaning services for homes, rentals and businesses in Calgary and surrounding communities.
        </p>

        {/* 3 Core Pillars Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-bold text-xs uppercase tracking-wider text-white sm:text-sm">
          <span className="rounded-xl bg-white/15 px-5 py-2.5 backdrop-blur-md border border-white/20 shadow-sm">
            ✓ Clear Pricing
          </span>
          <span className="rounded-xl bg-white/15 px-5 py-2.5 backdrop-blur-md border border-white/20 shadow-sm">
            ✓ 2 Cleaners Standard*
          </span>
          <span className="rounded-xl bg-white/15 px-5 py-2.5 backdrop-blur-md border border-white/20 shadow-sm">
            ✓ Quality Support
          </span>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
