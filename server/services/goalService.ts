import * as portfolioRepo from '../repositories/portfolioRepository';
import * as userRepo from '../repositories/userRepository';
import { generateJsonCompletion } from './aiService';
import type { GoalHealthScore, LifeGapPrompt, LifeEventSuggestion, LifeEventType, Goal } from '../../shared/types';

function parseDeadlineToMonths(deadline: string): number {
  const match = deadline.match(/(\w+)\s+(\d{4})/);
  if (!match) return 12;
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const monthIndex = months[match[1]] ?? 0;
  const year = parseInt(match[2], 10);
  const target = new Date(year, monthIndex, 1);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffMonths = Math.max(1, Math.round(diffMs / (30.44 * 24 * 60 * 60 * 1000)));
  return diffMonths;
}

export function calculateGoalHealthScore(goals: Goal[]): GoalHealthScore {
  if (goals.length === 0) {
    return { score: 100, label: 'No goals set' };
  }

  let totalScore = 0;

  for (const goal of goals) {
    const progress = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;
    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsLeft = parseDeadlineToMonths(goal.deadline);
    const requiredMonthlyContribution = remaining > 0 ? remaining / monthsLeft : 0;

    let trajectoryScore = 100;
    if (goal.previousAmount != null && remaining > 0) {
      const monthlyProgress = goal.currentAmount - goal.previousAmount;
      if (requiredMonthlyContribution > 0) {
        const trajectoryRatio = monthlyProgress / requiredMonthlyContribution;
        trajectoryScore = Math.max(0, Math.min(100, trajectoryRatio * 100));
      }
    }

    let statusWeight: number;
    if (goal.healthStatus === 'on-track') {
      statusWeight = 1.0;
    } else if (goal.healthStatus === 'needs-attention') {
      statusWeight = 0.6;
    } else {
      statusWeight = 0.3;
    }

    const progressComponent = Math.min(progress * 100, 100) * 0.3;
    const statusComponent = statusWeight * 100 * 0.3;
    const timeComponent = (monthsLeft > 3 ? 100 : monthsLeft > 1 ? 60 : 20) * 0.15;
    const trajectoryComponent = trajectoryScore * 0.25;

    const goalScore = progressComponent + statusComponent + timeComponent + trajectoryComponent;
    totalScore += goalScore;
  }

  const score = Math.round(totalScore / goals.length);
  const clamped = Math.max(0, Math.min(100, score));

  let label: string;
  if (clamped > 70) {
    label = 'Your financial plan is in good shape';
  } else if (clamped >= 40) {
    label = 'Some goals need attention';
  } else {
    label = 'Your plan needs action';
  }

  return { score: clamped, label };
}

export async function generateLifeGapPrompts(
  userId: string,
  goals: Goal[],
): Promise<LifeGapPrompt[]> {
  const dismissed = await portfolioRepo.getDismissedLifeGapPrompts(userId);
  const goalTitles = goals.map((g) => g.title.toLowerCase());
  const user = await userRepo.findUserById(userId);

  const profileContext = user
    ? `User profile: ${user.firstName} ${user.lastName}, risk tolerance: ${user.riskProfile.level} (score ${user.riskProfile.score}/100).`
    : '';

  try {
    const content = await generateJsonCompletion(
      `You are Ada, an AI wealth copilot. Analyze the user's existing financial goals and profile to identify gaps in their financial plan. Compare against common financial planning patterns for someone with their profile. Return a JSON array of gap prompts for missing common financial goals. Each prompt should have: key (unique snake_case identifier), title (short question), description (1-2 sentence explanation), ctaText (action button text). Common gaps include: emergency fund, retirement, education, insurance, estate planning, debt payoff. Only suggest gaps that are genuinely missing. Return at most 3 prompts. Return ONLY a valid JSON array, no other text.`,
      `${profileContext} The user has these goals: ${goalTitles.join(', ') || 'none'}. Already dismissed prompts: ${dismissed.join(', ') || 'none'}. Generate gap prompts for what's missing based on their profile and goals.`,
    );

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const prompts = JSON.parse(jsonMatch[0]) as LifeGapPrompt[];
      return prompts.filter((p) => !dismissed.includes(p.key)).slice(0, 3);
    }
    return [];
  } catch (err) {
    console.error('Life gap prompt generation error:', err);
    return [];
  }
}

export async function generateLifeEventSuggestions(
  eventType: LifeEventType,
  goals: Goal[],
): Promise<LifeEventSuggestion[]> {
  const eventLabels: Record<LifeEventType, string> = {
    new_baby: 'Having a new baby',
    home_purchase: 'Buying a home',
    inheritance: 'Receiving an inheritance',
    job_change: 'Changing jobs',
    marriage: 'Getting married',
  };

  const goalTitles = goals.map((g) => g.title).join(', ') || 'none';

  try {
    const content = await generateJsonCompletion(
      `You are Ada, an AI wealth copilot. The user is experiencing a major life event. Suggest 2-3 new financial goals they should consider based on this event. Return a JSON array where each object has: title (goal name), targetAmount (number), deadline (e.g. "Dec 2030"), iconName (one of: Home, GraduationCap, Wallet, Target), color (hex color from palette: #a87174, #6d3f42, #8b5a5d, #441316, #d9b3b5), rationale (1-2 sentence explanation). Consider the user's existing goals to avoid duplicates. Return ONLY a valid JSON array, no other text.`,
      `Life event: ${eventLabels[eventType]}. Existing goals: ${goalTitles}.`,
    );

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return (JSON.parse(jsonMatch[0]) as LifeEventSuggestion[]).slice(0, 3);
    }
    return [];
  } catch (err) {
    console.error('Life event suggestion error:', err);
    return [];
  }
}

export async function createGoalFromSuggestion(
  userId: string,
  suggestion: { title: string; targetAmount: number; deadline: string; iconName: string; color: string },
): Promise<Goal> {
  return portfolioRepo.createGoal(userId, suggestion);
}

export async function dismissPrompt(userId: string, promptKey: string): Promise<void> {
  await portfolioRepo.dismissLifeGapPrompt(userId, promptKey);
}
