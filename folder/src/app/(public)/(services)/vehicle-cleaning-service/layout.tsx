import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Mobile Vehicle Cleaning & Car Detailing in Calgary | Camz Cleaning",
  description:
    "Mobile interior and exterior vehicle cleaning in Calgary, with service also available in Airdrie, Cochrane and Chestermere subject to location and availability.",
  path: "/vehicle-cleaning-service/",
});

export default function VehicleCleaningLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/vehicle-cleaning-service/" />
      {children}
    </>
  );
}
