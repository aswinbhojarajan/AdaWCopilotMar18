# Ada — AI Wealth Copilot

## Overview
A mobile-first wealth management copilot prototype. Full-stack application with Express backend, PostgreSQL database, and React frontend with LLM-powered AI chat. Originally exported from Figma.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Vite 6, Tailwind CSS v4, TanStack Query v5
- **Backend**: Express + TypeScript (via tsx), port 3001
- **Database**: PostgreSQL (Replit-managed), 22 tables
- **AI**: OpenAI (Replit AI Integrations), gpt-5-mini model, streaming SSE
- **Styling**: Tailwind utility classes, custom fonts (Crimson Pro, DM Sans)
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
    portfolioRepository.ts   — Portfolio, holdings, allocations, goals, accounts, performance history
    contentRepository.ts     — Content cards, alerts, chat threads/messages, peer comparisons
    chatRepository.ts        — Deterministic chat response mappings (fallback, in-memory)
    pollRepository.ts        — Poll questions, options, and voting
  db/
    pool.ts                  — pg Pool configured from DATABASE_URL
    schema.sql               — 22-table schema definition
    seed.sql                 — Seed data for 4 demo personas
  replit_integrations/       — OpenAI blueprint integration files (chat, audio, image, batch)

shared/
  types.ts                   — Backend/frontend contract types
  models/chat.ts             — Drizzle schema for AI integration (not used by main app)
```

## Database Tables
users, risk_profiles, advisors, accounts, positions, transactions,
price_history, portfolio_snapshots, goals, alerts, content_items,
peer_segments, chat_threads, chat_messages, action_contexts,
performance_history, poll_questions, poll_options, poll_votes,
episodic_memories, semantic_facts, chat_audit_log

## API Endpoints
| Method | Path                       | Description                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/health                | Health check                       |
| GET    | /api/me                    | Current user profile               |
| GET    | /api/home/summary          | Home screen data + content cards   |
| GET    | /api/morning-sentinel      | AI-generated daily briefing (?refresh=true to force) |
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
