import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { PLANS } from '@/lib/plans';
import { unauthorized } from '@/lib/api-error';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = user.plan;
    const planConfig = PLANS[plan as keyof typeof PLANS];
    const generationsLimit = planConfig.generations;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = await prisma.usageRecord.findUnique({
      where: {
        user_id_period_start: {
          user_id: user.id,
          period_start: startOfMonth,
        },
      },
    });

    const generationsUsed = usage?.generations_count || 0;

    return NextResponse.json({
      plan,
      plan_label: planConfig.label,
      billing_period: user.subscription?.billing_period || null,
      status: user.subscription?.status || 'active',
      generations: {
        used: generationsUsed,
        limit: generationsLimit === -1 ? null : generationsLimit,
        unlimited: generationsLimit === -1,
      },
      subscription: user.subscription
        ? {
            id: user.subscription.id,
            current_period_start: user.subscription.current_period_start,
            current_period_end: user.subscription.current_period_end,
          }
        : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to get subscription status';
    console.error('Subscription status error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
