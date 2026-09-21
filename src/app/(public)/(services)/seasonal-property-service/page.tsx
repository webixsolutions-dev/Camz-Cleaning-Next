// import CommonFAQ from "@/components/common/CommonFAQ";
// import SeasonalCTA from "@/components/seasonal/SeasonalTA";
// import CommonHeroSection from "@/components/common/CommonHeroSection";
// import ServiceSidebar from "@/components/common/ServiceSidebar";
// import TestimonialsSection from "@/components/home/TestimonialsSection";
// import AreasServed from "@/components/home/AreasServed";
// import SeasonalPropertyContent from "@/components/seasonal/SeasonalPropertyContent";

// const Page = () => {
//   const seasonalFaqs = [
//     {
//       id: 1,
//       question: "What can be included in seasonal property cleaning?",
//       answer:
//         "The service may include indoor deep cleaning, ordinary debris removal, floor and window cleaning, outdoor cleanup, basic garden-area care, snow-related support and property preparation. The exact tasks depend on the season and agreed scope.",
//     },
//     {
//       id: 2,
//       question: "Do you offer vacation rental turnover cleaning?",
//       answer:
//         "Yes, subject to availability. Turnover cleaning may cover kitchens, bathrooms, bedrooms, living areas and floors. Linen changes, restocking and damage reporting should be requested separately so they can be confirmed.",
//     },
//     {
//       id: 3,
//       question:
//         "Can seasonal property service be booked once or on a recurring schedule?",
//       answer:
//         "Both one-time and recurring arrangements may be available. The schedule depends on the property, requested tasks, season, access and team availability.",
//     },
//     {
//       id: 4,
//       question: "How is seasonal property cleaning priced?",
//       answer:
//         "Pricing depends on the property size, condition, service type, access, season, frequency and requested outdoor or turnover tasks. Submit the details online for a tailored quote.",
//     },
//   ];

//   return (
//     <main className="min-h-screen bg-white">
//       <CommonHeroSection
//         backgroundImage="/wp-admin/uploads/residential-hero.webp"
//         title={
//           <>
//             Affordable Vacation Rentals and Seasonal
//             <br /> Property Cleaning &amp; Care Service in Calgary
//           </>
//         }
//       />
//       <section className="px-6 py-16 md:px-12 lg:px-24">
//         <div className="container-custom mx-auto grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
//           <aside className="lg:sticky lg:top-24 lg:col-span-1">
//             <ServiceSidebar />
//           </aside>
//           <article className="lg:col-span-2">
//             <SeasonalPropertyContent />
//           </article>
//         </div>
//       </section>
//       <AreasServed />
//       <CommonFAQ faqs={seasonalFaqs} />
//       <TestimonialsSection />
//       <SeasonalCTA />
//     </main>
//   );
// };

// export default Page;


import React from "react";
import CommonFAQ from "@/components/common/CommonFAQ";
import SeasonalCTA from "@/components/seasonal/SeasonalTA";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import ServiceSidebar from "@/components/common/ServiceSidebar";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AreasServed from "@/components/home/AreasServed";
import SeasonalPropertyContent from "@/components/seasonal/SeasonalPropertyContent";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Seasonal Property & Vacation Rental Cleaning Calgary | Camz Cleaning",
  description:
    "Year-round seasonal cleaning, spring/fall property prep, winter access care, and vacation rental turnover services across Calgary, Airdrie, Cochrane, and Chestermere.",
  path: "/seasonal-property-service/",
});

const Page = () => {
  const seasonalFaqs = [
    {
      id: 1,
      question: "What is seasonal property cleaning?",
      answer:
        "Seasonal property cleaning is cleaning and preparation performed when a property changes from one season or period of use to another. It can include interior cleaning, property cleanup, rental preparation and selected outdoor tasks according to the property's requirements.",
    },
    {
      id: 2,
      question: "When should I schedule seasonal cleaning?",
      answer:
        "The ideal timing depends on how and when the property is used. Many property owners schedule cleaning before a seasonal home is occupied, before guests arrive, after a period of vacancy or when preparing the property for a new season.",
    },
    {
      id: 3,
      question: "Do you clean homes that have been vacant?",
      answer:
        "Yes. Seasonal cleaning can be requested for properties that have been unused for a period of time. The cleaning scope and time required depend on the property's condition and the amount of accumulated dust or debris.",
    },
    {
      id: 4,
      question: "Do you provide spring cleaning for seasonal homes?",
      answer:
        "Yes. Spring cleaning can be arranged for seasonal properties and can include interior cleaning, floors, kitchens, bathrooms, bedrooms, living areas and other agreed tasks.",
    },
    {
      id: 5,
      question: "Do you provide winter property support?",
      answer:
        "Winter-related property support may be available for agreed tasks depending on weather, property access, equipment and team availability. The exact service should be confirmed before booking.",
    },
    {
      id: 6,
      question: "Do you provide yard or garden cleanup?",
      answer:
        "Selected yard and garden-area cleanup may be available when the requested work falls within Camz Cleaning's service scope. Specialized landscaping or maintenance work should be confirmed separately.",
    },
    {
      id: 7,
      question: "Can you prepare my vacation rental between guests?",
      answer:
        "Yes. Seasonal and vacation rental cleaning can include cleaning kitchens, bathrooms, bedrooms, living areas and floors between guest stays according to the property's turnover checklist.",
    },
    {
      id: 8,
      question: "Do you provide Airbnb turnover cleaning?",
      answer:
        "Yes. Camz Cleaning provides Airbnb and short-term rental cleaning as a dedicated service. The turnover scope can include guest-area cleaning, kitchen and bathroom cleaning, floor care, waste removal and other agreed tasks.",
    },
    {
      id: 9,
      question: "Can seasonal cleaning be scheduled regularly?",
      answer:
        "Yes. Recurring seasonal cleaning may be available when ongoing property maintenance is required. Frequency depends on the property, requested tasks and scheduling availability.",
    },
    {
      id: 10,
      question: "Do you clean seasonal properties in Calgary?",
      answer:
        "Yes. Camz Cleaning provides seasonal property cleaning throughout Calgary, including Downtown, Southeast, Northeast, Northwest and Southwest Calgary, subject to service availability.",
    },
    {
      id: 11,
      question: "Do you provide seasonal cleaning in Airdrie?",
      answer:
        "Yes. Airdrie is currently included in Camz Cleaning's seasonal property cleaning service area, subject to availability.",
    },
    {
      id: 12,
      question: "Do you provide seasonal cleaning in Chestermere?",
      answer:
        "Yes. Chestermere is currently included in Camz Cleaning's seasonal property cleaning service area, subject to availability and property requirements.",
    },
    {
      id: 13,
      question: "How much does seasonal property cleaning cost?",
      answer:
        "Pricing depends on the property size, condition, requested tasks, cleaning frequency, location and time required. A quote can be provided based on your specific property and cleaning requirements.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <PageJsonLd path="/seasonal-property-service/" />
      
      {/* Hero Header */}
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/residential-hero.webp"
        title={
          <>
            Affordable Vacation Rentals and Seasonal
            <br /> Property Cleaning &amp; Care Service in Calgary
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
            <SeasonalPropertyContent />
          </article>
        </div>
      </section>

      {/* Trust & Engagement Sections */}
      <AreasServed />
      <CommonFAQ faqs={seasonalFaqs} />
      <TestimonialsSection />
      <SeasonalCTA />
    </main>
  );
};

export default Page;
