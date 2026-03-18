import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import type { Holding } from '../types';

export function useHoldings() {
  return useQuery({
    queryKey: ['wealth', 'holdings'],
    queryFn: () => apiFetch<Holding[]>('/api/wealth/holdings'),
  });
}
