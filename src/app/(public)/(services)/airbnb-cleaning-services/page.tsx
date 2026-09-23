import React from "react";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import ServiceSidebar from "@/components/common/ServiceSidebar";
import AirbnbCleaningContent from "@/components/airbnb/AirbnbCleaningContent";
import AirbnbCTA from "@/components/airbnb/AirbnbCTA";
import CommonFAQ from "@/components/common/CommonFAQ";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AreasServed from "@/components/home/AreasServed";
import PageJsonLd from "@/components/seo/PageJsonLd";

const Page = () => {
  const airbnbFaqs = [
    {
      id: 1,
      question: "What is Airbnb cleaning?",
      answer:
        "Airbnb cleaning is cleaning performed between short-term rental stays to prepare a property for its next guests. It includes bedrooms, bathrooms, kitchens, living areas, floors, guest-use surfaces, garbage removal and other tasks included in the property's turnover checklist.",
    },
    {
      id: 2,
      question: "What is included in an Airbnb turnover clean?",
      answer:
        "A turnover clean includes cleaning guest areas, bathrooms and kitchens, vacuuming and mopping floors, removing waste, preparing beds and replacing towels or linens where those services are included in the agreed scope.",
    },
    {
      id: 3,
      question: "Do you clean Airbnb properties between guests?",
      answer:
        "Yes. Camz Cleaning provides short-term rental cleaning designed around guest turnover requirements, subject to availability and the property's cleaning scope.",
    },
    {
      id: 4,
      question: "Do you change Airbnb bed linens?",
      answer:
        "Bed linen replacement can be included where it is part of the agreed property cleaning requirements. Hosts should provide the required clean linens and instructions before service.",
    },
    {
      id: 5,
      question: "Do you provide towel replacement?",
      answer:
        "Towel replacement can be included as part of the agreed turnover checklist. Hosts should provide sufficient clean towels and communicate the property's preferred setup.",
    },
    {
      id: 6,
      question: "Do you clean Airbnb kitchens?",
      answer:
        "Yes. Airbnb kitchen cleaning includes counters, sinks, stovetops, appliance exteriors, dining surfaces, floors and other guest-use areas according to the property's cleaning checklist.",
    },
    {
      id: 7,
      question: "Do you clean Airbnb bathrooms?",
      answer:
        "Yes. Short-term rental bathroom cleaning includes toilets, sinks, showers, tubs, mirrors, fixtures, floors, waste removal and other accessible surfaces included in the service scope.",
    },
    {
      id: 8,
      question: "Can I create a custom cleaning checklist for my Airbnb?",
      answer:
        "Yes. Property-specific instructions can be provided so the cleaning scope reflects the layout, setup and requirements of your rental.",
    },
    {
      id: 9,
      question: "Can Airbnb cleaning be scheduled regularly?",
      answer:
        "Yes. Hosts and property managers can request recurring cleaning arrangements for properties that require regular turnover service, subject to scheduling availability.",
    },
    {
      id: 10,
      question: "Do you provide Airbnb cleaning in Downtown Calgary?",
      answer:
        "Yes. Downtown Calgary is included in Camz Cleaning's current Calgary service area, subject to property and scheduling availability.",
    },
    {
      id: 11,
      question: "Do you provide Airbnb cleaning in Airdrie?",
      answer:
        "Yes. Airdrie is currently included in Camz Cleaning's Airbnb and short-term rental cleaning service area, subject to availability.",
    },
    {
      id: 12,
      question: "Do you provide Airbnb cleaning in Chestermere?",
      answer:
        "Yes. Chestermere is currently included in Camz Cleaning's short-term rental cleaning service area, subject to availability and property requirements.",
    },
    {
      id: 13,
      question: "How much does Airbnb cleaning cost in Calgary?",
      answer:
        "The price depends on factors such as property size, bedrooms, bathrooms, condition, turnover requirements and additional cleaning tasks. Providing your property details allows Camz Cleaning to determine the appropriate cleaning scope and pricing.",
    },
    {
      id: 14,
      question: "Can you clean a rental property on the same day?",
      answer:
        "Same-day turnover depends on the property's location, cleaning requirements and available scheduling capacity. Contact Camz Cleaning with your check-out and next check-in times so availability can be confirmed.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <PageJsonLd path="/airbnb-cleaning-services/" />

      {/* Hero Header */}
      <CommonHeroSection
        backgroundImage="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80"
        title={
          <>
            Affordable Airbnb &amp; Short-Term Rental
            <br /> Cleaning Service in Calgary
          </>
        }
      />

      {/* Main 2-Column Section (Sidebar + Content) */}
      <section className="px-6 py-16 md:px-12 lg:px-24">
        <div className="container-custom mx-auto grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
          <aside className="lg:sticky lg:top-24 lg:col-span-1">
            <ServiceSidebar />
          </aside>
          <article className="lg:col-span-2">
            <AirbnbCleaningContent />
          </article>
        </div>
      </section>

      {/* Trust & Engagement Sections */}
      <AreasServed />
      <CommonFAQ faqs={airbnbFaqs} />
      <TestimonialsSection />
      <AirbnbCTA />
    </main>
  );
};

export default Page;
