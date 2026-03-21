import OpenAI from 'openai';
import type { Intent } from './intentClassifier';
import type { PortfolioContext } from './ragService';
import { openai } from './openaiClient';
import { resolveModel } from './modelRouter';

const MODEL = resolveModel('ada-fast');

export { openai, MODEL };

const SYSTEM_PERSONA = `You are Ada, an AI wealth copilot for a premium wealth management platform. Your personality:
- Clear, jargon-free language calibrated for sophisticated but non-technical investors
- Action-oriented: always suggest concrete next steps
- Concise but thorough: use bullet points and structured formatting
- Warm and professional tone, like a trusted advisor
- Use • for bullet points, numbered lists (1. 2. 3.) for sequential steps
- Never use markdown headers (#), bold (**), or italic (*) formatting
- Keep responses focused and under 200 words unless the user asks for detail

When discussing numbers, always use proper formatting ($X,XXX.XX for currency, X.X% for percentages).`;

export function buildSystemPrompt(
  portfolioContext: PortfolioContext,
  intent: Intent,
  episodicMemories: string[],
  semanticFacts: string[],
  chatContext?: { category: string; title: string; sourceScreen?: string },
  userProfile?: { name: string; riskLevel: string; riskScore: number },
): string {
  let prompt = SYSTEM_PERSONA;

  if (userProfile) {
    prompt += `\n\nUSER PROFILE:\nName: ${userProfile.name}\nRisk tolerance: ${userProfile.riskLevel} (score ${userProfile.riskScore}/100)\nCalibrate all investment suggestions, language, and risk framing to this ${userProfile.riskLevel} risk profile.`;
  }

  prompt += `\n\nUSER'S PORTFOLIO DATA:\n${portfolioContext.summary}`;

  if (portfolioContext.holdings) {
    prompt += `\n\nHOLDINGS:\n${portfolioContext.holdings}`;
  }
  if (portfolioContext.allocations) {
    prompt += `\n\nASSET ALLOCATION:\n${portfolioContext.allocations}`;
  }
  if (portfolioContext.goals) {
    prompt += `\n\nGOALS:\n${portfolioContext.goals}`;
  }
  if (portfolioContext.accounts) {
    prompt += `\n\nLINKED ACCOUNTS:\n${portfolioContext.accounts}`;
  }
  if (portfolioContext.recentTransactions) {
    prompt += `\n\nRECENT TRANSACTIONS:\n${portfolioContext.recentTransactions}`;
  }

  if (semanticFacts.length > 0) {
    prompt += `\n\nKNOWN USER PREFERENCES & FACTS:\n${semanticFacts.join('\n')}`;
  }

  if (episodicMemories.length > 0) {
    prompt += `\n\nPREVIOUS CONVERSATION SUMMARIES:\n${episodicMemories.join('\n')}`;
  }

  if (chatContext) {
    prompt += `\n\nCONTEXT: The user navigated here from the ${chatContext.sourceScreen || 'app'} screen, looking at "${chatContext.title}" (${chatContext.category}). Tailor your response to this context.`;
  }

  prompt += `\n\nCURRENT INTENT: ${intent}`;

  if (intent === 'scenario') {
    prompt += `\nThe user may be asking about financial scenarios. If appropriate, you can suggest using a scenario simulator by calling the show_simulator tool.`;
  }

  if (intent === 'portfolio') {
    prompt += `\nThe user is asking about their portfolio. If they ask about holdings, allocation, or performance, you can show relevant data widgets by calling the show_widget tool.`;
  }

  if (intent === 'goals') {
    prompt += `\nThe user is asking about their financial goals. You can show goal progress widgets by calling the show_widget tool.`;
  }

  return prompt;
}

const TOOLS: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'show_simulator',
      description: 'Show an interactive financial scenario simulator to the user. Use when the user wants to model retirement, investment growth, spending projections, or tax scenarios.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['retirement', 'investment', 'spending', 'tax'],
            description: 'The type of scenario simulator to show',
          },
          initialValues: {
            type: 'object',
            description: 'Initial values for the simulator sliders',
            additionalProperties: { type: 'number' },
          },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'show_widget',
      description: 'Show an embedded data widget in the chat. Use to display portfolio allocation, holdings summary, or goal progress visually.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['allocation_chart', 'holdings_summary', 'goal_progress', 'portfolio_summary'],
            description: 'The type of widget to display',
          },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'extract_user_fact',
      description: 'Extract and remember a personal fact or preference the user shared. Use when the user reveals something about themselves like life events, preferences, risk tolerance changes, or financial goals.',
      parameters: {
        type: 'object',
        properties: {
          fact: {
            type: 'string',
            description: 'The fact to remember about the user',
          },
          category: {
            type: 'string',
            enum: ['preference', 'life_event', 'financial_goal', 'risk_tolerance', 'general'],
            description: 'Category of the fact',
          },
        },
        required: ['fact', 'category'],
      },
    },
  },
];

export async function generateJsonCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: 512,
    });
    return response.choices[0]?.message?.content || '[]';
  } catch (err) {
    console.error('AI JSON generation error:', err);
    return '[]';
  }
}

export interface StreamChunk {
  type: 'text' | 'widget' | 'simulator' | 'suggested_questions' | 'done' | 'error';
  content?: string;
  widget?: { type: string };
  simulator?: { type: string; initialValues?: Record<string, number> };
  suggestedQuestions?: string[];
  tokensUsed?: number;
}

export async function* streamChatCompletion(
  systemPrompt: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[],
): AsyncGenerator<StreamChunk> {
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
  ];

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      tools: TOOLS,
      stream: true,
      max_completion_tokens: 8192,
    });

    let fullContent = '';
    const toolCalls: { id: string; name: string; arguments: string }[] = [];
    let currentToolIndex = -1;
    let totalTokens = 0;

    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        fullContent += delta.content;
        yield { type: 'text', content: delta.content };
      }

      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          if (tc.index !== undefined && tc.index !== currentToolIndex) {
            currentToolIndex = tc.index;
            toolCalls.push({
              id: tc.id || '',
              name: tc.function?.name || '',
              arguments: tc.function?.arguments || '',
            });
          } else if (tc.function?.arguments) {
            const last = toolCalls[toolCalls.length - 1];
            if (last) last.arguments += tc.function.arguments;
          }
          if (tc.function?.name && toolCalls.length > 0) {
            toolCalls[toolCalls.length - 1].name = tc.function.name;
          }
          if (tc.id && toolCalls.length > 0) {
            toolCalls[toolCalls.length - 1].id = tc.id;
          }
        }
      }

      if (chunk.usage) {
        totalTokens = chunk.usage.total_tokens;
      }
    }

    for (const tc of toolCalls) {
      try {
        const args = JSON.parse(tc.arguments);
        if (tc.name === 'show_simulator') {
          yield {
            type: 'simulator',
            simulator: { type: args.type, initialValues: args.initialValues },
          };
        } else if (tc.name === 'show_widget') {
          yield { type: 'widget', widget: { type: args.type } };
        } else if (tc.name === 'extract_user_fact') {
          yield {
            type: 'widget',
            widget: { type: `fact:${args.category}:${args.fact}` },
          };
        }
      } catch {
        // skip malformed tool call
      }
    }

    if (toolCalls.length > 0 && !fullContent) {
      const toolResults: OpenAI.ChatCompletionMessageParam[] = [
        ...messages,
        {
          role: 'assistant',
          content: null,
          tool_calls: toolCalls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.name, arguments: tc.arguments },
          })),
        },
        ...toolCalls.map(tc => ({
          role: 'tool' as const,
          tool_call_id: tc.id,
          content: JSON.stringify({ success: true, displayed: true }),
        })),
      ];

      const followUp = await openai.chat.completions.create({
        model: MODEL,
        messages: toolResults,
        stream: true,
        max_completion_tokens: 8192,
      });

      for await (const chunk of followUp) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
          yield { type: 'text', content: delta.content };
        }
        if (chunk.usage) {
          totalTokens += chunk.usage.total_tokens;
        }
      }
    }

    const suggestMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: 'Based on the conversation, generate exactly 3 short follow-up questions the user might want to ask next. Return ONLY a JSON array of 3 strings, no other text.' },
      ...conversationHistory,
      { role: 'assistant', content: fullContent },
    ];

    try {
      const suggestResponse = await openai.chat.completions.create({
        model: MODEL,
        messages: suggestMessages,
        max_completion_tokens: 256,
      });

      const suggestContent = suggestResponse.choices[0]?.message?.content || '';
      const jsonMatch = suggestContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]) as string[];
        yield { type: 'suggested_questions', suggestedQuestions: questions.slice(0, 3) };
      }
      if (suggestResponse.usage) {
        totalTokens += suggestResponse.usage.total_tokens;
      }
    } catch {
      yield { type: 'suggested_questions', suggestedQuestions: ['Tell me more', 'Show me the numbers'] };
    }

    yield { type: 'done', tokensUsed: totalTokens };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('AI service error:', message);
    yield { type: 'error', content: "I'm having trouble processing that right now. Please try again." };
    yield { type: 'done' };
  }
}
