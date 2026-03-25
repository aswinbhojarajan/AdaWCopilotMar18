import { resilientCompletion } from './openaiClient';
import { resolveModel } from './modelRouter';
import { getClassifierContext } from './capabilityRegistry';

export type Intent = 'balance_query' | 'portfolio_explain' | 'allocation_breakdown' | 'goal_progress' | 'market_context' | 'news_explain' | 'scenario_analysis' | 'recommendation_request' | 'execution_request' | 'support' | 'general';

const VALID_INTENTS: Intent[] = [
  'balance_query', 'portfolio_explain', 'allocation_breakdown', 'goal_progress',
  'market_context', 'news_explain', 'scenario_analysis', 'recommendation_request',
  'execution_request', 'support', 'general',
];

export interface ClassifierOutput {
  intent: Intent;
  confidence: number;
  reasoning_effort: 'low' | 'medium' | 'high';
  needs_live_data: boolean;
  needs_tooling: boolean;
  mentioned_entities: string[];
  followup_mode: 'suggest' | 'none' | 'inline';
}

export interface ConversationContext {
  role: 'user' | 'assistant';
  content: string;
}

const CONTINUATION_PATTERNS = [
  'do across', 'do it for', 'do that for', 'do the same', 'same for',
  'across all', 'for all', 'all of them', 'every one', 'each one',
  'tell me more', 'more detail', 'go deeper', 'elaborate', 'expand on',
  'what about', 'how about', 'and for', 'also for', 'and what about',
  'yes', 'yeah', 'sure', 'please do', 'go on', 'continue',
  'can you also', 'now do', 'now for', 'next', 'the rest',
  'break it down', 'break that down', 'explain more', 'why is that',
  'show me', 'give me more', 'keep going',
];

function isLikelyContinuation(message: string): boolean {
  const lower = message.toLowerCase().trim();
  const wordCount = lower.split(/\s+/).length;

  if (wordCount <= 6 && CONTINUATION_PATTERNS.some(p => lower.includes(p))) {
    return true;
  }

  return false;
}

function buildClassificationPrompt(recentHistory?: ConversationContext[]): string {
  const routingContext = getClassifierContext();

  let historyBlock = '';
  if (recentHistory && recentHistory.length > 0) {
    const formatted = recentHistory.map(t =>
      `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.content.slice(0, 300)}`
    ).join('\n');
    historyBlock = `
RECENT CONVERSATION (for context — use this to resolve ambiguous follow-up messages):
${formatted}

FOLLOW-UP RESOLUTION RULES:
- If the current message is short, vague, or refers back to the prior conversation (e.g., "do across all", "tell me more", "what about bonds", "yes", "continue"), classify it with the SAME intent as the user's prior question, not as "general" or "balance_query".
- "do across all" / "for all" / "all of them" after a news/analysis question → same intent (e.g., news_explain or portfolio_explain)
- "tell me more" / "elaborate" / "go deeper" → same intent as the prior turn
- "what about X" → same intent, with X as a mentioned entity
- Only classify as a NEW intent if the user clearly changes topic.
`;
  }

  return `You are an intent classifier for a wealth management AI copilot serving GCC HNW investors. Classify the user's message into exactly ONE intent.

INTENTS:
- balance_query: Direct questions about portfolio value, total balance, net worth, account value, "how much do I have"
- portfolio_explain: Questions about holdings, positions, performance, returns, gains/losses, what's in the portfolio, top/bottom performers
- allocation_breakdown: Questions about asset allocation, sector/geography splits, how money is distributed, concentration, diversification, rebalancing
- goal_progress: Questions about financial goals, savings targets, milestones, on/off track, deadlines, progress toward objectives
- market_context: Questions about market conditions, interest rates, economic indicators, sector trends, inflation, GDP, macro outlook, currency conversion, exchange rates, FX rates, historical prices, company profiles
- news_explain: Questions about specific news, headlines, what happened, why did X move, earnings, company events
- scenario_analysis: What-if analysis, projections, retirement planning, simulations, tax planning, spending models, compound growth
- recommendation_request: Requests for investment advice, what to buy/sell, where to put money, which funds to choose, portfolio optimization suggestions
- execution_request: Requests to execute trades, place orders, confirm transactions, transfer funds, proceed with a trade, "go ahead", "do it"
- support: Platform help, how to use the app, account settings, technical issues
- general: Greetings, small talk, off-topic, or anything that doesn't fit the above

${routingContext}
${historyBlock}
Respond with ONLY a JSON object:
{"intent":"<intent>","confidence":<0.0-1.0>,"reasoning_effort":"low|medium|high","needs_live_data":<bool>,"needs_tooling":<bool>,"mentioned_entities":["<ticker_or_entity>"],"followup_mode":"suggest|none|inline"}

Rules for fields:
- reasoning_effort: "low" for simple lookups/greetings, "medium" for explanations, "high" for analysis/recommendations/scenarios
- needs_live_data: true if answer requires current market prices, rates, or news
- needs_tooling: true if answer requires calling data tools (portfolio, market, etc.), false for pure conversation
- mentioned_entities: extract ticker symbols (AAPL, MSFT), asset classes (equities, bonds), or named entities
- followup_mode: "suggest" for most queries, "none" for greetings/support, "inline" for multi-step scenarios

Do not include any other text.`;
}

function buildFallbackOutput(intent: Intent, message: string): ClassifierOutput {
  const lower = message.toLowerCase();
  const symbols = (message.match(/\b[A-Z]{2,5}\b/g) ?? []).filter(s => {
    const common = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HOW', 'HAS']);
    return !common.has(s);
  });

  let reasoning_effort: ClassifierOutput['reasoning_effort'] = 'medium';
  if (['balance_query', 'general', 'support'].includes(intent)) reasoning_effort = 'low';
  if (['scenario_analysis', 'recommendation_request'].includes(intent)) reasoning_effort = 'high';

  const needsLiveData = ['market_context', 'news_explain'].includes(intent) ||
    lower.includes('price') || lower.includes('today') || lower.includes('current');

  const noTooling = ['general', 'support'].includes(intent);

  let followup_mode: ClassifierOutput['followup_mode'] = 'suggest';
  if (['general', 'support'].includes(intent)) followup_mode = 'none';
  if (intent === 'scenario_analysis') followup_mode = 'inline';

  return {
    intent,
    confidence: 0.5,
    reasoning_effort,
    needs_live_data: needsLiveData,
    needs_tooling: !noTooling,
    mentioned_entities: symbols,
    followup_mode,
  };
}

export async function classifyIntentAsync(
  message: string,
  recentHistory?: ConversationContext[],
): Promise<ClassifierOutput> {
  try {
    const response = await resilientCompletion({
      model: resolveModel('ada-classifier'),
      messages: [
        { role: 'system', content: buildClassificationPrompt(recentHistory) },
        { role: 'user', content: message },
      ],
      max_completion_tokens: 200,
    }, { timeoutMs: 4000, retries: 1, providerAlias: 'ada-classifier' });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      console.log('[IntentClassifier] LLM returned empty content');
      return buildFallbackOutput(classifyIntentFallback(message, recentHistory), message);
    }

    const jsonMatch = content.match(/\{[\s\S]+\}/);
    if (!jsonMatch) {
      console.log('[IntentClassifier] LLM response not JSON:', content.slice(0, 80));
      return buildFallbackOutput(classifyIntentFallback(message, recentHistory), message);
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const intent = parsed.intent as Intent;
    if (!VALID_INTENTS.includes(intent)) {
      console.log('[IntentClassifier] LLM returned invalid intent:', parsed.intent);
      return buildFallbackOutput(classifyIntentFallback(message, recentHistory), message);
    }

    const confidence = typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.8;
    const reasoning_effort = ['low', 'medium', 'high'].includes(parsed.reasoning_effort as string)
      ? (parsed.reasoning_effort as ClassifierOutput['reasoning_effort'])
      : 'medium';
    const needs_live_data = typeof parsed.needs_live_data === 'boolean' ? parsed.needs_live_data : false;
    const needs_tooling = typeof parsed.needs_tooling === 'boolean' ? parsed.needs_tooling : true;
    const mentioned_entities = Array.isArray(parsed.mentioned_entities)
      ? (parsed.mentioned_entities as unknown[]).filter((e): e is string => typeof e === 'string')
      : [];
    const followup_mode = ['suggest', 'none', 'inline'].includes(parsed.followup_mode as string)
      ? (parsed.followup_mode as ClassifierOutput['followup_mode'])
      : 'suggest';

    if (intent === 'general' && recentHistory && recentHistory.length > 0 && isLikelyContinuation(message)) {
      const priorIntent = extractPriorUserIntent(recentHistory);
      if (priorIntent && priorIntent !== 'general') {
        console.log('[IntentClassifier] LLM returned general for continuation, inheriting prior intent:', priorIntent);
        return {
          intent: priorIntent,
          confidence: Math.max(confidence, 0.6),
          reasoning_effort,
          needs_live_data,
          needs_tooling: true,
          mentioned_entities,
          followup_mode,
        };
      }
    }

    return { intent, confidence, reasoning_effort, needs_live_data, needs_tooling, mentioned_entities, followup_mode };
  } catch (err) {
    console.error('[IntentClassifier] LLM classification failed, using fallback:', (err as Error).message);
    return buildFallbackOutput(classifyIntentFallback(message, recentHistory), message);
  }
}

export function classifyIntent(message: string): Intent {
  return classifyIntentFallback(message);
}

function extractPriorUserIntent(history: ConversationContext[]): Intent | null {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'user') {
      return classifyIntentFallback(history[i].content);
    }
  }
  return null;
}

function classifyIntentFallback(message: string, recentHistory?: ConversationContext[]): Intent {
  const lower = message.toLowerCase();

  interface IntentRule { intent: Intent; keywords: string[]; priority: number }
  const INTENT_RULES: IntentRule[] = [
    {
      intent: 'execution_request',
      priority: 1,
      keywords: [
        'execute', 'place order', 'place the order', 'go ahead', 'do it',
        'confirm trade', 'confirm the trade', 'rebalance now', 'buy for me',
        'sell for me', 'make the trade', 'execute the trade', 'proceed with',
        'yes, go ahead', 'yes go ahead', 'approve the', 'submit the order',
        'process the trade', 'carry out', 'move forward with the trade',
        'yes please execute', 'please execute', 'transfer now', 'wire the funds',
      ],
    },
    {
      intent: 'recommendation_request',
      priority: 2,
      keywords: [
        'recommend', 'suggest investments', 'what should i invest',
        'should i buy', 'should i sell', 'advise me', 'give me advice',
        'what do you recommend', 'best investment', 'where should i put my money',
        'what would you suggest', 'investment advice', 'help me invest',
        'which stocks', 'which funds', 'what to buy', 'optimize my portfolio',
        'rebalance', 'diversif', 'risk analysis', 'portfolio health',
      ],
    },
    {
      intent: 'scenario_analysis',
      priority: 3,
      keywords: [
        'retire', 'retirement', 'scenario', 'simulate', 'what if',
        'projection', 'model', 'spending', 'tax', 'investment growth',
        'how much will', 'how much do i need', 'compound', 'savings rate',
      ],
    },
    {
      intent: 'news_explain',
      priority: 4,
      keywords: [
        'news', 'headline', 'what happened', 'why did', 'earnings',
        'announced', 'reported', 'breaking', 'update on',
      ],
    },
    {
      intent: 'market_context',
      priority: 5,
      keywords: [
        'market', 'interest rate', 'fed', 'inflation', 'gdp',
        'economic', 'sector', 'industry', 'trend', 'outlook',
        'forecast', 'gcc', 'emerging', 'correction', 'macro',
        'oil price', 'crude', 'currency', 'dollar',
        'exchange rate', 'fx rate', 'convert', 'aed', 'dirham',
        'price history', 'historical price', 'company profile',
      ],
    },
    {
      intent: 'goal_progress',
      priority: 6,
      keywords: [
        'goal', 'target', 'house', 'education', 'deposit', 'on track',
        'off track', 'deadline', 'saving for', 'milestone', 'progress',
        'get back on track', 'recovery option', 'savings', 'accelerate',
      ],
    },
    {
      intent: 'allocation_breakdown',
      priority: 7,
      keywords: [
        'allocation', 'asset class', 'breakdown', 'split',
        'how is my money allocated', 'where is my money',
        'sector breakdown', 'geography', 'concentrated',
      ],
    },
    {
      intent: 'balance_query',
      priority: 8,
      keywords: [
        'balance', 'total value', 'how much', 'what\'s my',
        'net worth', 'account value', 'portfolio value',
      ],
    },
    {
      intent: 'portfolio_explain',
      priority: 9,
      keywords: [
        'portfolio', 'holding', 'position', 'stock', 'bond',
        'equity', 'fixed income', 'asset', 'weight',
        'performance', 'return', 'gain', 'loss', 'value',
        'drawdown', 'volatility', 'sharpe', 'exposure',
        'account', 'brokerage', 'top performer', 'bottom performer',
      ],
    },
    {
      intent: 'support',
      priority: 10,
      keywords: [
        'help', 'how do i', 'support', 'settings', 'account settings',
        'password', 'login', 'bug', 'error', 'not working',
      ],
    },
  ];

  for (const rule of INTENT_RULES) {
    if (rule.keywords.some(k => lower.includes(k))) {
      return rule.intent;
    }
  }

  if (recentHistory && recentHistory.length > 0 && isLikelyContinuation(message)) {
    const priorIntent = extractPriorUserIntent(recentHistory);
    if (priorIntent && priorIntent !== 'general') {
      console.log('[IntentClassifier] Fallback: detected continuation, inheriting prior intent:', priorIntent);
      return priorIntent;
    }
  }

  return 'general';
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  portfolio: ['portfolio', 'allocation', 'holding', 'stock', 'bond', 'rebalance'],
  goals: ['goal', 'target', 'house', 'education', 'saving', 'milestone'],
  market: ['market', 'interest rate', 'inflation', 'economic', 'sector'],
  scenario: ['retire', 'scenario', 'projection', 'tax', 'spending'],
  risk: ['risk', 'volatility', 'drawdown', 'diversif'],
};

export function extractTopics(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      found.push(topic);
    }
  }
  return found.length > 0 ? found : ['general'];
}

export function getScenarioType(message: string): 'retirement' | 'investment' | 'spending' | 'tax' | null {
  const lower = message.toLowerCase();
  if (lower.includes('retire') || lower.includes('retirement')) return 'retirement';
  if (lower.includes('tax') || lower.includes('deduction')) return 'tax';
  if (lower.includes('spending') || lower.includes('expense') || lower.includes('budget')) return 'spending';
  if (lower.includes('invest') || lower.includes('growth') || lower.includes('compound')) return 'investment';
  return null;
}
