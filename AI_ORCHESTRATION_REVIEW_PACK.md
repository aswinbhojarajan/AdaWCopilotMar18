# Ada AI Orchestration Review Pack

> **Version**: 1.0 · **Date**: 2026-03-23 · **Scope**: Complete AI pipeline audit of the Ada wealth copilot

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Intent Classification Pipeline](#3-intent-classification-pipeline)
4. [Model Router & Lane System](#4-model-router--lane-system)
5. [Capability Registry](#5-capability-registry)
6. [Policy Engine](#6-policy-engine)
7. [Prompt Builder](#7-prompt-builder)
8. [Tool System](#8-tool-system)
9. [Wealth Engine](#9-wealth-engine)
10. [Data Provider Registry](#10-data-provider-registry)
11. [Memory Architecture](#11-memory-architecture)
12. [RAG Service](#12-rag-service)
13. [Guardrails & Safety](#13-guardrails--safety)
14. [PII Detection](#14-pii-detection)
15. [Response Builder](#15-response-builder)
16. [RM Handoff Service](#16-rm-handoff-service)
17. [Trace & Audit Logging](#17-trace--audit-logging)
18. [Streaming Architecture](#18-streaming-architecture)
19. [Fallback & Resilience](#19-fallback--resilience)
20. [Legacy Code](#20-legacy-code)
21. [Persona System](#21-persona-system)
22. [Tenant Configuration](#22-tenant-configuration)
23. [Schema Contracts](#23-schema-contracts)
24. [Known Gaps & Technical Debt](#24-known-gaps--technical-debt)
25. [Risk Assessment](#25-risk-assessment)
26. [Recommendations](#26-recommendations)

---

## 1. Executive Summary

Ada is a mobile-first AI wealth copilot for GCC high-net-worth investors. The system uses a **three-lane routing architecture** (deterministic → fast LLM → reasoning LLM) to process user queries, with a policy engine enforcing advisory boundaries, a wealth engine providing deterministic financial computations, and a guardrail layer that prevents execution-claiming language.

**Key architectural strengths:**
- Clean separation between intent classification, routing, policy, prompting, and generation
- Deterministic wealth engine for all financial math (no LLM hallucination on numbers)
- Hard execution boundary: Ada NEVER claims trade execution capability
- Full traceability with per-message agent traces and tool run logs
- Provider fallback chains with health-check-based routing

**Key concerns identified:**
- `ada-fast` and `ada-reason` both resolve to the same model (`gpt-5-mini`), making the "multi-model" routing nominal
- Portfolio provider is hardcoded to mock with no fallback chain; all other providers have configurable chains
- Working memory (in-process `Map`) is lost on server restart
- RAG is SQL-only (PostgreSQL `to_tsvector`), not vector-embedding-based
- 6 stub providers return `notImplemented` errors (marketaux, ecb, twelve_data, fmp, coingecko, yahoo_finance)
- Legacy `aiService.ts` contains duplicate prompt/tool definitions used only by sentinel/goal services

---

## 2. Architecture Overview

### Request Flow

```
User Message
  → PII Scan (piiDetector.ts)
  → Intent Classification (intentClassifier.ts → LLM + keyword fallback)
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

### File Map

| File | Role | Lines |
|------|------|-------|
| `server/services/agentOrchestrator.ts` | Main pipeline orchestrator | ~1031 |
| `server/services/intentClassifier.ts` | Two-tier intent classification | ~180 |
| `server/services/modelRouter.ts` | Scorecard builder + lane router | ~190 |
| `server/services/capabilityRegistry.ts` | Model registry + intent→lane config | ~244 |
| `server/services/policyEngine.ts` | Tenant policy evaluation | ~168 |
| `server/services/promptBuilder.ts` | System prompt assembly | ~175 |
| `server/services/financialTools.ts` | Tool definitions + execution dispatch | ~278 |
| `server/services/wealthEngine.ts` | Deterministic health/allocation/drift | ~333 |
| `server/services/openaiClient.ts` | Multi-provider LLM client | ~347 |
| `server/services/guardrails.ts` | Post-generation safety checks | ~141 |
| `server/services/piiDetector.ts` | Input PII scanning | ~34 |
| `server/services/memoryService.ts` | Working/episodic/semantic memory | ~127 |
| `server/services/ragService.ts` | SQL-based context retrieval | ~142 |
| `server/services/responseBuilder.ts` | AdaAnswer structured output | ~155 |
| `server/services/rmHandoffService.ts` | Advisor handoff routing | ~148 |
| `server/services/traceLogger.ts` | Agent trace + tool run logging | ~101 |
| `server/providers/registry.ts` | Provider fallback chain factory | ~251 |
| `server/services/aiService.ts` | **Legacy** — used by sentinel/goals only | ~327 |
| `shared/schemas/agent.ts` | Zod schemas for all agent types | ~242 |

---

## 3. Intent Classification Pipeline

### Location
`server/services/intentClassifier.ts`

### Two-Tier Architecture

**Tier 1 — LLM Classification:**
- Model: `gpt-5-mini` (resolved via `resolveModel('ada-fast')`)
- Timeout: 3,000ms
- Retries: 1
- Output: JSON `{"intent": "<intent>", "confidence": <0.0-1.0>}`
- Classifies into 7 old intents: `portfolio`, `goals`, `market`, `scenario`, `recommendation`, `execution_request`, `general`

**Tier 2 — Keyword Fallback:**
- Activated when LLM returns empty content, non-JSON, invalid intent, or throws an error
- Uses weighted keyword matching (score = sum of matched keyword string lengths)
- Confidence set to 0.5 (LLM parse failure) or 0.4 (LLM exception)

### Intent Translation Layer

`mapOldIntentToNew()` in `agentOrchestrator.ts` (lines 42-67) converts the 7 old intents to 11 new `primary_intent` values:

| Old Intent | New Intent(s) |
|------------|---------------|
| `portfolio` | `balance_query`, `portfolio_explain`, `portfolio_health`, or `allocation_breakdown` (keyword sub-classification) |
| `goals` | `goal_progress` |
| `market` | `market_news` |
| `scenario` | `workflow_request` |
| `recommendation` | `recommendation_request` |
| `execution_request` | `execution_request` |
| `general` | `other` |

The `portfolio` sub-classification uses keyword matching:
- Health keywords → `portfolio_health`
- Allocation keywords → `allocation_breakdown`
- Balance keywords → `balance_query`
- Default → `portfolio_explain`

### Supplementary Functions

- `inferReasoningEffort()` — classifies reasoning effort as `low`/`medium`/`high` based on keyword matching
- `inferSuggestedTools()` — maps each intent to a default tool set (e.g., `balance_query` → `['getPortfolioSnapshot']`)
- `extractSymbols()` — regex `\b[A-Z]{2,5}\b` minus common English words
- `extractTopics()` — keyword-based topic tagging for memory summarization

### Classifier Context Injection

The LLM classifier prompt receives routing context from `capabilityRegistry.getClassifierContext()`, which injects:
- Lane descriptions (Lane 0/1/2)
- Intent→lane mapping
- Classifier→routing translation rules

---

## 4. Model Router & Lane System

### Location
`server/services/modelRouter.ts`

### Lane Definitions

| Lane | Label | Purpose | Provider | Temperature | Max Tokens |
|------|-------|---------|----------|-------------|------------|
| `lane0` | Deterministic | Balance/allocation queries; no LLM | `ada-fast` | 0.1 | 1,024 |
| `lane1` | Standard LLM | General conversational queries | `ada-fast` | 0.3 | 2,048–4,096 |
| `lane2` | Reasoning LLM | Complex analysis, recommendations | `ada-reason` | 0.4 | 8,192 |

### Provider Alias Resolution

| Alias | Resolves To | Cost Tier |
|-------|------------|-----------|
| `ada-fast` | `gpt-5-mini` | low |
| `ada-reason` | `gpt-5-mini` | medium |
| `ada-fallback` | `claude-sonnet-4-6` | medium |

**Finding: `ada-fast` and `ada-reason` resolve to the identical model (`gpt-5-mini`).** The only effective differentiation is temperature (0.3 vs 0.4) and max_tokens (2048-4096 vs 8192). The `ada-fallback` (Claude) is only used when OpenAI experiences provider-level errors (429, 5xx, timeout).

### Routing Decision Logic

The `routeRequest()` function applies these rules in order:

1. **Lane 0** — if `requires_deterministic_math` is true (intents: `balance_query`, `portfolio_explain`, `goal_progress`, `allocation_breakdown`)
2. **Lane 2** — if any of:
   - Risk level is `high` (execution_request, recommendation_request)
   - Tool count estimate ≥ 3
   - Intent is in REASONING_INTENTS (`portfolio_health`, `recommendation_request`, `workflow_request`)
   - Reasoning effort is `high`
   - Policy mode is `restricted_advisory`
3. **Lane 1** — everything else

### Lane 0 Override

In the orchestrator (line 577), Lane 0 is upgraded to Lane 1 if the message contains entity-specific keywords (sector names, specific tickers like AAPL/MSFT/NVDA, geographic terms).

### Scorecard

The `RequestScorecard` captures:
- `intent` — primary intent
- `requires_deterministic_math` — boolean
- `risk_level` — low/medium/high
- `context_size_estimate` — calculated as `(2000 + tools*1500) * effortMultiplier`
- `tool_count_estimate` — from `intent.suggested_tools.length`
- `channel` — defaults to `'chat'`
- `reasoning_effort` — low/medium/high

---

## 5. Capability Registry

### Location
`server/services/capabilityRegistry.ts`

### Model Registry

Three models registered:

```
ada-fast:     gpt-5-mini    | streaming, tool_calling, json_mode, fast_response | 128K context | low cost
ada-reason:   gpt-5-mini    | streaming, tool_calling, json_mode, reasoning, long_context | 128K context | medium cost
ada-fallback: claude-sonnet-4-6 | streaming, reasoning, long_context | 200K context | medium cost
```

Notable: `ada-fallback` lacks `tool_calling` capability in the registry, yet the `openaiClient.ts` Anthropic adapter does convert tool definitions for Claude. This is a registry accuracy issue — Claude does support tool calling.

### Intent→Lane Configuration

Each of the 11 intents has a config specifying:
- `defaultLane` — where it routes by default
- `supportedLanes` — valid lane range
- `requiredTools` / `optionalTools` — tool profiles needed

Example: `portfolio_health` defaults to Lane 2, supports Lanes [1, 2], requires `['portfolio_read', 'health_compute']`.

### Dynamic Registration

`registerModel(alias, caps)` allows runtime registration of new model aliases, though this is not used in practice.

---

## 6. Policy Engine

### Location
`server/services/policyEngine.ts`

### Policy Evaluation

`evaluatePolicy(tenantConfig, intent, riskProfile)` produces a `PolicyDecision` with:

| Field | Logic |
|-------|-------|
| `response_mode` | `education_only` if tenant config says so; `restricted_advisory` for recommendation intents when allowed; `personalized_insights` otherwise |
| `allowed_tools` | Resolved from tenant's `allowed_tool_profiles` → mapped to actual tool names via `PROFILE_TOOL_MAP` |
| `recommendation_mode` | `next_best_actions` if tenant allows; `none` otherwise |
| `require_human_review` | `true` for execution_request always; `true` for recommendation_request with advisor handoff requirement; `true` for conservative investors requesting high-effort recommendations |
| `escalation_reason` | Human-readable reason when review is required |
| `execution_route` | From tenant's `execution_routing_mode` (rm_handoff / api_webhook / disabled) |

### Tool Profile Mapping

```
portfolio_read  → getPortfolioSnapshot, getHoldings
market_read     → getQuotes
news_read       → getHoldingsRelevantNews
health_compute  → calculatePortfolioHealth
execution_route → route_to_advisor
workflow_light  → show_simulator, show_widget, extract_user_fact
```

### Disclosure Logic

`getDisclosures()` appends:
- Education-only disclaimers when in education mode
- UAE/GCC-specific disclosures for those jurisdictions
- Generic "past performance" disclaimer for all others
- Advisor review notice when human review is flagged

### Blocked Phrase Enforcement

`checkBlockedPhrases()` checks the response text against the tenant's `blocked_phrases` array (case-insensitive matching).

---

## 7. Prompt Builder

### Location
`server/services/promptBuilder.ts`

### Prompt Structure

The system prompt is assembled from these ordered blocks:

1. **Identity Block** — Ada persona, personality traits, formatting rules
2. **Tenant Behavior Block** — tone, language, jurisdiction, advisory mode
3. **Policy Block** — response mode, recommendation mode, advisor handoff requirements
4. **Capability Block** — model name, context window, capability flags
5. **Tool Rules Block** — tool-use mandates ("MUST call tools", "NEVER invent values")
6. **Execution Boundary Block** — CRITICAL: 8 explicit rules prohibiting trade execution claims
7. **Grounding Rules** — data sourcing mandates, citation requirements
8. **Answer Contract Block** — response format (headline → summary → bullets → next step)
9. **User Profile Block** (conditional) — name, risk tolerance with calibration instruction
10. **Portfolio Context** (conditional) — from RAG service
11. **Semantic Facts** (conditional) — from memory service
12. **Episodic Memories** (conditional) — from memory service
13. **Navigation Context** (conditional) — source screen, category, title
14. **Classified Intent** — primary intent + confidence

### Execution Boundary (Verbatim)

```
• You CANNOT execute trades, place orders, submit transactions, or perform any financial operations
• You CANNOT buy, sell, transfer, wire, or move any funds or securities
• You CAN analyze, plan, and prepare recommendations for the user's advisor to review
• When the user asks you to execute, trade, or place an order, respond by explaining that you have prepared a plan and will route it to their advisor for review and execution
• When the user confirms an action (e.g., "go ahead", "do it", "yes"), call the route_to_advisor tool to send the plan to their advisor
• NEVER say "I will execute", "I will place the order", "I will trade", "executing now", "order submitted", or any variation that implies you have execution capability
• Instead say "I've prepared this plan for your advisor" or "I'll send this to your advisor for review"
• The user's Relationship Manager (advisor) is the ONLY person who can execute trades
```

---

## 8. Tool System

### Location
`server/services/financialTools.ts`

### Tool Definitions

**Financial Tools (5):**

| Tool | Group | Parameters | Description |
|------|-------|-----------|-------------|
| `getPortfolioSnapshot` | financial_data | none | Portfolio value, daily change, cash %, P&L, top movers |
| `getHoldings` | financial_data | none | Holdings with instrument details |
| `getQuotes` | market_intel | `symbols: string[]` | Real-time market quotes |
| `getHoldingsRelevantNews` | market_intel | `limit?: number` | News relevant to portfolio holdings |
| `calculatePortfolioHealth` | financial_data | none | Health score with 5-component analysis |

**UI Tools (3):**

| Tool | Group | Parameters | Description |
|------|-------|-----------|-------------|
| `show_simulator` | ui_actions | `type: enum, initialValues?: object` | Interactive scenario simulator |
| `show_widget` | ui_actions | `type: enum` | Data visualization widget |
| `extract_user_fact` | ui_actions | `fact: string, category: enum` | Save user preference/fact to memory |

**CRM Tool (1):**

| Tool | Group | Parameters | Description |
|------|-------|-----------|-------------|
| `route_to_advisor` | crm_actions | `action_type: enum, summary: string, details?: object` | Route action to advisor for execution |

### Tool Group Filtering

Tools are filtered through a two-stage pipeline:
1. **Policy filter**: `policyDecision.allowed_tools` (from tenant config)
2. **Route filter**: `filterToolNamesByGroups(tools, route.tool_groups)` (from lane routing)

Lane 0 gets no tool groups. Lane 1 gets `financial_data` + `ui_actions`. Lane 2 gets all four groups.

### Tool Execution

`executeFinancialTool()` dispatches by name:
- Portfolio tools → `registry.portfolio.*`
- `getQuotes` → `registry.market.getQuotes(symbols)`
- `getHoldingsRelevantNews` → fetches holdings first, then calls `registry.news.getHoldingsRelevantNews(symbols, limit)`
- `calculatePortfolioHealth` → runs `wealthEngine.calculateHealthScore()` + `analyzeConcentration()` + `computeAllocationBreakdown()` on portfolio data

### Multi-Turn Tool Calling

The orchestrator supports up to **3 sequential tool-call turns** (`MAX_TOOL_TURNS = 3`). However, tools are only passed to the LLM on turn 1 (`useTools = tools.length > 0 && turnCount === 1 && !skipTools`). Subsequent turns process tool results but do not offer new tool calls.

---

## 9. Wealth Engine

### Location
`server/services/wealthEngine.ts`

### Health Score Computation

`calculateHealthScore()` produces a weighted score from 5 components:

| Component | Weight | Logic |
|-----------|--------|-------|
| `diversification` | 25% | Asset class count (max 4) × 40 + sector count (max 5) × 30 + geography count (max 3) × 30 |
| `cash_buffer` | 15% | Distance from ideal cash % (conservative=20%, moderate=10%, aggressive=5%) |
| `concentration_risk` | 25% | Penalties for top holding >20-30% or top-5 >60-80% |
| `risk_alignment` | 20% | Equity ratio vs risk profile (conservative wants <40% equity, aggressive wants >50%) |
| `position_count` | 15% | Optimal at 8-25 positions (score=90), degrades below 5 |

Labels: Excellent (≥80), Good (≥60), Fair (≥40), Needs Attention (<40).

### Concentration Analysis

`analyzeConcentration()` produces:
- `largest_holding_pct` — single largest position
- `top5_pct` — top 5 positions
- Sector/geography/asset-class concentration maps
- Flags for concentrations exceeding thresholds (25% single holding, 75% top-5, 40% sector, 70% geography)

### Allocation Breakdown

`computeAllocationBreakdown()` produces value and percentage by asset class, geography, and sector. Cash is added as a separate asset class entry.

### Drift Analysis

`computeDriftAnalysis()` compares actual allocation against a target (defaults to 55% Stocks / 25% Bonds / 10% Cash / 10% Alternatives). Buckets are flagged when drift exceeds 5%; `needs_rebalance` is true when max drift exceeds 10%.

---

## 10. Data Provider Registry

### Location
`server/providers/registry.ts`

### Architecture

The registry uses a **Proxy-based fallback chain** pattern. For each data domain, multiple providers are chained:

```
Primary → Secondary → Fallback → Mock (always last)
```

Provider selection is configurable via:
- Tenant's `provider_config` map (e.g., `{ "market_primary": "finnhub" }`)
- Environment variables (e.g., `MARKET_PROVIDER_PRIMARY=finnhub`)
- Defaults to `mock` if unconfigured

The `withFallbackChain()` function creates a Proxy that:
1. Skips unhealthy providers (checked via `isProviderHealthy()`)
2. Falls through on error results
3. Annotates fallback usage in `result.warnings`

### Provider Domains

| Domain | Live Providers | Mock | Stub (notImplemented) |
|--------|---------------|------|----------------------|
| `portfolio` | **none** — hardcoded to mock | mockPortfolioProvider | — |
| `market` | finnhub | mockMarketProvider | twelve_data, fmp, coingecko, yahoo_finance |
| `news` | finnhub | mockNewsProvider | marketaux |
| `macro` | fred | mockMacroProvider | ecb |
| `fx` | frankfurter, cbuae | mockFxProvider | — |
| `research` | sec_edgar | mockResearchProvider | — |
| `identity` | openfigi | mockIdentityProvider | — |
| `fxLocalized` | cbuae → frankfurter → mock | — | — |

### Critical Finding: Portfolio Provider

Line 148 of `registry.ts`:
```typescript
portfolio: mockPortfolioProvider,
```

The portfolio provider is the **only domain** that does not go through `withFallbackChain()`. It is hardcoded to the mock provider with no configuration option to swap it. All portfolio data (the core of the application) comes from the mock provider, which reads from the PostgreSQL seed data.

---

## 11. Memory Architecture

### Location
`server/services/memoryService.ts`

### Three-Tier Memory

| Tier | Storage | Persistence | Capacity |
|------|---------|-------------|----------|
| **Working Memory** | In-process `Map<string, ConversationTurn[]>` | Lost on restart | 20 turns per thread (FIFO eviction) |
| **Episodic Memory** | PostgreSQL `episodic_memories` table | Persistent | 5 most recent per user (query limit) |
| **Semantic Facts** | PostgreSQL `semantic_facts` table | Persistent | 10 most recent or text-search ranked |

### Working Memory

- `getWorkingMemory(threadId)` — returns conversation turns for the thread
- `addToWorkingMemory(threadId, turn)` — appends a turn; evicts oldest when >20
- `clearWorkingMemory(threadId)` — deletes all turns for the thread
- **Risk**: All working memory is lost on server restart. No persistence layer.

### Episodic Memory

- Saved when a thread reaches 10+ turns
- Summary is first 6 turns truncated to 80 chars each, pipe-separated
- Topics extracted via `intentClassifier.extractTopics()`
- IDs are timestamp-based: `ep-{timestamp}-{random4}`

### Semantic Facts

- Saved via the `extract_user_fact` tool when the LLM identifies a user preference or life event
- Categories: `preference`, `life_event`, `financial_goal`, `risk_tolerance`, `general`
- Retrieval uses PostgreSQL full-text search (`to_tsvector('english', fact || ' ' || category)`) with `ts_rank_cd` ranking
- Falls back to recency-ordered if no text-search matches

### Audit Logging

`logAudit()` writes to `chat_audit_log` table with: user_id, thread_id, action, intent, pii_detected, input_preview, model, tokens_used.

---

## 12. RAG Service

### Location
`server/services/ragService.ts`

### Architecture

RAG in Ada is **SQL-based retrieval**, not vector-embedding-based. It queries PostgreSQL tables directly to build context.

### Context Assembly

`buildPortfolioContext(userId, intent)` assembles:

| Context Block | Source Table | Included For Intents |
|---------------|-------------|---------------------|
| Portfolio Summary | `portfolio_snapshots` (latest) | All |
| Holdings | `positions` (joined with `accounts`) | portfolio, market, general, recommendation |
| Allocations | `positions` (grouped by asset_class) | portfolio, market, general, recommendation |
| Goals | `goals` | goals, scenario, recommendation, general |
| Accounts | `accounts` | portfolio, general |
| Recent Transactions | `transactions` (latest 10) | All |

### Limitations

- No vector embeddings or semantic similarity search
- No document chunking or retrieval from knowledge bases
- Context is always the full SQL query result (no relevance filtering beyond intent-based inclusion)
- Semantic fact retrieval (in memoryService) uses PostgreSQL `to_tsvector` which provides basic keyword matching, not semantic understanding

---

## 13. Guardrails & Safety

### Location
`server/services/guardrails.ts`

### Post-Generation Checks

`runPostChecks()` runs after LLM generation and returns:
- `passed` — whether any interventions were triggered
- `interventions` — list of issues found
- `sanitizedText` — cleaned response text
- `appendedDisclosures` — additional disclosures to append

### Check Pipeline

1. **Blocked Phrase Check** — tenant-configured blocked phrases are replaced with `[REDACTED]`
2. **Execution Boundary Enforcement** — 7 regex patterns catch execution-claiming language:
   - "I will place/submit/execute the order/trade"
   - "I'll buy/sell/trade for you"
   - "executing/processing the order now"
   - "order has been submitted/placed/executed"
   - "trade has been confirmed/executed"
   - A hard final check catches any surviving execution-claiming language
3. **Education-Only Mode** — removes advisory language ("you should buy", "I recommend buying")
4. **Security Naming** — removes specific ticker symbols if `can_name_securities` is false
5. **Data Freshness** — flags tool results older than `data_freshness_threshold_seconds` (default 300s)
6. **Disclosure Auto-Append** — adds "past performance" disclaimer if not already present
7. **Citation Completeness** — checks that data-backed claims cite their sources; appends source block if missing

### Execution Boundary — Defense in Depth

The execution boundary is enforced at **three layers**:
1. **Prompt layer** — 8 explicit rules in the system prompt (promptBuilder.ts)
2. **Guardrail layer** — 7 regex patterns + hard check (guardrails.ts)
3. **Orchestrator layer** — fallback enforcement: if intent is `execution_request` and no `advisor_handoff` widget was produced, the orchestrator forces a `routeToAdvisor()` call (agentOrchestrator.ts, lines 920-944)

---

## 14. PII Detection

### Location
`server/services/piiDetector.ts`

### Patterns Detected

| Type | Pattern | Example |
|------|---------|---------|
| Email | `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` | user@example.com |
| Phone | `(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}` | +1-555-123-4567 |
| SSN | `\b\d{3}-\d{2}-\d{4}\b` | 123-45-6789 |
| Credit Card | `\b(?:\d{4}[-\s]?){3}\d{4}\b` | 4111-1111-1111-1111 |
| Passport | `\b[A-Z]{1,2}\d{6,9}\b` | AB123456789 |
| IBAN | `\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b` | AE070331234567890123456 |

### Behavior

- Runs on every incoming message before any processing
- Detected PII is replaced with `[REDACTED_TYPE]` tokens
- The sanitized version is used for LLM context and intent classification
- PII detection status is logged in the audit log

### Limitations

- Regex-only; no ML-based entity recognition
- May false-positive on ticker symbols (passport pattern `\b[A-Z]{1,2}\d{6,9}\b` could match)
- No detection for names, addresses, dates of birth, or national IDs beyond the listed patterns

---

## 15. Response Builder

### Location
`server/services/responseBuilder.ts`

### AdaAnswer Structure

`buildAdaAnswer()` constructs a structured response object:

| Field | Source |
|-------|--------|
| `answer_id` | Timestamp + random suffix |
| `mode` | `instant` (education or no tools), `analysis` (tool-backed) |
| `user_intent` | From intent classification |
| `headline` | First line of LLM response |
| `summary` | Lines 2-4 of LLM response |
| `key_points` | Extracted bullet points (•, -, *, numbered) from LLM text |
| `portfolio_insights` | Health score + concentration flags from wealth engine results |
| `market_context` | Relevant instruments + news topics from tool results |
| `recommendations` | Based on policy decision recommendation_mode |
| `actions` | Advisor handoff action if human review required |
| `disclosures` | From policy engine |
| `citations` | From tool results (source_type, source_name, as_of) |
| `render_hints` | Boolean flags for portfolio/news/health card rendering |
| `suggested_questions` | From follow-up generation |
| `tool_results` | Raw tool results array |

---

## 16. RM Handoff Service

### Location
`server/services/rmHandoffService.ts`

### Routing Modes

| Mode | Behavior |
|------|----------|
| `rm_handoff` | Inserts into `advisor_action_queue` table with status `'pending'`; returns queue ID and advisor name |
| `api_webhook` | POSTs JSON to `execution_webhook_url`; falls back to queue on failure |
| `disabled` | Returns error message |

### Queue Entry

When routing via queue:
1. Looks up `advisor_id` from `users` table
2. Looks up advisor name from `users` table
3. Inserts into `advisor_action_queue` with tenant_id, user_id, advisor_id, conversation_id, action_type, action_details (JSON), status='pending'
4. Returns queue reference number for user visibility

### Webhook Fallback

If webhook POST fails (non-2xx response or network error), automatically falls back to queue-based routing.

---

## 17. Trace & Audit Logging

### Location
`server/services/traceLogger.ts`

### Agent Trace

Every message produces a trace record with:
- Conversation/message/tenant/user IDs
- Intent classification
- Policy decision
- Model name with lane/alias annotation (e.g., `gpt-5-mini [lane2/ada-reason]`)
- Reasoning effort
- Tool set exposed vs. tools actually called
- Final AdaAnswer
- Response time and step timings
- Guardrail interventions
- Escalation decisions (including route rationale and scorecard)

### Step Timings Captured

| Timing | What It Measures |
|--------|-----------------|
| `session_hydrate_ms` | Tenant config + user profile lookup |
| `intent_classification_ms` | LLM intent classification |
| `policy_evaluation_ms` | Policy engine evaluation |
| `tool_execution_ms` | Data prefetch + tool execution |
| `llm_generation_ms` | Full LLM streaming cycle (including tool turns) |
| `post_checks_ms` | Guardrail checks + disclosure generation |
| `total_ms` | End-to-end request time |

### Tool Run Logging

Tool executions from **LLM tool-call turns** (Lane 1/2) are logged individually via `logToolRun()` with:
- Tool name, inputs, outputs
- Latency in milliseconds
- Status (ok/error/partial/timeout)
- Source provider
- Conversation/message/user context

**Scope limitation**: Lane 0 deterministic tool calls and data prefetch runs (`prefetchToolData()`) are NOT logged through `logToolRun()`. They appear only in the aggregate agent trace (via `toolCallsMade` array). This means per-tool latency breakdowns are unavailable for the most common query paths (balance, allocation).

---

## 18. Streaming Architecture

### SSE Event Types

| Event Type | Payload | Purpose |
|------------|---------|---------|
| `text` | `content: string` | Streaming text chunks from LLM |
| `widget` | `widget: { type, ...data }` | Embedded data widgets |
| `simulator` | `simulator: { type, initialValues }` | Scenario simulator |
| `suggested_questions` | `suggestedQuestions: string[]` | Follow-up question suggestions |
| `thinking` | `step: string, detail: string` | Verbose mode trace events |
| `done` | — | Stream complete signal |
| `error` | `content: string` | Error message |

### Thinking Mode

When `verbose === true` (controlled by user toggle + tenant feature flag):
- Thinking events are emitted at each pipeline stage
- Events include PII scan results, intent classification, policy evaluation, routing decisions, model selection, data prefetch status, LLM generation, guardrail checks
- `await new Promise(r => setImmediate(r))` calls ensure thinking events flush before next stage

---

## 19. Fallback & Resilience

### LLM Fallback Chain

```
Non-streaming:
  OpenAI attempt 1 → OpenAI attempt 2 → Anthropic Claude (ada-fallback)

Streaming (in agentOrchestrator.ts):
  createLLMStream(1) → createLLMStream(2) → Lane downgrade (Lane 2 → Lane 1) → error

Each createLLMStream call goes through resilientStreamCompletion, which itself has
OpenAI → Claude fallback on provider errors (429, 5xx, timeout, network).
```

### Provider Error Detection

`isProviderError()` in `openaiClient.ts` classifies errors as provider-level (eligible for fallback) if:
- HTTP status ≥ 429 or status === 0
- Error message contains: timeout, abort, econnrefused, econnreset, enotfound, socket hang up, fetch failed, network, 429, 500, 502, 503, 504, rate limit, service unavailable, internal server error

Non-provider errors (e.g., invalid request, authentication) are NOT retried or fallen back.

### Anthropic Adapter

`openaiClient.ts` contains a full Anthropic adapter that:
- Converts OpenAI message format to Anthropic format
- Extracts system messages into Anthropic's `system` parameter
- Converts `tool` role messages to `user` role with `[Tool result]:` prefix
- Converts OpenAI tool definitions to Anthropic tool format
- For streaming: maps Anthropic stream events (`content_block_delta`, `content_block_start`) to OpenAI chunk format
- Handles tool_use blocks in both streaming and non-streaming modes

### Lane Downgrade

If Lane 2 (ada-reason) fails after 2 attempts:
1. Emits a thinking event about the fallback
2. Retries with `ada-fast` at Lane 1 settings (max_tokens=4096, timeout=20000ms)
3. If Lane 1 also fails, throws to the error handler

### Suggested Questions Fallback

If the follow-up question generation LLM call fails, returns hardcoded defaults:
```
['Tell me more about my portfolio', 'How is the market doing?', 'What should I focus on?']
```

---

## 20. Legacy Code

### Location
`server/services/aiService.ts`

### Status

This file is **legacy** and is NOT used by the main chat pipeline (`agentOrchestrator.ts`). It contains exports consumed by auxiliary services:
- `morningSentinelService.ts` — imports `MODEL` constant (the resolved model name)
- `goalService.ts` — uses `generateJsonCompletion` with its own custom prompts (does NOT use `aiService`'s `buildSystemPrompt()` or `TOOLS`)

### Contents

- `SYSTEM_PERSONA` — duplicate of the Ada persona (similar to `promptBuilder.ts` identity block)
- `buildSystemPrompt()` — simplified prompt builder without policy/capability/grounding blocks; **not actively called by any service in the current codebase**
- `TOOLS` — duplicate tool definitions for `show_simulator`, `show_widget`, `extract_user_fact`; **not actively called by any service in the current codebase**
- Stream and non-stream chat functions

### Risk

The primary risk is that `MODEL` is resolved at import time and shared across services. The `buildSystemPrompt()` and `TOOLS` exports are dead code — not currently called — but their presence creates confusion and a maintenance risk if future developers mistakenly use them instead of the main pipeline's `promptBuilder.ts` / `financialTools.ts`.

### Coverage Note

This audit focuses on the main chat pipeline (`agentOrchestrator.ts`). The auxiliary AI paths (morning sentinel, goal health updates) use their own prompt construction and were reviewed only for import/dependency overlap, not for full behavioral audit.

---

## 21. Persona System

### Demo Personas

| Persona | Risk Profile | Risk Score | Key Traits |
|---------|-------------|------------|------------|
| **Aisha Al-Rashid** | Moderate | 55/100 | Balanced portfolio, family goals (house, education) |
| **Khalid Al-Mansoori** | Conservative | 25/100 | Capital preservation, bond-heavy, retirement focus |
| **Raj Patel** | Aggressive | 82/100 | Growth-oriented, tech-heavy, high-risk tolerance |

### Risk-Calibrated Behavior

The risk profile influences:
1. **Prompt calibration** — "Calibrate all investment language and risk framing to this {level} risk profile"
2. **Wealth engine scoring** — Cash buffer ideal varies by profile; risk alignment scoring adjusts
3. **Policy escalation** — Conservative investors with high-effort recommendations trigger advisor review
4. **Lane 0 templates** — Deterministic responses don't change per persona (same template text)

---

## 22. Tenant Configuration

### Schema

`TenantConfig` (defined in `shared/schemas/agent.ts`) includes:

| Field | Type | Purpose |
|-------|------|---------|
| `tenant_id` | string | Unique tenant identifier |
| `jurisdiction` | string | Legal jurisdiction (UAE, GCC) |
| `advisory_mode` | enum | education_only / personalized_insights_only / restricted_advisory |
| `can_name_securities` | boolean | Whether specific tickers can be mentioned |
| `can_compare_products` | boolean | Whether product comparison is allowed |
| `can_generate_recommendations` | boolean | Whether recommendations are allowed |
| `can_generate_next_best_actions` | boolean | Whether NBA suggestions are allowed |
| `requires_advisor_handoff_for_specific_advice` | boolean | Force advisor handoff for specific advice |
| `disclosure_profile` | string | Disclosure template set |
| `allowed_tool_profiles` | string[] | Tool profile whitelist |
| `provider_config` | Record | Data provider configuration overrides |
| `feature_flags` | Record | Feature toggles (verbose_mode, etc.) |
| `tone` | string | Response tone (professional, casual) |
| `language` | string | Response language |
| `blocked_phrases` | string[] | Phrases to redact from responses |
| `data_freshness_threshold_seconds` | number | Stale data threshold (default 300s) |
| `execution_routing_mode` | enum | rm_handoff / api_webhook / disabled |
| `execution_webhook_url` | string | Webhook URL for API routing mode |
| `can_prepare_trade_plans` | boolean | Whether trade plan preparation is allowed |

---

## 23. Schema Contracts

### Zod Schemas (`shared/schemas/agent.ts`)

All agent types are defined as Zod schemas with corresponding TypeScript types:

| Schema | Key Fields |
|--------|------------|
| `ToolResult` | status (ok/error/partial/timeout), source_name, source_type, as_of, latency_ms, data, warnings |
| `Citation` | source_type (9 enum values), source_name, reference_id, as_of |
| `AdaAnswer` | 14 fields including headline, summary, key_points, portfolio_insights, market_context, recommendations, actions, disclosures, citations, render_hints, suggested_questions, tool_results |
| `PolicyDecision` | allow_response, response_mode (3 modes), allowed_tools, recommendation_mode, require_disclosures, require_human_review, escalation_reason, execution_route |
| `IntentClassification` | primary_intent (11 values), confidence, entities (symbols, asset_classes, time_range, currencies), reasoning_effort, suggested_tools |
| `AgentTrace` | Full trace context with all pipeline decisions |
| `TenantConfig` | Full tenant configuration (see Section 22) |
| `MarketQuote` | Symbol, price, change, volume, OHLC |
| `NewsArticle` | Title, summary, publisher, symbols, relevance_tags |
| `MacroIndicator` | Series ID, value, unit, frequency |
| `FxRate` | Base, target, rate, inverse_rate |
| `Filing` | Company, type, title, filed_date, summary |
| `InstrumentIdentity` | Symbol, name, FIGI, ISIN, exchange, asset_class |

---

## 24. Known Gaps & Technical Debt

### Critical

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 1 | `ada-fast` and `ada-reason` resolve to same model (`gpt-5-mini`) | Multi-model routing is nominal; no reasoning model advantage | `capabilityRegistry.ts:21-34`, `modelRouter.ts:8-12` |
| 2 | Portfolio provider hardcoded to mock, no fallback chain | Core data cannot be swapped to a real provider without code changes | `registry.ts:148` |
| 3 | Working memory lost on server restart | Users lose conversation context on deploy/restart | `memoryService.ts:8` |

### High

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 4 | `support` intent is unreachable | Schema and capability registry declare a `support` intent with Lane 1 routing, but the classifier taxonomy (7 old intents) and `mapOldIntentToNew()` never emit it; dead routing config | `intentClassifier.ts`, `agentOrchestrator.ts:42-67`, `capabilityRegistry.ts:158-165` |
| 5 | 6 stub providers return `notImplemented` | marketaux, ecb, twelve_data, fmp, coingecko, yahoo_finance are dead code paths | `server/providers/stubs.ts` |
| 6 | Legacy `aiService.ts` has dead-code duplicate prompts/tools | `buildSystemPrompt()` and `TOOLS` are unused but create maintenance confusion; only `MODEL` export is consumed | `server/services/aiService.ts` |
| 7 | `ada-fallback` (Claude) missing `tool_calling` in capability registry | Registry says no tool calling, but adapter supports it; could cause incorrect routing decisions | `capabilityRegistry.ts:37-41` |
| 8 | RAG is SQL-only, no vector embeddings | Semantic search limited to PostgreSQL `to_tsvector` keyword matching | `ragService.ts`, `memoryService.ts:62-67` |

### Medium

| # | Issue | Impact | Location |
|---|-------|--------|----------|
| 9 | Lane 0 deterministic templates use markdown formatting (`**bold**`) | Violates Ada's own formatting rules ("Never use markdown headers, bold, or italic") | `agentOrchestrator.ts:305-393` |
| 10 | Tools only offered on first LLM turn | Multi-turn reasoning cannot request additional tools after initial tool results | `agentOrchestrator.ts:684` |
| 11 | PII detector may false-positive on passport pattern for tickers | `\b[A-Z]{1,2}\d{6,9}\b` could match certain financial identifiers | `piiDetector.ts:6` |
| 12 | `generateSuggestedQuestions` uses separate LLM call | Adds latency and token cost for every response | `agentOrchestrator.ts:445-473` |
| 13 | Episodic memory summary is crude (truncated turns, pipe-separated) | Summaries lack meaningful compression; no LLM-based summarization | `agentOrchestrator.ts:1022` |
| 14 | Lane 0 / prefetch tool calls not individually logged | `logToolRun()` only covers LLM tool-call turns; deterministic and prefetch paths lack per-tool logging | `agentOrchestrator.ts:228-443, 169-226` |

---

## 25. Risk Assessment

### Execution Safety — LOW RISK ✅

The execution boundary is enforced at three independent layers (prompt, guardrails, orchestrator fallback). Even if the LLM ignores prompt instructions, regex-based guardrails catch execution-claiming language, and the orchestrator forces advisor handoff for execution_request intents.

### Data Accuracy — MEDIUM RISK ⚠️

- Financial math is deterministic (wealth engine), not LLM-generated ✅
- Tool-grounding rules mandate data sourcing from tools ✅
- However, Lane 0 templates hardcode formatting but the raw numbers come from tool data ✅
- Guardrails flag responses with financial figures but no successful tool backing ✅

### Privacy — LOW-MEDIUM RISK ⚠️

- PII detection covers major patterns (email, phone, SSN, CC, passport, IBAN) ✅
- PII is redacted before LLM context ✅
- However, names and addresses are not detected ⚠️
- Sanitized message (not original) is used for audit log previews ✅

### Availability — MEDIUM RISK ⚠️

- LLM fallback chain (OpenAI → Claude) provides provider redundancy ✅
- Data provider fallback chains with health checks ✅
- Working memory loss on restart ⚠️
- No circuit breaker beyond health check at provider level ⚠️

---

## 26. Recommendations

### Priority 1 — Address Before Production

1. **Differentiate ada-reason model**: Point `ada-reason` to a distinct reasoning model (e.g., `o3-mini`, `gpt-5`) to give Lane 2 genuine reasoning capability.
2. **Make portfolio provider configurable**: Move `portfolio` into `withFallbackChain()` like all other providers, enabling real portfolio API integration.
3. **Persist working memory**: Store working memory in PostgreSQL or Redis to survive restarts.

### Priority 2 — High Value Improvements

4. **Retire legacy aiService.ts**: Migrate sentinel and goal services to use `promptBuilder.ts` + `financialTools.ts` so all prompts share the execution boundary and grounding rules.
5. **Fix Claude capability registration**: Add `tool_calling` to `ada-fallback` capabilities in the registry.
6. **Remove stub providers**: Either implement or remove the 6 stub providers to reduce confusion.

### Priority 3 — Medium-Term Enhancements

7. **Vector-based RAG**: Add embedding-based retrieval for semantic facts and knowledge base content.
8. **LLM-based memory summarization**: Replace crude pipe-separated episodic summaries with LLM-compressed summaries.
9. **Multi-turn tool calling**: Allow tools on subsequent turns for iterative data gathering.
10. **Fix Lane 0 markdown**: Remove `**bold**` formatting from deterministic templates to match Ada's formatting contract.

---

*End of Review Pack*
