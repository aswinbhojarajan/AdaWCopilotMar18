# Ada Wealth Agent — Replit Build Brief

## 1. Objective

Build a **chat-first AI wealth copilot** that:
- feels fast in conversation,
- is grounded in portfolio/banking/market/news/tool data,
- supports configurable advice boundaries by tenant/region/client,
- is auditable and safe,
- can expand later into portfolio health, discover/news, goals, and advisor workflows.

This should be a **real working prototype**, not just a UI shell:
- real agent loop
- real tool calling
- real persistence
- real config/policy layer
- realistic seeded financial data
- streaming responses
- trace logging
- eval-ready structure

---

## 2. Product principles

1. **The LLM is not the source of truth.**  
   It interprets, plans, explains, and synthesizes.  
   Portfolio numbers, analytics, policy decisions, and market facts come from tools/services.

2. **Policy sits outside the prompt.**  
   Prompt helps behavior. Policy decides permissions.

3. **Fast path and deep path are different.**  
   Instant responses should use cached/precomputed summaries.  
   Complex requests should trigger richer tool orchestration.

4. **Every meaningful answer is grounded.**  
   If the answer mentions portfolio facts, prices, news, or recommendations, the system must know where that came from and how fresh it is.

5. **Everything should be configurable by tenant.**  
   Advice flexibility, disclaimers, product universe, tool access, tone, market scope, and language should all be tenant-configurable.

6. **Traceability from day one.**  
   Store messages, tool calls, policy decisions, answer sections, and timings.

---

## 3. What to build first

### In scope for v1
- Chat interface with streaming
- User profile context injection
- Portfolio snapshot tool
- Holdings tool
- Market quote tool
- Holdings-relevant news tool
- Deterministic portfolio health engine
- Policy engine
- Structured answer renderer
- Trace logging
- Realistic seed data
- Simple advisor handoff CTA
- Multi-tenant config support, even if only 1 tenant is initially active

### Out of scope for v1
- live order placement
- real money movement
- full open banking aggregation
- document ingestion at scale
- voice
- complex optimization / Monte Carlo
- full RAG over thousands of documents

Keep placeholders/interfaces ready for these, but do not let them slow v1.

---

## 4. Recommended stack

## Frontend
- Next.js 15
- React
- TypeScript
- Tailwind
- shadcn/ui
- Zustand for lightweight client state
- Server Components where useful
- Route Handlers for streaming chat API

## Backend / runtime
- Next.js full-stack monorepo for v1
- OpenAI Responses API
- OpenAI Agents SDK for agent orchestration abstraction if helpful
- Zod for runtime validation
- Drizzle ORM or Prisma; I’d lean Drizzle for simplicity/speed
- Postgres
- Redis optional later for caching; not mandatory on day 1

## Data
- Replit managed PostgreSQL for core persistence
- Seed scripts for portfolios, holdings, clients, transactions, news, and insights

## Agent orchestration
- Start with **custom orchestrator + structured tools**
- Keep LangGraph as an optional step-up once you need durable execution, human-in-the-loop, and more explicit graph/state control

## Observability
- DB trace tables first
- optional OpenAI eval/trace grading integration later

---

## 5. Core architecture

```text
[Next.js UI]
   |
   v
[Chat API / Session Gateway]
   |
   v
[Context Assembler] ----> [Tenant Config]
   |                         |
   |                         v
   |                    [Policy Engine]
   |
   v
[Agent Orchestrator]
   |        |         |         |
   |        |         |         |
   v        v         v         v
[Portfolio Tools] [Market Tools] [News Tools] [Workflow Tools]
   |
   v
[Deterministic Wealth Engine]
   |
   v
[Structured Response Builder]
   |
   v
[Guardrails / Disclosure Injection]
   |
   v
[Streamed UI Answer + Cards]

All steps write to:
[Trace Store / Conversation Store / Tool Run Log]
```

---

## 6. Repo structure

Use this structure:

```text
ada-wealth-agent/
  apps/
    web/
      app/
        (marketing)/
        ada/
          page.tsx
          chat/
            page.tsx
          wealth/
            page.tsx
          discover/
            page.tsx
          collective/
            page.tsx
        api/
          chat/route.ts
          session/route.ts
          traces/route.ts
          advisor-handoff/route.ts
      components/
        ada/
          chat/
          cards/
          wealth/
          discover/
          common/
      lib/
        client/
        server/
      styles/
      middleware.ts

  packages/
    agent-core/
      src/
        orchestrator/
          run-agent.ts
          route-intent.ts
          select-model.ts
          build-runtime-context.ts
          response-builder.ts
          guardrails.ts
        prompts/
          base-instructions.ts
          answer-contract.ts
          prompt-builder.ts
        schemas/
          answer-schema.ts
          tool-schema.ts
          policy-schema.ts
        tracing/
          trace-writer.ts
          timers.ts
    wealth-engine/
      src/
        portfolio/
          health-score.ts
          concentration.ts
          drift.ts
          allocation.ts
          pnl.ts
          benchmark.ts
        risk/
          suitability-check.ts
          recommendation-check.ts
    tools/
      src/
        portfolio/
          get-portfolio-snapshot.ts
          get-holdings.ts
          get-transactions.ts
        market/
          get-quotes.ts
          get-price-history.ts
        news/
          get-holdings-news.ts
        workflow/
          schedule-advisor.ts
          create-watchlist.ts
    policy/
      src/
        evaluate-policy.ts
        disclosure-engine.ts
        escalation-rules.ts
    data/
      src/
        db.ts
        schema/
        seed/
          tenants.ts
          users.ts
          portfolios.ts
          holdings.ts
          transactions.ts
          market.ts
          news.ts
    shared/
      src/
        types/
        constants/
        utils/

  docs/
    architecture.md
    tool-contracts.md
    policy-matrix.md
    eval-plan.md

  .env.example
  package.json
  turbo.json
  tsconfig.json
```

---

## 7. Runtime request flow

For each user message:

### Step 1: session hydrate
Load:
- tenant
- user profile
- risk profile
- suitability status
- linked portfolio/account ids
- UI context
- recent conversation messages
- conversation summary
- feature flags

### Step 2: classify request
Classify:
- factual
- explanatory
- portfolio analysis
- market/news analysis
- recommendation/advice
- workflow/action
- support
- escalation

Use a small/cheap model or even deterministic rules for this first pass.

### Step 3: policy gate
Evaluate:
- can this user receive general education only?
- can they receive personalized insights?
- can specific securities be named?
- can product suggestions be compared?
- can next-best-actions be shown?
- is disclaimer mandatory?
- is advisor escalation mandatory?

### Step 4: build tool set
Only expose tools allowed for this request and this policy state.

### Step 5: agent plan + tool execution
The agent:
- reads context
- decides what tools to call
- executes allowed tools
- can call tools in parallel where independent
- passes tool outputs to wealth engine where deterministic calculations are needed

### Step 6: deterministic enrichment
Run:
- allocation
- concentration
- drift
- simple health score
- cash sufficiency
- news relevance mapping

### Step 7: structured answer generation
Generate an object, not just text.

### Step 8: post-checks
- missing citations?
- stale data?
- policy violation?
- missing disclaimers?
- unsupported recommendation language?

### Step 9: stream answer + cards
Send:
- top-line answer first
- then supporting analysis
- then cards/actions

---

## 8. The response contract

Every answer should be assembled into a strict schema.

Use this shape:

```ts
type AdaAnswer = {
  answer_id: string;
  mode: "instant" | "analysis" | "advisory";
  user_intent:
    | "balance_query"
    | "portfolio_explain"
    | "portfolio_health"
    | "market_news"
    | "recommendation_request"
    | "workflow_request"
    | "support"
    | "other";
  headline: string;
  summary: string;
  key_points: string[];
  portfolio_insights?: {
    health_score?: number;
    concentration_flags?: string[];
    allocation_notes?: string[];
    performance_notes?: string[];
  };
  market_context?: {
    relevant_instruments?: string[];
    relevant_news_topics?: string[];
    market_takeaway?: string;
  };
  recommendations?: {
    allowed: boolean;
    type: "none" | "education" | "next_best_actions" | "product_options";
    items: Array<{
      title: string;
      rationale: string;
      risk_note?: string;
      suitability_note?: string;
    }>;
  };
  actions?: Array<{
    type: "advisor_handoff" | "watchlist" | "alert" | "view_portfolio" | "none";
    label: string;
    payload?: Record<string, unknown>;
  }>;
  disclosures: string[];
  citations: Array<{
    source_type: "portfolio_api" | "market_api" | "news_api" | "wealth_engine" | "policy_engine";
    source_name: string;
    reference_id: string;
    as_of: string;
  }>;
  render_hints?: {
    show_portfolio_card?: boolean;
    show_news_card?: boolean;
    show_health_card?: boolean;
  };
};
```

---

## 9. Policy engine design

This should be code-driven, not prompt-driven.

## Policy inputs
- tenant_id
- jurisdiction
- client_segment
- advisory_mode
- risk_profile
- suitability_status
- product_permissions
- feature_flags
- request_type

## Policy outputs
- allowed_answer_mode
- allowed_tools
- can_name_securities
- can_compare_products
- can_generate_recommendations
- can_generate_next_best_actions
- requires_advisor_handoff
- requires_disclosures
- disclosure_profile
- blocked_phrases
- escalation_reason

## Example config

```json
{
  "tenant_id": "bank_demo_uae",
  "jurisdiction": "UAE",
  "advisory_mode": "personalized_insights_only",
  "can_name_securities": true,
  "can_compare_products": false,
  "can_generate_recommendations": false,
  "can_generate_next_best_actions": true,
  "requires_advisor_handoff_for_specific_advice": true,
  "disclosure_profile": "uae_affluent_v1",
  "allowed_tools_profiles": [
    "portfolio_read",
    "market_read",
    "news_read",
    "health_compute",
    "workflow_light"
  ]
}
```

## Example evaluator signature

```ts
type PolicyDecision = {
  allow_response: boolean;
  response_mode: "education_only" | "personalized_insights" | "restricted_advisory";
  allowed_tools: string[];
  recommendation_mode: "none" | "next_best_actions" | "product_options";
  require_disclosures: boolean;
  require_human_review: boolean;
  escalation_reason?: string;
};
```

---

## 10. Tool taxonomy

Keep tools small and typed.

## Portfolio tools
- `getPortfolioSnapshot(userId, portfolioId)`
- `getHoldings(userId, portfolioId)`
- `getTransactions(userId, portfolioId, range)`
- `getCashPositions(userId, portfolioId)`
- `getGoalProgress(userId)`

## Market tools
- `getQuotes(symbols[])`
- `getHistoricalPrices(symbol, period)`
- `getInstrumentProfile(symbol)`
- `getCorporateEvents(symbols[])`

## News tools
- `getHoldingsRelevantNews(symbols[], lookbackDays)`
- `getMarketDigest(region, segment)`
- `getNewsForSymbol(symbol, lookbackDays)`

## Wealth engine tools
- `calculateAllocation(holdings)`
- `calculateConcentration(holdings)`
- `calculatePortfolioHealth(snapshot, holdings, profile)`
- `calculateDrift(holdings, targetAllocation?)`
- `mapNewsToPortfolio(news, holdings)`

## Workflow tools
- `scheduleAdvisorCall(userId, topic)`
- `saveWatchlist(userId, symbols[])`
- `createAlert(userId, alertDef)`

---

## 11. Tool contract standard

Every tool returns this shape:

```ts
type ToolResult<T> = {
  status: "ok" | "error" | "partial";
  source_name: string;
  source_type: string;
  as_of: string;
  latency_ms: number;
  warnings?: string[];
  data: T | null;
  error?: string;
};
```

This makes downstream grounding much easier.

---

## 12. Deterministic wealth engine

Do not let the model do these calculations in free text.

Implement these now:

### Portfolio health score
Simple weighted score:
- diversification
- cash buffer
- concentration risk
- alignment to risk profile
- recent drawdown / volatility proxy
- position count sanity
- single-name overweight flags

### Concentration
- largest holding %
- top 5 holdings %
- sector concentration
- geography concentration
- asset class concentration

### Allocation
- equity / fixed income / cash / alternatives
- geography buckets
- sector buckets

### Drift
If a target allocation exists:
- absolute drift by bucket
- flag > threshold

### News relevance
- map article symbols/themes to holdings
- score relevance by exposure and recency

---

## 13. Data model

Create these tables at minimum:

### tenancy and users
- `tenants`
- `tenant_configs`
- `users`
- `user_profiles`
- `risk_profiles`
- `advisor_assignments`

### portfolio domain
- `portfolios`
- `accounts`
- `instruments`
- `holdings`
- `transactions`
- `portfolio_snapshots`
- `target_allocations`

### content domain
- `news_items`
- `market_digests`
- `house_views`

### conversation domain
- `conversations`
- `messages`
- `conversation_summaries`
- `tool_runs`
- `agent_traces`
- `policy_decisions`

### workflow domain
- `advisor_handoffs`
- `watchlists`
- `alerts`

### eval / admin
- `eval_cases`
- `eval_runs`
- `feature_flags`

---

## 14. Seed data design

The prototype will feel fake unless seeded well.

Create 6–8 realistic personas:
- UAE affluent salaried investor
- KSA HNW conservative investor
- growth-oriented younger investor
- cash-heavy uncertain investor
- goal-based family investor
- advisor-led client
- self-directed active client

For each persona seed:
- profile
- risk score
- goals
- cash balance
- portfolio composition
- transactions
- watchlist
- recent market/news relevance
- portfolio health score
- two or three “storylines”

Example storylines:
- overexposed to US tech
- high idle cash
- recent drawdown in one holding
- upcoming goal funding gap
- market news tied to owned names

This is what makes the chat feel smart on day 1.

---

## 15. Frontend design for v1

Use the existing Ada UI style where possible.

## Core screens
- `/ada/chat`
- `/ada/wealth`
- `/ada/discover`
- `/ada/collective`

But v1 should center on:
- chat pane
- context header
- portfolio summary rail
- insight cards
- source/citation drawer
- action buttons

## Chat behavior
When user asks a question:
- stream text immediately
- show “data chips” as tools resolve
- show cards for:
  - portfolio summary
  - top movers
  - news
  - health score
  - advisor handoff

## Important
Do not render only prose.  
Render `AdaAnswer` sections into UI components.

---

## 16. Prompt architecture

Use a prompt assembly pipeline, not one static system prompt.

## Prompt blocks
1. base assistant identity
2. tenant behavior block
3. policy block
4. tool-use rules
5. grounding rules
6. answer contract
7. current runtime context
8. user request

## Base instruction shape

```xml
<role>
You are Ada, a wealth copilot for a regulated financial institution.
Your job is to provide grounded, policy-compliant, concise but useful guidance.
</role>

<core_rules>
- Never invent financial figures, holdings, prices, or account facts.
- Use tools for portfolio, market, banking, news, and policy information.
- If data needed for a claim is missing, say what is missing.
- Distinguish clearly between facts, interpretation, education, and suggestions.
- Do not exceed the allowed advice level in policy context.
</core_rules>

<tool_rules>
- Use only the tools provided in this request.
- Prefer parallel read calls when dependencies do not exist.
- Do not call write/action tools unless explicitly needed and allowed.
- If a tool fails, continue with available evidence and mention limitations.
</tool_rules>

<grounding_rules>
- Portfolio claims must be based on portfolio tools or wealth-engine outputs.
- Market claims must be based on market tools.
- News claims must be based on news tools.
- Policy statements must be based on policy decision inputs.
- Add citations for every material factual claim.
</grounding_rules>

<answer_contract>
- Return valid JSON matching the AdaAnswer schema.
- Keep the headline short.
- Keep the summary clear and premium in tone.
- Put the most decision-useful points first.
- Include disclosures when policy requires them.
- If recommendations are not allowed, provide education or next-best-actions only.
</answer_contract>
```

---

## 17. Model strategy

Use at least 2 model paths.

### Fast path
Use a smaller model for:
- intent classification
- tool routing for simple asks
- compact summaries
- extraction / normalization

### Deep path
Use stronger model for:
- multi-tool synthesis
- portfolio explanation
- nuanced advisory framing
- long analytical answers

Keep reasoning effort low or none by default for fast paths, and only raise it for analytical/advisory paths after evals prove it helps.

---

## 18. Caching and latency plan

### Cache these
- tenant config
- user profile
- risk profile
- latest portfolio snapshot
- latest holdings
- latest health score
- market digest
- news relevance results

### Precompute daily
- portfolio health
- concentration flags
- cash insights
- top movers
- risk drift
- personalized daily digest

### Latency rules
- time to first token target: < 1.5s for common asks
- full instant answers: < 4s
- deeper analysis: < 8–12s

### Design rules
- keep shared prompt prefix stable
- put dynamic content later
- parallelize read tools
- avoid multiple unnecessary LLM hops

---

## 19. Traceability and observability

Log every run with:
- conversation id
- message id
- tenant id
- user id
- intent classification
- policy decision
- model name
- reasoning effort
- tool set exposed
- tool calls made
- tool inputs
- tool outputs
- final answer JSON
- response timings
- guardrail interventions
- escalation decisions

Keep a replay page in admin later.

---

## 20. Evals from day 1

Create a test suite of 30–50 cases.

### Categories
- simple balance/portfolio questions
- holdings explanation
- why portfolio changed
- news relevance
- unsupported data requests
- recommendation request when policy forbids recommendations
- recommendation request when policy allows next-best-actions only
- missing-data graceful handling
- tool failure fallback
- advisor escalation cases

### Score dimensions
- groundedness
- policy compliance
- correct tool choice
- latency
- completeness
- clarity
- citation presence

---

## 21. Security and safety controls

Implement now:
- tenant isolation
- account-level authorization checks inside tools
- request-scoped allowed tool set
- no raw secrets in prompt context
- prompt injection hardening for external content
- write tools off by default
- advisor handoff instead of execution for sensitive requests
- stale-data warning handling
- kill switch via feature flags

---

## 22. Phase plan

## Phase 0 — setup
Goal: skeleton app running on Replit

Deliver:
- Next.js app scaffold
- DB connected
- auth stub
- tenant/user seed
- basic tabs
- chat page shell

## Phase 1 — core agent spine
Goal: one working grounded chat loop

Deliver:
- chat API with streaming
- session/context assembler
- policy evaluator
- intent classifier
- OpenAI Responses integration
- structured answer schema
- trace logging

## Phase 2 — wealth intelligence
Goal: agent becomes genuinely useful

Deliver:
- portfolio snapshot tool
- holdings tool
- quotes tool
- holdings-relevant news tool
- deterministic health engine
- summary + cards rendering

## Phase 3 — productized response experience
Goal: rich grounded UX

Deliver:
- health card
- portfolio card
- news card
- citations drawer
- advisor handoff action
- watchlist action

## Phase 4 — realism and robustness
Goal: pilot-worthy prototype

Deliver:
- richer mock data
- failure handling
- caching
- conversation summaries
- daily digest precompute
- eval suite
- admin trace viewer

## Phase 5 — advisory configurability
Goal: multi-tenant/policy depth

Deliver:
- multiple policy profiles
- multiple tenants
- product universe hooks
- next-best-action mode
- RM escalation workflows

---

## 23. The exact build order inside Replit

1. Scaffold Next.js app and packages folder  
2. Add DB and schema  
3. Seed tenants, users, profiles, portfolios, holdings, news  
4. Build `/api/chat` route with streaming  
5. Build `AdaAnswer` schema  
6. Build intent router  
7. Build policy engine  
8. Build 4 initial tools:
   - getPortfolioSnapshot
   - getHoldings
   - getQuotes
   - getHoldingsRelevantNews
9. Build deterministic health engine  
10. Wire orchestrator to Responses API  
11. Render answer sections in UI  
12. Log traces  
13. Add daily precompute job or startup seed refresh  
14. Add eval fixtures

---

## 24. First tools to implement

Implement these first and no more:

### 1) getPortfolioSnapshot
Returns:
- total value
- daily change
- cash %
- invested %
- unrealized P&L
- top movers

### 2) getHoldings
Returns:
- instrument
- quantity
- market value
- weight
- sector
- geography
- asset class

### 3) getQuotes
Returns:
- last price
- daily change %
- timestamp

### 4) getHoldingsRelevantNews
Returns:
- symbol
- title
- summary
- publisher
- published_at
- relevance_score

### 5) calculatePortfolioHealth
Returns:
- score
- main flags
- strengths
- concerns

These 5 are enough for a compelling first Ada experience.

---

## 25. Initial routes/endpoints

```text
GET  /api/session
POST /api/chat
GET  /api/portfolio/:id/summary
GET  /api/portfolio/:id/holdings
GET  /api/news/relevant?portfolioId=...
POST /api/advisor-handoff
GET  /api/traces/:conversationId
```

---

## 26. Suggested environment variables

```bash
OPENAI_API_KEY=
DATABASE_URL=
APP_ENV=development
DEFAULT_TENANT_ID=bank_demo_uae
NEWS_PROVIDER_MODE=mock
MARKET_PROVIDER_MODE=mock
PORTFOLIO_PROVIDER_MODE=mock
ENABLE_AGENT_TRACING=true
ENABLE_ADVISOR_HANDOFF=true
ENABLE_RECOMMENDATIONS=false
```

Keep providers mock-first, then swap one by one.

---

## 27. Suggested mock provider strategy

Create provider adapters with a common interface.

```ts
interface PortfolioProvider {
  getPortfolioSnapshot(userId: string, portfolioId: string): Promise<ToolResult<PortfolioSnapshot>>;
  getHoldings(userId: string, portfolioId: string): Promise<ToolResult<Holding[]>>;
}

interface MarketProvider {
  getQuotes(symbols: string[]): Promise<ToolResult<Quote[]>>;
}

interface NewsProvider {
  getHoldingsRelevantNews(symbols: string[]): Promise<ToolResult<NewsItem[]>>;
}
```

Implement:
- `mock-*` first
- `real-*` later

This lets you move from seeded realism to live APIs cleanly.

---

## 28. Copy-paste Replit build prompt

Paste the below into Replit Agent as your master instruction:

```text
Build a production-structured prototype called Ada Wealth Agent as a TypeScript monorepo.

Tech choices:
- Next.js 15 + React + TypeScript + Tailwind + shadcn/ui
- packages-based monorepo
- managed PostgreSQL
- OpenAI Responses API for chat agent runtime
- Zod for schema validation
- streaming chat responses
- mock-first providers for portfolio, market, and news data

Main objective:
Create a real working wealth copilot prototype, not just UI. It must support:
1) chat-first streaming experience
2) policy/config-driven behavior
3) tool calling
4) deterministic portfolio-health analysis
5) realistic seeded financial data
6) structured answer rendering
7) trace logging

Architecture requirements:
- Separate UI, agent-core, policy, tools, wealth-engine, and data layers
- Use a strict JSON schema for the assistant response object
- Do not let the LLM invent portfolio or market facts
- Build policy controls outside the prompt
- Build providers behind interfaces so mock data can later be swapped for real APIs
- Log conversations, tool runs, policy decisions, and agent traces to the DB

Create this repo structure:
apps/web
packages/agent-core
packages/wealth-engine
packages/tools
packages/policy
packages/data
packages/shared
docs

Implement first:
- DB schema
- seed scripts with realistic users, profiles, portfolios, holdings, transactions, and news
- /ada/chat page
- /api/chat route with streaming
- AdaAnswer Zod schema
- intent classifier
- policy evaluator
- tools:
  - getPortfolioSnapshot
  - getHoldings
  - getQuotes
  - getHoldingsRelevantNews
  - calculatePortfolioHealth
- basic cards in the UI for summary, health, and news
- traces table and trace logging

Important behavior:
- Use structured responses from the model
- Render answer sections as UI cards
- Provide graceful fallback when a tool fails
- Keep recommendations disabled by default
- Support advisor handoff CTA
- Keep code modular and production-like
- Add README and architecture docs

Start by scaffolding the repo, DB schema, seed data, and chat route.
Then wire the agent orchestration and initial tools.
Then build the UI rendering of the structured answer.
```

---

## 29. What I would do with your existing Ada code

Do **not** throw it away immediately.

Use this rule:
- preserve visual components and layout patterns,
- rebuild data/state/orchestration layers underneath,
- remove brittle fake logic,
- refactor each tab to consume structured server data.

In practice:
- keep presentational components,
- rebuild chat runtime,
- rebuild wealth cards,
- use adapters for mock and live data.

If the current codebase is tangled, fork it and create:
- `legacy-ui/` reference branch
- new `ada-agent-v2/` implementation branch

---

## 30. Best immediate next step

Start with:
- repo scaffold
- DB schema
- 6 seeded personas
- chat API with structured answer schema
- first 5 tools
- one truly excellent “portfolio health” chat flow

That gives you the first credible Ada.
