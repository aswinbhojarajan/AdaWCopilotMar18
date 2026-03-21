import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useUser } from '../contexts/UserContext';
import type { AlertResponse } from '../types';

export function useNotifications() {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => apiFetch<AlertResponse[]>('/api/notifications'),
  });
}
