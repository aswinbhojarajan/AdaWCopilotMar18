# Morning Sentinel Export Package

Self-contained reference package for replicating the Morning Sentinel card feature in another Ada instance. This package includes all frontend components, backend services, database schemas, and seed data needed to stand up the feature.

![Morning Sentinel Reference](assets/morning-sentinel-reference.png)

---

## Architecture Overview

Morning Sentinel is an AI-generated daily portfolio briefing that surfaces on the home screen. It analyzes the user's portfolio, detects anomalies, and produces a structured briefing with headline, key movers, flagged risks, and suggested actions.

### Data Flow

```
+-----------------------------------------------------------------+
|  CLIENT                                                         |
|                                                                 |
|  useMorningSentinel hook                                        |
|    +-- TanStack Query: GET /api/morning-sentinel (fast path)    |
|    +-- SSE Stream: GET /api/morning-sentinel/stream             |
|         +-- event: metrics   -> show portfolio value immediately|
|         +-- event: text      -> show streaming indicator        |
|         +-- event: complete  -> render full briefing card       |
|                                                                 |
|  MorningSentinelCard                                            |
|    +-- SentinelSkeleton      (loading state)                    |
|    +-- StreamingSentinel     (streaming state)                  |
|    +-- Full card             (complete state)                   |
+-----------------------------------------------------------------+
                          |
                          v
+-----------------------------------------------------------------+
|  SERVER                                                         |
|                                                                 |
|  GET /api/morning-sentinel                                      |
|    -> morningSentinelService.generateBriefing(userId)           |
|                                                                 |
|  GET /api/morning-sentinel/stream                               |
|    -> morningSentinelService.generateBriefingStream(userId)     |
|         1. Check in-memory cache (4-hour TTL, keyed user:date)  |
|         2. gatherMetrics(userId) -- 6 parallel DB queries       |
|         3. detectAnomalies(metrics) -- threshold checks         |
|         4. buildSentinelPrompt(metrics, anomalies)              |
|         5. LLM streaming completion -> structured JSON          |
|         6. Parse response, cache, yield complete event          |
+-----------------------------------------------------------------+
                          |
                          v
+-----------------------------------------------------------------+
|  DATABASE (PostgreSQL)                                          |
|                                                                 |
|  6 tables queried:                                              |
|    users              -> user's first name                      |
|    portfolio_snapshots -> total value, daily change             |
|    positions + accounts -> holdings with gain/loss              |
|    positions + accounts -> asset class allocations              |
|    goals              -> goal progress and health status        |
|    alerts             -> recent alerts (unread count)           |
+-----------------------------------------------------------------+
```

---

## Package Contents

```
exports/morning-sentinel/
+-- README.md                                    <- this file
+-- docs/
|   +-- architecture.md                          <- data flow, source origins, adapter pattern
|   +-- environment-variables.md                 <- required env vars and configuration constants
+-- frontend/
|   +-- components/
|   |   +-- MorningSentinelCard.tsx               <- main component (+ StreamingSentinel, SentinelSkeleton)
|   |   +-- SparkIcon.tsx                        <- sparkle icon (SVG paths inlined from Figma import)
|   |   +-- Skeleton.tsx                         <- loading skeleton primitive
|   +-- hooks/
|   |   +-- useMorningSentinel.ts                <- TanStack Query hook + SSE stream consumer
|   |   +-- deps.ts                              <- consumer-provided dependency stubs (replace these)
|   +-- types/
|       +-- index.ts                             <- shared TypeScript interfaces
+-- backend/
|   +-- services/
|   |   +-- morningSentinelService.ts            <- core service (metrics, anomalies, LLM prompt, streaming)
|   |   +-- deps.ts                              <- consumer-provided dependency stubs (replace these)
|   +-- routes/
|   |   +-- sentinelRoutes.ts                    <- Express route handlers (REST + SSE)
|   +-- types.ts                                 <- shared TypeScript interfaces (backend copy)
+-- database/
|   +-- schema.sql                               <- CREATE TABLE for 6 required tables
|   +-- seed.sql                                 <- Demo data for Aisha Al-Rashid persona
+-- assets/
    +-- morning-sentinel-reference.png           <- Reference screenshot
```

---

## External Dependencies

### Frontend

| Dependency | Purpose | Required |
|---|---|---|
| `react` (18+) | Component rendering | Yes |
| `@tanstack/react-query` (5+) | Data fetching, caching | Yes |
| `tailwindcss` (3+) | Utility-class styling | Yes |

**Consumer-provided (see `frontend/hooks/deps.ts`):**
- `apiFetch<T>(path): Promise<T>` -- authenticated JSON fetch wrapper
- `getStreamHeaders(): Record<string, string>` -- headers for SSE requests
- `useUser(): { userId: string }` -- current user context hook
- `handleAuthError(response: Response): void` -- 401 error handler

**Fonts required:** DM Sans (body), Crimson Pro (headline/currency values).

### Backend

| Dependency | Purpose | Required |
|---|---|---|
| `express` (4+) | HTTP routing | Yes |
| `pg` (Pool) | PostgreSQL connection | Yes |

**Consumer-provided (see `backend/services/deps.ts`):**
- `pool` -- PostgreSQL connection pool (`pg.Pool`)
- `MODEL` -- LLM model identifier string (e.g., `gpt-4o-mini`)
- `resilientCompletion(params, options)` -- non-streaming LLM completion
- `resilientStreamCompletion(params, options)` -- streaming LLM completion

### Database

PostgreSQL 14+ with the 6 tables defined in `database/schema.sql`.

### Environment Variables

| Variable | Layer | Description |
|---|---|---|
| `DATABASE_URL` or `PG*` vars | Backend | PostgreSQL connection for the pool |
| `OPENAI_API_KEY` (or equivalent) | Backend | API key for your OpenAI-compatible LLM provider |
| Model identifier | Backend | Set as `MODEL` constant (e.g., `gpt-4o-mini`) |

See `docs/environment-variables.md` for full details including configurable constants.

---

## API Reference

### GET `/api/morning-sentinel`

Returns the full briefing as JSON (non-streaming). Uses a 4-hour server-side cache.

**Query params:**
- `refresh=true` -- bypass cache and regenerate

**Response:** `MorningSentinelResponse` (see `frontend/types/index.ts`)

### GET `/api/morning-sentinel/stream`

Server-Sent Events (SSE) endpoint for streaming briefing generation.

**Query params:**
- `refresh=true` -- bypass cache and regenerate

**SSE Events:**

| Event type | Payload | Description |
|---|---|---|
| `metrics` | `{ userName, portfolioValue, dailyChangeAmount, dailyChangePercent, generatedAt, hasAnomalies }` | Sent immediately after DB queries complete |
| `text` | `string` (JSON chunk) | Raw LLM output tokens (for streaming indicator) |
| `complete` | `MorningSentinelResponse` | Final parsed briefing |

---

## Component Usage

```tsx
import { MorningSentinelCard } from './frontend/components/MorningSentinelCard';
import { useMorningSentinel } from './frontend/hooks/useMorningSentinel';
import type { ChatContext } from './frontend/types';

function HomeScreen() {
  const sentinel = useMorningSentinel();

  const handleChatSubmit = (message: string, context?: ChatContext) => {
    // Route to your chat/conversation handler
  };

  return (
    <MorningSentinelCard
      data={sentinel.data}
      isLoading={sentinel.isLoading}
      isError={sentinel.isError}
      isStreaming={sentinel.isStreaming}
      streamingMetrics={sentinel.streamingMetrics}
      streamingText={sentinel.streamingText}
      onRetry={sentinel.refetch}
      onChatSubmit={handleChatSubmit}
    />
  );
}
```

---

## Anomaly Detection Thresholds

| Anomaly | Threshold | Effect |
|---|---|---|
| Large daily change | `|dailyChangePercent| >= 1.5%` | Adds risk + more actions in prompt |
| Goals off-track | `health_status IN ('at-risk', 'needs-attention')` | Flags goal-related risks |
| Concentration alert | Any asset class `> 40%` allocation | Flags concentration risk |

When anomalies are detected, the LLM prompt requests 2 risks and 2 actions. When no anomalies exist, it requests 0-1 risks and 1 action with an "all-clear" tone.

---

## Caching Strategy

- **Server-side:** In-memory `Map` with 4-hour TTL, keyed by `userId:YYYY-MM-DD`
- **In-flight dedup:** Concurrent requests for the same user share a single Promise
- **Client-side:** TanStack Query with `staleTime` and `gcTime` both set to 4 hours
- **Stream fallback:** If TanStack Query doesn't resolve within 500ms, the hook automatically falls back to SSE streaming

---

## Consumer Adapter Pattern

Each layer (frontend and backend) has a `deps.ts` file containing stub implementations of consumer-provided dependencies. All external imports are routed through these files, keeping the rest of the package self-contained.

**Frontend:** `frontend/hooks/deps.ts` provides `apiFetch`, `getStreamHeaders`, `useUser`, and `handleAuthError`.

**Backend:** `backend/services/deps.ts` provides `pool`, `MODEL`, `resilientCompletion`, and `resilientStreamCompletion`.

To integrate, replace the stub implementations in each `deps.ts` with your actual modules. No other files need import path changes.

---

## Integration Steps

1. Run `database/schema.sql` against your PostgreSQL instance
2. Optionally run `database/seed.sql` for demo data
3. Replace stub implementations in `frontend/hooks/deps.ts` with your auth/fetch modules
4. Replace stub declarations in `backend/services/deps.ts` with your pool/LLM modules
5. Mount `backend/routes/sentinelRoutes.ts` on your Express router (behind auth middleware)
6. Adjust `getUserId()` in `sentinelRoutes.ts` to match your auth middleware's request shape
7. Import and render `MorningSentinelCard` with `useMorningSentinel` on your home screen
8. Ensure DM Sans and Crimson Pro fonts are loaded in your app
9. Ensure Tailwind is configured to scan the component files in `frontend/components/`
