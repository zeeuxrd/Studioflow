import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/plans';

export async function checkGenerationLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number | null; message?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) {
    return { allowed: false, used: 0, limit: 0, message: 'User not found' };
  }

  const planConfig = PLANS[user.plan as keyof typeof PLANS];
  const limit = planConfig.generations;

  // Unlimited
  if (limit === -1) {
    return { allowed: true, used: 0, limit: null };
  }

  const now = new Date();
  const startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);

  const usage = await prisma.usageRecord.findUnique({
    where: {
      user_id_period_start: {
        user_id: userId,
        period_start: startOfPeriod,
      },
    },
  });

  const used = usage?.generations_count || 0;

  if (used >= limit) {
    return {
      allowed: false,
      used,
      limit,
      message: `You've used ${used}/${limit} generations this month. Upgrade to generate more.`,
    };
  }

  return { allowed: true, used, limit };
}

export async function incrementGenerationCount(userId: string): Promise<void> {
  const now = new Date();
  const startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);

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
