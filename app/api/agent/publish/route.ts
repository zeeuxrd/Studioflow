import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'Missing product_id' }, { status: 400 });
    }

    const product = await prisma.productDefinition.findFirst({
      where: {
        product_id,
        source_post: { idea: { user_id: session.user.id } }
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updatedProduct = await prisma.productDefinition.update({
      where: { product_id },
      data: { status: 'published' }
    });

    for (let i = 0; i < 3; i++) {
      await prisma.monetizationTracking.create({
        data: {
          user_id: session.user.id,
          content_id: product_id,
          conversion_type: 'purchase',
          revenue_estimate: product.monetization_price_suggestion
        }
      });
    }

    await prisma.monetizationTracking.create({
      data: {
        user_id: session.user.id,
        content_id: product_id,
        conversion_type: 'product_creation',
        revenue_estimate: 0
      }
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Publish Error:', error);
    return NextResponse.json({ error: 'Failed to publish product' }, { status: 500 });
  }
}
