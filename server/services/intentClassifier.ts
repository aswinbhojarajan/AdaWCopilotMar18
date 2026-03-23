import { openai } from './openaiClient';
import { resolveModel } from './modelRouter';

export type Intent = 'portfolio' | 'goals' | 'market' | 'scenario' | 'recommendation' | 'execution_request' | 'general';

const VALID_INTENTS: Intent[] = ['portfolio', 'goals', 'market', 'scenario', 'recommendation', 'execution_request', 'general'];

const CLASSIFICATION_PROMPT = `You are an intent classifier for a wealth management AI copilot. Classify the user's message into exactly ONE of these intents:

- portfolio: Questions about holdings, positions, allocation, performance, account balances, portfolio value, returns, gains/losses, risk metrics, rebalancing, diversification
- goals: Questions about financial goals, savings targets, milestones, progress toward goals, accelerating savings, being on/off track, deadlines for financial objectives
- market: Questions about market conditions, interest rates, economic news, sector trends, forecasts, inflation, GDP
- scenario: Questions about projections, retirement planning, what-if analysis, simulations, tax planning, spending models, compound growth, investment growth scenarios
- recommendation: Requests for investment advice, what to buy/sell, where to put money, which stocks/funds to choose
- execution_request: Requests to execute trades, place orders, confirm transactions, transfer/wire funds, proceed with a trade
- general: Greetings, off-topic, or anything that doesn't fit the above categories

Respond with ONLY a JSON object: {"intent":"<intent>","confidence":<0.0-1.0>}
Do not include any other text.`;

export async function classifyIntentAsync(message: string): Promise<{ intent: Intent; confidence: number }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await openai.chat.completions.create({
      model: resolveModel('ada-fast'),
      messages: [
        { role: 'system', content: CLASSIFICATION_PROMPT },
        { role: 'user', content: message },
      ],
      max_completion_tokens: 100,
    }, { signal: controller.signal });

    clearTimeout(timeout);

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      console.log('[IntentClassifier] LLM returned empty content');
      return { intent: classifyIntentFallback(message), confidence: 0.5 };
    }

    const jsonMatch = content.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      console.log('[IntentClassifier] LLM response not JSON:', content.slice(0, 80));
      return { intent: classifyIntentFallback(message), confidence: 0.5 };
    }

    const parsed = JSON.parse(jsonMatch[0]) as { intent?: string; confidence?: number };
    const intent = parsed.intent as Intent;
    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.8;

    if (VALID_INTENTS.includes(intent)) {
      return { intent, confidence };
    }

    console.log('[IntentClassifier] LLM returned invalid intent:', parsed.intent);
    return { intent: classifyIntentFallback(message), confidence: 0.5 };
  } catch (err) {
    console.error('[IntentClassifier] LLM classification failed, using fallback:', (err as Error).message);
    return { intent: classifyIntentFallback(message), confidence: 0.4 };
  }
}

export function classifyIntent(message: string): Intent {
  return classifyIntentFallback(message);
}

function classifyIntentFallback(message: string): Intent {
  const lower = message.toLowerCase();

  interface IntentRule { intent: Intent; keywords: string[] }
  const INTENT_RULES: IntentRule[] = [
    {
      intent: 'execution_request',
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
      intent: 'recommendation',
      keywords: [
        'recommend', 'suggest investments', 'what should i invest',
        'should i buy', 'should i sell', 'advise me', 'give me advice',
        'what do you recommend', 'best investment', 'where should i put my money',
        'what would you suggest', 'investment advice', 'help me invest',
        'which stocks', 'which funds', 'what to buy',
      ],
    },
    {
      intent: 'scenario',
      keywords: [
        'retire', 'retirement', 'scenario', 'simulate', 'what if',
        'projection', 'model', 'spending', 'tax', 'investment growth',
        'how much will', 'how much do i need', 'compound', 'savings rate',
      ],
    },
    {
      intent: 'goals',
      keywords: [
        'goal', 'target', 'house', 'education', 'deposit', 'on track',
        'off track', 'deadline', 'saving for', 'milestone', 'progress',
        'get back on track', 'recovery option', 'savings', 'accelerate',
      ],
    },
    {
      intent: 'portfolio',
      keywords: [
        'portfolio', 'allocation', 'holding', 'position', 'stock',
        'bond', 'rebalance', 'diversif', 'exposure', 'concentrated',
        'tech', 'equity', 'fixed income', 'asset', 'weight',
        'performance', 'return', 'gain', 'loss', 'value', 'balance',
        'risk', 'drawdown', 'volatility', 'sharpe',
        'account', 'brokerage',
      ],
    },
    {
      intent: 'market',
      keywords: [
        'market', 'interest rate', 'fed', 'inflation', 'gdp',
        'economic', 'sector', 'industry', 'trend', 'outlook',
        'forecast', 'news', 'update', 'changed in the market',
        'opportunity', 'gcc', 'emerging', 'correction',
      ],
    },
  ];

  let bestMatch: Intent = 'general';
  let bestScore = 0;

  for (const rule of INTENT_RULES) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule.intent;
    }
  }

  return bestMatch;
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
