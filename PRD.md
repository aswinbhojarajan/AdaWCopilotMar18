# Ada — AI Wealth Copilot: Product Requirements Document

> **Living document** — update this PRD before and after every build cycle.
> Last updated: 2026-03-27
>
> **Source of truth precedence**: When a mismatch exists between this document and the runtime code/schema, the code is authoritative. Update this PRD to reflect the code, not the other way around.
>
> **Last audited against**: `server/routes/api.ts`, `server/index.ts`, `server/db/schema.sql`, `server/db/seed.sql`, `src/App.tsx`, `src/main.tsx`, `src/components/screens/*.tsx`, `src/components/ada/index.ts`, `src/hooks/*.ts`, `shared/types.ts`, `src/types/index.ts`, `server/services/*.ts`, `tsconfig.json`

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Target Users & Personas](#2-target-users--personas)
3. [Navigation & Interaction Patterns](#3-navigation--interaction-patterns)
4. [Feature Requirements by Tab](#4-feature-requirements-by-tab)
5. [Chat Experience](#5-chat-experience)
6. [Design System](#6-design-system)
7. [API Contracts](#7-api-contracts)
8. [Data Model](#8-data-model)
9. [Architecture & Patterns](#9-architecture--patterns)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Implementation Status](#11-implementation-status)
12. [Change Log](#12-change-log)

---

## 1. Product Vision

**Ada** is a mobile-first AI wealth copilot that helps investors understand, manage, and optimize their portfolios through conversational intelligence. It combines real-time portfolio data, market insights, peer comparisons, and an AI-powered chat assistant into a single, approachable interface.

### Core Value Propositions

- **Proactive insights**: Surface portfolio risks, opportunities, and action items before the user asks.
- **Conversational finance**: Allow users to explore complex financial topics through natural-language chat with LLM-powered, advisor-quality responses that stream in real time.
- **Peer benchmarking**: Show how the user's allocation compares to similar investors.
- **Goal tracking**: Monitor progress toward financial goals with AI-generated recovery suggestions.

### Product Principles

- Mobile-first (max 430px viewport, touch-optimized).
- Every insight is actionable — cards and alerts include CTAs that open contextual chat.
- No dead ends — every screen provides a path to deeper exploration via the AI chat.
- Warm, premium aesthetic — cream backgrounds, serif headlines, muted reds.

---

## 2. Target Users & Personas

### Audience

High-net-worth individuals (HNWI) and affluent investors in the GCC region who want AI-assisted portfolio management alongside human advisor access.

### Demo Personas

Three seeded personas exist in the database with full data parity. **Aisha Al-Rashid** is the default user and the primary demo persona. Each persona has accounts, positions, a 365-day performance history (bounded, risk-profile-appropriate curves using normalized cumulative random walk), goals, alerts, and chat threads. User switching is supported via the PersonaPicker bottom sheet; all API calls include the selected user's ID via the `X-User-ID` header.

| ID | Name | Risk Profile | Score | Portfolio Value | Key Traits |
|---|---|---|---|---|---|
| `user-aisha` | Aisha Al-Rashid | Moderate | 62 | $93,105.94 | Default user. 3 accounts (HSBC $18,966.04, Interactive Brokers $64,656.88, WIO Bank $9,483.02). 7 positions. 2 goals (house deposit, education fund). Cash-heavy allocation (66%) with deploy-to-income advisory scenarios. Performance range: $76K–$93K. |
| `user-khalid` | Khalid Al-Mansouri | Conservative | 28 | $650,000.00 | 3 accounts (Saudi National Bank $285,000, Riyad Bank $142,000, Saxo Bank $223,000). 1 goal (preserve capital). Cash-heavy allocation. Performance range: $638K–$651K. |
| `user-raj` | Raj Patel | Aggressive | 92 | $181,327.25 | 3 accounts (Binance $52,000, Interactive Brokers $120,827.25, WIO Bank $8,500). 1 goal (early retirement). Performance history includes drawdowns. Negative daily change (-1.80%). Performance range: $150K–$184K. |

All personas share the same advisor: **Sarah Mitchell** (Senior Wealth Advisor, `advisor-sarah`).

Previously 8 personas existed (Abdullah, Fatima, Omar, Layla, Khalid, Sara, Raj, Nadia). Reduced to 3 in Task #12 to improve demo focus and data quality. Abdullah was later renamed to Aisha in Task #13. The removed personas (Fatima Hassan, Omar Khalil, Layla Mahmoud, Sara Al-Fahad, Nadia Khoury) were removed from `seed.sql` and the database was reseeded.

---

## 3. Navigation & Interaction Patterns

### Tab Bar

Four main tabs displayed via the `Navigation` component:

| Tab | Key | Route |
|---|---|---|
| Home | `home` | Default landing after login |
| Wealth | `wealth` | Portfolio deep-dive |
| Discover | `discover` | Content feed |
| Collective | `collective` | Peer insights & polls |

### Routing

- **useState-based routing** in `App.tsx` — no React Router.
- `activeTab` (TabType) controls which tab screen renders.
- `currentView` (ViewType) controls overlay screens: `chat`, `chat-history`, `notifications`, `home-empty`, `login`.
- The app starts on `login` (email/password sign-in page with dev quick-access persona picker), then navigates to `home`.

### Screen Layout Pattern

Every tab screen follows the same layout:

```
┌─────────────────────┐
│ Header (logo + icons)│
│ Navigation (tabs)    │  ← Fixed, z-10, pt-[16px]
├─────────────────────┤
│                     │
│ Scrollable Content  │  ← overflow-y-auto
│                     │
├─────────────────────┤
│ BottomBar (chat)     │  ← Fixed, z-10
└─────────────────────┘
```

### Interaction Patterns

- **CTA → Chat**: Content card buttons, goal CTAs, insight actions, and peer comparison buttons all call `onChatSubmit(message, context)`, which opens the chat screen with a pre-populated user message and structured context.
- **Notifications**: Bell icon in Header opens the NotificationsScreen overlay.
- **Chat History**: Clock icon in BottomBar opens ChatHistoryScreen listing previous threads from the database.
- **Resume Chat**: If `hasActiveChatToday` is true, the BottomBar shows a "Resume" option.
- **Close/Back**: "X" button returns to the login page.
- **Slide Notifications**: `SlideNotification` component provides toast-style alerts (used on Wealth and Collective screens for goal alerts after poll voting).

---

## 4. Feature Requirements by Tab

### 4.1 Home Tab

**Purpose**: Daily summary view with proactive AI-generated insights and portfolio overview.

**Data Sources**:

| Endpoint | Response Type |
|---|---|
| `GET /api/home/summary` | `HomeSummaryResponse` |
| `GET /api/morning-sentinel` | `MorningSentinelResponse` |
| `GET /api/morning-sentinel/stream` | SSE stream (`SentinelStreamEvent`) |

**Components**:

| Section | Component | Data | Behavior |
|---|---|---|---|
| Morning Sentinel | `MorningSentinelCard` / `StreamingSentinel` | AI-generated daily briefing: portfolio metrics, market movers, risks, actions | Prefetched on app init. Falls back to SSE streaming if not cached. Progressive text rendering with typing animation. Refresh button forces regeneration. |
| Summary Card | `SummaryCard` | Greeting, date, attention count, summary text | Static display |
| Portfolio Overview | Inline card | Portfolio value, daily change (amount + %), sparkline chart | "Dive deeper" CTA opens chat with portfolio context. "Contact advisor" button (placeholder). |
| Content Cards | `ContentCard` (×N) | Category, title, description, timestamp, CTA buttons, optional image, sources count | Primary button opens chat with card context. Secondary button (if present) also opens chat. Rendered from `contentCards` array in API response. |

**Morning Sentinel** is an AI-generated daily briefing produced by `morningSentinelService.ts`. It analyzes the user's portfolio for anomalies (concentration risk, large daily moves, low diversification) and generates a personalized narrative covering portfolio status, market context, risk alerts, and recommended actions. The briefing is:

- **Prefetched** on app initialization in `main.tsx` via TanStack Query prefetch (4h cache TTL).
- **Streamed** via SSE if the prefetch hasn't completed when the user reaches Home. The `useMorningSentinel` hook coordinates: it waits 500ms for the prefetch, then starts an SSE stream if needed.
- **Deduplicated** server-side: an `inFlightRequests` Map prevents concurrent OpenAI calls for the same user.
- **Cacheable**: Results are cached with `gcTime` and `staleTime` of 4 hours.

**Content Cards** are sourced from the `content_items` database table filtered by `target_screen = 'home'`. Three home cards are seeded:

1. Portfolio Risk Alert — growth stocks above target
2. Market Opportunity Insight — GCC bonds demand
3. News — year-end market surge (includes image, 68 sources)

### 4.2 Wealth Tab

**Purpose**: Comprehensive portfolio dashboard with interactive components.

**Data Sources** (5 parallel API calls):

| Endpoint | Response Type |
|---|---|
| `GET /api/wealth/overview` | `WealthOverviewResponse` |
| `GET /api/wealth/allocation` | `AssetAllocation[]` |
| `GET /api/wealth/holdings` | `Holding[]` |
| `GET /api/wealth/goals` | `GoalResponse[]` |
| `GET /api/wealth/accounts` | `AccountResponse[]` |

**Components** (rendered top-to-bottom):

| Section | Component | Key Features |
|---|---|---|
| Wealth Snapshot | `WealthSnapshot` | Total value, daily change badge, performance chart with time-frame toggles (1D, 1W, 1M, 3M, 1Y). Two expandable insight rows: "Portfolio Concentration Alert" and "Emerging Risk to Watch", each with CTA → chat. |
| Asset Allocation | `CompactAssetAllocation` | Donut chart + legend showing allocation breakdown (Stocks 55%, Cash 20%, Bonds 15%, Crypto 6%, Commodities 4%). |
| Portfolio Health | `PortfolioHealthSummary` | Diversification score (82/100), risk level (low-medium), suggestions. CTA → chat. |
| Holdings | `CompactHoldings` | Top 5 holdings by value with symbol, name, value, change %. |
| Goals | `CompactGoals` | Expandable section. Each goal shows progress bar, health status badge (on-track/needs-attention/at-risk), AI insight, CTA button → chat. House deposit goal supports auto-scroll from notification. Goal Health Score gauge (0–100). |
| Life Gap Analysis | `LifeGapPrompts` | AI-driven detection of missing financial goals (e.g., emergency fund, estate planning). Each prompt includes explanation and "Create Goal" CTA. Dismissible per-user. |
| Life Event Simulation | `LifeEventModal` | Modal to simulate life events (New Baby, Home Purchase, Career Change, etc.) and receive AI-generated goal suggestions with reasoning. |
| Connected Accounts | `CompactConnectedAccounts` | List of linked accounts with logo, balance, sync status. "Add account" button opens `AddAccountModal`. |
| Advisor | `CollapsibleAdvisor` | Expandable advisor card showing Sarah Mitchell, availability, contact button. |

**Goals & Life Planning** features (added in Task #8):

- **Goal Health Score**: Computed by `goalService.ts` based on target amount, current savings, deadline proximity, and contribution trajectory. Returns a 0–100 score with status (on-track/needs-attention/at-risk) and actionable recommendation.
- **Life Gap Analysis**: AI-powered detection of missing financial coverage areas. The LLM analyzes the user's existing goals and risk profile to identify gaps like emergency fund, disability insurance, or estate planning. Prompts are dismissible and stored in the database.
- **Life Event Suggestions**: Users select a life event (from a predefined list), and the LLM generates tailored goal suggestions with target amounts, timelines, and reasoning based on the user's portfolio context.

**Additional Wealth Endpoints**:

| Endpoint | Method | Description |
|---|---|---|
| `GET /api/wealth/goals/health-score` | GET | Computed goal health score (0–100) |
| `GET /api/wealth/goals/life-gaps` | GET | AI-generated life gap prompts |
| `POST /api/wealth/goals/life-gaps/dismiss` | POST | Dismiss a life gap prompt |
| `POST /api/wealth/goals/life-event` | POST | Generate goal suggestions for a life event |

**Special Behaviors**:

- `SlideNotification` component is implemented and prop-driven (`showGoalNotification`). In the current app flow, goal notification visibility on Wealth is controlled by `App.tsx` state — it is not actively triggered by default but the component is wired and ready.
- Auto-scroll: When navigating from Collective after poll vote, the Wealth tab auto-expands goals and scrolls to the house deposit goal.
- Add Account Modal: Adds a new account via `POST /api/wealth/accounts` (persisted to database).

### 4.3 Discover Tab

**Purpose**: AI-curated, personalized content feed with live market content and editorial insights for GCC HNW investors.

**Data Source**: `GET /api/content/discover?tab={forYou|whatsNew}` → `DiscoverContentItem[]`

**Architecture**: 3-phase automated content pipeline (Ingest → Enrich → Cluster → Synthesize → Ada View → Event Calendar → Morning Briefing → Milestone → Expiry → Materialize). All processing is Node.js in-process `setInterval` workers with concurrency guards. No Redis/BullMQ/Kafka. Pipeline health exposed via `GET /api/discover/health`.

**Tabs**: "For You" (personalized, scored per user) and "What's New" (chronological).

**Components**:

| Section | Component | Behavior |
|---|---|---|
| Filter Tags | `Tag` (×2) | "For You" (default) and "What's New" toggle. Switching re-fetches content from API. |
| Content Cards | `ContentCard` (×N) | Each card includes: category label, title, context title, description, real relative timestamp, primary + secondary CTA buttons, optional image, sources count from cluster data, expandable detail sections, "Why you're seeing this" tag, "NEW" badge for unseen cards, dismiss/feedback flow. Type-specific intent badge and topic label. |

**Card Types** (11 active):

| Card Type | Source | Description |
|---|---|---|
| `portfolio_impact` | Pipeline (clusters) | Market events impacting user holdings |
| `trend_brief` | Pipeline (clusters) | Multi-article trend synthesis |
| `market_pulse` | Pipeline (standalone) | Single high-importance article, polished |
| `explainer` | Editorial (seed) | Educational deep-dives (private credit, estate planning, etc.) |
| `wealth_planning` | Editorial (seed) | Actionable wealth strategies |
| `allocation_gap` | Editorial (seed) | Cards targeting user's allocation underweights |
| `ada_view` | Ada View Worker | Weekly editorial synthesis of top themes |
| `event_calendar` | Event Calendar Worker | Upcoming earnings/events with portfolio impact markers |
| `morning_briefing` | Morning Briefing Worker | Daily LLM-synthesized brief from overnight cards + Morning Sentinel portfolio context. Pinned at #1 in For You. 16-hour expiry. |
| `milestone` | Milestone Worker | Portfolio value threshold crossings ($25K–$1M), daily performance >2%, goal completions. User-scoped. |
| `product_opportunity` | Editorial (seed) | Investment product cards (sukuk, PE co-invest) with Screen/Advisor CTAs and suitability metadata. |

**Personalization Engine** (4 layers):
1. **Card Selection**: Eligible cards filtered by suitability, expiry, and user dismissals
2. **Card Ranking**: Deterministic weighted scoring — 30% portfolio relevance, 20% allocation gap, 15% suitability, 10% geo, 10% importance, 10% freshness, 5% novelty
3. **Engagement Re-ranking**: +10% boost per shared taxonomy tag with tapped cards (cap 3), -20% penalty per shared tag with dismissed cards (cap 2), +5% segment collaborative filtering boost (≥2 peers tapped, cap 3)
4. **LLM Overlay**: Top 3 For You cards receive GPT-generated personalized insight overlay

**User Segments**: 3 segments (Conservative GCC, Balanced GCC, Aggressive Global) with per-segment scoring weights.

**Interaction Tracking**: `POST /api/discover/interact` (fire-and-forget) tracks impressions, views, clicks, CTA taps, expands, dismisses, feedback, shares. `POST /api/discover/visit` for last-visit timestamp. Dismissed cards filtered from feed.

**Event-Driven Refresh**: Portfolio-mutating endpoints (create goal, create account) trigger immediate per-user feed re-materialization via `triggerEventDrivenRefresh(userId)`.

**Expiry Rules**: Per-card-type TTLs — market_pulse 24h, trend_brief 48h, portfolio_impact 72h, morning_briefing 16h, milestone 3d, event_calendar 14d, ada_view 7d, product_opportunity 30d, explainer/wealth_planning 30d. Runs every 4 hours.

**Pipeline Timers**: Ingest 10min, Cluster+Synth 15min, Materialize 60min, Editorial (Ada View + Event Calendar) 6hr, Morning Briefing + Milestone 6hr, Expiry 4hr.

**Enriched Chat Context**: CTA taps pass `DiscoverCardContext` (card_id, card_type, card_summary, why_seen, entities, evidence_facts, cta_family) to chat. `promptBuilder` incorporates card context into system prompt.

### 4.4 Collective Tab

**Purpose**: Peer benchmarking, community polling, and social investing insights.

**Data Sources**:

| Endpoint | Response Type |
|---|---|
| `GET /api/polls` | `PollQuestion[]` |
| `GET /api/collective/peers` | `PeerComparison[]` |

**Components** (rendered top-to-bottom):

| Section | Component | Behavior |
|---|---|---|
| Weekly Insights | `SummaryCard` | Date header, "6,372 investors like you" subtitle, refresh countdown. |
| Market Analysis | `ContentCard` | Global equity funds trend card with stacked buttons. Opens chat. |
| Peer Comparison | Inline card | Bar chart comparing user allocation vs peer average across 4 asset classes (Equities 55/45, Fixed Income 15/25, Cash 20/15, Alternatives 10/15). Two CTA buttons → chat. |
| Community Poll | Inline card | Regional investment confidence poll with 5 options. Before vote: radio-style options. After vote: percentage bars with user's selection highlighted. Vote triggers `POST /api/polls/:pollId/vote` (optimistic UI + server sync). |

**Special Behaviors**:

- After voting, a `SlideNotification` appears after 1.5s about the house deposit goal being off track.
- "View details" action on the notification navigates to the Wealth tab with auto-scroll to goals.

---

## 5. Chat Experience

### Chat Screen (`ChatScreen.tsx`)

**Entry Points**:

1. Any CTA button on Home, Wealth, Discover, or Collective screens → opens chat with pre-populated message and structured context.
2. BottomBar text input → opens chat with typed message.
3. "Resume" button → reopens existing chat session.
4. Empty state → opens blank chat with welcome message.

**Chat Context** (`ChatContext`):

```typescript
{
  category: string;      // e.g., "PORTFOLIO RISK ALERT", "GOALS"
  categoryType: string;  // e.g., "PORTFOLIO OVERVIEW", "GOAL_ATTENTION"
  title: string;         // Context headline
  sourceScreen?: string; // "home" | "wealth" | "collective" | "discover"
  adaResponse?: string;  // Pre-defined response (bypasses API)
}
```

### AI Response System

**LLM-powered** — uses OpenAI gpt-5-mini via Replit AI Integrations with a full agent architecture.

The chat system follows a production-grade agent pipeline orchestrated by `agentOrchestrator.ts`:

```
User Message → PII Detection → Session Hydration → Intent Classification
    → Policy Evaluation → Model Routing → RAG Context Building
    → Prompt Assembly → Memory Retrieval → LLM Call (with tools)
    → Multi-Turn Tool Execution → Wealth Engine Calculations
    → Guardrails (pre-stream) → Response Building → SSE Streaming
    → Trace Logging → Memory Persistence → Audit Logging
```

**Pipeline Stages**:

1. **PII Detection** (`piiDetector.ts`): Scans user input for sensitive data patterns (email, phone, SSN, credit card, passport, IBAN). Detected PII is flagged in the audit log; messages are still processed but flagged.

2. **Intent Classification** (`intentClassifier.ts`): LLM-first classification with keyword fallback. `classifyIntentAsync()` sends the user message to gpt-5-mini (via ada-fast alias) with a 3-second AbortController timeout. The LLM returns a JSON object with `intent` and `confidence` fields. On timeout, error, or empty response, falls back to keyword-based classification. LLM classifications return 0.95–0.98 confidence; keyword fallback returns 0.4–0.5 confidence.

   | Intent | Triggers (keyword fallback) | Context Fetched |
   |---|---|---|
   | `portfolio` | Portfolio, holdings, allocation, performance | Holdings, allocations, snapshot |
   | `goals` | Goals, savings, retirement, target | Goals, health scores |
   | `market` | Market, bonds, stocks, trends | Holdings, allocations |
   | `scenario` | What if, simulate, model, compare | Holdings, allocations, goals |
   | `execution_request` | Execute, place order, buy for me, sell for me, go ahead, confirm trade | Routed to RM handoff |
   | `general` | Everything else | Basic portfolio summary |

   After classification, `mapOldIntentToNew()` maps legacy intents to `IntentClassification.primary_intent` values (e.g., `goals` → `goal_progress`, `portfolio` → `portfolio_explain`/`portfolio_health`). The `mapIntentForRag()` helper maps `primary_intent` back to legacy `Intent` for RAG context fetching, preventing double-classification.

3. **Policy Engine** (`policyEngine.ts`): Code-driven policy evaluation per tenant configuration. Evaluates the classified intent against tenant rules to produce a `PolicyDecision` containing:
   - `advisory_mode`: Whether Ada operates in `education_only` or `full_advisory` mode
   - `allowed_tools`: Which tools the LLM may invoke for this request
   - `require_human_review`: Whether the response must include an advisor handoff
   - `disclosure_profile`: Which disclosure text to append (education, general, execution)
   - `execution_route`: For execution requests, where to route (rm_handoff, api_webhook, disabled)
   - Feature flags: `allow_simulator`, `allow_widgets`, `allow_fact_extraction`

4. **Model Router** (`modelRouter.ts`): Lane-based multi-model routing with three lanes:
   - **Lane 0 (Deterministic)**: Portfolio lookups, balance checks — handled by the wealth engine without LLM calls
   - **Lane 1 (Fast)**: Simple queries using `ada-fast` (→ gpt-5-mini) with lower token budgets
   - **Lane 2 (Reasoning)**: Complex analysis using `ada-reason` (→ gpt-5-mini) with higher token budgets
   
   Route selection uses a request scorecard (token estimate, tool count, context window, complexity signals). Provider aliases (`ada-fast`, `ada-reason`, `ada-fallback`) map to underlying models. Per-lane token and temperature budgets are configurable. Lane metadata is logged in agent traces. Fallback chain: ada-fast → ada-fallback, ada-reason → ada-fallback.

5. **Capability Registry** (`capabilityRegistry.ts`): Configurable named-config model registry:
   - **Named configurations**: Two named configs (`production`, `rollback`) define the full model stack. `MODEL_CONFIG` env var selects active config (default: `production`). Startup logs effective model map.
   - **5 provider aliases**: `ada-classifier` (classification), `ada-fast` (chat lane 1), `ada-content` (Discover pipeline), `ada-reason` (chat lane 2), `ada-fallback` (Anthropic resilience)
   - **Model capabilities**: Provider aliases → model IDs, capability sets (streaming, tool_calling, json_mode, reasoning), context windows, cost tiers
   - **Lane configurations**: Lane number → label, description, default provider, available tools
   - **Intent→route mappings**: Intent type → default lane, supported lanes, required/optional tools, description
   - **Classifier context**: `getClassifierContext()` generates condensed routing metadata injected into the intent classifier prompt so classification is informed by the routing topology
   - **Fallback chains**: `ada-fast` → `ada-fallback`, `ada-content` → `ada-fallback`, `ada-reason` → `ada-fast` → `ada-fallback`. When OpenAI primary fails all retries, `resilientCompletion()` and `resilientStreamCompletion()` automatically fall back via the chain with format conversion
   - **Token instrumentation**: `agent_traces` records `prompt_tokens`, `completion_tokens`, and `provider_alias` for cost tracking
   - **Fallback persistence**: `provider_fallback_events` table records all provider switches with timing and failure reason

6. **RAG Pipeline** (`ragService.ts`): Builds rich portfolio context from PostgreSQL based on the classified intent. Queries holdings, allocations, goals, accounts, and recent transactions to inject into the LLM system prompt.

7. **Prompt Builder** (`promptBuilder.ts`): Assembles modular system prompts with XML injection defense:
   - System instructions wrapped in `<system_instructions>` / `</system_instructions>` boundary markers
   - User context wrapped in `<user_context>` / `</user_context>` boundary markers
   - Instruction hierarchy note: system instructions take absolute precedence over user messages
   - Persona block (Ada identity, tone, GCC HNW context)
   - Execution boundary block (hard prohibition on trade execution)
   - Advisory mode instructions (education-only vs full advisory)
   - Capability context block (model capabilities, context window, reasoning mode from capability registry)
   - Portfolio context (from RAG pipeline)
   - Memory context (episodic + semantic)
   - Tool definitions and usage guidelines
   - Disclosure requirements per policy

8. **Memory System** (`memoryService.ts`): Three-tier memory architecture:
   - **Working memory**: In-memory conversation turns (per thread, max 20 messages). Provides immediate context.
   - **Episodic memory**: Summarized conversation episodes stored in `episodic_memories` table. Retrieved by relevance to current conversation.
   - **Semantic memory**: Extracted user facts and preferences stored in `semantic_facts` table (e.g., "User plans to retire in 10 years", "User prefers conservative investments"). Persisted via the `extract_user_fact` tool call.

8. **LLM Call** (`aiService.ts`): OpenAI gpt-5-mini with:
   - System prompt containing persona instructions, portfolio context, memories, and available tools.
   - `max_completion_tokens` (not `max_tokens`) for token budget control.
   - Streaming enabled via SSE for progressive text rendering.

9. **Tool Calling**: The LLM can invoke 8 tools during a response, with multi-turn support (up to 3 rounds of tool calls per request):

   | Tool | Category | Purpose | UI Result |
   |---|---|---|---|
   | `get_portfolio_snapshot` | Financial | Retrieve portfolio overview with positions | Data injected into response |
   | `get_holdings_detail` | Financial | Get detailed position-level data | Data injected into response |
   | `get_market_data` | Financial | Fetch market quotes and analysis | Data injected into response |
   | `get_news_summary` | Financial | Retrieve market/company news | Data injected into response |
   | `calculate_wealth_metric` | Financial | Run wealth engine calculations (health, concentration, drift) | Data injected into response |
   | `route_to_advisor` | Financial | Package execution request for RM handoff | Advisor handoff widget |
   | `show_simulator` | UI | Triggers interactive financial simulator | Inline simulator component with sliders |
   | `show_widget` | UI | Embeds a data visualization widget | Inline chart/summary in chat |
   | `extract_user_fact` | Memory | Saves a user preference or fact to semantic memory | Silent persistence (no UI) |

   **Simulator types**: `retirement`, `investment`, `spending`, `tax` — each with domain-specific sliders and calculations rendered by `ScenarioSimulator.tsx`.

   **Widget types**: `allocation_chart`, `holdings_summary`, `goal_progress`, `portfolio_summary`, `advisor_handoff` — rendered by `ChatWidgets.tsx` components.

10. **Wealth Engine** (`wealthEngine.ts`): Deterministic financial calculations that the LLM invokes via the `calculate_wealth_metric` tool:
    - `portfolio_health`: Overall portfolio health score based on diversification, concentration, and drift
    - `concentration_risk`: Per-asset-class and per-position concentration analysis
    - `allocation_drift`: Drift between current and target allocation
    - `rebalance_preview`: Suggested trades to bring portfolio back to target

11. **Guardrails** (`guardrails.ts`): Pre-streaming sanitization applied to every response:
    - Blocked phrase detection (absolute claims, guaranteed returns)
    - Execution-claiming language detection (7 regex patterns) with RM-routing replacements
    - Hard post-check fallback for any surviving execution claims
    - Education-only advisory enforcement
    - Security naming compliance
    - Data freshness warnings
    - Disclosure injection per policy profile

12. **Response Builder** (`responseBuilder.ts`): Constructs structured `AdaAnswer` responses conforming to the Zod-validated schema, including headline, summary, citations, recommendations, actions, and render hints. Maps `AdaAnswer` to SSE stream events.

13. **Streaming** (`POST /api/chat/stream`): Responses stream via Server-Sent Events (SSE) with the following event types (defined in `ChatStreamEvent`):
    - `text` — Incremental text chunks for progressive rendering (`{ type: 'text', content: string }`).
    - `widget` — Embedded data widget (`{ type: 'widget', widget: { type: string } }`).
    - `simulator` — Interactive simulator (`{ type: 'simulator', simulator: { type: string, initialValues?: Record<string, number> } }`).
    - `suggested_questions` — Array of 3 follow-up suggestions (`{ type: 'suggested_questions', suggestedQuestions: string[] }`).
    - `thinking` — Pipeline step for verbose/thinking mode (`{ type: 'thinking', step: string, detail?: string }`). Emitted at 9+ pipeline stages when `verbose: true` in the request body.
    - `done` — Stream complete signal.
    - `error` — Error event if the LLM call fails.
    
    Server-side `setImmediate()` async ticks are inserted at key pipeline boundaries (after early buffer, after routing, before lane dispatch, before data prefetch) to ensure `thinking` events are flushed as separate SSE chunks before content events. The response stream calls `flush()` after each `thinking` event write.

14. **Trace Logging** (`traceLogger.ts`): Persists full agent execution traces to the `agent_traces` and `tool_runs` tables for observability and debugging. Each trace captures: session ID, intent, model used, tool calls with inputs/outputs, latency, token usage, and policy decisions.

15. **Suggested Questions**: The LLM generates 3 contextual follow-up suggestions after each response. These are specific to the conversation context, not generic defaults.

16. **Audit Logging** (`chat_audit_log` table): Every interaction is logged with: user ID, thread ID, classified intent, PII detection result, model used, token count (prompt + completion), and timestamp.

### Execution Guardrails & RM Handoff

Ada operates under a hard execution boundary: it can analyze, recommend, and prepare trade plans, but it **cannot execute trades, place orders, or move funds**. This is enforced at three layers:

1. **System Prompt**: The prompt builder injects an EXECUTION BOUNDARY block instructing the LLM that it cannot execute — only prepare plans for the user's Relationship Manager.
2. **Guardrails**: 7 regex-based patterns detect execution-claiming language (e.g., "I will execute", "order submitted", "trade confirmed") and replace them with RM-routing language. A hard post-check fallback catches any surviving claims.
3. **Orchestrator Fallback**: If the LLM receives an `execution_request` intent but doesn't call the `route_to_advisor` tool, the orchestrator forces the handoff automatically (fail-closed).

The `route_to_advisor` tool packages the user's execution request and routes it based on tenant configuration:
- **rm_handoff** (default): Persists to the `advisor_action_queue` table for the user's assigned RM to review.
- **api_webhook**: POSTs to a configurable webhook URL, with queue fallback if the webhook fails or is unconfigured.
- **disabled**: Rejects execution requests with an explanation.

The frontend `AdvisorHandoffWidget` renders differently for execution handoffs (showing RM name, action context, and queue reference) vs. generic advisory handoffs (showing a simpler recommendation card).

### External Data Providers

Ada integrates with 6 external data source providers via a configurable provider chain pattern. Each data domain supports a `primary → secondary → fallback → mock` chain configured via environment variables:

| Domain | Provider | Data Provided |
|---|---|---|
| Market Data | Finnhub | Real-time quotes, company profiles, earnings calendars, company news |
| Macro/Economic | FRED (Federal Reserve) | GDP, CPI, unemployment, fed funds rate, treasury yields |
| Regulatory | SEC EDGAR | Company submissions, XBRL financial facts, filing search |
| Identity | OpenFIGI | Instrument resolution (ISIN/CUSIP/ticker → FIGI) with DB persistence |
| FX Rates | Frankfurter (ECB) | EUR-based cross rates for major currencies |
| FX Localized | CBUAE | AED-localized FX rates with Frankfurter fallback |

All providers default to mock. Real providers activate only via explicit env var config (`*_PROVIDER_PRIMARY`, `*_PROVIDER_SECONDARY`, `*_PROVIDER_FALLBACK`). Features include:
- In-memory cache with per-data-type TTLs
- Rate limiting (per-second for SEC EDGAR, per-minute for others)
- Sliding-window health tracking (5-min window, min 5 attempts, 50% failure threshold)
- Cache hit/miss metrics in every `ToolResult`

#### Provider Phase Strategy

| Phase | Scope | Providers Activated | Tool Mappings |
|---|---|---|---|
| Phase 1 (Demo) | Mock-only, seeded data | All providers default to mock | `get_market_data` → mock quotes, `get_macro_data` → mock indicators, `lookup_instrument` → mock FIGI |
| Phase 2 (Pilot) | Live market data, mock others | Finnhub (market primary), Frankfurter (FX primary), CBUAE (FX secondary) | `get_market_data` → Finnhub live, `get_fx_rate` → Frankfurter → CBUAE failover, others remain mock |
| Phase 3 (Production) | Full live stack | All 6 providers with full failover chains | All tools map to live providers with automatic failover. FRED for macro, SEC EDGAR for filings, OpenFIGI for instrument resolution |

Phase recommendations:
- **Phase 1**: Current state. All providers return mock data. Suitable for demos and development.
- **Phase 2**: Activate Finnhub (free tier: 60 calls/min) and Frankfurter (no key required) for real-time market data and FX. Add `MARKET_PROVIDER_PRIMARY=finnhub` and `FX_PROVIDER_PRIMARY=frankfurter` env vars.
- **Phase 3**: Add API keys for FRED, SEC EDGAR, OpenFIGI, CBUAE. Enable full failover chains. Requires rate limit tuning per provider SLA.

### Multi-Tenant Configuration

Ada supports multi-tenant configuration via the `tenants` and `tenant_configs` tables. Each tenant can customize:
- **Advisory mode**: Education-only vs. full advisory
- **Allowed tools**: Which tools the LLM can invoke
- **Disclosure requirements**: Which disclaimers to append
- **Execution routing**: How trade requests are handled (rm_handoff, api_webhook, disabled)
- **Feature flags**: Simulator, widget, and fact extraction toggles
- **Locale and currency**: Regional settings

One tenant is seeded: `bank_demo_uae` (UAE-based demo bank with moderate advisory mode).

### Chat UI Elements

| Element | Description |
|---|---|
| Chat Header | Back button, "Ada" title |
| Date Pill | "Today" indicator |
| Capability Statement | "I can analyze your portfolio, model risk scenarios..." |
| User Messages | Right-aligned, dark background |
| Assistant Messages | Left-aligned, white background, with SSE streaming text + typing cursor |
| Embedded Widgets | Inline allocation charts, holdings summaries, goal progress, portfolio summaries |
| Scenario Simulators | Interactive sliders for retirement/investment/spending/tax modeling |
| Context Prefix | First user message shows context title above the message text |
| Typing Indicator | Three bouncing dots (shown while awaiting first stream chunk) |
| Suggested Questions | Horizontally scrollable pills below chat area (LLM-generated) |
| Think Toggle | Header toggle to enable/disable verbose thinking mode. Persists to localStorage. Gated by tenant-level `verbose_mode` feature flag. |
| LiveThinkingBar | Fixed bar below chat header during streaming (when verbose mode is on). Shows progressive step reveal with 120ms stagger animation, amber pulsing dot, and step counter (e.g., "Step 3 of 5"). Renders only when `verbose && isTyping && thinkingSteps.length > 0`. Disappears when streaming completes. |
| ThinkingPanel (Summary) | Collapsible panel above assistant message after streaming completes. Shows all pipeline steps as a post-hoc summary. Renders only when `verbose && !isTyping && thinkingSteps.length > 0` on the last assistant message. |
| BottomBar | Text input + chat history icon |

### Chat History (`ChatHistoryScreen.tsx`)

- Lists threads from `GET /api/chat/threads` (database-backed).
- Each thread shows title, preview text, and relative timestamp.
- Three seeded threads for Aisha covering portfolio rebalancing, concentration risk, and hedging.

### PII Handling

PII detection runs on every user message before the LLM call. Detected PII types are logged in `chat_audit_log.pii_detected`. The raw user message (including any PII) is currently persisted to `chat_messages` for thread history. The sanitized version is sent to the LLM. Future consideration: store sanitized messages in `chat_messages` or add a retention/purge policy.

### Legacy Chat Infrastructure

The original deterministic keyword-matching system (`chatRepository.ts` and `src/data/chat.ts`) is retained as fallback reference data but is **not used at runtime**. All chat responses are now generated by the LLM pipeline. The `POST /api/chat/message` endpoint (synchronous) still exists for non-streaming clients but routes through the same LLM pipeline.

---

## 6. Design System

### 6.1 Brand Colors

| Token | Hex | Usage |
|---|---|---|
| Dark Red | `#441316` | Primary buttons, dark accents, poll bars |
| Medium Red | `#992929` | Category labels, sparkline color, active nav |
| Cream Background | `#efede6` | Page backgrounds |
| Header Background | `#f7f6f2` | Top bar, header, navigation strip |
| Green Badge | `#c6ff6a` | Positive change badges |
| Green Text | `#03561a` | Positive change text |
| Text Primary | `#555555` | Body text, headings |
| Text Muted | `rgba(85,85,85,0.8)` | Secondary labels |
| Border | `#d8d8d8` | Outlined buttons |
| White | `#ffffff` | Card backgrounds |
| Goal Pink | `#a87174` | Goal cards, allocation segments |
| Goal Dark | `#6d3f42` | Secondary goal color |
| Goal Deep | `#8b5a5d` | Tertiary allocation |

### 6.2 Typography

| Font Family | Weights Used | Usage | Source |
|---|---|---|---|
| **RL Limo** | Regular | "Ada" logo text, section labels (e.g., "TODAY'S SUMMARY", "INVESTORS LIKE YOU") | TypeKit (`use.typekit.net/yua2ikn.css`) |
| **Crimson Pro** | ExtraLight (200), Light (300), Regular (400), SemiBold (600) | Headlines, large portfolio values, card titles | Google Fonts |
| **DM Sans** | Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700) | Body text, labels, buttons, category tags, UI elements | Google Fonts |

Fonts are loaded via `<link>` tags in `index.html`. Font references use Tailwind arbitrary value syntax with standard font names: `font-['Crimson_Pro',sans-serif]` and `font-['DM_Sans',sans-serif]`, with weights specified via separate Tailwind utilities (e.g., `font-semibold`, `font-light`). RL Limo uses `font-['rl-limo',sans-serif]` (TypeKit naming convention).

### 6.3 Spacing & Layout

| Pattern | Value |
|---|---|
| Card border radius | `30px` |
| Card gap | `5px` |
| Card padding | `16px–24px` |
| Content side padding | `6px` |
| Button border radius | `50px` |
| Bottom padding (scroll area) | `107px` (to clear BottomBar) |
| Top offset (content) | `128px` (to clear header + nav) |
| Max app width | `430px` (mobile frame) |
| Chart border radius | `8px` |

### 6.4 Component Library (`src/components/ada/`)

**Layout Components**:

| Component | Purpose |
|---|---|
| `Header` | App logo, persona switcher, notification bell, close button |
| `Navigation` | 4-tab bar with active state indicator |
| `BottomBar` | Chat input field, history icon, resume button |
| `ChatHeader` | Back button + "Ada" title for chat screen |
| `AdaLogo` | Brand logo mark |

**UI Components**:

| Component | Purpose |
|---|---|
| `Button` | Multi-variant button (ai-chat variant for chat CTAs) |
| `Tag` | Filter toggle pills (Discover tab) |
| `SearchInput` | Text input component |
| `Modal` | Overlay dialog |
| `PollOption` | Radio-style poll option with result bar |
| `SourcesBadge` | "68 sources" badge on content cards |
| `AtomIcon` | Animated atom icon for empty chat state |
| `SparkIcon` | Sparkle icon for AI-related CTAs |

**Card Components**:

| Component | Purpose |
|---|---|
| `ContentCard` | Primary content card with category, title, description, CTAs, optional image, expandable detail sections |
| `SummaryCard` | Date/summary header card |
| `InsightCard` | Expandable insight with icon + CTA |
| `TrendCard` | Market trend card |
| `OnboardingCard` | Onboarding flow card |

**Chat Components**:

| Component | Purpose |
|---|---|
| `ChatMessage` | User/assistant message bubble with context prefix |
| `SuggestedQuestion` | Tappable pill for suggested follow-up |
| `ChatThread` | Thread list item in chat history |

**Notification Components**:

| Component | Purpose |
|---|---|
| `NotificationItem` | Notification row with type icon, unread indicator |
| `SlideNotification` | Toast-style slide-in notification with action button |

**Chart Components**:

| Component | Purpose |
|---|---|
| `Sparkline` | SVG sparkline chart |
| `SimpleSparkline` | Simplified sparkline with gradient fill |
| `LineChart` | Full line chart for performance data |
| `WealthPerformanceChart` | Time-frame toggled performance chart |
| `DonutChart` | Asset allocation donut chart |
| `ProgressRing` | Circular progress indicator |

**Wealth Components**:

| Component | Purpose |
|---|---|
| `WealthSnapshot` | Main wealth overview with chart + insights |
| `WealthOverviewCard` | Portfolio value display |
| `CompactAssetAllocation` | Donut chart + allocation breakdown |
| `PortfolioHealthSummary` | Diversification score + suggestions |
| `CompactHoldings` | Holdings list |
| `CompactGoals` | Expandable goals section |
| `CompactConnectedAccounts` | Linked accounts list + add button |
| `CollapsibleAdvisor` | Expandable advisor card |
| `AddAccountModal` | Account linking flow |
| `GoalCard` | Individual goal with progress |
| `HoldingRow` | Single holding row |
| `ConnectedAccountRow` | Single account row |
| `InsightRow` | Expandable insight within WealthSnapshot |
| `PerformanceChartCard` | Standalone chart card |
| `AssetAllocationCard` | Standalone allocation card |
| `PortfolioHealthCard` | Standalone health card |
| `AdvisorCard` | Non-collapsible advisor card |

---

## 7. API Contracts

### Base URL

Development: `http://localhost:5000/api/` (Vite proxies to Express on port 3001)

### Endpoints

| Method | Path | Request Body | Response Type | Description |
|---|---|---|---|---|
| GET | `/api/health` | — | `{ status: 'ok', timestamp: string }` | Health check |
| GET | `/api/me` | — | `User` (with `riskProfile`) | Current user profile |
| GET | `/api/home/summary` | — | `HomeSummaryResponse` | Home screen aggregate data |
| GET | `/api/morning-sentinel` | `?refresh=true` | `MorningSentinelResponse` | AI-generated daily briefing (cached, ?refresh=true to force) |
| GET | `/api/morning-sentinel/stream` | — | SSE stream | Streaming briefing generation (metrics → text → complete events) |
| GET | `/api/wealth/overview` | — | `WealthOverviewResponse` | Portfolio value + performance history |
| GET | `/api/wealth/allocation` | — | `AssetAllocation[]` | Computed allocation breakdown |
| GET | `/api/wealth/holdings` | — | `HoldingResponse[]` | Top 5 holdings by value |
| GET | `/api/wealth/goals` | — | `GoalResponse[]` | Financial goals with health status |
| GET | `/api/wealth/goals/health-score` | — | `GoalHealthScoreResponse` | Computed goal health score (0–100) |
| GET | `/api/wealth/goals/life-gaps` | — | `LifeGapPrompt[]` | AI-generated missing goal prompts |
| POST | `/api/wealth/goals/life-gaps/dismiss` | `{ promptKey: string }` | `{ success: boolean }` | Dismiss a life gap prompt |
| POST | `/api/wealth/goals/life-event` | `{ eventType: LifeEventType }` | `LifeEventSuggestion[]` | AI goal suggestions for a life event |
| GET | `/api/wealth/accounts` | — | `AccountResponse[]` | Connected bank/brokerage accounts |
| POST | `/api/wealth/accounts` | `AddAccountRequest` | `AccountResponse` | Add a new connected account |
| GET | `/api/notifications` | — | `AlertResponse[]` | User alerts and notifications |
| GET | `/api/content` | `?category=X` | `ContentItem[]` | All or filtered content items |
| GET | `/api/content/discover` | `?tab=forYou\|whatsHappening` | `DiscoverContentItem[]` | Discover tab content |
| GET | `/api/chat/threads` | — | `ChatThreadResponse[]` | Chat history threads |
| GET | `/api/chat/:threadId/messages` | — | `ChatMessage[]` | Messages in a thread |
| POST | `/api/chat/message` | `ChatMessageRequest` | `ChatMessageResponse` | Send message, get synchronous AI response |
| POST | `/api/chat/stream` | `ChatMessageRequest` | SSE stream | **Primary**: Streaming AI chat with tool-calling |
| POST | `/api/chat/:threadId/messages` | `ChatMessageRequest` | `ChatMessageResponse` | Send message to specific thread (persisted) |
| GET | `/api/collective/peers` | — | `PeerComparison[]` | Peer allocation comparison |
| GET | `/api/polls` | — | `PollQuestion[]` | Active polls with options + vote counts |
| POST | `/api/polls/:pollId/vote` | `PollVoteRequest` | `PollVoteResponse` | Vote on a poll option |

### Key Request/Response Types

```typescript
interface ChatMessageRequest {
  message: string;
  threadId?: string;
  context?: {
    category: string;
    categoryType: string;
    title: string;
    sourceScreen?: string;
  };
}

interface ChatMessageResponse {
  threadId: string;
  message: ChatMessage;
  suggestedQuestions: string[];
}

interface PollVoteRequest {
  optionId: string;
}

interface PollVoteResponse {
  success: boolean;
  poll: PollQuestion;
}
```

### Legacy/Alias Endpoints

The following endpoints duplicate wealth endpoints at shorter paths:

- `GET /api/portfolio` → same as `/api/wealth/overview`
- `GET /api/holdings` → same as `/api/wealth/holdings`
- `GET /api/allocations` → same as `/api/wealth/allocation`
- `GET /api/goals` → same as `/api/wealth/goals`
- `GET /api/accounts` → same as `/api/wealth/accounts`

---

## 8. Data Model

### Database: PostgreSQL (33 tables)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   users      │────>│ risk_profiles │     │   advisors    │
│              │     └──────────────┘     └──────────────┘
│              │
│              │──┬──>┌──────────────┐     ┌──────────────┐
│              │  │   │   accounts    │────>│  positions    │
│              │  │   └──────────────┘     └──────────────┘
│              │  │                              │
│              │  │                              v
│              │  │   ┌──────────────┐     ┌──────────────┐
│              │  ├──>│ portfolio_   │     │ transactions  │
│              │  │   │  snapshots   │     └──────────────┘
│              │  │   └──────────────┘
│              │  │
│              │  ├──>┌──────────────┐
│              │  │   │    goals      │
│              │  │   └──────────────┘
│              │  │
│              │  ├──>┌──────────────┐
│              │  │   │    alerts     │
│              │  │   └──────────────┘
│              │  │
│              │  ├──>┌──────────────┐     ┌──────────────┐
│              │  │   │ chat_threads  │────>│ chat_messages │
│              │  │   └──────────────┘     └──────────────┘
│              │  │
│              │  ├──>┌──────────────────┐
│              │  │   │ action_contexts   │
│              │  │   └──────────────────┘
│              │  │
│              │  ├──>┌─────────────────────┐
│              │  │   │ performance_history  │
│              │  │   └─────────────────────┘
│              │  │
│              │  └──>┌──────────────┐
│              │      │  poll_votes   │
└──────────────┘      └──────────────┘
                            │
       ┌────────────────────┤
       v                    v
┌──────────────┐     ┌──────────────┐
│poll_questions │────>│ poll_options  │
└──────────────┘     └──────────────┘

AI Memory, Audit & Life Planning tables (linked to users):
┌─────────────────────┐     ┌──────────────┐     ┌──────────────┐
│ episodic_memories    │     │semantic_facts │     │chat_audit_log │
└─────────────────────┘     └──────────────┘     └──────────────┘
┌───────────────────────────┐
│ dismissed_life_gap_prompts │
└───────────────────────────┘

Agent Architecture tables:
┌──────────────┐     ┌──────────────┐
│   tenants     │────>│tenant_configs │
└──────────────┘     └──────────────┘
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ instruments   │     │market_quotes  │     │  news_items   │
└──────────────┘     └──────────────┘     └──────────────┘
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐
│  tool_runs    │     │ agent_traces  │     │policy_decisions    │
└──────────────┘     └──────────────┘     └───────────────────┘
┌───────────────────────┐     ┌────────────────────────┐
│conversation_summaries  │     │ advisor_action_queue    │
└───────────────────────┘     └────────────────────────┘

Standalone tables:
┌──────────────┐     ┌──────────────┐
│content_items  │     │peer_segments  │
└──────────────┘     └──────────────┘
┌──────────────┐
│price_history  │
└──────────────┘
```

### Table Summary

| Table | PK | Key Columns | Notes |
|---|---|---|---|
| `users` | `id` (TEXT) | first_name, last_name, email, advisor_id | 4 demo personas |
| `risk_profiles` | `id` (SERIAL) | user_id (UNIQUE FK), level, score, last_assessed | Conservative/moderate/aggressive |
| `advisors` | `id` (TEXT) | name, title, availability, email, phone | 1 advisor seeded |
| `accounts` | `id` (TEXT) | user_id (FK), institution_name, account_type, balance, status | brokerage/savings/checking/retirement |
| `positions` | `id` (TEXT) | account_id (FK), symbol, name, quantity, current_price, cost_basis, asset_class | 7 positions for Aisha |
| `portfolio_snapshots` | `id` (TEXT) | user_id (FK), total_value, daily_change_amount/percent | Latest snapshot used for overview |
| `goals` | `id` (TEXT) | user_id (FK), title, target/current_amount, health_status, ai_insight | on-track/needs-attention/at-risk |
| `alerts` | `id` (TEXT) | user_id (FK), type, title, message, unread, category | 7 alerts for Aisha |
| `content_items` | `id` (TEXT) | category, category_type, title, description, target_screen | Home cards + discover content |
| `peer_segments` | `id` (SERIAL) | asset_class, user_percent, peer_percent, color | 4 asset class comparisons |
| `chat_threads` | `id` (TEXT) | user_id (FK), title, preview, created_at, updated_at | 3 seeded threads |
| `chat_messages` | `id` (TEXT) | thread_id (FK), sender, message | 8 seeded messages |
| `action_contexts` | `id` (TEXT) | user_id (FK), category, category_type, title, source_screen | Tracks CTA → chat context |
| `performance_history` | `id` (SERIAL) | user_id (FK), value, recorded_date (UNIQUE pair) | 366 daily data points via generate_series |
| `poll_questions` | `id` (TEXT) | question | 1 seeded poll |
| `poll_options` | `id` (TEXT) | poll_id (FK), label, vote_count | 5 options per poll |
| `poll_votes` | `id` (TEXT) | poll_id + user_id (UNIQUE), option_id | Ensures one vote per user per poll |
| `transactions` | `id` (TEXT) | account_id (FK), type, symbol, quantity, price, amount | buy/sell/dividend/deposit/withdrawal |
| `price_history` | `id` (SERIAL) | symbol, price, recorded_at | Historical price data |
| `episodic_memories` | `id` (TEXT) | user_id (FK), thread_id (FK), summary, topics (TEXT[]), created_at | Summarized conversation episodes for long-term AI context |
| `semantic_facts` | `id` (TEXT) | user_id (FK), fact, category, source_thread_id (FK), created_at | Extracted user preferences/facts for AI personalization |
| `chat_audit_log` | `id` (SERIAL) | user_id (FK), thread_id, action, intent, pii_detected, input_preview, model, tokens_used, created_at | AI interaction audit trail |
| `dismissed_life_gap_prompts` | `id` (SERIAL) | user_id (FK), prompt_key (UNIQUE pair), dismissed_at | Tracks dismissed life-gap prompts per user |
| `tenants` | `id` (TEXT) | name, display_name, region, locale, base_currency, is_active | Multi-tenant support; 1 seeded (bank_demo_uae) |
| `tenant_configs` | `id` (SERIAL) | tenant_id (FK), advisory_mode, requires_advisor_handoff, allowed_tools, disclosure_profile, execution_routing_mode, execution_webhook_url, can_prepare_trade_plans | Tenant-level policy configuration |
| `instruments` | `id` (SERIAL) | symbol, name, asset_class, exchange, isin, figi, sedol | Instrument master data; 8 seeded |
| `market_quotes` | `id` (SERIAL) | symbol, price, change_pct, volume, source, fetched_at | Market data cache from providers |
| `news_items` | `id` (SERIAL) | headline, summary, source, url, symbols, published_at | News cache from providers |
| `tool_runs` | `id` (TEXT) | trace_id, tool_name, input, output, status, started_at, ended_at, latency_ms | Individual tool execution records for tracing |
| `agent_traces` | `id` (TEXT) | session_id, user_id, thread_id, intent, model, total_latency_ms, tool_count, token_usage, created_at | Full agent execution traces |
| `policy_decisions` | `id` (TEXT) | trace_id, tenant_id, intent, advisory_mode, allowed_tools, require_human_review, disclosure_profile, execution_route | Policy decisions for each request |
| `conversation_summaries` | `id` (TEXT) | thread_id, user_id, summary, turn_count, created_at | Compressed conversation summaries |
| `advisor_action_queue` | `id` (SERIAL) | user_id, advisor_id, action_type, action_payload, status, created_at | Pending execution requests for RM review |

### Table Name Mapping (Spec vs Actual)

| Spec Name | Actual Table | Notes |
|---|---|---|
| portfolios | `portfolio_snapshots` | Stores snapshot values |
| holdings | `positions` | With computed value/change |
| connected_accounts | `accounts` | Same structure |
| notifications | `alerts` | Category-based filtering |
| asset_allocations | (computed) | Derived from positions + accounts |

---

## 9. Architecture & Patterns

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript, Vite 6, Tailwind CSS v4, TanStack Query v5 |
| Backend | Express + TypeScript (via `tsx`), port 3001 |
| Database | PostgreSQL (Replit-managed), 33 tables |
| AI | OpenAI GPT-4.1 family (Replit AI Integrations), 5 provider aliases, named configs, streaming SSE |
| Animations | Framer Motion v11 (`motion/react`), AnimatePresence transitions |
| Fonts | Crimson Pro, DM Sans (Google Fonts) |
| Icons | Lucide React |
| Type Checking | TypeScript 5.8 (`tsc --noEmit`), registered as CI validation |
| Linting | ESLint 9 (flat config) + Prettier |
| Dev Proxy | Vite on port 5000 → `/api` proxy to port 3001 |

### Backend Architecture

```
Request → Express Router → asyncHandler → Service → Repository → PostgreSQL
                                   │
                                   ├── Agent Pipeline (chat):
                                   │   PII Detection → Session Hydration → Intent Classification
                                   │   → Policy Evaluation → Model Routing → RAG → Prompt Assembly
                                   │   → Memory → LLM → Multi-Turn Tools → Wealth Engine
                                   │   → Guardrails → Response Building → SSE Streaming
                                   │   → Trace Logging → Memory Persistence → Audit Logging
                                   │
                                   ├── External Providers:
                                   │   Finnhub, FRED, SEC EDGAR, OpenFIGI, Frankfurter, CBUAE
                                   │   (primary → secondary → fallback → mock chain)
                                   │
                                   └── AI Pipeline (sentinel):
                                       Portfolio Analysis → Anomaly Detection → LLM → SSE Streaming
```

- **Repository pattern**: `server/repositories/` — data access layer with direct SQL queries via `pg` pool. 6 repositories: user, portfolio, content, chat, poll, agent.
- **Service layer**: `server/services/` — 17 services covering business logic, agent orchestration, and AI pipelines.
- **Agent services**: `agentOrchestrator.ts` (core pipeline), `policyEngine.ts` (tenant policies), `modelRouter.ts` (model selection), `promptBuilder.ts` (prompt assembly), `responseBuilder.ts` (structured responses), `traceLogger.ts` (observability), `guardrails.ts` (post-response sanitization), `wealthEngine.ts` (deterministic calculations), `financialTools.ts` (tool definitions + dispatch), `rmHandoffService.ts` (execution routing).
- **AI services**: `aiService.ts` (OpenAI client), `chatService.ts` (legacy orchestration), `intentClassifier.ts`, `ragService.ts`, `memoryService.ts`, `piiDetector.ts`, `goalService.ts`, `morningSentinelService.ts`.
- **Provider layer**: `server/providers/` — 6 external data providers with registry, caching, rate limiting, and health tracking.
- **Shared schemas**: `shared/schemas/agent.ts` — Zod schemas for `AdaAnswer`, `ToolResult`, `PolicyDecision`, `IntentClassification`, and related types.
- **asyncHandler**: Wraps async route handlers to catch errors and pass to Express error handler.
- **Global error handler**: Catches unhandled errors, logs the actual message server-side, and returns a generic `500 { error: 'Internal server error' }` response.
- **SSE streaming**: Two SSE endpoints — `POST /api/chat/stream` (chat) and `GET /api/morning-sentinel/stream` (briefing).

### Frontend Architecture

```
main.tsx (QueryClient + prefetch)
  └── App.tsx (state management + AnimatePresence)
        ├── Screen Components (HomeScreen, WealthScreen, etc.)
        │     ├── ada/ Design System Components
        │     └── TanStack Query hooks for data fetching
        ├── Chat (SSE streaming + tool-call rendering)
        └── Type Definitions (src/types/index.ts, shared/types.ts)
```

- **TanStack Query**: All data fetching via React Query hooks (`useHomeSummary`, `useWealthOverview`, `useMorningSentinel`, `useGoals`, etc.) with proper caching, stale times, and prefetching.
- **SSE streaming**: Chat responses and Morning Sentinel briefings stream progressively via EventSource/fetch with ReadableStream.
- **Shared types** (`shared/types.ts`): Backend/frontend API contract types.
- **Frontend types** (`src/types/index.ts`): Frontend-specific types including view/tab types, chat context, screen props.
- **Animations**: Tab switches use horizontal slide transitions, overlays use slide-up, and the client environment uses fade — all via Framer Motion's AnimatePresence with `mode="wait"`.
- **Fallback data** (`src/data/`): Client-side data modules (mostly superseded by API but retained as reference).

### Key Architectural Decisions

1. **"Lounge" renamed to "Collective"** throughout the entire codebase.
2. **Asset allocation is computed** from positions + account balances, not stored directly.
3. **Chat uses LLM (gpt-5-mini)** with full RAG pipeline, intent routing, three-tier memory, tool-calling, and SSE streaming.
4. **Morning Sentinel uses LLM** with portfolio anomaly detection, prefetch-on-init, and SSE streaming fallback.
5. **Default user is hardcoded** to `user-aisha` in `api.ts`.
6. **Poll voting uses database transactions** for atomicity (increment vote_count + insert vote record).
7. **Performance history** seeded with 366 daily data points using PostgreSQL `generate_series`.
8. **ESLint ignores `src/imports/`** (Figma-generated code retained for the client environment splash).
9. **TypeScript validation** (`npm run typecheck`) registered as CI validation command; `tsc --noEmit` passes cleanly.
10. **No React Router** — navigation is useState-based with `navigateTo()` helper wrapping `startTransition`.

---

## 10. Non-Functional Requirements

### Performance

- Loading skeletons on all data-fetching screens (Home, Wealth, Discover, Collective).
- Parallel API calls on Wealth screen (5 simultaneous requests).
- Optimistic UI on poll voting (update local state before server response).
- Scroll-to-goal uses `requestAnimationFrame` for smooth animation.
- **Morning Sentinel prefetch**: Briefing generation starts on app init in `main.tsx` (before user navigates to Home), cached for 4 hours.
- **SSE streaming fallback**: If prefetch hasn't completed, the `useMorningSentinel` hook automatically starts an SSE stream after 500ms, showing progressive text rendering.
- **Server-side deduplication**: `inFlightRequests` Map in `morningSentinelService.ts` prevents duplicate OpenAI calls when both prefetch and stream fire simultaneously.
- **TanStack Query caching**: All API responses cached with appropriate `staleTime` and `gcTime` values to minimize refetching.

### Mobile-First

- Max width: 430px with centered layout.
- Touch-optimized: 44px minimum button height.
- Scrollable content areas with proper bottom padding for BottomBar clearance.
- Horizontally scrollable suggested questions in chat.

### Accessibility

- Semantic HTML elements (buttons, inputs).
- `aria-hidden` on decorative borders.
- Color contrast: dark text (#555555) on cream (#efede6) backgrounds.
- Status indicators use color + text (not color alone).

### Error Handling

- API errors show user-friendly messages ("Unable to load data").
- Chat API failures return graceful fallback ("I'm having trouble connecting right now").
- `asyncHandler` wrapper prevents unhandled promise rejections.
- Global Express error handler returns structured error responses.

### Database

- All schema uses `IF NOT EXISTS` for idempotent creation.
- All seed data uses `ON CONFLICT DO NOTHING` for idempotent seeding.
- Foreign key constraints on all relational columns.
- CHECK constraints on enum-like columns (risk level, account type, transaction type, etc.).
- `DATABASE_URL` environment variable required (auto-provisioned by Replit).

---

## 11. Implementation Status

### Feature Matrix

| Feature | Status | Notes |
|---|---|---|
| **Home Tab** | Built | API-backed, content cards from DB, sparkline chart |
| **Morning Sentinel** | Built | AI-generated daily briefing with prefetch + SSE streaming fallback, server-side dedup |
| **Wealth Tab** | Built | 5 parallel API calls, all sections functional |
| **Goals & Life Planning** | Built | Goal health scores, AI life-gap analysis, life-event goal suggestions |
| **Discover Content Pipeline** | Built | 3-phase automated pipeline: Ingest (Finnhub 10min) → Enrich (12-category taxonomy) → Cluster (Jaccard similarity) → Synthesize (LLM) → Materialize (per-user scored feeds). 10 card types. Pipeline health endpoint. |
| **Discover Personalization** | Built | Per-user weighted scoring (7 factors), 3 user segments, LLM personalized overlays for top 3 cards, CTA template personalization, engagement re-ranking with collaborative filtering, pre-computed `user_discover_feed` cache. |
| **Discover Interactions** | Built | Fire-and-forget interaction tracking (impressions, views, clicks, dismisses, feedback). Card dismiss + feedback UI with 4 preset reasons. "NEW" badge for unseen cards. Last-visit tracking. |
| **Morning Briefing** | Built | Daily LLM-synthesized brief from overnight cards + Morning Sentinel portfolio data. Pinned at #1 in For You. 16-hour expiry. Auto-deactivates previous briefings. |
| **Milestone Cards** | Built | Detects portfolio value thresholds ($25K–$1M), daily performance >2%, goal completions. User-scoped card IDs prevent cross-user exposure. |
| **Event-Driven Refresh** | Built | Portfolio-mutating endpoints trigger immediate per-user feed re-materialization. |
| **Discover Tab** | Built | AI-curated feed with "For You" (personalized) and "What's New" (chronological) tabs, 11 card types, enriched chat context handoff |
| **Collective Tab** | Built | Polls (vote + results), peer comparison chart, API-backed |
| **AI Chat (LLM)** | Built | GPT-5-mini with intent routing, RAG, 3-tier memory, tool-calling, SSE streaming |
| **Chat Widgets** | Built | Inline allocation charts, holdings summaries, goal progress, portfolio summaries via tool-calling |
| **Scenario Simulators** | Built | Retirement, investment, spending, tax simulators triggered by LLM `show_simulator` tool call |
| **Chat History** | Built | DB-backed thread list, thread detail messages |
| **PII Detection** | Built | Email, phone, SSN, credit card, passport, IBAN detection with audit logging |
| **Chat Memory** | Built | Working (in-memory), episodic (DB), semantic facts (DB) — three-tier architecture |
| **Notifications** | Built | DB-backed alerts, category filtering, unread indicators |
| **Login Page** | Built | Ada-branded sign-in page with email/password form and dev quick-access persona picker. Replaced original ClientEnvironment splash. |
| **Agent Architecture** | Built | Full agent orchestrator with policy engine, model router, prompt builder, response builder, trace logger, guardrails, wealth engine, financial tools |
| **External Data Providers** | Built | 6 providers (Finnhub, FRED, SEC EDGAR, OpenFIGI, Frankfurter, CBUAE) with primary/secondary/fallback/mock chain, caching, rate limiting, health tracking |
| **Multi-Tenant Config** | Built | Tenant-level policy, advisory mode, allowed tools, disclosure profile, execution routing |
| **Execution Guardrails** | Built | 3-layer enforcement (system prompt, guardrail regex, orchestrator fallback). Ada never claims execution capability |
| **RM Handoff** | Built | Execution requests routed to advisor via advisor_action_queue (rm_handoff), webhook (api_webhook), or rejected (disabled) |
| **Wealth Engine** | Built | Deterministic calculations for portfolio health, concentration risk, allocation drift, rebalance preview |
| **Structured Responses** | Built | Zod-validated AdaAnswer schema with headline, summary, citations, recommendations, actions, render hints |
| **Agent Tracing** | Built | Full trace logging to agent_traces + tool_runs tables for observability |
| **PostgreSQL Database** | Built | 44 tables, 3 personas, full seed data |
| **REST API** | Built | 39 endpoints, asyncHandler, global error handler, 2 SSE streams |
| **Loading Skeletons** | Built | All data-fetching screens |
| **Error States** | Built | All data-fetching screens |
| **Animations** | Built | Tab transitions (horizontal slide), overlay transitions (slide-up), animated tab indicator |
| **Slide Notifications** | Built | Goal alerts on Wealth + Collective |
| **Add Account Modal** | Built | Persists to DB via POST /api/wealth/accounts |
| **Auto-scroll to Goal** | Built | Cross-tab navigation from Collective |
| **Performance Chart** | Built | 5 time-frame toggles, DB-backed (366 days) |
| **Poll Voting** | Built | Optimistic UI, server-persisted, atomic transactions |
| **Pull-to-Refresh** | Built | Home, Wealth, Discover, Collective screens |
| **TypeScript Validation** | Built | `tsc --noEmit` passes cleanly, registered as CI validation |
| **User Switching** | Built | PersonaPicker bottom sheet, X-User-ID header, per-user query isolation, localStorage persistence |
| **Multi-Model Routing** | Built | Lane-based control plane (Lane 0 deterministic, Lane 1 fast, Lane 2 reasoning) with request scorecards and provider aliases |
| **LLM Intent Classification** | Built | LLM-first `classifyIntentAsync()` with 3s timeout and keyword fallback. `mapIntentForRag()` prevents double-classification. Lane 2 → Lane 1 fallback on streaming timeout. |
| **Capability Registry** | Built | Configurable named-config model registry (`capabilityRegistry.ts`). 5 provider aliases (ada-classifier, ada-fast, ada-content, ada-reason, ada-fallback). `MODEL_CONFIG` env var selects production/rollback config. Token instrumentation (prompt_tokens, completion_tokens, provider_alias in agent_traces). Fallback event persistence (provider_fallback_events table). |
| **Anthropic Fallback** | Built | Automatic fallback to Claude (claude-sonnet-4-6) when OpenAI primary fails. Resilient completion helpers with timeout+retry+fallback for all LLM call sites. |
| **XML Prompt Injection Defense** | Built | System prompt wrapped in XML boundary markers (`<system_instructions>`, `<user_context>`). Instruction hierarchy prevents user override of system instructions. |
| **Verbose/Thinking Mode** | Built | Live `LiveThinkingBar` during streaming with progressive step reveal (120ms stagger). Post-stream `ThinkingPanel` summary (collapsible). "Think" toggle in chat header with localStorage persistence. Tenant-level `verbose_mode` feature flag. Server-side `setImmediate()` ticks + `flush()` for reliable thinking event delivery. |
| **Full Persona Data Parity** | Built | 3 personas with positions, 365-day performance history, goals, alerts, chat threads; server-side computed wealth insights. Cost basis values match weighted transaction averages. Performance history uses bounded normalized formula. |
| **ErrorBoundary** | Built | React class component error boundary wrapping WealthScreen and DiscoverScreen. Catches rendering crashes and displays user-friendly error message with retry button. |
| **Context-Aware Follow-Ups** | Built | Intent classifier receives last 4 conversation turns from working memory. LLM prompt includes follow-up resolution rules. `isLikelyContinuation()` heuristic detects continuation phrases. Post-classification override when LLM returns "general" for a likely continuation. |
| **Authentication** | Not built | No auth layer |
| **Real Account Linking** | Not built | Mock flow only |
| **Push Notifications** | Not built | — |
| **Advisor Scheduling** | Not built | CTA is placeholder |
| **Document Viewer** | Not built | Notification links to documents not functional |
| **Transaction History** | Not built | Table exists, no UI |
| **Price History Charts** | Not built | Table exists, no UI |
| **Multi-language Support** | Not built | English only |
| **Dark Mode** | Not built | — |

---

## 12. Change Log

| Date | Task | Changes |
|---|---|---|
| 2026-03-17 | T001: Codebase Cleanup | Deleted 63 unused Figma SVGs + 37 unused shadcn/ui components. Renamed Lounge → Collective. Renamed hash-named assets to descriptive names. Extracted types to `src/types/index.ts`. Extracted data to `src/data/`. Cleaned Vite config aliases. |
| 2026-03-17 | T002: Backend Scaffold | Express server on port 3001. Repository/service pattern. Shared types in `shared/types.ts`. Vite proxy `/api` → 3001. Core REST endpoints. `asyncHandler` + global error handler. |
| 2026-03-17 | T003: PostgreSQL Database | 15-table schema (later expanded to 22). 4 demo personas seeded. Repositories query PostgreSQL via `pg` pool. |
| 2026-03-17 | T004: Frontend API Integration | TanStack Query hooks. HomeScreen fetches `/api/home/summary`. WealthScreen fetches 5 endpoints in parallel. Loading skeletons and error states. |
| 2026-03-18 | T005: Chat Context & Interactions | ChatScreen calls `/api/chat/message`. CTAs pass structured context. Poll voting endpoint. Peer comparison endpoint. Discover content endpoint. Performance history (366 daily data points). Chat thread message persistence. |
| 2026-03-18 | T006: PRD Creation | Created this living Product Requirements Document. |
| 2026-03-18 | T007: AI Chat + LLM Integration | Full LLM-powered chat replacing keyword matching. OpenAI gpt-5-mini via Replit AI Integrations. Intent classification, RAG pipeline (holdings, allocations, goals, accounts, transactions), three-tier memory system (working/episodic/semantic), PII detection, tool-calling (show_simulator, show_widget, extract_user_fact), SSE streaming, embedded widgets (AllocationChartWidget, HoldingsSummaryWidget, GoalProgressWidget, PortfolioSummaryWidget), scenario simulators via LLM, suggested questions from LLM, audit logging. Added 3 new tables: episodic_memories, semantic_facts, chat_audit_log. |
| 2026-03-18 | T008: Goals & Life Planning | Goal health score computation (goalService.ts). AI-powered life-gap analysis. Life-event goal suggestions. New endpoints: /wealth/goals/health-score, /wealth/goals/life-gaps, /wealth/goals/life-gaps/dismiss, /wealth/goals/life-event. UI components: LifeGapPrompts, LifeEventModal. |
| 2026-03-18 | T009: Morning Sentinel | AI-generated daily briefing (morningSentinelService.ts). Portfolio anomaly detection (concentration, large moves, low diversification). Streaming SSE endpoint. MorningSentinelCard UI component. |
| 2026-03-18 | T010: Animations & Transitions | Framer Motion AnimatePresence for tab switches (horizontal slide), overlays (slide-up), client environment (fade). Animated tab indicator with layoutId. Pull-to-refresh on all tab screens. |
| 2026-03-18 | T011: TypeScript Validation | Fixed all 112 TypeScript errors. Registered `npm run typecheck` as CI validation. Added typescript, @types/react, @types/react-dom as direct devDependencies. |
| 2026-03-18 | T012: Morning Sentinel Performance | Prefetch on app init (main.tsx). SSE streaming fallback in useMorningSentinel hook. StreamingSentinel progressive UI component. Server-side deduplication with inFlightRequests Map. 4h cache TTL with gcTime + staleTime. |
| 2026-03-18 | PRD Update | Comprehensive PRD audit — updated chat section (LLM pipeline), added Morning Sentinel, Goals & Life Planning, AI architecture, streaming, 3 new DB tables (22 total), 8 new API endpoints (25+ total), updated implementation status. |
| 2026-03-19 | Agent Task #1: DB & Data Foundation | Added 10 new tables (tenants, tenant_configs, instruments, market_quotes, news_items, tool_runs, agent_traces, policy_decisions, conversation_summaries). 8 personas, 8 instruments, market quotes, news items seeded. agentRepository.ts for all agent-related DB operations. Zod schemas in shared/schemas/agent.ts. |
| 2026-03-19 | Agent Task #2: Agent Architecture & Intelligence | Full agent orchestrator replacing chatService pipeline. Policy engine, model router, prompt builder, response builder, trace logger, guardrails, wealth engine, financial tools (8 tools with multi-turn support). Structured AdaAnswer responses. |
| 2026-03-19 | Agent Task #3: External Data Providers | 6 external providers: Finnhub (market), FRED (macro), SEC EDGAR (regulatory), OpenFIGI (identity), Frankfurter (FX), CBUAE (FX localized). Provider registry with primary/secondary/fallback/mock chain. In-memory caching, rate limiting, sliding-window health tracking. |
| 2026-03-20 | Agent Task #5: Verify & Fix Agent Architecture | Fixed intent sub-routing (portfolio_health, portfolio_explain, market_news). Fixed guardrails-before-streaming ordering. Fixed advisor handoff widget deduplication. Verified all 8 tools dispatch correctly. End-to-end pipeline verified. |
| 2026-03-21 | Agent Task #6: Execution Guardrails & RM Handoff | execution_request intent classification (20+ keywords). 3-layer execution boundary (system prompt, guardrails, orchestrator fallback). rmHandoffService with rm_handoff/api_webhook/disabled routing. route_to_advisor tool. advisor_action_queue table. Enhanced AdvisorHandoffWidget with RM name, action context, queue reference. Tenant config extended with execution_routing_mode, execution_webhook_url, can_prepare_trade_plans. |
| 2026-03-21 | PRD Update | Updated PRD to reflect agent architecture: 33 tables, 34 endpoints, 17 services, 6 providers, 8 AI tools, execution guardrails, RM handoff, multi-tenant config. |
| 2026-03-21 | Task #7: Multi-Model Routing | Lane-based control plane with 3 lanes (deterministic/fast/reasoning). Request scorecards for route selection. Provider aliases (ada-fast, ada-reason → gpt-5-mini). Per-lane token/temperature budgets. Lane metadata in agent traces. |
| 2026-03-21 | Task #8: User Switching | PersonaPicker bottom sheet for switching between 8 personas. X-User-ID header on all API calls. UserContext provider with localStorage persistence. Per-user React Query isolation (userId in all queryKeys + removeQueries on switch). Fixed Wealth tab crash for non-default users. |
| 2026-03-21 | Task #9: Full Persona Data Parity | All 8 personas seeded with: accounts, positions, portfolio snapshots, 365-day volatile performance history (risk-profile-appropriate curves with drawdowns for aggressive personas), goals, alerts, chat threads. Server-side `computeWealthInsights()` for diversification score, risk level, top allocation. Allocation totals reconcile with snapshots. 70-test suite in `tests/persona-parity.test.ts`. |
| 2026-03-21 | Bug Fix: Collective Duplicates | Fixed `peer_segments` table producing 400 duplicate rows on restart. Added UNIQUE constraint on `asset_class`. Seed uses DELETE + ON CONFLICT(asset_class) DO NOTHING. |
| 2026-03-21 | PRD Update | Updated personas from 4 to 8, model router to lane-based, marked user switching/multi-model/persona parity as built, added Tasks #7-#9 and bug fix to changelog. |
| 2026-03-21 | Task #10: Data Realism | NVDA price corrected ($250→$135.40). Performance history overhauled with deterministic hash-based compound return models. Portfolio values cascaded. Hardcoded sparkline replaced with DB-backed data. |
| 2026-03-21 | Task #11: Portfolio Health Fix | Fixed `portfolioRepository.ts` field mismatch — `diversificationScore` was mapped to wrong column, `riskLevel` returned incorrect value. |
| 2026-03-22 | Task #12: Reduce to 3 Personas | Removed 5 personas (Fatima, Omar, Layla, Sara, Nadia). Retained Aisha (Moderate), Khalid (Conservative), Raj (Aggressive). Updated UserContext with auto-heal for invalid stored user IDs. Parity tests reduced from 70 to 29. |
| 2026-03-22 | Data Audit | Comprehensive data integrity fixes: (1) Performance history formula replaced with bounded normalized cumulative walk (amplitude × norm_r); (2) Raj Binance balance $35,200→$52,000 to cover $51,451 crypto positions; (3) NVDA transaction prices corrected $235/$240→$138/$130; (4) All 24 cost_basis values reconciled with weighted transaction averages (7 mismatches fixed). |
| 2026-03-22 | PRD Update | Updated persona table from 8→3, updated portfolio values and account balances, updated implementation status, added Task #10–#12 and data audit to change log. |
| 2026-03-22 | Task #13: Rename to Aisha | Renamed default persona from Abdullah Al-Rashid to Aisha Al-Rashid across seed data, tests, and documentation. |
| 2026-03-23 | Task #14: LLM Intent Classification | Replaced keyword-only intent classifier with LLM-first `classifyIntentAsync()` (3s timeout, keyword fallback). Added `mapIntentForRag()` to fix RAG double-classification. Rewrote goals routing to deterministic Lane 0 with actionable savings advice. Added LLM streaming timeout+retry (15s/20s AbortController). Skip tools for non-financial intents. SSE error handling. Removed fabricated cashPercent fallback. Fixed holdings changePercent. |
| 2026-03-23 | Task #15: Docs Audit & LLM Resilience | Updated all documentation (CHANGELOG, PRD, ISSUES, replit.md) to reflect Tasks #13–14. Added Lane 2 → Lane 1 fallback when both reasoning-model streaming attempts timeout. Added ISS-022 for LLM timeout resilience. |
| 2026-03-23 | Task #16: AI Orchestration Hardening | Capability registry (`capabilityRegistry.ts`) with model capabilities, lane configs, intent→route mappings, classifier context injection. Anthropic Claude fallback (claude-sonnet-4-6) via Replit AI Integrations. Resilient LLM helpers (`resilientCompletion`, `resilientStreamCompletion`) with timeout+retry+fallback on all call sites. Verbose/thinking mode backend (9 `thinking` SSE events) + frontend (`ThinkingPanel`, "Think" toggle). |
| 2026-03-23 | Task #17: Live Thinking Panel | Server-side `setImmediate()` async ticks at 4 pipeline boundaries + typed `flush()` after thinking events for reliable SSE chunk separation. New `LiveThinkingBar` component with progressive step reveal (120ms stagger), amber pulsing indicator, step counter. Fixed below chat header during streaming. Post-stream `ThinkingPanel` summary persists as collapsible in-message panel. Toggle edge cases: OFF hides but preserves data, ON restores accumulated steps. |
| 2026-03-24 | Task #1: Login Page | Replaced Summit Bank ClientEnvironment landing page with Ada-styled LoginPage component. Cream background, Crimson Pro/DM Sans typography, email/password form, burgundy sign-in button, collapsible "Dev Quick Access" persona picker. Wired into App.tsx as default `login` view. |
| 2026-03-24 | Task #2: Login Heading Update | Removed circular burgundy icon above heading. Split into "Welcome to" (Crimson Pro 22px) + AdaLogo SVG on its own line (~130px). Updated subtitle to "Your modern wealth intelligence platform". |
| 2026-03-24 | Task #3: Font Loading & Typography Fix | Added Google Fonts (Crimson Pro, DM Sans) and TypeKit (RL Limo) to index.html. Fixed all ~50 component files: replaced invalid Figma-style `:Weight` suffix font references (e.g., `DM_Sans:Regular`) with valid CSS font names + Tailwind weight classes. Updated design tokens. Previously all fonts fell back to browser default sans-serif. |
| 2026-03-24 | Task #4: Remove TopBar | Deleted fake mobile status bar component (TopBar.tsx) showing static "9:41" time, signal, wifi, battery icons. Removed from all screens. Added 16px top padding to header containers. |
| 2026-03-24 | Docs Update | Updated PRD, CHANGELOG, ISSUES, BACKLOG, DESIGN_SYSTEM, TYPOGRAPHY_GUIDE, and replit.md to reflect Tasks #1–4 changes. |
| 2026-03-25 | Project Task #16: UI Bug Fixes | Fixed 3 intermittent UI bugs: (1) Morning Sentinel JSON flash — streaming now shows friendly message instead of raw JSON chunks; (2) Wealth tab blank — loading gates only on overview query, added ErrorBoundary; (3) Discover "something went wrong" — safe JSONB parsing + `keepPreviousData` + ErrorBoundary. New `ErrorBoundary.tsx` component. |
| 2026-03-25 | Project Task #17: Context-Aware Follow-Ups | Intent classifier receives last 4 conversation turns from working memory. LLM prompt includes follow-up resolution rules. `isLikelyContinuation()` heuristic + post-classification override for continuation phrases. "Do across all" after news query → `news_explain` (was: `balance_query`). |
| 2026-03-25 | Docs Update | Updated PRD, CHANGELOG, ISSUES, BACKLOG, and replit.md to reflect Project Tasks #16–17. |
| 2026-03-25 | Project Task #3: Discover Phase 1 | Automated content pipeline: Ingest (Finnhub 10min), Enrich (12-category taxonomy), Cluster (Jaccard similarity), Synthesize (LLM card generation), Feed Materializer (deterministic scoring). 6 new tables (raw_articles, article_enrichment, article_clusters, discover_cards, cta_templates, user_profiles). 5 card types (portfolio_impact, trend_brief, market_pulse, explainer, wealth_planning). Pipeline health endpoint. Real relative timestamps. Tab renamed "What's Happening" → "What's New". |
| 2026-03-25 | Project Task #4: Discover Phase 2 | Personalization engine: per-user weighted scoring (7 factors), 3 user segments, LLM personalized overlays, CTA personalization. Ada View weekly editorial worker. Event Calendar worker. Pre-computed user_discover_feed cache. Interaction tracking (POST /api/discover/interact). Card dismiss + feedback UI. "NEW" badge. Enriched chat context handoff. 4 new tables (user_segments, user_discover_feed, user_content_interactions, user_discover_visits). 7 card types active. |
| 2026-03-26 | Project Task #5: Discover Phase 3 | Product opportunity cards (sukuk, PE co-invest). Engagement re-ranking with taxonomy-tag-based boosts/penalties + segment collaborative filtering. Morning briefing worker (daily LLM brief from overnight cards + Morning Sentinel, pinned at #1). Milestone worker (value thresholds, performance >2%, goal completions, user-scoped IDs). Event-driven per-user refresh. Expiry enforcement with per-card-type TTLs. Pipeline health extended with pipelineLag + feedFreshness. Schema constraint migration. 11 card types active. |
| 2026-03-26 | Docs Update | Updated PRD section 4.3 (full Discover rewrite), sections 11/12, CHANGELOG (Phase 1/2/3 entries), ISSUES (ISS-023/024), BACKLOG (Phase 1/2/3 completed + BL-026/027/028), replit.md (counts, Phase 2/3 tables). |
| 2026-03-27 | Project Task #8: Configurable Model Registry | Named-config model registry (production/rollback) with `MODEL_CONFIG` env var. 5 provider aliases (ada-classifier, ada-fast, ada-content, ada-reason, ada-fallback). Replaced all 5 hardcoded `gpt-4o-mini` strings with `resolveModel('ada-content')`. Token instrumentation (prompt_tokens, completion_tokens, provider_alias in agent_traces). Fallback event persistence (provider_fallback_events table). XML prompt injection defense (`<system_instructions>` / `<user_context>` boundaries). Deleted `server/replit_integrations/` scaffold. |
