interface ChatResponseMapping {
  keywords: string[];
  message: string;
  simulator?: {
    type: 'retirement' | 'investment' | 'spending' | 'tax';
    initialValues?: Record<string, number>;
  };
}

const chatResponses: ChatResponseMapping[] = [
  {
    keywords: ['what changed in the markets', "what's changed"],
    message: 'Markets have increased their expectations for interest-rate cuts in the coming months. As a result, growth stocks \u2014 particularly technology \u2014 have risen more than the broader market.',
  },
  {
    keywords: ['why does this affect my portfolio'],
    message: "Because growth stocks make up 33% of your total portfolio allocation, this shift in rate expectations has a larger impact on your returns than it would in a more balanced allocation.\n\nWould you like to review your portfolio concentration or keep monitoring this for now?",
  },
  {
    keywords: ['review tech allocation', 'tech allocation'],
    message: "Your technology allocation currently stands at 48% (AAPL, MSFT, AMZN), which exceeds your target range of 35-40%.\n\nI recommend rebalancing 8-10% into diversified equities or fixed income.\n\nWould you like me to prepare a detailed rebalancing plan?",
  },
  {
    keywords: ['review my risk exposure', 'risk exposure'],
    message: "Here's your current risk breakdown:\n\n\u2022 Global equities: 33% of total wealth (concentrated in US tech)\n\u2022 Fixed income: 15% (below your 25% target)\n\u2022 Cash: 20% (above optimal for growth)\n\nYour concentration in growth stocks amplifies both gains and losses. During a 15-20% equity correction, your portfolio could experience a 6-8% drawdown.\n\nWould you like to explore rebalancing strategies, or model the impact of a market correction on your current allocation?",
  },
  {
    keywords: ['why am i off track', 'off track'],
    message: "Here's what changed.\n\nYour house deposit goal slipped off track for two reasons:\n\n1. Recent withdrawals reduced momentum\nYou withdrew $3,000 in December which slowed progress toward your target amount.\n\n2. Time to target is narrowing\nWith only 12 months remaining until your target date of December 2026, your current rate of saving means you would miss your target amount.\n\nThe good news: this isn't a structural issue. Increasing your monthly contribution by $350 per month (4.4% of your monthly salary) will put you back on track.",
  },
  {
    keywords: ['how can i get back on track', 'get back on track'],
    message: "To get your education fund back on track, here are three options:\n\n\u2022 Option A: Increase monthly contributions by $150/month\n\u2022 Option B: Reallocate 5% from cash to a higher-yield education savings vehicle\n\u2022 Option C: Extend the deadline by 6 months and maintain current pace\n\nGiven your current cash position of 20%, Option B would have minimal impact on your liquidity while improving long-term growth.\n\nWould you like me to model any of these scenarios in detail?",
  },
  {
    keywords: ['dive deeper'],
    message: "Let's examine your portfolio's key metrics:\n\nPerformance: +2.44% year-to-date ($2,210 gain)\nRisk level: Within your target range\n\nAllocation versus targets:\n\u2022 Technology: 48% (above 35-40% target)\n\u2022 Bonds: 15% (below 25% target)\n\u2022 Overall: 92% on-target\n\nWhich area would you like to explore first\u2014the tech rebalance or bond opportunities?",
  },
  {
    keywords: ['bond', 'fixed income'],
    message: "Your current bond allocation stands at 15%, below your 25% target. With recent institutional inflows of $4.2B into GCC bonds, there's heightened interest in high-yielding regional debt.\n\nWould you like to see specific bond opportunities that align with your goals?",
  },
  {
    keywords: ['portfolio', 'risk'],
    message: "Your portfolio is performing well, up 0.8% since yesterday. Risk remains within your agreed parameters.\n\nWhat specific aspect would you like to explore\u2014current allocations, performance drivers, or upcoming opportunities?",
  },
  {
    keywords: ['contact advisor', 'advisor'],
    message: "I'll connect you with Sarah Mitchell, your dedicated advisor. She's available today.\n\nIn the meantime, here's a summary I can share with her:\n\u2022 Portfolio up 2.44% YTD\n\u2022 Tech allocation above target (48% vs 35-40%)\n\u2022 Bond allocation below target (15% vs 25%)\n\u2022 House deposit goal needs attention\n\nShall I schedule a call, or would you prefer to send her a message?",
  },
];

const defaultResponse = {
  message: "Could you provide more details? I'm ready to help with portfolio analysis, risk modeling, or market insights.",
};

export function findChatResponse(userMessage: string): { message: string; simulator?: ChatResponseMapping['simulator'] } {
  const msg = userMessage.toLowerCase();
  for (const mapping of chatResponses) {
    if (mapping.keywords.some((kw) => msg.includes(kw))) {
      return { message: mapping.message, simulator: mapping.simulator };
    }
  }
  return defaultResponse;
}

export function getSuggestedQuestions(lastAssistantMessage: string): string[] {
  if (lastAssistantMessage.includes('rate expectations')) {
    return ['Why does this affect my portfolio?', 'How much of my portfolio is exposed?'];
  }
  if (lastAssistantMessage.includes('rebalancing')) {
    return ['Yes, show me scenarios', 'What are the risks?'];
  }
  if (lastAssistantMessage.includes('off track')) {
    return ['Show me recovery options', 'How much more do I need monthly?'];
  }
  return ['Tell me more', 'Show me the numbers'];
}
