import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { post_id, product_type, product_id, refinement_prompt } = body;

    // Refinement Branch
    if (product_id && refinement_prompt) {
      const startTime = Date.now();
      const existingProduct = await prisma.productDefinition.findFirst({
        where: {
          product_id,
          source_post: { idea: { user_id: session.user.id } }
        },
        include: { source_post: true }
      });

      if (!existingProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const { object } = await generateObject({
        model: deepseek('deepseek-chat'),
        system: `You are ProductAlchemist, an expert digital product creator and monetization strategist.
        Your goal is to refine an existing digital product structure based on the user's feedback.
        Output MUST be valid JSON matching the schema.`,
        prompt: `Source Post Content: ${existingProduct.source_post?.content_body || ""}
        Product Type: ${existingProduct.product_type}
        Current Product Title: ${existingProduct.title}
        Current Product Structure: ${JSON.stringify(existingProduct.content_structure)}
        Current Price Suggestion: NGN${existingProduct.monetization_price_suggestion / 100}
        
        Refinement Instructions: ${refinement_prompt}
        
        Revise the title, content structure (chapters/modules/checklist items), and suggest an updated price in Nigerian Naira (NGN).`,
        schema: z.object({
          product_type: z.enum(['ebook', 'checklist', 'course', 'template']),
          title: z.string().describe("A revised high-converting title."),
          content_structure: z.any().describe("An updated structure outline (e.g. modules, chapters, or items)."),
          monetization_price_suggestion: z.number().min(10000).describe("Price suggestion in Nigerian Naira (NGN).")
        })
      });

      const existingHistory = Array.isArray(existingProduct.refinement_history)
        ? (existingProduct.refinement_history as any)
        : [];

      const newStep = {
        instruction: refinement_prompt,
        title: object.title,
        content_structure: object.content_structure,
        monetization_price_suggestion: object.monetization_price_suggestion * 100,
        created_at: new Date().toISOString()
      };

      const updatedHistory = [...existingHistory, newStep];

      const updatedProduct = await prisma.productDefinition.update({
        where: { product_id },
        data: {
          title: object.title,
          content_structure: object.content_structure,
          monetization_price_suggestion: object.monetization_price_suggestion * 100,
          refinement_history: updatedHistory
        }
      });

      const generationTimeMs = Date.now() - startTime;

      return NextResponse.json({
        output: updatedProduct,
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
    }

    if (!post_id || !product_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const startTime = Date.now();

    // Fetch the original content post
    const post = await prisma.contentPost.findFirst({
      where: { post_id, idea: { user_id: session.user.id } }
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

Design a compelling structure for this product. If it's a course, list modules. If it's an ebook, list chapters. Provide a catchy title and suggest a realistic selling price in Nigerian Naira (NGN). Courses must be priced at a minimum of 10,000 Naira.`,
      schema: z.object({
        product_type: z.enum(['ebook', 'checklist', 'course', 'template']),
        title: z.string().describe("A catchy, high-converting title for the digital product."),
        content_structure: z.any().describe("An object or array outlining the structure of the product (e.g., chapters, modules, or checklist items)."),
        monetization_price_suggestion: z.number().min(10000).describe("Suggested price in Nigerian Naira (NGN). Output just the number.")
      })
    });

    // Save the generated product to the database
    const savedProduct = await prisma.productDefinition.create({
      data: {
        source_post_id: post.post_id,
        product_type: object.product_type as any, // Enum
        title: object.title,
        content_structure: object.content_structure,
        monetization_price_suggestion: object.monetization_price_suggestion * 100,
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

  } catch (error: any) {
    console.error("ProductAlchemist Error:", error);
    return NextResponse.json({ 
      error: error.stack || error.toString() || "Failed to create product",
      meta: { fallback_used: true }
    }, { status: 500 });
  }
}
