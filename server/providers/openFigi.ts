import type { IdentityProvider } from './types';
import type { ToolResult } from '../../shared/schemas/agent';
import { toolOk, toolError, checkRateLimit, recordProviderSuccess, recordProviderFailure, fetchWithTimeout } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';

const API_URL = 'https://api.openfigi.com/v3/mapping';
const RATE_LIMIT = 20;

interface FigiMapping {
  idType: string;
  idValue: string;
}

interface FigiResult {
  figi: string;
  name: string;
  ticker: string;
  exchCode: string;
  compositeFIGI: string;
  securityType: string;
  marketSector: string;
}

function detectIdType(query: string): FigiMapping {
  const trimmed = query.trim().toUpperCase();
  if (/^[A-Z]{2}[A-Z0-9]{9}\d$/.test(trimmed)) {
    return { idType: 'ID_ISIN', idValue: trimmed };
  }
  if (/^[0-9A-Z]{9}$/.test(trimmed)) {
    return { idType: 'ID_CUSIP', idValue: trimmed };
  }
  if (/^BBG[A-Z0-9]{9}$/.test(trimmed)) {
    return { idType: 'ID_BB_GLOBAL', idValue: trimmed };
  }
  return { idType: 'TICKER', idValue: trimmed };
}

async function figiResolve(mappings: FigiMapping[]): Promise<Array<{ data?: FigiResult[]; error?: string }>> {
  if (!checkRateLimit('openfigi', RATE_LIMIT)) {
    throw new Error('OpenFIGI rate limit exceeded');
  }

  const body = mappings.map((m) => ({
    idType: m.idType,
    idValue: m.idValue,
  }));

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const apiKey = process.env.OPENFIGI_API_KEY;
  if (apiKey) {
    headers['X-OPENFIGI-APIKEY'] = apiKey;
  }

  const resp = await fetchWithTimeout(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    timeout: 10000,
  });

  if (!resp.ok) {
    throw new Error(`OpenFIGI HTTP ${resp.status}: ${resp.statusText}`);
  }

  const data = await resp.json();
  recordProviderSuccess('openfigi');
  return data as Array<{ data?: FigiResult[]; error?: string }>;
}

export const openFigiIdentityProvider: IdentityProvider = {
  name: 'openfigi',

  async resolveInstrument(query: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const ck = cacheKey('openfigi', 'resolve', query.toUpperCase());
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('openfigi', 'identity_api', cached.data, start, ['cache_hit']);

      const mapping = detectIdType(query);
      const results = await figiResolve([mapping]);

      if (!results[0] || results[0].error) {
        return toolError('openfigi', 'identity_api', results[0]?.error ?? 'No match found', start);
      }

      const matches = results[0].data ?? [];
      if (matches.length === 0) {
        return toolError('openfigi', 'identity_api', `No instrument found for ${query}`, start);
      }

      const best = matches[0];
      const resolved = {
        query,
        figi: best.figi,
        composite_figi: best.compositeFIGI,
        ticker: best.ticker,
        name: best.name,
        exchange: best.exchCode,
        security_type: best.securityType,
        market_sector: best.marketSector,
        source_provider: 'openfigi',
        as_of: new Date().toISOString(),
      };

      cacheSet(ck, resolved, 'identity');
      return toolOk('openfigi', 'identity_api', resolved, start);
    } catch (error) {
      recordProviderFailure('openfigi');
      return toolError('openfigi', 'identity_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async resolveMultiple(queries: string[]): Promise<ToolResult> {
    const start = Date.now();
    try {
      const mappings = queries.map(detectIdType);
      const resolvedFromCache: Array<{ query: string; data: unknown }> = [];
      const toFetch: Array<{ index: number; mapping: FigiMapping; query: string }> = [];

      for (let i = 0; i < queries.length; i++) {
        const ck = cacheKey('openfigi', 'resolve', queries[i].toUpperCase());
        const cached = cacheGet<unknown>(ck);
        if (cached) {
          resolvedFromCache.push({ query: queries[i], data: cached.data });
        } else {
          toFetch.push({ index: i, mapping: mappings[i], query: queries[i] });
        }
      }

      const freshResults: Array<{ query: string; data: unknown }> = [];
      const warnings: string[] = [];

      if (toFetch.length > 0) {
        const results = await figiResolve(toFetch.map((f) => f.mapping));
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          const q = toFetch[i].query;
          if (r.error || !r.data || r.data.length === 0) {
            warnings.push(`${q}: ${r.error ?? 'no match'}`);
            continue;
          }
          const best = r.data[0];
          const resolved = {
            query: q,
            figi: best.figi,
            composite_figi: best.compositeFIGI,
            ticker: best.ticker,
            name: best.name,
            exchange: best.exchCode,
            security_type: best.securityType,
            market_sector: best.marketSector,
            source_provider: 'openfigi',
            as_of: new Date().toISOString(),
          };
          const ck = cacheKey('openfigi', 'resolve', q.toUpperCase());
          cacheSet(ck, resolved, 'identity');
          freshResults.push({ query: q, data: resolved });
        }
      }

      const all = [...resolvedFromCache, ...freshResults];
      return toolOk('openfigi', 'identity_api', all.map((r) => r.data), start, warnings.length > 0 ? warnings : undefined);
    } catch (error) {
      recordProviderFailure('openfigi');
      return toolError('openfigi', 'identity_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};
