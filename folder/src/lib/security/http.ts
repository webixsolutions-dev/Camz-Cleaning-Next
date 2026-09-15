import { createHash } from "crypto";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type LimitOptions = {
  bucket: string;
  limit: number;
  windowSeconds: number;
};

type MemoryEntry = { count: number; resetAt: number };
const memoryLimiter = new Map<string, MemoryEntry>();

function getClientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function hashKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function memoryCheck(key: string, limit: number, windowSeconds: number) {
  const now = Date.now();
  const current = memoryLimiter.get(key);
  if (!current || current.resetAt <= now) {
    memoryLimiter.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  current.count += 1;
  memoryLimiter.set(key, current);
  return current.count <= limit;
}

async function distributedCheck(key: string, limit: number, windowSeconds: number) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) return null;

  try {
    const admin = createServiceClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await admin.rpc("security_check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) return null;
    return data === true;
  } catch {
    return null;
  }
}

export async function enforceRateLimit(request: NextRequest, options: LimitOptions) {
  const ip = getClientIp(request);
  const key = hashKey(`${options.bucket}:${ip}`);
  const distributed = await distributedCheck(key, options.limit, options.windowSeconds);
  const allowed = distributed ?? memoryCheck(key, options.limit, options.windowSeconds);
  if (allowed) return null;

  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": String(options.windowSeconds),
        "Cache-Control": "no-store",
      },
    },
  );
}

export function enforceSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const expected = new URL(request.url).origin;
  if (origin === expected) return null;

  return NextResponse.json(
    { error: "Cross-site request rejected." },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}

export async function enforceMutationSecurity(
  request: NextRequest,
  options: LimitOptions = { bucket: "mutation", limit: 60, windowSeconds: 60 },
) {
  const sameOriginError = enforceSameOrigin(request);
  if (sameOriginError) return sameOriginError;
  return enforceRateLimit(request, options);
}

export async function readJsonBody<T>(request: NextRequest, maxBytes = 64 * 1024): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBytes) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export function securityErrorResponse(error: unknown) {
  if (error instanceof Error && error.message === "REQUEST_TOO_LARGE") {
    return NextResponse.json({ error: "Request body is too large." }, { status: 413 });
  }
  if (error instanceof Error && error.message === "INVALID_JSON") {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  return null;
}
