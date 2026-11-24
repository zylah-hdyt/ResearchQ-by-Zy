-- Record transactions by chat (WhatsApp through a gateway).
-- The Edge Function `chat-webhook` uses the service role; the app only creates link codes and can unlink.

-- One chat number per user. The number is the identity: only the owner of the account can create a code, and only the
-- number that sends that code becomes linked.
create table public.chat_links (
  user_id uuid primary key references public.profiles on delete cascade,
  phone text not null unique check (phone ~ '^[0-9]{8,15}$'),
  last_wallet_id text,
  last_tx_id text,
  created_at timestamptz not null default now()
);

-- Short-lived one-time codes (10 minutes). Never readable by clients.
create table public.chat_link_codes (
  user_id uuid primary key references public.profiles on delete cascade,
  code text not null unique check (code ~ '^[0-9]{6}$'),
  expires_at timestamptz not null
);

-- Delivery ids already handled (providers retry), kept for a few days.
create table public.chat_events (
  event_id text primary key,
  created_at timestamptz not null default now()
);

alter table public.chat_links enable row level security;
alter table public.chat_link_codes enable row level security;
alter table public.chat_events enable row level security;

create policy "chat_links: read own" on public.chat_links for select to authenticated using (user_id = (select auth.uid()));
create policy "chat_links: delete own" on public.chat_links for delete to authenticated using (user_id = (select auth.uid()));
-- No insert/update policies: links are created only by the Edge Function after a valid code.
-- chat_link_codes and chat_events have no policies at all: clients cannot touch them.

create or replace function public.create_chat_link_code() returns text
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := (select auth.uid());
  c text;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  loop
    c := lpad((floor(random() * 1000000))::int::text, 6, '0');
    begin
      insert into public.chat_link_codes (user_id, code, expires_at) values (uid, c, now() + interval '10 minutes')
      on conflict (user_id) do update set code = excluded.code, expires_at = excluded.expires_at;
      return c;
    exception when unique_violation then
      -- another user holds this code right now: try a different one
      null;
    end;
  end loop;
end $$;

revoke all on function public.create_chat_link_code() from public, anon;
grant execute on function public.create_chat_link_code() to authenticated;
