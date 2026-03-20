import type { TenantConfig, PolicyDecision, IntentClassification } from '../../shared/schemas/agent';
import type { RiskProfile } from '../../shared/types';

const UAE_DISCLOSURES = [
  'Past performance is not indicative of future results.',
  'This information is for educational purposes and does not constitute financial advice.',
  'Please consult your financial advisor before making investment decisions.',
];

const EDUCATION_ONLY_DISCLOSURES = [
  'This is general educational information only and does not constitute personalized advice.',
  'Investment values can go up or down. You may get back less than you invest.',
];

const ALL_TOOLS = [
  'getPortfolioSnapshot',
  'getHoldings',
  'getQuotes',
  'getHoldingsRelevantNews',
  'calculatePortfolioHealth',
  'show_simulator',
  'show_widget',
  'extract_user_fact',
];

const PROFILE_TOOL_MAP: Record<string, string[]> = {
  portfolio_read: ['getPortfolioSnapshot', 'getHoldings'],
  market_read: ['getQuotes'],
  news_read: ['getHoldingsRelevantNews'],
  health_compute: ['calculatePortfolioHealth'],
  workflow_light: ['show_simulator', 'show_widget', 'extract_user_fact'],
};

export function evaluatePolicy(
  tenantConfig: TenantConfig,
  intent: IntentClassification,
  riskProfile?: RiskProfile,
): PolicyDecision {
  const allowedTools = resolveAllowedTools(tenantConfig);
  const responseMode = resolveResponseMode(tenantConfig, intent);
  const recommendationMode = resolveRecommendationMode(tenantConfig, intent);
  const requireDisclosures = true;
  const { requireReview, escalationReason } = checkEscalation(tenantConfig, intent, riskProfile);

  return {
    allow_response: true,
    response_mode: responseMode,
    allowed_tools: allowedTools,
    recommendation_mode: recommendationMode,
    require_disclosures: requireDisclosures,
    require_human_review: requireReview,
    escalation_reason: escalationReason,
  };
}

function resolveAllowedTools(config: TenantConfig): string[] {
  const profiles = config.allowed_tool_profiles;
  if (!profiles || profiles.length === 0) return ALL_TOOLS;

  const tools = new Set<string>();
  for (const profile of profiles) {
    const mapped = PROFILE_TOOL_MAP[profile];
    if (mapped) {
      for (const t of mapped) tools.add(t);
    }
  }
  return Array.from(tools);
}

function resolveResponseMode(
  config: TenantConfig,
  intent: IntentClassification,
): PolicyDecision['response_mode'] {
  if (config.advisory_mode === 'education_only') return 'education_only';
  if (config.advisory_mode === 'restricted_advisory') return 'restricted_advisory';

  if (intent.primary_intent === 'recommendation_request') {
    if (!config.can_generate_recommendations) return 'personalized_insights';
    if (config.requires_advisor_handoff_for_specific_advice) return 'personalized_insights';
    return 'restricted_advisory';
  }

  return 'personalized_insights';
}

function resolveRecommendationMode(
  config: TenantConfig,
  intent: IntentClassification,
): PolicyDecision['recommendation_mode'] {
  if (intent.primary_intent !== 'recommendation_request' && intent.primary_intent !== 'portfolio_health') {
    if (config.can_generate_next_best_actions) return 'next_best_actions';
    return 'none';
  }

  if (!config.can_generate_recommendations) {
    if (config.can_generate_next_best_actions) return 'next_best_actions';
    return 'none';
  }

  return 'next_best_actions';
}

function checkEscalation(
  config: TenantConfig,
  intent: IntentClassification,
  riskProfile?: RiskProfile,
): { requireReview: boolean; escalationReason?: string } {
  if (intent.primary_intent === 'recommendation_request' && config.requires_advisor_handoff_for_specific_advice) {
    return { requireReview: true, escalationReason: 'Specific investment advice requires advisor review' };
  }

  if (riskProfile && intent.primary_intent === 'recommendation_request') {
    if (riskProfile.level === 'conservative' && intent.reasoning_effort === 'high') {
      return { requireReview: true, escalationReason: 'Complex recommendation for conservative investor requires advisor review' };
    }
  }

  return { requireReview: false };
}

export function getDisclosures(config: TenantConfig, policyDecision: PolicyDecision): string[] {
  const disclosures: string[] = [];

  if (!policyDecision.require_disclosures) return disclosures;

  if (policyDecision.response_mode === 'education_only') {
    disclosures.push(...EDUCATION_ONLY_DISCLOSURES);
  }

  if (config.jurisdiction === 'UAE' || config.jurisdiction === 'GCC') {
    disclosures.push(...UAE_DISCLOSURES);
  } else {
    disclosures.push(UAE_DISCLOSURES[0]);
  }

  if (policyDecision.require_human_review) {
    disclosures.push('An advisor review has been recommended for this topic. Please speak with your advisor for personalized guidance.');
  }

  return [...new Set(disclosures)];
}

export function filterToolsByPolicy(allTools: string[], policyDecision: PolicyDecision): string[] {
  return allTools.filter(t => policyDecision.allowed_tools.includes(t));
}

export function checkBlockedPhrases(text: string, config: TenantConfig): string[] {
  const violations: string[] = [];
  const lower = text.toLowerCase();
  for (const phrase of config.blocked_phrases) {
    if (lower.includes(phrase.toLowerCase())) {
      violations.push(`Response contains blocked phrase: "${phrase}"`);
    }
  }
  return violations;
}
