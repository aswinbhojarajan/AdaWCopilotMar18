# Ada — AI Wealth Copilot

## Overview
Ada is a mobile-first AI wealth management copilot prototype designed for GCC HNW investors. It is a full-stack application providing a comprehensive financial assistant with capabilities for portfolio analysis, goal tracking, market insights, personalized recommendations, execution guardrails with RM handoff, multi-tenant support, and full agent observability. The project aims to deliver an LLM-powered AI chat built on a production-grade agent architecture.

## User Preferences
Not specified.

## System Architecture
Ada is built on a full-stack architecture comprising a React frontend, an Express/TypeScript backend, and a PostgreSQL database.

**Frontend (React 18 + TypeScript):**
- **UI/UX**: Mobile-first design (max 430px) using Tailwind CSS v4, custom fonts (Crimson Pro, DM Sans, RL Limo), and responsive units (dvh, safe area insets, rem font sizes, 48px minimum touch targets). Design tokens are centralized.
- **State Management & Data Fetching**: Utilizes TanStack Query v5.
- **Navigation**: Features a LoginPage with dev persona picker, leading to Home, Wealth, Discover, and Collective tabs with `useState`-based routing.
- **Chat Features**: Incorporates SSE streaming for real-time text, embedded data widgets (charts, summaries, goals), interactive scenario simulators, dynamic suggested questions, and context passing.
- **Animations**: Uses AnimatePresence for transitions and Framer Motion for indicators.

**Backend (Express + TypeScript):**
- **API**: Provides 34 RESTful endpoints, including 2 SSE streams.
- **Agent Orchestrator**: The core service managing the AI chat pipeline, handling PII detection, session hydration, intent classification, policy evaluation, model routing, RAG, prompt assembly, memory, LLM interaction, multi-turn tool execution, wealth engine, guardrails, response building, SSE streaming, trace logging, and memory persistence.
- **Key Services**: Includes services for policy evaluation (`policyEngine`), multi-model routing (`modelRouter`), prompt assembly (`promptBuilder`), Zod-validated response construction (`responseBuilder`), agent tracing (`traceLogger`), post-response sanitization (`guardrails`), deterministic financial calculations (`wealthEngine`), declarative tool management (`toolRegistry`), execution request routing (`rmHandoffService`), OpenAI client integration (`aiService`), LLM-based intent classification (`intentClassifier`) with context-aware follow-ups, portfolio context building (`ragService`), three-tier memory management (`memoryService`), PII detection (`piiDetector`), goal health scoring (`goalService`), and AI daily briefings (`morningSentinelService`).
- **ErrorBoundary**: React class component for user-friendly error handling.
- **Repositories**: Organized into 6 repositories: user, portfolio, content, chat, poll, agent.
- **Provider Pattern**: Employs 7 external data providers (Stock/Market, News, Macro/Economic, Company Filings, Instrument Lookup, FX Rates, Regional FX) with a priority chain (primary, secondary, mock fallback), in-memory cache, rate limiting, health tracking, and automatic failover. Tools are mapped to specific providers.
- **Capability Registry**: Maps 4 provider aliases (ada-classifier, ada-fast, ada-reason, ada-fallback) to LLM capabilities, cost tiers, context limits, temperature settings, and tool round limits, enabling intelligent model selection and routing.
- **LLM Resilience & Fallback**: Implements streaming timeout/retry with `AbortController`, automatic model downgrades (Lane 2 to Lane 1), and fallback to Anthropic Claude via Replit AI Integrations when OpenAI fails, including adapter for message format conversion.
- **Execution Guardrails & RM Handoff**: Ada cannot execute trades; this is enforced at multiple layers (system prompt, guardrail regex, orchestrator fallback). Execution requests are routed to RM via `advisor_action_queue`, webhook, or rejected based on tenant configuration.
- **Shared Schemas**: Zod schemas for core agent types are defined for validation.

**Discover Pipeline (Phase 1 + Phase 2):**
- **Content Pipeline**: Automated 7-stage pipeline (Ingest → Enrich → Cluster → Synthesize → Ada View → Event Calendar → Materialize) running on `setInterval` timers with concurrency guards.
- **Ingest**: Fetches news from Finnhub every 10 minutes, extracts tickers and regions, stores in `raw_articles`.
- **Enrich**: Classifies articles against 12-category taxonomy (equities, fixed_income, crypto, etc.), computes sentiment and importance scores, deduplicates via MD5 hash.
- **Cluster**: Groups related articles using Jaccard similarity on feature sets (tickers, taxonomy, regions, keywords). Uses deterministic fingerprinting to prevent duplicate clusters.
- **Synthesize**: Uses LLM (gpt-4o-mini via `resilientCompletion`) to generate discover cards from article clusters. Maps to card types (portfolio_impact, trend_brief, market_pulse) with CTAs from templates.
- **Ada View** (Phase 2): Weekly editorial synthesis from top discover cards. LLM generates "Ada's View" card tying week's themes together. Runs every 6 hours, deduplicates via 5-day window. File: `adaViewWorker.ts`.
- **Event Calendar** (Phase 2): Fetches Finnhub earnings calendar, filters for user holdings + major GCC-relevant symbols, groups by week, creates event_calendar cards. Highlights portfolio holdings with ★ marker. File: `eventCalendarWorker.ts`.
- **Materialize**: Deactivates expired and low-confidence cards, maintains feed health. Phase 2 adds per-user feed materialization with weighted scoring (30% portfolio relevance, 20% allocation gap, 15% suitability, 10% geo, 10% importance, 10% freshness, 5% novelty) and LLM personalized overlays for top-3 For You cards.
- **Card Types**: portfolio_impact, trend_brief, market_pulse, explainer, wealth_planning, allocation_gap, event_calendar, ada_view, product_opportunity, morning_briefing, milestone.
- **Pipeline Files**: `server/services/discoverPipeline/` — ingestWorker.ts, enrichmentWorker.ts, clusteringWorker.ts, synthesisWorker.ts, adaViewWorker.ts, eventCalendarWorker.ts, morningBriefingWorker.ts, milestoneWorker.ts, expiryWorker.ts, feedMaterializer.ts, userProfileEnricher.ts, index.ts.
- **Pipeline Timers**: Ingest: 10min, Cluster+Synth: 15min, Materialize: 60min, Editorial (Ada View + Event Calendar): 6hr, Expiry: 4hr, Morning/Milestone: 6hr.
- **Health Endpoint**: `GET /api/discover/health` — returns pipeline status, last run times, card stats (by type, tab, confidence), article and cluster stats.
- **Discover Tab**: Two sub-tabs: "For You" (personalized, scored) and "What's New" (chronological). Reads from `user_discover_feed` cache first, falls back to live query.
- **UI Enhancements**: ContentCard supports `whyYouAreSeeingThis`, expandable `supportingArticles`, `intentBadge`, `cardType`, `freshnessLabel`, `isNew` badge, `personalizedOverlay`, dismiss/feedback flow, enriched chat context handoff.

**Discover Phase 2 — Personalization & Interactions:**
- **User Segments**: 3 segments (Conservative GCC, Balanced GCC, Aggressive Global) with custom scoring weights. Assigned to user_profiles.
- **Scoring Engine**: Deterministic weighted scoring per user segment. Guardrails enforce diversity (max 2 per asset class, max 1 per theme in top 5, min 1 GCC card).
- **LLM Personalized Overlays**: Top 3 For You cards get GPT-generated personalized insight connecting the card to the user's portfolio.
- **Pre-computed Feeds**: `user_discover_feed` table caches scored/ranked cards per user, refreshed every materialization cycle.
- **Interaction Tracking**: `POST /api/discover/interact` (fire-and-forget), `POST /api/discover/visit` for last-visit timestamp. Dismissed cards filtered from feed.
- **Card Dismiss + Feedback**: X button on cards opens feedback modal with 4 preset reasons. Both dismiss and feedback recorded.
- **"New" Badge**: Cards created after user's last visit get a burgundy "NEW" badge.
- **CTA Personalization**: Feed materializer fills CTA template variables ({USER_NAME}, {RISK_TOLERANCE}, {GEO_FOCUS}, {TOP_ASSETS}, {ALLOCATION_GAPS}, {INTERESTS}) with user profile values; persisted in `personalized_ctas` column.
- **Enriched Chat Context**: CTA taps pass `DiscoverCardContext` (card_id, card_type, card_summary, why_seen, entities, evidence_facts, cta_family) to chat. promptBuilder incorporates card context including evidence facts into system prompt.
- **New Tables**: `user_segments`, `user_discover_feed`, `user_content_interactions`, `user_discover_visits`.
- **New Files**: `adaViewWorker.ts`, `eventCalendarWorker.ts`, `userProfileEnricher.ts`.

**Discover Phase 3 — Scale, Engagement & Premium Features:**
- **Product Opportunity Cards**: Editorial seed cards for investment products (sukuk, PE co-investments) with Screen/Advisor CTA families and suitability metadata. card_type: `product_opportunity`.
- **Engagement Re-ranking**: After deterministic scoring, engagement signals from user interactions (last 14 days) adjust card scores: +10% boost per shared tag with tapped/clicked cards, -20% penalty per shared tag with dismissed cards. Capped at 3 boosts and 2 penalties.
- **Morning Briefing Card**: Daily LLM-synthesized morning brief from overnight discover cards. Positioned at #1 in For You feed with priority 95. Auto-deactivates previous briefings. 16-hour expiry. File: `morningBriefingWorker.ts`.
- **Milestone Cards**: Monitors portfolio snapshots for value threshold crossings ($25K–$1M) and strong daily performance (>2%). Generates celebratory cards with Review/Advisor CTAs. Prevents duplicate milestones via card ID convention. File: `milestoneWorker.ts`.
- **Event-Driven Refresh**: Portfolio-mutating endpoints (create goal, create account) trigger immediate feed materialization bypass of hourly schedule. Fire-and-forget via `triggerEventDrivenRefresh()`.
- **Pipeline Health Endpoint**: `GET /api/discover/health` — comprehensive stats: card counts by type/tab/confidence, average source count, feed freshness, article and cluster pipeline stats.
- **Expiry Enforcement**: Per-card-type maximum age rules (market_pulse: 24h, trend_brief: 48h, explainer: 30d, etc.). Archives old articles >14 days and synthesized clusters >14 days. Compacts impression/view interaction logs >30 days. Runs every 4 hours. File: `expiryWorker.ts`.

**Database (PostgreSQL):**
- Contains 39 tables for core app data, agent architecture components, discover pipeline, and execution routing.
- Includes 3 seeded personas with full financial data parity plus user_profiles for personalization metadata.
- Stores 40 instruments, market quotes, news items, 6 editorial discover cards, CTA templates, and 1 tenant configuration.
- **New tables (Phase 1)**: `raw_articles`, `article_enrichment`, `article_clusters`, `discover_cards`, `cta_templates`, `user_profiles`.

**Key Configuration:**
- **MODEL**: 4-tier model stack using provider aliases: `ada-classifier` (gpt-4.1-nano), `ada-fast` (gpt-4.1-mini), `ada-reason` (gpt-4.1), with `ada-fallback` (claude-sonnet-4-6) for resilience.
- **User switching**: Supported via `X-User-ID` header and `PersonaPicker`, ensuring data isolation.
- **Default tenant**: `bank_demo_uae`.
- **SSE event types**: `text`, `widget`, `simulator`, `suggested_questions`, `thinking`, `done`, `error`.
- **Verbose/Thinking Mode**: User-toggleable feature to visualize the AI's reasoning pipeline in real-time via `thinking` SSE events, displayed in a `LiveThinkingBar` and `ThinkingPanel`.
- **Execution routing**: Configurable per tenant, defaults to `rm_handoff`.
- **Provider config**: Configurable via environment variables or tenant database settings.
- **Policy engine tool profiles**: Defined in tenant config, mapping to tools via `toolRegistry.ts`.
- **Adding a new tool**: Streamlined process by creating a `ToolManifest` entry in `toolRegistry.ts`.

## External Dependencies
- **OpenAI**: AI capabilities (gpt-4.1-nano, gpt-4.1-mini, gpt-4.1) via Replit AI Integrations.
- **Anthropic**: Fallback AI provider (claude-sonnet-4-6) via Replit AI Integrations.
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