import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import type { ChatThreadResponse } from '../types';

export function useChatThreads() {
  return useQuery({
    queryKey: ['chat', 'threads'],
    queryFn: () => apiFetch<ChatThreadResponse[]>('/api/chat/threads'),
  });
}
