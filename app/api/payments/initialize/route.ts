import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { initializePayment } from '@/lib/flutterwave';
import { badRequest } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const { product_id, buyer_email } = await request.json();

    if (!product_id || !buyer_email) {
      return badRequest('Missing product_id or buyer_email');
    }

    const product = await prisma.productDefinition.findUnique({
      where: { product_id, status: 'published' },
      include: {
        source_post: {
          include: { idea: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found or not published' }, { status: 404 });
    }

    if (product.monetization_price_suggestion <= 0) {
      return badRequest('Invalid product price');
    }

    const tx_ref = `SF_${product_id}_${Date.now()}`;
    const redirect_url = `${process.env.AUTH_URL || 'http://localhost:3000'}/products/${product_id}?payment=success`;

    const { link } = await initializePayment({
      amount: product.monetization_price_suggestion / 100,
      email: buyer_email,
      tx_ref,
      redirect_url,
      title: product.title,
    });

    return NextResponse.json({ link, reference: tx_ref });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to initialize payment';
    console.error('Payment init error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
