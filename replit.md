# Ada — AI Wealth Copilot

## Overview
A mobile-first wealth management copilot prototype. Originally exported from Figma, now being converted to a full-stack application.

## Tech Stack
- **Frontend**: React 19 + TypeScript, Vite 6, Tailwind CSS v4
- **Styling**: Tailwind utility classes, custom fonts (Crimson Pro, DM Sans)
- **Dev Server**: Vite on port 5000 (host 0.0.0.0, allowedHosts: true)
- **Build Output**: `build/` directory

## Project Structure
```
src/
  App.tsx                    — Root component with useState-based navigation
  types/index.ts             — Shared TypeScript interfaces (TabType, ViewType, etc.)
  data/                      — Extracted seed/mock data modules
    portfolio.ts             — Portfolio values, allocations, holdings
    content.ts               — Discover feed items, Home content cards
    collective.ts            — Poll results, peer comparisons
    chat.ts                  — Chat response mappings
    notifications.ts         — Notification and thread data
  components/
    ada/                     — Design system components (Button, Tag, ContentCard, etc.)
    screens/                 — Screen-level components
      HomeScreen.tsx
      HomeEmptyScreen.tsx
      WealthScreen.tsx
      DiscoverScreen.tsx
      CollectiveScreen.tsx   — (renamed from LoungeScreen)
      ChatScreen.tsx
      ChatHistoryScreen.tsx
      NotificationsScreen.tsx
    figma/                   — Figma utility components (ImageWithFallback)
  imports/                   — Retained Figma-generated files (ClientEnvironment, SVGs)
  assets/                    — Image assets (descriptive names)
```

## Navigation
- 4 main tabs: Home, Wealth, Discover, Collective
- useState-based routing (no React Router)
- Tab type: `'home' | 'wealth' | 'discover' | 'collective'`
- Views: `'home' | 'home-empty' | 'chat' | 'chat-history' | 'notifications' | 'client-environment'`

## Brand Colors
- Dark red: `#441316`
- Medium red: `#992929`
- Green badge: `#c6ff6a`
- Cream background: `#efede6`
- Header background: `#f7f6f2`

## Key Decisions
- "Lounge" renamed to "Collective" everywhere (file, type, UI)
- figma:asset aliases removed; assets use relative imports with descriptive names
- All mock data extracted to `src/data/` for future API replacement
- Shared types in `src/types/` for frontend/backend contract
