import * as portfolioRepo from '../repositories/portfolioRepository';
import * as userRepo from '../repositories/userRepository';
import * as contentRepo from '../repositories/contentRepository';
import pool from '../db/pool';
import type { HomeSummaryResponse, WealthOverviewResponse, WealthInsights } from '../../shared/types';

export async function getHomeSummary(userId: string): Promise<HomeSummaryResponse> {
  const user = (await userRepo.findUserById(userId)) ?? (await userRepo.getDefaultUser());
  const snapshot = await portfolioRepo.getLatestSnapshot(userId);
  const sparkline = portfolioRepo.getHomeSparkline(userId);
  const alerts = await contentRepo.getAlertsByUserId(userId);
  const attentionCount = alerts.filter((a) => a.unread).length;
  const contentCards = await contentRepo.getHomeContent(userId);

  const now = new Date();
  const day = now.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return {
    greeting: `Good ${now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, ${user.firstName}`,
    date: `${day} ${months[now.getMonth()]} ${now.getFullYear()}`,
    attentionCount,
    summary:
      attentionCount > 0
        ? `There's ${attentionCount} item${attentionCount > 1 ? 's' : ''} that need${attentionCount === 1 ? 's' : ''} your attention today, plus a few updates worth reviewing.`
        : 'Everything looks good today. Here are some updates worth reviewing.',
    portfolioValue: snapshot.totalValue,
    dailyChangeAmount: snapshot.dailyChangeAmount,
    dailyChangePercent: snapshot.dailyChangePercent,
    sparklineData: sparkline,
    contentCards,
  };
}

export async function getWealthOverview(userId: string): Promise<WealthOverviewResponse> {
  const [snapshot, perfData, insights] = await Promise.all([
    portfolioRepo.getLatestSnapshot(userId),
    portfolioRepo.getPerformanceData(userId),
    computeWealthInsights(userId),
  ]);

  return {
    totalValue: snapshot.totalValue,
    dailyChangeAmount: snapshot.dailyChangeAmount,
    dailyChangePercent: snapshot.dailyChangePercent,
    performanceData: perfData,
    insights,
  };
}

async function computeWealthInsights(userId: string): Promise<WealthInsights> {
  const [allocations, user, advisorRow] = await Promise.all([
    portfolioRepo.getAllocationsByUserId(userId),
    userRepo.findUserById(userId),
    pool.query(
      `SELECT a.name, a.availability FROM advisors a
       JOIN users u ON u.advisor_id = a.id WHERE u.id = $1`,
      [userId],
    ),
  ]);

  const riskLevel = user?.riskProfile?.level ?? 'moderate';
  const advisorName = advisorRow.rows[0]?.name ?? 'Your Advisor';
  const advisorAvailability = advisorRow.rows[0]?.availability ?? 'Available';

  const topAlloc = allocations[0];
  const topClass = topAlloc?.label ?? 'Cash';
  const topPct = topAlloc?.percentage ?? 0;

  const primaryInsight = generatePrimaryInsight(allocations, riskLevel, topClass, topPct);

  const uniqueClasses = allocations.length;
  let diversificationScore: number;
  if (uniqueClasses >= 5) diversificationScore = 85;
  else if (uniqueClasses >= 4) diversificationScore = 78;
  else if (uniqueClasses >= 3) diversificationScore = 68;
  else if (uniqueClasses >= 2) diversificationScore = 55;
  else diversificationScore = 35;

  if (topPct > 60) diversificationScore = Math.max(30, diversificationScore - 20);
  else if (topPct > 45) diversificationScore = Math.max(40, diversificationScore - 10);

  let riskLabel: string;
  if (riskLevel === 'conservative') riskLabel = topPct > 50 ? 'low-medium' : 'low';
  else if (riskLevel === 'aggressive') riskLabel = topPct > 60 ? 'high' : 'medium-high';
  else riskLabel = topPct > 50 ? 'medium' : 'low-medium';

  const { topSuggestion, additionalSuggestions } = generateSuggestions(allocations, riskLevel);

  return {
    primaryInsight,
    topAllocationClass: topClass,
    topAllocationPercent: topPct,
    diversificationScore,
    riskLevel: riskLabel,
    topSuggestion,
    additionalSuggestions,
    advisorName,
    advisorAvailability,
  };
}

function generatePrimaryInsight(
  allocations: { label: string; percentage: number }[],
  riskLevel: string,
  topClass: string,
  topPct: number,
): string {
  const classLower = topClass.toLowerCase();
  if (topPct > 55) {
    return `Your portfolio is ${topPct}% concentrated in ${classLower}, which may increase ${classLower === 'bonds' ? 'interest rate' : 'volatility'} exposure.`;
  }
  if (topPct > 40) {
    return `Your portfolio has ${topPct}% allocated to ${classLower}, ${riskLevel === 'conservative' ? 'providing stability but limiting growth potential' : 'driving returns but adding concentration risk'}.`;
  }
  return `Your portfolio is well-diversified with ${topPct}% in ${classLower} as the largest allocation.`;
}

function generateSuggestions(
  allocations: { label: string; percentage: number }[],
  riskLevel: string,
): { topSuggestion: string; additionalSuggestions: string[] } {
  const allocMap = Object.fromEntries(allocations.map((a) => [a.label, a.percentage]));
  const suggestions: string[] = [];

  const bondPct = allocMap['Bonds'] ?? 0;
  const stockPct = allocMap['Stocks'] ?? 0;
  const cashPct = allocMap['Cash'] ?? 0;
  const cryptoPct = allocMap['Crypto'] ?? 0;
  const commoditiesPct = allocMap['Commodities'] ?? 0;

  if (cashPct > 40)
    suggestions.push(`At ${cashPct}%, your cash allocation is high — consider deploying into income-generating assets`);
  if (bondPct > 55)
    suggestions.push(`At ${bondPct}%, your bond allocation is high relative to peers`);
  if (stockPct > 60)
    suggestions.push(`At ${stockPct}%, your equity concentration increases volatility risk`);
  if (cryptoPct > 15)
    suggestions.push(`At ${cryptoPct}%, your crypto allocation adds significant volatility`);
  if (commoditiesPct > 12)
    suggestions.push(`At ${commoditiesPct}%, your alternatives allocation is notable`);
  if (bondPct < 10 && riskLevel !== 'aggressive')
    suggestions.push('Increasing your fixed income holding could improve stability');
  if (cashPct < 5 && riskLevel !== 'aggressive')
    suggestions.push('Consider maintaining a cash buffer for liquidity');
  if (stockPct < 20 && riskLevel !== 'conservative')
    suggestions.push('A modest equity allocation could enhance long-term growth');

  if (suggestions.length === 0) {
    suggestions.push('Your allocation is well-balanced for your risk profile');
  }

  return {
    topSuggestion: suggestions[0],
    additionalSuggestions: suggestions.slice(1),
  };
}
