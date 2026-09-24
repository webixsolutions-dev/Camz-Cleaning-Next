import CommonHeroSection from "@/components/common/CommonHeroSection";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Privacy Policy | Camz Cleaning",
  description: "Read the Camz Cleaning privacy policy for website visitors, service requests, bookings and customer information handling.",
  path: "/privacy-policy/",
});

type PolicySection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

const policySections: PolicySection[] = [
  {
    title: "1. Information We Collect",
    paragraphs: [
      "We may collect personal information when you contact us, request a quotation, book a service, fill out a form, call us, email us, or interact with our website.",
      "The information we may collect includes:",
    ],
    items: [
      "Full name",
      "Email address",
      "Phone number",
      "Service address or location",
      "Preferred cleaning service",
      "Booking date and time",
      "Property details related to the requested cleaning service",
      "Messages, instructions, or notes submitted through our forms",
      "Website usage information such as browser type, device type, pages visited, referral source, and general location data",
      "Property type, number of rooms or bathrooms, square footage, cleaning frequency, parking instructions, access instructions, pets in the property, and any special cleaning notes you provide",
    ],
  },
  {
    title: "2. How We Use Your Information",
    paragraphs: [
      "Camz Cleaning may use your personal information for the following purposes:",
    ],
    items: [
      "To respond to your questions or service requests",
      "To provide cleaning quotes and booking confirmations",
      "To schedule residential, commercial, vehicle, seasonal, or move-in/move-out cleaning services",
      "To contact you about your appointment or service details",
      "To share necessary service information with our cleaning team",
      "To improve our website, customer service, and business operations",
      "To send important service-related updates",
      "To process payments or invoices, where applicable",
      "To maintain customer records",
      "To comply with legal, tax, accounting, or regulatory requirements",
      "We do not sell your personal information.",
    ],
  },
  {
    title: "3. Consent",
    paragraphs: [
      "When you provide your personal information to Camz Cleaning, you consent to us collecting, using, and storing that information for the purposes described in this Privacy Policy.",
      "You may withdraw your consent at any time by contacting us. However, withdrawing consent may affect our ability to provide certain services, respond to your inquiries, or complete your booking.",
    ],
  },
  {
    title: "4. Booking Forms and Service Requests",
    paragraphs: [
      "When you submit a booking request, quote request, or contact form on our website, we use the information you provide to understand your cleaning needs and contact you with service details.",
      "This may include information about your property, cleaning requirements, preferred schedule, access instructions, parking details, and other service-related notes. Please avoid submitting sensitive personal information that is not required for the cleaning service.",
    ],
  },
  {
    title: "5. Service Address and Cleaning Instructions",
    paragraphs: [
      "Because cleaning services are delivered at customer homes, offices, vehicles, or other properties, we may need to collect and use service location details and cleaning instructions.",
      "This may include your address, unit number, entry instructions, alarm or access notes, parking instructions, pet information, areas to clean, areas to avoid, or special requests related to the booked cleaning service. We use this information only to plan, manage, and complete the service.",
    ],
  },
  {
    title: "6. Payment Information",
    paragraphs: [
      "If payment is required for a cleaning service, your payment may be processed through a third-party payment provider. Camz Cleaning does not intentionally store full credit card or banking details on its website unless specifically required for business or legal purposes.",
      "Third-party payment providers may have their own privacy policies and security practices. We recommend reviewing their privacy terms when making a payment.",
    ],
  },
  {
    title: "7. Cookies and Website Tracking",
    paragraphs: [
      "Our website may use cookies or similar tracking technologies to improve website performance, understand visitor activity, and enhance user experience.",
      "Cookies may help us understand:",
    ],
    items: [
      "Which pages users visit",
      "How visitors interact with our website",
      "What devices and browsers are being used",
      "How users find our website",
      "You can disable cookies through your browser settings, but some parts of the website may not function properly if cookies are turned off.",
    ],
  },
  {
    title: "8. Third-Party Tools and Service Providers",
    paragraphs: [
      "We may use third-party tools to manage online booking, quote requests, website forms, analytics, hosting, email communication, payment processing, spam protection, customer support, or business administration.",
      "These third-party providers may process limited information only as needed to support our business operations. Camz Cleaning is not responsible for the privacy practices of third-party websites or platforms, and we recommend reviewing their privacy policies where applicable.",
    ],
  },
  {
    title: "9. Sharing Your Information",
    paragraphs: [
      "Camz Cleaning may share limited personal information only when necessary to operate our business or provide services.",
      "We may share information with:",
    ],
    items: [
      "Camz Cleaning team members or service staff",
      "Booking or scheduling platforms",
      "Payment processors",
      "Website hosting or maintenance providers",
      "Email, phone, or communication service providers",
      "Accounting, legal, or administrative support providers",
      "Government or legal authorities when required by law",
      "We may share necessary service details with Camz Cleaning team members only when needed to complete your booked cleaning service. This may include your name, phone number, service address, access instructions, and cleaning requirements.",
      "We only share information that is reasonably necessary for the specific purpose.",
    ],
  },
  {
    title: "10. Marketing Communications",
    paragraphs: [
      "If you choose to receive updates, promotions, or offers from Camz Cleaning, we may contact you by email, phone, SMS, or other electronic communication methods.",
      "If we send promotional emails or messages, you may unsubscribe at any time by using the unsubscribe option in the message or by contacting us directly.",
    ],
  },
  {
    title: "11. How We Protect Your Information",
    paragraphs: [
      "We take reasonable steps to protect your personal information from unauthorized access, misuse, loss, disclosure, alteration, or destruction.",
      "These steps may include:",
    ],
    items: [
      "Secure website and hosting practices",
      "Limited access to customer information",
      "Use of trusted third-party service providers",
      "Administrative and technical safeguards",
      "Regular review of website forms and data handling processes",
      "However, no online system can be guaranteed to be completely secure. We encourage users to avoid sending highly sensitive information through website forms or email.",
    ],
  },
  {
    title: "12. How Long We Keep Your Information",
    paragraphs: [
      "We keep personal information only as long as necessary for the purposes described in this Privacy Policy, including customer service, booking records, business administration, legal compliance, tax records, and dispute resolution.",
      "When personal information is no longer required, we will take reasonable steps to delete, anonymize, or securely store it according to applicable requirements.",
    ],
  },
  {
    title: "13. Accessing or Updating Your Information",
    paragraphs: [
      "You may contact Camz Cleaning to request access to the personal information we hold about you. You may also ask us to correct, update, or delete your personal information where applicable.",
      "We may need to verify your identity before processing your request.",
    ],
  },
  {
    title: "14. Third-Party Links",
    paragraphs: [
      "Our website may contain links to third-party websites, booking tools, social media platforms, review platforms, or payment services.",
      "Camz Cleaning is not responsible for the privacy practices, content, or security of third-party websites. We recommend reviewing the privacy policies of any third-party websites you visit.",
    ],
  },
  {
    title: "15. Children's Privacy",
    paragraphs: [
      "Our website and services are intended for adults, property owners, tenants, businesses, or individuals booking cleaning services. We do not knowingly collect personal information from children.",
      "If we become aware that personal information from a child has been submitted without appropriate consent, we will take reasonable steps to delete it.",
    ],
  },
  {
    title: "16. Changes to This Privacy Policy",
    paragraphs: [
      "Camz Cleaning may update this Privacy Policy from time to time to reflect changes in our services, website, legal requirements, or business practices.",
      'Any updates will be posted on this page with a revised "Last Updated" date. We encourage visitors to review this page regularly.',
    ],
  },
];

const contactDetails = [
  "Website: camzcleaning.com",
  "Email: info@camzcleaning.com",
  "Phone: +1 587-837-1977",
  "Location: Calgary, AB, Canada",
  "Service Area: Calgary, Airdrie, Cochrane, Chestermere, and nearby areas",
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white">
      <PageJsonLd path="/privacy-policy/" />
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/blog-bg.webp"
        title="Privacy Policy"
      />

      <section className="container-custom py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 rounded-md border border-[#D9E8F6] bg-[#F5FBFF] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#02A8D0]">
              Camz Cleaning
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-[#16497D] md:text-4xl">
              Privacy Policy
            </h2>
            <p className="mt-3 text-sm font-medium text-[#46627D]">
              Last Updated: 19 June, 2026
            </p>
          </div>

          <div className="space-y-5 text-[#334155]">
            <p>
              At Camz Cleaning, we respect your privacy and are committed to
              protecting the personal information you share with us. This
              Privacy Policy explains how we collect, use, store, disclose, and
              protect information when you visit our website, request a quote,
              book a cleaning service, contact us, or use our services.
            </p>
            <p>
              Camz Cleaning provides residential, commercial, vehicle, seasonal,
              move-in/move-out, and related cleaning services in Calgary,
              Airdrie, Cochrane, Chestermere, and nearby areas. By using our
              website or submitting your information to Camz Cleaning, you agree
              to the practices described in this Privacy Policy.
            </p>
            <p>
              Camz Cleaning handles personal information in accordance with
              applicable Canadian and Alberta privacy requirements, including
              privacy principles under PIPEDA and Alberta&apos;s Personal
              Information Protection Act where applicable.
            </p>
          </div>

          <div className="mt-12 space-y-10">
            {policySections.map((section) => (
              <section
                key={section.title}
                className="border-b border-[#E2E8F0] pb-9 last:border-b-0 last:pb-0"
              >
                <h2 className="text-2xl font-bold text-[#16497D] md:text-[30px]">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-[#334155]">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items ? (
                    <ul className="grid gap-3 pl-5 text-base leading-relaxed text-[#334155] marker:text-[#02A8D0] md:grid-cols-2">
                      {section.items.map((item) => (
                        <li key={item} className="list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}

            <section className="rounded-md bg-[#16497D] p-6 text-white md:p-8">
              <h2 className="text-2xl font-bold text-white md:text-[30px]">
                17. Privacy Questions, Requests, or Complaints
              </h2>
              <p className="mt-4 text-white/90">
                If you have questions about this Privacy Policy, want to access
                or update your personal information, or have a privacy-related
                concern, you may contact us at:
              </p>
              <ul className="mt-5 grid gap-3 text-white/90 md:grid-cols-2">
                {contactDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
              <p className="mt-5 text-white/90">
                We will review privacy-related requests and respond within a
                reasonable time.
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
