import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { apiFetch } from './api';
import { useUser } from '../contexts/UserContext';
import type { DiscoverContentItem } from '../types';

interface DiscoverPageResponse {
  items: DiscoverContentItem[];
  nextCursor?: string;
}

export function useDiscoverContent(tab: string) {
  const { userId } = useUser();
  return useQuery({
    queryKey: ['discover', tab, userId],
    queryFn: () =>
      apiFetch<DiscoverContentItem[]>(`/api/content/discover?tab=${tab}`),
    placeholderData: keepPreviousData,
  });
}

export function useDiscoverContentPaginated(tab: string, pageSize = 5) {
  const { userId } = useUser();
  return useInfiniteQuery({
    queryKey: ['discover-paginated', tab, userId],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const params = new URLSearchParams({ tab, limit: String(pageSize) });
      if (pageParam) params.set('cursor', pageParam);
      return apiFetch<DiscoverPageResponse>(`/api/content/discover?${params.toString()}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: DiscoverPageResponse) => lastPage.nextCursor,
  });
}
