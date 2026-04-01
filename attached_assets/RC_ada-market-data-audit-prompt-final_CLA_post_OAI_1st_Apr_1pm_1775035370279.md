# Ada — Twelve Data Integration Readiness Audit Prompt

> **Run this against the full Ada codebase.** Inspect the entire repo before writing anything.
>
> **Output priority:** If output length is constrained, deliver sections 5, 6, 7, 8, and 9 in full detail with actual code. Sections 11, 12, and 14 can be abbreviated to bullet points. Do NOT truncate mid-section — finish each section before starting the next.

---

## Role

Act as a senior platform architect, backend engineer, and codebase auditor.

## Rules

- Do NOT make code changes.
- Do NOT propose generic advice without grounding it in actual code.
- First inspect the entire repo thoroughly, then produce the report.
- Be explicit about what is **implemented** vs **missing** vs **unclear**.
- Quote exact file paths, function names, env vars, routes, and configs throughout.
- If something cannot be confirmed from code, say **"not found in codebase"**.
- For code snippets, use fenced blocks with the **file path as a comment on line 1**.
- Prefer depth over brevity. Use tables where they help.

## Context

Ada is a wealth copilot (React + TypeScript + Express + PostgreSQL) with AI orchestration, built for ENBD. We are about to integrate **Twelve Data** as a market data provider for UAE/GCC stock quotes (DFM, ADX exchanges). We need to understand the current state of the codebase first.

The specific failure we're solving: a user asks *"What's the current price of Emaar stock in UAE?"* and Ada responds with *"I don't have live price data for Emaar Properties stock (EMAAR.DU)"* — suggesting the system either has no market data provider for GCC exchanges, or the ticker resolution is mapping to the wrong exchange (Düsseldorf instead of Dubai Financial Market).

---

## Deliverable

Produce ONE markdown document covering every section below.

---

# 1. Executive Summary

- High-level current state of the platform
- Current market data capability maturity (what works, what doesn't)
- Whether Ada is ready for Twelve Data integration now, and what's blocking it
- Top 10 key findings
- Top 5 blockers / risks for a day-1 integration

# 2. Repository & Runtime Overview

- Monorepo vs single app vs multi-service structure
- Key folders and their purpose (show the top 2 levels of directory tree)
- Main frontend entry point(s)
- Main backend entry point(s)
- Build/run/deploy setup (scripts from package.json)
- Infrastructure assumptions visible from code (Replit, ports, etc.)

# 3. Frontend Architecture

- Stack and versions (from package.json)
- Routing/navigation pattern (how do Home, Wealth, Discover, Chat tabs work)
- State management approach (Zustand stores — list them)
- Data fetching approach (TanStack Query hooks — list market-related ones)
- How the chat/copilot UI works:
  - Where does the user message go?
  - How is the streaming response rendered?
  - How are tool results / structured data displayed in chat?
- Components that display price, market, or news data — list with file paths
- Current loading/error/empty-state handling for market data in chat

# 4. Backend Architecture

- Stack and versions
- Express app boot flow (entry point → middleware → routes)
- Service layer structure (list all services with file paths)
- Route → controller → service call chain pattern
- SSE/streaming implementation for chat
- Background jobs or workers if any (BullMQ usage)
- Error handling patterns (try/catch, error middleware, provider failures)
- Show the request flow as text:
  ```
  Client → POST /api/chat → chatController → orchestrator → [provider] → SSE stream → Client
  ```

# 5. Database & Schema Audit

**Critical: Show actual DDL, ORM model definitions, or migration SQL — not just table names.**

For each table found, show:
- Table name and schema
- Column definitions (name, type, constraints)
- Relationships / foreign keys

Specifically look for tables related to:
- Users / personas / sessions
- Portfolios / accounts / holdings
- Securities / instruments / tickers
- Market data / prices / quotes
- Watchlists
- News / content / articles
- Conversation / chat history / memory
- Analytics / events

Then answer:
- What instrument/security master data exists today?
- Is there a ticker ↔ exchange mapping table?
- Are ISIN, FIGI, or other identifiers stored?
- Are UAE/GCC exchange identifiers (DFM, ADX, XDFM, XADS) represented anywhere?
- What schema additions would Twelve Data require?

# 6. Provider & Integration Inventory

**For EVERY external integration found in the codebase**, document in a table:

| Provider | Purpose | Files | Env Var(s) | Status |
|----------|---------|-------|------------|--------|
| e.g. Finnhub | Stock quotes | `src/services/finnhub.ts` | `FINNHUB_API_KEY` | Active |

For each provider, also show:
- **One actual API call** from the codebase (the fetch/axios call with URL pattern)
- **Response handling** (how the response is parsed and returned)
- **Error/retry/fallback behavior**
- Whether it supports GCC/UAE exchanges

Cover all categories:
- LLM providers (OpenAI, etc.) — include model strings and aliases
- Market data providers
- News/content providers
- Auth providers
- Analytics providers (PostHog, etc.)
- Any other third-party APIs

**Flag any hardcoded model strings or provider URLs** with exact file:line references.

# 7. AI Orchestration & Agent Flow

This is the most important section for understanding why UAE quotes fail.

Document:
- **Model registry / alias system**: Show the config that maps `ada-classifier`, `ada-fast`, `ada-reason`, `ada-fallback` to actual model strings
- **Classifier / intent routing**: How does the system classify user intent? Show the classifier prompt or logic. What intents exist (e.g., `market_context`, `portfolio`, `general`)?
- **Lane-based routing**: What are the lanes? Show the lane config/definition
- **Tool/function calling**: Show the **full JSON schema or function spec** for any tools the LLM can call related to market data, stock prices, or financial information — the actual tool definition, not a summary
- **System prompts**: Show any system prompts or instructions that reference finance, markets, pricing, or data retrieval
- **Fallback behavior**: What happens when the LLM has no tool or data for a query? Show the code path that produces "I don't have live price data"

### Emaar Query Trace

Trace the exact path for: *"What's the current price of Emaar stock in UAE?"*

```
1. User types message in chat UI
2. Frontend sends to: [endpoint]
3. Backend receives at: [route handler file]
4. Classifier runs: [how? what model? what prompt?]
5. Intent classified as: [what?]
6. Routed to lane: [which?]
7. Lane executes: [what tools/providers are available?]
8. Market data lookup: [what happens? which provider? what symbol?]
9. Response generated: [how does it decide to say "I don't have data"?]
10. Streamed back via: [SSE? WebSocket? polling?]
```

Fill in each step with actual file paths, function names, and code references.

# 8. Current Market Data Capabilities

Assess what the system can actually do today. For each capability, mark ✅ working, ⚠️ partial, or ❌ not available:

| Capability | Status | Provider | Notes |
|-----------|--------|----------|-------|
| Live quotes (US) | | | |
| Live quotes (UAE/GCC) | | | |
| Delayed quotes | | | |
| EOD prices | | | |
| Historical time series | | | |
| Company profiles | | | |
| Symbol search/lookup | | | |
| Market movers | | | |
| News by ticker | | | |
| DFM exchange coverage | | | |
| ADX exchange coverage | | | |
| KSA (Tadawul) coverage | | | |

Also identify:
- Whether current providers are US-centric
- Where symbol normalization breaks (`.DU` vs `.DFM` vs `:DFM`)
- Whether exchange suffixes or MIC codes are handled anywhere in code
- Any symbol mapping files, lookup tables, or normalization functions

# 9. API & Endpoint Map

List all backend routes relevant to market data, chat, or content:

| Method | Path | Handler File | Purpose | Upstream Provider | Frontend Consumer |
|--------|------|-------------|---------|-------------------|-------------------|
| POST | /api/chat | `routes/chat.ts` | Chat message | OpenAI | ChatView |

Include any internal service-to-service calls if present.

# 10. Environment & Configuration

List all env vars found in the codebase (grep for `process.env`):

| Env Var | Purpose | Required | Currently Set? |
|---------|---------|----------|---------------|
| `OPENAI_API_KEY` | LLM provider | Yes | Unknown |

Then answer:
- What new env vars would Twelve Data need? (at minimum `TWELVE_DATA_API_KEY`)
- What config pattern does the app use? (dotenv, Replit Secrets, config files?)
- Is there a centralized config module or are env vars scattered?

# 11. Observability & Failure Handling

Brief assessment (bullet points acceptable):
- How are provider/API failures logged?
- Do errors bubble to the chat UI gracefully?
- Is there any provider latency tracking?
- What telemetry exists for market-data flows?
- What would make a Twelve Data integration failure diagnosable?

# 12. Compliance & Guardrails

Brief assessment (bullet points acceptable):
- Financial disclaimers in chat responses (show the text if found)
- Non-advisory messaging
- Any data usage limitations from current providers
- Caching considerations for delayed vs real-time quote data

# 13. Integration Readiness Assessment

Based on the actual codebase, answer:
- **Best insertion point** for Twelve Data (which file/service/module)
- **Integration pattern**: Should it be a new provider adapter, an extension of existing provider service, or an LLM-callable tool?
- Does the current architecture support multi-provider fallback?
- What is the **minimum code change** needed to get Twelve Data returning a price for `EMAAR` in the chat?
- What is the realistic effort for a day-1 demo integration?

# 14. Gap Analysis

## 14.1 Functional Gaps
What market data features are missing or broken?

## 14.2 Data Model Gaps
What tables/columns/mappings are missing?

## 14.3 API/Service Layer Gaps
What services or endpoints need to be created or modified?

## 14.4 Frontend Gaps
What UI components need updating to display GCC market data?

# 15. Open Questions

List anything that cannot be determined from the repo and needs clarification from the team. Examples:
- Is Finnhub actively used or legacy?
- What Twelve Data plan tier will we have?
- Which specific GCC tickers must work for the ENBD demo?
- Is real-time streaming required or is delayed/EOD acceptable for demo?

# 16. Appendix

## 16.1 Key File Inventory
Table of the 30 most relevant files for this integration, with file path and one-line purpose.

## 16.2 Request Flow Diagrams
Text-based flow diagrams for:
- Chat message → market data response
- Discover tab content loading
- Portfolio data loading

## 16.3 Key Code Snippets
Include the actual code (not summaries) for:
- The classifier/router that handles market_context intent
- The current market data fetching function(s)
- The tool/function definitions available to the LLM
- The ticker/symbol resolution logic
- The SSE streaming handler

---

# Next Best Actions

At the very end, list the **5 most important things to do before writing any integration code**, ordered by priority. Ground each in a specific finding from the audit.

---

*Now inspect the full repo and generate this document.*
