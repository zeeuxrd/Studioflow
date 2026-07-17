import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTransaction, getTransactionByReference } from '@/lib/flutterwave';
import { recordPurchase } from '@/lib/services/purchase.service';
import type { TransactionData } from '@/lib/providers/payment-provider';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tx_ref = searchParams.get('tx_ref') || '';
    const transaction_id = searchParams.get('transaction_id') || '';

    console.log('Verify payment called:', { tx_ref, transaction_id });

    if (!tx_ref && !transaction_id) {
      return NextResponse.json({ verified: false, error: 'Missing tx_ref or transaction_id' });
    }

    if (tx_ref) {
      const existingTxn = await prisma.transaction.findUnique({
        where: { reference: tx_ref },
        select: { status: true, download_token: true },
      });
      if (existingTxn?.status === 'successful') {
        return NextResponse.json({ verified: true, download_token: existingTxn.download_token });
      }
    }

    let flutterwaveData: TransactionData | null = null;

    if (transaction_id) {
      try {
        flutterwaveData = await verifyTransaction(Number(transaction_id));
      } catch (err) {
        console.error('Verify by transaction_id failed:', err);
      }
    }

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

    if (flutterwaveData && flutterwaveData.status === 'successful') {
      const result = await recordPurchase(tx_ref, flutterwaveData);
      if (!result) {
        return NextResponse.json({ verified: false, error: 'Product not found' });
      }
      return NextResponse.json({ verified: true, download_token: result.downloadToken });
    }

    return NextResponse.json({ verified: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    console.error('Verify endpoint error:', err);
    return NextResponse.json({ verified: false, error: message });
  }
}
