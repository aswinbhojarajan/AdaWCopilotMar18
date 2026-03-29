# Ada — AI Wealth Copilot

## Overview
Ada is a mobile-first AI wealth management copilot prototype designed for GCC HNW investors. It is a full-stack application providing a comprehensive financial assistant with capabilities for portfolio analysis, goal tracking, market insights, personalized recommendations, execution guardrails with RM handoff, multi-tenant support, and full agent observability. The project aims to deliver an LLM-powered AI chat built on a production-grade agent architecture, focusing on business vision, market potential, and project ambitions.

## User Preferences
Not specified.

## System Architecture
Ada is built on a full-stack architecture comprising a React frontend, an Express/TypeScript backend, and a PostgreSQL database.

**Frontend (React 18 + TypeScript):**
- **UI/UX**: Mobile-first design (max 430px) using Tailwind CSS v4, custom fonts, and responsive units. Design tokens are centralized.
- **Chat Features**: Incorporates SSE streaming for real-time text, embedded data widgets (charts, summaries, goals), interactive scenario simulators, dynamic suggested questions, and context passing.
- **Animations**: Uses AnimatePresence for transitions and Framer Motion for indicators.

**Backend (Express + TypeScript):**
- **Agent Orchestrator**: Manages the AI chat pipeline, handling PII detection, session hydration, intent classification, policy evaluation, model routing, RAG, prompt assembly, memory, LLM interaction, multi-turn tool execution, wealth engine, guardrails, response building, SSE streaming, trace logging, and memory persistence.
- **Core Services**: Includes services for policy evaluation, multi-model routing, prompt assembly, Zod-validated response construction, agent tracing, post-response sanitization, deterministic financial calculations, declarative tool management, execution request routing, OpenAI client integration, LLM-based intent classification, portfolio context building, three-tier memory management, PII detection, goal health scoring, and AI daily briefings.
- **ErrorBoundary**: React class component for user-friendly error handling.
- **Provider Pattern**: Employs external data providers (Stock/Market, News, Macro/Economic, Company Filings, Instrument Lookup, FX Rates, Regional FX) with a priority chain, in-memory cache, rate limiting, health tracking, and automatic failover.
- **Capability Registry**: Configurable named-config model registry with provider aliases (ada-classifier, ada-fast, ada-content, ada-reason, ada-embeddings, ada-moderation, ada-fallback).
- **Content Moderation**: OpenAI Moderation API integrated as pre/post-LLM safety filter.
- **LLM Resilience & Fallback**: Implements streaming timeout/retry, automatic model downgrades, and fallback to Anthropic Claude via Replit AI Integrations.
- **Execution Guardrails & RM Handoff**: Ada cannot execute trades; execution requests are routed to RM via `advisor_action_queue` or rejected.
- **Shared Schemas**: Zod schemas for core agent types are defined for validation.

**Discover Pipeline:**
- **Content Pipeline**: Automated 7-stage pipeline (Ingest → Enrich → Cluster → Synthesize → Ada View → Event Calendar → Materialize) running on timers with concurrency guards.
- **Materialize**: Deactivates expired and low-confidence cards, maintains feed health, and adds per-user feed materialization with weighted scoring and LLM personalized overlays.
- **Card Types**: Supports various card types like portfolio_impact, trend_brief, market_pulse, explainer, wealth_planning, allocation_gap, event_calendar, ada_view, product_opportunity, morning_briefing, milestone.
- **Personalization**: Implements user segments, a deterministic weighted scoring engine, LLM personalized overlays, and pre-computed feeds.
- **Engagement**: Tracks user interactions and re-ranks cards based on engagement signals.
- **Morning Briefing Card**: Daily LLM-synthesized morning brief.
- **Milestone Cards**: Monitors portfolio snapshots for value thresholds and performance, generating celebratory cards.
- **Event-Driven Refresh**: Portfolio-mutating endpoints trigger immediate feed materialization.
- **Expiry Enforcement**: Per-card-type maximum age rules are enforced.

**Database (PostgreSQL):**
- Contains 44 tables for core app data, agent architecture components, discover pipeline, and execution routing.
- Includes seeded personas with full financial data parity plus user_profiles for personalization metadata.
- Stores instruments, market quotes, news items, editorial discover cards, CTA templates, and tenant configuration.

**Key Configuration:**
- **MODEL**: 7-alias model stack using provider aliases (gpt-5.4-nano, gpt-5.4-mini, gpt-5.4, text-embedding-3-small, omni-moderation-latest, claude-sonnet-4-6).
- **User switching**: Supported via `X-User-ID` header and `PersonaPicker`, ensuring data isolation.
- **Verbose/Thinking Mode**: User-toggleable feature to visualize the AI's reasoning pipeline in real-time.
- **Execution routing**: Configurable per tenant, defaults to `rm_handoff`.
- **Policy engine tool profiles**: Defined in tenant config, mapping to tools via `toolRegistry.ts`.

## External Dependencies
- **OpenAI**: AI capabilities (gpt-5.4-nano, gpt-5.4-mini, gpt-5.4; rollback: gpt-4.1 family) via Replit AI Integrations.
- **Anthropic**: Fallback AI provider (claude-sonnet-4-6) via Replit AI Integrations.
- **Finnhub**: Primary provider for live market data, company profiles, and news.
- **Yahoo Finance**: Secondary provider for market data and news.
- **FRED**: Federal Reserve Economic Data for macro indicators.
- **SEC EDGAR**: For company filings and XBRL financial facts.
- **OpenFIGI**: For instrument identifier resolution.
- **Frankfurter**: For ECB reference FX rates.
- **CBUAE**: For UAE Central Bank AED exchange rates.
- **PostgreSQL**: Primary database.