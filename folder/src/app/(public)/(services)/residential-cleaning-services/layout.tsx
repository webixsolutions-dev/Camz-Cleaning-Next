import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Residential & House Cleaning Services in Calgary",
  description:
    "Residential cleaning in Calgary for regular, deep and move-in/move-out needs. Choose your service, preferred schedule and book online.",
  path: "/residential-cleaning-services/",
});

export default function ResidentialCleaningLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <PageJsonLd path="/residential-cleaning-services/" />
      {children}
    </>
  );
}
