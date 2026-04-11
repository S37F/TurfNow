# TurfNow

Sports turf booking: React (Vite) + Chakra UI frontend, Express API, Supabase (Postgres + Auth). Payments are cash at the venue.

## Stack

- **Frontend:** React 18, Vite, Chakra UI, React Router, Supabase JS  
- **Backend:** Node.js, Express, `pg`, Supabase service role (JWT verify + admin user APIs)  
- **Database:** Supabase Postgres (see `supabase/migrations/`)

## Local setup

```bash
npm install
cd server && npm install && cd ..
```

- Root `.env` — copy `.env.example` (`VITE_SUPABASE_*`, `VITE_API_URL`).  
- `server/.env` — copy `server/.env.example` (`DATABASE_URL`, `SUPABASE_*`, `FRONTEND_URL`, optional email).

Apply `supabase/migrations/001_initial.sql` in the Supabase SQL editor.

```bash
# Terminal 1 — API (default :5000)
cd server && npm run dev

# Terminal 2 — UI (default :3001)
npm run dev
```

Optional sample data: `cd server && npm run seed` (needs `DATABASE_URL`).

## Deploy

- **Frontend:** Vercel — root `vercel.json`, set `VITE_*` env vars.  
- **API:** Railway — service root `server/`, `railway.toml`, set vars from `server/.env.example`.  
- **DB + auth:** Supabase project.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build → `build/` |
| `npm test` | Vitest (frontend) |
| `cd server && npm test` | Jest (API) |
