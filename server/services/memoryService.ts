import pool from '../db/pool';
import { resilientCompletion } from './openaiClient';
import { resolveModel } from './modelRouter';

interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface EpisodicSummary {
  summary: string;
  preferences: string[];
  watchedEntities: string[];
  unresolvedTopics: string[];
  topics: string[];
}

const workingMemoryCache = new Map<string, ConversationTurn[]>();

export async function getWorkingMemory(threadId: string): Promise<ConversationTurn[]> {
  const cached = workingMemoryCache.get(threadId);
  if (cached) return cached;

  try {
    const { rows } = await pool.query(
      `SELECT turns FROM working_memory WHERE thread_id = $1`,
      [threadId],
    );
    if (rows.length > 0 && Array.isArray(rows[0].turns)) {
      const turns = rows[0].turns as ConversationTurn[];
      workingMemoryCache.set(threadId, turns);
      return turns;
    }
  } catch {
    // fall through to empty
  }

  return [];
}

export async function addToWorkingMemory(threadId: string, turn: ConversationTurn): Promise<void> {
  const turns = await getWorkingMemory(threadId);
  turns.push(turn);
  if (turns.length > 20) {
    turns.splice(0, turns.length - 20);
  }
  workingMemoryCache.set(threadId, turns);

  persistWorkingMemory(threadId, turns).catch(() => {});
}

async function persistWorkingMemory(threadId: string, turns: ConversationTurn[]): Promise<void> {
  await pool.query(
    `INSERT INTO working_memory (thread_id, turns, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (thread_id) DO UPDATE SET turns = $2, updated_at = NOW()`,
    [threadId, JSON.stringify(turns)],
  );
}

export async function clearWorkingMemory(threadId: string): Promise<void> {
  workingMemoryCache.delete(threadId);
  await pool.query(`DELETE FROM working_memory WHERE thread_id = $1`, [threadId]).catch(() => {});
}

export async function getEpisodicMemories(userId: string, limit = 5): Promise<string[]> {
  const { rows } = await pool.query(
    `SELECT summary, topics, preferences, watched_entities, unresolved_topics FROM episodic_memories
     WHERE user_id = $1
     ORDER BY created_at DESC LIMIT $2`,
    [userId, limit],
  );
  return rows.map(r => {
    const parts: string[] = [];
    const topics = r.topics as string[];
    if (topics.length > 0) parts.push(`Topics: ${topics.join(', ')}`);
    const prefs = r.preferences as string[] | null;
    if (prefs && prefs.length > 0) parts.push(`Prefs: ${prefs.join(', ')}`);
    const entities = r.watched_entities as string[] | null;
    if (entities && entities.length > 0) parts.push(`Watching: ${entities.join(', ')}`);
    const unresolved = r.unresolved_topics as string[] | null;
    if (unresolved && unresolved.length > 0) parts.push(`Unresolved: ${unresolved.join(', ')}`);
    return `[${parts.join(' | ')}] ${r.summary}`;
  });
}

export async function saveEpisodicMemory(
  userId: string,
  threadId: string,
  summary: string,
  topics: string[],
  preferences: string[] = [],
  watchedEntities: string[] = [],
  unresolvedTopics: string[] = [],
): Promise<void> {
  const id = `ep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await pool.query(
    `INSERT INTO episodic_memories (id, user_id, thread_id, summary, topics, preferences, watched_entities, unresolved_topics)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, userId, threadId, summary, topics, preferences, watchedEntities, unresolvedTopics],
  );
}

export async function generateEpisodicSummary(turns: ConversationTurn[]): Promise<EpisodicSummary> {
  const transcript = turns
    .map(t => `${t.role}: ${t.content.slice(0, 300)}`)
    .join('\n');

  try {
    const response = await resilientCompletion({
      model: resolveModel('ada-classifier'),
      messages: [
        {
          role: 'system',
          content: `You summarize financial advisor conversations. Return valid JSON only with these fields:
- "summary": 1-2 sentence natural language summary of the conversation
- "preferences": array of user preferences revealed (e.g. "prefers conservative investments", "interested in ESG")
- "watchedEntities": array of tickers, asset classes, or markets the user asked about (e.g. "AAPL", "real estate", "GCC bonds")
- "unresolvedTopics": array of topics the user raised but didn't get a complete answer on
- "topics": array of 2-4 topic keywords

Return ONLY the JSON object, no markdown or explanation.`,
        },
        {
          role: 'user',
          content: `Summarize this conversation:\n${transcript}`,
        },
      ],
      max_completion_tokens: 300,
      temperature: 0.1,
    }, { timeoutMs: 5000, retries: 1, providerAlias: 'ada-classifier' });

    const text = response.choices[0]?.message?.content?.trim() ?? '';
    const jsonStr = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      preferences: Array.isArray(parsed.preferences) ? parsed.preferences.filter((p: unknown) => typeof p === 'string') : [],
      watchedEntities: Array.isArray(parsed.watchedEntities) ? parsed.watchedEntities.filter((e: unknown) => typeof e === 'string') : [],
      unresolvedTopics: Array.isArray(parsed.unresolvedTopics) ? parsed.unresolvedTopics.filter((t: unknown) => typeof t === 'string') : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics.filter((t: unknown) => typeof t === 'string') : [],
    };
  } catch (err) {
    console.log('[MemoryService] LLM episodic summarization failed, using fallback:', (err as Error).message);
    const combined = turns.map(t => t.content).join(' ');
    const topicKeywords = extractFallbackTopics(combined);
    return {
      summary: turns.slice(0, 4).map(t => `${t.role}: ${t.content.slice(0, 80)}`).join(' | '),
      preferences: [],
      watchedEntities: [],
      unresolvedTopics: [],
      topics: topicKeywords,
    };
  }
}

function extractFallbackTopics(text: string): string[] {
  const keywords = new Set<string>();
  const patterns: [RegExp, string][] = [
    [/portfolio|holdings|positions/i, 'portfolio'],
    [/goal|saving|target/i, 'goals'],
    [/market|stock|equity|bond/i, 'market'],
    [/risk|diversif|allocation/i, 'risk'],
    [/news|headline/i, 'news'],
    [/retire|pension/i, 'retirement'],
    [/real\s*estate|property/i, 'real_estate'],
  ];
  for (const [re, topic] of patterns) {
    if (re.test(text)) keywords.add(topic);
  }
  return [...keywords].slice(0, 4);
}

export async function getSemanticFacts(userId: string, limit = 10, queryText?: string): Promise<string[]> {
  if (queryText) {
    const tsQuery = queryText
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2)
      .slice(0, 6)
      .join(' | ');

    if (tsQuery) {
      const { rows } = await pool.query(
        `SELECT fact, category,
                ts_rank_cd(to_tsvector('english', fact || ' ' || category), to_tsquery('english', $3)) AS rank
         FROM semantic_facts
         WHERE user_id = $1
           AND to_tsvector('english', fact || ' ' || category) @@ to_tsquery('english', $3)
         ORDER BY rank DESC
         LIMIT $2`,
        [userId, limit, tsQuery],
      );

      if (rows.length > 0) {
        return rows.map(r => `[${r.category}] ${r.fact}`);
      }
    }
  }

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
