import type { FxProvider } from './types';
import type { ToolResult } from '../../shared/schemas/agent';
import { toolOk, toolError, recordProviderSuccess, recordProviderFailure, fetchWithTimeout } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';

const API_BASE = 'https://api.frankfurter.app';

async function frankfurterFetch(path: string): Promise<unknown> {
  const resp = await fetchWithTimeout(`${API_BASE}${path}`, { timeout: 8000 });
  if (!resp.ok) {
    throw new Error(`Frankfurter HTTP ${resp.status}: ${resp.statusText}`);
  }
  const data = await resp.json();
  recordProviderSuccess('frankfurter');
  return data;
}

export const frankfurterFxProvider: FxProvider = {
  name: 'frankfurter',

  async getRate(base: string, target: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const b = base.toUpperCase();
      const t = target.toUpperCase();
      const ck = cacheKey('frankfurter', 'rate', b, t);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('frankfurter', 'fx_api', cached.data, start, ['cache_hit']);

      const data = await frankfurterFetch(`/latest?from=${b}&to=${t}`) as {
        base: string;
        date: string;
        rates: Record<string, number>;
      };

      const rate = data.rates[t];
      if (rate === undefined) {
        return toolError('frankfurter', 'fx_api', `No rate found for ${b}→${t}`, start);
      }

      const result = {
        base: b,
        target: t,
        rate,
        date: data.date,
        source_label: 'ECB reference rates',
        source_provider: 'frankfurter',
        as_of: new Date().toISOString(),
      };

      cacheSet(ck, result, 'fx_rate');
      return toolOk('frankfurter', 'fx_api', result, start);
    } catch (error) {
      recordProviderFailure('frankfurter');
      return toolError('frankfurter', 'fx_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getRates(base: string, targets: string[]): Promise<ToolResult> {
    const start = Date.now();
    try {
      const b = base.toUpperCase();
      const ts = targets.map((t) => t.toUpperCase());
      const ck = cacheKey('frankfurter', 'rates', b, ts.join(','));
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('frankfurter', 'fx_api', cached.data, start, ['cache_hit']);

      const data = await frankfurterFetch(`/latest?from=${b}&to=${ts.join(',')}`) as {
        base: string;
        date: string;
        rates: Record<string, number>;
      };

      const result = {
        base: b,
        rates: data.rates,
        date: data.date,
        source_label: 'ECB reference rates',
        source_provider: 'frankfurter',
        as_of: new Date().toISOString(),
      };

      cacheSet(ck, result, 'fx_rate');
      return toolOk('frankfurter', 'fx_api', result, start);
    } catch (error) {
      recordProviderFailure('frankfurter');
      return toolError('frankfurter', 'fx_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getHistoricalRate(base: string, target: string, date: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const b = base.toUpperCase();
      const t = target.toUpperCase();
      const ck = cacheKey('frankfurter', 'hist', b, t, date);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('frankfurter', 'fx_api', cached.data, start, ['cache_hit']);

      const data = await frankfurterFetch(`/${date}?from=${b}&to=${t}`) as {
        base: string;
        date: string;
        rates: Record<string, number>;
      };

      const rate = data.rates[t];
      if (rate === undefined) {
        return toolError('frankfurter', 'fx_api', `No historical rate for ${b}→${t} on ${date}`, start);
      }

      const result = {
        base: b,
        target: t,
        rate,
        date: data.date,
        source_label: 'ECB reference rates (historical)',
        source_provider: 'frankfurter',
        as_of: new Date().toISOString(),
      };

      cacheSet(ck, result, 'fx_rate', 86_400_000);
      return toolOk('frankfurter', 'fx_api', result, start);
    } catch (error) {
      recordProviderFailure('frankfurter');
      return toolError('frankfurter', 'fx_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};
