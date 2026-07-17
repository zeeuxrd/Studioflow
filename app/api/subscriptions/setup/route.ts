import { NextResponse } from 'next/server';
import { createPaymentPlan } from '@/lib/flutterwave';
import { PLANS } from '@/lib/plans';

export async function POST() {
  try {
    const results: Record<string, any> = {};

    for (const [key, plan] of Object.entries(PLANS)) {
      if (key === 'free') continue;

      const monthly = await createPaymentPlan({
        name: `${plan.label} Monthly`,
        amount: plan.price_monthly,
        interval: 'monthly',
      });
      results[`${key}_monthly`] = monthly.plan_id;

      const yearly = await createPaymentPlan({
        name: `${plan.label} Yearly`,
        amount: plan.price_yearly,
        interval: 'yearly',
      });
      results[`${key}_yearly`] = yearly.plan_id;
    }

    return NextResponse.json({
      message: 'Payment plans created',
      plans: results,
      note: 'Add these plan IDs to your .env file',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Setup failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
