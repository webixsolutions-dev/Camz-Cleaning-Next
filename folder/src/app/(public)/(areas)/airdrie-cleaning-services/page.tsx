import AirdrieCleaningServices from "@/components/airdrie/AirdrieCleaningServices";
import AreasServed from "@/components/airdrie/AreaServed";
import ProfessionalServicesGrid from "@/components/airdrie/ProfessionalServicesGrid";
import AreaCTA from "@/components/common/AreaCTA";
import CommonFAQ from "@/components/common/CommonFAQ";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Services in Airdrie for Homes & Businesses",
  description:
    "Book residential, commercial, vehicle and seasonal property cleaning services in Airdrie. Choose your service and preferred appointment online.",
  path: "/airdrie-cleaning-services/",
});

export default function Page() {
  const faqData = [
    {
      id: 1,
      question: "What cleaning services are available in Airdrie?",
      answer:
        "Camz Cleaning offers residential, commercial, mobile vehicle and seasonal property cleaning in Airdrie, subject to service scope and appointment availability.",
    },
    {
      id: 2,
      question: "Can I book a cleaning appointment in Airdrie online?",
      answer:
        "Yes. Choose the service, enter the Airdrie address and relevant property or vehicle details, select a preferred date and time, and submit the booking request for confirmation.",
    },
    {
      id: 3,
      question:
        "Do you offer recurring residential or commercial cleaning in Airdrie?",
      answer:
        "Recurring service may be available based on the property, required tasks, frequency and schedule. Camz Cleaning confirms the proposed plan after reviewing the request.",
    },
    {
      id: 4,
      question: "How is cleaning priced in Airdrie?",
      answer:
        "Pricing depends on the selected service, size, condition, frequency, access and extra tasks. Provide complete details online so the scope and quote can be reviewed accurately.",
    },
  ];

  return (
    <main className="min-h-screen bg-white">
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/Room cleaning.webp"
        title={<>Trusted Cleaning Services in Airdrie</>}
      />

      <AirdrieCleaningServices />
      <ProfessionalServicesGrid />
      <AreasServed />
      <CommonFAQ faqs={faqData} />
      <TestimonialsSection />
      <AreaCTA city="Airdrie" />
    </main>
  );
}