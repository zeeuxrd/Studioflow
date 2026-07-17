import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { checkGenerationLimit, incrementGenerationCount } from '@/lib/rate-limit';
import { unauthorized, rateLimited } from '@/lib/api-error';
import { aiService } from '@/lib/providers/deepseek-provider';
import type { ProductType, ProductStatus } from '@prisma/client';

interface RefinementStep {
  instruction: string;
  title: string;
  content_structure: any;
  full_content?: any;
  monetization_price_suggestion: number;
  created_at: string;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const limit = await checkGenerationLimit(session.user.id);
    if (!limit.allowed) {
      return rateLimited(limit.message || 'Generation limit reached');
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
        include: { source_post: { select: { content_body: true } } }
      });

      if (!existingProduct) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const { object } = await aiService.generateObject({
        system: `You are ProductAlchemist, an expert digital product creator and monetization strategist.
        Your goal is to refine an existing digital product based on the user's feedback, including rewriting the full content.
        Output MUST be valid JSON matching the schema.`,
        prompt: `Source Post Content: ${existingProduct.source_post?.content_body || ""}
        Product Type: ${existingProduct.product_type}
        Current Product Title: ${existingProduct.title}
        Current Product Structure: ${JSON.stringify(existingProduct.content_structure)}
        Current Product Content: ${JSON.stringify(existingProduct.full_content)}
        Current Price Suggestion: NGN${existingProduct.monetization_price_suggestion / 100}
        
        Refinement Instructions: ${refinement_prompt}
        
        Revise the title, content structure, FULL written content, and suggest an updated price in Nigerian Naira (NGN).`,
        schema: z.object({
          product_type: z.enum(['ebook', 'checklist', 'course', 'template']),
          title: z.string().describe("A revised high-converting title."),
          content_structure: z.any().describe("An updated structure outline (e.g. modules, chapters, or items)."),
          full_content: z.any().describe("The COMPLETE rewritten content for each section."),
          monetization_price_suggestion: z.number().min(10000).describe("Price suggestion in Nigerian Naira (NGN).")
        })
      });

      const existingHistory = Array.isArray(existingProduct.refinement_history)
        ? (existingProduct.refinement_history as unknown as RefinementStep[])
        : [];

      const newStep = {
        instruction: refinement_prompt,
        title: object.title,
        content_structure: object.content_structure,
        full_content: object.full_content,
        monetization_price_suggestion: object.monetization_price_suggestion * 100,
        created_at: new Date().toISOString()
      };

      const updatedHistory = [...existingHistory, newStep];

      const updatedProduct = await prisma.productDefinition.update({
        where: { product_id },
        data: {
          title: object.title,
          content_structure: object.content_structure,
          full_content: object.full_content,
          monetization_price_suggestion: object.monetization_price_suggestion * 100,
          refinement_history: updatedHistory as any
        }
      });

      const generationTimeMs = Date.now() - startTime;

      await incrementGenerationCount(session.user.id);

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
    const { object } = await aiService.generateObject({
      system: `You are ProductAlchemist, an expert digital product creator and monetization strategist.
      Your goal is to turn a high-performing social media post into a complete, fully-written digital product.
      Output MUST be valid JSON matching the schema.`,
      prompt: `Source Post Content: ${post.content_body}
Requested Product Type: ${product_type}

Create a complete digital product based on the source content above.

For the \`full_content\` field, write out the FULL content for each section:
- If it's an ebook: write full chapter text for each chapter
- If it's a checklist: write detailed descriptions for each item
- If it's a course: write full lesson content for each module/lesson
- If it's a template: write the complete template with placeholders

Make the content substantial, helpful, and ready for the buyer to use immediately.
Provide a catchy title and suggest a realistic selling price in Nigerian Naira (NGN). Courses must be priced at a minimum of 10,000 Naira.`,
      schema: z.object({
        product_type: z.enum(['ebook', 'checklist', 'course', 'template']),
        title: z.string().describe("A catchy, high-converting title for the digital product."),
        content_structure: z.any().describe("An object or array outlining the structure of the product (e.g., chapters, modules, or checklist items)."),
        full_content: z.any().describe("The COMPLETE written content for the product. For ebooks: array of {chapter, content}. For checklists: array of {item, description}. For courses: array of {module, lessons: [{title, content}]}. For templates: array of {section, content}."),
        monetization_price_suggestion: z.number().min(10000).describe("Suggested price in Nigerian Naira (NGN). Output just the number.")
      })
    });

    // Save the generated product to the database
    const savedProduct = await prisma.productDefinition.create({
      data: {
        source_post_id: post.post_id,
        product_type: object.product_type as ProductType,
        title: object.title,
        content_structure: object.content_structure,
        full_content: object.full_content,
        monetization_price_suggestion: object.monetization_price_suggestion * 100,
        status: 'draft'
      }
    });

    const generationTimeMs = Date.now() - startTime;

    await incrementGenerationCount(session.user.id);

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
