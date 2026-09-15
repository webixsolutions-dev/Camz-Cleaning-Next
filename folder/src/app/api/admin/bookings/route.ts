import { enforceMutationSecurity } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type BookingUpdatePayload = {
  id?: string;
  cleaner_id?: string | null;
  status?: string | null;
};

async function authorizeAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { allowed: false, supabase };
  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();
  return { allowed: profile?.role?.toLowerCase() === "admin" && profile.is_blocked === false, supabase };
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "bookings-patch", limit: 60, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase } = await authorizeAdmin();
  if (!allowed) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const body = (await request.json()) as BookingUpdatePayload;
  if (!body.id) return NextResponse.json({ error: "Booking id is required." }, { status: 400 });

  const updates: Record<string, string | null> = {};
  if ("cleaner_id" in body) updates.cleaner_id = body.cleaner_id || null;
  if ("status" in body && body.status) updates.status = body.status;
  if (!Object.keys(updates).length) return NextResponse.json({ error: "No booking changes were provided." }, { status: 400 });

  const { error } = await supabase.from("jobs").update(updates).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
