const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const { boot, ok, done, readData, digits } = require('./common.cjs');
(async () => { const { b, p, errs } = await boot();
  const d = await readData(p); const pad = (n) => String(n).padStart(2, '0'); const now = new Date(); const ms = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const rate = (c) => (c === 'IDR' ? 1 : d.rates.find((r) => r.code === c).rate);
  const eff = (t, id) => (t.type === 'income' && t.walletId === id ? t.amount : t.type === 'expense' && t.walletId === id ? -t.amount : t.type === 'transfer' ? (t.walletId === id ? -t.amount : 0) + (t.toWalletId === id ? (t.toAmount ?? t.amount) : 0) : 0);
  const total = (before) => d.wallets.filter((w) => !w.archived).reduce((s, w) => s + ((w.initialBalance + d.transactions.filter((t) => !before || t.occurredAt.slice(0, 10) < before).reduce((a, t) => a + eff(t, w.id), 0)) * rate(w.currency)) / 100, 0);
  const pct = ((total() - total(ms)) / total(ms)) * 100;
  await p.goto(BASE + '/#/'); await p.locator('.hero-delta').waitFor();
  const shown = await p.locator('.hero-delta').innerText(); const v = parseFloat(shown.replace(/[^\d,.]/g, '').replace(',', '.')) * (/−/.test(shown) ? -1 : 1);
  ok(Math.abs(v - pct) < 0.6, `balance change "${shown.replace(/\s+/g, ' ')}" ≈ independent ${pct.toFixed(2)}% (vs ${ms})`);
  await p.locator('.hero-eye').click(); ok((await p.locator('.hero-delta').count()) === 0, 'balance change hidden together with the balance'); await p.locator('.hero-eye').click();
  ok((await p.locator('.stat-tiles .stat-icon').count()) === 3, 'three KPI tiles with icon containers');
  // transaction type tabs
  await p.goto(BASE + '/#/transactions'); await p.locator('.tx-types').waitFor(); await p.waitForTimeout(300);
  const from = ms, to = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`;
  for (const [label, type] of [['Pemasukan', 'income'], ['Pengeluaran', 'expense'], ['Transfer', 'transfer'], ['Semua', null]]) {
    await p.locator('.tx-types').getByRole('button', { name: label, exact: true }).click(); await p.waitForTimeout(250);
    const n = d.transactions.filter((t) => (!type || t.type === type) && t.occurredAt.slice(0, 10) >= from && t.occurredAt.slice(0, 10) <= to).length;
    const head = await p.locator('.page-head .muted, .page-head .sub').first().innerText();
    ok(digits(head) === n, `tab ${label}: ${head} = independent ${n}`);
  }
  ok((await p.locator('.chip.filter').count()) === 0, 'type is not duplicated as a filter chip');
  // budget ring
  await p.goto(BASE + '/#/budgets'); await p.locator('.ring').waitFor();
  const ring = await p.locator('.ring').getAttribute('aria-label'); const monthly = d.budgets.filter((x) => x.period === 'monthly');
  const cur = Object.fromEntries(d.wallets.map((w) => [w.id, w.currency]));
  const spent = monthly.reduce((s, bd) => s + d.transactions.filter((t) => t.type === 'expense' && t.categoryId === bd.categoryId && t.occurredAt.slice(0, 10) >= from && t.occurredAt.slice(0, 10) <= to).reduce((a, t) => a + (t.amount * rate(cur[t.walletId])) / 100, 0), 0);
  const lim = monthly.reduce((s, x) => s + x.amount / 100, 0);
  ok(Math.abs(parseFloat(ring) - (spent / lim) * 100) < 0.6, `budget ring "${ring}" ≈ ${((spent / lim) * 100).toFixed(1)}%`);
  done(errs); await b.close(); })().catch((e) => { console.error('FAIL(script)', e.message.split('\n')[0]); process.exit(1); });
