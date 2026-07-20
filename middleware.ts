import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    const signinUrl = new URL("/signin", req.url);
    return NextResponse.redirect(signinUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding"],
};
