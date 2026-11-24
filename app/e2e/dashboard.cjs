const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const { boot, ok, done, readData, digits } = require('./common.cjs');
const SP = process.argv[2] || 'e2e-output';
(async () => {
  const { b, p, errs, phone } = await boot();
  // ---- accuracy: every range's KPI equals an independent recomputation from raw storage
  const data = await readData(p);
  const wcur = Object.fromEntries(data.wallets.map((w) => [w.id, w.currency]));
  const rate = (c) => (c === 'IDR' ? 1 : (data.rates.find((r) => r.code === c) || {}).rate);
  const pad = (n) => String(n).padStart(2, '0'); const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date(); const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const from = { '7D': () => new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() - 6), '1M': () => new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() - 29), '3M': () => new Date(t0.getFullYear(), t0.getMonth() - 2, 1), '6M': () => new Date(t0.getFullYear(), t0.getMonth() - 5, 1), '1Y': () => new Date(t0.getFullYear(), t0.getMonth() - 11, 1) };
  const total = (type, f, t) => Math.round(data.transactions.filter((x) => x.type === type && x.occurredAt.slice(0, 10) >= f && x.occurredAt.slice(0, 10) <= t).reduce((s, x) => s + (x.amount * rate(wcur[x.walletId])) / 100, 0));
  const labels = { '7D': '7 hari terakhir', '1M': '30 hari terakhir', '3M': '3 bulan terakhir', '6M': '6 bulan terakhir', '1Y': '12 bulan terakhir' };
  for (const r of ['7D', '1M', '3M', '6M', '1Y']) {
    await p.getByRole('button', { name: labels[r], exact: true }).click(); await p.waitForTimeout(150);
    const kpis = await p.locator('.stat-tile .st-full').allInnerTexts();
    const inc = total('income', ymd(from[r]()), ymd(t0)), exp = total('expense', ymd(from[r]()), ymd(t0));
    ok(digits(kpis[0]) === inc && digits(kpis[1]) === exp, `${r}: income ${kpis[0]} = ${inc}, expense ${kpis[1]} = ${exp} (independent recomputation)`);
    ok(digits(kpis[2].replace('+', '')) === inc - exp, `${r}: net = income − expense`);
  }
  ok((await p.locator('.chart-hit').count()) === 12, '1Y chart has 12 monthly buckets');
  await p.getByRole('button', { name: '7 hari terakhir', exact: true }).click(); await p.waitForTimeout(150);
  ok((await p.locator('.chart-hit').count()) === 7, '7D chart has 7 daily buckets');
  await p.locator('.chart-hit').nth(3).hover(); ok(await p.locator('.chart-tip').isVisible(), 'chart tooltip appears on hover (7D)');
  await p.getByRole('button', { name: '30 hari terakhir', exact: true }).click();
  // ---- balance hiding
  const total0 = await p.locator('.hero-amount').innerText();
  await p.getByRole('button', { name: 'Sembunyikan saldo' }).click();
  ok(/•/.test(await p.locator('.hero-amount').innerText()) && !/\d/.test(await p.locator('.hero-amount').innerText()), 'hide balance masks the hero amount: ' + (await p.locator('.hero-amount').innerText()));
  ok(/•/.test(await p.locator('.dash-wallets .amount').first().innerText()), 'wallet list balances are masked too');
  await p.reload(); await p.getByText('Total saldo').waitFor();
  ok(/•/.test(await p.locator('.hero-amount').innerText()), 'preference survives a reload');
  await p.getByRole('button', { name: 'Tampilkan saldo' }).click();
  ok((await p.locator('.hero-amount').innerText()) === total0, 'show balance restores the exact amount');
  ok(digits(total0) === Math.round(data.wallets.reduce((s, w) => s + (w.initialBalance + data.transactions.reduce((a, t) => a + (t.type === 'income' && t.walletId === w.id ? t.amount : t.type === 'expense' && t.walletId === w.id ? -t.amount : t.type === 'transfer' ? (t.walletId === w.id ? -t.amount : 0) + (t.toWalletId === w.id ? (t.toAmount ?? t.amount) : 0) : 0), 0)) * rate(w.currency) / 100, 0)), 'total balance equals independent Σ(initial + movements)');
  await p.screenshot({ path: SP + '/d-light.png', fullPage: true });
  // ---- phone
  const m = await phone();
  for (const w of [390, 360, 320]) {
    await m.setViewportSize({ width: w, height: 800 }); await m.goto(BASE + '/#/'); await m.getByText('Total saldo').waitFor(); await m.waitForTimeout(400);
    const sw = await m.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= w, `dashboard fits a ${w}px phone (scrollWidth ${sw})`);
  }
  await m.setViewportSize({ width: 390, height: 844 }); await m.goto(BASE + '/#/'); await m.waitForTimeout(300);
  ok((await m.locator('.fab').count()) === 0, 'no floating action button');
  await m.getByRole('button', { name: 'Tambah transaksi' }).first().click();
  ok(await m.locator('.modal').isVisible(), 'header + opens the transaction form on a phone');
  await m.screenshot({ path: SP + '/m-form.png' });
  await m.keyboard.press('Escape');
  await m.screenshot({ path: SP + '/m-top.png' });
  // order of sections on the phone = PRD 4.2: hero, summary, chart, budget, recent, insights
  const order = await m.evaluate(() => [...document.querySelectorAll('.dash-hero, .dash-summary, .dash-chart, .dash-recent, .dash-budget, .dash-insights')].map((e) => e.className.split(' ')[0].replace('dash-', '')));
  ok(order.join(',') === 'hero,summary,chart,budget,recent,insights', 'section order on phone: ' + order.join(' › '));
  // dark
  await p.getByRole('button', { name: 'Ganti tema' }).click(); await p.waitForTimeout(400);
  await p.screenshot({ path: SP + '/d-dark.png', fullPage: true });
  done(errs); await b.close();
})().catch((e) => { console.error('FAIL(script)', e.message); process.exit(1); });
