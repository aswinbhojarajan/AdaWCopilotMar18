import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import type { AlertResponse } from '../types';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<AlertResponse[]>('/api/notifications'),
  });
}
