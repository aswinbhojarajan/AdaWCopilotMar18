import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { UserProvider } from './contexts/UserContext';
import { isApiError, setSessionExpiredHandler } from './lib/ApiError';

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

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <App />
    </UserProvider>
  </QueryClientProvider>,
);
