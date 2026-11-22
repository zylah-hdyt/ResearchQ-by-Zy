-- Finance app schema (applied to the Supabase project). Money = integer minor units (1/100).
-- Every row is owned by a user and protected by RLS. Child tables use composite keys (user_id, id)
-- so a row can only ever reference rows of the same owner.

create table public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text not null default '' check (char_length(full_name) <= 80),
  display_name text not null default '' check (char_length(display_name) <= 40),
  avatar_data_url text check (avatar_data_url is null or char_length(avatar_data_url) <= 300000),
  phone text not null default '',
  country text not null default '',
  date_of_birth text not null default '',
  preferred_currency text not null default 'IDR' check (preferred_currency in ('IDR','USD','EUR','SGD','MYR','JPY','GBP','AUD')),
  language text not null default 'id' check (language in ('id','en')),
  theme text not null default 'system' check (theme in ('system','light','dark')),
  week_starts_on smallint not null default 1 check (week_starts_on in (0,1)),
  budget_alerts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wallets (
  user_id uuid not null references public.profiles on delete cascade,
  id text not null,
  name text not null check (char_length(name) between 1 and 60),
  type text not null check (type in ('cash','bank','ewallet','credit','savings','investment')),
  currency text not null check (currency in ('IDR','USD','EUR','SGD','MYR','JPY','GBP','AUD')),
  initial_balance bigint not null default 0,
  color text not null default '#1d4ed8',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.categories (
  user_id uuid not null references public.profiles on delete cascade,
  id text not null,
  key text,
  name text,
  type text not null check (type in ('income','expense')),
  color text not null default '#78716c',
  primary key (user_id, id),
  check (key is not null or name is not null)
);

create table public.transactions (
  user_id uuid not null references public.profiles on delete cascade,
  id text not null,
  type text not null check (type in ('income','expense','transfer')),
  wallet_id text not null,
  to_wallet_id text,
  category_id text,
  amount bigint not null check (amount > 0),
  to_amount bigint check (to_amount is null or to_amount > 0),
  occurred_at timestamp not null,
  description text not null default '' check (char_length(description) <= 120),
  notes text not null default '' check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, wallet_id) references public.wallets (user_id, id) on delete restrict,
  foreign key (user_id, to_wallet_id) references public.wallets (user_id, id) on delete restrict,
  foreign key (user_id, category_id) references public.categories (user_id, id) on delete restrict,
  check (
    (type = 'transfer' and to_wallet_id is not null and to_wallet_id <> wallet_id and to_amount is not null and category_id is null)
    or (type in ('income','expense') and to_wallet_id is null and to_amount is null and category_id is not null)
  )
);
create index transactions_user_date_idx on public.transactions (user_id, occurred_at desc);
create index transactions_wallet_idx on public.transactions (user_id, wallet_id);
create index transactions_to_wallet_idx on public.transactions (user_id, to_wallet_id) where to_wallet_id is not null;
create index transactions_category_idx on public.transactions (user_id, category_id) where category_id is not null;

create table public.budgets (
  user_id uuid not null references public.profiles on delete cascade,
  id text not null,
  category_id text not null,
  amount bigint not null check (amount > 0),
  currency text not null check (currency in ('IDR','USD','EUR','SGD','MYR','JPY','GBP','AUD')),
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  unique (user_id, category_id),
  foreign key (user_id, category_id) references public.categories (user_id, id) on delete cascade
);

create table public.exchange_rates (
  user_id uuid not null references public.profiles on delete cascade,
  code text not null check (code in ('IDR','USD','EUR','SGD','MYR','JPY','GBP','AUD')),
  rate numeric(20,8) not null check (rate > 0),
  primary key (user_id, code)
);

create table public.notification_reads (
  user_id uuid not null references public.profiles on delete cascade,
  notification_key text not null,
  read_at timestamptz not null default now(),
  primary key (user_id, notification_key)
);

-- Row level security: a signed-in user can only see and change their own rows.
do $$
declare t text;
begin
  foreach t in array array['profiles','wallets','categories','transactions','budgets','exchange_rates','notification_reads'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t || '_owner', t);
  end loop;
end $$;

-- Built-in categories for a new user (labels are translated in the app via the `key`).
create function public.seed_default_categories(uid uuid) returns void
language sql security definer set search_path = '' as $$
  insert into public.categories (user_id, id, key, type, color) values
    (uid,'cat_salary','salary','income','#15803d'),
    (uid,'cat_bonus','bonus','income','#16a34a'),
    (uid,'cat_business','business','income','#0d9488'),
    (uid,'cat_investment','investment','income','#0891b2'),
    (uid,'cat_gift_in','giftIn','income','#65a30d'),
    (uid,'cat_other_in','otherIncome','income','#4d7c0f'),
    (uid,'cat_food','food','expense','#ea580c'),
    (uid,'cat_groceries','groceries','expense','#d97706'),
    (uid,'cat_transport','transport','expense','#2563eb'),
    (uid,'cat_housing','housing','expense','#7c3aed'),
    (uid,'cat_utilities','utilities','expense','#0284c7'),
    (uid,'cat_shopping','shopping','expense','#db2777'),
    (uid,'cat_health','health','expense','#dc2626'),
    (uid,'cat_education','education','expense','#4f46e5'),
    (uid,'cat_entertainment','entertainment','expense','#c026d3'),
    (uid,'cat_bills','bills','expense','#475569'),
    (uid,'cat_other_out','otherExpense','expense','#78716c')
  on conflict do nothing;
$$;

-- Create the profile (and default categories) when someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  lang text := coalesce(new.raw_user_meta_data ->> 'language', 'en');
  cur text := coalesce(new.raw_user_meta_data ->> 'preferred_currency', 'USD');
begin
  if lang not in ('id','en') then lang := 'en'; end if;
  if cur not in ('IDR','USD','EUR','SGD','MYR','JPY','GBP','AUD') then cur := 'USD'; end if;
  insert into public.profiles (user_id, email, full_name, language, preferred_currency, country)
  values (
    new.id, coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80),
    lang, cur, case when lang = 'id' then 'Indonesia' else '' end
  );
  perform public.seed_default_categories(new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- These functions are for the trigger only; they must not be callable through the API.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.seed_default_categories(uuid) from public, anon, authenticated;
