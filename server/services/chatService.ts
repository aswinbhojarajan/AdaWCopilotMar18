import * as intentClassifier from './intentClassifier';
import * as ragService from './ragService';
import * as memoryService from './memoryService';
import * as aiService from './aiService';
import * as piiDetector from './piiDetector';
import * as contentRepo from '../repositories/contentRepository';
import * as userRepo from '../repositories/userRepository';
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
    inputPreview: piiResult.hasPii ? piiResult.sanitized.slice(0, 100) : req.message.slice(0, 100),
  });

  const intent = intentClassifier.classifyIntent(sanitizedMessage);

  const [portfolioContext, episodicMemories, semanticFacts, userProfile] = await Promise.all([
    ragService.buildPortfolioContext(userId, intent),
    memoryService.getEpisodicMemories(userId),
    memoryService.getSemanticFacts(userId, 10, sanitizedMessage),
    userRepo.findUserById(userId),
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
    userProfile ? {
      name: `${userProfile.firstName} ${userProfile.lastName}`,
      riskLevel: userProfile.riskProfile.level,
      riskScore: userProfile.riskProfile.score,
    } : undefined,
  );

  await contentRepo.ensureChatThread(userId, threadId, req.message.slice(0, 60));
  await contentRepo.insertChatMessage(threadId, 'user', req.message);

  memoryService.addToWorkingMemory(threadId, { role: 'user', content: sanitizedMessage });

  const conversationHistory = memoryService.getWorkingMemory(threadId);

  let fullResponse = '';
  const widgets: { type: string }[] = [];

  for await (const chunk of aiService.streamChatCompletion(systemPrompt, conversationHistory)) {
    if (chunk.type === 'text' && chunk.content) {
      fullResponse += chunk.content;
      yield { type: 'text', content: chunk.content };
    } else if (chunk.type === 'simulator') {
      widgets.push({ type: 'simulator', ...chunk.simulator });
      yield { type: 'simulator', simulator: chunk.simulator };
    } else if (chunk.type === 'widget' && chunk.widget) {
      if (chunk.widget.type.startsWith('fact:')) {
        const parts = chunk.widget.type.split(':');
        const category = parts[1];
        const fact = parts.slice(2).join(':');
        try {
          await memoryService.saveSemanticFact(userId, fact, category, threadId);
        } catch {
          // episodic save is best-effort
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

  const workingMem = memoryService.getWorkingMemory(threadId);
  if (workingMem.length >= 10) {
    try {
      const topics = intentClassifier.extractTopics(workingMem.map(t => t.content).join(' '));
      const summary = workingMem
        .slice(0, 6)
        .map(t => `${t.role}: ${t.content.slice(0, 80)}`)
        .join(' | ');
      await memoryService.saveEpisodicMemory(userId, threadId, summary, topics);
    } catch {
      // episodic save is best-effort
    }
  }

  yield { type: 'done' };
}

export async function processMessageSync(
  userId: string,
  req: ChatMessageRequest,
): Promise<{ threadId: string; message: { id: string; threadId: string; sender: 'assistant'; message: string; timestamp: string }; suggestedQuestions: string[] }> {
  const threadId = req.threadId ?? `thread-${Date.now()}`;

  let fullResponse = '';
  let suggestedQuestions: string[] = [];

  for await (const event of processMessageStream(userId, { ...req, threadId })) {
    if (event.type === 'text' && event.content) {
      fullResponse += event.content;
    } else if (event.type === 'suggested_questions' && event.suggestedQuestions) {
      suggestedQuestions = event.suggestedQuestions;
    }
  }

  return {
    threadId,
    message: {
      id: `msg-${Date.now()}`,
      threadId,
      sender: 'assistant',
      message: fullResponse || "I'm here to help with your portfolio. What would you like to know?",
      timestamp: new Date().toISOString(),
    },
    suggestedQuestions,
  };
}

export async function finalizeSession(userId: string, threadId: string): Promise<void> {
  const workingMem = memoryService.getWorkingMemory(threadId);

  if (workingMem.length >= 2) {
    try {
      const conversationText = workingMem.map(t => t.content).join(' ');
      const topics = intentClassifier.extractTopics(conversationText);
      const summary = workingMem
        .map(t => `${t.role}: ${t.content.slice(0, 100)}`)
        .join(' | ');
      await memoryService.saveEpisodicMemory(userId, threadId, summary, topics);
    } catch {
      // episodic save is best-effort
    }
  }

  memoryService.clearWorkingMemory(threadId);

  await memoryService.logAudit({
    userId,
    threadId,
    action: 'session_closed',
  });
}
