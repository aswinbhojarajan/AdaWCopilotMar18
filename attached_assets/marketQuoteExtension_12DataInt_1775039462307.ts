/**
 * MarketQuote Type Extension — Ada × Twelve Data (v2)
 *
 * These fields should be added to the existing MarketQuote type in
 * shared/schemas/agent.ts (or wherever the type is defined).
 *
 * The three new fields (display_symbol, provider_symbol, is_delayed)
 * support GCC market coverage, LLM narration quality, debugging,
 * and delayed-data honesty.
 *
 * @see Design doc §2.4 — Response Normalization
 */

// ─── Existing fields (already in MarketQuote) ────────────────────────────────
// symbol: string             — Ada's internal bare ticker (e.g., 'EMAAR')
// price: number              — Latest available price
// change: number             — Absolute change from previous close
// change_percent: number     — Percentage change
// volume?: number            — Daily trading volume
// high?: number              — Session high
// low?: number               — Session low
// open_price?: number        — Session open
// previous_close?: number    — Prior session close
// market_cap?: number        — Market capitalisation
// currency: string           — Price currency (e.g., 'AED', 'USD')
// source_provider: string    — Provider name (e.g., 'twelve_data', 'finnhub')
// as_of: string              — Quote timestamp

// ─── New fields to add ──────────────────────────────────────────────────────

export interface MarketQuoteExtension {
  /**
   * Human-readable display name for LLM narration.
   * Constructed from instrument name + exchange.
   *
   * Examples:
   *   'Emaar Properties (DFM)'
   *   'Saudi Aramco (TADAWUL)'
   *   'Apple Inc.'  (no exchange suffix for US equities)
   *
   * The LLM uses this to produce natural responses like
   * "Emaar Properties is trading at AED 9.92 on the DFM"
   * instead of "EMAAR is 9.85".
   */
  display_symbol?: string;

  /**
   * The exact symbol sent to the upstream provider.
   * Essential for debugging symbol resolution issues.
   *
   * Examples:
   *   'EMAAR:DFM'       — colon-notated for Twelve Data batch
   *   '2222:TADAWUL'     — Aramco after ticker override
   *   'AAPL'             — US equity passthrough
   *
   * When a user reports "Emaar shows wrong data", check this
   * field to see exactly what was sent to Twelve Data.
   */
  provider_symbol?: string;

  /**
   * Whether the price is delayed (true) or real-time (false).
   *
   * On Twelve Data's Grow plan, all international exchange data
   * is 15 minutes delayed. The LLM should say "delayed price"
   * rather than "current price" when this flag is true.
   *
   * Controlled by env var TWELVE_DATA_IS_REALTIME (default: false).
   * Set to true only on the Pro plan with real-time add-on.
   */
  is_delayed?: boolean;
}

// ─── Full updated type (for reference) ───────────────────────────────────────

export interface MarketQuote {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
  high?: number;
  low?: number;
  open_price?: number;
  previous_close?: number;
  market_cap?: number;
  currency: string;
  source_provider: string;
  as_of: string;
  // ─── New in v2 ───
  display_symbol?: string;
  provider_symbol?: string;
  is_delayed?: boolean;
}
