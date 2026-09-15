import { getCrmActor } from "@/lib/crm/staff";
import { enforceRateLimit } from "@/lib/security/http";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_URL = "https://places.googleapis.com/v1/places";
const CALGARY = { latitude: 51.0447, longitude: -114.0719 };

function apiKey() {
  return process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
}

function component(
  components: Array<{ longText?: string; shortText?: string; types?: string[] }> | undefined,
  type: string,
  short = false,
) {
  const match = components?.find((item) => item.types?.includes(type));
  return (short ? match?.shortText : match?.longText) || "";
}

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: NextRequest) {
  const { actor, error: actorError, status } = await getCrmActor();
  if (!actor) return error(actorError || "Administrator access required.", status);

  const limited = await enforceRateLimit(request, {
    bucket: "crm-google-address",
    limit: 120,
    windowSeconds: 60,
  });
  if (limited) return limited;

  const key = apiKey();
  if (!key) {
    return NextResponse.json(
      { configured: false, suggestions: [], error: "Google address lookup is not configured. Manual entry is available." },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const action = request.nextUrl.searchParams.get("action") || "autocomplete";
  const sessionToken = request.nextUrl.searchParams.get("session_token")?.trim() || "";

  try {
    if (action === "autocomplete") {
      const input = request.nextUrl.searchParams.get("q")?.trim() || "";
      if (input.length < 3 || input.length > 220) return error("Enter at least three address characters.", 400);

      const response = await fetch(AUTOCOMPLETE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text",
        },
        body: JSON.stringify({
          input,
          sessionToken: sessionToken || undefined,
          includedRegionCodes: ["ca"],
          regionCode: "CA",
          languageCode: "en",
          locationBias: {
            circle: {
              center: CALGARY,
              radius: 80000,
            },
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(9000),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Google Places autocomplete failed:", response.status, payload);
        return error("Address suggestions are temporarily unavailable. Continue with manual entry.", 502);
      }

      const suggestions = (payload.suggestions || [])
        .map((item: any) => item.placePrediction)
        .filter(Boolean)
        .map((prediction: any) => ({
          place_id: prediction.placeId,
          text: prediction.text?.text || "",
          main_text: prediction.structuredFormat?.mainText?.text || prediction.text?.text || "",
          secondary_text: prediction.structuredFormat?.secondaryText?.text || "",
        }))
        .filter((item: { place_id?: string; text?: string }) => item.place_id && item.text);

      return NextResponse.json({ configured: true, suggestions }, { headers: { "Cache-Control": "no-store" } });
    }

    if (action === "details") {
      const placeId = request.nextUrl.searchParams.get("place_id")?.trim() || "";
      if (!placeId || placeId.length > 260) return error("A valid place is required.", 400);
      const url = new URL(`${DETAILS_URL}/${encodeURIComponent(placeId)}`);
      url.searchParams.set("languageCode", "en");
      url.searchParams.set("regionCode", "CA");
      if (sessionToken) url.searchParams.set("sessionToken", sessionToken);

      const response = await fetch(url, {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "id,formattedAddress,addressComponents,location",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(9000),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        console.error("Google Place details failed:", response.status, payload);
        return error("Unable to load the selected address. Continue with manual entry.", 502);
      }

      const components = payload.addressComponents || [];
      const streetNumber = component(components, "street_number");
      const route = component(components, "route");
      const subpremise = component(components, "subpremise");
      const city =
        component(components, "locality") ||
        component(components, "postal_town") ||
        component(components, "administrative_area_level_2");

      return NextResponse.json({
        configured: true,
        address: {
          formatted_address: payload.formattedAddress || "",
          street_number: streetNumber,
          route,
          line1: [streetNumber, route].filter(Boolean).join(" ") || payload.formattedAddress || "",
          line2: "",
          unit: subpremise,
          access_detail: "",
          city,
          province: component(components, "administrative_area_level_1", true),
          postal_code: component(components, "postal_code"),
          country: component(components, "country", true) || "CA",
          place_id: payload.id || placeId,
          latitude: payload.location?.latitude ?? null,
          longitude: payload.location?.longitude ?? null,
        },
      }, { headers: { "Cache-Control": "no-store" } });
    }

    return error("Unsupported address request.", 400);
  } catch (err) {
    console.error("CRM Google address proxy failed:", err);
    return error("Address lookup is temporarily unavailable. Continue with manual entry.", 502);
  }
}
