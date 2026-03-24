import type { IntentClassification, TenantConfig } from '../../../shared/schemas/agent';
import type { PolicyDecision } from '../../../shared/schemas/agent';
import type { StreamEvent } from '../streamTypes';
import type { ProviderRegistry } from '../../providers/types';
import type { RequestScorecard, RouteDecision } from '../modelRouter';
import type { StepTimings, TraceContext } from '../traceLogger';
import type { ToolResult } from '../../../shared/schemas/agent';
import { executeFinancialTool } from '../financialTools';
import { runPostChecks } from '../guardrails';
import { logAgentTrace, logToolRun, checkLatencyTargets } from '../traceLogger';
import * as memoryService from '../memoryService';
import * as contentRepo from '../../repositories/contentRepository';
import * as wealthEngine from '../wealthEngine';

const fmtUsd = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function* handleLane0(
  userId: string,
  intent: IntentClassification,
  registry: ProviderRegistry,
  riskLevel: string,
  scorecard: RequestScorecard,
  route: RouteDecision,
  threadId: string,
  messageId: string,
  sanitizedMessage: string,
  tenantConfig: TenantConfig,
  policyDecision: PolicyDecision,
  timings: StepTimings,
  startTime: number,
): AsyncGenerator<StreamEvent> {
  const prefetchStart = Date.now();
  const needsHoldings = intent.primary_intent === 'portfolio_explain' || intent.primary_intent === 'allocation_breakdown';
  const needsGoals = intent.primary_intent === 'goal_progress';

  const toolPromises: Array<{ name: string; promise: Promise<ToolResult> }> = [
    { name: 'getPortfolioSnapshot', promise: executeFinancialTool('getPortfolioSnapshot', {}, userId, registry, riskLevel) },
  ];
  if (needsHoldings) {
    toolPromises.push({ name: 'getHoldings', promise: executeFinancialTool('getHoldings', {}, userId, registry, riskLevel) });
  }

  const goalsPromise = needsGoals
    ? import('../../repositories/portfolioRepository').then(repo => repo.getGoalsByUserId(userId))
    : Promise.resolve(null);

  const [settled, goalsData] = await Promise.all([
    Promise.all(toolPromises.map(async (j) => {
      const start = Date.now();
      const result = await j.promise;
      result.latency_ms = Date.now() - start;
      logToolRun({
        toolName: j.name,
        inputs: { userId, lane: 'lane0' },
        result,
        conversationId: threadId,
        messageId,
        userId,
      }).catch(() => {});
      return { name: j.name, result };
    })),
    goalsPromise,
  ]);
  timings.tool_execution_ms = Date.now() - prefetchStart;

  const snapshotResult = settled.find(s => s.name === 'getPortfolioSnapshot')!.result;
  const holdingsResult = settled.find(s => s.name === 'getHoldings')?.result;
  const allToolResults = settled.map(s => s.result);

  const data = snapshotResult.data as Record<string, unknown> | null;
  if (!data || snapshotResult.status !== 'ok') {
    yield { type: 'text', content: 'I was unable to retrieve your portfolio data right now. Please try again shortly.' };
    yield { type: 'done' };
    return;
  }

  const totalValue = Number(data.totalValue ?? data.total_value ?? 0);
  const dailyChange = Number(data.dailyChangeAmount ?? data.daily_change_amount ?? 0);
  const dailyChangePct = Number(data.dailyChangePercent ?? data.daily_change_percent ?? 0);
  const changeDir = dailyChange >= 0 ? 'up' : 'down';

  let narration = '';
  let suggestions: string[] = [];
  const widgets: { type: string; [key: string]: unknown }[] = [];

  if (intent.primary_intent === 'goal_progress' && goalsData) {
    const goals = goalsData as Array<{ title?: string; target_amount?: number; current_amount?: number; deadline?: string; icon_name?: string; color?: string }>;
    const adviceKeywords = ['accelerate', 'improve', 'grow', 'increase', 'boost', 'faster', 'optimize', 'how can i', 'what can i do', 'tips', 'strategy', 'advice', 'save more'];
    const isAdviceQuery = adviceKeywords.some(k => sanitizedMessage.toLowerCase().includes(k));

    if (goals.length === 0) {
      narration = 'You don\'t have any goals set up yet. Would you like to create one?';
    } else if (isAdviceQuery) {
      narration = `Here are actionable steps to accelerate your savings based on your current goals:\n`;
      for (const g of goals) {
        const target = Number(g.target_amount ?? 0);
        const current = Number(g.current_amount ?? 0);
        const remaining = Math.max(0, target - current);
        const pct = target > 0 ? Math.round((current / target) * 100) : 0;
        narration += `\n${g.title} (${pct}% complete, ${fmtUsd(remaining)} remaining)`;
        if (g.deadline) {
          const deadlineDate = new Date(g.deadline);
          const monthsLeft = Math.max(1, Math.round((deadlineDate.getTime() - Date.now()) / (30.44 * 24 * 60 * 60 * 1000)));
          const monthlyNeeded = remaining / monthsLeft;
          narration += `\n- Target monthly contribution: ~${fmtUsd(monthlyNeeded)} over ${monthsLeft} months`;
        }
      }
      narration += `\n\nRecommended actions:`;
      narration += `\n1. Automate contributions — set up recurring monthly transfers to a dedicated savings account`;
      const cashPct = (data as Record<string, unknown>)?.cashPercent;
      if (cashPct !== undefined && Number(cashPct) > 30) {
        narration += `\n2. Review your cash allocation — your portfolio has a ${Number(cashPct).toFixed(0)}% cash position that could work harder in short-term bonds or money market funds`;
      } else {
        narration += `\n2. Review your allocation mix — ensure your asset allocation aligns with your risk profile and timeline`;
      }
      narration += `\n3. Reduce discretionary spending — identify 2–3 areas to redirect toward goals`;
      narration += `\n4. Consolidate high-interest debt — free up cash flow for savings`;
      narration += `\n\nWould you like me to draft a specific savings plan to share with your Relationship Manager for review and execution?`;
    } else {
      narration = `You have ${goals.length} goal${goals.length > 1 ? 's' : ''} in progress:`;
      for (const g of goals) {
        const target = Number(g.target_amount ?? 0);
        const current = Number(g.current_amount ?? 0);
        const pct = target > 0 ? Math.round((current / target) * 100) : 0;
        narration += `\n- ${g.title}: ${fmtUsd(current)} / ${fmtUsd(target)} (${pct}% complete)`;
      }
    }
    widgets.push({
      type: 'goal_progress',
      goals: (goalsData as Array<Record<string, unknown>>).map(g => ({
        title: g.title, target_amount: g.target_amount,
        current_amount: g.current_amount, deadline: g.deadline,
      })),
    });
    suggestions = isAdviceQuery
      ? ['Draft a savings plan for my RM', 'Show my goal progress', 'What if I increase contributions by 20%?']
      : ['How can I accelerate my savings?', 'What happens if I miss my deadline?', 'Create a new goal'];

  } else if (intent.primary_intent === 'allocation_breakdown' && holdingsResult?.status === 'ok') {
    const holdings = holdingsResult.data as Array<{ symbol?: string; name?: string; value?: number; asset_class?: string; assetClass?: string }> | null;
    narration = `Your portfolio is valued at ${fmtUsd(totalValue)}. Here's your allocation breakdown:`;

    if (Array.isArray(holdings) && holdings.length > 0) {
      const byClass: Record<string, number> = {};
      for (const h of holdings) {
        const cls = (h.assetClass as string) || (h.asset_class as string) || 'Other';
        byClass[cls] = (byClass[cls] ?? 0) + Number(h.value ?? 0);
      }
      const sorted = Object.entries(byClass).sort((a, b) => b[1] - a[1]);
      for (const [cls, val] of sorted) {
        const pct = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0.0';
        narration += `\n- ${cls}: ${fmtUsd(val)} (${pct}%)`;
      }
      widgets.push({
        type: 'allocation_chart',
        allocations: sorted.map(([asset_class, value]) => ({
          asset_class, value,
          percentage: totalValue > 0 ? Number(((value / totalValue) * 100).toFixed(1)) : 0,
        })),
      });
    }
    suggestions = ['Is my allocation balanced?', 'Should I diversify more?', 'What does a healthy allocation look like?'];

  } else if (intent.primary_intent === 'portfolio_explain' && holdingsResult?.status === 'ok') {
    narration = `Your portfolio is currently valued at ${fmtUsd(totalValue)}. It's ${changeDir} ${Math.abs(dailyChangePct).toFixed(2)}% (${fmtUsd(Math.abs(dailyChange))}) today.`;

    const holdings = holdingsResult.data as Array<{ symbol?: string; name?: string; value?: number; changePercent?: number; daily_change_percent?: number }> | null;
    if (Array.isArray(holdings) && holdings.length > 0) {
      narration += '\n\nYour Holdings:';
      for (const h of holdings.slice(0, 10)) {
        const hVal = Number(h.value ?? 0);
        const hChg = Number(h.changePercent ?? h.daily_change_percent ?? 0);
        const hDir = hChg >= 0 ? '+' : '';
        narration += `\n- ${h.symbol || h.name}: ${fmtUsd(hVal)} (${hDir}${hChg.toFixed(1)}%)`;
      }
    }
    widgets.push({
      type: 'holdings_summary',
      holdings: (holdings ?? []).slice(0, 10).map(h => ({
        symbol: h.symbol, name: h.name, value: h.value,
        daily_change_percent: h.daily_change_percent,
      })),
    });
    suggestions = ['Is my portfolio well-diversified?', 'What are the top movers today?', 'Should I rebalance anything?'];

  } else {
    narration = `Your portfolio is currently valued at ${fmtUsd(totalValue)}. It's ${changeDir} ${Math.abs(dailyChangePct).toFixed(2)}% (${fmtUsd(Math.abs(dailyChange))}) today.`;
    widgets.push({
      type: 'portfolio_summary',
      total_value: totalValue,
      daily_change_amount: dailyChange,
      daily_change_percent: dailyChangePct,
    });
    suggestions = ['How are my holdings performing?', 'Is my portfolio well-diversified?', 'What market news affects me today?'];
  }

  const guardrailResult = runPostChecks(narration, tenantConfig, policyDecision, allToolResults);
  if (!guardrailResult.passed) {
    narration = guardrailResult.sanitizedText;
  }
  if (guardrailResult.appendedDisclosures.length > 0) {
    narration += '\n\n' + guardrailResult.appendedDisclosures.join(' ');
  }

  yield { type: 'text', content: narration };

  for (const w of widgets) {
    yield { type: 'widget', widget: w };
  }

  yield { type: 'suggested_questions', suggestedQuestions: suggestions };

  const fullResponse = narration;
  const widgetsJson = widgets.length > 0 ? JSON.stringify(widgets) : null;
  await memoryService.addToWorkingMemory(threadId, { role: 'assistant', content: fullResponse });
  await contentRepo.insertChatMessageWithWidgets(threadId, 'assistant', fullResponse, widgetsJson);
  await contentRepo.updateThreadPreview(threadId, fullResponse.slice(0, 100));

  timings.total_ms = Date.now() - startTime;

  const lane0LatencyCheck = checkLatencyTargets('lane0', timings);
  const lane0Escalations: string[] = [];
  if (!lane0LatencyCheck.met) {
    lane0Escalations.push(`Latency target exceeded: ${lane0LatencyCheck.deviations.join('; ')}`);
  }

  const traceCtx: TraceContext = { conversationId: threadId, messageId, tenantId: tenantConfig.tenant_id, userId };
  logAgentTrace({
    ctx: traceCtx,
    intent,
    policyDecision,
    modelName: 'deterministic',
    toolSetExposed: [],
    toolCallsMade: [snapshotResult],
    responseTimeMs: timings.total_ms,
    stepTimings: timings,
    guardrailInterventions: [],
    escalationDecisions: lane0Escalations,
    routeDecision: route,
    scorecard,
  }).catch(() => {});

  yield { type: 'done' };
}
