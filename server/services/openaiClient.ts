import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getFallbackAlias, type ProviderAlias } from './modelRouter';
import { getModelCapabilities } from './capabilityRegistry';
import { logProviderFallback } from './traceLogger';

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const anthropicClient = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const ANTHROPIC_FALLBACK_MODEL = 'claude-sonnet-4-6';

export type Provider = 'openai' | 'anthropic';

function convertRoleForAnthropic(role: string): 'user' | 'assistant' {
  if (role === 'assistant') return 'assistant';
  return 'user';
}

function extractSystemAndMessages(
  messages: OpenAI.ChatCompletionMessageParam[],
): { system: string | undefined; messages: Array<{ role: 'user' | 'assistant'; content: string }> } {
  let system: string | undefined;
  const converted: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      system = typeof msg.content === 'string' ? msg.content : '';
    } else if (msg.role === 'user' || msg.role === 'assistant') {
      const content = typeof msg.content === 'string' ? msg.content : '';
      converted.push({ role: convertRoleForAnthropic(msg.role), content });
    } else if (msg.role === 'tool') {
      converted.push({ role: 'user', content: `[Tool result]: ${typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}` });
    }
  }

  if (converted.length === 0) {
    converted.push({ role: 'user', content: 'Hello' });
  }

  return { system, messages: converted };
}

function convertToolsForAnthropic(tools: OpenAI.ChatCompletionTool[] | undefined): Array<{ name: string; description: string; input_schema: Anthropic.Messages.Tool.InputSchema }> | undefined {
  if (!tools) return undefined;
  return tools
    .filter((t): t is OpenAI.ChatCompletionTool & { type: 'function'; function: { name: string } } =>
      t.type === 'function' && 'function' in t
    )
    .map(t => ({
      name: t.function.name,
      description: t.function.description ?? '',
      input_schema: (t.function.parameters ?? { type: 'object' as const, properties: {} }) as Anthropic.Messages.Tool.InputSchema,
    }));
}

async function anthropicCompletion(
  params: OpenAI.ChatCompletionCreateParamsNonStreaming,
  timeoutMs: number,
): Promise<OpenAI.ChatCompletion> {
  const { system, messages } = extractSystemAndMessages(params.messages);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const anthropicTools = convertToolsForAnthropic(params.tools);

  try {
    const response = await anthropicClient.messages.create({
      model: ANTHROPIC_FALLBACK_MODEL,
      max_tokens: params.max_completion_tokens ?? params.max_tokens ?? 8192,
      system: system,
      messages,
      ...(params.temperature !== undefined && params.temperature !== null ? { temperature: params.temperature } : {}),
      ...(anthropicTools && anthropicTools.length > 0 ? { tools: anthropicTools } : {}),
    }, { signal: controller.signal });

    const textContent = response.content.find(c => c.type === 'text');
    const text = textContent?.type === 'text' ? textContent.text : '';

    const toolUseBlocks = response.content.filter(c => c.type === 'tool_use');
    const toolCalls = toolUseBlocks.length > 0
      ? toolUseBlocks.map((block, i) => {
          const tu = block as Anthropic.Messages.ToolUseBlock;
          return {
            id: tu.id,
            type: 'function' as const,
            function: { name: tu.name, arguments: JSON.stringify(tu.input) },
          };
        })
      : undefined;

    return {
      id: response.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: response.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: text || null,
          refusal: null,
          ...(toolCalls ? { tool_calls: toolCalls } : {}),
        },
        finish_reason: response.stop_reason === 'tool_use' ? 'tool_calls' : 'stop',
        logprobs: null,
      }],
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

async function* anthropicStreamCompletion(
  params: OpenAI.ChatCompletionCreateParamsStreaming,
  timeoutMs: number,
): AsyncGenerator<OpenAI.ChatCompletionChunk> {
  const { system, messages } = extractSystemAndMessages(params.messages);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const anthropicTools = convertToolsForAnthropic(params.tools);

  try {
    const stream = anthropicClient.messages.stream({
      model: ANTHROPIC_FALLBACK_MODEL,
      max_tokens: params.max_completion_tokens ?? params.max_tokens ?? 8192,
      system: system,
      messages,
      ...(params.temperature !== undefined && params.temperature !== null ? { temperature: params.temperature } : {}),
      ...(anthropicTools && anthropicTools.length > 0 ? { tools: anthropicTools } : {}),
    }, { signal: controller.signal });

    let inputTokens = 0;
    let outputTokens = 0;
    let toolCallIndex = -1;

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield {
          id: `chatcmpl-anthropic-${Date.now()}`,
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: ANTHROPIC_FALLBACK_MODEL,
          choices: [{
            index: 0,
            delta: { content: event.delta.text },
            finish_reason: null,
            logprobs: null,
          }],
        };
      } else if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
        toolCallIndex++;
        const block = event.content_block;
        yield {
          id: `chatcmpl-anthropic-${Date.now()}`,
          object: 'chat.completion.chunk' as const,
          created: Math.floor(Date.now() / 1000),
          model: ANTHROPIC_FALLBACK_MODEL,
          choices: [{
            index: 0,
            delta: {
              tool_calls: [{
                index: toolCallIndex,
                id: block.id,
                type: 'function' as const,
                function: { name: block.name, arguments: '' },
              }],
            },
            finish_reason: null,
            logprobs: null,
          }],
        };
      } else if (event.type === 'content_block_delta' && event.delta.type === 'input_json_delta') {
        yield {
          id: `chatcmpl-anthropic-${Date.now()}`,
          object: 'chat.completion.chunk' as const,
          created: Math.floor(Date.now() / 1000),
          model: ANTHROPIC_FALLBACK_MODEL,
          choices: [{
            index: 0,
            delta: {
              tool_calls: [{
                index: toolCallIndex,
                function: { arguments: event.delta.partial_json },
              }],
            },
            finish_reason: null,
            logprobs: null,
          }],
        };
      } else if (event.type === 'message_delta') {
        outputTokens = (event as unknown as { usage?: { output_tokens?: number } }).usage?.output_tokens ?? outputTokens;
      } else if (event.type === 'message_start') {
        const msg = (event as unknown as { message?: { usage?: { input_tokens?: number } } }).message;
        inputTokens = msg?.usage?.input_tokens ?? 0;
      }
    }

    yield {
      id: `chatcmpl-anthropic-${Date.now()}`,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: ANTHROPIC_FALLBACK_MODEL,
      choices: [{
        index: 0,
        delta: {},
        finish_reason: 'stop',
        logprobs: null,
      }],
      usage: {
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
      },
    };
  } finally {
    clearTimeout(timer);
  }
}

function isProviderError(err: unknown): boolean {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status: number }).status;
    if (status >= 429 || status === 0) return true;
  }

  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('timeout') ||
      msg.includes('abort') ||
      msg.includes('econnrefused') ||
      msg.includes('econnreset') ||
      msg.includes('enotfound') ||
      msg.includes('socket hang up') ||
      msg.includes('fetch failed') ||
      msg.includes('network') ||
      msg.includes('429') ||
      msg.includes('500') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('504') ||
      msg.includes('rate limit') ||
      msg.includes('service unavailable') ||
      msg.includes('internal server error')
    );
  }
  return false;
}

function getFallbackAliasFromRouter(alias: string): ProviderAlias | null {
  return getFallbackAlias(alias as ProviderAlias);
}

async function tryOpenAIWithRetries(
  params: OpenAI.ChatCompletionCreateParamsNonStreaming,
  timeoutMs: number,
  retries: number,
): Promise<{ result?: OpenAI.ChatCompletion; lastError?: unknown }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const result = await openai.chat.completions.create(params, {
        signal: controller.signal,
      });
      return { result };
    } catch (err) {
      if (attempt === retries) {
        return { lastError: err };
      }
      console.log(`[resilientCompletion] Attempt ${attempt} failed, retrying...`);
    } finally {
      clearTimeout(timer);
    }
  }
  return { lastError: new Error('All retry attempts failed') };
}

export async function resilientCompletion(
  params: OpenAI.ChatCompletionCreateParamsNonStreaming,
  options?: { timeoutMs?: number; retries?: number; providerAlias?: string },
): Promise<OpenAI.ChatCompletion> {
  const { timeoutMs = 15000, retries = 2, providerAlias } = options ?? {};

  const primaryStart = Date.now();
  const primary = await tryOpenAIWithRetries(params, timeoutMs, retries);
  if (primary.result) return primary.result;

  const primaryFailReason = (primary.lastError as Error)?.message ?? 'unknown';

  if (!isProviderError(primary.lastError)) {
    console.error(`[resilientCompletion] Non-transient error after ${retries} attempts, not falling back:`, primaryFailReason);
    throw primary.lastError;
  }

  if (!providerAlias) {
    const switchStart = Date.now();
    console.log(`[resilientCompletion] No providerAlias, falling back directly to Anthropic...`);
    try {
      const result = await anthropicCompletion(params, timeoutMs);
      logProviderFallback({ failedProvider: params.model, replacementProvider: 'anthropic', failureReason: primaryFailReason, switchCostMs: Date.now() - switchStart, modelRequested: params.model, modelServed: 'claude-sonnet-4-6' });
      return result;
    } catch (fallbackErr) {
      console.error(`[resilientCompletion] Anthropic fallback failed:`, (fallbackErr as Error).message);
      throw primary.lastError;
    }
  }

  let currentAlias: string | null = providerAlias;
  while (currentAlias) {
    const fallbackAlias = getFallbackAliasFromRouter(currentAlias);
    if (!fallbackAlias) break;

    const switchStart = Date.now();

    if (fallbackAlias === 'ada-fallback') {
      console.log(`[resilientCompletion] Trying Anthropic fallback (${fallbackAlias})...`);
      try {
        const result = await anthropicCompletion(params, timeoutMs);
        logProviderFallback({ failedProvider: currentAlias, replacementProvider: fallbackAlias, failureReason: primaryFailReason, switchCostMs: Date.now() - switchStart, modelRequested: params.model, modelServed: 'claude-sonnet-4-6' });
        return result;
      } catch (fallbackErr) {
        console.error(`[resilientCompletion] Fallback (${fallbackAlias}) failed:`, (fallbackErr as Error).message);
        currentAlias = fallbackAlias;
        continue;
      }
    }

    const fallbackModel = getModelCapabilities(fallbackAlias)?.model;
    if (fallbackModel) {
      console.log(`[resilientCompletion] Trying OpenAI fallback (${fallbackAlias} → ${fallbackModel})...`);
      const fallbackResult = await tryOpenAIWithRetries(
        { ...params, model: fallbackModel },
        timeoutMs,
        1,
      );
      if (fallbackResult.result) {
        logProviderFallback({ failedProvider: currentAlias, replacementProvider: fallbackAlias, failureReason: primaryFailReason, switchCostMs: Date.now() - switchStart, modelRequested: params.model, modelServed: fallbackModel });
        return fallbackResult.result;
      }
      console.error(`[resilientCompletion] Fallback (${fallbackAlias}) failed, continuing chain...`);
    }
    currentAlias = fallbackAlias;
  }

  throw primary.lastError;
}

export async function resilientStreamCompletion(
  params: OpenAI.ChatCompletionCreateParamsStreaming,
  options?: { timeoutMs?: number; providerAlias?: string },
): Promise<AsyncIterable<OpenAI.ChatCompletionChunk>> {
  const { timeoutMs = 15000, providerAlias } = options ?? {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const stream = await openai.chat.completions.create(params, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return stream;
  } catch (err) {
    clearTimeout(timer);
    if (!isProviderError(err)) throw err;

    const failReason = (err as Error)?.message ?? 'unknown';

    if (!providerAlias) {
      const switchStart = Date.now();
      console.log(`[resilientStreamCompletion] No providerAlias, falling back directly to Anthropic...`);
      try {
        const fallbackStream = anthropicStreamCompletion(params, timeoutMs);
        logProviderFallback({ failedProvider: params.model, replacementProvider: 'anthropic', failureReason: failReason, switchCostMs: Date.now() - switchStart, modelRequested: params.model, modelServed: 'claude-sonnet-4-6' });
        return fallbackStream;
      } catch (fallbackErr) {
        console.error(`[resilientStreamCompletion] Anthropic fallback failed:`, (fallbackErr as Error).message);
        throw err;
      }
    }

    let currentAlias: string | null = providerAlias;
    while (currentAlias) {
      const fallbackAlias = getFallbackAliasFromRouter(currentAlias);
      if (!fallbackAlias) break;

      const switchStart = Date.now();

      if (fallbackAlias === 'ada-fallback') {
        console.log(`[resilientStreamCompletion] Trying Anthropic fallback (${fallbackAlias})...`);
        try {
          const fallbackStream = anthropicStreamCompletion(params, timeoutMs);
          logProviderFallback({ failedProvider: currentAlias, replacementProvider: fallbackAlias, failureReason: failReason, switchCostMs: Date.now() - switchStart, modelRequested: params.model, modelServed: 'claude-sonnet-4-6' });
          return fallbackStream;
        } catch (fallbackErr) {
          console.error(`[resilientStreamCompletion] Fallback (${fallbackAlias}) failed:`, (fallbackErr as Error).message);
          currentAlias = fallbackAlias;
          continue;
        }
      }

      const fallbackModel = getModelCapabilities(fallbackAlias)?.model;
      if (fallbackModel) {
        console.log(`[resilientStreamCompletion] Trying OpenAI fallback (${fallbackAlias} → ${fallbackModel})...`);
        const fallbackController = new AbortController();
        const fallbackTimer = setTimeout(() => fallbackController.abort(), timeoutMs);
        try {
          const stream = await openai.chat.completions.create(
            { ...params, model: fallbackModel },
            { signal: fallbackController.signal },
          );
          clearTimeout(fallbackTimer);
          logProviderFallback({ failedProvider: currentAlias, replacementProvider: fallbackAlias, failureReason: failReason, switchCostMs: Date.now() - switchStart, modelRequested: params.model, modelServed: fallbackModel });
          return stream;
        } catch (fallbackErr) {
          clearTimeout(fallbackTimer);
          console.error(`[resilientStreamCompletion] Fallback (${fallbackAlias}) failed, continuing chain...`);
        }
      }
      currentAlias = fallbackAlias;
    }

    throw err;
  }
}

export async function* withChunkTimeout<T>(
  stream: AsyncIterable<T>,
  chunkTimeoutMs: number = 30000,
  totalTimeoutMs: number = 120000,
): AsyncGenerator<T> {
  const startTime = Date.now();
  const iterator = stream[Symbol.asyncIterator]();

  while (true) {
    if (Date.now() - startTime > totalTimeoutMs) {
      throw new Error(`Stream total timeout exceeded (${totalTimeoutMs}ms)`);
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        iterator.next(),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Stream chunk timeout (${chunkTimeoutMs}ms without data)`)), chunkTimeoutMs);
        }),
      ]);
      if (timer !== undefined) clearTimeout(timer);

      if (result.done) break;
      yield result.value;
    } catch (err) {
      if (timer !== undefined) clearTimeout(timer);
      throw err;
    }
  }
}

export { anthropicClient, ANTHROPIC_FALLBACK_MODEL };
