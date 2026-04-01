/**
 * Twelve Data Market Provider — Ada Wealth Copilot (v2)
 *
 * Implements the MarketProvider interface for Twelve Data's REST API.
 * Covers GCC exchanges (DFM, ADX, Tadawul) and 50+ global exchanges.
 *
 * Key design decisions:
 *   - Batch /quote uses colon notation (EMAAR:DFM,FAB:ADX)
 *   - Single-symbol endpoints (/time_series, /profile) use separate
 *     ?symbol=X&exchange=Y query parameters for robustness
 *   - Returns enriched MarketQuote with display_symbol, provider_symbol,
 *     and is_delayed for LLM narration and debugging
 *   - Symbol normalization is delegated to symbolNormalizer module
 *
 * Registration in registry.ts:
 *   case 'twelve_data': return twelveDataMarketProvider;
 *
 * Required env vars:
 *   TWELVE_DATA_API_KEY       — API key from Twelve Data dashboard
 *   TWELVE_DATA_RATE_LIMIT    — Credits/min (default: 55 for Grow plan)
 *   TWELVE_DATA_IS_REALTIME   — 'true' only on Pro plan (default: 'false')
 *
 * @module twelveData
 * @see Design doc §2 — Twelve Data Provider Adapter
 */

import type {
  MarketProvider,
  MarketQuote,
  ToolResult,
  CompanyProfile,
} from './types';
import {
  toolOk,
  toolError,
  checkRateLimit,
  recordProviderSuccess,
  recordProviderFailure,
  fetchWithTimeout,
} from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';
import {
  resolveSymbol,
  resolveSymbols,
  denormalizeSymbol,
  isAlreadyQualified,
  type ResolvedSymbol,
} from './symbolNormalizer';

// ─── Configuration ───────────────────────────────────────────────────────────

const PROVIDER_NAME = 'twelve_data';
const BASE_URL = 'https://api.twelvedata.com';
const TIMEOUT_MS = 8_000;
const RATE_LIMIT = parseInt(process.env.TWELVE_DATA_RATE_LIMIT || '55', 10);
const IS_REALTIME = process.env.TWELVE_DATA_IS_REALTIME === 'true';

function getApiKey(): string | undefined {
  return process.env.TWELVE_DATA_API_KEY;
}

// ─── Core Fetch ──────────────────────────────────────────────────────────────

interface TwelveDataErrorResponse {
  code: number;
  message: string;
  status: 'error';
}

/**
 * Execute a Twelve Data API request with rate limiting, timeout, and health
 * tracking. All provider methods should use this as the sole HTTP entrypoint.
 */
async function twelveDataFetch<T = unknown>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  if (!checkRateLimit(PROVIDER_NAME, RATE_LIMIT)) {
    throw new Error(`Twelve Data rate limit exceeded (${RATE_LIMIT}/min)`);
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('TWELVE_DATA_API_KEY not configured');
  }

  const url = new URL(`${BASE_URL}/${endpoint}`);
  url.searchParams.set('apikey', apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }

  const resp = await fetchWithTimeout(url.toString(), { timeout: TIMEOUT_MS });

  if (!resp.ok) {
    recordProviderFailure(PROVIDER_NAME);
    throw new Error(`Twelve Data HTTP ${resp.status}: ${resp.statusText}`);
  }

  const data = (await resp.json()) as T | TwelveDataErrorResponse;

  // Twelve Data returns { status: 'error', code, message } on API-level errors
  if (
    data &&
    typeof data === 'object' &&
    'status' in data &&
    (data as TwelveDataErrorResponse).status === 'error'
  ) {
    recordProviderFailure(PROVIDER_NAME);
    throw new Error(
      `Twelve Data API error: ${(data as TwelveDataErrorResponse).message}`
    );
  }

  recordProviderSuccess(PROVIDER_NAME);
  return data as T;
}

// ─── Twelve Data Response Shapes ─────────────────────────────────────────────

interface TDQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
  is_market_open: boolean;
  fifty_two_week?: { low: string; high: string };
}

interface TDTimeSeries {
  meta: {
    symbol: string;
    interval: string;
    currency: string;
    exchange: string;
    type: string;
  };
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
  status: string;
}

interface TDProfile {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  employees: number;
  website: string;
  description: string;
  type: string;
  CEO: string;
  address: string;
  city: string;
  country: string;
  phone: string;
}

interface TDEarningsCalendar {
  earnings: Array<{
    symbol: string;
    name: string;
    report_date: string;
    currency: string;
    eps_estimate: number | null;
    eps_actual: number | null;
  }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a MarketQuote from a Twelve Data quote response and its resolution.
 */
function buildMarketQuote(
  q: TDQuote,
  resolved: ResolvedSymbol
): MarketQuote | null {
  if (!q || !q.close || q.close === '0') return null;

  return {
    symbol: resolved.ada_symbol,
    display_symbol: resolved.display_name,
    provider_symbol: resolved.qualified,
    price: parseFloat(q.close),
    change: parseFloat(q.change || '0'),
    change_percent: parseFloat(q.percent_change || '0'),
    volume: parseInt(q.volume || '0', 10),
    high: parseFloat(q.high || '0'),
    low: parseFloat(q.low || '0'),
    open_price: parseFloat(q.open || '0'),
    previous_close: parseFloat(q.previous_close || '0'),
    currency: resolved.currency || q.currency || 'USD',
    source_provider: PROVIDER_NAME,
    is_delayed: !IS_REALTIME,
    as_of: q.datetime || new Date().toISOString(),
  };
}

// ─── MarketProvider Implementation ───────────────────────────────────────────

export const twelveDataMarketProvider: MarketProvider = {
  name: PROVIDER_NAME,

  /**
   * Get quotes for one or more symbols.
   *
   * Uses Twelve Data batch endpoint: comma-separated colon-notated symbols
   * in a single /quote call (up to 120 symbols). This conserves rate-limit
   * slots — 15 symbols = 1 slot, not 15.
   *
   * @see Design doc §2.5 — Batch Quote Optimization
   */
  async getQuotes(symbols: string[]): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError(
        PROVIDER_NAME,
        'market_api',
        'TWELVE_DATA_API_KEY not configured',
        start
      );
    }

    try {
      // Resolve all symbols to structured format
      const resolutions = await resolveSymbols(symbols);

      // Partition into cached and uncached
      const quotes: MarketQuote[] = [];
      const uncached: { resolved: ResolvedSymbol; index: number }[] = [];

      for (let i = 0; i < resolutions.length; i++) {
        const r = resolutions[i];
        const ck = cacheKey(PROVIDER_NAME, 'quote', r.qualified);
        const cached = cacheGet<MarketQuote>(ck);
        if (cached) {
          quotes.push(cached);
        } else {
          uncached.push({ resolved: r, index: i });
        }
      }

      // Fetch uncached quotes in a single batch request
      if (uncached.length > 0) {
        // Build comma-separated qualified symbols for batch endpoint
        const symbolParam = uncached.map((u) => u.resolved.qualified).join(',');

        const data = await twelveDataFetch<
          Record<string, TDQuote> | TDQuote
        >('quote', { symbol: symbolParam });

        // Twelve Data returns a single object for 1 symbol, keyed object for batch
        const quoteMap: Record<string, TDQuote> =
          uncached.length === 1
            ? { [uncached[0].resolved.qualified]: data as TDQuote }
            : (data as Record<string, TDQuote>);

        const warnings: string[] = [];

        for (const { resolved } of uncached) {
          const q = quoteMap[resolved.qualified];
          const quote = q ? buildMarketQuote(q, resolved) : null;

          if (!quote) {
            warnings.push(`no_data:${resolved.ada_symbol}`);
            continue;
          }

          // Cache the quote
          const ck = cacheKey(PROVIDER_NAME, 'quote', resolved.qualified);
          cacheSet(ck, quote, 'quote');
          quotes.push(quote);
        }

        if (warnings.length > 0) {
          return toolOk(
            PROVIDER_NAME,
            'market_api',
            { quotes },
            start,
            warnings
          );
        }
      }

      return toolOk(PROVIDER_NAME, 'market_api', { quotes }, start);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return toolError(PROVIDER_NAME, 'market_api', msg, start);
    }
  },

  /**
   * Get historical OHLCV prices for a single symbol.
   *
   * Uses Twelve Data /time_series endpoint with separate symbol + exchange
   * parameters (not colon notation) for single-symbol robustness.
   *
   * @see Design doc §2.2 — single-symbol endpoints use separate params
   */
  async getHistoricalPrices(
    symbol: string,
    days: number = 30
  ): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError(
        PROVIDER_NAME,
        'market_api',
        'TWELVE_DATA_API_KEY not configured',
        start
      );
    }

    try {
      const resolved = await resolveSymbol(symbol);

      const ck = cacheKey(
        PROVIDER_NAME,
        'history',
        resolved.qualified,
        String(days)
      );
      const cached = cacheGet<unknown>(ck);
      if (cached) {
        return toolOk(PROVIDER_NAME, 'market_api', cached, start, [
          'cache:hit',
        ]);
      }

      // Use separate symbol + exchange params for single-symbol endpoint
      const params: Record<string, string> = {
        symbol: resolved.provider_ticker,
        interval: '1day',
        outputsize: String(Math.min(days, 5000)),
        order: 'ASC',
      };
      if (resolved.exchange) {
        params.exchange = resolved.exchange;
      }

      const data = await twelveDataFetch<TDTimeSeries>('time_series', params);

      if (!data.values || data.values.length === 0) {
        return toolError(
          PROVIDER_NAME,
          'market_api',
          `No historical data for ${symbol}`,
          start
        );
      }

      const prices = data.values.map((v) => ({
        date: v.datetime,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseInt(v.volume || '0', 10),
      }));

      const result = {
        symbol: resolved.ada_symbol,
        display_symbol: resolved.display_name,
        provider_symbol: resolved.qualified,
        currency: resolved.currency || data.meta?.currency || 'USD',
        exchange: resolved.exchange || data.meta?.exchange || '',
        interval: '1day',
        is_delayed: !IS_REALTIME,
        prices,
        source_provider: PROVIDER_NAME,
      };

      cacheSet(ck, result, 'history');
      return toolOk(PROVIDER_NAME, 'market_api', result, start);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return toolError(PROVIDER_NAME, 'market_api', msg, start);
    }
  },

  /**
   * Get company profile information.
   *
   * Uses Twelve Data /profile endpoint with separate symbol + exchange
   * parameters for single-symbol robustness.
   */
  async getCompanyProfile(symbol: string): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError(
        PROVIDER_NAME,
        'market_api',
        'TWELVE_DATA_API_KEY not configured',
        start
      );
    }

    try {
      const resolved = await resolveSymbol(symbol);

      const ck = cacheKey(PROVIDER_NAME, 'profile', resolved.qualified);
      const cached = cacheGet<unknown>(ck);
      if (cached) {
        return toolOk(PROVIDER_NAME, 'market_api', cached, start, [
          'cache:hit',
        ]);
      }

      // Use separate symbol + exchange params for single-symbol endpoint
      const params: Record<string, string> = {
        symbol: resolved.provider_ticker,
      };
      if (resolved.exchange) {
        params.exchange = resolved.exchange;
      }

      const data = await twelveDataFetch<TDProfile>('profile', params);

      const profile: CompanyProfile = {
        symbol: resolved.ada_symbol,
        display_symbol: resolved.display_name,
        provider_symbol: resolved.qualified,
        name: data.name || resolved.display_name,
        exchange: data.exchange || resolved.exchange || '',
        sector: data.sector || '',
        industry: data.industry || '',
        country: data.country || '',
        website: data.website || '',
        description: data.description || '',
        ceo: data.CEO || '',
        employees: data.employees || 0,
        source_provider: PROVIDER_NAME,
      };

      cacheSet(ck, profile, 'profile');
      return toolOk(PROVIDER_NAME, 'market_api', { profile }, start);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return toolError(PROVIDER_NAME, 'market_api', msg, start);
    }
  },

  /**
   * Get upcoming earnings calendar.
   * Uses Twelve Data /earnings_calendar endpoint.
   */
  async getEarningsCalendar(): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError(
        PROVIDER_NAME,
        'market_api',
        'TWELVE_DATA_API_KEY not configured',
        start
      );
    }

    try {
      const ck = cacheKey(PROVIDER_NAME, 'earnings_calendar');
      const cached = cacheGet<unknown>(ck);
      if (cached) {
        return toolOk(PROVIDER_NAME, 'market_api', cached, start, [
          'cache:hit',
        ]);
      }

      const data =
        await twelveDataFetch<TDEarningsCalendar>('earnings_calendar');

      const earnings = (data.earnings || []).map((e) => ({
        symbol: denormalizeSymbol(e.symbol),
        name: e.name,
        report_date: e.report_date,
        currency: e.currency,
        eps_estimate: e.eps_estimate,
        eps_actual: e.eps_actual,
        source_provider: PROVIDER_NAME,
      }));

      const result = { earnings, source_provider: PROVIDER_NAME };
      cacheSet(ck, result, 'earnings');
      return toolOk(PROVIDER_NAME, 'market_api', result, start);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return toolError(PROVIDER_NAME, 'market_api', msg, start);
    }
  },
};

export default twelveDataMarketProvider;
