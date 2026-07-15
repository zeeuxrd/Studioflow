import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
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

    const resetLink = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password/${token}`;

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
