import { NextResponse } from "next/server";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { validatePricingConfig } from "@/lib/pricing/config";

export const revalidate = 60;

export async function GET() {
  const supabase = createPublicServerClient();
  const { data, error } = await supabase
    .from("cleaning_pricing_config")
    .select("config,version,updated_at")
    .eq("id", "default")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Pricing is temporarily unavailable." }, { status: 503 });
  }

  const validation = validatePricingConfig(data.config);
  if (!validation.ok) {
    return NextResponse.json({ error: "Pricing is temporarily unavailable." }, { status: 503 });
  }

  return NextResponse.json(
    { config: validation.config, version: data.version, updatedAt: data.updated_at },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
