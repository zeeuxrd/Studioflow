import { generateObject } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { z } from 'zod';

const { object } = await generateObject({
  model: deepseek('deepseek-chat'),
  system: 'You are a content assistant.',
  prompt: 'Say hello in one sentence.',
  schema: z.object({ message: z.string() })
});

console.log("Success:", object);
