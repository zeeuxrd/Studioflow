import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Fetch all tracking events for this user
    const events = await prisma.monetizationTracking.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    // Calculate aggregated metrics
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
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
