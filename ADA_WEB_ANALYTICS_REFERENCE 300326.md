# Ada Wealth Copilot — Web Analytics Reference Document

> **Generated:** 2026-03-31T07:38:31Z
> **Covers:** Tasks #17, #18, #19, #20 (analytics work from 2026-03-29 to 2026-03-31)
> **App Version:** Ada AI Wealth Copilot — Mobile-first GCC HNW investor platform
> **Status:** Production (published to Replit deployment)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Platform Architecture](#2-platform-architecture)
3. [PostHog Configuration](#3-posthog-configuration)
4. [Google Analytics 4 Configuration](#4-google-analytics-4-configuration)
5. [Module File Reference](#5-module-file-reference)
6. [Environment Variables & Secrets](#6-environment-variables--secrets)
7. [Identity & User Management](#7-identity--user-management)
8. [Event Taxonomy](#8-event-taxonomy)
9. [Virtual Pageview System (SPA)](#9-virtual-pageview-system-spa)
10. [PII & Privacy Architecture](#10-pii--privacy-architecture)
11. [GA4 Enhanced Measurement](#11-ga4-enhanced-measurement)
12. [Wiring Points in the Application](#12-wiring-points-in-the-application)
13. [Known Issues & Gaps](#13-known-issues--gaps)
14. [Recommendations & Improvement Opportunities](#14-recommendations--improvement-opportunities)
15. [Future Backlog Items](#15-future-backlog-items)
16. [PostHog Dashboard Configuration Guide](#16-posthog-dashboard-configuration-guide)
17. [Replication Guide for New Builds](#17-replication-guide-for-new-builds)
18. [Change History](#18-change-history)

---

## 1. Executive Summary

Ada uses a **dual-platform analytics architecture**: **PostHog** for product analytics, session replay, and feature flags, and **Google Analytics 4 (GA4)** for acquisition funnels, audience building, Google Ads integration, and cross-platform attribution.

Both platforms share a unified dispatcher pattern — screen components call a single `useAnalytics()` React hook, and the dispatcher routes events to both platforms transparently. Each platform degrades to no-op mode independently when its credentials are missing.

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Dual-platform (PostHog + GA4) | PostHog excels at session replay and product funnels; GA4 excels at acquisition attribution and Google Ads integration |
| Client-side only (no server-side SDK) | Simpler architecture for demo/prototype phase; server-side PostHog SDK planned for feature flags (BL-035) |
| Manual `$pageview` (not auto-capture) | App uses state-based routing without React Router or URL changes — automatic pageview capture would never fire |
| Virtual URLs for SPA navigation | Constructs `/home`, `/wealth/chat`, etc. from React state so PostHog Web Analytics and GA4 can track page-level metrics |
| GA4 `screen_view` separate from PostHog `$pageview` | Prevents duplicate GA4 events since `setScreen()` already fires GA4 `screen_view` on tab navigation |
| PII stripped at two layers | Hook-level `sanitizeProperties()` for manual events + PostHog `before_send` for all events including autocapture |

---

## 2. Platform Architecture

```
┌─────────────────────────────────────────────────────┐
│  React Screen Components                             │
│  (LoginPage, HomeScreen, ChatScreen, etc.)           │
│                                                      │
│  const { track, identify, reset, setScreen,          │
│          pageview, getSessionId } = useAnalytics()   │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  useAnalytics.ts (React Hook)                        │
│  - Enriches all events with:                         │
│    ada_session_id, ada_screen, ada_client_timestamp,  │
│    ada_app_version, ada_environment                   │
│  - Applies sanitizeProperties() (PII filter)         │
│  - Constructs virtual URLs for pageview()            │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  dispatcher.ts (Unified Dispatch Layer)              │
│                                                      │
│  dispatchEvent()     → PostHog capture + GA4 event   │
│  dispatchIdentify()  → PostHog identify + GA4 user_id│
│  dispatchReset()     → PostHog reset + GA4 user_id   │
│  dispatchPageview()  → PostHog $pageview ONLY        │
│  dispatchScreenView()→ GA4 screen_view ONLY          │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐    ┌──────────────────────────┐
│  PostHog (posthog-js) │    │  GA4 (gtag.js)           │
│  posthog.capture()    │    │  window.gtag('event',...) │
│  posthog.identify()   │    │  window.gtag('config',.) │
│  posthog.reset()      │    │  gtagEvent()             │
│                       │    │  gtagScreenView()        │
│  Session Replay       │    │  gtagSetUserId()         │
│  Autocapture          │    │  Enhanced Measurement    │
│                       │    │  (scroll, clicks, time)  │
└──────────────────────┘    └──────────────────────────┘
```

### Dispatch Routing Table

| Method | PostHog | GA4 | Notes |
|--------|---------|-----|-------|
| `track(event, props)` | `posthog.capture(event, enriched)` | `gtag('event', event, ga4Props)` | All business events go to both |
| `identify(id, traits)` | `posthog.identify(id, sanitized)` | `gtag('config', id, { user_id })` + `gtag('set', 'user_properties', traits)` | Identity sync |
| `reset()` | `posthog.reset()` | `gtagSetUserId(null)` | Logout clears both |
| `pageview(tab, view)` | `posthog.capture('$pageview', props)` | — (no-op) | PostHog only — avoids GA4 duplicate since `setScreen` already fires `screen_view` |
| `setScreen(name)` | — (no-op) | `gtag('event', 'screen_view', { screen_name })` + `resetScrollDepth()` | GA4 only |

---

## 3. PostHog Configuration

### SDK Versions

| Package | Version | Purpose |
|---------|---------|---------|
| `posthog-js` | `^1.364.1` | Core PostHog JavaScript SDK |
| `@posthog/react` | `^1.8.2` | React context provider and hooks |

### Initialization (`src/lib/analytics/posthog.ts`)

```typescript
posthog.init(key, {
  api_host: host,                          // VITE_POSTHOG_HOST
  person_profiles: 'identified_only',      // Only create person profiles on identify()
  defaults: '2026-01-30',                  // PostHog SDK defaults version

  capture_pageview: false,                 // CRITICAL: Manual virtual pageviews only
  capture_pageleave: true,                 // Fires $pageleave on tab close / navigation

  autocapture: {
    dom_event_allowlist: ['click'],         // Only clicks, no inputs/submits
    element_allowlist: ['button', 'a'],     // Only buttons and links
    css_selector_allowlist: ['[data-ph-capture]'],  // Opt-in via data attribute
  },

  session_recording: {
    maskAllInputs: true,                   // Mask all form inputs in replay
    maskTextSelector: '*',                 // Mask ALL text in replay (banking-grade)
    recordCrossOriginIframes: false,       // No cross-origin iframes
    collectFonts: false,                   // Don't collect custom fonts
  },
  enable_recording_console_log: false,     // Don't record console.log in replay

  persistence: 'localStorage+cookie',      // Hybrid persistence
  cross_subdomain_cookie: false,           // No cross-subdomain tracking
  secure_cookie: location.protocol === 'https:',  // Secure cookies on HTTPS

  property_denylist: [],                   // EMPTY — was previously blocking $current_url (fixed in Task #20)

  before_send: (event) => {                // PII safety net for ALL events
    // Deletes PII_KEYS from properties
    // Scrubs UUIDs and account numbers from $current_url, $pathname, $referrer, $referring_domain
  },

  request_batching: true,                  // Batch requests for performance
  loaded: (ph) => {
    if (import.meta.env.DEV) ph.debug();   // Debug mode in development
  },
});
```

### Key Configuration Notes

1. **`capture_pageview: false`** — Essential because the app has no URL-based routing. Virtual pageviews are sent manually via `pageview()`.
2. **`capture_pageleave: true`** — Works with PostHog's built-in `$pageleave` tracking.
3. **`property_denylist: []`** — Must be empty. Previously contained `$current_url`, `$referrer`, `$referring_domain` which broke PostHog Web Analytics completely (showed 0 visitors/pageviews). PII protection is handled by `before_send` instead.
4. **`person_profiles: 'identified_only'`** — Only creates person profiles when `identify()` is called (after login), not for anonymous users.
5. **`maskTextSelector: '*'`** — Banking-grade session replay masking. All text is masked. To unmask safe elements, add `ph-no-mask` CSS class (see BL-037 in backlog).
6. **`defaults: '2026-01-30'`** — PostHog recommended defaults version for 2026.

### Provider Wiring (`src/main.tsx`)

```typescript
import { PostHogProvider } from '@posthog/react';
import { initPostHog, isPostHogInitialized, getPostHogClient, initGA4 } from './lib/analytics';

initPostHog();  // Initialize PostHog SDK
initGA4();      // Initialize GA4 gtag.js

// Conditional PostHogProvider wrapping
createRoot(document.getElementById('root')!).render(
  isPostHogInitialized() ? (
    <PostHogProvider client={getPostHogClient()}>
      {appTree}
    </PostHogProvider>
  ) : (
    appTree  // No PostHogProvider when credentials missing
  ),
);
```

**Important:** PostHog is initialized at module level (before React renders), then the PostHogProvider wraps the app tree. Components access PostHog via the `usePostHog()` hook from `@posthog/react`. Never directly import `posthog` in components — always use the hook.

---

## 4. Google Analytics 4 Configuration

### Loading Method

GA4 uses **dynamic script injection** (SPA best practice) rather than a static `<script>` tag in `index.html`. The `gtag.js` library is loaded programmatically in `initGA4()`.

### Initialization (`src/lib/analytics/gtag.ts`)

```typescript
// Dynamic script load
const script = document.createElement('script');
script.async = true;
script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
document.head.appendChild(script);

// DataLayer and gtag setup
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};

window.gtag('js', new Date());
window.gtag('config', measurementId, {
  send_page_view: false,           // CRITICAL: No automatic page views (SPA)
  debug_mode: import.meta.env.DEV, // DebugView enabled in development
});
```

### Key Configuration Notes

1. **`send_page_view: false`** — Essential for SPAs. Page views are tracked via manual `screen_view` events.
2. **`debug_mode: true` in dev** — Events appear in GA4 DebugView during development.
3. **No Google Tag Manager (GTM)** — Uses `gtag.js` directly for simplicity. GTM is out of scope.
4. **GA4 Measurement ID** — `G-V823WN3NG9`, stored as `VITE_GA4_MEASUREMENT_ID` environment variable.

### GA4 Helper Functions

| Function | Purpose |
|----------|---------|
| `gtagEvent(name, params)` | Send custom event with sanitized properties |
| `gtagScreenView(screenName)` | Send `screen_view` event |
| `gtagSetUserId(userId)` | Set/clear GA4 `user_id` via config |
| `resetScrollDepth()` | Reset scroll tracking thresholds on screen change |

### GA4 Property Conversion

The `toGA4Params()` function in `dispatcher.ts` converts PostHog-style properties to GA4-compatible format:
- Nested objects are `JSON.stringify()`'d (GA4 only supports flat key-value)
- `null`/`undefined` values are stripped
- Primitive values pass through unchanged

---

## 5. Module File Reference

All analytics code lives in `src/lib/analytics/` (8 files):

| File | Lines | Purpose |
|------|-------|---------|
| `posthog.ts` | ~79 | PostHog SDK initialization, `before_send` PII safety net, initialization guards |
| `gtag.ts` | ~175 | GA4 initialization, dynamic script load, event helpers, enhanced measurement (scroll/outbound/engagement) |
| `dispatcher.ts` | ~79 | Unified dispatch layer routing to both PostHog and GA4. Handles events, identity, reset, pageview (PostHog-only), screen_view (GA4-only) |
| `useAnalytics.ts` | ~96 | React hook — `track()`, `identify()`, `reset()`, `setScreen()`, `pageview()`, `getSessionId()`. Event enrichment. Virtual URL construction. |
| `privacy.ts` | ~74 | PII denylist (`PII_KEYS`), regex patterns (`UUID`, `ACCOUNT_NUMBER`, `IBAN`), `sanitizeProperties()`, `DEMO_PERSONAS` identity map |
| `events.ts` | ~26 | Event name constants (typed `as const` enum object) |
| `types.ts` | ~18 | TypeScript interfaces for events and UseAnalytics hook |
| `index.ts` | ~7 | Barrel re-exports for all public API |

### Exported Public API (`index.ts`)

```typescript
export { initPostHog, isPostHogInitialized, getPostHogClient } from './posthog';
export { initGA4, isGA4Initialized } from './gtag';
export { useAnalytics } from './useAnalytics';
export { AnalyticsEvents } from './events';
export { sanitizeProperties, PII_KEYS, PII_PATTERNS, DEMO_PERSONAS } from './privacy';
export type { EventName, UseAnalytics, DemoPersonaIdentity } from './types';
```

---

## 6. Environment Variables & Secrets

| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| `VITE_POSTHOG_KEY` | Replit Env Var | Yes (for PostHog) | PostHog project API key (publishable client-side ingestion key, not a server secret). Value: `phc_p6SAczQniJIkxgxXDax1LgpRGI6pxbEDAqt9Wyoo4DT` |
| `VITE_POSTHOG_HOST` | Replit Env Var | Yes (for PostHog) | PostHog API host URL. Value: `https://us.i.posthog.com` |
| `VITE_GA4_MEASUREMENT_ID` | Replit Env Var | Yes (for GA4) | GA4 Measurement ID (publishable client-side key). Value: `G-V823WN3NG9` |
| `VITE_APP_VERSION` | Replit Env Var | No | App version string attached to all events. Defaults to `'dev'` |

**Naming Convention:** All analytics env vars use the `VITE_` prefix so they are accessible via `import.meta.env` in the Vite-built frontend. Without this prefix, Vite strips them from the client bundle.

**Note on key sensitivity:** Both the PostHog project API key and GA4 Measurement ID are **publishable client-side ingestion keys** — they are designed to be included in frontend JavaScript bundles and are not server secrets. They are managed via environment variables for configuration hygiene and environment separation, not for secrecy.

**Graceful Degradation:** Each platform initializes independently and runs in no-op mode when its keys are missing. This means:
- PostHog missing → GA4 still works
- GA4 missing → PostHog still works
- Both missing → App works normally, no analytics

---

## 7. Identity & User Management

### Demo Persona Identity Map (`privacy.ts`)

Ada uses synthetic demo identities for its 3 personas (+ admin):

| Persona | User ID (DB) | PostHog distinct_id | GA4 user_id | Segment |
|---------|-------------|---------------------|-------------|---------|
| Aisha Al-Rashid | `user-aisha` | `demo_aisha_01` | `demo_aisha_01` | `priority_banking` / Moderate |
| Khalid | `user-khalid` | `demo_khalid_01` | `demo_khalid_01` | `conservative` |
| Raj | `user-raj` | `demo_raj_01` | `demo_raj_01` | `aggressive` |
| Admin | `admin` | `demo_admin_01` | `demo_admin_01` | `admin` |

### Identity Lifecycle

```
Login → identify(distinctId, traits)
  ├─ PostHog: posthog.identify('demo_aisha_01', { persona, market, segment, ... })
  └─ GA4:     gtag('config', measurementId, { user_id: 'demo_aisha_01' })
              gtag('set', 'user_properties', { persona, market, segment, ... })

Logout → reset()
  ├─ PostHog: posthog.reset()       // Clears distinct_id + generates new anonymous ID
  └─ GA4:     gtag('config', measurementId, { user_id: null })

Session regeneration: sessionId = crypto.randomUUID()  // New session on reset
```

### User Properties Sent to Both Platforms

| Property | Value Example | Description |
|----------|---------------|-------------|
| `persona` | `'Priority Banking'` | User segment label |
| `market` | `'UAE'` | Geographic market |
| `segment` | `'priority_banking'` | Machine-readable segment key |
| `risk_profile_tier` | `'moderate'` | Investment risk tier |
| `rm_assigned` | `true` | Has relationship manager |
| `demo_dataset` | `'wealth_mock_v1'` | Dataset version |
| `cohort` | `'internal_demo'` | User cohort |

### Where Identity is Triggered

- **Login:** `LoginPage.tsx` line ~180 — calls `identify()` after successful `/api/auth/login` response
- **App mount:** `App.tsx` line ~102 — calls `identify()` when session exists (page reload)
- **Logout:** `Header.tsx` line ~35 — calls `resetAnalytics()` on logout button click

### Production Identity Considerations

The current synthetic IDs (`demo_aisha_01`, etc.) are for demo mode only. For production with real users, the planned approach (BL-039) is SHA-256 hashed client IDs: `SHA-256(ada:{clientId}:{salt})`. This preserves user-level analytics without exposing real identifiers.

---

## 8. Event Taxonomy

### P0 Business Events (Currently Instrumented — 18 custom events + 2 platform navigation events)

**Platform navigation events (not counted as P0 business events):**

| Event Name | Platform | Source File | Trigger |
|------------|----------|-------------|---------|
| `$pageview` | PostHog only | `useAnalytics.ts` via `pageview()` | Tab or overlay view change |
| `screen_view` | GA4 only | `gtag.ts` via `gtagScreenView()` | Tab navigation via `setScreen()` |

**18 P0 business events (dual-dispatched to both platforms):**

| Event Name | Platform | Source File | Trigger |
|------------|----------|-------------|---------|
| `login_viewed` | Both | `LoginPage.tsx` | Login page rendered |
| `login_submitted` | Both | `LoginPage.tsx` | Login form submitted (email or demo persona) |
| `login_succeeded` | Both | `LoginPage.tsx` | Successful authentication |
| `login_failed` | Both | `LoginPage.tsx` | Authentication failure |
| `tab_view` | Both | `App.tsx` | Tab becomes active |
| `tab_switch` | Both | `App.tsx` | User switches between tabs (includes `from_tab`, `to_tab`, `time_on_previous_ms`) |
| `app_foreground` | Both | `App.tsx` | Browser tab becomes visible |
| `app_background` | Both | `App.tsx` | Browser tab becomes hidden |
| `chat_opened` | Both | `ChatScreen.tsx` | Chat screen opens (with `entry_point: 'cta' \| 'bottom_bar'`) |
| `chat_message_sent` | Both | `ChatScreen.tsx` | User sends a message (with `message_length`) |
| `chat_stream_started` | Both | `ChatScreen.tsx` | LLM streaming begins |
| `chat_stream_completed` | Both | `ChatScreen.tsx` | LLM streaming finishes (includes `response_time_ms`, `message_count`) |
| `chat_stream_interrupted` | Both | `ChatScreen.tsx` | LLM stream interrupted/aborted |
| `chat_error` | Both | `ChatScreen.tsx` | Chat error occurred |
| `portfolio_view` | Both | `WealthScreen.tsx` | Wealth tab viewed |
| `discover_card_tap` | Both | `DiscoverScreen.tsx` | Discover card tapped (with `card_id`, `action`) |
| `discover_card_dismiss` | Both | `DiscoverScreen.tsx` | Discover card dismissed (with `card_id`) |
| `morning_sentinel_expanded` | Both | `HomeScreen.tsx` | Morning briefing card expanded |

### GA4-Only Automatic Events (Enhanced Measurement)

| Event | Trigger | Properties |
|-------|---------|------------|
| `scroll` | Scrollable container reaches 25%, 50%, 75%, or 90% | `percent_scrolled` |
| `outbound_click` | Click on external link | `link_url` (PII-stripped), `link_domain`, `outbound: true` |
| `engagement_time` | Visibility change or `beforeunload` | `engagement_time_msec` |

### PostHog Autocapture Events

With the current restrictive configuration, PostHog autocaptures:
- **Click events only** (`dom_event_allowlist: ['click']`)
- **On buttons and links only** (`element_allowlist: ['button', 'a']`)
- **Or any element with `data-ph-capture` attribute** (`css_selector_allowlist`)

This generates `$autocapture` events in PostHog with element metadata (tag, text, classes, attributes).

### PostHog System Events (Automatic)

| Event | Description |
|-------|-------------|
| `$pageview` | Manual — fired by `pageview()` in `useAnalytics` |
| `$pageleave` | Automatic — `capture_pageleave: true` |
| `$identify` | Automatic — when `identify()` is called |
| `$autocapture` | Automatic — click events on buttons/links |
| `$session_recording` | Automatic — session replay data |

### Event Enrichment Properties (Added to All `track()` Events)

| Property | Source | Example |
|----------|--------|---------|
| `ada_session_id` | `crypto.randomUUID()` | `"a1b2c3d4-..."` |
| `ada_screen` | Current screen name | `"home"`, `"wealth/chat"` |
| `ada_client_timestamp` | `new Date().toISOString()` | `"2026-03-31T07:38:31.000Z"` |
| `ada_app_version` | `VITE_APP_VERSION` env var | `"dev"` or semver |
| `ada_environment` | Dev check | `"development"` or `"demo"` |

---

## 9. Virtual Pageview System (SPA)

### The Problem

Ada uses **state-based routing** — navigation is driven by `activeTab` and `currentView` React state variables in `App.tsx`. There is no React Router, no `pushState()`, and no URL changes. This means:
- PostHog's auto-pageview would never fire (URL never changes)
- GA4's automatic page tracking would never fire
- PostHog Web Analytics would show 0 visitors/pageviews

### The Solution

The `pageview()` method in `useAnalytics.ts` constructs **virtual URLs** from React state and sends them as PostHog `$pageview` events.

### Virtual URL Convention

| State | Virtual Path | Screen Name |
|-------|-------------|-------------|
| `activeTab='home'` | `/home` | `home` |
| `activeTab='wealth'` | `/wealth` | `wealth` |
| `activeTab='discover'` | `/discover` | `discover` |
| `activeTab='collective'` | `/collective` | `collective` |
| `activeTab='home', currentView='chat'` | `/home/chat` | `home/chat` |
| `activeTab='home', currentView='chat-history'` | `/home/chat-history` | `home/chat-history` |
| `activeTab='wealth', currentView='notifications'` | `/wealth/notifications` | `wealth/notifications` |
| `activeTab='home', currentView='client-environment'` | `/home/client-environment` | `home/client-environment` |

### Overlay Detection

Views are classified as **overlays** (slide-up panels) or **tabs** (main navigation):

```typescript
const OVERLAY_VIEWS = new Set([
  'chat', 'chat-history', 'notifications', 'client-environment',
]);

const isOverlay = OVERLAY_VIEWS.has(currentView);
const virtualPath = isOverlay
  ? `/${activeTab}/${currentView}`   // e.g., /home/chat
  : `/${activeTab}`;                  // e.g., /home
```

### Pageview Properties

Each `$pageview` event includes:

| Property | Value | PostHog Use |
|----------|-------|-------------|
| `$current_url` | `https://domain.replit.app/home/chat` | Web Analytics URL breakdown |
| `$pathname` | `/home/chat` | Path-level filtering |
| `ada_tab` | `home` | Tab context |
| `ada_view` | `chat` | View context |
| `screen_name` | `home/chat` | Screen identification |
| `is_overlay` | `true` | Overlay vs tab classification |
| `ada_session_id` | `"a1b2c3d4-..."` | Session context |
| `ada_client_timestamp` | `"2026-03-31T..."` | Client-side timestamp |
| `ada_app_version` | `"dev"` | App version |
| `ada_environment` | `"demo"` | Environment |

### Wiring in App.tsx

```typescript
// Line 80-82 in App.tsx
useEffect(() => {
  pageview(activeTab, currentView);
}, [activeTab, currentView, pageview]);
```

This fires on every state change — tab switches AND overlay open/close transitions. It fires for both authenticated and unauthenticated states (the login page also gets pageviews).

### Critical Design Decision: PostHog Only

`dispatchPageview()` sends to **PostHog only**, not GA4. This is intentional:
- GA4 `screen_view` is already fired via `setScreen()` on tab navigation
- Sending both `$pageview` → GA4 AND `setScreen()` → GA4 would create duplicate GA4 events
- PostHog needs `$pageview` specifically (it's a reserved event that powers Web Analytics)

---

## 10. PII & Privacy Architecture

### Layer 1: Hook-Level Sanitization (`sanitizeProperties`)

Applied to all manually tracked events. Strips any properties whose keys match the PII denylist:

```typescript
export const PII_KEYS = new Set([
  'client_id', 'full_name', 'email', 'phone',
  'national_id', 'date_of_birth', 'address',
  'account_number', 'iban', 'holding_id',
  'balance', 'portfolio_value', 'transaction_amount',
  'net_worth', 'income',
  'message_content', 'llm_response_content',
  'advisor_notes', 'document_content',
]);
```

### Layer 2: PostHog `before_send` (All Events)

Applied to ALL PostHog events including autocapture. Acts as a safety net:

1. **Deletes PII keys** — Same `PII_KEYS` set as Layer 1
2. **Scrubs URLs** — Replaces UUIDs and account numbers in `$current_url`, `$pathname`, `$referrer`, `$referring_domain`:
   - UUIDs: `/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi` → `[id]`
   - Account numbers: `/\b\d{10,16}\b/g` → `[acct]`

### Layer 3: GA4 Sanitization

GA4 events receive properties through `sanitizeProperties()` (same as Layer 1). GA4 does not have a `before_send` equivalent — the gtag.js API doesn't support it. However, all GA4 events already pass through the hook's sanitization. The `gtagEvent()` function also calls `sanitizeProperties()` directly on all params.

### Layer 4: Session Replay Privacy

PostHog session recording is configured with maximum masking:
- `maskAllInputs: true` — All form inputs masked
- `maskTextSelector: '*'` — ALL text masked in replay
- `enable_recording_console_log: false` — No console logs captured

### PII Regex Patterns

```typescript
export const PII_PATTERNS = {
  UUID: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  ACCOUNT_NUMBER: /\b\d{10,16}\b/g,
  IBAN: /\b[A-Z]{2}\d{2}[A-Z0-9]{4,}\b/g,  // Defined but only UUID + ACCOUNT_NUMBER used in before_send
};
```

**Note:** The IBAN regex is defined in `PII_PATTERNS` but is NOT used in `before_send` URL scrubbing. It is only used by the `sanitizeProperties` key filter. If URLs could contain IBANs, this would be a gap.

---

## 11. GA4 Enhanced Measurement

GA4's enhanced measurement is implemented client-side (not via GA4 admin console toggles) because the SPA architecture requires custom DOM handling.

### Scroll Depth Tracking

```typescript
const thresholds = [25, 50, 75, 90];
// Listens to 'scroll' event with { capture: true, passive: true }
// Fires on scrollable containers (not just window)
// Uses scrollTop / (scrollHeight - clientHeight) formula
// Each threshold fires only once per screen (resetScrollDepth() on screen change)
```

**Reset behavior:** `resetScrollDepth()` is called by `dispatchScreenView()` whenever `setScreen()` fires — meaning scroll thresholds reset when the user switches tabs.

### Outbound Click Tracking

```typescript
// Listens to 'click' event with { capture: true }
// Finds closest <a[href]> ancestor
// Checks if hostname differs from window.location.hostname
// Strips query params and hash from URL (PII protection via stripUrlPii)
```

### Engagement Time Tracking

```typescript
// 1-second interval accumulates milliseconds when tab is visible
// Flushes on:
//   - document.visibilitychange (tab hidden)
//   - window.beforeunload (page close)
// Sends engagement_time event with engagement_time_msec
```

---

## 12. Wiring Points in the Application

### Initialization Chain

1. `src/main.tsx` — `initPostHog()` + `initGA4()` at module level (before React renders)
2. `src/main.tsx` — `PostHogProvider` wraps app tree (conditionally, based on `isPostHogInitialized()`)
3. `src/App.tsx` — `useAnalytics()` hook destructured at component level (line 37)
4. `src/App.tsx` — `useEffect` on `[activeTab, currentView]` fires `pageview()` (lines 80-82)
5. `src/App.tsx` — `useEffect` on `[activeTab]` fires `setScreen()` + `track(TAB_VIEW)` + `track(TAB_SWITCH)` (lines 59-78)
6. `src/App.tsx` — `useEffect` on `visibilitychange` fires `APP_FOREGROUND` / `APP_BACKGROUND` (lines 84-100)
7. `src/App.tsx` — `useEffect` on `[session?.id]` fires `identify()` (lines 102-109)

### Files That Call `track()`

| File | Events Tracked |
|------|---------------|
| `src/App.tsx` | `TAB_VIEW`, `TAB_SWITCH`, `APP_FOREGROUND`, `APP_BACKGROUND` |
| `src/components/screens/LoginPage.tsx` | `LOGIN_VIEWED`, `LOGIN_SUBMITTED`, `LOGIN_SUCCEEDED`, `LOGIN_FAILED` |
| `src/components/screens/HomeScreen.tsx` | `MORNING_SENTINEL_EXPANDED` |
| `src/components/screens/ChatScreen.tsx` | `CHAT_OPENED`, `CHAT_MESSAGE_SENT`, `CHAT_STREAM_STARTED`, `CHAT_STREAM_COMPLETED`, `CHAT_STREAM_INTERRUPTED`, `CHAT_ERROR` |
| `src/components/screens/WealthScreen.tsx` | `PORTFOLIO_VIEW` |
| `src/components/screens/DiscoverScreen.tsx` | `DISCOVER_CARD_TAP`, `DISCOVER_CARD_DISMISS` |
| `src/components/ada/Header.tsx` | `reset()` (logout) |

### Browser Tab Title

`index.html` `<title>` is set to **"Ada Wealth Copilot"** (fixed in Task #20 from "Demo_Ada_Wealth Copilot (Copy)").

---

## 13. Known Issues & Gaps

### Issues Found During Audit

| # | Severity | Issue | Impact | Recommendation |
|---|----------|-------|--------|----------------|
| 1 | **Medium** | `pageview()` fires on both authenticated AND unauthenticated states | Login page generates `$pageview` events without user identity — these show as anonymous in PostHog | Consider gating `pageview()` behind `session` check, or accept anonymous pageviews as valid for login funnel analysis |
| 2 | **Medium** | GA4 `screen_view` only fires on tab changes, not overlay opens | Opening Chat or Notifications from the Wealth tab fires a PostHog `$pageview` for `/wealth/chat` but no GA4 `screen_view` for the overlay | Add `gtagScreenView()` call in the `pageview()` method for overlay transitions, OR accept that GA4 only tracks top-level screens |
| 3 | **Low** | IBAN regex defined but not used in `before_send` URL scrubbing | If a URL ever contained an IBAN, it would not be scrubbed | Add IBAN pattern to `before_send` URL scrubbing loop, or document as intentional |
| 4 | **Low** | GA4 has no `before_send` equivalent for autocapture | If GA4 ever gets custom dimension extraction from URLs, PII could leak | Mitigated by the fact that GA4 receives no autocapture events — only manually sanitized events via the hook |
| 5 | **Low** | `engagement_time` accumulates from app start, not per-screen | A user spending 5 min on Home then switching to Wealth will flush all 5 min on the visibility change, not attributed to a specific screen | Consider per-screen engagement tracking with screen-change flush |
| 6 | **Low** | Scroll tracking uses `capture: true` on `document` | Captures scroll events from ALL scrollable containers, not just the main content area. Could fire on dropdown menus, modals, etc. | Consider filtering to specific container selectors |
| 7 | **Info** | No server-side analytics SDK | All analytics are client-side. Server events (LLM calls, tool runs, provider fallbacks) are only tracked via DB tables, not PostHog | BL-035 and BL-036 address this |
| 8 | **Info** | `EventName` type is restrictive | Adding new event names requires editing `events.ts` — cannot send ad-hoc events | Intentional for type safety, but friction for rapid instrumentation |
| 9 | **Info** | PostHog `debug()` runs in all dev environments | Every developer session generates debug output in console | Expected for development; disable for staging if needed |
| 10 | **Info** | No content security policy (CSP) allowlisting for analytics | If CSP is ever added, `googletagmanager.com` and PostHog host need to be allowlisted | Document CSP requirements when implementing |

### Previously Fixed Issues (Tasks #17–20)

| Issue | Root Cause | Fix | Task |
|-------|-----------|-----|------|
| PostHog Web Analytics showed 0 visitors | No `$pageview` events sent | Added manual `$pageview` via `pageview()` method | #20 |
| PostHog had no URL context | `$current_url` was in `property_denylist` | Removed from denylist; `before_send` handles PII scrubbing instead | #20 |
| PostHog couldn't detect navigation | State-based routing, no URL changes | Virtual URL construction from `activeTab`/`currentView` | #20 |
| Browser tab showed project copy name | Leftover from Replit project duplication | Changed `<title>` to "Ada Wealth Copilot" | #20 |
| Events only went to PostHog | No GA4 integration existed | Created `gtag.ts`, `dispatcher.ts`, unified dispatch | #19 |
| No scroll/outbound/engagement tracking | GA4 enhanced measurement needed SPA-aware implementation | Custom client-side tracking in `gtag.ts` | #19 |
| PostHog cookie configuration issues | Incorrect cookie settings | Aligned with PostHog React guide | #18 |

---

## 14. Recommendations & Improvement Opportunities

### High Priority

1. **Add GA4 `screen_view` for overlay transitions** — Currently overlays (chat, notifications, chat-history) only generate PostHog `$pageview` but no GA4 `screen_view`. The `pageview()` method should optionally call `dispatchScreenView()` for overlays to get full GA4 screen coverage.

2. **Add `PostHogCaptureOnViewed` for card impressions** — The PostHog React SDK provides `<PostHogCaptureOnViewed>` component for tracking element visibility. Use this for Discover card impressions and Home content card visibility instead of building custom IntersectionObserver logic (referenced in BL-034).

3. **Gate pageview on auth state** — Consider whether anonymous `$pageview` events (before login) add value or create noise. If they add value (login funnel), keep them. If not, gate behind `session` check.

4. **Add `ph-no-mask` to safe elements** — Session replays are currently completely masked (`maskTextSelector: '*'`). Tab labels, section headers, and button text are safe to unmask for better replay readability (BL-037).

### Medium Priority

5. **Server-side PostHog for feature flags** — Client-side feature flags cause a flash of default content. Server-side evaluation via `posthog-node` would provide instant flag values (BL-035).

6. **Mirror DB telemetry to PostHog** — Server-side events (agent traces, provider fallbacks, moderation triggers) are only in PostgreSQL. Adding PostHog events alongside DB writes provides unified analytics (BL-036).

7. **Implement overlay_opened / overlay_closed events** — Track time spent in overlays (chat, notifications) with `time_open_ms` and `close_method` properties.

8. **Add GA4 custom dimensions** — Register `ada_session_id`, `ada_screen`, `ada_environment` as custom dimensions in GA4 admin console for richer reporting.

### Low Priority

9. **PostHog reverse proxy** — Route PostHog requests through your own domain to avoid ad blockers. PostHog docs recommend this for production.

10. **GA4 Measurement Protocol** — For server-side events (LLM completions, provider fallbacks), GA4 Measurement Protocol allows sending events from the backend.

11. **Content Security Policy** — When adding CSP headers, allowlist: `https://www.googletagmanager.com`, `https://us.i.posthog.com`, `https://us-assets.i.posthog.com`.

---

## 15. Future Backlog Items

These items are documented in `BACKLOG.md` and are the planned next steps for analytics:

| ID | Title | Priority | Description |
|----|-------|----------|-------------|
| BL-034 | PostHog Full Event Taxonomy | Should Have | Expand from ~20 P0 events to full 52-event taxonomy (card impressions, chat feedback, compliance events, overlay tracking). Reference spec: `attached_assets/RC_ada_analytics_posthog_v2_CLA_post_OAI_3003_3pm_1774871900301.docx` |
| BL-035 | PostHog Server-Side Feature Flags | Should Have | `posthog-node` SDK for server-side flag evaluation. Planned flags: `gpt-5.4-canary`, `discover-ranking-strategy` |
| BL-036 | Existing Telemetry Table Mapping | Should Have | Mirror `user_content_interactions`, `agent_traces`, `moderation_events`, `provider_fallback_events` to PostHog |
| BL-037 | Session Replay Readability | Nice to Have | Add `ph-no-mask` CSS class to safe UI elements (tab labels, headers, buttons) |
| BL-038 | First-Party PostgreSQL Analytics | Future | `analytics_events` table + `POST /api/analytics/events` endpoint for first-party data ownership |
| BL-039 | Production Identity Model | Future | SHA-256 hashed `client_id` replacing synthetic demo IDs |
| BL-040 | PostHog Dashboards | Should Have | Create dashboards in PostHog UI: engagement, funnels, AI ops, saved replay filters |

---

## 16. PostHog Dashboard Configuration Guide

After the SDK is correctly sending events, these dashboards should be created in the PostHog console:

### Web Analytics (Built-in)

PostHog Web Analytics should now auto-populate with:
- **Unique visitors** — based on `$pageview` events
- **Page views** — broken down by `$pathname` (`/home`, `/wealth`, `/home/chat`, etc.)
- **Sessions** — session-level metrics
- **Top pages** — ranked by virtual path
- **Entry pages** — first `$pageview` in session
- **Exit pages** — last `$pageview` before `$pageleave`

### Recommended Saved Insights

| Insight | Type | Event | Filters |
|---------|------|-------|---------|
| DAU / WAU / MAU | Trends | `$pageview` | Unique users, daily/weekly/monthly |
| Tab distribution | Breakdown | `tab_view` | Breakdown by `tab_name` |
| Chat adoption rate | Funnel | `login_succeeded` → `chat_opened` → `chat_message_sent` | — |
| Chat completion rate | Funnel | `chat_stream_started` → `chat_stream_completed` | — |
| Discover engagement | Funnel | `tab_view (discover)` → `discover_card_tap` | — |
| Login conversion | Funnel | `login_viewed` → `login_submitted` → `login_succeeded` | — |
| Session duration | Trends | `$pageview` | Session duration property |
| Screen time by tab | Trends | `tab_switch` | Average `time_on_previous_ms` by `from_tab` |

### Recommended Replay Filters

| Filter | Condition |
|--------|-----------|
| Chat errors | Events containing `chat_error` |
| Long chat latency | `chat_stream_completed` where `response_time_ms > 5000` |
| Login failures | Events containing `login_failed` |
| High tab switching | Sessions with > 10 `tab_switch` events |

---

## 17. Replication Guide for New Builds

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
npm install posthog-js @posthog/react
```

No GA4 package needed — `gtag.js` is loaded dynamically.

#### 2. Set Environment Variables

```
VITE_POSTHOG_KEY=<your-posthog-project-api-key>
VITE_POSTHOG_HOST=https://us.i.posthog.com  # or eu.i.posthog.com for EU
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### 3. Copy the Analytics Module

Copy the entire `src/lib/analytics/` directory (8 files). The module is self-contained with no external dependencies beyond `posthog-js` and `@posthog/react`.

Files to copy:
- `posthog.ts` — PostHog initialization
- `gtag.ts` — GA4 initialization + enhanced measurement
- `dispatcher.ts` — Dual-platform dispatch
- `useAnalytics.ts` — React hook
- `privacy.ts` — PII filtering + demo personas
- `events.ts` — Event name constants
- `types.ts` — TypeScript interfaces
- `index.ts` — Barrel exports

#### 4. Initialize in App Entry Point

```typescript
// main.tsx (or equivalent)
import { initPostHog, isPostHogInitialized, getPostHogClient, initGA4 } from './lib/analytics';
import { PostHogProvider } from '@posthog/react';

initPostHog();
initGA4();

// Wrap app in PostHogProvider (conditional)
const root = (
  isPostHogInitialized() ? (
    <PostHogProvider client={getPostHogClient()}>
      <App />
    </PostHogProvider>
  ) : <App />
);
```

#### 5. Wire Analytics in Root Component

```typescript
// App.tsx (or equivalent root component)
const { track, identify, reset, setScreen, pageview } = useAnalytics();

// Fire pageview on navigation state changes
useEffect(() => {
  pageview(activeTab, currentView);
}, [activeTab, currentView, pageview]);

// Fire screen_view + tab tracking on tab changes
useEffect(() => {
  setScreen(activeTab);
  track(AnalyticsEvents.TAB_VIEW, { tab_name: activeTab });
}, [activeTab]);

// Identify user after login
useEffect(() => {
  if (user) identify(user.id, user.traits);
}, [user?.id]);
```

#### 6. Add Events to Components

```typescript
// Any component
const { track } = useAnalytics();
track(AnalyticsEvents.CHAT_OPENED, { entry_point: 'cta' });
```

#### 7. Customize for Your App

- Update `DEMO_PERSONAS` in `privacy.ts` with your user segments
- Update `PII_KEYS` with your domain-specific PII fields
- Update `OVERLAY_VIEWS` in `useAnalytics.ts` with your overlay/modal views
- Update `events.ts` with your event names
- Update the virtual URL path convention to match your navigation structure

#### 8. Verify

1. Open the app in development
2. Check browser console for `[Ada]` debug logs (PostHog) and GA4 DebugView
3. Verify PostHog Activity feed shows `$pageview` events with `$current_url`
4. Verify PostHog Web Analytics shows visitors and pageviews
5. Verify GA4 Realtime report shows `screen_view` events
6. Test identity flow: login → check PostHog user profile → logout → verify reset

---

## 18. Change History

### Task #17: PostHog Analytics Foundation (2026-03-29)

**What was done:**
- Installed `posthog-js` and `@posthog/react`
- Created `src/lib/analytics/` module with 7 files: `posthog.ts`, `useAnalytics.ts`, `privacy.ts`, `events.ts`, `types.ts`, `index.ts`
- Implemented 18 P0 events across 6 screen components
- PII denylist and `sanitizeProperties()` function
- `DEMO_PERSONAS` identity map for 4 demo users
- PostHog debug mode in development

**Files created:** `posthog.ts`, `useAnalytics.ts`, `privacy.ts`, `events.ts`, `types.ts`, `index.ts`
**Files modified:** `src/main.tsx`, `src/App.tsx`, `LoginPage.tsx`, `HomeScreen.tsx`, `ChatScreen.tsx`, `WealthScreen.tsx`, `DiscoverScreen.tsx`, `Header.tsx`, `package.json`

### Task #18: PostHog React Guide Alignment (2026-03-29)

**What was done:**
- Aligned PostHog setup with official React integration guide
- Fixed cookie configuration (`persistence`, `cross_subdomain_cookie`, `secure_cookie`)
- Ensured `PostHogProvider` wraps app tree correctly
- Added `defaults: '2026-01-30'` configuration

**Files modified:** `posthog.ts`, `main.tsx`

### Task #19: GA4 Analytics Layer (2026-03-30)

**What was done:**
- Created `src/lib/analytics/gtag.ts` — GA4 initialization with dynamic script loading
- Created `src/lib/analytics/dispatcher.ts` — unified dual-platform dispatch
- Refactored `useAnalytics.ts` to use dispatcher instead of direct PostHog calls
- All 18 existing events now dual-dispatched to both PostHog and GA4
- GA4 identity sync: `user_id` set on login, cleared on logout
- GA4 user properties set via `gtag('set', 'user_properties', traits)`
- GA4 `screen_view` on tab navigation
- GA4 enhanced measurement: scroll depth (25/50/75/90%), outbound clicks (PII-stripped), engagement time
- Scroll depth resets on screen change
- `VITE_GA4_MEASUREMENT_ID` environment variable
- GA4 `send_page_view: false` for SPA compatibility
- GA4 `debug_mode` in development

**Files created:** `gtag.ts`, `dispatcher.ts`
**Files modified:** `useAnalytics.ts`, `types.ts`, `index.ts`, `main.tsx`, `replit.md`

### Task #20: PostHog Web Analytics Fix (2026-03-31)

**What was done:**
- **Root cause 1 fixed:** Added manual `$pageview` events via `pageview()` method in `useAnalytics.ts`
- **Root cause 2 fixed:** Cleared `property_denylist` (was blocking `$current_url`, `$referrer`, `$referring_domain`). PII protection via `before_send` was already sufficient.
- **Root cause 3 fixed:** Virtual URL construction from `activeTab`/`currentView` state
- Added `dispatchPageview()` to `dispatcher.ts` (PostHog only — GA4 `screen_view` handled separately)
- Updated `UseAnalytics` TypeScript interface with `pageview()` method
- Wired `pageview()` in `App.tsx` `useEffect` on `[activeTab, currentView]`
- Fixed virtual URL bug: uses `activeTab` as base path (not `currentView` which doesn't update on tab changes)
- Fixed duplicate GA4 events: `pageview()` sends to PostHog only, `setScreen()` sends to GA4 only
- Fixed browser tab title: "Demo_Ada_Wealth Copilot (Copy)" → "Ada Wealth Copilot"
- Updated `replit.md` documentation

**Files modified:** `index.html`, `posthog.ts`, `useAnalytics.ts`, `dispatcher.ts`, `types.ts`, `replit.md`

---

## Appendix A: PostHog Project Details

| Setting | Value |
|---------|-------|
| Project API Key | `phc_p6SAczQniJIkxgxXDax1LgpRGI6pxbEDAqt9Wyoo4DT` |
| API Host | `https://us.i.posthog.com` |
| Region | US Cloud |
| SDK | `posthog-js ^1.364.1` |
| React Binding | `@posthog/react ^1.8.2` |
| Defaults Version | `2026-01-30` |
| Person Profiles | `identified_only` |

## Appendix B: GA4 Property Details

| Setting | Value |
|---------|-------|
| Measurement ID | `G-V823WN3NG9` |
| Loading Method | Dynamic `<script>` injection (SPA pattern) |
| Auto Page Views | Disabled (`send_page_view: false`) |
| Debug Mode | Enabled in development only |
| Enhanced Measurement | Client-side (scroll, outbound clicks, engagement time) |

## Appendix C: Reference Documents

| Document | Location | Description |
|----------|----------|-------------|
| PostHog v2 Event Spec | `attached_assets/RC_ada_analytics_posthog_v2_CLA_post_OAI_3003_3pm_1774871900301.docx` | Full 52-event taxonomy specification |
| PostHog React Guide | `attached_assets/Pasted-React-PostHog-makes-it-easy-to-get-data-about-traffic-a_1774883452274.txt` | Official PostHog React integration guide (cached) |
| Task #19 Plan | `.local/tasks/task-19-ga4-analytics.md` | GA4 implementation plan |
| Task #20 Plan | `.local/tasks/task-20-posthog-web-analytics-fix.md` | PostHog Web Analytics fix plan |
| Analytics Backlog | `BACKLOG.md` (BL-034 through BL-040) | Future analytics work items |
| Analytics Issues | `ISSUES.md` | Resolved analytics issues |
| replit.md Analytics Section | `replit.md` (line ~63) | Living documentation of analytics architecture |
