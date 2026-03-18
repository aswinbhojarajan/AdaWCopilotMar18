import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import type { GoalResponse } from '../types';

export function useGoals() {
  return useQuery({
    queryKey: ['wealth', 'goals'],
    queryFn: () => apiFetch<GoalResponse[]>('/api/wealth/goals'),
  });
}
