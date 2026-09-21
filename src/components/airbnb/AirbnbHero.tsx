import React from "react";
import Image from "next/image";
import Link from "next/link";

const AirbnbHero = () => {
  return (
    <section className="relative flex min-h-[380px] items-center justify-center overflow-hidden py-16 md:min-h-[440px] md:py-24">
      {/* Background Image with Depth Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80"
          alt="Airbnb and short-term rental cleaning service in Calgary"
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
          <Link href="/calgary-cleaning-services/" className="hover:text-white transition-colors">Services</Link>
          <span>/</span>
          <span className="text-blue-300">Airbnb Cleaning</span>
        </nav>

        {/* H1 Heading */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl">
          Airbnb &amp; Short-Term Rental Cleaning in Calgary
        </h1>

        {/* Trust Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-semibold text-xs text-blue-100 sm:text-sm">
          <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/10">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Same-Day Turnover Available
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/10">
            <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Fresh Linens &amp; Towel Setup
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 backdrop-blur-sm border border-white/10">
            <svg className="h-4 w-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Calgary • Airdrie • Chestermere
          </span>
        </div>
      </div>
    </section>
  );
};

export default AirbnbHero;
