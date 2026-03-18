# Ada — AI Wealth Copilot

## Overview
A mobile-first wealth management copilot prototype. Full-stack application with Express backend, PostgreSQL database, and React frontend. Originally exported from Figma.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Vite 6, Tailwind CSS v4
- **Backend**: Express + TypeScript (via tsx), port 3001
- **Database**: PostgreSQL (Replit-managed), 19 tables, 4 demo personas
- **Styling**: Tailwind utility classes, custom fonts (Crimson Pro, DM Sans)
- **Linting**: ESLint 9 (flat config) + Prettier
- **Dev Server**: Vite on port 5000 proxies /api → port 3001
- **Build Output**: `build/` directory

## Project Structure
```
src/
  App.tsx                    — Root component with useState-based navigation
  types/index.ts             — Frontend-specific TypeScript interfaces
  hooks/useApi.ts            — Generic data-fetching hook with loading/error states
  data/                      — Client-side fallback data (mostly superseded by API)
  components/
    ada/                     — Design system components (Button, Tag, ContentCard, etc.)
    screens/                 — Screen-level components (Home, Wealth, Discover, etc.)
    figma/                   — Figma utility components (ImageWithFallback)
  imports/                   — Retained Figma-generated files (ClientEnvironment, SVGs)
  assets/                    — Image assets (descriptive names)

server/
  index.ts                   — Express entry point (port 3001), global error handler
  routes/api.ts              — REST API routes with asyncHandler wrapper
  services/                  — Business logic (portfolioService, chatService)
  repositories/              — Data access layer (PostgreSQL queries)
    userRepository.ts        — User + risk profile queries
    portfolioRepository.ts   — Portfolio, holdings, allocations, goals, accounts, performance history
    contentRepository.ts     — Content cards, alerts, chat threads/messages, peer comparisons
    chatRepository.ts        — Deterministic chat response mappings (in-memory)
    pollRepository.ts        — Poll questions, options, and voting
  db/
    pool.ts                  — pg Pool configured from DATABASE_URL
    schema.sql               — 19-table schema definition
    seed.sql                 — Seed data for 4 personas

shared/
  types.ts                   — Backend/frontend contract types
```

## Database Tables
users, risk_profiles, advisors, accounts, positions, transactions,
price_history, portfolio_snapshots, goals, alerts, content_items,
peer_segments, chat_threads, chat_messages, action_contexts,
performance_history, poll_questions, poll_options, poll_votes

## API Endpoints
| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/health                | Health check                       |
| GET    | /api/me                    | Current user profile               |
| GET    | /api/home/summary          | Home screen data + content cards   |
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
| POST   | /api/chat/message          | Send message, get AI response      |
| POST   | /api/chat/:threadId/messages | Send message to specific thread  |
| GET    | /api/collective/peers      | Peer comparison data               |
| GET    | /api/polls                 | Active polls with options & votes  |
| POST   | /api/polls/:pollId/vote    | Vote on a poll option              |

## Frontend-API Integration
All screens fetch live data from the API — no static imports remain in screen components.
- HomeScreen: fetches `/api/home/summary`, renders content cards from DB
- WealthScreen: fetches overview, allocation, holdings, goals, accounts (5 parallel API calls)
- DiscoverScreen: fetches `/api/content/discover?tab=forYou|whatsHappening`, 11 content items with detail sections
- CollectiveScreen: fetches `/api/polls` + `/api/collective/peers`, poll voting POSTs to `/api/polls/:id/vote`
- ChatHistoryScreen: fetches `/api/chat/threads`, formats relative timestamps
- NotificationsScreen: fetches `/api/notifications`, category filtering
- ChatScreen: sends messages to `/api/chat/message`, receives deterministic responses
- All screens have loading skeletons and error states
- `useApi` hook supports `refetch()` for post-mutation data refresh
- Performance data sourced from performance_history table (366 daily data points)

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

## Table Name Mapping
The database uses descriptive table names that differ from the task spec:
| Spec Name | Actual Table | Notes |
|-----------|-------------|-------|
| portfolios | portfolio_snapshots | Stores snapshot values |
| holdings | positions | With computed value/change |
| connected_accounts | accounts | Same structure |
| notifications | alerts | Category-based filtering |
| asset_allocations | (computed) | Derived from positions + accounts |

## Key Decisions
- "Lounge" renamed to "Collective" everywhere
- Repository/service pattern; repositories query PostgreSQL
- Asset allocation computed from positions + account balances
- Chat uses deterministic keyword-matched responses (chatRepository)
- asyncHandler wrapper on all async Express routes
- Global error handler catches unhandled errors
- Default user: Abdullah Al-Rashid (user-abdullah)
- ESLint ignores `src/imports/` (Figma-generated code)
- Poll voting uses transactions for atomicity (vote count + vote record)
- Performance history seeded with 366 days of data via generate_series
