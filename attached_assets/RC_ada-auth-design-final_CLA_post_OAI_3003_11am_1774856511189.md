# Ada Preview Build — Auth Design (Final)

**Status:** Final · March 2026
**Scope:** Preview build — email/password login, mocked persona data, admin-managed credentials
**Stack:** React 18 + Vite + Express + PostgreSQL (Replit)
**Backlog:** MFA, email verification, password reset via email, invite flows, SSO/OIDC

---

## 1. Critical Synthesis — Why Not Better Auth

A parallel analysis recommended Better Auth as an embedded auth framework. After evaluating against the actual requirements, I'm recommending **hand-rolled cookie-session auth** instead. Here's why:

**What Better Auth brings:** cookie sessions, email verification, password reset, 2FA plugin, SSO plugin, managed schema, Express integration.

**What Ada actually needs right now:** bcrypt check on ~5 admin-seeded accounts, a session cookie, and middleware to gate 39 REST + 2 SSE endpoints.

**The mismatch:** Better Auth's value is in flows Ada has explicitly backlogged (email verification, password reset, invites). Using it now means configuring a framework to disable most of its features, learning its conventions, managing its 4-table schema, and accepting its middleware ordering constraint (`express.json()` must come after Better Auth's handler — a footgun in a 39-endpoint app). For 5 seeded demo users with no self-registration, that's overhead without payoff.

**What I'm taking from that analysis:**
- Cookie-based sessions over JWT (better for SSE, simpler same-origin model) ✓
- Three-layer middleware pattern (optionalAuth / requireAuth / requireRole) ✓
- Separate auth schema to keep auth tables isolated from Ada's 44-table schema ✓
- Auth event logging as a lightweight audit trail ✓

**What I'm discarding:**
- Better Auth as a dependency (can adopt later if Ada needs email verification, SSO, or 2FA — those are all backlogged)
- `demo_tenant` / `user_demo_scope` abstraction (over-engineered for 5 users — flat `persona` column is sufficient)
- `preview_invite` table and invite flow (backlogged)
- Email delivery integration (backlogged)

**Production upgrade path:** When Ada moves off preview, if the backlogged flows (email verification, password reset, MFA) are needed, Better Auth can replace the hand-rolled layer at that point. The middleware pattern, schema isolation, and frontend AuthContext all carry forward unchanged.

---

## 2. Architecture

```
React/Vite Frontend
  ├─ AuthContext (session state via TanStack Query)
  ├─ currentView: "login" | "app"
  └─ Persona picker → POST /api/auth/login

Express API
  ├─ express-session + connect-pg-simple
  ├─ /api/auth/login        POST   (public)
  ├─ /api/auth/logout       POST   (authenticated)
  ├─ /api/auth/me           GET    (authenticated)
  ├─ /api/admin/users       GET    (ops_admin only)
  ├─ /api/admin/users       POST   (ops_admin — seed/create demo user)
  ├─ existing 39 REST       → wrapped with requireAuth
  └─ existing 2 SSE         → session validated on connect

PostgreSQL
  ├─ auth.users              session + credential store
  ├─ auth.sessions           connect-pg-simple managed
  └─ public.*                existing 44 Ada tables
```

**Why cookie sessions, not JWT:**
Ada has 2 SSE streams. With JWT, you'd need to plumb bearer tokens into EventSource (which doesn't support custom headers natively — you'd need polyfills or query-string tokens). With cookie sessions, the browser sends the session cookie automatically on SSE connections. Zero extra plumbing.

---

## 3. Data Model

### 3.1 Auth schema

Keep auth tables in a dedicated `auth` schema, isolated from Ada's existing 44 tables in `public`.

```sql
CREATE SCHEMA IF NOT EXISTS auth;

-- Core user table for authentication
CREATE TABLE auth.users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  display_name    VARCHAR(100) NOT NULL,
  role            VARCHAR(20)  NOT NULL DEFAULT 'preview_user'
                    CHECK (role IN ('preview_user', 'demo_admin', 'ops_admin')),
  status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended', 'disabled')),

  -- Demo persona binding
  persona         VARCHAR(50)  NOT NULL,
  avatar_url      VARCHAR(500),
  mock_tier       VARCHAR(20)  NOT NULL DEFAULT 'standard'
                    CHECK (mock_tier IN ('standard', 'gold', 'platinum')),
  mock_config     JSONB        NOT NULL DEFAULT '{}',

  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Session store (managed by connect-pg-simple)
CREATE TABLE auth.sessions (
  sid     VARCHAR NOT NULL PRIMARY KEY,
  sess    JSON    NOT NULL,
  expire  TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_sessions_expire ON auth.sessions (expire);

-- Lightweight audit log
CREATE TABLE auth.events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id),
  event_type  VARCHAR(50) NOT NULL,
  ip          VARCHAR(45),
  user_agent  TEXT,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_user    ON auth.events (user_id);
CREATE INDEX idx_events_type    ON auth.events (event_type);
```

**Design notes:**

- `persona` is a flat string, not a foreign key to a persona table. There are 5 personas. A join table is premature abstraction.
- `mock_config` (JSONB) holds persona-specific overrides — mock balance, feature flags, notification preferences, etc. This follows Ada's established hybrid relational + JSONB pattern: normalize what the middleware needs to query (role, status, persona, mock_tier), store as JSONB what the frontend just renders from.
- `auth.sessions` is managed entirely by `connect-pg-simple`. Don't manually write to it.
- `auth.events` logs login success/failure, logout, and admin actions. Minimal but sufficient for demo debugging.

### 3.2 Mock data binding

All existing Ada mock data tables should reference `auth.users.id` as `user_id`. On login, the session stores the user ID; every API query filters by it. No persona-switching logic — the data is just naturally scoped.

```
auth.users.id ──→ mock_transactions.user_id
                ──→ mock_cards.user_id
                ──→ mock_notifications.user_id
                ──→ mock_portfolio.user_id
                ──→ ... (all mock data tables)
```

---

## 4. Auth Flow

### 4.1 Login

```
Client                          Server                        DB
  │                               │                            │
  │  POST /api/auth/login         │                            │
  │  { email, password }          │                            │
  │──────────────────────────────▶│                            │
  │                               │  SELECT * FROM auth.users  │
  │                               │  WHERE email = $1          │
  │                               │  AND status = 'active'     │
  │                               │───────────────────────────▶│
  │                               │◀───────────────────────────│
  │                               │                            │
  │                               │  bcrypt.compare(password,  │
  │                               │    password_hash)          │
  │                               │                            │
  │                               │  req.session.userId = id   │
  │                               │  req.session.role = role   │
  │                               │                            │
  │                               │  UPDATE last_login_at      │
  │                               │  INSERT auth.events        │
  │                               │───────────────────────────▶│
  │                               │                            │
  │  Set-Cookie: sid=...          │                            │
  │  { user }                     │                            │
  │◀──────────────────────────────│                            │
```

**Response payload (no token — session is in the cookie):**

```json
{
  "user": {
    "id": "uuid",
    "email": "omar@demo.ada",
    "displayName": "Omar Karim Haddad",
    "persona": "priority_banking",
    "avatarUrl": "/avatars/omar.png",
    "mockTier": "platinum",
    "role": "preview_user",
    "mockConfig": {
      "balance": 3200000,
      "rmName": "James Thornton",
      "featureFlags": { "chat": true, "discover": true, "collective": true }
    }
  }
}
```

### 4.2 Session Strategy

| Concern | Approach |
|---------|----------|
| Session store | `connect-pg-simple` → `auth.sessions` table |
| Cookie | `httpOnly`, `secure`, `sameSite: 'strict'` |
| Session lifetime | 12 hours (rolling — refreshes on activity) |
| Idle timeout | 2 hours without requests → session expires |
| Secret | `SESSION_SECRET` env var (Replit Secrets) |
| HTTPS | Handled by Replit's proxy |

**Why not JWT for a preview build:**
- Fewer moving parts (no access/refresh token rotation, no silent refresh interceptors)
- SSE streams get auth for free (cookie sent automatically)
- `connect-pg-simple` handles session storage, cleanup, and expiry — zero custom code
- Production migration: swap to Better Auth's cookie sessions or add JWT layer when needed

### 4.3 Logout

```
POST /api/auth/logout
→ req.session.destroy()
→ Cookie cleared
→ INSERT auth.events (type: 'logout')
→ 200 OK
```

### 4.4 Session Check (`GET /api/auth/me`)

Called on app load (page refresh, tab reopen). If session cookie exists and is valid, returns the full user profile. If not, returns 401 — frontend sets `currentView = "login"`.

---

## 5. API Endpoints

### Auth routes (new)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/auth/login` | None | Email + password login |
| `POST` | `/api/auth/logout` | Session | Destroy session |
| `GET`  | `/api/auth/me` | Session | Return current user + persona config |

### Admin routes (new)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET`  | `/api/admin/users` | ops_admin | List all demo users |
| `POST` | `/api/admin/users` | ops_admin | Create/update demo user |
| `PATCH`| `/api/admin/users/:id` | ops_admin | Suspend/reactivate user |
| `PATCH`| `/api/admin/users/:id/password` | ops_admin | Reset a demo user's password |

### Existing endpoints (modified)

All 39 existing REST endpoints get wrapped with `requireAuth` middleware. The 2 SSE streams validate the session on connection open.

---

## 6. Middleware Stack

Three layers, applied in order. This is the pattern the parallel analysis recommended and it's the right call — it separates authentication (who are you?) from authorization (what can you do?).

```typescript
// 1. resolveSession — always runs, attaches user if session exists
async function resolveSession(req, res, next) {
  if (req.session?.userId) {
    const user = await getUserById(req.session.userId);
    if (user && user.status === 'active') {
      req.user = user;
    } else {
      req.session.destroy(); // user suspended/disabled mid-session
    }
  }
  next();
}

// 2. requireAuth — blocks unauthenticated requests
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// 3. requireRole — blocks unauthorized requests
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
```

**Application order in Express:**

```typescript
// Session middleware (runs on all routes)
app.use(session({ ... }));
app.use(resolveSession);

// Public routes
app.post('/api/auth/login', loginHandler);

// Authenticated routes
app.use('/api', requireAuth);  // everything below requires auth
app.get('/api/auth/me', meHandler);
app.post('/api/auth/logout', logoutHandler);

// Admin routes
app.use('/api/admin', requireRole('ops_admin', 'demo_admin'));

// Existing 39 endpoints — no changes to handlers, just protected by middleware above
app.use('/api', existingRoutes);
```

### SSE Protection

```typescript
app.get('/api/sse/notifications', requireAuth, (req, res) => {
  // Session already validated by middleware
  // req.user available for scoping
  res.writeHead(200, { 'Content-Type': 'text/event-stream', ... });
  // ... existing SSE logic, now scoped to req.user.id
});
```

No bearer token plumbing. The browser sends the session cookie on the SSE connection automatically.

---

## 7. Frontend Integration

### 7.1 Adapting to Ada's routing model

Ada uses `activeTab` + `currentView` (not React Router). Auth becomes another state concern:

```
currentView values (extended):
  "login"           → LoginView (persona picker)
  "chat"            → ChatView
  "notifications"   → NotificationsView
  "settings"        → SettingsView
  ... etc

New auth state:
  user: User | null     → populated on successful login or session restore
  authLoading: boolean  → true during initial session check
```

**No React Router refactor.** Auth is gated at the shell level:

```tsx
function App() {
  const { user, isLoading } = useSession();

  if (isLoading) return <SplashScreen />;
  if (!user) return <LoginView />;
  return <AppShell />;  // existing app with activeTab/currentView
}
```

### 7.2 Session management with TanStack Query

Since Ada already uses TanStack Query v5, session state should live there — not in a separate React context:

```typescript
// hooks/useSession.ts
export function useSession() {
  return useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,  // 5 min before re-checking
    refetchOnWindowFocus: true, // re-validate on tab switch
  });
}

// hooks/useLogin.ts
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'session'], data);
    },
  });
}

// hooks/useLogout.ts
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetch('/api/auth/logout', {
      method: 'POST', credentials: 'include'
    }),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null);
      queryClient.clear(); // wipe all cached data on logout
    },
  });
}
```

**Why TanStack Query instead of a separate AuthContext:**
- Ada already has it as a dependency
- Automatic background refetch catches expired sessions without custom timers
- `refetchOnWindowFocus` handles the "left tab open overnight" case
- `queryClient.clear()` on logout ensures no persona data leaks between demo logins
- One less context provider to maintain

### 7.3 Login Page — Persona Picker

The login page is persona-picker-first. Each card represents a demo customer. Tapping it fires a direct login — no form fill.

```
┌──────────────────────────────────────┐
│                                      │
│          [Ada Logo]                  │
│       Wealth Management              │
│          Preview                     │
│                                      │
│   Choose a customer to explore:      │
│                                      │
│   ┌────────┐ ┌────────┐ ┌────────┐  │
│   │  Omar  │ │  Maya  │ │  Arjun │  │
│   │Platinum│ │  Gold  │ │  New   │  │
│   │ HNW    │ │ Active │ │Onboard │  │
│   └────────┘ └────────┘ └────────┘  │
│                                      │
│   ┌────────┐ ┌────────┐             │
│   │  Sam   │ │  🔑    │             │
│   │  Idle  │ │ Admin  │             │
│   │Dormant │ │ Login  │             │
│   └────────┘ └────────┘             │
│                                      │
│   Preview build · All data is mocked │
│                                      │
└──────────────────────────────────────┘
```

**Behavior:**
- Persona cards: each has hardcoded credentials baked into the frontend. Tapping = instant `POST /api/auth/login`.
- Admin Login card: expands an email/password form for ops_admin access (managing demo users, viewing audit logs).
- After login, the entire app experience is bound to that user's data. All API responses are scoped by `req.user.id`.
- To explore a different persona: logout → pick another card.

### 7.4 Handling 401s in existing API calls

Add a global handler so existing TanStack Query calls redirect to login on session expiry:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error?.status === 401) return false; // don't retry auth failures
        return failureCount < 3;
      },
    },
    mutations: {
      onError: (error) => {
        if (error?.status === 401) {
          queryClient.setQueryData(['auth', 'session'], null);
        }
      },
    },
  },
});
```

---

## 8. Seed Data — Demo Personas

| Persona | Name | Email | Tier | Mock Balance | Use Case |
|---------|------|-------|------|-------------|----------|
| Priority banking | Omar Karim Haddad | omar@demo.ada | Platinum | 3,200,000 | Primary demo — HNW client, full features, RM: James Thornton |
| Active user | Maya Chen | maya@demo.ada | Gold | 847,200 | Power user, active portfolio, notifications populated |
| New customer | Arjun Mehta | arjun@demo.ada | Standard | 12,500 | Onboarding flow, first-time UX, empty states for Discover |
| Dormant | Sam Torres | sam@demo.ada | Standard | 1,100 | Re-engagement, sparse data, notification prompts |
| Ops admin | Admin | admin@ada.app | — | — | User management, not a demo persona |

**Default password for all demo personas:** `Ada2026!`
**Admin password:** Set via environment variable or manual DB update.

### Seed script requirements

- Idempotent (upsert on email)
- Seeds both `auth.users` and all downstream mock data tables
- Each persona's mock data set is pre-built to showcase different app states
- Re-runnable without destroying sessions or audit logs

---

## 9. Security — Preview Tier

| Concern | Preview approach | Production upgrade path |
|---------|-----------------|------------------------|
| Password storage | bcrypt (cost 12) | No change needed |
| Session storage | Postgres via connect-pg-simple | Redis or Better Auth managed |
| Cookie security | httpOnly, secure, sameSite: strict | Add CSRF token header |
| Brute force | express-rate-limit (5 attempts/min/IP) | WAF + adaptive rate limiting |
| HTTPS | Replit proxy handles TLS | Custom cert on production domain |
| Secrets | Replit Secrets (env vars) | Vault / KMS |
| User management | Admin API + seed script | Self-registration + KYC flow |
| Audit trail | auth.events table | Full event streaming + SIEM |
| MFA | Backlogged | Better Auth 2FA plugin or TOTP |
| Email verification | Backlogged | Better Auth email plugin |
| Password reset | Backlogged | Better Auth reset flow |
| SSO | Backlogged | Better Auth OIDC/SAML plugin |

---

## 10. Environment Variables (Replit Secrets)

```
DATABASE_URL=postgresql://...           # Existing Replit Postgres
SESSION_SECRET=<random-64-char-string>  # For signing session cookies
NODE_ENV=preview                        # Flags demo mode
ADMIN_DEFAULT_PASSWORD=<strong-pw>      # Initial admin password
```

---

## 11. Dependencies (New)

```json
{
  "bcryptjs": "^2.4.3",
  "express-session": "^1.18.0",
  "connect-pg-simple": "^10.0.0",
  "express-rate-limit": "^7.0.0"
}
```

Four dependencies. No auth-as-a-service, no external APIs, no email providers. Everything runs self-contained on Replit.

---

## 12. Implementation Sequence

| Step | Work | Estimate |
|------|------|----------|
| 1 | Create `auth` schema + tables (DDL) | 30 min |
| 2 | Configure express-session + connect-pg-simple | 30 min |
| 3 | Build middleware stack (resolveSession, requireAuth, requireRole) | 1 hr |
| 4 | Auth endpoints (login, logout, me) | 1 hr |
| 5 | Admin endpoints (list/create/update users) | 1 hr |
| 6 | Wrap existing 39 REST + 2 SSE with requireAuth | 1 hr |
| 7 | Frontend: useSession / useLogin / useLogout hooks | 1 hr |
| 8 | Frontend: LoginView with persona picker | 1–2 hr |
| 9 | Frontend: App-level auth gate + 401 handling | 30 min |
| 10 | Seed script (users + per-persona mock data) | 1–2 hr |
| 11 | Integration test: login → navigate → SSE → logout → switch persona | 1 hr |

**Estimated total: ~1.5 days of focused work.**

---

## 13. What This Design Explicitly Does NOT Do

To avoid scope creep, these are conscious omissions:

- **No self-registration.** All accounts are admin-created. This is a demo.
- **No email verification.** Backlogged. The admin creates verified accounts directly.
- **No password reset flow.** Backlogged. Admin can reset passwords via the admin API.
- **No MFA.** Backlogged. Better Auth's 2FA plugin can be added later.
- **No invite flow.** Backlogged. Admin creates accounts, shares credentials out of band.
- **No persona switching mid-session.** Logout and pick another card.
- **No JWT.** Cookie sessions are simpler for this stack. JWT can be added for mobile/API clients later.
- **No external auth provider.** No Auth0, Clerk, Firebase Auth, or Supabase Auth. Self-contained.
