import type { MarketProvider, NewsProvider } from './types';
import type { ToolResult, MarketQuote } from '../../shared/schemas/agent';
import { toolOk, toolError, toolPartial, checkRateLimit, recordProviderSuccess, recordProviderFailure } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';

const RATE_LIMIT = 100;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _yf: any = null;

async function getYf() {
  if (_yf) return _yf;
  const mod = await import('yahoo-finance2');
  _yf = mod.default;
  return _yf;
}

export const yahooFinanceMarketProvider: MarketProvider = {
  name: 'yahoo_finance',

  async getQuotes(symbols: string[]): Promise<ToolResult> {
    const start = Date.now();
    if (!checkRateLimit('yahoo_finance', RATE_LIMIT)) {
      return toolError('yahoo_finance', 'market_api', 'Yahoo Finance rate limit exceeded', start);
    }
    try {
      const yf = await getYf();
      const quotes: MarketQuote[] = [];
      const warnings: string[] = [];

      const results = await Promise.allSettled(
        symbols.map(async (sym) => {
          const upper = sym.toUpperCase();
          const ck = cacheKey('yahoo_finance', 'quote', upper);
          const cached = cacheGet<MarketQuote>(ck);
          if (cached) return cached.data;

          const data = await yf.quote(upper) as Record<string, unknown>;
          if (!data || !data.regularMarketPrice) {
            throw new Error(`No quote data for ${upper}`);
          }

          const quote: MarketQuote = {
            symbol: upper,
            price: data.regularMarketPrice as number,
            change: (data.regularMarketChange as number) ?? 0,
            change_percent: (data.regularMarketChangePercent as number) ?? 0,
            high: data.regularMarketDayHigh as number | undefined,
            low: data.regularMarketDayLow as number | undefined,
            open: data.regularMarketOpen as number | undefined,
            previous_close: data.regularMarketPreviousClose as number | undefined,
            currency: (data.currency as string) ?? 'USD',
            source_provider: 'yahoo_finance',
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
        recordProviderFailure('yahoo_finance');
        return toolError('yahoo_finance', 'market_api', warnings.join('; '), start);
      }

      recordProviderSuccess('yahoo_finance');
      if (warnings.length > 0) {
        return toolPartial('yahoo_finance', 'market_api', quotes, start, warnings);
      }
      return toolOk('yahoo_finance', 'market_api', quotes, start);
    } catch (error) {
      recordProviderFailure('yahoo_finance');
      return toolError('yahoo_finance', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getHistoricalPrices(symbol: string, days: number): Promise<ToolResult> {
    const start = Date.now();
    if (!checkRateLimit('yahoo_finance', RATE_LIMIT)) {
      return toolError('yahoo_finance', 'market_api', 'Yahoo Finance rate limit exceeded', start);
    }
    try {
      const yf = await getYf();
      const upper = symbol.toUpperCase();
      const ck = cacheKey('yahoo_finance', 'historical', upper, days);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('yahoo_finance', 'market_api', cached.data, start, ['cache_hit']);

      const period1 = new Date(Date.now() - days * 86400000);
      const interval = days <= 7 ? '1h' : '1d';

      const data = await yf.chart(upper, { period1, interval }) as { quotes?: Array<{ date: Date; close?: number | null }> };

      const chartQuotes = data.quotes ?? [];
      const prices = chartQuotes
        .filter((q) => q.close != null)
        .map((q) => ({
          date: q.date.toISOString().split('T')[0],
          close: q.close,
        }));

      const result = { symbol: upper, prices };
      cacheSet(ck, result, 'quote', 300_000);
      recordProviderSuccess('yahoo_finance');
      return toolOk('yahoo_finance', 'market_api', result, start);
    } catch (error) {
      recordProviderFailure('yahoo_finance');
      return toolError('yahoo_finance', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getCompanyProfile(symbol: string): Promise<ToolResult> {
    const start = Date.now();
    if (!checkRateLimit('yahoo_finance', RATE_LIMIT)) {
      return toolError('yahoo_finance', 'market_api', 'Yahoo Finance rate limit exceeded', start);
    }
    try {
      const yf = await getYf();
      const upper = symbol.toUpperCase();
      const ck = cacheKey('yahoo_finance', 'profile', upper);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('yahoo_finance', 'market_api', cached.data, start, ['cache_hit:memory']);

      const data = await yf.quoteSummary(upper, { modules: ['assetProfile', 'summaryDetail', 'price'] }) as Record<string, Record<string, unknown>>;
      const ap = data.assetProfile as Record<string, unknown> | undefined;
      const pr = data.price as Record<string, unknown> | undefined;

      const profile = {
        symbol: upper,
        name: pr?.longName ?? pr?.shortName ?? upper,
        country: ap?.country,
        currency: pr?.currency,
        exchange: pr?.exchangeName,
        market_cap: pr?.marketCap,
        industry: ap?.industry,
        sector: ap?.sector,
        weburl: ap?.website,
        description: typeof ap?.longBusinessSummary === 'string' ? ap.longBusinessSummary.slice(0, 500) : undefined,
        source_provider: 'yahoo_finance',
        as_of: new Date().toISOString(),
      };

      cacheSet(ck, profile, 'company_profile');
      recordProviderSuccess('yahoo_finance');
      return toolOk('yahoo_finance', 'market_api', profile, start);
    } catch (error) {
      recordProviderFailure('yahoo_finance');
      return toolError('yahoo_finance', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getEarningsCalendar(symbol?: string): Promise<ToolResult> {
    const start = Date.now();
    if (!symbol) {
      return toolError('yahoo_finance', 'market_api', 'Yahoo Finance earnings calendar requires a symbol', start);
    }
    if (!checkRateLimit('yahoo_finance', RATE_LIMIT)) {
      return toolError('yahoo_finance', 'market_api', 'Yahoo Finance rate limit exceeded', start);
    }
    try {
      const yf = await getYf();
      const upper = symbol.toUpperCase();
      const ck = cacheKey('yahoo_finance', 'earnings', upper);
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('yahoo_finance', 'market_api', cached.data, start, ['cache_hit:memory']);

      const data = await yf.quoteSummary(upper, { modules: ['earningsHistory', 'earningsTrend'] }) as Record<string, Record<string, unknown>>;
      const eh = data.earningsHistory as { history?: Array<Record<string, unknown>> } | undefined;
      const history = eh?.history ?? [];

      const calendar = history.map((item) => ({
        symbol: upper,
        period: item.period,
        quarter: (item.quarter as Record<string, unknown>)?.fmt,
        eps_actual: (item.epsActual as Record<string, unknown>)?.raw,
        eps_estimate: (item.epsEstimate as Record<string, unknown>)?.raw,
        eps_difference: (item.epsDifference as Record<string, unknown>)?.raw,
        source_provider: 'yahoo_finance',
      }));

      cacheSet(ck, calendar, 'news', 3_600_000);
      recordProviderSuccess('yahoo_finance');
      return toolOk('yahoo_finance', 'market_api', calendar, start);
    } catch (error) {
      recordProviderFailure('yahoo_finance');
      return toolError('yahoo_finance', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};

export const yahooFinanceNewsProvider: NewsProvider = {
  name: 'yahoo_finance',

  async getHoldingsRelevantNews(symbols: string[], limit = 5): Promise<ToolResult> {
    const start = Date.now();
    if (!checkRateLimit('yahoo_finance', RATE_LIMIT)) {
      return toolError('yahoo_finance', 'news_api', 'Yahoo Finance rate limit exceeded', start);
    }
    try {
      const yf = await getYf();
      const allNews: unknown[] = [];
      const warnings: string[] = [];

      const fetchResults = await Promise.allSettled(
        symbols.slice(0, 5).map(async (sym) => {
          const upper = sym.toUpperCase();
          const ck = cacheKey('yahoo_finance', 'news', upper);
          const cached = cacheGet<unknown[]>(ck);
          if (cached) return cached.data;

          try {
            const searchResult = await yf.search(upper, { newsCount: limit }) as { news?: Array<Record<string, unknown>> };
            const news = (searchResult.news ?? []).slice(0, limit).map((item) => ({
              headline: item.title,
              source: item.publisher,
              url: item.link,
              datetime: item.providerPublishTime ? new Date(item.providerPublishTime as number).toISOString() : undefined,
              symbol: upper,
              source_provider: 'yahoo_finance',
            }));
            cacheSet(ck, news, 'news');
            return news;
          } catch {
            return [];
          }
        }),
      );

      for (let i = 0; i < fetchResults.length; i++) {
        const r = fetchResults[i];
        if (r.status === 'fulfilled') {
          allNews.push(...(r.value as unknown[]));
        } else {
          warnings.push(`${symbols[i]}: ${r.reason?.message ?? 'fetch failed'}`);
        }
      }

      recordProviderSuccess('yahoo_finance');
      if (allNews.length === 0) {
        return toolOk('yahoo_finance', 'news_api', [], start, ['No news found']);
      }
      return toolOk('yahoo_finance', 'news_api', allNews.slice(0, limit * 2), start, warnings.length > 0 ? warnings : undefined);
    } catch (error) {
      recordProviderFailure('yahoo_finance');
      return toolError('yahoo_finance', 'news_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getLatestNews(limit = 10): Promise<ToolResult> {
    const start = Date.now();
    if (!checkRateLimit('yahoo_finance', RATE_LIMIT)) {
      return toolError('yahoo_finance', 'news_api', 'Yahoo Finance rate limit exceeded', start);
    }
    try {
      const yf = await getYf();
      const ck = cacheKey('yahoo_finance', 'latest-news');
      const cached = cacheGet<unknown>(ck);
      if (cached) return toolOk('yahoo_finance', 'news_api', cached.data, start, ['cache_hit']);

      const searchResult = await yf.search('market', { newsCount: limit }) as { news?: Array<Record<string, unknown>> };
      const mapped = (searchResult.news ?? []).slice(0, limit).map((item) => ({
        headline: item.title,
        source: item.publisher,
        url: item.link,
        datetime: item.providerPublishTime ? new Date(item.providerPublishTime as number).toISOString() : undefined,
        source_provider: 'yahoo_finance',
      }));

      cacheSet(ck, mapped, 'news');
      recordProviderSuccess('yahoo_finance');
      return toolOk('yahoo_finance', 'news_api', mapped, start);
    } catch (error) {
      recordProviderFailure('yahoo_finance');
      return toolError('yahoo_finance', 'news_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getNewsByTag(_tag: string, limit = 10): Promise<ToolResult> {
    return this.getLatestNews(limit);
  },

  async searchNews(query: string, limit = 10): Promise<ToolResult> {
    const start = Date.now();
    if (!checkRateLimit('yahoo_finance', RATE_LIMIT)) {
      return toolError('yahoo_finance', 'news_api', 'Yahoo Finance rate limit exceeded', start);
    }
    try {
      const yf = await getYf();
      const searchResult = await yf.search(query, { newsCount: limit }) as { news?: Array<Record<string, unknown>> };
      const mapped = (searchResult.news ?? []).slice(0, limit).map((item) => ({
        headline: item.title,
        source: item.publisher,
        url: item.link,
        datetime: item.providerPublishTime ? new Date(item.providerPublishTime as number).toISOString() : undefined,
        query,
        source_provider: 'yahoo_finance',
      }));

      recordProviderSuccess('yahoo_finance');
      return toolOk('yahoo_finance', 'news_api', mapped, start);
    } catch (error) {
      recordProviderFailure('yahoo_finance');
      return toolError('yahoo_finance', 'news_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};
