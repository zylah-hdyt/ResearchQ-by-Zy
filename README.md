# Personal Finance Web App *(name pending)*

Bilingual (Bahasa Indonesia / English) personal finance web app with a personalized dashboard,
multi-currency wallets, budgets, analytics, and professional Excel (.xlsx) export.

> Branding is intentionally not final — "Finance App" is a placeholder until the branding stage.

## Run
```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm test           # finance + export unit tests
npm run build      # production build in app/dist
```
Create an account, then use **Load sample data** on the dashboard to explore.

## Deploy to Netlify (free)
`netlify.toml` is already configured (base `app`, build `npm run build`, publish `dist`).
1. Sign in at netlify.com with GitHub → **Add new site → Import an existing project**.
2. Pick this repository and the branch to deploy → **Deploy**. No settings need to be changed.
3. Every push to that branch redeploys automatically.

## Documentation
- [Product Requirements](docs/PRD.md)
- [Information Architecture](docs/INFORMATION_ARCHITECTURE.md)
- [User Flows](docs/USER_FLOWS.md)
- [Database Schema](docs/DATABASE_SCHEMA.md) · [SQL](docs/schema.sql)
- [Component Architecture](docs/COMPONENT_ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)

## Note on data storage
This preview stores accounts and data in the browser (per user, passwords hashed with PBKDF2).
The production server adapter (Postgres + row-level security) is specified in `docs/schema.sql`.
