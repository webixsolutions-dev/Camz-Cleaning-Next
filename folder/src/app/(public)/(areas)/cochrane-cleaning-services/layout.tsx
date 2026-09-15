import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Services in Cochrane for Homes & Businesses",
  description:
    "Book residential, commercial, vehicle and seasonal property cleaning in Cochrane. Choose the service and preferred appointment online.",
  path: "/cochrane-cleaning-services/",
});

export default function CochraneCleaningLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/cochrane-cleaning-services/" />
      {children}
    </>
  );
}
