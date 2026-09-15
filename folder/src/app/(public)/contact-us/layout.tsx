import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Contact Camz Cleaning | Request a Cleaning Quote",
  description:
    "Contact Camz Cleaning with questions about residential, commercial, vehicle or seasonal property services, or use online booking to request an appointment.",
  path: "/contact-us/",
});

export default function ContactUsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/contact-us/" />
      {children}
    </>
  );
}
