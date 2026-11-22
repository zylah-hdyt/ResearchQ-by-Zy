# Product Requirements Document — MyFi (My Financial)

> **Branding status:** name **MyFi** (*My Financial*) and the **"Flow M" logo** are chosen (see `BRAND.md`). Author credit "Developed by Zy" is shown
> on the sign-in page, the sidebar and Account settings → About. Still pending: trademark/domain/store availability checks and marketing material.

## 1. Purpose
A bilingual (Bahasa Indonesia / English) web app that helps individuals track income, expenses,
transfers, budgets and multiple wallets/accounts, understand their cashflow, and export their
financial data to professionally formatted Microsoft Excel workbooks.

## 2. Target users
- Individuals in Indonesia and abroad managing personal money across bank accounts, cash and e-wallets.
- Users holding more than one currency (e.g. IDR + USD savings).
- Users who need their records in Excel for tax, reimbursement, or personal analysis.

## 3. Languages
| Requirement | Detail |
|---|---|
| Supported languages | Bahasa Indonesia (`id`), English (`en`) |
| Default | **Indonesian for everyone** (also on the sign-in page); switch to English any time — before sign-in, in the account menu, or in Settings |
| Per user | Stored in the profile (`language`), applied instantly across UI, number/date formats, and Excel exports |
| Coverage | Every UI string, category names, greetings, notifications, export dialog and **Excel sheet names, headers and notes** |

## 4. Functional requirements

### 4.1 Authentication & profile (NEW)
- Sign up (full name, email, password ≥ 8 chars), sign in, sign out.
- Profile fields: full name, preferred display name, profile photo, email (read-only), phone, country, date of birth.
- Preferences: preferred currency (**Rupiah by default**), language (Indonesian by default), appearance (**light by default**, dark, or follow system), week start, budget alerts, exchange rates, change password.
- **Rupiah first:** Rupiah is always written "Rp 1.250.000" in both languages; amount fields group digits live ("1.250.000") and accept either separator style.
- **Themes:** two themes, light and dark, switchable in one tap (sign-in page, dashboard header, top bar, account menu).
- **Account menu** (⋮ or avatar) on every page: Profile, Settings, language, theme, **Sign out** — reachable on phones.
- Profile photo upload: images ≤ 8 MB, centre-cropped and resized to 256×256 JPEG.
- **Initials avatar** when no photo: up to two initials from the full name, deterministic calm background colour.

### 4.2 Personalized dashboard (NEW)
Hierarchy (top → bottom), each section in this exact order:
1. **Greeting & identity** — greeting from local time, display name, avatar/initials (links to profile), notification bell.
2. **Total balance** — all active wallets converted to the preferred currency.
3. **Income & expense summary** — this month: income, expenses, net cashflow.
4. **Cashflow visualization** — last 6 months, income vs expense bars.
5. **Budget overview** — top budgets by utilisation with progress bars.
6. **Recent transactions** — latest 6.
7. **Financial insights** — top category, month-over-month change, savings rate, exceeded budgets.

Greeting rules:
| Local time | English | Indonesian |
|---|---|---|
| 05:00–11:59 | Good morning, {name} | Selamat pagi, {name} |
| 12:00–16:59 | Good afternoon, {name} | Selamat siang, {name} |
| 17:00–20:59 | Good evening, {name} | Selamat sore, {name} |
| 21:00–04:59 | Good night, {name} | Selamat malam, {name} |

- `{name}` = preferred display name → first word of full name → email local part. **Never hardcoded.**
- Subtitle: "Here's your financial overview." / "Berikut ringkasan keuangan Anda."
- Typography: 1.3rem desktop / 1.12rem mobile, weight 600 — natural and unobtrusive; the balance figure remains the visual focus.
- Updates every minute (crossing 12:00 changes the greeting without reload).

### 4.3 Identity consistency
The same `Avatar` component and name rules are used on: dashboard greeting, top bar profile chip,
Profile page identity card, Account Settings identity card.

### 4.4 Wallets & accounts
Types: cash, bank, e-wallet, credit card, savings, investment. Each wallet has one currency, a starting
balance, colour and archive flag. Wallets with transactions cannot be deleted (archive instead).

### 4.5 Transactions
Types: income, expense, transfer. Transfers have source and destination wallets; cross-currency
transfers record both the sent and received amounts. Search and filter by period, type, wallet, category.

### 4.6 Budgets
Monthly limit per expense category, in any currency. Status: on track (< 80%), near limit (80–100%), exceeded (> 100%).

### 4.7 Analytics & reports
Period picker, income/expense/net totals, cashflow chart, spending and income by category, wallet movement
(opening, inflow, outflow, closing).

### 4.8 Notifications
In-app, derived from data: budget ≥ 80% and budget exceeded (current month, if enabled), welcome prompt
when no wallets exist. Unread badge, mark-as-read, mark-all-as-read.

### 4.9 Excel export (NEW — mandatory core feature)
**Entry points:** Transactions, Analytics & Reports, Wallets & Accounts, Budgets — a single
"Export" button with a download icon in each page header (no extra clutter). Each entry point
pre-fills sensible defaults (e.g. Transactions passes its current filters; Budgets passes the month).

**Options:** date range (presets + custom), transaction type (All/Income/Expense/Transfer), category,
wallet/account, currency (original currencies, or convert to a chosen currency), format (XLSX; CSV for
transactions only).

**Flow:** Export → choose data → preview summary (period, count, totals per currency, sheets, warnings)
→ generate (loading state) → download `.xlsx` (success state; error state with retry).
On mobile, the success screen offers **Share / save** through the native share sheet (Web Share API Level 2:
Files, Drive, WhatsApp, email…) with a download fallback.

**Workbook structure** (sheet names localised):
| # | Sheet (EN / ID) | Contents |
|---|---|---|
| 1 | Financial Summary / Ringkasan Keuangan | Owner, period, generation time, currency mode, filters; per-currency total income, total expenses, net cashflow, opening and closing balance; category summary (amount, count, share with data bars); account balances (opening, inflow, outflow, closing); explanatory notes |
| 2 | All Transactions / Semua Transaksi | Transaction ID, Date, Time, Description, Transaction Type, Category, Account, Amount, Currency, Notes; per-currency net cashflow formulas |
| 3 | Income / Pemasukan | Date, Description, Income Category, Account, Amount, Currency, Notes; per-currency totals |
| 4 | Expenses / Pengeluaran | Date, Description, Expense Category, Account, Amount, Currency, Notes; per-currency totals |
| 5 | Transfers / Transfer | Date, Source Account, Destination Account, Amount, Currency, Amount Received, Received Currency, Notes |
| 6 | Budget Report / Laporan Anggaran | Category, Budget Amount, Actual Spending, Remaining Budget (formula), Utilization (formula), Budget Status, Currency; totals |

> A Currency column is added to Income/Expenses and a received-amount column to Transfers because
> rule 6 (no mixing currencies) cannot be honoured without them.

**Formatting:** column widths per column, bold white-on-dark headers, Calibri 10/11 throughout,
currency formats with symbol per row's currency (`"Rp "#,##0;[Red]-"Rp "#,##0`), dates as real Excel dates
(`dd/mm/yyyy` ID, `yyyy-mm-dd` EN), time as Excel time, negatives in red, frozen header rows, auto filters,
zebra banding, conditional formatting (budget rows red/amber by status, utilisation and category-share
data bars), summary totals (`SUMIFS` per currency with cached results), landscape fit-to-width print setup.

**Financial rules (enforced in `app/src/export/dataset.ts`, covered by tests):**
1. Transfers are excluded from income and expense totals.
2. Duplicate transactions (same ID) are removed.
3. Only transactions with date within the inclusive range are included.
4. Amounts are stored as integer minor units — no floating point drift.
5. Each amount carries its currency; totals are per currency.
6. Different currencies are never summed without conversion; missing rates are reported, not guessed.
7. Opening balance = starting balance + all movements before the range; closing = opening + inflow − outflow
   (transfers included per wallet). Balances are shown only when the type and category filters are "All".
8. Files are generated with **ExcelJS 4.4** (styles, freeze panes, filters, conditional formatting), loaded lazily.

**Authorization:** the dataset builder filters every record by the authenticated `userId`; the server
version enforces the same with row-level security (see `DATABASE_SCHEMA.md`). Raw database structures
are never exported — only labelled, user-facing columns.

## 5. Non-functional requirements
- Responsive from 320 px; bottom navigation and floating add button on mobile; bottom-sheet dialogs.
- Light and dark themes.
- Accessibility: labelled controls, `role="dialog"`, Esc closes dialogs, live regions for export state.
- Performance: ExcelJS (~270 kB gzip) is code-split and only loaded when exporting.
- Privacy: passwords hashed (PBKDF2-SHA256, 150k iterations) in the local adapter; server adapter uses managed auth.

## 6. Out of scope (this iteration)
Bank sync, recurring transactions, shared/family accounts, live FX rates, receipt scanning, final branding.

## 7. Success metrics
- ≥ 90% of exports complete without error; export time < 3 s for 10k transactions.
- Dashboard first meaningful paint < 1.5 s on mid-range mobile.
- ≥ 60% of new users set a display name or photo in week 1.
