"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Caleb Campbell",
    initial: "C",
    time: "2 months ago",
    text: "Camz Cleaning provided excellent service. The team was professional, punctual, and left everything perfectly clean.",
  },
  {
    name: "Caleb Campbell",
    initial: "C",
    time: "2 months ago",
    text: "Camz Cleaning did a fantastic job. The house looked spotless and fresh after their service.",
  },
  {
    name: "k sandhu",
    initial: "k",
    time: "2 months ago",
    text: "Wonderful job done!",
  },
  {
    name: "Victor Lefebvre",
    initial: "V",
    time: "2 months ago",
    text: "Professional cleaning service with outstanding results.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
     
    {/* Background Image */}
<div className="absolute inset-0 z-0">
  <Image
    src="/wp-admin/uploads/testimonial-bg.webp"
    alt="Background"
    fill
    priority
    className="object-cover"
  />
</div>
<div className="absolute inset-0 bg-white/80 z-[1]" />

      <div className="container-custom relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="bg-[#00B7EB] text-white px-5 py-1.5 rounded-full text-xs font-bold uppercase mb-6 inline-block">
            What Our Clients Say
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#004A8C] mb-6">
            Our Satisfied Client Feedback
          </h2>
          <p className="text-gray-700 max-w-4xl mx-auto text-lg font-medium leading-relaxed">
            Hear directly from our satisfied clients who trust Camz Cleaning for reliable service, 
            exceptional results, and consistent professionalism in every residential and commercial project we complete.
          </p>
        </div>

        {/* Testimonials Slider Area */}
        <div className="relative group">
          {/* Navigation Arrows */}
          {/* <button className="absolute left-[-20px] md:left-[-50px] top-1/2 -translate-y-1/2 z-20 p-2 text-gray-400 hover:text-[#004A8C] transition-colors">
            <ChevronLeft size={32} />
          </button>
          <button className="absolute right-[-20px] md:right-[-50px] top-1/2 -translate-y-1/2 z-20 p-2 text-gray-400 hover:text-[#004A8C] transition-colors">
            <ChevronRight size={32} />
          </button> */}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col h-full"
              >
                {/* Header: User Info & Google Logo */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#455A64] text-white flex items-center justify-center font-bold text-lg uppercase">
                      {review.initial}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                      <p className="text-[10px] text-gray-400">{review.time}</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 relative">
                    <Image src="/google.svg" alt="Google" width={20} height={20} />
                  </div>
                </div>

                {/* Stars & Verified Badge */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex text-[#F4B400]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <div className="ml-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-current">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                </div>

                {/* Feedback Text */}
                <p className="text-gray-600 text-sm leading-relaxed flex-grow">
                  {review.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;