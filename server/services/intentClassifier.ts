export type Intent = 'portfolio' | 'goals' | 'market' | 'scenario' | 'general';

interface IntentRule {
  intent: Intent;
  keywords: string[];
}

const INTENT_RULES: IntentRule[] = [
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
      'get back on track', 'recovery option',
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
      'account', 'brokerage', 'savings',
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

export function classifyIntent(message: string): Intent {
  const lower = message.toLowerCase();

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
