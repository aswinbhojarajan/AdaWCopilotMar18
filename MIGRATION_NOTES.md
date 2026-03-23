# Migration Notes — Ada Wealth Copilot

## Phase 1: Codebase Cleanup (Task #1)

### Dead Code Removal
- Deleted 63 unused Figma-generated SVG/import files from `src/imports/`
- Retained 8 files still referenced by active components:
  - `ClientEnvironment-2066-398.tsx` (landing screen)
  - `AdaIconButton.svg`
  - `svg-qhj5a0ggbh.ts`, `svg-hgsl2.tsx` (ClientEnvironment deps)
  - `svg-02a400puk5.ts`, `svg-3k2bapmb30.ts`, `svg-4rfis4h4ec.ts`
  - `svg-8tlp24sanx.ts`, `svg-htxx3p4b7c.ts`, `svg-njo1xhaulo.ts`, `svg-npbkfwfylb.ts`
- Deleted entire `src/components/ui/` directory (37 unused shadcn/ui components)

### Lounge → Collective Rename
- `LoungeScreen.tsx` → `CollectiveScreen.tsx`
- Exported function: `LoungeScreen` → `CollectiveScreen`
- Interface: `LoungeScreenProps` → `CollectiveScreenProps`
- Tab type union: `'lounge'` → `'collective'` across `App.tsx`, `Navigation.tsx`, `CollectiveScreen.tsx`
- Display text updated in `HomeEmptyScreen.tsx` inline nav
- Navigation.tsx already displayed "COLLECTIVE" label; internal value now matches

### Asset Renames
Hash-named Figma exports renamed to descriptive names in `src/assets/`:
| Old Name | New Name |
|---|---|
| `c54e79017cfbcd431ed13642ec859ace3fc150c0.png` | `advisor-photo.png` |
| `a615194d8b92641e04d9e5c0b6754f315fcb7139.png` | `discover-hero.png` |
| `8919ce3283e95b72a4d4d9fcc07871a000cf5493.png` | `discover-image-2.png` |
| `815fe824acd613d61a03fc7b6a314c365dae9516.png` | `collective-hero.png` |
| `183754ad0ca48fcc60b529e860728e1926e1c799.png` | `discover-image-3.png` |

### figma:asset Import Removal
- All `figma:asset/` Vite aliases removed from `vite.config.ts`
- `AdvisorCard.tsx`: replaced with relative import `../../../assets/advisor-photo.png`
- `HomeScreen.tsx`: removed dead import of non-existent asset
- All versioned package aliases (e.g. `lucide-react@0.487.0`) removed — only `@` path alias retained

### Type Extraction
`src/types/index.ts` exports shared interfaces:
- Navigation: `TabType`, `ViewType`
- Chat: `ChatContext`, `SimulatorConfig`, `Message`, `ChatResponseMapping`, `ChatHistoryThread`
- Portfolio: `Holding`, `AssetAllocation`, `SparklinePoint`, `PerformanceDataPoint`, `GoalData`, `ConnectedAccountData`
- Content: `ContentItem`, `DetailSection`
- Collective: `PollResults`, `PeerComparison`
- Notifications: `NotificationType`, `NotificationCategory`, `NotificationItem`
- API responses: `HomeSummaryResponse`, `WealthOverviewResponse`, `AccountResponse`, `GoalResponse`
- Common: `ScreenProps`

### Data Extraction
Hard-coded data moved from screen components to `src/data/`:
- `portfolio.ts` — portfolio values, sparkline data, allocations, holdings, performance generator
- `content.ts` — Discover feed items, Home content cards
- `collective.ts` — poll results, peer comparison data, poll options
- `chat.ts` — chat response mappings with keyword matching
- `notifications.ts` — notification and chat thread seed data
- `index.ts` — barrel re-export

### Vite Config Cleanup
- Removed all 30+ unused versioned package aliases
- Removed all 5 `figma:asset/` aliases (assets renamed, imports updated to relative)
- Retained only `@` → `./src` path alias

## Phase 2: Backend & Database (Tasks #2–5)

### Backend Scaffold (T002)
- Express server on port 3001 with TypeScript (tsx)
- Repository/service pattern in `server/`
- Shared API contract types in `shared/types.ts`
- Vite proxy: `/api` → port 3001
- Routes: `/api/me`, `/api/home/summary`, `/api/wealth/overview`, `/api/wealth/allocation`, `/api/wealth/holdings`, `/api/wealth/goals`, `/api/wealth/accounts`, `/api/chat/message`
- `asyncHandler` wrapper + global error handler

### PostgreSQL Database (T003)
- 15-table schema: users, risk_profiles, advisors, accounts, positions, transactions, price_history, portfolio_snapshots, goals, alerts, content_items, peer_segments, chat_threads, chat_messages, action_contexts
- 4 demo personas seeded (Aisha Al-Rashid as default: `user-aisha`)
- Repositories query PostgreSQL via `pg` pool (`server/db/pool.ts`)
- Schema: `server/db/schema.sql`, Seeds: `server/db/seed.sql`

### Frontend API Integration (T004)
- `useApi` hook with loading/error states (`src/hooks/useApi.ts`)
- HomeScreen fetches `/api/home/summary` (content cards from DB)
- WealthScreen fetches 5 endpoints in parallel (overview, allocation, holdings, goals, accounts)
- Loading skeleton animations and error states on both screens

### Chat Context (T005)
- ChatScreen calls `/api/chat/message` for responses
- CTAs on Home/Wealth/Collective pass structured context (category, title, sourceScreen)
- Deterministic keyword-matched responses from chatRepository
- Suggested questions returned from API
