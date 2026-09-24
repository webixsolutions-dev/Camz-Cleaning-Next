import CommonFAQ from "@/components/common/CommonFAQ";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import Commercial from "@/components/services/Commercial";
import Property from "@/components/services/Property";
import Residential from "@/components/services/Residential";
import Vehicle from "@/components/services/Vehicle";
import FinalCTASection from "@/components/services/FinalCTASection";
import Services from "@/components/services/Services";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Our Professional Cleaning Services | Camz Cleaning",
  description:
    "Explore residential, commercial, vehicle and seasonal property cleaning services from Camz Cleaning and choose the right option for your needs.",
  path: "/services/",
});

export default function Page() {
  const faqs = [
    {
      id: 1,
      question: "Which cleaning service should I choose?",
      answer:
        "Choose residential cleaning for living spaces, commercial cleaning for workplaces and shared facilities, vehicle cleaning for mobile interior or exterior care, and seasonal property service for vacation rentals or weather-related property needs.",
    },
    {
      id: 2,
      question: "Can I request more than one cleaning service?",
      answer:
        "Yes. Submit the main service through the online booking system and include any related needs in the request details. Camz Cleaning will confirm whether the services can be combined or need separate appointments.",
    },
    {
      id: 3,
      question: "Are one-time and recurring appointments available?",
      answer:
        "Availability depends on the service. Residential and commercial cleaning may be arranged as one-time or recurring visits, while vehicle and seasonal work is scheduled according to the requested scope and conditions.",
    },
    {
      id: 4,
      question: "How do I book a service online?",
      answer:
        "Open the relevant service page or booking page, enter the location and service details, select a preferred appointment, and submit the request. Camz Cleaning confirms the final scope, availability and price.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/vehicle.webp"
        title={<>Our Cleaning Services</>}
      />

      <section className="px-6 pt-14 text-center md:px-12 lg:px-24">
        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-700">
          Choose from residential, commercial, vehicle and seasonal property
          cleaning. Each service page explains the available work, who it is
          for and how to book online.
        </p>
      </section>

      <Services />
      <Residential />
      <Commercial />
      <Vehicle />
      <Property />
      <CommonFAQ faqs={faqs} />
      <FinalCTASection />
    </main>
  );
}
