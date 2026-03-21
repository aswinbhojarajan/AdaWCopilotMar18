import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useUser } from '../contexts/UserContext';
import type { ChatThreadResponse } from '../types';

export function useChatThreads() {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['chat', 'threads', userId],
    queryFn: () => apiFetch<ChatThreadResponse[]>('/api/chat/threads'),
  });
}
