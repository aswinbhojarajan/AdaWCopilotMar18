import type { MarketProvider, NewsProvider } from './types';
import type { ToolResult, MarketQuote } from '../../shared/schemas/agent';
import { toolOk, toolError, toolPartial, checkRateLimit, recordProviderSuccess, recordProviderFailure } from './helpers';
import { cacheGet, cacheSet, cacheKey } from './cache';

import type { Quote } from 'yahoo-finance2/modules/quote';
import type { ChartResultArray, ChartResultArrayQuote } from 'yahoo-finance2/modules/chart';
import type { SearchResult, SearchNews } from 'yahoo-finance2/modules/search';
import type { QuoteSummaryResult } from 'yahoo-finance2/modules/quoteSummary';

const RATE_LIMIT = 100;

interface YfClient {
  quote(symbol: string): Promise<Quote>;
  chart(symbol: string, opts: { period1: Date; interval: string }): Promise<ChartResultArray>;
  quoteSummary(symbol: string, opts: { modules: string[] }): Promise<QuoteSummaryResult>;
  search(query: string, opts: { newsCount: number }): Promise<SearchResult>;
}

let _yf: YfClient | null = null;

async function getYf(): Promise<YfClient> {
  if (_yf) return _yf;
  const mod = await import('yahoo-finance2');
  const YahooFinance = mod.default;
  _yf = new YahooFinance() as unknown as YfClient;
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

          const data: Quote = await yf.quote(upper);
          if (!data || !data.regularMarketPrice) {
            throw new Error(`No quote data for ${upper}`);
          }

          const quote: MarketQuote = {
            symbol: upper,
            price: data.regularMarketPrice,
            change: data.regularMarketChange ?? 0,
            change_percent: data.regularMarketChangePercent ?? 0,
            high: data.regularMarketDayHigh,
            low: data.regularMarketDayLow,
            open: data.regularMarketOpen,
            previous_close: data.regularMarketPreviousClose,
            currency: data.currency ?? 'USD',
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

      const data: ChartResultArray = await yf.chart(upper, { period1, interval });

      const chartQuotes: ChartResultArrayQuote[] = data.quotes ?? [];
      const prices = chartQuotes
        .filter((q: ChartResultArrayQuote) => q.close != null)
        .map((q: ChartResultArrayQuote) => ({
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

      const data: QuoteSummaryResult = await yf.quoteSummary(upper, { modules: ['assetProfile', 'summaryDetail', 'price'] });
      const ap = data.assetProfile;
      const pr = data.price;

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

      const data: QuoteSummaryResult = await yf.quoteSummary(upper, { modules: ['earningsHistory', 'earningsTrend'] });
      const eh = data.earningsHistory;
      const history = eh?.history ?? [];

      const calendar = history.map((item) => ({
        symbol: upper,
        period: item.period,
        quarter: item.quarter ? item.quarter.toISOString().split('T')[0] : null,
        eps_actual: item.epsActual,
        eps_estimate: item.epsEstimate,
        eps_difference: item.epsDifference,
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

      interface MappedNewsItem {
        headline: string;
        source: string;
        url: string;
        datetime: string;
        symbol: string;
        source_provider: string;
      }

      const allNews: MappedNewsItem[] = [];
      const warnings: string[] = [];

      const fetchResults = await Promise.allSettled(
        symbols.slice(0, 5).map(async (sym) => {
          const upper = sym.toUpperCase();
          const ck = cacheKey('yahoo_finance', 'news', upper);
          const cached = cacheGet<MappedNewsItem[]>(ck);
          if (cached) return cached.data;

          try {
            const searchResult: SearchResult = await yf.search(upper, { newsCount: limit });
            const news: MappedNewsItem[] = (searchResult.news ?? []).slice(0, limit).map((item: SearchNews) => ({
              headline: item.title,
              source: item.publisher,
              url: item.link,
              datetime: item.providerPublishTime ? new Date(item.providerPublishTime).toISOString() : new Date().toISOString(),
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
          allNews.push(...r.value);
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

      const searchResult: SearchResult = await yf.search('market', { newsCount: limit });
      const mapped = (searchResult.news ?? []).slice(0, limit).map((item: SearchNews) => ({
        headline: item.title,
        source: item.publisher,
        url: item.link,
        datetime: item.providerPublishTime ? new Date(item.providerPublishTime).toISOString() : new Date().toISOString(),
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
      const searchResult: SearchResult = await yf.search(query, { newsCount: limit });
      const mapped = (searchResult.news ?? []).slice(0, limit).map((item: SearchNews) => ({
        headline: item.title,
        source: item.publisher,
        url: item.link,
        datetime: item.providerPublishTime ? new Date(item.providerPublishTime).toISOString() : new Date().toISOString(),
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
