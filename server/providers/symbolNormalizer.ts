import { cacheGet, cacheSet, cacheKey } from './cache';
import pool from '../db/pool';

export interface ResolvedSymbol {
  ada_symbol: string;
  provider_ticker: string;
  exchange: string | null;
  qualified: string;
  display_name: string;
  currency: string;
  source: string;
}

const EXCHANGE_SUFFIX: Record<string, string> = {
  DFM: ':DFM',
  ADX: ':ADX',
  TADAWUL: ':TADAWUL',
  QSE: ':QSE',
  BHB: ':BHB',
  MSM: ':MSM',
  KSE: ':KSE',
};

const PASSTHROUGH_EXCHANGES = new Set([
  'NASDAQ', 'NYSE', 'AMEX', 'NYSE ARCA', 'OTC', 'BATS',
]);

const TICKER_OVERRIDES: Record<string, string> = {
  ARAMCO: '2222',
};

const NORM_CACHE_TTL = 3_600_000;
const CACHE_PREFIX = 'sym_norm';

export async function resolveSymbol(symbol: string): Promise<ResolvedSymbol> {
  const upper = symbol.toUpperCase().trim();

  const ck = cacheKey(CACHE_PREFIX, upper);
  const cached = cacheGet<ResolvedSymbol>(ck);
  if (cached) {
    return cached.data;
  }

  const hasOverride = upper in TICKER_OVERRIDES;
  const providerTicker = TICKER_OVERRIDES[upper] ?? upper;

  let exchange: string | null = null;
  let displayName: string = upper;
  let currency: string = 'USD';
  let resolutionSource: string = 'passthrough';

  try {
    const result = await pool.query(
      `SELECT exchange, name, currency
       FROM instruments
       WHERE UPPER(symbol) = $1 AND is_active = TRUE
       LIMIT 1`,
      [upper]
    );
    if (result.rows.length > 0) {
      const row = result.rows[0];
      exchange = row.exchange || null;
      displayName = row.name || upper;
      currency = row.currency || 'USD';
      resolutionSource = hasOverride ? 'override' : 'db_lookup';
    }
  } catch (err) {
    console.warn(`[symbolNormalizer] DB lookup failed for ${upper}:`, err);
  }

  let qualified: string;
  let resolvedExchange: string | null;

  if (exchange && EXCHANGE_SUFFIX[exchange]) {
    qualified = `${providerTicker}${EXCHANGE_SUFFIX[exchange]}`;
    resolvedExchange = exchange;
    if (resolutionSource === 'passthrough') resolutionSource = 'static_map';
  } else if (exchange && PASSTHROUGH_EXCHANGES.has(exchange)) {
    qualified = providerTicker;
    resolvedExchange = null;
  } else {
    qualified = providerTicker;
    resolvedExchange = null;
  }

  const display = resolvedExchange
    ? `${displayName} (${resolvedExchange})`
    : displayName;

  const resolved: ResolvedSymbol = {
    ada_symbol: upper,
    provider_ticker: providerTicker,
    exchange: resolvedExchange,
    qualified,
    display_name: display,
    currency,
    source: resolutionSource,
  };

  cacheSet(ck, resolved, 'symbol_norm', NORM_CACHE_TTL);

  console.info(
    `[symbolNormalizer] ${upper} → ${qualified} (source: ${resolutionSource})`
  );

  return resolved;
}

export async function resolveSymbols(
  symbols: string[]
): Promise<ResolvedSymbol[]> {
  return Promise.all(symbols.map((s) => resolveSymbol(s)));
}

export function denormalizeSymbol(tdSymbol: string): string {
  const bare = tdSymbol.split(':')[0];
  const reverseEntry = Object.entries(TICKER_OVERRIDES).find(
    ([, providerTicker]) => providerTicker === bare
  );
  return reverseEntry ? reverseEntry[0] : bare;
}

export function isAlreadyQualified(symbol: string): boolean {
  return symbol.includes(':');
}
