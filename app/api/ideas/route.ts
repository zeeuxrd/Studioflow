import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const ideas = await prisma.contentIdea.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("Failed to fetch ideas:", error);
    return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
  }
}
