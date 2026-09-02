import { aiService as deepseekProvider } from '@/lib/providers/deepseek-provider';

export interface AiServiceProvider {
  generateObject<T>(params: { prompt: string; schema: any; system?: string }): Promise<{ object: T }>;
}

export const aiProvider: AiServiceProvider = {
  async generateObject(params) {
    return await deepseekProvider.generateObject(params);
  }
};
