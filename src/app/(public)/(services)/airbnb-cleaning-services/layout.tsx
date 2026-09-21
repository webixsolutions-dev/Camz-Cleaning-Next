import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Airbnb & Short-Term Rental Cleaning in Calgary | Camz Cleaning",
  description:
    "Professional Airbnb and vacation rental turnover cleaning in Calgary, Airdrie, and Chestermere. Bed preparation, towel resets, kitchen sanitizing, and 5-star turnovers.",
  path: "/airbnb-cleaning-services/",
});

export default function AirbnbCleaningLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <PageJsonLd path="/airbnb-cleaning-services/" />
      {children}
    </>
  );
}
