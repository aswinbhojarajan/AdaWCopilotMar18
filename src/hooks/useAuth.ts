import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  persona: string | null;
  avatarUrl: string | null;
  mockTier: string | null;
  mockConfig: Record<string, unknown>;
}

export function useSession() {
  return useQuery<AuthUser | null>({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const { ApiError } = await import('../lib/ApiError');
        throw new ApiError(body.error || 'Login failed', res.status);
      }
      return res.json() as Promise<AuthUser>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'session'], data);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Logout failed');
      }
    },
    onSettled: () => {
      queryClient.setQueryData(['auth', 'session'], null);
      queryClient.clear();
    },
  });
}
