import type { MarketProvider } from '../types';
import type { MarketQuote, ToolResult } from '../../../shared/schemas/agent';

const MOCK_PRICES: Record<string, { price: number; change: number; changePct: number; volume: number }> = {
  NVDA: { price: 250.35, change: 5.82, changePct: 2.38, volume: 45_200_000 },
  AAPL: { price: 208.63, change: -1.24, changePct: -0.59, volume: 32_100_000 },
  MSFT: { price: 420.50, change: 3.15, changePct: 0.75, volume: 18_700_000 },
  GOOGL: { price: 175.20, change: 2.10, changePct: 1.21, volume: 22_300_000 },
  AMZN: { price: 192.50, change: 1.85, changePct: 0.97, volume: 28_400_000 },
  META: { price: 520.30, change: 8.45, changePct: 1.65, volume: 15_600_000 },
  TSLA: { price: 245.80, change: -4.20, changePct: -1.68, volume: 52_800_000 },
  JPM: { price: 198.50, change: 2.30, changePct: 1.17, volume: 8_900_000 },
  V: { price: 285.40, change: 1.60, changePct: 0.56, volume: 6_200_000 },
  JNJ: { price: 158.20, change: 0.45, changePct: 0.29, volume: 5_800_000 },
  UNH: { price: 520.10, change: -2.80, changePct: -0.54, volume: 3_200_000 },
  PG: { price: 165.40, change: 0.78, changePct: 0.47, volume: 4_100_000 },
  XOM: { price: 108.60, change: 1.92, changePct: 1.80, volume: 12_500_000 },
  AGG: { price: 109.42, change: -0.18, changePct: -0.16, volume: 7_300_000 },
  BND: { price: 73.85, change: -0.12, changePct: -0.16, volume: 5_100_000 },
  TLT: { price: 92.30, change: -0.65, changePct: -0.70, volume: 14_200_000 },
  LQD: { price: 108.90, change: -0.22, changePct: -0.20, volume: 3_800_000 },
  EMB: { price: 86.50, change: 0.35, changePct: 0.41, volume: 4_600_000 },
  GLD: { price: 210.73, change: 3.42, changePct: 1.65, volume: 9_800_000 },
  SLV: { price: 24.15, change: 0.58, changePct: 2.46, volume: 11_200_000 },
  SPY: { price: 520.30, change: 2.85, changePct: 0.55, volume: 55_000_000 },
  QQQ: { price: 495.60, change: 4.10, changePct: 0.83, volume: 32_000_000 },
  BTC: { price: 87535.00, change: -2150.00, changePct: -2.40, volume: 28_500_000_000 },
  ETH: { price: 2450.00, change: -85.00, changePct: -3.35, volume: 12_800_000_000 },
  SOL: { price: 145.80, change: -5.20, changePct: -3.44, volume: 3_200_000_000 },
  VWO: { price: 43.20, change: 0.28, changePct: 0.65, volume: 8_900_000 },
  VEA: { price: 48.70, change: 0.15, changePct: 0.31, volume: 7_200_000 },
  VNQ: { price: 85.10, change: 0.42, changePct: 0.50, volume: 3_100_000 },
  AMD: { price: 165.20, change: 3.80, changePct: 2.35, volume: 38_500_000 },
  NFLX: { price: 685.40, change: 12.30, changePct: 1.83, volume: 5_400_000 },
  DIS: { price: 112.40, change: -0.85, changePct: -0.75, volume: 7_600_000 },
  KO: { price: 62.30, change: 0.22, changePct: 0.35, volume: 9_100_000 },
  BA: { price: 185.90, change: -2.40, changePct: -1.27, volume: 6_800_000 },
  USO: { price: 78.50, change: 1.25, changePct: 1.62, volume: 4_200_000 },
  ARAMCO: { price: 32.80, change: 0.45, changePct: 1.39, volume: 15_000_000 },
  EMAAR: { price: 9.85, change: 0.12, changePct: 1.23, volume: 22_000_000 },
  FAB: { price: 14.20, change: 0.08, changePct: 0.57, volume: 8_500_000 },
  ADNOCDIST: { price: 4.15, change: 0.05, changePct: 1.22, volume: 12_000_000 },
  STC: { price: 55.40, change: 0.30, changePct: 0.54, volume: 6_300_000 },
  IBIT: { price: 42.80, change: -1.05, changePct: -2.39, volume: 25_000_000 },
};

function buildQuote(symbol: string): MarketQuote {
  const data = MOCK_PRICES[symbol];
  if (!data) {
    return {
      symbol,
      price: 0,
      change: 0,
      change_percent: 0,
      currency: 'USD',
      source_provider: 'mock',
      as_of: new Date().toISOString(),
    };
  }
  return {
    symbol,
    price: data.price,
    change: data.change,
    change_percent: data.changePct,
    volume: data.volume,
    high: +(data.price * 1.015).toFixed(2),
    low: +(data.price * 0.985).toFixed(2),
    open: +(data.price - data.change * 0.3).toFixed(2),
    previous_close: +(data.price - data.change).toFixed(2),
    currency: ['ARAMCO', 'STC'].includes(symbol) ? 'SAR' : ['EMAAR', 'FAB', 'ADNOCDIST'].includes(symbol) ? 'AED' : 'USD',
    source_provider: 'mock',
    as_of: new Date().toISOString(),
  };
}

export const mockMarketProvider: MarketProvider = {
  name: 'mock',

  async getQuote(symbol: string): Promise<MarketQuote> {
    return buildQuote(symbol.toUpperCase());
  },

  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return symbols.map((s) => buildQuote(s.toUpperCase()));
  },

  async getHistoricalPrices(symbol: string, days: number): Promise<ToolResult> {
    const quote = buildQuote(symbol.toUpperCase());
    const prices: { date: string; close: number }[] = [];
    const now = Date.now();
    for (let i = days; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const noise = 1 + (Math.sin(i * 0.5) * 0.02);
      prices.push({
        date: d.toISOString().split('T')[0],
        close: +(quote.price * noise).toFixed(2),
      });
    }
    return {
      tool_name: 'get_historical_prices',
      success: true,
      data: { symbol, prices },
      source_provider: 'mock',
      as_of: new Date().toISOString(),
    };
  },
};
