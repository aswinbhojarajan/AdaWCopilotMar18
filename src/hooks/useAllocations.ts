import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useUser } from '../contexts/UserContext';
import type { AssetAllocation } from '../types';

export function useAllocations() {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['wealth', 'allocations', userId],
    queryFn: () => apiFetch<AssetAllocation[]>('/api/wealth/allocation'),
  });
}
