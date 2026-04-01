# Ada — Twelve Data Integration Readiness Audit

> **Audit Date:** April 1, 2026
> **Auditor:** Platform Architecture Review
> **Scope:** Full codebase assessment for Twelve Data GCC/UAE market data integration
> **Status:** Pre-integration — no Twelve Data code exists in the codebase

---

# 1. Executive Summary

## High-Level Current State

Ada is a mobile-first AI wealth copilot built as a React + TypeScript + Express + PostgreSQL monolith, targeting GCC/UAE high-net-worth (HNW) investors for an ENBD demo. The platform features:

- **AI orchestration** with intent classification, lane-based routing (3 lanes), multi-round tool calling, and SSE streaming
- **7 live external providers**: Finnhub (market/news), Yahoo Finance (market/news), FRED (macro), SEC EDGAR (research), OpenFIGI (identity), Frankfurter (FX), CBUAE (FX)
- **Provider fallback chain** architecture with automatic health tracking, rate limiting, and degradation
- **Discover tab** with a 7-stage automated content pipeline (ingest → enrich → cluster → synthesize → materialize)
- **3 demo personas** (Aisha, Raj, Sarah) with distinct portfolios, risk profiles, and GCC instruments

## Current Market Data Capability Maturity

| Area | Maturity |
|------|----------|
| US equities (quotes, history, profiles) | ✅ Production-ready via Finnhub + Yahoo Finance |
| Macro indicators (FRED) | ✅ Production-ready |
| FX rates (incl. AED pairs) | ✅ Production-ready via Frankfurter + CBUAE |
| GCC/UAE equities (DFM, ADX, Tadawul) | ❌ **Zero live coverage** — mock data only |
| Symbol normalization for GCC | ❌ **Not implemented** |
| News for GCC holdings | ⚠️ Partial — Finnhub ingests general news; no GCC-specific feed |

## Integration Readiness Verdict

**Ada is architecturally ready for Twelve Data integration but has one critical gap: no symbol normalization layer.** The provider registry, fallback chain, caching, rate limiting, and health tracking infrastructure all exist and are proven. Adding Twelve Data requires:

1. A new provider file implementing the `MarketProvider` interface (4 methods)
2. A `twelve_data` case in `resolveMarketProvider()` in `registry.ts`
3. A symbol normalization layer mapping bare tickers (`EMAAR`) to Twelve Data format (`EMAAR:DFM` or `EMAAR.DFM`)
4. Setting `TWELVE_DATA_API_KEY` and `MARKET_PROVIDER_PRIMARY=twelve_data` env vars

## Top 10 Key Findings

1. **F-01**: GCC instruments exist in the `instruments` table with correct exchange codes (DFM, ADX, TADAWUL) and ISINs, but no live provider can price them
2. **F-02**: Finnhub and Yahoo Finance both receive bare `EMAAR` symbol — neither resolves it to DFM; Finnhub returns `c:0` (no data), Yahoo Finance throws
3. **F-03**: No symbol normalization/mapping layer exists anywhere in the codebase — no `.DFM`, `.DU`, `:DFM` translation
4. **F-04**: The `instruments` table already stores `exchange` (e.g., `'DFM'`) and `isin` (e.g., `'AEE000301011'`) — a normalization layer can query this
5. **F-05**: The provider fallback chain (Proxy pattern in `registry.ts`) is production-grade and supports N-provider chains with automatic health degradation
6. **F-06**: Cache TTL for quotes is 120 seconds — appropriate for delayed data but needs review for Twelve Data's real-time tier
7. **F-07**: The `MarketProvider` interface has exactly 4 methods to implement: `getQuotes`, `getHistoricalPrices`, `getCompanyProfile`, `getEarningsCalendar`
8. **F-08**: Tool definitions (`toolRegistry.ts`) use US-centric examples in descriptions (e.g., `"AAPL", "NVDA"`) — the LLM has no guidance to handle GCC tickers
9. **F-09**: The system prompt in `promptBuilder.ts` describes `getQuotes` as "live stock/ETF prices from Finnhub (fallback: Yahoo Finance)" — needs updating for Twelve Data
10. **F-10**: `market_quotes` table has a `UNIQUE(symbol, source_provider)` constraint — Twelve Data quotes will coexist alongside mock data without conflict

## Top 5 Blockers / Risks for Day-1 Integration

| # | Blocker | Severity | Effort |
|---|---------|----------|--------|
| B-01 | No symbol normalization: `EMAAR` → `EMAAR:DFM` mapping needed before any API call | Critical | Medium |
| B-02 | No `TWELVE_DATA_API_KEY` env var or provider file exists | Critical | Low |
| B-03 | LLM tool descriptions use US-only examples; LLM may not call `getQuotes(['EMAAR'])` for GCC queries | High | Low |
| B-04 | Twelve Data API rate limits (8/min on free tier) vs current Finnhub 55/min — rate limiter needs tuning | Medium | Low |
| B-05 | Currency handling: Twelve Data returns prices in local currency (AED/SAR); existing `MarketQuote` has `currency` field but display/conversion logic is untested for non-USD | Medium | Low |

---

# 2. Repository & Runtime Overview

## Structure

Ada is a **single-repo monolith** with colocated frontend and backend:

```
ada/
├── server/                    # Express backend
│   ├── index.ts               # Entry point — Express boot, middleware, routes
│   ├── routes/
│   │   └── api.ts             # All API route definitions
│   ├── services/              # Business logic layer
│   │   ├── agentOrchestrator.ts      # AI orchestration core (867 lines)
│   │   ├── toolRegistry.ts           # LLM tool manifests + executors (822 lines)
│   │   ├── capabilityRegistry.ts     # Model configs (beta/rollback)
│   │   ├── intentClassifier.ts       # Intent classification (11 intents)
│   │   ├── modelRouter.ts            # Lane routing (0/1/2)
│   │   ├── promptBuilder.ts          # System prompt construction
│   │   ├── wealthEngine.ts           # Portfolio health/rebalance
│   │   ├── guardrails.ts             # Execution boundary enforcement
│   │   ├── policyEngine.ts           # Tenant policy engine
│   │   ├── memoryService.ts          # Working/episodic/semantic memory
│   │   └── discoverPipeline/         # 7-stage content pipeline
│   ├── providers/             # External data provider adapters
│   │   ├── types.ts           # Provider interfaces (MarketProvider, etc.)
│   │   ├── registry.ts        # Provider factory + fallback chain proxy
│   │   ├── finnhub.ts         # Finnhub market + news provider
│   │   ├── yahooFinance.ts    # Yahoo Finance market + news provider
│   │   ├── fred.ts            # FRED macro provider
│   │   ├── secEdgar.ts        # SEC EDGAR research provider
│   │   ├── openFigi.ts        # OpenFIGI identity provider
│   │   ├── frankfurter.ts     # ECB FX provider
│   │   ├── cbuae.ts           # CBUAE AED FX provider
│   │   ├── helpers.ts         # Rate limit, health tracking, toolOk/toolError
│   │   ├── cache.ts           # In-memory TTL cache
│   │   └── mock/              # Mock provider implementations
│   ├── repositories/          # Database access layer
│   ├── db/
│   │   ├── schema.sql         # PostgreSQL DDL (719 lines)
│   │   └── seed.sql           # Demo data including GCC instruments
│   └── middleware/
│       └── auth.ts            # Session-based auth middleware
├── src/                       # React frontend
│   ├── components/
│   │   ├── screens/           # Tab screens (Home, Wealth, Discover, Chat)
│   │   └── ada/               # Chat UI components
│   ├── hooks/                 # React Query hooks + custom hooks
│   └── stores/                # Zustand state stores
├── shared/
│   └── schemas/
│       └── agent.ts           # Shared TypeScript types
├── package.json
├── vite.config.ts
├── PRD.md, BACKLOG.md, ISSUES.md, CHANGELOG.md
└── docs/
```

## Entry Points

- **Frontend**: `src/main.tsx` → Vite dev server (port 5173)
- **Backend**: `server/index.ts` → Express (port 5000 prod, port 3001 dev)
- Both run concurrently via `npm run dev`

## Build/Deploy

```json
// package.json scripts
"dev": "concurrent tsx server + vite dev server",
"build": "vite build",
"start": "NODE_ENV=production npx tsx server/index.ts",
"db:setup": "npm run db:schema && npm run db:seed",
"typecheck": "tsc --noEmit"
```

## Infrastructure Assumptions

- Runs on **Replit** (detected via `REPLIT_DOMAINS` env var)
- PostgreSQL via Replit's built-in database (`DATABASE_URL`)
- Session store: `connect-pg-simple` (PostgreSQL-backed)
- No Redis, no BullMQ, no external job queue — all background work is `setInterval`-based
- Static files served from `build/` in production

---

# 3. Frontend Architecture

## Stack & Versions

| Package | Version |
|---------|---------|
| React | ^18.3.1 |
| React DOM | ^18.3.1 |
| TypeScript | ^5.8.3 |
| Vite | 6.3.5 |
| TanStack React Query | ^5.90.21 |
| Framer Motion | (installed) |
| Radix UI | Full suite (accordion, dialog, tabs, etc.) |
| Tailwind CSS | (via @tailwindcss/vite plugin) |

## Routing / Navigation

Tab-based mobile navigation with 4 main screens:
- **Home** — Portfolio summary, Morning Sentinel briefing
- **Wealth** — Holdings, allocations, goals, accounts
- **Discover** — AI-curated content feed (For You / What's New)
- **Chat** — AI copilot conversation interface

Navigation managed via Zustand store; no React Router — single-page with conditional rendering.

## State Management

Zustand stores (in `src/stores/`):
- Navigation state (active tab, persona)
- Chat state (messages, streaming status)
- UI state (modals, sheets)

## Data Fetching — Market-Related Hooks

| Hook | File | Purpose |
|------|------|---------|
| `usePortfolio` | `src/hooks/usePortfolio.ts` | Portfolio overview (value, daily change) |
| `useHoldings` | `src/hooks/useHoldings.ts` | Position list with prices |
| `useAllocations` | `src/hooks/useAllocations.ts` | Asset allocation breakdown |
| `useGoals` | `src/hooks/useGoals.ts` | Financial goal progress |
| `useAccounts` | `src/hooks/useAccounts.ts` | Connected account balances |
| `useMorningSentinel` | `src/hooks/useMorningSentinel.ts` | Morning briefing SSE stream |
| `useContent` | `src/hooks/useContent.ts` | Discover tab content feed |

## Chat/Copilot UI Flow

1. User types message in `ChatScreen.tsx`
2. Frontend calls `POST /api/chat/stream` with `{ message, threadId, userId }`
3. `useStreamingChat` hook opens SSE connection
4. Processes event types: `text`, `widget`, `simulator`, `suggested_questions`, `thinking`, `error`
5. `ChatMessage.tsx` renders markdown-formatted text + any `ChatWidgetRenderer` components
6. `ChatWidgets.tsx` dispatches to: `AllocationChart`, `HoldingsSummary`, `GoalProgress`, `PortfolioSummaryWidget`, `AdvisorHandoffWidget`

## Components Displaying Price/Market Data

| Component | File | Data Shown |
|-----------|------|------------|
| `HoldingsSummary` | `src/components/ada/ChatWidgets.tsx` | Symbol, name, value, change % (color-coded) |
| `PortfolioSummaryWidget` | `src/components/ada/ChatWidgets.tsx` | Total value, daily change |
| `AllocationChart` | `src/components/ada/ChatWidgets.tsx` | Asset class percentages |
| `ContentCard` | `src/components/screens/DiscoverScreen` | Market pulse cards with ticker mentions |
| `ChatMessage` | `src/components/ada/ChatMessage.tsx` | Inline price mentions in LLM responses |

## Loading/Error/Empty States for Market Data in Chat

- **Loading**: "Ada is analyzing..." placeholder during SSE streaming
- **Error**: Error SSE event renders a red-tinted message; generic "I encountered an issue" text
- **Empty/No Data**: LLM generates natural language: "I don't have live price data for..." — **this is the Emaar failure message**
- No structured "data unavailable" widget exists — the LLM decides what to say

---

# 4. Backend Architecture

## Stack & Versions

| Package | Version |
|---------|---------|
| Express | ^5.2.1 |
| OpenAI SDK | ^6.32.0 |
| Anthropic SDK | (installed) |
| Yahoo Finance 2 | ^3.13.2 |
| PostgreSQL (pg) | (installed) |
| TypeScript | ^5.8.3 |
| tsx | (runtime) |

## Express Boot Flow

```
server/index.ts
  → express.json() middleware
  → connect-pg-simple session middleware (cookie: ada.sid)
  → resolveSession middleware (server/middleware/auth.ts)
  → CORS (origin: true, credentials: true)
  → mount /api/auth → authRouter
  → mount /api/admin → adminRouter
  → mount /api → apiRouter (server/routes/api.ts)
  → GET /api/health
  → GET /api/pipeline/health
  → static files (build/)
  → SPA fallback
  → global error handler
  → listen on port 5000 (prod) or 3001 (dev)
  → init DB schema + seed
  → init Discover pipeline
```

## Service Layer

| Service | File | Lines | Purpose |
|---------|------|-------|---------|
| Agent Orchestrator | `server/services/agentOrchestrator.ts` | 867 | Core AI orchestration loop |
| Tool Registry | `server/services/toolRegistry.ts` | 822 | Tool manifests + executors |
| OpenAI Client | `server/services/openaiClient.ts` | 472 | Resilient streaming + completion |
| Capability Registry | `server/services/capabilityRegistry.ts` | 408 | Model config (beta/rollback) |
| Morning Sentinel | `server/services/morningSentinelService.ts` | 383 | Morning briefing generation |
| Intent Classifier | `server/services/intentClassifier.ts` | 362 | LLM-based intent classification |
| Wealth Engine | `server/services/wealthEngine.ts` | 332 | Health scores, rebalancing |
| Response Builder | `server/services/responseBuilder.ts` | 307 | Post-LLM response processing |
| Memory Service | `server/services/memoryService.ts` | 250 | Working/episodic/semantic memory |
| Prompt Builder | `server/services/promptBuilder.ts` | 245 | System prompt construction |
| Model Router | `server/services/modelRouter.ts` | 212 | Lane-based routing |
| Policy Engine | `server/services/policyEngine.ts` | 148 | Tenant policy enforcement |
| Guardrails | `server/services/guardrails.ts` | 141 | Execution boundary checks |

## Request Flow

```
Client
  → POST /api/chat/stream
    → apiRouter (server/routes/api.ts)
      → orchestrateStream() (agentOrchestrator.ts)
        → PII scan (piiDetector.ts)
        → Input moderation (moderationService.ts)
        → Intent classification (intentClassifier.ts) via ada-classifier model
        → Policy evaluation (policyEngine.ts)
        → Lane routing (modelRouter.ts) → Lane 0/1/2
        → Data prefetch (toolRegistry.ts) for matching intents
        → System prompt build (promptBuilder.ts) with user context + tool guide
        → LLM streaming loop (openaiClient.ts)
          → Tool calls dispatched via toolRegistry → providers/registry.ts → provider
          → Tool results added to conversation
          → Repeat until no more tool calls (max rounds)
        → Output moderation (moderationService.ts)
        → Guardrail post-checks (guardrails.ts)
        → Response builder (responseBuilder.ts) extracts follow-ups + widgets
        → Yields StreamEvent objects from async generator
  → api.ts (line 248) iterates generator, writes SSE frames:
    id: <seqId>\ndata: <JSON event>\n\n
```

## SSE Streaming

`orchestrateStream()` in `agentOrchestrator.ts` (line 190) is an **async generator** (`async function*`) that `yield`s typed `StreamEvent` objects (`{ type: 'text', content }`, `{ type: 'thinking', step, detail }`, `{ type: 'widget', widget }`, `{ type: 'suggested_questions', suggestedQuestions }`, `{ type: 'done' }`).

The **SSE HTTP framing** happens in `server/routes/api.ts` (line 248), which iterates the generator and writes each event as:
```
id: <seqId>\ndata: <JSON event>\n\n
```
The route handler sets `Content-Type: text/event-stream` (line 230) and sends a `:keepalive` comment every 15 seconds (line 243). Error handling wraps the generator loop and emits a `{ type: 'error' }` event followed by `{ type: 'done' }` (lines 262-264).

## Background Workers

All `setInterval`-based (no BullMQ):

| Worker | Interval | Purpose |
|--------|----------|---------|
| Ingest | 10 min | Fetch Finnhub news articles |
| Cluster + Synthesis | 15 min | Group and synthesize cards |
| Feed Materializer | 60 min | Score and rank per-user feeds |
| Editorial (Ada View) | 6 hours | Weekly editorial synthesis |
| Morning Briefing | 6 hours | Daily morning brief |
| Milestone | 6 hours | Portfolio milestone detection |
| Expiry | 4 hours | Archive stale cards |

---

# 5. Database & Schema Audit

## Instruments Table (Critical for Twelve Data)

```sql
-- server/db/schema.sql, line 282
CREATE TABLE IF NOT EXISTS instruments (
  id SERIAL PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  sector TEXT,
  geography TEXT NOT NULL DEFAULT 'Global',
  currency TEXT NOT NULL DEFAULT 'USD',
  instrument_type TEXT NOT NULL DEFAULT 'equity'
    CHECK (instrument_type IN ('equity', 'etf', 'bond', 'commodity', 'crypto', 'fund', 'index')),
  isin TEXT,
  figi TEXT,
  exchange TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key observations:**
- `exchange` column exists and stores exchange identifiers (`DFM`, `ADX`, `TADAWUL`, `NASDAQ`, `NYSE`)
- `isin` column stores ISINs (e.g., `AEE000301011` for Emaar)
- `figi` column exists but is `NULL` for all GCC instruments
- `symbol` is the bare ticker (`EMAAR`, not `EMAAR.DFM`) — **this is the normalization gap**

## Market Quotes Table

```sql
-- server/db/schema.sql, line 300
CREATE TABLE IF NOT EXISTS market_quotes (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL REFERENCES instruments(symbol),
  price NUMERIC(18,6) NOT NULL,
  change NUMERIC(18,6) NOT NULL DEFAULT 0,
  change_percent NUMERIC(10,4) NOT NULL DEFAULT 0,
  volume BIGINT,
  high NUMERIC(18,6),
  low NUMERIC(18,6),
  open_price NUMERIC(18,6),
  previous_close NUMERIC(18,6),
  market_cap NUMERIC(20,2),
  source_provider TEXT NOT NULL DEFAULT 'mock',
  as_of TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(symbol, source_provider)
);
```

**Key observations:**
- `UNIQUE(symbol, source_provider)` means Twelve Data quotes will coexist with mock quotes
- `source_provider` is a free-text field — will store `'twelve_data'`
- Schema supports multi-currency via `instruments.currency`
- No `exchange_mic` or `exchange_suffix` column — would be needed for provider-specific symbol formatting

## GCC Seed Data in instruments Table

```sql
-- server/db/seed.sql, lines 314-318
('ARAMCO', 'Saudi Aramco', 'Stocks', 'Energy', 'Saudi Arabia', 'SAR', 'equity', 'SA14TG012N13', 'TADAWUL'),
('EMAAR', 'Emaar Properties', 'Stocks', 'Real Estate', 'UAE', 'AED', 'equity', 'AEE000301011', 'DFM'),
('FAB', 'First Abu Dhabi Bank', 'Stocks', 'Financials', 'UAE', 'AED', 'equity', 'AEA000201013', 'ADX'),
('ADNOCDIST', 'ADNOC Distribution', 'Stocks', 'Energy', 'UAE', 'AED', 'equity', 'AEA006101017', 'ADX'),
('STC', 'Saudi Telecom Company', 'Stocks', 'Telecom', 'Saudi Arabia', 'SAR', 'equity', 'SA0007879543', 'TADAWUL'),
```

## GCC Seed Data in market_quotes Table

```sql
-- server/db/seed.sql, lines 358-362
('ARAMCO', 32.80, 0.45, 1.39, 15000000, 33.29, 32.31, 32.67, 32.35, 'mock', NOW()),
('EMAAR', 9.85, 0.12, 1.23, 22000000, 10.00, 9.70, 9.82, 9.73, 'mock', NOW()),
('FAB', 14.20, 0.08, 0.57, 8500000, 14.41, 13.99, 14.18, 14.12, 'mock', NOW()),
('ADNOCDIST', 4.15, 0.05, 1.22, 12000000, 4.21, 4.09, 4.14, 4.10, 'mock', NOW()),
('STC', 55.40, 0.30, 0.54, 6300000, 56.23, 54.57, 55.24, 55.10, 'mock', NOW()),
```

## Other Relevant Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | Demo personas | id, first_name, email, advisor_id |
| `accounts` | Brokerage/savings accounts | user_id, balance, institution_name |
| `positions` | Portfolio holdings | account_id, symbol, quantity, current_price, cost_basis, asset_class |
| `portfolio_snapshots` | Daily value snapshots | user_id, total_value, daily_change |
| `performance_history` | Time-series performance | user_id, date, cumulative_return |
| `goals` | Financial goals | user_id, target_amount, current_amount |
| `news_items` | Cached news articles | symbols[], relevance_tags[], source_provider |
| `chat_messages` | Conversation history | thread_id, role, content |
| `agent_traces` | LLM call logs | prompt_tokens, completion_tokens, provider_alias |
| `discover_cards` | Content pipeline cards | card_type, taxonomy_tags, confidence_score |
| `user_profiles` | Enriched user metadata | geo_focus, top_asset_classes, allocation_gaps |
| `moderation_events` | Input/output moderation log | direction, flagged, categories |
| `provider_fallback_events` | Provider fallback log | original_alias, failure_reason |

## Instrument/Security Master Data Assessment

| Question | Answer |
|----------|--------|
| What instrument master data exists? | `instruments` table with 30+ entries (US + GCC) |
| Is there a ticker ↔ exchange mapping table? | **No dedicated mapping table.** The `instruments.exchange` column stores the exchange but no translation logic exists |
| Are ISIN/FIGI identifiers stored? | Yes — `isin` populated for GCC instruments; `figi` column exists but NULL for GCC |
| Are UAE/GCC exchange identifiers represented? | Yes — `DFM`, `ADX`, `TADAWUL` stored in `instruments.exchange` |
| What schema additions would Twelve Data require? | (1) Optional `twelve_data_symbol` column on `instruments` for provider-specific symbol format, OR a symbol normalization function. (2) No new tables required |

---

# 6. Provider & Integration Inventory

## Provider Summary Table

| Provider | Purpose | Files | Env Var(s) | Status | GCC Support |
|----------|---------|-------|------------|--------|-------------|
| **Finnhub** | Stock quotes, company profiles, earnings calendar, news | `server/providers/finnhub.ts` | `FINNHUB_API_KEY` | ✅ Active | ❌ No GCC exchanges |
| **Yahoo Finance** | Stock quotes, historical prices, company profiles, news | `server/providers/yahooFinance.ts` | None (library) | ✅ Active | ❌ No GCC exchanges |
| **FRED** | Macroeconomic indicators (CPI, GDP, yields, VIX) | `server/providers/fred.ts` | `FRED_API_KEY` | ✅ Active | N/A |
| **SEC EDGAR** | SEC filings (10-K, 10-Q, 8-K), XBRL facts | `server/providers/secEdgar.ts` | `EDGAR_USER_AGENT` | ✅ Active | N/A |
| **OpenFIGI** | Instrument identity resolution (ticker → FIGI) | `server/providers/openFigi.ts` | `OPENFIGI_API_KEY` | ✅ Active | ⚠️ May resolve GCC ISINs |
| **Frankfurter** | ECB FX rates (EUR-based) | `server/providers/frankfurter.ts` | None (public API) | ✅ Active | ⚠️ No AED directly |
| **CBUAE** | UAE Central Bank FX rates (AED-based) | `server/providers/cbuae.ts` | None (public API) | ✅ Active | ✅ AED pairs |
| **OpenAI** | LLM (GPT-4.1 family) | `server/services/openaiClient.ts` | `AI_INTEGRATIONS_OPENAI_API_KEY` | ✅ Active | N/A |
| **Anthropic** | Fallback LLM (Claude Sonnet 4) | SDK installed | `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | ⚠️ Configured, not actively called | N/A |

## Detailed Provider Analysis

### Finnhub (Market + News)

**API Call Pattern:**
```typescript
// server/providers/finnhub.ts, line 19
async function finnhubFetch(path: string, params: Record<string, string> = {}): Promise<unknown> {
  if (!checkRateLimit('finnhub', RATE_LIMIT)) {
    throw new Error('Finnhub rate limit exceeded (55/min free tier)');
  }
  const url = finnhubUrl(path, params);
  const resp = await fetchWithTimeout(url, { timeout: 8000 });
  // ...
}
```

**Actual API calls:**
- `GET https://finnhub.io/api/v1/quote?symbol=EMAAR&token=...` — returns `{c:0}` for GCC tickers
- `GET https://finnhub.io/api/v1/stock/candle?symbol=...&resolution=D&from=...&to=...`
- `GET https://finnhub.io/api/v1/stock/profile2?symbol=...`
- `GET https://finnhub.io/api/v1/calendar/earnings?from=...&to=...`

**Error handling:** Rate limit check → fetchWithTimeout (8s) → HTTP status check → `recordProviderSuccess`/`recordProviderFailure` → returns `toolOk`/`toolError`

**GCC support:** ❌ Finnhub free tier does not cover DFM, ADX, or Tadawul. Sending `EMAAR` returns `c:0` (zero price), which triggers `throw new Error('No quote data for EMAAR')` at line 54.

### Yahoo Finance (Market + News)

**API Call Pattern:**
```typescript
// server/providers/yahooFinance.ts, line 50
const data: Quote = await yf.quote(upper);
if (!data || !data.regularMarketPrice) {
  throw new Error(`No quote data for ${upper}`);
}
```

**GCC support:** ❌ Yahoo Finance does not recognize bare `EMAAR`. The ticker `EMAAR.DU` maps to **Düsseldorf Stock Exchange (Germany)**, not Dubai Financial Market. There is no standard Yahoo Finance suffix for DFM. This is the root cause of the `.DU` confusion in the original error message.

### CBUAE (FX)

**GCC support:** ✅ Fully supports AED pairs. Called via `registry.fxLocalized` when `base` or `target` is `'AED'`.

## LLM Model Configuration

```typescript
// server/services/capabilityRegistry.ts — Active config: rollback
'ada-classifier' → gpt-4.1-nano    (intent classification)
'ada-fast'       → gpt-4.1-mini    (Lane 1 responses)
'ada-content'    → gpt-4.1-mini    (Discover pipeline)
'ada-reason'     → gpt-4.1         (Lane 2 complex reasoning)
'ada-embeddings' → text-embedding-3-small
'ada-moderation' → omni-moderation-latest
'ada-fallback'   → claude-sonnet-4-6
```

Default config is `rollback` (set in `resolveConfigName()` in `capabilityRegistry.ts`). The `beta` config uses GPT-5.4 family but those models are not available on OpenAI's API.

**No hardcoded model strings found in provider files** — all LLM calls use `resolveModel(alias)` from the capability registry.

---

# 7. AI Orchestration & Agent Flow

## Model Registry / Alias System

The model registry uses a named-config pattern with two configurations:

```typescript
// server/services/capabilityRegistry.ts, line 30
const NAMED_CONFIGS: Record<ModelConfigName, Record<string, ModelConfigEntry>> = {
  beta: { /* GPT-5.4 family */ },
  rollback: {
    'ada-classifier': { model: 'gpt-4.1-nano', capabilities: ['json_mode', 'fast_response'], costTier: 'low' },
    'ada-fast':       { model: 'gpt-4.1-mini', capabilities: ['streaming', 'tool_calling', 'json_mode', 'fast_response'], costTier: 'low' },
    'ada-reason':     { model: 'gpt-4.1',      capabilities: ['streaming', 'tool_calling', 'json_mode', 'reasoning', 'long_context'], costTier: 'medium' },
    'ada-fallback':   { model: 'claude-sonnet-4-6', capabilities: ['streaming', 'tool_calling', 'reasoning', 'long_context'], costTier: 'medium' },
    // ...
  },
};
```

Per-alias env var overrides: `ADA_MODEL_CLASSIFIER`, `ADA_MODEL_FAST`, `ADA_MODEL_REASON`, `ADA_MODEL_CONTENT`, `ADA_MODEL_FALLBACK`.

## Classifier / Intent Routing

11 intents defined in `server/services/intentClassifier.ts`:

```typescript
export type Intent = 'balance_query' | 'portfolio_explain' | 'allocation_breakdown' |
  'goal_progress' | 'market_context' | 'news_explain' | 'scenario_analysis' |
  'recommendation_request' | 'execution_request' | 'support' | 'general';
```

The classifier prompt (line 71):
> "You are an intent classifier for a wealth management AI copilot serving GCC HNW investors."

Intent definitions relevant to market data:
- `market_context`: "Questions about market conditions, interest rates, economic indicators, sector trends, inflation, GDP, macro outlook, currency conversion, exchange rates, FX rates, historical prices, company profiles"
- `news_explain`: "Questions about specific news, headlines, what happened, why did X move, earnings, company events"

The classifier uses the `ada-classifier` model (gpt-4.1-nano) with JSON mode. It also receives the last 4 conversation turns for context-aware follow-up handling.

## Lane-Based Routing

```typescript
// server/services/modelRouter.ts
Lane 0 (Deterministic): balance_query, allocation_breakdown, goal_progress
  → Uses ada-fast, no reasoning, fast response
  → Defined in DETERMINISTIC_INTENTS set (modelRouter.ts, line 78)
Lane 1 (Standard): portfolio_explain, market_context, news_explain, support, general
  → Uses ada-fast (gpt-4.1-mini), tool calling enabled
Lane 2 (Complex): scenario_analysis, recommendation_request, execution_request
  → Uses ada-reason (gpt-4.1), full reasoning + tool calling
```

For a market data query like "What's the current price of Emaar?", the intent is classified as `market_context` → routed to **Lane 1** → uses `ada-fast` (gpt-4.1-mini).

## Tool/Function Calling — Market Data Tools

### `getQuotes` Tool Definition

```typescript
// server/services/toolRegistry.ts, line 79
{
  name: 'getQuotes',
  group: 'market_intel',
  profile: 'market_read',
  definition: {
    type: 'function',
    function: {
      name: 'getQuotes',
      description: 'Get real-time market quotes for given symbols: last price, daily change %, volume, high/low. Call this when the user asks about stock prices or market data.',
      parameters: {
        type: 'object',
        properties: {
          symbols: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of ticker symbols to get quotes for (e.g., ["AAPL", "NVDA", "BTC"])',
          },
        },
        required: ['symbols'],
      },
    },
  },
  execute: async (args, _userId, registry) => {
    const symbols = (args.symbols as string[]) ?? [];
    return registry.market.getQuotes(symbols);
  },
  suggestions: {
    forIntentWithKeywords: [
      { intent: 'market_context', keywords: ['__TICKER__'] },
      { intent: 'news_explain', keywords: ['__TICKER__'] },
    ],
  },
}
```

**Critical issue (F-08):** The tool description uses only US examples: `["AAPL", "NVDA", "BTC"]`. The LLM has no guidance that GCC tickers like `EMAAR`, `FAB`, or `ARAMCO` are valid symbols. The LLM may still call `getQuotes(['EMAAR'])` because the classifier detects `market_context` intent with a ticker entity, but there's no guarantee.

### `getHistoricalPrices` Tool Definition

```typescript
// server/services/toolRegistry.ts, line 147
{
  name: 'getHistoricalPrices',
  description: 'Get historical price data for a stock or ETF over a specified number of days.',
  parameters: {
    properties: {
      symbol: { type: 'string', description: 'The ticker symbol (e.g., "AAPL", "NVDA")' },
      days: { type: 'number', description: 'Number of days of history to retrieve' },
    },
    required: ['symbol'],
  },
}
```

### `getCompanyProfile` Tool Definition

```typescript
// server/services/toolRegistry.ts, line 179
{
  name: 'getCompanyProfile',
  description: 'Get detailed company information: name, industry, sector, market cap, exchange, country, website.',
  parameters: {
    properties: {
      symbol: { type: 'string', description: 'The ticker symbol (e.g., "AAPL", "MSFT")' },
    },
    required: ['symbol'],
  },
}
```

### Other Relevant Tools

| Tool | Group | Description |
|------|-------|-------------|
| `getPortfolioSnapshot` | financial_data | Portfolio value, daily change, cash %, P&L |
| `getHoldings` | financial_data | Holdings with weights, sectors, geographies |
| `getHoldingsRelevantNews` | market_intel | News for portfolio holdings |
| `getMacroIndicator` | market_intel | FRED macro data (CPI, GDP, yields) |
| `getFxRate` | market_intel | FX rates (ECB + CBUAE for AED) |
| `getCompanyFilings` | market_intel | SEC EDGAR filings |
| `lookupInstrument` | market_intel | OpenFIGI identifier resolution |
| `calculatePortfolioHealth` | financial_data | Health score, diversification analysis |
| `route_to_advisor` | crm_actions | Escalate to human advisor |

## System Prompts Referencing Markets

```typescript
// server/services/promptBuilder.ts, line 163
'• getQuotes — live stock/ETF prices from Finnhub (fallback: Yahoo Finance)'
'• getHistoricalPrices — price history/charts for a symbol over N days'
'• getCompanyProfile — company info (industry, market cap, sector, exchange)'
```

**Issue (F-09):** The tool guide tells the LLM that quotes come "from Finnhub (fallback: Yahoo Finance)" — after Twelve Data integration, this needs updating to reflect the new primary provider.

## Fallback Behavior — "I don't have live price data"

When the LLM calls `getQuotes(['EMAAR'])` and both Finnhub and Yahoo Finance fail:

1. Finnhub returns `c:0` → `throw new Error('No quote data for EMAAR')` → fallback chain catches → tries Yahoo Finance
2. Yahoo Finance throws (unknown symbol `EMAAR`) → fallback chain catches → tries mock provider
3. Mock provider returns the **seed data** quote (`price: 9.85, source_provider: 'mock'`) → `toolOk`

The LLM receives the mock data and may respond with it, OR the LLM may recognize the `source_provider: 'mock'` and decide to say "I don't have live price data." The exact response depends on the LLM's interpretation.

**However**, if Finnhub fails with an error status (not an exception), the fallback chain continues. The current behavior depends on whether the empty/zero response is caught as an error or silently passed as "ok with zero data."

## Emaar Query Trace

**Query:** *"What's the current price of Emaar stock in UAE?"*

> **Note:** Steps 1-5 and 10-12 describe the deterministic code path verified from source. Steps 6-9 describe the *expected* LLM behavior based on the classifier prompt and tool definitions — actual LLM outputs may vary at runtime.

```
Step 1: User types message in ChatScreen.tsx input
  → Verified: ChatScreen uses useStreamingChat hook

Step 2: Frontend sends POST /api/chat/stream
  → Verified: server/routes/api.ts, line 230 — sets Content-Type: text/event-stream
  → Payload: { message, threadId, userId }

Step 3: Backend receives at server/routes/api.ts, line 248
  → Calls orchestrateStream() — an async generator (agentOrchestrator.ts, line 190)
  → api.ts iterates the generator: for await (const event of orchestrateStream(...))
  → Each yielded event written as: id: <seqId>\ndata: <JSON>\n\n

Step 4: PII scan runs (piiDetector.ts) — deterministic regex scan
  → "Emaar stock in UAE" contains no PII patterns → passes through

Step 5: Input moderation runs (moderationService.ts)
  → Calls OpenAI omni-moderation-latest → expected: not flagged

Step 6: Intent classifier runs (intentClassifier.ts, line 71):
  → Model: gpt-4.1-nano via resolveModel('ada-classifier')
  → Prompt: "You are an intent classifier for a wealth management AI copilot serving GCC HNW investors..."
  → Message contains keywords: "price", "stock" → matches market_context rule (line 261)
  → Expected output (hypothetical): { intent: "market_context", needs_live_data: true,
    needs_tooling: true, mentioned_entities: ["EMAAR"] }
  → Fallback classifier (line 261) also maps "stock price", "share price" → market_context

Step 7: Model router (modelRouter.ts, routeRequest()):
  → market_context is NOT in DETERMINISTIC_INTENTS (line 78) → not Lane 0
  → market_context is not scenario_analysis/recommendation/execution → not Lane 2
  → Falls to Lane 1 (line 176): ada-fast → gpt-4.1-mini
  → Tool groups: ['financial_data', 'market_intel']

Step 8: Prompt builder (promptBuilder.ts) constructs system prompt:
  → buildToolRulesBlock() includes (line 163):
    "getQuotes — live stock/ETF prices from Finnhub (fallback: Yahoo Finance)"
  → buildGroundingRules() (line 204):
    "Market claims (prices, changes, trends) MUST come from tool data"

Step 9: LLM streaming loop begins (openaiClient.ts):
  → Expected: LLM calls getQuotes({"symbols": ["EMAAR"]}) based on tool definitions
  → toolRegistry.ts execute (line 100): passes bare symbols to registry.market.getQuotes(symbols)
  → No symbol normalization occurs — "EMAAR" sent as-is to provider chain

Step 10: Provider fallback chain executes (registry.ts, withFallbackChain):
  a. Finnhub receives bare "EMAAR":
     → finnhubFetch('/quote', { symbol: 'EMAAR' }) (finnhub.ts, line 52)
     → API: GET https://finnhub.io/api/v1/quote?symbol=EMAAR&token=...
     → Finnhub returns: { c: 0 } (no data for GCC tickers)
     → Code path: data.c === 0 → throw new Error('No quote data for EMAAR') (line 53-54)
     → Fallback chain catches → console.warn "[market] finnhub returned error..." (registry.ts, line 60-61)

  b. Yahoo Finance receives bare "EMAAR":
     → yf.quote("EMAAR") (yahooFinance.ts, line 50)
     → yahoo-finance2 library: symbol not found OR resolves to EMAAR.DU (Düsseldorf)
     → Throws exception → caught by fallback chain (registry.ts, line 73-75)

  c. Mock provider receives "EMAAR":
     → Queries market_quotes table WHERE symbol = 'EMAAR' AND source_provider = 'mock'
     → Returns seed data: { price: 9.85, change: 0.12, source_provider: 'mock' }
     → Wrapped in toolOk with warnings array including:
       "fallback_chain:finnhub->yahoo_finance->mock"
       "primary_skipped:finnhub"

Step 11: LLM receives tool result containing mock data + fallback warnings
  → The LLM's response depends on how it interprets source_provider: 'mock'
  → May return mock price, or may say "I don't have live price data"
  → This is non-deterministic LLM behavior — not verifiable from code alone

Step 12: Generator yields events → api.ts writes SSE frames
  → res.write(`id: ${seqId}\ndata: ${JSON.stringify(event)}\n\n`) (api.ts, line 253)
  → Final event: { type: 'done' }
```

**Root cause summary:** Neither Finnhub nor Yahoo Finance supports GCC exchange tickers. The bare symbol `EMAAR` has no exchange context. Even if the LLM tried `EMAAR.DFM`, neither provider supports DFM exchange. The system falls through to mock data.

---

# 8. Current Market Data Capabilities

## Capability Matrix

| Capability | Status | Provider | Notes |
|-----------|--------|----------|-------|
| Live quotes (US) | ✅ Working | Finnhub → Yahoo Finance fallback | Free tier, 55 req/min |
| Live quotes (UAE/GCC) | ❌ Not available | None | Finnhub/Yahoo don't cover DFM/ADX |
| Delayed quotes | ⚠️ Partial | Finnhub (15-min delay on free tier) | US only |
| EOD prices | ⚠️ Partial | Finnhub candle API | US only |
| Historical time series | ✅ Working | Finnhub → Yahoo Finance | US instruments only |
| Company profiles | ✅ Working | Finnhub → Yahoo Finance | US instruments only |
| Symbol search/lookup | ⚠️ Partial | OpenFIGI | Resolves ISIN/FIGI but not exchange-specific symbols |
| Market movers | ❌ Not available | None | Not implemented |
| News by ticker | ✅ Working | Finnhub → Yahoo Finance | US-centric; GCC news via general feed only |
| DFM exchange coverage | ❌ Not available | None | No provider covers Dubai Financial Market |
| ADX exchange coverage | ❌ Not available | None | No provider covers Abu Dhabi Securities Exchange |
| KSA (Tadawul) coverage | ❌ Not available | None | No provider covers Saudi Stock Exchange |

## Symbol Normalization Analysis

**Current state: No normalization exists.**

| Symbol | Exchange | Finnhub sends | Yahoo sends | Twelve Data expects | DB stores |
|--------|----------|---------------|-------------|---------------------|-----------|
| EMAAR | DFM | `EMAAR` ❌ | `EMAAR` ❌ → `.DU` (Düsseldorf) | `EMAAR:DFM` | `EMAAR` + `exchange='DFM'` |
| FAB | ADX | `FAB` ❌ | `FAB` ❌ | `FAB:ADX` | `FAB` + `exchange='ADX'` |
| ARAMCO | Tadawul | `ARAMCO` ❌ | `2222.SR` (Yahoo format) | `2222:TADAWUL` | `ARAMCO` + `exchange='TADAWUL'` |
| AAPL | NASDAQ | `AAPL` ✅ | `AAPL` ✅ | `AAPL` | `AAPL` + `exchange='NASDAQ'` |

**Where normalization breaks:**
1. The LLM calls `getQuotes(['EMAAR'])` with the bare ticker
2. The `execute` function in `toolRegistry.ts` passes it directly to `registry.market.getQuotes(symbols)`
3. The provider receives `EMAAR` with no exchange context
4. Finnhub's US-centric API returns zero data
5. Yahoo Finance either fails or resolves to the wrong exchange (Düsseldorf `.DU`)

**What's needed:**
- A normalization function that looks up `instruments.exchange` for a given symbol
- Maps `(symbol, exchange)` → provider-specific format (e.g., `EMAAR` + `DFM` → `EMAAR:DFM` for Twelve Data)
- Should run **inside the Twelve Data provider** before making API calls, not in the tool registry (keeps provider-specific logic encapsulated)

## Exchange Suffix / MIC Code Handling

**Not found in codebase.** No files contain MIC codes (XDFM, XADS), no exchange suffix maps, no `.DFM`/`.DU`/`:DFM` translation logic.

---

# 9. API & Endpoint Map

## Market Data / Chat / Content Routes

| Method | Path | Handler | Purpose | Upstream Provider | Frontend Consumer |
|--------|------|---------|---------|-------------------|-------------------|
| POST | `/api/chat/stream` | `api.ts` → `orchestrateStream` | Chat with AI (SSE) | OpenAI + all providers via tools | `ChatScreen.tsx` |
| POST | `/api/chat/message` | `api.ts` → `orchestrateStream` | Chat (sync) | Same as above | — |
| GET | `/api/chat/threads` | `api.ts` | List chat threads | PostgreSQL | `useChatThreads` |
| GET | `/api/chat/:threadId/messages` | `api.ts` | Thread message history | PostgreSQL | `useChatMessages` |
| GET | `/api/wealth/overview` | `api.ts` | Portfolio overview | PostgreSQL (mock portfolio) | `usePortfolio` |
| GET | `/api/wealth/holdings` | `api.ts` | Holdings list | PostgreSQL | `useHoldings` |
| GET | `/api/wealth/allocation` | `api.ts` | Asset allocation | PostgreSQL | `useAllocations` |
| GET | `/api/wealth/goals` | `api.ts` | Financial goals | PostgreSQL | `useGoals` |
| GET | `/api/home/summary` | `api.ts` | Home screen summary | PostgreSQL | Home screen |
| GET | `/api/morning-sentinel/stream` | `api.ts` | Morning briefing SSE | OpenAI + providers | `useMorningSentinel` |
| GET | `/api/content/discover` | `api.ts` | Discover feed | PostgreSQL (materialized) | `useContent` |
| GET | `/api/providers/status` | `api.ts` | Provider health status | In-memory health counters | Admin/debug |
| GET | `/api/discover/health` | `api.ts` | Pipeline health | PostgreSQL + in-memory | Admin/debug |
| GET | `/api/health` | `index.ts` | Basic health check | — | — |

---

# 10. Environment & Configuration

## All Environment Variables

| Env Var | Purpose | Required | Category |
|---------|---------|----------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | Core |
| `SESSION_SECRET` | Express session signing key | Yes | Core |
| `NODE_ENV` | production / development toggle | No | Core |
| `REPLIT_DOMAINS` | Replit domain detection | Auto-set | Core |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | OpenAI API key | Yes | LLM |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | OpenAI base URL override | No | LLM |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Anthropic API key | No | LLM |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Anthropic base URL override | No | LLM |
| `MODEL_CONFIG` | Model config name (`beta` / `rollback`) | No (default: `rollback`) | LLM |
| `ADA_MODEL_CLASSIFIER` | Override classifier model | No | LLM |
| `ADA_MODEL_FAST` | Override fast model | No | LLM |
| `ADA_MODEL_REASON` | Override reason model | No | LLM |
| `ADA_MODEL_CONTENT` | Override content model | No | LLM |
| `ADA_MODEL_FALLBACK` | Override fallback model | No | LLM |
| `FINNHUB_API_KEY` | Finnhub API key | Yes (for live market) | Provider |
| `FRED_API_KEY` | FRED API key | Yes (for macro) | Provider |
| `OPENFIGI_API_KEY` | OpenFIGI API key | No | Provider |
| `EDGAR_USER_AGENT` | SEC EDGAR user agent | Yes (for filings) | Provider |
| `MARKET_PROVIDER_PRIMARY` | Primary market provider key | No (default: `finnhub`) | Routing |
| `MARKET_PROVIDER_SECONDARY` | Secondary market provider key | No | Routing |
| `MARKET_PROVIDER_FALLBACK` | Fallback market provider key | No | Routing |
| `NEWS_PROVIDER_PRIMARY` | Primary news provider key | No (default: `finnhub`) | Routing |
| `NEWS_PROVIDER_SECONDARY` | Secondary news provider key | No | Routing |
| `FX_PROVIDER_PRIMARY` | Primary FX provider key | No (default: `frankfurter`) | Routing |
| `FX_PROVIDER_LOCALIZED` | Localized FX provider key | No (default: `cbuae`) | Routing |
| `MACRO_PROVIDER_PRIMARY` | Primary macro provider key | No (default: `fred`) | Routing |
| `FILING_PROVIDER_PRIMARY` | Primary filing provider key | No (default: `sec_edgar`) | Routing |
| `IDENTITY_PROVIDER_PRIMARY` | Primary identity provider key | No (default: `openfigi`) | Routing |
| `PIPELINE_INGEST_INTERVAL_MIN` | Pipeline ingest interval (min) | No (default: 10) | Pipeline |
| `PIPELINE_CLUSTER_INTERVAL_MIN` | Pipeline cluster interval (min) | No (default: 15) | Pipeline |
| `PIPELINE_MATERIALIZE_INTERVAL_MIN` | Pipeline materialize interval (min) | No (default: 60) | Pipeline |
| `PIPELINE_EDITORIAL_INTERVAL_MIN` | Pipeline editorial interval (min) | No (default: 360) | Pipeline |
| `PIPELINE_EXPIRY_INTERVAL_MIN` | Pipeline expiry interval (min) | No (default: 240) | Pipeline |
| `PIPELINE_MORNING_INTERVAL_MIN` | Pipeline morning interval (min) | No (default: 360) | Pipeline |
| `ADMIN_DEFAULT_PASSWORD` | Admin user initial password | No | Admin |

## New Env Vars for Twelve Data

| Env Var | Purpose | Required |
|---------|---------|----------|
| `TWELVE_DATA_API_KEY` | Twelve Data API key | Yes |
| `MARKET_PROVIDER_PRIMARY` | Set to `twelve_data` to make it primary | Recommended |
| `MARKET_PROVIDER_SECONDARY` | Set to `finnhub` as secondary | Recommended |

## Config Pattern

- **Env var access**: Direct `process.env.X` throughout codebase — no centralized config module
- **Provider routing**: Centralized in `registry.ts` via `getChainKeys()` function reading `MARKET_PROVIDER_PRIMARY`, `_SECONDARY`, `_FALLBACK`
- **Model config**: Centralized in `capabilityRegistry.ts` with named configs
- **Secrets**: Managed via Replit Secrets (not `.env` files)

---

# 11. Observability & Failure Handling

- **Provider failures logged**: `console.warn` in `registry.ts` fallback chain: `"[market] finnhub returned error, trying next provider in chain"`
- **Health tracking**: Sliding-window health counters in `helpers.ts` — 5-minute window, 50% failure rate threshold, minimum 5 attempts before degradation
- **Provider fallback events persisted**: `provider_fallback_events` table records every fallback (original_alias, fallback_alias, failure_reason, switch_cost_ms)
- **Agent traces persisted**: `agent_traces` table records LLM calls with `prompt_tokens`, `completion_tokens`, `provider_alias`, `latency_ms`
- **Errors in chat UI**: Error SSE events render as red-tinted messages; LLM generates natural language error descriptions
- **No structured alerting**: No PagerDuty, Slack webhooks, or email alerts for provider failures
- **Provider status endpoint**: `GET /api/providers/status` exposes in-memory health counters
- **Cache stats**: Included as warnings in every `toolOk` response: `cache:hits=X,misses=Y,size=Z`

**What would make Twelve Data failures diagnosable:**
- Provider health tracking already works — Twelve Data will automatically get sliding-window tracking via `recordProviderSuccess`/`recordProviderFailure`
- Fallback events will be logged to `provider_fallback_events` table
- Add `twelve_data` to the `GET /api/providers/status` response (automatic if using `helpers.ts`)

---

# 12. Compliance & Guardrails

- **Execution boundary enforcement**: `guardrails.ts` runs regex patterns to catch and replace any LLM text claiming to execute trades. 7 pattern sets + hard check
- **Financial disclaimers**: Appended via guardrails `appendedDisclosures`. The prompt instructs "If disclosures are required, they will be appended automatically — do not add your own disclaimers"
- **Non-advisory messaging**: `policyEngine.ts` enforces `education_only` mode for certain risk profiles, blocking "you should buy/sell" language
- **Data grounding rules**: Prompt builder includes "NEVER invent portfolio values, prices, account balances, or performance figures"
- **Caching for delayed vs real-time**: Cache TTL for quotes is 120 seconds (`cache.ts` line 10). This is appropriate for Twelve Data's basic plan (delayed data) but should be shortened for real-time feeds if upgraded
- **Twelve Data attribution**: Twelve Data's terms require attribution ("Powered by Twelve Data"). This should be added to responses where Twelve Data is the source

---

# 13. Integration Readiness Assessment

## Best Insertion Point

**New file: `server/providers/twelveData.ts`**

Following the exact pattern of `finnhub.ts`:
1. Import `MarketProvider` from `./types`
2. Import `toolOk`, `toolError`, `checkRateLimit`, `recordProviderSuccess`, `recordProviderFailure`, `fetchWithTimeout` from `./helpers`
3. Import `cacheGet`, `cacheSet`, `cacheKey` from `./cache`
4. Implement 4 methods: `getQuotes`, `getHistoricalPrices`, `getCompanyProfile`, `getEarningsCalendar`
5. Add symbol normalization logic (query `instruments.exchange` or use a static map)

**Registration: `server/providers/registry.ts`**

Add one case to `resolveMarketProvider()`:
```typescript
case 'twelve_data':
  return twelveDataMarketProvider;
```

## Integration Pattern

**New provider adapter** — this is the correct pattern. The `MarketProvider` interface, fallback chain, caching, rate limiting, and health tracking are all designed for exactly this use case. Do NOT make it an LLM-callable tool — it should be a provider that `getQuotes` already dispatches to.

## Multi-Provider Fallback Support

✅ **Yes, fully supported.** The `withFallbackChain()` function in `registry.ts` creates a Proxy that:
1. Tries the primary provider
2. On error or `status: 'error'`, moves to the next in chain
3. Checks health before attempting (skips unhealthy providers)
4. Appends `fallback_chain:` and `primary_skipped:` warnings to results

Setting `MARKET_PROVIDER_PRIMARY=twelve_data` and `MARKET_PROVIDER_SECONDARY=finnhub` would create: Twelve Data → Finnhub → Yahoo Finance → Mock.

## Minimum Code Change for EMAAR Price in Chat

1. **`server/providers/twelveData.ts`** — New file (~200 lines), implementing `MarketProvider` with `getQuotes` calling Twelve Data `/quote` endpoint with symbol normalization (`EMAAR` → `EMAAR:DFM`)
2. **`server/providers/registry.ts`** — Add `import` + 1 `case` statement in `resolveMarketProvider()` (~3 lines)
3. **Environment** — Set `TWELVE_DATA_API_KEY` and `MARKET_PROVIDER_PRIMARY=twelve_data`
4. **Optionally**: Update `promptBuilder.ts` tool guide text from "Finnhub (fallback: Yahoo Finance)" to include Twelve Data

**That's it.** No schema changes, no frontend changes, no new tools, no new routes.

## Realistic Effort for Day-1 Demo

| Task | Effort |
|------|--------|
| Write `twelveData.ts` provider (4 methods + normalization) | 2-3 hours |
| Add to registry + set env vars | 15 minutes |
| Test with EMAAR, FAB, ARAMCO queries in chat | 30 minutes |
| Update prompt builder tool guide | 15 minutes |
| **Total** | **~3-4 hours** |

---

# 14. Gap Analysis

## 14.1 Functional Gaps

| Gap | Description | Severity |
|-----|-------------|----------|
| No GCC live quotes | No provider covers DFM, ADX, or Tadawul exchanges | Critical |
| No symbol normalization | Bare tickers sent to providers with no exchange context | Critical |
| No market movers | No "top gainers/losers" capability for any exchange | Low |
| No intraday charts | Historical prices available but no intraday tick data | Low |
| US-centric tool descriptions | LLM tool examples only reference US tickers | Medium |

## 14.2 Data Model Gaps

| Gap | Description | Severity |
|-----|-------------|----------|
| No provider-specific symbol column | `instruments` stores bare `symbol` only; no `twelve_data_symbol` or `provider_symbols` JSONB | Medium (can use in-provider normalization) |
| No exchange MIC codes | `exchange` stores informal names (`DFM`, `ADX`) not ISO MIC codes (`XDFM`, `XADS`) | Low (Twelve Data uses informal names too) |
| FIGI empty for GCC | `figi` column is NULL for all GCC instruments | Low (not blocking) |
| No historical quote table | Only current-day snapshot in `market_quotes`; no time-series price storage | Low (historical fetched on-demand from API) |

## 14.3 API/Service Layer Gaps

| Gap | Description | Severity |
|-----|-------------|----------|
| No Twelve Data provider file | `server/providers/twelveData.ts` does not exist | Critical (must create) |
| No `twelve_data` case in registry | `resolveMarketProvider()` has no `twelve_data` case | Critical (1 line) |
| Prompt builder hardcodes "Finnhub" | Tool guide says "live stock/ETF prices from Finnhub" | Medium (misleading to LLM) |
| Rate limit untested for 8/min | Twelve Data free tier is 8 req/min; `checkRateLimit` supports custom limits but needs correct value | Medium |

## 14.4 Frontend Gaps

| Gap | Description | Severity |
|-----|-------------|----------|
| No currency formatting for AED/SAR | `HoldingsSummary` and `PortfolioSummaryWidget` may not format non-USD currencies correctly | Low (verify) |
| No "Powered by Twelve Data" attribution | Twelve Data TOS requires attribution in UI | Medium (add to response footer) |
| No exchange badge on price display | Chat doesn't show which exchange a price came from | Low (nice-to-have) |

---

# 15. Open Questions

1. **Which Twelve Data plan tier will be used?** Free tier = 8 req/min, 800/day. Basic = 30 req/min. Pro = unlimited. This determines rate limit configuration and whether real-time websockets are available.
2. **Is real-time data required for the ENBD demo, or is delayed/EOD acceptable?** Twelve Data free tier provides delayed data (15 min). Real-time requires a paid plan.
3. **Which specific GCC tickers must work for the demo?** Minimum: EMAAR (DFM), FAB (ADX), ARAMCO (Tadawul). Are there others (e.g., DIB, ETISALAT, QNB)?
4. **What is the exact Twelve Data symbol format for GCC stocks?** Need to verify: is it `EMAAR:DFM`, `EMAAR.DFM`, or something else? Twelve Data docs suggest colon format (`symbol:exchange`).
5. **Should Twelve Data replace Finnhub as primary, or complement it?** Recommendation: Twelve Data primary for GCC, Finnhub secondary for US, with automatic fallback.
6. **Is Finnhub actively needed or can it be dropped?** Finnhub provides earnings calendar and company news that Twelve Data may not. Keep as secondary.
7. **Does Twelve Data support the 5 GCC instruments already in the seed data?** Need to verify API coverage for EMAAR, FAB, ADNOCDIST, ARAMCO, STC.
8. **Are ISINs useful for Twelve Data lookups?** The `instruments` table has ISINs for all GCC stocks. Twelve Data may support ISIN-based lookups.

---

# 16. Appendix

## 16.1 Key File Inventory

| # | File | Purpose |
|---|------|---------|
| 1 | `server/providers/registry.ts` | Provider factory + fallback chain proxy — add `twelve_data` case here |
| 2 | `server/providers/types.ts` | `MarketProvider` interface (4 methods to implement) |
| 3 | `server/providers/finnhub.ts` | Reference implementation for Twelve Data provider |
| 4 | `server/providers/yahooFinance.ts` | Second reference implementation |
| 5 | `server/providers/helpers.ts` | `toolOk`, `toolError`, `checkRateLimit`, health tracking |
| 6 | `server/providers/cache.ts` | In-memory TTL cache (120s for quotes) |
| 7 | `server/providers/mock/marketProvider.ts` | Mock market provider (DB-backed seed data) |
| 8 | `server/services/toolRegistry.ts` | Tool manifests — `getQuotes` definition + executor |
| 9 | `server/services/agentOrchestrator.ts` | Orchestration loop — calls tools, streams response |
| 10 | `server/services/intentClassifier.ts` | Intent classification (11 intents incl. `market_context`) |
| 11 | `server/services/modelRouter.ts` | Lane routing (Lane 1 for market queries) |
| 12 | `server/services/capabilityRegistry.ts` | Model config (rollback = GPT-4.1 family) |
| 13 | `server/services/promptBuilder.ts` | System prompt — tool guide text needs updating |
| 14 | `server/services/openaiClient.ts` | Resilient streaming + completion wrapper |
| 15 | `server/services/guardrails.ts` | Execution boundary enforcement |
| 16 | `server/services/policyEngine.ts` | Tenant policy engine |
| 17 | `server/services/wealthEngine.ts` | Portfolio health calculations |
| 18 | `server/services/financialTools.ts` | Tool execution wrapper |
| 19 | `server/services/memoryService.ts` | Working/episodic/semantic memory |
| 20 | `server/services/responseBuilder.ts` | Post-LLM response processing |
| 21 | `server/db/schema.sql` | Database DDL (instruments, market_quotes) |
| 22 | `server/db/seed.sql` | GCC instrument seed data |
| 23 | `server/routes/api.ts` | All API route definitions |
| 24 | `server/index.ts` | Express boot + middleware |
| 25 | `server/middleware/auth.ts` | Session-based auth |
| 26 | `src/components/screens/ChatScreen.tsx` | Chat UI container |
| 27 | `src/components/ada/ChatWidgets.tsx` | Market data widgets |
| 28 | `src/components/ada/ChatMessage.tsx` | Message rendering |
| 29 | `src/hooks/usePortfolio.ts` | Portfolio data hook |
| 30 | `shared/schemas/agent.ts` | Shared TypeScript types (MarketQuote, ToolResult) |

## 16.2 Request Flow Diagrams

### Chat Message → Market Data Response

```
User Input
  │
  ▼
POST /api/chat/stream (server/routes/api.ts)
  │
  ▼
orchestrateStream() (agentOrchestrator.ts)
  │
  ├─ PII Scan (piiDetector.ts)
  ├─ Input Moderation (moderationService.ts)
  │
  ▼
classifyIntentAsync() (intentClassifier.ts)
  │ model: ada-classifier (gpt-4.1-nano)
  │ output: { intent: "market_context", mentioned_entities: ["EMAAR"] }
  │
  ▼
routeRequest() (modelRouter.ts)
  │ Lane 1 → ada-fast (gpt-4.1-mini)
  │ Tool groups: [financial_data, market_intel]
  │
  ▼
buildSystemPrompt() (promptBuilder.ts)
  │ Includes: tool guide, grounding rules, user profile
  │
  ▼
LLM Streaming Loop (openaiClient.ts)
  │
  ├─ LLM calls getQuotes(["EMAAR"])
  │     │
  │     ▼
  │   toolRegistry.execute() → registry.market.getQuotes(["EMAAR"])
  │     │
  │     ▼
  │   Fallback Chain (registry.ts withFallbackChain)
  │     ├─ Finnhub: quote?symbol=EMAAR → c:0 → ERROR
  │     ├─ Yahoo Finance: yf.quote("EMAAR") → THROW
  │     └─ Mock: market_quotes WHERE symbol='EMAAR' → { price: 9.85 }
  │     │
  │     ▼
  │   ToolResult returned to LLM context
  │
  ├─ LLM generates response text
  │
  ▼
Output Moderation → Guardrails → Response Builder
  │
  ▼
SSE Stream → Client (event: text, event: done)
```

### Discover Tab Content Loading

```
GET /api/content/discover?tab=forYou (server/routes/api.ts)
  │
  ▼
Check user_discover_feed cache (PostgreSQL)
  │
  ├─ Cache HIT → Return pre-scored cards
  │
  └─ Cache MISS → Live scoring:
       │
       ▼
     feedMaterializer.ts
       ├─ Fetch active discover_cards
       ├─ Weighted scoring (portfolio relevance, suitability, freshness)
       ├─ Composition guardrails (max 2/asset class, GCC card in top 5)
       ├─ LLM personalized overlays (top 3 cards)
       └─ Return scored + ranked feed
```

### Portfolio Data Loading

```
GET /api/wealth/overview (server/routes/api.ts)
  │
  ▼
portfolioRepository.ts → PostgreSQL
  │
  ├─ portfolio_snapshots (total value, daily change)
  ├─ positions JOIN instruments (holdings with details)
  ├─ accounts (connected accounts)
  └─ performance_history (time-series returns)
  │
  ▼
JSON response → usePortfolio hook → Wealth tab UI
```

## 16.3 Key Code Snippets

### Intent Classifier — market_context Rule

```typescript
// server/services/intentClassifier.ts, line 261
{
  intent: 'market_context',
  keywords: [
    'market', 'stock price', 'share price', 'trading',
    'index', 'dow', 's&p', 'nasdaq', 'interest rate',
    'inflation', 'gdp', 'yield', 'economic', 'macro',
    'sector', 'industry', 'currency', 'exchange rate', 'fx',
  ],
  priority: 5,
}
```

### Market Data Fetch — Finnhub getQuotes

```typescript
// server/providers/finnhub.ts, line 36
async getQuotes(symbols: string[]): Promise<ToolResult> {
  const start = Date.now();
  if (!getApiKey()) {
    return toolError('finnhub', 'market_api', 'FINNHUB_API_KEY not configured', start);
  }
  try {
    const quotes: MarketQuote[] = [];
    const results = await Promise.allSettled(
      symbols.map(async (sym) => {
        const upper = sym.toUpperCase();
        const data = await finnhubFetch('/quote', { symbol: upper });
        if (!data || data.c === 0 || data.c === undefined) {
          throw new Error(`No quote data for ${upper}`);
        }
        const quote: MarketQuote = {
          symbol: upper,
          price: data.c,
          change: data.d ?? 0,
          change_percent: data.dp ?? 0,
          currency: 'USD',
          source_provider: 'finnhub',
          as_of: new Date().toISOString(),
        };
        cacheSet(ck, quote, 'quote');
        return quote;
      }),
    );
    // ... handle results
  }
}
```

### Fallback Chain Proxy

```typescript
// server/providers/registry.ts, line 27
function withFallbackChain<T extends { name: string }>(providers: T[], domain: string): T {
  const handler: ProxyHandler<T> = {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (typeof val !== 'function') return val;
      return async (...args: unknown[]) => {
        for (let i = 0; i < providers.length; i++) {
          const provider = providers[i];
          if (!isProviderHealthy(provider.name)) continue;
          try {
            const result = await fn.apply(provider, args);
            if (result.status === 'error' && i < providers.length - 1) continue;
            if (!isPrimary) {
              result.warnings = [...(result.warnings ?? []),
                `fallback_chain:${providers.slice(0, i + 1).map(p => p.name).join('->')}`,
              ];
            }
            return result;
          } catch (err) {
            if (i < providers.length - 1) continue;
            throw err;
          }
        }
      };
    },
  };
  return new Proxy(primary, handler);
}
```

### Tool Definitions Available to the LLM

```typescript
// server/services/toolRegistry.ts — all tool names
const tools = [
  'getPortfolioSnapshot',     // Portfolio value, daily change, P&L
  'getHoldings',              // Holdings with weights, sectors
  'getQuotes',                // Live market quotes (symbols[])
  'getHoldingsRelevantNews',  // News for portfolio holdings
  'getHistoricalPrices',      // Price history (symbol, days)
  'getCompanyProfile',        // Company info (symbol)
  'getMacroIndicator',        // FRED macro data (seriesIds[])
  'getCompanyFilings',        // SEC EDGAR filings
  'lookupInstrument',         // OpenFIGI identifier resolution
  'getFxRate',                // FX rates (base, target, date?)
  'calculatePortfolioHealth', // Health score, diversification
  'route_to_advisor',         // Escalate to human advisor
];
```

### Async Generator + SSE Framing

```typescript
// server/services/agentOrchestrator.ts, line 190 — async generator
export async function* orchestrateStream(
  userId: string,
  body: { message?: string; threadId?: string; /* ... */ }
): AsyncGenerator<StreamEvent> {
  // ... PII scan, moderation, classification, routing ...
  yield { type: 'text', content: chunk };
  yield { type: 'thinking', step: 'intent_classification', detail: '...' };
  yield { type: 'widget', widget: { type: 'advisor_handoff' } };
  yield { type: 'suggested_questions', suggestedQuestions: [...] };
  yield { type: 'done' };
}

// server/routes/api.ts, line 230-264 — SSE HTTP framing
res.setHeader('Content-Type', 'text/event-stream');
// ...
const stream = orchestrateStream(userId, body);
let seqId = 0;
for await (const event of stream) {
  seqId++;
  res.write(`id: ${seqId}\ndata: ${JSON.stringify(event)}\n\n`);
}
```

---

# Next Best Actions

The 5 most important things to do before writing any Twelve Data integration code, ordered by priority:

## 1. Verify Twelve Data API Coverage for GCC Tickers (Critical)

**Finding:** F-01, F-02. Before writing any code, confirm that Twelve Data's API actually returns data for the 5 GCC instruments in the seed database:
- `EMAAR:DFM` or `EMAAR.DFM` — verify the exact symbol format
- `FAB:ADX`
- `ADNOCDIST:ADX`
- `2222:TADAWUL` or `ARAMCO:TADAWUL` — verify Aramco's Twelve Data ticker
- `STC:TADAWUL`

Run manual API calls: `GET https://api.twelvedata.com/quote?symbol=EMAAR:DFM&apikey=...`

## 2. Design the Symbol Normalization Strategy (Critical)

**Finding:** F-03, F-04. The `instruments` table already has `symbol` + `exchange` columns. Decide between:
- **Option A:** Static map inside `twelveData.ts` — `{ DFM: ':DFM', ADX: ':ADX', TADAWUL: ':TADAWUL' }` → simple, fast, no DB query
- **Option B:** Query `instruments` table at provider level — `SELECT exchange FROM instruments WHERE symbol = $1` → dynamic, handles new instruments
- **Option C:** Add `twelve_data_symbol` column to `instruments` — most flexible, allows per-instrument overrides

Recommendation: Start with Option A for the day-1 demo, migrate to Option B/C if the instrument set grows.

## 3. Determine Rate Limit Configuration (High)

**Finding:** F-06. Twelve Data free tier allows only 8 requests per minute (vs Finnhub's 55/min). Configure `checkRateLimit('twelve_data', 8)` in the provider. If the demo needs higher throughput, obtain a paid plan (Basic = 30/min) before integration.

## 4. Update LLM Tool Descriptions for GCC Awareness (High)

**Finding:** F-08, F-09. Update these two locations:
- `toolRegistry.ts` line 93: Change `"AAPL", "NVDA", "BTC"` to `"AAPL", "EMAAR", "ARAMCO"` in `getQuotes` description
- `promptBuilder.ts` line 163: Change "from Finnhub (fallback: Yahoo Finance)" to reflect Twelve Data as primary

This ensures the LLM knows GCC tickers are valid and will call `getQuotes` for Emaar-type queries.

## 5. Set Up the Twelve Data API Key as a Replit Secret (Required)

**Finding:** From Section 10. Add `TWELVE_DATA_API_KEY` to Replit Secrets. Also pre-configure `MARKET_PROVIDER_PRIMARY=twelve_data` and `MARKET_PROVIDER_SECONDARY=finnhub` so the fallback chain is ready when the provider file is added.

---

*End of Audit*
