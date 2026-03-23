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
  'ada-fallback': {
    alias: 'ada-fallback',
    model: 'claude-sonnet-4-6',
    capabilities: new Set(['streaming', 'reasoning', 'long_context']),
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
    label: 'Fast LLM (Legacy)',
    description: 'Previously deterministic, now routes to Lane 1 (fast LLM with pre-fetched data). Kept for type compatibility.',
    providerAlias: 'ada-fast',
    tools: ['portfolio_read', 'health_compute'],
  },
  1: {
    lane: 1,
    label: 'Standard LLM',
    description: 'Standard conversational path with tool calling for data-enriched responses.',
    providerAlias: 'ada-fast',
    tools: ['portfolio_read', 'market_read', 'news_read', 'macro_read', 'fx_read', 'health_compute', 'workflow_light'],
  },
  2: {
    lane: 2,
    label: 'Reasoning LLM',
    description: 'Deep analysis path for complex queries requiring step-by-step reasoning.',
    providerAlias: 'ada-reason',
    tools: ['portfolio_read', 'market_read', 'news_read', 'macro_read', 'fx_read', 'health_compute', 'workflow_light', 'execution_route'],
  },
};

const INTENT_ROUTE_CONFIGS: Record<IntentClassification['primary_intent'], IntentRouteConfig> = {
  balance_query: {
    intent: 'balance_query',
    defaultLane: 1,
    supportedLanes: [1],
    requiredTools: ['portfolio_read'],
    optionalTools: [],
    description: 'Portfolio value/balance lookups via fast LLM with pre-fetched data',
  },
  portfolio_explain: {
    intent: 'portfolio_explain',
    defaultLane: 1,
    supportedLanes: [1, 2],
    requiredTools: ['portfolio_read'],
    optionalTools: ['market_read', 'news_read'],
    description: 'Explain portfolio composition, allocation, and performance',
  },
  portfolio_health: {
    intent: 'portfolio_health',
    defaultLane: 2,
    supportedLanes: [1, 2],
    requiredTools: ['portfolio_read', 'health_compute'],
    optionalTools: ['market_read'],
    description: 'Deep portfolio health analysis with risk metrics',
  },
  allocation_breakdown: {
    intent: 'allocation_breakdown',
    defaultLane: 1,
    supportedLanes: [1],
    requiredTools: ['portfolio_read'],
    optionalTools: [],
    description: 'Asset allocation breakdown by class, sector, geography via fast LLM',
  },
  goal_progress: {
    intent: 'goal_progress',
    defaultLane: 1,
    supportedLanes: [1],
    requiredTools: ['portfolio_read'],
    optionalTools: ['health_compute'],
    description: 'Financial goal tracking and progress updates via fast LLM',
  },
  market_news: {
    intent: 'market_news',
    defaultLane: 1,
    supportedLanes: [1],
    requiredTools: ['market_read', 'news_read'],
    optionalTools: ['macro_read', 'fx_read'],
    description: 'Market conditions, news, and economic indicators',
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
  workflow_request: {
    intent: 'workflow_request',
    defaultLane: 2,
    supportedLanes: [1, 2],
    requiredTools: ['workflow_light'],
    optionalTools: ['portfolio_read'],
    description: 'Workflow actions (alerts, reports, scheduled tasks)',
  },
  support: {
    intent: 'support',
    defaultLane: 1,
    supportedLanes: [1],
    requiredTools: [],
    optionalTools: [],
    description: 'Platform support and help queries',
  },
  other: {
    intent: 'other',
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
  return INTENT_ROUTE_CONFIGS[intent] ?? INTENT_ROUTE_CONFIGS['other'];
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
    'INTENT→LANE MAPPING (internal routing taxonomy):',
    ...intentLines,
    '',
    'CLASSIFIER→ROUTING TRANSLATION:',
    '- portfolio → balance_query, portfolio_explain, portfolio_health, or allocation_breakdown',
    '- goals → goal_progress',
    '- market → market_news',
    '- scenario → workflow_request (scenario/projection analysis)',
    '- recommendation → recommendation_request',
    '- execution_request → execution_request',
    '- general → other or support',
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
