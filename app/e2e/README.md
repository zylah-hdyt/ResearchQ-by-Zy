# Browser tests

Each suite checks the rendered app against an independent recomputation from the stored data (balances, totals, budgets,
reports, Excel export), plus layout (320–390 px), touch targets, themes and accessibility basics.

```bash
npm run build:e2e      # local-mode build (no Supabase, see .env.e2e)
npm run preview:e2e &  # serves it on http://localhost:4173
npm run e2e            # runs all suites; screenshots and logs go to e2e-output/
node e2e/run.cjs e2e-output reports csp   # run selected suites
```

`cloud.manual.cjs` runs against a Supabase build with a temporary account and deletes it at the end. It is not part of CI
because it creates real accounts; run it by hand after `npm run build` + `vite preview --port 4174`.
