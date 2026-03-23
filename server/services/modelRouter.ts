import type { IntentClassification, PolicyDecision } from '../../shared/schemas/agent';
import { getModelCapabilities, hasCapability } from './capabilityRegistry';

export type Lane = 'lane1' | 'lane2';
export type ProviderAlias = 'ada-fast' | 'ada-reason' | 'ada-fallback';
export type ToolGroup = 'financial_data' | 'market_intel' | 'ui_actions' | 'crm_actions';

const PROVIDER_MODEL_MAP: Record<ProviderAlias, string> = {
  'ada-fast': 'gpt-5-mini',
  'ada-reason': 'gpt-5-mini',
  'ada-fallback': 'claude-sonnet-4-6',
};

const FALLBACK_CHAIN: Record<ProviderAlias, ProviderAlias | null> = {
  'ada-fast': 'ada-fallback',
  'ada-reason': 'ada-fallback',
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
  fast_path: boolean;
}


const REASONING_INTENTS = new Set<IntentClassification['primary_intent']>([
  'portfolio_health',
  'recommendation_request',
  'workflow_request',
]);

const FAST_PATH_INTENTS = new Set<IntentClassification['primary_intent']>([
  'balance_query',
  'allocation_breakdown',
  'goal_progress',
]);

export function buildScorecard(
  intent: IntentClassification,
  channel: string = 'chat',
): RequestScorecard {
  const primary = intent.primary_intent;

  let riskLevel: RequestScorecard['risk_level'] = 'low';
  if (primary === 'execution_request' || primary === 'recommendation_request') {
    riskLevel = 'high';
  } else if (primary === 'portfolio_health' || primary === 'portfolio_explain') {
    riskLevel = 'medium';
  }

  return {
    intent: primary,
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

    return {
      lane: 'lane2',
      rationale,
      provider_alias: 'ada-reason',
      tool_groups: ['financial_data', 'market_intel', 'ui_actions', 'crm_actions'],
      max_tokens: 8192,
      temperature: 0.4,
      reasoning_effort: scorecard.reasoning_effort,
      fast_path: false,
    };
  }

  const isFastPath = FAST_PATH_INTENTS.has(scorecard.intent) && scorecard.reasoning_effort === 'low';

  return {
    lane: 'lane1',
    rationale: isFastPath ? ['Fast-path: simple lookup with pre-fetched data'] : ['Standard query — fast lane'],
    provider_alias: 'ada-fast',
    tool_groups: ['financial_data', 'market_intel', 'ui_actions'],
    max_tokens: isFastPath ? 1024 : (scorecard.reasoning_effort === 'low' ? 2048 : 4096),
    temperature: 0.3,
    reasoning_effort: scorecard.reasoning_effort,
    fast_path: isFastPath,
  };
}

export function getIntentClassificationModel(): string {
  return resolveModel('ada-fast');
}
