const STORAGE_KEY = 'ada-active-user-id';
const DEFAULT_USER_ID = 'user-aisha';

export function getActiveUserId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_USER_ID;
  } catch {
    return DEFAULT_USER_ID;
  }
}

function withUserHeaders(options?: RequestInit): RequestInit {
  const userId = getActiveUserId();
  const existing = options?.headers;
  if (!existing || typeof existing === 'object' && !(existing instanceof Headers) && !Array.isArray(existing)) {
    return { ...options, headers: { ...(existing as Record<string, string> | undefined), 'X-User-ID': userId } };
  }
  if (existing instanceof Headers) {
    existing.set('X-User-ID', userId);
    return { ...options, headers: existing };
  }
  return { ...options, headers: { 'X-User-ID': userId } };
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, withUserHeaders(options));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, withUserHeaders({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function getStreamHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-User-ID': getActiveUserId(),
  };
}
