import CommonFAQ from "@/components/common/CommonFAQ";
import VehicleCTA from "@/components/vehicle/VehicleCTA";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import ServiceSidebar from "@/components/common/ServiceSidebar";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AreasServed from "@/components/home/AreasServed";
import VehicleCleaningContent from "@/components/vehicle/VehicleCleaningContent";

const Page = () => {
  const vehicleFaqs = [
    {
      id: 1,
      question: "Do you provide mobile car detailing in Calgary?",
      answer:
        "Yes. Camz Cleaning can provide mobile vehicle cleaning at a home or other agreed location, subject to service-area coverage, weather, safe parking and appointment availability.",
    },
    {
      id: 2,
      question: "What is included in a vehicle cleaning service?",
      answer:
        "Depending on the selected package, service may include the exterior, wheels, tires, interior vacuuming, dashboard and console, windows, mirrors, mats, seats and carpets. The exact scope is confirmed before service.",
    },
    {
      id: 3,
      question: "How much does mobile vehicle cleaning cost?",
      answer:
        "Pricing depends on vehicle size, current condition, selected package and additional work such as heavy stains, odours or pet hair. Provide accurate details or photos during booking when requested.",
    },
    {
      id: 4,
      question: "How long does vehicle cleaning take?",
      answer:
        "The time required varies by vehicle size, condition and package. A light maintenance clean takes less time than detailed interior and exterior work. Camz Cleaning confirms the expected duration after reviewing the request.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/help-bg.webp"
        title={<>Affordable Vehicle Cleaning Services | Car Interior and Exterior Detailing in Calgary</>}
      />
      <section className="px-6 py-16 md:px-12 lg:px-24">
        <div className="container-custom mx-auto grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
          <aside className="lg:sticky lg:top-24 lg:col-span-1">
            <ServiceSidebar />
          </aside>
          <article className="lg:col-span-2">
            <VehicleCleaningContent />
          </article>
        </div>
      </section>
      <AreasServed />
      <CommonFAQ faqs={vehicleFaqs} />
      <TestimonialsSection />
      <VehicleCTA />
    </main>
  );
};

export default Page;
