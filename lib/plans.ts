export const PLANS = {
  free: { label: 'Free', price_monthly: 0, price_yearly: 0, generations: 7 },
  starter: { label: 'Starter', price_monthly: 7000, price_yearly: 20000, generations: 50 },
  creator: { label: 'Creator', price_monthly: 14000, price_yearly: 50000, generations: 200 },
  pro: { label: 'Pro', price_monthly: 30000, price_yearly: 100000, generations: -1 },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanGenerations(plan: PlanKey): number {
  return PLANS[plan].generations;
}
