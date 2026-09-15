import type { ReactNode } from "react";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { AuthProvider } from "@/context/AuthContext";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Book a Cleaning Service Online | Camz Cleaning",
  description:
    "Choose a Camz Cleaning service, enter the property or vehicle details and request your preferred appointment online.",
  path: "/booking/",
});

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PageJsonLd path="/booking/" />
      {children}
    </AuthProvider>
  );
}
