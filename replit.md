# Ada — AI Wealth Copilot

## Overview
Ada is a mobile-first AI wealth management copilot prototype designed for GCC HNW investors. It is a full-stack application providing a comprehensive financial assistant with capabilities for portfolio analysis, goal tracking, market insights, personalized recommendations, execution guardrails with RM handoff, multi-tenant support, and full agent observability. The project aims to deliver an LLM-powered AI chat built on a production-grade agent architecture. The business vision is to empower HNW investors with an intelligent, personalized, and secure platform for managing their wealth, leveraging advanced AI to provide insights and support.

## User Preferences
Not specified.

## System Architecture
Ada is built on a full-stack architecture comprising a React frontend, an Express/TypeScript backend, and a PostgreSQL database.

**Frontend (React 18 + TypeScript):**
- **UI/UX**: Mobile-first design (max 430px) using Tailwind CSS v4, custom fonts, and responsive units. Centralized design tokens.
- **State Management & Data Fetching**: TanStack Query v5.
- **Authentication**: Cookie-session auth with clean email/password LoginPage, auth gate in App.tsx, Header profile avatar with logout dropdown. Demo persona cards hidden behind `VITE_DEMO_MODE` env var.
- **Navigation**: Auth-gated app shell leading to Home, Wealth, Discover, and Collective tabs.
- **Chat Features**: SSE streaming for real-time text, embedded data widgets, interactive scenario simulators, dynamic suggested questions, and context passing.
- **Animations**: AnimatePresence for transitions and Framer Motion for indicators.

**Backend (Express + TypeScript):**
- **API**: Provides RESTful endpoints and SSE streams.
- **Agent Orchestrator**: Manages the AI chat pipeline, handling PII detection, session hydration, intent classification, policy evaluation, multi-model routing, RAG, prompt assembly, memory, LLM interaction, multi-turn tool execution, wealth engine, guardrails, response building, SSE streaming, trace logging, and memory persistence.
- **Key Services**: Includes `policyEngine`, `modelRouter`, `promptBuilder`, `responseBuilder`, `traceLogger`, `guardrails`, `wealthEngine`, `toolRegistry`, `rmHandoffService`, `aiService`, `intentClassifier`, `ragService`, `memoryService`, `piiDetector`, `goalService`, and `morningSentinelService`.
- **ErrorBoundary**: React class component for user-friendly error handling.
- **Repositories**: Organized into 6 repositories: user, portfolio, content, chat, poll, agent.
- **Provider Pattern**: Employs 7 external data providers (Stock/Market, News, Macro/Economic, Company Filings, Instrument Lookup, FX Rates, Regional FX) with a priority chain, in-memory cache, rate limiting, health tracking, and automatic failover.
- **Capability Registry**: Configurable named-config model registry with 7 provider aliases.
- **Content Moderation**: OpenAI Moderation API integrated as pre/post-LLM safety filter.
- **LLM Resilience & Fallback**: Implements streaming timeout/retry, automatic model downgrades, and fallback to Anthropic Claude.
- **Execution Guardrails & RM Handoff**: Ada cannot execute trades; execution requests are routed to RM via `advisor_action_queue`, webhook, or rejected based on tenant configuration.
- **Shared Schemas**: Zod schemas for core agent types for validation.

**Discover Pipeline:**
- **Content Pipeline**: Automated 7-stage pipeline (Ingest → Enrich → Cluster → Synthesize → Ada View → Event Calendar → Materialize) running on `setInterval` timers with concurrency guards.
- **Ingest**: Fetches news from Finnhub, extracts tickers and regions.
- **Enrich**: Classifies articles, computes sentiment and importance, deduplicates.
- **Cluster**: Groups related articles using Jaccard similarity.
- **Synthesize**: Uses LLM to generate discover cards from article clusters.
- **Ada View**: Weekly editorial synthesis from top discover cards.
- **Event Calendar**: Fetches Finnhub earnings calendar, filters for user holdings.
- **Materialize**: Deactivates expired and low-confidence cards, maintains feed health, and adds per-user feed materialization with weighted scoring and LLM personalized overlays.
- **Personalization**: User segments, scoring engine with diversity guardrails, LLM personalized overlays, pre-computed feeds, interaction tracking, card dismissal with feedback, "New" badge, and CTA personalization.
- **Engagement & Premium Features**: Product opportunity cards, engagement re-ranking based on user interactions, daily LLM-synthesized morning briefing cards, milestone cards for portfolio events, and event-driven refresh for immediate feed updates.
- **Expiry Enforcement**: Per-card-type maximum age rules, archiving old articles and clusters, and compacting interaction logs.

**Database (PostgreSQL):**
- Contains 44 tables for core app data, agent architecture components, discover pipeline, and execution routing.
- Includes 3 seeded personas with financial data parity and user_profiles for personalization metadata.
- Stores instruments, market quotes, news, editorial discover cards, CTA templates, and tenant configuration.

**Key Configuration:**
- **MODEL**: 7-alias model stack using provider aliases (`ada-classifier`, `ada-fast`, `ada-content`, `ada-reason`, `ada-embeddings`, `ada-moderation`, `ada-fallback`).
- **Authentication**: Cookie-based sessions (express-session + connect-pg-simple), bcrypt password hashing, 12h rolling sessions, resolveSession/requireAuth/requireRole middleware. 4 demo users (Aisha, Khalid, Raj, Admin). Auth schema in `auth` Postgres schema.
- **User identification**: Session cookie maps to `auth.users.persona` column (e.g., 'user-aisha') used as `userId` throughout the app.
- **Default tenant**: `bank_demo_uae`.
- **SSE event types**: `text`, `widget`, `simulator`, `suggested_questions`, `thinking`, `done`, `error`.
- **Verbose/Thinking Mode**: User-toggleable feature to visualize the AI's reasoning pipeline.
- **Execution routing**: Configurable per tenant.
- **Provider config**: Configurable via environment variables or tenant database settings.
- **Policy engine tool profiles**: Defined in tenant config.
- **Pipeline Interval Env Vars**: Configurable intervals for pipeline stages.

## Analytics (PostHog)
Ada uses PostHog as its third-party analytics platform for session replay, product funnels, retention analysis, and LLM analytics.

**Module**: `src/lib/analytics/` (6 files)
- `posthog.ts`: SDK initialization with banking-grade privacy config, `before_send` PII safety net
- `privacy.ts`: PII denylist (PII_KEYS), regex patterns (UUID, IBAN, account numbers), sanitizeProperties(), DEMO_PERSONAS identity map
- `events.ts`: Event name constants (typed enum)
- `types.ts`: TypeScript interfaces for events and UseAnalytics hook
- `useAnalytics.ts`: React hook — track(), identify(), reset(), setScreen(), getSessionId(). Enriches events with ada_session_id, ada_screen, ada_client_timestamp, ada_environment
- `index.ts`: Barrel re-exports

**Environment Variables** (Replit secrets):
- `VITE_POSTHOG_KEY`: PostHog project API key
- `VITE_POSTHOG_HOST`: PostHog host URL (e.g. `https://eu.i.posthog.com`)
- App runs gracefully as no-op when these are not set

**PII Safety**: Two layers — hook sanitizeProperties() for manual events + PostHog before_send for autocaptured events. All session replay text/inputs masked globally.

**Identity**: Synthetic demo IDs mapped to personas (demo_aisha_01, demo_khalid_01, demo_raj_01, demo_admin_01). identify() called after login, reset() on logout.

**Instrumented Events (P0)**: login_viewed, login_submitted, login_succeeded, login_failed, tab_view, tab_switch, app_foreground, app_background, chat_opened, chat_message_sent, chat_stream_started, chat_stream_completed, chat_stream_interrupted, chat_error, portfolio_view, discover_card_tap, discover_card_dismiss

## External Dependencies
- **OpenAI**: AI capabilities via Replit AI Integrations.
- **Anthropic**: Fallback AI provider via Replit AI Integrations.
- **PostHog**: Third-party product analytics, session replay, and feature flags (posthog-js SDK).
- **Finnhub**: Primary provider for live market data, company profiles, and news.
- **Yahoo Finance**: Secondary provider for market data and news.
- **FRED**: Federal Reserve Economic Data for macro indicators.
- **SEC EDGAR**: For company filings and XBRL financial facts.
- **OpenFIGI**: For instrument identifier resolution.
- **Frankfurter**: For ECB reference FX rates.
- **CBUAE**: For UAE Central Bank AED exchange rates.
- **PostgreSQL**: Primary database.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Frontend styling.
- **TanStack Query**: Frontend data fetching and caching.
- **Zod**: Runtime schema validation.
- **Framer Motion**: Frontend animations.
- **ESLint & Prettier**: Code linting and formatting.