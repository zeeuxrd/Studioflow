import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { initiateSubscription } from '@/lib/flutterwave';
import { PLANS } from '@/lib/plans';
import { unauthorized, badRequest } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const { plan, billing_period } = await request.json();

    if (!plan || !billing_period) {
      return badRequest('Missing plan or billing_period');
    }

    if (!['starter', 'creator', 'pro'].includes(plan)) {
      return badRequest('Invalid plan');
    }

    if (!['monthly', 'yearly'].includes(billing_period)) {
      return badRequest('Invalid billing period');
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    const amount = billing_period === 'monthly' ? planConfig.price_monthly : planConfig.price_yearly;
    const fieldName = `${plan}_${billing_period}`;

    const planIdVar = process.env[`FLUTTERWAVE_PLAN_${fieldName.toUpperCase()}`];
    if (!planIdVar) {
      return NextResponse.json({ error: 'Payment plan not configured. Run /api/subscriptions/setup first.' }, { status: 500 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    const tx_ref = `SUB_${session.user.id.slice(0, 8)}_${Date.now()}`;
    const redirect_url = `${process.env.AUTH_URL || 'http://localhost:3000'}/dashboard?subscription=success&tx_ref=${tx_ref}`;

    await prisma.subscription.upsert({
      where: { user_id: session.user.id },
      update: {
        plan: plan as any,
        status: 'pending',
        billing_period,
        flutterwave_tx_ref: tx_ref,
      },
      create: {
        user_id: session.user.id,
        plan: plan as any,
        status: 'pending',
        billing_period,
        flutterwave_tx_ref: tx_ref,
        current_period_start: new Date(),
        current_period_end: new Date(),
      },
    });

    const { link } = await initiateSubscription({
      email: user.email,
      amount,
      tx_ref,
      payment_plan: Number(planIdVar),
      redirect_url,
    });

    return NextResponse.json({ link, tx_ref });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Subscription initiation failed';
    console.error('Subscription create error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
