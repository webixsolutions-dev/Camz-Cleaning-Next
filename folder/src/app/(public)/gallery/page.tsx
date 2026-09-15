import CommonHeroSection from "@/components/common/CommonHeroSection";
import GallerySection, {
  type GalleryItem,
} from "@/components/gallery/GallerySection";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Project Gallery | Camz Cleaning",
  description:
    "View recent residential, commercial, vehicle and seasonal property cleaning projects completed by Camz Cleaning.",
  path: "/gallery/",
});

export const revalidate = 300;

const fallbackImages: GalleryItem[] = [
  { id: "fallback-kitchen", image_url: "/wp-admin/uploads/sink cleaning.webp", created_at: "2026-08-01T00:00:00Z" },
  { id: "fallback-bathroom", image_url: "/wp-admin/uploads/whole bathroom cleaning.webp", created_at: "2026-08-02T00:00:00Z" },
  { id: "fallback-stairs", image_url: "/wp-admin/uploads/stairs cleaning.webp", created_at: "2026-08-03T00:00:00Z" },
  { id: "fallback-floor", image_url: "/wp-admin/uploads/floor cleaning.webp", created_at: "2026-08-04T00:00:00Z" },
  { id: "fallback-kitchen-2", image_url: "/wp-admin/uploads/cleaned kitchen.webp", created_at: "2026-08-05T00:00:00Z" },
  { id: "fallback-floor-2", image_url: "/wp-admin/uploads/cleaned floor.webp", created_at: "2026-08-06T00:00:00Z" },
  { id: "fallback-room", image_url: "/wp-admin/uploads/Room cleaning.webp", created_at: "2026-08-07T00:00:00Z" },
  { id: "fallback-wardrobe", image_url: "/wp-admin/uploads/clean wadrobe.webp", created_at: "2026-08-08T00:00:00Z" },
];

export default async function GalleryPage() {
  const supabase = createPublicServerClient();

  const { data } = await supabase
    .from("gallery")
    .select("id, image_url, created_at")
    .order("created_at", { ascending: false })
    .range(0, 8);

  const databaseImages = (data ?? []) as GalleryItem[];
  const useFallback = databaseImages.length < 4;
  const initialImages = useFallback
    ? fallbackImages
    : databaseImages.slice(0, 8);

  return (
    <div>
      <CommonHeroSection
        backgroundImage="/wp-admin/uploads/blog-bg.webp"
        title={<>Cleaning Project Gallery</>}
      />
      <GallerySection
        initialImages={initialImages}
        initialHasMore={!useFallback && databaseImages.length > 8}
      />
    </div>
  );
}
