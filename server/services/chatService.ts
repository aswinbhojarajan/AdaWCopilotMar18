import * as intentClassifier from './intentClassifier';
import * as memoryService from './memoryService';
import { orchestrateStream } from './agentOrchestrator';
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
  yield* orchestrateStream(userId, req);
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
