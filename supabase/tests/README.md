# Database tests (plain Postgres, no Supabase needed)

```bash
# any Postgres 14+ you can create databases in (libpq variables: PGHOST, PGPORT, PGUSER, PGPASSWORD)
./tests/run.sh
```
`run.sh` builds a throwaway database from `tests/00_supabase_stub.sql` (a minimal `auth` schema and the Supabase roles) plus
every migration, then runs `tests/chat_channel.sql`: parsing, the conversation against real tables, and who can see or change what.
It prints failed checks and exits non-zero if any fail. CI runs it on every pull request.
