import { NextRequest, NextResponse } from "next/server";
import { loadEstimatorDefinition } from "@/lib/cleaning-estimator";
import { submitCustomCleaningRequest } from "@/lib/custom-cleaning-submission";
import { createPublicServerClient } from "@/lib/supabase/public-server";

export async function GET() {
  const supabase = createPublicServerClient();
  const definition = await loadEstimatorDefinition(supabase);
  return NextResponse.json(definition, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
  });
}

// Backward compatibility for the original public URL. New customer links use
// the mode-specific endpoints, where the mode is enforced server-side.
export async function POST(request: NextRequest) {
  return submitCustomCleaningRequest(request, "price");
}
