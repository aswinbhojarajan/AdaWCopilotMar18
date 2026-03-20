import type { IntentClassification, PolicyDecision } from '../../shared/schemas/agent';

// Both point to the same model via Replit AI Integrations; swap STRONG_MODEL
// when a heavier model (e.g. gpt-4o) is available on this deployment.
export const FAST_MODEL = 'gpt-5-mini';
export const STRONG_MODEL = 'gpt-5-mini';

export interface ModelSelection {
  model: string;
  label: 'fast' | 'strong';
  reason: string;
  max_tokens: number;
}

export function selectModel(
  intent: IntentClassification,
  policy: PolicyDecision,
  toolCount: number,
): ModelSelection {
  if (intent.reasoning_effort === 'low' && toolCount <= 1) {
    return {
      model: FAST_MODEL,
      label: 'fast',
      reason: 'Simple query with low reasoning effort',
      max_tokens: 4096,
    };
  }

  if (
    intent.reasoning_effort === 'high' ||
    toolCount >= 3 ||
    policy.response_mode === 'restricted_advisory' ||
    intent.primary_intent === 'portfolio_health' ||
    intent.primary_intent === 'recommendation_request'
  ) {
    return {
      model: STRONG_MODEL,
      label: 'strong',
      reason: 'Complex query requiring multi-tool synthesis',
      max_tokens: 8192,
    };
  }

  return {
    model: FAST_MODEL,
    label: 'fast',
    reason: 'Standard query',
    max_tokens: 6144,
  };
}

export function getIntentClassificationModel(): string {
  return FAST_MODEL;
}
