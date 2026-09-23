// import React from "react";
// import Link from "next/link";

// const CallToAction = () => {
//   return (
//     <section className="relative overflow-hidden px-6 py-10">
//       <div className="absolute inset-0 z-0" style={{ backgroundImage: "url('/wp-admin/uploads/about2.webp')", backgroundSize: "cover", backgroundPosition: "center" }}>
//         <div className="absolute inset-0 bg-gradient-to-r from-[#1E5D9E]/90 to-[#16497D]/80" />
//       </div>
//       <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center text-white">
//         <div className="flex justify-center">
//           <span className="rounded-full border border-white/20 bg-[#00CFE8] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white md:text-xs">Spotless Professional Results</span>
//         </div>
//         <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">Ready For A Professional Cleaning Service?</h2>
//         <p className="mx-auto max-w-2xl text-sm leading-relaxed text-blue-50/90 md:text-lg">Transform your space today with Camz Cleaning&apos;s trusted experts providing thorough, professional cleaning you can count on.</p>
//         <div className="pt-4">
//           <Link href="/contact-us" className="inline-block rounded-xl border-2 border-white/60 px-8 py-3.5 text-sm font-bold backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#16497D] md:text-base">Book Your Cleaning Today</Link>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CallToAction;

import React from "react";
import Link from "next/link";

const CallToAction = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#072d5c] via-[#0B4E9B] to-[#0d59b3] px-6 py-16 text-center text-white md:px-12 lg:py-24">
      {/* Background Ambience Elements */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl space-y-6 text-center text-white">
        {/* Highlight Badge */}
        <div className="flex justify-center">
          <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-200 backdrop-blur-md">
            A cleaner space starts with a clear plan
          </span>
        </div>

        {/* H2 SEO Heading */}
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
          Looking for Professional Cleaners in Calgary?
        </h2>

        {/* Detailed Narrative */}
        <p className="mx-auto max-w-3xl text-sm leading-relaxed text-blue-100 md:text-lg">
          If you are comparing cleaning companies in Calgary, Alberta, Camz Cleaning provides standard house cleaning, deep cleaning, move-in and move-out cleaning, Airbnb cleaning, short-term rental cleaning, commercial cleaning, carpet cleaning and customized cleaning services.
        </p>

        <p className="text-xs font-semibold text-blue-200 sm:text-sm">
          Choose the service that fits your property, review what is included and see your price before booking. Contact Camz Cleaning for availability, an online estimate or a customized cleaning quote.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/booking/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#0B4E9B] shadow-xl transition-all duration-200 hover:bg-blue-50 hover:shadow-2xl focus:ring-4 focus:ring-white/30"
          >
            <span>Book Online Now</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <Link
            href="/contact-us"
            className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20"
          >
            Request a Custom Quote
          </Link>
        </div>

        {/* Regional Footnote */}
        <div className="pt-6 text-xs text-blue-200/80">
          Serving Calgary, Airdrie, Chestermere, Cochrane &amp; Okotoks • Insured &amp; Locally Operated
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
