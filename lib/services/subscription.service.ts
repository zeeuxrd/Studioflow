import { prisma } from '@/lib/prisma';

export async function activateSubscription(txRef: string, flutterwaveSubId: string, plan?: string, billingPeriod?: string) {
  const periodStart = new Date();
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const existing = await prisma.subscription.findFirst({
    where: {
      OR: [
        { flutterwave_tx_ref: txRef },
        { flutterwave_subscription_id: flutterwaveSubId },
      ],
    },
  });

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: 'active',
        flutterwave_subscription_id: flutterwaveSubId,
        current_period_start: periodStart,
        current_period_end: periodEnd,
      },
    });
    await prisma.user.update({
      where: { id: existing.user_id },
      data: { plan: existing.plan },
    });
    return;
  }

  if (txRef) {
    const userIdPrefix = txRef.split('_')[1];
    if (userIdPrefix) {
      const user = await prisma.user.findFirst({
        where: { id: { startsWith: userIdPrefix } },
      });
      if (user) {
        await prisma.subscription.create({
          data: {
            user_id: user.id,
            plan: (plan as any) || 'starter',
            status: 'active',
            billing_period: billingPeriod || 'monthly',
            flutterwave_subscription_id: flutterwaveSubId,
            flutterwave_tx_ref: txRef,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          },
        });
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: (plan as any) || 'starter' },
        });
      }
    }
  }
}

export async function cancelSubscriptionPlan(flutterwaveSubId: string) {
  const sub = await prisma.subscription.findFirst({
    where: { flutterwave_subscription_id: flutterwaveSubId },
  });
  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'cancelled' },
    });
    await prisma.user.update({
      where: { id: sub.user_id },
      data: { plan: 'free' },
    });
  }
}
