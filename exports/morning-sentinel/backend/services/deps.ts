/**
 * Consumer-provided dependency stubs for morningSentinelService.
 * Original sources:
 *   - pool: server/db/pool.ts
 *   - MODEL: server/services/modelRouter.ts
 *   - resilientCompletion / resilientStreamCompletion: server/services/openaiClient.ts
 *
 * Replace the implementations below with your own before using.
 */
import type { Pool } from 'pg';

/**
 * PostgreSQL connection pool.
 * Must be a `pg.Pool` instance connected to your database.
 */
export declare const pool: Pool;

/**
 * LLM model identifier (e.g., 'gpt-4o-mini').
 */
export declare const MODEL: string;

interface CompletionParams {
  model: string;
  messages: { role: string; content: string }[];
  max_completion_tokens: number;
  stream?: boolean;
  stream_options?: { include_usage: boolean };
}

interface CompletionOptions {
  timeoutMs: number;
  retries?: number;
  providerAlias?: string;
}

interface ChatCompletion {
  choices: { message: { content: string } }[];
}

interface ChatCompletionChunk {
  choices: { delta: { content?: string } }[];
}

/**
 * Non-streaming OpenAI-compatible completion call with retry/fallback logic.
 */
export declare function resilientCompletion(
  params: CompletionParams,
  options: CompletionOptions,
): Promise<ChatCompletion>;

/**
 * Streaming OpenAI-compatible completion call with retry/fallback logic.
 * Returns an async iterable of chunks.
 */
export declare function resilientStreamCompletion(
  params: CompletionParams,
  options: CompletionOptions,
): Promise<AsyncIterable<ChatCompletionChunk>>;
