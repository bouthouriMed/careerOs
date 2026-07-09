import { AiProvider } from './ai-provider';
import { GroqProvider } from './groq-provider';

export function createAiProvider(): AiProvider {
  return new GroqProvider();
}
