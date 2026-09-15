import BlogManagement, { type AdminBlog } from "@/components/admin/BlogManagement";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select("id, title, description, image_url, detail_images, steps, faqs, created_at")
    .order("created_at", { ascending: false });

  return <BlogManagement blogs={(data || []) as AdminBlog[]} />;
}
