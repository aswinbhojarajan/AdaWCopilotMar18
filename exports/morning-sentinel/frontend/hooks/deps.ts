/**
 * Consumer-provided dependency stubs for useMorningSentinel hook.
 * Original sources:
 *   - apiFetch / getStreamHeaders: src/hooks/api.ts
 *   - useUser: src/contexts/UserContext.tsx
 *
 * Replace the implementations below with your own before using.
 */

/**
 * Authenticated JSON fetch wrapper.
 * Must handle auth headers/cookies and throw on non-200 responses.
 */
export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * Returns headers for SSE streaming requests (e.g., Authorization token).
 */
export function getStreamHeaders(): Record<string, string> {
  return {};
}

/**
 * Returns the current authenticated user's ID.
 * Replace with your own React context hook.
 */
export function useUser(): { userId: string } {
  throw new Error('useUser must be implemented by the consumer');
}

/**
 * Optional: 401 error handler for SSE streams.
 * Called when the sentinel stream returns a 401 status.
 * In Ada, this triggers a redirect to the login page.
 */
export function handleAuthError(_response: Response): void {
  // Implement your auth error handling (e.g., redirect to login)
}
