import { prisma } from '@/lib/prisma';
import { PLANS, type PlanKey, getPlanGenerations } from '@/lib/plans';

const getStartOfMonth = (date = new Date()) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

export async function checkGenerationLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number | null; message?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (!user) {
    return { allowed: false, used: 0, limit: 0, message: 'Account not found.' };
  }

  const planKey = (Object.prototype.hasOwnProperty.call(PLANS, user.plan) ? user.plan : 'free') as PlanKey;
  const limit = getPlanGenerations(planKey);

  // -1 means unlimited (Pro)
  if (limit < 0) {
    return { allowed: true, used: 0, limit: null };
  }

  const periodStart = getStartOfMonth();
  const usage = await prisma.usageRecord.findUnique({
    where: {
      user_id_period_start: {
        user_id: userId,
        period_start: periodStart,
      },
    },
    select: { generations_count: true },
  });

  const used = usage?.generations_count ?? 0;
  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      message: `You've used all ${limit} generations this month. Upgrade your plan for more.`,
    };
  }

  return { allowed: true, used, limit };
}

export async function incrementGenerationCount(userId: string): Promise<void> {
  const now = new Date();
  const startOfPeriod = getStartOfMonth(now);

  await prisma.usageRecord.upsert({
    where: {
      user_id_period_start: {
        user_id: userId,
        period_start: startOfPeriod,
      },
    },
    create: {
      user_id: userId,
      period_start: startOfPeriod,
      generations_count: 1,
    },
    update: {
      generations_count: { increment: 1 },
    },
  });
}
