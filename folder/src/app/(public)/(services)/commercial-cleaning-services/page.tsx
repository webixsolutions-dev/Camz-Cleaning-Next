import CommercialHero from "@/components/commercial/commercialHero";
import CommercialCTA from "@/components/commercial/CommercialCTA";
import CommercialCleaningContent from "@/components/commercial/CommercialCleaningContent";
import CommonFAQ from "@/components/common/CommonFAQ";
import ServiceSidebar from "@/components/common/ServiceSidebar";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AreasServed from "@/components/home/AreasServed";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Commercial Cleaning & Janitorial Services in Calgary",
  description:
    "Commercial cleaning services for Calgary offices, shops, shared facilities and post-construction spaces. Request a tailored plan and book online.",
  path: "/commercial-cleaning-services/",
});

const Page = () => {
  const commercialFaqs = [
    {
      id: 1,
      question: "What is included in a commercial cleaning service?",
      answer:
        "A commercial visit may cover workstations, reception areas, meeting rooms, restrooms, staff kitchens, floors, waste removal and high-touch surfaces. Camz Cleaning confirms the exact checklist before service.",
    },
    {
      id: 2,
      question: "How often should a commercial property be cleaned?",
      answer:
        "The right frequency depends on the property size, foot traffic, working hours and hygiene needs. Busy offices and shared facilities may need several visits per week, while smaller spaces may need weekly service.",
    },
    {
      id: 3,
      question: "Can commercial cleaning be arranged around business hours?",
      answer:
        "Yes, preferred times can be requested during online booking. Before-hours, during-hours or after-hours service depends on team availability, safe access and the agreed scope.",
    },
    {
      id: 4,
      question: "How much does commercial cleaning cost in Calgary?",
      answer:
        "Pricing depends on the property size, layout, number of washrooms, flooring, service frequency, current condition and special tasks. Submit the details online for a tailored quote.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <CommercialHero />
      <section className="px-6 py-16 md:px-12 lg:px-24">
        <div className="container-custom mx-auto grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
          <aside className="lg:sticky lg:top-24 lg:col-span-1">
            <ServiceSidebar />
          </aside>
          <article className="lg:col-span-2">
            <CommercialCleaningContent />
          </article>
        </div>
      </section>
      <AreasServed />
      <CommonFAQ faqs={commercialFaqs} />
      <TestimonialsSection />
      <CommercialCTA />
    </main>
  );
};

export default Page;
