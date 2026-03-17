import type { ChatResponseMapping } from '../types';

export const chatResponses: ChatResponseMapping[] = [
  {
    keywords: ['what changed in the markets', "what's changed"],
    message:
      'Markets have increased their expectations for interest-rate cuts in the coming months. As a result, growth stocks \u2014 particularly technology \u2014 have risen more than the broader market.',
  },
  {
    keywords: ['why does this affect my portfolio'],
    message:
      "Because growth stocks make up 33% of your total portfolio allocation, this shift in rate expectations has a larger impact on your returns than it would in a more balanced allocation.\n\nWould you like to review your portfolio concentration or keep monitoring this for now?",
  },
  {
    keywords: ['review tech allocation', 'tech allocation'],
    message:
      "Your technology allocation currently stands at 48% (AAPL, MSFT, AMZN), which exceeds your target range of 35-40%. While the Fed's anticipated rate cuts are expanding tech multiples, this concentration introduces notable sector-specific risk.\n\nI recommend rebalancing 8-10% into diversified equities or fixed income to better align with your risk profile while preserving growth exposure.\n\nWould you like me to prepare a detailed rebalancing plan, or shall we explore which specific positions to adjust?",
  },
  {
    keywords: ['model risk scenarios', 'risk scenarios'],
    message:
      "I've created an interactive scenario simulator below. Adjust the parameters to see how different allocation strategies impact your portfolio over time.\n\nBased on your risk tolerance, reducing tech to 40% offers optimal balance between stability and growth.\n\nShall I prepare a detailed rebalancing plan, or would you like to discuss the trade-offs further?",
    simulator: {
      type: 'investment',
      initialValues: { initialAmount: 90000, monthlyAddition: 3000, years: 10, returnRate: 7 },
    },
  },
  {
    keywords: ['explore bond options', 'bond options'],
    message:
      "Given your current 15% bond allocation\u2014below your 25% target\u2014here are three high-quality options aligned with your objectives:\n\nGCC Sovereign Bonds: 4.8-5.2% yield, AAA rated\nEM Corporate Debt: 6.1% yield, BBB+ rated\nGlobal Aggregate Fund: 4.5% yield, diversified exposure\n\nWith recent institutional inflows of $4.2B into GCC bonds, confidence in the region remains strong. Allocating an additional 10% to bonds could reduce portfolio volatility by 3-4% while generating stable income.\n\nWhich option resonates with your goals, or would you like to compare them in detail?",
  },
  {
    keywords: ['compare scenarios'],
    message:
      "I've set up a comparison tool below. Adjust your bond allocation to see the impact on volatility and returns.\n\nMoving to your 25% target would reduce portfolio volatility by approximately 3.2%, add an estimated $1,050 monthly in bond income, and modestly lower growth potential by 0.4% annually.\n\nWould you like specific bond recommendations, or shall we model the transition timeline?",
    simulator: {
      type: 'investment',
      initialValues: { initialAmount: 90000, monthlyAddition: 2500, years: 15, returnRate: 5.5 },
    },
  },
  {
    keywords: ['what does this mean for my returns', 'mean for my returns'],
    message:
      "Your lower growth allocation (58% versus the 73% market average) means market surges typically produce 15-20% smaller gains for your portfolio. In the recent year-end rally:\n\nMarket average gain: +3.8%\nYour estimated gain: +3.1%\n\nHowever, this defensive positioning also means 12-18% smaller losses during downturns. This trade-off aligns with your balanced risk approach, and your year-to-date performance of +2.44% remains solid given your conservative stance.\n\nWould you like to explore adjusting your growth exposure, or review how this positioning serves your long-term goals?",
  },
  {
    keywords: ['more growth exposure', 'growth exposure'],
    message:
      "Use the simulator below to model increasing your growth exposure from 58% to 65-70%.\n\nPotential benefits:\n\u2022 Capture more upside in bull markets (+0.8-1.2% potential annual return)\n\u2022 Better alignment with peer average allocations\n\nTrade-offs:\n\u2022 Volatility increase of 4-6%\n\u2022 Amplified losses during market corrections\n\nGiven your current risk tolerance, I'd recommend a measured approach: gradually shift 3-5% to growth assets quarterly.\n\nShall I model specific growth investments, or would you prefer to discuss the timing of any adjustments?",
    simulator: {
      type: 'investment',
      initialValues: { initialAmount: 90000, monthlyAddition: 3500, years: 10, returnRate: 8.5 },
    },
  },
  {
    keywords: ['dive deeper'],
    message:
      "Let's examine your portfolio's key metrics:\n\nPerformance: +2.44% year-to-date ($2,210 gain)\nRisk level: Within your target range\n\nAllocation versus targets:\n\u2022 Technology: 48% (above 35-40% target)\n\u2022 Bonds: 15% (below 25% target)\n\u2022 Overall: 92% on-target\n\nPriority considerations:\n1. Rebalance tech exposure (reduce by 8-10%)\n2. Increase bond allocation (add 10%)\n3. Maintain current performance momentum\n\nYour defensive positioning continues to serve you well.\n\nWhich area would you like to explore first\u2014the tech rebalance or bond opportunities?",
  },
  {
    keywords: ['simple scenario', 'show me a simple scenario'],
    message:
      "I've set up a scenario simulator below. Adjust the allocation to see how it performs during market corrections and rallies.\n\nYour current allocation prioritizes stability. This adjustment would enhance that protection further.\n\nWould you like to explore implementing this shift, or model alternative scenarios?",
    simulator: {
      type: 'investment',
      initialValues: { initialAmount: 90000, monthlyAddition: 2000, years: 10, returnRate: 7 },
    },
  },
  {
    keywords: ['mean over time', 'what does this mean over time'],
    message:
      "Use the simulator below to model your portfolio over different time horizons.\n\nOver a 5-10 year horizon, your higher growth allocation suggests:\n\nProjected outcomes:\n\u2022 Your 10-year projected return: 7.8% annually\n\u2022 Peer average projection: 6.4% annually\n\u2022 Your advantage: Approximately +$45,000 over 10 years\n\nConsiderations:\n\u2022 Expect 2-3 larger drawdowns during corrections\n\u2022 Higher year-to-year volatility\n\u2022 Requires sustained discipline through market cycles\n\nWould you like to discuss downside protection strategies, or review your long-term targets?",
    simulator: {
      type: 'investment',
      initialValues: { initialAmount: 90000, monthlyAddition: 3000, years: 10, returnRate: 7.8 },
    },
  },
  {
    keywords: ['retirement'],
    message:
      "Let me help you model your retirement plan. I've set up a simulator below where you can adjust your monthly contributions, time horizon, and expected returns.\n\nBased on your current trajectory and risk profile, I recommend maintaining consistent contributions while balancing growth and preservation.\n\nWhat retirement age are you targeting, and would you like to discuss specific retirement income goals?",
    simulator: {
      type: 'retirement',
      initialValues: { monthlyContribution: 5000, years: 20, returnRate: 7 },
    },
  },
  {
    keywords: ['spending', 'budget'],
    message:
      "I've created a spending projection simulator below. Adjust the inflation rate and time horizon to see how your expenses might grow over time.\n\nUnderstanding future spending needs is crucial for retirement planning and ensuring your portfolio can support your lifestyle.\n\nWould you like to discuss strategies for managing inflation risk in your portfolio?",
    simulator: {
      type: 'spending',
      initialValues: { monthlySpending: 8000, inflationRate: 3, years: 30 },
    },
  },
  {
    keywords: ['tax', 'optimize tax'],
    message:
      "Use the tax optimization simulator below to see how different deduction strategies impact your after-tax income.\n\nTax-efficient portfolio management can significantly enhance your net returns. I can help identify opportunities for tax-loss harvesting, strategic withdrawals, and optimal account placement.\n\nWould you like to explore specific tax optimization strategies for your situation?",
    simulator: {
      type: 'tax',
      initialValues: { income: 500000, deductions: 50000, taxRate: 35 },
    },
  },
  {
    keywords: ['regional opportunities', 'compare regional'],
    message:
      "Based on your portfolio and risk profile, here's my regional assessment:\n\nNorth America: Mature growth, technology-heavy\n\u2022 Fit for your profile: 7/10 (already well-exposed)\n\nEurope: Value opportunities, defensive positioning\n\u2022 Fit for your profile: 8/10 (adds diversification)\n\nAsia Pacific: High growth potential\n\u2022 Fit for your profile: 6/10 (increases volatility)\n\nEmerging Markets: Maximum growth, higher risk\n\u2022 Fit for your profile: 5/10 (above risk tolerance)\n\nRecommendation: Consider adding 5-8% European exposure for enhanced balance.\n\nWould you like specific fund recommendations, or shall we discuss the timing of any regional adjustments?",
  },
  {
    keywords: ['emerging regions', 'regions to watch'],
    message:
      "Based on current macroeconomic trends and your profile, here are emerging regions worth monitoring:\n\nIndia: GDP growth 6.5%, favorable demographics\n\u2022 Best suited for: Long-term growth exposure (10+ years)\n\u2022 Risk level: High\n\nVietnam: Manufacturing hub growth\n\u2022 Best suited for: Diversification from China\n\u2022 Risk level: Moderate-High\n\nGCC Markets: Energy transition and sovereign wealth\n\u2022 Best suited for: Stability with growth (aligns with your profile)\n\u2022 Risk level: Moderate\n\nMexico: Nearshoring beneficiary\n\u2022 Best suited for: Trade-dependent growth\n\u2022 Risk level: Moderate\n\nGiven your risk tolerance, I'd recommend initiating with GCC markets at 3-5% allocation.\n\nWould you like to explore specific investment vehicles, or discuss the implementation timeline?",
  },
  {
    keywords: ['tech', 'allocation'],
    message:
      "I can help you review your technology allocation. Currently, you hold 48% in tech stocks (AAPL, MSFT, AMZN). Given the recent Fed rate-cut expectations, growth multiples are expanding, though this also introduces concentration risk.\n\nWould you like me to model different allocation scenarios, or review specific positions within your tech holdings?",
  },
  {
    keywords: ['bond', 'fixed income'],
    message:
      'Your current bond allocation stands at 15%, which is below your 25% target. With recent institutional inflows of $4.2B into GCC bonds, there\'s heightened interest in high-yielding regional debt.\n\nWould you like to see specific bond opportunities that align with your goals, or shall we discuss the optimal pace for increasing your allocation?',
  },
  {
    keywords: ['portfolio', 'risk'],
    message:
      "Your portfolio is performing well, up 0.8% since yesterday. Risk remains within your agreed parameters, and I'm monitoring several factors that could affect your holdings.\n\nWhat specific aspect would you like to explore\u2014current allocations, performance drivers, or upcoming opportunities?",
  },
  {
    keywords: ['return', 'growth'],
    message:
      'Given your current allocation, your portfolio maintains a balanced risk-return profile. Year-to-date you\'re up $2,210.1 (+2.44%). Your lower growth exposure provides stability, though it may limit gains during strong market surges.\n\nWould you like me to model how adjusting your growth exposure could impact returns, or review how this aligns with your long-term objectives?',
  },
];

export const defaultResponse = {
  message:
    "Could you provide more details? I'm ready to help with portfolio analysis, risk modeling, or market insights.",
};

export function findChatResponse(userMessage: string) {
  const msg = userMessage.toLowerCase();
  for (const mapping of chatResponses) {
    if (mapping.keywords.some((kw) => msg.includes(kw))) {
      return { message: mapping.message, simulator: mapping.simulator };
    }
  }
  return defaultResponse;
}
