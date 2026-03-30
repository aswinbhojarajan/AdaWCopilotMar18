import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PostHogProvider } from '@posthog/react';
import App from './App';
import './index.css';
import { UserProvider } from './contexts/UserContext';
import { isApiError, setSessionExpiredHandler } from './lib/ApiError';
import { initPostHog, isPostHogInitialized, getPostHogClient } from './lib/analytics';

initPostHog();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (isApiError(error) && error.status === 401) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        if (isApiError(error) && error.status === 401) {
          queryClient.setQueryData(['auth', 'session'], null);
        }
      },
    },
  },
});

setSessionExpiredHandler(() => {
  queryClient.setQueryData(['auth', 'session'], null);
  queryClient.clear();
});

const appTree = (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <App />
    </UserProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById('root')!).render(
  isPostHogInitialized() ? (
    <PostHogProvider client={getPostHogClient()}>
      {appTree}
    </PostHogProvider>
  ) : (
    appTree
  ),
);
