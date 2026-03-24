import { resilientCompletion } from './openaiClient';
import { MODEL } from './modelRouter';

export { MODEL };

export async function generateJsonCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const response = await resilientCompletion({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: 512,
    }, { timeoutMs: 10000, retries: 1, providerAlias: 'ada-fast' });
    return response.choices[0]?.message?.content || '[]';
  } catch (err) {
    console.error('AI JSON generation error:', err);
    return '[]';
  }
}
