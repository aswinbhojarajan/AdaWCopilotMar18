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
import { getCapabilitySummary } from './capabilityRegistry';
import * as contentRepo from '../repositories/contentRepository';
import * as userRepo from '../repositories/userRepository';
import * as agentRepo from '../repositories/agentRepository';
import { getProviderRegistry } from '../providers/registry';
import type { ProviderRegistry } from '../providers/types';
import { evaluatePolicy } from './policyEngine';
import { buildAgentPrompt } from './promptBuilder';
import {
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
import { buildAdaAnswer } from './responseBuilder';
import { runPostChecks } from './guardrails';
import { logAgentTrace, logToolRun } from './traceLogger';
import type { StepTimings, TraceContext } from './traceLogger';
import * as wealthEngine from './wealthEngine';
import { routeToAdvisor } from './rmHandoffService';

function mapOldIntentToNew(oldIntent: string, message: string): IntentClassification['primary_intent'] {
  const lower = message.toLowerCase();

  if (oldIntent === 'portfolio') {
    const healthKeywords = ['health', 'healthy', 'risk', 'diversif', 'concentrated', 'rebalance', 'well-balanced', 'well balanced'];
    if (healthKeywords.some(k => lower.includes(k))) return 'portfolio_health';
    const allocationKeywords = ['allocation', 'asset class', 'breakdown', 'split', 'how is my money allocated', 'where is my money'];
    if (allocationKeywords.some(k => lower.includes(k))) return 'allocation_breakdown';
    const balanceKeywords = ['balance', 'total value', 'how much', 'what\'s my', 'net worth', 'account value'];
    if (balanceKeywords.some(k => lower.includes(k))) return 'balance_query';
    return 'portfolio_explain';
  }

  if (oldIntent === 'goals') {
    return 'goal_progress';
  }

  const map: Record<string, IntentClassification['primary_intent']> = {
    market: 'market_news',
    scenario: 'workflow_request',
    recommendation: 'recommendation_request',
    execution_request: 'execution_request',
    general: 'other',
  };
  return map[oldIntent] ?? 'other';
}

function inferReasoningEffort(intent: IntentClassification['primary_intent'], message: string): IntentClassification['reasoning_effort'] {
  const lower = message.toLowerCase();
  const simple = ['what is', 'show me', 'how much', 'what\'s my balance', 'total value'];
  if (simple.some(p => lower.includes(p)) && intent !== 'portfolio_health' && intent !== 'recommendation_request') {
    return 'low';
  }
  const complex = ['analyze', 'compare', 'recommend', 'should i', 'rebalance', 'health', 'risk analysis', 'diversif'];
  if (complex.some(p => lower.includes(p))) return 'high';
  return 'medium';
}

function inferSuggestedTools(intent: IntentClassification['primary_intent'], message: string): string[] {
  const tools: string[] = [];
  const lower = message.toLowerCase();

  switch (intent) {
    case 'balance_query':
      tools.push('getPortfolioSnapshot');
      break;
    case 'portfolio_explain':
      tools.push('getPortfolioSnapshot', 'getHoldings');
      break;
    case 'allocation_breakdown':
      tools.push('getPortfolioSnapshot', 'getHoldings');
      break;
    case 'goal_progress':
      tools.push('getPortfolioSnapshot');
      break;
    case 'portfolio_health':
      tools.push('calculatePortfolioHealth', 'getPortfolioSnapshot', 'getHoldings');
      break;
    case 'market_news':
      tools.push('getHoldingsRelevantNews');
      if (message.match(/\b[A-Z]{2,5}\b/)) tools.push('getQuotes');
      break;
    case 'recommendation_request':
      tools.push('calculatePortfolioHealth', 'getPortfolioSnapshot', 'getHoldings');
      break;
    case 'execution_request':
      tools.push('route_to_advisor', 'getPortfolioSnapshot');
      break;
    default:
      tools.push('getPortfolioSnapshot');
  }

  if (lower.includes('simulat') || lower.includes('retire') || lower.includes('what if')) {
    tools.push('show_simulator');
  }

  return [...new Set(tools)];
}

function mapIntentForRag(primaryIntent: IntentClassification['primary_intent']): intentClassifier.Intent {
  const map: Partial<Record<IntentClassification['primary_intent'], intentClassifier.Intent>> = {
    portfolio_health: 'portfolio',
    portfolio_explain: 'portfolio',
    allocation_breakdown: 'portfolio',
    balance_query: 'portfolio',
    goal_progress: 'goals',
    market_news: 'market',
    workflow_request: 'scenario',
    recommendation_request: 'recommendation',
    execution_request: 'execution_request',
    other: 'general',
  };
  return map[primaryIntent] ?? 'general';
}

function extractSymbols(message: string): string[] {
  const matches = message.match(/\b[A-Z]{2,5}\b/g) ?? [];
  const commonWords = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HOW', 'HAS']);
  return matches.filter(m => !commonWords.has(m));
}

async function buildIntentClassification(message: string): Promise<IntentClassification> {
  const { intent: oldIntent, confidence: llmConfidence } = await intentClassifier.classifyIntentAsync(message);
  const primaryIntent = mapOldIntentToNew(oldIntent, message);
  const effort = inferReasoningEffort(primaryIntent, message);
  const symbols = extractSymbols(message);
  const suggestedTools = inferSuggestedTools(primaryIntent, message);

  return {
    primary_intent: primaryIntent,
    confidence: llmConfidence,
    entities: {
      symbols,
      asset_classes: [],
      time_range: undefined,
      currencies: [],
    },
    reasoning_effort: effort,
    suggested_tools: suggestedTools,
  };
}

const PREFETCH_INTENTS = new Set<IntentClassification['primary_intent']>([
  'balance_query', 'portfolio_explain', 'portfolio_health', 'recommendation_request',
  'allocation_breakdown', 'market_news', 'goal_progress',
]);

const FAST_PATH_REQUIRED_SOURCES: Record<string, string[]> = {
  balance_query: ['portfolio_api'],
  allocation_breakdown: ['portfolio_api'],
  goal_progress: ['portfolio_api'],
};

function isFastPathPrefetchComplete(
  intent: IntentClassification['primary_intent'],
  results: ToolResult[],
): boolean {
  const required = FAST_PATH_REQUIRED_SOURCES[intent];
  if (!required) return false;
  return required.every(sourceType =>
    results.some(r => r.status === 'ok' && r.data && r.source_type === sourceType),
  );
}

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
  let holdingsPromise: Promise<ToolResult> | null = null;
  if (allowedTools.includes('getHoldings') && intent.primary_intent !== 'balance_query' && intent.primary_intent !== 'goal_progress') {
    holdingsPromise = executeFinancialTool('getHoldings', {}, userId, registry, riskLevel);
    prefetchJobs.push({ name: 'getHoldings', promise: holdingsPromise });
  }

  if (intent.primary_intent === 'market_news') {
    if (allowedTools.includes('getHoldingsRelevantNews')) {
      prefetchJobs.push({ name: 'getHoldingsRelevantNews', promise: executeFinancialTool('getHoldingsRelevantNews', {}, userId, registry, riskLevel) });
    }
    if (allowedTools.includes('getQuotes')) {
      const symbolSource = holdingsPromise
        ? holdingsPromise.then(r => {
            if (r.status === 'ok' && Array.isArray(r.data)) {
              return (r.data as Array<{ symbol: string }>).map(h => h.symbol);
            }
            return [];
          })
        : Promise.resolve([] as string[]);
      prefetchJobs.push({
        name: 'getQuotes',
        promise: symbolSource.then(holdingSymbols => {
          const messageSymbols = intent.entities.symbols;
          const allSymbols = [...new Set([...holdingSymbols, ...messageSymbols])];
          if (allSymbols.length === 0) return { status: 'ok' as const, source_name: 'skip', source_type: 'skip', as_of: new Date().toISOString(), latency_ms: 0, data: null };
          return executeFinancialTool('getQuotes', { symbols: allSymbols }, userId, registry, riskLevel);
        }),
      });
    }
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
    (intent.primary_intent === 'portfolio_health' || intent.primary_intent === 'recommendation_request' || intent.primary_intent === 'portfolio_explain') &&
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


async function generateSuggestedQuestions(
  conversationHistory: OpenAI.ChatCompletionMessageParam[],
  fullResponse: string,
  providerAlias: string,
): Promise<{ questions: string[]; tokens: number }> {
  const suggestMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: 'Based on the conversation, generate exactly 3 short follow-up questions the user might want to ask next. Return ONLY a JSON array of 3 strings, no other text.' },
    ...conversationHistory,
    { role: 'assistant', content: fullResponse },
  ];

  try {
    const suggestResponse = await resilientCompletion({
      model: resolveModel('ada-fast'),
      messages: suggestMessages,
      max_completion_tokens: 256,
    }, { timeoutMs: 8000, retries: 1, providerAlias });
    const suggestContent = suggestResponse.choices[0]?.message?.content || '';
    const jsonMatch = suggestContent.match(/\[[\s\S]*\]/);
    const questions = jsonMatch ? (JSON.parse(jsonMatch[0]) as string[]).slice(0, 3) : [];
    const tokens = suggestResponse.usage?.total_tokens ?? 0;
    return { questions, tokens };
  } catch {
    return {
      questions: ['Tell me more about my portfolio', 'How is the market doing?', 'What should I focus on?'],
      tokens: 0,
    };
  }
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
  console.log('[Orchestrator] route=%s model=%s fast_path=%s', route.lane, route.provider_alias, route.fast_path);

  yield* thinkingEvent(verbose, 'routing', `Lane: ${route.lane}, model: ${route.provider_alias}${route.fast_path ? ' [FAST PATH]' : ''} (${getCapabilitySummary(route.provider_alias)})`);
  if (verbose) {
    await new Promise(r => setImmediate(r));
  }

  const registry = getProviderRegistry(tenantConfig.provider_config);
  const riskLevel = riskProfile?.level ?? 'moderate';

  await contentRepo.ensureChatThread(userId, threadId, req.message.slice(0, 60));
  await contentRepo.insertChatMessage(threadId, 'user', req.message);
  memoryService.addToWorkingMemory(threadId, { role: 'user', content: sanitizedMessage });


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

  const routeModel = resolveModel(route.provider_alias);
  const routeLabel = route.lane === 'lane2' ? 'strong' : 'fast';

  yield* thinkingEvent(verbose, 'model_selection', `Model: ${routeModel} (${routeLabel}), max tokens: ${route.max_tokens}, tools: ${allowedToolNames.length}`);

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

  for (const result of prefetched.results) {
    if (result.status !== 'ok' || !result.data) continue;
    if (result.source_type === 'wealth_engine') continue;
    if (result.source_type === 'news_api') {
      enrichmentContext += `\n\nMARKET NEWS (pre-fetched):\n${JSON.stringify(result.data, null, 1)}`;
    } else if (result.source_type === 'market_api') {
      enrichmentContext += `\n\nMARKET QUOTES (pre-fetched):\n${JSON.stringify(result.data, null, 1)}`;
    } else if (result.source_type === 'portfolio_api') {
      enrichmentContext += `\n\nPORTFOLIO DATA (pre-fetched):\n${JSON.stringify(result.data, null, 1)}`;
    }
  }

  const fastPathActive = route.fast_path && isFastPathPrefetchComplete(intent.primary_intent, prefetched.results);
  const promptToolNames = fastPathActive ? [] : allowedToolNames;

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
    toolNames: promptToolNames,
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

  try {
    const llmStart = Date.now();
    yield* thinkingEvent(verbose, 'llm_generation', `Streaming response from ${routeModel}...`);

    const MAX_TOOL_TURNS = 3;
    let currentMessages = [...messages];
    let turnCount = 0;
    let isLastTurn = false;

    while (turnCount < MAX_TOOL_TURNS) {
      turnCount++;

      const skipTools = intent.primary_intent === 'other' || intent.primary_intent === 'support';
      const useTools = tools.length > 0 && turnCount === 1 && !skipTools && !fastPathActive;

      const effectiveMaxTokens = fastPathActive ? 1024 : route.max_tokens;
      const createLLMStream = (attempt: number) => {
        const baseTimeout = fastPathActive ? 8000 : 15000;
        const retryTimeout = fastPathActive ? 10000 : 20000;
        const timeoutMs = attempt === 1 ? baseTimeout : retryTimeout;
        return resilientStreamCompletion({
          model: routeModel,
          messages: currentMessages,
          tools: useTools ? tools : undefined,
          stream: true,
          max_completion_tokens: effectiveMaxTokens,
        }, { timeoutMs, providerAlias: route.provider_alias });
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
              }, { timeoutMs: 20000 });
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

      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          turnBuffer += delta.content;
          yield { type: 'text', content: delta.content };
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

      fullResponse += turnBuffer;

      if (toolCalls.length === 0) {
        isLastTurn = true;
        break;
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

    const suggestPromise = generateSuggestedQuestions(conversationHistory, fullResponse, route.provider_alias);

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

    const suggestResult = await suggestPromise;
    const suggestedQuestions = suggestResult.questions;
    totalTokens += suggestResult.tokens;

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
      modelName: routeModel,
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
      model: routeModel,
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
