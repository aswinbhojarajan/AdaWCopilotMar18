import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiPost } from './api';
import { useUser } from '../contexts/UserContext';
import type { PollQuestion } from '../types';

export function usePolls() {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['polls', userId],
    queryFn: () => apiFetch<PollQuestion[]>('/api/polls'),
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  return useMutation({
    mutationFn: ({
      pollId,
      optionId,
    }: {
      pollId: string;
      optionId: string;
    }) => apiPost<{ success: boolean }>(`/api/polls/${pollId}/vote`, { optionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls', userId] });
    },
  });
}
