# Ada Wealth Agent — Final Free Source Recommendations

## Purpose

This document captures the recommended **free / low-cost external data sources** for Ada Wealth Agent, along with how they should be used in the architecture.

The goal is to help the Replit build start with a **small, practical, grounded external data stack** that is good enough for a strong prototype and can later evolve into a more production-grade source layer.

---

## Design principle

Ada should treat **internal portfolio, banking, customer-profile, and suitability APIs** as the primary source of truth.

External sources should be used to **enrich** Ada with:
- market quotes and price history
- macro context
- company filings and fundamentals
- identifier mapping
- FX normalization
- finance news and discovery

External sources should **not** replace:
- holdings
- balances
- transactions
- portfolio valuations
- client risk profile
- eligibility / suitability decisions

---

## Final recommendation summary

### Phase 1 core sources
These should be integrated first.

1. **Finnhub**
2. **FRED**
3. **SEC EDGAR public data API**
4. **OpenFIGI**
5. **Frankfurter**
6. **CBUAE exchange rates**

### Phase 2 enrichment sources
Add these once the core agent loop is working.

7. **Marketaux**
8. **ECB Data Portal**
9. **Twelve Data**

### Phase 3 selective sources
Use these when the product scope requires them.

10. **Financial Modeling Prep (FMP)**
11. **CoinGecko**
12. **Yahoo Finance / yfinance adapter** (optional, non-core, fallback/dev-oriented)

---

# 1. Core sources to integrate first

## 1.1 Finnhub

### Why it should be first
Finnhub gives Ada the best first external market-data spine from a single integration.

### Use it for
- real-time or near-real-time quote enrichment
- company profile enrichment
- earnings and event context
- simple fundamentals
- basic market-news endpoints
- symbol-level market context inside chat

### Ada tool mapping
- `market.getQuote`
- `market.getQuotes`
- `market.getCompanyProfile`
- `market.getPriceHistory`
- `market.getMarketNews`
- `market.getEarningsCalendar`

### Implementation guidance
- Use as the default price/quote provider in MVP
- Wrap behind a provider interface so it can be swapped later
- Cache quote responses aggressively to stay within free-tier limits

### Notes
- Strong first choice for prototype and pilot-style demos
- Keep price freshness metadata in every tool response

---

## 1.2 FRED

### Why it should be core
FRED is the macro backbone for Ada.

### Use it for
- inflation, rates, unemployment, GDP, yield curve context
- educational explainers for why markets moved
- bond / macro commentary
- Discover tab macro cards
- grounding macro statements in chat

### Ada tool mapping
- `macro.getSeries`
- `macro.getRateContext`
- `macro.getInflationContext`
- `macro.getYieldCurveContext`
- `discover.getMacroDigest`

### Implementation guidance
- Use for economic context cards and chat explainers
- Build simple helpers that convert raw series into human-readable takeaways
- Store common series IDs in config

### Notes
- High-value and stable
- Important for making Ada feel explanatory, not only transactional

---

## 1.3 SEC EDGAR public data API

### Why it should be core
For US public companies, EDGAR is the authoritative free source for filings and filing-derived facts.

### Use it for
- 10-K / 10-Q / 8-K retrieval
- filing timelines
- XBRL-backed company data
- filing-aware research / summaries
- owned-name explainers in chat

### Ada tool mapping
- `research.getRecentFilings`
- `research.getCompanyFacts`
- `research.getFilingSummary`
- `research.getOwnedNamesFilings`

### Implementation guidance
- Use for company research and deeper explainers
- Summaries can be LLM-generated, but the raw filing facts should come from EDGAR
- Keep filing retrieval separate from the summarization layer

### Notes
- Best free source for authoritative company disclosures
- Strong fit for chat questions like “what changed in the latest filing?”

---

## 1.4 OpenFIGI

### Why it should be core
OpenFIGI solves one of the most practical problems in wealth architecture: identifier mismatch.

### Use it for
- ISIN to ticker mapping
- ticker to FIGI mapping
- CUSIP / ISIN / ticker normalization
- internal portfolio identifier resolution before market/news lookup

### Ada tool mapping
- `identity.resolveInstrument`
- `identity.mapIsinToTicker`
- `identity.normalizeInstrumentIdentifier`

### Implementation guidance
- Put OpenFIGI early in the market-data tool chain
- Use it whenever portfolio data arrives with ISINs or other non-ticker identifiers
- Persist normalized instrument identifiers in your DB when possible

### Notes
- Critical once real custody or portfolio feeds are introduced
- This is a high-leverage integration even though it is not visually exciting

---

## 1.5 Frankfurter

### Why it should be core
Frankfurter is a very simple and practical way to support multi-currency portfolio normalization in the prototype.

### Use it for
- FX reference conversion
- historical FX conversion
- portfolio normalization into user currency
- currency conversion cards in chat

### Ada tool mapping
- `fx.getRates`
- `fx.convertAmount`
- `fx.normalizePortfolioCurrency`

### Implementation guidance
- Use for general FX conversion in the prototype
- Keep a clean provider abstraction so live FX can be upgraded later if needed
- Label rates clearly as reference/daily where applicable

### Notes
- Excellent MVP source
- Not intended for trading-grade real-time FX

---

## 1.6 CBUAE exchange rates

### Why it should be core for a UAE-facing experience
Ada is likely to be demonstrated or used in a UAE wealth context, so local AED normalization matters.

### Use it for
- AED-based reference display
- UAE-localized FX conversion context
- client-facing reference-rate presentation

### Ada tool mapping
- `fx.getAedReferenceRates`
- `fx.convertToAed`

### Implementation guidance
- Use this mainly as a UAE display/reference layer
- Pair with Frankfurter rather than replacing it entirely
- Prefer internal consistency in the UI: if rates are reference-only, label them that way

### Notes
- Strong localization boost for UAE demos and prototypes

---

# 2. Enrichment sources to add after the core loop works

## 2.1 Marketaux

### Why it is useful
Marketaux is a good fit for finance-specific news and holdings-relevant discovery.

### Use it for
- finance news cards
- entity/ticker-linked news
- holdings-relevant news in chat
- Discover tab short-format market stories

### Ada tool mapping
- `news.getHoldingsRelevantNews`
- `news.getSymbolNews`
- `discover.getFinanceNewsDigest`

### Implementation guidance
- Use it for enrichment, not as your only news dependency
- Cache heavily and rank results before passing to the model
- Use only the most relevant items to avoid clutter

### Notes
- Good fit for Ada Discover experiences
- Free tier is limited, so not ideal as a sole production dependency

---

## 2.2 ECB Data Portal

### Why it is useful
The ECB Data Portal improves Europe-oriented macro and statistics coverage.

### Use it for
- euro-area rates and monetary statistics
- Europe macro cards
- European market context

### Ada tool mapping
- `macro.getEcbSeries`
- `discover.getEuropeMacroDigest`

### Implementation guidance
- Add when regional breadth matters
- Especially useful if Ada later supports more European client scenarios

---

## 2.3 Twelve Data

### Why it is useful
Twelve Data is a reasonable backup and enrichment layer for time-series data and indicators.

### Use it for
- backup historical prices
- chart data
- technical indicators
- secondary price-history provider

### Ada tool mapping
- `market.getPriceHistoryBackup`
- `market.getTechnicalIndicators`

### Implementation guidance
- Use as backup, not as the first/default provider
- Route only selective calls there to avoid unnecessary complexity

---

# 3. Selective / later-stage sources

## 3.1 Financial Modeling Prep (FMP)

### Why it is useful
FMP is good when Ada needs convenient company fundamentals and pre-calculated ratios.

### Use it for
- company ratios
- precomputed financial metrics
- deeper fundamentals lookups
- screening-style enrichment

### Ada tool mapping
- `research.getCompanyRatios`
- `research.getFundamentalOverview`

### Implementation guidance
- Use on-demand for research/deep-dive questions
- Do not make it a load-bearing dependency for the whole system

---

## 3.2 CoinGecko

### Why it is useful
Only relevant if crypto becomes part of Ada’s supported product universe.

### Use it for
- crypto quotes
- crypto watchlists
- hybrid portfolio enrichment

### Ada tool mapping
- `crypto.getQuote`
- `crypto.getMarketSummary`

### Implementation guidance
- Keep isolated in a crypto namespace
- Only add if a real crypto use case exists

---

## 3.3 Yahoo Finance / yfinance adapter

### Why include it at all
Yahoo Finance can still be useful as an **additional option** for:
- developer convenience
- quick prototyping
- local testing
- ad hoc enrichment
- backup/fallback experiments

### Important caveat
Yahoo Finance should **not** be treated as a core or production-critical dependency.

Reason:
- it is generally accessed through unofficial wrappers or scraping-oriented libraries
- it does not offer the same level of support or contractual stability as official market-data APIs
- schemas/endpoints can break more easily
- reliability and compliance posture are weaker than official providers

### Recommended role in Ada
Use Yahoo Finance as:
- an **optional provider adapter**
- a **developer fallback**
- a **non-core enrichment option**
- a **backup for experimentation**, not for critical pricing or regulated advice workflows

### Good uses
- local sandbox exploration
- rapid prototyping for charts or historicals
- validating UI flows before a more stable provider is wired in
- cross-checking non-critical market metadata during development

### Avoid using it for
- the canonical price source for client-facing financial answers
- regulated recommendation flows
- anything that requires high reliability or explicit provider assurance
- production-critical portfolio valuation

### Ada tool mapping
- `market.getQuoteYahooFallback`
- `market.getPriceHistoryYahooFallback`
- `market.getInstrumentMetadataYahooFallback`

### Implementation guidance
- Put Yahoo behind a provider flag such as `MARKET_PROVIDER_MODE=yahoo_optional`
- Make it opt-in, not default
- Mark all Yahoo-derived outputs with clear source metadata
- Disable it automatically in stricter compliance or production modes if needed

### Bottom line
Yahoo Finance is acceptable as an **extra option** in Ada’s provider layer, but it should sit below the main recommended stack.

---

# 4. Final priority stack for Ada

## Phase 1 — required for MVP
1. Finnhub
2. FRED
3. SEC EDGAR public data API
4. OpenFIGI
5. Frankfurter
6. CBUAE exchange rates

## Phase 2 — recommended enrichment
7. Marketaux
8. ECB Data Portal
9. Twelve Data

## Phase 3 — selective and optional
10. FMP
11. CoinGecko
12. Yahoo Finance / yfinance adapter

---

# 5. Recommended provider architecture

Use a provider abstraction from day one.

Example:

```ts
interface MarketProvider {
  getQuote(symbol: string): Promise<ToolResult<Quote>>;
  getQuotes(symbols: string[]): Promise<ToolResult<Quote[]>>;
  getPriceHistory(symbol: string, range: string): Promise<ToolResult<PricePoint[]>>;
  getCompanyProfile(symbol: string): Promise<ToolResult<CompanyProfile>>;
}
```

Implement these providers:
- `finnhub-provider`
- `twelvedata-provider`
- `yahoo-provider`
- `mock-provider`

Use routing rules like:
- primary = Finnhub
- secondary = Twelve Data
- optional dev fallback = Yahoo
- local/dev fallback = Mock

---

# 6. Recommended environment variables

```bash
MARKET_PROVIDER_PRIMARY=finnhub
MARKET_PROVIDER_SECONDARY=twelvedata
MARKET_PROVIDER_OPTIONAL=yahoo
NEWS_PROVIDER_PRIMARY=marketaux
MACRO_PROVIDER_PRIMARY=fred
FILING_PROVIDER_PRIMARY=sec_edgar
FX_PROVIDER_PRIMARY=frankfurter
FX_PROVIDER_LOCALIZED=cbuae
IDENTITY_PROVIDER_PRIMARY=openfigi
ENABLE_YAHOO_OPTIONAL=true
STRICT_COMPLIANCE_MODE=false
```

---

# 7. Recommended source-to-tool mapping

## Home tab
- internal portfolio snapshot API
- Finnhub for quote refresh
- FRED for macro context
- Marketaux for relevant headlines
- CBUAE/Frankfurter for currency normalization

## Wealth tab
- internal holdings / transactions / portfolio APIs
- Finnhub for market enrichment
- OpenFIGI for identifier resolution
- SEC EDGAR for filings and company facts
- Frankfurter / CBUAE for multi-currency support

## Discover tab
- Marketaux for finance news
- FRED for macro cards
- ECB Data Portal for Europe-specific context
- optional Yahoo sandbox usage only during development if needed

## Chat agent
- internal portfolio/banking/profile tools
- Finnhub for prices and market context
- FRED for macro explanation
- SEC EDGAR for company disclosures
- OpenFIGI for identifier resolution
- Marketaux for relevant news
- Frankfurter / CBUAE for FX
- Yahoo only as an optional non-core fallback or dev convenience layer

---

# 8. Final recommendation

If we want Ada to start strong without overcomplicating the first build, the right source stack is:

**Core:**
- Finnhub
- FRED
- SEC EDGAR public data API
- OpenFIGI
- Frankfurter
- CBUAE

**Then add:**
- Marketaux
- ECB Data Portal
- Twelve Data

**Optional / non-core:**
- FMP
- CoinGecko
- Yahoo Finance / yfinance adapter

Yahoo Finance should be included only as an **additional option** and **not as a foundational dependency**.

---

# 9. Build recommendation for Replit

In the Replit implementation:
- wire the provider interfaces first
- connect Finnhub, FRED, SEC EDGAR, OpenFIGI, Frankfurter, and CBUAE first
- add Marketaux later for news relevance
- keep Yahoo behind a feature flag and optional provider mode
- store provider source names and timestamps in every tool response so the agent can cite them

This preserves speed, flexibility, and future portability without making the prototype brittle.
