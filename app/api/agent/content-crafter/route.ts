import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { checkGenerationLimit, incrementGenerationCount } from '@/lib/rate-limit';
import { unauthorized, rateLimited } from '@/lib/api-error';
import { aiProvider } from '@/lib/services/aiProvider';
import type { PlatformType } from '@prisma/client';

import { isGreetingPrompt } from '@/lib/config/platforms';

interface RefinementStep {
  instruction: string;
  content_body: string;
  engagement_prediction_score?: number;
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
    const { idea_id, platform_type, post_id, refinement_prompt, format_style, niche, topic } = body;
    const activeTopic = niche || topic;

    // Refinement Branch
    if (post_id && (refinement_prompt || format_style)) {
      const startTime = Date.now();
      const existingPost = await prisma.contentPost.findFirst({
        where: { post_id, idea: { user_id: session.user.id } },
        include: { idea: { include: { user: { select: { tone_preference: true } } } } }
      });

      if (!existingPost) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      const tone = existingPost.idea?.user?.tone_preference || 'casual';
      const platform = existingPost.platform_type;
      
      const styleLabel = format_style && format_style !== 'all' ? `Revise and frame the post as a ${format_style}.` : '';
      const instructionText = refinement_prompt || 'Refine current content style.';

      const { object } = await aiService.generateObject({
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
          post_body: z.string().describe('The revised post content, formatted with line breaks and emojis.'),
          engagement_prediction_score: z.number().min(0).max(1).describe('A revised prediction score.')
        })
      });

      const existingHistory = Array.isArray(existingPost.refinement_history)
        ? (existingPost.refinement_history as unknown as RefinementStep[])
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
          refinement_history: updatedHistory as any
        }
      });

      const generationTimeMs = Date.now() - startTime;

      await incrementGenerationCount(session.user.id);

      return NextResponse.json({
        output: updatedPost,
        next_step: {
          label: 'Turn into Digital Product',
          action: 'create_product'
        },
        meta: {
          generation_time_ms: generationTimeMs,
          fallback_used: false
        }
      });
    }

    if (!idea_id && !activeTopic) {
      return NextResponse.json({ error: 'Missing required topic or idea' }, { status: 400 });
    }

    const startTime = Date.now();

    // Check for conversational greetings / inquiries
    if (isGreetingPrompt(activeTopic || '')) {
      return NextResponse.json({
        is_chat: true,
        conversational_text: `Hey! 👋 I'm your StudioFlow creator assistant. Tell me what topic you'd like to write about (e.g. "5 WFH productivity habits"), or ask me to create an ebook outline!`,
        output: null
      });
    }

    let idea = null;
    if (idea_id) {
      idea = await prisma.contentIdea.findFirst({
        where: { idea_id, user_id: session.user.id },
        include: { user: { select: { tone_preference: true } } }
      });
    }

    if (!idea && activeTopic) {
      idea = await prisma.contentIdea.create({
        data: {
          user_id: session.user.id,
          niche: activeTopic,
          idea_text: activeTopic,
          category: 'General',
          status: 'used'
        },
        include: { user: { select: { tone_preference: true } } }
      });
    }

    if (!idea) {
      return NextResponse.json({ error: 'Idea or topic not found' }, { status: 404 });
    }

    const tone = idea.user?.tone_preference || 'casual';

    let styleInstruction = '';
    if (format_style && format_style !== 'all') {
      styleInstruction = `Frame the post content strictly as a ${format_style}.`;
    }

    const { object } = await aiProvider.generateObject({
      system: `You are ContentCrafter, an elite social media ghostwriter and creator assistant. Your goal is to generate a platform-ready post from an idea text along with a warm 1-sentence ChatGPT style intro message. Output MUST be valid JSON matching the schema.`,
      prompt: `Idea: ${idea.idea_text}
Tone: ${tone}
Platform: ${platform_type}
${styleInstruction}

Write a natural 1-sentence intro (conversational_text) and the full post body perfectly tailored for this platform. Format the post_body with proper line breaks and emojis.`,
      schema: z.object({
        conversational_text: z.string().describe('A warm, natural 1-sentence intro message introducing the generated post.'),
        platform_type: z.string(),
        post_body: z.string().describe('The full generated post content, formatted with line breaks and emojis where appropriate.'),
        engagement_prediction_score: z.number().min(0).max(1).describe('A score from 0.0 to 1.0 predicting engagement.')
      })
    });

    const savedPost = await prisma.contentPost.create({
      data: {
        idea_id: idea.idea_id,
        platform_type: platform_type as PlatformType,
        content_body: object.post_body,
        engagement_prediction_score: object.engagement_prediction_score,
        status: 'draft'
      }
    });

    const generationTimeMs = Date.now() - startTime;

    await incrementGenerationCount(session.user.id);

    return NextResponse.json({
      output: { ...savedPost, conversational_text: object.conversational_text, refinement_history: [] },
      conversational_text: object.conversational_text,
      next_step: {
        label: 'Turn into Digital Product',
        action: 'create_product'
      },
      meta: {
        generation_time_ms: generationTimeMs,
        fallback_used: false
      }
    });
  } catch (error: any) {
    console.error('ContentCrafter Error:', error);
    return NextResponse.json({ 
      error: error.stack || error.toString() || 'Failed to craft content',
      meta: { fallback_used: true }
    }, { status: 500 });
  }
}
