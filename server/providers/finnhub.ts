import type { MarketProvider, NewsProvider } from './types';
import type { ToolResult, MarketQuote } from '../../shared/schemas/agent';
import { toolOk, toolError, toolPartial, checkRateLimit, recordProviderSuccess, recordProviderFailure, fetchWithTimeout } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';

const API_BASE = 'https://finnhub.io/api/v1';
const RATE_LIMIT = 55;

function getApiKey(): string {
  return process.env.FINNHUB_API_KEY ?? '';
}

function finnhubUrl(path: string, params: Record<string, string> = {}): string {
  const key = getApiKey();
  const qs = new URLSearchParams({ ...params, token: key }).toString();
  return `${API_BASE}${path}?${qs}`;
}

async function finnhubFetch(path: string, params: Record<string, string> = {}): Promise<unknown> {
  if (!checkRateLimit('finnhub', RATE_LIMIT)) {
    throw new Error('Finnhub rate limit exceeded (55/min free tier)');
  }
  const url = finnhubUrl(path, params);
  const resp = await fetchWithTimeout(url, { timeout: 8000 });
  if (!resp.ok) {
    throw new Error(`Finnhub HTTP ${resp.status}: ${resp.statusText}`);
  }
  const data = await resp.json();
  recordProviderSuccess('finnhub');
  return data;
}

export const finnhubMarketProvider: MarketProvider = {
  name: 'finnhub',

  async getQuotes(symbols: string[]): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError('finnhub', 'market_api', 'FINNHUB_API_KEY not configured', start);
    }
    try {
      const quotes: MarketQuote[] = [];
      const warnings: string[] = [];

      const results = await Promise.allSettled(
        symbols.map(async (sym) => {
          const upper = sym.toUpperCase();
          const ck = cacheKey('finnhub', 'quote', upper);
          const cached = cacheGet<MarketQuote>(ck);
          if (cached) return cached.data;

          const data = await finnhubFetch('/quote', { symbol: upper }) as Record<string, number>;
          if (!data || data.c === 0 || data.c === undefined) {
            throw new Error(`No quote data for ${upper}`);
          }

          const quote: MarketQuote = {
            symbol: upper,
            price: data.c,
            change: data.d ?? 0,
            change_percent: data.dp ?? 0,
            high: data.h,
            low: data.l,
            open: data.o,
            previous_close: data.pc,
            currency: 'USD',
            source_provider: 'finnhub',
            as_of: new Date().toISOString(),
          };
          cacheSet(ck, quote, 'quote');
          return quote;
        }),
      );

      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        if (r.status === 'fulfilled') {
          quotes.push(r.value);
        } else {
          warnings.push(`${symbols[i]}: ${r.reason?.message ?? 'fetch failed'}`);
        }
      }

      if (quotes.length === 0 && warnings.length > 0) {
        recordProviderFailure('finnhub');
        return toolError('finnhub', 'market_api', warnings.join('; '), start);
      }
      if (warnings.length > 0) {
        return toolPartial('finnhub', 'market_api', quotes, start, warnings);
      }
      return toolOk('finnhub', 'market_api', quotes, start);
    } catch (error) {
      recordProviderFailure('finnhub');
      return toolError('finnhub', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getHistoricalPrices(symbol: string, days: number): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError('finnhub', 'market_api', 'FINNHUB_API_KEY not configured', start);
    }
    try {
      const upper = symbol.toUpperCase();
      const ck = cacheKey('finnhub', 'candle', upper, days);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('finnhub', 'market_api', cached.data, start, ['cache_hit']);

      const to = Math.floor(Date.now() / 1000);
      const from = to - days * 86400;
      const resolution = days <= 7 ? '60' : 'D';

      const data = await finnhubFetch('/stock/candle', {
        symbol: upper,
        resolution,
        from: String(from),
        to: String(to),
      }) as Record<string, unknown>;

      if (data.s === 'no_data') {
        return toolError('finnhub', 'market_api', `No historical data for ${upper}`, start);
      }

      const closePrices = data.c as number[];
      const timestamps = data.t as number[];
      const prices = closePrices.map((close: number, i: number) => ({
        date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
        close,
      }));

      const result = { symbol: upper, prices };
      cacheSet(ck, result, 'quote', 300_000);
      return toolOk('finnhub', 'market_api', result, start);
    } catch (error) {
      recordProviderFailure('finnhub');
      return toolError('finnhub', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getCompanyProfile(symbol: string): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError('finnhub', 'market_api', 'FINNHUB_API_KEY not configured', start);
    }
    try {
      const upper = symbol.toUpperCase();
      const ck = cacheKey('finnhub', 'profile', upper);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('finnhub', 'market_api', cached.data, start, ['cache_hit:memory']);

      const data = await finnhubFetch('/stock/profile2', { symbol: upper }) as Record<string, unknown>;
      if (!data || !data.name) {
        return toolError('finnhub', 'market_api', `No profile data for ${upper}`, start);
      }

      const profile = {
        symbol: upper,
        name: data.name,
        country: data.country,
        currency: data.currency,
        exchange: data.exchange,
        ipo_date: data.ipo,
        market_cap: data.marketCapitalization,
        shares_outstanding: data.shareOutstanding,
        industry: data.finnhubIndustry,
        logo: data.logo,
        weburl: data.weburl,
        phone: data.phone,
        source_provider: 'finnhub',
        as_of: new Date().toISOString(),
      };

      cacheSet(ck, profile, 'company_profile');
      return toolOk('finnhub', 'market_api', profile, start);
    } catch (error) {
      recordProviderFailure('finnhub');
      return toolError('finnhub', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getEarningsCalendar(symbol?: string): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError('finnhub', 'market_api', 'FINNHUB_API_KEY not configured', start);
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const ck = cacheKey('finnhub', 'earnings', symbol ?? 'all', today);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('finnhub', 'market_api', cached.data, start, ['cache_hit:memory']);

      const params: Record<string, string> = { from: today, to: futureDate };
      if (symbol) params.symbol = symbol.toUpperCase();

      const data = await finnhubFetch('/calendar/earnings', params) as {
        earningsCalendar?: Array<Record<string, unknown>>;
      };

      const calendar = (data.earningsCalendar ?? []).map((item) => ({
        symbol: item.symbol,
        date: item.date,
        hour: item.hour,
        eps_estimate: item.epsEstimate,
        eps_actual: item.epsActual,
        revenue_estimate: item.revenueEstimate,
        revenue_actual: item.revenueActual,
        quarter: item.quarter,
        year: item.year,
        source_provider: 'finnhub',
      }));

      cacheSet(ck, calendar, 'news', 3_600_000);
      return toolOk('finnhub', 'market_api', calendar, start);
    } catch (error) {
      recordProviderFailure('finnhub');
      return toolError('finnhub', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};

export const finnhubNewsProvider: NewsProvider = {
  name: 'finnhub',

  async getHoldingsRelevantNews(symbols: string[], limit = 5): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError('finnhub', 'news_api', 'FINNHUB_API_KEY not configured', start);
    }
    try {
      const allNews: unknown[] = [];
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

      const fetchResults = await Promise.allSettled(
        symbols.slice(0, 5).map(async (sym) => {
          const upper = sym.toUpperCase();
          const ck = cacheKey('finnhub', 'company-news', upper);
          const cached = cacheGet<unknown[]>(ck);
          if (cached) return cached.data;

          const data = await finnhubFetch('/company-news', {
            symbol: upper,
            from: weekAgo,
            to: today,
          }) as Array<Record<string, unknown>>;

          const mapped = (data || []).slice(0, limit).map((item) => ({
            headline: item.headline,
            summary: item.summary,
            source: item.source,
            url: item.url,
            datetime: item.datetime ? new Date((item.datetime as number) * 1000).toISOString() : undefined,
            symbol: upper,
            category: item.category,
            source_provider: 'finnhub',
          }));
          cacheSet(ck, mapped, 'news');
          return mapped;
        }),
      );

      const newsWarnings: string[] = [];
      for (let i = 0; i < fetchResults.length; i++) {
        const r = fetchResults[i];
        if (r.status === 'fulfilled') {
          allNews.push(...(r.value as unknown[]));
        } else {
          newsWarnings.push(`${symbols[i]}: ${r.reason?.message ?? 'fetch failed'}`);
        }
      }

      if (allNews.length === 0 && newsWarnings.length > 0) {
        recordProviderFailure('finnhub');
        return toolError('finnhub', 'news_api', `No news fetched: ${newsWarnings.join('; ')}`, start);
      }
      if (allNews.length === 0) {
        return toolOk('finnhub', 'news_api', [], start, ['No news found for given symbols']);
      }
      return toolOk('finnhub', 'news_api', allNews.slice(0, limit * 2), start, newsWarnings.length > 0 ? newsWarnings : undefined);
    } catch (error) {
      recordProviderFailure('finnhub');
      return toolError('finnhub', 'news_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getLatestNews(limit = 10): Promise<ToolResult> {
    const start = Date.now();
    if (!getApiKey()) {
      return toolError('finnhub', 'news_api', 'FINNHUB_API_KEY not configured', start);
    }
    try {
      const ck = cacheKey('finnhub', 'general-news');
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('finnhub', 'news_api', cached.data, start, ['cache_hit']);

      const data = await finnhubFetch('/news', { category: 'general' }) as Array<Record<string, unknown>>;
      const mapped = (data || []).slice(0, limit).map((item) => ({
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url,
        datetime: item.datetime ? new Date((item.datetime as number) * 1000).toISOString() : undefined,
        category: item.category,
        source_provider: 'finnhub',
      }));
      cacheSet(ck, mapped, 'news');
      return toolOk('finnhub', 'news_api', mapped, start);
    } catch (error) {
      recordProviderFailure('finnhub');
      return toolError('finnhub', 'news_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getNewsByTag(tag: string, limit = 10): Promise<ToolResult> {
    return this.getLatestNews(limit);
  },

  async searchNews(query: string, limit = 10): Promise<ToolResult> {
    return this.getLatestNews(limit);
  },
};
