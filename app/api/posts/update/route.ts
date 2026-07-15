import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { post_id, refinement } = await request.json();
    if (!post_id || !refinement) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.contentPost.findUniqueOrThrow({ where: { post_id } });
    const history = Array.isArray(existing.refinement_history) ? existing.refinement_history : [];
    history.push(refinement);

    await prisma.contentPost.update({
      where: { post_id },
      data: { refinement_history: history as any }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
