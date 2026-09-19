import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceMutationSecurity, readJsonBody, securityErrorResponse } from "@/lib/security/http";
import { CleaningPricingConfig, validatePricingConfig } from "@/lib/pricing/config";

const TABLE = "cleaning_pricing_config";
const RECORD_ID = "default";

async function authorizeAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, supabase, user: null };
  const { data: profile } = await supabase
    .from("users")
    .select("role,is_blocked")
    .eq("id", user.id)
    .maybeSingle();
  return {
    allowed: profile?.role?.toLowerCase() === "admin" && profile.is_blocked === false,
    supabase,
    user,
  };
}

function databaseError(error: { code?: string; message?: string } | null) {
  if (error?.code === "42P01") {
    return NextResponse.json(
      {
        error: "Pricing database is not installed. Run the Phase 1 cleaning pricing migration first.",
        code: "MIGRATION_REQUIRED",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ error: error?.message || "Unable to load pricing settings." }, { status: 500 });
}

export async function GET() {
  const { allowed, supabase } = await authorizeAdmin();
  if (!allowed) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const { data, error } = await supabase
    .from(TABLE)
    .select("config,version,updated_at")
    .eq("id", RECORD_ID)
    .maybeSingle();

  if (error) return databaseError(error);
  if (!data) return NextResponse.json({ error: "Pricing configuration is missing." }, { status: 404 });

  const validation = validatePricingConfig(data.config);
  if (!validation.ok) {
    return NextResponse.json({ error: `Stored pricing configuration is invalid: ${validation.error}` }, { status: 500 });
  }

  return NextResponse.json({ config: validation.config, version: data.version, updatedAt: data.updated_at });
}

export async function PATCH(request: NextRequest) {
  const securityError = await enforceMutationSecurity(request, {
    bucket: "admin-pricing-settings",
    limit: 20,
    windowSeconds: 60,
  });
  if (securityError) return securityError;

  const { allowed, supabase, user } = await authorizeAdmin();
  if (!allowed || !user) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  let body: { config?: CleaningPricingConfig; version?: number };
  try {
    body = await readJsonBody(request, 512 * 1024);
  } catch (error) {
    return securityErrorResponse(error) || NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const validation = validatePricingConfig(body.config);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });

  const version = Number(body.version);
  if (!Number.isInteger(version) || version < 1) {
    return NextResponse.json({ error: "Pricing settings version is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      config: validation.config,
      version: version + 1,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", RECORD_ID)
    .eq("version", version)
    .select("config,version,updated_at")
    .maybeSingle();

  if (error) return databaseError(error);
  if (!data) {
    return NextResponse.json(
      { error: "Pricing settings changed in another session. Refresh the page and try again.", code: "VERSION_CONFLICT" },
      { status: 409 },
    );
  }

  return NextResponse.json({ config: data.config, version: data.version, updatedAt: data.updated_at });
}
