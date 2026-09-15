import type { ReactNode } from "react";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Customer Login | Camz Cleaning",
  description: "Customer account access for Camz Cleaning.",
  path: "/login/",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}
