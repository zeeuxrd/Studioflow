import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTransaction, getTransactionByReference } from '@/lib/flutterwave';

async function savePayment(txRef: string, flutterwaveData: any) {
  const productId = txRef.split('-')[1];
  const product = await prisma.productDefinition.findUnique({
    where: { product_id: productId },
    include: { source_post: { include: { idea: true } } },
  });
  if (!product) return;

  const ownerId = product.source_post.idea.user_id;
  const paidKobo = flutterwaveData.amount * 100;

  const existingTxn = await prisma.transaction.findUnique({
    where: { reference: txRef },
  });
  if (existingTxn) return;

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        transaction_id: String(flutterwaveData.id),
        reference: txRef,
        product_id: product.product_id,
        buyer_email: flutterwaveData.customer?.email || '',
        amount: paidKobo,
        currency: flutterwaveData.currency || 'NGN',
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
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tx_ref = searchParams.get('tx_ref') || '';
    const transaction_id = searchParams.get('transaction_id') || '';

    console.log('Verify payment called:', { tx_ref, transaction_id });

    if (!tx_ref && !transaction_id) {
      return NextResponse.json({ verified: false, error: 'Missing tx_ref or transaction_id' });
    }

    // 1. Check DB first (webhook already processed)
    if (tx_ref) {
      const existingTxn = await prisma.transaction.findUnique({
        where: { reference: tx_ref },
        select: { status: true },
      });
      if (existingTxn?.status === 'successful') {
        return NextResponse.json({ verified: true });
      }
    }

    let flutterwaveData: any = null;

    // 2. Try verify by transaction_id
    if (transaction_id) {
      try {
        flutterwaveData = await verifyTransaction(Number(transaction_id));
      } catch (err) {
        console.error('Verify by transaction_id failed:', err);
      }
    }

    // 3. Fallback: try lookup by tx_ref
    if (!flutterwaveData && tx_ref) {
      try {
        const result = await getTransactionByReference(tx_ref);
        if (Array.isArray(result) && result.length > 0) {
          flutterwaveData = result[0];
        }
      } catch (err) {
        console.error('Verify by tx_ref failed:', err);
      }
    }

    // 4. If Flutterwave confirmed, save and return success
    if (flutterwaveData && flutterwaveData.status === 'successful') {
      await savePayment(tx_ref, flutterwaveData);
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    console.error('Verify endpoint error:', err);
    return NextResponse.json({ verified: false, error: message });
  }
}
