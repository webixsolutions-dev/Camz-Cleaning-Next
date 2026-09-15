import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Seasonal Property Cleaning & Care in Calgary",
  description:
    "Seasonal home and vacation-rental cleaning in Calgary, with service also available in Airdrie, Cochrane and Chestermere based on the requested scope and availability.",
  path: "/seasonal-property-service/",
});

export default function SeasonalPropertyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/seasonal-property-service/" />
      {children}
    </>
  );
}
