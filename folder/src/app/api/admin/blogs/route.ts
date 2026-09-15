import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type BlogPayload = {
  id?: string;
  title?: string;
  description?: string;
  image_url?: string;
  detail_images?: string[];
  steps?: Array<{ title: string; description: string }>;
  faqs?: Array<{ question: string; answer: string }>;
};

async function getAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, supabase };
  const { data: profile } = await supabase.from("users").select("id, role, is_blocked").eq("id", user.id).maybeSingle();
  return { allowed: !!profile && !profile.is_blocked && String(profile.role || "").toLowerCase() === "admin", supabase };
}

function cleanList<T extends Record<string, string>>(items: unknown, required: Array<keyof T>) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => item && typeof item === "object" ? item as T : null)
    .filter((item): item is T => !!item && required.every((key) => String(item[key] || "").trim()))
    .map((item) => Object.fromEntries(Object.entries(item).map(([key, value]) => [key, String(value || "").trim()])));
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "blogs-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase } = await getAdmin();
  if (!allowed) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const body = (await request.json()) as BlogPayload;
  const payload = {
    title: String(body.title || "").trim(),
    description: String(body.description || "").trim(),
    image_url: String(body.image_url || "").trim(),
    detail_images: Array.isArray(body.detail_images) ? body.detail_images.map((url) => String(url || "").trim()).filter(Boolean) : [],
    steps: cleanList<{ title: string; description: string }>(body.steps, ["title", "description"]),
    faqs: cleanList<{ question: string; answer: string }>(body.faqs, ["question", "answer"]),
  };

  if (!payload.title || !payload.description || !payload.image_url) {
    return NextResponse.json({ error: "Title, description, and main image URL are required." }, { status: 400 });
  }

  const { data, error } = await supabase.from("blogs").insert(payload).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ blog: data });
}

export async function DELETE(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "blogs-delete", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase } = await getAdmin();
  if (!allowed) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Blog id is required." }, { status: 400 });
  const { error } = await supabase.from("blogs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
