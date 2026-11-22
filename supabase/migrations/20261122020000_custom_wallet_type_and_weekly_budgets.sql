-- Additive only: existing rows stay valid.
-- 1) Allow a custom ("other") wallet type.
alter table public.wallets drop constraint wallets_type_check;
alter table public.wallets add constraint wallets_type_check
  check (type in ('cash','bank','ewallet','credit','savings','investment','other'));

-- 2) Budgets can be monthly (default, as before) or weekly; one of each per category.
alter table public.budgets add column period text not null default 'monthly' check (period in ('monthly','weekly'));
alter table public.budgets drop constraint budgets_user_id_category_id_key;
alter table public.budgets add constraint budgets_user_category_period_key unique (user_id, category_id, period);
