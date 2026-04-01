// =============================================================================
// Ada Response Protocol v1.0
// Structured response contract between ada-reason and the Ada chat frontend.
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Top-level response envelope
// ---------------------------------------------------------------------------

/**
 * Every ada-reason completion returns this envelope.
 * The frontend renders it block-by-block, enabling component-driven chat UI.
 */
export interface AdaResponseEnvelope {
  /** Schema version for forward compatibility */
  version: '1.0';

  /** Classifier-resolved intent that selected this template */
  intent: AdaIntent;

  /** One-sentence headline answer — always rendered first, always streamed */
  headline: string;

  /**
   * Ordered array of typed content blocks.
   * Frontend iterates and renders the matching component for each block.type.
   */
  blocks: AdaBlock[];

  /** Contextual follow-up actions derived from the response content */
  followUps: FollowUpChip[];

  /** Data provenance and freshness metadata */
  sources: SourceReference[];

  /** Compliance disclaimer — rendered in a collapsible tray, never inline */
  disclaimer: string;

  /** ISO-8601 timestamp of response generation */
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// 2. Intent taxonomy (maps to ada-classifier output)
// ---------------------------------------------------------------------------

export type AdaIntent =
  | 'portfolio_review'
  | 'allocation_breakdown'
  | 'holding_deep_dive'
  | 'gain_loss_explainer'
  | 'risk_check'
  | 'rebalance_analysis'
  | 'product_opportunity'
  | 'market_impact'
  | 'comparison'
  | 'educational'
  | 'advisor_escalation'
  | 'general_query'
  | 'unsupported';

// ---------------------------------------------------------------------------
// 3. Block type discriminated union
// ---------------------------------------------------------------------------

export type AdaBlock =
  | MetricsRowBlock
  | SectionBlock
  | HoldingsTableBlock
  | AllocationCardBlock
  | MiniChartBlock
  | ComparisonBlock
  | RiskCardBlock
  | OpportunityCardBlock
  | AlertBannerBlock
  | ScenarioBlock
  | AdvisorCtaBlock;

/** Base interface all blocks extend */
interface BaseBlock {
  /** Discriminator for the frontend component registry */
  type: string;
  /** Optional block-level label (rendered as a subtle header) */
  label?: string;
}

// --- 3a. Metrics Row ---

export interface MetricsRowBlock extends BaseBlock {
  type: 'metrics_row';
  metrics: MetricItem[];
}

export interface MetricItem {
  label: string;
  value: string;
  /** Optional delta indicator: positive = green, negative = red, neutral = grey */
  delta?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  /** Optional unit suffix: %, $, bps, etc. */
  unit?: string;
}

// --- 3b. Section (rich text with structure) ---

export interface SectionBlock extends BaseBlock {
  type: 'section';
  heading: string;
  /** Markdown-safe body content (bold, bullets, numbered lists) */
  body: string;
  /** Whether this section is collapsed by default (progressive disclosure) */
  collapsible?: boolean;
  /** Collapse trigger label, e.g. "Show methodology" */
  collapseLabel?: string;
}

// --- 3c. Holdings Table ---

export interface HoldingsTableBlock extends BaseBlock {
  type: 'holdings_table';
  columns: TableColumn[];
  rows: HoldingRow[];
  /** Optional: sort column key and direction */
  defaultSort?: { column: string; direction: 'asc' | 'desc' };
}

export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  format?: 'currency' | 'percent' | 'number' | 'text' | 'delta';
}

export interface HoldingRow {
  ticker: string;
  name: string;
  /** Key-value map where keys match TableColumn.key */
  values: Record<string, string | number>;
}

// --- 3d. Allocation Card ---

export interface AllocationCardBlock extends BaseBlock {
  type: 'allocation_card';
  /** What dimension: sector, geography, asset_class, currency */
  dimension: 'sector' | 'geography' | 'asset_class' | 'currency';
  segments: AllocationSegment[];
  /** Optional target allocation for comparison */
  targetSegments?: AllocationSegment[];
}

export interface AllocationSegment {
  label: string;
  value: number;
  /** Absolute value in portfolio currency */
  amount?: number;
  /** Hex color override (frontend has defaults per segment) */
  color?: string;
}

// --- 3e. Mini Chart ---

export interface MiniChartBlock extends BaseBlock {
  type: 'mini_chart';
  chartType: 'donut' | 'bar' | 'line' | 'sparkline';
  title: string;
  data: ChartDataPoint[];
  /** Optional: benchmark or comparison series */
  compareSeries?: ChartDataPoint[];
  compareLabel?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// --- 3f. Comparison Block ---

export interface ComparisonBlock extends BaseBlock {
  type: 'comparison';
  items: ComparisonItem[];
  /** Comparison dimensions shown as rows */
  dimensions: ComparisonDimension[];
}

export interface ComparisonItem {
  id: string;
  label: string;
  subtitle?: string;
}

export interface ComparisonDimension {
  label: string;
  values: Record<string, string | number>;
  /** Optional: which item "wins" on this dimension */
  highlight?: string;
}

// --- 3g. Risk Card ---

export interface RiskCardBlock extends BaseBlock {
  type: 'risk_card';
  riskType: 'concentration' | 'volatility' | 'diversification' | 'liquidity' | 'drawdown';
  severity: 'low' | 'moderate' | 'elevated' | 'high';
  title: string;
  description: string;
  /** Key metric for this risk */
  metric?: MetricItem;
}

// --- 3h. Opportunity Card ---

export interface OpportunityCardBlock extends BaseBlock {
  type: 'opportunity_card';
  category: 'bond' | 'cash' | 'thematic' | 'rebalance' | 'tax';
  title: string;
  description: string;
  /** Optional key terms: yield, maturity, minimum, etc. */
  terms?: Record<string, string>;
}

// --- 3i. Alert Banner ---

export interface AlertBannerBlock extends BaseBlock {
  type: 'alert_banner';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  /** Optional action embedded in alert */
  action?: { label: string; chipText: string };
}

// --- 3j. Scenario Block ---

export interface ScenarioBlock extends BaseBlock {
  type: 'scenario';
  title: string;
  description: string;
  /** Before/after metrics */
  before: MetricItem[];
  after: MetricItem[];
  /** Net impact summary */
  impact: string;
}

// --- 3k. Advisor CTA Block ---

export interface AdvisorCtaBlock extends BaseBlock {
  type: 'advisor_cta';
  actions: AdvisorAction[];
}

export interface AdvisorAction {
  label: string;
  /** Action type determines icon and behavior */
  actionType: 'share_with_rm' | 'book_review' | 'save_watchlist' | 'export_pdf';
  /** Whether this is functional in demo mode */
  demoEnabled: boolean;
}

// ---------------------------------------------------------------------------
// 4. Follow-up chips
// ---------------------------------------------------------------------------

export interface FollowUpChip {
  /** Display label */
  label: string;
  /** The actual message sent to ada-classifier when tapped */
  prompt: string;
  /** Optional: icon hint for the frontend */
  icon?: 'chart' | 'compare' | 'risk' | 'action' | 'info' | 'advisor';
}

// ---------------------------------------------------------------------------
// 5. Source references
// ---------------------------------------------------------------------------

export interface SourceReference {
  /** Human-readable label: "Portfolio snapshot", "Market data", etc. */
  label: string;
  /** Source type for icon/badge rendering */
  sourceType: 'portfolio' | 'market_data' | 'model_estimate' | 'research' | 'internal';
  /** Freshness: ISO-8601 timestamp or descriptive ("Real-time", "Delayed 15m") */
  freshness: string;
  /** Optional: link to source detail */
  href?: string;
}

// ---------------------------------------------------------------------------
// 6. Streaming protocol
// ---------------------------------------------------------------------------

/**
 * Ada uses a hybrid streaming strategy:
 *
 * Phase 1 — STREAM: headline is streamed token-by-token as plain text
 *           via standard SSE (text/event-stream). This gives instant
 *           perceived response. The frontend renders it in the chat
 *           bubble immediately.
 *
 * Phase 2 — STRUCTURED: once generation completes, the full
 *           AdaResponseEnvelope (including the headline) is delivered
 *           as a single JSON payload via a `[STRUCTURED]` SSE event.
 *           The frontend transitions from the streamed headline to
 *           the full block-based render.
 *
 * This avoids the impossible problem of streaming partial JSON while
 * still giving the user sub-second first-token response.
 */
export interface AdaStreamEvent {
  /** SSE event type */
  event: 'token' | 'structured' | 'error';
  data: string; // For 'token': raw text. For 'structured': JSON AdaResponseEnvelope. For 'error': JSON AdaErrorPayload.
}

// ---------------------------------------------------------------------------
// 7. Error / fallback payloads
// ---------------------------------------------------------------------------

export interface AdaErrorPayload {
  code: 'MALFORMED_RESPONSE' | 'TIMEOUT' | 'RATE_LIMITED' | 'DATA_UNAVAILABLE' | 'INTERNAL';
  /** User-facing message */
  message: string;
  /** Whether the raw text from the LLM should be shown as a plaintext fallback */
  showRawFallback: boolean;
  /** Raw LLM text (only populated when showRawFallback is true) */
  rawText?: string;
}

// ---------------------------------------------------------------------------
// 8. Intent-to-template mapping registry
// ---------------------------------------------------------------------------

/**
 * Each intent maps to a prompt template and a set of expected block types.
 * This is used by the orchestration layer to:
 *   1. Select the right system prompt fragment for ada-reason
 *   2. Validate the response contains expected block types
 *   3. Provide the frontend with a loading skeleton hint
 */
export interface IntentTemplate {
  intent: AdaIntent;
  /** System prompt fragment appended to the base ada-reason prompt */
  promptFragment: string;
  /** Block types this intent typically produces (for skeleton hints) */
  expectedBlocks: AdaBlock['type'][];
  /** Estimated output tokens for cost tracking */
  estimatedTokens: number;
}

/**
 * Registry of all intent templates.
 * In production, this lives in the ada-reason service config.
 * Prompt fragments are maintained separately in /prompts/ directory.
 */
export const INTENT_TEMPLATE_REGISTRY: Record<AdaIntent, Omit<IntentTemplate, 'intent'>> = {
  portfolio_review: {
    promptFragment: 'prompts/portfolio-review.md',
    expectedBlocks: ['metrics_row', 'allocation_card', 'holdings_table', 'risk_card', 'advisor_cta'],
    estimatedTokens: 1800,
  },
  allocation_breakdown: {
    promptFragment: 'prompts/allocation-breakdown.md',
    expectedBlocks: ['metrics_row', 'allocation_card', 'mini_chart', 'section'],
    estimatedTokens: 1400,
  },
  holding_deep_dive: {
    promptFragment: 'prompts/holding-deep-dive.md',
    expectedBlocks: ['metrics_row', 'mini_chart', 'section', 'holdings_table'],
    estimatedTokens: 1200,
  },
  gain_loss_explainer: {
    promptFragment: 'prompts/gain-loss-explainer.md',
    expectedBlocks: ['metrics_row', 'holdings_table', 'section'],
    estimatedTokens: 1200,
  },
  risk_check: {
    promptFragment: 'prompts/risk-check.md',
    expectedBlocks: ['risk_card', 'metrics_row', 'allocation_card', 'alert_banner'],
    estimatedTokens: 1400,
  },
  rebalance_analysis: {
    promptFragment: 'prompts/rebalance-analysis.md',
    expectedBlocks: ['scenario', 'metrics_row', 'holdings_table', 'advisor_cta'],
    estimatedTokens: 1600,
  },
  product_opportunity: {
    promptFragment: 'prompts/product-opportunity.md',
    expectedBlocks: ['opportunity_card', 'comparison', 'section'],
    estimatedTokens: 1200,
  },
  market_impact: {
    promptFragment: 'prompts/market-impact.md',
    expectedBlocks: ['alert_banner', 'holdings_table', 'metrics_row', 'section'],
    estimatedTokens: 1400,
  },
  comparison: {
    promptFragment: 'prompts/comparison.md',
    expectedBlocks: ['comparison', 'mini_chart', 'section'],
    estimatedTokens: 1400,
  },
  educational: {
    promptFragment: 'prompts/educational.md',
    expectedBlocks: ['section'],
    estimatedTokens: 800,
  },
  advisor_escalation: {
    promptFragment: 'prompts/advisor-escalation.md',
    expectedBlocks: ['section', 'advisor_cta'],
    estimatedTokens: 600,
  },
  general_query: {
    promptFragment: 'prompts/general-query.md',
    expectedBlocks: ['section'],
    estimatedTokens: 600,
  },
  unsupported: {
    promptFragment: 'prompts/unsupported.md',
    expectedBlocks: ['section'],
    estimatedTokens: 300,
  },
};

// ---------------------------------------------------------------------------
// 9. Component registry (frontend)
// ---------------------------------------------------------------------------

/**
 * Maps block types to React component paths.
 * Used by the ChatResponseRenderer to dynamically select the right component.
 */
export const COMPONENT_REGISTRY: Record<AdaBlock['type'], string> = {
  metrics_row:     '@/components/chat/blocks/MetricsRow',
  section:         '@/components/chat/blocks/Section',
  holdings_table:  '@/components/chat/blocks/HoldingsTable',
  allocation_card: '@/components/chat/blocks/AllocationCard',
  mini_chart:      '@/components/chat/blocks/MiniChart',
  comparison:      '@/components/chat/blocks/ComparisonCard',
  risk_card:       '@/components/chat/blocks/RiskCard',
  opportunity_card:'@/components/chat/blocks/OpportunityCard',
  alert_banner:    '@/components/chat/blocks/AlertBanner',
  scenario:        '@/components/chat/blocks/ScenarioCard',
  advisor_cta:     '@/components/chat/blocks/AdvisorCta',
};

// ---------------------------------------------------------------------------
// 10. Response validation utility
// ---------------------------------------------------------------------------

/**
 * Validates an LLM response against the envelope schema.
 * Returns the parsed envelope or an error payload for fallback rendering.
 */
export function validateResponse(
  raw: string,
  expectedIntent: AdaIntent
): { ok: true; envelope: AdaResponseEnvelope } | { ok: false; error: AdaErrorPayload } {
  try {
    const parsed = JSON.parse(raw) as AdaResponseEnvelope;

    if (parsed.version !== '1.0') {
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

    if (!parsed.headline || !Array.isArray(parsed.blocks)) {
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

    return { ok: true, envelope: parsed };
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
}
