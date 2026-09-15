import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const CALGARY_REGION_VIEWBOX = "-114.55,51.40,-113.55,50.65";
const USER_AGENT = "CamzCleaningWebsite/1.0 (https://camzcleaning.com)";

const errorResponse = (message: string, status: number) =>
  NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );

const fetchNominatim = async (url: URL) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      "User-Agent": USER_AGENT,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`Address provider returned ${response.status}`);
  }

  return response.json();
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");

  try {
    if (type === "search") {
      const query = searchParams.get("q")?.trim() ?? "";

      if (query.length < 6 || query.length > 250) {
        return errorResponse("Enter a complete service address.", 400);
      }

      const url = new URL("/search", NOMINATIM_BASE_URL);
      url.searchParams.set("q", query);
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("countrycodes", "ca");
      url.searchParams.set("layer", "address");
      url.searchParams.set("limit", "5");
      url.searchParams.set("viewbox", CALGARY_REGION_VIEWBOX);
      url.searchParams.set("bounded", "1");
      url.searchParams.set("accept-language", "en");

      const data = await fetchNominatim(url);
      return NextResponse.json(data, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    if (type === "reverse") {
      const lat = Number(searchParams.get("lat"));
      const lng = Number(searchParams.get("lng"));

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        return errorResponse("Invalid coordinates.", 400);
      }

      const url = new URL("/reverse", NOMINATIM_BASE_URL);
      url.searchParams.set("lat", String(lat));
      url.searchParams.set("lon", String(lng));
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("zoom", "18");
      url.searchParams.set("accept-language", "en");

      const data = await fetchNominatim(url);
      return NextResponse.json(data, {
        headers: { "Cache-Control": "no-store" },
      });
    }

    return errorResponse("Unsupported geocoding request.", 400);
  } catch (error) {
    console.error("Geocoding proxy failed:", error);
    return errorResponse(
      "Address lookup is temporarily unavailable. Please try again.",
      502,
    );
  }
}
