# MyFi — My Financial

Bilingual (Bahasa Indonesia / English) personal finance web app with a personalized dashboard,
multi-currency wallets, budgets, analytics, and professional Excel (.xlsx) export.

> Name: **MyFi** (My Financial). Logo and visual identity are still pending — the current icon is a placeholder.
> Developed by Zy.

## Run
```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm test           # finance + export unit tests
npm run build      # production build in app/dist
```
Create an account, then use **Load sample data** on the dashboard to explore.

## Backend: Supabase (free)
Accounts and data are stored in Supabase (Postgres + Auth, row-level security). The schema is in
`supabase/migrations/`. The app connects when `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set
(already set for Netlify in `netlify.toml`; for local dev copy `app/.env.example` to `app/.env.local`).
Without them the app falls back to browser-only storage.
New accounts must confirm their email (Supabase default). To skip this while testing:
Supabase dashboard → Authentication → Sign In / Providers → Email → turn off **Confirm email**.

## Deploy to Netlify (free)
`netlify.toml` is already configured (base `app`, build `npm run build`, publish `dist`, Supabase variables).
1. Sign in at netlify.com with GitHub → **Add new site → Import an existing project**.
2. Pick this repository and the branch to deploy → **Deploy**. No settings need to be changed.
3. Every push to that branch redeploys automatically.

## Documentation
- [Product Requirements](docs/PRD.md)
- [Information Architecture](docs/INFORMATION_ARCHITECTURE.md)
- [User Flows](docs/USER_FLOWS.md)
- [Database Schema](docs/DATABASE_SCHEMA.md) · [SQL migration](supabase/migrations/20261121000000_initial_finance_schema.sql)
- [Component Architecture](docs/COMPONENT_ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)

