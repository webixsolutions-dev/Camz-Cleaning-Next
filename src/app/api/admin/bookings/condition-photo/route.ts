import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "booking-condition-photos";
const ALLOWED_PREFIXES = ["booking-pending/", "booking-review/"];

async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("users")
    .select("role,is_blocked")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role?.toLowerCase() === "admin" && profile.is_blocked === false;
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const path = request.nextUrl.searchParams.get("path")?.trim() || "";
  if (!ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix)) || path.includes("..")) {
    return NextResponse.json({ error: "Invalid photo path." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Photo service is not configured." }, { status: 500 });
  }

  const admin = createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 5);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Photo is unavailable." }, { status: 404 });
  }

  return NextResponse.redirect(data.signedUrl, 302);
}
