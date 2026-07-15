import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idea_id, platform_type, post_id, refinement_prompt, format_style } = body;

    // Refinement Branch
    if (post_id && (refinement_prompt || format_style)) {
      const startTime = Date.now();
      const existingPost = await prisma.contentPost.findUnique({
        where: { post_id },
        include: { idea: { include: { user: true } } }
      });

      if (!existingPost) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }

      const tone = existingPost.idea?.user?.tone_preference || 'casual';
      const platform = existingPost.platform_type;
      
      const styleLabel = format_style && format_style !== 'all' ? `Revise and frame the post as a ${format_style}.` : "";
      const instructionText = refinement_prompt || "Refine current content style.";

      const { object } = await generateObject({
        model: deepseek('deepseek-chat'),
        system: `You are ContentCrafter, an elite social media ghostwriter. Your goal is to refine an existing social media post based on the user's feedback instructions and format style. 
        Adhere strictly to the requested platform type and tone. Output MUST be valid JSON matching the schema.`,
        prompt: `Original Idea: ${existingPost.idea?.idea_text}
        Current Post Content: ${existingPost.content_body}
        Refinement Instructions: ${instructionText}
        Tone: ${tone}
        Platform: ${platform}
        
        ${styleLabel}
        Revise the post body according to the instructions. Maintain the platform format (e.g. threads for X).`,
        schema: z.object({
          platform_type: z.string(),
          post_body: z.string().describe("The revised post content, formatted with line breaks and emojis."),
          engagement_prediction_score: z.number().min(0).max(1).describe("A revised prediction score.")
        })
      });

      const existingHistory = Array.isArray(existingPost.refinement_history)
        ? (existingPost.refinement_history as any)
        : [];

      const newStep = {
        instruction: instructionText,
        content: object.post_body,
        created_at: new Date().toISOString()
      };

      const updatedHistory = [...existingHistory, newStep];

      const updatedPost = await prisma.contentPost.update({
        where: { post_id },
        data: {
          content_body: object.post_body,
          engagement_prediction_score: object.engagement_prediction_score,
          refinement_history: updatedHistory
        }
      });

      const generationTimeMs = Date.now() - startTime;

      return NextResponse.json({
        output: updatedPost,
        next_step: {
          label: "Turn into Digital Product",
          action: "create_product"
        },
        meta: {
          generation_time_ms: generationTimeMs,
          fallback_used: false
        }
      });
    }

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

    let styleInstruction = "";
    if (format_style && format_style !== 'all') {
      styleInstruction = `Frame the post content strictly as a ${format_style}.`;
    }

    // Use DeepSeek to generate the content post
    const { object } = await generateObject({
      model: deepseek('deepseek-chat'),
      system: `You are ContentCrafter, an elite social media ghostwriter. Your goal is to generate a platform-ready post from an idea text. 
      Adhere strictly to the requested platform type and tone. Output MUST be valid JSON matching the schema.`,
      prompt: `Idea: ${idea.idea_text}
Tone: ${tone}
Platform: ${platform_type}
${styleInstruction}

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
      output: { ...savedPost, refinement_history: [] },
      next_step: {
        label: "Turn into Digital Product",
        action: "create_product"
      },
      meta: {
        generation_time_ms: generationTimeMs,
        fallback_used: false
      }
    });

  } catch (error: any) {
    console.error("ContentCrafter Error:", error);
    return NextResponse.json({ 
      error: error.stack || error.toString() || "Failed to craft content",
      meta: { fallback_used: true }
    }, { status: 500 });
  }
}
