import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceMutationSecurity, readJsonBody, securityErrorResponse } from "@/lib/security/http";

async function authorizeAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, supabase };
  const { data: profile } = await supabase.from("users").select("role,is_blocked").eq("id", user.id).maybeSingle();
  return { allowed: profile?.role?.toLowerCase() === "admin" && profile.is_blocked === false, supabase };
}

export async function GET() {
  const { allowed, supabase } = await authorizeAdmin();
  if (!allowed) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  const [settings, tasks] = await Promise.all([
    supabase.from("cleaning_estimator_settings").select("*").eq("id", true).single(),
    supabase.from("cleaning_estimator_tasks").select("*").order("sort_order"),
  ]);
  if (settings.error || tasks.error) return NextResponse.json({ error: "Estimator migration has not been applied." }, { status: 500 });
  return NextResponse.json({ settings: settings.data, tasks: tasks.data });
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, { bucket: "admin-estimator-settings", limit: 30, windowSeconds: 60 });
  if (securityError) return securityError;
  const { allowed, supabase } = await authorizeAdmin();
  if (!allowed) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  let body: { settings?: Record<string, unknown>; tasks?: Array<Record<string, unknown>> };
  try { body = await readJsonBody(request, 256 * 1024); }
  catch (error) { return securityErrorResponse(error) || NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const allowedSettings = ["version","base_price_cents","included_minutes","extra_hour_cents","billing_increment_minutes","gst_rate","carpet_minimum_cents","carpet_room_cents","carpet_hall_cents","carpet_stairs_cents","carpet_closet_cents","carpet_heavy_from_cents","manual_quote_minutes","popup_trigger_minutes","time_mode_enabled","price_mode_enabled"];
  if (body.settings) {
    if (body.settings.time_mode_enabled === false && body.settings.price_mode_enabled === false) {
      return NextResponse.json({ error: "At least one customer estimator mode must remain enabled." }, { status: 400 });
    }
    const updates = Object.fromEntries(allowedSettings.filter(key => key in body.settings!).map(key => [key, body.settings![key]]));
    const { error } = await supabase.from("cleaning_estimator_settings").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", true);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (body.tasks?.length) {
    for (const item of body.tasks) {
      const taskId = typeof item.task_id === "string" ? item.task_id : "";
      if (!taskId) continue;
      const update = {
        label: item.label,
        minutes_min: item.minutes_min,
        minutes_max: item.minutes_max,
        baseline: item.baseline === true,
        customer_visible: item.customer_visible !== false,
        admin_active: item.admin_active !== false,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("cleaning_estimator_tasks").update(update).eq("task_id", taskId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
  return NextResponse.json({ ok: true });
}
