import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Our Professional Cleaning Services | Camz Cleaning",
  description:
    "Explore residential, commercial, vehicle and seasonal property cleaning services from Camz Cleaning and choose the right option for your needs.",
  path: "/services/",
});

export default function ServicesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/services/" />
      {children}
    </>
  );
}
