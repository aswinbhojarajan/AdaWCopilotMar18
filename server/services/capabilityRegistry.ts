import type { IntentClassification } from '../../shared/schemas/agent';

export type Capability =
  | 'streaming'
  | 'tool_calling'
  | 'json_mode'
  | 'long_context'
  | 'reasoning'
  | 'vision'
  | 'fast_response';

export interface ModelCapabilities {
  alias: string;
  model: string;
  capabilities: Set<Capability>;
  maxContextTokens: number;
  costTier: 'low' | 'medium' | 'high';
}

const REGISTRY: Record<string, ModelCapabilities> = {
  'ada-fast': {
    alias: 'ada-fast',
    model: 'gpt-5-mini',
    capabilities: new Set(['streaming', 'tool_calling', 'json_mode', 'fast_response']),
    maxContextTokens: 128000,
    costTier: 'low',
  },
  'ada-reason': {
    alias: 'ada-reason',
    model: 'gpt-5-mini',
    capabilities: new Set(['streaming', 'tool_calling', 'json_mode', 'reasoning', 'long_context']),
    maxContextTokens: 128000,
    costTier: 'medium',
  },
};

export function getModelCapabilities(alias: string): ModelCapabilities | undefined {
  return REGISTRY[alias];
}

export function hasCapability(alias: string, cap: Capability): boolean {
  const entry = REGISTRY[alias];
  return entry ? entry.capabilities.has(cap) : false;
}

export function listModels(): ModelCapabilities[] {
  return Object.values(REGISTRY);
}

export function bestModelForIntent(intent: IntentClassification['primary_intent']): string {
  const needsReasoning = [
    'portfolio_health',
    'recommendation_request',
    'workflow_request',
    'execution_request',
  ];

  if (needsReasoning.includes(intent)) {
    return 'ada-reason';
  }

  return 'ada-fast';
}

export function getCapabilitySummary(alias: string): string {
  const entry = REGISTRY[alias];
  if (!entry) return `Unknown model alias: ${alias}`;

  const caps = Array.from(entry.capabilities).join(', ');
  return `Model ${entry.model} (${alias}): capabilities=[${caps}], context=${entry.maxContextTokens}, cost=${entry.costTier}`;
}

export function registerModel(alias: string, caps: ModelCapabilities): void {
  REGISTRY[alias] = caps;
}
