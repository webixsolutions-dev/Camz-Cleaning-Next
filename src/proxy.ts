import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const IDLE_SECONDS = 30 * 60;
const ABSOLUTE_SECONDS = 12 * 60 * 60;
const textEncoder = new TextEncoder();

function isApi(request: NextRequest) {
  return request.nextUrl.pathname.startsWith("/api/");
}

function unauthorized(request: NextRequest, message = "Authentication required.") {
  if (isApi(request)) {
    return NextResponse.json(
      { error: message },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

function forbidden(request: NextRequest, message = "You do not have permission to access this page.") {
  if (isApi(request)) {
    return NextResponse.json(
      { error: message },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("error", "forbidden");
  return NextResponse.redirect(url);
}

async function importSigningKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signTimestamp(timestamp: number, secret: string) {
  const key = await importSigningKey(secret);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, textEncoder.encode(String(timestamp))));
  return `${timestamp}.${bytesToBase64Url(signature)}`;
}

async function verifyTimestamp(value: string | undefined, secret: string) {
  if (!value) return null;
  const [rawTimestamp, rawSignature] = value.split(".");
  const timestamp = Number(rawTimestamp);
  if (!Number.isFinite(timestamp) || !rawSignature) return null;

  try {
    const key = await importSigningKey(secret);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(rawSignature),
      textEncoder.encode(rawTimestamp),
    );
    return ok ? timestamp : null;
  } catch {
    return null;
  }
}

async function applySessionGuard(request: NextRequest, response: NextResponse) {
  const secret = process.env.SESSION_SIGNING_SECRET;
  if (!secret || secret.length < 32) return { response, expired: false };

  const now = Math.floor(Date.now() / 1000);
  const idle = await verifyTimestamp(request.cookies.get("camz_idle")?.value, secret);
  const started = await verifyTimestamp(request.cookies.get("camz_started")?.value, secret);

  if ((idle && now - idle > IDLE_SECONDS) || (started && now - started > ABSOLUTE_SECONDS)) {
    return { response, expired: true };
  }

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  response.cookies.set("camz_idle", await signTimestamp(now, secret), {
    ...cookieOptions,
    maxAge: IDLE_SECONDS,
  });

  if (!started) {
    response.cookies.set("camz_started", await signTimestamp(now, secret), {
      ...cookieOptions,
      maxAge: ABSOLUTE_SECONDS,
    });
  }

  return { response, expired: false };
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return unauthorized(request);

  const { data: profile } = await supabase
    .from("users")
    .select("role, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.is_blocked === true) {
    await supabase.auth.signOut();
    return unauthorized(request, "Your session is no longer authorized.");
  }

  const dbRole = String(profile.role || "").toLowerCase();
  const metaRole = String(user.app_metadata?.role || user.user_metadata?.role || user.role || "").toLowerCase();

  // Smart Role Checking
  let role = "customer"; 
  if (dbRole === "admin" || metaRole === "admin") {
    role = "admin";
  } else if (dbRole === "data_entry" || metaRole === "data_entry" || dbRole === "cleaner" || metaRole === "cleaner") {
    role = dbRole || metaRole;
  } else {
    role = "customer";
  }

  const path = request.nextUrl.pathname;

  // 🔥 THE MAGIC REDIRECT INTERCEPTOR 🔥
  if (path === "/dashboard" || path === "/dashboard/") {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    } else if (role === "data_entry" || role === "cleaner") {
      // Data entry and cleaners only have access to records as per your earlier code
      return NextResponse.redirect(new URL("/admin-dashboard/booking-records", request.url));
    } else {
      return NextResponse.redirect(new URL("/customer-dashboard", request.url));
    }
  }

  // Normal Protection Rules
  if (path.startsWith("/customer-dashboard") && role !== "customer") {
    return forbidden(request);
  }

  if (path.startsWith("/admin-dashboard")) {
    if (role === "admin") {
      // full access
    } else if (["cleaner", "data_entry"].includes(role)) {
      if (!path.startsWith("/admin-dashboard/booking-records") && !path.startsWith("/admin-dashboard/before-after")) {
        return forbidden(request);
      }
    } else {
      return forbidden(request);
    }
  }

  if (path.startsWith("/api/admin") && !["admin", "cleaner", "data_entry"].includes(role)) {
    return forbidden(request);
  }

  const guarded = await applySessionGuard(request, response);
  if (guarded.expired) {
    await supabase.auth.signOut();
    const expired = unauthorized(request, "Session expired. Please sign in again.");
    expired.cookies.delete("camz_idle");
    expired.cookies.delete("camz_started");
    return expired;
  }

  guarded.response.headers.set("Cache-Control", "no-store, max-age=0");
  guarded.response.headers.set("Pragma", "no-cache");
  return guarded.response;
}

// 🔥 ADDED "/dashboard" TO MATCHER
export const config = {
  matcher: [
    "/dashboard",
    "/admin-dashboard/:path*",
    "/customer-dashboard/:path*",
    "/api/admin/:path*",
  ],
};