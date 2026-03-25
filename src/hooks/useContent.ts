import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useUser } from '../contexts/UserContext';
import type { DiscoverContentItem } from '../types';

interface DiscoverResponse {
  items: DiscoverContentItem[];
  nextCursor?: string;
}

export function useDiscoverContent(tab: string) {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['discover', tab, userId],
    queryFn: async () => {
      const response = await apiFetch<DiscoverResponse | DiscoverContentItem[]>(`/api/content/discover?tab=${tab}&limit=10`);
      if (Array.isArray(response)) {
        return response;
      }
      return response.items;
    },
    placeholderData: keepPreviousData,
  });
}
