import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { badRequest } from "@/lib/api-error";
import { getBaseUrl } from "@/lib/utils";
import { enforceAuthRateLimit } from "@/lib/auth-rate-limit";

export async function POST(req: Request) {
  const blocked = enforceAuthRateLimit(req, "forgot-password", 3, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const { email } = await req.json();

    if (!email) {
      return badRequest("Email is required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "If an account with that email exists, a reset link has been sent." }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const resetLink = `${getBaseUrl(req)}/reset-password/${token}`;

    try {
      const { sendPasswordResetEmail } = await import("@/lib/email");
      await sendPasswordResetEmail(email, resetLink);
    } catch {
      console.log("Email sending failed (no SMTP configured). Reset link:", resetLink);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
