-- Record which version of the Terms / Privacy Policy a user accepted, and when.
alter table public.profiles
  add column terms_version text,
  add column terms_accepted_at timestamptz;

-- Sign-up trigger: also store the consent that was given at sign-up (passed in the sign-up metadata).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  lang text := coalesce(new.raw_user_meta_data ->> 'language', 'id');
  cur text := coalesce(new.raw_user_meta_data ->> 'preferred_currency', 'IDR');
  thm text := coalesce(new.raw_user_meta_data ->> 'theme', 'light');
  tv text := nullif(left(coalesce(new.raw_user_meta_data ->> 'terms_version', ''), 32), '');
begin
  if lang not in ('id','en') then lang := 'id'; end if;
  if cur not in ('IDR','USD','EUR','SGD','MYR','JPY','GBP','AUD') then cur := 'IDR'; end if;
  if thm not in ('light','dark','system') then thm := 'light'; end if;
  insert into public.profiles (user_id, email, full_name, language, preferred_currency, theme, country, terms_version, terms_accepted_at)
  values (
    new.id, coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80),
    lang, cur, thm, case when lang = 'id' then 'Indonesia' else '' end,
    tv, case when tv is null then null else now() end
  );
  perform public.seed_default_categories(new.id);
  return new;
end $$;

-- Self-service account deletion: removes the caller's auth user; every table cascades from it.
-- Intentionally callable by signed-in users (it can only ever delete the caller's own account).
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
