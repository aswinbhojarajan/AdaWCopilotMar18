import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { apiFetch } from './hooks/api';
import type { MorningSentinelResponse } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

queryClient.prefetchQuery({
  queryKey: ['morning-sentinel'],
  queryFn: () => apiFetch<MorningSentinelResponse>('/api/morning-sentinel'),
  staleTime: 4 * 60 * 60 * 1000,
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
