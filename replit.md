# Ada — AI Wealth Copilot

## Overview
A mobile-first wealth management copilot prototype. Full-stack application with Express backend, PostgreSQL database, and React frontend. Originally exported from Figma.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Vite 6, Tailwind CSS v4
- **Backend**: Express + TypeScript (via tsx), port 3001
- **Database**: PostgreSQL (Replit-managed), 15 tables, 4 demo personas
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
    portfolioRepository.ts   — Portfolio, holdings, allocations, goals, accounts
    contentRepository.ts     — Content cards, alerts, chat threads, peer comparisons
    chatRepository.ts        — Deterministic chat response mappings (in-memory)
  db/
    pool.ts                  — pg Pool configured from DATABASE_URL
    schema.sql               — 15-table schema definition
    seed.sql                 — Seed data for 4 personas

shared/
  types.ts                   — Backend/frontend contract types
```

## Database Tables
users, risk_profiles, advisors, accounts, positions, transactions,
price_history, portfolio_snapshots, goals, alerts, content_items,
peer_segments, chat_threads, chat_messages, action_contexts

## API Endpoints
| Method | Path                  | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | /api/health           | Health check                    |
| GET    | /api/me               | Current user profile            |
| GET    | /api/home/summary     | Home screen data + content cards|
| GET    | /api/wealth/overview  | Portfolio value + performance   |
| GET    | /api/wealth/allocation| Asset allocation (computed)     |
| GET    | /api/wealth/holdings  | Top 5 holdings by value         |
| GET    | /api/wealth/goals     | Financial goals                 |
| GET    | /api/wealth/accounts  | Connected accounts              |
| GET    | /api/notifications    | User alerts/notifications       |
| GET    | /api/chat/threads     | Chat history threads            |
| POST   | /api/chat/message     | Send message, get AI response   |
| GET    | /api/collective/peers | Peer comparison data            |

## Frontend-API Integration
- HomeScreen: fetches `/api/home/summary`, renders content cards from DB
- WealthScreen: fetches overview, allocation, holdings, goals, accounts (5 parallel API calls)
- ChatScreen: sends messages to `/api/chat/message`, receives deterministic responses
- Both screens have loading skeletons and error states

## Navigation
- 4 main tabs: Home, Wealth, Discover, Collective
- useState-based routing (no React Router)
- Chat opens from CTAs on Home/Wealth screens with structured context

## Brand Colors
- Dark red: `#441316`, Medium red: `#992929`
- Green badge: `#c6ff6a`
- Cream background: `#efede6`, Header background: `#f7f6f2`

## Key Decisions
- "Lounge" renamed to "Collective" everywhere
- Repository/service pattern; repositories query PostgreSQL
- Asset allocation computed from positions + account balances
- Chat uses deterministic keyword-matched responses (chatRepository)
- asyncHandler wrapper on all async Express routes
- Global error handler catches unhandled errors
- Default user: Abdullah Al-Rashid (user-abdullah)
- ESLint ignores `src/imports/` (Figma-generated code)
