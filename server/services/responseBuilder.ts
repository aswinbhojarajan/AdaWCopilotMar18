import type { AdaAnswer, ToolResult, PolicyDecision, IntentClassification, Citation, TenantConfig } from '../../shared/schemas/agent';
import { getDisclosures } from './policyEngine';

const FOLLOW_UP_DELIMITER = '---FOLLOW_UP_QUESTIONS---';

const DETERMINISTIC_FOLLOW_UPS: Record<IntentClassification['primary_intent'], string[]> = {
  balance_query: [
    'How are my holdings performing?',
    'Is my portfolio well-diversified?',
    'What market news affects me today?',
  ],
  portfolio_explain: [
    'Is my portfolio well-diversified?',
    'What are the top movers today?',
    'Should I rebalance anything?',
  ],
  allocation_breakdown: [
    'Is my allocation balanced?',
    'Should I diversify more?',
    'What does a healthy allocation look like?',
  ],
  goal_progress: [
    'How can I accelerate my savings?',
    'What happens if I miss my deadline?',
    'Create a new goal',
  ],
  market_context: [
    'How does this affect my portfolio?',
    'Should I adjust my allocation?',
    'What sectors are performing best?',
  ],
  news_explain: [
    'How does this news impact my holdings?',
    'Should I be concerned?',
    'What should I do next?',
  ],
  scenario_analysis: [
    'Run another scenario',
    'How does this compare to my goals?',
    'What if I increase my contribution?',
  ],
  recommendation_request: [
    'Why do you recommend this?',
    'What are the risks?',
    'Send this plan to my advisor',
  ],
  execution_request: [
    'What would this cost?',
    'Show me alternatives',
    'Speak with my advisor',
  ],
  support: [
    'What else can you help me with?',
    'Show my portfolio overview',
    'Tell me about my goals',
  ],
  general: [
    'Show my portfolio overview',
    'How are my goals progressing?',
    'What market news should I know about?',
  ],
};

export function getDeterministicFollowUps(intent: IntentClassification['primary_intent']): string[] {
  return DETERMINISTIC_FOLLOW_UPS[intent] ?? DETERMINISTIC_FOLLOW_UPS.general;
}

export function extractInlineFollowUps(llmText: string): { cleanText: string; questions: string[] } {
  const delimiterIndex = llmText.indexOf(FOLLOW_UP_DELIMITER);
  if (delimiterIndex === -1) {
    const numberedPattern = /\n(?:\d+[.)]\s*.+\?\s*){2,3}$/;
    const match = llmText.match(numberedPattern);
    if (match) {
      const cleanText = llmText.slice(0, match.index).trimEnd();
      const lines = match[0].trim().split('\n').filter(l => l.trim());
      const questions = lines
        .map(l => l.replace(/^\d+[.)]\s*/, '').trim())
        .filter(q => q.endsWith('?') && q.length > 5)
        .slice(0, 3);
      if (questions.length >= 2) {
        return { cleanText, questions };
      }
    }
    return { cleanText: llmText, questions: [] };
  }

  const cleanText = llmText.slice(0, delimiterIndex).trimEnd();
  const followUpBlock = llmText.slice(delimiterIndex + FOLLOW_UP_DELIMITER.length).trim();

  const questions = followUpBlock
    .split('\n')
    .map(l => l.replace(/^\d+[.)]\s*/, '').replace(/^[-•*]\s*/, '').trim())
    .filter(q => q.length > 5 && q.length < 200)
    .slice(0, 3);

  return { cleanText, questions };
}

const DELIMITER_TRIGGER = '\n---';
const BUFFER_SIZE = FOLLOW_UP_DELIMITER.length + 5;

export class FollowUpStreamFilter {
  private buffer = '';
  private delimiterDetected = false;
  private afterDelimiter = '';

  push(chunk: string): string {
    if (this.delimiterDetected) {
      this.afterDelimiter += chunk;
      return '';
    }

    this.buffer += chunk;

    const delimIdx = this.buffer.indexOf(FOLLOW_UP_DELIMITER);
    if (delimIdx !== -1) {
      this.delimiterDetected = true;
      const safeText = this.buffer.slice(0, delimIdx);
      this.afterDelimiter = this.buffer.slice(delimIdx + FOLLOW_UP_DELIMITER.length);
      this.buffer = '';
      return safeText;
    }

    const triggerIdx = this.buffer.lastIndexOf(DELIMITER_TRIGGER);
    if (triggerIdx !== -1 && triggerIdx > this.buffer.length - BUFFER_SIZE) {
      const safeText = this.buffer.slice(0, triggerIdx);
      this.buffer = this.buffer.slice(triggerIdx);
      return safeText;
    }

    if (this.buffer.length > BUFFER_SIZE) {
      const safeText = this.buffer.slice(0, this.buffer.length - BUFFER_SIZE);
      this.buffer = this.buffer.slice(this.buffer.length - BUFFER_SIZE);
      return safeText;
    }

    return '';
  }

  flush(): { remainingText: string; questions: string[] } {
    if (this.delimiterDetected) {
      const questions = this.afterDelimiter
        .trim()
        .split('\n')
        .map(l => l.replace(/^\d+[.)]\s*/, '').replace(/^[-•*]\s*/, '').trim())
        .filter(q => q.length > 5 && q.length < 200)
        .slice(0, 3);
      return { remainingText: this.buffer.trimEnd(), questions };
    }

    const { cleanText, questions } = extractInlineFollowUps(this.buffer);
    return { remainingText: cleanText, questions };
  }
}

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
    .map((r, i) => {
      const displayName = r.source_name === 'twelve_data'
        ? 'Twelve Data'
        : r.source_name;
      return {
        source_type: mapSourceType(r.source_type),
        source_name: displayName,
        reference_id: `ref-${i + 1}`,
        as_of: r.as_of,
      };
    });
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
    show_news_card: hasNews && (intent.primary_intent === 'market_context' || intent.primary_intent === 'news_explain'),
    show_health_card: hasHealth && (intent.primary_intent === 'portfolio_explain' || intent.primary_intent === 'recommendation_request'),
  };
}

