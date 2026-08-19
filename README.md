# RouteWorks — Frontend (with local test backend)

The app runs two ways off the exact same code:

- **Local test mode (default, no setup)** — data lives in your browser's
  localStorage, seeded with demo orders/staff on first load. Every page —
  admin CRUD, tracking, mock payment, delivery details — works right now.
- **Supabase mode** — once you fill in `.env` with a real project, every
  call automatically routes to Supabase instead. No component code changes.

## Run it locally right now

```bash
npm install
npm run dev
```

That's it — leave `.env` unset (or don't create it) and you're on the local
backend automatically.

### Test logins (`/admin/login`)

| Email | Password | Role |
|---|---|---|
| `admin@routeworks.test` | `admin123` | admin |
| `staff@routeworks.test` | `staff123` | staff |

### Test orders (`/track`)

| Order ID | State |
|---|---|
| `RW-DEMO01` | In transit, unpaid |
| `RW-DEMO02` | Released from customs, unpaid — try the mock payment button here |
| `RW-DEMO03` | Delivered, paid — full happy path |
| `RW-DEMO04` | Held by customs — exception state |

Create your own via `/admin/orders/new` once logged in, then walk it through
statuses from its detail page and watch `/track` update live.

To wipe local data and re-seed, open devtools → Application → Local
Storage → clear keys starting with `routeworks_local_`, then reload.

## How the local/Supabase switch works

```
src/lib/db.js          ← facade. Picks local or remote based on env vars.
src/lib/local/          ← localStorage backend (store.js, db.js, auth.js)
src/lib/remote/         ← Supabase backend (db.js, auth.js)
src/lib/payments.js      ← mock payment simulator, used by both backends
```

Every page imports `{ db, auth }` from `src/lib/db.js` — never
`src/lib/local/*` or `src/lib/remote/*` directly, and never the raw
Supabase client. That's what makes the switch invisible to the UI.

## Payment is intentionally mocked

There's no real Paystack integration yet, on purpose — that requires the
Express server from Section 8 of the build guide, which isn't part of this
frontend scaffold. Instead, `/track` shows a **"Simulate payment"** button
on any unpaid, arrived order. Clicking it waits ~1s and flips
`payment_status` to `paid` with an obviously-fake reference
(`MOCK-PAY-XXXXXX`), so you can test the full flow — payment →
delivery-details form → confirmation — without a payment provider.

To go live later: build the Express endpoints in Section 8, then replace
the body of `simulatePayment()` in `src/lib/payments.js` with a real call
to `POST /api/orders/:orderId/pay`. Nothing else needs to change.

## Switching to Supabase when you're ready

1. Create a Supabase project, run the schema from Section 4 of
   `routeworks-technical-build-guide.md`, enable RLS on every table.
2. Create your own first admin login — see
   `admin-login-setup-guide.md` for the exact steps (Supabase dashboard →
   Auth → Users → Add user, then insert a matching `profiles` row).
3. `cp .env.example .env` and fill in `VITE_SUPABASE_URL` +
   `VITE_SUPABASE_ANON_KEY`.
4. Restart `npm run dev` — the sidebar's "Local test mode" badge disappears
   and every page now reads/writes real Supabase data.

Local test data never touches Supabase and vice versa — they're
completely separate stores, so you can flip back and forth freely while
testing.

## What's NOT here yet

- The Express payment layer (Section 8) — payment is mocked, see above.
- A real logo — see `public/images/IMAGE-SOURCES.md`.
- Final copy for About/Services/Products/FAQ/Terms/Privacy (marked with
  `[bracketed placeholders]` in the code).
- "Forgot password" flow (mentioned in `admin-login-setup-guide.md` —
  needs Supabase Auth's real reset flow, so it's meaningful only in
  Supabase mode).

## Structure

```
src/
  components/
    layout/     Header, Footer, PublicLayout, AdminLayout, PageHeader
    auth/       RequireAuth (session + role gate for /admin/*)
  context/      AuthContext (backend-agnostic session + profile)
  data/         statusIcons.jsx — single source of truth for status display
  lib/
    db.js       facade — picks local vs Supabase
    local/      localStorage backend + seed data
    remote/     Supabase backend
    payments.js mock payment simulator
  pages/
    public/     Home, About, Services, Products, FAQ, Terms, Privacy, Contact, Track
    admin/      Login, Dashboard, Orders, OrderNew, OrderDetail, Staff, Activity
```
