import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiPost } from './api';
import { useUser } from '../contexts/UserContext';
import type { AccountResponse } from '../types';

export function useAccounts() {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['wealth', 'accounts', userId],
    queryFn: () => apiFetch<AccountResponse[]>('/api/wealth/accounts'),
  });
}

export function useAddAccount() {
  const queryClient = useQueryClient();
  const { userId } = useUser();
  return useMutation({
    mutationFn: (data: { institutionName: string; accountType: string }) =>
      apiPost<AccountResponse>('/api/wealth/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth', 'accounts', userId] });
    },
  });
}
