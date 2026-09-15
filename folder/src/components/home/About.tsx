"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section className="overflow-hidden bg-[#EFFAFC] px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/wp-admin/uploads/kitchen-cleaning.webp"
              alt="Clean kitchen after a residential cleaning service"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-lg">
            <Image
              src="/wp-admin/uploads/about2.webp"
              alt="Camz Cleaning service being carried out in a property"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
        </motion.div>

        <div className="space-y-6">
          <span className="inline-block rounded-full bg-[#00B7EB] px-4 py-1 text-sm font-semibold text-white">
            About Camz Cleaning
          </span>
          <h2 className="text-4xl font-bold leading-tight text-[#004A8C] md:text-5xl">
            A Local Cleaning Team Focused on Consistent Care
          </h2>
          <p className="leading-relaxed text-gray-600">
            Camz Cleaning plans services around the requested work, property or
            vehicle details and preferred appointment. Clear communication helps
            confirm the service scope before the appointment.
          </p>
          <p className="leading-relaxed text-gray-600">
            Explore our company approach, cleaning standards, service options
            and the areas we serve.
          </p>
          <Link
            href="/about-us/"
            className="inline-block rounded-lg bg-[#0089C4] px-8 py-3 font-bold text-white shadow-lg transition-colors hover:bg-[#0077AB]"
          >
            More About Camz Cleaning
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
