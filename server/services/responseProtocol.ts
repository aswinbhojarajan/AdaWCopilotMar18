import type { IntentClassification } from '../../shared/schemas/agent';
import {
  AdaResponseEnvelopeSchema,
  type AdaIntent,
  type AdaBlockType,
  type AdaResponseEnvelope,
  type AdaErrorPayload,
  type IntentTemplate,
} from '../../shared/schemas/agent';

export const CLASSIFIER_TO_PROTOCOL_INTENT: Record<IntentClassification['primary_intent'], AdaIntent> = {
  balance_query: 'portfolio_review',
  portfolio_explain: 'portfolio_review',
  allocation_breakdown: 'allocation_breakdown',
  goal_progress: 'gain_loss_explainer',
  market_context: 'market_impact',
  news_explain: 'market_impact',
  scenario_analysis: 'rebalance_analysis',
  recommendation_request: 'product_opportunity',
  execution_request: 'advisor_escalation',
  support: 'general_query',
  general: 'general_query',
};

export const INTENT_TEMPLATE_REGISTRY: Record<AdaIntent, Omit<IntentTemplate, 'intent'>> = {
  portfolio_review: {
    promptFragment: 'portfolio_review',
    expectedBlocks: ['metrics_row', 'allocation_card', 'holdings_table', 'risk_card', 'advisor_cta'],
    estimatedTokens: 1800,
  },
  allocation_breakdown: {
    promptFragment: 'allocation_breakdown',
    expectedBlocks: ['metrics_row', 'allocation_card', 'section'],
    estimatedTokens: 1400,
  },
  holding_deep_dive: {
    promptFragment: 'holding_deep_dive',
    expectedBlocks: ['metrics_row', 'mini_chart', 'section', 'holdings_table'],
    estimatedTokens: 1200,
  },
  gain_loss_explainer: {
    promptFragment: 'gain_loss_explainer',
    expectedBlocks: ['metrics_row', 'holdings_table', 'section'],
    estimatedTokens: 1200,
  },
  risk_check: {
    promptFragment: 'risk_check',
    expectedBlocks: ['risk_card', 'metrics_row', 'allocation_card', 'alert_banner'],
    estimatedTokens: 1400,
  },
  rebalance_analysis: {
    promptFragment: 'rebalance_analysis',
    expectedBlocks: ['scenario', 'metrics_row', 'holdings_table', 'advisor_cta'],
    estimatedTokens: 1600,
  },
  product_opportunity: {
    promptFragment: 'product_opportunity',
    expectedBlocks: ['opportunity_card', 'comparison', 'section'],
    estimatedTokens: 1200,
  },
  market_impact: {
    promptFragment: 'market_impact',
    expectedBlocks: ['alert_banner', 'holdings_table', 'metrics_row', 'section'],
    estimatedTokens: 1400,
  },
  comparison: {
    promptFragment: 'comparison',
    expectedBlocks: ['comparison', 'mini_chart', 'section'],
    estimatedTokens: 1400,
  },
  educational: {
    promptFragment: 'educational',
    expectedBlocks: ['section'],
    estimatedTokens: 800,
  },
  advisor_escalation: {
    promptFragment: 'advisor_escalation',
    expectedBlocks: ['section', 'advisor_cta'],
    estimatedTokens: 600,
  },
  general_query: {
    promptFragment: 'general_query',
    expectedBlocks: ['section'],
    estimatedTokens: 600,
  },
  unsupported: {
    promptFragment: 'unsupported',
    expectedBlocks: ['section'],
    estimatedTokens: 300,
  },
};

const STRUCTURED_INTENTS = new Set<AdaIntent>([
  'portfolio_review',
  'allocation_breakdown',
  'general_query',
]);

export function mapClassifierToProtocolIntent(
  classifierIntent: IntentClassification['primary_intent'],
): AdaIntent {
  return CLASSIFIER_TO_PROTOCOL_INTENT[classifierIntent] ?? 'general_query';
}

export function isStructuredIntent(protocolIntent: AdaIntent): boolean {
  return STRUCTURED_INTENTS.has(protocolIntent);
}

export function getIntentTemplate(protocolIntent: AdaIntent): Omit<IntentTemplate, 'intent'> {
  return INTENT_TEMPLATE_REGISTRY[protocolIntent] ?? INTENT_TEMPLATE_REGISTRY.general_query;
}

export function getExpectedBlocks(protocolIntent: AdaIntent): AdaBlockType[] {
  return getIntentTemplate(protocolIntent).expectedBlocks;
}

export function validateResponse(
  raw: string,
  expectedIntent: AdaIntent,
): { ok: true; envelope: AdaResponseEnvelope } | { ok: false; error: AdaErrorPayload } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      error: {
        code: 'MALFORMED_RESPONSE',
        message: 'Could not parse structured response. Showing simplified view.',
        showRawFallback: true,
        rawText: raw,
      },
    };
  }

  const result = AdaResponseEnvelopeSchema.safeParse(parsed);
  if (!result.success) {
    return {
      ok: false,
      error: {
        code: 'MALFORMED_RESPONSE',
        message: 'Response structure incomplete. Showing simplified view.',
        showRawFallback: true,
        rawText: raw,
      },
    };
  }

  const envelope = result.data;

  if (envelope.version !== '1.0') {
    return {
      ok: false,
      error: {
        code: 'MALFORMED_RESPONSE',
        message: 'Response version mismatch. Showing simplified view.',
        showRawFallback: true,
        rawText: raw,
      },
    };
  }

  if (!envelope.headline || !Array.isArray(envelope.blocks)) {
    return {
      ok: false,
      error: {
        code: 'MALFORMED_RESPONSE',
        message: 'Missing headline or blocks. Showing simplified view.',
        showRawFallback: true,
        rawText: raw,
      },
    };
  }

  if (expectedIntent && envelope.intent !== expectedIntent) {
    console.log(`[ResponseProtocol] Intent mismatch: expected=${expectedIntent}, got=${envelope.intent}. Accepting with correction.`);
    envelope.intent = expectedIntent;
  }

  const expected = getExpectedBlocks(expectedIntent);
  const presentTypes = new Set(envelope.blocks.map(b => b.type));
  const missing = expected.filter(t => !presentTypes.has(t));
  if (missing.length > 0) {
    console.log(`[ResponseProtocol] Missing expected blocks for ${expectedIntent}: ${missing.join(', ')}. Accepting envelope as-is.`);
  }

  return { ok: true, envelope };
}
