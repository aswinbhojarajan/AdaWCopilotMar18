# Changelog — Ada AI Wealth Copilot

All notable changes to the Ada AI Wealth Copilot project are documented below, organized by task.

---

## Project Task #11 — Pipeline Scheduler Hardening & Configurability
**Date:** March 29, 2026

### Fixed
- **Startup timestamp recording** — The partial-run startup path (when live cards already exist) now records `lastRunTimes` for `ada_view`, `event_calendar`, `morning_briefing`, `milestone`, and `materialization` immediately after each stage completes. Previously these remained `null` until the first recurring interval fired, causing the health endpoint to show `null` for `lastRunTimes` and `pipelineLag` values after startup.

### Changed
- **Env-configurable pipeline intervals** — All 6 `setInterval` job intervals replaced from hardcoded `*_INTERVAL_MS` constants with environment-variable-configurable system. Each job reads from a `PIPELINE_*_INTERVAL_MIN` env var (in minutes) with sensible defaults matching previous hardcoded values:
  - `PIPELINE_INGEST_INTERVAL_MIN` (default 10)
  - `PIPELINE_CLUSTER_INTERVAL_MIN` (default 15)
  - `PIPELINE_MATERIALIZE_INTERVAL_MIN` (default 60)
  - `PIPELINE_EDITORIAL_INTERVAL_MIN` (default 360)
  - `PIPELINE_EXPIRY_INTERVAL_MIN` (default 240)
  - `PIPELINE_MORNING_INTERVAL_MIN` (default 360)
- **Health endpoint `configuredIntervals`** — `GET /api/discover/health` response now includes a `configuredIntervals` object showing the resolved interval (in minutes) for each job (`ingest`, `cluster`, `materialize`, `editorial`, `expiry`, `morning`).
- **Dynamic startup log** — The pipeline scheduled log now prints resolved interval values dynamically and flags any that were overridden from defaults with `(override)`.

### Validated
- TypeScript compiles clean (`npm run typecheck` passes)
- All 6 `setInterval` calls use resolved intervals
- Health endpoint includes `configuredIntervals` in response
- Startup log dynamically reflects configured intervals

---

## Project Task #10 — GPT-5.4 Beta Config & Registry Upgrade
**Date:** March 29, 2026

### Changed
- **Named Config Rename** — `ModelConfigName` changed from `'production' | 'rollback'` to `'beta' | 'rollback'`. Default config resolution now returns `'beta'` instead of `'production'`. `MODEL_CONFIG` env var accepts `beta` or `rollback`.
- **Beta Config: GPT-5.4 Family** — `beta` config uses GPT-5.4 models: `ada-classifier` → gpt-5.4-nano, `ada-fast` → gpt-5.4-mini, `ada-content` → gpt-5.4-mini, `ada-reason` → gpt-5.4. `ada-fallback` remains claude-sonnet-4-6.
- **Rollback Config Retained** — `rollback` config retains GPT-4.1 family (gpt-4.1-nano, gpt-4.1-mini, gpt-4.1) for instant recovery via `MODEL_CONFIG=rollback`.
- **`moderationService.ts` Registry Integration** — Replaced hardcoded `const MODERATION_MODEL = 'omni-moderation-latest'` with `resolveModel('ada-moderation')` from `modelRouter.ts`. Model is now resolved dynamically from the capability registry, respecting named config and env var overrides.
- **`modelRouter.ts` ProviderAlias Expanded** — `ProviderAlias` type extended from 5 to 7 members. `PROVIDER_MODEL_MAP` and `FALLBACK_CHAIN` updated with `ada-embeddings` and `ada-moderation` entries (both with `null` fallback chain).

### Added
- **`ada-embeddings` Alias** — Registry alias for `text-embedding-3-small` in both `beta` and `rollback` configs. Env var override: `ADA_MODEL_EMBEDDINGS`. No consumer implementation yet (semantic search out of scope).
- **`ada-moderation` Alias** — Registry alias for `omni-moderation-latest` in both `beta` and `rollback` configs. Env var override: `ADA_MODEL_MODERATION`. Consumed by `moderationService.ts`.

### Validated
- TypeScript compiles clean (`npm run typecheck` passes)
- Application starts with `[CapabilityRegistry] Active config: beta` and logs all 7 aliases with `source: default`
- Startup model map: ada-classifier→gpt-5.4-nano, ada-fast→gpt-5.4-mini, ada-content→gpt-5.4-mini, ada-reason→gpt-5.4, ada-embeddings→text-embedding-3-small, ada-moderation→omni-moderation-latest, ada-fallback→claude-sonnet-4-6

---

## Project Task #9 — Canary Validation & Moderation API
**Date:** March 27, 2026

### Added
- **Per-Alias Model Env Var Overrides** — `capabilityRegistry.ts` supports per-alias environment variable overrides: `ADA_MODEL_CLASSIFIER`, `ADA_MODEL_FAST`, `ADA_MODEL_REASON`, `ADA_MODEL_CONTENT`, `ADA_MODEL_FALLBACK`. Resolution order: env var → named config → hardcoded default. Startup log shows source (`env-override` or `config`) for each alias.
- **OpenAI Moderation API Integration** — New `server/services/moderationService.ts` wrapping `omni-moderation-latest` model. Exposes `moderateInput(text)` and `moderateOutput(text)` returning `{ flagged, categories, scores, latencyMs, model }`. API errors are non-blocking (pass-through with `flagged: false`).
- **Pre-LLM Input Moderation** — After PII scan and tenant config hydration (before intent classification), orchestrator calls `moderateInput()` on sanitized message. Flagged inputs yield a refusal message and early return. Gated by `moderation_enabled` tenant config flag. Emits thinking event with moderation result.
- **Post-LLM Output Moderation** — LLM text is buffered during streaming (when moderation enabled). After full response assembly, `moderateOutput()` runs before guardrail post-checks. Flagged outputs are replaced with a safe fallback (original text never emitted to client). Clean responses are emitted from the buffer after moderation passes. Emits thinking event with moderation result.
- **`moderation_events` Table** — New PostgreSQL table (idempotent `CREATE TABLE IF NOT EXISTS`) with columns: id, user_id, thread_id, message_id, direction (input/output), flagged, categories JSONB, scores JSONB, action_taken, model_used, latency_ms, created_at.
- **`saveModerationEvent()` Repository Function** — Persists moderation events to `moderation_events` table (fire-and-forget, non-blocking).
- **`moderation_enabled` Tenant Config Flag** — Added to `TenantConfigSchema` in `shared/schemas/agent.ts` (default `true`). Included in `getDefaultTenantConfig()` and `getTenantConfig()` in `agentRepository.ts`. Both input and output moderation checks respect this flag.

### Validated
- TypeScript compiles clean (`npm run typecheck` passes)
- Application starts and all pipelines initialize successfully
- Capability registry logs effective model map with source at startup

---

## Project Task #8 — Configurable Model Registry & GPT-5.4 Migration
**Date:** March 27, 2026

### Added
- **Named Model Configurations** — `capabilityRegistry.ts` refactored from a single hardcoded REGISTRY to a named-config system with `production` and `rollback` configurations. `MODEL_CONFIG` environment variable selects active config at startup (default: `production`). Startup logs effective model map with alias→model→cost-tier for each of 5 aliases. Production uses GPT-4.1 family; rollback retains GPT-4.1 for one-switch recovery. GPT-5.4 migration ready — update production config models when GPT-5.4 API is available.
- **`ada-content` Provider Alias** — New dedicated alias for the Discover pipeline (synthesisWorker, adaViewWorker, morningBriefingWorker, feedMaterializer). Decouples pipeline model selection from chat (`ada-fast`), enabling independent model/cost tuning. Added to `ProviderAlias` type union, `PROVIDER_MODEL_MAP`, and `FALLBACK_CHAIN` (→ `ada-fallback`).
- **Token Tracking in Agent Traces** — `agent_traces` table extended with `prompt_tokens`, `completion_tokens`, and `provider_alias` columns (idempotent ALTER TABLE migration in schema.sql). `saveAgentTrace()` and `logAgentTrace()` accept and persist these fields. Orchestrator extracts `usage.prompt_tokens` and `usage.completion_tokens` from streaming chunks and passes to trace logger.
- **Provider Fallback Event Persistence** — New `provider_fallback_events` table (id, original_alias, fallback_alias, failure_reason, switch_cost_ms, lane, model_requested, model_served, created_at). `logProviderFallback()` now INSERTs to this table in addition to console.log (fire-and-forget, non-blocking).
- **XML Prompt Injection Defense** — `promptBuilder.ts` system prompt wrapped in `<system_instructions>` / `</system_instructions>` boundaries. User context wrapped in `<user_context>` / `</user_context>` boundaries. User messages wrapped in `<user_message>` / `</user_message>` boundaries in the orchestrator with fullwidth-character escaping of `<`/`>` in user content to prevent tag-breakout injection. Added instruction hierarchy note and explicit user-message delimiter documentation in system prompt.

### Changed
- **All Pipeline LLM Calls Use Aliases** — Replaced 5 hardcoded `gpt-4o-mini` strings in `synthesisWorker.ts` (×2), `adaViewWorker.ts`, `morningBriefingWorker.ts`, and `feedMaterializer.ts` with `resolveModel('ada-content')` and `providerAlias: 'ada-content'`.
- **`max_tokens` → `max_completion_tokens`** — All 5 pipeline LLM call sites updated from deprecated `max_tokens` to `max_completion_tokens`.
- **Fallback Logger Signature** — `logProviderFallback()` in `traceLogger.ts` now accepts optional `modelRequested` and `modelServed` fields for richer fallback diagnostics.
- **Model Config**: `production` and `rollback` configs both use GPT-4.1 family. Set `MODEL_CONFIG=rollback` for instant recovery if issues arise after a future model upgrade.
- **Stream Token Usage** — All streaming LLM calls now include `stream_options: { include_usage: true }` so OpenAI returns token usage data in the final chunk, enabling accurate cost tracking.

### Removed
- **`server/replit_integrations/`** — Deleted entire directory (chat, audio, image, batch scaffold modules with references to gpt-5.1, gpt-audio, gpt-image-1). These were not mounted in Express and caused confusion during audits.

### Validated
- TypeScript compiles clean (`npm run typecheck` passes)
- Application starts and all pipelines initialize successfully
- Capability registry logs effective model map at startup
- Zero `gpt-4o-mini` references remain in server code
- Zero `replit_integrations` references remain

---

## Project Task #5 — Discover Tab Phase 3: Scale, Engagement & Premium Features
**Date:** March 26, 2026

### Added
- **Product Opportunity Cards** — 2 editorial seed cards for investment products: sukuk fixed-income (5.8% yield) and private equity co-investment (pre-IPO tech). Both use Screen/Advisor CTA families with suitability metadata and Sharia-compliance tags. card_type: `product_opportunity`. Seed data in `seed.sql`, card type mapping in `synthesisWorker.ts`.
- **Morning Briefing Worker** (`server/services/discoverPipeline/morningBriefingWorker.ts`) — LLM-synthesized daily morning brief combining overnight discover cards with Morning Sentinel portfolio context (via `generateBriefing()` from `morningSentinelService.ts`). Generates `morning_briefing` card type, positioned at #1 in For You feed with priority 95. 16-hour expiry. Auto-deactivates previous briefings before creating new one. Runs every 6 hours with 14-hour recency guard.
- **Milestone Worker** (`server/services/discoverPipeline/milestoneWorker.ts`) — Detects three types of portfolio milestones: (1) value threshold crossings ($25K, $50K, $75K, $100K, $150K, $200K, $250K, $500K, $1M — selects highest crossed threshold via reversed array), (2) strong daily performance (>2% gain), (3) goal completion (current_amount ≥ target_amount). Generates celebratory `milestone` cards with Review/Advisor CTAs. Strict user-scoped ID convention (`disc-mile-{userId}-val-{threshold}`, `disc-mile-{userId}-perf-{date}`, `disc-mile-{userId}-goal-{slug}`) prevents duplicates. Insert count only incremented on actual DB insert (ON CONFLICT DO NOTHING).
- **Expiry Worker** (`server/services/discoverPipeline/expiryWorker.ts`) — Per-card-type maximum age rules: market_pulse 24h, trend_brief 48h, portfolio_impact 72h, allocation_gap 7d, event_calendar 14d, ada_view 7d, morning_briefing 16h, milestone 3d, product_opportunity 30d, explainer/wealth_planning 30d. Also archives raw_articles >14 days, synthesized clusters >14 days, and compacts impression/view interaction logs >30 days. Runs every 4 hours.
- **CTA Templates** — Added `cta_templates` rows for `morning_briefing` ("Walk me through today's outlook" / explain, "How does this affect my portfolio?" / impact) and `milestone` ("Review my journey so far" / explain, "Schedule a review with my advisor" / advisor) card types in `seed.sql`.
- **Per-User Feed Materialization** (`runFeedMaterializerForUser()` in `feedMaterializer.ts`) — New function that materializes feed for a single user, used by event-driven refresh to avoid re-materializing all users.
- **Schema Constraint Migration** (`migrateCardTypeConstraint()` in `index.ts`) — Idempotent ALTER TABLE migration that drops and recreates the `discover_cards.card_type` CHECK constraint to include `morning_briefing` and `milestone` types. Runs on pipeline init before first cycle.

### Changed
- **Engagement Re-ranking** (`feedMaterializer.ts`) — After deterministic scoring, engagement signals from taxonomy_tags (asset_classes, themes, geographies, wealth_topics) adjust card scores via `applyEngagementRerank()`: +10% boost per shared theme with tapped/clicked cards (last 14 days, capped at 3), -20% penalty per shared theme with dismissed cards (capped at 2). Added segment-based collaborative filtering: peers in the same `user_segments` segment contribute a +5% boost for themes tapped by ≥2 segment peers (capped at 3). Signals fetched via `fetchEngagementSignals()` with optional `segmentId` parameter. Peer users found via `fetchSegmentPeers()` join on `user_profiles.segment_id`.
- **Morning Briefing Pinning** (`materializeUserFeed()` in `feedMaterializer.ts`) — Morning briefing card extracted before engagement reranking, then prepended at position 1 in For You feed. Remaining cards sliced to `FOR_YOU_COUNT.max - 1` to maintain feed size.
- **Milestone User Scoping** (`materializeUserFeed()` in `feedMaterializer.ts`) — Milestone cards filtered with strict `startsWith('disc-mile-{userId}-')` pattern matching to prevent cross-user exposure via substring collision.
- **Event-Driven Per-User Refresh** (`triggerEventDrivenRefresh()` in `index.ts`) — Now accepts optional `userId` parameter. When provided, calls `runFeedMaterializerForUser(userId)` instead of full `runFeedMaterializer()`. API routes (`POST /wealth/goals`, `POST /wealth/accounts`) pass the requesting user's ID.
- **Pipeline Health Endpoint** (`getDiscoverPipelineHealth()` in `index.ts`) — Extended with two new sections: (1) `pipelineLag` — minutes since each pipeline stage last ran (ingest, enrichment, clustering, synthesis, materialization, ada_view, event_calendar, morning_briefing, milestone, expiry); (2) `feedFreshness` — total user feeds count, median feed age in hours (via `PERCENTILE_CONT`), oldest feed age in hours. Also fixed inverted oldest/newest card freshness (MIN/MAX aliases were swapped).
- **Health Stats SQL** — Corrected `newest_h` to use `MAX(created_at)` and `oldest_h` to use `MIN(created_at)` (were previously swapped).
- **Pipeline Timers** (`index.ts`) — Morning briefing and milestone workers wired with 6-hour interval timers alongside existing workers. Expiry worker runs on 4-hour interval.
- **`schema.sql`** — `discover_cards.card_type` CHECK constraint updated to include `morning_briefing` and `milestone`.

### Validated
- TypeScript compiles clean (`npm run typecheck` passes)
- Health endpoint returns 36 active cards including `morning_briefing` (1), `milestone` (3), `product_opportunity` (2) types
- Morning briefing card pinned at position 1 in For You feed
- Milestone cards correctly user-scoped (only owner's milestones visible in their feed)
- Pipeline health endpoint returns `pipelineLag` and `feedFreshness` metrics
- Event-driven per-user refresh triggers on goal/account creation

---

## Project Task #4 — Discover Tab Uplift Phase 2: Personalization, Interactions & Ada View
**Date:** March 25, 2026

### Added
- **User Segments** (`user_segments` table) — 3 segments (Conservative GCC, Balanced GCC, Aggressive Global) with custom scoring weights for portfolio relevance, gap relevance, suitability, geography, freshness, and novelty. Assigned to `user_profiles.segment_id` on startup.
- **Portfolio-Aware Scoring Engine** (`feedMaterializer.ts`) — Full deterministic weighted scoring: 30% portfolio relevance (ticker/sector/asset class overlap), 20% allocation gap relevance (delta between target and actual), 15% suitability, 10% geographic relevance, 10% market importance, 10% freshness (exponential decay), 5% novelty bonus. Guardrails enforce diversity (max 2 per asset class, max 1 per theme in top 5, min 1 GCC card).
- **LLM Personalized Overlays** — Top 3 For You cards receive GPT-generated personalized insight connecting card to user's portfolio. `personalized_overlay` and `why_you_are_seeing_this` generated per card per user.
- **CTA Personalization** — CTA template variables ({USER_NAME}, {RISK_TOLERANCE}, {GEO_FOCUS}, {TOP_ASSETS}, {ALLOCATION_GAPS}, {INTERESTS}) filled with user profile values; persisted in `personalized_ctas` column of `user_discover_feed`.
- **Pre-Computed User Feeds** (`user_discover_feed` table) — Per-user per-tab cached scored/ranked cards. API reads from cache first, falls back to live query. Refreshed every materialization cycle.
- **Interaction Tracking** — `user_content_interactions` table and `POST /api/discover/interact` endpoint (fire-and-forget 202 response). Tracks impressions, views, clicks, CTA taps, expands, dismisses, feedback, shares.
- **Card Dismiss + Feedback UI** — X button on ContentCard opens feedback modal with 4 preset reasons ("Not relevant", "Already know this", "Too complex", "Too basic"). Dismissed cards filtered from future feeds.
- **Ada View Worker** (`adaViewWorker.ts`) — Weekly editorial synthesis from top discover cards. LLM generates "Ada's View" card tying the week's themes together. Runs every 6 hours, deduplicates via 5-day window. card_type: `ada_view`.
- **Event Calendar Worker** (`eventCalendarWorker.ts`) — Fetches Finnhub earnings calendar, filters for user holdings + major GCC-relevant symbols, groups by week, creates `event_calendar` cards. Highlights portfolio holdings with ★ marker.
- **User Discover Visits** (`user_discover_visits` table, `POST /api/discover/visit`) — Tracks last Discover tab visit timestamp per user.
- **"New" Badge** — Cards created after user's last visit get a burgundy "NEW" badge.
- **Enriched Chat Context Handoff** — CTA taps pass `DiscoverCardContext` (card_id, card_type, card_summary, why_seen, entities, evidence_facts, cta_family) to chat. `promptBuilder` incorporates card context including evidence facts into system prompt.
- **New Tables**: `user_segments`, `user_discover_feed`, `user_content_interactions`, `user_discover_visits`.

### Changed
- **ContentCard UI** — Added `whyYouAreSeeingThis`, expandable `supportingArticles`, `intentBadge`, `cardType`, `freshnessLabel`, `isNew` badge, `personalizedOverlay`, dismiss/feedback flow.
- **Discover API** — Now reads from `user_discover_feed` cache first, falls back to live scoring query.
- **7 card types active** — Added `ada_view` and `event_calendar` to Phase 1's 5 types.

### Validated
- TypeScript compiles clean
- Per-user personalized feeds with distinct scores and overlays for each persona
- Ada View and Event Calendar cards appearing in both tabs
- Dismiss flow properly removes cards from future feeds

---

## Project Task #3 — Discover Tab Uplift Phase 1: Foundation & Live Content Pipeline
**Date:** March 25, 2026

### Added
- **Automated 7-Stage Content Pipeline** (`server/services/discoverPipeline/`) — Ingest → Enrich → Cluster → Synthesize → Ada View → Event Calendar → Materialize, running on `setInterval` timers with concurrency guards. Orchestrated by `index.ts`.
- **Ingest Worker** (`ingestWorker.ts`) — Fetches Finnhub market news every 10 minutes, extracts tickers and regions, normalizes into `raw_articles` with dedup on `external_id`.
- **Enrichment Worker** (`enrichmentWorker.ts`) — Classifies articles against 12-category keyword taxonomy (equities, fixed_income, crypto, gcc_markets, etc.), computes sentiment and importance scores, deduplicates via MD5 hash. GCC-specific keyword detection (Tadawul, DFM, Sukuk, etc.).
- **Clustering Worker** (`clusteringWorker.ts`) — Groups related enriched articles (last 48h) using Jaccard similarity (0.25 threshold) on feature sets (tickers, taxonomy, keywords). Deterministic fingerprinting prevents duplicate clusters.
- **Synthesis Worker** (`synthesisWorker.ts`) — Uses LLM (gpt-4o-mini via `resilientCompletion`) to generate discover cards from article clusters. Maps to card types (`portfolio_impact`, `trend_brief`, `market_pulse`) with CTAs from templates. Standalone high-importance articles polished into `market_pulse` cards.
- **Feed Materializer** (`feedMaterializer.ts`) — Scores active `discover_cards` using deterministic weighted model. Applies composition guardrails (max 1 per theme in top 5, max 2 per asset class, GCC card in top 5). Produces ordered card lists for For You and What's New tabs.
- **Editorial Seed Cards** — Migrated existing Discover seed content into `discover_cards` as `wealth_planning` and `allocation_gap` card types. Added `explainer` cards (private credit, estate planning, GCC real estate).
- **User Profiles** (`user_profiles` table) — Enriched user metadata: `geo_focus`, `investment_horizon`, `income_preference`, `aum_tier`, target allocation percentages per asset class, `top_asset_classes`, `allocation_gaps`. Seeded for all 3 personas.
- **CTA Templates** (`cta_templates` table) — 8 CTA families × card type combinations from strategy doc.
- **Pipeline Health Endpoint** — `GET /api/discover/health` returns pipeline status, last run times, card stats (by type, tab, confidence), article and cluster stats.
- **New Tables**: `raw_articles`, `article_enrichment`, `article_clusters`, `discover_cards`, `cta_templates`, `user_profiles`.

### Changed
- **Discover Tab Renamed** — "What's Happening" → "What's New".
- **Discover API Refactored** — `GET /api/content/discover?tab={forYou|whatsNew}` reads from `discover_cards` instead of static `content_items`. Backward-compatible response shape.
- **ContentCard UI Upgraded** — Type-specific intent badge + topic label, "Why you're seeing this" chip (static in Phase 1), expandable accordion for Trend Brief sub-articles, real relative timestamps ("3 min ago"), source count badge from genuine cluster data.
- **5 card types active** — `portfolio_impact`, `trend_brief`, `market_pulse`, `explainer`, `wealth_planning`.
- **Pipeline Timers** — Ingest: 10min, Cluster+Synth: 15min, Materialize: 60min.

### Validated
- TypeScript compiles clean
- Live Finnhub content flowing through pipeline into Discover feed
- Card types rendering with differentiated UI treatments
- Real timestamps replacing static "2 days ago" strings

---

## Project Task #17 — Context-Aware Chat Follow-Up Handling
**Date:** March 25, 2026

### Changed
- **`intentClassifier.ts`** — `classifyIntentAsync()` now accepts optional `recentHistory` parameter (last 4 conversation turns from working memory). LLM classification prompt includes a `<recent_conversation>` block with follow-up resolution rules instructing the model to resolve ambiguous references ("do across all", "tell me more") against prior context. Added `ConversationContext` interface, `CONTINUATION_PATTERNS` array (12 patterns: "do across all", "tell me more", "what about the rest", "expand on", etc.), and `isLikelyContinuation()` heuristic (≤6 words + explicit continuation pattern match). Post-classification override: when LLM returns `general` intent for a message detected as likely continuation, inherits the prior turn's intent instead. `classifyIntentFallback()` also inherits prior intent on continuation detection.
- **`agentOrchestrator.ts`** — Before intent classification, fetches `getWorkingMemory(threadId)` and passes the last 4 user/assistant turns as `classifierHistory` to `buildIntentClassification()`.

### Behavior
- "What's the latest news on NVDA?" → `news_explain` (as before)
- "Do across all holdings" (follow-up) → `news_explain` (was: `balance_query` or `general`)
- "Tell me more" (follow-up) → inherits prior intent instead of defaulting to `general`

### Validated
- TypeScript compiles clean
- Follow-up messages correctly inherit contextual intent from prior conversation turns

---

## Project Task #16 — Intermittent UI Bug Fixes
**Date:** March 25, 2026

### Fixed
- **Morning Sentinel JSON flash** — `MorningSentinelCard.tsx` streaming text area was rendering raw JSON chunks (e.g., `{"headline":"..."}`) during SSE streaming. Replaced streaming text display with a friendly "Ada is analyzing your portfolio..." message while streaming is in progress. Final parsed content displays only after stream completion.
- **Wealth tab blank screen** — `WealthScreen.tsx` loading state was gated on all 5 parallel queries (`overviewQuery`, `goalsQuery`, `healthScoreQuery`, `lifeGapsQuery`, `alertsQuery`), causing the entire screen to show a spinner if any single query was slow or failed. Changed to gate loading only on `overviewQuery` (the critical data). Non-critical queries render independently with their own loading/error states.
- **Discover tab "something went wrong"** — `contentRepository.ts` `detail_sections` JSONB column was failing `JSON.parse()` on malformed or null values, crashing the entire Discover tab. Added `parseDetailSections()` safe JSONB parser with try/catch fallback to empty array. `useContent.ts` hook now uses `keepPreviousData: true` (via `placeholderData`) to prevent blank flashes during tab switching.

### Added
- **`ErrorBoundary` component** (`src/components/ada/ErrorBoundary.tsx`) — React class component error boundary with retry button. Wraps `WealthScreen` and `DiscoverScreen` to catch rendering crashes and display a user-friendly error message with "Try Again" instead of a white screen.

### Validated
- TypeScript compiles clean
- Morning Sentinel displays friendly loading message during streaming
- Wealth tab loads immediately when overview data is available
- Discover tab handles malformed JSONB gracefully and maintains previous data during tab switches

---

## Tasks #1–4 — UI Overhaul: Login Page, Font Loading, TopBar Removal
**Date:** March 24, 2026

### Task #1 — Login Page
#### Added
- **`LoginPage` component** (`src/components/screens/LoginPage.tsx`) — Ada-branded sign-in page replacing the Summit Bank ClientEnvironment splash. Cream background (`#efede6`), Crimson Pro/DM Sans typography, email/password form with burgundy sign-in button, collapsible "Dev Quick Access" panel with persona picker for demo use.
- **`login` view type** added to `ViewType` in `src/types/index.ts`.

#### Changed
- **`App.tsx`** — Default `currentView` changed from `'client-environment'` to `'login'`. Header close button navigates to `'login'` instead of `'client-environment'`.

### Task #2 — Login Heading Update
#### Changed
- **`LoginPage.tsx`** — Removed circular burgundy Ada icon above heading. Split heading into "Welcome to" (Crimson Pro Regular 22px) on one line and AdaLogo SVG (~130×52px) on its own line. Updated subtitle from "Your AI wealth copilot" to "Your modern wealth intelligence platform".

### Task #3 — Font Loading & Typography Fix
#### Added
- **Google Fonts** — Crimson Pro (weights 200, 300, 400, 600) and DM Sans (weights 300, 400, 500, 600, 700) loaded via `<link>` in `index.html` with preconnect.
- **TypeKit** — RL Limo loaded via `<link rel="stylesheet" href="https://use.typekit.net/yua2ikn.css">` in `index.html`.

#### Changed
- **~50 component files** — Replaced all Figma-style `:Weight` suffix font references with valid CSS font names and separate Tailwind weight classes:
  - `font-['DM_Sans:Regular',sans-serif]` → `font-['DM_Sans',sans-serif]`
  - `font-['DM_Sans:SemiBold',sans-serif]` → `font-['DM_Sans',sans-serif] font-semibold`
  - `font-['Crimson_Pro:ExtraLight',sans-serif]` → `font-['Crimson_Pro',sans-serif] font-extralight`
  - `font-['RL_Limo:Regular',sans-serif]` → `font-['rl-limo',sans-serif]`
  - (and all other weight variants)
- **`Navigation.tsx`** — Fixed dynamic template literal font construction that embedded weight into font name.
- **`TopBar.tsx`** — Replaced SF_Pro_Text:Semibold with DM Sans + font-semibold.
- **`src/styles/design-tokens.css`** — Updated CSS variables to use real font-family names (`'Crimson Pro'`, `'DM Sans'`, `'rl-limo'`).

### Task #4 — Remove TopBar
#### Removed
- **`src/components/ada/TopBar.tsx`** — Deleted fake mobile status bar component (static "9:41" time, signal, wifi, battery icons).
- **TopBar export** removed from `src/components/ada/index.ts`.
- **`<TopBar />` usage** removed from `App.tsx`, `ChatScreen.tsx`, `HomeEmptyScreen.tsx`, `ChatHistoryScreen.tsx`, `NotificationsScreen.tsx`.

#### Changed
- **All post-login screens** — Added `pt-[16px]` top padding to header containers to replace the space previously occupied by TopBar.

### Validated (all tasks)
- TypeScript compiles clean
- Fonts render correctly across all screens (Crimson Pro for headings, DM Sans for body, RL Limo for brand elements)
- No layout gaps or shifts from TopBar removal

---

## Task #17 — Live Thinking Panel During Streaming
**Date:** March 23, 2026

### Added
- **`LiveThinkingBar` component** (`src/components/ada/ThinkingPanel.tsx`) — fixed bar rendered below the chat header during SSE streaming when verbose mode is enabled. Progressive step reveal with 120ms stagger animation, amber pulsing dot indicator, and step counter (e.g., "Step 3 of 5"). Renders only when `verbose && isTyping && thinkingSteps.length > 0`
- **Server-side `setImmediate()` async ticks** in `agentOrchestrator.ts` — inserted at 4 key pipeline boundaries (after early thinking buffer, after routing decision, before Lane 0 content dispatch, before data prefetch) to break the Node.js event loop and allow `thinking` SSE events to flush as separate network chunks before content events
- **Typed `flush()` call** in `server/routes/api.ts` — after each `thinking` event write, calls `flush()` on the response stream (typed as `NodeJS.WritableStream & { flush?: () => void }`) to push thinking events through any compression/buffering middleware

### Changed
- **`ChatScreen.tsx`** — integrated `LiveThinkingBar` in a fixed position between the chat header and scrollable message area. ThinkingPanel summary now renders only after stream completion (`!isTyping`) instead of during streaming
- **`ThinkingPanel.tsx`** — removed redundant reset effect (was `!isStreaming && !visible` guard) since the component unmounts when verbose is toggled off via parent condition

### Behavior
- **During streaming**: LiveThinkingBar shows progressive pipeline steps (Privacy Scan → Understanding Query → Policy Check → ...) with animation
- **After streaming**: LiveThinkingBar disappears; collapsible ThinkingPanel summary appears above the assistant message
- **Toggle OFF mid-stream**: Hides all thinking UI immediately but thinking event accumulation continues
- **Toggle ON mid-stream**: Restores visibility with all previously accumulated steps intact
- **Steps cleared**: Only at the start of the next `sendAndReceive` call, not on toggle changes

### Validated
- TypeScript compiles clean
- Thinking events arrive as separate SSE chunks before content events
- LiveThinkingBar hides when streaming completes; ThinkingPanel summary persists
- Toggle persistence and edge cases verified

---

## Task #16 — AI Orchestration Hardening (Capability Registry, Fallback Provider, Verbose Mode)
**Date:** March 23, 2026

### Added
- **Capability Registry** (`server/services/capabilityRegistry.ts`) — unified registry with three layers: (1) model capabilities mapping provider aliases (ada-fast, ada-reason, ada-fallback) to capability sets, cost tiers, and context windows; (2) lane configurations (Lane 0/1/2 → label, description, provider, tools); (3) intent→route mappings (intent → default lane, supported lanes, required/optional tools). `getClassifierContext()` generates condensed routing metadata injected into the classifier prompt
- **Fallback LLM Provider** — Anthropic Claude (claude-sonnet-4-6) via Replit AI Integrations as automatic fallback when OpenAI primary fails. `openaiClient.ts` exports both OpenAI and Anthropic clients. Adapter functions convert OpenAI message format to Anthropic messages API and responses back to OpenAI format. Fallback chain: ada-fast → ada-fallback, ada-reason → ada-fallback
- **Resilient LLM helpers** (`server/services/openaiClient.ts`) — `resilientCompletion()` with configurable timeout + retry + Anthropic fallback for non-streaming calls, and `resilientStreamCompletion()` with timeout + Anthropic fallback for streaming calls. Applied to all core LLM call sites: intentClassifier, aiService, morningSentinelService, agentOrchestrator
- **Verbose/Thinking Mode — Backend** — new `thinking` SSE event type added to `StreamEvent` union with `step` and `detail` fields. `verbose?: boolean` field added to `ChatMessageRequest`. When enabled, the orchestrator yields `thinking` events at 9 pipeline steps: PII scan, intent classification, policy evaluation, routing, lane dispatch/upgrade, model selection, data prefetch, LLM generation, LLM retry/fallback, and guardrails. Early thinking events buffered until tenant config is loaded for proper verbose_mode gating
- **Verbose/Thinking Mode — Frontend** — `ThinkingPanel` component renders above assistant response during streaming and persists as collapsed summary after completion. "Think" toggle in chat header with localStorage persistence. Tenant-level `verbose_mode` feature flag (default: false)

### Changed
- **Agent orchestrator** — integrated capability registry, buffered early thinking events until tenant config loaded, passes `providerAlias` to prompt builder
- **Intent classifier** — prompt dynamically built with `buildClassificationPrompt()` injecting routing context from capability registry
- **Prompt builder** — new capability context block injecting model info, context window, and reasoning mode from capability registry
- **Model router** — added `ada-fallback` provider alias, `getFallbackAlias()` function, fallback chain definition
- **All LLM call sites** — replaced direct `openai.chat.completions.create` with `resilientCompletion`/`resilientStreamCompletion` in intentClassifier, morningSentinelService (streaming + non-streaming), aiService (generation, streaming, follow-up, suggestions)

### Validated
- TypeScript compiles clean
- All existing SSE event types continue to work
- Thinking mode toggle persists across sessions via localStorage
- Anthropic fallback activates when OpenAI primary fails retries

---

## Task #15 — Documentation Audit & LLM Resilience Fix
**Date:** March 23, 2026

### Fixed
- **LLM streaming timeout causes user-facing error** — when both Lane 2 streaming attempts timed out (15s + 20s), the system returned "I'm having trouble processing that right now" with no fallback. Added Lane 2 → Lane 1 automatic downgrade: if both reasoning-model attempts fail, the orchestrator re-routes the request to the fast model (ada-fast, lower max_tokens) for a degraded-but-functional response

### Changed
- **Documentation audit** — updated CHANGELOG.md, PRD.md (Section 9 architecture, Section 12 change log), ISSUES.md (added ISS-022), and replit.md to reflect Task #13 and Task #14 changes

### Validated
- TypeScript compiles clean
- End-to-end chat queries return responses under degraded LLM conditions

---

## Task #14 — LLM-Based Intent Classification
**Date:** March 23, 2026

### Changed
- **Intent classifier rewritten** — replaced keyword-only `classifyIntent()` with `classifyIntentAsync()` using OpenAI LLM call (gpt-5-mini via ada-fast alias). 3-second AbortController timeout with keyword fallback on timeout/error/empty content. LLM classification returns 0.95–0.98 confidence; keyword fallback returns 0.4–0.5 confidence
- **RAG double-classification bug fixed** — added `mapIntentForRag()` helper that maps `primary_intent` back to legacy `Intent` type for RAG context fetching, preventing a second keyword classification pass
- **Goals routing rewritten** — `goals` intent now maps to `goal_progress` (deterministic Lane 0). Handler detects advice vs progress queries via keywords; advice path returns monthly contribution targets, 4 recommended actions (automate contributions, review allocation, reduce spending, consolidate debt), and RM handoff prompt
- **Tool skipping for non-financial intents** — `skipTools` flag prevents tool definitions from being sent to the LLM for `other` and `support` intents, reducing token usage and preventing tool-loop hangs
- **LLM streaming timeout + retry** — AbortController-based timeouts: attempt 1 at 15s, attempt 2 at 20s. Replaces unreliable Promise.race timer pattern
- **SSE error handling** — added try/catch around SSE streaming in `routes/api.ts` to prevent silent connection drops

### Fixed
- **Fabricated cash percentage removed** — replaced `cashPercent ?? 66` fallback with conditional that only shows cash allocation when present in trusted portfolio data
- **Holdings total return** — Lane 0 holdings narration now uses `changePercent` from tool data (fallback to `daily_change_percent`), and prompt rules prohibit inventing 0.00%
- **Multi-turn tool loop hang** — restricted tool definitions to turn 1 only (`turnCount === 1`), preventing infinite tool-calling loops

### Validated
- LLM intent classification works as primary path (~75% of requests classified by LLM with 0.95+ confidence)
- Savings queries correctly route to goal_progress with actionable advice
- TypeScript compiles clean

---

## Task #13 — Rename Abdullah to Aisha
**Date:** March 22, 2026

### Changed
- **Default persona renamed** — Abdullah Al-Rashid → Aisha Al-Rashid throughout seed data, tests, documentation, and frontend references
- **All seed SQL updated** — user record, accounts, positions, snapshots, alerts, chat threads, chat messages updated with new name
- **Parity tests updated** — test expectations changed from Abdullah to Aisha

---

## Comprehensive Data Audit — Data Integrity Fixes
**Date:** March 22, 2026

### Fixed
- **Performance history curves catastrophically broken** — unbounded cumulative random walk produced unrealistic values (Aisha min -$32K, Raj min -$895K). Replaced with normalized bounded formula: `amplitude × norm_r` where `norm_r = cum_r / GREATEST(MAX(ABS(cum_r)) OVER (), 0.0001)`. Amplitudes: Aisha ±$4K ($76K–$93K), Khalid ±$2.5K ($638K–$651K), Raj ±$12K ($150K–$184K)
- **Raj Binance balance underflow** — balance was $35,200 but crypto positions totaled $51,451.25. Raised balance to $52,000
- **NVDA transaction prices incorrect** — recent transactions showed $235/$240 (pre-split prices) causing impossible 42–44% 10-day drops. Corrected to $138/$130 (consistent with $135.40 market price)
- **7 cost_basis mismatches** — position cost_basis values did not match weighted averages of their transaction prices. Fixed: Aisha AAPL ($148.50→$150.00), MSFT ($328.20→$325.00), GLD ($186.50→$185.00), AGG ($102.30→$100.00), NVDA ($90.00→$102.67); Khalid AGG ($99.50→$100.00), GLD ($184.50→$185.00); Raj BTC ($42,500→$43,166.67), SOL ($95.20→$97.50), NVDA ($90.00→$103.33)

### Validated
- All 29 parity tests pass
- TypeScript compiles clean

---

## Task #12 — Reduce to 3 Demo Personas
**Date:** March 22, 2026

### Changed
- **Persona count reduced from 8 to 3** — retained Aisha Al-Rashid (Moderate/$93K), Khalid Al-Mansouri (Conservative/$650K), Raj Patel (Aggressive/$181K). Removed Fatima Hassan, Omar Khalil, Layla Mahmoud, Sara Al-Fahad, Nadia Khoury
- **Seed data cleaned** — removed all seed SQL for deleted personas (accounts, positions, snapshots, performance history, goals, alerts, chat threads). TRUNCATE users CASCADE + full reseed procedure
- **UserContext auto-heal** — if localStorage contains an invalid user ID (from a removed persona), the context automatically resets to `user-aisha`
- **Parity tests updated** — reduced from 70 tests (8 personas) to 29 tests (3 personas)
- **PersonaPicker** — updated to show 3 personas instead of 8

### Validated
- All 29 parity tests pass
- Persona switching works correctly for all 3 personas
- TypeScript compiles clean

---

## Task #11 — Portfolio Health Field Mismatch Fix
**Date:** March 21, 2026

### Fixed
- **`portfolioRepository.ts` field mapping error** — `diversificationScore` was mapped to the wrong database column, and `riskLevel` returned an incorrect value. Corrected field mappings so Wealth tab portfolio health summary displays accurate data

### Validated
- Portfolio health data renders correctly for all personas
- TypeScript compiles clean

---

## Task #10 — Comprehensive Data Realism & Market Alignment
**Date:** March 21, 2026

### Fixed
- **NVDA price corrected** from $250.35 to $135.40 (post-split realistic price); cost_basis updated to $90.00
- **Portfolio values cascaded** — Aisha ($93,105.94), Omar ($99,801.00), Raj ($181,327.25) reflect corrected NVDA price through positions, account balances, snapshots, goals, and alerts
- **Hardcoded sparkline replaced** — `portfolioRepository.ts` `getHomeSparkline()` now queries `performance_history` table for real 7-day data instead of returning hardcoded ~$129K values; falls back to computed synthetic data from snapshot when insufficient history exists

### Changed
- **Performance history overhauled** — all 8 personas now use deterministic hash-based compound return models (hashtext pseudo-random daily returns per asset class, weighted by actual portfolio allocation percentages, compounded via cumulative sum). No trigonometric functions. Drawdown windows for aggressive personas.
- **PRD persona table updated** — portfolio values and trait descriptions now match actual seeded data

### Validated
- All persona parity tests pass after all data changes (later reduced to 29 tests when persona count was reduced to 3)
- Allocation totals reconcile with snapshot values for all personas
- TypeScript compiles clean with no errors

---

## Task #9 — Full Persona Data Parity & Personalization
**Date:** March 21, 2026

### Added
- **Full data parity for all 8 personas** — each persona now has accounts, positions, portfolio snapshots, 365-day volatile performance history, goals, alerts, and chat threads
- **365-day performance history** with risk-profile-appropriate volatility curves: conservative personas show steady growth, aggressive personas (Omar, Raj) include drawdown periods
- **Server-side `computeWealthInsights()`** in `portfolioService.ts` — computes `primaryInsight`, `diversificationScore`, `riskLevel`, `topAllocationClass`, `topAllocationPercent`, and `advisorName` from actual portfolio data
- **70-test suite** in `tests/persona-parity.test.ts` covering all 8 personas: positions exist, performance history length, alerts exist, chat threads exist, allocation totals reconcile with snapshots; goals validated for personas that have them (6 of 8)
- **`npm run test:parity`** script for running the persona parity tests

### Changed
- `WealthScreen.tsx` — insights now driven by server-side computed data rather than hardcoded values
- `seed.sql` — expanded with complete position, snapshot, performance, goal, alert, and chat data for Khalid, Sara, Raj, and Nadia; existing personas (Fatima, Omar, Layla) enriched with missing data

---

## Task #8 — User Switching & Multi-Persona Demo
**Date:** March 21, 2026

### Added
- **`UserContext` provider** — React context managing the active user ID with localStorage persistence
- **`PersonaPicker` bottom sheet** — UI component for switching between 8 demo personas, triggered from the header
- **`GET /api/users`** endpoint — returns all seeded demo personas for the picker
- **`X-User-ID` header** — sent on all API and SSE stream calls to identify the active user

### Changed
- **All 11 React Query hooks** updated to include `userId` in their `queryKey` arrays for per-user data isolation
- **`queryClient.removeQueries()`** called on user switch to force fresh data fetching
- **`server/routes/api.ts`** — `getUserId(req)` helper extracts user from `X-User-ID` header with fallback to `DEFAULT_USER_ID`

### Fixed
- **Wealth tab crash** for non-default users — missing null checks on portfolio data
- **Blank Wealth tab** after user switching — query keys not properly scoped to user

---

## Task #7 — Multi-Model Routing with Lane-Based Control Plane
**Date:** March 21, 2026

### Added
- **Lane-based routing** in `modelRouter.ts` with three lanes:
  - **Lane 0 (Deterministic)**: Portfolio lookups, balance checks — handled by wealth engine without LLM calls
  - **Lane 1 (Fast)**: Simple queries using `ada-fast` provider alias with lower token budgets
  - **Lane 2 (Reasoning)**: Complex analysis using `ada-reason` provider alias with higher token budgets
- **Request scorecard** system — evaluates token estimate, tool count, context window size, and complexity signals to select the optimal lane
- **Provider aliases** — `ada-fast` and `ada-reason` both map to `gpt-5-mini` (configurable for future model differentiation)
- **Per-lane configuration** — token budgets and temperature settings per lane
- **Lane metadata in traces** — `traceLogger.ts` captures lane selection, scorecard values, and route decision rationale

### Changed
- `agentOrchestrator.ts` — integrated lane-based routing into the pipeline
- `traceLogger.ts` — extended trace schema with lane metadata fields

### Fixed
- **Lane 0 portfolio text showing $0.00** — deterministic responses now correctly format portfolio values

---

## Bug Fix — Collective Tab Peer Comparison Duplicates
**Date:** March 21, 2026

### Fixed
- **`peer_segments` table producing 400 duplicate rows** — no UNIQUE constraint on `asset_class` column allowed ~100 server restarts to each insert 4 rows
- Added `DO $$` migration block to add `UNIQUE` constraint on `peer_segments(asset_class)` idempotently
- Seed now uses `DELETE FROM peer_segments` followed by `INSERT ... ON CONFLICT (asset_class) DO NOTHING` to prevent duplicates on restart

---

## Agent Task #6 — Execution Guardrails & RM Handoff
**Date:** March 21, 2026

### Added
- **`execution_request` intent type** in `intentClassifier.ts` — 20+ keywords (execute, place order, buy for me, sell for me, go ahead, confirm trade, etc.) with highest priority classification
- **Execution boundary block** in `promptBuilder.ts` — hard system prompt instruction prohibiting Ada from claiming trade execution capability
- **7 guardrail regex patterns** in `guardrails.ts` — detect execution-claiming language (e.g., "I will execute", "order submitted", "trade confirmed") and replace with RM-routing language; hard post-check fallback for any surviving claims
- **`rmHandoffService.ts`** — new service with three routing modes:
  - `rm_handoff` (default): Persists to `advisor_action_queue` table for RM review
  - `api_webhook`: POSTs to configurable webhook URL with queue fallback
  - `disabled`: Rejects execution requests with explanation
- **`route_to_advisor` tool** in `financialTools.ts` — LLM-callable tool to package execution requests; included in `FINANCIAL_TOOL_DEFINITIONS` with OpenAI function schema
- **Orchestrator fallback** in `agentOrchestrator.ts` — if LLM receives `execution_request` intent but doesn't call `route_to_advisor`, orchestrator forces handoff automatically (fail-closed)
- **`advisor_action_queue` table** — stores pending execution requests with user_id, advisor_id, action_type, action_payload, status, timestamps
- **Enhanced `AdvisorHandoffWidget`** in `ChatWidgets.tsx` — shows RM name, action context, and queue reference for execution handoffs; backward-compatible with generic advisory handoffs

### Changed
- **`tenant_configs` table** — added `execution_routing_mode` (rm_handoff/api_webhook/disabled), `execution_webhook_url`, `can_prepare_trade_plans` columns
- **`PolicyDecision` schema** — extended with `execution_route` field
- **Policy engine** — `execution_request` intent always sets `require_human_review: true` with `execution_route` in decision; `route_to_advisor` added to allowed tools via execution_route profile
- **Guardrails ordering** — execution pattern checks run before education-only advisory checks

### Verified
- "Execute a trade for me" → Ada refuses execution, queues to advisor, emits contextual handoff widget with queueId
- Normal portfolio/market/goal queries unaffected
- No duplicate advisor widgets in stream

---

## Agent Task #5 — Verify & Fix Agent Architecture
**Date:** March 20, 2026

### Fixed
- **Intent sub-routing** — `portfolio_health` and `portfolio_explain` sub-intents now correctly map through `mapOldIntentToNew()` from legacy intent classification
- **`market_news` sub-intent** — added explicit mapping so market news queries use correct policy evaluation and RAG context
- **Guardrails-before-streaming** — guardrail sanitization now runs before SSE events are emitted (was running after streaming in some code paths)
- **Advisor handoff widget deduplication** — orchestrator tracks whether an advisor widget was already emitted by tool execution; prevents duplicate widgets when policy also requires advisor review

### Verified
- All 8 financial/UI tools dispatch correctly via `financialTools.ts`
- Multi-turn tool calling works (LLM can call tools, get results, and call more tools up to 3 rounds)
- Agent traces and tool runs persist to database
- Policy decisions persist to database
- End-to-end pipeline verified with live API calls

---

## Agent Task #3 — External Data Source Integration (Phase 1)
**Date:** March 19, 2026

### Added
- **Finnhub provider** (`server/providers/finnhub.ts`) — real-time quotes, company profiles, earnings calendars, company news; API key via `FINNHUB_API_KEY` env var
- **FRED provider** (`server/providers/fred.ts`) — Federal Reserve Economic Data: GDP, CPI, unemployment rate, fed funds rate, 10Y treasury yield; API key via `FRED_API_KEY` env var
- **SEC EDGAR provider** (`server/providers/secEdgar.ts`) — company submissions, XBRL financial facts, full-text filing search; rate limited to 10 req/sec per SEC policy; User-Agent via `SEC_EDGAR_USER_AGENT` env var
- **OpenFIGI provider** (`server/providers/openFigi.ts`) — instrument identity resolution (ISIN/CUSIP/ticker → FIGI); results persisted to `instruments` table; API key via `OPENFIGI_API_KEY` env var
- **Frankfurter provider** (`server/providers/frankfurter.ts`) — ECB-sourced FX rates for major currency pairs; no API key required
- **CBUAE provider** (`server/providers/cbuae.ts`) — Central Bank of UAE AED-localized FX rates with Frankfurter fallback
- **Provider registry** (`server/providers/registry.ts`) — configurable chain: `*_PROVIDER_PRIMARY`, `*_PROVIDER_SECONDARY`, `*_PROVIDER_FALLBACK` env vars; all default to 'mock'
- **In-memory cache** (`server/providers/cache.ts`) — per-data-type TTLs, cache hit/miss metrics in every `ToolResult`
- **Rate limiting** — per-second (SEC EDGAR) and per-minute (others) limiters
- **Sliding-window health tracking** — 5-min window, min 5 attempts, 50% failure rate threshold
- **Phase 2/3 stubs** (`server/providers/stubs.ts`) — wired into registry: Marketaux, ECB, Twelve Data, FMP, CoinGecko, Yahoo Finance

### Changed
- `financialTools.ts` — tool dispatch integrates with provider registry for `get_market_data`, `get_news_summary`
- `ToolResult` schema — includes `source_name`, `source_type`, `as_of`, `latency_ms`, and cache metrics

---

## Agent Task #2 — Agent Architecture & Intelligence Overhaul
**Date:** March 19, 2026

### Added
- **`agentOrchestrator.ts`** — core agent pipeline replacing `chatService.ts` as the primary chat handler. Full pipeline: PII detection → session hydration → intent classification → policy evaluation → model routing → RAG → prompt assembly → memory → LLM → multi-turn tools → wealth engine → guardrails → response building → streaming → trace logging
- **`policyEngine.ts`** — code-driven policy evaluation per tenant config. Returns `PolicyDecision` with advisory mode, allowed tools, human review requirements, disclosure profile
- **`modelRouter.ts`** — selects AI model based on intent complexity; supports FAST_MODEL vs STRONG_MODEL; currently routes all to gpt-5-mini
- **`promptBuilder.ts`** — modular system prompt assembly from persona, advisory mode, portfolio context, memory, tools, and disclosures
- **`responseBuilder.ts`** — constructs Zod-validated `AdaAnswer` responses with headline, summary, citations, recommendations, actions, render hints; maps to SSE events
- **`traceLogger.ts`** — persists agent traces and tool runs to `agent_traces` and `tool_runs` tables
- **`guardrails.ts`** — post-response sanitization: blocked phrases, security naming, data freshness, disclosures
- **`wealthEngine.ts`** — deterministic financial calculations: portfolio health, concentration risk, allocation drift, rebalance preview
- **`financialTools.ts`** — 8 OpenAI function-calling tools: get_portfolio_snapshot, get_holdings_detail, get_market_data, get_news_summary, calculate_wealth_metric, route_to_advisor, show_simulator, show_widget, extract_user_fact
- **Multi-turn tool calling** — LLM can call tools, get results, and call more tools (up to 3 rounds per request)
- **Structured `AdaAnswer` schema** (`shared/schemas/agent.ts`) — Zod schemas for all agent types: ToolResult, Citation, RecommendationItem, Action, AdaAnswer, PolicyDecision, IntentClassification, TenantConfig

### Changed
- `POST /api/chat/stream` — now routes through `agentOrchestrator.runAgentPipeline()` instead of `chatService`
- Intent classification — two-stage: legacy intent → `IntentClassification` schema mapping via `mapOldIntentToNew()`

---

## Agent Task #1 — Database & Data Foundation for Agent Architecture
**Date:** March 19, 2026

### Added
- **10 new database tables** in `schema.sql`:
  - `tenants` — multi-tenant support with region, locale, base currency
  - `tenant_configs` — per-tenant policy: advisory mode, allowed tools, disclosure profile, feature flags
  - `instruments` — instrument master data with symbol, name, asset class, exchange, ISIN, FIGI, SEDOL
  - `market_quotes` — market data cache with price, change %, volume, source, timestamp
  - `news_items` — news cache with headline, summary, source, symbols, published date
  - `tool_runs` — individual tool execution records for agent tracing
  - `agent_traces` — full agent execution traces with session, intent, model, latency, tokens
  - `policy_decisions` — policy evaluation records per request
  - `conversation_summaries` — compressed conversation summaries
  - `advisor_action_queue` — pending execution requests for RM review (added in Task #6)
- **Seed data** in `seed.sql`:
  - 1 tenant: `bank_demo_uae` with full config
  - 8 personas (4 original + 4 new: Khalid Al-Mansoori, Noura Al-Shamsi, Rashed Al-Maktoum, Amina Al-Dhaheri)
  - 8 instruments (AAPL, MSFT, NVDA, AGG, GLD, BTC, ETH, AAPL-bond)
  - Market quotes for all instruments
  - 3 news items
- **`agentRepository.ts`** — data access layer for all agent architecture tables
- **`shared/schemas/agent.ts`** — Zod validation schemas for AdaAnswer, ToolResult, PolicyDecision, IntentClassification, TenantConfig, and related types

### Changed
- Database table count: 23 → 33
- Persona count: 4 → 8

---

## Deployment Fix — Express Wildcard Route
**Date:** March 18, 2026

### Fixed
- **Production crash loop** — replaced incompatible wildcard route `'*'` with `'/{*splat}'` in `server/index.ts` for compatibility with the newer `path-to-regexp` used by Express
- **Verified build output** — confirmed `build/` directory with `index.html` is generated correctly by `vite build`

---

## Discover Thumbnail Fix & Video Overlay Refactor
**Date:** March 18, 2026

### Fixed
- **Broken image thumbnails** in Discover > For You tab — replaced expired/hotlink-blocked external URLs (WSJ, NYT) with reliable Unsplash alternatives for `disc-fy-1`, `disc-fy-2`, and `disc-fy-4` content items
- **Hardcoded video play overlay** — play button was rendering on every ContentCard image regardless of content type; now only appears when `isVideo` is true

### Added
- **`is_video` column** on `content_items` table (schema + live DB migration) — `BOOLEAN DEFAULT FALSE`
- **`isVideo` prop** on `ContentCard` component — conditionally renders the circular play button overlay
- **Full-stack wiring** — `isVideo` flows through `shared/types.ts`, `src/types/index.ts`, `contentRepository.ts` mapper, `DiscoverScreen.tsx`, and `HomeScreen.tsx`

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
- `chat_audit_log` PK type: SERIAL (not TEXT); token column: `tokens_used` (single field, not split prompt/completion)
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
- **Server-side deduplication** — `inFlightRequests` Map in `morningSentinelService.ts` prevents concurrent `generateBriefing()` calls for the same user (guards the cached `/api/morning-sentinel` endpoint)

### Changed
- **`useMorningSentinel` hook** — complete rewrite with coordinated prefetch/stream strategy:
  - Waits 500ms for cached prefetch data from TanStack Query
  - If prefetch hasn't resolved, falls back to SSE streaming automatically
  - Merges stream events into React state for progressive rendering
  - Returns `isStreaming`, `streamingMetrics`, `streamingText`, and `hasData` for UI coordination
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
  - `detectAnomalies()` — flags concentration risk (>40% single asset class), large daily moves (>1.5%), and off-track goals
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
- **RM Productivity Suite specification** (`.local/tasks/rm-productivity-suite.md`) — detailed backlog item documenting the Relationship Manager persona features planned for future implementation:
  - RM Morning Planning Queue (priority-sorted client list)
  - AI Customer Digest & Talking Points (LLM-generated call prep)
  - At-Risk Client Radar (attrition risk ranking with interventions)
  - Next-Best-Action Coach (AI-recommended actions per flagged client)
- This task produced a planning/specification document only; no runtime code changes were made

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
  - 4 demo personas: Aisha Al-Rashid (default), Mei Lin Chen, James Worthington III, Priya Sharma
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

---

## Task #1 — Connect All Free External Data Providers (2026-03-25)

### Added
- **Yahoo Finance provider** (`server/providers/yahooFinance.ts`): Full `MarketProvider` + `NewsProvider` implementation using `yahoo-finance2` npm package. Supports quotes, historical prices, company profiles, earnings history, and news search. Registered as `yahoo_finance` key in provider registry with caching, rate limiting, and health tracking.
- **6 new LLM tool definitions** in `financialTools.ts`:
  - `getMacroIndicator` → FRED provider (inflation, GDP, yields, VIX, oil, gold, consumer sentiment)
  - `getCompanyFilings` → SEC EDGAR provider (10-K, 10-Q, 8-K filings + XBRL financial facts)
  - `lookupInstrument` → OpenFIGI provider (ticker/ISIN/CUSIP → FIGI resolution)
  - `getFxRate` → Frankfurter/CBUAE providers (FX rates with AED-aware routing)
  - `getHistoricalPrices` → Finnhub/Yahoo Finance (price history over N days)
  - `getCompanyProfile` → Finnhub/Yahoo Finance (company info, industry, market cap)
- **Provider status endpoint** (`GET /api/providers/status`): Returns health state, domain configuration, cache stats, and per-provider attempt/failure counts for all 7 providers.
- **Enhanced tool routing**: `inferSuggestedTools` in orchestrator now maps macro, FX, filing, company, historical, and instrument-lookup keywords to the appropriate new tools.
- **Enhanced system prompt**: `promptBuilder.ts` now generates a per-request TOOL GUIDE section describing each available tool with its data source and usage guidance.

### Changed
- **Provider activation**: All 7 providers now activated via environment variables (Finnhub, Yahoo Finance, FRED, SEC EDGAR, OpenFIGI, Frankfurter, CBUAE). Mock fallback retained as last resort in all chains.
- **Lane 1 tool groups**: Added `market_intel` to Lane 1 tool groups in `modelRouter.ts` so market data tools are available in standard conversational queries (previously only Lane 2 had them).
- **Intent route configs**: `market_context` and `news_explain` intents now support Lane 2 escalation and include optional tool categories for macro, FX, identity, and research providers.
- **SEC EDGAR User-Agent**: Changed from placeholder email to configurable via `EDGAR_USER_AGENT` env var with production-appropriate default.
- **Tool group map**: All 6 new tools registered under `market_intel` group for proper lane-based filtering.

### Resolved
- **ISS-004**: All external providers default to mock → Now all providers are live with proper fallback chains.
- **BL-004**: Real external data provider configuration → Complete.

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| PostgreSQL tables | 33 |
| API endpoints | 35 (including 2 SSE streams + providers/status) |
| React components | 65+ |
| React hooks | 15+ |
| Backend services | 17 (agent orchestrator, policy engine, model router, prompt builder, response builder, trace logger, guardrails, wealth engine, financial tools, RM handoff, AI, chat, intent, RAG, memory, PII, goal, sentinel) |
| Database repositories | 6 (user, portfolio, content, chat, poll, agent) |
| External data providers | 7 (Finnhub, Yahoo Finance, FRED, SEC EDGAR, OpenFIGI, Frankfurter, CBUAE) |
| AI tools | 15 (portfolio snapshot, holdings detail, market quotes, historical prices, company profile, macro indicator, company filings, instrument lookup, FX rate, news summary, wealth metric, route to advisor, simulator, widget, fact extraction) |
| Memory tiers | 3 (working, episodic, semantic) |
| SSE streams | 2 (chat, morning sentinel) |
| Guardrail checks | 7 (blocked phrases, execution claims ×7 regex, hard post-check, education advisory, security naming, data freshness, disclosures) |
| Execution enforcement layers | 3 (system prompt, guardrail regex, orchestrator fallback) |
| TypeScript errors fixed | 112 |
