# Information Architecture

> Product name pending — "Finance App" is a placeholder.

## Site map
```
(Unauthenticated)
└── Auth  ─ Sign in / Create account  ─ language toggle (ID / EN)

(Authenticated)  — app shell: sidebar (desktop) / bottom nav + top bar (mobile)
├── Dashboard  (/)
│   ├── 1 Greeting & identity  [avatar → Profile] [bell → Notifications popover]
│   ├── 2 Total balance  [+ Add transaction]
│   ├── 3 Income · Expenses · Net (this month)
│   ├── 4 Cashflow (6 months)
│   ├── 5 Budget overview  [View all → Budgets]
│   ├── 6 Recent transactions  [View all → Transactions]
│   └── 7 Financial insights
├── Transactions  (/transactions)          [Export] [+ Add]
│   ├── Filters: search, period, type, wallet, category
│   └── Day-grouped list → Edit transaction dialog
├── Wallets & Accounts  (/accounts)         [Export] [+ Add wallet]
│   ├── Active wallets (balance, edit, archive)
│   └── Archived wallets
├── Budgets  (/budgets)                      [Export] [+ Add budget]
│   ├── Month switcher
│   └── Budget cards (progress, status, spent, remaining)
├── Analytics & Reports  (/reports)          [Period] [Export]
│   ├── Totals, cashflow
│   ├── Spending by category, income by category
│   └── Wallet movement table
├── Profile  (/profile)
│   ├── Identity card  [→ Account settings]
│   ├── Profile photo (upload / remove)
│   └── Personal information (full name, display name, email, phone, country, DOB)
├── Account settings  (/settings)
│   ├── Identity card  [→ Profile]
│   ├── Preferences (language, preferred currency, appearance, week start, budget alerts)
│   ├── Exchange rates
│   └── Data (delete financial data)
└── Global overlays
    ├── Notifications popover (top bar / dashboard greeting)
    ├── Export dialog (options → preview → loading → success/share | error)
    └── Transaction / Wallet / Budget dialogs
```

## Navigation
| Surface | Desktop (> 900 px) | Mobile (≤ 900 px) |
|---|---|---|
| Primary nav | Left sidebar: 5 sections + Profile, Settings, Sign out | Bottom bar: Dashboard, Transactions, Wallets, Budgets, Reports |
| Identity | Dashboard greeting; top bar profile chip (avatar + display name) on other pages | Same; chip shows avatar only |
| Notifications | Bell in greeting / top bar | Same |
| Add transaction | Header button | Floating action button |
| Export | Header "Export" button on 4 pages | Same, dialog opens as bottom sheet; success offers Share/save |

## Identity component usage
| Location | Component | Size |
|---|---|---|
| Dashboard greeting | `GreetingHeader` → `Avatar` | 48 px |
| Top bar | `ProfileChip` → `Avatar` | 34 px |
| Profile / Settings | `IdentityCard` → `Avatar` | 64 px |
| Profile photo editor | `Avatar` | 72 px |

## Content model (labels)
All labels live in `app/src/i18n/en.ts` (source of truth, typed keys) and `id.ts` (must implement every key —
enforced by TypeScript `Record<MessageKey, string>`).
