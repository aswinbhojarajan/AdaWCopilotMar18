import type { IdentityProvider } from './types';
import type { ToolResult } from '../../shared/schemas/agent';
import { toolOk, toolError, checkRateLimit, recordProviderSuccess, recordProviderFailure, fetchWithTimeout } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';
import pool from '../db/pool';

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

interface ResolvedInstrument {
  query: string;
  figi: string;
  composite_figi: string;
  ticker: string;
  name: string;
  exchange: string;
  security_type: string;
  market_sector: string;
  source_provider: string;
  as_of: string;
  persisted_to_db: boolean;
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

async function persistToInstruments(resolved: ResolvedInstrument): Promise<boolean> {
  try {
    const ticker = resolved.ticker?.toUpperCase();
    if (!ticker) return false;

    await pool.query(
      `UPDATE instruments SET figi = $1, exchange = COALESCE(exchange, $2)
       WHERE UPPER(symbol) = $3 AND (figi IS NULL OR figi = '')`,
      [resolved.figi, resolved.exchange, ticker],
    );

    const isin = resolved.query?.match(/^[A-Z]{2}[A-Z0-9]{9}\d$/)?.[0];
    if (isin) {
      await pool.query(
        `UPDATE instruments SET isin = $1 WHERE UPPER(symbol) = $2 AND (isin IS NULL OR isin = '')`,
        [isin, ticker],
      );
    }

    return true;
  } catch (err) {
    console.warn(`OpenFIGI: failed to persist instrument ${resolved.ticker}: ${err instanceof Error ? err.message : 'unknown'}`);
    return false;
  }
}

async function checkDbCache(query: string): Promise<ResolvedInstrument | null> {
  try {
    const upper = query.trim().toUpperCase();
    const { rows } = await pool.query(
      `SELECT symbol, name, figi, isin, exchange FROM instruments
       WHERE UPPER(symbol) = $1 OR isin = $1 OR figi = $1
       LIMIT 1`,
      [upper],
    );
    if (rows.length === 0 || !rows[0].figi) return null;
    const r = rows[0];
    return {
      query,
      figi: r.figi,
      composite_figi: r.figi,
      ticker: r.symbol,
      name: r.name,
      exchange: r.exchange ?? '',
      security_type: '',
      market_sector: '',
      source_provider: 'openfigi_db_cache',
      as_of: new Date().toISOString(),
      persisted_to_db: true,
    };
  } catch {
    return null;
  }
}

export const openFigiIdentityProvider: IdentityProvider = {
  name: 'openfigi',

  async resolveInstrument(query: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const ck = cacheKey('openfigi', 'resolve', query.toUpperCase());
      const cached = cacheGet<ResolvedInstrument>(ck);
      if (cached) return toolOk('openfigi', 'identity_api', cached.data, start, ['cache_hit:memory']);

      const dbCached = await checkDbCache(query);
      if (dbCached) {
        cacheSet(ck, dbCached, 'identity');
        return toolOk('openfigi', 'identity_api', dbCached, start, ['cache_hit:db']);
      }

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
      const resolved: ResolvedInstrument = {
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
        persisted_to_db: false,
      };

      const persisted = await persistToInstruments(resolved);
      resolved.persisted_to_db = persisted;

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
      const resolvedFromCache: Array<{ query: string; data: ResolvedInstrument }> = [];
      const toFetch: Array<{ index: number; mapping: FigiMapping; query: string }> = [];

      for (let i = 0; i < queries.length; i++) {
        const ck = cacheKey('openfigi', 'resolve', queries[i].toUpperCase());
        const cached = cacheGet<ResolvedInstrument>(ck);
        if (cached) {
          resolvedFromCache.push({ query: queries[i], data: cached.data });
          continue;
        }
        const dbCached = await checkDbCache(queries[i]);
        if (dbCached) {
          cacheSet(ck, dbCached, 'identity');
          resolvedFromCache.push({ query: queries[i], data: dbCached });
          continue;
        }
        toFetch.push({ index: i, mapping: mappings[i], query: queries[i] });
      }

      const freshResults: Array<{ query: string; data: ResolvedInstrument }> = [];
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
          const resolved: ResolvedInstrument = {
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
            persisted_to_db: false,
          };
          const persisted = await persistToInstruments(resolved);
          resolved.persisted_to_db = persisted;
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
