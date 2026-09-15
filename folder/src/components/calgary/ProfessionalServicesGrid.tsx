"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const services = [
  {
    title: "Residential Cleaning in Calgary",
    description:
      "Regular and deep cleaning for homes and apartments. Move-in/move-out requests are handled within Residential Cleaning rather than as a separate service.",
    href: "/residential-cleaning-services/",
    dark: false,
  },
  {
    title: "Commercial Cleaning in Calgary",
    description: "Cleaning plans for offices, shops and shared facilities.",
    href: "/commercial-cleaning-services/",
    dark: true,
  },
  {
    title: "Mobile Vehicle Cleaning in Calgary",
    description:
      "Interior and exterior vehicle cleaning at a suitable agreed location.",
    href: "/vehicle-cleaning-service/",
    dark: false,
  },
  {
    title: "Seasonal Property Services in Calgary",
    description:
      "Seasonal home, vacation-rental and weather-related property care.",
    href: "/seasonal-property-service/",
    dark: true,
  },
];

const ProfessionalServicesGrid = () => (
  <section className="bg-[#EFFAFC] px-6 py-20 md:px-12 lg:px-24">
    <div className="container-custom mx-auto">
      <div className="mx-auto mb-14 max-w-4xl text-center">
        <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-5xl">
          Cleaning Options for Calgary Homes, Businesses and Vehicles
        </h2>
        <p className="mx-auto mt-6 max-w-3xl leading-relaxed text-gray-700">
          Camz Cleaning uses the same four core service groups throughout the
          website: Residential, Commercial, Mobile Vehicle and Seasonal
          Property.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {services.map((service) => (
          <motion.article
            key={service.title}
            whileHover={{ y: -5 }}
            className={`flex h-full flex-col rounded-3xl p-8 shadow-lg ${
              service.dark
                ? "bg-[#0B4E9B] text-white"
                : "border border-gray-100 bg-white text-[#0B4E9B]"
            }`}
          >
            <h3 className="text-2xl font-extrabold">{service.title}</h3>
            <p
              className={`mt-4 flex-1 leading-relaxed ${
                service.dark ? "text-blue-50" : "text-gray-600"
              }`}
            >
              {service.description}
            </p>
            <Link
              href={service.href}
              className={`mt-7 inline-block w-fit rounded-lg px-6 py-3 font-bold ${
                service.dark
                  ? "border border-white text-white hover:bg-white hover:text-[#0B4E9B]"
                  : "bg-[#0091C1] text-white hover:bg-[#0B4E9B]"
              }`}
            >
              View Service
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default ProfessionalServicesGrid;
