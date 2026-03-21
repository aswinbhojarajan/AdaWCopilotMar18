import type { ToolResult } from '../../shared/schemas/agent';

export function toolOk(sourceName: string, sourceType: string, data: unknown, startMs: number, warnings?: string[]): ToolResult {
  return {
    status: 'ok',
    source_name: sourceName,
    source_type: sourceType,
    as_of: new Date().toISOString(),
    latency_ms: Date.now() - startMs,
    data,
    ...(warnings && warnings.length > 0 ? { warnings } : {}),
  };
}

export function toolError(sourceName: string, sourceType: string, error: string, startMs: number): ToolResult {
  return {
    status: 'error',
    source_name: sourceName,
    source_type: sourceType,
    as_of: new Date().toISOString(),
    latency_ms: Date.now() - startMs,
    data: null,
    error,
  };
}

export function toolPartial(sourceName: string, sourceType: string, data: unknown, startMs: number, warnings: string[]): ToolResult {
  return {
    status: 'partial',
    source_name: sourceName,
    source_type: sourceType,
    as_of: new Date().toISOString(),
    latency_ms: Date.now() - startMs,
    data,
    warnings,
  };
}

const rateLimitCounters = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(provider: string, max: number, windowMs: number = 60_000): boolean {
  const now = Date.now();
  let entry = rateLimitCounters.get(provider);
  if (!entry || now - entry.windowStart > windowMs) {
    entry = { count: 0, windowStart: now };
    rateLimitCounters.set(provider, entry);
  }
  if (entry.count >= max) {
    return false;
  }
  entry.count++;
  return true;
}

const healthCounters = new Map<string, { timestamps: number[] }>();
const HEALTH_WINDOW_MS = 300_000;
const FAILURE_THRESHOLD = 5;

export function recordProviderSuccess(provider: string): void {
  const entry = healthCounters.get(provider);
  if (entry) {
    const cutoff = Date.now() - HEALTH_WINDOW_MS;
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
  }
}

export function recordProviderFailure(provider: string): void {
  const now = Date.now();
  let entry = healthCounters.get(provider);
  if (!entry) {
    entry = { timestamps: [] };
    healthCounters.set(provider, entry);
  }
  const cutoff = now - HEALTH_WINDOW_MS;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
  entry.timestamps.push(now);
}

export function isProviderHealthy(provider: string): boolean {
  const entry = healthCounters.get(provider);
  if (!entry) return true;
  const cutoff = Date.now() - HEALTH_WINDOW_MS;
  const recentFailures = entry.timestamps.filter((t) => t > cutoff).length;
  return recentFailures < FAILURE_THRESHOLD;
}

export async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout = 10_000, ...fetchOpts } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...fetchOpts, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}
