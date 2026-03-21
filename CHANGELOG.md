# Changelog — Ada AI Wealth Copilot

All notable changes to the Ada AI Wealth Copilot project are documented below, organized by task.

---

## Task #10 — Comprehensive Data Realism & Market Alignment
**Date:** March 21, 2026

### Fixed
- **NVDA price corrected** from $250.35 to $135.40 (post-split realistic price); cost_basis updated to $90.00
- **Portfolio values cascaded** — Abdullah ($93,105.94), Omar ($99,801.00), Raj ($181,327.25) reflect corrected NVDA price through positions, account balances, snapshots, goals, and alerts
- **Hardcoded sparkline replaced** — `portfolioRepository.ts` `getHomeSparkline()` now queries `performance_history` table for real 7-day data instead of returning hardcoded ~$129K values; falls back to computed synthetic data from snapshot when insufficient history exists

### Changed
- **Performance history overhauled** — all 8 personas now use multi-frequency formulas (6 harmonic components + amplitude modulation + realistic drawdown periods for aggressive personas) replacing simple sin/cos waves
- **PRD persona table updated** — portfolio values and trait descriptions now match actual seeded data

### Validated
- All 70 persona parity tests pass after all data changes
- Allocation totals reconcile with snapshot values for all personas
- TypeScript compiles clean with no errors

---

## Task #9 — Full Persona Data Parity & Personalization
**Date:** March 21, 2026

### Added
- **Full data parity for all 8 personas** — each persona now has accounts, positions, portfolio snapshots, 365-day volatile performance history, goals, alerts, and chat threads
- **365-day performance history** with risk-profile-appropriate volatility curves: conservative personas show steady growth, aggressive personas (Omar, Raj) include drawdown periods
- **Server-side `computeWealthInsights()`** in `portfolioService.ts` — computes `primaryInsight`, `diversificationScore`, `riskLevel`, `topAllocationClass`, `topAllocationPercent`, and `advisorName` from actual portfolio data
- **70-test suite** in `tests/persona-parity.test.ts` covering all 8 personas: positions exist, performance history length, alerts exist, chat threads exist, allocation totals reconcile with snapshots; goals validated for personas that have them (6 of 8)
- **`npm run test:parity`** script for running the persona parity tests

### Changed
- `WealthScreen.tsx` — insights now driven by server-side computed data rather than hardcoded values
- `seed.sql` — expanded with complete position, snapshot, performance, goal, alert, and chat data for Khalid, Sara, Raj, and Nadia; existing personas (Fatima, Omar, Layla) enriched with missing data

---

## Task #8 — User Switching & Multi-Persona Demo
**Date:** March 21, 2026

### Added
- **`UserContext` provider** — React context managing the active user ID with localStorage persistence
- **`PersonaPicker` bottom sheet** — UI component for switching between 8 demo personas, triggered from the header
- **`GET /api/users`** endpoint — returns all seeded demo personas for the picker
- **`X-User-ID` header** — sent on all API and SSE stream calls to identify the active user

### Changed
- **All 11 React Query hooks** updated to include `userId` in their `queryKey` arrays for per-user data isolation
- **`queryClient.removeQueries()`** called on user switch to force fresh data fetching
- **`server/routes/api.ts`** — `getUserId(req)` helper extracts user from `X-User-ID` header with fallback to `DEFAULT_USER_ID`

### Fixed
- **Wealth tab crash** for non-Abdullah users — missing null checks on portfolio data
- **Blank Wealth tab** after user switching — query keys not properly scoped to user

---

## Task #7 — Multi-Model Routing with Lane-Based Control Plane
**Date:** March 21, 2026

### Added
- **Lane-based routing** in `modelRouter.ts` with three lanes:
  - **Lane 0 (Deterministic)**: Portfolio lookups, balance checks — handled by wealth engine without LLM calls
  - **Lane 1 (Fast)**: Simple queries using `ada-fast` provider alias with lower token budgets
  - **Lane 2 (Reasoning)**: Complex analysis using `ada-reason` provider alias with higher token budgets
- **Request scorecard** system — evaluates token estimate, tool count, context window size, and complexity signals to select the optimal lane
- **Provider aliases** — `ada-fast` and `ada-reason` both map to `gpt-5-mini` (configurable for future model differentiation)
- **Per-lane configuration** — token budgets and temperature settings per lane
- **Lane metadata in traces** — `traceLogger.ts` captures lane selection, scorecard values, and route decision rationale

### Changed
- `agentOrchestrator.ts` — integrated lane-based routing into the pipeline
- `traceLogger.ts` — extended trace schema with lane metadata fields

### Fixed
- **Lane 0 portfolio text showing $0.00** — deterministic responses now correctly format portfolio values

---

## Bug Fix — Collective Tab Peer Comparison Duplicates
**Date:** March 21, 2026

### Fixed
- **`peer_segments` table producing 400 duplicate rows** — no UNIQUE constraint on `asset_class` column allowed ~100 server restarts to each insert 4 rows
- Added `DO $$` migration block to add `UNIQUE` constraint on `peer_segments(asset_class)` idempotently
- Seed now uses `DELETE FROM peer_segments` followed by `INSERT ... ON CONFLICT (asset_class) DO NOTHING` to prevent duplicates on restart

---

## Agent Task #6 — Execution Guardrails & RM Handoff
**Date:** March 21, 2026

### Added
- **`execution_request` intent type** in `intentClassifier.ts` — 20+ keywords (execute, place order, buy for me, sell for me, go ahead, confirm trade, etc.) with highest priority classification
- **Execution boundary block** in `promptBuilder.ts` — hard system prompt instruction prohibiting Ada from claiming trade execution capability
- **7 guardrail regex patterns** in `guardrails.ts` — detect execution-claiming language (e.g., "I will execute", "order submitted", "trade confirmed") and replace with RM-routing language; hard post-check fallback for any surviving claims
- **`rmHandoffService.ts`** — new service with three routing modes:
  - `rm_handoff` (default): Persists to `advisor_action_queue` table for RM review
  - `api_webhook`: POSTs to configurable webhook URL with queue fallback
  - `disabled`: Rejects execution requests with explanation
- **`route_to_advisor` tool** in `financialTools.ts` — LLM-callable tool to package execution requests; included in `FINANCIAL_TOOL_DEFINITIONS` with OpenAI function schema
- **Orchestrator fallback** in `agentOrchestrator.ts` — if LLM receives `execution_request` intent but doesn't call `route_to_advisor`, orchestrator forces handoff automatically (fail-closed)
- **`advisor_action_queue` table** — stores pending execution requests with user_id, advisor_id, action_type, action_payload, status, timestamps
- **Enhanced `AdvisorHandoffWidget`** in `ChatWidgets.tsx` — shows RM name, action context, and queue reference for execution handoffs; backward-compatible with generic advisory handoffs

### Changed
- **`tenant_configs` table** — added `execution_routing_mode` (rm_handoff/api_webhook/disabled), `execution_webhook_url`, `can_prepare_trade_plans` columns
- **`PolicyDecision` schema** — extended with `execution_route` field
- **Policy engine** — `execution_request` intent always sets `require_human_review: true` with `execution_route` in decision; `route_to_advisor` added to allowed tools via execution_route profile
- **Guardrails ordering** — execution pattern checks run before education-only advisory checks

### Verified
- "Execute a trade for me" → Ada refuses execution, queues to advisor, emits contextual handoff widget with queueId
- Normal portfolio/market/goal queries unaffected
- No duplicate advisor widgets in stream

---

## Agent Task #5 — Verify & Fix Agent Architecture
**Date:** March 20, 2026

### Fixed
- **Intent sub-routing** — `portfolio_health` and `portfolio_explain` sub-intents now correctly map through `mapOldIntentToNew()` from legacy intent classification
- **`market_news` sub-intent** — added explicit mapping so market news queries use correct policy evaluation and RAG context
- **Guardrails-before-streaming** — guardrail sanitization now runs before SSE events are emitted (was running after streaming in some code paths)
- **Advisor handoff widget deduplication** — orchestrator tracks whether an advisor widget was already emitted by tool execution; prevents duplicate widgets when policy also requires advisor review

### Verified
- All 8 financial/UI tools dispatch correctly via `financialTools.ts`
- Multi-turn tool calling works (LLM can call tools, get results, and call more tools up to 3 rounds)
- Agent traces and tool runs persist to database
- Policy decisions persist to database
- End-to-end pipeline verified with live API calls

---

## Agent Task #3 — External Data Source Integration (Phase 1)
**Date:** March 19, 2026

### Added
- **Finnhub provider** (`server/providers/finnhub.ts`) — real-time quotes, company profiles, earnings calendars, company news; API key via `FINNHUB_API_KEY` env var
- **FRED provider** (`server/providers/fred.ts`) — Federal Reserve Economic Data: GDP, CPI, unemployment rate, fed funds rate, 10Y treasury yield; API key via `FRED_API_KEY` env var
- **SEC EDGAR provider** (`server/providers/secEdgar.ts`) — company submissions, XBRL financial facts, full-text filing search; rate limited to 10 req/sec per SEC policy; User-Agent via `SEC_EDGAR_USER_AGENT` env var
- **OpenFIGI provider** (`server/providers/openFigi.ts`) — instrument identity resolution (ISIN/CUSIP/ticker → FIGI); results persisted to `instruments` table; API key via `OPENFIGI_API_KEY` env var
- **Frankfurter provider** (`server/providers/frankfurter.ts`) — ECB-sourced FX rates for major currency pairs; no API key required
- **CBUAE provider** (`server/providers/cbuae.ts`) — Central Bank of UAE AED-localized FX rates with Frankfurter fallback
- **Provider registry** (`server/providers/registry.ts`) — configurable chain: `*_PROVIDER_PRIMARY`, `*_PROVIDER_SECONDARY`, `*_PROVIDER_FALLBACK` env vars; all default to 'mock'
- **In-memory cache** (`server/providers/cache.ts`) — per-data-type TTLs, cache hit/miss metrics in every `ToolResult`
- **Rate limiting** — per-second (SEC EDGAR) and per-minute (others) limiters
- **Sliding-window health tracking** — 5-min window, min 5 attempts, 50% failure rate threshold
- **Phase 2/3 stubs** (`server/providers/stubs.ts`) — wired into registry: Marketaux, ECB, Twelve Data, FMP, CoinGecko, Yahoo Finance

### Changed
- `financialTools.ts` — tool dispatch integrates with provider registry for `get_market_data`, `get_news_summary`
- `ToolResult` schema — includes `source_name`, `source_type`, `as_of`, `latency_ms`, and cache metrics

---

## Agent Task #2 — Agent Architecture & Intelligence Overhaul
**Date:** March 19, 2026

### Added
- **`agentOrchestrator.ts`** — core agent pipeline replacing `chatService.ts` as the primary chat handler. Full pipeline: PII detection → session hydration → intent classification → policy evaluation → model routing → RAG → prompt assembly → memory → LLM → multi-turn tools → wealth engine → guardrails → response building → streaming → trace logging
- **`policyEngine.ts`** — code-driven policy evaluation per tenant config. Returns `PolicyDecision` with advisory mode, allowed tools, human review requirements, disclosure profile
- **`modelRouter.ts`** — selects AI model based on intent complexity; supports FAST_MODEL vs STRONG_MODEL; currently routes all to gpt-5-mini
- **`promptBuilder.ts`** — modular system prompt assembly from persona, advisory mode, portfolio context, memory, tools, and disclosures
- **`responseBuilder.ts`** — constructs Zod-validated `AdaAnswer` responses with headline, summary, citations, recommendations, actions, render hints; maps to SSE events
- **`traceLogger.ts`** — persists agent traces and tool runs to `agent_traces` and `tool_runs` tables
- **`guardrails.ts`** — post-response sanitization: blocked phrases, security naming, data freshness, disclosures
- **`wealthEngine.ts`** — deterministic financial calculations: portfolio health, concentration risk, allocation drift, rebalance preview
- **`financialTools.ts`** — 8 OpenAI function-calling tools: get_portfolio_snapshot, get_holdings_detail, get_market_data, get_news_summary, calculate_wealth_metric, route_to_advisor, show_simulator, show_widget, extract_user_fact
- **Multi-turn tool calling** — LLM can call tools, get results, and call more tools (up to 3 rounds per request)
- **Structured `AdaAnswer` schema** (`shared/schemas/agent.ts`) — Zod schemas for all agent types: ToolResult, Citation, RecommendationItem, Action, AdaAnswer, PolicyDecision, IntentClassification, TenantConfig

### Changed
- `POST /api/chat/stream` — now routes through `agentOrchestrator.runAgentPipeline()` instead of `chatService`
- Intent classification — two-stage: legacy intent → `IntentClassification` schema mapping via `mapOldIntentToNew()`

---

## Agent Task #1 — Database & Data Foundation for Agent Architecture
**Date:** March 19, 2026

### Added
- **10 new database tables** in `schema.sql`:
  - `tenants` — multi-tenant support with region, locale, base currency
  - `tenant_configs` — per-tenant policy: advisory mode, allowed tools, disclosure profile, feature flags
  - `instruments` — instrument master data with symbol, name, asset class, exchange, ISIN, FIGI, SEDOL
  - `market_quotes` — market data cache with price, change %, volume, source, timestamp
  - `news_items` — news cache with headline, summary, source, symbols, published date
  - `tool_runs` — individual tool execution records for agent tracing
  - `agent_traces` — full agent execution traces with session, intent, model, latency, tokens
  - `policy_decisions` — policy evaluation records per request
  - `conversation_summaries` — compressed conversation summaries
  - `advisor_action_queue` — pending execution requests for RM review (added in Task #6)
- **Seed data** in `seed.sql`:
  - 1 tenant: `bank_demo_uae` with full config
  - 8 personas (4 original + 4 new: Khalid Al-Mansoori, Noura Al-Shamsi, Rashed Al-Maktoum, Amina Al-Dhaheri)
  - 8 instruments (AAPL, MSFT, NVDA, AGG, GLD, BTC, ETH, AAPL-bond)
  - Market quotes for all instruments
  - 3 news items
- **`agentRepository.ts`** — data access layer for all agent architecture tables
- **`shared/schemas/agent.ts`** — Zod validation schemas for AdaAnswer, ToolResult, PolicyDecision, IntentClassification, TenantConfig, and related types

### Changed
- Database table count: 23 → 33
- Persona count: 4 → 8

---

## Deployment Fix — Express Wildcard Route
**Date:** March 18, 2026

### Fixed
- **Production crash loop** — replaced incompatible wildcard route `'*'` with `'/{*splat}'` in `server/index.ts` for compatibility with the newer `path-to-regexp` used by Express
- **Verified build output** — confirmed `build/` directory with `index.html` is generated correctly by `vite build`

---

## Discover Thumbnail Fix & Video Overlay Refactor
**Date:** March 18, 2026

### Fixed
- **Broken image thumbnails** in Discover > For You tab — replaced expired/hotlink-blocked external URLs (WSJ, NYT) with reliable Unsplash alternatives for `disc-fy-1`, `disc-fy-2`, and `disc-fy-4` content items
- **Hardcoded video play overlay** — play button was rendering on every ContentCard image regardless of content type; now only appears when `isVideo` is true

### Added
- **`is_video` column** on `content_items` table (schema + live DB migration) — `BOOLEAN DEFAULT FALSE`
- **`isVideo` prop** on `ContentCard` component — conditionally renders the circular play button overlay
- **Full-stack wiring** — `isVideo` flows through `shared/types.ts`, `src/types/index.ts`, `contentRepository.ts` mapper, `DiscoverScreen.tsx`, and `HomeScreen.tsx`

---

## PRD Comprehensive Audit
**Date:** March 18, 2026

### Changed
- **Section 5 (Chat Experience)** — complete rewrite: replaced outdated "deterministic keyword matching" description with full LLM pipeline documentation (PII detection → intent classification → RAG → memory → LLM → tool-calling → streaming)
- **Section 4.1 (Home Tab)** — added Morning Sentinel feature: prefetch architecture, SSE streaming fallback, server-side deduplication, 4h cache TTL
- **Section 4.2 (Wealth Tab)** — added Goals & Life Planning: goal health scores, AI life-gap analysis, life-event goal suggestions, 4 new endpoints
- **Section 7 (API Contracts)** — added 8+ missing endpoints: morning-sentinel, morning-sentinel/stream, goals/health-score, goals/life-gaps, goals/life-gaps/dismiss, goals/life-event, chat/stream, wealth/accounts POST
- **Section 8 (Data Model)** — fixed table count from 19 to 23; added `episodic_memories`, `semantic_facts`, `chat_audit_log`, `dismissed_life_gap_prompts` tables with accurate column details
- **Section 9 (Architecture)** — expanded tech stack (AI, TanStack Query, Framer Motion, TypeScript validation); rewrote backend/frontend architecture diagrams; updated key architectural decisions
- **Section 10 (Non-Functional)** — added performance optimizations: Morning Sentinel prefetch, SSE streaming fallback, server-side dedup, TanStack Query caching
- **Section 11 (Implementation Status)** — marked 13 features as Built that were previously missing or listed as "Not built" (AI Chat, Widgets, Simulators, Memory, PII Detection, Morning Sentinel, Goals, Animations, Pull-to-Refresh, TypeScript Validation)
- **Section 12 (Change Log)** — added entries for Tasks #7–#12

### Fixed
- API contract payloads: `promptKey` (not `promptId`), `eventType: LifeEventType` (not `event: string`)
- SSE stream event types: `widget`/`simulator` (not `tool_call`)
- `chat_audit_log` PK type: SERIAL (not TEXT); token column: `tokens_used` (single field, not split prompt/completion)
- `episodic_memories` columns: `topics TEXT[]` (not `message_count`)
- Add Account Modal: persists to DB via `POST /api/wealth/accounts` (not local/mock only)

### Added
- **PII Handling** subsection in Section 5 documenting raw message retention behavior and future remediation consideration

---

## Task #12 — Morning Sentinel Performance Optimization
**Date:** March 18, 2026

### Added
- **App-init prefetch** in `src/main.tsx` — Morning Sentinel briefing generation starts immediately on app load via TanStack Query `prefetchQuery`, before the user navigates past the splash screen
  - 4-hour `gcTime` and `staleTime` to prevent unnecessary regeneration
- **SSE streaming fallback endpoint** `GET /api/morning-sentinel/stream` — streams briefing generation progressively when prefetch hasn't completed
  - `SentinelStreamEvent` discriminated union with three event types: `metrics` (immediate portfolio numbers), `text` (incremental AI narrative), `complete` (final structured result)
- **`StreamingSentinel` component** in `MorningSentinelCard.tsx` — progressive UI that shows portfolio value and daily change immediately, then streams in the AI narrative with a typing cursor animation
- **Server-side deduplication** — `inFlightRequests` Map in `morningSentinelService.ts` prevents concurrent `generateBriefing()` calls for the same user (guards the cached `/api/morning-sentinel` endpoint)

### Changed
- **`useMorningSentinel` hook** — complete rewrite with coordinated prefetch/stream strategy:
  - Waits 500ms for cached prefetch data from TanStack Query
  - If prefetch hasn't resolved, falls back to SSE streaming automatically
  - Merges stream events into React state for progressive rendering
  - Returns `isStreaming`, `streamingMetrics`, `streamingText`, and `hasData` for UI coordination
- **`MorningSentinelCard`** — added conditional rendering: shows `SentinelSkeleton` during initial wait, `StreamingSentinel` during active streaming, full rich card when complete

### Performance Impact
- Eliminates perceived loading time for the Home tab's AI briefing on warm loads
- Cold start shows portfolio metrics instantly + progressive text within ~1s
- Prevents duplicate OpenAI API calls (token savings)

---

## Task #11 — TypeScript Validation Framework
**Date:** March 18, 2026

### Added
- `npm run typecheck` script running `tsc --noEmit` for static type checking
- Registered `typecheck` as a CI validation command (runs on every task completion)
- `typescript`, `@types/react`, `@types/react-dom` added as explicit devDependencies

### Fixed
- **112 TypeScript errors** resolved across the codebase:
  - Missing type annotations on function parameters and return types
  - Implicit `any` types in hooks, services, and components
  - Incorrect type narrowing in conditional branches
  - Missing interface properties in component props
  - Type mismatches between shared types and component expectations
  - Unsafe `as any` casts replaced with proper type assertions where possible

### Changed
- `tsconfig.json` updated: `noImplicitReturns: true`, `noFallthroughCasesInSwitch: true`
- `tsconfig.json` excludes `src/imports/**` (Figma-generated code) and `server/replit_integrations/**` (auto-generated integration code)

---

## Task #10 — Tab Transition Animation Fix
**Date:** March 18, 2026

### Fixed
- **Shared chrome (header, tabs, bottom bar) no longer animates** during tab switches — lifted TopBar, Header, Navigation, and BottomBar into `App.tsx` so they remain stationary while only the content area transitions
- **Replaced horizontal slide with crossfade** for tab content transitions — smoother UX, eliminates the jarring left/right swipe on every tab change

### Changed
- `App.tsx` refactored: shared chrome components rendered outside AnimatePresence zone
- Tab screen components now render content-only (no chrome wrappers)
- AnimatePresence `mode="wait"` applies opacity fade transition to content area only
- Overlay screens (chat, notifications, chat history) retain slide-up transition

---

## Task #9 — Morning Sentinel: AI Daily Briefing
**Date:** March 18, 2026

### Added
- **`morningSentinelService.ts`** — new backend service for AI-generated daily briefings:
  - `gatherMetrics()` — 6 parallel database queries (portfolio snapshot, holdings, allocations, goals, alerts, user profile)
  - `detectAnomalies()` — flags concentration risk (>40% single asset class), large daily moves (>1.5%), and off-track goals
  - `generateBriefing()` — sends structured prompt to OpenAI gpt-5-mini requesting JSON response with headline, overview, key movers, risks, and suggested actions
  - Server-side `briefingCache` with 4-hour TTL
- **`GET /api/morning-sentinel`** endpoint — returns cached or freshly generated briefing; `?refresh=true` forces regeneration
- **`MorningSentinelCard.tsx`** — rich UI component displaying:
  - Portfolio value and daily change with directional arrow
  - AI-generated narrative overview
  - Key Movers section with symbol icons and price direction indicators
  - Flagged Risks with color-coded severity dots (high/red, medium/orange, low/green)
  - Suggested Actions as tappable buttons that open AI chat with pre-populated context
- **`SentinelSkeleton`** — loading placeholder matching the card's layout

### Changed
- `HomeScreen.tsx` — integrated Morning Sentinel card above the existing portfolio summary section
- `src/hooks/useMorningSentinel.ts` — new TanStack Query hook with daily caching and force-refresh support

---

## Task #8 — Goals & Life Planning
**Date:** March 18, 2026

### Added
- **`goalService.ts`** — new backend service with three AI-powered features:
  - `calculateGoalHealthScore()` — multi-factor 0–100 score computed from progress (30%), status (30%), time remaining (15%), and trajectory (25%)
  - `generateLifeGapPrompts()` — LLM analyzes user's existing goals and risk profile to identify missing financial coverage areas (e.g., emergency fund, disability insurance, estate planning)
  - `generateLifeEventSuggestions()` — LLM generates tailored goal suggestions with target amounts, timelines, icons, and reasoning for selected life events
  - `dismissPrompt()` — persists prompt dismissal to `dismissed_life_gap_prompts` table
- **4 new API endpoints**:
  - `GET /api/wealth/goals/health-score` — computed plan health score
  - `GET /api/wealth/goals/life-gaps` — AI-generated missing goal suggestions
  - `POST /api/wealth/goals/life-gaps/dismiss` — dismiss a life gap prompt (`{ promptKey }`)
  - `POST /api/wealth/goals/life-event` — generate goal suggestions for a life event (`{ eventType: LifeEventType }`)
- **`GoalHealthGauge.tsx`** — circular SVG gauge component with color transitions (green >70, yellow ≥40, red <40) displaying the plan health score
- **`LifeGapCards.tsx`** — card-based list for AI-suggested missing goals with dismiss action and "Address this" CTA
- **`LifeEventModal.tsx`** — multi-step modal:
  - Step 1: Select a life event (New Baby, Home Purchase, Job Change, Inheritance, Marriage)
  - Step 2: Loading state with "Ada is thinking..." animation
  - Step 3: AI-generated goal suggestions with rationale, target amounts, timelines, and "Set up this goal" button
- **`dismissed_life_gap_prompts`** database table — tracks which prompts each user has dismissed (user_id + prompt_key UNIQUE constraint)
- **Frontend hooks** in `useGoals.ts`:
  - `useGoalHealthScore()` — TanStack Query hook for plan health
  - `useLifeGapPrompts()` — hook for AI gap suggestions
  - `useDismissLifeGapPrompt()` — mutation to dismiss prompts
  - `useLifeEventSuggestions()` — mutation for life event goal generation
  - `useCreateGoal()` — mutation to save a suggested goal

### Changed
- `WealthScreen.tsx` — integrated GoalHealthGauge, LifeGapCards, and LifeEventModal into the goals section
- `shared/types.ts` — added `GoalHealthScore`, `LifeGapPrompt`, `LifeEventSuggestion`, and `LifeEventType` types

---

## Task #7 — RM Productivity Suite (Backlog)
**Date:** March 18, 2026

### Added
- **RM Productivity Suite specification** (`.local/tasks/rm-productivity-suite.md`) — detailed backlog item documenting the Relationship Manager persona features planned for future implementation:
  - RM Morning Planning Queue (priority-sorted client list)
  - AI Customer Digest & Talking Points (LLM-generated call prep)
  - At-Risk Client Radar (attrition risk ranking with interventions)
  - Next-Best-Action Coach (AI-recommended actions per flagged client)
- This task produced a planning/specification document only; no runtime code changes were made

---

## Task #6 — Product Requirements Document (PRD)
**Date:** March 18, 2026

### Added
- Comprehensive living PRD (`PRD.md`) covering full product scope
- Product vision, core value propositions, and target user personas
- Detailed feature requirements for all 4 tabs (Home, Wealth, Discover, Collective)
- Chat experience specification including intent routing, simulators, and widget types
- Full design system documentation (brand colors, typography, spacing, component library)
- Complete API contract reference (17+ endpoints with request/response types)
- Data model summary (22 PostgreSQL tables with relationships)
- Architecture patterns documentation (repository/service pattern, frontend hooks)
- Non-functional requirements (performance, mobile-first, accessibility)
- Implementation status matrix (built vs not-built features)

---

## Task #5 — Polish, Animations & Production Deployment
**Date:** March 18, 2026

### Added
- **Screen transitions** using Framer Motion `AnimatePresence` in `App.tsx`
  - Tab switches animate with directional horizontal slide
  - Overlay views (chat, notifications, chat history) slide up from bottom
  - Client Environment entry/exit uses crossfade transition
- **Pull-to-refresh** component (`PullToRefresh.tsx`) with touch gesture support
  - Integrated into Home, Wealth, Discover, and Collective screens
  - Triggers React Query `refetch()` for live data refresh
  - Supports `forwardRef` for external scroll container access (used by WealthScreen auto-scroll)
- **Animated tab indicator** in `Navigation.tsx` using Framer Motion `layoutId`
  - Spring-animated underline glides between active tabs
  - Tab labels transition between active/inactive opacity states
- **React.lazy code splitting** for 8 heavy screens
  - Main bundle reduced from ~526 KB to ~351 KB (33% reduction)
  - Screens load on demand: WealthScreen (65 KB), ClientEnvironment (49 KB), ChatScreen (24 KB), CollectiveScreen (12 KB), etc.
- **`useTransition`** wrapping all view/tab navigation to prevent Suspense sync errors
- **`navigateTo()` helper** centralizing all view transitions through `startTransition`
- **Post-merge setup script** (`scripts/post-merge.sh`) for automatic dependency/schema sync after task merges

### Changed
- `App.tsx` refactored: `onTabChange` prop wired through all 4 tab screen components to enable tab navigation
- `ScreenProps` type extended with `onTabChange` callback
- WealthScreen and CollectiveScreen interfaces updated with `onTabChange`

### Fixed
- **Tab navigation was broken** — screens had `onTabChange={() => {}}` hardcoded; now properly wired to `handleTabChange` in App
- **Duplicate `/api/health` endpoint** — removed from `server/index.ts` (was registered both there and in `routes/api.ts`); consolidated to single registration in `index.ts`

### Optimized
- `advisor-photo.png` compressed from 1.6 MB to 209 KB (87% reduction)
- `discover-image-2.png` compressed from 456 KB to 168 KB (63% reduction)
- Production build now emits zero chunk-size warnings

### Cleaned Up
- Removed unused props from `SlideNotification` interface (`headline`, `temporalCue`, `secondaryActionText`, `onSecondaryAction`)
- Removed large JSDoc docblock from `SlideNotification.tsx`
- Removed debug `console.log` statements from `WealthScreen`, `HomeEmptyScreen`, `ChatHistoryScreen`, `ChatScreen`

### Deployment
- Configured autoscale deployment target (`build: npm run build`, `run: npm run start`)
- Express serves static `build/` directory in production mode on port 5000
- Health check endpoint at `GET /api/health`

---

## Task #4 — AI-Powered Chat with Memory, Intent Routing & Embedded Widgets
**Date:** March 18, 2026

### Added
- **AI Chat Pipeline** — full end-to-end LLM-powered conversational AI
  - OpenAI `gpt-5-mini` via Replit AI Integrations
  - SSE streaming responses with progressive text rendering
  - Typing cursor animation during streaming
- **Intent Classification** (`intentClassifier.ts`)
  - Routes messages to domain handlers: portfolio, goals, market, scenario, general
  - LLM-based classification (no keyword fallback)
- **RAG Pipeline** (`ragService.ts`)
  - Queries user's live portfolio data from PostgreSQL
  - Injects holdings, allocations, goals, accounts, and recent transactions into LLM context
- **Three-Tier Memory System** (`memoryService.ts`)
  - Working memory: in-memory conversation turns per thread (max 20)
  - Episodic memory: summarized conversation episodes persisted to PostgreSQL
  - Semantic memory: extracted user facts/preferences stored in PostgreSQL
  - PostgreSQL full-text search (`ts_rank_cd`/`to_tsquery`) for semantic retrieval with recency fallback
- **Tool Calling** — LLM can invoke structured tools:
  - `show_simulator`: triggers interactive scenario simulators (retirement, investment, spending, tax)
  - `show_widget`: embeds data widgets (allocation chart, holdings summary, goal progress, portfolio summary)
  - `extract_user_fact`: saves user preferences/facts to semantic memory
- **PII Detection** (`piiDetector.ts`)
  - Regex-based detection for email, phone, SSN, credit card, passport, IBAN
  - Redacts PII before sending to LLM
  - Flags PII detection in audit logs
- **Audit Logging** (`chat_audit_log` table)
  - Logs every interaction: intent, PII status, model used, token usage, latency
- **Session Finalization** — `POST /api/chat/:threadId/close`
  - Persists episodic summary of conversation
  - Clears working memory
  - Frontend calls on chat back-navigation
- **Embedded Chat Widgets** (`ChatWidgets.tsx`)
  - Typed widget interfaces for allocation charts, holdings, goals, portfolio summaries
  - Inline rendering within chat message stream
- **Scenario Simulators** (`ScenarioSimulator.tsx`)
  - Interactive slider-based modeling for retirement, investment, spending, and tax scenarios
  - Real-time result calculations
- **Suggested Questions** — LLM generates 3 contextual follow-up suggestions after each response
- **Risk Profile Injection** — user's risk profile from PostgreSQL injected into system prompt
- **Chat History** — `ChatHistoryScreen.tsx` with thread listing, timestamps, preview text
- **Thread Continuity** — loads existing thread messages when resuming a conversation

### API Endpoints Added
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/chat/stream` | SSE streaming AI chat with tool-calling |
| POST | `/api/chat/message` | Synchronous chat message/response |
| POST | `/api/chat/:threadId/close` | Finalize session, persist episodic memory |
| GET | `/api/chat/threads` | List chat history threads |
| GET | `/api/chat/:threadId/messages` | Get messages in a thread |

### Database Tables Added
- `chat_threads` — conversation thread metadata
- `chat_messages` — individual messages with role, content, metadata
- `episodic_memories` — summarized conversation episodes
- `semantic_facts` — extracted user facts/preferences
- `chat_audit_log` — interaction audit trail
- `action_contexts` — tool call action records

---

## Task #3 — Frontend API Integration
**Date:** March 18, 2026

### Added
- **TanStack Query v5** integration for all data fetching
- **API helper layer** (`hooks/api.ts`) — `apiFetch`/`apiPost` wrappers for TanStack Query
- **Domain-specific hooks**:
  - `useHomeSummary` — home screen data + content cards
  - `useWealthOverview` — portfolio value + performance
  - `useHoldings` — top holdings by value
  - `useAllocations` — asset allocation data
  - `useGoals` — financial goals
  - `useAccounts` / `useAddAccount` — connected accounts (query + mutation)
  - `useDiscoverContent` — discover feed with filter support
  - `usePolls` / `useVotePoll` — poll data and voting (query + mutation)
  - `useNotifications` — user alerts/notifications
  - `useChatThreads` — chat history threads
- **Shared UI components**:
  - `Skeleton`, `SkeletonCard`, `SkeletonList` — loading state placeholders
  - `ErrorBanner` — error state with retry button

### Changed
- All 4 tab screens (Home, Wealth, Discover, Collective) converted from hardcoded data to live API queries
- Notifications screen converted to API-driven
- Loading states show skeleton placeholders instead of blank screens
- Error states show retry banners with refetch capability

### Removed
- All hardcoded/mock data imports from screen components
- Direct imports from `src/data/` directory in screen components

---

## Task #2 — Backend API & PostgreSQL Database
**Date:** March 18, 2026

### Added
- **Express.js backend** (`server/index.ts`) running on port 3001
  - CORS enabled, JSON body parsing
  - Global error handler for unhandled exceptions
  - `asyncHandler` wrapper on all async routes
- **PostgreSQL database** with 22-table schema (`server/db/schema.sql`)
  - Idempotent schema using `IF NOT EXISTS` / `CREATE OR REPLACE`
  - Comprehensive seed data (`server/db/seed.sql`) using `ON CONFLICT DO NOTHING`
  - 4 demo personas: Abdullah Al-Rashid (default), Mei Lin Chen, James Worthington III, Priya Sharma
- **Repository layer** (data access):
  - `userRepository.ts` — user profiles + risk profiles
  - `portfolioRepository.ts` — portfolio snapshots, holdings, allocations, goals, accounts, performance history
  - `contentRepository.ts` — content cards, alerts, chat threads/messages, peer comparisons
  - `pollRepository.ts` — poll questions, options, voting with transaction-based atomicity
- **Service layer** (business logic):
  - `portfolioService.ts` — portfolio value computations, asset allocation calculations
- **Vite proxy** — dev server proxies `/api` requests from port 5000 to port 3001

### API Endpoints Added
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/me` | Current user profile |
| GET | `/api/home/summary` | Home screen data + content cards |
| GET | `/api/wealth/overview` | Portfolio value + performance |
| GET | `/api/wealth/allocation` | Asset allocation (computed from positions) |
| GET | `/api/wealth/holdings` | Top 5 holdings by value |
| GET | `/api/wealth/goals` | Financial goals |
| GET | `/api/wealth/accounts` | Connected accounts |
| POST | `/api/wealth/accounts` | Add new account |
| GET | `/api/notifications` | User alerts/notifications |
| GET | `/api/content` | All content items (filterable) |
| GET | `/api/content/discover` | Discover feed (For You / What's Happening) |
| GET | `/api/collective/peers` | Peer comparison data |
| GET | `/api/polls` | Active polls with options & vote counts |
| POST | `/api/polls/:pollId/vote` | Vote on a poll option |

### Database Tables
`users`, `risk_profiles`, `advisors`, `accounts`, `positions`, `transactions`, `price_history`, `portfolio_snapshots`, `goals`, `alerts`, `content_items`, `peer_segments`, `performance_history`, `poll_questions`, `poll_options`, `poll_votes`

### Seed Data Highlights
- 366 days of performance history via `generate_series`
- 8 portfolio positions across stocks, bonds, ETFs, crypto
- 4 connected accounts (brokerage, savings, checking, retirement)
- 3 financial goals with progress tracking
- 10+ content cards spanning tax, market, estate, and retirement categories
- Active community poll with 4 options

---

## Task #1 — Codebase Cleanup & Foundation
**Date:** March 17, 2026

### Added
- `replit.md` project documentation file
- `src/types/index.ts` — centralized TypeScript type definitions
- `shared/types.ts` — backend/frontend contract types

### Changed
- Reorganized Figma-exported components into `src/imports/` (excluded from ESLint)
- Established component directory structure: `src/components/ada/` (design system), `src/components/screens/` (page-level)
- Configured ESLint 9 flat config with React hooks + refresh plugins
- Set up Prettier formatting
- Configured Vite build output to `build/` directory

### Foundation Components Created
- `TopBar` — iOS-style status bar
- `Header` — app header with notification bell and close button
- `Navigation` — 4-tab navigation bar (Home, Wealth, Discover, Collective)
- `BottomBar` — chat input bar with history access
- `AdaLogo` — brand logo component
- `Button`, `Tag`, `SearchInput`, `Modal` — UI primitives
- `ContentCard` — expandable content cards with CTAs
- `SummaryCard` — summary display cards
- `InsightCard`, `TrendCard` — data visualization cards
- `OnboardingCard` — first-time user onboarding
- `PollOption` — community poll voting UI
- `NotificationItem` — notification list items
- `SlideNotification` — animated notification banners (system + default variants)
- `ChatMessage`, `SuggestedQuestion`, `ChatThread` — chat UI components
- `SourcesBadge`, `AtomIcon`, `SparkIcon` — decorative elements
- Chart components: `Sparkline`, `SimpleSparkline`, `LineChart`, `WealthPerformanceChart`, `DonutChart`, `ProgressRing`
- Wealth components: `WealthOverviewCard`, `WealthSnapshot`, `ConnectedAccountRow`, `PerformanceChartCard`, `AssetAllocationCard`, `PortfolioHealthCard`, `HoldingRow`, `GoalCard`, `AdvisorCard`, `AddAccountModal`, `InsightRow`, `CompactAssetAllocation`, `PortfolioHealthSummary`, `CompactHoldings`, `CompactGoals`, `CollapsibleAdvisor`, `CompactConnectedAccounts`

### Screen Components Created
- `HomeScreen` — daily summary, portfolio snapshot, content feed
- `HomeEmptyScreen` — onboarding state for new users
- `WealthScreen` — full portfolio dashboard with expandable sections
- `DiscoverScreen` — content discovery feed with For You / What's Happening filters
- `CollectiveScreen` — community polls, peer comparisons, insights
- `NotificationsScreen` — alerts and notification center
- `ChatScreen` — AI chat interface with streaming support
- `ChatHistoryScreen` — conversation thread history

---

## Initial Setup
**Date:** March 17, 2026

### Added
- React 18 + TypeScript project with Vite 6
- Tailwind CSS v4 with custom configuration
- Figma-exported prototype code (`ClientEnvironment-2066-398.tsx`)
- Project scaffolding and Replit environment configuration

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| PostgreSQL tables | 33 |
| API endpoints | 34 (including 2 SSE streams) |
| React components | 65+ |
| React hooks | 15+ |
| Backend services | 17 (agent orchestrator, policy engine, model router, prompt builder, response builder, trace logger, guardrails, wealth engine, financial tools, RM handoff, AI, chat, intent, RAG, memory, PII, goal, sentinel) |
| Database repositories | 6 (user, portfolio, content, chat, poll, agent) |
| External data providers | 6 (Finnhub, FRED, SEC EDGAR, OpenFIGI, Frankfurter, CBUAE) |
| AI tools | 9 (portfolio snapshot, holdings detail, market data, news summary, wealth metric, route to advisor, simulator, widget, fact extraction) |
| Memory tiers | 3 (working, episodic, semantic) |
| SSE streams | 2 (chat, morning sentinel) |
| Guardrail checks | 7 (blocked phrases, execution claims ×7 regex, hard post-check, education advisory, security naming, data freshness, disclosures) |
| Execution enforcement layers | 3 (system prompt, guardrail regex, orchestrator fallback) |
| TypeScript errors fixed | 112 |
