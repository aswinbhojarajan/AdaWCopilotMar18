import type { MacroProvider } from './types';
import type { ToolResult, MacroIndicator } from '../../shared/schemas/agent';
import { toolOk, toolError, checkRateLimit, recordProviderSuccess, recordProviderFailure, fetchWithTimeout } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';

const API_BASE = 'https://api.stlouisfed.org/fred';
const RATE_LIMIT = 100;

const SERIES_META: Record<string, { name: string; unit: string; category: string; frequency: string }> = {
  FEDFUNDS: { name: 'Federal Funds Rate', unit: 'percent', category: 'interest_rates', frequency: 'daily' },
  DGS10: { name: '10-Year Treasury Yield', unit: 'percent', category: 'interest_rates', frequency: 'daily' },
  DGS2: { name: '2-Year Treasury Yield', unit: 'percent', category: 'interest_rates', frequency: 'daily' },
  CPIAUCSL: { name: 'Consumer Price Index (All Urban)', unit: 'index_1982_100', category: 'inflation', frequency: 'monthly' },
  UNRATE: { name: 'Unemployment Rate', unit: 'percent', category: 'labor', frequency: 'monthly' },
  GDP: { name: 'Gross Domestic Product', unit: 'billions_usd', category: 'output', frequency: 'quarterly' },
  GDPC1: { name: 'Real GDP Growth Rate', unit: 'percent_change', category: 'output', frequency: 'quarterly' },
  T10Y2Y: { name: '10Y-2Y Treasury Spread', unit: 'percent', category: 'interest_rates', frequency: 'daily' },
  DTWEXBGS: { name: 'US Dollar Index (Broad)', unit: 'index', category: 'fx', frequency: 'daily' },
  VIXCLS: { name: 'CBOE Volatility Index (VIX)', unit: 'index', category: 'volatility', frequency: 'daily' },
  DCOILBRENTEU: { name: 'Brent Crude Oil Price', unit: 'usd_per_barrel', category: 'commodities', frequency: 'daily' },
  GOLDAMGBD228NLBM: { name: 'Gold Price (London Fix)', unit: 'usd_per_troy_oz', category: 'commodities', frequency: 'daily' },
  UMCSENT: { name: 'Consumer Sentiment Index', unit: 'index_1966_100', category: 'sentiment', frequency: 'monthly' },
  BAMLH0A0HYM2: { name: 'US High Yield Spread', unit: 'percent', category: 'credit', frequency: 'daily' },
  WALCL: { name: 'Fed Balance Sheet Total Assets', unit: 'billions_usd', category: 'monetary_policy', frequency: 'weekly' },
};

function getApiKey(): string {
  return process.env.FRED_API_KEY ?? '';
}

async function fredFetch(path: string, params: Record<string, string> = {}): Promise<unknown> {
  if (!checkRateLimit('fred', RATE_LIMIT)) {
    throw new Error('FRED rate limit exceeded');
  }
  const key = getApiKey();
  const qs = new URLSearchParams({ ...params, api_key: key, file_type: 'json' }).toString();
  const url = `${API_BASE}${path}?${qs}`;
  const resp = await fetchWithTimeout(url, { timeout: 10000 });
  if (!resp.ok) {
    throw new Error(`FRED HTTP ${resp.status}: ${resp.statusText}`);
  }
  const data = await resp.json();
  recordProviderSuccess('fred');
  return data;
}

function buildSummary(seriesId: string, value: number, date: string): string {
  const meta = SERIES_META[seriesId.toUpperCase()];
  if (!meta) return `${seriesId}: ${value} (as of ${date})`;
  if (meta.unit === 'percent') return `${meta.name}: ${value}% (as of ${date})`;
  if (meta.unit === 'index') return `${meta.name}: ${value} (as of ${date})`;
  if (meta.unit.includes('usd')) return `${meta.name}: $${value.toLocaleString()} (as of ${date})`;
  return `${meta.name}: ${value} ${meta.unit} (as of ${date})`;
}

async function fetchSeries(seriesId: string): Promise<MacroIndicator> {
  const upper = seriesId.toUpperCase();
  const ck = cacheKey('fred', 'series', upper);
  const cached = cacheGet<MacroIndicator>(ck);
  if (cached) return cached.data;

  const data = await fredFetch('/series/observations', {
    series_id: upper,
    sort_order: 'desc',
    limit: '5',
  }) as { observations?: Array<{ date: string; value: string }> };

  const obs = data.observations?.filter((o) => o.value !== '.');
  if (!obs || obs.length === 0) {
    throw new Error(`No observations for series ${upper}`);
  }

  const latest = obs[0];
  const value = parseFloat(latest.value);
  const meta = SERIES_META[upper];

  const indicator: MacroIndicator = {
    series_id: upper,
    name: meta?.name ?? upper,
    value,
    unit: meta?.unit ?? 'unknown',
    date: latest.date,
    frequency: meta?.frequency,
    source_provider: 'fred',
    as_of: new Date().toISOString(),
    summary: buildSummary(upper, value, latest.date),
  };

  const ttl = meta?.frequency === 'daily' ? 14_400_000 : 86_400_000;
  cacheSet(ck, indicator, 'macro_series', ttl);
  return indicator;
}

export const fredMacroProvider: MacroProvider = {
  name: 'fred',

  async getIndicator(seriesId: string): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError('fred', 'macro_api', 'FRED_API_KEY not configured', start);
    }
    try {
      const indicator = await fetchSeries(seriesId);
      return toolOk('fred', 'macro_api', indicator, start);
    } catch (error) {
      recordProviderFailure('fred');
      return toolError('fred', 'macro_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getMultipleIndicators(seriesIds: string[]): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError('fred', 'macro_api', 'FRED_API_KEY not configured', start);
    }
    try {
      const results = await Promise.allSettled(seriesIds.map((id) => fetchSeries(id)));
      const indicators: MacroIndicator[] = [];
      const warnings: string[] = [];
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === 'fulfilled') {
          indicators.push(r.value);
        } else {
          warnings.push(`${seriesIds[i]}: ${r.reason?.message ?? 'fetch failed'}`);
        }
      }
      if (indicators.length === 0) {
        recordProviderFailure('fred');
        return toolError('fred', 'macro_api', warnings.join('; '), start);
      }
      return toolOk('fred', 'macro_api', indicators, start, warnings.length > 0 ? warnings : undefined);
    } catch (error) {
      recordProviderFailure('fred');
      return toolError('fred', 'macro_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getAvailableIndicators(): Promise<ToolResult> {
    const start = Date.now();
    const list = Object.entries(SERIES_META).map(([id, data]) => ({
      id,
      name: data.name,
      category: data.category,
    }));
    return toolOk('fred', 'macro_api', list, start);
  },
};
