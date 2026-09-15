import React from "react";
import Link from "next/link";

const CallToAction = () => {
  return (
    <section className="relative overflow-hidden px-6 py-10">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: "url('/wp-admin/uploads/about2.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E5D9E]/90 to-[#16497D]/80" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center text-white">
        <div className="flex justify-center">
          <span className="rounded-full border border-white/20 bg-[#00CFE8] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white md:text-xs">Spotless Professional Results</span>
        </div>
        <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">Ready For A Professional Cleaning Service?</h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-blue-50/90 md:text-lg">Transform your space today with Camz Cleaning&apos;s trusted experts providing thorough, professional cleaning you can count on.</p>
        <div className="pt-4">
          <Link href="/contact-us" className="inline-block rounded-xl border-2 border-white/60 px-8 py-3.5 text-sm font-bold backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#16497D] md:text-base">Book Your Cleaning Today</Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
