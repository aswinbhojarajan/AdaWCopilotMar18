# Issues — Ada AI Wealth Copilot

> **Living document** — update continuously as issues are discovered, resolved, or reprioritized.
> Last updated: 2026-03-21

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
| ISS-002 | No authentication layer | All API endpoints are unauthenticated. User identity is hardcoded to `user-abdullah` via `DEFAULT_USER_ID` in `api.ts`. Any client can access any user's data. | `server/routes/api.ts` | 2026-03-21 |
| ISS-003 | No rate limiting on API endpoints | Express API has no rate limiting. Vulnerable to brute-force requests, especially on the LLM-backed endpoints (`/api/chat/stream`, `/api/morning-sentinel/stream`) which incur OpenAI API costs. | `server/index.ts`, `server/routes/api.ts` | 2026-03-21 |

### P2 — Medium

| ID | Title | Description | Component | Date Opened |
|----|-------|-------------|-----------|-------------|
| ISS-004 | All external providers default to mock | The 6 external data providers (Finnhub, FRED, SEC EDGAR, OpenFIGI, Frankfurter, CBUAE) all default to mock data. Real financial data requires manually setting env vars per provider. Users see simulated data unless configured. | `server/providers/registry.ts` | 2026-03-21 |
| ISS-005 | Model router uses single model for all intents | `modelRouter.ts` currently sends all intents to gpt-5-mini regardless of complexity. No differentiation between simple queries (balance check) and complex analysis (scenario modeling). | `server/services/modelRouter.ts` | 2026-03-21 |
| ISS-006 | Advisor action queue has no UI for advisors | Execution requests are persisted to `advisor_action_queue` but there is no advisor-facing dashboard to review, approve, or act on queued items. Queue grows without consumption. | `advisor_action_queue` table | 2026-03-21 |
| ISS-007 | Wealth engine uses mock target allocations | `wealthEngine.ts` uses hardcoded target allocations for drift and rebalance calculations instead of reading from a user-specific target allocation profile. | `server/services/wealthEngine.ts` | 2026-03-21 |
| ISS-008 | No CSRF protection | Express server has CORS enabled but no CSRF token validation. | `server/index.ts` | 2026-03-21 |
| ISS-009 | Memory system has no eviction policy | Working memory caps at 20 messages per thread, but episodic and semantic memories grow unbounded. No TTL, no pruning, no size limits on DB-stored memories. | `server/services/memoryService.ts` | 2026-03-21 |
| ISS-010 | Single-user hardcoded default | `DEFAULT_USER_ID = 'user-abdullah'` is used across all API routes. User switching requires code change. | `server/routes/api.ts` | 2026-03-21 |
| ISS-011 | chatService.ts is legacy dead code | The original `chatService.ts` pipeline is fully replaced by `agentOrchestrator.ts` but remains in the codebase. It is not called at runtime but adds maintenance burden and confusion. | `server/services/chatService.ts` | 2026-03-21 |
| ISS-012 | Webhook mode has no retry logic | When `execution_routing_mode` is `api_webhook`, failed webhook POSTs fall back to the queue but there is no retry mechanism, no exponential backoff, and no dead-letter queue. | `server/services/rmHandoffService.ts` | 2026-03-21 |

### P3 — Low

| ID | Title | Description | Component | Date Opened |
|----|-------|-------------|-----------|-------------|
| ISS-013 | Advisor scheduling CTA is placeholder | "Contact advisor" and scheduling buttons render but don't open a scheduling flow. | `CollapsibleAdvisor`, `AdvisorCard` | 2026-03-21 |
| ISS-014 | Document viewer notifications non-functional | Notification items linking to documents don't open a document viewer. | `NotificationsScreen.tsx` | 2026-03-21 |
| ISS-015 | No loading state for advisor handoff widget | When `route_to_advisor` tool is called, the advisor handoff widget appears instantly without any loading indicator for the queue operation. | `ChatWidgets.tsx` | 2026-03-21 |
| ISS-016 | Morning Sentinel cache is in-memory only | Sentinel briefing cache uses an in-memory Map, so it resets on every server restart. In production with autoscale, each instance has its own cache. | `server/services/morningSentinelService.ts` | 2026-03-21 |
| ISS-017 | Provider health metrics not exposed | Provider health tracking (sliding window) runs internally but there's no API endpoint or dashboard to view provider health status. | `server/providers/registry.ts` | 2026-03-21 |
| ISS-018 | No structured error responses from agent pipeline | When the agent pipeline fails mid-execution (e.g., tool error, LLM timeout), the error SSE event contains a generic message without trace ID or diagnostic context. | `server/services/agentOrchestrator.ts` | 2026-03-21 |
| ISS-019 | Seed data uses fixed dates | Some seed data (content items, alerts) has hardcoded dates that may appear stale over time. | `server/db/seed.sql` | 2026-03-21 |

### P4 — Trivial

| ID | Title | Description | Component | Date Opened |
|----|-------|-------------|-----------|-------------|
| ISS-020 | Legacy data modules in src/data/ | Client-side data modules (`src/data/portfolio.ts`, `src/data/chat.ts`, etc.) are retained as reference but no longer used at runtime. | `src/data/` | 2026-03-21 |
| ISS-021 | Console.log statements in providers | Some provider implementations have debug `console.log` calls that should be replaced with structured logging. | `server/providers/` | 2026-03-21 |

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
