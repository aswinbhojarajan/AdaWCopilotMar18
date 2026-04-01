# Backlog — Ada AI Wealth Copilot

> **Living document** — update as new features are proposed, prioritized, or completed.
> Last updated: 2026-04-01

---

## Legend

| Priority | Description |
|----------|-------------|
| Must Have | Required for production launch |
| Should Have | Important but not blocking launch |
| Nice to Have | Enhances experience, can be deferred |
| Future | Long-term vision items |

| Status | Description |
|--------|-------------|
| Proposed | Idea documented, not yet scoped |
| Scoped | Requirements defined, ready to build |
| In Progress | Actively being developed |
| Complete | Built and verified |

---

## Must Have — Production Launch

### BL-001: Authentication & Authorization
**Status:** Complete (2026-04-01)
**Priority:** Must Have

~~Add a proper authentication layer:~~
- ~~JWT or session-based auth for API endpoints~~ → Cookie-session auth with express-session + connect-pg-simple
- ~~User login/registration flow~~ → Ada-branded login page with email/password form + dev persona picker
- ~~Role-based access control (investor vs advisor vs admin)~~ → `requireRole()` middleware enforced on admin routes (`/api/admin` requires `ops_admin`). Per-user roles stored in `auth.users`.
- ~~Remove hardcoded `DEFAULT_USER_ID`~~ → Session-based user identity
- ~~Secure all API routes with auth middleware~~ → `requireAuth` middleware on all protected routes
- ~~Session management with token refresh~~ → 12h rolling sessions with bcrypt password hashing

### BL-002: PII Data Protection
**Status:** Proposed
**Priority:** Must Have

Address PII handling gaps:
- Encrypt PII at rest in `chat_messages` table
- Implement data retention policy with automated purge
- Add PII masking in database queries and logs
- Compliance with GCC data protection regulations (UAE PDPL)
- Option to store only redacted messages in database

### BL-003: API Rate Limiting & Security Hardening
**Status:** Proposed
**Priority:** Must Have

Production security baseline:
- Rate limiting per user/IP on all endpoints
- Stricter limits on LLM-backed endpoints (cost protection)
- CSRF token validation
- Request size limits
- Security headers (Helmet.js)
- Input sanitization beyond PII detection

### BL-004: Real External Data Provider Configuration
**Status:** Complete
**Priority:** Must Have

~~Move from mock to real data for at least core providers:~~
All 7 providers now live: Finnhub (market+news), Yahoo Finance (fallback market+news), FRED (macro), SEC EDGAR (filings), OpenFIGI (instrument lookup), Frankfurter (FX), CBUAE (AED FX). 6 new LLM tools added. Provider health endpoint at `/api/providers/status`. See Task #1.

### BL-005: Error Monitoring & Alerting
**Status:** Proposed
**Priority:** Must Have

Production observability:
- Structured logging (replace console.log with proper logger)
- Error tracking (Sentry or equivalent)
- Agent pipeline failure alerting
- Provider health dashboard
- Token usage monitoring and cost alerts
- Performance metrics (response times, tool latencies)

---

## Should Have — Post-Launch

### BL-006: Advisor Dashboard & Action Queue UI
**Status:** Scoped (spec exists in `.local/tasks/rm-productivity-suite.md`)
**Priority:** Should Have

RM-facing features for the Relationship Manager persona:
- **Morning Planning Queue**: Priority-sorted client list with daily action items
- **AI Customer Digest**: LLM-generated talking points and call prep per client
- **At-Risk Client Radar**: Attrition risk ranking with recommended interventions
- **Next-Best-Action Coach**: AI-recommended actions per flagged client
- **Action Queue Review**: UI to review, approve, and act on `advisor_action_queue` items
- Advisor auth with separate role/permissions

### BL-007: Multi-Model Routing
**Status:** Complete
**Priority:** Should Have

~~Optimize cost and quality with model differentiation.~~ Implemented as lane-based control plane with 3 lanes (deterministic/fast/reasoning), request scorecards, provider aliases, and per-lane token budgets. See Task #7.

### BL-008: Multi-Tenant Expansion
**Status:** Proposed
**Priority:** Should Have

Scale beyond the demo tenant:
- Tenant onboarding workflow
- Per-tenant branding (colors, logo, tone)
- Per-tenant policy configuration UI
- Tenant isolation for data and configs
- White-label deployment support
- Tenant-specific disclosure and compliance profiles

### BL-009: User Switching & Multi-Persona Demo
**Status:** Complete
**Priority:** Should Have

~~Enable switching between the 8 seeded personas.~~ Implemented with PersonaPicker bottom sheet, X-User-ID header, per-user React Query isolation, localStorage persistence, and full persona data parity (365-day performance history, goals, alerts, chat threads). Persona count later reduced from 8 to 3 (Aisha/Khalid/Raj) in Task #12 for improved demo focus. Abdullah renamed to Aisha in Task #13. See Tasks #8, #9, #12, and #13.

### BL-010: Webhook Reliability for Execution Routing
**Status:** Proposed
**Priority:** Should Have

Production-grade execution webhook:
- Retry logic with exponential backoff
- Dead-letter queue for permanently failed webhooks
- Webhook signature verification (HMAC)
- Status callback from external systems
- Audit trail for webhook delivery attempts

---

## Nice to Have — Enhancement

### BL-011: Real Account Linking (Open Banking)
**Status:** Proposed
**Priority:** Nice to Have

Replace mock account flow with real integration:
- Open Banking API integration (UAE-specific providers)
- Plaid or equivalent for international accounts
- Account balance sync and transaction import
- Multi-bank aggregation
- Consent management

### BL-012: Transaction History UI
**Status:** Proposed
**Priority:** Nice to Have

Surface existing transaction data:
- Transaction history table/list view in Wealth tab
- Filter by account, type, date range
- Transaction search
- Export to CSV/PDF
- Database table already exists with seeded data

### BL-013: Price History Charts
**Status:** Proposed
**Priority:** Nice to Have

Interactive historical price charts:
- Per-holding price history visualization
- Candlestick and line chart options
- Time-range selection (1D, 1W, 1M, 3M, 1Y, All)
- Comparison mode (overlay multiple holdings)
- Database table already exists

### BL-014: Push Notifications
**Status:** Proposed
**Priority:** Nice to Have

Real-time alert delivery:
- Web push notifications for critical alerts
- Portfolio anomaly notifications (large moves, risk threshold breaches)
- Goal milestone notifications
- Market event alerts
- Notification preferences per user

### BL-015: Document Viewer
**Status:** Proposed
**Priority:** Nice to Have

In-app document viewing:
- View PDF statements, reports, and financial documents
- Link from notification items to relevant documents
- Document upload and storage
- Searchable document archive

### BL-016: Automated Test Suite
**Status:** Proposed
**Priority:** Nice to Have

Comprehensive testing coverage:
- Unit tests for wealth engine calculations
- Integration tests for agent pipeline
- E2E tests for critical user flows (chat, portfolio, goals)
- Guardrail regression tests (execution boundary verification)
- Provider chain failover tests
- CI pipeline with test gates

### BL-017: Dark Mode
**Status:** Proposed
**Priority:** Nice to Have

Alternate visual theme:
- Dark color palette maintaining brand identity
- System preference detection
- Manual toggle in settings
- Tailwind CSS dark mode variants

### BL-018: Multi-Language Support
**Status:** Proposed
**Priority:** Nice to Have

Localization for GCC market:
- Arabic language support (RTL layout)
- LLM system prompt localization
- UI string externalization (i18n)
- Date/number formatting per locale
- Currency formatting per tenant

---

## Future — Long-Term Vision

### BL-019: Phase 2/3 External Data Providers
**Status:** Proposed
**Priority:** Future

Expand data coverage:
- **Marketaux**: Alternative news API with sentiment scoring
- **ECB**: Direct European Central Bank data feeds
- ~~**Twelve Data**: Technical indicators and forex data~~ — **DONE** (Task #1: integrated as primary GCC market provider with symbol normalization, batch quotes, historical prices, company profiles, earnings calendar)
- **Financial Modeling Prep (FMP)**: Financial statements, DCF models
- **CoinGecko**: Comprehensive crypto data
- **Yahoo Finance**: Broad market data fallback — already wired as fallback provider
- Provider stubs are already wired into the registry

### BL-020: AI-Powered Portfolio Rebalancing
**Status:** Proposed
**Priority:** Future

Automated rebalancing workflows:
- AI-generated rebalance recommendations based on drift analysis
- Tax-loss harvesting suggestions
- Multi-account rebalance coordination
- Approval workflow with RM review (already have the execution routing infrastructure)
- Trade plan generation with risk analysis

### BL-021: Social/Community Features
**Status:** Proposed
**Priority:** Future

Enhanced collective intelligence:
- User-generated investment ideas
- Community sentiment indicators
- Social proof signals in chat recommendations
- Investment clubs/groups
- Anonymized portfolio comparison

### BL-022: Voice Interface
**Status:** Proposed
**Priority:** Future

Speech-based interaction:
- Voice input for chat queries
- Text-to-speech for Ada responses
- Voice command shortcuts
- Accessibility enhancement for visually impaired users

### BL-023: Mobile Native App
**Status:** Proposed
**Priority:** Future

Native mobile experience:
- React Native or Flutter mobile app
- Biometric authentication (Face ID, fingerprint)
- Offline support with sync
- Native push notifications
- Camera integration for document scanning

### BL-024: Advanced Analytics Dashboard
**Status:** Proposed
**Priority:** Future

Deep portfolio analytics:
- Performance attribution analysis
- Risk decomposition (factor-based)
- Benchmark comparison (S&P 500, MSCI, regional indices)
- Tax reporting integration
- ESG scoring and sustainability metrics

### BL-025: API Gateway & External Integration
**Status:** Proposed
**Priority:** Future

Enterprise integration layer:
- REST API gateway for third-party consumers
- Webhook subscriptions for portfolio events
- API key management
- Usage metering and billing
- SDK generation (TypeScript, Python)

### BL-026: Benchmark-Beat Milestones
**Status:** Proposed
**Priority:** Nice to Have

Extend milestone worker to detect when user's portfolio outperforms market benchmarks:
- Compare portfolio daily return vs S&P 500, MSCI World, regional GCC indices
- Generate milestone card when portfolio beats benchmark over 30/90/180 day windows
- Include benchmark comparison data in card detail sections
- Requires market benchmark data integration (currently not available)

### BL-027: Trade & Deposit Event Triggers
**Status:** Proposed
**Priority:** Should Have

Wire event-driven feed refresh to additional portfolio-mutating events:
- Simulate trade execution endpoints (buy/sell)
- Simulate deposit/withdrawal endpoints
- Each mutation triggers `triggerEventDrivenRefresh(userId)` for immediate feed update
- Currently only goal creation and account creation trigger refresh

### BL-028: Timezone-Aware Morning Briefing Scheduling
**Status:** Proposed
**Priority:** Should Have

Replace `setInterval` timer with timezone-aware cron scheduling for morning briefings:
- Use `node-cron` or similar to schedule briefings at 8 AM local time per user timezone
- GCC users (UTC+3/+4) should receive briefings at their local 8 AM
- Currently runs on 6-hour interval with 14-hour recency guard, not aligned to user timezone
- Relates to ISS-023

### BL-029: Canary Validation & Moderation API
**Status:** Complete
**Priority:** Should Have

~~Per-alias model overrides and content moderation:~~
Per-alias env var overrides (`ADA_MODEL_<ALIAS>`) and content moderation fully implemented. `moderationService.ts` wraps OpenAI `omni-moderation-latest`. Pre-LLM input moderation + post-LLM output moderation integrated into orchestrator. `moderation_events` table for flagged content persistence. Moderation bypass for deterministic Lane 0 requests. See Project Task #9, ISS-025 resolved.

### BL-030: LLM Cost Dashboard
**Status:** Proposed
**Priority:** Nice to Have

Build an internal dashboard for monitoring LLM cost and usage:
- Aggregate `agent_traces` by `provider_alias`, model, date for token/cost summaries
- Visualize `provider_fallback_events` frequency, timing, and failure reasons
- Per-user and per-intent cost breakdowns
- Alert thresholds for daily/weekly spend anomalies

### BL-031: Structured Logging (Pino)
**Status:** Proposed
**Priority:** Should Have

Replace `console.log` across all server code with structured JSON logging via Pino:
- Log levels (debug, info, warn, error) with request context
- Correlation IDs for tracing requests across services
- Redact sensitive fields (PII, auth tokens)
- Relates to ISS-021

### BL-032: OpenAI Batch API for Pipeline
**Status:** Proposed
**Priority:** Nice to Have

Use OpenAI Batch API for non-time-sensitive Discover pipeline LLM calls:
- Batch synthesis and enrichment LLM calls (not user-facing, can tolerate 24h latency)
- 50% cost reduction on batch-eligible calls
- Requires queue management and result polling

### BL-033: OpenAI Responses API Migration
**Status:** Proposed
**Priority:** Future

Migrate from Chat Completions API to OpenAI Responses API:
- Built-in tool orchestration (multi-turn without client-side loop)
- Web search and file search as native tools
- Structured output via response_format
- Requires adapter layer for Anthropic fallback compatibility

### BL-034: PostHog Full Event Taxonomy (P1/P2 Events)
**Status:** Proposed
**Priority:** Should Have
**Depends on:** Project Task #17

Instrument remaining ~30 events from the PostHog v2 spec (52 total, ~20 P0 events covered in Task #17):
- **Home**: home_card_viewed (IntersectionObserver), home_cta_tapped, morning_sentinel_expanded
- **Chat**: chat_action_invoked, chat_feedback, chat_history_opened, chat_source_opened
- **Wealth**: holding_detail_view, allocation_chart_interact, performance_period_change, goal_opened, goal_created, life_event_sim_started, life_event_sim_completed, statement_download
- **Discover**: discover_card_impression (IntersectionObserver, 1s threshold), discover_card_save, discover_card_share, discover_scroll_depth, article_read_progress, discover_feed_refresh, content_feedback_submitted
- **Collective**: collective_viewed, poll_viewed, poll_voted, community_cta_tapped
- **Compliance**: risk_profile_check, disclaimer_shown, disclaimer_acknowledged, kyc_gate_hit, suitability_mismatch
- **UI**: cta_tap, search_executed, filter_applied, notification_received, notification_tapped, error_displayed, rm_contact_initiated
- **Overlays**: overlay_opened, overlay_closed (with time_open_ms, close_method)
- Reference: `attached_assets/RC_ada_analytics_posthog_v2_CLA_post_OAI_3003_3pm_1774871900301.docx`

### BL-035: PostHog Server-Side Feature Flags
**Status:** Proposed
**Priority:** Should Have
**Depends on:** Project Task #17

Server-side PostHog integration for feature flag evaluation:
- Install `posthog-node` SDK; add `POSTHOG_PROJECT_KEY` server-side env var
- `gpt-5.4-canary` boolean flag (0% rollout) — controls `ada-reason` model alias resolution
- `discover-ranking-strategy` multivariate flag (control/engagement/recency) for Discover feed A/B testing
- Demo variant flags: `morning-sentinel-v2`, `prompt-starters-placement`, `discover-aggregation-card`
- Integrate flag checks into LLM routing layer (`resolveModelAlias`) and Discover feed component

### BL-036: PostHog Existing Telemetry Table Mapping
**Status:** Proposed
**Priority:** Should Have
**Depends on:** Project Task #17

Mirror existing DB telemetry to PostHog events (parallel stream, not replacement):
- `user_content_interactions` → discover_card_impression, discover_card_tap, discover_card_dismiss, discover_card_save (add `track()` alongside existing DB writes)
- `user_discover_visits` → tab_view (tab_name='discover'), discover_scroll_depth
- `agent_traces` → chat_stream_started, chat_stream_completed, chat_stream_interrupted (mirror key metrics)
- `moderation_events` → moderation_triggered event (fire PostHog event on trigger)
- `provider_fallback_events` → chat_stream_completed (fallback_used: true), chat_error (captured as properties)

### BL-037: Session Replay Readability (ph-no-mask)
**Status:** Proposed
**Priority:** Nice to Have
**Depends on:** Project Task #17

Add `ph-no-mask` CSS class to safe, non-sensitive UI elements to improve PostHog session replay readability:
- Tab labels (HOME, WEALTH, DISCOVER, COLLECTIVE)
- Section headers ("Your Goals", "Portfolio Health", etc.)
- Button text (View Portfolio, Ask Ada, etc.)
- CTA labels
- Never unmask: financial figures, balances, names, emails, account numbers, chat content, LLM responses

### BL-038: First-Party PostgreSQL Analytics Layer
**Status:** Proposed
**Priority:** Future

Add `analytics_events` PostgreSQL table for first-party analytics alongside PostHog:
- Create analytics schema and tables
- Build `POST /api/analytics/events` Express endpoint
- Add `layer` field to event registry (`fp_only`, `both`, `ph_only`)
- Update `useAnalytics.track()` to check layer and dual-dispatch
- Move PII-containing events to `fp_only`; keep behavioral events as `both`
- Zero component code changes — everything already uses `track()` through the hook

### BL-039: PostHog Production Identity Model (SHA-256 Hashing)
**Status:** Proposed
**Priority:** Future
**Depends on:** BL-038

Replace synthetic demo distinct_ids with SHA-256 hashed client_ids for production users:
- `hashClientId()` function: `SHA-256(ada:{clientId}:{salt})`
- Switch `identify()` from `DEMO_PERSONAS` lookup to hashed real IDs
- HASH_SALT stored as server-side secret
- Activate when real auth with real users is live

### BL-040: PostHog Dashboards & Saved Replay Filters
**Status:** Proposed
**Priority:** Should Have
**Depends on:** Project Task #17, BL-034

Create PostHog dashboards and saved session replay filters (done in PostHog console, not code):
- **Demo Engagement Dashboard**: active users, sessions by persona, tab distribution, session duration, chat adoption rate, content engagement rate
- **Journey Funnel Dashboard**: login→home→chat→portfolio→discover funnel, wealth depth funnel, discover engagement funnel
- **AI Operations Dashboard**: requests by model alias, response time P50/P95, fallback rate, stream interruption rate, token distribution
- **Saved Replay Filters**: login issues, chat failures, high latency (>5s), wealth abandonment, discover drop-off

### BL-041: Dedicated DB Migration Scripts for Data Backfills
**Status:** Proposed
**Priority:** Should Have

Replace seed.sql-based data backfills with dedicated SQL migration scripts:
- Move Task #9 discover card `supporting_articles` enrichment from seed.sql into a numbered migration file
- Ensure migrations are idempotent (safe to re-run)
- Add migration runner or integrate with existing schema migration pattern
- Future data-shape changes to discover_cards should use migrations, not seed modifications

---

## Completed Items

| ID | Title | Completed Date |
|----|-------|---------------|
| — | Database & Data Foundation | 2026-03-19 |
| — | Agent Architecture & Intelligence Overhaul | 2026-03-19 |
| — | External Data Source Integration (Phase 1) | 2026-03-19 |
| — | Verify & Fix Agent Architecture | 2026-03-20 |
| — | Execution Guardrails & RM Handoff | 2026-03-21 |
| — | Goals & Life Planning | 2026-03-18 |
| — | Morning Sentinel | 2026-03-18 |
| — | Morning Sentinel Performance Optimization | 2026-03-18 |
| — | Tab Transition Animations | 2026-03-18 |
| — | TypeScript Validation Framework | 2026-03-18 |
| BL-007 | Multi-Model Routing (Lane-Based Control Plane) | 2026-03-21 |
| BL-009 | User Switching & Multi-Persona Demo | 2026-03-21 |
| — | Full Persona Data Parity (8 personas) | 2026-03-21 |
| — | Collective Tab Peer Comparison Fix | 2026-03-21 |
| — | PRD Creation & Updates | 2026-03-18/21 |
| — | Data Realism & Market Alignment (Task #10) | 2026-03-21 |
| — | Portfolio Health Field Mismatch Fix (Task #11) | 2026-03-21 |
| — | Reduce to 3 Personas (Task #12) | 2026-03-22 |
| — | Comprehensive Data Integrity Audit | 2026-03-22 |
| — | Rename Abdullah to Aisha (Task #13) | 2026-03-22 |
| — | LLM-Based Intent Classification (Task #14) | 2026-03-22 |
| — | Documentation Audit & LLM Resilience Fix (Task #15) | 2026-03-23 |
| — | AI Orchestration Hardening: Capability Registry, Resilient LLM, Verbose Mode (Task #16) | 2026-03-23 |
| — | Live Thinking Panel During Streaming (Task #17) | 2026-03-23 |
| — | Login Page (replaced ClientEnvironment splash) (Task #1) | 2026-03-24 |
| — | Login Heading Update (Task #2) | 2026-03-24 |
| — | Font Loading & Typography Fix — Google Fonts + TypeKit (Task #3) | 2026-03-24 |
| — | Remove Fake Mobile Status Bar / TopBar (Task #4) | 2026-03-24 |
| — | Intermittent UI Bug Fixes: Morning Sentinel JSON flash, Wealth tab blank, Discover tab crash (Project Task #16) | 2026-03-25 |
| — | Context-Aware Chat Follow-Up Handling (Project Task #17) | 2026-03-25 |
| — | Discover Tab Uplift Phase 1: Foundation & Live Content Pipeline (Project Task #3) | 2026-03-25 |
| — | Discover Tab Uplift Phase 2: Personalization, Interactions & Ada View (Project Task #4) | 2026-03-25 |
| — | Discover Tab Phase 3: Scale, Engagement & Premium Features (Project Task #5) | 2026-03-26 |
| — | Configurable Model Registry & GPT-5.4 Migration (Project Task #8) | 2026-03-27 |
| — | Twelve Data GCC Provider Integration (Project Task #1) | 2026-04-01 |
| — | Chat Response Protocol: Frontend Block Components (Project Task #4) | 2026-04-01 |
| — | Chat Response Disclaimer to Footer Popup (Project Task #5) | 2026-04-01 |
| BL-029 | Canary Validation & Moderation API (Project Task #9) | 2026-04-01 |
| BL-001 | Authentication & Authorization — Cookie-session auth (partial; RBAC remaining) | 2026-04-01 |
| — | Morning Sentinel Export Package (Project Task #6) | 2026-04-01 |
| — | Chat UI & Disclaimer Cleanup — brand-neutral, no duplicate follow-ups (Project Task #7) | 2026-04-01 |
| — | Wealth Gap Card Navigation Fix — Life Gap CTAs → chat (Project Task #8) | 2026-04-01 |
| — | Discover Card Sources & Article Viewer — publisher registry, ArticleSourcesSheet (Project Task #9) | 2026-04-01 |
