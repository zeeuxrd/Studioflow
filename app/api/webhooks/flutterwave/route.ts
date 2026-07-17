import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTransaction } from '@/lib/flutterwave';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('verif-hash') || '';

    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    if (secretHash && signature !== secretHash) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event !== 'charge.completed') {
      return NextResponse.json({ message: 'Event ignored' });
    }

    const { id, tx_ref, status, amount, currency, customer } = event.data;

    if (status !== 'successful') {
      return NextResponse.json({ message: 'Payment not successful' });
    }

    const verification = await verifyTransaction(id);
    if (verification.status !== 'successful') {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    const existingTxn = await prisma.transaction.findUnique({
      where: { reference: tx_ref },
    });
    if (existingTxn) {
      return NextResponse.json({ message: 'Already processed' });
    }

    const productId = tx_ref.split('-')[1];
    const product = await prisma.productDefinition.findUnique({
      where: { product_id: productId },
      include: {
        source_post: {
          include: { idea: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const paidKobo = amount * 100;
    if (paidKobo < product.monetization_price_suggestion) {
      console.error(`Amount mismatch: paid ${paidKobo} Kobo, expected at least ${product.monetization_price_suggestion} Kobo`);
      return NextResponse.json({ error: 'Payment amount is less than product price' }, { status: 400 });
    }

    const ownerId = product.source_post.idea.user_id;

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          transaction_id: String(id),
          reference: tx_ref,
          product_id: product.product_id,
          buyer_email: customer?.email || '',
          amount: paidKobo,
          currency: currency || 'NGN',
          status: 'successful',
        },
      }),
      prisma.monetizationTracking.create({
        data: {
          user_id: ownerId,
          content_id: product.product_id,
          conversion_type: 'purchase',
          revenue_estimate: paidKobo,
        },
      }),
    ]);

    return NextResponse.json({ message: 'Payment recorded' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    console.error('Webhook error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
