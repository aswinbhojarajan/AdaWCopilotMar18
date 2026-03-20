import type { IdentityProvider } from '../types';
import type { InstrumentIdentity } from '../../../shared/schemas/agent';
import pool from '../../db/pool';

export const mockIdentityProvider: IdentityProvider = {
  name: 'mock',

  async resolveInstrument(query: string): Promise<InstrumentIdentity | null> {
    const q = query.toUpperCase().trim();
    const { rows } = await pool.query(
      `SELECT symbol, name, asset_class, currency, isin, figi, exchange
       FROM instruments
       WHERE UPPER(symbol) = $1 OR UPPER(name) LIKE $2 OR isin = $3
       LIMIT 1`,
      [q, `%${q}%`, q],
    );
    if (rows.length === 0) return null;
    const r = rows[0];
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
  },

  async resolveMultiple(queries: string[]): Promise<InstrumentIdentity[]> {
    const results: InstrumentIdentity[] = [];
    for (const q of queries) {
      const result = await this.resolveInstrument(q);
      if (result) results.push(result);
    }
    return results;
  },
};
