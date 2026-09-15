import React from "react";
import Image from "next/image";
import Link from "next/link";

const CochraneCleaningServices = () => {
  return (
    <section className="bg-white py-20 px-6 md:px-12 lg:px-24">
      <div className="container-custom mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="inline-block bg-[#00CEE6] text-white px-5 py-1.5 rounded-full text-sm font-semibold tracking-wide">Cochrane</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#004A8C] leading-[1.1]">Professional Cleaning Services in Cochrane</h2>
          <div className="space-y-5 text-gray-700 leading-relaxed font-medium">
            <p>At Camz Cleaning, we provide reliable, detail-oriented cleaning services in Cochrane for both residential and commercial properties. Our goal is simple: to deliver quality cleaning solutions that enhance hygiene, improve comfort, and help maintain your property.</p>
            <p>Our experienced cleaning team offers professional residential and commercial cleaning services in Cochrane, with customized plans designed to suit your space, schedule, and cleaning priorities. From homes and apartments to offices and business facilities, we focus on consistent results, efficiency, and customer satisfaction to keep every property spotless, organized, and well maintained.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-[#004A8C] text-white px-5 py-2 rounded-full shadow-md mt-4"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /><span className="text-sm md:text-base font-semibold tracking-wide">100% Satisfaction Assured</span></div>
          <div className="pt-2"><Link href="/contact-us" className="inline-block bg-gradient-to-r from-[#0091C1] to-[#004A8C] text-white px-10 py-4 rounded-xl font-bold hover:shadow-lg transition-shadow duration-300 active:scale-95">Contact Us</Link></div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#00CEE6]/10 to-[#004A8C]/10 rounded-3xl blur-2xl group-hover:blur-xl transition-all duration-500" />
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-[10px] border-white z-10"><Image src="/wp-admin/uploads/stairs cleaning.webp" alt="Professionally cleaned stairs in a Cochrane property" fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" priority /></div>
        </div>
      </div>
    </section>
  );
};

export default CochraneCleaningServices;
