"use client";

import Link from "next/link";
import { Building2, CalendarClock, Car, Home } from "lucide-react";

const services = [
  {
    title: "Residential Cleaning",
    description:
      "Cleaning for living spaces, including regular, deep and move-in/move-out needs based on the requested scope.",
    icon: Home,
    dark: false,
    href: "/residential-cleaning-services/",
    linkLabel: "View Residential Cleaning",
  },
  {
    title: "Commercial Cleaning",
    description:
      "Cleaning for workplaces and shared facilities, with the service scope planned around the property and schedule.",
    icon: Building2,
    dark: true,
    href: "/commercial-cleaning-services/",
    linkLabel: "View Commercial Cleaning",
  },
  {
    title: "Vehicle Cleaning",
    description:
      "Mobile interior and exterior vehicle cleaning based on the selected package, vehicle condition and agreed location.",
    icon: Car,
    dark: false,
    href: "/vehicle-cleaning-service/",
    linkLabel: "View Vehicle Cleaning",
  },
  {
    title: "Seasonal Property Service",
    description:
      "Cleaning and property-care services for seasonal homes, vacation rentals and weather-related property needs.",
    icon: CalendarClock,
    dark: true,
    href: "/seasonal-property-service/",
    linkLabel: "View Seasonal Property Service",
  },
];

const Services = () => {
  return (
    <section className="bg-white px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold text-[#0B4E9B] md:text-5xl">
            Choose Your Cleaning Service
          </h2>
          <p className="mt-5 leading-relaxed text-gray-600">
            Review the four core service categories and open the page that best
            matches your cleaning needs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.title}
                className={`flex h-full flex-col rounded-3xl border p-8 shadow-sm ${
                  service.dark
                    ? "border-[#0B4E9B] bg-[#0B4E9B] text-white"
                    : "border-[#0B4E9B]/20 bg-white text-[#0B4E9B]"
                }`}
              >
                <Icon size={46} strokeWidth={1.7} aria-hidden="true" />
                <h3 className="mt-5 text-2xl font-extrabold">{service.title}</h3>
                <p
                  className={`mt-4 flex-1 leading-relaxed ${
                    service.dark ? "text-blue-50" : "text-gray-600"
                  }`}
                >
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className={`mt-7 inline-flex w-fit rounded-lg px-6 py-3 font-bold transition-colors ${
                    service.dark
                      ? "border border-white text-white hover:bg-white hover:text-[#0B4E9B]"
                      : "bg-[#0091C1] text-white hover:bg-[#0B4E9B]"
                  }`}
                >
                  {service.linkLabel}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
