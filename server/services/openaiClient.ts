import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
      if (attempt === retries) throw err;
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
    throw err;
  }
}
