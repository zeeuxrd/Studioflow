import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, user_id } = body;

    if (!product_id || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch product to get estimated price
    const product = await prisma.productDefinition.findUnique({
      where: { product_id }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product to published
    const updatedProduct = await prisma.productDefinition.update({
      where: { product_id },
      data: { status: 'published' }
    });

    // Simulate 3 mock conversions instantly for demo purposes
    for (let i = 0; i < 3; i++) {
      await prisma.monetizationTracking.create({
        data: {
          user_id,
          content_id: product_id,
          conversion_type: 'purchase',
          revenue_estimate: product.monetization_price_suggestion
        }
      });
    }

    // Also simulate product creation tracking
    await prisma.monetizationTracking.create({
      data: {
        user_id,
        content_id: product_id,
        conversion_type: 'product_creation',
        revenue_estimate: 0
      }
    });

    return NextResponse.json({ success: true, product: updatedProduct });

  } catch (error) {
    console.error("Publish Error:", error);
    return NextResponse.json({ error: "Failed to publish product" }, { status: 500 });
  }
}
