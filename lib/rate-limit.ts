import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/plans';

export async function checkGenerationLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number | null; message?: string }> {
  // Rate limiting disabled for testing
  return { allowed: true, used: 0, limit: null };
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
