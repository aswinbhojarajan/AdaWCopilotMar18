import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useUser } from '../contexts/UserContext';
import type { HomeSummaryResponse, WealthOverviewResponse } from '../types';

export function useHomeSummary() {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['home', 'summary', userId],
    queryFn: () => apiFetch<HomeSummaryResponse>('/api/home/summary'),
  });
}

export function useWealthOverview() {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['wealth', 'overview', userId],
    queryFn: () => apiFetch<WealthOverviewResponse>('/api/wealth/overview'),
  });
}
