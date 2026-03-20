import type { IdentityProvider } from '../types';
import type { ToolResult } from '../../../shared/schemas/agent';
import { toolOk, toolError } from './helpers';
import pool from '../../db/pool';

function mapRow(r: Record<string, unknown>) {
  return {
    symbol: String(r.symbol),
    name: String(r.name),
    figi: r.figi ? String(r.figi) : undefined,
    isin: r.isin ? String(r.isin) : undefined,
    exchange: r.exchange ? String(r.exchange) : undefined,
    asset_class: String(r.asset_class),
    currency: String(r.currency),
    source_provider: 'mock',
  };
}

export const mockIdentityProvider: IdentityProvider = {
  name: 'mock',

  async resolveInstrument(query: string): Promise<ToolResult> {
    const start = Date.now();
    try {
      const q = query.toUpperCase().trim();
      const { rows } = await pool.query(
        `SELECT symbol, name, asset_class, currency, isin, figi, exchange
         FROM instruments
         WHERE UPPER(symbol) = $1 OR UPPER(name) LIKE $2 OR isin = $3
         LIMIT 1`,
        [q, `%${q}%`, q],
      );
      return toolOk('mock_identity', 'identity_api', rows.length > 0 ? mapRow(rows[0]) : null, start);
    } catch (error) {
      return toolError('mock_identity', 'identity_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },

  async resolveMultiple(queries: string[]): Promise<ToolResult> {
    const start = Date.now();
    try {
      const results = [];
      for (const q of queries) {
        const upper = q.toUpperCase().trim();
        const { rows } = await pool.query(
          `SELECT symbol, name, asset_class, currency, isin, figi, exchange
           FROM instruments
           WHERE UPPER(symbol) = $1 OR UPPER(name) LIKE $2 OR isin = $3
           LIMIT 1`,
          [upper, `%${upper}%`, upper],
        );
        if (rows.length > 0) results.push(mapRow(rows[0]));
      }
      return toolOk('mock_identity', 'identity_api', results, start);
    } catch (error) {
      return toolError('mock_identity', 'identity_api', error instanceof Error ? error.message : 'Unknown error', start);
    }
  },
};
