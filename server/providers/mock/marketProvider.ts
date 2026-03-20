import type { MarketProvider } from '../types';
import type { ToolResult, MarketQuote } from '../../../shared/schemas/agent';
import { toolOk, toolError } from './helpers';
import pool from '../../db/pool';

function mapRow(r: Record<string, unknown>): MarketQuote {
  const symbol = String(r.symbol);
  return {
    symbol,
    price: Number(r.price),
    change: Number(r.change),
    change_percent: Number(r.change_percent),
    volume: r.volume ? Number(r.volume) : undefined,
    high: r.high ? Number(r.high) : undefined,
    low: r.low ? Number(r.low) : undefined,
    open: r.open_price ? Number(r.open_price) : undefined,
    previous_close: r.previous_close ? Number(r.previous_close) : undefined,
    market_cap: r.market_cap ? Number(r.market_cap) : undefined,
    currency: String(r.currency ?? 'USD'),
    source_provider: String(r.source_provider ?? 'mock'),
    as_of: r.as_of ? new Date(r.as_of as string).toISOString() : new Date().toISOString(),
  };
}

export const mockMarketProvider: MarketProvider = {
  name: 'mock',

  async getQuotes(symbols: string[]): Promise<ToolResult> {
    const start = Date.now();
    try {
      const upperSymbols = symbols.map((s) => s.toUpperCase());
      const { rows } = await pool.query(
        `SELECT mq.symbol, mq.price, mq.change, mq.change_percent,
                mq.volume, mq.high, mq.low, mq.open_price, mq.previous_close,
                mq.market_cap, mq.source_provider, mq.as_of,
                i.currency
         FROM market_quotes mq
         JOIN instruments i ON i.symbol = mq.symbol
         WHERE mq.symbol = ANY($1::text[])
         ORDER BY mq.as_of DESC`,
        [upperSymbols],
      );
      const found = new Set(rows.map((r) => String(r.symbol)));
      const missing = upperSymbols.filter((s) => !found.has(s));
      const warnings = missing.length > 0 ? [`No quotes found for: ${missing.join(', ')}`] : undefined;
      return toolOk('mock_market', 'market_api', rows.map(mapRow), start, warnings);
    } catch (error) {
      return toolError('mock_market', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async getHistoricalPrices(symbol: string, days: number): Promise<ToolResult> {
    const start = Date.now();
    try {
      const upper = symbol.toUpperCase();
      const { rows: quoteRows } = await pool.query(
        `SELECT mq.price FROM market_quotes mq WHERE mq.symbol = $1 LIMIT 1`,
        [upper],
      );
      const basePrice = quoteRows.length > 0 ? Number(quoteRows[0].price) : 100;
      const prices: { date: string; close: number }[] = [];
      const now = Date.now();
      for (let i = days; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        const noise = 1 + (Math.sin(i * 0.5) * 0.02);
        prices.push({
          date: d.toISOString().split('T')[0],
          close: +(basePrice * noise).toFixed(2),
        });
      }
      return toolOk('mock_market', 'market_api', { symbol: upper, prices }, start);
    } catch (error) {
      return toolError('mock_market', 'market_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};
