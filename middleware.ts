import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) {
    const signinUrl = new URL("/signin", req.url);
    return NextResponse.redirect(signinUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding"],
};
