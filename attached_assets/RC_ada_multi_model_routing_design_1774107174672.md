# Ada Wealth Copilot — Multi-Model Routing & AI Agent Performance Design

Version: 1.0  
Date: 2026-03-21  
Owner: Ada Wealth Copilot / Architecture  
Status: Final design draft

---

## 1. Executive summary

Ada should be built as a **deterministic-first financial copilot** with a **multi-model control plane** above several execution lanes.

The control plane decides, per request:

1. whether the task should be solved without an LLM at all
2. whether the task needs a fast language model, a reasoning model, or a long-context specialist
3. whether the work should run synchronously or in background mode
4. what evidence, tools, and memory should be attached
5. what risk controls, validation, and response contracts must apply

### Core design principle

**Financial truth stays in code.**

Portfolio values, performance, attribution, benchmark comparisons, concentration, suitability rules, account permissions, and workflow actions should come from deterministic systems. The LLM should primarily:

- explain
- summarize
- synthesize
- compare
- structure
- narrate
- coordinate tool usage
- generate user-appropriate wording

### Why this design

This architecture optimizes for:

- **correctness** in financial outputs
- **speed** for common user interactions
- **cost efficiency** through selective model usage and caching
- **maintainability** through clean control-plane separation
- **compliance** through grounded evidence and policy validation
- **future flexibility** through provider abstraction

### Main recommendation

Build Ada with five lanes:

- **Lane 0: Deterministic** — portfolio math, rules, workflows, analytics
- **Lane 1: Fast language** — default chat, summaries, formatting, lightweight explanations
- **Lane 2: Reasoning** — scenario analysis, deeper synthesis, multi-step advisory work
- **Lane 3: Long-context / specialist** — long documents, large research context, multimodal-heavy tasks
- **Lane 4: Async/background** — slow jobs, digests, prep packs, backfills, evals

OpenAI’s current platform guidance makes the Responses API the recommended forward path for new projects, with support around stateful workflows, background mode, compaction, prompt caching, and modern model orchestration. Prompt caching can reduce latency by up to 80% and input costs by up to 90% for repeated prefixes, and the Assistants API is deprecated with shutdown scheduled for 2026-08-26. See references R1, R2, R3, R4.

---

## 2. Design objectives

### 2.1 Primary objectives

1. **Correct financial answers**
   - Never allow free-form model outputs to replace portfolio math or policy engines.

2. **Fast user experience**
   - Make common chat and tab interactions feel immediate.
   - Use streaming and precomputation to improve perceived speed.

3. **Low average cost**
   - Route the majority of requests to deterministic or fast-model paths.
   - Reserve high-cost reasoning for a small percentage of turns.

4. **Robust risk handling**
   - Apply stricter routing, grounding, and validation for sensitive outputs.

5. **Provider flexibility**
   - Keep an internal alias layer so providers can be swapped without rewriting app logic.

### 2.2 Secondary objectives

- Better advisor workflows
- Strong telemetry and eval loops
- Good future extensibility for collective/advisor features
- Compliance-friendly operating modes
- Easy implementation path in Replit / Git-based workflow

---

## 3. Non-goals

The following should **not** be part of v1 design assumptions:

- a fully autonomous agent that executes trades
- free-form portfolio calculations in natural language
- a model-only architecture with no deterministic control plane
- exposing all tools to every request
- keeping entire chat histories uncompressed forever
- using the most powerful model for all traffic
- optimizing for benchmark demos at the expense of production reliability

---

## 4. Guiding principles

### 4.1 Deterministic first

If a request can be answered through code, rules, search, or structured retrieval, do that first.

Examples:

- “What is my portfolio value today?” → deterministic
- “Show me my worst 5 positions this month” → deterministic
- “Am I over-concentrated in US tech?” → deterministic metrics + language explanation
- “Why is this risky?” → deterministic evidence + model explanation

### 4.2 Evidence before narrative

The model should receive a structured evidence pack, not raw uncontrolled context.

### 4.3 Route by task shape, not model hype

The router should look at:

- determinism need
- risk level
- freshness requirement
- context size
- tool count
- latency target
- response contract
- channel
- user tier

### 4.4 Split reasoning from rendering

Use more capable models for analysis only when needed. Use cheaper/faster models to render polished final text.

### 4.5 Make caching and compaction first-class

Stable prefixes, compact session state, and deferred tool exposure are not optional optimizations; they are part of core architecture.

### 4.6 Fewer active tools per task

Large tool menus increase cost, latency, and error rates.

### 4.7 Policy and validation around high-risk outputs

Financial and compliance-sensitive responses require routing and verification rules stronger than general chat.

---

## 5. System architecture

```text
Client Apps (Home / Wealth / Discover / Collective / Chat)
        |
        v
API Gateway / Session Service
        |
        v
Ada Control Plane
  - intent classifier
  - complexity scorer
  - risk classifier
  - freshness detector
  - route policy engine
  - SLA / budget policy
        |
        +---------------------------+
        |                           |
        v                           v
Deterministic Service Bus           LLM Orchestrator
  - portfolio engine                - provider adapters
  - pricing engine                  - model lane manager
  - benchmark engine                - tool registry
  - goals engine                    - context builder
  - policy/rules engine             - cache manager
  - CRM/workflow adapters           - compactor
        |                           - fallback manager
        +-------------+-------------+
                      |
                      v
              Evidence Pack Builder
         - portfolio snapshot
         - computed metrics
         - retrieved news/docs
         - permissions/policy state
         - citation metadata
                      |
                      v
               Validation Pipeline
         - schema
         - grounding
         - policy
         - safety/risk
                      |
                      v
                Response Renderer
         - prose
         - cards/charts
         - suggested actions
         - advisor handoff
```

### 5.1 Main components

#### A. Client apps

Channels:
- Home
- Wealth
- Discover
- Collective
- Chat

These should pass channel metadata to the control plane because routing behavior differs by context.

#### B. API gateway / session service

Responsibilities:
- auth/session
- rate limiting
- request normalization
- thread/session lookup
- region/tenant routing
- observability correlation IDs

#### C. Ada control plane

The most important service in the system.

Responsibilities:
- classify intent
- score complexity
- classify sensitivity/risk
- estimate context size
- enforce deterministic-first routing
- set model lane and effort
- decide sync vs background
- decide required validations

#### D. Deterministic service bus

Responsibilities:
- portfolio analytics
- valuations
- attribution
- benchmark comparisons
- goal projections
- account/rules/eligibility decisions
- CRM actions and workflow actions

This service must be the source of truth for all financial calculations.

#### E. LLM orchestrator

Responsibilities:
- provider abstraction
- lane-to-model mapping
- prompt assembly
- selective tool exposure
- structured output enforcement
- streaming orchestration
- retries and fallbacks
- summarization/compaction

#### F. Evidence pack builder

Responsibilities:
- unify deterministic outputs + retrieved content
- build model-facing structured payloads
- attach citations / provenance
- ensure all critical claims are traceable

#### G. Validation pipeline

Responsibilities:
- schema validation
- grounding verification
- policy validation
- suitability/safety checks
- escalation when invalid

---

## 6. Lane design

## 6.1 Lane 0 — Deterministic

### Purpose
For tasks that should be solved directly by code, data systems, or rules.

### Typical tasks
- current valuation
- unrealized/realized P&L
- return metrics
- allocation summaries
- risk flags
- benchmark calculations
- goal progress
- rebalancing threshold checks
- notifications
- workflow actions
- advisor handoff ticketing

### Output type
Structured JSON first; optional natural-language rendering second.

### Examples
- “What changed in my portfolio today?”
- “What are my top 10 positions?”
- “Am I above my single-stock concentration limit?”
- “Create a follow-up task for my advisor.”

### Policy
If finance math or rules are central to the answer, start here.

---

## 6.2 Lane 1 — Fast language

### Purpose
Default user-facing conversation lane for short-form, high-volume, low-latency interactions.

### Typical tasks
- lightweight explanations
- daily summaries
- answer formatting
- rephrasing deterministic outputs
- quick market recaps
- follow-up prompts
- UI helper copy
- guided navigation across tabs

### Constraints
- should avoid long tool loops
- should avoid deep reasoning unless absolutely necessary
- should rely on already assembled evidence where possible

### Examples
- “Explain cash drag in simple terms.”
- “Summarize today’s portfolio moves.”
- “What does this chart mean?”
- “Give me the short version.”

---

## 6.3 Lane 2 — Reasoning

### Purpose
Used only when the task truly benefits from deeper multi-step reasoning.

### Typical tasks
- why performance lagged benchmark
- scenario analysis
- trade-off analysis across goals and risk
- richer portfolio diagnostics
- multi-source synthesis
- deeper advisor preparation
- comparing multiple strategic actions

### Examples
- “Why did my portfolio underperform this month?”
- “How would a 10% drop in US tech affect my goal timeline?”
- “Compare staying invested vs raising cash for my medium-term goals.”

### Rule
Lane 2 must consume deterministic metrics and evidence first. It should not generate unsupported calculations.

---

## 6.4 Lane 3 — Long-context / specialist

### Purpose
Handle very large contexts, long documents, large research packs, or multimodal-heavy tasks.

### Typical tasks
- statement review
- prospectus review
- long research note synthesis
- policy document comparison
- document-grounded Q&A over large corpora
- transcript analysis
- multimodal review

### Examples
- “Summarize this 80-page fund prospectus for me.”
- “Compare these two policy documents and flag material differences.”
- “Review these advisor meeting notes and suggest next steps.”

### Rule
Use only when context size or task shape justifies it.

---

## 6.5 Lane 4 — Async/background

### Purpose
Handle slow tasks without blocking the live user experience.

### Typical tasks
- overnight prep packs
- weekly digest generation
- issuer/news enrichment
- eval runs
- batch summarization
- advisor pre-meeting packages
- historical backfills

### Examples
- overnight “client prep pack” build
- “generate weekly personalized market digest”
- “refresh ranked explainers for all client portfolios”

### Rule
Anything expected to be slow, expensive, or batch-friendly should move here.

---

## 7. Routing policy

## 7.1 Request scorecard

Each request should be normalized into a scorecard:

```json
{
  "intent": "portfolio_explanation | market_summary | scenario_analysis | crm_action | doc_review | research | workflow",
  "requires_deterministic_math": true,
  "requires_fresh_data": true,
  "freshness_window_minutes": 15,
  "risk_level": "low | medium | high",
  "context_size_estimate": 18000,
  "tool_count_estimate": 2,
  "latency_target_ms": 2500,
  "output_contract": "free_text | bullets | json | ui_cards",
  "user_tier": "mass_affluent | priority | advisor_internal",
  "channel": "chat | home | wealth | discover | collective"
}
```

## 7.2 Decision rules

### Hard rules

1. If `requires_deterministic_math = true` → Lane 0 first.
2. If the request involves a workflow action → Lane 0 or Lane 0 + Lane 1.
3. If `risk_level = high` and the answer is advisory/suitability-sensitive → Lane 2 with validation.
4. If `context_size_estimate > threshold` or intent = `doc_review`/`research` → Lane 3.
5. If expected runtime is long or the job is periodic → Lane 4.

### Pseudocode

```ts
export type Lane = "lane0" | "lane1" | "lane2" | "lane3" | "lane4";

export function route(req: Task): Lane {
  if (req.requiresDeterministicMath || req.intent === "crm_action" || req.intent === "workflow") {
    return "lane0";
  }

  if (req.isAsync || req.expectedDurationSec > 10) {
    return "lane4";
  }

  if (req.contextSizeEstimate > 120000 || req.intent === "doc_review" || req.intent === "research") {
    return "lane3";
  }

  if (req.riskLevel === "high" || req.intent === "scenario_analysis" || req.toolCountEstimate >= 3) {
    return "lane2";
  }

  return "lane1";
}
```

## 7.3 Observable escalation triggers

Prefer escalation based on concrete signals, not vague self-confidence.

### Escalate from Lane 1 to Lane 2 when:
- schema validation fails
- retrieval coverage is weak
- user asks for scenario/trade-off analysis
- compliance-sensitive topic appears
- tool loop count exceeds threshold
- evidence pack shows multiple competing drivers

### Escalate from Lane 2 to Lane 3 when:
- context exceeds token limit
- document set too large
- multimodal inputs are required
- repeated truncation risk is detected

### Escalate to human/advisor when:
- policy uncertainty remains
- user requests regulated advice beyond allowed scope
- suitability decision requires missing data
- model output repeatedly fails grounding/policy checks

---

## 8. Channel-by-channel application

## 8.1 Home tab

### Design
Home should feel instant. Most content should be **precomputed**.

### Flow
1. Intraday services precompute portfolio snapshot and deltas.
2. Alert engine ranks meaningful changes.
3. News relevance engine maps content to holdings/watchlist.
4. Home request calls deterministic snapshot APIs.
5. Lane 1 generates concise summary and narration.
6. UI renders cards, headlines, and short explanations.

### Expected lane usage
- 70–90% Lane 0 + Lane 1
- rare Lane 2 for follow-up analysis

---

## 8.2 Wealth tab

### Design
Wealth is the heaviest mix of deterministic truth and analytical explanation.

### Flow examples

#### Portfolio overview
- Lane 0 for valuation, allocation, P&L, exposures
- Lane 1 for concise explanation

#### Health check
- Lane 0 for metrics, thresholds, gaps, scoring
- Lane 2 for prioritization of issues and next best actions

#### Goal analysis
- Lane 0 for projections
- Lane 2 for trade-off reasoning across scenarios

---

## 8.3 Discover tab

### Design
Discover should use deterministic ranking and fast summarization.

### Flow
1. Retrieve relevant news/events
2. Score by relevance/freshness/impact
3. Lane 1 summarizes
4. Escalate to Lane 2 only when the user asks implication-oriented questions

### Example
- “What market news matters for me today?” → ranking + Lane 1
- “What does this mean for my concentrated tech exposure?” → Lane 2

---

## 8.4 Collective / advisor flows

### Design
Advisor-oriented work should lean on asynchronous prep and compact evidence packs.

### Examples
- pre-meeting brief
- post-meeting follow-up draft
- client risk summary
- portfolio commentary pack

### Expected lane usage
- background precompute in Lane 4
- live synthesis in Lane 1 / Lane 2

---

## 8.5 Chat surface

### Design
Do not bind a thread to a single model forever.

A single thread may contain:
- quick UX help → Lane 1
- portfolio query → Lane 0 + Lane 1
- scenario analysis → Lane 2
- document review → Lane 3
- weekly digest request → Lane 4

The router should run every turn.

---

## 9. Provider strategy and model abstraction

## 9.1 Internal aliases

Use stable internal aliases, not vendor/model names inside product logic:

- `ada-fast`
- `ada-reason`
- `ada-longctx`
- `ada-async`

## 9.2 Recommended provider approach

### Primary control plane
Use OpenAI Responses as the primary orchestration surface because it currently unifies stateful interactions, background mode, compaction, streaming, modern reasoning controls, and the recommended path for new projects. See R1, R3, R4.

### Optional specialist fallback
Keep support for:
- Anthropic for some long-context/tool-use patterns
- Gemini for explicit caching or particular multimodal/research workflows

### Deterministic truth
No provider should replace deterministic finance systems.

## 9.3 Suggested mapping example

| Internal alias | Primary purpose | Default provider pattern |
|---|---|---|
| `ada-fast` | high-volume chat, summaries, rendering | low-latency general model |
| `ada-reason` | multi-step reasoning, analysis | reasoning model |
| `ada-longctx` | document/research-heavy work | long-context specialist |
| `ada-async` | batch/overnight/background | cheaper async-capable model or flex path |

Note: keep the exact provider/model mapping configurable through environment or admin settings.

---

## 10. Evidence pack design

The LLM should receive a structured evidence pack rather than raw ungoverned prompt text.

## 10.1 Evidence pack schema

```json
{
  "task": {
    "type": "scenario_analysis",
    "channel": "wealth",
    "response_style": "advisor_brief"
  },
  "user_context": {
    "risk_profile": "balanced",
    "base_currency": "AED",
    "investment_policy": "cached_ref:user_ips_v3"
  },
  "portfolio_snapshot": {
    "valuation_ts": "2026-03-21T10:05:00Z",
    "total_value": 3250000,
    "cash_pct": 0.18,
    "top_concentrations": ["NVDA", "US Tech", "USD FX"]
  },
  "computed_metrics": {
    "period_return_1m": -0.028,
    "benchmark_return_1m": -0.011,
    "tracking_gap": -0.017,
    "drivers": []
  },
  "retrieval": {
    "news_items": [],
    "documents": [],
    "citations": []
  },
  "constraints": {
    "must_not_give_trade_instruction": true,
    "must_ground_to_evidence": true
  }
}
```

## 10.2 Evidence pack design rules

- deterministic metrics always precede free text
- every critical claim must be traceable
- stale timestamps must be explicit
- large documents should be chunked/retrieved, not blindly pasted
- the pack should include policy flags for the validator

---

## 11. Memory and context architecture

Use four layers of memory.

## 11.1 M1 — Durable profile memory

Examples:
- preferred language/tone
- advisor linkage
- permissions
- recurring preferences
- user segment

## 11.2 M2 — Durable financial/policy memory

Examples:
- investment policy statement
- advisory constraints
- product suitability rules
- house-view policy snippets
- regulatory response restrictions

## 11.3 M3 — Session compact memory

Examples:
- what was asked
- what was answered
- unresolved follow-ups
- entities currently in focus
- chosen scenario assumptions

## 11.4 M4 — Live volatile evidence

Examples:
- latest prices
- latest benchmark levels
- latest holdings snapshot
- latest ranked news
- live market events

## 11.5 Compaction policy

Compact after:
- 8–12 turns
- any completed task
- major topic switch
- token threshold breach

### Compaction output should preserve
- current user objective
- facts established in-session
- decisions made
- open questions
- entities in scope
- policy/risk flags

### Compaction should discard or minimize
- conversational filler
- repeated acknowledgements
- obsolete tool traces
- redundant restatements

OpenAI’s Responses guidance now includes compaction as part of the recommended run-and-scale workflow; Anthropic’s context-window docs likewise recommend server-side compaction as the primary strategy for long-running conversations. See R1, R9.

---

## 12. Prompt architecture

## 12.1 Prompt order

Structure prompt content to maximize cache hits:

1. stable system instructions
2. stable response contracts / schema
3. stable tool definitions
4. stable policy / IPS content
5. compact session state
6. volatile evidence pack
7. current user message

## 12.2 Why this matters

Prompt caching works best when large repeated prefixes are identical. OpenAI’s prompt caching guide says it can reduce latency by up to 80% and input costs by up to 90% for repeated prefixes; it also emphasizes exact prefix matching. See R2, R5.

Anthropic’s docs say tools, system messages, documents, tool use, and tool results can also participate in prompt caching; Gemini documents explicit caching as well. See R8, R10.

## 12.3 Prompt anti-patterns

Avoid:
- giant unstable system prompts with lots of per-request changes
- injecting large volatile data before stable instructions
- exposing every tool every turn
- keeping the full raw chat forever
- mixing customer-facing wording instructions with internal control logic in messy ways

---

## 13. Tooling design

## 13.1 Tool groups

Expose only the relevant tool group for the task:

1. `financial_data`
2. `crm_actions`
3. `documents`
4. `market_intel`

## 13.2 Tool exposure rules

### Example
- Portfolio question → `financial_data`
- Meeting prep → `financial_data` + `documents` + maybe `crm_actions`
- Discover summary → `market_intel`
- Account action → `crm_actions`

## 13.3 Tool governance rules

- no duplicate tools with overlapping semantics unless necessary
- each tool must have precise descriptions and clear argument schemas
- server-side tools preferred for sensitive or action-taking operations
- all tools should return machine-readable structured outputs

OpenAI’s latest model guide documents `tool_search` and deferred tool loading as ways to reduce token usage and improve tool selection in larger ecosystems. See R3.

---

## 14. Performance optimization design

## 14.1 The highest-impact levers

1. deterministic-first architecture
2. precomputed portfolio intelligence
3. stable prompt prefixes for cache hits
4. context compaction
5. deferred tool exposure
6. parallel retrieval
7. split reasoning from rendering
8. async/background for slow jobs

## 14.2 Precompute where possible

Precompute:
- daily portfolio aggregates
- exposure rollups
- risk flags
- goal progress
- benchmark deltas
- issue summaries
- ranked news relevance
- suggested next questions

## 14.3 Parallelize retrieval

Fetch in parallel:
- holdings snapshot
- benchmark metrics
- top movers
- news relevance
- advisor notes
- policy state

Then build the evidence pack once.

## 14.4 Separate analysis from final wording

Pattern:
1. Lane 2 or Lane 3 produces structured analysis JSON
2. Lane 1 converts JSON into concise user/advisor wording
3. UI renders charts/cards directly from structured fields

## 14.5 Use reasoning effort deliberately

OpenAI’s latest model guide documents `reasoning.effort` controls, and higher settings trade latency/cost for deeper reasoning. See R3, R6.

Suggested defaults:
- lane1 → none / minimal
- lane2 → low or medium
- lane3 → medium or high when justified
- lane4 → medium/high/xhigh for hard background jobs

## 14.6 Use WebSocket mode for long tool loops if needed

If Ada develops long, tool-heavy orchestration loops, OpenAI’s WebSocket mode can reduce continuation overhead and improve end-to-end latency for repeated tool-call workflows. See R7.

---

## 15. Sync vs async design

## 15.1 Synchronous requests

Use sync for:
- direct chat answers
- Home summaries
- Wealth explanations
- short advisor follow-ups
- most card-generation tasks

## 15.2 Background jobs

Use async for:
- weekly digests
- advisor prep packs
- bulk enrichment
- batch evals
- large document batch summaries
- overnight personalization updates

OpenAI’s background mode is designed for long-running responses, while flex processing is aimed at lower-priority, slower, cheaper workloads. Background mode is not compatible with Zero Data Retention because response state is temporarily stored. See R1, R11.

---

## 16. Safety, compliance, and financial correctness

## 16.1 Hard safety principles

- never let the model become the official calculator
- never allow unsupported portfolio facts
- never imply certainty when evidence is missing
- never bypass policy validation on suitability-sensitive responses
- never execute actions without clear system-side permissions and auditability

## 16.2 High-risk categories

Examples:
- “Should I sell this?”
- product suitability
- concentrated exposure recommendations
- tax/legal style interpretations
- policy-sensitive rebalancing suggestions
- document interpretations with incomplete evidence

These should either:
- route to Lane 2 with validation
- be converted into educational framing
- or be escalated to human/advisor review

## 16.3 Validation stages

1. **Schema validation**
   - required structure present
2. **Grounding validation**
   - claims tied to evidence
3. **Policy validation**
   - wording and scope align to allowed behavior
4. **Safety/risk validation**
   - no prohibited overreach
5. **Final rendering**
   - user/advisor appropriate style

## 16.4 Escalation rules

Escalate to human/advisor when:
- required facts are missing
- policy ambiguity remains
- the task crosses advisory boundaries
- repeated validator failures occur

---

## 17. Telemetry and observability

## 17.1 Log every turn

Capture:
- route selected
- reason for route
- model alias
- provider/model version
- latency
- time to first token
- total duration
- input tokens
- output tokens
- cache hit rate / prompt cache usage
- retrieval coverage
- tool count
- fallback count
- validator results
- user feedback
- downstream action result

## 17.2 Route-level dashboards

Create dashboards by:
- lane
- channel
- intent
- user segment
- provider
- risk level

## 17.3 What to look for

- over-escalation to reasoning lane
- poor cache hit rates
- too many tools exposed
- repeated validator failures
- slow document flows
- low retrieval coverage
- rising cost per successful answer

---

## 18. Evaluation framework

## 18.1 Eval suites

Maintain separate suites for:

1. portfolio explanation accuracy
2. grounding / citation fidelity
3. route correctness
4. tool selection correctness
5. policy/suitability compliance
6. latency and cost
7. session memory correctness
8. advisor workflow usefulness

## 18.2 Golden datasets

Create benchmark datasets for:
- typical retail portfolio queries
- wealth health-check scenarios
- goal trade-off scenarios
- document-heavy prompts
- policy-sensitive prompts

## 18.3 Route evals

For each test prompt, capture:
- expected lane
- acceptable fallback lanes
- maximum allowed latency
- minimum evidence coverage
- required validation outcomes

---

## 19. Data retention, privacy, and operating modes

## 19.1 Standard mode

Use when full feature set is allowed.

Features:
- stateful Responses flows
- prompt caching
- background mode
- compaction
- best overall latency/cost

## 19.2 Strict mode

Use when stronger data-retention constraints apply.

Features:
- `store=false`
- reduced use of stateful features
- no background mode where incompatible
- more client-side/session-side memory handling
- careful use of compaction

OpenAI’s data-controls guide says background mode stores response data roughly long enough to enable polling and is therefore not Zero Data Retention compatible; it also distinguishes how application state is retained in different modes. See R11.

## 19.3 Data classification guidance

Separate:
- customer profile data
- portfolio positions/transactions
- advisor notes
- generated summaries
- telemetry
- prompt/cache artifacts

Only the minimum necessary data should flow into model context.

---

## 20. API and service design

## 20.1 Suggested backend services

- `router-service`
- `portfolio-engine`
- `benchmark-engine`
- `goals-engine`
- `evidence-builder`
- `llm-orchestrator`
- `memory-service`
- `validation-service`
- `telemetry-service`
- `digest-worker`
- `eval-runner`

## 20.2 Example service contract

### Request to router

```json
{
  "sessionId": "sess_123",
  "userId": "user_456",
  "channel": "wealth",
  "message": "Why did my portfolio underperform this month?",
  "latencyTargetMs": 4000
}
```

### Router output

```json
{
  "lane": "lane2",
  "reasoningEffort": "medium",
  "toolGroups": ["financial_data", "market_intel"],
  "requiresValidation": true,
  "requiresFreshData": true,
  "async": false
}
```

### Evidence builder output

```json
{
  "evidencePackId": "ep_789",
  "portfolioSnapshot": {},
  "computedMetrics": {},
  "retrieval": {},
  "constraints": {}
}
```

### Orchestrator output

```json
{
  "analysis": {},
  "renderedText": "Your portfolio lagged mainly because...",
  "cards": [],
  "citations": [],
  "validator": {
    "schema": "pass",
    "grounding": "pass",
    "policy": "pass"
  }
}
```

---

## 21. Data model sketch

## 21.1 Core entities

### UserProfile
- id
- segment
- baseCurrency
- riskProfile
- advisorId
- permissions
- preferences

### SessionState
- sessionId
- compactSummary
- entitiesInFocus
- lastLane
- lastEvidencePackId
- openTasks

### PortfolioSnapshot
- snapshotId
- userId
- timestamp
- valuation
- holdingsSummary
- exposures
- alerts

### EvidencePack
- evidencePackId
- taskType
- channel
- deterministicRefs
- retrievalRefs
- policyFlags
- freshnessMetadata

### RouteLog
- routeId
- sessionId
- requestId
- lane
- rationale
- provider
- modelAlias
- latency
- tokenStats
- validationStats

---

## 22. Replit-friendly implementation stack

### Backend
- TypeScript / Node.js
- Fastify or Express
- Redis for hot cache/session metadata
- Postgres for durable state
- pgvector for retrieval
- queue system for async jobs
- object storage for documents

### Frontend
- tab-aware React app
- streaming chat renderer
- card-first response patterns
- entity-aware follow-up prompts

### Infra principles
- environment-based provider mapping
- secrets per provider
- observability with correlation IDs
- background workers separated from live API

---

## 23. Example TypeScript interfaces

```ts
export type Channel = "home" | "wealth" | "discover" | "collective" | "chat";
export type Lane = "lane0" | "lane1" | "lane2" | "lane3" | "lane4";
export type RiskLevel = "low" | "medium" | "high";

export interface UserRequest {
  sessionId: string;
  userId: string;
  channel: Channel;
  message: string;
  latencyTargetMs?: number;
}

export interface RouteDecision {
  lane: Lane;
  rationale: string[];
  reasoningEffort?: "none" | "low" | "medium" | "high" | "xhigh";
  toolGroups: string[];
  requiresValidation: boolean;
  requiresFreshData: boolean;
  async: boolean;
}

export interface EvidencePack {
  id: string;
  taskType: string;
  channel: Channel;
  userContext: Record<string, unknown>;
  portfolioSnapshot?: Record<string, unknown>;
  computedMetrics?: Record<string, unknown>;
  retrieval?: Record<string, unknown>;
  constraints?: Record<string, unknown>;
}

export interface ValidationResult {
  schema: "pass" | "fail";
  grounding: "pass" | "fail";
  policy: "pass" | "fail";
  notes?: string[];
}
```

---

## 24. Example orchestration flow

### Use case
User asks: “Why did my portfolio underperform this month?”

### Flow
1. Gateway receives request.
2. Router classifies intent as `scenario_analysis` / `performance_explanation`.
3. Router detects deterministic metrics required and moderate reasoning required.
4. Deterministic engines compute:
   - monthly return
   - benchmark return
   - sector attribution
   - currency effect
   - top contributors/detractors
5. Evidence pack builder merges those outputs with relevant market/news context.
6. Lane 2 model creates structured analysis JSON.
7. Validation checks grounding and policy.
8. Lane 1 rewrites into concise client-facing wording if needed.
9. UI renders text + contributor/detractor cards.
10. Telemetry is logged.

---

## 25. SLAs and budgets

## 25.1 Suggested targets

### Home
- p50 under 1.5s
- p95 under 3s
- mostly precomputed

### Standard chat summary
- p50 under 2s
- p95 under 5s

### Wealth reasoning response
- p50 under 4s
- p95 under 8s

### Long document answer
- sync if short enough, otherwise background

### Background jobs
- complete within job-specific windows

## 25.2 Budget rules

- default to lowest-cost sufficient lane
- cap reasoning-lane usage as a percentage of traffic
- alert when cost per successful answer rises beyond threshold
- monitor cache hit rates because they materially affect economics

---

## 26. Failure handling and fallbacks

## 26.1 Fallback patterns

### Provider timeout
- retry same lane on backup provider if configured
- or downgrade response with partial evidence if acceptable

### Tool failure
- retry tool, not whole conversation, where possible
- surface limitation transparently

### Retrieval failure
- avoid fabricated answers
- produce “limited by available evidence” response
- invite narrower follow-up or advisor review

### Validator failure
- retry with stricter constraints
- escalate lane if needed
- suppress response if policy-critical

## 26.2 Degraded-mode strategy

If market/news retrieval is down:
- continue with portfolio snapshot only
- clearly state the time boundary and missing external context

If long-context provider unavailable:
- offer partial summary from retrieved excerpts
- queue background completion if appropriate

---

## 27. Rollout plan

## 27.1 Phase 1 — Correctness foundation

Build first:
- Lane 0 deterministic engines
- Lane 1 and Lane 2 routing
- evidence pack builder
- basic validators
- telemetry foundation
- compact session memory

### Success criteria
- portfolio explanation accuracy stable
- deterministic outputs fully trusted
- routing works for common chat/wealth flows

## 27.2 Phase 2 — Cost and speed optimization

Add:
- prompt caching optimization
- precomputed Home/Discover content
- deferred tool loading
- split reasoning from rendering
- parallel retrieval
- tighter route thresholds

### Success criteria
- higher cache hit rates
- lower average cost
- better p50/p95 latency

## 27.3 Phase 3 — Long-context and async specialization

Add:
- Lane 3 specialist flows
- Lane 4 background jobs
- advisor prep packs
- document-heavy workflows

### Success criteria
- reliable long-document performance
- usable weekly/background output quality

## 27.4 Phase 4 — Learned optimization

Add:
- learned routing recommender from logs
- route policy tuning using evals
- smarter cost/latency balancing

### Note
Keep hard deterministic and compliance rules fixed even if a learned router is introduced.

---

## 28. Immediate implementation checklist

### Control plane
- [ ] Define intent taxonomy
- [ ] Define risk taxonomy
- [ ] Implement scorecard schema
- [ ] Implement route engine

### Deterministic systems
- [ ] Portfolio engine APIs
- [ ] Benchmark engine APIs
- [ ] Goal projection APIs
- [ ] Rules/policy APIs

### Orchestration
- [ ] Model alias mapping
- [ ] Tool group registry
- [ ] Evidence pack builder
- [ ] Validation pipeline

### Performance
- [ ] Stable prompt prefixes
- [ ] Compaction strategy
- [ ] Cache instrumentation
- [ ] Precompute jobs

### Operations
- [ ] Telemetry schema
- [ ] Eval suite v1
- [ ] Cost dashboard
- [ ] Fallback playbooks

---

## 29. Final recommendation

Ada should be implemented as a **deterministic-first, policy-routed AI system** where:

- code owns financial truth
- the control plane chooses the cheapest adequate lane
- evidence packs constrain model behavior
- prompt architecture is optimized for caching
- long sessions are compacted
- tools are exposed selectively
- high-risk outputs are validated or escalated
- slow work moves to background mode

This design is the best path to making Ada feel:

- faster
- cheaper
- more correct
- more maintainable
- more compliant
- more extensible

---

## 30. References

These references informed the architecture recommendations and platform-specific guidance in this document.

### OpenAI
- **R1. Migrate to the Responses API**  
  https://developers.openai.com/api/docs/guides/migrate-to-responses/

- **R2. Prompt caching guide**  
  https://developers.openai.com/api/docs/guides/prompt-caching/

- **R3. Using GPT-5.4 / latest model guide**  
  https://developers.openai.com/api/docs/guides/latest-model/

- **R4. Assistants migration / deprecation guidance**  
  https://developers.openai.com/api/docs/assistants/migration/

- **R5. Prompt Caching 201**  
  https://developers.openai.com/cookbook/examples/prompt_caching_201/

- **R6. GPT-5.4 model page**  
  https://developers.openai.com/api/docs/models/gpt-5.4

- **R7. WebSocket mode**  
  https://developers.openai.com/api/docs/guides/websocket-mode/

- **R11. Data controls / your data guide**  
  https://developers.openai.com/api/docs/guides/your-data/

### Anthropic
- **R8. Prompt caching**  
  https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

- **R9. Context windows / compaction guidance**  
  https://docs.anthropic.com/en/docs/build-with-claude/context-windows

### Google Gemini
- **R10. Context caching**  
  https://ai.google.dev/gemini-api/docs/caching

---

## 31. Suggested next artifacts

Recommended follow-on files:

1. `ada-routing-policy.yaml`
2. `ada-evidence-pack-schema.json`
3. `ada-telemetry-schema.json`
4. `ada-validator-rules.md`
5. `ada-types.ts`
6. `ada-implementation-roadmap.md`

