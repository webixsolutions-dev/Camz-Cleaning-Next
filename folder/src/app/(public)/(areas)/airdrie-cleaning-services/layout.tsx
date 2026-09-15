import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Services in Airdrie for Homes & Businesses",
  description:
    "Book residential, commercial, vehicle and seasonal property cleaning services in Airdrie. Choose your service and preferred appointment online.",
  path: "/airdrie-cleaning-services/",
});

export default function AirdrieCleaningLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/airdrie-cleaning-services/" />
      {children}
    </>
  );
}
