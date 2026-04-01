import { z } from 'zod';

export const ToolResultSchema = z.object({
  status: z.enum(['ok', 'error', 'partial', 'timeout']),
  source_name: z.string(),
  source_type: z.string(),
  as_of: z.string(),
  latency_ms: z.number(),
  warnings: z.array(z.string()).optional(),
  data: z.unknown().nullable(),
  error: z.string().optional(),
});
export type ToolResult = z.infer<typeof ToolResultSchema>;

export const CitationSchema = z.object({
  source_type: z.enum(['portfolio_api', 'market_api', 'news_api', 'wealth_engine', 'policy_engine', 'macro_api', 'fx_api', 'research_api', 'identity_api']),
  source_name: z.string(),
  reference_id: z.string(),
  as_of: z.string(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const RecommendationItemSchema = z.object({
  title: z.string(),
  rationale: z.string(),
  risk_note: z.string().optional(),
  suitability_note: z.string().optional(),
});
export type RecommendationItem = z.infer<typeof RecommendationItemSchema>;

export const ActionSchema = z.object({
  type: z.enum(['advisor_handoff', 'execution_handoff', 'watchlist', 'alert', 'view_portfolio', 'none']),
  label: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
});
export type Action = z.infer<typeof ActionSchema>;

export const AdaAnswerSchema = z.object({
  answer_id: z.string(),
  mode: z.enum(['instant', 'analysis', 'advisory']),
  user_intent: z.enum([
    'balance_query',
    'portfolio_explain',
    'allocation_breakdown',
    'goal_progress',
    'market_context',
    'news_explain',
    'scenario_analysis',
    'recommendation_request',
    'execution_request',
    'support',
    'general',
  ]),
  headline: z.string(),
  summary: z.string(),
  key_points: z.array(z.string()),
  portfolio_insights: z.object({
    health_score: z.number().optional(),
    concentration_flags: z.array(z.string()).optional(),
    allocation_notes: z.array(z.string()).optional(),
    performance_notes: z.array(z.string()).optional(),
  }).optional(),
  market_context: z.object({
    relevant_instruments: z.array(z.string()).optional(),
    relevant_news_topics: z.array(z.string()).optional(),
    market_takeaway: z.string().optional(),
  }).optional(),
  recommendations: z.object({
    allowed: z.boolean(),
    type: z.enum(['none', 'education', 'next_best_actions', 'product_options']),
    items: z.array(RecommendationItemSchema),
  }).optional(),
  actions: z.array(ActionSchema).optional(),
  disclosures: z.array(z.string()),
  citations: z.array(CitationSchema),
  render_hints: z.object({
    show_portfolio_card: z.boolean().optional(),
    show_news_card: z.boolean().optional(),
    show_health_card: z.boolean().optional(),
  }).optional(),
  suggested_questions: z.array(z.string()).default([]),
  tool_results: z.array(ToolResultSchema).default([]),
});
export type AdaAnswer = z.infer<typeof AdaAnswerSchema>;

export const PolicyDecisionSchema = z.object({
  allow_response: z.boolean(),
  response_mode: z.enum(['education_only', 'personalized_insights', 'restricted_advisory']),
  allowed_tools: z.array(z.string()),
  recommendation_mode: z.enum(['none', 'next_best_actions', 'product_options']),
  require_disclosures: z.boolean(),
  require_human_review: z.boolean(),
  escalation_reason: z.string().optional(),
  execution_route: z.enum(['rm_handoff', 'api_webhook', 'disabled']).optional(),
});
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export const IntentClassificationSchema = z.object({
  primary_intent: z.enum([
    'balance_query',
    'portfolio_explain',
    'allocation_breakdown',
    'goal_progress',
    'market_context',
    'news_explain',
    'scenario_analysis',
    'recommendation_request',
    'execution_request',
    'support',
    'general',
  ]),
  confidence: z.number().min(0).max(1),
  entities: z.object({
    symbols: z.array(z.string()).default([]),
    asset_classes: z.array(z.string()).default([]),
    time_range: z.string().optional(),
    currencies: z.array(z.string()).default([]),
  }),
  reasoning_effort: z.enum(['low', 'medium', 'high']).default('medium'),
  needs_live_data: z.boolean().default(false),
  needs_tooling: z.boolean().default(true),
  mentioned_entities: z.array(z.string()).default([]),
  followup_mode: z.enum(['suggest', 'none', 'inline']).default('suggest'),
  suggested_tools: z.array(z.string()).default([]),
});
export type IntentClassification = z.infer<typeof IntentClassificationSchema>;

export const AgentTraceSchema = z.object({
  conversation_id: z.string().optional(),
  message_id: z.string().optional(),
  tenant_id: z.string().optional(),
  user_id: z.string().optional(),
  intent_classification: z.string().optional(),
  policy_decision: PolicyDecisionSchema.optional(),
  model_name: z.string().optional(),
  reasoning_effort: z.string().optional(),
  tool_set_exposed: z.array(z.string()).default([]),
  tool_calls_made: z.array(ToolResultSchema).default([]),
  final_answer: AdaAnswerSchema.optional(),
  response_time_ms: z.number().optional(),
  step_timings: z.record(z.string(), z.number()).optional(),
  guardrail_interventions: z.array(z.string()).default([]),
  escalation_decisions: z.array(z.string()).default([]),
});
export type AgentTrace = z.infer<typeof AgentTraceSchema>;

export const TenantConfigSchema = z.object({
  tenant_id: z.string(),
  jurisdiction: z.string().default('UAE'),
  advisory_mode: z.enum(['education_only', 'personalized_insights_only', 'restricted_advisory']),
  can_name_securities: z.boolean(),
  can_compare_products: z.boolean(),
  can_generate_recommendations: z.boolean(),
  can_generate_next_best_actions: z.boolean(),
  requires_advisor_handoff_for_specific_advice: z.boolean(),
  disclosure_profile: z.string(),
  allowed_tool_profiles: z.array(z.string()),
  provider_config: z.record(z.string(), z.string()),
  moderation_enabled: z.boolean().default(true),
  feature_flags: z.record(z.string(), z.boolean()),
  tone: z.string().default('professional'),
  language: z.string().default('en'),
  blocked_phrases: z.array(z.string()).default([]),
  data_freshness_threshold_seconds: z.number().default(300),
  execution_routing_mode: z.enum(['rm_handoff', 'api_webhook', 'disabled']).default('rm_handoff'),
  execution_webhook_url: z.string().nullable().default(null),
  can_prepare_trade_plans: z.boolean().default(true),
});
export type TenantConfig = z.infer<typeof TenantConfigSchema>;

export const MarketQuoteSchema = z.object({
  symbol: z.string(),
  price: z.number(),
  change: z.number(),
  change_percent: z.number(),
  volume: z.number().optional(),
  high: z.number().optional(),
  low: z.number().optional(),
  open: z.number().optional(),
  previous_close: z.number().optional(),
  market_cap: z.number().optional(),
  currency: z.string().default('USD'),
  source_provider: z.string(),
  as_of: z.string(),
  display_symbol: z.string().optional(),
  provider_symbol: z.string().optional(),
  is_delayed: z.boolean().optional(),
});
export type MarketQuote = z.infer<typeof MarketQuoteSchema>;

export const NewsArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  publisher: z.string(),
  published_at: z.string(),
  url: z.string().optional(),
  symbols: z.array(z.string()).default([]),
  relevance_tags: z.array(z.string()).default([]),
  source_provider: z.string(),
});
export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const MacroIndicatorSchema = z.object({
  series_id: z.string(),
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  date: z.string(),
  frequency: z.string().optional(),
  source_provider: z.string(),
  as_of: z.string(),
  summary: z.string().optional(),
});
export type MacroIndicator = z.infer<typeof MacroIndicatorSchema>;

export const FxRateSchema = z.object({
  base: z.string(),
  target: z.string(),
  rate: z.number(),
  inverse_rate: z.number().optional(),
  source_provider: z.string(),
  as_of: z.string(),
});
export type FxRate = z.infer<typeof FxRateSchema>;

export const FilingSchema = z.object({
  id: z.string(),
  company: z.string(),
  type: z.string(),
  title: z.string(),
  filed_date: z.string(),
  url: z.string().optional(),
  summary: z.string().optional(),
  source_provider: z.string(),
});
export type Filing = z.infer<typeof FilingSchema>;

export const InstrumentIdentitySchema = z.object({
  symbol: z.string(),
  name: z.string(),
  figi: z.string().optional(),
  isin: z.string().optional(),
  exchange: z.string().optional(),
  asset_class: z.string(),
  currency: z.string(),
  source_provider: z.string(),
});
export type InstrumentIdentity = z.infer<typeof InstrumentIdentitySchema>;

export const AdaIntentSchema = z.enum([
  'portfolio_review',
  'allocation_breakdown',
  'holding_deep_dive',
  'gain_loss_explainer',
  'risk_check',
  'rebalance_analysis',
  'product_opportunity',
  'market_impact',
  'comparison',
  'educational',
  'advisor_escalation',
  'general_query',
  'unsupported',
]);
export type AdaIntent = z.infer<typeof AdaIntentSchema>;

export const MetricItemSchema = z.object({
  label: z.string(),
  value: z.string(),
  delta: z.object({
    value: z.string(),
    direction: z.enum(['up', 'down', 'neutral']),
  }).optional(),
  unit: z.string().optional(),
});
export type MetricItem = z.infer<typeof MetricItemSchema>;

export const MetricsRowBlockSchema = z.object({
  type: z.literal('metrics_row'),
  label: z.string().optional(),
  metrics: z.array(MetricItemSchema),
});
export type MetricsRowBlock = z.infer<typeof MetricsRowBlockSchema>;

export const SectionBlockSchema = z.object({
  type: z.literal('section'),
  label: z.string().optional(),
  heading: z.string(),
  body: z.string(),
  collapsible: z.boolean().optional(),
  collapseLabel: z.string().optional(),
});
export type SectionBlock = z.infer<typeof SectionBlockSchema>;

export const TableColumnSchema = z.object({
  key: z.string(),
  label: z.string(),
  align: z.enum(['left', 'right', 'center']).optional(),
  format: z.enum(['currency', 'percent', 'number', 'text', 'delta']).optional(),
});
export type TableColumn = z.infer<typeof TableColumnSchema>;

export const HoldingRowSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  values: z.record(z.string(), z.union([z.string(), z.number()])),
});
export type HoldingRow = z.infer<typeof HoldingRowSchema>;

export const HoldingsTableBlockSchema = z.object({
  type: z.literal('holdings_table'),
  label: z.string().optional(),
  columns: z.array(TableColumnSchema),
  rows: z.array(HoldingRowSchema),
  defaultSort: z.object({
    column: z.string(),
    direction: z.enum(['asc', 'desc']),
  }).optional(),
});
export type HoldingsTableBlock = z.infer<typeof HoldingsTableBlockSchema>;

export const AllocationSegmentSchema = z.object({
  label: z.string(),
  value: z.number(),
  amount: z.number().optional(),
  color: z.string().optional(),
});
export type AllocationSegment = z.infer<typeof AllocationSegmentSchema>;

export const AllocationCardBlockSchema = z.object({
  type: z.literal('allocation_card'),
  label: z.string().optional(),
  dimension: z.enum(['sector', 'geography', 'asset_class', 'currency']),
  segments: z.array(AllocationSegmentSchema),
  targetSegments: z.array(AllocationSegmentSchema).optional(),
});
export type AllocationCardBlock = z.infer<typeof AllocationCardBlockSchema>;

export const ChartDataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
});
export type ChartDataPoint = z.infer<typeof ChartDataPointSchema>;

export const MiniChartBlockSchema = z.object({
  type: z.literal('mini_chart'),
  label: z.string().optional(),
  chartType: z.enum(['donut', 'bar', 'line', 'sparkline']),
  title: z.string(),
  data: z.array(ChartDataPointSchema),
  compareSeries: z.array(ChartDataPointSchema).optional(),
  compareLabel: z.string().optional(),
});
export type MiniChartBlock = z.infer<typeof MiniChartBlockSchema>;

export const ComparisonItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  subtitle: z.string().optional(),
});
export type ComparisonItem = z.infer<typeof ComparisonItemSchema>;

export const ComparisonDimensionSchema = z.object({
  label: z.string(),
  values: z.record(z.string(), z.union([z.string(), z.number()])),
  highlight: z.string().optional(),
});
export type ComparisonDimension = z.infer<typeof ComparisonDimensionSchema>;

export const ComparisonBlockSchema = z.object({
  type: z.literal('comparison'),
  label: z.string().optional(),
  items: z.array(ComparisonItemSchema),
  dimensions: z.array(ComparisonDimensionSchema),
});
export type ComparisonBlock = z.infer<typeof ComparisonBlockSchema>;

export const RiskCardBlockSchema = z.object({
  type: z.literal('risk_card'),
  label: z.string().optional(),
  riskType: z.enum(['concentration', 'volatility', 'diversification', 'liquidity', 'drawdown']),
  severity: z.enum(['low', 'moderate', 'elevated', 'high']),
  title: z.string(),
  description: z.string(),
  metric: MetricItemSchema.optional(),
});
export type RiskCardBlock = z.infer<typeof RiskCardBlockSchema>;

export const OpportunityCardBlockSchema = z.object({
  type: z.literal('opportunity_card'),
  label: z.string().optional(),
  category: z.enum(['bond', 'cash', 'thematic', 'rebalance', 'tax']),
  title: z.string(),
  description: z.string(),
  terms: z.record(z.string(), z.string()).optional(),
});
export type OpportunityCardBlock = z.infer<typeof OpportunityCardBlockSchema>;

export const AlertBannerBlockSchema = z.object({
  type: z.literal('alert_banner'),
  label: z.string().optional(),
  severity: z.enum(['info', 'warning', 'critical']),
  title: z.string(),
  message: z.string(),
  action: z.object({
    label: z.string(),
    chipText: z.string(),
  }).optional(),
});
export type AlertBannerBlock = z.infer<typeof AlertBannerBlockSchema>;

export const ScenarioBlockSchema = z.object({
  type: z.literal('scenario'),
  label: z.string().optional(),
  title: z.string(),
  description: z.string(),
  before: z.array(MetricItemSchema),
  after: z.array(MetricItemSchema),
  impact: z.string(),
});
export type ScenarioBlock = z.infer<typeof ScenarioBlockSchema>;

export const AdvisorActionSchema = z.object({
  label: z.string(),
  actionType: z.enum(['share_with_rm', 'book_review', 'save_watchlist', 'export_pdf']),
  demoEnabled: z.boolean(),
});
export type AdvisorAction = z.infer<typeof AdvisorActionSchema>;

export const AdvisorCtaBlockSchema = z.object({
  type: z.literal('advisor_cta'),
  label: z.string().optional(),
  actions: z.array(AdvisorActionSchema),
});
export type AdvisorCtaBlock = z.infer<typeof AdvisorCtaBlockSchema>;

export const AdaBlockSchema = z.discriminatedUnion('type', [
  MetricsRowBlockSchema,
  SectionBlockSchema,
  HoldingsTableBlockSchema,
  AllocationCardBlockSchema,
  MiniChartBlockSchema,
  ComparisonBlockSchema,
  RiskCardBlockSchema,
  OpportunityCardBlockSchema,
  AlertBannerBlockSchema,
  ScenarioBlockSchema,
  AdvisorCtaBlockSchema,
]);
export type AdaBlock = z.infer<typeof AdaBlockSchema>;

export const FollowUpChipSchema = z.object({
  label: z.string(),
  prompt: z.string(),
  icon: z.enum(['chart', 'compare', 'risk', 'action', 'info', 'advisor']).optional(),
});
export type FollowUpChip = z.infer<typeof FollowUpChipSchema>;

export const SourceReferenceSchema = z.object({
  label: z.string(),
  sourceType: z.enum(['portfolio', 'market_data', 'model_estimate', 'research', 'internal']),
  freshness: z.string(),
  href: z.string().optional(),
});
export type SourceReference = z.infer<typeof SourceReferenceSchema>;

export const AdaResponseEnvelopeSchema = z.object({
  version: z.literal('1.0'),
  intent: AdaIntentSchema,
  headline: z.string(),
  blocks: z.array(AdaBlockSchema),
  followUps: z.array(FollowUpChipSchema),
  sources: z.array(SourceReferenceSchema).optional().default([]),
  disclaimer: z.string().optional().default(''),
  generatedAt: z.string(),
});
export type AdaResponseEnvelope = z.infer<typeof AdaResponseEnvelopeSchema>;

export const AdaErrorPayloadSchema = z.object({
  code: z.enum(['MALFORMED_RESPONSE', 'TIMEOUT', 'RATE_LIMITED', 'DATA_UNAVAILABLE', 'INTERNAL']),
  message: z.string(),
  showRawFallback: z.boolean(),
  rawText: z.string().optional(),
});
export type AdaErrorPayload = z.infer<typeof AdaErrorPayloadSchema>;

export type AdaBlockType = AdaBlock['type'];

export interface IntentTemplate {
  intent: AdaIntent;
  promptFragment: string;
  expectedBlocks: AdaBlockType[];
  estimatedTokens: number;
}
