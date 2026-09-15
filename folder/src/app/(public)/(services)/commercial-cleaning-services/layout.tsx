import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Commercial Cleaning & Janitorial Services in Calgary",
  description:
    "Commercial cleaning services for Calgary offices, shops, shared facilities and post-construction spaces. Request a tailored plan and book online.",
  path: "/commercial-cleaning-services/",
});

export default function CommercialCleaningLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <PageJsonLd path="/commercial-cleaning-services/" />
      {children}
    </>
  );
}
