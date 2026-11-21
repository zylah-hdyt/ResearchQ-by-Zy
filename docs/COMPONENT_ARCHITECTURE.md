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
├── auth/AuthProvider.tsx         session, signIn/signUp/signOut, profile, updateProfile, greetingName(), theme
├── data/
│   ├── types.ts                  domain model (Profile, Wallet, Transaction, Budget, …)
│   ├── storage.ts                persistence adapter (localStorage, per-user namespace)
│   └── seed.ts                   built-in categories
├── store/
│   ├── DataProvider.tsx          user-scoped CRUD, dedupe on commit
│   └── sample.ts                 deterministic sample data
├── lib/                          pure, unit-tested logic
│   ├── finance.ts                balances, opening/closing, summaries, cashflow, budgets
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
│   ├── Layout.tsx                sidebar, top bar, bottom nav
│   ├── Forms.tsx                 TransactionForm, WalletForm, BudgetForm
│   ├── Charts.tsx                CashflowChart (responsive SVG), Donut
│   ├── RangePicker.tsx, Modal.tsx, Toast.tsx, Money.tsx
└── pages/                        Dashboard, Transactions, Accounts, Budgets, Reports, Profile (+IdentityCard), Settings, Auth
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
`npm test` → finance rules (transfers excluded, no currency mixing, opening/closing, conversion,
budgets, greeting, initials) and export (range, dedupe, ownership, per-currency blocks, conversion,
filters, six formatted sheets in both languages, CSV).
