import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { checkGenerationLimit, incrementGenerationCount } from '@/lib/rate-limit';
import { unauthorized, rateLimited, badRequest } from '@/lib/api-error';
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

    const { content, instruction } = await request.json();
    if (!content || !instruction) {
      return badRequest("Missing fields");
    }

    const { text } = await aiService.generateText({
      system: 'Refine social media posts based on user feedback. Return ONLY the refined post text, no explanations.',
      prompt: `Post: ${content}\nFeedback: ${instruction}\n\nRefined post:`
    });

    await incrementGenerationCount(session.user.id);

    return NextResponse.json({ output: { post_body: text } });

  } catch (error) {
    console.error("Refine error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
