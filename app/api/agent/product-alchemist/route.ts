import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { post_id, product_type } = body;

    if (!post_id || !product_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const startTime = Date.now();

    // Fetch the original content post
    const post = await prisma.contentPost.findUnique({
      where: { post_id }
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Use DeepSeek to generate the product structure
    const { object } = await generateObject({
      model: deepseek('deepseek-chat'),
      system: `You are ProductAlchemist, an expert digital product creator and monetization strategist.
      Your goal is to turn a high-performing social media post into a structured digital product outline.
      Output MUST be valid JSON matching the schema.`,
      prompt: `Source Post Content: ${post.content_body}
Requested Product Type: ${product_type}

Design a compelling structure for this product. If it's a course, list modules. If it's an ebook, list chapters. Provide a catchy title and suggest a realistic selling price in USD.`,
      schema: z.object({
        product_type: z.enum(['ebook', 'checklist', 'course', 'template']),
        title: z.string().describe("A catchy, high-converting title for the digital product."),
        content_structure: z.any().describe("An object or array outlining the structure of the product (e.g., chapters, modules, or checklist items)."),
        monetization_price_suggestion: z.number().min(0).describe("Suggested price in USD. Include disclaimer: 'This is an estimate. Actual earnings may vary.' mentally, but just output the number here.")
      })
    });

    // Save the generated product to the database
    const savedProduct = await prisma.productDefinition.create({
      data: {
        source_post_id: post.post_id,
        product_type: object.product_type as any, // Enum
        title: object.title,
        content_structure: object.content_structure,
        monetization_price_suggestion: object.monetization_price_suggestion,
        status: 'draft'
      }
    });

    const generationTimeMs = Date.now() - startTime;

    return NextResponse.json({
      output: savedProduct,
      next_step: {
        label: "Publish Product",
        action: "publish_product"
      },
      meta: {
        generation_time_ms: generationTimeMs,
        fallback_used: false,
        disclaimer: "This is an estimate. Actual earnings may vary."
      }
    });

  } catch (error) {
    console.error("ProductAlchemist Error:", error);
    return NextResponse.json({ 
      error: "Failed to create product",
      meta: { fallback_used: true }
    }, { status: 500 });
  }
}
