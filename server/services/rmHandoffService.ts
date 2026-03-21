import pool from '../db/pool';
import type { TenantConfig } from '../../shared/schemas/agent';

export interface ActionRequest {
  tenantId: string;
  userId: string;
  advisorId?: string;
  conversationId?: string;
  actionType: string;
  actionDetails: Record<string, unknown>;
}

export interface HandoffResult {
  success: boolean;
  mode: TenantConfig['execution_routing_mode'];
  queueId?: number;
  advisorName?: string;
  message: string;
}

export async function routeToAdvisor(
  request: ActionRequest,
  tenantConfig: TenantConfig,
): Promise<HandoffResult> {
  const mode = tenantConfig.execution_routing_mode;

  if (mode === 'disabled') {
    return {
      success: false,
      mode,
      message: 'Trade execution routing is not enabled for this account. Please contact your advisor directly.',
    };
  }

  if (mode === 'api_webhook') {
    return await routeViaWebhook(request, tenantConfig);
  }

  return await routeViaQueue(request, tenantConfig);
}

async function routeViaQueue(
  request: ActionRequest,
  tenantConfig: TenantConfig,
): Promise<HandoffResult> {
  const advisorId = request.advisorId ?? await lookupAdvisorId(request.userId);
  const advisorName = await lookupAdvisorName(advisorId);

  const { rows } = await pool.query(
    `INSERT INTO advisor_action_queue (tenant_id, user_id, advisor_id, conversation_id, action_type, action_details, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')
     RETURNING id`,
    [
      request.tenantId,
      request.userId,
      advisorId,
      request.conversationId ?? null,
      request.actionType,
      JSON.stringify(request.actionDetails),
    ],
  );

  const queueId = Number(rows[0].id);

  return {
    success: true,
    mode: 'rm_handoff',
    queueId,
    advisorName: advisorName ?? 'Your Advisor',
    message: `Your ${request.actionType.replace(/_/g, ' ')} request has been sent to ${advisorName ?? 'your advisor'} for review and execution. Reference: #${queueId}.`,
  };
}

async function routeViaWebhook(
  request: ActionRequest,
  tenantConfig: TenantConfig,
): Promise<HandoffResult> {
  const webhookUrl = tenantConfig.execution_webhook_url;
  if (!webhookUrl) {
    return {
      success: false,
      mode: 'api_webhook',
      message: 'Webhook URL is not configured. Please contact support.',
    };
  }

  try {
    const payload = {
      tenant_id: request.tenantId,
      user_id: request.userId,
      advisor_id: request.advisorId,
      conversation_id: request.conversationId,
      action_type: request.actionType,
      action_details: request.actionDetails,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Webhook failed: ${response.status} ${response.statusText}`);
      return await routeViaQueue(request, tenantConfig);
    }

    return {
      success: true,
      mode: 'api_webhook',
      message: `Your ${request.actionType.replace(/_/g, ' ')} request has been submitted for processing.`,
    };
  } catch (err) {
    console.error('Webhook error, falling back to queue:', err);
    return await routeViaQueue(request, tenantConfig);
  }
}

async function lookupAdvisorId(userId: string): Promise<string | undefined> {
  try {
    const { rows } = await pool.query(
      `SELECT advisor_id FROM users WHERE id = $1`,
      [userId],
    );
    return rows[0]?.advisor_id ? String(rows[0].advisor_id) : undefined;
  } catch {
    return undefined;
  }
}

async function lookupAdvisorName(advisorId?: string): Promise<string | null> {
  if (!advisorId) return null;
  try {
    const { rows } = await pool.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [advisorId],
    );
    if (rows[0]) {
      return `${rows[0].first_name} ${rows[0].last_name}`.trim() || null;
    }
    return null;
  } catch {
    return null;
  }
}
