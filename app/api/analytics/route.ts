import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = await prisma.monetizationTracking.findMany({
      where: { user_id: session.user.id },
      orderBy: { created_at: 'desc' }
    });

    const totalRevenue = events
      .filter(e => e.conversion_type === 'purchase')
      .reduce((sum, e) => sum + (e.revenue_estimate || 0), 0);

    const productsPublished = events
      .filter(e => e.conversion_type === 'product_creation').length;

    const totalSales = events
      .filter(e => e.conversion_type === 'purchase').length;

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        productsPublished,
        totalSales
      },
      events
    });
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
