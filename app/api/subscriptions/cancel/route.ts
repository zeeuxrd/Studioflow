import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { cancelFlutterwaveSubscription } from '@/lib/flutterwave';
import { unauthorized, badRequest } from '@/lib/api-error';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const sub = await prisma.subscription.findUnique({
      where: { user_id: session.user.id },
    });

    if (!sub) {
      return badRequest('No active subscription');
    }

    if (sub.flutterwave_subscription_id) {
      await cancelFlutterwaveSubscription(sub.flutterwave_subscription_id);
    }

    await prisma.subscription.update({
      where: { user_id: session.user.id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cancellation failed';
    console.error('Cancel subscription error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
