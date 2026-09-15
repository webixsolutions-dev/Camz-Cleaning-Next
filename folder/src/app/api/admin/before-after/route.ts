import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PairPayload = {
  id?: string;
  before_image_url?: string;
  after_image_url?: string;
};

function getRole(profile: { role?: unknown } | null) {
  return String(profile?.role || "").toLowerCase();
}

async function authorizePortalUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: false, supabase, userId: "", role: "" };
  const { data: profile } = await supabase.from("users").select("role, is_blocked").eq("id", user.id).maybeSingle();
  const role = getRole(profile);
  return { allowed: ["admin", "data_entry", "cleaner"].includes(role) && profile?.is_blocked === false, supabase, userId: user.id, role };
}

export async function POST(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "before-after-post", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase, userId, role } = await authorizePortalUser();
  if (!allowed) return NextResponse.json({ error: "Portal access required." }, { status: 403 });

  const body = (await request.json()) as PairPayload;
  if (!body.before_image_url) {
    return NextResponse.json({ error: "Before image URL is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("before_after_pairs")
    .insert({
      before_image_url: body.before_image_url,
      after_image_url: body.after_image_url || null,
      created_by: userId,
      created_by_role: role,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "before-after-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase } = await authorizePortalUser();
  if (!allowed) return NextResponse.json({ error: "Portal access required." }, { status: 403 });

  const body = (await request.json()) as PairPayload;
  if (!body.id) return NextResponse.json({ error: "Pair id is required." }, { status: 400 });
  if (!body.after_image_url) return NextResponse.json({ error: "After image URL is required." }, { status: 400 });

  const { error } = await supabase
    .from("before_after_pairs")
    .update({ after_image_url: body.after_image_url, updated_at: new Date().toISOString() })
    .eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "before-after-delete", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase } = await authorizePortalUser();
  if (!allowed) return NextResponse.json({ error: "Portal access required." }, { status: 403 });

  const params = new URL(request.url).searchParams;
  if (params.get("all") === "true") {
    const { error } = await supabase.from("before_after_pairs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }

  const id = params.get("id");
  if (!id) return NextResponse.json({ error: "Pair id is required." }, { status: 400 });
  const { error } = await supabase.from("before_after_pairs").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
