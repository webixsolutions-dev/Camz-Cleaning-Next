import CommonHeroSection from "@/components/common/CommonHeroSection";
import BlogCard from "@/components/blog/BlogCard";
import PageJsonLd from "@/components/seo/PageJsonLd";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { fallbackBlogs } from "@/data/fallbackBlogs";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Cleaning Tips & Guides | Camz Cleaning Blog",
  description:
    "Read practical cleaning tips, property-care guides and service advice from Camz Cleaning for homes, workplaces, vehicles and seasonal properties.",
  path: "/blog/",
});

export const revalidate = 300;

type BlogCardData = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
};

export default async function BlogsPage() {
  const supabase = createPublicServerClient();

  const { data } = await supabase
    .from("blogs")
    .select("id, title, description, image_url, created_at")
    .order("created_at", { ascending: false });

  const databaseBlogs = (data ?? []) as BlogCardData[];
  const blogs: BlogCardData[] =
    databaseBlogs.length > 0
      ? databaseBlogs
      : fallbackBlogs.map((blog) => ({
          id: blog.id,
          title: blog.title,
          description: blog.description,
          image_url: blog.image_url,
          created_at: blog.created_at,
        }));

  return (
    <>
      <PageJsonLd path="/blog/" />
      <div className="bg-[#f7f7f7] pb-20">
        <CommonHeroSection
          backgroundImage="/wp-admin/uploads/blog-bg.webp"
          title="Cleaning Tips and Guides"
        />

        <div className="container-custom mx-auto px-4">
          <div className="pt-12 text-center">
            <h2 className="text-3xl font-semibold text-[#0B4E9B]">
              Practical Advice for Cleaner Spaces
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Useful guides for home cleaning, commercial spaces and everyday
              property care.
            </p>
          </div>

          <div className="grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
