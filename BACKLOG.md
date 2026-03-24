# Backlog — Ada AI Wealth Copilot

> **Living document** — update as new features are proposed, prioritized, or completed.
> Last updated: 2026-03-24

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
**Status:** Proposed
**Priority:** Must Have

Add a proper authentication layer:
- JWT or session-based auth for API endpoints
- User login/registration flow
- Role-based access control (investor vs advisor vs admin)
- Remove hardcoded `DEFAULT_USER_ID`
- Secure all API routes with auth middleware
- Session management with token refresh

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
**Status:** Proposed
**Priority:** Must Have

Move from mock to real data for at least core providers:
- Finnhub for real-time market quotes and company data
- FRED for macroeconomic indicators
- Configure API keys in production environment
- Set up provider health monitoring alerts
- Validate data freshness and accuracy

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
- **Twelve Data**: Technical indicators and forex data
- **Financial Modeling Prep (FMP)**: Financial statements, DCF models
- **CoinGecko**: Comprehensive crypto data
- **Yahoo Finance**: Broad market data fallback
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
