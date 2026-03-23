# Ada AI Orchestration Review Pack

> **Version**: 1.0 · **Date**: 2026-03-23 · **Scope**: Complete AI pipeline audit of the Ada wealth copilot

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [Entry Point & API Route](#3-entry-point--api-route)
4. [Agent Orchestrator](#4-agent-orchestrator)
5. [Intent Classifier](#5-intent-classifier)
6. [Model Router](#6-model-router)
7. [Capability Registry](#7-capability-registry)
8. [Policy Engine](#8-policy-engine)
9. [Prompt Builder](#9-prompt-builder)
10. [OpenAI Client & Resilience](#10-openai-client--resilience)
11. [Financial Tools](#11-financial-tools)
12. [Wealth Engine](#12-wealth-engine)
13. [RAG Service](#13-rag-service)
14. [Memory Service](#14-memory-service)
15. [PII Detector](#15-pii-detector)
16. [Guardrails](#16-guardrails)
17. [Response Builder](#17-response-builder)
18. [Trace Logger](#18-trace-logger)
19. [RM Handoff Service](#19-rm-handoff-service)
20. [Provider Registry & Fallback Chains](#20-provider-registry--fallback-chains)
21. [Mock Providers](#21-mock-providers)
22. [Live Providers](#22-live-providers)
23. [Stub Providers](#23-stub-providers)
24. [Provider Cache & Helpers](#24-provider-cache--helpers)
25. [Shared Schemas (agent.ts)](#25-shared-schemas-agentts)
26. [Stream Types & SSE](#26-stream-types--sse)
27. [Legacy aiService.ts](#27-legacy-aiservicets)
28. [Lane 0 Deterministic Path](#28-lane-0-deterministic-path)
29. [Data Flow Diagrams](#29-data-flow-diagrams)
30. [Critical Issues & Technical Debt](#30-critical-issues--technical-debt)
31. [Recommended Improvements](#31-recommended-improvements)

---

## 1. Executive Summary

### Purpose
Provide a high-level overview of the Ada AI orchestration system and its key findings.

### File Location
N/A — cross-cutting summary.

### How It Works
Ada is a mobile-first AI wealth copilot for GCC HNW investors. The system uses a three-lane routing architecture (Lane 0 = deterministic, Lane 1 = fast LLM, Lane 2 = reasoning LLM), a policy engine enforcing advisory boundaries, a deterministic wealth engine for financial math, and a guardrail layer that prevents execution-claiming language. Three demo personas (Aisha/Moderate, Khalid/Conservative, Raj/Aggressive) demonstrate risk-calibrated behavior.

### Key Findings / Issues
- `ada-fast` and `ada-reason` both resolve to `gpt-5-mini` — multi-model routing is nominal
- Portfolio provider is hardcoded to mock with no fallback chain
- Working memory (in-process `Map`) is lost on server restart
- RAG is SQL-only with no vector embeddings
- 6 stub providers return `notImplemented` errors
- `support` intent is declared in schemas but unreachable through the classifier
- Execution boundary is enforced at 3 independent layers (prompt, guardrails, orchestrator fallback)

### Improvement Opportunities
- Differentiate `ada-reason` with a true reasoning model
- Make portfolio provider configurable via fallback chain
- Persist working memory to PostgreSQL or Redis

---

## 2. System Architecture Overview

### Purpose
Describe the end-to-end request flow and component relationships.

### File Location
Cross-cutting — spans `server/services/`, `server/providers/`, `server/routes/`, `shared/schemas/`.

### How It Works

```
User Message (POST /api/chat/stream)
  → PII Scan (piiDetector.ts)
  → Intent Classification (intentClassifier.ts: LLM + keyword fallback)
  → Intent Mapping (mapOldIntentToNew: 7 old → 11 new intents)
  → Session Hydration (tenant config, user profile, risk profile)
  → Policy Evaluation (policyEngine.ts)
  → Route Decision (modelRouter.ts: scorecard → lane + provider)
  → Lane Dispatch:
      Lane 0 → handleLane0() deterministic templates
      Lane 1/2 → LLM streaming with tool calling
  → Data Prefetch (parallel: RAG context, memories, semantic facts, tool pre-runs)
  → Prompt Assembly (promptBuilder.ts)
  → LLM Streaming (up to 3 tool-call turns)
  → Post-Generation Guardrails (guardrails.ts)
  → Response Assembly (responseBuilder.ts → AdaAnswer)
  → Trace Logging (traceLogger.ts)
  → SSE Events to Client
```

### Key Findings / Issues
- Architecture is well-layered with clean separation of concerns
- Each component is independently testable
- The pipeline is sequential — no parallel LLM calls or speculative execution

### Improvement Opportunities
- Consider speculative execution (start Lane 1 in parallel with Lane 0 for upgrade scenarios)

---

## 3. Entry Point & API Route

### Purpose
Handle HTTP requests and connect the API layer to the orchestration pipeline.

### File Location
`server/routes/api.ts` (416 lines)

### How It Works
- Express Router with `asyncHandler` wrapper for error handling
- User identification via `X-User-Id` header, defaulting to `'user-aisha'`
- Chat endpoint: `POST /api/chat/stream` — sets SSE headers (`text/event-stream`, `no-cache`, `keep-alive`, `X-Accel-Buffering: no`), calls `orchestrateStream()`, and writes each event as `data: ${JSON.stringify(event)}\n\n`
- Sync fallback: `POST /api/chat/message` — calls `processMessageSync()` for non-streaming responses
- Morning sentinel: `GET /api/morning-sentinel/stream` — separate SSE endpoint for daily briefing
- Connection cleanup: listens for `req.on('close')` to detect client disconnection and break the event loop
- Other REST endpoints: `/api/users`, `/api/me`, `/api/home/summary`, `/api/wealth/*`, `/api/chat/threads`, `/api/notifications`, `/api/polls/*`, `/api/agent/traces`

### Key Findings / Issues
- No authentication middleware — user ID comes from an unverified header
- Default user ID is hardcoded to `'user-aisha'`
- No rate limiting at the API layer (provider-level rate limiting exists in helpers.ts)
- Agent traces are exposed via `GET /api/agent/traces` with no access control

### Improvement Opportunities
- Add authentication/authorization middleware
- Add API-level rate limiting
- Restrict agent trace access to admin users

---

## 4. Agent Orchestrator

### Purpose
Central orchestration engine that coordinates the full AI pipeline from message intake to response delivery.

### File Location
`server/services/agentOrchestrator.ts` (1,031 lines)

### How It Works
- `orchestrateStream()` is the main entry point — an async generator yielding `StreamEvent`s
- **Step 1**: PII scan on incoming message
- **Step 2**: Intent classification via `buildIntentClassification()` — calls LLM classifier, maps old→new intents, infers reasoning effort and suggested tools
- **Step 3**: Session hydration — parallel fetch of tenant ID, user profile, tenant config
- **Step 4**: Policy evaluation — produces `PolicyDecision` with allowed tools, response mode, escalation flags
- **Step 5**: Route decision — scorecard → `routeRequest()` → lane + provider alias
- **Step 6**: Lane dispatch:
  - Lane 0: `handleLane0()` — deterministic templates (215 lines, lines 228–443)
  - Lane 1/2: Full LLM pipeline with streaming, tool calling, guardrails
- **Step 7**: Data prefetch — parallel: `buildPortfolioContext()`, `getEpisodicMemories()`, `getSemanticFacts()`, `prefetchToolData()`
- **Step 8**: Prompt assembly via `buildAgentPrompt()`
- **Step 9**: LLM streaming with up to 3 tool-call turns (`MAX_TOOL_TURNS = 3`)
- **Step 10**: Post-generation guardrails, disclosures, suggested questions
- **Step 11**: Trace logging, audit logging, memory persistence

Helper functions:
- `mapOldIntentToNew()` — translates 7 classifier intents to 11 routing intents with keyword sub-classification for `portfolio`
- `inferReasoningEffort()` — keyword-based effort classification
- `inferSuggestedTools()` — maps intent to default tool set
- `prefetchToolData()` — pre-runs portfolio snapshot/holdings for eligible intents
- `generateSuggestedQuestions()` — separate LLM call for follow-up suggestions

### Key Findings / Issues
- File is very large (1,031 lines) — would benefit from decomposition
- `handleLane0()` is 215 lines of hardcoded template logic embedded in the orchestrator
- Tools are only offered to the LLM on turn 1 (`turnCount === 1`); subsequent turns process results but cannot request new tools
- Entity keyword detection (line 572-575) upgrades Lane 0 to Lane 1 but uses a hardcoded keyword list
- Episodic memory save (line 1019-1027) uses crude truncation (80 chars × 6 turns, pipe-separated)
- `generateSuggestedQuestions()` adds a full LLM call to every response

### Improvement Opportunities
- Extract `handleLane0()` into its own module
- Allow multi-turn tool calling (pass tools on subsequent turns)
- Use LLM-based summarization for episodic memory
- Consider inlining suggested question generation into the main LLM call

---

## 5. Intent Classifier

### Purpose
Classify user messages into intents for routing decisions.

### File Location
`server/services/intentClassifier.ts` (180 lines)

### How It Works
**Two-tier architecture:**

**Tier 1 — LLM Classification** (`classifyIntentAsync()`):
- Model: `gpt-5-mini` via `resolveModel('ada-fast')`
- Timeout: 3,000ms, retries: 1
- System prompt includes routing context from `capabilityRegistry.getClassifierContext()`
- Output: JSON `{"intent": "<intent>", "confidence": <0.0-1.0>}`
- Classifies into 7 intents: `portfolio`, `goals`, `market`, `scenario`, `recommendation`, `execution_request`, `general`

**Tier 2 — Keyword Fallback** (`classifyIntentFallback()`):
- Activated on: empty LLM content, non-JSON response, invalid intent, or exception
- Uses weighted keyword matching (score = sum of matched keyword string lengths)
- Confidence reduced to 0.5 (parse failure) or 0.4 (exception)
- 6 intent rules with 10-20 keywords each

**Supplementary:**
- `extractTopics()` — keyword-based topic tagging for memory
- `getScenarioType()` — sub-classifies scenario queries (retirement/investment/spending/tax)

### Key Findings / Issues
- The classifier uses 7 old intents that must be translated to 11 new intents in the orchestrator via `mapOldIntentToNew()`
- The `support` intent exists in schemas and routing config but is never emitted by either tier of the classifier — it is unreachable dead config
- Keyword fallback uses string length weighting, which biases toward longer keywords regardless of relevance
- No entity extraction in the classifier itself (handled separately by `extractSymbols()` in the orchestrator)

### Improvement Opportunities
- Unify the classifier to emit the 11 new intents directly, eliminating the translation layer
- Add `support` to the classifier's intent taxonomy or remove it from routing config
- Consider a more sophisticated fallback (e.g., embedding similarity) instead of keyword length weighting

---

## 6. Model Router

### Purpose
Select the appropriate lane, LLM provider, and parameters for each request.

### File Location
`server/services/modelRouter.ts` (190 lines)

### How It Works
**Provider aliases:**

| Alias | Model | Cost Tier |
|-------|-------|-----------|
| `ada-fast` | `gpt-5-mini` | low |
| `ada-reason` | `gpt-5-mini` | medium |
| `ada-fallback` | `claude-sonnet-4-6` | medium |

**Fallback chain:** `ada-fast` → `ada-fallback`, `ada-reason` → `ada-fallback`, `ada-fallback` → null

**Routing decision** (`routeRequest(scorecard, policy)`):
1. **Lane 0** if `requires_deterministic_math` is true (intents: `balance_query`, `portfolio_explain`, `goal_progress`, `allocation_breakdown`)
2. **Lane 2** if: risk_level=high, tool_count≥3, reasoning intent, high effort, or restricted_advisory mode
3. **Lane 1** otherwise

**Lane parameters:**

| Lane | Provider | Temperature | Max Tokens |
|------|----------|-------------|------------|
| lane0 | ada-fast | 0.1 | 1,024 |
| lane1 | ada-fast | 0.3 | 2,048–4,096 |
| lane2 | ada-reason | 0.4 | 8,192 |

**Scorecard** captures: intent, requires_deterministic_math, risk_level, context_size_estimate, tool_count_estimate, channel, reasoning_effort.

### Key Findings / Issues
- **Critical**: `ada-fast` and `ada-reason` resolve to the same model (`gpt-5-mini`). The only effective differentiation is temperature (0.3 vs 0.4) and max_tokens. There is no actual reasoning model advantage for Lane 2.
- `ada-fallback` (Claude) is only triggered on provider-level errors (429, 5xx, timeout) — not on quality issues
- Context size estimation is simplistic: `(2000 + tools×1500) × effortMultiplier`

### Improvement Opportunities
- Point `ada-reason` to a distinct reasoning model (e.g., `o3-mini`, `gpt-5`) for genuine Lane 2 advantage
- Add quality-based fallback (e.g., if response coherence is low, retry with stronger model)

---

## 7. Capability Registry

### Purpose
Register model capabilities, lane configurations, and intent→lane mappings.

### File Location
`server/services/capabilityRegistry.ts` (244 lines)

### How It Works
**Model registry** (3 entries):
```
ada-fast:     gpt-5-mini    | streaming, tool_calling, json_mode, fast_response | 128K | low
ada-reason:   gpt-5-mini    | streaming, tool_calling, json_mode, reasoning, long_context | 128K | medium
ada-fallback: claude-sonnet-4-6 | streaming, reasoning, long_context | 200K | medium
```

**Lane configs** (3 lanes): Each specifies label, description, provider alias, and tool profiles.

**Intent route configs** (11 intents): Each specifies default lane, supported lanes, required/optional tool profiles.

**Helper functions**: `getModelCapabilities()`, `hasCapability()`, `listModels()`, `getLaneConfig()`, `getIntentRouteConfig()`, `getClassifierContext()`, `bestModelForIntent()`, `registerModel()`.

`getClassifierContext()` generates a text block injected into the LLM classifier's system prompt, describing lanes, intent→lane mappings, and classifier→routing translations.

### Key Findings / Issues
- `ada-fallback` is missing `tool_calling` in its capability set, even though the Anthropic adapter in `openaiClient.ts` fully supports tool calling for Claude. This could cause incorrect routing decisions if capability checks are used for tool-calling gating.
- `registerModel()` exists for dynamic registration but is never called in practice
- `balance_query` and `allocation_breakdown` have `defaultLane: 0` but `portfolio_explain` has `defaultLane: 1` — this is inconsistent since `portfolio_explain` is still in the `DETERMINISTIC_INTENTS` set in `modelRouter.ts`

### Improvement Opportunities
- Add `tool_calling` to `ada-fallback` capabilities
- Reconcile `portfolio_explain` default lane between the capability registry (Lane 1) and the model router's deterministic set (Lane 0)

---

## 8. Policy Engine

### Purpose
Evaluate tenant configuration against user intent to produce policy constraints.

### File Location
`server/services/policyEngine.ts` (168 lines)

### How It Works
`evaluatePolicy(tenantConfig, intent, riskProfile)` produces a `PolicyDecision`:

| Field | Logic |
|-------|-------|
| `response_mode` | `education_only` or `restricted_advisory` from config; `personalized_insights` otherwise |
| `allowed_tools` | Resolved from `allowed_tool_profiles` → `PROFILE_TOOL_MAP` → actual tool names |
| `recommendation_mode` | `next_best_actions` if allowed; `none` otherwise |
| `require_human_review` | true for execution_request always; true for recommendations with advisor handoff; true for conservative+high-effort recommendations |
| `execution_route` | From tenant's `execution_routing_mode` |

**Tool profile mapping:**
```
portfolio_read  → getPortfolioSnapshot, getHoldings
market_read     → getQuotes
news_read       → getHoldingsRelevantNews
health_compute  → calculatePortfolioHealth
execution_route → route_to_advisor
workflow_light  → show_simulator, show_widget, extract_user_fact
```

**Disclosure functions:** `getDisclosures()` appends jurisdiction-specific disclaimers. `checkBlockedPhrases()` detects banned terms. `filterToolsByPolicy()` enforces tool whitelist.

### Key Findings / Issues
- Policy evaluation is purely rule-based (no ML or probabilistic scoring)
- The risk-profile-based escalation only triggers for conservative investors with high-effort recommendations — moderate and aggressive profiles never trigger this path
- `can_prepare_trade_plans` field exists in `TenantConfig` but is not checked in the policy engine

### Improvement Opportunities
- Extend risk-based escalation to moderate profile edge cases
- Use `can_prepare_trade_plans` in policy evaluation

---

## 9. Prompt Builder

### Purpose
Assemble the LLM system prompt from identity, policy, capability, and context blocks.

### File Location
`server/services/promptBuilder.ts` (175 lines)

### How It Works
`buildAgentPrompt(ctx)` concatenates these ordered blocks:
1. **Identity** — Ada persona, personality, formatting rules (bullet points, no markdown)
2. **Tenant Behavior** — tone, language, jurisdiction, advisory mode
3. **Policy Constraints** — response mode, recommendation mode, advisor handoff requirements
4. **Model Capabilities** — provider name, context window, capability flags
5. **Tool-Use Rules** — "MUST call tools", "NEVER invent values", available tools list
6. **Execution Boundary** — 8 explicit rules: CANNOT execute trades, CANNOT buy/sell, CAN prepare plans, NEVER say "executing now" or "order submitted"
7. **Grounding Rules** — data sourcing mandates, citation requirements, exact changePercent usage
8. **Answer Contract** — headline → summary → bullets → next step format
9. **User Profile** (conditional) — name, risk tolerance with calibration instruction
10. **Portfolio Context** (conditional) — from RAG service
11. **Semantic Facts** (conditional) — from memory service
12. **Episodic Memories** (conditional) — from memory service
13. **Navigation Context** (conditional) — source screen, category, title
14. **Classified Intent** — primary intent + confidence

### Key Findings / Issues
- Execution boundary block is comprehensive with 8 explicit prohibitions
- Formatting rules say "Never use markdown headers (#), bold (**), or italic (*)" but Lane 0 templates use `**bold**`
- The prompt includes the model's own capabilities (provider name, context window) which leaks internal routing details to the LLM

### Improvement Opportunities
- Remove model capability details from the prompt (unnecessary for generation quality)
- Ensure Lane 0 templates comply with the same formatting rules

---

## 10. OpenAI Client & Resilience

### Purpose
Provide resilient LLM API access with multi-provider fallback (OpenAI → Anthropic Claude).

### File Location
`server/services/openaiClient.ts` (347 lines)

### How It Works
**Clients:**
- OpenAI client using `AI_INTEGRATIONS_OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_BASE_URL`
- Anthropic client using `AI_INTEGRATIONS_ANTHROPIC_API_KEY` / `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`

**Anthropic adapter** — full conversion layer:
- `extractSystemAndMessages()` — converts OpenAI message format; extracts system into separate param; converts tool results to `[Tool result]:` user messages
- `convertToolsForAnthropic()` — maps OpenAI function-calling tool format to Anthropic `input_schema` format
- `anthropicCompletion()` — non-streaming, returns OpenAI-compatible `ChatCompletion` shape
- `anthropicStreamCompletion()` — streaming async generator, maps Anthropic events (`content_block_delta`, `content_block_start`, `input_json_delta`) to OpenAI chunk format
- Tool use blocks are mapped to OpenAI `tool_calls` format in both paths

**Resilience — non-streaming** (`resilientCompletion()`):
- Up to 2 retries with configurable timeout (default 15s)
- On final retry failure, checks `isProviderError()` — if true, falls back to Anthropic

**Resilience — streaming** (`resilientStreamCompletion()`):
- Single attempt with timeout
- On provider error, falls back to Anthropic streaming

**Orchestrator-level resilience** (in `agentOrchestrator.ts`):
- Streaming: `createLLMStream(1)` → `createLLMStream(2)` → Lane 2→Lane 1 downgrade → error
- Each `createLLMStream` call goes through `resilientStreamCompletion` which itself has OpenAI→Claude fallback

**Provider error detection** (`isProviderError()`):
- HTTP status ≥ 429 or 0
- Error messages containing: timeout, abort, econnrefused, econnreset, enotfound, socket hang up, fetch failed, network, 429, 500-504, rate limit, service unavailable

### Key Findings / Issues
- Non-provider errors (bad request, auth failure) are NOT retried or fallen back — this is correct behavior
- The Anthropic adapter handles both tool calling and streaming, making Claude a genuine fallback
- Anthropic fallback model is hardcoded to `claude-sonnet-4-6` rather than reading from registry

### Improvement Opportunities
- Read fallback model from registry instead of hardcoding
- Add circuit breaker pattern for sustained provider failures

---

## 11. Financial Tools

### Purpose
Define tool schemas for LLM function calling and dispatch tool execution to data providers.

### File Location
`server/services/financialTools.ts` (278 lines)

### How It Works
**Tool definitions** (9 total, 3 groups):

| Tool | Group | Parameters |
|------|-------|-----------|
| `getPortfolioSnapshot` | financial_data | none |
| `getHoldings` | financial_data | none |
| `getQuotes` | market_intel | `symbols: string[]` |
| `getHoldingsRelevantNews` | market_intel | `limit?: number` |
| `calculatePortfolioHealth` | financial_data | none |
| `route_to_advisor` | crm_actions | `action_type: enum, summary: string, details?: object` |
| `show_simulator` | ui_actions | `type: enum, initialValues?: object` |
| `show_widget` | ui_actions | `type: enum` |
| `extract_user_fact` | ui_actions | `fact: string, category: enum` |

**Tool group filtering:** Two-stage pipeline:
1. Policy filter: `policyDecision.allowed_tools`
2. Route filter: `filterToolNamesByGroups(tools, route.tool_groups)`

Lane 0 gets no tool groups. Lane 1 gets `financial_data` + `ui_actions`. Lane 2 gets all four.

**Execution dispatch** (`executeFinancialTool()`):
- Portfolio tools → `registry.portfolio.*`
- `getQuotes` → `registry.market.getQuotes(symbols)`
- `getHoldingsRelevantNews` → fetches holdings first, then `registry.news.getHoldingsRelevantNews(symbols, limit)`
- `calculatePortfolioHealth` → calls `wealthEngine.calculateHealthScore()` + `analyzeConcentration()` + `computeAllocationBreakdown()`

### Key Findings / Issues
- `getHoldingsRelevantNews` makes a nested call to `registry.portfolio.getHoldings()` to get symbols — this is a hidden dependency
- UI tools (`show_simulator`, `show_widget`, `extract_user_fact`) are handled directly in the orchestrator, not in `executeFinancialTool()`
- `route_to_advisor` is in the CRM tools group but handled separately in the orchestrator via `rmHandoffService`

### Improvement Opportunities
- Consider making `getHoldingsRelevantNews` accept symbols as a parameter to avoid the nested portfolio call
- Unify tool execution dispatch (currently split between `executeFinancialTool`, orchestrator inline handling, and RM handoff)

---

## 12. Wealth Engine

### Purpose
Provide deterministic financial computations (no LLM involvement) for portfolio health, concentration, allocation, and drift analysis.

### File Location
`server/services/wealthEngine.ts` (333 lines)

### How It Works
**Health Score** (`calculateHealthScore()`): Weighted composite from 5 components:

| Component | Weight | Logic |
|-----------|--------|-------|
| diversification | 25% | Asset class count (max 4)×40 + sector count (max 5)×30 + geography count (max 3)×30 |
| cash_buffer | 15% | Distance from ideal (conservative=20%, moderate=10%, aggressive=5%) |
| concentration_risk | 25% | Penalties for top holding >20-30% or top-5 >60-80% |
| risk_alignment | 20% | Equity ratio vs risk profile expectations |
| position_count | 15% | Optimal 8-25 positions (score=90) |

Labels: Excellent (≥80), Good (≥60), Fair (≥40), Needs Attention (<40).

**Concentration Analysis** (`analyzeConcentration()`): Calculates largest_holding_pct, top5_pct, sector/geography/asset-class maps, with flags at thresholds (25% single, 75% top-5, 40% sector, 70% geography).

**Allocation Breakdown** (`computeAllocationBreakdown()`): Groups by asset_class, geography, sector. Cash added as separate entry.

**Drift Analysis** (`computeDriftAnalysis()`): Compares actual vs target allocation (defaults: 55% Stocks, 25% Bonds, 10% Cash, 10% Alternatives). Flags >5% drift; `needs_rebalance` at >10% max drift.

### Key Findings / Issues
- All computations are deterministic — no LLM hallucination risk on financial math
- Parsing is defensive with safe defaults (0 for missing values)
- Risk alignment uses position count ratio (not value-weighted), which may not accurately reflect portfolio risk

### Improvement Opportunities
- Use value-weighted equity ratio instead of position count ratio for risk alignment
- Make default target allocation configurable per tenant/persona

---

## 13. RAG Service

### Purpose
Retrieve structured portfolio context from PostgreSQL for LLM prompt enrichment.

### File Location
`server/services/ragService.ts` (142 lines)

### How It Works
`buildPortfolioContext(userId, intent)` queries PostgreSQL tables:

| Context Block | Source Table | Included For |
|---------------|-------------|-------------|
| Portfolio Summary | `portfolio_snapshots` (latest) | All intents |
| Holdings | `positions` JOIN `accounts` | portfolio, market, general, recommendation |
| Allocations | `positions` GROUP BY asset_class | portfolio, market, general, recommendation |
| Goals | `goals` | goals, scenario, recommendation, general |
| Accounts | `accounts` | portfolio, general |
| Recent Transactions | `transactions` (latest 10) | All intents |

Returns a `PortfolioContext` object with string-formatted data blocks.

### Key Findings / Issues
- RAG is SQL-only — no vector embeddings, no semantic similarity, no document chunking
- Context is always the full query result with no relevance filtering beyond intent-based inclusion/exclusion
- All data is formatted as strings (not structured JSON), which may reduce LLM reasoning precision

### Improvement Opportunities
- Add vector-embedding-based retrieval for semantic facts and knowledge base content
- Return structured JSON context instead of pre-formatted strings
- Add relevance scoring to limit context to the most pertinent data

---

## 14. Memory Service

### Purpose
Manage three tiers of conversation memory: working (in-process), episodic (PostgreSQL), and semantic (PostgreSQL with text search).

### File Location
`server/services/memoryService.ts` (127 lines)

### How It Works
**Working Memory** — `Map<string, ConversationTurn[]>`:
- `getWorkingMemory(threadId)` — returns turns
- `addToWorkingMemory(threadId, turn)` — appends; FIFO eviction at 20 turns
- `clearWorkingMemory(threadId)` — deletes thread

**Episodic Memory** — `episodic_memories` table:
- `getEpisodicMemories(userId, limit=5)` — latest summaries with topics
- `saveEpisodicMemory(userId, threadId, summary, topics)` — persists summary
- Triggered when thread reaches 10+ turns (in orchestrator)
- Summary: first 6 turns × 80 chars, pipe-separated

**Semantic Facts** — `semantic_facts` table:
- `getSemanticFacts(userId, limit=10, queryText?)` — text-search ranked or recency-ordered
- `saveSemanticFact(userId, fact, category, sourceThreadId)` — persists fact
- Search uses PostgreSQL `to_tsvector('english', fact || ' ' || category)` with `ts_rank_cd`
- Categories: preference, life_event, financial_goal, risk_tolerance, general

**Audit Logging** — `chat_audit_log` table:
- `logAudit()` writes user_id, thread_id, action, intent, pii_detected, input_preview, model, tokens_used

### Key Findings / Issues
- **Critical**: Working memory is in-process `Map` — lost on server restart or deploy
- Episodic summary is crude (truncated turns, pipe-separated) — no LLM-based summarization
- Semantic search is keyword-based (`to_tsvector`), not embedding-based
- IDs use timestamp + random suffix (`ep-{ts}-{rand4}`, `sf-{ts}-{rand4}`)

### Improvement Opportunities
- Persist working memory to PostgreSQL or Redis
- Use LLM-based summarization for episodic memories
- Add vector embeddings for semantic fact retrieval

---

## 15. PII Detector

### Purpose
Scan user messages for personally identifiable information and redact before LLM processing.

### File Location
`server/services/piiDetector.ts` (34 lines)

### How It Works
6 regex patterns scan the input text:

| Type | Pattern Example |
|------|----------------|
| email | `user@example.com` |
| phone | `+1-555-123-4567` |
| ssn | `123-45-6789` |
| credit_card | `4111-1111-1111-1111` |
| passport | `AB123456789` |
| iban | `AE070331234567890123456` |

Detected PII is replaced with `[REDACTED_TYPE]` tokens. Returns `{ hasPii, types, sanitized }`.

Runs on every incoming message before any pipeline processing. Sanitized version used for LLM context, intent classification, and audit log previews.

### Key Findings / Issues
- Regex-only; no ML-based entity recognition
- Passport pattern (`\b[A-Z]{1,2}\d{6,9}\b`) may false-positive on financial identifiers
- No detection for: names, physical addresses, dates of birth, national IDs beyond listed patterns

### Improvement Opportunities
- Add name and address detection
- Consider ML-based NER for more accurate PII detection
- Tighten passport pattern to reduce false positives

---

## 16. Guardrails

### Purpose
Post-generation safety checks that sanitize LLM output to enforce execution boundaries, blocked phrases, and disclosure requirements.

### File Location
`server/services/guardrails.ts` (141 lines)

### How It Works
`runPostChecks()` returns `{ passed, interventions, sanitizedText, appendedDisclosures }`.

**Check pipeline (in order):**
1. **Blocked phrase check** — tenant-configured phrases replaced with `[REDACTED]`
2. **Execution boundary enforcement** — 7 regex patterns catch execution-claiming language (e.g., "I will place the order" → "I've prepared this plan for your advisor"). Plus a hard final check.
3. **Education-only mode** — removes advisory language ("you should buy", "I recommend buying")
4. **Security naming** — removes specific tickers if `can_name_securities` is false
5. **Data freshness** — flags tool results older than threshold (default 300s)
6. **Disclosure auto-append** — adds "past performance" disclaimer if absent
7. **Citation completeness** — checks data-backed claims cite their sources; appends source block

**Execution boundary — defense in depth (3 layers):**
1. Prompt layer — 8 explicit rules in system prompt
2. Guardrail layer — 7 regex + hard check
3. Orchestrator layer — fallback: if intent=execution_request and no advisor_handoff widget, forces `routeToAdvisor()`

### Key Findings / Issues
- Execution boundary regex patterns are well-crafted with both specific and catch-all patterns
- Education-only mode only catches a few advisory patterns — more sophisticated LLM advisory language may pass through
- The citation completeness check uses simple string matching, not semantic analysis

### Improvement Opportunities
- Expand education-only mode patterns
- Consider an LLM-based guardrail check for nuanced advisory language detection

---

## 17. Response Builder

### Purpose
Construct the structured `AdaAnswer` object from LLM output, tool results, and policy decisions.

### File Location
`server/services/responseBuilder.ts` (155 lines)

### How It Works
`buildAdaAnswer()` produces:

| Field | Source |
|-------|--------|
| `answer_id` | `ans-{timestamp}-{random}` |
| `mode` | `instant` (education or no tools), `analysis` (tool-backed) |
| `headline` | First line of LLM text |
| `summary` | Lines 2-4 joined |
| `key_points` | Extracted bullets (•, -, *, numbered) — max 8 |
| `portfolio_insights` | Health score + concentration flags from wealth engine |
| `market_context` | Instruments + news topics from tool results |
| `recommendations` | Based on policy recommendation_mode |
| `actions` | Advisor handoff if human review required |
| `disclosures` | From policy engine |
| `citations` | From tool results (source_type, source_name, as_of) |
| `render_hints` | Booleans for portfolio/news/health card rendering |
| `suggested_questions` | From follow-up generation (set after construction) |
| `tool_results` | Raw tool results array |

### Key Findings / Issues
- `mode` never uses the `advisory` enum value — only `instant` or `analysis`
- Headline extraction assumes first line is a good headline, but LLM output format varies
- `key_points` extraction is fragile (regex for bullet characters)

### Improvement Opportunities
- Consider prompting the LLM to output structured JSON sections for more reliable parsing
- Add `advisory` mode usage for recommendation responses

---

## 18. Trace Logger

### Purpose
Log comprehensive agent traces and individual tool runs for observability and debugging.

### File Location
`server/services/traceLogger.ts` (101 lines)

### How It Works
**Agent trace** (`logAgentTrace()`): Persisted to `agent_traces` table via `agentRepository.saveAgentTrace()`. Includes:
- Conversation/message/tenant/user IDs
- Intent classification, policy decision
- Model name with lane/alias annotation (e.g., `gpt-5-mini [lane2/ada-reason]`)
- Reasoning effort
- Tool set exposed vs. tool calls actually made
- Final `AdaAnswer`
- Step timings and total response time
- Guardrail interventions and escalation decisions
- Route decision rationale and scorecard summary

**Step timings captured:**
- `session_hydrate_ms`, `intent_classification_ms`, `policy_evaluation_ms`, `tool_execution_ms`, `llm_generation_ms`, `post_checks_ms`, `total_ms`

**Tool run logging** (`logToolRun()`): Individual tool runs persisted to `tool_runs` table. Captures tool_name, inputs, outputs, latency_ms, status, source_provider, conversation/message/user context.

### Key Findings / Issues
- **Scope limitation**: `logToolRun()` is only called for financial tool calls from LLM tool-call turns (Lane 1/2). Lane 0 deterministic tool calls and `prefetchToolData()` pre-runs are NOT individually logged. They appear only in the aggregate trace `toolCallsMade` array.
- Trace logging is fire-and-forget (`.catch(() => {})`) — failures are silently swallowed
- Lane number is encoded as `__lane` in step timings for queryability

### Improvement Opportunities
- Add `logToolRun()` calls for Lane 0 and prefetch tool executions
- Add error alerting for trace logging failures

---

## 19. RM Handoff Service

### Purpose
Route trade/action requests to the user's Relationship Manager for review and execution.

### File Location
`server/services/rmHandoffService.ts` (148 lines)

### How It Works
**Routing modes:**

| Mode | Behavior |
|------|----------|
| `rm_handoff` | Inserts into `advisor_action_queue` (status='pending'); returns queue ID + advisor name |
| `api_webhook` | POSTs JSON to `execution_webhook_url`; falls back to queue on non-2xx or network error |
| `disabled` | Returns error message |

**Queue entry fields:** tenant_id, user_id, advisor_id, conversation_id, action_type, action_details (JSON), status.

**Advisor lookup:** `lookupAdvisorId()` queries `users.advisor_id`; `lookupAdvisorName()` queries `users.first_name + last_name`.

**Webhook payload:** tenant_id, user_id, advisor_id, conversation_id, action_type, action_details, timestamp. Timeout: 10s.

### Key Findings / Issues
- Webhook→queue fallback is automatic and silent — the user doesn't know which path was taken
- No webhook authentication (no HMAC, no shared secret)
- Queue entries have no expiry or auto-escalation mechanism

### Improvement Opportunities
- Add webhook authentication (HMAC signing)
- Add queue entry expiry/escalation
- Log which routing path was used for observability

---

## 20. Provider Registry & Fallback Chains

### Purpose
Factory for data provider registries with Proxy-based fallback chains and configurable provider selection.

### File Location
`server/providers/registry.ts` (251 lines)

### How It Works
**Registry factory** (`getProviderRegistry(providerConfig?)`):
- Builds provider chains for each data domain
- Caches registries by config key to avoid re-creation
- Returns `ProviderRegistry` with: portfolio, market, news, macro, fx, fxLocalized, research, identity

**Provider chain configuration** (`getChainKeys(domain, config)`):
- Primary from config or env var (e.g., `MARKET_PROVIDER_PRIMARY`)
- Secondary, fallback optionally configured
- Mock always added as last resort

**Proxy-based fallback** (`withFallbackChain(providers[])`):
- Creates a Proxy around the primary provider
- On method call: skips unhealthy providers, falls through on error results, annotates fallback usage in `result.warnings`

**Provider domains:**

| Domain | Configurable Chain | Default Primary |
|--------|--------------------|----------------|
| market | finnhub, twelve_data, fmp, coingecko, yahoo_finance, mock | mock |
| news | finnhub, marketaux, mock | mock |
| macro | fred, ecb, mock | mock |
| fx | frankfurter, cbuae, mock | mock |
| research | sec_edgar, mock | mock |
| identity | openfigi, mock | mock |
| fxLocalized | cbuae → frankfurter → mock | cbuae |
| **portfolio** | **NONE — hardcoded to `mockPortfolioProvider`** | **mock (no chain)** |

### Key Findings / Issues
- **Critical**: Portfolio is the only domain NOT using `withFallbackChain()`. Line 148: `portfolio: mockPortfolioProvider`. Core portfolio data cannot be swapped without code changes.
- All other domains have configurable chains with automatic mock fallback
- Registry is cached per config key — changing config at runtime requires `resetRegistry()`

### Improvement Opportunities
- Move portfolio into `withFallbackChain()` with a configurable primary
- Add metrics/logging for fallback chain activations

---

## 21. Mock Providers

### Purpose
Provide database-backed mock data for all provider domains during development and demo.

### File Location
- `server/providers/mock/portfolioProvider.ts` (49 lines)
- `server/providers/mock/marketProvider.ts` (111 lines)
- `server/providers/mock/newsProvider.ts` (80 lines)
- `server/providers/mock/fxProvider.ts` (86 lines)
- `server/providers/mock/identityProvider.ts` (59 lines)

### How It Works
**Mock portfolio**: Reads from `portfolio_snapshots`, `positions`, and `accounts` tables via `portfolioRepository`. Methods: `getPortfolioSnapshot`, `getHoldings`, `getAllocations`, `getPerformance`.

**Mock market**: Reads from `market_quotes` joined with `instruments`. For `getHistoricalPrices`, generates synthetic data using sine-wave noise around the base price.

**Mock news**: Reads from `news_items` table with array overlap query (`symbols && $1::text[]`). Supports: `getHoldingsRelevantNews`, `getLatestNews`, `getNewsByTag`, `searchNews`.

**Mock FX**: Hardcoded rate table with 18 currency pairs (GCC focus: AED, SAR, KWD, BHD, QAR, OMR, EGP). Cross-rate resolution via USD pivot.

**Mock identity**: Reads from `instruments` table, resolves by symbol, name LIKE, or ISIN.

All mocks use shared `toolOk`/`toolError` helpers from `server/providers/mock/helpers.ts`.

### Key Findings / Issues
- Mock providers are database-backed (not purely in-memory), providing realistic data shapes
- Mock market historical data is synthetic (sine-wave) — visually unrealistic for charts
- Mock FX rates are static — no date-based variation except random noise for historical queries

### Improvement Opportunities
- Add more realistic historical data generation for charts
- Consider using recorded real market data for more realistic demos

---

## 22. Live Providers

### Purpose
Connect to real external APIs for market data, macroeconomic indicators, FX rates, SEC filings, and instrument identity resolution.

### File Location
- `server/providers/finnhub.ts` (323 lines) — market data + news
- `server/providers/fred.ts` (149 lines) — macroeconomic indicators
- `server/providers/secEdgar.ts` (264 lines) — SEC filings
- `server/providers/openFigi.ts` (272 lines) — instrument identity
- `server/providers/frankfurter.ts` (129 lines) — FX rates (ECB source)
- `server/providers/cbuae.ts` (171 lines) — FX rates (CBUAE source)

### How It Works

**Finnhub** (market + news):
- API base: `https://finnhub.io/api/v1`
- Rate limit: 55 req/min (free tier), checked via `checkRateLimit()`
- Provides: `getQuotes` (parallel per-symbol fetch), `getHistoricalPrices` (candle data), `getCompanyProfile`, `getEarningsCalendar`, `getHoldingsRelevantNews` (company news), `getLatestNews`, `getNewsByTag`, `searchNews`
- Auth: `FINNHUB_API_KEY` env var

**FRED** (macro):
- API base: `https://api.stlouisfed.org/fred`
- Rate limit: 100 req/min
- 15 pre-configured series (FEDFUNDS, DGS10, CPIAUCSL, UNRATE, GDP, VIX, Brent, Gold, etc.)
- Provides: `getIndicator`, `getMultipleIndicators`, `getAvailableIndicators`
- Auth: `FRED_API_KEY` env var

**SEC EDGAR** (research):
- APIs: EFTS full-text search + company data API
- Rate limit: 9 req/sec (SEC guidelines)
- Resolves tickers to CIK via company_tickers.json
- Provides: `getFilings` (text search), `getCompanyFilings` (by ticker), `getRecentFilings`
- Auth: none (public), User-Agent required

**OpenFIGI** (identity):
- API: `https://api.openfigi.com/v3/mapping`
- Rate limit: 20 req/min
- Auto-detects ID type (ISIN, CUSIP, Bloomberg Global, ticker)
- Persists resolved instruments to DB
- Auth: `OPENFIGI_API_KEY` env var (optional, increases rate limit)

**Frankfurter** (FX):
- API: `https://api.frankfurter.app` (ECB reference rates)
- No rate limit, no auth
- Provides: `getRate`, `getRates`, `getHistoricalRate`

**CBUAE** (FX):
- API: `https://www.centralbank.ae/umbraco/Surface/Exchange/GetExchangeRateAllCurrency`
- AED-centric: only handles AED pairs, delegates non-AED to Frankfurter
- Provides: `getRate`, `getRates`, `getHistoricalRate`

### Key Findings / Issues
- All live providers use `fetchWithTimeout()` with reasonable timeouts (8-12s)
- All record success/failure for health tracking via `recordProviderSuccess/Failure()`
- All use the provider cache for response caching
- CBUAE delegates non-AED pairs to Frankfurter, creating a cross-provider dependency
- SEC EDGAR caches the full company_tickers.json in memory (potentially large)

### Improvement Opportunities
- Add SEC EDGAR ticker cache expiry
- Add structured error categorization for better fallback decisions

---

## 23. Stub Providers

### Purpose
Placeholder providers for planned Phase 2/3 integrations that are not yet implemented.

### File Location
`server/providers/stubs.ts` (63 lines)

### How It Works
6 stub providers, each implementing their domain interface but returning `notImplemented` errors:

| Provider | Domain | Interface Methods |
|----------|--------|------------------|
| `marketauxNewsProvider` | news | getHoldingsRelevantNews, getLatestNews, getNewsByTag, searchNews |
| `ecbMacroProvider` | macro | getIndicator, getMultipleIndicators, getAvailableIndicators |
| `twelveDataMarketProvider` | market | getQuotes, getHistoricalPrices, getCompanyProfile, getEarningsCalendar |
| `fmpMarketProvider` | market | getQuotes, getHistoricalPrices, getCompanyProfile, getEarningsCalendar |
| `coinGeckoMarketProvider` | market | getQuotes, getHistoricalPrices, getCompanyProfile, getEarningsCalendar |
| `yahooFinanceMarketProvider` | market | getQuotes, getHistoricalPrices, getCompanyProfile, getEarningsCalendar |

Each method returns:
```
{ status: 'error', error: '{provider} provider is not yet implemented. This is a Phase 2/3 stub.' }
```

### Key Findings / Issues
- These are importable and configurable via the registry but will always error
- They are included in the fallback chain if explicitly configured, wasting a fallback attempt
- No implementation timeline or tracking for Phase 2/3 completion

### Improvement Opportunities
- Either implement or remove these stubs
- If kept, mark them distinctly so the fallback chain skips them (e.g., via a `stub: true` flag)

---

## 24. Provider Cache & Helpers

### Purpose
Shared caching, rate limiting, health tracking, and utility functions for all data providers.

### File Location
- `server/providers/cache.ts` (76 lines)
- `server/providers/helpers.ts` (114 lines)

### How It Works

**Cache** (`cache.ts`):
- In-memory `Map<string, CacheEntry>` with TTL-based expiry
- Default TTLs by data type:
  - quote: 2 min
  - company_profile: 24h
  - macro_series: 4h
  - fx_rate: 1h
  - filing: 24h
  - news: 15 min
  - identity: 24h
- Functions: `cacheGet()`, `cacheSet()`, `cacheKey()`, `getCacheStats()`, `clearCache()`
- Stats tracking: hit count, miss count, hit rate percentage
- Cache stats injected into every `toolOk()` response via warnings

**Helpers** (`helpers.ts`):
- `toolOk()`, `toolError()`, `toolPartial()` — standardized ToolResult constructors
- `checkRateLimit(provider, max, windowMs=60000)` — sliding window rate limiter per provider
- `recordProviderSuccess/Failure()` — health tracking with 5-minute window
- `isProviderHealthy(provider)` — failure rate threshold at 50% with minimum 5 attempts
- `fetchWithTimeout(url, options)` — fetch wrapper with AbortController timeout (default 10s)

### Key Findings / Issues
- Cache is in-memory — lost on restart (same as working memory)
- Rate limiting is per-process, not distributed — if multiple instances run, each has its own counter
- Health tracking window is 5 minutes, which may be too aggressive for transient issues
- Cache stats are appended to every tool response as warnings, adding noise to tool results

### Improvement Opportunities
- Consider Redis-backed cache for persistence and multi-instance support
- Make health window configurable
- Move cache stats to a separate observability channel instead of tool result warnings

---

## 25. Shared Schemas (agent.ts)

### Purpose
Define Zod schemas and TypeScript types for all agent-related data structures.

### File Location
`shared/schemas/agent.ts` (242 lines)

### How It Works
All types defined as Zod schemas with corresponding TypeScript types via `z.infer`:

| Schema | Key Fields |
|--------|------------|
| `ToolResult` | status (ok/error/partial/timeout), source_name, source_type, as_of, latency_ms, data, warnings |
| `Citation` | source_type (9 enum values), source_name, reference_id, as_of |
| `AdaAnswer` | 14 fields: answer_id, mode (instant/analysis/advisory), user_intent (11 intents), headline, summary, key_points, portfolio_insights, market_context, recommendations, actions, disclosures, citations, render_hints, suggested_questions, tool_results |
| `PolicyDecision` | allow_response, response_mode (3 modes), allowed_tools, recommendation_mode, require_disclosures, require_human_review, escalation_reason, execution_route |
| `IntentClassification` | primary_intent (11 values), confidence, entities, reasoning_effort, suggested_tools |
| `AgentTrace` | Full trace with all pipeline decisions |
| `TenantConfig` | 18+ fields: jurisdiction, advisory_mode, tool profiles, provider config, feature flags, blocked phrases, execution routing |
| `MarketQuote` | symbol, price, change, change_percent, volume, OHLC, market_cap, currency |
| `NewsArticle` | title, summary, publisher, published_at, symbols, relevance_tags |
| `MacroIndicator` | series_id, name, value, unit, date, frequency, summary |
| `FxRate` | base, target, rate, inverse_rate |
| `Filing` | company, type, title, filed_date, url, summary |
| `InstrumentIdentity` | symbol, name, figi, isin, exchange, asset_class, currency |

### Key Findings / Issues
- Schemas are comprehensive and well-typed with Zod validation
- `TenantConfig` has `can_prepare_trade_plans` field that is not checked by the policy engine
- `AdaAnswer.mode` includes `advisory` but it is never set by the response builder

### Improvement Opportunities
- Remove unused schema fields or implement their consumers
- Add runtime validation of LLM outputs against schemas

---

## 26. Stream Types & SSE

### Purpose
Define the typed union of SSE events emitted by the orchestrator's streaming pipeline.

### File Location
`server/services/streamTypes.ts` (8 lines)

### How It Works
`StreamEvent` is a discriminated union type:

| Event Type | Payload | Purpose |
|------------|---------|---------|
| `text` | `content: string` | Streaming text chunks from LLM |
| `widget` | `widget: { type, ...data }` | Embedded data visualization widgets |
| `simulator` | `simulator: { type, initialValues }` | Interactive scenario simulator |
| `suggested_questions` | `suggestedQuestions: string[]` | Follow-up question suggestions |
| `thinking` | `step: string, detail: string` | Verbose mode pipeline trace events |
| `done` | — | Stream completion signal |
| `error` | `content: string` | Error message |

**SSE delivery** (in `api.ts`):
- Headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`
- Each event: `data: ${JSON.stringify(event)}\n\n`
- Client disconnection detected via `req.on('close')`

**Thinking events** flow:
- Controlled by `verbose` flag (user toggle + tenant feature flag)
- Emitted at pipeline stages: pii_scan, intent_classification, policy_evaluation, routing, model_selection, data_prefetch, llm_generation, guardrails
- `setImmediate()` yielding ensures events flush before next stage

### Key Findings / Issues
- No event ID or sequence number — client cannot detect missed events
- No heartbeat/keepalive mechanism — long-running requests may time out behind proxies
- `simulator` and `widget` are separate event types despite similar shapes

### Improvement Opportunities
- Add event IDs for reconnection support
- Add SSE keepalive comments (`: keepalive\n\n`) for proxy compatibility
- Consider unifying `simulator` and `widget` event types

---

## 27. Legacy aiService.ts

### Purpose
Original AI service file containing duplicate prompt/tool definitions; now partially superseded by the agent orchestrator pipeline.

### File Location
`server/services/aiService.ts` (327 lines)

### How It Works
Contains:
- `SYSTEM_PERSONA` — duplicate Ada persona (similar to `promptBuilder.ts` identity block)
- `buildSystemPrompt()` — simplified prompt builder without policy/capability/execution boundary/grounding blocks
- `TOOLS` — duplicate tool definitions for show_simulator, show_widget, extract_user_fact
- `MODEL` — resolved model name via `resolveModel('ada-fast')`
- Stream and non-stream chat completion functions

**Active usage:**
- `morningSentinelService.ts` — imports `MODEL` constant only
- `goalService.ts` — uses `generateJsonCompletion` with custom prompts (does NOT use `buildSystemPrompt()` or `TOOLS`)

**Dead code:**
- `buildSystemPrompt()` and `TOOLS` are not called by any service in the current codebase

### Key Findings / Issues
- `buildSystemPrompt()` lacks the execution boundary block, grounding rules, policy constraints, and capability blocks present in the main pipeline's `promptBuilder.ts`
- `TOOLS` is a subset (3 tools) of the 9 tools in `financialTools.ts`
- `MODEL` is resolved at import time and shared — changing model config requires restart
- Dead code creates maintenance confusion and a risk that future developers mistakenly use the legacy path

### Improvement Opportunities
- Delete dead code (`buildSystemPrompt()`, `TOOLS`, `SYSTEM_PERSONA`)
- Move `MODEL` export to `modelRouter.ts` or inline it in consumers
- Audit sentinel/goal services for execution boundary compliance

---

## 28. Lane 0 Deterministic Path

### Purpose
Handle simple, data-lookup queries without LLM involvement for faster response and cost savings.

### File Location
`server/services/agentOrchestrator.ts` (lines 228–443, ~215 lines within `handleLane0()`)

### How It Works
`handleLane0()` is an async generator that:

1. **Fetches data** — parallel calls to `getPortfolioSnapshot` (always) + `getHoldings` (for portfolio_explain, allocation_breakdown) + goals repo (for goal_progress)
2. **Formats response** — intent-specific template:
   - `goal_progress` → goal list with progress bars; advice variant with monthly contribution calculations
   - `allocation_breakdown` → asset class breakdown with percentages + allocation_chart widget
   - `portfolio_explain` → holdings list with change percentages + holdings_summary widget
   - Default (`balance_query`) → portfolio value with daily change + portfolio_summary widget
3. **Runs guardrails** — `runPostChecks()` on the template output
4. **Emits events** — text, widgets, suggested_questions, done
5. **Persists** — saves to working memory, chat messages, thread preview
6. **Logs trace** — `logAgentTrace()` with model='deterministic'

**Lane 0 override** (line 577): If the message contains entity-specific keywords (sector names, specific tickers), Lane 0 is upgraded to Lane 1/2.

### Key Findings / Issues
- Templates use `**bold**` markdown formatting, violating Ada's own rule: "Never use markdown headers (#), bold (**), or italic (*) formatting"
- Goal advice template contains hardcoded recommendations (automate contributions, review cash, reduce spending, consolidate debt) — not personalized
- Lane 0 tool calls are not individually logged via `logToolRun()` (only in aggregate trace)
- Suggested questions are hardcoded arrays, not dynamically generated

### Improvement Opportunities
- Remove markdown formatting from templates
- Personalize Lane 0 responses using user context (risk profile, portfolio composition)
- Add `logToolRun()` calls for Lane 0 tool executions

---

## 29. Data Flow Diagrams

### Purpose
Visualize the data flow through key system paths.

### File Location
N/A — documentation-only section.

### How It Works

**Lane 0 (Deterministic) Data Flow:**
```
User Message
  → piiDetector.scanForPii()
  → intentClassifier.classifyIntentAsync() → mapOldIntentToNew()
  → agentRepo.getUserTenantId() + userRepo.findUserById() [parallel]
  → policyEngine.evaluatePolicy()
  → modelRouter.buildScorecard() + routeRequest() → Lane 0
  → handleLane0():
      → registry.portfolio.getPortfolioSnapshot() [always]
      → registry.portfolio.getHoldings() [if needed, parallel]
      → portfolioRepo.getGoalsByUserId() [if goals, parallel]
      → Template formatting
      → guardrails.runPostChecks()
      → Emit: text + widget + suggested_questions + done
      → contentRepo.insertChatMessageWithWidgets()
      → traceLogger.logAgentTrace()
```

**Lane 1/2 (LLM) Data Flow:**
```
User Message
  → piiDetector.scanForPii()
  → intentClassifier.classifyIntentAsync() → mapOldIntentToNew()
  → agentRepo.getUserTenantId() + userRepo.findUserById() [parallel]
  → policyEngine.evaluatePolicy()
  → modelRouter.buildScorecard() + routeRequest() → Lane 1 or 2
  → [Parallel prefetch]:
      ragService.buildPortfolioContext()
      memoryService.getEpisodicMemories()
      memoryService.getSemanticFacts()
      prefetchToolData() → wealthEngine computations
  → promptBuilder.buildAgentPrompt()
  → [LLM Streaming Loop, max 3 turns]:
      openaiClient.resilientStreamCompletion()
        → Stream text chunks → emit text events
        → Accumulate tool_calls
        → Execute tools:
            Financial → executeFinancialTool() → registry.*
            RM handoff → rmHandoffService.routeToAdvisor()
            UI → direct handling (simulator, widget, extract_user_fact)
        → Feed tool results back to LLM
  → guardrails.runPostChecks()
  → Emit: widgets + disclosures
  → [Execution enforcement]: if execution_request + no advisor widget → force routeToAdvisor()
  → generateSuggestedQuestions() → emit suggested_questions
  → responseBuilder.buildAdaAnswer()
  → traceLogger.logAgentTrace()
  → memoryService.logAudit()
  → contentRepo.insertChatMessageWithWidgets()
  → [If 10+ turns]: saveEpisodicMemory()
  → emit done
```

**Provider Fallback Flow:**
```
Provider Method Call (via Proxy)
  → Check isProviderHealthy(primary)
      → If unhealthy: skip to next
  → Call primary provider
      → If error result: try next in chain
      → If exception: try next in chain
  → Call secondary provider (if configured)
      → Same error/exception handling
  → Call mock provider (always last)
      → Annotate result.warnings with fallback_chain info
```

### Key Findings / Issues
- Lane 0 and Lane 1/2 share PII scan, intent classification, and policy evaluation — no wasted work
- Prefetch runs in parallel with RAG context and memory retrieval — efficient
- Provider fallback is automatic and transparent to callers

### Improvement Opportunities
- Add timing annotations to data flow diagrams for latency optimization
- Document the exact parallel execution groups

---

## 30. Critical Issues & Technical Debt

### Purpose
Enumerate all identified issues ranked by severity.

### File Location
Cross-cutting — references multiple files.

### How It Works
N/A — findings catalog.

### Key Findings / Issues

#### Critical

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 1 | `ada-fast` and `ada-reason` resolve to same model (`gpt-5-mini`) | Multi-model routing is nominal; no reasoning model advantage | `capabilityRegistry.ts:21-34`, `modelRouter.ts:8-12` |
| 2 | Portfolio provider hardcoded to mock, no fallback chain | Core data cannot be swapped to a real provider without code changes | `registry.ts:148` |
| 3 | Working memory lost on server restart | Users lose conversation context on deploy/restart | `memoryService.ts:8` |

#### High

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 4 | `support` intent is unreachable | Schema and capability registry declare `support` with Lane 1 routing, but classifier taxonomy and `mapOldIntentToNew()` never emit it; dead routing config | `intentClassifier.ts`, `agentOrchestrator.ts:42-67`, `capabilityRegistry.ts:158-165` |
| 5 | 6 stub providers return `notImplemented` | marketaux, ecb, twelve_data, fmp, coingecko, yahoo_finance are dead code paths | `server/providers/stubs.ts` |
| 6 | Legacy `aiService.ts` has dead-code duplicate prompts/tools | `buildSystemPrompt()` and `TOOLS` are unused but create maintenance confusion; only `MODEL` export is consumed | `server/services/aiService.ts` |
| 7 | `ada-fallback` (Claude) missing `tool_calling` in capability registry | Registry says no tool calling, but adapter supports it; could cause incorrect routing decisions | `capabilityRegistry.ts:37-41` |
| 8 | RAG is SQL-only, no vector embeddings | Semantic search limited to PostgreSQL `to_tsvector` keyword matching | `ragService.ts`, `memoryService.ts:62-67` |

#### Medium

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 9 | Lane 0 templates use `**bold**` markdown | Violates Ada's own formatting rules | `agentOrchestrator.ts:305-393` |
| 10 | Tools only offered on first LLM turn | Multi-turn reasoning cannot request additional tools | `agentOrchestrator.ts:684` |
| 11 | PII passport pattern may false-positive on financial IDs | `\b[A-Z]{1,2}\d{6,9}\b` could match tickers/identifiers | `piiDetector.ts:6` |
| 12 | `generateSuggestedQuestions` is a separate LLM call | Adds latency and token cost per response | `agentOrchestrator.ts:445-473` |
| 13 | Episodic memory summary is crude | Truncated turns, pipe-separated, no LLM summarization | `agentOrchestrator.ts:1022` |
| 14 | Lane 0/prefetch tool calls not individually logged | `logToolRun()` only covers LLM tool-call turns; deterministic and prefetch paths lack per-tool logging | `agentOrchestrator.ts:228-443, 169-226` |
| 15 | Provider cache is in-memory | Lost on restart; no multi-instance support | `cache.ts:7` |
| 16 | No API authentication | User ID from unverified header; agent traces exposed without access control | `api.ts:19-23` |
| 17 | `portfolio_explain` routing inconsistency | defaultLane=1 in capability registry but listed in DETERMINISTIC_INTENTS (Lane 0) in model router | `capabilityRegistry.ts:94-101`, `modelRouter.ts:69-74` |

### Improvement Opportunities
See Section 31 for prioritized recommendations.

---

## 31. Recommended Improvements

### Purpose
Prioritized recommendations based on the findings in this review.

### File Location
N/A — recommendations.

### How It Works
N/A — action items.

### Key Findings / Issues
N/A — this section contains recommendations, not findings.

### Improvement Opportunities

#### Priority 1 — Address Before Production

1. **Differentiate ada-reason model** — Point `ada-reason` to a distinct reasoning model (e.g., `o3-mini`, `gpt-5`) to give Lane 2 genuine reasoning capability.
2. **Make portfolio provider configurable** — Move `portfolio` into `withFallbackChain()` like all other providers, enabling real portfolio API integration.
3. **Persist working memory** — Store working memory in PostgreSQL or Redis to survive server restarts.
4. **Add API authentication** — Implement proper auth middleware; restrict agent trace access.

#### Priority 2 — High Value Improvements

5. **Fix unreachable `support` intent** — Either add `support` to the classifier's taxonomy or remove it from schema/routing config.
6. **Retire legacy aiService.ts dead code** — Delete unused `buildSystemPrompt()`, `TOOLS`, `SYSTEM_PERSONA`; move `MODEL` export to modelRouter.
7. **Fix Claude capability registration** — Add `tool_calling` to `ada-fallback` capabilities.
8. **Remove or implement stub providers** — Either implement marketaux/ecb/twelve_data/fmp/coingecko/yahoo_finance or remove them.
9. **Reconcile portfolio_explain routing** — Align its defaultLane between capability registry and model router's deterministic set.

#### Priority 3 — Medium-Term Enhancements

10. **Vector-based RAG** — Add embedding-based retrieval for semantic facts and knowledge base content.
11. **LLM-based memory summarization** — Replace crude pipe-separated episodic summaries with LLM-compressed summaries.
12. **Multi-turn tool calling** — Allow tools on subsequent turns for iterative data gathering.
13. **Fix Lane 0 markdown** — Remove `**bold**` formatting from deterministic templates.
14. **Add tool logging for Lane 0/prefetch** — Call `logToolRun()` for deterministic and prefetch tool executions.
15. **Add SSE keepalive** — Prevent proxy timeouts with heartbeat comments.
16. **Redis-backed provider cache** — Survive restarts and support multi-instance deployments.

---

*End of Review Pack*
