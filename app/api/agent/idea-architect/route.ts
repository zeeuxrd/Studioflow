import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { checkGenerationLimit, incrementGenerationCount } from '@/lib/rate-limit';
import { unauthorized, rateLimited } from '@/lib/api-error';
import { aiService } from '@/lib/providers/deepseek-provider';

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
      styleInstruction = `Ensure all generated content ideas strictly follow the '${format_style}' format style.`;
    }

    const { object } = await aiService.generateObject({
      system: `You are IdeaArchitect. Your goal is to generate exactly 1 highly engaging, platform-ready content idea based on the user's niche. 
      Output MUST be valid JSON matching the provided schema. Do not generate generic advice, be specific, creative, and action-oriented.`,
      prompt: `Niche: ${niche}\n${styleInstruction}\nGenerate exactly 1 brilliant content idea that this creator can post.`,
      schema: z.object({
        ideas: z.array(z.object({
          idea_text: z.string().describe('The core hook and description of the content idea. Keep it under 2 sentences.'),
          category: z.string().describe("The format of the idea, e.g., 'Controversial Take', 'How-To', 'Listicle', 'Story'")
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
