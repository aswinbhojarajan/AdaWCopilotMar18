import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiPost } from './api';
import type { AccountResponse } from '../types';

export function useAccounts() {
  return useQuery({
    queryKey: ['wealth', 'accounts'],
    queryFn: () => apiFetch<AccountResponse[]>('/api/wealth/accounts'),
  });
}

export function useAddAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { institutionName: string; accountType: string }) =>
      apiPost<AccountResponse>('/api/wealth/accounts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth', 'accounts'] });
    },
  });
}
