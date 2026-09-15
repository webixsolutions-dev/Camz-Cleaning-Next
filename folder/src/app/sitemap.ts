import type { MetadataRoute } from "next";
import { createPublicServerClient } from "@/lib/supabase/public-server";

const siteUrl = "https://camzcleaning.com";

const staticPaths = [
  "/",
  "/about-us/",
  "/services/",
  "/commercial-cleaning-services/",
  "/residential-cleaning-services/",
  "/vehicle-cleaning-service/",
  "/seasonal-property-service/",
  "/calgary-cleaning-services/",
  "/airdrie-cleaning-services/",
  "/cochrane-cleaning-services/",
  "/chestermere-cleaning-services/",
  "/booking/",
  "/gallery/",
  "/blog/",
  "/contact-us/",
  "/privacy-policy/",
  "/custom-cleaning-request/",
] as const;

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${siteUrl}${path}`,
  }));

  try {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase.from("blogs").select("id");
    if (error) throw error;

    const blogRoutes: MetadataRoute.Sitemap = (data ?? []).map(({ id }) => ({
      url: `${siteUrl}/blog/${id}/`,
    }));

    return [...staticRoutes, ...blogRoutes];
  } catch (error) {
    console.error("Unable to load blog URLs for sitemap; using static routes only.", error);
    return staticRoutes;
  }
}
