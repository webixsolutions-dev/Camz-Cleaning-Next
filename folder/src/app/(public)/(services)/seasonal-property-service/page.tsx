import CommonFAQ from "@/components/common/CommonFAQ";
import SeasonalCTA from "@/components/seasonal/SeasonalTA";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import ServiceSidebar from "@/components/common/ServiceSidebar";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AreasServed from "@/components/home/AreasServed";
import SeasonalPropertyContent from "@/components/seasonal/SeasonalPropertyContent";

const Page = () => {
  const seasonalFaqs = [
    {
      id: 1,
      question: "What can be included in seasonal property cleaning?",
      answer:
        "The service may include indoor deep cleaning, ordinary debris removal, floor and window cleaning, outdoor cleanup, basic garden-area care, snow-related support and property preparation. The exact tasks depend on the season and agreed scope.",
    },
    {
      id: 2,
      question: "Do you offer vacation rental turnover cleaning?",
      answer:
        "Yes, subject to availability. Turnover cleaning may cover kitchens, bathrooms, bedrooms, living areas and floors. Linen changes, restocking and damage reporting should be requested separately so they can be confirmed.",
    },
    {
      id: 3,
      question:
        "Can seasonal property service be booked once or on a recurring schedule?",
      answer:
        "Both one-time and recurring arrangements may be available. The schedule depends on the property, requested tasks, season, access and team availability.",
    },
    {
      id: 4,
      question: "How is seasonal property cleaning priced?",
      answer:
        "Pricing depends on the property size, condition, service type, access, season, frequency and requested outdoor or turnover tasks. Submit the details online for a tailored quote.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/residential-hero.webp"
        title={
          <>
            Affordable Vacation Rentals and Seasonal
            <br /> Property Cleaning &amp; Care Service in Calgary
          </>
        }
      />
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
      <AreasServed />
      <CommonFAQ faqs={seasonalFaqs} />
      <TestimonialsSection />
      <SeasonalCTA />
    </main>
  );
};

export default Page;
