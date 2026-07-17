import { z } from 'zod';

export interface GenerateObjectParams<T> {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
}

export interface GenerateTextParams {
  system: string;
  prompt: string;
}

export interface GenerateObjectResult<T> {
  object: T;
}

export interface GenerateTextResult {
  text: string;
}

export interface IAIService {
  generateObject<T>(params: GenerateObjectParams<T>): Promise<GenerateObjectResult<T>>;
  generateText(params: GenerateTextParams): Promise<GenerateTextResult>;
}
