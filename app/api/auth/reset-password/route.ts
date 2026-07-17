import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { badRequest } from "@/lib/api-error";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return badRequest("Token and password are required");
    }

    if (password.length < 6) {
      return badRequest("Password must be at least 6 characters");
    }

    const stored = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!stored || stored.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: stored.identifier },
      data: { password: hashedPassword },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
