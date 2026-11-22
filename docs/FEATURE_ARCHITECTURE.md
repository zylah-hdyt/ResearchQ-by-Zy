# Feature architecture: prepared modules

Status: **designed, not built.** `app/src/lib/features.ts` holds one flag per module (all `false`) and
`app/src/data/future.ts` holds the type shapes. No route, menu entry, table or migration exists for them yet.
Multi-currency is already part of the core (wallet currency, rates, per-currency totals) and needs no preparation.

## Principles every module follows
1. Money is an integer in minor units with a currency code. Totals convert to the profile currency only through the
   existing `convert`/`collapse` helpers, and anything without a rate is reported, never guessed.
2. One owner column `user_id` with the same RLS policy as the existing tables (`user_id = auth.uid()`) and composite
   foreign keys `(user_id, id)`, so a row can never point at another user's data.
3. Derive before you store. Whatever can be computed from transactions (goal progress from a wallet, calendar entries
   from subscriptions and budgets) is computed, so there is no second copy to drift.
4. A module appears in the UI only when its flag is on. Pages are lazy-loaded.
5. Each module ships with unit tests against an independent recomputation, as the core does.

## Savings Goals
- Data: `savings_goals`, `goal_contributions` (types `SavingsGoal`, `GoalContribution`).
- Progress: the linked wallet's balance if `walletId` is set, otherwise Σ contributions. A contribution created from a
  transfer stores `transaction_id` so it is counted once.
- UI: goal cards with a progress meter (same `Meter` pattern as budgets), "needed per month to hit the date",
  contribute action that opens the existing transfer form.
- Dashboard hook: one optional card, hidden when there are no goals.

## Subscription Tracker
- Data: `subscriptions` (type `Subscription`); `next_due_at` advances by the billing cycle when a matching expense is
  recorded or the user marks it paid.
- Derived: monthly-equivalent cost (weekly ×52/12, quarterly ÷3, yearly ÷12), upcoming charges in the next 30 days.
- Detection of recurring expenses from history is a suggestion only; the user confirms.

## Financial Calendar
- No table of its own for derived items. `CalendarEvent[]` is assembled from subscriptions (next due), goals
  (deadlines), budget period resets, plus a small `calendar_events` table for custom reminders.
- Notifications reuse `lib/notifications.ts` (read state already stored per user).

## Smart Insights
- Pure functions over the existing data, next to `buildInsights` in the dashboard: month-over-month category jumps,
  budget pace warnings, saving-rate trend, unusual single expenses (above a robust threshold of the category history).
- Rule based and explainable: each insight states the numbers it used. No data leaves the browser or database.

## Receipt OCR
- Flow: upload photo, parse to a `ReceiptScan` suggestion, the user reviews and confirms, then a normal transaction is
  created. The suggestion never writes a transaction on its own.
- Storage: Supabase Storage bucket `receipts` (private, path `user_id/…`, policy on the first folder segment).
- Parsing options, in order of preference: on-device (Tesseract.js, free, lower accuracy) or an Edge Function calling a
  vision model. The second one sends the image to a third party and needs explicit consent text and a cost limit, so it
  stays out until the owner decides.

## Proposed schema (NOT applied; for review before any migration is written)
```sql
create table savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  currency text not null,
  target_amount bigint not null check (target_amount > 0),
  target_date date,
  wallet_id uuid,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, wallet_id) references wallets (user_id, id) on delete set null (wallet_id)
);
create table goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  amount bigint not null check (amount > 0),
  occurred_at timestamptz not null,
  transaction_id uuid,
  unique (user_id, id),
  foreign key (user_id, goal_id) references savings_goals (user_id, id) on delete cascade
);
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  amount bigint not null check (amount > 0),
  currency text not null,
  cycle text not null check (cycle in ('weekly','monthly','quarterly','yearly')),
  next_due_at date not null,
  category_id uuid, wallet_id uuid,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, id)
);
-- each table: enable row level security + the same four owner policies as `wallets`.
```
`delete_my_account()` already removes everything through `on delete cascade`, so these tables inherit account deletion.

## Order of work (suggested)
1. Subscription Tracker (smallest, feeds Calendar and Insights).
2. Savings Goals.
3. Financial Calendar (assembles 1 and 2).
4. Smart Insights.
5. Receipt OCR (needs a product and privacy decision first).
