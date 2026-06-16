import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idea_id, platform_type } = body;

    if (!idea_id || !platform_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const startTime = Date.now();

    // Fetch the original idea and user to get context
    const idea = await prisma.contentIdea.findUnique({
      where: { idea_id },
      include: { user: true }
    });

    if (!idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const tone = idea.user?.tone_preference || 'casual';

    // Use DeepSeek to generate the content post
    const { object } = await generateObject({
      model: deepseek('deepseek-chat'),
      system: `You are ContentCrafter, an elite social media ghostwriter. Your goal is to generate a platform-ready post from an idea text. 
      Adhere strictly to the requested platform type and tone. Output MUST be valid JSON matching the schema.`,
      prompt: `Idea: ${idea.idea_text}
Tone: ${tone}
Platform: ${platform_type}

Write the full post body perfectly tailored for this platform. If it's X, use threads if needed. If it's LinkedIn, use professional hooks. Format the post_body with proper line breaks.`,
      schema: z.object({
        platform_type: z.string(),
        post_body: z.string().describe("The full generated post content, formatted with line breaks and emojis where appropriate."),
        engagement_prediction_score: z.number().min(0).max(1).describe("A score from 0.0 to 1.0 predicting engagement.")
      })
    });

    // Save the generated post to the database
    const savedPost = await prisma.contentPost.create({
      data: {
        idea_id: idea.idea_id,
        platform_type: platform_type as any, // Enum
        content_body: object.post_body,
        engagement_prediction_score: object.engagement_prediction_score,
        status: 'draft'
      }
    });

    const generationTimeMs = Date.now() - startTime;

    return NextResponse.json({
      output: savedPost,
      next_step: {
        label: "Turn into Digital Product",
        action: "create_product"
      },
      meta: {
        generation_time_ms: generationTimeMs,
        fallback_used: false
      }
    });

  } catch (error) {
    console.error("ContentCrafter Error:", error);
    return NextResponse.json({ 
      error: "Failed to craft content",
      meta: { fallback_used: true }
    }, { status: 500 });
  }
}
