import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return badRequest("Email and password are required");
    }

    if (password.length < 8) {
      return badRequest("Password must be at least 8 characters");
    }

    if (!/[A-Z]/.test(password)) {
      return badRequest("Password must contain an uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      return badRequest("Password must contain a lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      return badRequest("Password must contain a number");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return badRequest("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const verificationLink = `${process.env.AUTH_URL || "http://localhost:3000"}/api/auth/verify-email?token=${token}`;

    try {
      const { sendVerificationEmail } = await import("@/lib/email");
      await sendVerificationEmail(email, verificationLink);
    } catch (err) {
      console.log("Verification email failed:", err);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
