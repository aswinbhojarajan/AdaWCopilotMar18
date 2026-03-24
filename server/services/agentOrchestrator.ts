import OpenAI from 'openai';
import type { ChatMessageRequest, RiskProfile } from '../../shared/types';
import type { IntentClassification, ToolResult, AdaAnswer, TenantConfig } from '../../shared/schemas/agent';
import type { PolicyDecision } from '../../shared/schemas/agent';
import type { StreamEvent } from './streamTypes';
import { openai, resilientCompletion, resilientStreamCompletion } from './openaiClient';
import * as intentClassifier from './intentClassifier';
import * as ragService from './ragService';
import * as memoryService from './memoryService';
import * as piiDetector from './piiDetector';
import { getCapabilitySummary, getLaneConfig } from './capabilityRegistry';
import * as contentRepo from '../repositories/contentRepository';
import * as userRepo from '../repositories/userRepository';
import * as agentRepo from '../repositories/agentRepository';
import { getProviderRegistry } from '../providers/registry';
import type { ProviderRegistry } from '../providers/types';
import { evaluatePolicy } from './policyEngine';
import { buildAgentPrompt } from './promptBuilder';
import {
  selectModel,
  buildScorecard,
  routeRequest,
  resolveModel,
  type RequestScorecard,
  type RouteDecision,
} from './modelRouter';
import {
  getToolDefinitions,
  executeFinancialTool,
  isFinancialTool,
  filterToolNamesByGroups,
  FINANCIAL_TOOL_DEFINITIONS,
  UI_TOOL_DEFINITIONS,
} from './financialTools';
import { buildAdaAnswer, extractInlineFollowUps, getDeterministicFollowUps, FollowUpStreamFilter } from './responseBuilder';
import { runPostChecks } from './guardrails';
import { logAgentTrace, logToolRun } from './traceLogger';
import type { StepTimings, TraceContext } from './traceLogger';
import * as wealthEngine from './wealthEngine';
import { routeToAdvisor } from './rmHandoffService';

function inferSuggestedTools(intent: IntentClassification['primary_intent'], message: string): string[] {
  const tools: string[] = [];
  const lower = message.toLowerCase();

  switch (intent) {
    case 'balance_query':
      tools.push('getPortfolioSnapshot');
      break;
    case 'portfolio_explain':
      tools.push('getPortfolioSnapshot', 'getHoldings');
      if (lower.includes('health') || lower.includes('risk') || lower.includes('diversif') || lower.includes('rebalance')) {
        tools.push('calculatePortfolioHealth');
      }
      break;
    case 'allocation_breakdown':
      tools.push('getPortfolioSnapshot', 'getHoldings');
      break;
    case 'goal_progress':
      tools.push('getPortfolioSnapshot');
      break;
    case 'market_context':
      if (message.match(/\b[A-Z]{2,5}\b/)) tools.push('getQuotes');
      break;
    case 'news_explain':
      tools.push('getHoldingsRelevantNews');
      if (message.match(/\b[A-Z]{2,5}\b/)) tools.push('getQuotes');
      break;
    case 'scenario_analysis':
      tools.push('getPortfolioSnapshot');
      tools.push('show_simulator');
      break;
    case 'recommendation_request':
      tools.push('calculatePortfolioHealth', 'getPortfolioSnapshot', 'getHoldings');
      break;
    case 'execution_request':
      tools.push('route_to_advisor', 'getPortfolioSnapshot');
      break;
    default:
      break;
  }

  if (lower.includes('simulat') || lower.includes('retire') || lower.includes('what if')) {
    if (!tools.includes('show_simulator')) tools.push('show_simulator');
  }

  return [...new Set(tools)];
}

function mapIntentForRag(primaryIntent: IntentClassification['primary_intent']): intentClassifier.Intent {
  return primaryIntent;
}

function extractSymbols(message: string): string[] {
  const matches = message.match(/\b[A-Z]{2,5}\b/g) ?? [];
  const commonWords = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HOW', 'HAS']);
  return matches.filter(m => !commonWords.has(m));
}

async function buildIntentClassification(message: string): Promise<IntentClassification> {
  const classifierResult = await intentClassifier.classifyIntentAsync(message);
  const symbols = extractSymbols(message);
  const suggestedTools = inferSuggestedTools(classifierResult.intent, message);

  const allEntities = [...new Set([...symbols, ...classifierResult.mentioned_entities])];

  return {
    primary_intent: classifierResult.intent,
    confidence: classifierResult.confidence,
    entities: {
      symbols,
      asset_classes: [],
      time_range: undefined,
      currencies: [],
    },
    reasoning_effort: classifierResult.reasoning_effort,
    needs_live_data: classifierResult.needs_live_data,
    needs_tooling: classifierResult.needs_tooling,
    mentioned_entities: allEntities,
    followup_mode: classifierResult.followup_mode,
    suggested_tools: suggestedTools,
  };
}

const PREFETCH_INTENTS = new Set<IntentClassification['primary_intent']>([
  'balance_query', 'portfolio_explain', 'recommendation_request',
  'allocation_breakdown',
]);

async function prefetchToolData(
  intent: IntentClassification,
  userId: string,
  registry: ProviderRegistry,
  riskLevel: string,
  allowedTools: string[],
): Promise<{ results: ToolResult[]; enrichment: Record<string, unknown> | null }> {
  if (!PREFETCH_INTENTS.has(intent.primary_intent)) {
    return { results: [], enrichment: null };
  }

  const prefetchJobs: Array<{ name: string; promise: Promise<ToolResult> }> = [];

  if (allowedTools.includes('getPortfolioSnapshot')) {
    prefetchJobs.push({ name: 'getPortfolioSnapshot', promise: executeFinancialTool('getPortfolioSnapshot', {}, userId, registry, riskLevel) });
  }
  if (allowedTools.includes('getHoldings') && intent.primary_intent !== 'balance_query') {
    prefetchJobs.push({ name: 'getHoldings', promise: executeFinancialTool('getHoldings', {}, userId, registry, riskLevel) });
  }

  const settled = await Promise.all(
    prefetchJobs.map(async (j) => {
      const start = Date.now();
      const result = await j.promise;
      result.latency_ms = Date.now() - start;
      return { name: j.name, result };
    }),
  );

  const results = settled.map(s => s.result);

  let enrichment: Record<string, unknown> | null = null;
  if (
    (intent.primary_intent === 'recommendation_request' || intent.primary_intent === 'portfolio_explain') &&
    allowedTools.includes('calculatePortfolioHealth')
  ) {
    const snapshot = settled.find(s => s.name === 'getPortfolioSnapshot')?.result;
    const holdings = settled.find(s => s.name === 'getHoldings')?.result;
    if (snapshot && holdings && snapshot.status === 'ok' && holdings.status === 'ok') {
      const health = wealthEngine.calculateHealthScore(holdings, snapshot, riskLevel);
      const concentration = wealthEngine.analyzeConcentration(holdings);
      const allocation = wealthEngine.computeAllocationBreakdown(holdings, snapshot);
      const drift = wealthEngine.computeDriftAnalysis(holdings, snapshot);
      enrichment = { health, concentration, allocation: { by_asset_class: allocation.by_asset_class, cash_pct: allocation.cash_pct, invested_pct: allocation.invested_pct, total_value: allocation.total_value }, drift };

      results.push({
        status: 'ok',
        source_name: 'wealth_engine',
        source_type: 'wealth_engine',
        as_of: new Date().toISOString(),
        latency_ms: 0,
        data: enrichment,
      });
    }
  }

  return { results, enrichment };
}

async function* handleLane0(
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
    ? import('../repositories/portfolioRepository').then(repo => repo.getGoalsByUserId(userId))
    : Promise.resolve(null);

  const [settled, goalsData] = await Promise.all([
    Promise.all(toolPromises.map(async (j) => {
      const start = Date.now();
      const result = await j.promise;
      result.latency_ms = Date.now() - start;
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

  const fmtUsd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
        narration += `\n**${g.title}** (${pct}% complete, ${fmtUsd(remaining)} remaining)`;
        if (g.deadline) {
          const deadlineDate = new Date(g.deadline);
          const monthsLeft = Math.max(1, Math.round((deadlineDate.getTime() - Date.now()) / (30.44 * 24 * 60 * 60 * 1000)));
          const monthlyNeeded = remaining / monthsLeft;
          narration += `\n- Target monthly contribution: ~${fmtUsd(monthlyNeeded)} over ${monthsLeft} months`;
        }
      }
      narration += `\n\n**Recommended actions:**`;
      narration += `\n1. **Automate contributions** — set up recurring monthly transfers to a dedicated savings account`;
      const cashPct = (data as Record<string, unknown>)?.cashPercent;
      if (cashPct !== undefined && Number(cashPct) > 30) {
        narration += `\n2. **Review your cash allocation** — your portfolio has a ${Number(cashPct).toFixed(0)}% cash position that could work harder in short-term bonds or money market funds`;
      } else {
        narration += `\n2. **Review your allocation mix** — ensure your asset allocation aligns with your risk profile and timeline`;
      }
      narration += `\n3. **Reduce discretionary spending** — identify 2–3 areas to redirect toward goals`;
      narration += `\n4. **Consolidate high-interest debt** — free up cash flow for savings`;
      narration += `\n\nWould you like me to draft a specific savings plan to share with your Relationship Manager for review and execution?`;
    } else {
      narration = `You have **${goals.length} goal${goals.length > 1 ? 's' : ''}** in progress:`;
      for (const g of goals) {
        const target = Number(g.target_amount ?? 0);
        const current = Number(g.current_amount ?? 0);
        const pct = target > 0 ? Math.round((current / target) * 100) : 0;
        narration += `\n- **${g.title}**: ${fmtUsd(current)} / ${fmtUsd(target)} (${pct}% complete)`;
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
    narration = `Your portfolio is valued at **${fmtUsd(totalValue)}**. Here's your allocation breakdown:`;

    if (Array.isArray(holdings) && holdings.length > 0) {
      const byClass: Record<string, number> = {};
      for (const h of holdings) {
        const cls = (h.assetClass as string) || (h.asset_class as string) || 'Other';
        byClass[cls] = (byClass[cls] ?? 0) + Number(h.value ?? 0);
      }
      const sorted = Object.entries(byClass).sort((a, b) => b[1] - a[1]);
      for (const [cls, val] of sorted) {
        const pct = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0.0';
        narration += `\n- **${cls}**: ${fmtUsd(val)} (${pct}%)`;
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
    narration = `Your portfolio is currently valued at **${fmtUsd(totalValue)}**. It's ${changeDir} **${Math.abs(dailyChangePct).toFixed(2)}%** (${fmtUsd(Math.abs(dailyChange))}) today.`;

    const holdings = holdingsResult.data as Array<{ symbol?: string; name?: string; value?: number; changePercent?: number; daily_change_percent?: number }> | null;
    if (Array.isArray(holdings) && holdings.length > 0) {
      narration += '\n\n**Your Holdings:**';
      for (const h of holdings.slice(0, 10)) {
        const hVal = Number(h.value ?? 0);
        const hChg = Number(h.changePercent ?? h.daily_change_percent ?? 0);
        const hDir = hChg >= 0 ? '+' : '';
        narration += `\n- **${h.symbol || h.name}**: ${fmtUsd(hVal)} (${hDir}${hChg.toFixed(1)}%)`;
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
    narration = `Your portfolio is currently valued at **${fmtUsd(totalValue)}**. It's ${changeDir} **${Math.abs(dailyChangePct).toFixed(2)}%** (${fmtUsd(Math.abs(dailyChange))}) today.`;
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
  memoryService.addToWorkingMemory(threadId, { role: 'assistant', content: fullResponse });
  await contentRepo.insertChatMessageWithWidgets(threadId, 'assistant', fullResponse, widgetsJson);
  await contentRepo.updateThreadPreview(threadId, fullResponse.slice(0, 100));

  timings.total_ms = Date.now() - startTime;

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
    escalationDecisions: [],
    routeDecision: route,
    scorecard,
  }).catch(() => {});

  yield { type: 'done' };
}


function* thinkingEvent(verbose: boolean, step: string, detail: string): Generator<StreamEvent> {
  if (verbose) {
    yield { type: 'thinking', step, detail };
  }
}

export async function* orchestrateStream(
  userId: string,
  req: ChatMessageRequest,
): AsyncGenerator<StreamEvent> {
  const startTime = Date.now();
  const timings: StepTimings = {};
  const threadId = req.threadId ?? `thread-${Date.now()}`;
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let verbose = req.verbose === true;

  const piiResult = piiDetector.scanForPii(req.message);
  const sanitizedMessage = piiResult.hasPii ? piiResult.sanitized : req.message;

  const earlyThinkingBuffer: Array<{ step: string; detail: string }> = [];
  earlyThinkingBuffer.push({ step: 'pii_scan', detail: piiResult.hasPii ? 'PII detected and redacted' : 'No PII detected' });

  await memoryService.logAudit({
    userId,
    threadId,
    action: 'message_received',
    piiDetected: piiResult.hasPii,
    inputPreview: piiResult.hasPii ? piiResult.sanitized.slice(0, 100) : req.message.slice(0, 100),
  });

  const intentStart = Date.now();
  const intent = await buildIntentClassification(sanitizedMessage);
  timings.intent_classification_ms = Date.now() - intentStart;
  console.log('[Orchestrator] intent=%s confidence=%s lane=%s ms=%d', intent.primary_intent, intent.confidence, intent.suggested_tools.length > 0 ? 'lane1+' : 'tbd', timings.intent_classification_ms);

  earlyThinkingBuffer.push({ step: 'intent_classification', detail: `Intent: ${intent.primary_intent} (confidence: ${(intent.confidence * 100).toFixed(0)}%, effort: ${intent.reasoning_effort})` });

  const sessionStart = Date.now();
  const [tenantIdResult, userProfileResult] = await Promise.all([
    agentRepo.getUserTenantId(userId),
    userRepo.findUserById(userId),
  ]);
  const tenantId = tenantIdResult;
  const userProfile = userProfileResult;

  const tenantConfig = tenantId
    ? (await agentRepo.getTenantConfig(tenantId)) ?? await agentRepo.getDefaultTenantConfig()
    : await agentRepo.getDefaultTenantConfig();

  timings.session_hydrate_ms = Date.now() - sessionStart;

  if (verbose && tenantConfig.feature_flags.verbose_mode !== true) {
    verbose = false;
  }

  for (const buffered of earlyThinkingBuffer) {
    yield* thinkingEvent(verbose, buffered.step, buffered.detail);
  }
  if (verbose) {
    await new Promise(r => setImmediate(r));
  }

  const policyStart = Date.now();
  const riskProfile: RiskProfile | undefined = userProfile?.riskProfile;
  const policyDecision = evaluatePolicy(tenantConfig, intent, riskProfile);
  timings.policy_evaluation_ms = Date.now() - policyStart;

  yield* thinkingEvent(verbose, 'policy_evaluation', `Mode: ${policyDecision.response_mode}, human review: ${policyDecision.require_human_review ? 'yes' : 'no'}`);

  try {
    await agentRepo.savePolicyDecision({
      tenant_id: tenantConfig.tenant_id,
      user_id: userId,
      request_type: intent.primary_intent,
      decision: policyDecision,
    });
  } catch {
    // non-blocking
  }

  const channel = req.context?.sourceScreen ?? 'chat';
  const scorecard = buildScorecard(intent, channel);
  const route = routeRequest(scorecard, policyDecision);
  console.log('[Orchestrator] route=%s model=%s', route.lane, route.provider_alias);

  yield* thinkingEvent(verbose, 'routing', `Lane: ${route.lane}, model: ${route.provider_alias} (${getCapabilitySummary(route.provider_alias)})`);
  if (verbose) {
    await new Promise(r => setImmediate(r));
  }

  const registry = getProviderRegistry(tenantConfig.provider_config);
  const riskLevel = riskProfile?.level ?? 'moderate';

  await contentRepo.ensureChatThread(userId, threadId, req.message.slice(0, 60));
  await contentRepo.insertChatMessage(threadId, 'user', req.message);
  memoryService.addToWorkingMemory(threadId, { role: 'user', content: sanitizedMessage });

  const ENTITY_KEYWORDS = ['tech', 'technology', 'healthcare', 'energy', 'financial', 'real estate', 'consumer',
    'industrial', 'telecom', 'utilities', 'materials', 'us ', 'europe', 'asia', 'gcc', 'emerging',
    'specific', 'individual', 'particular', 'which stock', 'which fund', 'aapl', 'msft', 'nvda', 'goog', 'amzn'];
  const hasEntityQuery = ENTITY_KEYWORDS.some(k => sanitizedMessage.toLowerCase().includes(k));

  if (route.lane === 'lane0' && !hasEntityQuery) {
    yield* thinkingEvent(verbose, 'lane0_dispatch', 'Deterministic path — no LLM needed for this query');
    if (verbose) {
      await new Promise(r => setImmediate(r));
    }
    yield* handleLane0(
      userId, intent, registry, riskLevel, scorecard, route,
      threadId, messageId, sanitizedMessage,
      tenantConfig, policyDecision, timings, startTime,
    );
    return;
  }
  if (hasEntityQuery && route.lane === 'lane0') {
    console.log('[Orchestrator] Entity-specific query detected, upgrading from Lane 0 to Lane 1');
    yield* thinkingEvent(verbose, 'lane_upgrade', 'Entity-specific query detected, upgrading from Lane 0 to Lane 1');
  }

  const getToolName = (t: OpenAI.ChatCompletionTool): string => t.type === 'function' ? t.function.name : '';
  const allToolNames = [
    ...FINANCIAL_TOOL_DEFINITIONS.map(getToolName),
    ...UI_TOOL_DEFINITIONS.map(getToolName),
  ];
  const policyFilteredTools = allToolNames.filter(t => policyDecision.allowed_tools.includes(t));
  const allowedToolNames = route.tool_groups.length > 0
    ? filterToolNamesByGroups(policyFilteredTools, route.tool_groups)
    : policyFilteredTools;
  const tools = getToolDefinitions(allowedToolNames);

  const modelSelection = selectModel(intent, policyDecision, intent.suggested_tools.length, channel);

  yield* thinkingEvent(verbose, 'model_selection', `Model: ${modelSelection.model} (${modelSelection.label}), max tokens: ${modelSelection.max_tokens}, tools: ${allowedToolNames.length}`);

  const prefetchStart = Date.now();
  yield* thinkingEvent(verbose, 'data_prefetch', `Fetching portfolio context, memories, and pre-running ${allowedToolNames.length} tools`);
  if (verbose) {
    await new Promise(r => setImmediate(r));
  }
  const [portfolioContext, episodicMemories, semanticFacts, prefetched] = await Promise.all([
    ragService.buildPortfolioContext(userId, mapIntentForRag(intent.primary_intent)),
    memoryService.getEpisodicMemories(userId),
    memoryService.getSemanticFacts(userId, 10, sanitizedMessage),
    prefetchToolData(intent, userId, registry, riskLevel, allowedToolNames),
  ]);
  timings.tool_execution_ms = Date.now() - prefetchStart;

  const toolResults: ToolResult[] = [...prefetched.results];

  let enrichmentContext = '';
  if (prefetched.enrichment) {
    const e = prefetched.enrichment as Record<string, unknown>;
    const health = e.health as Record<string, unknown> | undefined;
    if (health) {
      enrichmentContext += `\n\nWEALTH ENGINE ANALYSIS (pre-computed):`;
      enrichmentContext += `\nHealth Score: ${health.score}/100 (${health.label})`;
      enrichmentContext += `\nStrengths: ${(health.strengths as string[])?.join(', ') || 'none'}`;
      enrichmentContext += `\nConcerns: ${(health.concerns as string[])?.join(', ') || 'none'}`;
    }
  }

  const systemPrompt = buildAgentPrompt({
    tenantConfig,
    policyDecision,
    intent,
    userName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : undefined,
    riskProfile,
    portfolioSummary: portfolioContext.summary +
      (portfolioContext.holdings ? `\n\nHOLDINGS:\n${portfolioContext.holdings}` : '') +
      (portfolioContext.allocations ? `\n\nALLOCATION:\n${portfolioContext.allocations}` : '') +
      (portfolioContext.goals ? `\n\nGOALS:\n${portfolioContext.goals}` : '') +
      (portfolioContext.recentTransactions ? `\n\nRECENT TRANSACTIONS:\n${portfolioContext.recentTransactions}` : '') +
      enrichmentContext,
    episodicMemories,
    semanticFacts,
    chatContext: req.context ? {
      category: req.context.category,
      title: req.context.title,
      sourceScreen: req.context.sourceScreen,
    } : undefined,
    toolNames: allowedToolNames,
    providerAlias: route.provider_alias,
  });

  const conversationHistory = memoryService.getWorkingMemory(threadId);
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
  ];
  let fullResponse = '';
  const widgets: { type: string }[] = [];
  const guardrailInterventions: string[] = [];
  const escalationDecisions: string[] = [];
  let totalTokens = 0;
  const pendingUiEvents: StreamEvent[] = [];
  let streamFollowUps: string[] = [];

  try {
    const llmStart = Date.now();
    yield* thinkingEvent(verbose, 'llm_generation', `Streaming response from ${modelSelection.model}...`);

    const laneNumber = route.lane === 'lane2' ? 2 : route.lane === 'lane1' ? 1 : 0;
    const laneConfig = getLaneConfig(laneNumber);
    const maxToolRounds = laneConfig?.toolRounds ?? 1;
    const maxToolCallsPerRound = laneConfig?.maxToolCallsPerRound ?? 3;
    let currentMessages = [...messages];
    let turnCount = 0;
    let isLastTurn = false;

    while (turnCount < maxToolRounds + 1) {
      turnCount++;

      const skipTools = intent.primary_intent === 'general' || intent.primary_intent === 'support';
      const useTools = tools.length > 0 && turnCount <= maxToolRounds && !skipTools;

      const createLLMStream = (attempt: number) => {
        const timeoutMs = attempt === 1 ? 15000 : 20000;
        return resilientStreamCompletion({
          model: modelSelection.model,
          messages: currentMessages,
          tools: useTools ? tools : undefined,
          stream: true,
          max_completion_tokens: modelSelection.max_tokens,
        }, { timeoutMs, providerAlias: modelSelection.provider_alias });
      };

      let response;
      try {
        response = await createLLMStream(1);
      } catch {
        console.log('[Orchestrator] LLM attempt 1 timed out, retrying...');
        yield* thinkingEvent(verbose, 'llm_retry', 'First LLM attempt timed out, retrying...');
        try {
          response = await createLLMStream(2);
        } catch {
          if (route.lane === 'lane2') {
            console.log('[Orchestrator] Lane 2 both attempts failed, downgrading to Lane 1 (ada-fast)...');
            yield* thinkingEvent(verbose, 'llm_fallback', 'Lane 2 failed, falling back to Lane 1 (ada-fast)');
            try {
              response = await resilientStreamCompletion({
                model: resolveModel('ada-fast'),
                messages: currentMessages,
                tools: useTools ? tools : undefined,
                stream: true,
                max_completion_tokens: 4096,
              }, { timeoutMs: 20000, providerAlias: 'ada-fast' });
            } catch (fallbackErr) {
              console.error('[Orchestrator] Lane 1 fallback also failed:', (fallbackErr as Error).message);
              throw fallbackErr;
            }
          } else {
            throw new Error('Both LLM streaming attempts failed');
          }
        }
      }

      const toolCalls: { id: string; name: string; arguments: string }[] = [];
      let currentToolIndex = -1;
      let turnBuffer = '';
      const streamFilter = new FollowUpStreamFilter();

      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          turnBuffer += delta.content;
          const safeText = streamFilter.push(delta.content);
          if (safeText) {
            yield { type: 'text', content: safeText };
          }
        }

        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (tc.index !== undefined && tc.index !== currentToolIndex) {
              currentToolIndex = tc.index;
              toolCalls.push({
                id: tc.id || '',
                name: tc.function?.name || '',
                arguments: tc.function?.arguments || '',
              });
            } else if (tc.function?.arguments) {
              const last = toolCalls[toolCalls.length - 1];
              if (last) last.arguments += tc.function.arguments;
            }
            if (tc.function?.name && toolCalls.length > 0) {
              toolCalls[toolCalls.length - 1].name = tc.function.name;
            }
            if (tc.id && toolCalls.length > 0) {
              toolCalls[toolCalls.length - 1].id = tc.id;
            }
          }
        }

        if (chunk.usage) totalTokens += chunk.usage.total_tokens;
      }

      if (toolCalls.length === 0) {
        const flushed = streamFilter.flush();
        if (flushed.remainingText) {
          yield { type: 'text', content: flushed.remainingText };
        }
        const delimIdx = turnBuffer.indexOf('---FOLLOW_UP_QUESTIONS---');
        fullResponse += delimIdx !== -1
          ? turnBuffer.slice(0, delimIdx).trimEnd()
          : turnBuffer;
        if (flushed.questions.length > 0) {
          streamFollowUps = flushed.questions;
        }
        isLastTurn = true;
        break;
      }

      const flushedMidTurn = streamFilter.flush();
      if (flushedMidTurn.remainingText) {
        yield { type: 'text', content: flushedMidTurn.remainingText };
      }
      fullResponse += turnBuffer;

      if (toolCalls.length > maxToolCallsPerRound) {
        console.log(`[Orchestrator] Capping tool calls from ${toolCalls.length} to ${maxToolCallsPerRound} (lane ${laneNumber})`);
        toolCalls.length = maxToolCallsPerRound;
      }

      const assistantMsg: OpenAI.ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        content: turnBuffer || null,
        tool_calls: toolCalls.map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.name, arguments: tc.arguments },
        })),
      };

      const rmCalls = toolCalls.filter(tc => tc.name === 'route_to_advisor');
      const financialCalls = toolCalls.filter(tc => isFinancialTool(tc.name) && tc.name !== 'route_to_advisor');
      const uiCalls = toolCalls.filter(tc => !isFinancialTool(tc.name));

      const rmResults: Array<{ role: 'tool'; tool_call_id: string; content: string }> = [];
      for (const tc of rmCalls) {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(tc.arguments); } catch { /* empty */ }
        const toolStart = Date.now();
        const handoffResult = await routeToAdvisor({
          tenantId: tenantConfig.tenant_id,
          userId,
          conversationId: threadId,
          actionType: (args.action_type as string) ?? 'other',
          actionDetails: { summary: args.summary, ...(args.details as Record<string, unknown> ?? {}) },
        }, tenantConfig);

        const toolResult: ToolResult = {
          status: handoffResult.success ? 'ok' : 'error',
          source_name: 'rm_handoff',
          source_type: 'execution_routing',
          as_of: new Date().toISOString(),
          latency_ms: Date.now() - toolStart,
          data: handoffResult,
        };
        toolResults.push(toolResult);

        if (handoffResult.success) {
          pendingUiEvents.push({
            type: 'widget',
            widget: {
              type: 'advisor_handoff',
              advisorName: handoffResult.advisorName,
              actionContext: (args.summary as string) ?? undefined,
              queueId: handoffResult.queueId,
            },
          });
          widgets.push({ type: 'advisor_handoff' });
          escalationDecisions.push(`Execution routed to advisor: ${handoffResult.message}`);
        }

        rmResults.push({ role: 'tool' as const, tool_call_id: tc.id, content: JSON.stringify(handoffResult) });
      }

      const financialResults = await Promise.all(
        financialCalls.map(async (tc) => {
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(tc.arguments); } catch { /* empty */ }
          const toolStart = Date.now();
          const result = await executeFinancialTool(tc.name, args, userId, registry, riskLevel);
          result.latency_ms = Date.now() - toolStart;
          toolResults.push(result);

          logToolRun({
            toolName: tc.name,
            inputs: args,
            result,
            conversationId: threadId,
            messageId,
            userId,
          }).catch(() => {});

          const baseData = typeof result.data === 'object' && result.data !== null ? result.data as Record<string, unknown> : { value: result.data };
          const toolPayload = {
            ...baseData,
            _meta: {
              source_name: result.source_name,
              source_type: result.source_type,
              as_of: result.as_of,
              status: result.status,
            },
          };
          return {
            role: 'tool' as const,
            tool_call_id: tc.id,
            content: JSON.stringify(toolPayload),
          };
        }),
      );

      const uiResults: Array<{ role: 'tool'; tool_call_id: string; content: string }> = [];
      for (const tc of uiCalls) {
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(tc.arguments); } catch { /* empty */ }

        if (tc.name === 'show_simulator') {
          pendingUiEvents.push({ type: 'simulator', simulator: { type: args.type as string, initialValues: args.initialValues as Record<string, number> | undefined } });
          widgets.push({ type: 'simulator' });
          uiResults.push({ role: 'tool' as const, tool_call_id: tc.id, content: JSON.stringify({ success: true, displayed: true }) });
        } else if (tc.name === 'show_widget') {
          pendingUiEvents.push({ type: 'widget', widget: { type: args.type as string } });
          widgets.push({ type: args.type as string });
          uiResults.push({ role: 'tool' as const, tool_call_id: tc.id, content: JSON.stringify({ success: true, displayed: true }) });
        } else if (tc.name === 'extract_user_fact') {
          try { await memoryService.saveSemanticFact(userId, args.fact as string, args.category as string, threadId); } catch { /* best-effort */ }
          uiResults.push({ role: 'tool' as const, tool_call_id: tc.id, content: JSON.stringify({ success: true, saved: true }) });
        } else {
          uiResults.push({ role: 'tool' as const, tool_call_id: tc.id, content: JSON.stringify({ success: true, displayed: true }) });
        }
      }

      timings.tool_execution_ms = (timings.tool_execution_ms ?? 0) + (Date.now() - llmStart);

      const orderedToolResults: OpenAI.ChatCompletionMessageParam[] = [];
      for (const tc of toolCalls) {
        const rr = rmResults.find(r => r.tool_call_id === tc.id);
        const fr = financialResults.find(r => r.tool_call_id === tc.id);
        const ur = uiResults.find(r => r.tool_call_id === tc.id);
        if (rr) orderedToolResults.push(rr);
        else if (fr) orderedToolResults.push(fr);
        else if (ur) orderedToolResults.push(ur);
      }

      currentMessages = [...currentMessages, assistantMsg, ...orderedToolResults];
    }

    timings.llm_generation_ms = Date.now() - llmStart;

    const postStart = Date.now();
    yield* thinkingEvent(verbose, 'guardrails', 'Running post-generation guardrail checks...');
    const guardrailResult = runPostChecks(fullResponse, tenantConfig, policyDecision, toolResults);
    if (!guardrailResult.passed) {
      guardrailInterventions.push(...guardrailResult.interventions);
      if (guardrailResult.sanitizedText !== fullResponse) {
        fullResponse = guardrailResult.sanitizedText;
      }
    }

    for (const uiEvent of pendingUiEvents) {
      yield uiEvent;
    }

    if (guardrailResult.appendedDisclosures.length > 0) {
      const disclosureText = '\n\n' + guardrailResult.appendedDisclosures.join(' ');
      fullResponse += disclosureText;
      yield { type: 'text', content: disclosureText };
    }

    const alreadyHasAdvisorWidget = widgets.some(w => w.type === 'advisor_handoff');

    if (intent.primary_intent === 'execution_request' && !alreadyHasAdvisorWidget) {
      const fallbackHandoff = await routeToAdvisor({
        tenantId: tenantConfig.tenant_id,
        userId,
        conversationId: threadId,
        actionType: 'other',
        actionDetails: { summary: sanitizedMessage, source: 'fallback_enforcement' },
      }, tenantConfig);

      if (fallbackHandoff.success) {
        escalationDecisions.push(`Execution fallback routing: ${fallbackHandoff.message}`);
        yield {
          type: 'widget',
          widget: {
            type: 'advisor_handoff',
            advisorName: fallbackHandoff.advisorName,
            actionContext: sanitizedMessage,
            queueId: fallbackHandoff.queueId,
          },
        };
        widgets.push({ type: 'advisor_handoff' });
      }
    }

    if (policyDecision.require_human_review && !alreadyHasAdvisorWidget && !widgets.some(w => w.type === 'advisor_handoff')) {
      escalationDecisions.push(policyDecision.escalation_reason || 'Advisor review required');
      yield { type: 'widget', widget: { type: 'advisor_handoff' } };
      widgets.push({ type: 'advisor_handoff' });
    }

    timings.post_checks_ms = Date.now() - postStart;
    timings.total_ms = Date.now() - startTime;

    if (streamFollowUps.length === 0) {
      const { cleanText, questions: inlineQuestions } = extractInlineFollowUps(fullResponse);
      if (inlineQuestions.length > 0) {
        streamFollowUps = inlineQuestions;
        fullResponse = cleanText;
      }
    }
    const suggestedQuestions = streamFollowUps.length > 0
      ? streamFollowUps
      : getDeterministicFollowUps(intent.primary_intent);

    if (suggestedQuestions.length > 0) {
      yield { type: 'suggested_questions', suggestedQuestions };
    }

    const traceCtx: TraceContext = {
      conversationId: threadId,
      messageId,
      tenantId: tenantConfig.tenant_id,
      userId,
    };

    const adaAnswer = buildAdaAnswer({
      intent,
      policyDecision,
      llmText: fullResponse,
      toolResults,
      tenantConfig,
      guardrailInterventions,
    });
    adaAnswer.suggested_questions = suggestedQuestions;

    logAgentTrace({
      ctx: traceCtx,
      intent,
      policyDecision,
      modelName: modelSelection.model,
      toolSetExposed: allowedToolNames,
      toolCallsMade: toolResults,
      finalAnswer: adaAnswer,
      responseTimeMs: timings.total_ms,
      stepTimings: timings,
      guardrailInterventions,
      escalationDecisions,
      routeDecision: route,
      scorecard,
    }).catch(() => {});

    memoryService.logAudit({
      userId,
      threadId,
      action: 'response_generated',
      intent: intent.primary_intent,
      model: modelSelection.model,
      tokensUsed: totalTokens,
    }).catch(() => {});

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Agent orchestrator error:', message);
    yield { type: 'error', content: "I'm having trouble processing that right now. Please try again." };
  }

  if (fullResponse) {
    memoryService.addToWorkingMemory(threadId, { role: 'assistant', content: fullResponse });
    const widgetsJson = widgets.length > 0 ? JSON.stringify(widgets) : null;
    await contentRepo.insertChatMessageWithWidgets(threadId, 'assistant', fullResponse, widgetsJson);
    await contentRepo.updateThreadPreview(threadId, fullResponse.slice(0, 100));
  }

  const workingMem = memoryService.getWorkingMemory(threadId);
  if (workingMem.length >= 10) {
    try {
      const topics = intentClassifier.extractTopics(workingMem.map(t => t.content).join(' '));
      const summary = workingMem.slice(0, 6).map(t => `${t.role}: ${t.content.slice(0, 80)}`).join(' | ');
      await memoryService.saveEpisodicMemory(userId, threadId, summary, topics);
    } catch {
      // best-effort
    }
  }

  yield { type: 'done' };
}
