"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Building2, CarFront, House, Snowflake } from "lucide-react";

const services = [
  {
    title: "Residential Cleaning Services",
    desc: "Regular, deep and move-in/move-out cleaning for homes, planned around your space, schedule and cleaning priorities.",
    highlighted: false,
    icon: House,
    url: "/residential-cleaning-services/",
    linkLabel: "View Residential Cleaning",
  },
  {
    title: "Commercial Cleaning Services",
    desc: "Cleaning for offices, workplaces and shared commercial spaces, with service tailored to the property and requested schedule.",
    highlighted: true,
    icon: Building2,
    url: "/commercial-cleaning-services/",
    linkLabel: "View Commercial Cleaning",
  },
  {
    title: "Vehicle Cleaning Services",
    desc: "Interior and exterior vehicle cleaning at a suitable agreed location, based on the selected package and vehicle condition.",
    highlighted: false,
    icon: CarFront,
    url: "/vehicle-cleaning-service/",
    linkLabel: "View Vehicle Cleaning",
  },
  {
    title: "Seasonal Property Services",
    desc: "Seasonal property and vacation rental cleaning based on the property, season, guest schedule and requested service scope.",
    highlighted: false,
    icon: Snowflake,
    url: "/seasonal-property-service/",
    linkLabel: "View Seasonal Property Service",
  },
];

export default function Services() {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-gray-50 py-12">
      <div className="container-custom mx-auto px-6 text-center">
        <span className="mb-4 inline-block rounded-full bg-[#02C0E6] px-4 py-1 text-sm text-white">
          Our Services
        </span>
        <h2 className="mb-4 text-3xl font-extrabold text-[#0B4E9B] md:text-4xl">
          Cleaning Services for Homes, Businesses and Vehicles
        </h2>
        <p className="mx-auto mb-12 max-w-2xl leading-relaxed text-gray-600">
          Choose the cleaning service that matches your space, schedule and
          priorities.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.title}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`flex h-full flex-col rounded-xl border p-6 text-left ${
                  service.highlighted
                    ? "border-transparent bg-[#0B4E9B] text-white"
                    : "border-[#0B4E9B] bg-white"
                }`}
              >
                <div
                  className={`mb-5 flex h-16 w-16 items-center justify-center rounded-xl ${
                    service.highlighted
                      ? "bg-white/15 text-white"
                      : "bg-[#EAF7FB] text-[#0B4E9B]"
                  }`}
                >
                  <Icon size={34} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h3
                  className={`mb-4 text-xl font-bold leading-tight ${
                    service.highlighted ? "text-white" : "text-[#0B4E9B]"
                  }`}
                >
                  {service.title}
                </h3>
                <p
                  className={`mb-6 flex-1 leading-7 ${
                    service.highlighted ? "text-white/90" : "text-gray-600"
                  }`}
                >
                  {service.desc}
                </p>
                <Link
                  href={service.url}
                  className={`inline-flex w-fit rounded-lg px-5 py-3 text-sm font-semibold transition-colors ${
                    service.highlighted
                      ? "border border-white text-white hover:bg-white hover:text-[#0B4E9B]"
                      : "bg-[#0077AB] text-white hover:bg-[#0B4E9B]"
                  }`}
                >
                  {service.linkLabel}
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
