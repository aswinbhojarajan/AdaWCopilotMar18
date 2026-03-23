# Ada — AI Wealth Copilot

## Overview
Ada is a mobile-first AI wealth management copilot prototype designed for GCC HNW investors. It's a full-stack application featuring an Express backend, PostgreSQL database, and a React frontend with an LLM-powered AI chat built on a production-grade agent architecture. The project provides a comprehensive financial assistant with capabilities for portfolio analysis, goal tracking, market insights, personalized recommendations, execution guardrails with RM handoff, multi-tenant support, and full agent observability.

## User Preferences
Not specified.

## System Architecture
Ada is built on a full-stack architecture with a React frontend, an Express/TypeScript backend, and a PostgreSQL database.

**Frontend (React 18 + TypeScript):**
- **UI/UX**: Mobile-first design (max 430px), Tailwind CSS v4 for styling, custom fonts (Crimson Pro, DM Sans).
- **State Management & Data Fetching**: TanStack Query v5 for API interactions.
- **Navigation**: The app boots into a Summit Bank "client environment" shell (dummy bank home screen). The Ada experience is launched by tapping the Ada logo (red/maroon circular icon) in the header. Inside Ada: useState-based routing for Home, Wealth, Discover, and Collective tabs (Collective is under the "MORE" bottom nav).
- **Chat Features**: SSE streaming for real-time text rendering, embedded data widgets (allocation chart, holdings summary, goal progress, portfolio summary, advisor handoff), interactive scenario simulators, dynamic suggested questions, and context passing from other screens.
- **Animations**: AnimatePresence for tab transitions and overlays, Framer Motion for animated tab indicator.

**Backend (Express + TypeScript):**
- **API**: 34 RESTful endpoints including 2 SSE streams for AI chat and Morning Sentinel.
- **Agent Orchestrator** (`agentOrchestrator.ts`): Core service managing the AI chat pipeline — PII detection → session hydration → intent classification → policy evaluation → model routing → RAG → prompt assembly → memory → LLM → multi-turn tool execution → wealth engine → guardrails → response building → SSE streaming → trace logging → memory persistence → audit logging.
- **17 Services**:
    - `agentOrchestrator.ts`: Core agent pipeline
    - `policyEngine.ts`: Tenant-level policy evaluation (advisory mode, allowed tools, disclosure profile, execution routing)
    - `modelRouter.ts`: Lane-based multi-model routing (Lane 0 deterministic, Lane 1 fast, Lane 2 reasoning) with request scorecards, provider aliases, per-lane token/temperature budgets
    - `promptBuilder.ts`: Modular system prompt assembly with execution boundary
    - `responseBuilder.ts`: Zod-validated AdaAnswer construction
    - `traceLogger.ts`: Agent trace and tool run persistence with lane metadata, scorecard, and route decision telemetry
    - `guardrails.ts`: Post-response sanitization (blocked phrases, execution claims, security naming, data freshness, disclosures)
    - `wealthEngine.ts`: Deterministic financial calculations (portfolio health, concentration, drift, rebalance)
    - `financialTools.ts`: 9 OpenAI function-calling tools with multi-turn support, tool group mapping (financial_data/market_intel/ui_actions/crm_actions), lane-based filtering
    - `rmHandoffService.ts`: Execution request routing (rm_handoff/api_webhook/disabled)
    - `aiService.ts`: OpenAI client and streaming completions
    - `streamTypes.ts`: StreamEvent type definition for SSE events
    - `intentClassifier.ts`: Two-stage intent classification
    - `ragService.ts`: Portfolio context building from PostgreSQL
    - `memoryService.ts`: Three-tier memory (working/episodic/semantic)
    - `piiDetector.ts`: PII detection and redaction
    - `goalService.ts`: Goal health scores, life gap analysis, life event suggestions
    - `morningSentinelService.ts`: AI daily briefing with anomaly detection
- **6 Repositories**: user, portfolio, content, chat, poll, agent
- **Provider Pattern**: 6 external data providers with priority chain per domain:
    - **Stock/Market Data**: Finnhub (primary) → mock fallback. Env: `MARKET_PROVIDER_*`
    - **Macro/Economic**: FRED (primary) → mock fallback. Env: `MACRO_PROVIDER_*`
    - **Company Filings**: SEC EDGAR (primary) → mock fallback. Env: `FILINGS_PROVIDER_*`
    - **Instrument Lookup**: OpenFIGI (primary) → mock fallback. Env: `INSTRUMENT_PROVIDER_*`
    - **FX Rates**: Frankfurter (primary) → CBUAE (secondary) → mock fallback. Env: `FX_PROVIDER_*`
    - **Regional Rates**: CBUAE (primary) → mock fallback. Env: `REGIONAL_PROVIDER_*`
    Each provider implements: in-memory cache (configurable TTL), rate limiting, sliding-window health tracking, automatic failover. All default to mock; real providers activate via `*_PROVIDER_PRIMARY`, `*_PROVIDER_SECONDARY`, `*_PROVIDER_FALLBACK` env vars.
  - **Phase Strategy**:
    - Phase 1 (Demo/current): All mock. Tools return seeded data.
    - Phase 2 (Pilot): Finnhub (market) + Frankfurter/CBUAE (FX) live. Set `MARKET_PROVIDER_PRIMARY=finnhub`, `FX_PROVIDER_PRIMARY=frankfurter`, `FX_PROVIDER_SECONDARY=cbuae`.
    - Phase 3 (Production): All 6 providers live with full failover. Add keys for FRED, SEC EDGAR, OpenFIGI, CBUAE.
  - **Tool → Provider Mappings**: `get_market_data` → Finnhub, `get_macro_data` → FRED, `get_filings` → SEC EDGAR, `lookup_instrument` → OpenFIGI, `get_fx_rate` → Frankfurter → CBUAE.
- **Execution Guardrails & RM Handoff**: Ada cannot execute trades or claim execution capability. Enforced at 3 layers: system prompt boundary, guardrail regex (7 patterns + hard post-check), orchestrator fallback. Execution requests routed to RM via `advisor_action_queue` (rm_handoff), webhook (api_webhook), or rejected (disabled). Tenant config controls routing.
- **Shared Schemas**: `shared/schemas/agent.ts` — Zod schemas for AdaAnswer, ToolResult, PolicyDecision, IntentClassification, TenantConfig.

**Database (PostgreSQL):**
- 33 tables covering: core app data (users, accounts, portfolios, goals, chat, content), agent architecture (tenants, tenant_configs, instruments, market_quotes, news_items, tool_runs, agent_traces, policy_decisions, conversation_summaries), and execution routing (advisor_action_queue).
- 3 seeded personas (Aisha/Moderate/$93K, Khalid/Conservative/$650K, Raj/Aggressive/$181K) with full data parity: each has accounts, positions, snapshots, performance history (365 days), goals, alerts, and chat threads. WealthScreen insights (primary insight, diversification score, risk level, suggestions, advisor) are computed server-side from actual portfolio data.
- 40 instruments, market quotes, news items, 1 tenant (bank_demo_uae).

## Key Configuration
- **MODEL**: gpt-5-mini via provider aliases (ada-fast → gpt-5-mini, ada-reason → gpt-5-mini)
- **Default user**: user-aisha (fallback when no X-User-ID header provided)
- **User switching**: Frontend sends `X-User-ID` header on all API/stream calls; backend `getUserId(req)` extracts it with fallback to default. `GET /api/users` returns all 3 demo personas. `UserContext` provider persists selection to localStorage, `PersonaPicker` bottom sheet for switching. Data isolation via userId-scoped react-query keys (all hooks include userId in queryKey) + `queryClient.removeQueries()` on switch.
- **Default tenant**: bank_demo_uae
- **SSE event types**: text, widget, simulator, suggested_questions, done, error
- **Execution routing**: defaults to rm_handoff; configurable per tenant
- **Provider config**: `*_PROVIDER_PRIMARY`, `*_PROVIDER_SECONDARY`, `*_PROVIDER_FALLBACK` env vars; all default to 'mock'

## Documentation
- **PRD.md**: Living product requirements document (sections 1-12)
- **CHANGELOG.md**: Detailed change log organized by task
- **ISSUES.md**: Active issue tracker with severity levels (P0-P4)
- **BACKLOG.md**: Feature backlog and future phases
- **MIGRATION_NOTES.md**: Historical migration and refactoring notes

## External Dependencies
- **OpenAI**: AI capabilities via Replit AI Integrations, gpt-5-mini model, SSE streaming
- **PostgreSQL**: Primary database, managed by Replit
- **Vite**: Frontend build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Frontend data fetching and caching
- **Zod**: Runtime schema validation for agent types
- **Framer Motion**: Frontend animations
- **ESLint & Prettier**: Code linting and formatting
