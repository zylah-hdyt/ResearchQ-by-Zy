# Database tests (plain Postgres, no Supabase needed)

```bash
createdb myfi_test
psql -d myfi_test -f tests/00_supabase_stub.sql          # minimal auth schema + roles
for f in migrations/*.sql; do psql -v ON_ERROR_STOP=1 -d myfi_test -f $f; done
psql -d myfi_test -f tests/chat_channel.sql              # read the output: every line states what it expects
```
`chat_channel.sql` checks the chat tables' access rules (one user cannot see or change another's link, clients cannot write
links or read codes, duplicate/invalid numbers are rejected, account deletion removes the link, composite foreign keys hold).
