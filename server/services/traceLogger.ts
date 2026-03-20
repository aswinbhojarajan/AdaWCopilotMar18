import { saveAgentTrace, saveToolRun } from '../repositories/agentRepository';
import type { IntentClassification, PolicyDecision, AdaAnswer, ToolResult } from '../../shared/schemas/agent';

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
  post_checks_ms?: number;
  total_ms?: number;
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
}): Promise<number> {
  const timingsRecord: Record<string, number> = {};
  for (const [k, v] of Object.entries(params.stepTimings)) {
    if (v !== undefined) timingsRecord[k] = v;
  }

  return saveAgentTrace({
    conversation_id: params.ctx.conversationId,
    message_id: params.ctx.messageId,
    tenant_id: params.ctx.tenantId,
    user_id: params.ctx.userId,
    intent_classification: params.intent.primary_intent,
    policy_decision: params.policyDecision,
    model_name: params.modelName,
    reasoning_effort: params.intent.reasoning_effort,
    tool_set_exposed: params.toolSetExposed,
    tool_calls_made: params.toolCallsMade,
    final_answer: params.finalAnswer,
    response_time_ms: params.responseTimeMs,
    step_timings: timingsRecord,
    guardrail_interventions: params.guardrailInterventions,
    escalation_decisions: params.escalationDecisions,
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
