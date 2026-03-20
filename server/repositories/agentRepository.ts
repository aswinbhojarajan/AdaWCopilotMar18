import pool from '../db/pool';
import type { TenantConfig, AgentTrace, ToolResult, PolicyDecision } from '../../shared/schemas/agent';

export async function getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
  const { rows } = await pool.query(
    `SELECT tenant_id, jurisdiction, advisory_mode, can_name_securities, can_compare_products,
            can_generate_recommendations, can_generate_next_best_actions,
            requires_advisor_handoff_for_specific_advice, disclosure_profile,
            allowed_tool_profiles, provider_config, feature_flags,
            tone, language, blocked_phrases, data_freshness_threshold_seconds
     FROM tenant_configs WHERE tenant_id = $1`,
    [tenantId],
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    tenant_id: String(r.tenant_id),
    jurisdiction: String(r.jurisdiction),
    advisory_mode: r.advisory_mode as TenantConfig['advisory_mode'],
    can_name_securities: Boolean(r.can_name_securities),
    can_compare_products: Boolean(r.can_compare_products),
    can_generate_recommendations: Boolean(r.can_generate_recommendations),
    can_generate_next_best_actions: Boolean(r.can_generate_next_best_actions),
    requires_advisor_handoff_for_specific_advice: Boolean(r.requires_advisor_handoff_for_specific_advice),
    disclosure_profile: String(r.disclosure_profile),
    allowed_tool_profiles: (r.allowed_tool_profiles as string[]) ?? [],
    provider_config: (r.provider_config as Record<string, string>) ?? {},
    feature_flags: (r.feature_flags as Record<string, boolean>) ?? {},
    tone: String(r.tone),
    language: String(r.language),
    blocked_phrases: (r.blocked_phrases as string[]) ?? [],
    data_freshness_threshold_seconds: Number(r.data_freshness_threshold_seconds),
  };
}

export async function getDefaultTenantConfig(): Promise<TenantConfig> {
  const config = await getTenantConfig('bank_demo_uae');
  if (!config) {
    return {
      tenant_id: 'bank_demo_uae',
      jurisdiction: 'UAE',
      advisory_mode: 'personalized_insights_only',
      can_name_securities: true,
      can_compare_products: false,
      can_generate_recommendations: false,
      can_generate_next_best_actions: true,
      requires_advisor_handoff_for_specific_advice: true,
      disclosure_profile: 'uae_affluent_v1',
      allowed_tool_profiles: ['portfolio_read', 'market_read', 'news_read', 'macro_read', 'fx_read', 'health_compute', 'workflow_light'],
      provider_config: {},
      feature_flags: { enable_agent_tracing: true, enable_advisor_handoff: true, enable_recommendations: false, enable_wealth_engine: true },
      tone: 'professional',
      language: 'en',
      blocked_phrases: [],
      data_freshness_threshold_seconds: 300,
    };
  }
  return config;
}

export async function getUserTenantId(userId: string): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT tenant_id FROM users WHERE id = $1`,
    [userId],
  );
  return rows[0]?.tenant_id ? String(rows[0].tenant_id) : null;
}

export async function saveToolRun(run: {
  tool_name: string;
  inputs: Record<string, unknown>;
  outputs?: unknown;
  latency_ms?: number;
  status: 'ok' | 'error' | 'partial' | 'timeout';
  source_provider?: string;
  conversation_id?: string;
  message_id?: string;
  user_id?: string;
}): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO tool_runs (tool_name, inputs, outputs, latency_ms, status, source_provider, conversation_id, message_id, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [run.tool_name, JSON.stringify(run.inputs), run.outputs ? JSON.stringify(run.outputs) : null,
     run.latency_ms ?? null, run.status, run.source_provider ?? null,
     run.conversation_id ?? null, run.message_id ?? null, run.user_id ?? null],
  );
  return Number(rows[0].id);
}

export async function saveAgentTrace(trace: Partial<AgentTrace> & { user_id?: string }): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO agent_traces (conversation_id, message_id, tenant_id, user_id, intent_classification,
     policy_decision, model_name, reasoning_effort, tool_set_exposed, tool_calls_made,
     final_answer, response_time_ms, step_timings, guardrail_interventions, escalation_decisions)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING id`,
    [
      trace.conversation_id ?? null, trace.message_id ?? null,
      trace.tenant_id ?? null, trace.user_id ?? null,
      trace.intent_classification ?? null,
      trace.policy_decision ? JSON.stringify(trace.policy_decision) : null,
      trace.model_name ?? null, trace.reasoning_effort ?? null,
      trace.tool_set_exposed ?? [], JSON.stringify(trace.tool_calls_made ?? []),
      trace.final_answer ? JSON.stringify(trace.final_answer) : null,
      trace.response_time_ms ?? null,
      trace.step_timings ? JSON.stringify(trace.step_timings) : null,
      JSON.stringify(trace.guardrail_interventions ?? []),
      JSON.stringify(trace.escalation_decisions ?? []),
    ],
  );
  return Number(rows[0].id);
}

export async function savePolicyDecision(decision: {
  tenant_id?: string;
  user_id?: string;
  request_type: string;
  decision: PolicyDecision;
}): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO policy_decisions (tenant_id, user_id, request_type, decision)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [decision.tenant_id ?? null, decision.user_id ?? null,
     decision.request_type, JSON.stringify(decision.decision)],
  );
  return Number(rows[0].id);
}

export async function saveConversationSummary(summary: {
  conversation_id: string;
  user_id: string;
  summary: string;
  message_count: number;
}): Promise<number> {
  const { rows } = await pool.query(
    `INSERT INTO conversation_summaries (conversation_id, user_id, summary, message_count, last_summarized_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (conversation_id, user_id) DO UPDATE SET summary = $3, message_count = $4, last_summarized_at = NOW()
     RETURNING id`,
    [summary.conversation_id, summary.user_id, summary.summary, summary.message_count],
  );
  return Number(rows[0].id);
}

export async function getConversationSummary(conversationId: string, userId: string): Promise<string | null> {
  const { rows } = await pool.query(
    `SELECT summary FROM conversation_summaries WHERE conversation_id = $1 AND user_id = $2
     ORDER BY last_summarized_at DESC LIMIT 1`,
    [conversationId, userId],
  );
  return rows[0]?.summary ? String(rows[0].summary) : null;
}

export async function getToolRunsByConversation(conversationId: string): Promise<ToolResult[]> {
  const { rows } = await pool.query(
    `SELECT tool_name, outputs, status, source_provider, created_at, latency_ms
     FROM tool_runs WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [conversationId],
  );
  return rows.map((r) => ({
    tool_name: String(r.tool_name),
    success: r.status === 'ok',
    data: r.outputs,
    source_provider: String(r.source_provider ?? 'unknown'),
    as_of: r.created_at ? new Date(r.created_at as string).toISOString() : new Date().toISOString(),
    latency_ms: r.latency_ms ? Number(r.latency_ms) : undefined,
  }));
}
