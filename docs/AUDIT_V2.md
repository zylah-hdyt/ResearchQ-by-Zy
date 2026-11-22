# MyFi — Product & UI/UX audit (v2)

Method: read the whole codebase (≈5 500 lines, 60 files), rendered every screen on an iPhone 13 viewport (390 px) and a 1440 px desktop with realistic sample data, ran invariant tests on random data, and benchmarked the calculations. Skills used: `ui-ux-pro-max` (installed from upstream, MIT) for UX rules and the pre-delivery checklist, and `dataviz` for charts. No Antislop / accessibility / testing skill exists in this account.

## 1. What already works (kept, not rebuilt)
Auth (Supabase email + local fallback, consent, deletion), profile and identity, wallets (multi-currency, archive), income / expense / transfer (including cross-currency), monthly budgets, notifications, reports, 6-sheet Excel export + CSV, ID/EN, light/dark, RLS-isolated data with optimistic writes, Terms/Privacy.

## 2. Financial logic — verified
| Check | Result |
|---|---|
| Σ wallet balances = Σ initial + income − expense (transfers neutral), 30 random datasets × 400 tx | **0 violations** |
| Closing balance of a period = balance before the next day | **0 violations** |
| Period income total = independent recomputation | **0 violations** |
| Performance: dashboard computations | 2.3 ms @ 1 000 tx, **16 ms @ 20 000 tx** |

No calculation bugs found. Gaps are missing features, listed below.

## 3. Findings (rendered, not guessed)
| # | Area | Finding | Impact |
|---|---|---|---|
| 1 | Dashboard (mobile) | Summary is 3 stacked cards; page is 2 200 px tall; chart is fixed to "6 months"; no range filter | High |
| 2 | Dashboard | Hero is a gradient card; no way to hide the balance; floating "+" button floats over content | High |
| 3 | Transactions | A 6-control filter panel fills the whole first screen; list rows have no category icons; no totals for the filtered result; no detail view, no duplicate; delete uses the browser's `confirm()` | High |
| 4 | Wallets | One large card per wallet, no grouping or net worth, no per-wallet history, no way to start a transfer from a wallet, no custom account type | High |
| 5 | Budgets | Monthly only (setting "week starts on" is saved but used nowhere), no pace/projection, no history, no total budget view; previous/next buttons have English-only labels | High |
| 6 | Reports | Three stacked stat cards, no saving rate, no net worth, no period comparison, no month-by-month table; the wallet movement table scrolls sideways on phones | High |
| 7 | Settings / Profile | Identity card cramped: name wraps on 4 lines at 390 px | Medium |
| 8 | Design system | Visual rules are spread across ad-hoc CSS; many boxed cards and a gradient hero; type scale and spacing not tokenised | Medium |
| 9 | Quality | Native `confirm()` dialogs (3 places); delete has no undo | Medium |
| 10 | Net worth | Archived wallets silently drop out of the total balance | Low (documented) |

Not found: horizontal overflow on any phone screen, console errors, duplicated transactions.

## 4. Plan (phases, each tested on a phone viewport before the next)
1. **Audit** (this document).
2. **Design system:** tokens (neutral surfaces, refined teal ramp, type scale, 4/8 spacing, radii), flat hero (no gradient), fewer boxes (hairline sections), shared components (segmented control, sheet, chips, list rows, icon tiles), system font stack.
3. **Dashboard:** hero with balance toggle, 7D/1M/3M/6M/1Y filter driving summary + chart (accurate buckets, like-for-like comparison), compact summary, no floating button (quick-add moves into the header), desktop two-column layout.
4. **Transactions:** compact search + filter sheet with removable chips, totals strip, date groups with daily net, category icons, detail panel/sheet, edit / duplicate / delete-with-undo, export.
5. **Wallets & budgets:** grouped wallets with net worth, per-wallet history and balance trend, start transfers; weekly + monthly budgets, pace, history, budget vs actual.
6. **Analytics:** KPI strip with deltas, saving rate, net-worth trend, monthly comparison table, breakdowns vs previous period, written summary.
7. **Verification:** financial accuracy tests (buckets, filters, budgets, net worth, duplicates, export vs dashboard), iPhone/desktop/dark screenshots, accessibility pass.

Prepared, not built: savings goals, subscriptions, calendar, smart insights engine hooks, receipt OCR, multi-currency groundwork — see `docs/FEATURE_ARCHITECTURE.md`.

## 5. Results (22 Nov 2026)
All seven phases are implemented and were tested in a browser on an iPhone 13 viewport (390 / 360 / 320 px), a 1440 px desktop and in dark mode.

| Check | Result |
|---|---|
| Unit tests | 77 pass (periods, filters, budgets, wallets, analytics, finance, export, money, legal) |
| Dashboard ranges 7D/1M/3M/6M/1Y: income, expense, net, deltas vs independent recomputation from stored data | pass |
| Transactions: search, filters, totals, grouping, duplicate / undo keep balances exact, no duplicated rows | pass |
| Wallets: net worth, balances, running balance, 3M money in/out, transfer (one transaction, net worth unchanged), archive / restore | pass |
| Budgets: monthly and weekly spent vs independent sums, previous periods, 6-month history, duplicate guard, "see transactions" | pass |
| Analytics: KPIs, saving rate, deltas, written summary, category comparison, 6-month table, net-worth trend end = Σ balances | pass |
| Excel export vs screen (Reports, 3 months): income 66 024 000, expense 29 198 000, net 36 826 000, 81 unique rows, closing balances = wallet balances | pass |
| No horizontal overflow at 390 / 360 / 320 px on dashboard, transactions, wallets, wallet detail, budgets, reports | pass |
| Touch targets ≥ 40 px on those screens; console errors | none |

Defects found by this testing and fixed: opening-balance field put typed digits before a leading "0" (Rp 1,5 jt became Rp 15 jt); budget summary overflowed at 320 px; chart "view as table" button was 34 px tall; "this month" was compared with an unaligned previous window (rent showed as "new"), now compared with the same stretch of the previous month.

Known limits: the dashboard budget overview shows the four highest-usage budgets (a weekly budget with low usage may not appear); a screen-reader pass with real assistive technology was not done; Supabase mode was exercised earlier (two-account isolation) but this round of UI tests ran in local-storage mode.
