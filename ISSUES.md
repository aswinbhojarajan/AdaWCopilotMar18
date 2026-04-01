# Issues — Ada AI Wealth Copilot

> **Living document** — update continuously as issues are discovered, resolved, or reprioritized.
> Last updated: 2026-04-01

---

## Legend

| Severity | Description |
|----------|-------------|
| P0 — Critical | System down, data loss, security vulnerability |
| P1 — High | Major feature broken, blocking user workflows |
| P2 — Medium | Feature works but has notable problems |
| P3 — Low | Minor cosmetic/UX issues, edge cases |
| P4 — Trivial | Nice-to-fix, no user impact |

| Status | Description |
|--------|-------------|
| Open | Not yet addressed |
| In Progress | Actively being worked on |
| Resolved | Fixed and verified |
| Won't Fix | Intentionally not addressing |

---

## Open Issues

### P1 — High

| ID | Title | Description | Component | Date Opened |
|----|-------|-------------|-----------|-------------|
| ISS-001 | PII stored in plain text in chat_messages | User messages containing PII (email, phone, SSN, credit card, passport, IBAN) are detected and redacted before sending to the LLM, but the raw original message is persisted to `chat_messages` table. No encryption at rest or retention/purge policy exists. | `server/services/piiDetector.ts`, `chat_messages` table | 2026-03-21 |
| ISS-002 | No authentication layer | All API endpoints are unauthenticated. User identity is sent via `X-User-ID` header (demo mode) with fallback to `user-aisha`. Any client can set any user ID. User switching is built but no auth/authorization layer exists. | `server/routes/api.ts` | 2026-03-21 |
| ISS-003 | No rate limiting on API endpoints | Express API has no rate limiting. Vulnerable to brute-force requests, especially on the LLM-backed endpoints (`/api/chat/stream`, `/api/morning-sentinel/stream`) which incur OpenAI API costs. | `server/index.ts`, `server/routes/api.ts` | 2026-03-21 |

### P2 — Medium

| ID | Title | Description | Component | Date Opened |
|----|-------|-------------|-----------|-------------|
| ~~ISS-004~~ | ~~All external providers default to mock~~ | Resolved — All 8 providers (Twelve Data, Finnhub, Yahoo Finance, FRED, SEC EDGAR, OpenFIGI, Frankfurter, CBUAE) now activated via env vars with automatic fallback chains. Twelve Data added as primary market provider for GCC exchanges (Project Task #1). 6 new LLM tools wired. See Task #1 (Connect free providers). | `server/providers/registry.ts` | 2026-03-21 |
| ~~ISS-005~~ | ~~Model router uses single model for all intents~~ | Resolved — lane-based routing now differentiates Lane 0 (deterministic), Lane 1 (fast), Lane 2 (reasoning). See Task #7. | `server/services/modelRouter.ts` | 2026-03-21 |
| ISS-006 | Advisor action queue has no UI for advisors | Execution requests are persisted to `advisor_action_queue` but there is no advisor-facing dashboard to review, approve, or act on queued items. Queue grows without consumption. | `advisor_action_queue` table | 2026-03-21 |
| ISS-007 | Wealth engine uses mock target allocations | `wealthEngine.ts` uses hardcoded target allocations for drift and rebalance calculations instead of reading from a user-specific target allocation profile. | `server/services/wealthEngine.ts` | 2026-03-21 |
| ISS-008 | No CSRF protection | Express server has CORS enabled but no CSRF token validation. | `server/index.ts` | 2026-03-21 |
| ISS-009 | Memory system has no eviction policy | Working memory caps at 20 messages per thread, but episodic and semantic memories grow unbounded. No TTL, no pruning, no size limits on DB-stored memories. | `server/services/memoryService.ts` | 2026-03-21 |
| ~~ISS-010~~ | ~~Single-user hardcoded default~~ | Resolved — user switching built via PersonaPicker + X-User-ID header. `DEFAULT_USER_ID` retained as fallback only. See Task #8. | `server/routes/api.ts` | 2026-03-21 |
| ~~ISS-011~~ | ~~chatService.ts is legacy dead code~~ | Resolved — `chatService.ts` has been deleted from the codebase. | — | 2026-03-21 |
| ISS-012 | Webhook mode has no retry logic | When `execution_routing_mode` is `api_webhook`, failed webhook POSTs fall back to the queue but there is no retry mechanism, no exponential backoff, and no dead-letter queue. | `server/services/rmHandoffService.ts` | 2026-03-21 |
| ~~ISS-022~~ | ~~LLM streaming timeout with no lane fallback~~ | Resolved — when both Lane 2 streaming attempts timed out (15s + 20s = 35s total), the system returned a generic error. Added Lane 2 → Lane 1 automatic downgrade on double timeout. See Task #15. | `server/services/agentOrchestrator.ts` | 2026-03-23 |

### P3 — Low

| ID | Title | Description | Component | Date Opened |
|----|-------|-------------|-----------|-------------|
| ISS-013 | Advisor scheduling CTA is placeholder | "Contact advisor" and scheduling buttons render but don't open a scheduling flow. | `CollapsibleAdvisor`, `AdvisorCard` | 2026-03-21 |
| ISS-014 | Document viewer notifications non-functional | Notification items linking to documents don't open a document viewer. | `NotificationsScreen.tsx` | 2026-03-21 |
| ISS-015 | No loading state for advisor handoff widget | When `route_to_advisor` tool is called, the advisor handoff widget appears instantly without any loading indicator for the queue operation. | `ChatWidgets.tsx` | 2026-03-21 |
| ISS-016 | Morning Sentinel cache is in-memory only | Sentinel briefing cache uses an in-memory Map, so it resets on every server restart. In production with autoscale, each instance has its own cache. | `server/services/morningSentinelService.ts` | 2026-03-21 |
| ISS-017 | Provider health metrics not exposed | Provider health tracking (sliding window) runs internally but there's no API endpoint or dashboard to view provider health status. | `server/providers/registry.ts` | 2026-03-21 |
| ISS-018 | No structured error responses from agent pipeline | When the agent pipeline fails mid-execution (e.g., tool error, LLM timeout), the error SSE event contains a generic message without trace ID or diagnostic context. | `server/services/agentOrchestrator.ts` | 2026-03-21 |
| ~~ISS-019~~ | ~~Seed data uses fixed dates~~ | Resolved — performance history now uses `CURRENT_DATE` with `generate_series` for dynamic date generation. Content items and alerts still use fixed dates but are less time-sensitive. | `server/db/seed.sql` | 2026-03-21 |

### P4 — Trivial

| ID | Title | Description | Component | Date Opened |
|----|-------|-------------|-----------|-------------|
| ISS-020 | Legacy data modules in src/data/ | Client-side data modules (`src/data/portfolio.ts`, `src/data/chat.ts`, etc.) are retained as reference but no longer used at runtime. | `src/data/` | 2026-03-21 |
| ISS-021 | Console.log statements in providers | Some provider implementations have debug `console.log` calls that should be replaced with structured logging. See BL-031 for pino migration plan. | `server/providers/` | 2026-03-21 |
| ISS-023 | Morning briefing uses interval scheduling not 8 AM cron | `morningBriefingWorker` runs on a 6-hour `setInterval` timer with a 14-hour recency guard, not at a timezone-aware 8 AM local time. Users in GCC (UTC+3/+4) may receive briefings at suboptimal times. Proper cron scheduling (e.g., `node-cron`) needed for production. | `server/services/discoverPipeline/index.ts`, `morningBriefingWorker.ts` | 2026-03-26 |
| ISS-024 | No trade/deposit simulation endpoints for event-driven refresh | `triggerEventDrivenRefresh(userId)` is wired to goal creation and account creation endpoints, but there are no simulation endpoints for trades or deposits. In a real system, these portfolio-mutating events would also trigger feed refresh. | `server/services/discoverPipeline/index.ts`, `server/routes/api.ts` | 2026-03-26 |
| ~~ISS-025~~ | ~~No content moderation on LLM inputs/outputs~~ | Resolved — `moderationService.ts` integrated into orchestrator with pre-LLM input moderation and post-LLM output moderation using OpenAI `omni-moderation-latest`. Moderation events persisted. Bypass for deterministic Lane 0 requests. See BL-029 (Project Task #9). | `server/services/moderationService.ts`, `server/services/agentOrchestrator.ts` | 2026-03-27 |

---

## Resolved Issues

| ID | Title | Resolution | Date Resolved |
|----|-------|------------|---------------|
| — | Express wildcard route crash | Replaced `'*'` with `'/{*splat}'` for path-to-regexp compatibility | 2026-03-18 |
| — | Broken Discover tab thumbnails | Replaced expired URLs with Unsplash alternatives | 2026-03-18 |
| — | Video play overlay on all cards | Added `isVideo` conditional rendering | 2026-03-18 |
| — | 112 TypeScript errors | Resolved all type errors, registered `tsc --noEmit` as CI | 2026-03-18 |
| — | Tab transition animating shared chrome | Lifted chrome outside AnimatePresence zone | 2026-03-18 |
| — | Intent sub-routing broken | Fixed `mapOldIntentToNew()` for portfolio_health, portfolio_explain, market_news | 2026-03-20 |
| — | Guardrails running after streaming | Moved guardrail checks before SSE emission | 2026-03-20 |
| — | Duplicate advisor widgets | Added handoff tracking in orchestrator | 2026-03-20 |
| — | Duplicate /api/health endpoint | Consolidated to single registration | 2026-03-18 |
| ISS-005 | Model router single model | Lane-based routing with 3 lanes (deterministic/fast/reasoning) | 2026-03-21 |
| ISS-010 | Single-user hardcoded default | User switching via PersonaPicker + X-User-ID header | 2026-03-21 |
| ISS-011 | chatService.ts dead code | File deleted from codebase | 2026-03-21 |
| — | Collective tab 400 duplicate rows | UNIQUE constraint on peer_segments(asset_class) + seed cleanup | 2026-03-21 |
| ISS-019 | Seed data uses fixed dates | Performance history uses dynamic `CURRENT_DATE` generation; core date staleness resolved | 2026-03-22 |
| — | Performance history unbounded values | Replaced unbounded cumulative walk with normalized bounded formula (amplitude × norm_r) | 2026-03-22 |
| — | Raj Binance balance underflow | Raised balance $35,200→$52,000 to cover $51,451 crypto positions | 2026-03-22 |
| — | NVDA transaction prices incorrect | Corrected $235/$240→$138/$130 (post-split realistic prices) | 2026-03-22 |
| — | 7 cost_basis mismatches | Reconciled all 24 position cost_basis values with weighted transaction averages | 2026-03-22 |
| — | Portfolio health field mismatch | Fixed diversificationScore and riskLevel field mappings in portfolioRepository.ts | 2026-03-21 |
| ISS-022 | LLM streaming timeout with no lane fallback | Added Lane 2 → Lane 1 automatic downgrade when both streaming attempts timeout | 2026-03-23 |
| ISS-026 | Hardcoded USD currency in ChatWidgets | Replaced `$` prefix with `formatCurrency()` supporting AED/SAR/USD/EUR/GBP based on data currency field. Added `currency?` to Holding, GoalData, WealthOverviewResponse types. (Project Task #1) | 2026-04-01 |
| ISS-027 | Market data limited to US exchanges | Added Twelve Data provider with GCC exchange support (DFM, ADX, Tadawul) and symbol normalization. Static GCC map ensures resolution even when DB is unavailable. (Project Task #1) | 2026-04-01 |
| ISS-025 | Content moderation on LLM inputs/outputs | Implemented pre-LLM input + post-LLM output moderation via moderationService.ts (omni-moderation-latest). Moderation events persisted. Bypass for Lane 0. (Project Task #9) | 2026-04-01 |
| — | Thinking events coalesced with content in SSE | Server-side `setImmediate()` ticks + `flush()` after thinking events ensure separate chunk delivery (Task #17) | 2026-03-23 |
| — | No font loading — all fonts fell back to browser default | Added Google Fonts (Crimson Pro, DM Sans) and TypeKit (RL Limo) to index.html. Fixed ~50 component files with invalid Figma-style font references (Task #3) | 2026-03-24 |
| — | Fake mobile status bar (TopBar) cluttering UI | Deleted TopBar component and removed from all screens. Added proper top padding (Task #4) | 2026-03-24 |
| — | ClientEnvironment splash was placeholder, not Ada-branded | Replaced with Ada-styled LoginPage with email/password form and dev persona picker (Task #1) | 2026-03-24 |
| — | Morning Sentinel JSON flash during streaming | Replaced raw JSON chunk rendering with friendly "Ada is analyzing..." message during SSE streaming (Project Task #16) | 2026-03-25 |
| — | Wealth tab blank when non-critical queries slow | Loading now gates only on overview query; non-critical queries render independently with ErrorBoundary (Project Task #16) | 2026-03-25 |
| — | Discover tab "something went wrong" on malformed JSONB | Added safe JSONB parser `parseDetailSections()` + `keepPreviousData` during tab switching + ErrorBoundary (Project Task #16) | 2026-03-25 |
| — | Chat follow-ups lose context (e.g., "do across all" misclassified) | Intent classifier now receives last 4 conversation turns; continuation heuristic + post-classification override preserves prior intent (Project Task #17) | 2026-03-25 |
