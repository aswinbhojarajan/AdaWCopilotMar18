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
  'ada-classifier': {
    alias: 'ada-classifier',
    model: 'gpt-4.1-nano',
    capabilities: new Set(['json_mode', 'fast_response']),
    maxContextTokens: 1048576,
    costTier: 'low',
  },
  'ada-fast': {
    alias: 'ada-fast',
    model: 'gpt-4.1-mini',
    capabilities: new Set(['streaming', 'tool_calling', 'json_mode', 'fast_response']),
    maxContextTokens: 1048576,
    costTier: 'low',
  },
  'ada-reason': {
    alias: 'ada-reason',
    model: 'gpt-4.1',
    capabilities: new Set(['streaming', 'tool_calling', 'json_mode', 'reasoning', 'long_context']),
    maxContextTokens: 1048576,
    costTier: 'medium',
  },
  'ada-fallback': {
    alias: 'ada-fallback',
    model: 'claude-sonnet-4-6',
    capabilities: new Set(['streaming', 'tool_calling', 'reasoning', 'long_context']),
    maxContextTokens: 200000,
    costTier: 'medium',
  },
};

export interface LaneConfig {
  lane: number;
  label: string;
  description: string;
  providerAlias: string;
  tools: string[];
  temperature?: number;
  maxOutputTokens?: number;
  toolRounds?: number;
  maxToolCallsPerRound?: number;
}

export interface IntentRouteConfig {
  intent: IntentClassification['primary_intent'];
  defaultLane: number;
  supportedLanes: number[];
  requiredTools: string[];
  optionalTools: string[];
  description: string;
}

const LANE_CONFIGS: Record<number, LaneConfig> = {
  0: {
    lane: 0,
    label: 'Deterministic',
    description: 'Fast path for entity lookups, balance queries, and structured data retrieval. No LLM generation.',
    providerAlias: 'ada-fast',
    tools: ['portfolio_read', 'health_compute'],
  },
  1: {
    lane: 1,
    label: 'Standard LLM',
    description: 'Standard conversational path with tool calling for data-enriched responses.',
    providerAlias: 'ada-fast',
    tools: ['portfolio_read', 'market_read', 'news_read', 'macro_read', 'fx_read', 'health_compute', 'workflow_light'],
    temperature: 0.15,
    maxOutputTokens: 1800,
    toolRounds: 1,
    maxToolCallsPerRound: 3,
  },
  2: {
    lane: 2,
    label: 'Reasoning LLM',
    description: 'Deep analysis path for complex queries requiring step-by-step reasoning.',
    providerAlias: 'ada-reason',
    tools: ['portfolio_read', 'market_read', 'news_read', 'macro_read', 'fx_read', 'health_compute', 'workflow_light', 'execution_route'],
    temperature: 0.10,
    maxOutputTokens: 2600,
    toolRounds: 2,
    maxToolCallsPerRound: 4,
  },
};

const INTENT_ROUTE_CONFIGS: Record<IntentClassification['primary_intent'], IntentRouteConfig> = {
  balance_query: {
    intent: 'balance_query',
    defaultLane: 0,
    supportedLanes: [0, 1],
    requiredTools: ['portfolio_read'],
    optionalTools: [],
    description: 'Direct portfolio value/balance lookups',
  },
  portfolio_explain: {
    intent: 'portfolio_explain',
    defaultLane: 1,
    supportedLanes: [0, 1, 2],
    requiredTools: ['portfolio_read'],
    optionalTools: ['market_read', 'news_read', 'health_compute'],
    description: 'Explain portfolio composition, allocation, performance, and health analysis',
  },
  allocation_breakdown: {
    intent: 'allocation_breakdown',
    defaultLane: 0,
    supportedLanes: [0, 1],
    requiredTools: ['portfolio_read'],
    optionalTools: [],
    description: 'Asset allocation breakdown by class, sector, geography',
  },
  goal_progress: {
    intent: 'goal_progress',
    defaultLane: 0,
    supportedLanes: [0, 1],
    requiredTools: ['portfolio_read'],
    optionalTools: ['health_compute'],
    description: 'Financial goal tracking and progress updates',
  },
  market_context: {
    intent: 'market_context',
    defaultLane: 1,
    supportedLanes: [1],
    requiredTools: ['market_read'],
    optionalTools: ['macro_read', 'fx_read'],
    description: 'Market conditions, economic indicators, macro outlook',
  },
  news_explain: {
    intent: 'news_explain',
    defaultLane: 1,
    supportedLanes: [1],
    requiredTools: ['news_read'],
    optionalTools: ['market_read'],
    description: 'News headlines, company events, earnings, why things moved',
  },
  scenario_analysis: {
    intent: 'scenario_analysis',
    defaultLane: 2,
    supportedLanes: [1, 2],
    requiredTools: ['portfolio_read', 'workflow_light'],
    optionalTools: ['health_compute'],
    description: 'What-if analysis, projections, retirement planning, simulations',
  },
  recommendation_request: {
    intent: 'recommendation_request',
    defaultLane: 2,
    supportedLanes: [2],
    requiredTools: ['portfolio_read', 'health_compute'],
    optionalTools: ['market_read'],
    description: 'Investment recommendations requiring advisor handoff',
  },
  execution_request: {
    intent: 'execution_request',
    defaultLane: 2,
    supportedLanes: [2],
    requiredTools: ['execution_route'],
    optionalTools: ['portfolio_read'],
    description: 'Trade execution requests routed to RM handoff',
  },
  support: {
    intent: 'support',
    defaultLane: 1,
    supportedLanes: [1],
    requiredTools: [],
    optionalTools: [],
    description: 'Platform support and help queries',
  },
  general: {
    intent: 'general',
    defaultLane: 1,
    supportedLanes: [1],
    requiredTools: [],
    optionalTools: [],
    description: 'General conversation and greetings',
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

export function getLaneConfig(lane: number): LaneConfig | undefined {
  return LANE_CONFIGS[lane];
}

export function getIntentRouteConfig(intent: IntentClassification['primary_intent']): IntentRouteConfig {
  return INTENT_ROUTE_CONFIGS[intent] ?? INTENT_ROUTE_CONFIGS['general'];
}

export function getClassifierContext(): string {
  const intentLines = Object.values(INTENT_ROUTE_CONFIGS).map(r =>
    `- ${r.intent}: lane ${r.defaultLane} (${LANE_CONFIGS[r.defaultLane]?.label ?? 'unknown'}), tools: [${r.requiredTools.join(', ')}]${r.optionalTools.length > 0 ? `, optional: [${r.optionalTools.join(', ')}]` : ''}`
  );

  const laneLines = Object.values(LANE_CONFIGS).map(l =>
    `- Lane ${l.lane} (${l.label}): ${l.description}`
  );

  return [
    'ROUTING LANES:',
    ...laneLines,
    '',
    'INTENT→LANE MAPPING:',
    ...intentLines,
  ].join('\n');
}

export function bestModelForIntent(intent: IntentClassification['primary_intent']): string {
  const config = INTENT_ROUTE_CONFIGS[intent];
  if (config) {
    const lane = LANE_CONFIGS[config.defaultLane];
    if (lane) return lane.providerAlias;
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
