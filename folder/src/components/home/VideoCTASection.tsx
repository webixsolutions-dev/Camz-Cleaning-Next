"use client";
import React from "react";
import { motion } from "framer-motion";
import { Phone, Star } from "lucide-react";

const VideoCTASection = () => {
  return (
    <section
      className="relative overflow-hidden bg-cover bg-center px-6 py-20 text-white md:px-12 lg:px-24"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,74,140,0.9), rgba(0,74,140,0.85)), url('/video-bg.webp')`,
      }}
    >
      <div className="container-custom relative z-10 mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6 text-white"
        >
          <span className="inline-block rounded-full border border-cyan-400 px-4 py-1 text-sm font-medium text-cyan-400">
            Quality You Deserve
          </span>
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">
            Reliable Cleaning <br /> Delivered By Professionals
          </h2>
          <p className="max-w-lg text-lg text-blue-100">
            We provide reliable, detailed cleaning services ensuring spotless
            spaces, healthier environments, and complete customer satisfaction
            every time.
          </p>

          <div className="border-t border-white/20 pt-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex -space-x-3">
                {[
                  "/wp-admin/uploads/call-back-1.webp",
                  "/wp-admin/uploads/call-back-2.webp",
                  "/wp-admin/uploads/call-back-3.webp",
                ].map((src, index) => (
                  <div key={src} className="h-12 w-12 overflow-hidden rounded-full border-2 border-white bg-gray-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`client-${index + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-1 flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" />
                  ))}
                </div>
                <p className="text-lg font-bold">Rated 5 Out Of 5 By Our Clients</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 border-t border-white/20 pt-6">
            <a
              href="/contact-us"
              className="rounded-lg border-2 border-white px-8 py-3 font-bold text-white transition-all hover:bg-white hover:text-[#004A8C]"
            >
              Contact Us
            </a>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50">
                <Phone size={20} className="text-white" />
              </div>
              <div>
                <h6 className="text-lg font-semibold uppercase tracking-wider text-white">Call Us Anytime</h6>
                <a href="tel:+15878371977" className="text-xl font-extrabold text-white transition-colors hover:text-[#00B7EB]">
                  +1 587-837-1977
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="group relative"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-8 border-black/20 shadow-2xl">
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/OBluXZ-qpOM"
              title="Camz Cleaning Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="absolute -inset-4 -z-10 rounded-full bg-cyan-500/20 blur-3xl transition-all group-hover:bg-cyan-500/30" />
        </motion.div>
      </div>
    </section>
  );
};

export default VideoCTASection;
