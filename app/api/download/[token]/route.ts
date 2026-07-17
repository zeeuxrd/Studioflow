import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const transaction = await prisma.transaction.findUnique({
      where: { download_token: token },
      include: {
        product: {
          include: { source_post: true },
        },
      },
    });

    if (!transaction || transaction.status !== 'successful') {
      return NextResponse.json({ error: 'Invalid or expired download token' }, { status: 404 });
    }

    const product = transaction.product;
    let text = `${product.title}\n${'='.repeat(product.title.length)}\n\n`;

    if (product.full_content) {
      const content = product.full_content as any[];
      if (Array.isArray(content)) {
        for (const item of content) {
          const heading = item.chapter || item.module || item.item || item.section || item.title || '';
          const body = item.content || item.description || '';
          if (heading) text += `## ${heading}\n\n`;
          if (typeof body === 'string') text += `${body}\n\n`;
          if (Array.isArray(item.lessons)) {
            for (const lesson of item.lessons) {
              if (lesson.title) text += `### ${lesson.title}\n\n`;
              if (lesson.content) text += `${lesson.content}\n\n`;
            }
          }
        }
      }
    } else if (product.source_post) {
      text += `${product.source_post.content_body}\n\n`;
    }

    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${product.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Download failed';
    console.error('Download error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
