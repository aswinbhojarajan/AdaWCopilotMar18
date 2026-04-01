# Morning Sentinel Architecture

## Overview

Morning Sentinel is an AI-generated daily portfolio briefing card for the Ada wealth copilot home screen. It gathers portfolio metrics from PostgreSQL, detects anomalies against configurable thresholds, constructs a structured prompt, and streams an LLM-generated briefing to the frontend via Server-Sent Events.

## Source File Origins

Each file in this export package was extracted from the Ada codebase. Source paths are noted in file headers:

| Export File | Original Source |
|---|---|
| `frontend/components/MorningSentinelCard.tsx` | `src/components/ada/MorningSentinelCard.tsx` |
| `frontend/components/SparkIcon.tsx` | `src/components/ada/SparkIcon.tsx` + `src/imports/svg-htxx3p4b7c.ts` |
| `frontend/components/Skeleton.tsx` | `src/components/ada/Skeleton.tsx` |
| `frontend/hooks/useMorningSentinel.ts` | `src/hooks/useMorningSentinel.ts` |
| `frontend/types/index.ts` | `shared/types.ts` + `src/types/index.ts` |
| `backend/services/morningSentinelService.ts` | `server/services/morningSentinelService.ts` |
| `backend/routes/sentinelRoutes.ts` | `server/routes/api.ts` (sentinel routes only) |
| `backend/types.ts` | `shared/types.ts` |
| `database/schema.sql` | `server/db/schema.sql` (6 tables extracted) |
| `database/seed.sql` | `server/db/seed.sql` (Aisha persona data) |

## Data Flow

1. **Client loads home screen** -- `useMorningSentinel` hook fires
2. **Parallel strategy** -- TanStack Query tries `GET /api/morning-sentinel` (REST); if no response within 500ms, falls back to SSE streaming via `GET /api/morning-sentinel/stream`
3. **Server receives request** -- checks in-memory cache (keyed `userId:YYYY-MM-DD`, 4-hour TTL)
4. **Cache miss** -- runs 6 parallel PostgreSQL queries via `gatherMetrics()`
5. **Anomaly detection** -- `detectAnomalies()` checks daily change, goal health, concentration
6. **Prompt construction** -- `buildSentinelPrompt()` creates a JSON-only prompt with portfolio context
7. **LLM streaming** -- `resilientStreamCompletion()` streams tokens; server yields SSE events
8. **Client rendering** -- `StreamingSentinel` shows metrics immediately, streaming indicator during generation, then `MorningSentinelCard` renders the full briefing on `complete` event

## Dependency Adapter Pattern

External dependencies are isolated in `deps.ts` files:
- `frontend/hooks/deps.ts` -- auth fetch, user context, auth error handler
- `backend/services/deps.ts` -- database pool, LLM model/client

This keeps all other source files free of external import paths. Consumers replace only the `deps.ts` files to integrate.
