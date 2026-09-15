import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Services in Calgary | Home & Office Cleaners",
  description:
    "Book professional cleaning services in Calgary for homes, offices, vehicles and seasonal properties. Choose your service and preferred appointment online.",
  path: "/calgary-cleaning-services/",
});

export default function CalgaryCleaningLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/calgary-cleaning-services/" />
      {children}
    </>
  );
}
