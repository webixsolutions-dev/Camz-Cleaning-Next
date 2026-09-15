import CochraneCleaningServices from "@/components/cochrane/CochraneCleaningServices";
import AreasServed from "@/components/cochrane/AreasServed";
import ProfessionalServicesGrid from "@/components/cochrane/ProfessionalServicesGrid";
import AreaCTA from "@/components/common/AreaCTA";
import CommonFAQ from "@/components/common/CommonFAQ";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Services in Cochrane for Homes & Businesses",
  description:
    "Book residential, commercial, vehicle and seasonal property cleaning in Cochrane. Choose the service and preferred appointment online.",
  path: "/cochrane-cleaning-services/",
});

export default function Page() {
  const faqData = [
    {
      id: 1,
      question: "What cleaning services do you provide in Cochrane?",
      answer:
        "Camz Cleaning offers residential, commercial, mobile vehicle and seasonal property cleaning in Cochrane, subject to service scope and availability.",
    },
    {
      id: 2,
      question: "Can I schedule Cochrane cleaning online?",
      answer:
        "Yes. Select a service, add the Cochrane address and required details, choose a preferred appointment, and submit the request. The final scope, timing and price are confirmed after review.",
    },
    {
      id: 3,
      question: "Is move-in or move-out cleaning available in Cochrane?",
      answer:
        "Move-in and move-out cleaning is handled within the Residential Cleaning service rather than as a separate service page. Include the home size, condition, access details and move date when booking.",
    },
    {
      id: 4,
      question: "Do you offer recurring commercial cleaning in Cochrane?",
      answer:
        "Recurring commercial service may be available for offices and other properties Camz Cleaning genuinely serves. Frequency depends on the property, foot traffic, tasks and access.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/cleaned kitchen.webp"
        title={
          <>Professional Cleaning Services in Cochrane for Homes &amp; Businesses</>
        }
      />
      <CochraneCleaningServices />
      <ProfessionalServicesGrid />
      <AreasServed />
      <CommonFAQ faqs={faqData} />
      <TestimonialsSection />
      <AreaCTA city="Cochrane" />
    </main>
  );
}