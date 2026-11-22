# User Flows

## UF-1 First run & identity setup
1. User opens the app → Auth screen in browser language; may toggle ID/EN.
2. Create account: full name, email, password → profile created with language, and default currency
   (IDR for Indonesian, USD for English).
3. Lands on Dashboard: "Selamat pagi, Siti" (first name from the full name) + initials avatar "SR".
4. Empty state offers **Add wallet** or **Load sample data**; notification bell shows a welcome prompt.
5. Optional: tap avatar → Profile → upload photo / set display name "Siti" → greeting updates everywhere.

## UF-2 Returning user greeting
1. Sign in → Dashboard.
2. Greeting computed from device local time; refreshed every minute.
3. Name = display name ▸ first name ▸ email local part.

## UF-3 Edit profile & preferences
1. Profile: edit full name, display name, phone, country, DOB → Save → toast "Changes saved".
2. Upload photo → validated (image, ≤ 8 MB) → cropped/resized → avatar updates in greeting, top bar, settings.
3. Remove photo → initials avatar returns.
4. Settings: change language (instant), preferred currency (existing exchange rates are re-based
   automatically), theme, week start, budget alerts, exchange rates.

## UF-4 Record transactions
Add → choose Expense/Income/Transfer → amount, date/time, wallet(s), category, description, notes → Save.
Cross-currency transfer asks for the received amount.

## UF-5 Export to Excel (desktop)
1. On Transactions / Reports / Wallets / Budgets click **Export** (download icon).
2. **Choose data**: date range, type, category, wallet, currency (original or convert), format. Defaults come
   from the current page (e.g. active filters).
3. **Preview**: period, number of transactions, income/expense/net per currency, sheets, warnings
   (no matching data; missing exchange rate).
4. **Generate & download** → spinner "Generating workbook…" → file downloads automatically →
   success state with file name and "Download again".
5. Error → "Could not generate the file" + **Try again**.

## UF-6 Export on mobile
Steps 1–4 as above in a bottom sheet. On success, if the device supports file sharing the file is **not**
auto-downloaded; the user taps **Share / save** (native sheet: Save to Files, Google Drive, WhatsApp,
email) or **Download again**. Unsupported devices fall back to a normal download.

## UF-7 Budget alert
Spending crosses 80% → bell badge "Food & dining budget is at 85%"; exceeding → "…exceeded by Rp 50,000".
Tap → Budgets page; notification marked read.

## Edge cases
| Case | Behaviour |
|---|---|
| No wallets | Dashboard empty state; Add transaction disabled |
| Missing exchange rate | Amount excluded from converted totals with a visible banner; in export, kept in original currency and listed |
| Export with type/category filter | Opening/closing balances shown as "n/a" with explanatory note |
| Delete wallet with transactions | Blocked; suggest archive |
| Duplicate records | Removed on save and on export |
| Name blank | Validation error; greeting falls back to email local part |
