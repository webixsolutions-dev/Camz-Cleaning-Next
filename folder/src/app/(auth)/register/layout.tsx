import type { ReactNode } from "react";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Create an Account | Camz Cleaning",
  description: "Create a Camz Cleaning customer account.",
  path: "/register/",
  noIndex: true,
});

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return children;
}
