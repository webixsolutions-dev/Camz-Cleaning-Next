import AboutContent from "@/components/about/AboutContent";
import AboutHero from "@/components/about/AboutHero";
import AboutSection from "@/components/about/AboutSection";
import CallToAction from "@/components/about/CallToAction";
import StatsSection from "@/components/about/StatsSection";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "About Camz Cleaning | Our Team and Standards",
  description:
    "Learn about Camz Cleaning, our practical experience, service approach and commitment to dependable care for homes, businesses, vehicles and properties.",
  path: "/about-us/",
});

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <AboutHero />
      <AboutSection />
      <StatsSection />
      <AboutContent />
      <CallToAction />
    </main>
  );
}
