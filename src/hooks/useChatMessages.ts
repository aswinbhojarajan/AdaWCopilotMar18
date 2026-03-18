import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';

interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function useChatMessages(threadId: string | null) {
  return useQuery({
    queryKey: ['chat', 'messages', threadId],
    queryFn: () => apiFetch<ChatMessage[]>(`/api/chat/${threadId}/messages`),
    enabled: !!threadId,
  });
}
