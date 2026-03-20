import type { AdaAnswer, ToolResult, PolicyDecision, IntentClassification, Citation, TenantConfig } from '../../shared/schemas/agent';
import { getDisclosures } from './policyEngine';

export function buildAdaAnswer(params: {
  intent: IntentClassification;
  policyDecision: PolicyDecision;
  llmText: string;
  toolResults: ToolResult[];
  tenantConfig: TenantConfig;
  guardrailInterventions: string[];
}): AdaAnswer {
  const { intent, policyDecision, llmText, toolResults, tenantConfig, guardrailInterventions } = params;

  const lines = llmText.split('\n').filter(l => l.trim());
  const headline = lines[0] || 'Here\'s what I found';
  const summary = lines.slice(1, 4).join(' ').trim() || llmText.slice(0, 200);
  const keyPoints = extractKeyPoints(llmText);
  const disclosures = getDisclosures(tenantConfig, policyDecision);
  const citations = buildCitations(toolResults);

  const portfolioInsights = buildPortfolioInsights(toolResults);
  const marketContext = buildMarketContext(toolResults, intent);
  const recommendations = buildRecommendations(policyDecision);
  const actions = buildActions(policyDecision);
  const renderHints = buildRenderHints(toolResults, intent);

  return {
    answer_id: `ans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    mode: policyDecision.response_mode === 'education_only' ? 'instant' : toolResults.length > 0 ? 'analysis' : 'instant',
    user_intent: intent.primary_intent,
    headline,
    summary,
    key_points: keyPoints,
    portfolio_insights: portfolioInsights,
    market_context: marketContext,
    recommendations,
    actions,
    disclosures,
    citations,
    render_hints: renderHints,
    suggested_questions: [],
    tool_results: toolResults,
  };
}

function extractKeyPoints(text: string): string[] {
  const points: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+[.)]\s/.test(trimmed)) {
      points.push(trimmed.replace(/^[•\-*]\s*/, '').replace(/^\d+[.)]\s*/, ''));
    }
  }
  return points.slice(0, 8);
}

function buildCitations(toolResults: ToolResult[]): Citation[] {
  return toolResults
    .filter(r => r.status === 'ok')
    .map((r, i) => ({
      source_type: mapSourceType(r.source_type),
      source_name: r.source_name,
      reference_id: `ref-${i + 1}`,
      as_of: r.as_of,
    }));
}

function mapSourceType(sourceType: string): Citation['source_type'] {
  const map: Record<string, Citation['source_type']> = {
    portfolio_api: 'portfolio_api',
    market_api: 'market_api',
    news_api: 'news_api',
    wealth_engine: 'wealth_engine',
    policy_engine: 'policy_engine',
    macro_api: 'macro_api',
    fx_api: 'fx_api',
    research_api: 'research_api',
    identity_api: 'identity_api',
  };
  return map[sourceType] ?? 'portfolio_api';
}

function buildPortfolioInsights(toolResults: ToolResult[]): AdaAnswer['portfolio_insights'] | undefined {
  const healthResult = toolResults.find(r => r.source_type === 'wealth_engine' && r.status === 'ok');
  if (!healthResult?.data) return undefined;

  const data = healthResult.data as Record<string, unknown>;
  const health = data.health as Record<string, unknown> | undefined;
  const concentration = data.concentration as Record<string, unknown> | undefined;

  return {
    health_score: health?.score as number | undefined,
    concentration_flags: (concentration?.flags as string[]) ?? [],
    allocation_notes: [],
    performance_notes: [],
  };
}

function buildMarketContext(toolResults: ToolResult[], intent: IntentClassification): AdaAnswer['market_context'] | undefined {
  const newsResult = toolResults.find(r => r.source_type === 'news_api' && r.status === 'ok');
  const quoteResult = toolResults.find(r => r.source_type === 'market_api' && r.status === 'ok');

  if (!newsResult && !quoteResult) return undefined;

  const instruments = intent.entities.symbols;
  const topics: string[] = [];
  if (newsResult?.data && Array.isArray(newsResult.data)) {
    for (const article of newsResult.data.slice(0, 3)) {
      const a = article as Record<string, unknown>;
      if (a.title) topics.push(a.title as string);
    }
  }

  return {
    relevant_instruments: instruments.length > 0 ? instruments : undefined,
    relevant_news_topics: topics.length > 0 ? topics : undefined,
    market_takeaway: undefined,
  };
}

function buildRecommendations(policy: PolicyDecision): AdaAnswer['recommendations'] | undefined {
  if (policy.recommendation_mode === 'none') return undefined;

  return {
    allowed: true,
    type: policy.recommendation_mode as 'none' | 'education' | 'next_best_actions' | 'product_options',
    items: [],
  };
}

function buildActions(policy: PolicyDecision): AdaAnswer['actions'] | undefined {
  if (!policy.require_human_review) return undefined;

  return [
    {
      type: 'advisor_handoff',
      label: 'Speak with your advisor',
      payload: { reason: policy.escalation_reason || 'This topic would benefit from professional guidance' },
    },
  ];
}

function buildRenderHints(toolResults: ToolResult[], intent: IntentClassification): AdaAnswer['render_hints'] | undefined {
  const hasPortfolio = toolResults.some(r => r.source_type === 'portfolio_api' && r.status === 'ok');
  const hasNews = toolResults.some(r => r.source_type === 'news_api' && r.status === 'ok');
  const hasHealth = toolResults.some(r => r.source_type === 'wealth_engine' && r.status === 'ok');

  return {
    show_portfolio_card: hasPortfolio && (intent.primary_intent === 'balance_query' || intent.primary_intent === 'portfolio_explain'),
    show_news_card: hasNews && intent.primary_intent === 'market_news',
    show_health_card: hasHealth && intent.primary_intent === 'portfolio_health',
  };
}

