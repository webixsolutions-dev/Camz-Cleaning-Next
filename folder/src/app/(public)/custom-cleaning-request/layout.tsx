import type { Metadata, Viewport } from "next";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { pageSeo } from "@/lib/seo";

export const metadata: Metadata = pageSeo({
  title: "Custom Cleaning Request | Camz Cleaning",
  description:
    "Build a room-by-room cleaning checklist and request a custom quote from Camz Cleaning in Calgary, Airdrie, Cochrane, or Chestermere.",
  path: "/custom-cleaning-request/",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0B4E9B",
};

export default function CustomCleaningRequestLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-w-0 overflow-x-clip">
      <PageJsonLd path="/custom-cleaning-request/" />
      {children}
    </div>
  );
}
