# Morning Sentinel Export Package

Self-contained reference package for replicating the Morning Sentinel card feature in another Ada instance. This package includes all frontend components, backend services, database schemas, and seed data needed to stand up the feature.

![Morning Sentinel Reference](assets/morning-sentinel-reference.png)

---

## Architecture Overview

Morning Sentinel is an AI-generated daily portfolio briefing that surfaces on the home screen. It analyzes the user's portfolio, detects anomalies, and produces a structured briefing with headline, key movers, flagged risks, and suggested actions.

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT                                                         │
│                                                                 │
│  useMorningSentinel hook                                        │
│    ├── TanStack Query: GET /api/morning-sentinel (fast path)    │
│    └── SSE Stream: GET /api/morning-sentinel/stream             │
│         ├── event: metrics   → show portfolio value immediately │
│         ├── event: text      → show streaming indicator         │
│         └── event: complete  → render full briefing card        │
│                                                                 │
│  MorningSentinelCard                                            │
│    ├── SentinelSkeleton      (loading state)                    │
│    ├── StreamingSentinel     (streaming state)                  │
│    └── Full card             (complete state)                   │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVER                                                         │
│                                                                 │
│  GET /api/morning-sentinel                                      │
│    → morningSentinelService.generateBriefing(userId)            │
│                                                                 │
│  GET /api/morning-sentinel/stream                               │
│    → morningSentinelService.generateBriefingStream(userId)      │
│         1. Check in-memory cache (4-hour TTL, keyed user:date)  │
│         2. gatherMetrics(userId) — 6 parallel DB queries        │
│         3. detectAnomalies(metrics) — threshold checks          │
│         4. buildSentinelPrompt(metrics, anomalies)              │
│         5. LLM streaming completion → structured JSON           │
│         6. Parse response, cache, yield complete event          │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL)                                          │
│                                                                 │
│  6 tables queried:                                              │
│    users              → user's first name                       │
│    portfolio_snapshots → total value, daily change              │
│    positions + accounts → holdings with gain/loss               │
│    positions + accounts → asset class allocations               │
│    goals              → goal progress and health status         │
│    alerts             → recent alerts (unread count)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Package Contents

```
exports/morning-sentinel/
├── README.md                           ← this file
├── frontend/
│   ├── MorningSentinelCard.tsx          ← main component (+ StreamingSentinel, SentinelSkeleton)
│   ├── useMorningSentinel.ts           ← TanStack Query hook + SSE stream consumer
│   ├── SparkIcon.tsx                   ← sparkle icon (SVG paths inlined)
│   ├── Skeleton.tsx                    ← loading skeleton primitive
│   └── types.ts                        ← shared TypeScript interfaces
├── backend/
│   ├── morningSentinelService.ts       ← core service (metrics, anomalies, LLM prompt, streaming)
│   ├── sentinelRoutes.ts              ← Express route handlers (REST + SSE)
│   └── types.ts                        ← shared TypeScript interfaces (backend copy)
├── database/
│   ├── schema.sql                      ← CREATE TABLE for 6 required tables
│   └── seed.sql                        ← Demo data for Aisha Al-Rashid persona
└── assets/
    └── morning-sentinel-reference.png  ← Reference screenshot
```

---

## External Dependencies

### Frontend

| Dependency | Purpose | Required |
|---|---|---|
| `react` (18+) | Component rendering | Yes |
| `@tanstack/react-query` (5+) | Data fetching, caching | Yes |
| `tailwindcss` (3+) | Utility-class styling | Yes |
| `apiFetch` / `getStreamHeaders` | Authenticated API calls (consumer-provided) | Yes |
| `useUser` hook | Current user context (consumer-provided) | Yes |

**Fonts required:** DM Sans (body), Crimson Pro (headline/currency values).

### Backend

| Dependency | Purpose | Required |
|---|---|---|
| `express` (4+) | HTTP routing | Yes |
| `pg` (Pool) | PostgreSQL connection | Yes |
| OpenAI-compatible LLM client | `resilientCompletion`, `resilientStreamCompletion` | Yes |
| `MODEL` constant | LLM model identifier (e.g., `gpt-4o-mini`) | Yes |

### Database

PostgreSQL 14+ with the 6 tables defined in `database/schema.sql`.

---

## API Reference

### GET `/api/morning-sentinel`

Returns the full briefing as JSON (non-streaming). Uses a 4-hour server-side cache.

**Query params:**
- `refresh=true` — bypass cache and regenerate

**Response:** `MorningSentinelResponse` (see `types.ts`)

### GET `/api/morning-sentinel/stream`

Server-Sent Events (SSE) endpoint for streaming briefing generation.

**Query params:**
- `refresh=true` — bypass cache and regenerate

**SSE Events:**

| Event type | Payload | Description |
|---|---|---|
| `metrics` | `{ userName, portfolioValue, dailyChangeAmount, dailyChangePercent, generatedAt, hasAnomalies }` | Sent immediately after DB queries complete |
| `text` | `string` (JSON chunk) | Raw LLM output tokens (for streaming indicator) |
| `complete` | `MorningSentinelResponse` | Final parsed briefing |

---

## Component Usage

```tsx
import { MorningSentinelCard } from './frontend/MorningSentinelCard';
import { useMorningSentinel } from './frontend/useMorningSentinel';

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
| Large daily change | `\|dailyChangePercent\| >= 1.5%` | Adds risk + more actions in prompt |
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

## Import Paths and Consumer Adapters

The exported files retain placeholder import paths (e.g., `../contexts/UserContext`, `../db/pool`) that point outside the package. These are **intentionally left as-is** to mark the exact integration points you must wire up. Each file has a clearly marked section at the top:

```ts
// --- REPLACE THESE WITH YOUR IMPLEMENTATIONS ---
import { apiFetch, getStreamHeaders } from './api';       // your authenticated fetch helpers
import { useUser } from '../contexts/UserContext';         // your user context hook
// ------------------------------------------------
```

Replace these imports with your own modules. The interfaces each must satisfy are documented in the comments above the imports.

The SSE stream consumer also includes a placeholder for 401 handling — in the original Ada codebase this triggers a redirect to login. Wire this up to your auth error handler.

---

## Integration Steps

1. Run `database/schema.sql` against your PostgreSQL instance
2. Optionally run `database/seed.sql` for demo data
3. Wire up the 3 consumer-provided dependencies in `useMorningSentinel.ts` (see comments at top of file)
4. Wire up the 4 consumer-provided dependencies in `morningSentinelService.ts` (see comments at top of file)
5. Wire up 401 handling in `useMorningSentinel.ts` `consumeSentinelStream` (see comment in code)
6. Mount `sentinelRoutes.ts` on your Express router (behind auth middleware)
7. Import and render `MorningSentinelCard` with `useMorningSentinel` on your home screen
8. Ensure DM Sans and Crimson Pro fonts are loaded in your app
9. Ensure Tailwind is configured to scan these component files
