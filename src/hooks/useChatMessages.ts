import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useUser } from '../contexts/UserContext';

interface ChatMessage {
  id: string;
  threadId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function useChatMessages(threadId: string | null) {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['chat', 'messages', threadId, userId],
    queryFn: () => apiFetch<ChatMessage[]>(`/api/chat/${threadId}/messages`),
    enabled: !!threadId,
  });
}
