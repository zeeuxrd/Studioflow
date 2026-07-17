import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await prisma.productDefinition.findMany({
      where: { source_post: { idea: { user_id: session.user.id } } },
      include: { 
        source_post: { 
          select: { 
            content_body: true, 
            platform_type: true,
            idea: {
              select: {
                created_at: true
              }
            }
          } 
        } 
      },
      orderBy: { product_id: 'desc' },
      take: 20,
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productIds = searchParams.get('ids');

    if (!productIds) {
      return NextResponse.json({ error: 'Missing ids' }, { status: 400 });
    }

    const ids = productIds.split(',');

    await prisma.productDefinition.deleteMany({
      where: {
        product_id: { in: ids },
        source_post: { idea: { user_id: session.user.id } }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete products:', error);
    return NextResponse.json({ error: 'Failed to delete products' }, { status: 500 });
  }
}
