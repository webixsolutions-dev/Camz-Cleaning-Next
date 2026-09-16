import AboutContent from "@/components/about/AboutContent";
import AboutHero from "@/components/about/AboutHero";
import AboutSection from "@/components/about/AboutSection";
import CallToAction from "@/components/about/CallToAction";
import StatsSection from "@/components/about/StatsSection";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "About Camz Cleaning | Our Team and Standards",
  description:
    "Learn about Camz Cleaning, our local journey, service approach and commitment to reliable, affordable and quality cleaning in Calgary and surrounding communities.",
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
