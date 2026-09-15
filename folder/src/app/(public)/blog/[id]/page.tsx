import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import BlogDetailsClient, {
  type Blog,
} from "@/components/blog/BlogDetailsClient";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { blogPostingJsonLd } from "@/lib/jsonLdSchemas";
import { pageSeo } from "@/lib/seo";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { fallbackBlogs } from "@/data/fallbackBlogs";

export const revalidate = 300;

const blogSelect =
  "id, title, description, image_url, created_at, faqs, steps, detail_images";

const getFallbackBlog = (id: string): Blog | null =>
  (fallbackBlogs.find((blog) => blog.id === id) as Blog | undefined) ?? null;

const getBlog = cache(async (id: string): Promise<Blog | null> => {
  const fallback = getFallbackBlog(id);
  if (fallback) return fallback;

  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(blogSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Blog | null;
});

function seoDescription(html: string, maxLength = 155) {
  const plainText = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;

  const candidate = plainText.slice(0, maxLength - 3);
  const lastSpace = candidate.lastIndexOf(" ");
  const cutoff = lastSpace >= 100 ? lastSpace : candidate.length;
  return `${candidate.slice(0, cutoff).trimEnd()}...`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const path = `/blog/${id}/`;
  const blog = await getBlog(id);

  if (!blog) {
    return pageSeo({
      title: "Blog Post Not Found | Camz Cleaning",
      description: "The requested Camz Cleaning blog post could not be found.",
      path,
      noIndex: true,
    });
  }

  const description = seoDescription(blog.description);
  const canonical = `https://camzcleaning.com${path}`;

  return {
    ...pageSeo({ title: blog.title, description, path }),
    openGraph: {
      title: blog.title,
      description,
      url: canonical,
      siteName: "Camz Cleaning",
      type: "article",
      publishedTime: blog.created_at,
      images: blog.image_url
        ? [{ url: blog.image_url, alt: blog.title }]
        : undefined,
    },
  };
}

export async function generateStaticParams() {
  const supabase = createPublicServerClient();
  const { data } = await supabase.from("blogs").select("id");

  return [
    ...(data ?? []).map(({ id }) => ({ id })),
    ...fallbackBlogs.map(({ id }) => ({ id })),
  ];
}

export default async function BlogDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await getBlog(id);
  if (!blog) notFound();

  const fallbackCurrent = getFallbackBlog(id);
  let recentPosts: Blog[] = [];

  if (fallbackCurrent) {
    recentPosts = fallbackBlogs
      .filter((item) => item.id !== id)
      .slice(0, 3) as Blog[];
  } else {
    const supabase = createPublicServerClient();
    const { data, error } = await supabase
      .from("blogs")
      .select(blogSelect)
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(3);
    if (error) throw error;
    recentPosts = (data ?? []) as Blog[];
  }

  const description = seoDescription(blog.description);

  return (
    <>
      <PageJsonLd
        schema={blogPostingJsonLd({
          id: blog.id,
          title: blog.title,
          description,
          image: blog.image_url,
          publishedAt: blog.created_at,
        })}
      />
      <BlogDetailsClient blog={blog} recentPosts={recentPosts} />
    </>
  );
}
