import ChestermereCleaningServices from "@/components/chestermere/ChestermereCleaningServices";
import AreasServed from "@/components/chestermere/AreasServed";
import ProfessionalServicesGrid from "@/components/chestermere/ProfessionalServicesGrid";
import AreaCTA from "@/components/common/AreaCTA";
import CommonFAQ from "@/components/common/CommonFAQ";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Services in Chestermere | Homes & Businesses",
  description:
    "Book residential, commercial, vehicle and seasonal property cleaning in Chestermere. Choose your service and preferred appointment online.",
  path: "/chestermere-cleaning-services/",
});

export default function Page() {
  const faqData = [
    {
      id: 1,
      question: "What cleaning services are available in Chestermere?",
      answer:
        "Camz Cleaning offers residential, commercial, mobile vehicle and seasonal property cleaning in Chestermere, depending on the requested scope and appointment availability.",
    },
    {
      id: 2,
      question: "Can I book Chestermere cleaning online?",
      answer:
        "Yes. Choose the service, enter the Chestermere address and property or vehicle details, select a preferred appointment, and submit the request for confirmation.",
    },
    {
      id: 3,
      question: "Is deep cleaning available for homes in Chestermere?",
      answer:
        "Deep cleaning can be requested through the residential cleaning service for heavier build-up or more detailed work. Include the home condition and priority areas in the online booking details.",
    },
    {
      id: 4,
      question: "How much does a cleaning service cost in Chestermere?",
      answer:
        "The price depends on the service, property or vehicle size, condition, frequency, access and extra tasks. Camz Cleaning reviews the online request before confirming the quote.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/whole bathroom cleaning.webp"
        title={<>Professional Cleaning Services in Chestermere</>}
      />
      <ChestermereCleaningServices />
      <ProfessionalServicesGrid />
      <AreasServed />
      <CommonFAQ faqs={faqData} />
      <TestimonialsSection />
      <AreaCTA city="Chestermere" />
    </main>
  );
}