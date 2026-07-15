import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const postId = searchParams.get('post_id');

    // Single post fetch
    if (postId) {
      const post = await prisma.contentPost.findUnique({
        where: { post_id: postId },
        include: { idea: { select: { idea_id: true, idea_text: true, niche: true, created_at: true } } }
      });
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json({
        post: {
          ...post,
          refinement_history: (post.refinement_history as any[]) || []
        }
      });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    const posts = await prisma.contentPost.findMany({
      where: { idea: { user_id: userId } },
      include: { idea: { select: { idea_id: true, idea_text: true, niche: true, created_at: true } } },
      orderBy: { post_id: 'desc' },
      take: 20,
    });

    const postsWithRefinements = posts.map(p => ({
      ...p,
      refinement_history: (p.refinement_history as any[]) || []
    }));

    return NextResponse.json({ posts: postsWithRefinements });
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
