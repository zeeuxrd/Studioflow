import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/webhook-verifier';
import { activateSubscription, cancelSubscriptionPlan } from '@/lib/services/subscription.service';
import { apiError } from '@/lib/api-error';

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

    if (event.event === 'subscription.charge') {
      const { id, status, tx_ref } = event.data;
      if (status !== 'successful') {
        return NextResponse.json({ message: 'Payment not successful' });
      }
      await activateSubscription(tx_ref, String(id));
    }

    if (event.event === 'subscription.cancelled') {
      const { id } = event.data;
      await cancelSubscriptionPlan(String(id));
    }

    return NextResponse.json({ message: 'Processed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    console.error('Subscription webhook error:', err);
    return apiError(message, 500);
  }
}
