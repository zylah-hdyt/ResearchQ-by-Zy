#!/usr/bin/env bash
# Builds a throwaway database from the stub + every migration and runs the SQL tests.
# Uses the standard libpq variables (PGHOST, PGPORT, PGUSER, PGPASSWORD). Exits non-zero on any failure.
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${TEST_DB:-myfi_test}"
admin() { psql -v ON_ERROR_STOP=1 -q -d postgres "$@"; }
admin -c "drop database if exists $DB" -c "create database $DB"
run() { psql -v ON_ERROR_STOP=1 -q -d "$DB" "$@"; }
run -f tests/00_supabase_stub.sql
for f in migrations/*.sql; do run -f "$f"; done
run -f tests/chat_channel.sql
