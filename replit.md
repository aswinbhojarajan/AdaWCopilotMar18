# Ada — AI Wealth Copilot

## Overview
Ada is a mobile-first AI wealth management copilot prototype designed for GCC HNW investors. It is a full-stack application providing a comprehensive financial assistant with capabilities for portfolio analysis, goal tracking, market insights, personalized recommendations, execution guardrails with RM handoff, multi-tenant support, and full agent observability. The project aims to deliver an LLM-powered AI chat built on a production-grade agent architecture. The business vision is to empower HNW investors with an intelligent, personalized, and secure platform for managing their wealth, leveraging advanced AI to provide insights and support.

## User Preferences
Not specified.

## System Architecture
Ada is built on a full-stack architecture comprising a React frontend, an Express/TypeScript backend, and a PostgreSQL database.

**Frontend (React 18 + TypeScript):**
- **UI/UX**: Mobile-first design (max 430px) using Tailwind CSS v4, custom fonts, and responsive units. Centralized design tokens.
- **State Management & Data Fetching**: TanStack Query v5.
- **Chat Features**: SSE streaming for real-time text, embedded data widgets, interactive scenario simulators, dynamic suggested questions, and context passing.
- **Animations**: AnimatePresence for transitions and Framer Motion for indicators.

**Backend (Express + TypeScript):**
- **Agent Orchestrator**: Manages the AI chat pipeline, handling PII detection, session hydration, intent classification, policy evaluation, multi-model routing, RAG, prompt assembly, memory, LLM interaction, multi-turn tool execution, wealth engine, guardrails, response building, SSE streaming, trace logging, and memory persistence.
- **Provider Pattern**: Employs 8 external data providers with a priority chain, in-memory cache, rate limiting, health tracking, and automatic failover.
- **Content Moderation**: OpenAI Moderation API integrated as pre/post-LLM safety filter.
- **LLM Resilience & Fallback**: Implements streaming timeout/retry, automatic model downgrades, and fallback to Anthropic Claude.
- **Execution Guardrails & RM Handoff**: Ada cannot execute trades; execution requests are routed to RM via `advisor_action_queue`, webhook, or rejected based on tenant configuration.
- **Structured Response Protocol**: AdaResponseEnvelope v1.0 with 11 block types, FollowUpChip, SourceReference. Hybrid streaming: headline streamed as text, then full envelope via `structured` SSE event.
- **Discover Pipeline**: Automated 8-stage pipeline (Ingest → Enrich → Cluster → Synthesize → Ada View → Editorial Content → Event Calendar → Materialize) for content generation and personalization. FK constraints use ON DELETE SET NULL (article_clusters→discover_cards) and ON DELETE CASCADE (discover_cards→user_discover_feed, user_content_interactions) to prevent constraint violations during cluster cleanup.
- **Editorial Content Pipeline**: `editorialContentWorker.ts` generates segment-personalized `explainer` (whatsNew tab), `wealth_planning` (forYou tab), and `product_opportunity` (forYou tab) cards from a curated `editorial_content` corpus table (16 seed entries). Iterates per user segment (risk_tolerance + aum_tier), filtering corpus by risk eligibility, AUM tier, and allocation-gap relevance for product opportunities. LLM refreshes content with market context plus segment context (risk, AUM, geo, gaps, interests). Runs on the daily editorial timer (24hr default). Per-type freshness: explainer/wealth_planning=7 days, product_opportunity=1 day. Per-type quotas per segment: 2 explainers, 1 wealth_planning, 1 product_opportunity. Generated cards tagged with target_segment, target_risk, target_aum_tier in taxonomy_tags.
- **Home Screen Content**: Home screen content cards are sourced from the discover pipeline (top 3 scored cards personalized per user), with automatic fallback to static content_items if no pipeline cards exist.
- **Personalization**: User segments, scoring engine with diversity guardrails, LLM personalized overlays, pre-computed feeds, interaction tracking, card dismissal with feedback, "New" badge, and CTA personalization.

**Database (PostgreSQL):**
- Contains 44 tables for core app data, agent architecture components, discover pipeline, and execution routing.
- Includes 3 seeded personas with financial data parity and user_profiles for personalization metadata.

**Analytics (PostHog + GA4 Dual Platform):**
- Unified dispatcher pattern sends all events to both PostHog (session replay, product funnels) and Google Analytics 4 (acquisition funnels, audience building).
- PII Safety: Two layers of scrubbing for sensitive data in analytics.
- Virtual Pageview Tracking: Constructs virtual URLs for SPA navigation tracking in both platforms.

## External Dependencies
- **OpenAI**: AI capabilities.
- **Anthropic**: Fallback AI provider.
- **PostHog**: Third-party product analytics, session replay, and feature flags.
- **Google Analytics 4**: Acquisition funnels, audience building, cross-platform attribution.
- **Twelve Data**: Primary market data provider for GCC exchanges and global markets.
- **Finnhub**: Secondary provider for market data, company profiles, and news.
- **Yahoo Finance**: Fallback provider for market data and news.
- **FRED**: Federal Reserve Economic Data for macro indicators.
- **SEC EDGAR**: For company filings.
- **OpenFIGI**: For instrument identifier resolution.
- **Frankfurter**: For ECB reference FX rates.
- **CBUAE**: For UAE Central Bank AED exchange rates.
- **PostgreSQL**: Primary database.
- **Vite**: Frontend build tool.
- **Tailwind CSS**: Frontend styling.
- **TanStack Query**: Frontend data fetching and caching.
- **Zod**: Runtime schema validation.
- **Framer Motion**: Frontend animations.