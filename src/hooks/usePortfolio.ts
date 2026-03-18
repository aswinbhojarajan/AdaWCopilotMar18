import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import type { HomeSummaryResponse, WealthOverviewResponse } from '../types';

export function useHomeSummary() {
  return useQuery({
    queryKey: ['home', 'summary'],
    queryFn: () => apiFetch<HomeSummaryResponse>('/api/home/summary'),
  });
}

export function useWealthOverview() {
  return useQuery({
    queryKey: ['wealth', 'overview'],
    queryFn: () => apiFetch<WealthOverviewResponse>('/api/wealth/overview'),
  });
}
