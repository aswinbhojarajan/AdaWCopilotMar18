# Ada — AI Wealth Copilot: Product Requirements Document

> **Living document** — update this PRD before and after every build cycle.
> Last updated: 2026-03-18
>
> **Source of truth precedence**: When a mismatch exists between this document and the runtime code/schema, the code is authoritative. Update this PRD to reflect the code, not the other way around.
>
> **Last audited against**: `server/routes/api.ts`, `server/index.ts`, `server/db/schema.sql`, `server/db/seed.sql`, `src/App.tsx`, `src/components/screens/*.tsx`, `src/components/ada/index.ts`, `shared/types.ts`, `src/types/index.ts`

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
- **Conversational finance**: Allow users to explore complex financial topics through natural-language chat with deterministic, advisor-quality responses.
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

Four seeded personas exist in the database. **Abdullah Al-Rashid** is the default user and the primary demo persona.

| ID | Name | Risk Profile | Score | Portfolio Value | Key Traits |
|---|---|---|---|---|---|
| `user-abdullah` | Abdullah Al-Rashid | Moderate | 62 | $94,830.19 | Default user. 3 accounts (HSBC, Interactive Brokers, WIO Bank). 7 positions. 2 goals (house deposit, education fund). Tech-heavy allocation (48%). |
| `user-fatima` | Fatima Hassan | Conservative | 35 | $165,700.00 | 2 accounts (Emirates NBD, Vanguard). 1 goal (retirement). Lower risk tolerance. |
| `user-omar` | Omar Khalil | Aggressive | 85 | $102,100.00 | 2 accounts (ADCB, Robinhood). Growth-focused. Highest risk score. |
| `user-layla` | Layla Mahmoud | Moderate | 55 | $110,500.00 | 2 accounts (Mashreq Bank, Charles Schwab). Balanced profile. Negative daily change. |

All personas share the same advisor: **Sarah Mitchell** (Senior Wealth Advisor, `advisor-sarah`).

---

## 3. Navigation & Interaction Patterns

### Tab Bar

Four main tabs displayed via the `Navigation` component:

| Tab | Key | Route |
|---|---|---|
| Home | `home` | Default landing after onboarding splash |
| Wealth | `wealth` | Portfolio deep-dive |
| Discover | `discover` | Content feed |
| Collective | `collective` | Peer insights & polls |

### Routing

- **useState-based routing** in `App.tsx` — no React Router.
- `activeTab` (TabType) controls which tab screen renders.
- `currentView` (ViewType) controls overlay screens: `chat`, `chat-history`, `notifications`, `home-empty`, `client-environment`.
- The app starts on `client-environment` (onboarding splash), then navigates to `home`.

### Screen Layout Pattern

Every tab screen follows the same layout:

```
┌─────────────────────┐
│ TopBar (status bar)  │
│ Header (logo + icons)│
│ Navigation (tabs)    │  ← Fixed, z-10
├─────────────────────┤
│                     │
│ Scrollable Content  │  ← top-[128px], overflow-y-auto
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
- **Close/Back**: "X" button returns to the client environment splash.
- **Slide Notifications**: `SlideNotification` component provides toast-style alerts (used on Wealth and Collective screens for goal alerts after poll voting).

---

## 4. Feature Requirements by Tab

### 4.1 Home Tab

**Purpose**: Daily summary view with proactive insights and portfolio overview.

**Data Source**: `GET /api/home/summary` → `HomeSummaryResponse`

**Components**:

| Section | Component | Data | Behavior |
|---|---|---|---|
| Summary Card | `SummaryCard` | Greeting, date, attention count, summary text | Static display |
| Portfolio Overview | Inline card | Portfolio value, daily change (amount + %), sparkline chart | "Dive deeper" CTA opens chat with portfolio context. "Contact advisor" button (placeholder). |
| Content Cards | `ContentCard` (×N) | Category, title, description, timestamp, CTA buttons, optional image, sources count | Primary button opens chat with card context. Secondary button (if present) also opens chat. Rendered from `contentCards` array in API response. |

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
| Goals | `CompactGoals` | Expandable section. Each goal shows progress bar, health status badge, AI insight, CTA button → chat. House deposit goal supports auto-scroll from notification. |
| Connected Accounts | `CompactConnectedAccounts` | List of linked accounts with logo, balance, sync status. "Add account" button opens `AddAccountModal`. |
| Advisor | `CollapsibleAdvisor` | Expandable advisor card showing Sarah Mitchell, availability, contact button. |

**Special Behaviors**:

- `SlideNotification` component is implemented and prop-driven (`showGoalNotification`). In the current app flow, goal notification visibility on Wealth is controlled by `App.tsx` state — it is not actively triggered by default but the component is wired and ready.
- Auto-scroll: When navigating from Collective after poll vote, the Wealth tab auto-expands goals and scrolls to the house deposit goal.
- Add Account Modal: Mock flow that adds a new account to the local state.

### 4.3 Discover Tab

**Purpose**: Curated content feed with personalized and market-wide articles.

**Data Source**: `GET /api/content/discover?tab={forYou|whatsHappening}` → `DiscoverContentItem[]`

**Components**:

| Section | Component | Behavior |
|---|---|---|
| Filter Tags | `Tag` (×2) | "For You" (default) and "What's Happening" toggle. Switching re-fetches content from API. |
| Content Cards | `ContentCard` (×N) | Each card includes: category label, title, context title, description, timestamp, primary + secondary CTA buttons, optional image, optional sources count, optional detail sections (expandable). Buttons use `forceSecondaryButtonStyle`. |

**"For You" Content** (4 items):

1. Alternative investments — low correlation insight
2. Tech allocation outperformance — rebalancing prompt
3. Emerging market bonds — yield opportunity
4. Wealth transfer — estate tax planning

**"What's Happening" Content** (7 items):

1. GCC sovereign wealth funds — alternative assets pivot
2. Federal Reserve — rate cut pause
3. GCC equity markets — outperformance
4. Sustainable investing — ESG returns
5. Fine wine and rare spirits — alternative returns
6. Institutional crypto adoption — inflection point
7. Dubai luxury real estate — price surge

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

**Deterministic keyword matching** — not LLM-based.

The server-side `chatRepository.ts` maintains an in-memory array of `ChatResponseMapping` objects:

```typescript
{
  keywords: string[];            // Lowercase phrases to match
  message: string;               // Response text
  simulator?: SimulatorConfig;   // Optional interactive simulator
}
```

**Matching logic**: The user's message is lowercased, then each mapping's keywords are checked for substring inclusion. First match wins. If no match, a default fallback response is returned.

**Server-side response topics** (defined in `server/repositories/chatRepository.ts`):

| Topic | Keywords |
|---|---|
| Market changes | "what changed", "what's changed" |
| Portfolio impact | "why does this affect" |
| Tech allocation | "review tech allocation" |
| Risk exposure | "review my risk exposure" |
| Goal off-track | "why am i off track" |
| Goal recovery | "how can i get back on track" |
| Portfolio deep-dive | "dive deeper" |
| Bond opportunities | "bond", "fixed income" |
| Portfolio risk | "portfolio", "risk" |
| Advisor contact | "contact advisor" |

**Client-side response topics** (defined in `src/data/chat.ts`, used as fallback reference — includes simulator configs):

| Topic | Keywords | Includes Simulator |
|---|---|---|
| Risk scenarios | "model risk scenarios" | Investment simulator |
| Bond comparison | "compare scenarios" | Investment simulator |
| Simple scenario | "simple scenario" | Investment simulator |
| Over-time analysis | "mean over time" | Investment simulator |
| Retirement | "retirement" | Retirement simulator |
| Spending/budget | "spending", "budget" | Spending simulator |
| Tax optimization | "tax", "optimize tax" | Tax simulator |
| Regional opportunities | "regional opportunities" | No |
| Emerging regions | "emerging regions" | No |
| (plus duplicates of server-side topics with simulator configs) | — | — |

> **Note**: The server-side chatRepository has a smaller keyword set and does not include simulator mappings. The client-side `src/data/chat.ts` has a superset of responses including simulators, but it is not used at runtime (the server chatRepository handles all responses). The current API response contract (`ChatMessageResponse`) returns only `threadId`, `message`, and `suggestedQuestions` — simulator configs are **not** returned by the API. Simulator support exists only as reference data in the client-side module and would require API contract changes to surface.

**Suggested Questions**: After each response, the API returns contextual follow-up suggestions based on keywords in the assistant's last message. Default suggestions: "Tell me more", "Show me the numbers".

**Simulator Config** (4 types):

```typescript
type: 'retirement' | 'investment' | 'spending' | 'tax'
initialValues?: Record<string, number>
```

### Chat UI Elements

| Element | Description |
|---|---|
| Chat Header | Back button, "Ada" title |
| Date Pill | "Today" indicator |
| Capability Statement | "I can analyze your portfolio, model risk scenarios..." |
| User Messages | Right-aligned, dark background |
| Assistant Messages | Left-aligned, white background |
| Context Prefix | First user message shows context title above the message text |
| Typing Indicator | Three bouncing dots |
| Suggested Questions | Horizontally scrollable pills below chat area |
| BottomBar | Text input + chat history icon |

### Chat History (`ChatHistoryScreen.tsx`)

- Lists threads from `GET /api/chat/threads` (database-backed).
- Each thread shows title, preview text, and relative timestamp.
- Three seeded threads for Abdullah covering portfolio rebalancing, concentration risk, and hedging.

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

| Font Family | Weights Used | Usage |
|---|---|---|
| **Crimson Pro** | Regular, ExtraLight | Headlines, large values, card titles |
| **DM Sans** | Light, Regular, Medium, SemiBold | Body text, labels, buttons, category tags |

Font references use CSS custom syntax: `font-['Crimson_Pro:Regular',sans-serif]` and `font-['DM_Sans:SemiBold',sans-serif]`.

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
| `TopBar` | Mobile status bar simulation |
| `Header` | App logo, notification bell, close button |
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
| GET | `/api/wealth/overview` | — | `WealthOverviewResponse` | Portfolio value + performance history |
| GET | `/api/wealth/allocation` | — | `AssetAllocation[]` | Computed allocation breakdown |
| GET | `/api/wealth/holdings` | — | `HoldingResponse[]` | Top 5 holdings by value |
| GET | `/api/wealth/goals` | — | `GoalResponse[]` | Financial goals with health status |
| GET | `/api/wealth/accounts` | — | `AccountResponse[]` | Connected bank/brokerage accounts |
| GET | `/api/notifications` | — | `AlertResponse[]` | User alerts and notifications |
| GET | `/api/content` | `?category=X` | `ContentItem[]` | All or filtered content items |
| GET | `/api/content/discover` | `?tab=forYou\|whatsHappening` | `DiscoverContentItem[]` | Discover tab content |
| GET | `/api/chat/threads` | — | `ChatThreadResponse[]` | Chat history threads |
| GET | `/api/chat/:threadId/messages` | — | `ChatMessage[]` | Messages in a thread |
| POST | `/api/chat/message` | `ChatMessageRequest` | `ChatMessageResponse` | Send message, get AI response |
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

### Database: PostgreSQL (19 tables)

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
| `positions` | `id` (TEXT) | account_id (FK), symbol, name, quantity, current_price, cost_basis, asset_class | 7 positions for Abdullah |
| `portfolio_snapshots` | `id` (TEXT) | user_id (FK), total_value, daily_change_amount/percent | Latest snapshot used for overview |
| `goals` | `id` (TEXT) | user_id (FK), title, target/current_amount, health_status, ai_insight | on-track/needs-attention/at-risk |
| `alerts` | `id` (TEXT) | user_id (FK), type, title, message, unread, category | 7 alerts for Abdullah |
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
| Frontend | React 18 + TypeScript, Vite 6, Tailwind CSS v4 |
| Backend | Express + TypeScript (via `tsx`), port 3001 |
| Database | PostgreSQL (Replit-managed) |
| Fonts | Crimson Pro, DM Sans (Google Fonts) |
| Icons | Lucide React |
| Linting | ESLint 9 (flat config) + Prettier |
| Dev Proxy | Vite on port 5000 → `/api` proxy to port 3001 |

### Backend Architecture

```
Request → Express Router → asyncHandler → Service → Repository → PostgreSQL
                                              ↓
                                    chatRepository (in-memory)
```

- **Repository pattern**: `server/repositories/` — data access layer with direct SQL queries via `pg` pool.
- **Service layer**: `server/services/` — business logic combining multiple repositories.
- **asyncHandler**: Wraps async route handlers to catch errors and pass to Express error handler.
- **Global error handler**: Catches unhandled errors, logs the actual message server-side, and returns a generic `500 { error: 'Internal server error' }` response.

### Frontend Architecture

```
App.tsx (state management)
  ├── Screen Components (HomeScreen, WealthScreen, etc.)
  │     ├── ada/ Design System Components
  │     └── useApi() hook for data fetching
  └── Type Definitions (src/types/index.ts)
```

- **useApi hook** (`src/hooks/useApi.ts`): Generic data-fetching hook with `data`, `loading`, `error` states and `refetch` function.
- **Shared types** (`shared/types.ts`): Backend/frontend API contract types.
- **Frontend types** (`src/types/index.ts`): Frontend-specific types including view/tab types, chat context, screen props.
- **Fallback data** (`src/data/`): Client-side data modules (mostly superseded by API but retained as reference).

### Key Architectural Decisions

1. **"Lounge" renamed to "Collective"** throughout the entire codebase.
2. **Asset allocation is computed** from positions + account balances, not stored directly.
3. **Chat uses deterministic keyword matching**, not an LLM.
4. **Default user is hardcoded** to `user-abdullah` in `api.ts`.
5. **Poll voting uses database transactions** for atomicity (increment vote_count + insert vote record).
6. **Performance history** seeded with 366 daily data points using PostgreSQL `generate_series`.
7. **ESLint ignores `src/imports/`** (Figma-generated code retained for the client environment splash).

---

## 10. Non-Functional Requirements

### Performance

- Loading skeletons on all data-fetching screens (Home, Wealth, Discover, Collective).
- Parallel API calls on Wealth screen (5 simultaneous requests).
- Optimistic UI on poll voting (update local state before server response).
- Scroll-to-goal uses `requestAnimationFrame` for smooth animation.

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
| **Wealth Tab** | Built | 5 parallel API calls, all sections functional |
| **Discover Tab** | Built | API-backed, two filter tabs, expandable detail sections |
| **Collective Tab** | Built | Polls (vote + results), peer comparison chart, API-backed |
| **Chat Screen** | Built | Deterministic responses, suggested questions, typing indicator |
| **Chat History** | Built | DB-backed thread list, thread detail messages |
| **Notifications** | Built | DB-backed alerts, category filtering, unread indicators |
| **Client Environment** | Built | Onboarding splash screen (Figma-generated) |
| **PostgreSQL Database** | Built | 19 tables, 4 personas, full seed data |
| **REST API** | Built | 17+ endpoints, asyncHandler, global error handler |
| **Loading Skeletons** | Built | All data-fetching screens |
| **Error States** | Built | All data-fetching screens |
| **Slide Notifications** | Built | Goal alerts on Wealth + Collective |
| **Add Account Modal** | Built | Mock flow, local state only |
| **Auto-scroll to Goal** | Built | Cross-tab navigation from Collective |
| **Performance Chart** | Built | 5 time-frame toggles, DB-backed (366 days) |
| **Poll Voting** | Built | Optimistic UI, server-persisted, atomic transactions |
| **Simulator Components** | Partial | `ScenarioSimulator.tsx` component exists and is rendered within `ChatMessage.tsx` when a simulator config is present. However, the server API does not currently return simulator configs in responses, so the component is never triggered at runtime. Client-side `src/data/chat.ts` has simulator mappings but is not used by the API. |
| **User Switching** | Not built | Backend hardcoded to `user-abdullah` |
| **Real AI/LLM Chat** | Not built | Uses deterministic keyword matching |
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
| 2026-03-17 | T003: PostgreSQL Database | 15-table schema (later expanded to 19). 4 demo personas seeded. Repositories query PostgreSQL via `pg` pool. |
| 2026-03-17 | T004: Frontend API Integration | `useApi` hook. HomeScreen fetches `/api/home/summary`. WealthScreen fetches 5 endpoints in parallel. Loading skeletons and error states. |
| 2026-03-18 | T005: Chat Context & Interactions | ChatScreen calls `/api/chat/message`. CTAs pass structured context. Deterministic keyword-matched responses from chatRepository. Suggested questions from API. Poll voting endpoint. Peer comparison endpoint. Discover content endpoint. Performance history (366 daily data points). Chat thread message persistence. |
| 2026-03-18 | T006: PRD Creation | Created this living Product Requirements Document capturing full product scope, design system, API contracts, data model, and implementation status. |
