import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { niche, tone_preference, platform_focus, monetization_goal } = await req.json();

  if (!niche?.trim()) {
    return NextResponse.json({ error: "Niche is required" }, { status: 400 });
  }

  const validTones = ["casual", "professional", "educational"];
  const validPlatforms = ["TikTok", "X", "Instagram", "LinkedIn"];
  const validGoals = ["grow_audience", "make_money", "stay_consistent"];

  if (!validTones.includes(tone_preference)) {
    return NextResponse.json({ error: "Invalid tone preference" }, { status: 400 });
  }

  if (!validPlatforms.includes(platform_focus)) {
    return NextResponse.json({ error: "Invalid platform focus" }, { status: 400 });
  }

  if (!validGoals.includes(monetization_goal)) {
    return NextResponse.json({ error: "Invalid monetization goal" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      niche: niche.trim(),
      tone_preference,
      platform_focus,
      monetization_goal,
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      niche: true,
      tone_preference: true,
      platform_focus: true,
      monetization_goal: true,
      name: true,
      email: true,
    }
  });

  return NextResponse.json({ success: true, user });
}
