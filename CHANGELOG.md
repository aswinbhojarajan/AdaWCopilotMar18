# Changelog — Ada AI Wealth Copilot

All notable changes to the Ada AI Wealth Copilot project are documented below, organized by task.

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
| Total commits | 28 |
| Files changed | 275 |
| Lines added | ~18,900 |
| Lines removed | ~22,000 |
| PostgreSQL tables | 22 |
| API endpoints | 17+ |
| React components | 60+ |
| React hooks | 12 |
| Backend services | 7 |
| Database repositories | 5 |
| AI tools | 3 (simulator, widget, fact extraction) |
| Memory tiers | 3 (working, episodic, semantic) |
