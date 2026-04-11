# TurfNow

Sports turf booking: React (Vite) + Chakra UI frontend, Express API, SQLite + JWT auth. Payments are cash at the venue.

## Stack

- **Frontend:** React 18, Vite, Chakra UI, React Router, Axios
- **Backend:** Node.js 22+, Express, built-in `node:sqlite`, `jsonwebtoken`, `bcryptjs`
- **Database:** SQLite — schema in `server/db/schema.sql` (created automatically on first API start)

## Setup

1. **Install**

   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Environment**

   - **Root:** copy `.env.example` → `.env`. Use `VITE_API_URL=/api` so Vite proxies API calls to the backend (see `vite.config.js`).
   - **`server/`:** copy `server/.env.example` → `server/.env`. Set `JWT_SECRET` (long random string) and `FRONTEND_URL=http://localhost:3001`. The API needs **Node.js 22.5+** (`node:sqlite`).

3. **Optional sample turfs**

   ```bash
   cd server && npm run seed && cd ..
   ```

4. **Run**

   ```bash
   npm run dev:all
   ```

   Open **http://localhost:3001**. API: **http://localhost:5000** (browser uses **`/api`** via the proxy).

   The **first** user who signs up is an **admin** (bootstrap). Add more admins from the admin dashboard if needed.

**Separate terminals:** `cd server && npm run dev` and `npm run dev`.

## Production build

- Frontend: `npm run build` → output in `build/`. Point `VITE_API_URL` at wherever your API is served (same origin, or full URL with CORS allowed in `FRONTEND_URL` on the server).
- API: `cd server && npm start` (set `NODE_ENV=production`, `JWT_SECRET`, and comma-separated `FRONTEND_URL` origins as needed).

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev:all` | API (5000) + Vite (3001) |
| `npm run dev` | Vite only |
| `npm run build` | Production build → `build/` |
| `npm test` | Vitest (frontend) |
| `cd server && npm test` | Jest (API) |
