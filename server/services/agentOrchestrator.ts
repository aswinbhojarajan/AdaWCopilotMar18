import OpenAI from 'openai';
import type { ChatMessageRequest, RiskProfile } from '../../shared/types';
import type { IntentClassification, ToolResult, AdaAnswer } from '../../shared/schemas/agent';
import type { StreamEvent } from './chatService';
import { openai, MODEL } from './openaiClient';
import * as intentClassifier from './intentClassifier';
import * as ragService from './ragService';
import * as memoryService from './memoryService';
import * as piiDetector from './piiDetector';
import * as contentRepo from '../repositories/contentRepository';
import * as userRepo from '../repositories/userRepository';
import * as agentRepo from '../repositories/agentRepository';
import { getProviderRegistry } from '../providers/registry';
import type { ProviderRegistry } from '../providers/types';
import { evaluatePolicy } from './policyEngine';
import { buildAgentPrompt } from './promptBuilder';
import { selectModel } from './modelRouter';
import { getToolDefinitions, executeFinancialTool, isFinancialTool, FINANCIAL_TOOL_DEFINITIONS, UI_TOOL_DEFINITIONS } from './financialTools';
import { buildAdaAnswer } from './responseBuilder';
import { runPostChecks } from './guardrails';
import { logAgentTrace, logToolRun } from './traceLogger';
import type { StepTimings, TraceContext } from './traceLogger';
import * as wealthEngine from './wealthEngine';

function mapOldIntentToNew(oldIntent: string, message: string): IntentClassification['primary_intent'] {
  const lower = message.toLowerCase();

  if (oldIntent === 'portfolio') {
    const healthKeywords = ['health', 'healthy', 'risk', 'diversif', 'concentrated', 'rebalance', 'well-balanced', 'well balanced'];
    if (healthKeywords.some(k => lower.includes(k))) return 'portfolio_health';
    const balanceKeywords = ['balance', 'total value', 'how much', 'what\'s my', 'net worth', 'account value'];
    if (balanceKeywords.some(k => lower.includes(k))) return 'balance_query';
    return 'portfolio_explain';
  }

  const map: Record<string, IntentClassification['primary_intent']> = {
    goals: 'workflow_request',
    market: 'market_news',
    scenario: 'workflow_request',
    recommendation: 'recommendation_request',
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
    default:
      tools.push('getPortfolioSnapshot');
  }

  if (lower.includes('simulat') || lower.includes('retire') || lower.includes('what if')) {
    tools.push('show_simulator');
  }

  return [...new Set(tools)];
}

function extractSymbols(message: string): string[] {
  const matches = message.match(/\b[A-Z]{2,5}\b/g) ?? [];
  const commonWords = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'HOW', 'HAS']);
  return matches.filter(m => !commonWords.has(m));
}

function buildIntentClassification(message: string): IntentClassification {
  const oldIntent = intentClassifier.classifyIntent(message);
  const primaryIntent = mapOldIntentToNew(oldIntent, message);
  const effort = inferReasoningEffort(primaryIntent, message);
  const symbols = extractSymbols(message);
  const suggestedTools = inferSuggestedTools(primaryIntent, message);

  return {
    primary_intent: primaryIntent,
    confidence: 0.85,
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

export async function* orchestrateStream(
  userId: string,
  req: ChatMessageRequest,
): AsyncGenerator<StreamEvent> {
  const startTime = Date.now();
  const timings: StepTimings = {};
  const threadId = req.threadId ?? `thread-${Date.now()}`;
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const piiResult = piiDetector.scanForPii(req.message);
  const sanitizedMessage = piiResult.hasPii ? piiResult.sanitized : req.message;

  await memoryService.logAudit({
    userId,
    threadId,
    action: 'message_received',
    piiDetected: piiResult.hasPii,
    inputPreview: piiResult.hasPii ? piiResult.sanitized.slice(0, 100) : req.message.slice(0, 100),
  });

  const sessionStart = Date.now();
  const [tenantId, userProfile] = await Promise.all([
    agentRepo.getUserTenantId(userId),
    userRepo.findUserById(userId),
  ]);

  const tenantConfig = tenantId
    ? (await agentRepo.getTenantConfig(tenantId)) ?? await agentRepo.getDefaultTenantConfig()
    : await agentRepo.getDefaultTenantConfig();

  timings.session_hydrate_ms = Date.now() - sessionStart;

  const intentStart = Date.now();
  const intent = buildIntentClassification(sanitizedMessage);
  timings.intent_classification_ms = Date.now() - intentStart;

  const policyStart = Date.now();
  const riskProfile: RiskProfile | undefined = userProfile?.riskProfile;
  const policyDecision = evaluatePolicy(tenantConfig, intent, riskProfile);
  timings.policy_evaluation_ms = Date.now() - policyStart;

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

  const registry = getProviderRegistry(tenantConfig.provider_config);

  const getToolName = (t: OpenAI.ChatCompletionTool): string => t.type === 'function' ? t.function.name : '';
  const allToolNames = [
    ...FINANCIAL_TOOL_DEFINITIONS.map(getToolName),
    ...UI_TOOL_DEFINITIONS.map(getToolName),
  ];
  const allowedToolNames = allToolNames.filter(t => policyDecision.allowed_tools.includes(t));
  const tools = getToolDefinitions(allowedToolNames);

  const modelSelection = selectModel(intent, policyDecision, intent.suggested_tools.length);
  const riskLevel = riskProfile?.level ?? 'moderate';

  const prefetchStart = Date.now();
  const [portfolioContext, episodicMemories, semanticFacts, prefetched] = await Promise.all([
    ragService.buildPortfolioContext(userId, intentClassifier.classifyIntent(sanitizedMessage)),
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
  });

  await contentRepo.ensureChatThread(userId, threadId, req.message.slice(0, 60));
  await contentRepo.insertChatMessage(threadId, 'user', req.message);
  memoryService.addToWorkingMemory(threadId, { role: 'user', content: sanitizedMessage });

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

    const MAX_TOOL_TURNS = 3;
    let currentMessages = [...messages];
    let turnCount = 0;

    while (turnCount < MAX_TOOL_TURNS) {
      turnCount++;

      const response = await openai.chat.completions.create({
        model: modelSelection.model,
        messages: currentMessages,
        tools: tools.length > 0 ? tools : undefined,
        stream: true,
        max_completion_tokens: modelSelection.max_tokens,
      });

      const toolCalls: { id: string; name: string; arguments: string }[] = [];
      let currentToolIndex = -1;
      let turnBuffer = '';

      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        if (delta.content) {
          turnBuffer += delta.content;
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

      if (toolCalls.length === 0) break;

      const assistantMsg: OpenAI.ChatCompletionAssistantMessageParam = {
        role: 'assistant',
        content: fullResponse || null,
        tool_calls: toolCalls.map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: { name: tc.name, arguments: tc.arguments },
        })),
      };

      const financialCalls = toolCalls.filter(tc => isFinancialTool(tc.name));
      const uiCalls = toolCalls.filter(tc => !isFinancialTool(tc.name));

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
        const fr = financialResults.find(r => r.tool_call_id === tc.id);
        const ur = uiResults.find(r => r.tool_call_id === tc.id);
        if (fr) orderedToolResults.push(fr);
        else if (ur) orderedToolResults.push(ur);
      }

      currentMessages = [...currentMessages, assistantMsg, ...orderedToolResults];
      fullResponse = '';
    }

    timings.llm_generation_ms = Date.now() - llmStart;

    const postStart = Date.now();
    const guardrailResult = runPostChecks(fullResponse, tenantConfig, policyDecision, toolResults);
    if (!guardrailResult.passed) {
      guardrailInterventions.push(...guardrailResult.interventions);
      fullResponse = guardrailResult.sanitizedText;
    }

    yield { type: 'text', content: fullResponse };

    for (const uiEvent of pendingUiEvents) {
      yield uiEvent;
    }

    if (guardrailResult.appendedDisclosures.length > 0) {
      const disclosureText = '\n\n' + guardrailResult.appendedDisclosures.join(' ');
      fullResponse += disclosureText;
      yield { type: 'text', content: disclosureText };
    }

    if (policyDecision.require_human_review) {
      escalationDecisions.push(policyDecision.escalation_reason || 'Advisor review required');
      yield { type: 'widget', widget: { type: 'advisor_handoff' } };
      widgets.push({ type: 'advisor_handoff' });
    }

    timings.post_checks_ms = Date.now() - postStart;

    const suggestMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Based on the conversation, generate exactly 3 short follow-up questions the user might want to ask next. Return ONLY a JSON array of 3 strings, no other text.' },
      ...conversationHistory,
      { role: 'assistant', content: fullResponse },
    ];

    let suggestedQuestions: string[] = [];
    try {
      const suggestResponse = await openai.chat.completions.create({
        model: MODEL,
        messages: suggestMessages,
        max_completion_tokens: 256,
      });
      const suggestContent = suggestResponse.choices[0]?.message?.content || '';
      const jsonMatch = suggestContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestedQuestions = (JSON.parse(jsonMatch[0]) as string[]).slice(0, 3);
      }
      if (suggestResponse.usage) totalTokens += suggestResponse.usage.total_tokens;
    } catch {
      suggestedQuestions = ['Tell me more about my portfolio', 'How is the market doing?', 'What should I focus on?'];
    }

    if (suggestedQuestions.length > 0) {
      yield { type: 'suggested_questions', suggestedQuestions };
    }

    const adaAnswer = buildAdaAnswer({
      intent,
      policyDecision,
      llmText: fullResponse,
      toolResults,
      tenantConfig,
      guardrailInterventions,
    });
    adaAnswer.suggested_questions = suggestedQuestions;

    timings.total_ms = Date.now() - startTime;

    const traceCtx: TraceContext = {
      conversationId: threadId,
      messageId,
      tenantId: tenantConfig.tenant_id,
      userId,
    };

    try {
      await logAgentTrace({
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
      });
    } catch {
      // non-blocking
    }

    await memoryService.logAudit({
      userId,
      threadId,
      action: 'response_generated',
      intent: intent.primary_intent,
      model: modelSelection.model,
      tokensUsed: totalTokens,
    });

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
