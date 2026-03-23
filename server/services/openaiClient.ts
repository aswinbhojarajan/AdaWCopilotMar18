import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

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

async function anthropicCompletion(
  params: OpenAI.ChatCompletionCreateParamsNonStreaming,
  timeoutMs: number,
): Promise<OpenAI.ChatCompletion> {
  const { system, messages } = extractSystemAndMessages(params.messages);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await anthropicClient.messages.create({
      model: ANTHROPIC_FALLBACK_MODEL,
      max_tokens: params.max_completion_tokens ?? params.max_tokens ?? 8192,
      system: system,
      messages,
    }, { signal: controller.signal });

    const textContent = response.content.find(c => c.type === 'text');
    const text = textContent?.type === 'text' ? textContent.text : '';

    return {
      id: response.id,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: response.model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content: text, refusal: null },
        finish_reason: response.stop_reason === 'end_turn' ? 'stop' : 'stop',
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

  try {
    const stream = anthropicClient.messages.stream({
      model: ANTHROPIC_FALLBACK_MODEL,
      max_tokens: params.max_completion_tokens ?? params.max_tokens ?? 8192,
      system: system,
      messages,
    }, { signal: controller.signal });

    let inputTokens = 0;
    let outputTokens = 0;

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
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('timeout') ||
      msg.includes('abort') ||
      msg.includes('econnrefused') ||
      msg.includes('econnreset') ||
      msg.includes('socket hang up') ||
      msg.includes('429') ||
      msg.includes('500') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('rate limit')
    );
  }
  return false;
}

export async function resilientCompletion(
  params: OpenAI.ChatCompletionCreateParamsNonStreaming,
  options?: { timeoutMs?: number; retries?: number },
): Promise<OpenAI.ChatCompletion> {
  const { timeoutMs = 15000, retries = 2 } = options ?? {};

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await openai.chat.completions.create(params, {
        signal: controller.signal,
      });
      return result;
    } catch (err) {
      if (attempt === retries) {
        console.log(`[resilientCompletion] OpenAI failed after ${retries} attempts, trying Anthropic fallback...`);
        try {
          const result = await anthropicCompletion(params, timeoutMs);
          console.log('[resilientCompletion] Anthropic fallback succeeded');
          return result;
        } catch (fallbackErr) {
          console.error('[resilientCompletion] Anthropic fallback also failed:', (fallbackErr as Error).message);
          throw err;
        }
      }
      console.log(`[resilientCompletion] Attempt ${attempt} failed, retrying...`);
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error('All retry attempts failed');
}

export async function resilientStreamCompletion(
  params: OpenAI.ChatCompletionCreateParamsStreaming,
  options?: { timeoutMs?: number },
): Promise<AsyncIterable<OpenAI.ChatCompletionChunk>> {
  const { timeoutMs = 15000 } = options ?? {};
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
    if (isProviderError(err)) {
      console.log('[resilientStreamCompletion] OpenAI failed, trying Anthropic fallback...');
      try {
        const toolFreeParams = { ...params };
        delete (toolFreeParams as Record<string, unknown>).tools;
        delete (toolFreeParams as Record<string, unknown>).tool_choice;

        const fallbackStream = anthropicStreamCompletion(toolFreeParams, timeoutMs);
        console.log('[resilientStreamCompletion] Anthropic fallback initiated');
        return fallbackStream;
      } catch (fallbackErr) {
        console.error('[resilientStreamCompletion] Anthropic fallback also failed:', (fallbackErr as Error).message);
      }
    }
    throw err;
  }
}

export { anthropicClient, ANTHROPIC_FALLBACK_MODEL };
