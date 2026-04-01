# Environment Variables

Required environment variables and configuration for the Morning Sentinel feature.

## Database (Backend)

| Variable | Example | Used By | Description |
|---|---|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/ada` | `backend/services/deps.ts` (pool) | PostgreSQL connection string for the `pg.Pool` instance |
| `PGHOST` | `localhost` | `pg.Pool` (alternative) | PostgreSQL host (if not using `DATABASE_URL`) |
| `PGPORT` | `5432` | `pg.Pool` (alternative) | PostgreSQL port |
| `PGUSER` | `ada` | `pg.Pool` (alternative) | PostgreSQL user |
| `PGPASSWORD` | (secret) | `pg.Pool` (alternative) | PostgreSQL password |
| `PGDATABASE` | `ada` | `pg.Pool` (alternative) | PostgreSQL database name |

Either `DATABASE_URL` or the individual `PG*` variables are required, depending on how your pool is configured.

## LLM / AI Provider (Backend)

| Variable | Example | Used By | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | `sk-...` | `backend/services/deps.ts` (resilientCompletion) | API key for OpenAI-compatible LLM provider |
| `MODEL` or model config | `gpt-4o-mini` | `backend/services/deps.ts` (MODEL constant) | LLM model identifier used for briefing generation |

The exact variable names depend on your LLM client implementation. The service expects an OpenAI-compatible chat completion API (streaming and non-streaming).

## Frontend

The frontend does not directly consume environment variables. Authentication headers and API base URLs are provided through the consumer adapter in `frontend/hooks/deps.ts`:

- `apiFetch` handles authenticated requests (auth tokens come from your app's auth layer)
- `getStreamHeaders` returns headers for SSE connections (e.g., `Authorization: Bearer <token>`)

## Configuration Constants (Hardcoded)

These values are embedded in the source code and can be adjusted:

| Constant | Value | File | Description |
|---|---|---|---|
| `CACHE_TTL_MS` | `14400000` (4 hours) | `backend/services/morningSentinelService.ts` | Server-side briefing cache duration |
| `CACHE_TTL` | `14400000` (4 hours) | `frontend/hooks/useMorningSentinel.ts` | Client-side TanStack Query cache duration |
| `STREAM_FALLBACK_DELAY_MS` | `500` | `frontend/hooks/useMorningSentinel.ts` | Delay before falling back from REST to SSE |
| Daily change threshold | `1.5%` | `backend/services/morningSentinelService.ts` | Anomaly detection: large daily move |
| Concentration threshold | `40%` | `backend/services/morningSentinelService.ts` | Anomaly detection: asset class concentration |
| LLM timeout | `15000ms` | `backend/services/morningSentinelService.ts` | Max wait for LLM response |
| LLM max tokens | `2048` | `backend/services/morningSentinelService.ts` | Max completion tokens per briefing |
