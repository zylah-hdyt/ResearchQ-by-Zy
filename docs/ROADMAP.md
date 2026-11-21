# Development Roadmap

> Product name is final: **MyFi**. Logo and visual identity stay **pending** until Phase 5.

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundation: React/TS/Vite, design tokens (light/dark), bilingual i18n (ID/EN), domain model in minor units | ✅ Done |
| 1 | Core finance: wallets (multi-currency), transactions (income/expense/transfer, cross-currency), budgets, reports, dashboard | ✅ Done |
| 2 | **User identity**: auth, profile (full/display name, photo upload, initials avatar, personal info), preferences (currency, language, theme), personalized dashboard greeting in the required 7-section hierarchy, notifications | ✅ Done |
| 2 | **Excel export**: export button on Transactions / Reports / Wallets / Budgets, options → preview → generate → download/share, 6-sheet professional workbook, CSV, financial-rule tests | ✅ Done |
| 3 | **Supabase (free)**: Postgres schema + RLS, email/password auth with confirmation, profile auto-creation, cross-device sync, optimistic writes with rollback, isolation tested with two accounts | ✅ Done |
| 3 | Auth extras: forgot/reset password, Google sign-in, custom SMTP, avatar storage bucket, offline cache | ⏳ Next |
| 3 | Export hardening: Web Worker generation for > 20k rows | ⏳ Next |
| 3 | **Netlify (free)** deployment with `netlify.toml` | ✅ Config ready |
| 4 | Product depth: recurring transactions, custom categories UI, live FX rates (opt-in), receipt attachments, data import (CSV/XLSX), PWA install & offline | 🔜 Planned |
| 4 | Quality: E2E suite in CI (Playwright), accessibility audit (WCAG 2.2 AA), performance budget, error monitoring | 🔜 Planned |
| 5 | **Branding stage**: logo, colour refinement, favicon/app icons, marketing site, store listings (name **MyFi** already decided) | 🕓 Pending |

## Acceptance checklist for this update
- [x] Greeting from local time, name from the authenticated profile (no hardcoded demo text)
- [x] Avatar photo upload and automatic initials avatar
- [x] Profile access and notification access in the dashboard header
- [x] Dashboard order: greeting → balance → income/expense → cashflow → budgets → recent → insights
- [x] Identity consistent across Dashboard, Profile, Account settings
- [x] Export on all four pages; options for range, type, category, wallet, currency, format
- [x] Six sheets with formatting (widths, bold headers, currency/date formats, red negatives, frozen headers, filters, conditional formatting, totals)
- [x] Financial rules 1–8 implemented and unit-tested
- [x] Loading / success / error states; mobile share/save
- [x] Full Indonesian and English UI and workbook
- [x] Server adapter: Supabase (Phase 3)
