# Component Architecture

Stack: **React 18 + TypeScript + Vite**, React Router (hash routing), ExcelJS 4.4 (lazy-loaded),
lucide-react icons, plain CSS with design tokens (light/dark), Vitest.

```
app/src
├── main.tsx / App.tsx            Router → AuthProvider → ToastProvider → Gate → DataProvider → Layout → pages
├── i18n/
│   ├── en.ts                     source dictionary (typed MessageKey)
│   ├── id.ts                     Indonesian — Record<MessageKey,string>, compile-time complete
│   └── index.tsx                 I18nProvider, useI18n(), translator(), categoryLabel(), detectLanguage()
├── auth/
│   ├── AuthProvider.tsx          session, profile, updateProfile (optimistic + rollback), greetingName(), theme
│   ├── backend.ts / index.ts     AuthBackend interface, picked from env
│   ├── supabaseBackend.ts        Supabase Auth + profiles table
│   └── localBackend.ts           browser accounts (fallback)
├── data/
│   ├── types.ts                  domain model (Profile, Wallet, Transaction, Budget, …)
│   ├── backend.ts                DataBackend interface (load / save diff)
│   ├── supabaseBackend.ts        cloud: row mapping, paging, ordered diff writes
│   ├── localBackend.ts, storage.ts   browser fallback (per-user namespace)
│   ├── index.ts                  picks backend from env
│   └── seed.ts                   built-in categories
├── store/
│   ├── DataProvider.tsx          loads from backend, optimistic CRUD, ordered write queue, dedupe
│   └── sample.ts                 deterministic sample data
├── lib/                          pure, unit-tested logic
│   ├── finance.ts                balances, opening/closing, summaries, category totals, budget lines
│   ├── periods.ts                7D/1M/3M/6M/1Y windows, buckets, flow per bucket, period totals, previous window
│   ├── analytics.ts              category breakdown/comparison, monthly comparison, calendar-aligned comparison span
│   ├── budget.ts                 monthly/weekly spans, pace and projection, history, totals
│   ├── wallets.ts                grouped overview, net worth, running balances, balance/net-worth series
│   ├── txFilter.ts               search + filters, list summary, day grouping
│   ├── chart.ts                  ticks, bar paths, % change, nice axis range
│   ├── features.ts               feature flags for prepared modules (all off)
│   ├── money.ts                  minor units, conversion (returns null when a rate is missing)
│   ├── format.ts                 Intl currency/date/time per language
│   ├── greeting.ts               dayPart(local time)
│   ├── avatar.ts                 initials, colour, image resize
│   ├── notifications.ts          derived notifications
│   ├── ranges.ts                 date range presets
│   └── password.ts               PBKDF2 hashing (local adapter)
├── export/
│   ├── dataset.ts                buildDataset(data, profile, options) — all financial rules
│   ├── workbook.ts               buildWorkbook(ExcelJS, dataset) + buildCsv()
│   ├── generate.ts               lazy import of ExcelJS, Blob creation
│   ├── share.ts                  download / Web Share API (mobile)
│   └── ExportDialog.tsx          ExportButton + 5-state dialog
├── components/
│   ├── UserIdentity.tsx          GreetingHeader, ProfileChip, NotificationBell
│   ├── Avatar.tsx                photo or initials
│   ├── Logo.tsx, Credit.tsx      MyFi mark + wordmark; "Developed by Zy"
│   ├── Layout.tsx                sidebar, top bar, bottom nav
│   ├── Forms.tsx                 TransactionForm, WalletForm, BudgetForm
│   ├── Charts.tsx                CashflowChart, TrendChart, RankedBars, Sparkline (hover + keyboard tooltips, table twin)
│   ├── Kpi.tsx, RangeTabs.tsx, SegmentBar.tsx   headline figure with delta; 7D–1Y tabs; composition bar
│   ├── QuickAdd.tsx, TxRow.tsx, TxDetail.tsx, FilterSheet.tsx, Confirm.tsx   add/edit/duplicate, rows, detail sheet, filters, confirm dialog
│   ├── Privacy.tsx               hide-balance toggle and masking
│   ├── AmountInput.tsx           live-grouped amount field
│   ├── RangePicker.tsx, Modal.tsx, Toast.tsx, Money.tsx
├── styles/                       tokens → base → components → layout → pages (+ features.css for auth, legal, charts)
└── pages/                        Dashboard, Transactions, Accounts, WalletDetail, Budgets, Reports, Profile, Settings, Auth, Legal, Consent
```

## Identity components
| Component | Responsibility | Used by |
|---|---|---|
| `Avatar` | Photo if `avatarDataUrl`, else initials on deterministic colour | everywhere |
| `GreetingHeader` | `dayPart()` + `greetingName()` + subtitle + avatar link + bell; ticks every minute | Dashboard (section 1) |
| `ProfileChip` | Avatar + display name link to Profile | Top bar |
| `IdentityCard` | Avatar, full name, email, member since | Profile, Settings |
| `NotificationBell` | Badge, popover, mark read | Greeting, top bar |

## Export pipeline
```
ExportButton(context, defaults)
  └─ ExportDialog
       options ──► buildDataset()  (pure: filter, dedupe, convert, balances, budgets)
       preview ◄── dataset summary
       generate ─► generateFile() ─► import('exceljs') + buildWorkbook() ─► Blob
       success ─► downloadBlob() | shareFile() (mobile share sheet)
       error   ─► retry
```
`buildDataset` and `buildWorkbook` are framework-free and run in Node for tests (`src/__tests__`). The same
code could run in a server/edge function for very large exports.

## State
- `AuthProvider` — profile (source of the user's name/avatar/language/currency).
- `DataProvider` — keyed by `userId` so switching users fully resets state.
- Derived data (balances, summaries, notifications) is computed with pure functions, never stored.

## Testing
`npm test` (77 tests) → periods, filters, budgets (monthly/weekly, pace), wallets (net worth, running balance), analytics (comparison spans, monthly rows), finance rules (transfers excluded, no currency mixing, opening/closing, conversion,
budgets, greeting, initials) and export (range, dedupe, ownership, per-currency blocks, conversion,
filters, six formatted sheets in both languages, CSV).
