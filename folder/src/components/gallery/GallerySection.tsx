"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export type GalleryItem = {
  id: string;
  image_url: string;
  created_at: string;
};

const IMAGES_PER_LOAD = 8;

const getImageLabel = (url: string): string => {
  const filename = url.split("/").pop() || "";
  const nameOnly = filename.split(".")[0];

  const cleaned = nameOnly
    .replace(/[-_]+/g, " ")
    .replace(/\b\d+\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return "Recent Camz Cleaning project";
  }

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function GallerySection({
  initialImages,
  initialHasMore,
}: {
  initialImages: GalleryItem[];
  initialHasMore: boolean;
}) {
  const [images, setImages] = useState<GalleryItem[]>(initialImages);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);

    const supabase = createClient();
    const from = images.length;

    const { data, error } = await supabase
      .from("gallery")
      .select("id, image_url, created_at")
      .order("created_at", { ascending: false })
      .range(from, from + IMAGES_PER_LOAD);

    if (!error) {
      const nextImages = (data ?? []) as GalleryItem[];

      setImages((current) => [
        ...current,
        ...nextImages.slice(0, IMAGES_PER_LOAD),
      ]);

      setHasMore(nextImages.length > IMAGES_PER_LOAD);
    }

    setLoadingMore(false);
  };

  return (
    <section className="w-full bg-[#edf6f7] py-20">
      <div className="container-custom mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <span className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow">
            Gallery
          </span>
        </div>

        {/* Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0d4ea6] md:text-5xl">
            Recent Cleaning Projects
          </h2>

          <p className="mt-5 text-lg leading-8 text-gray-600">
            Explore examples of recent work across homes, commercial
            properties, vehicles and seasonal spaces.
          </p>
        </div>

        {/* Empty State */}
        {images.length === 0 && (
          <div className="flex justify-center py-12">
            <p className="text-lg text-gray-600">
              No cleaning projects have been added yet.
            </p>
          </div>
        )}

        {/* Gallery Grid */}
        {images.length > 0 && (
          <>
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-4">
              {images.map((item) => {
                const imageLabel = getImageLabel(item.image_url);

                return (
                  <figure
                    key={item.id}
                    className="group mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-xl"
                  >
                    <div className="relative w-full overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={imageLabel}
                        width={1000}
                        height={1000}
                        className="h-auto w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <figcaption className="px-4 py-4">
                      <p className="text-sm font-semibold leading-6 text-[#0B4E9B]">
                        {imageLabel}
                      </p>
                    </figcaption>
                  </figure>
                );
              })}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="mt-14 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="rounded-full bg-[#0d4ea6] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#083b7e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}