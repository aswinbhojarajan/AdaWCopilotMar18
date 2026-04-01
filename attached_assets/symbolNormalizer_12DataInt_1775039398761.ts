/**
 * Symbol Normalizer — Ada × Twelve Data (v2)
 *
 * Translates Ada's bare ticker symbols into Twelve Data's exchange-qualified
 * format using a structured resolution result.
 *
 * Returns a ResolvedSymbol object with:
 *   - ada_symbol:       Ada's internal ticker (EMAAR)
 *   - provider_ticker:  Provider-native ticker (EMAAR, or 2222 for Aramco)
 *   - exchange:         Exchange identifier (DFM) or null for US
 *   - qualified:        Colon notation for batch calls (EMAAR:DFM)
 *   - display_name:     Human-readable for LLM narration (Emaar Properties (DFM))
 *   - currency:         From instrument table (AED)
 *   - source:           Resolution path for diagnostics
 *
 * Two-tier resolution:
 *   Tier 1: Static exchange map (zero-latency)
 *   Tier 2: Database fallback (instruments table, cached 1h)
 *
 * Usage:
 *   import { resolveSymbol, resolveSymbols, denormalizeSymbol } from './symbolNormalizer';
 *
 *   const r = await resolveSymbol('EMAAR');
 *   // Batch /quote endpoint:
 *   fetch(`/quote?symbol=${r.qualified}`)
 *   // Single /time_series endpoint:
 *   fetch(`/time_series?symbol=${r.provider_ticker}&exchange=${r.exchange}`)
 *
 * @module symbolNormalizer
 * @see Design doc §3 — Symbol Normalization Layer
 */

import { cacheGet, cacheSet, cacheKey } from './cache';
import { pool } from '../db/pool'; // adjust import to match your DB pool export

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ResolvedSymbol {
  /** Ada's canonical internal ticker (e.g., 'EMAAR', 'ARAMCO') */
  ada_symbol: string;
  /** Provider-native ticker — may differ from ada_symbol (e.g., '2222' for Aramco) */
  provider_ticker: string;
  /** Exchange identifier (e.g., 'DFM', 'ADX', 'TADAWUL') or null for US equities */
  exchange: string | null;
  /** Colon-notated symbol for batch endpoints (e.g., 'EMAAR:DFM' or 'AAPL' for US) */
  qualified: string;
  /** Human-readable display name for LLM narration (e.g., 'Emaar Properties (DFM)') */
  display_name: string;
  /** Currency from instruments table (e.g., 'AED', 'SAR', 'USD') */
  currency: string;
  /** Resolution source for diagnostics: 'static_map' | 'db_lookup' | 'override' | 'passthrough' */
  source: string;
}

// ─── Tier 1: Static Exchange Map ─────────────────────────────────────────────
// Maps exchange identifiers (as stored in instruments.exchange) to the Twelve
// Data colon-delimited suffix. US exchanges are in PASSTHROUGH_EXCHANGES.

const EXCHANGE_SUFFIX: Record<string, string> = {
  // GCC exchanges — primary integration targets
  DFM: ':DFM',           // Dubai Financial Market
  ADX: ':ADX',           // Abu Dhabi Securities Exchange
  TADAWUL: ':TADAWUL',   // Saudi Stock Exchange (Tadawul)
  // Other GCC exchanges — pre-mapped for future instrument expansion
  QSE: ':QSE',           // Qatar Stock Exchange
  BHB: ':BHB',           // Bahrain Bourse
  MSM: ':MSM',           // Muscat Securities Market
  KSE: ':KSE',           // Kuwait Stock Exchange
};

// Exchanges where bare tickers resolve correctly (no suffix needed)
const PASSTHROUGH_EXCHANGES = new Set([
  'NASDAQ', 'NYSE', 'AMEX', 'NYSE ARCA', 'OTC', 'BATS',
]);

// ─── Ticker Overrides ────────────────────────────────────────────────────────
// Per-instrument overrides where Ada's internal symbol differs from the
// provider's canonical ticker. Applied BEFORE exchange suffixing.

const TICKER_OVERRIDES: Record<string, string> = {
  ARAMCO: '2222', // Saudi Aramco listed as 2222 on Tadawul
  // Add more as discovered during API verification (§11.1):
  // ETISALAT: 'E&',
  // ADNOCDIST: 'ADNOCDIST', // verify — may need adjustment
};

// ─── Cache Config ────────────────────────────────────────────────────────────

const NORM_CACHE_TTL = 3_600_000; // 1 hour — exchange assignments are stable intraday
const CACHE_PREFIX = 'sym_norm';

// ─── Core API ────────────────────────────────────────────────────────────────

/**
 * Resolve a single bare ticker to a structured Twelve Data symbol.
 *
 * Resolution order:
 *   1. Check in-memory cache
 *   2. Apply ticker override (e.g., ARAMCO → 2222)
 *   3. Look up exchange/name/currency from instruments table
 *   4. Map exchange → Twelve Data suffix or passthrough
 *   5. Build structured result
 *   6. Cache and audit-log the resolution
 *
 * @param symbol - Bare ticker as stored in Ada's instruments table
 * @returns Structured resolution result
 */
export async function resolveSymbol(symbol: string): Promise<ResolvedSymbol> {
  const upper = symbol.toUpperCase().trim();

  // 1. Cache check
  const ck = cacheKey(CACHE_PREFIX, upper);
  const cached = cacheGet<ResolvedSymbol>(ck);
  if (cached !== undefined) {
    // Log cache hit at debug level only
    return cached;
  }

  // 2. Apply ticker override
  const hasOverride = upper in TICKER_OVERRIDES;
  const providerTicker = TICKER_OVERRIDES[upper] ?? upper;

  // 3. Look up instrument metadata from DB
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
    // DB lookup failure is non-fatal — fall through to bare ticker
    console.warn(`[symbolNormalizer] DB lookup failed for ${upper}:`, err);
  }

  // 4. Build qualified symbol
  let qualified: string;
  let resolvedExchange: string | null;

  if (exchange && EXCHANGE_SUFFIX[exchange]) {
    // Known non-US exchange → apply suffix
    qualified = `${providerTicker}${EXCHANGE_SUFFIX[exchange]}`;
    resolvedExchange = exchange;
    if (resolutionSource === 'passthrough') resolutionSource = 'static_map';
  } else if (exchange && PASSTHROUGH_EXCHANGES.has(exchange)) {
    // US exchange → bare ticker
    qualified = providerTicker;
    resolvedExchange = null;
  } else {
    // Unknown exchange or no DB record → bare ticker, hope Twelve Data resolves it
    qualified = providerTicker;
    resolvedExchange = null;
  }

  // 5. Build display name
  const display = resolvedExchange
    ? `${displayName} (${resolvedExchange})`
    : displayName;

  // 6. Construct result
  const resolved: ResolvedSymbol = {
    ada_symbol: upper,
    provider_ticker: providerTicker,
    exchange: resolvedExchange,
    qualified,
    display_name: display,
    currency,
    source: resolutionSource,
  };

  // 7. Cache
  cacheSet(ck, resolved, NORM_CACHE_TTL);

  // 8. Audit log — this is the key diagnostic for symbol resolution issues
  console.info(
    `[symbolNormalizer] ${upper} → ${qualified} (source: ${resolutionSource}, cached: false)`
  );

  return resolved;
}

/**
 * Resolve an array of bare tickers in parallel.
 *
 * @param symbols - Array of bare tickers
 * @returns Array of ResolvedSymbol in the same order
 */
export async function resolveSymbols(
  symbols: string[]
): Promise<ResolvedSymbol[]> {
  return Promise.all(symbols.map((s) => resolveSymbol(s)));
}

/**
 * Reverse-normalize: map a Twelve Data provider symbol back to Ada's internal
 * ticker. Used when processing batch /quote responses keyed by provider symbol.
 *
 * @param tdSymbol - Exchange-qualified symbol (e.g., '2222:TADAWUL')
 * @returns Ada's internal ticker (e.g., 'ARAMCO')
 */
export function denormalizeSymbol(tdSymbol: string): string {
  // Strip exchange suffix
  const bare = tdSymbol.split(':')[0];

  // Reverse ticker overrides
  const reverseEntry = Object.entries(TICKER_OVERRIDES).find(
    ([, providerTicker]) => providerTicker === bare
  );
  return reverseEntry ? reverseEntry[0] : bare;
}

/**
 * Check if an input symbol is already exchange-qualified (contains a colon).
 * If so, the normalizer should pass it through rather than double-qualifying.
 */
export function isAlreadyQualified(symbol: string): boolean {
  return symbol.includes(':');
}
