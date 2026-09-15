import type { ReactNode } from "react";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Reset Password | Camz Cleaning",
  description: "Reset your Camz Cleaning customer account password.",
  path: "/forgot-password/",
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
  return children;
}
