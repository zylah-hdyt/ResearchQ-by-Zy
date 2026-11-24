-- Record transactions by chat (WhatsApp through a gateway), processed INSIDE the database.
--
--   WhatsApp -> gateway (Fonnte) -> Edge Function `chat-webhook` (only relays) -> INSERT into chat_inbox
--   -> BEFORE INSERT trigger runs chat_process(): reads the message, writes the transaction, builds the reply
--   -> the web app shows the new data (Realtime on chat_inbox triggers a refresh) and the message history.
--
-- Clients (the app) can only create link codes, read their own inbox rows (no phone, no raw payload) and unlink.
-- Everything else runs as the service role / SECURITY DEFINER.

-- ───────── tables ─────────
create table public.chat_links (
  user_id uuid primary key references public.profiles on delete cascade,
  phone text not null unique check (phone ~ '^[0-9]{8,15}$'),
  last_wallet_id text,
  last_tx_id text,
  created_at timestamptz not null default now()
);

create table public.chat_link_codes (
  user_id uuid primary key references public.profiles on delete cascade,
  code text not null unique check (code ~ '^[0-9]{6}$'),
  expires_at timestamptz not null
);

-- Every message that reaches us, with the outcome of processing it.
create table public.chat_inbox (
  id bigint generated always as identity primary key,
  received_at timestamptz not null default now(),
  phone text not null,
  text text not null check (char_length(text) <= 2000),
  event_id text unique,
  user_id uuid references public.profiles on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'done', 'duplicate', 'error')),
  intent text,
  reply text,
  error text
);
create index chat_inbox_user_idx on public.chat_inbox (user_id, received_at desc);

-- The raw payload exactly as the gateway sent it (service role only).
create table public.chat_inbox_raw (
  inbox_id bigint primary key references public.chat_inbox on delete cascade,
  raw jsonb not null
);

-- Words that map a message to a category.
create table public.chat_keywords (
  ord int not null,
  cat_key text not null,
  word text not null,
  income boolean not null,
  primary key (cat_key, word)
);

insert into public.chat_keywords (ord, cat_key, word, income) values
  (1, 'salary', 'gaji', true),
  (1, 'salary', 'salary', true),
  (1, 'salary', 'upah', true),
  (2, 'bonus', 'bonus', true),
  (2, 'bonus', 'thr', true),
  (2, 'bonus', 'insentif', true),
  (3, 'business', 'usaha', true),
  (3, 'business', 'jualan', true),
  (3, 'business', 'omzet', true),
  (3, 'business', 'proyek', true),
  (3, 'business', 'project', true),
  (3, 'business', 'freelance', true),
  (3, 'business', 'jasa', true),
  (3, 'business', 'klien', true),
  (3, 'business', 'penjualan', true),
  (4, 'investment', 'dividen', true),
  (4, 'investment', 'bunga', true),
  (4, 'investment', 'investasi', true),
  (4, 'investment', 'saham', true),
  (4, 'investment', 'profit', true),
  (4, 'investment', 'reksadana', true),
  (4, 'investment', 'crypto', true),
  (5, 'giftIn', 'hadiah', true),
  (5, 'giftIn', 'angpao', true),
  (5, 'giftIn', 'angpau', true),
  (5, 'giftIn', 'kado', true),
  (6, 'food', 'makan', false),
  (6, 'food', 'minum', false),
  (6, 'food', 'kopi', false),
  (6, 'food', 'ngopi', false),
  (6, 'food', 'sarapan', false),
  (6, 'food', 'lunch', false),
  (6, 'food', 'dinner', false),
  (6, 'food', 'resto', false),
  (6, 'food', 'restoran', false),
  (6, 'food', 'warung', false),
  (6, 'food', 'bakso', false),
  (6, 'food', 'nasi', false),
  (6, 'food', 'jajan', false),
  (6, 'food', 'snack', false),
  (6, 'food', 'boba', false),
  (6, 'food', 'teh', false),
  (6, 'food', 'gofood', false),
  (6, 'food', 'grabfood', false),
  (6, 'food', 'shopeefood', false),
  (6, 'food', 'cafe', false),
  (6, 'food', 'kafe', false),
  (6, 'food', 'starbucks', false),
  (6, 'food', 'mie', false),
  (6, 'food', 'ayam', false),
  (6, 'food', 'sate', false),
  (6, 'food', 'es', false),
  (7, 'groceries', 'sembako', false),
  (7, 'groceries', 'supermarket', false),
  (7, 'groceries', 'indomaret', false),
  (7, 'groceries', 'alfamart', false),
  (7, 'groceries', 'pasar', false),
  (7, 'groceries', 'sayur', false),
  (7, 'groceries', 'groceries', false),
  (7, 'groceries', 'belanja bulanan', false),
  (7, 'groceries', 'belanja harian', false),
  (7, 'groceries', 'galon', false),
  (7, 'groceries', 'beras', false),
  (8, 'transport', 'bensin', false),
  (8, 'transport', 'ojek', false),
  (8, 'transport', 'ojol', false),
  (8, 'transport', 'gojek', false),
  (8, 'transport', 'grab', false),
  (8, 'transport', 'parkir', false),
  (8, 'transport', 'tol', false),
  (8, 'transport', 'bus', false),
  (8, 'transport', 'kereta', false),
  (8, 'transport', 'krl', false),
  (8, 'transport', 'mrt', false),
  (8, 'transport', 'taksi', false),
  (8, 'transport', 'taxi', false),
  (8, 'transport', 'transport', false),
  (8, 'transport', 'angkot', false),
  (8, 'transport', 'pertamax', false),
  (8, 'transport', 'pertalite', false),
  (8, 'transport', 'bbm', false),
  (8, 'transport', 'tiket pesawat', false),
  (8, 'transport', 'travel', false),
  (9, 'housing', 'sewa', false),
  (9, 'housing', 'kos', false),
  (9, 'housing', 'kost', false),
  (9, 'housing', 'kontrakan', false),
  (9, 'housing', 'kpr', false),
  (9, 'housing', 'rumah', false),
  (10, 'utilities', 'listrik', false),
  (10, 'utilities', 'token', false),
  (10, 'utilities', 'pln', false),
  (10, 'utilities', 'pdam', false),
  (10, 'utilities', 'air', false),
  (10, 'utilities', 'internet', false),
  (10, 'utilities', 'wifi', false),
  (10, 'utilities', 'indihome', false),
  (10, 'utilities', 'pulsa', false),
  (10, 'utilities', 'kuota', false),
  (10, 'utilities', 'gas', false),
  (11, 'shopping', 'baju', false),
  (11, 'shopping', 'sepatu', false),
  (11, 'shopping', 'tas', false),
  (11, 'shopping', 'elektronik', false),
  (11, 'shopping', 'shopee', false),
  (11, 'shopping', 'tokopedia', false),
  (11, 'shopping', 'lazada', false),
  (11, 'shopping', 'belanja online', false),
  (11, 'shopping', 'shopping', false),
  (11, 'shopping', 'tiktok shop', false),
  (11, 'shopping', 'beli', false),
  (12, 'health', 'dokter', false),
  (12, 'health', 'obat', false),
  (12, 'health', 'apotek', false),
  (12, 'health', 'rumah sakit', false),
  (12, 'health', 'klinik', false),
  (12, 'health', 'vitamin', false),
  (12, 'health', 'bpjs', false),
  (12, 'health', 'gym', false),
  (12, 'health', 'medis', false),
  (12, 'health', 'dentist', false),
  (12, 'health', 'gigi', false),
  (13, 'education', 'sekolah', false),
  (13, 'education', 'kuliah', false),
  (13, 'education', 'spp', false),
  (13, 'education', 'buku', false),
  (13, 'education', 'kursus', false),
  (13, 'education', 'les', false),
  (13, 'education', 'kelas', false),
  (13, 'education', 'ukt', false),
  (13, 'education', 'seminar', false),
  (14, 'entertainment', 'bioskop', false),
  (14, 'entertainment', 'nonton', false),
  (14, 'entertainment', 'film', false),
  (14, 'entertainment', 'game', false),
  (14, 'entertainment', 'konser', false),
  (14, 'entertainment', 'liburan', false),
  (14, 'entertainment', 'wisata', false),
  (14, 'entertainment', 'karaoke', false),
  (14, 'entertainment', 'hiburan', false),
  (14, 'entertainment', 'hotel', false),
  (15, 'bills', 'tagihan', false),
  (15, 'bills', 'langganan', false),
  (15, 'bills', 'netflix', false),
  (15, 'bills', 'spotify', false),
  (15, 'bills', 'youtube', false),
  (15, 'bills', 'asuransi', false),
  (15, 'bills', 'cicilan', false),
  (15, 'bills', 'kartu kredit', false),
  (15, 'bills', 'subscription', false);
alter table public.chat_links enable row level security;
alter table public.chat_link_codes enable row level security;
alter table public.chat_inbox enable row level security;
alter table public.chat_inbox_raw enable row level security;
alter table public.chat_keywords enable row level security;

create policy "chat_links: read own" on public.chat_links for select to authenticated using (user_id = (select auth.uid()));
create policy "chat_links: delete own" on public.chat_links for delete to authenticated using (user_id = (select auth.uid()));
create policy "chat_inbox: read own" on public.chat_inbox for select to authenticated using (user_id = (select auth.uid()));
-- No other policies: codes, raw payloads and keywords are never readable by clients; links and inbox rows are written only by the service role.

-- Clients see their own messages (text, outcome, reply) but never the phone number column.
revoke all on public.chat_inbox from authenticated, anon;
grant select (id, received_at, user_id, text, status, intent, reply) on public.chat_inbox to authenticated;

-- ───────── small helpers ─────────
create function public.chat_norm(t text) returns text language sql immutable as $$
  select btrim(regexp_replace(lower(regexp_replace(coalesce(t, ''), '[‎‏]', '', 'g')), '\s+', ' ', 'g'))
$$;

create function public.chat_esc(t text) returns text language sql immutable as $$
  select regexp_replace(t, '([.*+?^${}()|\[\]\\])', '\\\1', 'g')
$$;

create function public.chat_has_word(t text, w text) returns boolean language sql immutable as $$
  select t ~ ('(^|[^a-z0-9])' || public.chat_esc(w) || '([^a-z0-9]|$)')
$$;

-- "0812-3456-7890" -> "6281234567890"
create function public.chat_norm_phone(p text) returns text language sql immutable as $$
  select case when d like '00%' then substr(d, 3) when d like '0%' then '62' || substr(d, 2) else d end
  from (select regexp_replace(coalesce(p, ''), '\D', '', 'g') as d) x
$$;

-- ───────── amounts ─────────
-- All amounts in a normalised message: [{value, s, e, strong}] (s/e are 1-based, e exclusive).
create function public.chat_amounts(t text) returns jsonb language plpgsql immutable as $$
declare
  pat constant text := '(rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(\s*(?:rb|ribu|k|jt|juta)\M)?';
  n int := 0; s int; e int; rp text; num text; unit text; val numeric; fac numeric; grouped boolean;
  b text; a text; res jsonb := '[]';
begin
  loop
    n := n + 1;
    s := regexp_instr(t, pat, 1, n);
    exit when s = 0;
    e := regexp_instr(t, pat, 1, n, 1);
    rp := regexp_substr(t, pat, 1, n, '', 1);
    num := regexp_substr(t, pat, 1, n, '', 2);
    unit := lower(btrim(regexp_substr(t, pat, 1, n, '', 3)));
    fac := case unit when 'rb' then 1000 when 'ribu' then 1000 when 'k' then 1000 when 'jt' then 1000000 when 'juta' then 1000000 else null end;
    grouped := num ~ '^\d{1,3}([.,]\d{3})+$';
    if fac is not null then val := (case when grouped then regexp_replace(num, '[.,]', '', 'g') else replace(num, ',', '.') end)::numeric * fac;
    elsif grouped then val := regexp_replace(num, '[.,]', '', 'g')::numeric;
    else val := replace(num, ',', '.')::numeric; end if;
    if val <= 0 then continue; end if;
    b := case when s > 1 then substr(t, s - 1, 1) else '' end;
    a := substr(t, e, 1);
    -- a number glued to letters ("a1b") or part of a date/time ("5/11", "10:30") is not an amount
    if (b ~ '[a-z]' and rp is null) or a ~ '[/:]' or b ~ '[/:]' then continue; end if;
    res := res || jsonb_build_object('value', round(val), 's', s, 'e', e, 'strong', (rp is not null or fac is not null or grouped));
  end loop;
  return res;
end $$;

-- {hit: {...}} or {error: 'no-amount' | 'ambiguous-amount'}. A bare small number ("2 kopi") loses to a strong one.
create function public.chat_pick_amount(t text) returns jsonb language plpgsql immutable as $$
declare
  hits jsonb := public.chat_amounts(t);
  strong jsonb; bare jsonb;
begin
  if jsonb_array_length(hits) = 0 then return '{"error":"no-amount"}'; end if;
  select coalesce(jsonb_agg(h), '[]') into strong from jsonb_array_elements(hits) h where (h->>'strong')::boolean;
  if jsonb_array_length(strong) = 1 then return jsonb_build_object('hit', strong->0); end if;
  if jsonb_array_length(strong) > 1 then
    if (select count(distinct h->>'value') from jsonb_array_elements(strong) h) = 1 then return jsonb_build_object('hit', strong->0); end if;
    return '{"error":"ambiguous-amount"}';
  end if;
  select coalesce(jsonb_agg(h), '[]') into bare from jsonb_array_elements(hits) h where (h->>'value')::numeric >= 100;
  if jsonb_array_length(bare) = 1 then return jsonb_build_object('hit', bare->0); end if;
  if jsonb_array_length(bare) > 1 then return '{"error":"ambiguous-amount"}'; end if;
  if jsonb_array_length(hits) = 1 then return jsonb_build_object('hit', hits->0); end if;
  return '{"error":"ambiguous-amount"}';
end $$;

-- ───────── dates ─────────
create function public.chat_find_date(t text, today date) returns jsonb language plpgsql immutable as $$
declare
  p text; s int; days int;
begin
  p := '\y(kemarin lusa|lusa)\y';
  s := regexp_instr(t, p); if s > 0 then return jsonb_build_object('date', today - 2, 's', s, 'e', regexp_instr(t, p, 1, 1, 1)); end if;
  p := '\y(kemarin|yesterday)\y';
  s := regexp_instr(t, p); if s > 0 then return jsonb_build_object('date', today - 1, 's', s, 'e', regexp_instr(t, p, 1, 1, 1)); end if;
  p := '\y(\d{1,2}) hari (?:yang )?lalu\y|\y(\d{1,2}) days? ago\y';
  s := regexp_instr(t, p);
  if s > 0 then
    days := coalesce(regexp_substr(t, p, 1, 1, '', 1), regexp_substr(t, p, 1, 1, '', 2))::int;
    return jsonb_build_object('date', today - days, 's', s, 'e', regexp_instr(t, p, 1, 1, 1));
  end if;
  p := '\y(hari ini|today|tadi|barusan)\y';
  s := regexp_instr(t, p); if s > 0 then return jsonb_build_object('date', today, 's', s, 'e', regexp_instr(t, p, 1, 1, 1)); end if;
  return null;
end $$;

-- ───────── categories and wallets ─────────
-- cats: [{id, key, name, type}]. A custom category name wins over built-in keywords; falls back to "other".
create function public.chat_match_category(t text, typ text, cats jsonb) returns jsonb language plpgsql stable as $$
declare
  c record; k record; best_key text; best int := 0; fallback text; found text;
begin
  for c in select * from jsonb_to_recordset(cats) as x(id text, key text, name text, type text) where x.type = typ loop
    if c.name is not null and length(c.name) >= 3 and public.chat_has_word(t, public.chat_norm(c.name)) then
      return jsonb_build_object('id', c.id, 'key', c.key);
    end if;
  end loop;
  for k in
    select cat_key, ord, max(case when word like '% %' then 3 when length(word) >= 4 then 2 else 1 end) as score
    from public.chat_keywords where income = (typ = 'income') and public.chat_has_word(t, word)
    group by cat_key, ord order by ord
  loop
    if k.score > best then best := k.score; best_key := k.cat_key; end if;
  end loop;
  fallback := case when typ = 'income' then 'otherIncome' else 'otherExpense' end;
  best_key := coalesce(best_key, fallback);
  select x.id into found from jsonb_to_recordset(cats) as x(id text, key text, name text, type text) where x.type = typ and x.key = best_key limit 1;
  return jsonb_build_object('id', found, 'key', best_key);
end $$;

-- Wallet names found in the message with their position. Longest names first, archived never.
create function public.chat_find_wallets(t text, wallets jsonb) returns jsonb language plpgsql immutable as $$
declare
  w record; nm text; pat text; n int; s int; e int; res jsonb := '[]'; clash boolean;
begin
  for w in select * from jsonb_to_recordset(wallets) as x(id text, name text, currency text, archived boolean) where not coalesce(x.archived, false) order by length(x.name) desc loop
    nm := public.chat_norm(w.name);
    if nm = '' then continue; end if;
    pat := '(^|[^a-z0-9])(' || public.chat_esc(nm) || ')(?=$|[^a-z0-9])';
    n := 0;
    loop
      n := n + 1;
      s := regexp_instr(t, pat, 1, n, 0, '', 2);
      exit when s = 0;
      e := regexp_instr(t, pat, 1, n, 1, '', 2);
      select bool_or(s < (h->>'e')::int and e > (h->>'s')::int) into clash from jsonb_array_elements(res) h;
      if coalesce(clash, false) then continue; end if;
      res := res || jsonb_build_object('id', w.id, 'name', w.name, 's', s, 'e', e);
    end loop;
  end loop;
  select coalesce(jsonb_agg(h order by (h->>'s')::int), '[]') into res from jsonb_array_elements(res) h;
  return res;
end $$;

-- The message minus the parts that were understood (cuts), minus filler words; first letter capitalised.
create function public.chat_describe(t text, cuts jsonb, extra text) returns text language plpgsql immutable as $$
declare
  i int := 1; s text := ''; c jsonb; a int; b int;
begin
  for c in select x from jsonb_array_elements(cuts) x order by (x->>0)::int loop
    a := (c->>0)::int; b := (c->>1)::int;
    if a >= i then s := s || substr(t, i, a - i) || ' '; i := b; end if;
  end loop;
  s := s || substr(t, i);
  s := regexp_replace(s, extra, ' ', 'g');
  s := regexp_replace(s, '\y(dari|ke|pakai|via|dengan|di|dgn|pake)\y(?=\s*$)', ' ', 'g');
  s := regexp_replace(s, '[-+:,]', ' ', 'g');
  s := btrim(regexp_replace(s, '\s+', ' ', 'g'));
  return upper(left(s, 1)) || substr(s, 2);
end $$;

-- ───────── the parser ─────────
-- intent as jsonb: {kind: transaction|transfer|balance|today|month|budget|undo|help|link|unknown, ...}
create function public.chat_parse(p_text text, p_wallets jsonb, p_cats jsonb, p_today date) returns jsonb language plpgsql stable as $$
declare
  original text := btrim(regexp_replace(coalesce(p_text, ''), '[‎‏]', '', 'g'));
  t text := public.chat_norm(p_text);
  m text[]; amt jsonb; hit jsonb; dh jsonb; ws jsonb; wcount int;
  cuts jsonb := '[]'; w jsonb;
  d date; typ text; sign text; is_score int; es_score int; cat jsonb; wd text;
  first_w jsonb; second_w jsonb; dari_second boolean; dari_first boolean; from_w jsonb; to_w jsonb;
begin
  if t = '' then return '{"kind":"unknown","reason":"empty"}'; end if;

  m := regexp_match(t, '^(?:myfi[\s-]*|hubungkan\s+|link\s+|connect\s+|kode\s+)(\d{6})$');
  if m is not null then return jsonb_build_object('kind', 'link', 'code', m[1]); end if;
  if t ~ '^(saldo|cek saldo|balance|sisa uang|sisa saldo)$' then return '{"kind":"balance"}'; end if;
  if t ~ '^(hari ini|hariini|rekap hari ini|today)$' then return '{"kind":"today"}'; end if;
  if t ~ '^(bulan ini|rekap|rekap bulan ini|ringkasan|summary|month|laporan)$' then return '{"kind":"month"}'; end if;
  if t ~ '^(anggaran|budget|cek anggaran)$' then return '{"kind":"budget"}'; end if;
  if t ~ '^(batal|undo|cancel|hapus terakhir|salah)$' then return '{"kind":"undo"}'; end if;
  if t ~ '^(bantuan|help|menu|\?|halo|hai|hi|hello|tolong|cara pakai)$' then return '{"kind":"help"}'; end if;

  amt := public.chat_pick_amount(t);
  if amt ? 'error' then return jsonb_build_object('kind', 'unknown', 'reason', amt->>'error'); end if;
  hit := amt->'hit';
  dh := public.chat_find_date(t, p_today);
  d := coalesce((dh->>'date')::date, p_today);
  ws := public.chat_find_wallets(t, p_wallets);
  wcount := jsonb_array_length(ws);

  -- what has been understood is cut out; the rest is the description
  cuts := jsonb_build_array(jsonb_build_array((hit->>'s')::int, (hit->>'e')::int));
  for w in select * from jsonb_array_elements(ws) loop cuts := cuts || jsonb_build_array(jsonb_build_array((w->>'s')::int, (w->>'e')::int)); end loop;
  if dh is not null then cuts := cuts || jsonb_build_array(jsonb_build_array((dh->>'s')::int, (dh->>'e')::int)); end if;

  -- transfer: "transfer 500rb bca ke gopay", "tf dari bca ke gopay", "pindah 1jt ke gopay dari bca"
  if t ~ '^(transfer|tf|pindah|pindahkan|kirim)\y' or (t ~ '\y(transfer|tf|pindah dana)\y' and wcount >= 2) then
    if wcount <> 2 then return '{"kind":"unknown","reason":"transfer-wallets"}'; end if;
    first_w := ws->0; second_w := ws->1;
    dari_second := rtrim(substr(t, 1, (second_w->>'s')::int - 1)) ~ '\ydari\s*$';
    dari_first := rtrim(substr(t, 1, (first_w->>'s')::int - 1)) ~ '\ydari\s*$';
    if dari_second and not dari_first then from_w := second_w; to_w := first_w; else from_w := first_w; to_w := second_w; end if;
    if from_w->>'id' = to_w->>'id' then return '{"kind":"unknown","reason":"transfer-wallets"}'; end if;
    return jsonb_build_object('kind', 'transfer', 'amount', hit->'value', 'fromId', from_w->'id', 'toId', to_w->'id',
      'description', public.chat_describe(t, cuts, '\y(transfer|tf|pindahkan|pindah|kirim|dana)\y'), 'date', d);
  end if;

  -- "pakai ovo" when the user has several wallets but no "ovo"
  if t ~ '\y(pakai|pake|via|dari|dgn|dengan)\s+[a-z0-9]{3,}\s*$' and wcount = 0 and jsonb_array_length(p_wallets) > 1 and t ~ '\y(pakai|pake|via|dgn|dengan)\y' then
    return '{"kind":"unknown","reason":"unknown-wallet"}';
  end if;

  sign := case when left(original, 1) = '+' then 'income' when left(original, 1) = '-' then 'expense' end;
  select count(*) into is_score from unnest(array['gaji','bonus','thr','terima','diterima','dapat','pemasukan','masuk','income','salary','untung','dividen','angpao','angpau','dibayar klien','cashback']) x where public.chat_has_word(t, x);
  select count(*) into es_score from unnest(array['bayar','beli','belanja','keluar','pengeluaran','expense','jajan','makan','ngopi']) x where public.chat_has_word(t, x);
  is_score := is_score + case when sign = 'income' then 2 else 0 end;
  es_score := es_score + case when sign = 'expense' then 2 else 0 end;
  typ := case when is_score > es_score then 'income' else 'expense' end;
  cat := public.chat_match_category(t, typ, p_cats);
  wd := public.chat_describe(t, cuts, '\y(terima|diterima|dapat|pemasukan|masuk|income|keluar|pengeluaran|expense|bayar|dibayar)\y');
  return jsonb_build_object('kind', 'transaction', 'type', typ, 'amount', hit->'value', 'walletId', case when wcount > 0 then ws->0->'id' else null end,
    'categoryId', cat->'id', 'categoryKey', cat->'key', 'description', wd, 'date', d);
end $$;

-- ───────── texts and formatting ─────────
create function public.chat_t(lang text, k text) returns text language sql immutable as $$
  select (case when lang = 'en' then $en$
{
 "notLinked":"This number is not linked to a MyFi account.\nOpen *MyFi → Settings → Record by WhatsApp* and send the 6-digit code here.",
 "linked":"✅ Linked! Now just type, for example:\n• lunch 25k\n• salary 5m\n• transfer 500k bca to gopay\n• balance\nType *help* for the full list.",
 "badCode":"Wrong or expired code. Create a new one in MyFi → Settings.",
 "help":"*Using MyFi by chat*\n\n*Record*\n• lunch 25k\n• gas 50k with bca\n• salary 5m\n• coffee 18k yesterday\n• transfer 500k bca to gopay\n\n*View*\n• balance\n• today\n• this month\n• budget\n\n*Fix*\n• undo (cancels the last chat entry)\n\nAmounts: 25k, 1.5m, 25,000.",
 "noWallet":"No wallet yet. Create one in the MyFi app first, then try again.",
 "noAmount":"I could not find an amount. Example: _lunch 25k_",
 "ambiguous":"There is more than one amount, so I recorded nothing. Send them one at a time, e.g. _lunch 25k_ then _parking 5k_.",
 "transferWallets":"Name two wallets for a transfer. Example: _transfer 500k bca to gopay_",
 "unknownWallet":"I could not find that wallet. Your wallets: {list}.",
 "crossCurrency":"Transfers between currencies need the received amount. Do it in the MyFi app.",
 "tooBig":"That amount is too large to record by chat. Use the MyFi app.",
 "noCategory":"Categories are not set up on your account yet. Open the MyFi app once first.",
 "nothingToUndo":"There is no recent chat entry to undo.",
 "undone":"↩️ Undone: {what}",
 "expense":"Expense","income":"Income","transfer":"Transfer","balanceOf":"{w} balance",
 "undoHint":"Type *undo* if it is wrong.",
 "totalIn":"Income","totalOut":"Expenses","net":"Net","today":"Today","month":"This month","balances":"Balances","total":"Total",
 "noBudget":"No monthly budgets yet.","budgetTitle":"Budgets this month","noData":"No transactions yet.",
 "error":"Sorry, something went wrong. Please try again."
}$en$::jsonb else $id$
{
 "notLinked":"Nomor ini belum terhubung ke akun MyFi.\nBuka *MyFi → Pengaturan → Catat lewat WhatsApp*, lalu kirim kode 6 angkanya ke sini.",
 "linked":"✅ Terhubung! Sekarang cukup ketik, misalnya:\n• makan siang 25rb\n• gaji 5jt\n• transfer 500rb bca ke gopay\n• saldo\nKetik *bantuan* untuk daftar lengkap.",
 "badCode":"Kode salah atau sudah kedaluwarsa. Buat kode baru di MyFi → Pengaturan.",
 "help":"*Cara pakai MyFi lewat chat*\n\n*Catat*\n• makan siang 25rb\n• bensin 50rb pakai bca\n• gaji 5jt\n• kopi 18rb kemarin\n• transfer 500rb bca ke gopay\n\n*Lihat*\n• saldo\n• hari ini\n• bulan ini\n• anggaran\n\n*Koreksi*\n• batal (membatalkan catatan terakhir)\n\nNominal: 25rb, 25k, 1,5jt, 25.000.",
 "noWallet":"Belum ada dompet. Buat dulu di aplikasi MyFi, lalu coba lagi.",
 "noAmount":"Saya belum menemukan nominalnya. Contoh: _makan siang 25rb_",
 "ambiguous":"Ada lebih dari satu nominal, jadi saya tidak mencatat apa pun. Kirim satu per satu ya, misalnya: _makan 25rb_ lalu _parkir 5rb_.",
 "transferWallets":"Untuk transfer sebutkan dua dompet. Contoh: _transfer 500rb bca ke gopay_",
 "unknownWallet":"Dompet itu tidak ketemu. Dompet Anda: {list}.",
 "crossCurrency":"Transfer beda mata uang perlu nominal diterima. Lakukan di aplikasi MyFi.",
 "tooBig":"Nominalnya terlalu besar untuk dicatat lewat chat. Catat di aplikasi MyFi.",
 "noCategory":"Kategori belum tersedia di akun Anda. Buka aplikasi MyFi sekali dulu.",
 "nothingToUndo":"Tidak ada catatan terakhir dari chat yang bisa dibatalkan.",
 "undone":"↩️ Dibatalkan: {what}",
 "expense":"Pengeluaran","income":"Pemasukan","transfer":"Transfer","balanceOf":"Saldo {w}",
 "undoHint":"Ketik *batal* jika salah.",
 "totalIn":"Pemasukan","totalOut":"Pengeluaran","net":"Bersih","today":"Hari ini","month":"Bulan ini","balances":"Saldo","total":"Total",
 "noBudget":"Belum ada anggaran bulanan.","budgetTitle":"Anggaran bulan ini","noData":"Belum ada transaksi.",
 "error":"Maaf, terjadi kesalahan. Coba lagi sebentar lagi."
}$id$::jsonb end) ->> k
$$;

-- 1234567 -> "Rp 12.345" (minor units = value x 100). Other currencies keep two decimals in the account language's style.
create function public.chat_money(minor numeric, cur text, lang text) returns text language sql immutable as $$
  select case when cur = 'IDR'
    then (case when minor < 0 then '-' else '' end) || 'Rp ' || replace(to_char(abs(round(minor / 100)), 'FM999,999,999,999,999,999'), ',', '.')
    else (case when minor < 0 then '-' else '' end) || cur || ' ' ||
         (case when lang = 'en' then to_char(abs(minor) / 100, 'FM999,999,999,999,999.00') else translate(to_char(abs(minor) / 100, 'FM999,999,999,999,999.00'), ',.', '.,') end)
  end
$$;

create function public.chat_cat_label(lang text, k text, name text) returns text language sql immutable as $$
  select coalesce(name, (select case when lang = 'en' then v->>1 else v->>0 end from (select ('{
    "salary":["Gaji","Salary"],"bonus":["Bonus","Bonus"],"business":["Usaha","Business"],"investment":["Investasi","Investment"],"giftIn":["Hadiah diterima","Gifts received"],"otherIncome":["Pemasukan lain","Other income"],
    "food":["Makan & minum","Food & drink"],"groceries":["Belanja harian","Groceries"],"transport":["Transportasi","Transport"],"housing":["Tempat tinggal","Housing"],"utilities":["Listrik, air & internet","Utilities"],
    "shopping":["Belanja","Shopping"],"health":["Kesehatan","Health"],"education":["Pendidikan","Education"],"entertainment":["Hiburan","Entertainment"],"bills":["Tagihan & langganan","Bills & subscriptions"],"otherExpense":["Pengeluaran lain","Other expenses"]
  }'::jsonb) -> k) x(v)), '—')
$$;

-- ───────── balances ─────────
create function public.chat_balances(p_user uuid) returns table (id text, name text, currency text, archived boolean, balance bigint)
language sql stable security definer set search_path = public as $$
  select w.id, w.name, w.currency, w.archived,
         w.initial_balance + coalesce((
           select sum(case
             when t.type = 'income' and t.wallet_id = w.id then t.amount
             when t.type = 'expense' and t.wallet_id = w.id then -t.amount
             when t.type = 'transfer' then (case when t.wallet_id = w.id then -t.amount else 0 end) + (case when t.to_wallet_id = w.id then coalesce(t.to_amount, t.amount) else 0 end)
             else 0 end)
           from public.transactions t where t.user_id = w.user_id and (t.wallet_id = w.id or t.to_wallet_id = w.id)), 0)::bigint
  from public.wallets w where w.user_id = p_user order by w.created_at
$$;

-- ───────── the conversation ─────────
-- Reads one message and acts on the user's data. Returns who it was, what it understood and the reply.
create function public.chat_process(p_phone text, p_text text, out o_user uuid, out o_intent text, out o_reply text)
language plpgsql security definer set search_path = public as $$
declare
  v_phone text := public.chat_norm_phone(p_phone);
  jkt timestamp := (now() at time zone 'Asia/Jakarta');
  v_today date := jkt::date; v_time text := to_char(jkt, 'HH24:MI');
  v_uid uuid; lnk record; lang text; cur text;
  wallets jsonb; active jsonb; cats jsonb; intent jsonb; kind text;
  wid text; wname text; wcur text; cid text; ckey text; cname text; clabel text; descr text; txid text; amt bigint; when_ts timestamp;
  fid text; tid text; fwallet record; twallet record; bal bigint; r record; lines text := ''; d date; dnote text; d_desc text; d_amt bigint; d_wid text; d_type text; dcur text;
  from_d date; to_d date;
  MAXAMT constant numeric := 10000000000;
begin
  select * into lnk from public.chat_links where phone = v_phone;

  -- not linked yet: the only thing that works is the one-time code
  if not found then
    intent := public.chat_parse(p_text, '[]', '[]', v_today);
    if intent->>'kind' = 'link' then
      select user_id into v_uid from public.chat_link_codes where code = intent->>'code' and expires_at > now() for update;
      if found then
        delete from public.chat_links where phone = v_phone;
        insert into public.chat_links (user_id, phone) values (v_uid, v_phone)
          on conflict (user_id) do update set phone = excluded.phone, last_tx_id = null, last_wallet_id = null;
        delete from public.chat_link_codes where user_id = v_uid;
        o_user := v_uid; o_intent := 'link';
        o_reply := public.chat_t('id', 'linked') || E'\n\n' || public.chat_t('en', 'linked');
        return;
      end if;
      o_intent := 'link-failed'; o_reply := public.chat_t('id', 'badCode') || E'\n' || public.chat_t('en', 'badCode');
      return;
    end if;
    o_intent := 'unlinked'; o_reply := public.chat_t('id', 'notLinked') || E'\n\n' || public.chat_t('en', 'notLinked');
    return;
  end if;

  o_user := lnk.user_id;
  select coalesce(p.language, 'id'), p.preferred_currency into lang, cur from public.profiles p where p.user_id = o_user;
  select coalesce(jsonb_agg(jsonb_build_object('id', w.id, 'name', w.name, 'currency', w.currency, 'archived', w.archived) order by w.created_at), '[]') into wallets from public.wallets w where w.user_id = o_user;
  select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'key', c.key, 'name', c.name, 'type', c.type)), '[]') into cats from public.categories c where c.user_id = o_user;
  select coalesce(jsonb_agg(x.w order by x.ord), '[]') into active from jsonb_array_elements(wallets) with ordinality as x(w, ord) where not coalesce((x.w->>'archived')::boolean, false);

  intent := public.chat_parse(p_text, wallets, cats, v_today);
  kind := intent->>'kind';
  o_intent := kind;

  if kind = 'help' or kind = 'link' then
    o_reply := public.chat_t(lang, case when kind = 'help' then 'help' else 'linked' end);

  elsif kind = 'unknown' then
    o_reply := case intent->>'reason'
      when 'no-amount' then public.chat_t(lang, 'noAmount')
      when 'ambiguous-amount' then public.chat_t(lang, 'ambiguous')
      when 'transfer-wallets' then public.chat_t(lang, 'transferWallets')
      when 'unknown-wallet' then replace(public.chat_t(lang, 'unknownWallet'), '{list}', coalesce((select string_agg(w->>'name', ', ') from jsonb_array_elements(active) w), ''))
      else public.chat_t(lang, 'help') end;

  elsif kind = 'undo' then
    if lnk.last_tx_id is null then o_reply := public.chat_t(lang, 'nothingToUndo');
    else
      delete from public.transactions where user_id = o_user and id = lnk.last_tx_id returning description, amount, wallet_id, type into d_desc, d_amt, d_wid, d_type;
      update public.chat_links set last_tx_id = null where user_id = o_user;
      if d_amt is null then o_reply := public.chat_t(lang, 'nothingToUndo');
      else
        select w.currency into dcur from public.wallets w where w.user_id = o_user and w.id = d_wid;
        o_reply := replace(public.chat_t(lang, 'undone'), '{what}', coalesce(nullif(d_desc, ''), d_type) || ' ' || public.chat_money(d_amt, dcur, lang));
      end if;
    end if;

  elsif kind = 'balance' then
    if jsonb_array_length(active) = 0 then o_reply := public.chat_t(lang, 'noWallet');
    else
      bal := 0; lines := ''; fid := null;
      for r in select * from public.chat_balances(o_user) b where not b.archived loop
        lines := lines || E'\n• ' || r.name || ': ' || public.chat_money(r.balance, r.currency, lang);
        if r.currency = cur then bal := bal + r.balance; else fid := 'x'; end if;
      end loop;
      o_reply := '*' || public.chat_t(lang, 'balances') || '*' || lines || E'\n\n*' || public.chat_t(lang, 'total') || case when fid is not null then ' (' || cur || ')' else '' end || ':* ' || public.chat_money(bal, cur, lang);
    end if;

  elsif kind = 'today' or kind = 'month' then
    from_d := case when kind = 'today' then v_today else date_trunc('month', v_today)::date end;
    to_d := case when kind = 'today' then v_today else (date_trunc('month', v_today) + interval '1 month - 1 day')::date end;
    lines := '';
    for r in
      select w.currency, sum(case when t.type = 'income' then t.amount else 0 end) as inc, sum(case when t.type = 'expense' then t.amount else 0 end) as exp
      from public.transactions t join public.wallets w on w.user_id = t.user_id and w.id = t.wallet_id
      where t.user_id = o_user and t.type <> 'transfer' and t.occurred_at >= from_d and t.occurred_at < to_d + 1
      group by w.currency order by w.currency
    loop
      lines := lines || case when lines = '' then '' else E'\n\n' end
        || public.chat_t(lang, 'totalIn') || ': ' || public.chat_money(r.inc, r.currency, lang) || E'\n'
        || public.chat_t(lang, 'totalOut') || ': ' || public.chat_money(r.exp, r.currency, lang) || E'\n'
        || public.chat_t(lang, 'net') || ': ' || public.chat_money(r.inc - r.exp, r.currency, lang);
    end loop;
    o_reply := '*' || public.chat_t(lang, case when kind = 'today' then 'today' else 'month' end) || E'*\n' || case when lines = '' then public.chat_t(lang, 'noData') else lines end;

  elsif kind = 'budget' then
    from_d := date_trunc('month', v_today)::date; to_d := (date_trunc('month', v_today) + interval '1 month - 1 day')::date;
    lines := '';
    for r in
      select b.amount as lim, b.currency, c.key, c.name,
             coalesce((select sum(t.amount) from public.transactions t join public.wallets w on w.user_id = t.user_id and w.id = t.wallet_id
                       where t.user_id = b.user_id and t.type = 'expense' and t.category_id = b.category_id and w.currency = b.currency
                         and t.occurred_at >= from_d and t.occurred_at < to_d + 1), 0) as spent
      from public.budgets b left join public.categories c on c.user_id = b.user_id and c.id = b.category_id
      where b.user_id = o_user and b.period = 'monthly' order by c.key
    loop
      lines := lines || E'\n' || (case when r.spent > r.lim then '🔴' when r.spent >= r.lim * 0.8 then '🟠' else '🟢' end) || ' ' || public.chat_cat_label(lang, r.key, r.name) || ': '
        || public.chat_money(r.spent, r.currency, lang) || ' / ' || public.chat_money(r.lim, r.currency, lang) || ' (' || round(r.spent * 100.0 / r.lim) || '%)';
    end loop;
    o_reply := case when lines = '' then public.chat_t(lang, 'noBudget') else '*' || public.chat_t(lang, 'budgetTitle') || '*' || lines end;

  elsif kind = 'transfer' then
    fid := intent->>'fromId'; tid := intent->>'toId';
    select * into fwallet from public.wallets where user_id = o_user and id = fid;
    select * into twallet from public.wallets where user_id = o_user and id = tid;
    if fwallet.currency <> twallet.currency then o_reply := public.chat_t(lang, 'crossCurrency');
    elsif (intent->>'amount')::numeric > MAXAMT then o_reply := public.chat_t(lang, 'tooBig');
    else
      d := (intent->>'date')::date; amt := ((intent->>'amount')::numeric * 100)::bigint;
      when_ts := (d::text || ' ' || case when d = v_today then v_time else '12:00' end)::timestamp;
      txid := 'tx_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
      insert into public.transactions (user_id, id, type, wallet_id, to_wallet_id, amount, to_amount, occurred_at, description, notes)
        values (o_user, txid, 'transfer', fid, tid, amt, amt, when_ts, left(coalesce(intent->>'description', ''), 120), 'via chat');
      update public.chat_links set last_tx_id = txid, last_wallet_id = fid where user_id = o_user;
      o_reply := '✅ ' || public.chat_t(lang, 'transfer') || ' ' || public.chat_money(amt, fwallet.currency, lang) || E'\n' || fwallet.name || ' → ' || twallet.name || E'\n\n' || public.chat_t(lang, 'undoHint');
    end if;

  elsif kind = 'transaction' then
    if jsonb_array_length(active) = 0 then o_reply := public.chat_t(lang, 'noWallet');
    elsif (intent->>'amount')::numeric > MAXAMT then o_reply := public.chat_t(lang, 'tooBig');
    else
      -- wallet: the one named, else the one used last, else the first active one
      wid := coalesce(
        (select w->>'id' from jsonb_array_elements(active) w where w->>'id' = intent->>'walletId'),
        (select w->>'id' from jsonb_array_elements(active) w where w->>'id' = lnk.last_wallet_id),
        active->0->>'id');
      select w->>'name', w->>'currency' into wname, wcur from jsonb_array_elements(active) w where w->>'id' = wid;
      cid := (select c->>'id' from jsonb_array_elements(cats) c where c->>'id' = intent->>'categoryId');
      if cid is null then cid := (select c->>'id' from jsonb_array_elements(cats) c where c->>'type' = intent->>'type' limit 1); end if;
      if cid is null then o_reply := public.chat_t(lang, 'noCategory');
      else
        select c->>'key', c->>'name' into ckey, cname from jsonb_array_elements(cats) c where c->>'id' = cid;
        clabel := public.chat_cat_label(lang, ckey, cname);
        descr := left(coalesce(nullif(intent->>'description', ''), clabel), 120);
        d := (intent->>'date')::date; amt := ((intent->>'amount')::numeric * 100)::bigint;
        when_ts := (d::text || ' ' || case when d = v_today then v_time else '12:00' end)::timestamp;
        txid := 'tx_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
        insert into public.transactions (user_id, id, type, wallet_id, category_id, amount, occurred_at, description, notes)
          values (o_user, txid, intent->>'type', wid, cid, amt, when_ts, descr, 'via chat');
        update public.chat_links set last_tx_id = txid, last_wallet_id = wid where user_id = o_user;
        select b.balance into bal from public.chat_balances(o_user) b where b.id = wid;
        dnote := case when d = v_today then '' else ' (' || d::text || ')' end;
        o_reply := '✅ ' || public.chat_t(lang, case when intent->>'type' = 'income' then 'income' else 'expense' end) || ' ' || public.chat_money(amt, wcur, lang) || dnote || E'\n'
          || clabel || ' · ' || wname || E'\n_' || descr || '_' || E'\n' || replace(public.chat_t(lang, 'balanceOf'), '{w}', wname) || ': ' || public.chat_money(bal, wcur, lang) || E'\n\n' || public.chat_t(lang, 'undoHint');
      end if;
    end if;
  end if;
end $$;

-- ───────── the inbox trigger: a message is processed the moment it is stored ─────────
create function public.chat_inbox_before() returns trigger language plpgsql security definer set search_path = public as $$
declare r record;
begin
  new.phone := public.chat_norm_phone(new.phone);
  if new.event_id is not null then
    perform pg_advisory_xact_lock(hashtext(new.event_id));
    if exists (select 1 from public.chat_inbox where event_id = new.event_id) then
      new.status := 'duplicate'; new.event_id := null; return new;   -- the gateway delivered it twice: do nothing
    end if;
  end if;
  begin
    select * into r from public.chat_process(new.phone, new.text);
    new.user_id := r.o_user; new.intent := r.o_intent; new.reply := r.o_reply; new.status := 'done';
  exception when others then
    -- everything chat_process did for this message is rolled back; the sender gets a plain apology
    new.status := 'error'; new.error := left(sqlerrm, 300); new.reply := public.chat_t('id', 'error') || E'\n' || public.chat_t('en', 'error');
    new.user_id := (select user_id from public.chat_links where phone = new.phone);
  end;
  return new;
end $$;

create trigger chat_inbox_process before insert on public.chat_inbox for each row execute function public.chat_inbox_before();

-- Old messages: linked ones 90 days, strangers' 7 days. Called now and then by the Edge Function.
create function public.chat_cleanup() returns void language sql security definer set search_path = public as $$
  delete from public.chat_inbox where (user_id is not null and received_at < now() - interval '90 days') or (user_id is null and received_at < now() - interval '7 days');
$$;

-- ───────── linking (called by the signed-in app) ─────────
create function public.create_chat_link_code() returns text
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
      null; -- another user holds this code right now: try a different one
    end;
  end loop;
end $$;

-- ───────── who may run what ─────────
revoke execute on function public.chat_norm(text), public.chat_esc(text), public.chat_has_word(text, text), public.chat_norm_phone(text), public.chat_amounts(text),
  public.chat_pick_amount(text), public.chat_find_date(text, date), public.chat_match_category(text, text, jsonb), public.chat_find_wallets(text, jsonb),
  public.chat_describe(text, jsonb, text), public.chat_parse(text, jsonb, jsonb, date), public.chat_t(text, text), public.chat_money(numeric, text, text),
  public.chat_cat_label(text, text, text), public.chat_balances(uuid), public.chat_process(text, text), public.chat_cleanup(), public.chat_inbox_before(),
  public.create_chat_link_code() from public, anon, authenticated;
grant execute on function public.chat_balances(uuid), public.chat_process(text, text), public.chat_cleanup() to service_role;
grant execute on function public.create_chat_link_code() to authenticated;

-- Live updates for the web app (Supabase Realtime); skipped on a plain Postgres.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.chat_inbox;
  end if;
end $$;
