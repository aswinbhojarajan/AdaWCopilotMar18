import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import type { DiscoverContentItem } from '../types';

export function useDiscoverContent(tab: string) {
  return useQuery({
    queryKey: ['discover', tab],
    queryFn: () =>
      apiFetch<DiscoverContentItem[]>(`/api/content/discover?tab=${tab}`),
  });
}
