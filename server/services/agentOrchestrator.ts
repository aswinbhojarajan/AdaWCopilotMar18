import OpenAI from 'openai';
import type { ChatMessageRequest, RiskProfile } from '../../shared/types';
import type { IntentClassification, ToolResult, AdaAnswer, TenantConfig } from '../../shared/schemas/agent';
import type { PolicyDecision } from '../../shared/schemas/agent';
import type { StreamEvent } from './streamTypes';
import { openai, resilientCompletion, resilientStreamCompletion, withChunkTimeout } from './openaiClient';
import * as intentClassifier from './intentClassifier';
import * as ragService from './ragService';
import * as memoryService from './memoryService';
import * as piiDetector from './piiDetector';
import { moderateInput, moderateOutput } from './moderationService';
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
} from './financialTools';
import {
  getAllToolNames as registryAllToolNames,
  inferSuggestedTools as registryInferSuggestedTools,
} from './toolRegistry';
import { buildAdaAnswer, extractInlineFollowUps, getDeterministicFollowUps, FollowUpStreamFilter } from './responseBuilder';
import { runPostChecks } from './guardrails';
import { logAgentTrace, logToolRun, checkLatencyTargets } from './traceLogger';
import type { StepTimings, TraceContext } from './traceLogger';
import * as wealthEngine from './wealthEngine';
import { routeToAdvisor } from './rmHandoffService';
import { handleLane0 } from './agent/lane0';

interface WorkingTurn {
  role: 'user' | 'assistant';
  content: string;
}

async function summarizeEpisodicAsync(
  userId: string,
  threadId: string,
  turns: WorkingTurn[],
): Promise<void> {
  try {
    const episodic = await memoryService.generateEpisodicSummary(turns);
    await memoryService.saveEpisodicMemory(
      userId,
      threadId,
      episodic.summary,
      episodic.topics,
      episodic.preferences,
      episodic.watchedEntities,
      episodic.unresolvedTopics,
    );
    console.log('[Orchestrator] Episodic summary saved for thread=%s topics=%s', threadId, episodic.topics.join(','));
  } catch (err) {
    console.log('[Orchestrator] Episodic summarization failed (best-effort):', (err as Error).message);
  }
}

function inferSuggestedTools(intent: IntentClassification['primary_intent'], message: string): string[] {
  return registryInferSuggestedTools(intent, message);
}

function mapIntentForRag(primaryIntent: IntentClassification['primary_intent']): intentClassifier.Intent {
  return primaryIntent;
}

function extractSymbols(message: string): string[] {
  const matches = message.match(/\b[A-Z]{2,5}\b/g) ?? [];
  const commonWords = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HOW', 'HAS']);
  return matches.filter(m => !commonWords.has(m));
}

async function buildIntentClassification(
  message: string,
  recentHistory?: Array<{ role: 'user' | 'assistant'; content: string }>,
): Promise<IntentClassification> {
  const classifierResult = await intentClassifier.classifyIntentAsync(message, recentHistory);
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
      logToolRun({
        toolName: j.name,
        inputs: { userId, lane: 'prefetch', intent: intent.primary_intent },
        result,
      }).catch(() => {});
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

  if (tenantConfig.moderation_enabled !== false) {
    const inputModResult = await moderateInput(sanitizedMessage);
    earlyThinkingBuffer.push({ step: 'input_moderation', detail: inputModResult.flagged ? `Flagged (${Object.entries(inputModResult.categories).filter(([, v]) => v).map(([k]) => k).join(', ')})` : `Clean (${inputModResult.latencyMs}ms)` });

    agentRepo.saveModerationEvent({
      user_id: userId,
      thread_id: threadId,
      message_id: messageId,
      direction: 'input',
      flagged: inputModResult.flagged,
      categories: inputModResult.categories,
      scores: inputModResult.scores,
      action_taken: inputModResult.flagged ? 'blocked' : 'passed',
      model_used: inputModResult.model,
      latency_ms: inputModResult.latencyMs,
    }).catch(() => {});

    if (inputModResult.flagged) {
      for (const buffered of earlyThinkingBuffer) {
        yield* thinkingEvent(verbose, buffered.step, buffered.detail);
      }
      const refusalText = "I'm unable to process this request. Please rephrase your message in a way that aligns with our platform guidelines.";
      yield { type: 'text', content: refusalText };
      yield { type: 'done' };
      return;
    }
  }

  const recentHistory = await memoryService.getWorkingMemory(threadId);
  const classifierHistory = recentHistory.slice(-4).map(t => ({
    role: t.role as 'user' | 'assistant',
    content: t.content,
  }));
  const intentStart = Date.now();
  const intent = await buildIntentClassification(sanitizedMessage, classifierHistory.length > 0 ? classifierHistory : undefined);
  timings.intent_classification_ms = Date.now() - intentStart;
  console.log('[Orchestrator] intent=%s confidence=%s lane=%s ms=%d', intent.primary_intent, intent.confidence, intent.suggested_tools.length > 0 ? 'lane1+' : 'tbd', timings.intent_classification_ms);

  earlyThinkingBuffer.push({ step: 'intent_classification', detail: `Intent: ${intent.primary_intent} (confidence: ${(intent.confidence * 100).toFixed(0)}%, effort: ${intent.reasoning_effort})` });

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

  yield { type: 'meta' as const, lane: route.lane, intent: intent.primary_intent, traceId: messageId, model: route.provider_alias };

  yield* thinkingEvent(verbose, 'routing', `Lane: ${route.lane}, model: ${route.provider_alias} (${getCapabilitySummary(route.provider_alias)})`);
  if (verbose) {
    await new Promise(r => setImmediate(r));
  }

  const registry = getProviderRegistry(tenantConfig.provider_config);
  const riskLevel = riskProfile?.level ?? 'moderate';

  await contentRepo.ensureChatThread(userId, threadId, req.message.slice(0, 60));
  await contentRepo.insertChatMessage(threadId, 'user', req.message);
  await memoryService.addToWorkingMemory(threadId, { role: 'user', content: sanitizedMessage });

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

  const allToolNames = registryAllToolNames();
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
      discoverCard: req.context.discoverCard,
    } : undefined,
    toolNames: allowedToolNames,
    providerAlias: route.provider_alias,
  });

  const conversationHistory = await memoryService.getWorkingMemory(threadId);
  const escapeXmlTags = (text: string): string =>
    text.replace(/</g, '＜').replace(/>/g, '＞');
  const boundedHistory = conversationHistory.map((msg) => {
    if (msg.role === 'user' && typeof msg.content === 'string') {
      return { ...msg, content: `<user_message>${escapeXmlTags(msg.content)}</user_message>` };
    }
    return msg;
  });
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...boundedHistory,
  ];
  let fullResponse = '';
  const widgets: { type: string }[] = [];
  const guardrailInterventions: string[] = [];
  const escalationDecisions: string[] = [];
  let totalTokens = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
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
    const moderationBufferEnabled = tenantConfig.moderation_enabled !== false;
    const pendingTextChunks: string[] = [];

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
          stream_options: { include_usage: true },
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
                stream_options: { include_usage: true },
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
      let firstTokenRecorded = false;

      const timedStream = withChunkTimeout<OpenAI.ChatCompletionChunk>(response, 30000, 90000);

      for await (const chunk of timedStream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          if (!firstTokenRecorded) {
            timings.llm_first_token_ms = Date.now() - llmStart;
            firstTokenRecorded = true;
          }
          turnBuffer += delta.content;
          const safeText = streamFilter.push(delta.content);
          if (safeText) {
            if (moderationBufferEnabled) {
              pendingTextChunks.push(safeText);
            } else {
              yield { type: 'text', content: safeText };
            }
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

        if (chunk.usage) {
          totalTokens += chunk.usage.total_tokens;
          if (chunk.usage.prompt_tokens) totalPromptTokens += chunk.usage.prompt_tokens;
          if (chunk.usage.completion_tokens) totalCompletionTokens += chunk.usage.completion_tokens;
        }
      }

      if (toolCalls.length === 0) {
        const flushed = streamFilter.flush();
        if (flushed.remainingText) {
          if (moderationBufferEnabled) {
            pendingTextChunks.push(flushed.remainingText);
          } else {
            yield { type: 'text', content: flushed.remainingText };
          }
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
        if (moderationBufferEnabled) {
          pendingTextChunks.push(flushedMidTurn.remainingText);
        } else {
          yield { type: 'text', content: flushedMidTurn.remainingText };
        }
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

    let outputModerationFlagged = false;

    if (moderationBufferEnabled) {
      const outputModResult = await moderateOutput(fullResponse);
      yield* thinkingEvent(verbose, 'output_moderation', outputModResult.flagged ? `Flagged (${Object.entries(outputModResult.categories).filter(([, v]) => v).map(([k]) => k).join(', ')})` : `Clean (${outputModResult.latencyMs}ms)`);

      agentRepo.saveModerationEvent({
        user_id: userId,
        thread_id: threadId,
        message_id: messageId,
        direction: 'output',
        flagged: outputModResult.flagged,
        categories: outputModResult.categories,
        scores: outputModResult.scores,
        action_taken: outputModResult.flagged ? 'replaced' : 'passed',
        model_used: outputModResult.model,
        latency_ms: outputModResult.latencyMs,
      }).catch(() => {});

      if (outputModResult.flagged) {
        fullResponse = "I'm unable to provide this response as it may not align with our platform guidelines. Please try rephrasing your question.";
        guardrailInterventions.push('Output moderation flagged — response replaced with fallback');
        outputModerationFlagged = true;
      }
    }

    yield* thinkingEvent(verbose, 'guardrails', 'Running post-generation guardrail checks...');
    const guardrailResult = runPostChecks(fullResponse, tenantConfig, policyDecision, toolResults);
    if (!guardrailResult.passed) {
      guardrailInterventions.push(...guardrailResult.interventions);
      if (guardrailResult.sanitizedText !== fullResponse) {
        fullResponse = guardrailResult.sanitizedText;
      }
    }

    if (moderationBufferEnabled) {
      if (outputModerationFlagged) {
        yield { type: 'text', content: fullResponse };
      } else {
        yield { type: 'text', content: guardrailResult.sanitizedText };
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

    const latencyCheck = checkLatencyTargets(route.lane, timings);
    if (!latencyCheck.met) {
      escalationDecisions.push(`Latency target exceeded: ${latencyCheck.deviations.join('; ')}`);
    }

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
      promptTokens: totalPromptTokens || undefined,
      completionTokens: totalCompletionTokens || undefined,
      providerAlias: modelSelection.provider_alias,
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
    await memoryService.addToWorkingMemory(threadId, { role: 'assistant', content: fullResponse });
    const widgetsJson = widgets.length > 0 ? JSON.stringify(widgets) : null;
    await contentRepo.insertChatMessageWithWidgets(threadId, 'assistant', fullResponse, widgetsJson);
    await contentRepo.updateThreadPreview(threadId, fullResponse.slice(0, 100));
  }

  yield { type: 'done' };

  const workingMem = await memoryService.getWorkingMemory(threadId);
  if (workingMem.length >= 8) {
    summarizeEpisodicAsync(userId, threadId, workingMem).catch(() => {});
  }
}
