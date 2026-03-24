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
