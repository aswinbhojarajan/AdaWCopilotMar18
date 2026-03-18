import * as intentClassifier from './intentClassifier';
import * as ragService from './ragService';
import * as memoryService from './memoryService';
import * as aiService from './aiService';
import * as piiDetector from './piiDetector';
import * as contentRepo from '../repositories/contentRepository';
import type { ChatMessageRequest } from '../../shared/types';

export interface StreamEvent {
  type: 'text' | 'widget' | 'simulator' | 'suggested_questions' | 'done' | 'error';
  content?: string;
  widget?: { type: string };
  simulator?: { type: string; initialValues?: Record<string, number> };
  suggestedQuestions?: string[];
}

export async function* processMessageStream(
  userId: string,
  req: ChatMessageRequest,
): AsyncGenerator<StreamEvent> {
  const threadId = req.threadId ?? `thread-${Date.now()}`;

  const piiResult = piiDetector.scanForPii(req.message);
  const sanitizedMessage = piiResult.hasPii ? piiResult.sanitized : req.message;

  await memoryService.logAudit({
    userId,
    threadId,
    action: 'message_received',
    piiDetected: piiResult.hasPii,
    inputPreview: req.message.slice(0, 100),
  });

  const intent = intentClassifier.classifyIntent(sanitizedMessage);

  const scenarioType = intent === 'scenario'
    ? intentClassifier.getScenarioType(sanitizedMessage)
    : null;

  const [portfolioContext, episodicMemories, semanticFacts] = await Promise.all([
    ragService.buildPortfolioContext(userId, intent),
    memoryService.getEpisodicMemories(userId),
    memoryService.getSemanticFacts(userId),
  ]);

  const systemPrompt = aiService.buildSystemPrompt(
    portfolioContext,
    intent,
    episodicMemories,
    semanticFacts,
    req.context ? {
      category: req.context.category,
      title: req.context.title,
      sourceScreen: req.context.sourceScreen,
    } : undefined,
  );

  await contentRepo.ensureChatThread(userId, threadId, req.message.slice(0, 60));
  await contentRepo.insertChatMessage(threadId, 'user', req.message);

  memoryService.addToWorkingMemory(threadId, { role: 'user', content: sanitizedMessage });

  const conversationHistory = memoryService.getWorkingMemory(threadId);

  let fullResponse = '';
  const widgets: any[] = [];

  for await (const chunk of aiService.streamChatCompletion(systemPrompt, conversationHistory)) {
    if (chunk.type === 'text' && chunk.content) {
      fullResponse += chunk.content;
      yield { type: 'text', content: chunk.content };
    } else if (chunk.type === 'simulator') {
      widgets.push({ type: 'simulator', ...chunk.simulator });
      yield { type: 'simulator', simulator: chunk.simulator };
    } else if (chunk.type === 'widget') {
      if (chunk.widget?.type.startsWith('fact:')) {
        const parts = chunk.widget.type.split(':');
        const category = parts[1];
        const fact = parts.slice(2).join(':');
        try {
          await memoryService.saveSemanticFact(userId, fact, category, threadId);
        } catch {
          // ignore fact storage errors
        }
      } else {
        widgets.push(chunk.widget);
        yield { type: 'widget', widget: chunk.widget };
      }
    } else if (chunk.type === 'suggested_questions') {
      yield { type: 'suggested_questions', suggestedQuestions: chunk.suggestedQuestions };
    } else if (chunk.type === 'error') {
      yield { type: 'error', content: chunk.content };
    } else if (chunk.type === 'done') {
      await memoryService.logAudit({
        userId,
        threadId,
        action: 'response_generated',
        intent,
        model: 'gpt-5-mini',
        tokensUsed: chunk.tokensUsed,
      });
    }
  }

  if (fullResponse) {
    memoryService.addToWorkingMemory(threadId, { role: 'assistant', content: fullResponse });

    const widgetsJson = widgets.length > 0 ? JSON.stringify(widgets) : null;
    await contentRepo.insertChatMessageWithWidgets(threadId, 'assistant', fullResponse, widgetsJson);

    await contentRepo.updateThreadPreview(threadId, fullResponse.slice(0, 100));
  }

  yield { type: 'done' };
}

export function processMessageSync(
  userId: string,
  req: ChatMessageRequest,
): { threadId: string; message: { id: string; threadId: string; sender: 'assistant'; message: string; timestamp: string }; suggestedQuestions: string[] } {
  const threadId = req.threadId ?? `thread-${Date.now()}`;

  const oldChatRepo = require('../repositories/chatRepository');
  const response = oldChatRepo.findChatResponse(req.message);
  const suggestedQuestions = oldChatRepo.getSuggestedQuestions(response.message);

  return {
    threadId,
    message: {
      id: `msg-${Date.now()}`,
      threadId,
      sender: 'assistant',
      message: response.message,
      timestamp: new Date().toISOString(),
    },
    suggestedQuestions,
  };
}
