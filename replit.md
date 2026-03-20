# Ada — AI Wealth Copilot

## Overview
A mobile-first wealth management copilot prototype for GCC HNW investors. Full-stack application with Express backend, PostgreSQL database, and React frontend with LLM-powered AI chat. Built on a comprehensive agent architecture with multi-tenant support, provider-based data abstraction, policy engine foundations, and full observability.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Vite 6, Tailwind CSS v4, TanStack Query v5
- **Backend**: Express + TypeScript (via tsx), port 3001
- **Database**: PostgreSQL (Replit-managed), 31 tables
- **AI**: OpenAI (Replit AI Integrations), gpt-5-mini model, streaming SSE (chat + Morning Sentinel)
- **Styling**: Tailwind utility classes, custom fonts (Crimson Pro, DM Sans)
- **Type Checking**: TypeScript 5.8, `tsconfig.json` with `noImplicitReturns`, `noFallthroughCasesInSwitch`
- **Validation**: Zod for runtime schema validation (AdaAnswer, ToolResult, PolicyDecision contracts)
- **Linting**: ESLint 9 (flat config) + Prettier
- **Dev Server**: Vite on port 5000 proxies /api → port 3001
- **Build Output**: `build/` directory

## Project Structure
```
src/
  App.tsx                    — Root component with useState-based navigation
  types/index.ts             — Frontend-specific TypeScript interfaces
  hooks/
    api.ts                   — apiFetch/apiPost helpers for TanStack Query
    usePortfolio.ts          — useHomeSummary, useWealthOverview hooks
    useMorningSentinel.ts    — useMorningSentinel hook with daily caching + force refresh
    useHoldings.ts           — useHoldings hook
    useAllocations.ts        — useAllocations hook
    useGoals.ts              — useGoals, useGoalHealthScore, useLifeGapPrompts, useDismissLifeGapPrompt, useLifeEventSuggestions hooks
    useAccounts.ts           — useAccounts, useAddAccount hooks (query + mutation)
    useContent.ts            — useDiscoverContent hook
    usePolls.ts              — usePolls, useVotePoll hooks (query + mutation)
    useNotifications.ts      — useNotifications hook
    useChatThreads.ts        — useChatThreads hook
  data/                      — Client-side fallback data (no longer imported by screens)
  components/
    ada/                     — Design system components (Button, Tag, ContentCard, Skeleton, ErrorBanner, ChatWidgets, etc.)
    screens/                 — Screen-level components (Home, Wealth, Discover, ChatScreen, etc.)
    figma/                   — Figma utility components (ImageWithFallback)
  imports/                   — Retained Figma-generated files (ClientEnvironment, SVGs)
  assets/                    — Image assets (descriptive names)

server/
  index.ts                   — Express entry point (port 3001), global error handler
  routes/api.ts              — REST API routes with asyncHandler wrapper
  services/
    aiService.ts             — OpenAI client, system prompt builder, streaming completions with tool-calling
    chatService.ts           — Orchestrates intent→RAG→memory→LLM→persist pipeline
    intentClassifier.ts      — Classifies messages into portfolio/goals/market/scenario/general intents
    ragService.ts            — Builds portfolio context from DB (holdings, allocations, goals, accounts, transactions)
    memoryService.ts         — Three-tier memory (working/episodic/semantic) + audit logging
    piiDetector.ts           — Regex-based PII detection (email, phone, SSN, credit card, passport, IBAN)
    goalService.ts           — Goal health score, life-gap prompts, life-event suggestions (AI-powered)
    portfolioService.ts      — Portfolio value computations
    morningSentinelService.ts — AI-generated daily briefing (Morning Sentinel) with anomaly detection
  repositories/              — Data access layer (PostgreSQL queries)
    userRepository.ts        — User + risk profile queries
    portfolioRepository.ts   — Portfolio, holdings, allocations, goals, accounts, performance history + enriched holdings (instruments join)
    contentRepository.ts     — Content cards, alerts, chat threads/messages, peer comparisons
    chatRepository.ts        — Deterministic chat response mappings (fallback, in-memory)
    pollRepository.ts        — Poll questions, options, and voting
    agentRepository.ts       — Tenant configs, tool runs, agent traces, policy decisions, conversation summaries (full CRUD)
  providers/
    types.ts                 — Provider interfaces (Portfolio, Market, News, Macro, FX, Research, Identity)
    registry.ts              — Provider registry with config-driven resolution and fallback warnings
    mock/
      helpers.ts             — toolOk/toolError factory functions for standardized ToolResult envelopes
      portfolioProvider.ts   — Mock portfolio data from DB (positions + instruments join)
      marketProvider.ts      — Mock market quotes from DB (market_quotes table, 40 instruments)
      newsProvider.ts        — Mock news from DB news_items table
      macroProvider.ts       — Mock macro indicators (15 FRED-style series)
      fxProvider.ts          — Mock FX rates (17 currency pairs incl GCC)
      researchProvider.ts    — Mock SEC filings (8 companies)
      identityProvider.ts    — Mock instrument identity from DB instruments table
  db/
    pool.ts                  — pg Pool configured from DATABASE_URL
    schema.sql               — 31-table schema definition
    seed.sql                 — Seed data for 8 demo personas + 40 instruments + 40 market quotes + 20 news items
  replit_integrations/       — OpenAI blueprint integration files (chat, audio, image, batch)

shared/
  types.ts                   — Backend/frontend contract types
  schemas/
    agent.ts                 — Zod schemas: AdaAnswer, ToolResult, PolicyDecision, IntentClassification, MarketQuote, NewsArticle, TenantConfig, AgentTrace
  models/chat.ts             — Drizzle schema for AI integration (not used by main app)
```

## Database Tables (31 total)
**Core Application** (22 tables): users, risk_profiles, advisors, accounts, positions, transactions,
price_history, portfolio_snapshots, goals, alerts, content_items,
peer_segments, chat_threads, chat_messages, action_contexts,
performance_history, poll_questions, poll_options, poll_votes,
episodic_memories, semantic_facts, chat_audit_log

**Agent Architecture** (9 tables):
- `tenants` — Multi-tenant support (id, name, jurisdiction, status)
- `tenant_configs` — Policy engine configuration per tenant (advisory_mode, allowed_tools, disclosure_profile, provider_config, feature_flags, tone, language, blocked_phrases)
- `instruments` — Financial instrument metadata (symbol, name, asset_class, sector, geography, currency, instrument_type, ISIN, FIGI, exchange) — 40 seeded
- `market_quotes` — Current market prices (price, change, volume, high/low/open/close, source_provider) — 40 seeded quotes, DB-backed
- `news_items` — Market news articles (title, summary, publisher, symbols, tags) — 20 seeded
- `tool_runs` — Tool execution audit log (tool_name, inputs, outputs, latency_ms, status, source_provider, conversation/message/user refs)
- `agent_traces` — Full agent run observability (intent, policy_decision, model, tools, timings, guardrails, escalations)
- `policy_decisions` — Policy evaluation audit trail (tenant_id, user_id, request_type, decision JSON)
- `conversation_summaries` — Thread-level memory summarization (user_id NOT NULL, UNIQUE on conversation_id+user_id)

Note: `users.tenant_id` FK to tenants (nullable, backward-compatible)

## API Endpoints
| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/health                | Health check                       |
| GET    | /api/me                    | Current user profile               |
| GET    | /api/home/summary          | Home screen data + content cards   |
| GET    | /api/morning-sentinel      | AI-generated daily briefing (?refresh=true to force) |
| GET    | /api/morning-sentinel/stream | SSE stream of briefing generation (metrics → text → complete) |
| GET    | /api/wealth/overview       | Portfolio value + performance      |
| GET    | /api/wealth/allocation     | Asset allocation (computed)        |
| GET    | /api/wealth/holdings       | Top 5 holdings by value            |
| GET    | /api/wealth/goals          | Financial goals                    |
| GET    | /api/wealth/accounts       | Connected accounts                 |
| GET    | /api/notifications         | User alerts/notifications          |
| GET    | /api/content               | All content items (?category=X)    |
| GET    | /api/content/discover      | Discover feed (?tab=forYou/whatsHappening) |
| GET    | /api/chat/threads          | Chat history threads               |
| GET    | /api/chat/:threadId/messages | Messages in a thread             |
| POST   | /api/chat/message          | Send message, get sync response    |
| POST   | /api/chat/stream           | **SSE streaming** AI chat with tool-calling |
| POST   | /api/chat/:threadId/messages | Send message to specific thread  |
| GET    | /api/collective/peers      | Peer comparison data               |
| GET    | /api/polls                 | Active polls with options & votes  |
| POST   | /api/polls/:pollId/vote    | Vote on a poll option              |

## AI Chat Architecture
The chat system uses a multi-stage pipeline:
1. **PII Detection** — Scans user input for sensitive data (email, phone, SSN, etc.) and redacts before sending to LLM
2. **Intent Classification** — Routes messages to domain handlers: portfolio, goals, market, scenario, general
3. **RAG Pipeline** — Queries user's portfolio data (holdings, allocations, goals, accounts, transactions) from PostgreSQL
4. **Memory System** — Three-tier:
   - Working memory: in-memory conversation turns (per thread, max 20)
   - Episodic memory: summarized conversation episodes in PostgreSQL
   - Semantic memory: extracted user facts/preferences in PostgreSQL
5. **LLM Call** — OpenAI gpt-5-mini with system prompt containing portfolio context, memories, and persona instructions
6. **Tool Calling** — LLM can invoke:
   - `show_simulator`: Triggers interactive scenario simulator (retirement/investment/spending/tax)
   - `show_widget`: Embeds data widgets (allocation chart, holdings summary, goal progress, portfolio summary)
   - `extract_user_fact`: Saves user preferences/facts to semantic memory
7. **Streaming** — Responses stream via SSE with progressive text rendering
8. **Suggested Questions** — LLM generates 3 follow-up suggestions after each response
9. **Audit Logging** — All interactions logged with intent, PII detection status, model, token usage

## Frontend Chat Features
- **SSE Streaming** — Real-time text rendering with typing cursor animation
- **Embedded Widgets** — Inline allocation charts, holdings summaries, goal progress bars, portfolio summaries
- **Scenario Simulators** — Interactive sliders for retirement/investment/spending/tax modeling
- **Suggested Questions** — Dynamic follow-up suggestions from LLM
- **Context Passing** — CTAs on Home/Wealth/Discover screens pass structured context to chat

## SSE Event Types (must be preserved)
- `text` — Streaming text content
- `widget` — Embedded data widget (allocation, holdings, goals, portfolio)
- `simulator` — Scenario simulator trigger
- `suggested_questions` — Follow-up suggestions
- `done` — Stream completion signal
- `error` — Error message

## Navigation
- 4 main tabs: Home, Wealth, Discover, Collective
- useState-based routing (no React Router)
- Chat opens from CTAs on Home/Wealth screens with structured context

## Brand Colors
- Dark red: `#441316`, Medium red: `#992929`
- Green badge: `#c6ff6a`
- Cream background: `#efede6`, Header background: `#f7f6f2`

## Database Setup
```bash
npm run db:setup    # Creates all tables and seeds data
npm run db:schema   # Schema only (idempotent, uses IF NOT EXISTS)
npm run db:seed     # Seed only (idempotent, uses ON CONFLICT DO NOTHING)
```
Requires `DATABASE_URL` environment variable (auto-provisioned by Replit).

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI API base URL (set by Replit AI Integrations)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key (set by Replit AI Integrations)

## Agent Architecture (Foundation Layer — Implemented)
- **Provider Pattern**: 7 data provider interfaces (Portfolio, Market, News, Macro, FX, Research, Identity) with DB-backed mock implementations; provider registry resolves via tenant_config.provider_config with explicit fallback warnings for unknown keys; config-keyed Map cache ensures tenant isolation
- **ToolResult Contract**: All providers return standardized `ToolResult` envelopes with `status` (ok/error/partial/timeout), `source_name`, `source_type`, `as_of` timestamp, `latency_ms`, and optional `warnings`/`error`; factory functions `toolOk()`/`toolError()` in helpers.ts ensure consistency
- **Tenant/Policy Engine**: Code-driven policy decisions per tenant (advisory_mode, allowed tools, disclosure profile, provider_config, feature_flags); default tenant: bank_demo_uae (UAE jurisdiction, personalized_insights_only mode)
- **AdaAnswer Schema**: Structured response format (answer_id, mode, user_intent, headline, summary, key_points, portfolio_insights, market_context, recommendations, actions, disclosures, citations, render_hints, suggested_questions, tool_results)
- **Agent Tracing**: Full observability via `tool_runs` and `agent_traces` tables; every tool call records source_provider + as_of timestamp; query functions for traces by conversation and user
- **Policy Decision Logging**: `policy_decisions` table with full CRUD; queryable by user and by request_type/tenant
- **Instruments Table**: 40 seeded instruments (US equities, GCC equities, ETFs, bonds, commodities, crypto) with ISIN/FIGI/exchange metadata
- **Market Quotes**: DB-backed `market_quotes` table with 40 seeded price snapshots; MarketProvider reads from DB (not in-memory constants)
- **News System**: 20 seeded news articles in `news_items` table, queryable by symbol and tag
- **8 Demo Personas**: Abdullah (default, moderate), Fatima (conservative), Omar (aggressive), Layla (moderate), Khalid (ultra-conservative/cash-heavy), Sara (goal-based family), Raj (tech/crypto heavy trader), Nadia (advisor-led dividend investor) — all with recent transactions
- **Provider Registry Routing**: Config-driven with explicit case branches for future providers (finnhub, fred, sec_edgar, frankfurter, cbuae) plus graceful fallback-to-mock with console warnings

## Agent Architecture (Pending Tasks)
- **Task #2 — Agent Architecture & Intelligence Overhaul**: Agent orchestrator, financial tool calling via OpenAI functions, policy engine logic, deterministic wealth engine, prompt assembly pipeline, multi-model routing, structured response builder, trace logging, guardrails
- **Task #3 — External Data Source Integration**: Finnhub (market), FRED (macro), SEC EDGAR (filings), OpenFIGI (identity), Frankfurter (FX), CBUAE (AED rates) — wire real APIs behind existing provider interfaces

## Key Decisions
- "Lounge" renamed to "Collective" everywhere
- Repository/service pattern; repositories query PostgreSQL
- Asset allocation computed from positions + account balances
- Chat uses LLM with full portfolio RAG context
- AnimatePresence transitions: tab switches (horizontal slide), overlays (slide-up), ClientEnvironment (fade)
- Pull-to-refresh on Home, Wealth, Discover, Collective screens (PullToRefresh component with forwardRef)
- Animated tab indicator using Framer Motion layoutId in Navigation component
- Production deployment configured as autoscale (build: vite, run: Node.js Express)
- asyncHandler wrapper on all async Express routes
- Global error handler catches unhandled errors
- Default user: Abdullah Al-Rashid (user-abdullah)
- ESLint ignores `src/imports/` (Figma-generated code)
- Poll voting uses transactions for atomicity (vote count + vote record)
- Performance history seeded with 366 days of data via generate_series
- AI model: gpt-5-mini (cost-effective, fast, supports tool-calling)
- All DB changes are additive — existing tables preserved; ON CONFLICT DO NOTHING for seed idempotency
- Provider mock implementations are DB-backed (not in-memory constants) for realistic behavior
- ToolResult status includes 'timeout' alongside 'ok'/'error'/'partial' for consistency between Zod schema and DB
