import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';
import type {
  GoalResponse,
  GoalHealthScoreResponse,
  LifeGapPromptResponse,
  LifeEventSuggestionResponse,
  LifeEventType,
} from '../types';

export function useGoals() {
  return useQuery({
    queryKey: ['wealth', 'goals'],
    queryFn: () => apiFetch<GoalResponse[]>('/api/wealth/goals'),
  });
}

export function useGoalHealthScore() {
  return useQuery({
    queryKey: ['wealth', 'goals', 'health-score'],
    queryFn: () => apiFetch<GoalHealthScoreResponse>('/api/wealth/goals/health-score'),
  });
}

export function useLifeGapPrompts() {
  return useQuery({
    queryKey: ['wealth', 'goals', 'life-gaps'],
    queryFn: () => apiFetch<LifeGapPromptResponse[]>('/api/wealth/goals/life-gaps'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDismissLifeGapPrompt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promptKey: string) =>
      apiFetch<{ success: boolean }>('/api/wealth/goals/life-gaps/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptKey }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth', 'goals', 'life-gaps'] });
    },
  });
}

export function useLifeEventSuggestions() {
  return useMutation({
    mutationFn: (eventType: LifeEventType) =>
      apiFetch<LifeEventSuggestionResponse[]>('/api/wealth/goals/life-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType }),
      }),
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goal: { title: string; targetAmount: number; deadline: string; iconName: string; color: string }) =>
      apiFetch<GoalResponse>('/api/wealth/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wealth', 'goals'] });
      queryClient.invalidateQueries({ queryKey: ['wealth', 'goals', 'health-score'] });
    },
  });
}
