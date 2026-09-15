import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Project Gallery | Camz Cleaning",
  description:
    "View recent residential, commercial, vehicle and seasonal property cleaning projects completed by Camz Cleaning.",
  path: "/gallery/",
});

export default function GalleryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PageJsonLd path="/gallery/" />
      {children}
    </>
  );
}
