import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';

export async function POST(request: Request) {
  try {
    const { content, instruction } = await request.json();
    if (!content || !instruction) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { text } = await generateText({
      model: deepseek('deepseek-chat'),
      system: 'Refine social media posts based on user feedback. Return ONLY the refined post text, no explanations.',
      prompt: `Post: ${content}\nFeedback: ${instruction}\n\nRefined post:`
    });

    return NextResponse.json({ output: { post_body: text } });

  } catch (error) {
    console.error("Refine error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
