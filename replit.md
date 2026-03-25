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
    - `toolRegistry.ts`: Declarative tool manifest registry — all 15 tools defined as self-contained manifests (name, group, profile, OpenAI definition, execute handler, suggestion rules). Auto-derives ALL_TOOLS, PROFILE_TOOL_MAP, TOOL_GROUP_MAP, OpenAI definitions, execution dispatch, and inferSuggestedTools from manifests. Startup validation in server/index.ts ensures manifest consistency.
    - `financialTools.ts`: Thin delegation layer over toolRegistry — re-exports getToolDefinitions, executeFinancialTool, isFinancialTool, filterToolNamesByGroups for backward compatibility
    - `rmHandoffService.ts`: Execution request routing (rm_handoff/api_webhook/disabled)
    - `aiService.ts`: OpenAI client and streaming completions
    - `streamTypes.ts`: StreamEvent type definition for SSE events
    - `intentClassifier.ts`: LLM-based intent classification with `classifyIntentAsync()` (gpt-4.1-nano via ada-classifier alias, 1.2s timeout, keyword fallback on timeout/error). Emits 11 direct routing intents: balance_query, portfolio_explain, allocation_breakdown, goal_progress, market_context, news_explain, scenario_analysis, recommendation_request, execution_request, support, general. Enriched structured output: intent, confidence, reasoning_effort, needs_live_data, needs_tooling, mentioned_entities, followup_mode. Priority-based rule engine fallback classifier. No translation layer (mapOldIntentToNew removed). **Context-aware follow-ups**: accepts optional `recentHistory` (last 4 conversation turns from working memory); LLM prompt includes `<recent_conversation>` block with follow-up resolution rules; `isLikelyContinuation()` heuristic (≤6 words + 12 continuation patterns like "do across all", "tell me more"); post-classification override inherits prior intent when LLM returns "general" for a likely continuation.
    - `ragService.ts`: Portfolio context building from PostgreSQL
    - `memoryService.ts`: Three-tier memory (working/episodic/semantic)
    - `piiDetector.ts`: PII detection and redaction
    - `goalService.ts`: Goal health scores, life gap analysis, life event suggestions
    - `morningSentinelService.ts`: AI daily briefing with anomaly detection
- **ErrorBoundary** (`src/components/ada/ErrorBoundary.tsx`): React class component wrapping WealthScreen and DiscoverScreen. Catches rendering crashes and displays user-friendly error with retry button.
- **6 Repositories**: user, portfolio, content, chat, poll, agent
- **Provider Pattern**: 7 external data providers with priority chain per domain (all LIVE):
    - **Stock/Market Data**: Finnhub (primary) → Yahoo Finance (secondary) → mock fallback. Env: `MARKET_PROVIDER_PRIMARY=finnhub`, `MARKET_PROVIDER_SECONDARY=yahoo_finance`
    - **News**: Finnhub (primary) → Yahoo Finance (secondary) → mock fallback. Env: `NEWS_PROVIDER_PRIMARY=finnhub`, `NEWS_PROVIDER_SECONDARY=yahoo_finance`
    - **Macro/Economic**: FRED (primary) → mock fallback. Env: `MACRO_PROVIDER_PRIMARY=fred`
    - **Company Filings**: SEC EDGAR (primary) → mock fallback. Env: `FILING_PROVIDER_PRIMARY=sec_edgar`
    - **Instrument Lookup**: OpenFIGI (primary) → mock fallback. Env: `IDENTITY_PROVIDER_PRIMARY=openfigi`
    - **FX Rates**: Frankfurter (primary) → CBUAE (secondary) → mock fallback. Env: `FX_PROVIDER_PRIMARY=frankfurter`, `FX_PROVIDER_SECONDARY=cbuae`
    - **Regional FX (AED)**: CBUAE (primary) → Frankfurter → mock fallback
    Each provider implements: in-memory cache (configurable TTL), rate limiting, sliding-window health tracking, automatic failover. Provider status available via `GET /api/providers/status`.
  - **Tool → Provider Mappings (all wired to LLM)**:
    - `getQuotes` → Finnhub → Yahoo Finance (market quotes)
    - `getHistoricalPrices` → Finnhub → Yahoo Finance (price history)
    - `getCompanyProfile` → Finnhub → Yahoo Finance (company info)
    - `getMacroIndicator` → FRED (inflation, GDP, yields, VIX, etc.)
    - `getCompanyFilings` → SEC EDGAR (10-K, 10-Q, 8-K, XBRL facts)
    - `lookupInstrument` → OpenFIGI (ticker/ISIN/CUSIP → FIGI)
    - `getFxRate` → Frankfurter/CBUAE (FX rates, AED pairs)
    - `getHoldingsRelevantNews` → Finnhub → Yahoo Finance (news)
  - **Required Secrets**: `FINNHUB_API_KEY` (free tier: 60 calls/min), `FRED_API_KEY` (free: 120 req/min). SEC EDGAR (User-Agent only, configurable via `EDGAR_USER_AGENT`), OpenFIGI (optional `OPENFIGI_API_KEY`), Frankfurter, CBUAE, Yahoo Finance — no keys needed.
- **Capability Registry** (`capabilityRegistry.ts`): Model capability registry mapping 4 provider aliases (ada-classifier, ada-fast, ada-reason, ada-fallback) to capabilities (streaming, tool_calling, json_mode, reasoning, etc.), cost tiers, and context limits. Lane configs include per-lane temperature (Lane 1: 0.15, Lane 2: 0.10), max output tokens (Lane 1: 1800, Lane 2: 2600), and tool round limits (Lane 1: 1 round/3 calls, Lane 2: 2 rounds/4 calls). Also contains intent→lane→tool routing metadata (LaneConfig, IntentRouteConfig) injected into classifier prompt via `getClassifierContext()`. Used by orchestrator for model selection, prompt builder for capability context, and verbose mode output.
- **LLM Resilience & Fallback Provider**: Streaming timeout+retry with AbortController (attempt 1: 15s, attempt 2: 20s). Lane 2 → Lane 1 automatic downgrade when both reasoning-model attempts fail — retries with ada-fast at lower max_tokens (4096) for degraded-but-functional responses. Lane 0 deterministic queries bypass LLM entirely. `resilientCompletion()` and `resilientStreamCompletion()` helpers in `openaiClient.ts` provide configurable timeout+retry for non-streaming calls. When OpenAI primary provider fails all retries, automatic fallback to Anthropic Claude (claude-sonnet-4-6 via Replit AI Integrations, now with tool_calling support). Anthropic adapter converts OpenAI message format to Anthropic messages API and response back to OpenAI format. Fallback chains: ada-reason → ada-fast → ada-fallback (two-step), ada-fast → ada-fallback, ada-classifier → keyword fallback (no LLM fallback).
- **Execution Guardrails & RM Handoff**: Ada cannot execute trades or claim execution capability. Enforced at 3 layers: system prompt boundary, guardrail regex (7 patterns + hard post-check), orchestrator fallback. Execution requests routed to RM via `advisor_action_queue` (rm_handoff), webhook (api_webhook), or rejected (disabled). Tenant config controls routing.
- **Shared Schemas**: `shared/schemas/agent.ts` — Zod schemas for AdaAnswer, ToolResult, PolicyDecision, IntentClassification, TenantConfig.

**Database (PostgreSQL):**
- 33 tables covering: core app data (users, accounts, portfolios, goals, chat, content), agent architecture (tenants, tenant_configs, instruments, market_quotes, news_items, tool_runs, agent_traces, policy_decisions, conversation_summaries), and execution routing (advisor_action_queue).
- 3 seeded personas (Aisha/Moderate/$93K, Khalid/Conservative/$650K, Raj/Aggressive/$181K) with full data parity: each has accounts, positions, snapshots, performance history (365 days), goals, alerts, and chat threads. WealthScreen insights (primary insight, diversification score, risk level, suggestions, advisor) are computed server-side from actual portfolio data.
- 40 instruments, market quotes, news items, 1 tenant (bank_demo_uae).

## Key Configuration
- **MODEL**: 4-tier model stack via provider aliases: ada-classifier → gpt-4.1-nano (intent classification, follow-up generation), ada-fast → gpt-4.1-mini (Lane 1 conversational), ada-reason → gpt-4.1 (Lane 2 deep reasoning). Fallback: ada-fallback → claude-sonnet-4-6 (Anthropic via Replit AI Integrations, now with tool_calling). Fallback chains: ada-reason → ada-fast → ada-fallback, ada-fast → ada-fallback, ada-classifier → keyword fallback (no LLM fallback)
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
- **Provider config**: `*_PROVIDER_PRIMARY`, `*_PROVIDER_SECONDARY`, `*_PROVIDER_FALLBACK` env vars; tenant `provider_config` DB column must be `'{}'` to use env vars (non-empty JSON overrides env vars via `getChainKeys` in registry.ts)
- **Policy engine tool profiles**: `allowed_tool_profiles` in tenant config maps to tools via `getProfileToolMap()` from `toolRegistry.ts` (auto-derived from manifests). Profiles: portfolio_read, market_read, news_read, macro_read, fx_read, research_read, health_compute, execution_route, workflow_light
- **Adding a new tool**: Create a new ToolManifest entry in `server/services/toolRegistry.ts` with name, group, profile, OpenAI definition, execute handler, and optional suggestion rules. Everything else (policy engine, tool dispatch, inferSuggestedTools, startup validation) is derived automatically — no other files need manual updates.

## Documentation
- **PRD.md**: Living product requirements document (sections 1-12)
- **CHANGELOG.md**: Detailed change log organized by task
- **ISSUES.md**: Active issue tracker with severity levels (P0-P4)
- **BACKLOG.md**: Feature backlog and future phases
- **MIGRATION_NOTES.md**: Historical migration and refactoring notes

## External Dependencies
- **OpenAI**: AI capabilities via Replit AI Integrations, 3 models: gpt-4.1-nano (classifier), gpt-4.1-mini (fast lane), gpt-4.1 (reasoning lane), SSE streaming
- **Anthropic**: Fallback AI provider via Replit AI Integrations (claude-sonnet-4-6)
- **Finnhub**: Live market data, company profiles, news (free tier, needs `FINNHUB_API_KEY`)
- **Yahoo Finance**: Secondary market data and news provider via `yahoo-finance2` npm package (no key needed)
- **FRED**: Federal Reserve Economic Data for macro indicators (free, needs `FRED_API_KEY`)
- **SEC EDGAR**: Company filings and XBRL financial facts (no key, User-Agent header only)
- **OpenFIGI**: Instrument identifier resolution (no key required, optional `OPENFIGI_API_KEY`)
- **Frankfurter**: ECB reference FX rates (no key needed)
- **CBUAE**: UAE Central Bank AED exchange rates (no key needed)
- **PostgreSQL**: Primary database, managed by Replit
- **Vite**: Frontend build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **TanStack Query**: Frontend data fetching and caching
- **Zod**: Runtime schema validation for agent types
- **Framer Motion**: Frontend animations
- **ESLint & Prettier**: Code linting and formatting
