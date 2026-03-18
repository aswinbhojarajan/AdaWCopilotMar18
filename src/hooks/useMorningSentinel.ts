import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';
import type { MorningSentinelResponse } from '../types';

const SENTINEL_KEY = ['morning-sentinel'];

export function useMorningSentinel() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SENTINEL_KEY,
    queryFn: () => apiFetch<MorningSentinelResponse>('/api/morning-sentinel'),
    staleTime: 4 * 60 * 60 * 1000,
    gcTime: 4 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const forceRefresh = async () => {
    queryClient.removeQueries({ queryKey: SENTINEL_KEY });
    return queryClient.fetchQuery({
      queryKey: SENTINEL_KEY,
      queryFn: () => apiFetch<MorningSentinelResponse>('/api/morning-sentinel?refresh=true'),
    });
  };

  return { ...query, forceRefresh };
}
