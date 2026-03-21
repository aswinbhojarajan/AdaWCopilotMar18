# Ada — AI Wealth Copilot

## Overview
Ada is a mobile-first AI wealth management copilot prototype designed for GCC HNW investors. It's a full-stack application featuring an Express backend, PostgreSQL database, and a React frontend with an LLM-powered AI chat. The project aims to provide a comprehensive financial assistant with capabilities for portfolio analysis, goal tracking, market insights, and personalized recommendations, built on a robust agent architecture with multi-tenant support and full observability.

## User Preferences
Not specified.

## System Architecture
Ada is built on a full-stack architecture with a React frontend, an Express/TypeScript backend, and a PostgreSQL database.

**Frontend (React 18 + TypeScript):**
- **UI/UX**: Mobile-first design, Tailwind CSS v4 for styling, custom fonts (Crimson Pro, DM Sans).
- **State Management & Data Fetching**: TanStack Query v5 for API interactions.
- **Navigation**: useState-based routing for Home, Wealth, Discover, and Collective tabs.
- **Chat Features**: SSE streaming for real-time text rendering, embedded data widgets, interactive scenario simulators, dynamic suggested questions, and context passing from other screens.
- **Animations**: Uses AnimatePresence for tab transitions and overlays, and Framer Motion for an animated tab indicator.

**Backend (Express + TypeScript):**
- **API**: RESTful API endpoints for health checks, user profiles, home summary, wealth data, notifications, content, and comprehensive chat functionalities including SSE streaming for AI chat.
- **Agent Orchestrator**: A core service (`agentOrchestrator.ts`) that manages the AI chat pipeline, including PII detection, session hydration, intent classification, policy evaluation, model routing, RAG pipeline, prompt assembly, memory management (working, episodic, semantic), LLM function calling with 8 financial and UI tools, wealth engine calculations, guardrails, response building, and trace logging.
- **Services**:
    - `aiService.ts`: Manages OpenAI client and streaming completions.
    - `financialTools.ts`: Defines and dispatches 8 OpenAI function-calling tools.
    - `policyEngine.ts`: Evaluates code-driven policies based on tenant configuration and intent.
    - `wealthEngine.ts`: Provides deterministic financial calculations for portfolio health, concentration, allocation, and drift.
    - `promptBuilder.ts`: Assembles modular system prompts.
    - `modelRouter.ts`: Selects AI models based on intent complexity.
    - `responseBuilder.ts`: Constructs structured `AdaAnswer` responses and maps them to SSE events.
    - `traceLogger.ts`: Persists agent traces and tool runs to the database.
    - `guardrails.ts`: Performs post-response sanitization.
    - `intentClassifier.ts`: Classifies user messages into intents.
    - `ragService.ts`: Builds portfolio context from user data.
    - `memoryService.ts`: Manages three-tier memory for conversations.
    - `piiDetector.ts`: Detects and redacts PII from user input.
    - `morningSentinelService.ts`: Generates AI-powered daily briefings with anomaly detection.
- **Data Access Layer**: `repositories/` directory for PostgreSQL queries.
- **Provider Pattern**: Employs a provider pattern with 7 data provider interfaces (Portfolio, Market, News, Macro, FX, Research, Identity) and DB-backed mock implementations. A provider registry resolves configurations via `tenant_config.provider_config`.
- **Policy Engine**: Code-driven policy decisions per tenant, controlling advisory mode, allowed tools, disclosure profile, and feature flags.
- **Agent Tracing & Observability**: Detailed logging of tool runs and agent traces for full observability.
- **Structured Responses**: Uses a standardized `AdaAnswer` schema for structured AI responses, including headline, summary, insights, recommendations, and render hints.
- **Validation**: Zod for runtime schema validation of AI and policy contracts.
- **Error Handling**: `asyncHandler` wrapper for Express routes and a global error handler.

**Database (PostgreSQL):**
- Contains 31 tables covering core application data (users, accounts, portfolios, goals, chat, content) and agent architecture data (tenants, tenant_configs, instruments, market_quotes, news_items, tool_runs, agent_traces, policy_decisions, conversation_summaries).
- `schema.sql` defines the schema, and `seed.sql` provides demo data for 8 personas, instruments, market quotes, and news items.

## External Dependencies
- **OpenAI**: Used for AI capabilities via Replit AI Integrations, specifically the `gpt-5-mini` model, with streaming SSE for chat and Morning Sentinel.
- **PostgreSQL**: The primary database, managed by Replit.
- **Vite**: Frontend build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **TanStack Query**: For data fetching and caching in the frontend.
- **Zod**: For runtime schema validation.
- **ESLint & Prettier**: For code linting and formatting.
- **Framer Motion**: For animations in the frontend.