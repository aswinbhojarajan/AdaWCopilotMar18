import type { IntentClassification, PolicyDecision } from '../../shared/schemas/agent';
import { getModelCapabilities, hasCapability, getLaneConfig } from './capabilityRegistry';

export type Lane = 'lane0' | 'lane1' | 'lane2';
export type ProviderAlias = 'ada-classifier' | 'ada-fast' | 'ada-reason' | 'ada-fallback';
export type ToolGroup = 'financial_data' | 'market_intel' | 'ui_actions' | 'crm_actions';

const PROVIDER_MODEL_MAP: Record<ProviderAlias, string> = {
  'ada-classifier': 'gpt-4.1-nano',
  'ada-fast': 'gpt-4.1-mini',
  'ada-reason': 'gpt-4.1',
  'ada-fallback': 'claude-sonnet-4-6',
};

const FALLBACK_CHAIN: Record<ProviderAlias, ProviderAlias | null> = {
  'ada-classifier': null,
  'ada-fast': 'ada-fallback',
  'ada-reason': 'ada-fast',
  'ada-fallback': null,
};

export function getFallbackAlias(alias: ProviderAlias): ProviderAlias | null {
  return FALLBACK_CHAIN[alias] ?? null;
}

export function resolveModel(alias: ProviderAlias): string {
  const caps = getModelCapabilities(alias);
  if (caps) return caps.model;
  return PROVIDER_MODEL_MAP[alias];
}

export function canUseTools(alias: ProviderAlias): boolean {
  return hasCapability(alias, 'tool_calling');
}

export function supportsStreaming(alias: ProviderAlias): boolean {
  return hasCapability(alias, 'streaming');
}

export interface RequestScorecard {
  intent: IntentClassification['primary_intent'];
  requires_deterministic_math: boolean;
  risk_level: 'low' | 'medium' | 'high';
  context_size_estimate: number;
  tool_count_estimate: number;
  channel: string;
  reasoning_effort: IntentClassification['reasoning_effort'];
}

export interface RouteDecision {
  lane: Lane;
  rationale: string[];
  provider_alias: ProviderAlias;
  tool_groups: ToolGroup[];
  max_tokens: number;
  temperature: number;
  reasoning_effort: IntentClassification['reasoning_effort'];
}

export interface ModelSelection {
  model: string;
  label: 'fast' | 'strong';
  reason: string;
  max_tokens: number;
  temperature: number;
  lane: Lane;
  provider_alias: ProviderAlias;
  tool_groups: ToolGroup[];
}

const DETERMINISTIC_INTENTS = new Set<IntentClassification['primary_intent']>([
  'balance_query',
  'portfolio_explain',
  'goal_progress',
  'allocation_breakdown',
]);

const REASONING_INTENTS = new Set<IntentClassification['primary_intent']>([
  'portfolio_health',
  'recommendation_request',
  'workflow_request',
]);

export function buildScorecard(
  intent: IntentClassification,
  channel: string = 'chat',
): RequestScorecard {
  const primary = intent.primary_intent;
  const requiresDeterministicMath = DETERMINISTIC_INTENTS.has(primary);

  let riskLevel: RequestScorecard['risk_level'] = 'low';
  if (primary === 'execution_request' || primary === 'recommendation_request') {
    riskLevel = 'high';
  } else if (primary === 'portfolio_health' || primary === 'portfolio_explain') {
    riskLevel = 'medium';
  }

  return {
    intent: primary,
    requires_deterministic_math: requiresDeterministicMath,
    risk_level: riskLevel,
    context_size_estimate: estimateContextSize(intent),
    tool_count_estimate: intent.suggested_tools.length,
    channel,
    reasoning_effort: intent.reasoning_effort,
  };
}

function estimateContextSize(intent: IntentClassification): number {
  const base = 2000;
  const toolOverhead = intent.suggested_tools.length * 1500;
  const effortMultiplier = intent.reasoning_effort === 'high' ? 2 : intent.reasoning_effort === 'medium' ? 1.5 : 1;
  return Math.round((base + toolOverhead) * effortMultiplier);
}

export function routeRequest(
  scorecard: RequestScorecard,
  policy: PolicyDecision,
): RouteDecision {
  if (scorecard.requires_deterministic_math) {
    return {
      lane: 'lane0',
      rationale: ['Deterministic math — resolved without LLM'],
      provider_alias: 'ada-fast',
      tool_groups: [],
      max_tokens: 1024,
      temperature: 0.1,
      reasoning_effort: 'low',
    };
  }

  if (
    scorecard.risk_level === 'high' ||
    scorecard.tool_count_estimate >= 3 ||
    REASONING_INTENTS.has(scorecard.intent) ||
    scorecard.reasoning_effort === 'high' ||
    policy.response_mode === 'restricted_advisory'
  ) {
    const rationale: string[] = [];
    if (scorecard.risk_level === 'high') rationale.push('High risk level');
    if (scorecard.tool_count_estimate >= 3) rationale.push(`${scorecard.tool_count_estimate} tools estimated`);
    if (REASONING_INTENTS.has(scorecard.intent)) rationale.push(`Reasoning intent: ${scorecard.intent}`);
    if (scorecard.reasoning_effort === 'high') rationale.push('High reasoning effort');
    if (policy.response_mode === 'restricted_advisory') rationale.push('Restricted advisory mode');

    const lane2Config = getLaneConfig(2);
    return {
      lane: 'lane2',
      rationale,
      provider_alias: 'ada-reason',
      tool_groups: ['financial_data', 'market_intel', 'ui_actions', 'crm_actions'],
      max_tokens: lane2Config?.maxOutputTokens ?? 2600,
      temperature: lane2Config?.temperature ?? 0.10,
      reasoning_effort: scorecard.reasoning_effort,
    };
  }

  const lane1Config = getLaneConfig(1);
  return {
    lane: 'lane1',
    rationale: ['Standard query — fast lane'],
    provider_alias: 'ada-fast',
    tool_groups: ['financial_data', 'ui_actions'],
    max_tokens: lane1Config?.maxOutputTokens ?? 1800,
    temperature: lane1Config?.temperature ?? 0.15,
    reasoning_effort: scorecard.reasoning_effort,
  };
}

export function selectModel(
  intent: IntentClassification,
  policy: PolicyDecision,
  _toolCount: number,
  channel: string = 'chat',
): ModelSelection {
  const scorecard = buildScorecard(intent, channel);
  const route = routeRequest(scorecard, policy);

  return {
    model: resolveModel(route.provider_alias),
    label: route.lane === 'lane2' ? 'strong' : 'fast',
    reason: route.rationale.join('; '),
    max_tokens: route.max_tokens,
    temperature: route.temperature,
    lane: route.lane,
    provider_alias: route.provider_alias,
    tool_groups: route.tool_groups,
  };
}

export function getIntentClassificationModel(): string {
  return resolveModel('ada-classifier');
}
