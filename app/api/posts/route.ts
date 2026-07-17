import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('post_id');

    // Single post fetch
    if (postId) {
      const post = await prisma.contentPost.findFirst({
        where: { post_id: postId, idea: { user_id: session.user.id } },
        include: { idea: { select: { idea_id: true, idea_text: true, niche: true, created_at: true } } }
      });
      if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
      return NextResponse.json({
        post: {
          ...post,
          refinement_history: (post.refinement_history as any[]) || []
        }
      });
    }

    const posts = await prisma.contentPost.findMany({
      where: { idea: { user_id: session.user.id } },
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
    console.error('Failed to fetch posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
