import { openai } from './openaiClient';

const MODERATION_MODEL = 'omni-moderation-latest';

export interface ModerationResult {
  flagged: boolean;
  categories: Record<string, boolean>;
  scores: Record<string, number>;
  latencyMs: number;
  model: string;
  error?: string;
}

export async function moderateInput(text: string): Promise<ModerationResult> {
  return runModeration(text);
}

export async function moderateOutput(text: string): Promise<ModerationResult> {
  return runModeration(text);
}

async function runModeration(text: string): Promise<ModerationResult> {
  const start = Date.now();
  try {
    const response = await openai.moderations.create({
      model: MODERATION_MODEL,
      input: text,
    });

    const result = response.results[0];
    const categories: Record<string, boolean> = {};
    const scores: Record<string, number> = {};

    for (const [key, value] of Object.entries(result.categories)) {
      categories[key] = value as boolean;
    }
    for (const [key, value] of Object.entries(result.category_scores)) {
      scores[key] = value as number;
    }

    return {
      flagged: result.flagged,
      categories,
      scores,
      latencyMs: Date.now() - start,
      model: MODERATION_MODEL,
    };
  } catch (err) {
    console.error('[ModerationService] API error, passing through:', (err as Error).message);
    return {
      flagged: false,
      categories: {},
      scores: {},
      latencyMs: Date.now() - start,
      model: MODERATION_MODEL,
      error: (err as Error).message,
    };
  }
}
