import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";
import { enforceAuthRateLimit } from "@/lib/auth-rate-limit";

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  // Rate limit credentials sign-in attempts: 3 per minute per IP.
  if (req.nextUrl.pathname.includes("/callback/")) {
    const blocked = enforceAuthRateLimit(req, "signin", 3, 60_000);
    if (blocked) return blocked;
  }
  return handlers.POST(req);
}
