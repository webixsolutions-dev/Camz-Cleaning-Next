import ContactHero from "@/components/contact/ContactHero";
import ContactSection from "@/components/contact/ContactSection";
import ContactQuoteForm from "@/components/contact/ContactQuoteForm";
import FAQSection from "@/components/contact/FaqSection";
import MapSection from "@/components/contact/MapSection";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Contact Camz Cleaning | Request a Cleaning Quote",
  description:
    "Contact Camz Cleaning with questions about residential, commercial, vehicle or seasonal property services, or use online booking to request an appointment.",
  path: "/contact-us/",
});

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <ContactHero />
      <ContactSection />
      <ContactQuoteForm />
      <FAQSection />
      <MapSection />
    </main>
  );
}
