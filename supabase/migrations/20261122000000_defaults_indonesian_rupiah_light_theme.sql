-- New accounts start in Indonesian, Rupiah and the light theme (still changeable by the user).
alter table public.profiles alter column theme set default 'light';

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  lang text := coalesce(new.raw_user_meta_data ->> 'language', 'id');
  cur text := coalesce(new.raw_user_meta_data ->> 'preferred_currency', 'IDR');
  thm text := coalesce(new.raw_user_meta_data ->> 'theme', 'light');
begin
  if lang not in ('id','en') then lang := 'id'; end if;
  if cur not in ('IDR','USD','EUR','SGD','MYR','JPY','GBP','AUD') then cur := 'IDR'; end if;
  if thm not in ('light','dark','system') then thm := 'light'; end if;
  insert into public.profiles (user_id, email, full_name, language, preferred_currency, theme, country)
  values (
    new.id, coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 80),
    lang, cur, thm, case when lang = 'id' then 'Indonesia' else '' end
  );
  perform public.seed_default_categories(new.id);
  return new;
end $$;
