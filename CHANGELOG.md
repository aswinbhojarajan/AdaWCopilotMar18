# Changelog — Ada AI Wealth Copilot

All notable changes to the Ada AI Wealth Copilot project are documented below, organized by task.

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
- `chat_audit_log` PK type: SERIAL (not TEXT); column names: `prompt_tokens`/`completion_tokens` (not `token_count`)
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
- **Server-side deduplication** — `inFlightRequests` Map in `morningSentinelService.ts` prevents concurrent OpenAI calls for the same user when both prefetch and stream fire simultaneously

### Changed
- **`useMorningSentinel` hook** — complete rewrite with coordinated prefetch/stream strategy:
  - Waits 500ms for cached prefetch data from TanStack Query
  - If prefetch hasn't resolved, falls back to SSE streaming automatically
  - Merges stream events into React state for progressive rendering
  - Returns `streamState` ('idle' | 'streaming' | 'done') for UI coordination
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
  - `detectAnomalies()` — flags concentration risk (>40% single asset class), large daily moves (>1.5%), off-track goals, low diversification
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
- **RM Productivity Suite specification document** — detailed backlog item documenting the Relationship Manager persona features planned for future implementation:
  - RM Morning Planning Queue (priority-sorted client list)
  - AI Customer Digest & Talking Points (LLM-generated call prep)
  - At-Risk Client Radar (attrition risk ranking with interventions)
  - Next-Best-Action Coach (AI-recommended actions per flagged client)
- This task produced a planning/backlog document only; no code changes were made

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
| PostgreSQL tables | 23 |
| API endpoints | 25+ (including 2 SSE streams) |
| React components | 65+ |
| React hooks | 15+ |
| Backend services | 8 (ai, chat, intent, rag, memory, pii, goal, sentinel) |
| Database repositories | 5 |
| AI tools | 3 (simulator, widget, fact extraction) |
| Memory tiers | 3 (working, episodic, semantic) |
| SSE streams | 2 (chat, morning sentinel) |
| TypeScript errors fixed | 112 |
