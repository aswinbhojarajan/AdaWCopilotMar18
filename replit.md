# Ada — AI Wealth Copilot

## Overview
Ada is a mobile-first AI wealth management copilot prototype designed for GCC HNW investors. It's a full-stack application featuring an Express backend, PostgreSQL database, and a React frontend with an LLM-powered AI chat built on a production-grade agent architecture. The project provides a comprehensive financial assistant with capabilities for portfolio analysis, goal tracking, market insights, personalized recommendations, execution guardrails with RM handoff, multi-tenant support, and full agent observability.

## User Preferences
Not specified.

## System Architecture
Ada is built on a full-stack architecture with a React frontend, an Express/TypeScript backend, and a PostgreSQL database.

**Frontend (React 18 + TypeScript):**
- **UI/UX**: Mobile-first design (max 430px), Tailwind CSS v4 for styling, custom fonts loaded via Google Fonts (Crimson Pro, DM Sans) and TypeKit (RL Limo). Font loading configured in `index.html`. Mobile responsive: dvh viewport units (with vh fallback), safe area insets via `pt-safe`/`pb-safe` utility classes, all font sizes in rem, 48px minimum touch targets, fluid container padding via `var(--container-pad)`. Design tokens in `src/styles/design-tokens.css`, viewport utilities in `src/styles/globals.css`.
- **State Management & Data Fetching**: TanStack Query v5 for API interactions.
- **Navigation**: The app boots into an Ada-branded LoginPage (cream bg, email/password form, dev persona picker). After sign-in, the user enters Ada with useState-based routing for Home, Wealth, Discover, and Collective tabs (Collective is under the "MORE" bottom nav). Close/X button navigates back to the login view.
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
    - `intentClassifier.ts`: LLM-based intent classification with `classifyIntentAsync()` (OpenAI call with 3s AbortController timeout, keyword fallback on timeout/error). Maps to 7 intents: portfolio, goals, market, scenario, recommendation, execution_request, general. Fallback confidence=0.5, error confidence=0.4.
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
- **Capability Registry** (`capabilityRegistry.ts`): Model capability registry mapping provider aliases (ada-fast, ada-reason, ada-fallback) to capabilities (streaming, tool_calling, json_mode, reasoning, etc.), cost tiers, and context limits. Also contains intent→lane→tool routing metadata (LaneConfig, IntentRouteConfig) injected into classifier prompt via `getClassifierContext()`. Used by orchestrator for model selection, prompt builder for capability context, and verbose mode output.
- **LLM Resilience & Fallback Provider**: Streaming timeout+retry with AbortController (attempt 1: 15s, attempt 2: 20s). Lane 2 → Lane 1 automatic downgrade when both reasoning-model attempts fail — retries with ada-fast at lower max_tokens (4096) for degraded-but-functional responses. Lane 0 deterministic queries bypass LLM entirely. `resilientCompletion()` and `resilientStreamCompletion()` helpers in `openaiClient.ts` provide configurable timeout+retry for non-streaming calls. When OpenAI primary provider fails all retries, automatic fallback to Anthropic Claude (claude-sonnet-4-6 via Replit AI Integrations). Anthropic adapter converts OpenAI message format to Anthropic messages API and response back to OpenAI format. Fallback chain: ada-fast → ada-fallback, ada-reason → ada-fallback.
- **Execution Guardrails & RM Handoff**: Ada cannot execute trades or claim execution capability. Enforced at 3 layers: system prompt boundary, guardrail regex (7 patterns + hard post-check), orchestrator fallback. Execution requests routed to RM via `advisor_action_queue` (rm_handoff), webhook (api_webhook), or rejected (disabled). Tenant config controls routing.
- **Shared Schemas**: `shared/schemas/agent.ts` — Zod schemas for AdaAnswer, ToolResult, PolicyDecision, IntentClassification, TenantConfig.

**Database (PostgreSQL):**
- 33 tables covering: core app data (users, accounts, portfolios, goals, chat, content), agent architecture (tenants, tenant_configs, instruments, market_quotes, news_items, tool_runs, agent_traces, policy_decisions, conversation_summaries), and execution routing (advisor_action_queue).
- 3 seeded personas (Aisha/Moderate/$93K, Khalid/Conservative/$650K, Raj/Aggressive/$181K) with full data parity: each has accounts, positions, snapshots, performance history (365 days), goals, alerts, and chat threads. WealthScreen insights (primary insight, diversification score, risk level, suggestions, advisor) are computed server-side from actual portfolio data.
- 40 instruments, market quotes, news items, 1 tenant (bank_demo_uae).

## Key Configuration
- **MODEL**: gpt-5-mini via provider aliases (ada-fast → gpt-5-mini, ada-reason → gpt-5-mini). Fallback: ada-fallback → claude-sonnet-4-6 (Anthropic via Replit AI Integrations)
- **Default user**: user-aisha (fallback when no X-User-ID header provided)
- **User switching**: Frontend sends `X-User-ID` header on all API/stream calls; backend `getUserId(req)` extracts it with fallback to default. `GET /api/users` returns all 3 demo personas. `UserContext` provider persists selection to localStorage, `PersonaPicker` bottom sheet for switching. Data isolation via userId-scoped react-query keys (all hooks include userId in queryKey) + `queryClient.removeQueries()` on switch.
- **Default tenant**: bank_demo_uae
- **SSE event types**: text, widget, simulator, suggested_questions, thinking, done, error
- **Verbose/Thinking Mode**: Users can toggle "Think" mode in the chat header to see Ada's reasoning pipeline in real-time. When enabled, `thinking` SSE events stream pipeline steps (PII scan, intent classification, policy evaluation, routing, model selection, data prefetch, LLM generation, guardrails). The `verbose` flag is sent in the `ChatMessageRequest` body and persisted to localStorage. Tenant-level `verbose_mode` feature flag (default: true) gates verbose output; early thinking events are buffered until tenant config is loaded.
  - **During streaming**: `LiveThinkingBar` component renders fixed below the chat header with progressive step reveal (120ms stagger animation), amber pulsing indicator, and step counter. Gated on `verbose && isTyping && thinkingSteps.length > 0`.
  - **After streaming**: `ThinkingPanel` summary renders as a collapsible panel above the assistant message. Gated on `verbose && !isTyping && thinkingSteps.length > 0` on the last assistant message.
  - **Server-side delivery**: 4x `setImmediate()` async ticks in orchestrator (after early buffer, after routing, before lane0 dispatch, before data_prefetch) + typed `flush()` in api.ts after thinking events ensure separate SSE chunk delivery.
  - **Toggle edge cases**: Toggle controls visibility only, never clears steps. Steps cleared only at start of next `sendAndReceive`.
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
