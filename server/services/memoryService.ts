import pool from '../db/pool';

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

const workingMemory = new Map<string, ConversationTurn[]>();

export function getWorkingMemory(threadId: string): ConversationTurn[] {
  return workingMemory.get(threadId) ?? [];
}

export function addToWorkingMemory(threadId: string, turn: ConversationTurn): void {
  const turns = workingMemory.get(threadId) ?? [];
  turns.push(turn);
  if (turns.length > 20) {
    turns.splice(0, turns.length - 20);
  }
  workingMemory.set(threadId, turns);
}

export function clearWorkingMemory(threadId: string): void {
  workingMemory.delete(threadId);
}

export async function getEpisodicMemories(userId: string, limit = 5): Promise<string[]> {
  const { rows } = await pool.query(
    `SELECT summary, topics FROM episodic_memories
     WHERE user_id = $1
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit],
  );
  return rows.map(r => `[Topics: ${(r.topics as string[]).join(', ')}] ${r.summary}`);
}

export async function saveEpisodicMemory(
  userId: string,
  threadId: string,
  summary: string,
  topics: string[],
): Promise<void> {
  const id = `ep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await pool.query(
    `INSERT INTO episodic_memories (id, user_id, thread_id, summary, topics)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, userId, threadId, summary, topics],
  );
}

export async function getSemanticFacts(userId: string, limit = 10): Promise<string[]> {
  const { rows } = await pool.query(
    `SELECT fact, category FROM semantic_facts
     WHERE user_id = $1
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit],
  );
  return rows.map(r => `[${r.category}] ${r.fact}`);
}

export async function saveSemanticFact(
  userId: string,
  fact: string,
  category: string,
  sourceThreadId: string,
): Promise<void> {
  const id = `sf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await pool.query(
    `INSERT INTO semantic_facts (id, user_id, fact, category, source_thread_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, userId, fact, category, sourceThreadId],
  );
}

export async function logAudit(params: {
  userId: string;
  threadId?: string;
  action: string;
  intent?: string;
  piiDetected?: boolean;
  inputPreview?: string;
  model?: string;
  tokensUsed?: number;
}): Promise<void> {
  await pool.query(
    `INSERT INTO chat_audit_log (user_id, thread_id, action, intent, pii_detected, input_preview, model, tokens_used)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      params.userId,
      params.threadId ?? null,
      params.action,
      params.intent ?? null,
      params.piiDetected ?? false,
      params.inputPreview ?? null,
      params.model ?? null,
      params.tokensUsed ?? null,
    ],
  );
}
