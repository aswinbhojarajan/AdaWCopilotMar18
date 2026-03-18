import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiPost } from './api';
import type { PollQuestion } from '../types';

export function usePolls() {
  return useQuery({
    queryKey: ['polls'],
    queryFn: () => apiFetch<PollQuestion[]>('/api/polls'),
  });
}

export function useVotePoll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pollId,
      optionId,
    }: {
      pollId: number;
      optionId: number;
    }) => apiPost<{ success: boolean }>(`/api/polls/${pollId}/vote`, { optionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
    },
  });
}
