import BeforeAfterManagement, { type BeforeAfterPair } from "@/components/admin/BeforeAfterManagement";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBeforeAfterPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("before_after_pairs")
    .select("id, before_image_url, after_image_url, created_at, updated_at, created_by, created_by_role")
    .order("created_at", { ascending: false });

  return <BeforeAfterManagement pairs={(data || []) as BeforeAfterPair[]} />;
}
