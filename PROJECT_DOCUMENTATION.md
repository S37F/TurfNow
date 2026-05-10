# TurfNow — Project Documentation

Generated from codebase analysis.

---

## 1. Tech stack

### Frontend (root `package.json`)

| Technology | Version (from `package.json`) | Role |
|------------|-------------------------------|------|
| React | `^18.2.0` | UI |
| React DOM | `^18.2.0` | DOM rendering |
| Vite | `^7.3.1` | Dev server & production build (`build/`) |
| `@vitejs/plugin-react` | `^5.1.3` | React + JSX in Vite |
| Chakra UI | `^2.7.0` | Component library |
| Emotion (`@emotion/react`, `@emotion/styled`) | `^11.11.0` | Styling dependency for Chakra |
| Framer Motion | `^10.12.16` | Animation (used with Chakra stack) |
| React Router DOM | `^6.11.2` | Client routing (`src/routes/AllRoutes.jsx`) |
| Axios | `^1.6.5` | HTTP client (`src/services/api.js`) |
| React Icons | `^4.9.0` | Icons |

**Frontend dev / quality**

| Package | Version | Role |
|---------|---------|------|
| Vitest | `^3.1.0` | Unit/integration tests (`vite.config.js` `test`) |
| jsdom | `^25.0.1` | Test DOM |
| Testing Library (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`) | various | Component tests |
| ESLint (+ `eslint-plugin-react`, `eslint-plugin-react-hooks`) | `^8.57.0` | Lint (`npm run lint`) |
| Terser | `^5.31.0` | Production minification in Vite |
| concurrently | `^9.1.2` | Run API + Vite (`npm run dev:all`) |

### Backend (`server/package.json`)

| Technology | Version | Role |
|------------|---------|------|
| Node.js | `>=22.5.0` (`engines`) | Runtime |
| Express | `^4.18.2` | HTTP framework (`server/server.js`) |
| `pg` | `^8.20.0` | Neon/Postgres (`server/config/db.js`) |
| dotenv | `^16.3.1` | Environment variables |
| jsonwebtoken | `^9.0.2` | JWT (`server/routes/auth.js`, `server/middleware/auth.js`) |
| bcryptjs | `^3.0.2` | Password hashing (`server/routes/auth.js`) |
| cors | `^2.8.5` | CORS (`server/server.js`) |
| helmet | `^7.1.0` | Security HTTP headers (`server/server.js`) |
| express-rate-limit | `^7.1.5` | Rate limiting (`server/server.js`) |
| morgan | `^1.10.0` | HTTP request logging (`server/server.js`) |
| nodemailer | `^8.0.1` | Email (`server/services/email.js`) |

**Backend dev / testing**

| Package | Version | Role |
|---------|---------|------|
| nodemon | `^3.0.2` | Dev reload (`npm run dev`) |
| Jest | `^29.7.0` | API tests (`server/jest.config.js`, `npm test`) |
| supertest | `^7.0.0` | HTTP assertions in tests |

### Database & schema

- **PostgreSQL** (documented as **Neon** in `README.md` and `server/.env.example`).
- Schema definition: `server/db/schema.postgres.sql` (indexes, FKs, `pgcrypto`).

### DevOps / tooling

- No `Dockerfile` in the repo; production notes in `README.md` (env vars, `NODE_ENV=production`, static SPA from `public/` or `../build`).
- **ESLint** at repo root (`.eslintrc.json`) for `src/`.

---

## 2. Backend concepts & key methods

### REST API (Express routers)

- **What:** Resource-oriented HTTP endpoints grouped by domain.
- **Why here:** Turfs, bookings, reviews, admin, owners, and auth are separate concerns.
- **How:** `server/server.js` mounts `app.use('/api/auth', authRouter)` and similar; each file under `server/routes/*.js` defines handlers with `express.Router()`.
- **Where:** `server/server.js`; `server/routes/auth.js`, `turfs.js`, `bookings.js`, `reviews.js`, `admin.js`, `owners.js`.

### JWT authentication

- **What:** Signed tokens carrying a subject (`sub` = user id), verified with a shared secret.
- **Why here:** Stateless auth for SPA; no session store.
- **How:** `signToken(userId)` in `server/routes/auth.js` calls `jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '7d' })`. `verifyToken` in `server/middleware/auth.js` reads `Authorization: Bearer <token>`, `jwt.verify`, loads user from `users`, sets `req.user`.
- **Where:** `server/routes/auth.js` (`signToken`, register/login); `server/middleware/auth.js` (`verifyToken`); `server/config/jwt.js` (`getJwtSecret`).

### Role-based access (admin / owner flags)

- **What:** Authorization after authentication using `is_admin` / `is_owner` from DB.
- **Why here:** Admin-only turf CRUD and admin dashboard APIs; owner flows tied to `owner_profiles.status` and `users.is_owner`.
- **How:** `isAdmin` checks `req.user.admin`; first registered user gets `is_admin = true` in `register`. Owner approval sets `users.is_owner` in `owners.js` `/:ownerId/approve`.
- **Where:** `server/middleware/auth.js` (`isAdmin`, `isOwner`); `server/routes/turfs.js` (admin on POST/PUT/DELETE); `server/routes/admin.js` (`router.use(verifyToken, isAdmin)`); `server/routes/owners.js` (mixed admin + authenticated user routes).

### Bcrypt password hashing

- **What:** One-way password hashing before storage.
- **Why here:** Never store plaintext passwords.
- **How:** `bcrypt.hash(password, SALT_ROUNDS)` on register; `bcrypt.compare` on login.
- **Where:** `server/routes/auth.js` (`SALT_ROUNDS = 10`).

### CORS + credentials

- **What:** Cross-origin rules for browsers; `credentials: true` allows cookies Authorization header patterns with configured origins.
- **Why here:** SPA may run on another port/origin than API in production.
- **How:** `parseOrigins()` splits `FRONTEND_URL`; `cors({ origin, credentials: true })`.
- **Where:** `server/server.js`.

### Rate limiting

- **What:** Cap requests per IP per window.
- **Why here:** Reduce abuse/brute force against `/api/*`.
- **How:** `express-rate-limit` on `app.use('/api/', limiter)` — 15 min window, max 100 (prod) or 500 (dev).
- **Where:** `server/server.js`.

### Helmet + conditional CSP

- **What:** Sets security-related HTTP headers; CSP restricts resource loads when serving the SPA from the same Express process.
- **Why here:** Hardening; CSP only when `isProduction && existsSync(.../public/index.html)`.
- **How:** `app.use(helmet({ contentSecurityPolicy: ..., crossOriginOpenerPolicy: ... }))`.
- **Where:** `server/server.js`.

### HTTPS redirect (behind proxy)

- **What:** Redirect HTTP → HTTPS when `x-forwarded-proto` is present and not `https`.
- **Why here:** Typical behind reverse proxies in production.
- **Where:** `server/server.js` (middleware when `isProduction`).

### Input sanitization middleware

- **What:** Global mutation of `req.body`, `req.query`, `req.params` to escape HTML, trim strings, strip `$` keys from objects.
- **Why here:** Reduce XSS-style reflection and legacy “NoSQL operator” style payload patterns on nested objects.
- **How:** `sanitizeValue` recursive; `sanitizeInput` registered after body parsers.
- **Where:** `server/middleware/sanitize.js` (`sanitizeInput`, `sanitizeValue`, `escapeHtml`); `server/server.js`.

### Parameterized SQL (`pg`)

- **What:** Queries use `$1`, `$2`, … placeholders.
- **Why here:** Mitigate SQL injection.
- **How:** `query` from `server/config/db.js` wraps `pool.query`.
- **Where:** All route files using `query()`; `server/config/db.js` (`query`, `Pool`).

### Connection pooling

- **What:** Reuse DB connections via `pg.Pool`.
- **Why here:** Efficient queries under load.
- **Where:** `server/config/db.js` (`Pool`, SSL from env).

### Email notifications (optional)

- **What:** SMTP via Nodemailer; falls back to console preview if env not set.
- **Why here:** Booking confirmations/cancellations, owner onboarding emails.
- **How:** `sendEmail(to, subject, html)`; templates in `emailTemplates`.
- **Where:** `server/services/email.js`; called from `server/routes/bookings.js`, `server/routes/owners.js`.

### Booking conflict detection

- **What:** Duplicate slot check by `turf_name`, `booking_date`, `time` for non-cancelled rows.
- **Why here:** Prevent double-booking same named turf slot.
- **Where:** `server/routes/bookings.js` (`POST '/'` — conflict `SELECT`).

### Domain constants (sports / booking statuses)

- **What:** Central allowlists enforced in handlers.
- **Why here:** Consistent validation across turfs/bookings/reviews.
- **Where:** `server/config/constants.js` (`ALLOWED_SPORTS`, `BOOKING_STATUSES`).

### Graceful shutdown

- **What:** Close HTTP server on `SIGTERM` / `SIGINT` with timeout.
- **Why here:** Clean process exit in orchestration.
- **Where:** `server/server.js` (`shutdown`).

### Static SPA + API single process (production)

- **What:** `express.static` + `sendFile` for SPA fallback.
- **Why here:** One Node process can serve API + built React app.
- **Where:** `server/server.js` (production block).

### Health checks

- **What:** Liveness-style JSON endpoints.
- **Where:** `server/server.js` — `GET /health`, `GET /api/health`.

### Dev proxy (frontend)

- **What:** Vite proxies `/api` and `/health` to `http://127.0.0.1:5000`.
- **Why here:** Same-origin browser calls in dev without CORS friction.
- **Where:** `vite.config.js`.

**Not present in this codebase:** WebSockets/Socket.io, OAuth2 social login (Helmet CSP references Google domains but no OAuth routes), message queues, Redis caching, webhooks, separate API gateway service.

---

## 3. API inventory

Base path: **`/api`** (plus **`/health`** at root). Auth is **Bearer JWT** in `Authorization` where noted.

### Core / health

| Method | Route | Description | Auth | Request body | Response (typical) |
|--------|-------|-------------|------|--------------|-------------------|
| GET | `/health` | Service health | No | — | `{ status, timestamp }` |
| GET | `/api/health` | Same under `/api` | No | — | `{ status, timestamp }` |

### `server/routes/auth.js` — `/api/auth`

| Method | Route | Description | Auth | Request body | Response |
|--------|-------|-------------|------|--------------|----------|
| POST | `/api/auth/register` | Register; first user becomes admin | No | `{ email, password, displayName? }` | `201` `{ success, token, user }` or `400/409/500` |
| POST | `/api/auth/login` | Login | No | `{ email, password }` | `200` `{ success, token, user }` or `400/401/500` |
| GET | `/api/auth/me` | Current user profile | Bearer | — | `200` `{ success, user }` |

### `server/routes/turfs.js` — `/api/turfs`

| Method | Route | Description | Auth | Request body | Response |
|--------|-------|-------------|------|--------------|----------|
| GET | `/api/turfs/:sport` | List turfs by sport; query: `city`, `available`, `minPrice`, `maxPrice` | No | — | `200` `{ success, data: [...] }` |
| GET | `/api/turfs/:sport/:id` | Turf detail | No | — | `200` `{ success, data }` or `404` |
| POST | `/api/turfs/:sport` | Create turf | Admin JWT | turf fields (`name`, `address`, `city`, `pricePerHour`, …) | `201` `{ success, data }` |
| PUT | `/api/turfs/:sport/:id` | Partial update allowed fields | Admin JWT | any of `name`, `address`, … | `200` or `404` |
| DELETE | `/api/turfs/:sport/:id` | Delete turf | Admin JWT | — | `200` or `404` |

### `server/routes/bookings.js` — `/api/bookings`

| Method | Route | Description | Auth | Request body | Response |
|--------|-------|-------------|------|--------------|----------|
| GET | `/api/bookings/my` | Current user’s bookings | JWT | — | `200` `{ success, data }` |
| GET | `/api/bookings/user/:userId` | Bookings for `userId` | JWT (must match `req.user.uid`) | — | `200` or `403` |
| POST | `/api/bookings` | Create booking (+ email attempt) | JWT | `{ booking, time, bookingDate, sport }` | `201` or `400` (validation/conflict) |
| PATCH | `/api/bookings/:bookingId/cancel` | Cancel (owner of booking) | JWT | — | `200` or `403/404` |
| PATCH | `/api/bookings/:bookingId` | Update `status` | JWT | `{ status }` (must be in `BOOKING_STATUSES`) | `200` or `400/403/404` |
| DELETE | `/api/bookings/:bookingId` | Soft-cancel (same as cancel path) | JWT | — | `200` or `403/404` |
| GET | `/api/bookings/slots/:turfName/:date` | Booked time strings for turf/date | No | — | `200` `{ success, data: [times] }` |

### `server/routes/reviews.js` — `/api/reviews`

| Method | Route | Description | Auth | Request body | Response |
|--------|-------|-------------|------|--------------|----------|
| GET | `/api/reviews/:sport/:turfId` | List reviews | No | — | `200` `{ success, data }` |
| POST | `/api/reviews` | Create review | JWT | `{ sport, turfId, rating, comment }` | `201` or `400` |
| DELETE | `/api/reviews/:id` | Delete own review | JWT | — | `200` or `403/404` |

### `server/routes/admin.js` — `/api/admin` (all routes: `verifyToken` + `isAdmin`)

| Method | Route | Description | Auth | Request body | Response |
|--------|-------|-------------|------|--------------|----------|
| GET | `/api/admin/bookings` | All bookings | Admin | — | `200` `{ success, data }` |
| GET | `/api/admin/stats` | Aggregated counts | Admin | — | `200` `{ success, data: { totalTurfs, totalBookings, totalUsers, sportWise, … } }` |
| POST | `/api/admin/make-admin/:userId` | Grant admin | Admin | — | `200` or `404` |
| POST | `/api/admin/remove-admin/:userId` | Revoke admin (not self) | Admin | — | `200` or `400/404` |
| GET | `/api/admin/users` | List users (summary) | Admin | — | `200` `{ success, data }` |

### `server/routes/owners.js` — `/api/owners`

| Method | Route | Description | Auth | Request body | Response |
|--------|-------|-------------|------|--------------|----------|
| POST | `/api/owners/register` | Submit owner profile (pending) | JWT | `fullName`, `phone`, `businessName`, … | `201` or `400` |
| GET | `/api/owners/profile` | Get own owner profile | JWT | — | `200` or `404` |
| PUT | `/api/owners/profile` | Update allowed profile fields | JWT | optional fields | `200` or `404` |
| GET | `/api/owners/all` | List owner applications | Admin; `?status=` filter | — | `200` |
| POST | `/api/owners/:ownerId/approve` | Approve owner | Admin | — | `200` |
| POST | `/api/owners/:ownerId/reject` | Reject owner | Admin | `{ reason? }` | `200` |
| GET | `/api/owners/my-turfs` | Turfs where `owner_id` = current user (approved only) | JWT | — | `200` or `403/404` |
| GET | `/api/owners/my-bookings` | Bookings for turfs owned by user | JWT | — | `200` |

---

## 4. Architecture diagram (text)

### Request path (typical)

```
[Browser SPA — Vite/React]
        |  HTTP /api/* (dev: Vite proxy → Express :5000)
        v
[Express app — server/server.js]
        |  helmet, morgan, cors, json/urlencoded (1mb), sanitizeInput
        |  rate limiter on /api/
        v
[Route modules — server/routes/*.js]
        |  verifyToken / isAdmin / isOwner (where applied)
        v
[pg query() — server/config/db.js → Neon Postgres]
        |
        +--> [Optional: Nodemailer SMTP — server/services/email.js]
```

### Auth flow

```
[Login/Register] → POST /api/auth/login|register
        → bcrypt + INSERT/SELECT users
        → jwt.sign({ sub: userId }) → token in JSON

[Protected request] → Authorization: Bearer <token>
        → verifyToken → jwt.verify + SELECT users SET req.user { uid, admin, owner, … }
        → isAdmin / route handler
```

### Production static hosting path

```
[Client] → Express
        → if NODE_ENV production + build exists:
               express.static(public | ../build)
               SPA fallback GET * → index.html (except /api/*, /health)
```

---

## 5. Problem statement

- **Problem:** Finding and reserving sports grounds (turfs) for football, cricket, basketball, and badminton without fragmented phone calls or spreadsheets.
- **Target users:** Players/groups booking slots; **turf owners** listing venues after approval; **admins** curating listings, users, and platform stats.
- **Without this software:** Calling venues, juggling WhatsApp/coordinators, manual calendar checks, weaker visibility into availability and pricing across venues.
- **Value proposition:** Central directory of turfs with filters, authenticated booking flow with slot conflict checks and optional confirmation email, roles for admins and approved owners, and reviews—aligned with README: **cash at venue** rather than integrated online payment.

---

## 6. Authentication & authorization

- **Strategy:** **JWT** in the `Authorization: Bearer <token>` header (stateless); no OAuth or API-key auth in routes.
- **Token lifecycle:** Issued on `register` / `login` (`server/routes/auth.js`, `signToken`, `TOKEN_EXPIRES = '7d'`). Frontend stores token in **`localStorage`** key `turfnow_token` (`src/context/Authcontext.js`, `src/services/api.js`). Validated by `jwt.verify(token, getJwtSecret())`, then DB lookup to refresh `is_admin` / `is_owner`.
- **Secret:** `JWT_SECRET` via `getJwtSecret()` — min 16 chars in production, dev fallback string in `server/config/jwt.js`.
- **Roles / levels:**
  - **Guest:** public turf list/detail, slots, reviews list.
  - **Authenticated user:** bookings, reviews create/delete own, `/auth/me`.
  - **Admin (`users.is_admin`):** turf CRUD, all admin routes, promote/demote admins, owner list/approve/reject.
  - **Owner (`users.is_owner` + approved `owner_profiles`):** owner dashboard data (`my-turfs`, `my-bookings`), register flow before approval.

**Middleware signatures (names + params only):**

- `verifyToken(req, res, next)`
- `isAdmin(req, res, next)`
- `isOwner(req, res, next)`

(`server/middleware/auth.js`)

---

## 7. Database design

- **Database:** **PostgreSQL** (Neon), via `DATABASE_URL`. SSL: `PGSSLMODE=disable` → no SSL; else `{ rejectUnauthorized: false }` (`server/config/db.js`).

### Tables (from `server/db/schema.postgres.sql`)

| Table | Key fields | Notes |
|-------|------------|------|
| **users** | `id` (UUID PK), `email` (unique), `password_hash`, `display_name`, `is_admin`, `is_owner`, `created_at` | First signup logic is app-level (`auth.js`), not DB |
| **turfs** | `id`, `sport` (CHECK), `name`, `address`, `city`, `image`, `price_per_hour`, `facilities` (JSONB), `size`, `description`, `owner_id` → `users(id)`, `available`, `rating`, `total_reviews`, timestamps | Indexes: `sport`, `city`, `owner_id` |
| **reviews** | `id`, `sport`, `turf_id` → `turfs(id)` CASCADE, `user_id` → `users(id)` CASCADE, `user_email`, `rating` (1–5), `comment`, `created_at` | Index `(sport, turf_id)` |
| **bookings** | `id`, `user_id`, `email`, `turf_name`, `turf_image`, `turf_address`, `turf_price`, `sport`, `time`, `booking_date`, `status`, `created_at`, `cancelled_at`, `updated_at` | Indexes: `user_id`, `(turf_name, booking_date)` — denormalized turf snapshot |
| **owner_profiles** | `user_id` PK → `users`, business fields, `sport_types` JSONB, `status`, approval/rejection timestamps & actors, `turfs` JSONB | |

### Relationships (summary)

- **users → turfs:** one-to-many (`turfs.owner_id`).
- **users → bookings:** one-to-many (`bookings.user_id`).
- **users → reviews:** one-to-many.
- **turfs → reviews:** one-to-many (`ON DELETE CASCADE`).
- **users → owner_profiles:** one-to-one (`user_id` PK).

### Migrations / seeding

- **Schema file:** `server/db/schema.postgres.sql` (and `server/db/schema.sql` duplicate style) — **manual apply**, not wired in `npm` scripts observed in `README`.
- **Seeding:** `server/scripts/seedData.js` (`npm run seed` in server) clears `reviews` + `turfs`, inserts sample turfs per sport.

### Implementation note

- `server/routes/reviews.js` function `updateTurfRating` uses `updated_at = datetime('now')` in SQL, which is **SQLite-flavored** and may not match Postgres (`NOW()` or `CURRENT_TIMESTAMP`). Worth fixing if ratings fail to persist on Postgres.

---

## 8. Error handling & logging

- **Global error handler:** Express 4-arg middleware at bottom of `server/server.js`; logs `err.stack` with `console.error`, responds `status: err.status || 500`, body `{ success: false, error: isProduction ? 'Internal server error' : err.message }`.
- **404:** Prior handler `{ success: false, error: 'Route not found' }` (`server/server.js`).
- **Route-level errors:** Try/catch in each route returning `{ success: false, error: '…' }` or `{ error: '…' }` (some PATCH routes use `{ error }` only — slight inconsistency).
- **Logging:** **`morgan`** — `combined` in production, `dev` otherwise (`server/server.js`). Additional `console.error`/`console.warn` in routes and `email.js`.
- **Custom error classes:** None; plain `Error` / status codes inline.

---

## 9. Security measures

| Measure | Implementation |
|---------|----------------|
| Password hashing | `bcryptjs` (`server/routes/auth.js`) |
| JWT signing | `jsonwebtoken` + secret enforcement in prod (`server/config/jwt.js`) |
| SQL injection mitigation | Parameterized queries throughout (`server/config/db.js` + routes) |
| XSS-oriented sanitization | Global `sanitizeInput` HTML-entity escape + trim (`server/middleware/sanitize.js`); reviews also escape `<`/`>` on comment (`server/routes/reviews.js`) |
| `$` key stripping | In `sanitizeValue` for nested objects (`server/middleware/sanitize.js`) |
| Rate limiting | `express-rate-limit` on `/api/` (`server/server.js`) |
| Security headers | `helmet` (+ optional CSP when serving SPA from same server) (`server/server.js`) |
| CORS restriction | Configurable `FRONTEND_URL` (comma-separated) (`server/server.js`) |
| Body size limit | `express.json` / `urlencoded` limit `1mb` (`server/server.js`) |
| HTTPS behind proxy | Redirect when `x-forwarded-proto !== 'https'` in production (`server/server.js`) |
| Env-based secrets | `DATABASE_URL`, `JWT_SECRET`, email creds (`server/.env.example`) |
| Frontend token handling | Bearer header via Axios interceptor; 401 clears token and redirects to `/login` (`src/services/api.js`) |

---

## 10. Project structure

### Tree (~2–3 levels)

```
TurfNow/
├── package.json              # Root: Vite SPA, concurrent dev scripts
├── vite.config.js            # Proxy, build, Vitest
├── .env.example              # VITE_API_URL
├── README.md
├── PROJECT_DOCUMENTATION.md  # This file
├── build/                    # Vite production output (generated)
├── public/
├── server/
│   ├── package.json
│   ├── server.js             # Express app entry
│   ├── .env.example
│   ├── config/
│   │   ├── db.js             # pg Pool + query()
│   │   ├── jwt.js            # getJwtSecret()
│   │   └── constants.js      # ALLOWED_SPORTS, BOOKING_STATUSES
│   ├── db/
│   │   ├── schema.postgres.sql
│   │   └── schema.sql
│   ├── middleware/
│   │   ├── auth.js           # verifyToken, isAdmin, isOwner
│   │   └── sanitize.js
│   ├── routes/
│   │   ├── auth.js, turfs.js, bookings.js, reviews.js, admin.js, owners.js
│   ├── services/
│   │   └── email.js          # nodemailer + templates
│   ├── scripts/
│   │   └── seedData.js
│   └── __tests__/            # Jest tests
├── src/
│   ├── index.js              # React entry
│   ├── App.js                # ErrorBoundary + AllRoutes
│   ├── routes/
│   │   └── AllRoutes.jsx     # Lazy pages, auth providers, guards
│   ├── context/
│   │   └── Authcontext.js    # login/signup/me, localStorage token
│   ├── services/
│   │   └── api.js            # Axios + turf/booking/review/admin/owner APIs
│   ├── components/           # UI, ProtectedRoute, Admin*, Owner*, etc.
│   ├── pages/                # Home, Login, TurfzListing, Bookings, dashboards, …
│   ├── style/                # CSS
│   └── test/                 # Vitest setup + tests
└── .eslintrc.json
```

### Folder purposes

- **`src/`:** React UI, routing, auth context, API client, pages, and styles.
- **`server/`:** Express API, DB access, middleware, route handlers, email, seed script, Jest tests.
- **`server/db/`:** Authoritative SQL schema for Postgres.
- **`public/`:** Static assets for the SPA (e.g. `manifest.json`).
- **Root `package.json` + `vite.config.js`:** Frontend toolchain; proxy ties dev UI to API.
