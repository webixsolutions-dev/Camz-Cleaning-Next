// "use client";
// import Image from "next/image";
// import { motion, type Variants } from "framer-motion";

// const AboutSection = () => {
//   const containerVariants: Variants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
//   };

//   const itemVariants: Variants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
//   };

//   return (
//     <section className="overflow-hidden bg-[#EFFAFC] px-6 py-16 md:px-12 lg:px-24">
//       <div className="container-custom mx-auto space-y-12">
//         <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.8 }}
//             className="grid h-[320px] w-full grid-cols-2 gap-4 sm:h-[440px] lg:h-[560px]"
//           >
//             <div className="relative h-full min-w-0 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
//               <Image src="/wp-admin/uploads/clean wadrobe.webp" alt="Clean wardrobe" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover object-center" />
//             </div>
//             <div className="relative h-full min-w-0 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
//               <Image src="/wp-admin/uploads/cleaned kitchen.webp" alt="Clean kitchen" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover object-center" />
//             </div>
//           </motion.div>

//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             className="space-y-6"
//           >
//             <motion.span variants={itemVariants} className="inline-block rounded-full bg-[#00B7EB] px-4 py-1 text-sm font-semibold text-white">About Us</motion.span>
//             <motion.h2 variants={itemVariants} className="text-4xl font-bold leading-tight text-[#004A8C] md:text-5xl">Reliable &amp; Affordable <br /> Cleaning Services</motion.h2>
//             <motion.div variants={itemVariants} className="space-y-4 leading-relaxed text-gray-600">
//               <p>Camz Cleaning is a professionally operated cleaning company proudly serving Calgary and surrounding communities. Our journey started from home with a small, dedicated team and a simple goal: to provide reliable, affordable, and quality cleaning services to local families and businesses.</p>
//               <p>As a growing local company, we believe professional cleaning should be accessible without compromising on quality. Our dedicated team works carefully to understand each client&apos;s needs and provide dependable service with attention to detail.</p>
//               <p>From regular home cleaning to deep cleaning, move-in/move-out cleaning, and other cleaning needs, we continue to grow while staying focused on the values we started with — quality service, fair pricing, reliability, and customer satisfaction.</p>
//               <p>We are proud to be a Calgary-based business and grateful for every customer who supports our growing team.</p>
//             </motion.div>
//           </motion.div>
//         </div>

//         <div className="grid gap-6 md:grid-cols-2">
//             <div className="flex h-full flex-col items-center gap-5 rounded-2xl border border-[#BFD3E1] bg-white/70 p-6 text-center shadow-sm sm:flex-row sm:items-start sm:text-left">
//               <div className="flex-shrink-0">
//                 <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#BFD3E1]">
//                   <div className="flex h-22 w-22 items-center justify-center rounded-full bg-[#D8E2E8]">
//                     <Image src="/home.png" alt="Home" width={64} height={64} className="object-contain" />
//                   </div>
//                 </div>
//               </div>
//               <div className="min-w-0 flex-1">
//                 <h4 className="text-2xl font-bold text-[#004A8C]">Trusted Home Care</h4>
//                 <p className="mt-3 leading-7 text-gray-500">Camz Cleaning provides dependable residential cleaning that keeps your home fresh, hygienic, and comfortable using safe and effective methods.</p>
//               </div>
//             </div>

//             <div className="flex h-full flex-col items-center gap-5 rounded-2xl border border-[#BFD3E1] bg-white/70 p-6 text-center shadow-sm sm:flex-row sm:items-start sm:text-left">
//               <div className="flex-shrink-0">
//                 <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#BFD3E1]">
//                   <div className="flex h-22 w-22 items-center justify-center rounded-full bg-[#D8E2E8]">
//                     <Image src="/about-icon-2.webp" alt="Office" width={64} height={64} className="object-contain" />
//                   </div>
//                 </div>
//               </div>
//               <div className="min-w-0 flex-1">
//                 <h4 className="text-2xl font-bold text-[#004A8C]">Workplace Cleaning Experts</h4>
//                 <p className="mt-3 leading-7 text-gray-500">From small offices to large workplaces, Camz Cleaning ensures spotless, organized, and productive environments with reliable and affordable solutions.</p>
//               </div>
//             </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AboutSection;


"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const AboutSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="overflow-hidden bg-[#EFFAFC]/70 px-6 py-16 md:px-12 lg:px-24">
      <div className="mx-auto max-w-6xl space-y-16">
        {/* Story & Philosophy Grid */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Dual Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid h-[340px] w-full grid-cols-2 gap-4 sm:h-[420px] lg:h-[480px]"
          >
            <div className="relative h-full min-w-0 overflow-hidden rounded-3xl border-4 border-white shadow-xl">
              <Image
                src="/wp-admin/uploads/clean wadrobe.webp"
                alt="Detailed residential wardrobe and room cleaning"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="relative h-full min-w-0 overflow-hidden rounded-3xl border-4 border-white shadow-xl">
              <Image
                src="/wp-admin/uploads/cleaned kitchen.webp"
                alt="Sparkling clean kitchen prepared by Camz Cleaning"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-500 hover:scale-105"
              />
            </div>
          </motion.div>

          {/* Narrative Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="inline-block rounded-full bg-[#00B7EB] px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
              A Local Company You Can Count On
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-3xl font-extrabold leading-tight text-[#004A8C] md:text-4xl lg:text-5xl">
              Reliable, Insured &amp; Local Calgary Cleaners
            </motion.h2>

            <motion.div variants={itemVariants} className="space-y-4 text-base leading-relaxed text-slate-700">
              <p>
                <strong className="font-semibold text-slate-900">Camz Cleaning</strong> is a locally operated cleaning company based in Calgary, Alberta. We provide professional residential and commercial cleaning services for homeowners, tenants, landlords, property managers, short-term rental hosts and businesses.
              </p>
              <p>
                Our services include standard house cleaning, deep cleaning, move-in cleaning, move-out cleaning, Airbnb and short-term rental cleaning, commercial cleaning, carpet cleaning and customized cleaning services. We proudly serve <strong>Calgary, Airdrie, Chestermere, Cochrane and Okotoks</strong>, subject to appointment availability.
              </p>
              <p>
                For customers comparing cleaning companies in Calgary, Camz Cleaning offers straightforward booking, clearly explained service options, transparent pricing and a practical process for handling verified cleaning concerns.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Professional & Insured Cleaning Service Cards */}
        <div className="space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-extrabold text-[#004A8C] md:text-3xl">
              Professional &amp; Insured Cleaning Service
            </h3>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
              When you book Camz Cleaning, two professional cleaners are normally scheduled to come directly to your property for the selected on-site cleaning time or service package (single-cleaner dispatch may apply depending on availability and scope). Our cleaning operations are insured, offering additional peace of mind while our team works inside your home, rental property, office or commercial space.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Residential Focus Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:border-[#00B7EB] hover:shadow-md md:p-8">
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0B4E9B]">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-[#004A8C]">Residential Cleaning</h4>
                <p className="text-sm leading-relaxed text-slate-600">
                  Professional cleaning for houses, condos, apartments, townhomes and rental properties. Our cleaners follow the confirmed service scope with all primary cleaning supplies and equipment provided.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link href="/residential-cleaning-services/" className="inline-flex items-center gap-2 text-sm font-bold text-[#0B4E9B] hover:text-[#00B7EB]">
                  Explore Residential Scope →
                </Link>
              </div>
            </div>

            {/* Commercial Focus Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:border-[#00B7EB] hover:shadow-md md:p-8">
              <div className="space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0B4E9B]">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 className="text-2xl font-bold text-[#004A8C]">Commercial Cleaning</h4>
                <p className="text-sm leading-relaxed text-slate-600">
                  Flexible cleaning options for offices, businesses and managed commercial spaces. We adapt to your operating hours, high-traffic priorities, and facility requirements with precision.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <Link href="/commercial-cleaning-services/" className="inline-flex items-center gap-2 text-sm font-bold text-[#0B4E9B] hover:text-[#00B7EB]">
                  Explore Commercial Scope →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
