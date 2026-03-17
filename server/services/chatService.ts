import * as chatRepo from '../repositories/chatRepository';
import type { ChatMessageRequest, ChatMessageResponse, ChatMessage } from '../../shared/types';

export function processMessage(_userId: string, req: ChatMessageRequest): ChatMessageResponse {
  const response = chatRepo.findChatResponse(req.message);
  const threadId = req.threadId ?? `thread-${Date.now()}`;

  const assistantMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    threadId,
    sender: 'assistant',
    message: response.message,
    timestamp: new Date().toISOString(),
  };

  const suggestedQuestions = chatRepo.getSuggestedQuestions(response.message);

  return {
    threadId,
    message: assistantMessage,
    suggestedQuestions,
  };
}
