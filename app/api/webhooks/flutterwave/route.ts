import { NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/flutterwave';
import { recordPurchase } from '@/lib/services/purchase.service';
import { verifyWebhookSignature } from '@/lib/webhook-verifier';
import { apiError } from '@/lib/api-error';
import { getBaseUrl } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    if (!secret) {
      return apiError('Webhook secret not configured', 500);
    }

    const verified = verifyWebhookSignature(body, {
      verifHash: request.headers.get('verif-hash'),
      hmacSignature: request.headers.get('Flutterwave-Verify-Signature'),
    }, secret);

    if (!verified) {
      return apiError('Invalid signature', 401);
    }

    const event = JSON.parse(body);

    if (event.event !== 'charge.completed') {
      return NextResponse.json({ message: 'Event ignored' });
    }

    const { id, tx_ref, status, amount } = event.data;

    if (status !== 'successful') {
      return NextResponse.json({ message: 'Payment not successful' });
    }

    const verification = await verifyTransaction(id);
    if (verification.status !== 'successful') {
      return apiError('Verification failed', 400);
    }

    const result = await recordPurchase(tx_ref, { ...event.data, id }, getBaseUrl(request));

    if (!result) {
      return NextResponse.json({ message: 'Could not record purchase - product may not exist' });
    }

    return NextResponse.json({ message: 'Payment recorded' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    console.error('Webhook error:', err);
    return apiError(message, 500);
  }
}
