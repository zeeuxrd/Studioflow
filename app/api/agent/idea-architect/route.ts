import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_id, niche, format_style } = body;

    if (!user_id || !niche) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const activeTone = 'casual';
    const startTime = Date.now();

    // Ensure the user exists in the database before saving ideas
    await prisma.user.upsert({
      where: { id: user_id },
      update: {},
      create: {
        id: user_id,
        niche: niche,
        tone_preference: activeTone,
      }
    });

    let styleInstruction = "";
    if (format_style && format_style !== 'all') {
      styleInstruction = `Ensure all generated content ideas strictly follow the '${format_style}' format style. For example, if 'how-to', structure them as actionable tutorials; if 'controversial', focus on counter-intuitive or polarizing perspectives; if 'listicle', frame them as numbered points; if 'story', frame them as narratives.`;
    }

    // Use the Vercel AI SDK to generate structured JSON via DeepSeek
    const { object } = await generateObject({
      model: deepseek('deepseek-chat'),
      system: `You are IdeaArchitect. Your goal is to generate exactly 1 highly engaging, platform-ready content idea based on the user's niche. 
      Output MUST be valid JSON matching the provided schema. Do not generate generic advice, be specific, creative, and action-oriented.`,
      prompt: `Niche: ${niche}\n${styleInstruction}\nGenerate exactly 1 brilliant content idea that this creator can post.`,
      schema: z.object({
        ideas: z.array(z.object({
          idea_text: z.string().describe("The core hook and description of the content idea. Keep it under 2 sentences."),
          category: z.string().describe("The format of the idea, e.g., 'Controversial Take', 'How-To', 'Listicle', 'Story'")
        }))
      })
    });

    // Save the generated ideas to the PostgreSQL database
    const savedIdeas = await Promise.all(object.ideas.map(idea => 
      prisma.contentIdea.create({
        data: {
          user_id: user_id,
          niche: niche,
          idea_text: idea.idea_text,
          category: idea.category,
          status: 'saved'
        }
      })
    ));

    const generationTimeMs = Date.now() - startTime;

    // Return the response strictly matching the PRD Base Output Wrapper
    return NextResponse.json({
      output: {
        ideas: savedIdeas
      },
      next_step: {
        label: "Select an idea to craft",
        action: "edit_content"
      },
      meta: {
        generation_time_ms: generationTimeMs,
        fallback_used: false
      }
    });

  } catch (error) {
    console.error("IdeaArchitect Error:", error);
    return NextResponse.json({ 
      error: "Failed to generate ideas",
      meta: { fallback_used: true }
    }, { status: 500 });
  }
}
