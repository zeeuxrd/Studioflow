import { generateObject, generateText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import type {
  IAIService,
  GenerateObjectParams,
  GenerateObjectResult,
  GenerateTextParams,
  GenerateTextResult,
} from './ai-provider';

export class DeepseekProvider implements IAIService {
  async generateObject<T>(params: GenerateObjectParams<T>): Promise<GenerateObjectResult<T>> {
    const result = await generateObject({
      model: deepseek('deepseek-chat'),
      system: params.system,
      prompt: params.prompt,
      schema: params.schema,
    });
    return { object: result.object };
  }

  async generateText(params: GenerateTextParams): Promise<GenerateTextResult> {
    const result = await generateText({
      model: deepseek('deepseek-chat'),
      system: params.system,
      prompt: params.prompt,
    });
    return { text: result.text };
  }
}

export const aiService: IAIService = new DeepseekProvider();
