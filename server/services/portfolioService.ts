import * as portfolioRepo from '../repositories/portfolioRepository';
import * as userRepo from '../repositories/userRepository';
import * as contentRepo from '../repositories/contentRepository';
import type { HomeSummaryResponse, WealthOverviewResponse } from '../../shared/types';

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
  const snapshot = await portfolioRepo.getLatestSnapshot(userId);
  const perfData = await portfolioRepo.getPerformanceData(userId);

  return {
    totalValue: snapshot.totalValue,
    dailyChangeAmount: snapshot.dailyChangeAmount,
    dailyChangePercent: snapshot.dailyChangePercent,
    performanceData: perfData,
  };
}
