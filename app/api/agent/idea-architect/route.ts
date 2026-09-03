import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { checkGenerationLimit, incrementGenerationCount } from '@/lib/rate-limit';
import { enforceUserRateLimit } from '@/lib/auth-rate-limit';
import { unauthorized, rateLimited } from '@/lib/api-error';
import { aiService } from '@/lib/providers/deepseek-provider';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return unauthorized();
    }

    const burst = enforceUserRateLimit(session.user.id, 'ai-generation', 10, 60_000);
    if (burst) return burst;

    const limit = await checkGenerationLimit(session.user.id);
    if (!limit.allowed) {
      return rateLimited(limit.message || 'Generation limit reached');
    }

    const body = await request.json();
    const { niche, format_style } = body;

    if (!niche) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = session.user.id;
    const activeTone = 'casual';
    const startTime = Date.now();

    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        niche: niche,
        tone_preference: activeTone,
      }
    });

    let styleInstruction = '';
    if (format_style && format_style !== 'all') {
      styleInstruction = `Ensure all generated content ideas strictly follow the '${format_style}' category angle.`;
    }

    const { object } = await aiService.generateObject({
      system: `You are IdeaArchitect. Your goal is to generate 3 highly engaging, creative, platform-ready content ideas based on the user's topic or niche. 
      Output MUST be valid JSON matching the provided schema. Do not generate generic advice, be specific, creative, and action-oriented. Provide a balanced variety of categories unless a specific category is requested.`,
      prompt: `Topic / Niche: ${niche}\n${styleInstruction}\nGenerate 3 brilliant, distinct content ideas that this creator can post.`,
      schema: z.object({
        ideas: z.array(z.object({
          idea_text: z.string().describe('The core hook and description of the content idea. Keep it concise, engaging, and under 2 sentences.'),
          category: z.enum(['Actionable Tip', 'Step-by-Step Guide', 'Key Insight', 'Story', 'Hot Take']).describe("The specific strategy category of the idea.")
        }))
      })
    });

    const savedIdeas = await Promise.all(object.ideas.map(idea => 
      prisma.contentIdea.create({
        data: {
          user_id: userId,
          niche: niche,
          idea_text: idea.idea_text,
          category: idea.category,
          status: 'saved'
        }
      })
    ));

    const generationTimeMs = Date.now() - startTime;

    await incrementGenerationCount(session.user.id);

    return NextResponse.json({
      output: { ideas: savedIdeas },
      next_step: {
        label: 'Select an idea to craft',
        action: 'edit_content'
      },
      meta: {
        generation_time_ms: generationTimeMs,
        fallback_used: false
      }
    });
  } catch (error) {
    console.error('IdeaArchitect Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate ideas',
      meta: { fallback_used: true }
    }, { status: 500 });
  }
}
