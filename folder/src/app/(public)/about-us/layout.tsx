import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "About Camz Cleaning | Our Team and Standards",
  description:
    "Learn about Camz Cleaning, our practical experience, service approach and commitment to dependable care for homes, businesses, vehicles and properties.",
  path: "/about-us/",
});

export default function AboutUsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/about-us/" />
      {children}
    </>
  );
}
