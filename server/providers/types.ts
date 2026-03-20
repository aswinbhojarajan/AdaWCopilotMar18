import type {
  MarketQuote,
  NewsArticle,
  MacroIndicator,
  FxRate,
  Filing,
  InstrumentIdentity,
  ToolResult,
} from '../../shared/schemas/agent';

export interface PortfolioProvider {
  name: string;
  getPositions(userId: string): Promise<ToolResult>;
  getAllocations(userId: string): Promise<ToolResult>;
  getSnapshot(userId: string): Promise<ToolResult>;
  getPerformance(userId: string, days: number): Promise<ToolResult>;
}

export interface MarketProvider {
  name: string;
  getQuote(symbol: string): Promise<MarketQuote>;
  getQuotes(symbols: string[]): Promise<MarketQuote[]>;
  getHistoricalPrices(symbol: string, days: number): Promise<ToolResult>;
}

export interface NewsProvider {
  name: string;
  getLatestNews(limit?: number): Promise<NewsArticle[]>;
  getNewsBySymbol(symbol: string, limit?: number): Promise<NewsArticle[]>;
  getNewsByTag(tag: string, limit?: number): Promise<NewsArticle[]>;
  searchNews(query: string, limit?: number): Promise<NewsArticle[]>;
}

export interface MacroProvider {
  name: string;
  getIndicator(seriesId: string): Promise<MacroIndicator>;
  getMultipleIndicators(seriesIds: string[]): Promise<MacroIndicator[]>;
  getAvailableIndicators(): Promise<{ id: string; name: string; category: string }[]>;
}

export interface FxProvider {
  name: string;
  getRate(base: string, target: string): Promise<FxRate>;
  getRates(base: string, targets: string[]): Promise<FxRate[]>;
  getHistoricalRate(base: string, target: string, date: string): Promise<FxRate>;
}

export interface ResearchProvider {
  name: string;
  getFilings(company: string, type?: string, limit?: number): Promise<Filing[]>;
  getLatestFiling(company: string, type: string): Promise<Filing | null>;
  searchFilings(query: string, limit?: number): Promise<Filing[]>;
}

export interface IdentityProvider {
  name: string;
  resolveInstrument(query: string): Promise<InstrumentIdentity | null>;
  resolveMultiple(queries: string[]): Promise<InstrumentIdentity[]>;
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
