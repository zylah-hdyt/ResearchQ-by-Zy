-- Chat channel tests. Run after the stub and all migrations (see README.md). Prints failures, ends with an error if any.
\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned
\set A '00000000-0000-0000-0000-00000000000a'
\set B '00000000-0000-0000-0000-00000000000b'

create temp table t_results (n serial, name text, ok boolean, detail text);
create function pg_temp.chk(name text, ok boolean, detail text default '') returns void language sql security definer as $$ insert into t_results (name, ok, detail) values (name, coalesce(ok, false), detail) $$;

-- users (the sign-up trigger creates profiles and the 17 built-in categories)
insert into auth.users (id, email) values (:'A', 'a@x'), (:'B', 'b@x');

-- ═════════ 1. parsing (pure) ═════════
create temp table fx as select
  '[{"id":"w_bca","name":"BCA","currency":"IDR"},{"id":"w_cash","name":"Tunai","currency":"IDR"},{"id":"w_gopay","name":"GoPay","currency":"IDR"},{"id":"w_bcat","name":"BCA Tahapan","currency":"IDR"},{"id":"w_old","name":"Lama","currency":"IDR","archived":true}]'::jsonb as w,
  (select jsonb_agg(jsonb_build_object('id', id, 'key', key, 'name', name, 'type', type)) || '[{"id":"c_kucing","name":"Kucing","type":"expense"}]'::jsonb from public.categories where user_id = :'A') as c;
create function pg_temp.p(t text) returns jsonb language sql as $$ select public.chat_parse(t, (select w from fx), (select c from fx), date '2026-11-24') $$;
create function pg_temp.amt(t text) returns text language sql as $$ select coalesce((public.chat_pick_amount(lower(t))->'hit'->>'value'), public.chat_pick_amount(lower(t))->>'error') $$;

select pg_temp.chk('amount ' || t, pg_temp.amt(t) = v::text) from (values
  ('25rb', 25000), ('25 rb', 25000), ('25ribu', 25000), ('25k', 25000), ('1,5jt', 1500000), ('1.5jt', 1500000), ('2jt', 2000000), ('2 juta', 2000000),
  ('Rp 25.000', 25000), ('rp25.000', 25000), ('1.250.000', 1250000), ('25000', 25000), ('makan 15.500', 15500), ('bensin 50k', 50000), ('gaji 12,5jt', 12500000),
  ('beli 2 kopi 50rb', 50000), ('kopi 2 gelas 30000', 30000), ('25rb (25rb)', 25000)) as x(t, v);
select pg_temp.chk('amount refuses two strong amounts', pg_temp.amt('makan 25rb dan parkir 5rb') = 'ambiguous-amount');
select pg_temp.chk('amount none', pg_temp.amt('makan siang') = 'no-amount');
select pg_temp.chk('amount ignores dates', public.chat_amounts('5/11 makan 20rb')->0->>'value' = '20000' and jsonb_array_length(public.chat_amounts('5/11 makan 20rb')) = 1);

select pg_temp.chk('parse: ' || t, pg_temp.p(t) @> e::jsonb, pg_temp.p(t)::text) from (values
  ('makan siang 25rb', '{"kind":"transaction","type":"expense","amount":25000,"categoryId":"cat_food","description":"Makan siang","date":"2026-11-24"}'),
  ('gaji 5jt', '{"type":"income","amount":5000000,"categoryId":"cat_salary"}'),
  ('bensin 50rb pakai bca', '{"type":"expense","amount":50000,"walletId":"w_bca","categoryId":"cat_transport","description":"Bensin"}'),
  ('makan 30rb bca tahapan', '{"walletId":"w_bcat"}'),
  ('+200rb ojek', '{"type":"income"}'),
  ('-15rb parkir', '{"type":"expense","categoryId":"cat_transport"}'),
  ('kopi 18rb kemarin', '{"date":"2026-11-23","description":"Kopi"}'),
  ('listrik 350rb 3 hari lalu', '{"date":"2026-11-21","categoryId":"cat_utilities"}'),
  ('pasir kucing 85rb', '{"categoryId":"c_kucing"}'),
  ('lunch 45k', '{"type":"expense","amount":45000,"categoryId":"cat_food"}'),
  ('xyz 10rb', '{"categoryId":"cat_other_out"}'),
  ('terima 100rb', '{"type":"income","categoryId":"cat_other_in"}'),
  ('beli 2 baju 300rb', '{"amount":300000,"categoryId":"cat_shopping"}'),
  ('transfer 500rb bca ke gopay', '{"kind":"transfer","amount":500000,"fromId":"w_bca","toId":"w_gopay"}'),
  ('tf dari bca ke tunai 200rb', '{"fromId":"w_bca","toId":"w_cash","amount":200000}'),
  ('pindah 1jt ke gopay dari bca', '{"fromId":"w_bca","toId":"w_gopay"}'),
  ('transfer 500rb bca', '{"kind":"unknown","reason":"transfer-wallets"}'),
  ('transfer 500rb', '{"kind":"unknown","reason":"transfer-wallets"}'),
  ('transfer 100rb bca ke bca', '{"kind":"unknown"}'),
  ('saldo', '{"kind":"balance"}'), ('Cek Saldo', '{"kind":"balance"}'), ('hari ini', '{"kind":"today"}'), ('bulan ini', '{"kind":"month"}'), ('anggaran', '{"kind":"budget"}'),
  ('batal', '{"kind":"undo"}'), ('undo', '{"kind":"undo"}'), ('bantuan', '{"kind":"help"}'), ('halo', '{"kind":"help"}'), ('?', '{"kind":"help"}'),
  ('MYFI-482913', '{"kind":"link","code":"482913"}'), ('hubungkan 482913', '{"kind":"link","code":"482913"}'),
  ('   ', '{"kind":"unknown","reason":"empty"}'), ('makan siang', '{"kind":"unknown","reason":"no-amount"}')) as x(t, e);
select pg_temp.chk('parse: archived wallet is never chosen', pg_temp.p('makan 30rb lama')->'walletId' = 'null'::jsonb);
select pg_temp.chk('parse: matchCategory restricts to the type', public.chat_match_category('gaji', 'expense', (select c from fx))->>'key' = 'otherExpense');
select pg_temp.chk('phone: ' || i, public.chat_norm_phone(i) = o) from (values ('0812-3456-7890', '6281234567890'), ('+62 812 3456 7890', '6281234567890'), ('6281234567890', '6281234567890')) x(i, o);

-- ═════════ 2. conversation against real tables ═════════
insert into public.wallets (user_id, id, name, type, currency, initial_balance, created_at) values
  (:'A', 'w_bca', 'BCA', 'bank', 'IDR', 100000000, now() - interval '3 hours'), (:'A', 'w_cash', 'Tunai', 'cash', 'IDR', 0, now() - interval '2 hours'),
  (:'A', 'w_usd', 'Dolar', 'bank', 'USD', 50000, now() - interval '1 hour'), (:'A', 'w_old', 'Lama', 'cash', 'IDR', 0, now());
update public.wallets set archived = true where id = 'w_old';
insert into public.chat_link_codes (user_id, code, expires_at) values (:'A', '482913', now() + interval '10 minutes');

create function pg_temp.send(text, text default '0812 3456 7890', text default null) returns text language plpgsql as $$
declare r text; begin insert into public.chat_inbox (phone, text, event_id) values ($2, $1, $3) returning reply into r; return r; end $$;
create function pg_temp.txs() returns bigint language sql as $$ select count(*) from public.transactions where user_id = '00000000-0000-0000-0000-00000000000a' $$;
create function pg_temp.last_tx() returns public.transactions language sql as $$ select t from public.transactions t where user_id = '00000000-0000-0000-0000-00000000000a' order by created_at desc, id desc limit 1 $$;
create function pg_temp.fm(n numeric) returns text language sql as $$ select replace(to_char(n, 'FM999,999,999,999'), ',', '.') $$;

set role service_role;
select pg_temp.send('makan siang 25rb') as reply \gset
select pg_temp.chk('unknown number is told how to link, nothing recorded', :'reply' ~ 'belum terhubung' and pg_temp.txs() = 0);
select pg_temp.send('MYFI-111111') as reply \gset
select pg_temp.chk('wrong code does not link', :'reply' ~ 'salah atau sudah kedaluwarsa' and (select count(*) from public.chat_links) = 0);
select pg_temp.send('MYFI-482913') as reply \gset
select pg_temp.chk('valid code links the normalised number, once', :'reply' ~ 'Terhubung' and (select string_agg(phone, ',') from public.chat_links) = '6281234567890' and (select count(*) from public.chat_link_codes) = 0, :'reply');
select pg_temp.chk('the same number written differently is the same account', pg_temp.send('saldo', '+62 812-3456-7890') ~ 'BCA');
select pg_temp.chk('an expired code is refused', (select pg_temp.send('MYFI-555555', '081111111111') ~ 'salah' from (select 1) z));

-- recording
select pg_temp.send('makan siang 25rb') as reply \gset
select pg_temp.chk('expense: minor units, first active wallet, category, description, WIB time',
  (pg_temp.last_tx()).type = 'expense' and (pg_temp.last_tx()).wallet_id = 'w_bca' and (pg_temp.last_tx()).category_id = 'cat_food' and (pg_temp.last_tx()).amount = 2500000
  and (pg_temp.last_tx()).description = 'Makan siang' and (pg_temp.last_tx()).occurred_at::date = (now() at time zone 'Asia/Jakarta')::date, (pg_temp.last_tx())::text);
select pg_temp.chk('expense reply states amount, category, wallet and the real balance', :'reply' ~ 'Pengeluaran Rp 25\.000' and :'reply' ~ 'Makan & minum · BCA' and :'reply' ~ ('Saldo BCA: Rp ' || pg_temp.fm((100000000 - 2500000) / 100)), :'reply');
select pg_temp.send('gaji 5jt tunai') as reply \gset
select pg_temp.chk('income in a named wallet', (pg_temp.last_tx()).type = 'income' and (pg_temp.last_tx()).wallet_id = 'w_cash' and (pg_temp.last_tx()).amount = 500000000 and (pg_temp.last_tx()).category_id = 'cat_salary');
select pg_temp.send('kopi 18rb') as _r \gset
select pg_temp.chk('the wallet used last is remembered', (pg_temp.last_tx()).wallet_id = 'w_cash');
select pg_temp.send('kopi 18rb kemarin') as _r \gset
select pg_temp.chk('yesterday keeps the date and uses noon', (pg_temp.last_tx()).occurred_at = ((now() at time zone 'Asia/Jakarta')::date - 1)::timestamp + interval '12 hours');
select pg_temp.send('makan 10rb lama') as _r \gset
select pg_temp.chk('archived wallets are never used', (pg_temp.last_tx()).wallet_id <> 'w_old');
select pg_temp.txs() as n0 \gset
select pg_temp.send('makan 25rb dan parkir 5rb') as reply \gset
select pg_temp.chk('two different amounts record nothing', pg_temp.txs() = :n0 and :'reply' ~ 'lebih dari satu nominal');
select pg_temp.send('makan siang') as reply \gset
select pg_temp.chk('no amount records nothing', pg_temp.txs() = :n0 and :'reply' ~ 'nominalnya');
select pg_temp.send('beli 999000jt') as reply \gset
select pg_temp.chk('an absurd amount is refused', pg_temp.txs() = :n0 and :'reply' ~ 'terlalu besar');
select pg_temp.send('makan 25rb', '0812 3456 7890', 'evt-1') is not null as first_ok \gset
select pg_temp.chk('a delivery id is recorded once', :'first_ok'::boolean and pg_temp.send('makan 25rb', '0812 3456 7890', 'evt-1') is null and pg_temp.txs() = :n0 + 1, (select string_agg(status, ',') from public.chat_inbox where text = 'makan 25rb'));

-- transfers
select coalesce(sum(balance) filter (where currency = 'IDR'), 0) as before_total from public.chat_balances(:'A') \gset
select pg_temp.txs() as n1 \gset
select pg_temp.send('transfer 500rb bca ke tunai') as reply \gset
select pg_temp.chk('same-currency transfer is one transaction with both amounts', pg_temp.txs() = :n1 + 1 and (pg_temp.last_tx()).type = 'transfer' and (pg_temp.last_tx()).wallet_id = 'w_bca' and (pg_temp.last_tx()).to_wallet_id = 'w_cash' and (pg_temp.last_tx()).amount = 50000000 and (pg_temp.last_tx()).to_amount = 50000000);
select coalesce(sum(balance) filter (where currency = 'IDR'), 0) as after_total from public.chat_balances(:'A') \gset
select pg_temp.chk('a transfer leaves the total unchanged', :before_total = :after_total);
select pg_temp.send('transfer 500rb bca ke dolar') as reply \gset
select pg_temp.chk('transfer across currencies is refused', pg_temp.txs() = :n1 + 1 and :'reply' ~ 'beda mata uang');

-- undo
delete from public.transactions where user_id = :'A';
update public.chat_links set last_tx_id = null;
select pg_temp.send('makan 25rb') as _r \gset
select pg_temp.send('kopi 18rb') as _r \gset
select pg_temp.send('batal') as reply \gset
select pg_temp.chk('undo removes the last chat entry', :'reply' ~ 'Dibatalkan: Kopi' and pg_temp.txs() = 1);
select pg_temp.send('batal') as reply \gset
select pg_temp.chk('undo twice does nothing more', :'reply' ~ 'Tidak ada catatan terakhir' and pg_temp.txs() = 1);

-- reports
delete from public.transactions where user_id = :'A';
select pg_temp.send('gaji 1jt') as _r \gset
select pg_temp.send('makan 25rb') as _r \gset
select pg_temp.send('transfer 300rb bca ke tunai') as _r \gset
select pg_temp.send('hari ini') as reply \gset
select pg_temp.chk('today totals exclude transfers', :'reply' ~ 'Pemasukan: Rp 1\.000\.000' and :'reply' ~ 'Pengeluaran: Rp 25\.000' and :'reply' ~ 'Bersih: Rp 975\.000', :'reply');
select pg_temp.send('bulan ini') as reply \gset
select pg_temp.chk('month totals equal an independent sum', :'reply' ~ ('Bersih: Rp ' || pg_temp.fm(1000000 - 25000)), :'reply');
select pg_temp.send('saldo') as reply \gset
select pg_temp.chk('balance lists active wallets, totals the base currency only', :'reply' ~ 'BCA: Rp ' and :'reply' ~ 'Dolar: USD 500,00' and :'reply' !~ 'Lama' and :'reply' ~ 'Total \(IDR\):\*', :'reply');
select pg_temp.chk('balance figures equal an independent computation', :'reply' ~ ('BCA: Rp ' || pg_temp.fm((100000000 + 100000000 - 2500000 - 30000000) / 100)) and :'reply' ~ ('Tunai: Rp ' || pg_temp.fm(30000000 / 100)), :'reply');
delete from public.transactions where user_id = :'A'; update public.chat_links set last_tx_id = null;
insert into public.budgets (user_id, id, category_id, amount, currency, period) values (:'A', 'b1', 'cat_food', 10000000, 'IDR', 'monthly');
select pg_temp.send('makan 90rb') as _r \gset
select pg_temp.send('anggaran') as reply \gset
select pg_temp.chk('budget shows status and percentage', :'reply' ~ '🟠 Makan & minum: Rp 90\.000 / Rp 100\.000 \(90%\)', :'reply');
select pg_temp.send('bantuan') as reply \gset
select pg_temp.chk('help lists the commands', :'reply' ~ '\*Catat\*');

-- language
reset role; update public.profiles set language = 'en' where user_id = :'A'; set role service_role;
select pg_temp.send('lunch 25k') as reply \gset
select pg_temp.chk('replies follow the account language', :'reply' ~ 'Expense Rp 25\.000' and :'reply' ~ 'Type \*undo\*', :'reply');
select pg_temp.send('balance') as reply \gset
select pg_temp.chk('english balance', :'reply' ~ '\*Balances\*' and :'reply' ~ 'Dolar: USD 500\.00', :'reply');
reset role; update public.profiles set language = 'id' where user_id = :'A'; set role service_role;

-- a failure rolls back everything for that message and still answers
reset role; alter table public.transactions add constraint boom check (description <> 'Boom'); set role service_role;
select pg_temp.txs() as n2 \gset
select pg_temp.send('boom 10rb') as reply \gset
select pg_temp.chk('a failing message records nothing and the sender gets an apology', pg_temp.txs() = :n2 and :'reply' ~ 'Maaf' and (select status from public.chat_inbox order by id desc limit 1) = 'error');
reset role; alter table public.transactions drop constraint boom;

-- every message is kept with its outcome
select pg_temp.chk('inbox keeps status and intent', (select count(*) from public.chat_inbox where status = 'done' and intent = 'transaction') >= 5 and (select count(*) from public.chat_inbox where status = 'duplicate') = 1);

-- ═════════ 3. who can see or change what ═════════
set role authenticated; select set_config('request.jwt.claim.sub', :'A', false) as _x \gset
select pg_temp.chk('A reads own messages without the phone column', (select count(*) from public.chat_inbox) > 5 and (select count(*) from public.chat_inbox where user_id <> :'A') = 0);
select pg_temp.chk('A cannot select the phone column', not exists (select 1 from information_schema.column_privileges where grantee = 'authenticated' and table_name = 'chat_inbox' and column_name = 'phone' and privilege_type = 'SELECT'));
select pg_temp.chk('A cannot read raw payloads, codes or keywords', (select count(*) from public.chat_inbox_raw) = 0 and (select count(*) from public.chat_link_codes) = 0 and (select count(*) from public.chat_keywords) = 0);
select public.create_chat_link_code() ~ '^[0-9]{6}$' as ok \gset
select pg_temp.chk('A can create a code', :'ok'::boolean);
set role authenticated; select set_config('request.jwt.claim.sub', :'B', false) as _x \gset
select pg_temp.chk('B sees none of A''s messages or link', (select count(*) from public.chat_inbox) = 0 and (select count(*) from public.chat_links) = 0);
create function pg_temp.denied(q text) returns boolean language plpgsql as $$
begin execute q; return false; exception when insufficient_privilege then return true; end $$;
set role authenticated; select set_config('request.jwt.claim.sub', :'B', false) as _x \gset
select pg_temp.denied($q$insert into public.chat_inbox (phone, text) values ('6281', 'makan 1rb')$q$) as d1 \gset
select pg_temp.denied($q$insert into public.chat_links (user_id, phone) values ('00000000-0000-0000-0000-00000000000b', '6289999999999')$q$) as d2 \gset
select pg_temp.denied($q$delete from public.chat_inbox$q$) as d3 \gset
select pg_temp.denied($q$insert into public.chat_link_codes (user_id, code, expires_at) values ('00000000-0000-0000-0000-00000000000b', '123456', now() + interval '1 day')$q$) as d4 \gset
update public.chat_links set phone = '6280000000000';
reset role;
select pg_temp.chk('clients cannot insert inbox rows, links or codes, nor delete messages', :'d1'::boolean and :'d2'::boolean and :'d3'::boolean and :'d4'::boolean, :'d1' || :'d2' || :'d3' || :'d4');
select pg_temp.chk('clients cannot change someone else''s link', (select count(*) from public.chat_links) = 1 and (select phone from public.chat_links) = '6281234567890' and (select count(*) from public.chat_inbox where phone = '6281') = 0);
set role authenticated; select set_config('request.jwt.claim.sub', :'A', false) as _x \gset
delete from public.chat_links; reset role;
select pg_temp.chk('A can unlink', (select count(*) from public.chat_links) = 0);
select pg_temp.chk('anon cannot execute the processing functions', not has_function_privilege('anon', 'public.chat_process(text,text)', 'execute') and not has_function_privilege('authenticated', 'public.chat_process(text,text)', 'execute') and not has_function_privilege('anon', 'public.create_chat_link_code()', 'execute'));
select pg_temp.chk('link codes never collide across users', (select count(distinct code) from public.chat_link_codes) = (select count(*) from public.chat_link_codes));
delete from auth.users where id = :'A';
select pg_temp.chk('deleting an account deletes its messages and link', (select count(*) from public.chat_inbox where user_id = :'A') = 0 and (select count(*) from public.chat_links) = 0);

-- ═════════ result ═════════
select count(*) as total, count(*) filter (where not ok) as failed from t_results \gset
\echo
select 'FAILED: ' || name || ' -- ' || detail from t_results where not ok order by n;
select :total - :failed || ' of ' || :total || ' checks passed';
select (:failed > 0) as bad \gset
\if :bad
  select 1 / 0;
\endif
