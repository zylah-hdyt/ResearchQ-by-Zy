-- PostgreSQL / Supabase schema for the finance app (server adapter, roadmap phase 3).
-- Money is stored in integer minor units (1/100). Every table is protected by row level security.

create table profiles (
  user_id uuid primary key references auth.users on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 80),
  display_name text check (char_length(display_name) <= 40),
  avatar_path text,
  phone text,
  country text,
  date_of_birth date,
  preferred_currency char(3) not null default 'IDR',
  language text not null default 'id' check (language in ('id','en')),
  theme text not null default 'system' check (theme in ('system','light','dark')),
  week_starts_on smallint not null default 1 check (week_starts_on in (0,1)),
  budget_alerts boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  name text not null,
  type text not null check (type in ('cash','bank','ewallet','credit','savings','investment')),
  currency char(3) not null,
  initial_balance bigint not null default 0,
  color text,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  key text,
  name text,
  type text not null check (type in ('income','expense')),
  color text,
  unique (user_id, key),
  check (key is not null or name is not null)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  type text not null check (type in ('income','expense','transfer')),
  wallet_id uuid not null references wallets,
  to_wallet_id uuid references wallets,
  category_id uuid references categories,
  amount bigint not null check (amount > 0),
  to_amount bigint check (to_amount > 0),
  occurred_at timestamp not null,
  description text not null default '',
  notes text not null default '',
  client_ref uuid not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (user_id, client_ref),
  check (
    (type = 'transfer' and to_wallet_id is not null and to_wallet_id <> wallet_id and to_amount is not null and category_id is null)
    or (type in ('income','expense') and to_wallet_id is null and to_amount is null and category_id is not null)
  )
);
create index transactions_user_date on transactions (user_id, occurred_at) where deleted_at is null;

create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  category_id uuid not null references categories on delete cascade,
  amount bigint not null check (amount > 0),
  currency char(3) not null,
  created_at timestamptz not null default now(),
  unique (user_id, category_id)
);

create table exchange_rates (
  user_id uuid not null references profiles on delete cascade,
  code char(3) not null,
  rate numeric(20,8) not null check (rate > 0),
  primary key (user_id, code)
);

create table notification_reads (
  user_id uuid not null references profiles on delete cascade,
  notification_key text not null,
  read_at timestamptz not null default now(),
  primary key (user_id, notification_key)
);

create table export_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles on delete cascade,
  format text not null check (format in ('xlsx','csv')),
  options jsonb not null,
  row_count integer not null,
  status text not null check (status in ('success','error')),
  created_at timestamptz not null default now()
);

-- Ownership check: referenced wallets / categories must belong to the same user.
create function check_tx_ownership() returns trigger language plpgsql as $$
begin
  if not exists (select 1 from wallets where id = new.wallet_id and user_id = new.user_id) then
    raise exception 'wallet not owned by user';
  end if;
  if new.to_wallet_id is not null and not exists (select 1 from wallets where id = new.to_wallet_id and user_id = new.user_id) then
    raise exception 'destination wallet not owned by user';
  end if;
  if new.category_id is not null and not exists (select 1 from categories where id = new.category_id and user_id = new.user_id) then
    raise exception 'category not owned by user';
  end if;
  return new;
end $$;
create trigger tx_ownership before insert or update on transactions for each row execute function check_tx_ownership();

-- Row level security: users only ever see and change their own rows.
do $$
declare t text;
begin
  foreach t in array array['profiles','wallets','categories','transactions','budgets','exchange_rates','notification_reads','export_jobs'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t || '_owner', t);
  end loop;
end $$;

-- Avatars: private bucket, objects under "{user_id}/".
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false);
-- create policy avatars_owner on storage.objects for all
--   using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
--   with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
