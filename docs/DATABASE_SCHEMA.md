# Database Schema

Two adapters implement the same data contract (`app/src/data/types.ts`):

| Adapter | Status | Where |
|---|---|---|
| Local (browser `localStorage`, namespaced per user id) | **Implemented** — used by the current preview | `app/src/data/storage.ts` |
| PostgreSQL with row-level security (e.g. Supabase) | Specified below — Phase 3 of the roadmap | `docs/schema.sql` |

All money is stored as **integer minor units** (`bigint`, 1/100 of the unit) together with an ISO-4217 currency code.

## Entity relationship
```
auth.users 1─1 profiles
profiles   1─* wallets
profiles   1─* categories (user-defined; built-ins are seeded per user)
profiles   1─* transactions *─1 wallets (wallet_id)
                            *─1 wallets (to_wallet_id, transfers only)
                            *─1 categories (income/expense only)
profiles   1─* budgets *─1 categories
profiles   1─* exchange_rates
profiles   1─* notification_reads
profiles   1─* export_jobs        (audit of generated exports, optional)
```

## Tables

### profiles  *(new fields for user identity)*
| Column | Type | Notes |
|---|---|---|
| user_id | uuid PK, FK auth.users | |
| full_name | text not null | 1–80 chars |
| display_name | text | preferred name for greeting; nullable |
| avatar_path | text | storage object key in private bucket `avatars/{user_id}/…`; null → initials avatar |
| phone, country | text | |
| date_of_birth | date | |
| preferred_currency | char(3) not null default 'IDR' | |
| language | text not null default 'id' check in ('id','en') | |
| theme | text default 'system' check in ('system','light','dark') | |
| week_starts_on | smallint default 1 check in (0,1) | |
| budget_alerts | boolean default true | |
| created_at, updated_at | timestamptz | |

### wallets
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK profiles | |
| name | text not null | |
| type | text check in ('cash','bank','ewallet','credit','savings','investment') | |
| currency | char(3) not null | immutable after creation |
| initial_balance | bigint not null default 0 | minor units |
| color | text | |
| archived | boolean default false | |
| created_at | timestamptz | |

### categories
id, user_id, key (built-in i18n key, nullable), name (custom), type ('income'|'expense'), color.
Unique (user_id, key).

### transactions
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | the "Transaction ID" exported to Excel |
| user_id | uuid FK | |
| type | text check in ('income','expense','transfer') | |
| wallet_id | uuid FK wallets | source for transfers |
| to_wallet_id | uuid FK wallets | transfers only; must differ from wallet_id |
| category_id | uuid FK categories | required for income/expense, null for transfers |
| amount | bigint check (amount > 0) | in wallet currency |
| to_amount | bigint | transfers only; in destination currency |
| occurred_at | timestamp (local, no tz) | user's local date/time as entered |
| description | text | |
| notes | text | |
| client_ref | uuid | idempotency key → **unique (user_id, client_ref)** prevents duplicate inserts on retry |
| created_at, deleted_at | timestamptz | soft delete |

Check constraints enforce the type-specific columns (see SQL). Index `(user_id, occurred_at)`.

### budgets
id, user_id, category_id, amount (bigint, monthly), currency, created_at. Unique (user_id, category_id).

### exchange_rates
user_id, code char(3), rate numeric(20,8) > 0 — "1 code = rate × preferred currency". PK (user_id, code).

### notification_reads
user_id, notification_key text, read_at. PK (user_id, notification_key).

### export_jobs *(optional audit)*
id, user_id, created_at, format, options jsonb (range/type/category/wallet/currency), row_count, status
('success'|'error'). The file itself is generated client-side and never stored server-side by default.

## Authorization
- Every table has `user_id` and RLS policies `user_id = auth.uid()` for select/insert/update/delete.
- Transactions additionally check that referenced wallets/categories belong to the same user (trigger).
- Avatars live in a private storage bucket; policy restricts objects to the `{auth.uid()}/` prefix; served via signed URLs.
- Export reads only through the user's authenticated session, so RLS guarantees only authorised rows are exported.
  The client builder additionally filters by `userId` (defence in depth, covered by a unit test).

## Key queries
- **Opening balance** for wallet W at date D: `initial_balance + Σ effect(W, t) for t.occurred_at < D`, where
  effect = +amount (income), −amount (expense), −amount (transfer out), +to_amount (transfer in).
- **Closing balance** = opening + inflow − outflow within [from, to].
- **Income/expense totals**: `WHERE type IN ('income','expense')` grouped by wallet currency — transfers excluded.
