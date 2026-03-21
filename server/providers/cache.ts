interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  cachedAt: string;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTLS: Record<string, number> = {
  quote: 120_000,
  company_profile: 86_400_000,
  macro_series: 14_400_000,
  fx_rate: 3_600_000,
  filing: 86_400_000,
  news: 900_000,
  identity: 86_400_000,
};

let hits = 0;
let misses = 0;

export interface CacheResult<T> {
  data: T;
  cachedAt: string;
  cacheHit: true;
}

export function cacheGet<T>(key: string): CacheResult<T> | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    misses++;
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    misses++;
    return null;
  }
  hits++;
  return { data: entry.data, cachedAt: entry.cachedAt, cacheHit: true };
}

export function cacheSet<T>(key: string, data: T, dataType?: string, ttlMs?: number): void {
  const ttl = ttlMs ?? DEFAULT_TTLS[dataType ?? ''] ?? 300_000;
  store.set(key, {
    data,
    expiresAt: Date.now() + ttl,
    cachedAt: new Date().toISOString(),
  });
}

export function cacheKey(provider: string, ...parts: (string | number | undefined)[]): string {
  return `${provider}:${parts.filter(Boolean).join(':')}`;
}

export function getCacheStats(): { hits: number; misses: number; size: number; hit_rate: string } {
  const total = hits + misses;
  return {
    hits,
    misses,
    size: store.size,
    hit_rate: total > 0 ? `${Math.round((hits / total) * 100)}%` : 'N/A',
  };
}

export function cacheMetadataWarnings(): string[] {
  const stats = getCacheStats();
  return [`cache_stats:hits=${stats.hits},misses=${stats.misses},size=${stats.size},rate=${stats.hit_rate}`];
}

export function clearCache(): void {
  store.clear();
  hits = 0;
  misses = 0;
}
