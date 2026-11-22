# Database Schema

Hosted on **Supabase** (free plan): Postgres + Auth + row-level security. The applied schema lives in
[`supabase/migrations/20261121000000_initial_finance_schema.sql`](../supabase/migrations/20261121000000_initial_finance_schema.sql).

The app has two interchangeable backends behind the same interfaces (`data/backend.ts`, `auth/backend.ts`):

| Backend | When | Where |
|---|---|---|
| **Supabase (cloud)** | `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set (Netlify build, `.env.local`) | `data/supabaseBackend.ts`, `auth/supabaseBackend.ts` |
| Local (browser storage) | variables absent — local development, demos | `data/localBackend.ts`, `auth/localBackend.ts` |

All money is stored as **integer minor units** (`bigint`, 1/100) with an ISO-4217 code.

## Tables
| Table | Key | Notes |
|---|---|---|
| `profiles` | `user_id` → `auth.users` | full name, display name, avatar (resized 256px JPEG data URL, ≤ 300 kB), phone, country, DOB, preferred currency, language, theme, week start, budget alerts. Created automatically by a trigger at sign-up from the sign-up metadata. |
| `wallets` | `(user_id, id)` | name, type, currency (fixed), initial balance, colour, archived |
| `categories` | `(user_id, id)` | 17 built-ins seeded per user at sign-up (`key` is translated in the app); `name` for custom ones |
| `transactions` | `(user_id, id)` | income / expense / transfer; `to_wallet_id` + `to_amount` for transfers; check constraints enforce the per-type shape; amount > 0 |
| `budgets` | `(user_id, id)`, unique `(user_id, category_id)` | monthly limit and currency |
| `exchange_rates` | `(user_id, code)` | 1 `code` = `rate` × preferred currency |
| `notification_reads` | `(user_id, notification_key)` | read state of derived notifications |

## Authorization (verified)
- RLS is enabled on every table with one policy: `user_id = auth.uid()` for the `authenticated` role. Anonymous requests see nothing and cannot write.
- **Composite foreign keys** `(user_id, wallet_id) → wallets(user_id, id)` (same for categories) make it impossible for a row to reference another user's wallet or category — no trigger needed.
- Trigger functions (`handle_new_user`, `seed_default_categories`) are `SECURITY DEFINER` with an empty `search_path` and **not executable through the API**.
- Tested against the live project with two accounts: user B read 0 of A's rows; inserting/updating/deleting A's rows was rejected by RLS; a transaction pointing at A's wallet was rejected by the foreign key; anonymous reads returned nothing and anonymous writes returned 401.
- The publishable (anon) key is safe in the browser; the secret/service-role key is never used by the app.

## How writes work
The UI updates instantly (optimistic), then `supabaseBackend.save(prev, next)` computes a diff by id and sends only the changes
in foreign-key-safe order (delete transactions → budgets → wallets; upsert wallets → transactions → budgets). Writes are queued so they
apply in order. If a save fails, the app shows a message and reloads the server state. Reads are paged (1000 rows per request) so large
histories load completely.

## Key calculations
- **Opening balance** for wallet W at date D = `initial_balance + Σ effect(W, t)` for transactions before D (income +amount, expense −amount, transfer out −amount, transfer in +to_amount).
- **Closing balance** = opening + inflow − outflow within the range.
- **Income/expense totals** exclude transfers and are grouped by currency.

## Operational notes (free plan)
- Email confirmation is required at sign-up (Supabase default); the built-in mailer is rate-limited. Configure custom SMTP in the dashboard for production volumes.
- The free project pauses after 7 days of inactivity (data kept; resume with one click). No automatic backups — users can export to Excel.
