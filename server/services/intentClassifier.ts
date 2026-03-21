export type Intent = 'portfolio' | 'goals' | 'market' | 'scenario' | 'recommendation' | 'execution_request' | 'general';

interface IntentRule {
  intent: Intent;
  keywords: string[];
}

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
