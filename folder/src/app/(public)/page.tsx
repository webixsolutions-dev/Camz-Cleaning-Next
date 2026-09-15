import CommonFAQ from "@/components/common/CommonFAQ";
import AboutSection from "@/components/home/About";
import AreasServed from "@/components/home/AreasServed";
import FinalCTASection from "@/components/home/FinalCTASection";
import Hero from "@/components/home/Hero";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import RecentProjects from "@/components/home/RecentProjects";
import Services from "@/components/home/Services";
import VideoCTASection from "@/components/home/VideoCTASection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Affordable Cleaning Company in Calgary | Camz Cleaning",
  description:
    "Camz Cleaning provides reliable residential, commercial, vehicle and seasonal cleaning services in Calgary. Choose your service and book online.",
  path: "/",
});

export default function Home() {
  const homeFaqs = [
    {
      id: 1,
      question: "What cleaning services does Camz Cleaning offer?",
      answer:
        "Camz Cleaning provides residential, commercial, vehicle and seasonal property cleaning services.",
    },
    {
      id: 2,
      question: "Do you offer residential and commercial cleaning?",
      answer:
        "Yes. Camz Cleaning provides cleaning services for homes as well as commercial spaces, based on the requested scope and schedule.",
    },
    {
      id: 3,
      question: "Can I book one-time or recurring cleaning?",
      answer:
        "One-time and recurring cleaning options may be available depending on the service, requested schedule and team availability.",
    },
    {
      id: 4,
      question: "Do you offer move-in and move-out cleaning?",
      answer:
        "Yes. Move-in and move-out cleaning can be requested through the residential cleaning service, based on the property condition, access and required scope.",
    },
  ];

  return (
    <main className="bg-white">
      <PageJsonLd path="/" />
      <Hero />
      <Services />
      <AboutSection />
      <HowItWorksSection />
      <VideoCTASection />
      <RecentProjects />
      <AreasServed />
      <CommonFAQ faqs={homeFaqs} />
      <TestimonialsSection />
      <FinalCTASection />
    </main>
  );
}
