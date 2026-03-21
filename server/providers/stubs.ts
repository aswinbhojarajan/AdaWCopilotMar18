import type { MarketProvider, NewsProvider, MacroProvider, FxProvider, ResearchProvider } from './types';
import type { ToolResult } from '../../shared/schemas/agent';
import { toolError } from './helpers';

function notImplemented(provider: string, sourceType: string, method: string): ToolResult {
  return {
    status: 'error',
    source_name: provider,
    source_type: sourceType,
    as_of: new Date().toISOString(),
    latency_ms: 0,
    data: null,
    error: `${provider} provider is not yet implemented. This is a Phase 2/3 stub. Please use an alternative provider or configure fallback.`,
  };
}

export const marketauxNewsProvider: NewsProvider = {
  name: 'marketaux',
  async getHoldingsRelevantNews() { return notImplemented('marketaux', 'news_api', 'getHoldingsRelevantNews'); },
  async getLatestNews() { return notImplemented('marketaux', 'news_api', 'getLatestNews'); },
  async getNewsByTag() { return notImplemented('marketaux', 'news_api', 'getNewsByTag'); },
  async searchNews() { return notImplemented('marketaux', 'news_api', 'searchNews'); },
};

export const ecbMacroProvider: MacroProvider = {
  name: 'ecb',
  async getIndicator() { return notImplemented('ecb', 'macro_api', 'getIndicator'); },
  async getMultipleIndicators() { return notImplemented('ecb', 'macro_api', 'getMultipleIndicators'); },
  async getAvailableIndicators() { return notImplemented('ecb', 'macro_api', 'getAvailableIndicators'); },
};

export const twelveDataMarketProvider: MarketProvider = {
  name: 'twelve_data',
  async getQuotes() { return notImplemented('twelve_data', 'market_api', 'getQuotes'); },
  async getHistoricalPrices() { return notImplemented('twelve_data', 'market_api', 'getHistoricalPrices'); },
};

export const fmpMarketProvider: MarketProvider = {
  name: 'fmp',
  async getQuotes() { return notImplemented('fmp', 'market_api', 'getQuotes'); },
  async getHistoricalPrices() { return notImplemented('fmp', 'market_api', 'getHistoricalPrices'); },
};

export const coinGeckoMarketProvider: MarketProvider = {
  name: 'coingecko',
  async getQuotes() { return notImplemented('coingecko', 'market_api', 'getQuotes'); },
  async getHistoricalPrices() { return notImplemented('coingecko', 'market_api', 'getHistoricalPrices'); },
};

export const yahooFinanceMarketProvider: MarketProvider = {
  name: 'yahoo_finance',
  async getQuotes() { return notImplemented('yahoo_finance', 'market_api', 'getQuotes'); },
  async getHistoricalPrices() { return notImplemented('yahoo_finance', 'market_api', 'getHistoricalPrices'); },
};
