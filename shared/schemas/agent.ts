import { z } from 'zod';

export const ToolResultSchema = z.object({
  tool_name: z.string(),
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  source_provider: z.string(),
  as_of: z.string(),
  latency_ms: z.number().optional(),
  cache_hit: z.boolean().optional(),
});
export type ToolResult = z.infer<typeof ToolResultSchema>;

export const CitationSchema = z.object({
  provider: z.string(),
  label: z.string(),
  as_of: z.string(),
  url: z.string().optional(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const NextBestActionSchema = z.object({
  action: z.string(),
  rationale: z.string(),
  cta_text: z.string(),
  cta_message: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
});
export type NextBestAction = z.infer<typeof NextBestActionSchema>;

export const AdaAnswerSchema = z.object({
  text_blocks: z.array(z.string()),
  widgets: z.array(z.object({
    type: z.string(),
    data: z.record(z.string(), z.unknown()).optional(),
  })).default([]),
  suggested_questions: z.array(z.string()).default([]),
  citations: z.array(CitationSchema).default([]),
  next_best_actions: z.array(NextBestActionSchema).default([]),
  disclaimers: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.8),
  escalate_to_advisor: z.boolean().default(false),
  escalation_reason: z.string().optional(),
  tool_results: z.array(ToolResultSchema).default([]),
});
export type AdaAnswer = z.infer<typeof AdaAnswerSchema>;

export const PolicyDecisionSchema = z.object({
  allowed: z.boolean(),
  advisory_mode: z.enum(['education_only', 'personalized_insights_only', 'restricted_advisory']),
  can_name_securities: z.boolean(),
  can_compare_products: z.boolean(),
  can_generate_recommendations: z.boolean(),
  can_generate_next_best_actions: z.boolean(),
  requires_advisor_handoff: z.boolean(),
  tools_allowed: z.array(z.string()),
  disclosure_profile: z.string(),
  blocked_reason: z.string().optional(),
  guardrail_notes: z.array(z.string()).default([]),
});
export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export const IntentClassificationSchema = z.object({
  primary_intent: z.enum([
    'portfolio_query',
    'market_data',
    'news_query',
    'macro_query',
    'fx_query',
    'research_query',
    'goal_management',
    'risk_assessment',
    'rebalancing',
    'general_education',
    'advisor_handoff',
    'account_management',
    'greeting',
    'unclear',
  ]),
  confidence: z.number().min(0).max(1),
  entities: z.object({
    symbols: z.array(z.string()).default([]),
    asset_classes: z.array(z.string()).default([]),
    time_range: z.string().optional(),
    currencies: z.array(z.string()).default([]),
  }),
  reasoning_effort: z.enum(['low', 'medium', 'high']).default('medium'),
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
