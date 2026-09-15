"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

const projects = [
  {
    category: "Residential Cleaning",
    title: "Complete Home Care Solutions",
    description: "Experience spotless, hygienic homes with our complete cleaning solutions. From deep bathroom and kitchen cleaning to carpets, upholstery, and vents, we make every corner shine effortlessly.",
    image: "/wp-admin/uploads/stairs cleaning.webp",
    url: "/gallery",
  },
  {
    category: "Commercial Cleaning",
    title: "Reliable Corporate Maintenance",
    description: "Keep your business and restaurant spotless with our reliable commercial cleaning services. From offices to kitchens, we provide tailored, professional solutions for every commercial space.",
    image: "/wp-admin/uploads/residential-bg.webp",
    url: "/gallery",
  },
  {
    category: "Vehicle Cleaning",
    title: "Complete Car Care Service",
    description: "Transform your car inside and out with our Complete Car Care Service from deep interior vacuuming, car seat & carpet cleaning, to full exterior detailing for a spotless, showroom shine",
    image: "/wp-admin/uploads/p3.webp",
    url: "/gallery",
  },
  {
    category: "Seasonal Property",
    title: "Complete Seasonal Property Care",
    description: "Make every season stress-free with CamzCleaning's Seasonal Property Services. From snow removal to lawn care, we keep your home safe, clean, and perfectly maintained all year long.",
    image: "/wp-admin/uploads/p4.webp",
    url: "/gallery",
  },
];

const RecentProjects = () => {
  return (
    <section className="bg-white px-6 py-20 md:px-12 lg:px-24">
      <div className="container-custom mx-auto">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="mb-4 inline-block rounded-full bg-[#00B7EB] px-4 py-1 text-sm font-semibold text-white">
              How It Works
            </span>
            <h2 className="mb-4 text-4xl font-bold text-[#004A8C] md:text-5xl">Our Recent Project</h2>
            <p className="leading-relaxed text-gray-600">
              Take a look at our recent cleaning projects showcasing detailed workmanship,
              professional standards, and spotless results delivered for residential and commercial clients.
            </p>
          </div>
          <div className="max-w-md">
            <p className="border-l-4 border-[#00B7EB] pl-4 text-sm text-gray-600 md:text-base">
              We proudly showcase completed cleaning projects highlighting our attention to detail,
              professional standards, and consistently impressive results for every client.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl sm:flex-row"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden p-4 sm:aspect-auto sm:w-2/5">
                <div className="relative h-full w-full overflow-hidden rounded-2xl">
                  <Image src={project.image} alt={project.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
              </div>
              <div className="flex w-full flex-col justify-center p-6 sm:w-3/5">
                <span className="mb-3 w-fit rounded-full bg-[#00B7EB] px-3 py-1 text-[10px] font-bold uppercase text-white">
                  {project.category}
                </span>
                <h3 className="mb-3 text-xl font-bold leading-tight text-[#004A8C] md:text-2xl">{project.title}</h3>
                <p className="mb-4 line-clamp-4 text-sm text-gray-500">{project.description}</p>
                <Link href={project.url} className="flex items-center gap-1 text-sm font-extrabold uppercase tracking-wider text-[#004A8C] transition-colors hover:text-[#00B7EB]">
                  Learn More...
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentProjects;
