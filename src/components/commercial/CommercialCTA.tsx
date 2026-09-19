// import Link from "next/link";

// const CommercialCTA = () => (
//   <section className="bg-[#0B4E9B] px-6 py-16 text-center text-white md:px-12 lg:px-24">
//     <div className="mx-auto max-w-4xl">
//       <h2 className="text-3xl font-extrabold md:text-5xl">Book Commercial Cleaning Online</h2>
//       <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-blue-50">
//         Submit your property details, preferred schedule and cleaning requirements so Camz Cleaning can review the scope, availability and pricing.
//       </p>
//       <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
//         <Link href="/booking/" className="rounded-xl bg-white px-8 py-4 font-bold text-[#0B4E9B]">Book Online</Link>
//         <Link href="/calgary-cleaning-services/" className="font-bold text-white underline underline-offset-4">Commercial cleaning services in Calgary</Link>
//       </div>
//     </div>
//   </section>
// );

// export default CommercialCTA;

import React from "react";
import Image from "next/image";
import Link from "next/link";

const CommercialHero = () => {
  return (
    <section className="relative flex min-h-[380px] items-center justify-center overflow-hidden py-16 md:min-h-[440px] md:py-24">
      {/* Background with Optimized Next/Image and Depth Gradient */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/wp-admin/uploads/commercial-kitchen-cleaning.webp"
          alt="Commercial cleaning service workspace in Calgary - Camz Cleaning"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#072d5c]/95 via-[#0B4E9B]/85 to-[#072d5c]/90" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation for SEO */}
        <nav aria-label="Breadcrumb" className="mb-4 inline-flex items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-blue-100 backdrop-blur-md">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <Link href="/calgary-cleaning-services/" className="hover:text-white transition-colors">Services</Link>
          <span>/</span>
          <span className="text-blue-300">Commercial Cleaning</span>
        </nav>

        {/* H1 Heading */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl">
          Commercial Cleaning Services for Businesses in Calgary
        </h1>

        {/* Trust Badges Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-blue-100 sm:text-sm">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/10">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Off-Hours & Flexible Scheduling
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/10">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Fully Insured & Vetted Staff
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/10">
            <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Calgary & Surrounding Area Service
          </span>
        </div>
      </div>
    </section>
  );
};

export default CommercialHero;
