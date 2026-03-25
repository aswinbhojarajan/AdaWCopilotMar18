import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useUser } from '../contexts/UserContext';
import type { DiscoverContentItem } from '../types';

export function useDiscoverContent(tab: string) {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['discover', tab, userId],
    queryFn: () =>
      apiFetch<DiscoverContentItem[]>(`/api/content/discover?tab=${tab}`),
    placeholderData: keepPreviousData,
  });
}
