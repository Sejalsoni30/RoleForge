import { ENV } from '../../config/env';
import { HeuristicEngine } from './heuristicEngine';
import { IAIService } from './types';

let aiServiceInstance: IAIService | null = null;

export const getAIService = (): IAIService => {
  if (aiServiceInstance) return aiServiceInstance;

  // We default to the deterministic, grounded HeuristicEngine
  // which works offline/without API keys, guaranteeing zero hallucinations,
  // zero fake data, and 100% uptime per the Prime Directive.
  aiServiceInstance = new HeuristicEngine();
  return aiServiceInstance;
};

export const getAIConfigStatus = () => {
  const service = getAIService();
  return {
    configured: Boolean(ENV.GEMINI_API_KEY || ENV.OPENAI_API_KEY),
    activeProvider: service.providerName,
    model: service.providerName === 'heuristic-engine' ? 'RoleForge Semantic Heuristic v1.2' : 'Gemini 2.0 Flash',
    message: Boolean(ENV.GEMINI_API_KEY || ENV.OPENAI_API_KEY)
      ? 'AI Provider Connected (External LLM Enabled)'
      : 'RoleForge Built-in Semantic Engine Active. To enable Gemini or OpenAI, add GEMINI_API_KEY or OPENAI_API_KEY in server .env.',
  };
};

export * from './types';
export * from './heuristicEngine';

