// import CommonHeroSection from "@/components/common/CommonHeroSection";
// import PageJsonLd from "@/components/seo/PageJsonLd";
// import { pageSeo } from "@/lib/seo";

// export const metadata = pageSeo({
//   title: "Privacy Policy | Camz Cleaning",
//   description: "Read the Camz Cleaning privacy policy for website visitors, service requests, bookings and customer information handling.",
//   path: "/privacy-policy/",
// });

// type PolicySection = {
//   title: string;
//   paragraphs?: string[];
//   items?: string[];
// };

// const policySections: PolicySection[] = [
//   {
//     title: "1. Information We Collect",
//     paragraphs: [
//       "We may collect personal information when you contact us, request a quotation, book a service, fill out a form, call us, email us, or interact with our website.",
//       "The information we may collect includes:",
//     ],
//     items: [
//       "Full name",
//       "Email address",
//       "Phone number",
//       "Service address or location",
//       "Preferred cleaning service",
//       "Booking date and time",
//       "Property details related to the requested cleaning service",
//       "Messages, instructions, or notes submitted through our forms",
//       "Website usage information such as browser type, device type, pages visited, referral source, and general location data",
//       "Property type, number of rooms or bathrooms, square footage, cleaning frequency, parking instructions, access instructions, pets in the property, and any special cleaning notes you provide",
//     ],
//   },
//   {
//     title: "2. How We Use Your Information",
//     paragraphs: [
//       "Camz Cleaning may use your personal information for the following purposes:",
//     ],
//     items: [
//       "To respond to your questions or service requests",
//       "To provide cleaning quotes and booking confirmations",
//       "To schedule residential, commercial, vehicle, seasonal, or move-in/move-out cleaning services",
//       "To contact you about your appointment or service details",
//       "To share necessary service information with our cleaning team",
//       "To improve our website, customer service, and business operations",
//       "To send important service-related updates",
//       "To process payments or invoices, where applicable",
//       "To maintain customer records",
//       "To comply with legal, tax, accounting, or regulatory requirements",
//       "We do not sell your personal information.",
//     ],
//   },
//   {
//     title: "3. Consent",
//     paragraphs: [
//       "When you provide your personal information to Camz Cleaning, you consent to us collecting, using, and storing that information for the purposes described in this Privacy Policy.",
//       "You may withdraw your consent at any time by contacting us. However, withdrawing consent may affect our ability to provide certain services, respond to your inquiries, or complete your booking.",
//     ],
//   },
//   {
//     title: "4. Booking Forms and Service Requests",
//     paragraphs: [
//       "When you submit a booking request, quote request, or contact form on our website, we use the information you provide to understand your cleaning needs and contact you with service details.",
//       "This may include information about your property, cleaning requirements, preferred schedule, access instructions, parking details, and other service-related notes. Please avoid submitting sensitive personal information that is not required for the cleaning service.",
//     ],
//   },
//   {
//     title: "5. Service Address and Cleaning Instructions",
//     paragraphs: [
//       "Because cleaning services are delivered at customer homes, offices, vehicles, or other properties, we may need to collect and use service location details and cleaning instructions.",
//       "This may include your address, unit number, entry instructions, alarm or access notes, parking instructions, pet information, areas to clean, areas to avoid, or special requests related to the booked cleaning service. We use this information only to plan, manage, and complete the service.",
//     ],
//   },
//   {
//     title: "6. Payment Information",
//     paragraphs: [
//       "If payment is required for a cleaning service, your payment may be processed through a third-party payment provider. Camz Cleaning does not intentionally store full credit card or banking details on its website unless specifically required for business or legal purposes.",
//       "Third-party payment providers may have their own privacy policies and security practices. We recommend reviewing their privacy terms when making a payment.",
//     ],
//   },
//   {
//     title: "7. Cookies and Website Tracking",
//     paragraphs: [
//       "Our website may use cookies or similar tracking technologies to improve website performance, understand visitor activity, and enhance user experience.",
//       "Cookies may help us understand:",
//     ],
//     items: [
//       "Which pages users visit",
//       "How visitors interact with our website",
//       "What devices and browsers are being used",
//       "How users find our website",
//       "You can disable cookies through your browser settings, but some parts of the website may not function properly if cookies are turned off.",
//     ],
//   },
//   {
//     title: "8. Third-Party Tools and Service Providers",
//     paragraphs: [
//       "We may use third-party tools to manage online booking, quote requests, website forms, analytics, hosting, email communication, payment processing, spam protection, customer support, or business administration.",
//       "These third-party providers may process limited information only as needed to support our business operations. Camz Cleaning is not responsible for the privacy practices of third-party websites or platforms, and we recommend reviewing their privacy policies where applicable.",
//     ],
//   },
//   {
//     title: "9. Sharing Your Information",
//     paragraphs: [
//       "Camz Cleaning may share limited personal information only when necessary to operate our business or provide services.",
//       "We may share information with:",
//     ],
//     items: [
//       "Camz Cleaning team members or service staff",
//       "Booking or scheduling platforms",
//       "Payment processors",
//       "Website hosting or maintenance providers",
//       "Email, phone, or communication service providers",
//       "Accounting, legal, or administrative support providers",
//       "Government or legal authorities when required by law",
//       "We may share necessary service details with Camz Cleaning team members only when needed to complete your booked cleaning service. This may include your name, phone number, service address, access instructions, and cleaning requirements.",
//       "We only share information that is reasonably necessary for the specific purpose.",
//     ],
//   },
//   {
//     title: "10. Marketing Communications",
//     paragraphs: [
//       "If you choose to receive updates, promotions, or offers from Camz Cleaning, we may contact you by email, phone, SMS, or other electronic communication methods.",
//       "If we send promotional emails or messages, you may unsubscribe at any time by using the unsubscribe option in the message or by contacting us directly.",
//     ],
//   },
//   {
//     title: "11. How We Protect Your Information",
//     paragraphs: [
//       "We take reasonable steps to protect your personal information from unauthorized access, misuse, loss, disclosure, alteration, or destruction.",
//       "These steps may include:",
//     ],
//     items: [
//       "Secure website and hosting practices",
//       "Limited access to customer information",
//       "Use of trusted third-party service providers",
//       "Administrative and technical safeguards",
//       "Regular review of website forms and data handling processes",
//       "However, no online system can be guaranteed to be completely secure. We encourage users to avoid sending highly sensitive information through website forms or email.",
//     ],
//   },
//   {
//     title: "12. How Long We Keep Your Information",
//     paragraphs: [
//       "We keep personal information only as long as necessary for the purposes described in this Privacy Policy, including customer service, booking records, business administration, legal compliance, tax records, and dispute resolution.",
//       "When personal information is no longer required, we will take reasonable steps to delete, anonymize, or securely store it according to applicable requirements.",
//     ],
//   },
//   {
//     title: "13. Accessing or Updating Your Information",
//     paragraphs: [
//       "You may contact Camz Cleaning to request access to the personal information we hold about you. You may also ask us to correct, update, or delete your personal information where applicable.",
//       "We may need to verify your identity before processing your request.",
//     ],
//   },
//   {
//     title: "14. Third-Party Links",
//     paragraphs: [
//       "Our website may contain links to third-party websites, booking tools, social media platforms, review platforms, or payment services.",
//       "Camz Cleaning is not responsible for the privacy practices, content, or security of third-party websites. We recommend reviewing the privacy policies of any third-party websites you visit.",
//     ],
//   },
//   {
//     title: "15. Children's Privacy",
//     paragraphs: [
//       "Our website and services are intended for adults, property owners, tenants, businesses, or individuals booking cleaning services. We do not knowingly collect personal information from children.",
//       "If we become aware that personal information from a child has been submitted without appropriate consent, we will take reasonable steps to delete it.",
//     ],
//   },
//   {
//     title: "16. Changes to This Privacy Policy",
//     paragraphs: [
//       "Camz Cleaning may update this Privacy Policy from time to time to reflect changes in our services, website, legal requirements, or business practices.",
//       'Any updates will be posted on this page with a revised "Last Updated" date. We encourage visitors to review this page regularly.',
//     ],
//   },
// ];

// const contactDetails = [
//   "Website: camzcleaning.com",
//   "Email: info@camzcleaning.com",
//   "Phone: +1 587-837-1977",
//   "Location: Calgary, AB, Canada",
//   "Service Area: Calgary, Airdrie, Cochrane, Chestermere, and nearby areas",
// ];

// export default function PrivacyPolicyPage() {
//   return (
//     <div className="bg-white">
//       <PageJsonLd path="/privacy-policy/" />
//       <CommonHeroSection
//         backgroundImage="/wp-admin/uploads/blog-bg.webp"
//         title="Privacy Policy"
//       />

//       <section className="container-custom py-14 md:py-20">
//         <div className="mx-auto max-w-4xl">
//           <div className="mb-10 rounded-md border border-[#D9E8F6] bg-[#F5FBFF] p-6">
//             <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#02A8D0]">
//               Camz Cleaning
//             </p>
//             <h2 className="mt-3 text-3xl font-extrabold text-[#16497D] md:text-4xl">
//               Privacy Policy
//             </h2>
//             <p className="mt-3 text-sm font-medium text-[#46627D]">
//               Last Updated: 19 June, 2026
//             </p>
//           </div>

//           <div className="space-y-5 text-[#334155]">
//             <p>
//               At Camz Cleaning, we respect your privacy and are committed to
//               protecting the personal information you share with us. This
//               Privacy Policy explains how we collect, use, store, disclose, and
//               protect information when you visit our website, request a quote,
//               book a cleaning service, contact us, or use our services.
//             </p>
//             <p>
//               Camz Cleaning provides residential, commercial, vehicle, seasonal,
//               move-in/move-out, and related cleaning services in Calgary,
//               Airdrie, Cochrane, Chestermere, and nearby areas. By using our
//               website or submitting your information to Camz Cleaning, you agree
//               to the practices described in this Privacy Policy.
//             </p>
//             <p>
//               Camz Cleaning handles personal information in accordance with
//               applicable Canadian and Alberta privacy requirements, including
//               privacy principles under PIPEDA and Alberta&apos;s Personal
//               Information Protection Act where applicable.
//             </p>
//           </div>

//           <div className="mt-12 space-y-10">
//             {policySections.map((section) => (
//               <section
//                 key={section.title}
//                 className="border-b border-[#E2E8F0] pb-9 last:border-b-0 last:pb-0"
//               >
//                 <h2 className="text-2xl font-bold text-[#16497D] md:text-[30px]">
//                   {section.title}
//                 </h2>
//                 <div className="mt-4 space-y-4 text-[#334155]">
//                   {section.paragraphs?.map((paragraph) => (
//                     <p key={paragraph}>{paragraph}</p>
//                   ))}
//                   {section.items ? (
//                     <ul className="grid gap-3 pl-5 text-base leading-relaxed text-[#334155] marker:text-[#02A8D0] md:grid-cols-2">
//                       {section.items.map((item) => (
//                         <li key={item} className="list-disc">
//                           {item}
//                         </li>
//                       ))}
//                     </ul>
//                   ) : null}
//                 </div>
//               </section>
//             ))}

//             <section className="rounded-md bg-[#16497D] p-6 text-white md:p-8">
//               <h2 className="text-2xl font-bold text-white md:text-[30px]">
//                 17. Privacy Questions, Requests, or Complaints
//               </h2>
//               <p className="mt-4 text-white/90">
//                 If you have questions about this Privacy Policy, want to access
//                 or update your personal information, or have a privacy-related
//                 concern, you may contact us at:
//               </p>
//               <ul className="mt-5 grid gap-3 text-white/90 md:grid-cols-2">
//                 {contactDetails.map((detail) => (
//                   <li key={detail}>{detail}</li>
//                 ))}
//               </ul>
//               <p className="mt-5 text-white/90">
//                 We will review privacy-related requests and respond within a
//                 reasonable time.
//               </p>
//             </section>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }



import React from "react";
import Link from "next/link";
import PageJsonLd from "@/components/seo/PageJsonLd";
import CommonHeroSection from "@/components/common/CommonHeroSection";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Privacy Policy | Camz Cleaning Calgary",
  description:
    "Review Camz Cleaning's privacy policy governing our website, online booking system, and professional cleaning services under Alberta PIPA and Canadian privacy laws.",
  path: "/privacy-policy/",
});

export default function PrivacyPolicyPage() {
  const sections = [
    { id: "scope", title: "1. Scope and Accountability" },
    { id: "collection", title: "2. Personal Information We May Collect" },
    { id: "how-why", title: "3. How and Why We Collect Information" },
    { id: "consent", title: "4. Consent and Your Choices" },
    { id: "media", title: "5. Before-and-After Photographs and Short Videos" },
    { id: "disclosure", title: "6. Disclosure and Service Providers" },
    { id: "cookies", title: "7. Website Cookies and Similar Technologies" },
    { id: "communications", title: "8. Email, Text Messages and Marketing" },
    { id: "accounts", title: "9. Customer Accounts and Secure Links" },
    { id: "retention", title: "10. Retention and Secure Disposal" },
    { id: "safeguards", title: "11. Safeguards" },
    { id: "breach-response", title: "12. Privacy Incidents and Breach Response" },
    { id: "access-correction", title: "13. Access and Correction" },
    { id: "third-party-info", title: "14. Information About Other People" },
    { id: "children", title: "15. Children's Privacy" },
    { id: "external-links", title: "16. External Links and Third-Party Services" },
    { id: "policy-changes", title: "17. Changes to This Policy" },
    { id: "contact-privacy", title: "18. Questions, Requests and Complaints" },
    { id: "legal-interpretation", title: "19. Legal Interpretation" },
    { id: "regulatory-notes", title: "Legal & Regulatory Reference Notes" },
  ];

  return (
    <div className="bg-[#F8FAFC] text-slate-800">
      <PageJsonLd path="/privacy-policy/" />

      {/* Hero Banner */}
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/blog-bg.webp"
        title="Privacy Policy"
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* STICKY SIDEBAR NAVIGATION (Desktop) */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#0B4E9B]">
                  Table of Contents
                </h2>
                <nav className="mt-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 text-xs space-y-1 scrollbar-thin">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block rounded-lg px-3 py-2 text-slate-600 font-medium transition-colors hover:bg-blue-50 hover:text-[#0B4E9B]"
                    >
                      {sec.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Quick Privacy Contact Card */}
              <div className="rounded-2xl bg-gradient-to-br from-[#072d5c] to-[#0B4E9B] p-6 text-white shadow-md">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Privacy Officer
                </span>
                <h3 className="mt-1 text-base font-bold">Have Privacy Questions?</h3>
                <p className="mt-2 text-xs text-blue-100 leading-relaxed">
                  Submit a privacy request directly to our designated Privacy Officer in Calgary, Alberta.
                </p>
                <Link
                  href="/contact-us/"
                  className="mt-4 inline-block rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0B4E9B] shadow-sm transition-transform hover:scale-[1.02]"
                >
                  Contact Privacy Officer
                </Link>
              </div>
            </div>
          </aside>

          {/* MAIN DOCUMENT BODY */}
          <main className="lg:col-span-8 space-y-12">
            
            {/* Header Document Metadata Card */}
            <header className="rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <span className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-[#0B4E9B]">
                    Alberta PIPA &amp; Canadian Compliance
                  </span>
                  <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    Camz Cleaning Privacy Policy
                  </h1>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Calgary, Alberta • Professional Cleaning Services
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                  <div>
                    <span className="block font-bold text-slate-400 uppercase text-[10px]">Effective Date</span>
                    <span className="font-semibold text-slate-800">September 19, 2026</span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-400 uppercase text-[10px]">Last Updated</span>
                    <span className="font-semibold text-slate-800">September 19, 2026</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                <p>
                  <strong>Camz Cleaning</strong> (&quot;Camz Cleaning,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Policy explains how we collect, use, disclose, retain and protect personal information when you visit our website, request a quote, make a booking, communicate with us, receive cleaning services, create an account or otherwise interact with Camz Cleaning.
                </p>
                <p>
                  This Policy is intended to reflect Alberta&apos;s <em>Personal Information Protection Act (PIPA)</em> and other Canadian laws that may apply. PIPA is Alberta&apos;s private-sector privacy law. Personal information generally means information about an identifiable individual.
                </p>
              </div>

              {/* Core Commitment Callout Card */}
              <div className="rounded-2xl border-l-4 border-emerald-500 bg-emerald-50/70 p-5 text-emerald-900 sm:p-6">
                <h2 className="text-base font-bold flex items-center gap-2 text-emerald-900">
                  <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Our Core Privacy Commitment
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                  We do not sell or rent customer personal information. We collect, use and disclose information only for reasonable service and business purposes identified in this Policy, with consent where required, or as otherwise permitted or required by law.
                </p>
              </div>
            </header>

            {/* SECTION 1 */}
            <section id="scope" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                1. Scope and Accountability
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                This Policy applies to Camz Cleaning&apos;s website, online quote and booking tools, customer portal, telephone, email, text and social-media communications, invoices, cleaning reports, quality-control photographs and short videos, and residential or commercial cleaning services.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Camz Cleaning designates a Privacy Officer to oversee compliance, respond to privacy inquiries and access requests, address complaints, and coordinate responses to privacy incidents. Employees, cleaners and authorized service providers are expected to protect personal information and use it only as required for their duties.
              </p>
            </section>

            {/* SECTION 2 */}
            <section id="collection" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                2. Personal Information We May Collect
              </h2>
              <p className="text-sm text-slate-600 sm:text-base">
                The information collected depends on how you interact with us and which services you request. It may include:
              </p>
              <ul className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-2 text-xs sm:text-sm text-slate-700">
                {[
                  "Identity and contact information, including name, telephone number, email address and preferred communication method.",
                  "Service and billing addresses, property type, approximate size, number of rooms, and requested cleaning services.",
                  "Appointment dates, access and parking instructions, alarm or entry details, pet information and special directions voluntarily provided by you.",
                  "Cleaning preferences, priority areas, allergies, sensitivities, fragrance preferences and product requests.",
                  "Quote, booking, service history, cleaner assignment, check-in/check-out, cleaning checklist and rebooking records.",
                  "Invoice, payment status, transaction reference and tax information. Full payment-card information is generally handled by the selected payment processor rather than stored by Camz Cleaning.",
                  "Messages, call notes, emails, texts, website-form submissions, reviews, complaints, re-cleaning requests and related evidence.",
                  "Before-and-after photographs or short videos taken at the service location for the quality-control purposes described below.",
                  "Technical website information, such as IP address, device and browser type, referral source, pages viewed, timestamps, cookie choices and security logs.",
                  "Any other information you choose to provide that is reasonably connected to a quote, booking or service.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0B4E9B] mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* SECTION 3 */}
            <section id="how-why" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                3. How and Why We Collect Information
              </h2>
              <p className="text-sm text-slate-700 sm:text-base">
                We may collect information directly from you, from a person authorized to book on your behalf, through our website or booking tools, during service delivery, or from service providers supporting the transaction. We identify purposes at or before collection whenever reasonably practicable.
              </p>
              <p className="text-sm font-semibold text-slate-900">We use personal information for purposes such as:</p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {[
                  "Responding to inquiries and preparing general estimates or customized quotes.",
                  "Scheduling, confirming, modifying, cancelling and delivering cleaning services.",
                  "Assigning cleaners and providing them with only the property and service information reasonably necessary for the job.",
                  "Communicating about arrival windows, access, service progress, requested additions, completion, payment, complaints or re-cleaning.",
                  "Processing payments and maintaining invoices, receipts, accounting and tax records.",
                  "Creating customer accounts, booking histories, saved property preferences and secure service reports.",
                  "Documenting property condition, work performed and customer-approved changes.",
                  "Reviewing cleaning quality, safety concerns, damage allegations, disputes, chargebacks, insurance matters or suspected fraud.",
                  "Improving staff training, cleaning procedures, customer service, website functionality and booking operations.",
                  "Protecting customers, cleaners, Camz Cleaning and the public, and complying with lawful requirements.",
                ].map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#0B4E9B] font-bold">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <p className="pt-2 text-xs text-slate-500 italic">
                We will not use personal information for a materially different purpose without obtaining additional consent unless the new use is otherwise permitted or required by law.
              </p>
            </section>

            {/* SECTION 4 */}
            <section id="consent" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                4. Consent and Your Choices
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Consent may be express or implied, depending on the sensitivity of the information, the reasonable expectations of the individual and the circumstances. By voluntarily requesting a quote, making a booking or providing instructions, you consent to reasonable collection, use and disclosure necessary to respond and provide the requested service.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                You may withdraw consent for optional uses by contacting the Privacy Officer. Withdrawal does not operate retroactively and may be subject to legal or contractual restrictions. If information is reasonably necessary to provide a requested service, withdrawing consent may prevent us from completing that service.
              </p>
              <p className="text-xs text-slate-500">
                Camz Cleaning may collect, use or disclose personal information without consent where permitted or required by applicable law.
              </p>
            </section>

            {/* SECTION 5 */}
            <section id="media" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                5. Before-and-After Photographs and Short Videos
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                To support accountability and cleaning quality, authorized cleaners may take reasonable before-and-after photographs or short videos at a service location. These records may be used for:
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700">
                {[
                  "Quality control and verification that an agreed cleaning task was addressed.",
                  "Documenting the condition of the property before or after service.",
                  "Preparing or supporting a cleaning report.",
                  "Internal training and performance review using access-controlled records.",
                  "Reviewing complaints, re-cleaning requests, damage allegations, non-payment, chargebacks, insurance claims or legal disputes.",
                  "Protecting the legitimate interests of the customer, cleaners and Camz Cleaning.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[#0B4E9B] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* No Automatic Marketing Callout */}
              <div className="rounded-2xl border-l-4 border-amber-500 bg-amber-50/70 p-5 text-amber-900">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                  No Automatic Marketing Permission
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-amber-800">
                  Quality-control consent does not give Camz Cleaning permission to publish a customer&apos;s property photographs or videos. We will not post them on social media, use them in advertising, place them in a public portfolio, or otherwise use them for promotional purposes without separate, informed permission from the customer.
                </p>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                <p>
                  Cleaners are instructed to make reasonable efforts to avoid recording customers, children, guests, faces, personal documents, mail, identification, financial or medical information, private communications, computer screens, security codes, alarm panels, keys and other unnecessarily sensitive items.
                </p>
                <p>
                  A customer may identify areas that should not be photographed before service begins. Camz Cleaning will reasonably assess the request against documentation genuinely needed for service verification, safety, insurance or dispute prevention. Wherever practical, images will be framed to capture the work area rather than personal belongings.
                </p>
              </div>
            </section>

            {/* SECTION 6 */}
            <section id="disclosure" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                6. Disclosure and Service Providers
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Camz Cleaning does not sell or rent personal information. Limited information may be disclosed when reasonably necessary to:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                {[
                  "Assigned cleaners, supervisors and authorized administrative personnel.",
                  "Website hosting, cloud storage, booking, customer-management, email, telephone or SMS providers.",
                  "Payment processors, financial institutions and fraud-prevention providers.",
                  "Accountants, insurers, legal advisers, collection services or other professional advisers.",
                  "Government, regulatory, law-enforcement or judicial authorities where disclosure is permitted or legally required.",
                  "A purchaser or successor in a proposed or completed business sale, merger or reorganization, subject to appropriate confidentiality and legal safeguards.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#0B4E9B] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-600 pt-2">
                We seek to provide service providers only the information reasonably necessary for their role. Providers are expected to protect it and use it only for the contracted purpose, subject to their legal obligations.
              </p>
              <p className="text-xs text-slate-500 italic">
                Some providers may process or store information outside Alberta or Canada. In that case, information may be accessible to courts, law-enforcement or national-security authorities under the laws of the jurisdiction where it is processed or stored.
              </p>
            </section>

            {/* SECTION 7 */}
            <section id="cookies" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                7. Website Cookies and Similar Technologies
              </h2>
              <p className="text-sm text-slate-700 sm:text-base">
                Our website may use cookies, pixels, local storage and similar technologies. These tools may be grouped as follows:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <strong className="block font-bold text-slate-900">Essential Cookies:</strong>
                  <span className="text-slate-600">Required for security, basic website operation, booking functionality, session management and privacy choices.</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <strong className="block font-bold text-slate-900">Preference Cookies:</strong>
                  <span className="text-slate-600">Remember settings or information selected by the visitor.</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <strong className="block font-bold text-slate-900">Analytics Cookies:</strong>
                  <span className="text-slate-600">Help us understand website use, performance and errors so we can improve our services.</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <strong className="block font-bold text-slate-900">Advertising &amp; Social Technologies:</strong>
                  <span className="text-slate-600">Measure advertising performance or connect activity with third-party platforms when consent is obtained.</span>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-xs sm:text-sm text-slate-700">
                <h3 className="font-bold text-[#0B4E9B]">Important Website Configuration Note</h3>
                <p className="mt-1 text-slate-600">
                  If Camz Cleaning enables Google Analytics, Google Maps, Meta Pixel, embedded social-media tools, online payments or third-party booking technology, those providers may receive technical information and apply their own privacy terms.
                </p>
              </div>
            </section>

            {/* SECTION 8 */}
            <section id="communications" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                8. Email, Text Messages and Marketing
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Operational communications about an inquiry, quote, appointment, access instruction, invoice, payment, complaint or re-cleaning are used to manage the requested service.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Promotional electronic messages will be sent only where permitted by Canada&apos;s anti-spam requirements (CASL) and where the necessary consent or other lawful authority exists. Marketing messages will identify the sender and provide a functioning unsubscribe method. Withdrawing marketing consent does not prevent necessary communications about an active service or transaction.
              </p>
            </section>

            {/* SECTION 9 */}
            <section id="accounts" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                9. Customer Accounts and Secure Links
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                If customer accounts, one-time verification codes or secure booking/report links are offered, customers are responsible for safeguarding their credentials and links. Please notify Camz Cleaning promptly if you believe your account, device, verification code or booking link has been used without authorization.
              </p>
            </section>

            {/* SECTION 10 */}
            <section id="retention" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                10. Retention and Secure Disposal
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                We retain personal information only as long as reasonably necessary for the identified purposes, legitimate business needs and legal requirements. The appropriate period depends on the sensitivity and purpose of the record.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {[
                  "Unaccepted quote and inquiry records are kept only as long as reasonably needed for follow-up, service analysis or legal purposes.",
                  "Booking, service, complaint and customer-support records may be retained while the customer relationship continues and for a reasonable period afterward.",
                  "Quality-control photographs and short videos are retained only as long as reasonably necessary for verification, training, complaint, payment, insurance or legal purposes, and should then be deleted or anonymized.",
                  "Financial and tax records are retained for the period required by applicable tax and accounting laws.",
                  "Records connected to an active complaint, chargeback, insurance claim, investigation or legal proceeding may be retained until the matter and applicable limitation periods are resolved.",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#0B4E9B] font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 pt-2">
                When personal information is no longer reasonably required, we use appropriate methods to delete, destroy or anonymize it. Camz Cleaning maintains an internal retention schedule and periodically reviews stored photographs, videos, customer files and account access.
              </p>
            </section>

            {/* SECTION 11 */}
            <section id="safeguards" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                11. Safeguards
              </h2>
              <p className="text-sm text-slate-700 sm:text-base">
                Camz Cleaning uses reasonable administrative, technical and physical safeguards appropriate to the sensitivity, amount, format and location of the information. Safeguards may include:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-700">
                {[
                  "Role-based access limited to staff and cleaners who require the information.",
                  "Password protection, multi-factor authentication where available, device security and secure transmission.",
                  "Controlled access to customer addresses, entry instructions, photographs, videos and cleaning reports.",
                  "Confidentiality expectations, staff instructions and privacy-aware training.",
                  "Secure providers, account monitoring, backups and deletion procedures.",
                  "Avoiding unnecessary downloads or storage of customer information on personal devices.",
                ].map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 italic pt-2">
                No system can be guaranteed completely secure. Customers should avoid sending highly sensitive information unless Camz Cleaning specifically requests it through an appropriate method.
              </p>
            </section>

            {/* SECTION 12 */}
            <section id="breach-response" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                12. Privacy Incidents and Breach Response
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                If Camz Cleaning becomes aware of unauthorized access, collection, use, disclosure, loss or destruction of personal information, we will take reasonable steps to contain and investigate the incident, reduce foreseeable harm, document the response and improve safeguards.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Where Alberta PIPA or another applicable law requires notification, Camz Cleaning will notify the appropriate privacy regulator and affected individuals as required. Alberta PIPA includes mandatory reporting to the <strong>Office of the Information and Privacy Commissioner of Alberta (OIPC)</strong> where a breach creates a real risk of significant harm to an individual.
              </p>
            </section>

            {/* SECTION 13 */}
            <section id="access-correction" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                13. Access and Correction
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                You may submit a written request to access personal information Camz Cleaning holds about you or to correct information that is inaccurate or incomplete. We may ask for reasonable identity verification before responding.
              </p>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Access may be limited or refused where permitted or required by law, including where disclosure would reveal another person&apos;s personal information, confidential commercial information or legally privileged information. If access is refused, we will provide the reason where required.
              </p>
            </section>

            {/* SECTION 14 */}
            <section id="third-party-info" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                14. Information About Other People
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                If you provide personal information about a tenant, guest, property owner, employee, family member or other person, you confirm that you have the authority or consent necessary to provide it. Do not provide more information than is reasonably necessary for the cleaning service.
              </p>
            </section>

            {/* SECTION 15 */}
            <section id="children" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                15. Children&apos;s Privacy
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Our services are intended to be booked by adults. We do not knowingly create customer accounts for children or collect personal information directly from children for marketing. Quality-control photographs and videos should avoid capturing children or information identifying them.
              </p>
            </section>

            {/* SECTION 16 */}
            <section id="external-links" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                16. External Links and Third-Party Services
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                Our website may link to independently operated websites, payment services, maps, booking tools or social-media platforms. Camz Cleaning is not responsible for the privacy practices of those independent services. Customers should review the provider&apos;s privacy notice before submitting information.
              </p>
            </section>

            {/* SECTION 17 */}
            <section id="policy-changes" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                17. Changes to This Policy
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                We may update this Policy to reflect changes in our services, technology, providers, business practices or legal requirements. The revised version will be posted with a new &apos;Last Updated&apos; date. Where appropriate, material changes may also be communicated by another reasonable method.
              </p>
            </section>
8
            {/* SECTION 18 */}
            <section id="contact-privacy" className="scroll-mt-32 rounded-3xl bg-gradient-to-br from-[#072d5c] to-[#0B4E9B] p-6 sm:p-10 text-white shadow-xl space-y-6">
              <h2 className="text-2xl font-extrabold sm:text-3xl text-white">
                18. Questions, Requests and Complaints
              </h2>
              <p className="text-sm text-blue-100 sm:text-base leading-relaxed">
                Privacy questions, consent withdrawals, access or correction requests, and complaints should be directed to:
              </p>

              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-md border border-white/20 space-y-2 text-sm">
                <p className="text-lg font-bold text-blue-200">Privacy Officer – Camz Cleaning</p>
                <p className="text-slate-200">Calgary, Alberta, Canada</p>
                <p className="text-xs text-blue-100 pt-2">
                  Submit a privacy request through the Contact Us page or use the current business email address or telephone number displayed on the Camz Cleaning website. Please write <em>&quot;Privacy Request&quot;</em> in the subject line when possible.
                </p>
              </div>

              <p className="text-xs text-blue-100 leading-relaxed">
                We will review privacy concerns in good faith and respond within the period required by applicable law. If a concern cannot be resolved directly, you may contact the <strong>Office of the Information and Privacy Commissioner of Alberta (OIPC)</strong>.
              </p>
            </section>

            {/* SECTION 19 */}
            <section id="legal-interpretation" className="scroll-mt-32 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#0B4E9B] sm:text-2xl">
                19. Legal Interpretation
              </h2>
              <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                This Policy describes Camz Cleaning&apos;s privacy practices and is not intended to waive, restrict or override rights or obligations under applicable law. If any part of this Policy conflicts with a mandatory legal requirement, the legal requirement governs and the remaining provisions continue to apply.
              </p>
            </section>

            {/* REFERENCE NOTES SECTION (Page 10 of PDF) */}
            <section id="regulatory-notes" className="scroll-mt-32 rounded-3xl border border-slate-200 bg-slate-100/70 p-6 sm:p-8 shadow-inner space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Legal &amp; Regulatory Framework</span>
                <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                  Reference Notes
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  These reference notes support the development of this Policy. They are included for transparency and should remain current when the Policy is reviewed.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm space-y-2">
                  <h3 className="font-bold text-slate-900">Alberta Personal Information Protection Act (PIPA)</h3>
                  <p className="text-slate-600">
                    Alberta&apos;s private-sector privacy law governing the collection, use, disclosure and protection of personal information by provincially regulated organizations.
                  </p>
                  <a href="https://www.alberta.ca/personal-information-protection-act" target="_blank" rel="noopener noreferrer" className="inline-block text-[#0B4E9B] font-bold underline">
                    alberta.ca/personal-information-protection-act
                  </a>
                </div>

                <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm space-y-2">
                  <h3 className="font-bold text-slate-900">Office of the Information and Privacy Commissioner of Alberta</h3>
                  <p className="text-slate-600">
                    Guidance, complaint information and privacy-breach reporting resources for Alberta.
                  </p>
                  <a href="https://oipc.ab.ca" target="_blank" rel="noopener noreferrer" className="inline-block text-[#0B4E9B] font-bold underline">
                    oipc.ab.ca
                  </a>
                </div>

                <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm space-y-2">
                  <h3 className="font-bold text-slate-900">Canada&apos;s Anti-Spam Legislation (CASL)</h3>
                  <p className="text-slate-600">
                    Rules concerning consent, sender identification and unsubscribe mechanisms for commercial electronic messages.
                  </p>
                  <a href="https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en" target="_blank" rel="noopener noreferrer" className="inline-block text-[#0B4E9B] font-bold underline">
                    ised-isde.canada.ca
                  </a>
                </div>

                <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-sm space-y-2">
                  <h3 className="font-bold text-slate-900">Office of the Privacy Commissioner of Canada</h3>
                  <p className="text-slate-600">
                    Privacy guidance for businesses, including safeguards, meaningful consent and breach response.
                  </p>
                  <a href="https://www.priv.gc.ca/en/privacy-topics/business-privacy/" target="_blank" rel="noopener noreferrer" className="inline-block text-[#0B4E9B] font-bold underline">
                    priv.gc.ca
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-slate-300 bg-white p-4 text-xs text-slate-600">
                <strong>Important Operational Note:</strong> A written policy is only one part of compliance. Camz Cleaning&apos;s cleaners, administrators, website, booking system, photo practices, retention process and service providers operate consistently with the promises in this document.
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
