\set A '00000000-0000-0000-0000-00000000000a'
\set B '00000000-0000-0000-0000-00000000000b'
\pset tuples_only on
\pset format unaligned
\echo '--- user A creates a code'
set role authenticated; select set_config('request.jwt.claim.sub', :'A', false);
select 'A code is 6 digits: ' || (public.create_chat_link_code() ~ '^[0-9]{6}$');
select 'A has exactly one code row (service view): see below';
reset role;
select 'code rows: ' || count(*) || ', expires in ~10 min: ' || (min(expires_at) between now() + interval '9 minutes' and now() + interval '10 minutes 5 seconds') from public.chat_link_codes;
\echo '--- calling again replaces the code (still one row)'
set role authenticated; select set_config('request.jwt.claim.sub', :'A', false);
select public.create_chat_link_code() is not null;
reset role; select 'rows after second call: ' || count(*) from public.chat_link_codes;
\echo '--- clients cannot read or write codes / events'
set role authenticated; select set_config('request.jwt.claim.sub', :'B', false);
select 'B sees code rows (must be 0): ' || count(*) from public.chat_link_codes;
select 'B sees events (must be 0): ' || count(*) from public.chat_events;
\set ON_ERROR_STOP off
insert into public.chat_link_codes(user_id, code, expires_at) values (:'B', '123456', now() + interval '1 day');
insert into public.chat_events(event_id) values ('x');
insert into public.chat_links(user_id, phone) values (:'B', '6281234567890');
reset role;
select 'rows inserted by a client (must be 0 links/events, only A code): ' || (select count(*) from public.chat_links) || '/' || (select count(*) from public.chat_events) || '/' || (select count(*) from public.chat_link_codes);
\echo '--- anon cannot create codes'
set role anon; select public.create_chat_link_code();
reset role;
\echo '--- service role links numbers; uniqueness'
set role service_role;
insert into public.chat_links(user_id, phone) values (:'A', '6281234567890');
insert into public.chat_links(user_id, phone) values (:'B', '6281234567890');
insert into public.chat_links(user_id, phone) values (:'B', 'abc');
insert into public.chat_links(user_id, phone) values (:'B', '6289999999999');
reset role;
select 'links: ' || count(*) || ' (A, B with different numbers; duplicate and bad numbers rejected)' from public.chat_links;
\echo '--- each user reads only their own link; can unlink own only'
set role authenticated; select set_config('request.jwt.claim.sub', :'A', false);
select 'A sees: ' || string_agg(phone, ',') from public.chat_links;
delete from public.chat_links;
reset role; select 'links left after A unlinks (must be 1, B kept): ' || count(*) || ' ' || string_agg(phone, ',') from public.chat_links;
set role authenticated; select set_config('request.jwt.claim.sub', :'A', false);
update public.chat_links set phone = '6280000000000';
reset role; select 'B phone unchanged after A update attempt: ' || phone from public.chat_links;
\echo '--- service role can write transactions for a user (composite FKs hold)'
set role service_role;
insert into public.wallets(user_id, id, name, type, currency) values (:'A', 'w1', 'BCA', 'bank', 'IDR');
insert into public.categories(user_id, id, key, type) values (:'A', 'cat_food', 'food', 'expense');
insert into public.transactions(user_id, id, type, wallet_id, category_id, amount, occurred_at, description, notes) values (:'A', 'tx_1', 'expense', 'w1', 'cat_food', 2500000, '2026-11-24T10:30', 'Makan siang', 'via chat');
insert into public.transactions(user_id, id, type, wallet_id, category_id, amount, occurred_at, description, notes) values (:'A', 'tx_2', 'expense', 'w_missing', 'cat_food', 100, '2026-11-24T10:30', 'x', '');
insert into public.transactions(user_id, id, type, wallet_id, category_id, amount, occurred_at, description, notes) values (:'B', 'tx_3', 'expense', 'w1', 'cat_food', 100, '2026-11-24T10:30', 'x', '');
reset role;
select 'transactions stored (must be 1; bad wallet and cross-user rejected): ' || count(*) from public.transactions;
\echo '--- deleting an account removes its link'
delete from auth.users where id = :'B';
select 'links after B deleted (must be 0): ' || count(*) from public.chat_links;
