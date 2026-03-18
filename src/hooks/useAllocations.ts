import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import type { AssetAllocation } from '../types';

export function useAllocations() {
  return useQuery({
    queryKey: ['wealth', 'allocations'],
    queryFn: () => apiFetch<AssetAllocation[]>('/api/wealth/allocation'),
  });
}
