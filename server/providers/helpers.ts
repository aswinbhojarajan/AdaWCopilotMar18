import type { ToolResult } from '../../shared/schemas/agent';
import { getCacheStats } from './cache';

export function toolOk(sourceName: string, sourceType: string, data: unknown, startMs: number, warnings?: string[]): ToolResult {
  const stats = getCacheStats();
  const allWarnings = [
    ...(warnings ?? []),
    `cache:hits=${stats.hits},misses=${stats.misses},size=${stats.size}`,
  ];
  return {
    status: 'ok',
    source_name: sourceName,
    source_type: sourceType,
    as_of: new Date().toISOString(),
    latency_ms: Date.now() - startMs,
    data,
    warnings: allWarnings,
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

interface HealthEntry {
  failureTimestamps: number[];
  attemptTimestamps: number[];
  successTimestamps: number[];
}

const healthCounters = new Map<string, HealthEntry>();
const HEALTH_WINDOW_MS = 300_000;
const FAILURE_RATE_THRESHOLD = 0.5;
const MIN_ATTEMPTS_FOR_DEGRADE = 5;

export function recordProviderSuccess(provider: string): void {
  const now = Date.now();
  const cutoff = now - HEALTH_WINDOW_MS;
  let entry = healthCounters.get(provider);
  if (!entry) {
    entry = { failureTimestamps: [], attemptTimestamps: [], successTimestamps: [] };
    healthCounters.set(provider, entry);
  }
  entry.attemptTimestamps = entry.attemptTimestamps.filter((t) => t > cutoff);
  entry.failureTimestamps = entry.failureTimestamps.filter((t) => t > cutoff);
  entry.successTimestamps = entry.successTimestamps.filter((t) => t > cutoff);
  entry.attemptTimestamps.push(now);
  entry.successTimestamps.push(now);
}

export function recordProviderFailure(provider: string): void {
  const now = Date.now();
  const cutoff = now - HEALTH_WINDOW_MS;
  let entry = healthCounters.get(provider);
  if (!entry) {
    entry = { failureTimestamps: [], attemptTimestamps: [], successTimestamps: [] };
    healthCounters.set(provider, entry);
  }
  entry.attemptTimestamps = entry.attemptTimestamps.filter((t) => t > cutoff);
  entry.failureTimestamps = entry.failureTimestamps.filter((t) => t > cutoff);
  entry.successTimestamps = entry.successTimestamps.filter((t) => t > cutoff);
  entry.attemptTimestamps.push(now);
  entry.failureTimestamps.push(now);
}

export function isProviderHealthy(provider: string): boolean {
  const entry = healthCounters.get(provider);
  if (!entry) return true;
  const cutoff = Date.now() - HEALTH_WINDOW_MS;
  const recentAttempts = entry.attemptTimestamps.filter((t) => t > cutoff).length;
  if (recentAttempts < MIN_ATTEMPTS_FOR_DEGRADE) return true;
  const recentFailures = entry.failureTimestamps.filter((t) => t > cutoff).length;
  return (recentFailures / recentAttempts) < FAILURE_RATE_THRESHOLD;
}

export function getProviderHealthStatus(provider: string): { healthy: boolean; attempts: number; failures: number; lastAttempt: number | null; lastFailure: number | null; lastSuccess: number | null } {
  const entry = healthCounters.get(provider);
  if (!entry) return { healthy: true, attempts: 0, failures: 0, lastAttempt: null, lastFailure: null, lastSuccess: null };
  const cutoff = Date.now() - HEALTH_WINDOW_MS;
  const recentAttempts = entry.attemptTimestamps.filter((t) => t > cutoff);
  const recentFailures = entry.failureTimestamps.filter((t) => t > cutoff);
  const recentSuccesses = entry.successTimestamps.filter((t) => t > cutoff);
  return {
    healthy: isProviderHealthy(provider),
    attempts: recentAttempts.length,
    failures: recentFailures.length,
    lastAttempt: recentAttempts.length > 0 ? Math.max(...recentAttempts) : null,
    lastFailure: recentFailures.length > 0 ? Math.max(...recentFailures) : null,
    lastSuccess: recentSuccesses.length > 0 ? Math.max(...recentSuccesses) : null,
  };
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
