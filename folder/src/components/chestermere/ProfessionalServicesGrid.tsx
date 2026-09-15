"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const services = [
  {
    title: "Residential Cleaning in Chestermere",
    description:
      "Residential cleaning for homes, apartments and condos, including regular and deep cleaning. Move-in/move-out requests are handled within Residential Cleaning rather than as a separate service.",
    href: "/residential-cleaning-services/",
    dark: false,
  },
  {
    title: "Commercial Cleaning in Chestermere",
    description:
      "Commercial cleaning for offices, workplaces and shared facilities, with service planned around the property and preferred schedule.",
    href: "/commercial-cleaning-services/",
    dark: true,
  },
  {
    title: "Mobile Vehicle Cleaning in Chestermere",
    description:
      "Mobile interior and exterior vehicle cleaning at an agreed location, subject to weather, safe parking and appointment availability.",
    href: "/vehicle-cleaning-service/",
    dark: false,
  },
  {
    title: "Seasonal Property Services in Chestermere",
    description:
      "Seasonal property and vacation rental cleaning with one-time or recurring options based on the property, season and requested work.",
    href: "/seasonal-property-service/",
    dark: true,
  },
];

const ProfessionalServicesGrid = () => (
  <section className="bg-[#EFFAFC] px-6 py-20 md:px-12 lg:px-24">
    <div className="container-custom mx-auto">
      <div className="mx-auto mb-14 max-w-4xl text-center">
        <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-5xl">
          Cleaning Options for Chestermere Homes and Businesses
        </h2>
        <p className="mx-auto mt-6 max-w-3xl leading-relaxed text-gray-700">
          Choose from the same four core Camz Cleaning services: Residential,
          Commercial, Mobile Vehicle and Seasonal Property.
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

      <div className="mx-auto mt-14 max-w-3xl text-center">
        <h2 className="text-2xl font-extrabold text-[#0B4E9B] md:text-4xl">
          Flexible Cleaning for Chestermere Properties
        </h2>
        <p className="mt-4 leading-relaxed text-gray-700">
          Choose a one-time or recurring service based on the property, current condition and requested schedule. Camz Cleaning confirms availability and final scope after reviewing the booking.
        </p>
        <p className="mt-4 leading-relaxed text-gray-700">
          You can also explore our 
          <Link
            href="/calgary-cleaning-services/"
            className="font-bold text-[#0B4E9B] hover:underline"
          >
            Calgary cleaning services
          </Link>
          .
        </p>
      </div>
    </div>
  </section>
);

export default ProfessionalServicesGrid;
