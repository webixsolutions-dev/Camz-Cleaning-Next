import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Services in Chestermere | Homes & Businesses",
  description:
    "Book residential, commercial, vehicle and seasonal property cleaning in Chestermere. Choose your service and preferred appointment online.",
  path: "/chestermere-cleaning-services/",
});

export default function ChestermereCleaningLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/chestermere-cleaning-services/" />
      {children}
    </>
  );
}
