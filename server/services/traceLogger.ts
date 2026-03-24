import { saveAgentTrace, saveToolRun } from '../repositories/agentRepository';
import type { IntentClassification, PolicyDecision, AdaAnswer, ToolResult } from '../../shared/schemas/agent';
import type { RouteDecision, RequestScorecard } from './modelRouter';

export interface TraceContext {
  conversationId: string;
  messageId: string;
  tenantId?: string;
  userId: string;
}

export interface StepTimings {
  session_hydrate_ms?: number;
  intent_classification_ms?: number;
  policy_evaluation_ms?: number;
  tool_execution_ms?: number;
  llm_generation_ms?: number;
  llm_first_token_ms?: number;
  post_checks_ms?: number;
  total_ms?: number;
}

const LATENCY_TARGETS: Record<string, { first_token_ms?: number; total_ms: number }> = {
  lane0: { total_ms: 800 },
  lane1: { first_token_ms: 1800, total_ms: 5000 },
  lane2: { first_token_ms: 2500, total_ms: 9000 },
};

export function checkLatencyTargets(
  lane: string,
  timings: StepTimings,
): { met: boolean; deviations: string[] } {
  const target = LATENCY_TARGETS[lane];
  if (!target) return { met: true, deviations: [] };

  const deviations: string[] = [];

  if (target.first_token_ms !== undefined && timings.llm_first_token_ms !== undefined) {
    if (timings.llm_first_token_ms > target.first_token_ms) {
      deviations.push(`first_token ${timings.llm_first_token_ms}ms > target ${target.first_token_ms}ms (+${timings.llm_first_token_ms - target.first_token_ms}ms)`);
    }
  }

  if (timings.total_ms !== undefined && timings.total_ms > target.total_ms) {
    deviations.push(`total ${timings.total_ms}ms > target ${target.total_ms}ms (+${timings.total_ms - target.total_ms}ms)`);
  }

  const met = deviations.length === 0;
  if (!met) {
    console.log(`[LatencyTarget] ${lane} EXCEEDED: ${deviations.join('; ')}`);
  }

  return { met, deviations };
}

export function logProviderFallback(params: {
  failedProvider: string;
  replacementProvider: string;
  failureReason: string;
  switchCostMs: number;
  lane?: string;
}): void {
  console.log(
    `[ProviderFallback] %s → %s | reason=%s | cost=%dms | lane=%s`,
    params.failedProvider,
    params.replacementProvider,
    params.failureReason,
    params.switchCostMs,
    params.lane ?? 'unknown',
  );
}

export async function logAgentTrace(params: {
  ctx: TraceContext;
  intent: IntentClassification;
  policyDecision: PolicyDecision;
  modelName: string;
  toolSetExposed: string[];
  toolCallsMade: ToolResult[];
  finalAnswer?: AdaAnswer;
  responseTimeMs: number;
  stepTimings: StepTimings;
  guardrailInterventions: string[];
  escalationDecisions: string[];
  routeDecision?: RouteDecision;
  scorecard?: RequestScorecard;
}): Promise<number> {
  const timingsRecord: Record<string, number> = {};
  for (const [k, v] of Object.entries(params.stepTimings)) {
    if (v !== undefined) timingsRecord[k] = v;
  }

  if (params.routeDecision) {
    timingsRecord['__lane'] = params.routeDecision.lane === 'lane0' ? 0 : params.routeDecision.lane === 'lane1' ? 1 : 2;
    timingsRecord['__max_tokens'] = params.routeDecision.max_tokens;
    timingsRecord['__temperature_x100'] = Math.round(params.routeDecision.temperature * 100);
  }

  const modelLabel = params.routeDecision
    ? `${params.modelName} [${params.routeDecision.lane}/${params.routeDecision.provider_alias}]`
    : params.modelName;

  const reasoningEffort = params.scorecard?.reasoning_effort ?? params.intent.reasoning_effort;

  const escalations = [...params.escalationDecisions];
  if (params.routeDecision) {
    escalations.unshift(`Route: ${params.routeDecision.lane} — ${params.routeDecision.rationale.join('; ')}`);
  }
  if (params.scorecard) {
    escalations.unshift(`Scorecard: risk=${params.scorecard.risk_level}, deterministic=${params.scorecard.requires_deterministic_math}, tools=${params.scorecard.tool_count_estimate}, channel=${params.scorecard.channel}`);
  }

  return saveAgentTrace({
    conversation_id: params.ctx.conversationId,
    message_id: params.ctx.messageId,
    tenant_id: params.ctx.tenantId,
    user_id: params.ctx.userId,
    intent_classification: params.intent.primary_intent,
    policy_decision: params.policyDecision,
    model_name: modelLabel,
    reasoning_effort: reasoningEffort,
    tool_set_exposed: params.toolSetExposed,
    tool_calls_made: params.toolCallsMade,
    final_answer: params.finalAnswer,
    response_time_ms: params.responseTimeMs,
    step_timings: timingsRecord,
    guardrail_interventions: params.guardrailInterventions,
    escalation_decisions: escalations,
  });
}

export async function logToolRun(params: {
  toolName: string;
  inputs: Record<string, unknown>;
  result: ToolResult;
  conversationId?: string;
  messageId?: string;
  userId?: string;
}): Promise<number> {
  return saveToolRun({
    tool_name: params.toolName,
    inputs: params.inputs,
    outputs: params.result.data,
    latency_ms: params.result.latency_ms,
    status: params.result.status,
    source_provider: params.result.source_name,
    conversation_id: params.conversationId,
    message_id: params.messageId,
    user_id: params.userId,
  });
}
