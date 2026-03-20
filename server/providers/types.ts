import type { ToolResult } from '../../shared/schemas/agent';

export interface PortfolioProvider {
  name: string;
  getPortfolioSnapshot(userId: string): Promise<ToolResult>;
  getHoldings(userId: string): Promise<ToolResult>;
  getAllocations(userId: string): Promise<ToolResult>;
  getPerformance(userId: string, days: number): Promise<ToolResult>;
}

export interface MarketProvider {
  name: string;
  getQuotes(symbols: string[]): Promise<ToolResult>;
  getHistoricalPrices(symbol: string, days: number): Promise<ToolResult>;
}

export interface NewsProvider {
  name: string;
  getHoldingsRelevantNews(symbols: string[], limit?: number): Promise<ToolResult>;
  getLatestNews(limit?: number): Promise<ToolResult>;
  getNewsByTag(tag: string, limit?: number): Promise<ToolResult>;
  searchNews(query: string, limit?: number): Promise<ToolResult>;
}

export interface MacroProvider {
  name: string;
  getIndicator(seriesId: string): Promise<ToolResult>;
  getMultipleIndicators(seriesIds: string[]): Promise<ToolResult>;
  getAvailableIndicators(): Promise<ToolResult>;
}

export interface FxProvider {
  name: string;
  getRate(base: string, target: string): Promise<ToolResult>;
  getRates(base: string, targets: string[]): Promise<ToolResult>;
  getHistoricalRate(base: string, target: string, date: string): Promise<ToolResult>;
}

export interface ResearchProvider {
  name: string;
  getFilings(company: string, type?: string, limit?: number): Promise<ToolResult>;
  getLatestFiling(company: string, type: string): Promise<ToolResult>;
  searchFilings(query: string, limit?: number): Promise<ToolResult>;
}

export interface IdentityProvider {
  name: string;
  resolveInstrument(query: string): Promise<ToolResult>;
  resolveMultiple(queries: string[]): Promise<ToolResult>;
}

export interface ProviderRegistry {
  portfolio: PortfolioProvider;
  market: MarketProvider;
  news: NewsProvider;
  macro: MacroProvider;
  fx: FxProvider;
  research: ResearchProvider;
  identity: IdentityProvider;
}
