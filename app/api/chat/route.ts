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
    const { prompt, post_id } = body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const trimmedPrompt = prompt.trim();

    // AI Semantic Intent Classifier (Supports ALL languages & phrasing naturally)
    const { object: classification } = await aiService.generateObject({
      system: `You are StudioFlow's AI Intent Classifier. Analyze the user's input prompt in ANY language and classify their intent into one of 4 categories:
      1. 'chat': General greetings, pleasantries, questions about how the platform works, or general conversational Q&A.
      2. 'product': User wants to generate an Ebook, Course, Checklist, Book, Lead Magnet, or Digital Product (in any language).
      3. 'post': User wants to draft, write, or adapt a social media post for LinkedIn, X (Twitter), Instagram, or TikTok.
      4. 'ideas': User wants to brainstorm or generate content ideas / topics / hooks.

      Output MUST be valid JSON matching the schema.`,
      prompt: `User Input: ${trimmedPrompt}`,
      schema: z.object({
        intent: z.enum(['chat', 'ideas', 'post', 'product']),
        detected_platform: z.enum(['LinkedIn', 'X', 'Instagram', 'TikTok']).default('LinkedIn'),
        detected_product_type: z.enum(['ebook', 'checklist', 'course', 'template']).default('ebook')
      })
    });

    const userIntent = classification.intent;

    // 1. General Greeting or Help (Conversational Chat)
    if (userIntent === 'chat') {
      const { object: chatResp } = await aiService.generateObject({
        system: `You are StudioFlow, an AI-powered creator assistant. Answer the user's prompt in a friendly, helpful, conversational tone in the same language as their input.`,
        prompt: `User Input: ${trimmedPrompt}`,
        schema: z.object({
          message_text: z.string().describe('Friendly, conversational response')
        })
      });

      return NextResponse.json({
        message_text: chatResp.message_text,
        intent: 'chat',
      });
    }

    // 2. Digital Product Generation
    if (userIntent === 'product') {
      let targetPost = null;

      if (post_id) {
        targetPost = await prisma.contentPost.findFirst({
          where: { post_id, idea: { user_id: session.user.id } },
          include: { idea: true }
        });
      }

      let sourcePostId = targetPost?.post_id;
      let sourceContent = targetPost?.content_body || trimmedPrompt;

      if (!sourcePostId) {
        const newIdea = await prisma.contentIdea.create({
          data: {
            user_id: session.user.id,
            niche: trimmedPrompt.slice(0, 100),
            idea_text: trimmedPrompt,
            category: 'General',
            status: 'used'
          }
        });

        const newPost = await prisma.contentPost.create({
          data: {
            idea_id: newIdea.idea_id,
            platform_type: 'LinkedIn',
            content_body: trimmedPrompt,
            engagement_prediction_score: 0.85,
            status: 'draft'
          }
        });

        sourcePostId = newPost.post_id;
      }

      const productType = classification.detected_product_type || 'ebook';

      const { object } = await aiService.generateObject({
        system: `You are ProductAlchemist, an elite AI author and monetization strategist. Your goal is to write out COMPLETE, FULL-LENGTH reading content for digital products (ebooks, courses, or checklists). Write complete, detailed reading prose paragraphs for Chapter 1, Chapter 2, Chapter 3, etc. DO NOT return brief summary outlines—write out the actual full book text with complete prose paragraphs, detailed section explanations, strategies, and action steps. Output MUST be valid JSON matching the schema.`,
        prompt: `Source Content / Topic: ${sourceContent}
        Requested Product Type: ${productType}
        Instructions: ${trimmedPrompt}
        
        Write out full comprehensive chapters (at least 3 detailed chapters). Each chapter must contain rich reading prose paragraphs, section breakdowns, and actionable takeaways.`,
        schema: z.object({
          title: z.string().describe('Catchy, value-focused product title'),
          chapters: z.array(
            z.object({
              chapter_number: z.number(),
              chapter_title: z.string().describe('Full Title of the Chapter'),
              prose_content: z.string().describe('Full reading text paragraphs with complete explanations and advice.'),
              action_takeaways: z.array(z.string()).describe('Key action steps or takeaways for this chapter.')
            })
          ).describe('Array of full detailed chapters'),
          monetization_price_suggestion: z.number().describe('Suggested price in USD')
        })
      });

      const fullTextString = object.chapters.map(c => {
        const formattedProse = c.prose_content.split(/\n+/).filter(p => p.trim()).join('\n\n');
        const formattedTakeaways = c.action_takeaways.map(a => `• ${a}`).join('\n');
        return `## ${c.chapter_title}\n\n${formattedProse}\n\n**Key Takeaways & Action Steps:**\n${formattedTakeaways}`;
      }).join('\n\n---\n\n');

      const newProduct = await prisma.productDefinition.create({
        data: {
          source_post_id: sourcePostId,
          product_type: productType,
          title: object.title,
          content_structure: fullTextString,
          full_content: object.chapters as any,
          monetization_price_suggestion: object.monetization_price_suggestion,
          status: 'draft'
        }
      });

      await incrementGenerationCount(session.user.id);

      return NextResponse.json({
        message_text: `I've authored a complete, full-length digital ${productType} for your topic! Below is the preview:`,
        intent: 'product',
        payload: newProduct
      });
    }

    // 3. Post Drafting & Adaptation
    if (userIntent === 'post' || (post_id && userIntent === 'ideas')) {
      const platform = classification.detected_platform || 'LinkedIn';

      const { object } = await aiService.generateObject({
        system: `You are ContentCrafter, an elite social media ghostwriter. Generate a platform-ready post based on the user's topic or instructions. Output MUST be valid JSON matching the schema.`,
        prompt: `User Request: ${trimmedPrompt}
        Target Platform: ${platform}
        Write an engaging, high-converting social media post with hook, core value points, call to action, and relevant hashtags.`,
        schema: z.object({
          platform_type: z.string(),
          post_body: z.string().describe('The post content formatted with line breaks and emojis'),
          engagement_prediction_score: z.number().min(0).max(1).describe('Predicted engagement score 0-1')
        })
      });

      const newIdea = await prisma.contentIdea.create({
        data: {
          user_id: session.user.id,
          niche: trimmedPrompt.slice(0, 100),
          idea_text: trimmedPrompt,
          category: 'General',
          status: 'used'
        }
      });

      const newPost = await prisma.contentPost.create({
        data: {
          idea_id: newIdea.idea_id,
          platform_type: object.platform_type as any,
          content_body: object.post_body,
          engagement_prediction_score: object.engagement_prediction_score,
          status: 'draft'
        }
      });

      await incrementGenerationCount(session.user.id);

      return NextResponse.json({
        message_text: `Here is your crafted ${platform} post:`,
        intent: 'post',
        payload: newPost
      });
    }

    // 4. Default: Idea Generation & Brainstorming
    const { object } = await aiService.generateObject({
      system: `You are IdeaArchitect. Generate 3 highly engaging, platform-ready content ideas based on the user's topic or niche. Output MUST be valid JSON matching the schema.`,
      prompt: `Topic / Niche: ${trimmedPrompt}`,
      schema: z.object({
        ideas: z.array(
          z.object({
            idea_text: z.string().describe('Specific, actionable content hook or concept'),
            category: z.string().describe('e.g. Actionable Tip, Step-by-Step Guide, Hot Take, Story')
          })
        ).length(3)
      })
    });

    const savedIdeas = await Promise.all(
      object.ideas.map(async (item) => {
        return prisma.contentIdea.create({
          data: {
            user_id: session.user.id,
            niche: trimmedPrompt,
            idea_text: item.idea_text,
            category: item.category,
            status: 'saved'
          }
        });
      })
    );

    await incrementGenerationCount(session.user.id);

    return NextResponse.json({
      message_text: `Here are 3 tailored content ideas for **"${trimmedPrompt}"**:`,
      intent: 'ideas',
      payload: savedIdeas
    });

  } catch (error: any) {
    console.error('API Error in /api/chat:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
