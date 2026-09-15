import CommonFAQ from "@/components/common/CommonFAQ";
import ResidentialCTA from "@/components/residential/ResidentialCTA";
import ServiceSidebar from "@/components/common/ServiceSidebar";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import AreasServed from "@/components/home/AreasServed";
import ResidentialCleaningContent from "@/components/residential/ResidentialCleaningContent";
import ResidentialHero from "@/components/residential/ResidentialHero";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Residential & House Cleaning Services in Calgary",
  description:
    "Residential cleaning in Calgary for regular, deep and move-in/move-out needs. Choose your service, preferred schedule and book online.",
  path: "/residential-cleaning-services/",
});

const Page = () => {
  const residentialFaqs = [
    {
      id: 1,
      question: "What is included in a residential cleaning service?",
      answer:
        "A residential visit may include kitchens, bathrooms, bedrooms and living areas, with dusting, surface cleaning, sanitizing, vacuuming and mopping. Extras are confirmed before the appointment.",
    },
    {
      id: 2,
      question: "What is the difference between regular and deep cleaning?",
      answer:
        "Regular cleaning focuses on routine upkeep. Deep cleaning is for heavier build-up and more detailed tasks, such as additional attention to cabinets, appliances, edges and less frequently cleaned surfaces.",
    },
    {
      id: 3,
      question: "How much does house cleaning cost in Calgary?",
      answer:
        "The cost depends on the home size, current condition, selected service, cleaning frequency and extra tasks. Enter the details in the online booking system so the scope and price can be confirmed.",
    },
    {
      id: 4,
      question: "How should I prepare my home for the cleaning appointment?",
      answer:
        "You do not need to clean first. Remove excess clutter where possible, secure valuables, provide access and parking details, and mention pets, sensitive surfaces or product preferences during booking.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <ResidentialHero />
      <section className="px-6 py-16 md:px-12 lg:px-24">
        <div className="container-custom mx-auto grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
          <aside className="lg:sticky lg:top-24 lg:col-span-1">
            <ServiceSidebar />
          </aside>
          <article className="lg:col-span-2">
            <ResidentialCleaningContent />
          </article>
        </div>
      </section>
      <AreasServed />
      <CommonFAQ faqs={residentialFaqs} />
      <TestimonialsSection />
      <ResidentialCTA />
    </main>
  );
};

export default Page;
