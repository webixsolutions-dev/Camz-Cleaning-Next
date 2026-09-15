import AreasServed from "@/components/calgary/AreasServed";
import CalgaryCleaningServices from "@/components/calgary/CalgaryCleaningServices";
import CalgaryMainContent from "@/components/calgary/CalgaryMainContent";
import ProfessionalServicesGrid from "@/components/calgary/ProfessionalServicesGrid";
import AreaCTA from "@/components/common/AreaCTA";
import CommonFAQ from "@/components/common/CommonFAQ";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Services in Calgary | Home & Office Cleaners",
  description:
    "Book professional cleaning services in Calgary for homes, offices, vehicles and seasonal properties. Choose your service and preferred appointment online.",
  path: "/calgary-cleaning-services/",
});

export default function Page() {
  const faqData = [
    {
      id: 1,
      question: "What cleaning services are available in Calgary?",
      answer:
        "Camz Cleaning offers residential, commercial, mobile vehicle and seasonal property cleaning in Calgary. Residential service can include regular, deep and move-in/move-out cleaning.",
    },
    {
      id: 2,
      question: "Can I book a Calgary cleaning appointment online?",
      answer:
        "Yes. Select the service, provide the Calgary address and property or vehicle details, choose a preferred date and time, and submit the request. Camz Cleaning confirms the appointment after reviewing availability and scope.",
    },
    {
      id: 3,
      question: "How much do cleaning services cost in Calgary?",
      answer:
        "Pricing depends on the service, property or vehicle size, condition, frequency and extra tasks. Use the online booking system to provide accurate details so the final scope and price can be confirmed.",
    },
    {
      id: 4,
      question: "Do you provide recurring cleaning in Calgary?",
      answer:
        "Recurring residential or commercial cleaning may be available weekly or on another agreed schedule. Frequency and appointment times depend on the service requirements and team availability.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/floor cleaning.webp"
        title={<>Professional Cleaning Services in Calgary</>}
      />

      <CalgaryMainContent />
      <ProfessionalServicesGrid />
      <AreasServed />
      <CalgaryCleaningServices />
      <CommonFAQ faqs={faqData} />
      <TestimonialsSection />
      <AreaCTA city="Calgary" />
    </main>
  );
}