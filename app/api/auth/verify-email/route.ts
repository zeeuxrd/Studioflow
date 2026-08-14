import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const stored = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!stored) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    if (stored.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: stored.identifier },
      data: { emailVerified: new Date() },
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.redirect(`${getBaseUrl(request)}/verify-email/success`);
  } catch (err) {
    console.error("Verify email error:", err);
    return NextResponse.redirect(`${getBaseUrl(request)}/verify-email/error`);
  }
}
