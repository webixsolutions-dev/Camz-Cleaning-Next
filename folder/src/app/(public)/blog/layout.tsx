import type { ReactNode } from "react";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Tips & Guides | Camz Cleaning Blog",
  description:
    "Read practical cleaning tips, property-care guides and service advice from Camz Cleaning for homes, workplaces, vehicles and seasonal properties.",
  path: "/blog/",
});

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
