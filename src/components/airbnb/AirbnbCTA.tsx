import React from "react";
import Link from "next/link";

const AirbnbCTA = () => {
  return (
    <aside className="relative overflow-hidden bg-gradient-to-br from-[#072d5c] via-[#0B4E9B] to-[#0d59b3] px-6 py-16 text-center text-white md:px-12 lg:py-20">
      {/* Background Ambience Glow */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-6">
        <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-sm border border-white/10">
          Reliable Calgary Turnover Cleaning
        </span>

        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl">
          Book Airbnb Cleaning Online
        </h2>

        <p className="mx-auto max-w-2xl text-base leading-relaxed text-blue-100 md:text-lg">
          Submit your rental property details, preferred turnover window and linen requirements so Camz Cleaning can confirm availability and scope.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/booking/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#0B4E9B] shadow-lg transition-all duration-200 hover:bg-blue-50 hover:shadow-xl focus:ring-4 focus:ring-white/30"
          >
            <span>Book Online</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <Link
            href="/calgary-cleaning-services/"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/5 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/15"
          >
            Short-term rental cleaning in Calgary
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default AirbnbCTA;
