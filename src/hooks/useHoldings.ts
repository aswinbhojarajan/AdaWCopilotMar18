import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useUser } from '../contexts/UserContext';
import type { Holding } from '../types';

export function useHoldings() {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['wealth', 'holdings', userId],
    queryFn: () => apiFetch<Holding[]>('/api/wealth/holdings'),
  });
}
