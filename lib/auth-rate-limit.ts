import { NextResponse } from "next/server";

// Simple in-memory fixed/sliding-window limiter.
// NOTE: state lives in this process's memory. Fine for a single
// server / local dev. If you scale to multiple instances, swap this
// for a shared store (e.g. Redis) keyed the same way.

const buckets = new Map<string, number[]>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function checkBucket(key: string, max: number, windowMs: number): NextResponse | null {
  const now = Date.now();

  const recent = (buckets.get(key) || []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - (now - recent[0])) / 1000)
    );
    buckets.set(key, recent);
    return NextResponse.json(
      {
        error: "Too many requests. Please try again later.",
        code: "RATE_LIMITED",
        retryAfter: retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      }
    );
  }

  recent.push(now);
  buckets.set(key, recent);
  return null;
}

/**
 * Per-IP limit (e.g. auth flows). Returns a 429 response when exceeded.
 */
export function enforceAuthRateLimit(
  req: Request,
  action: string,
  max: number,
  windowMs: number
): NextResponse | null {
  return checkBucket(`ip:${action}:${getClientIp(req)}`, max, windowMs);
}

/**
 * Per-user limit (e.g. AI burst / checkout). Returns a 429 response when exceeded.
 */
export function enforceUserRateLimit(
  userId: string,
  action: string,
  max: number,
  windowMs: number
): NextResponse | null {
  return checkBucket(`user:${action}:${userId}`, max, windowMs);
}
