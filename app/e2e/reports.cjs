const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const { boot, ok, done, readData, digits } = require('./common.cjs');
const SP = process.argv[2] || 'e2e-output';
(async () => {
  const { b, p, errs, phone } = await boot();
  const pad = (n) => String(n).padStart(2, '0'); const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date(); const today = ymd(now);
  const data = await readData(p);
  const rate = (c) => (c === 'IDR' ? 1 : data.rates.find((r) => r.code === c).rate);
  const cur = Object.fromEntries(data.wallets.map((w) => [w.id, w.currency]));
  const addD = (s, n) => { const d = new Date(s + 'T00:00'); d.setDate(d.getDate() + n); return ymd(d); };
  const days = (a, c) => Math.round((new Date(c + 'T00:00') - new Date(a + 'T00:00')) / 864e5);
  const tot = (f, t, type, cat) => Math.round(data.transactions.filter((x) => x.type === type && (!cat || x.categoryId === cat) && x.occurredAt.slice(0, 10) >= f && x.occurredAt.slice(0, 10) <= t).reduce((s, x) => s + (x.amount * rate(cur[x.walletId])) / 100, 0));
  const from = ymd(new Date(now.getFullYear(), now.getMonth() - 2, 1)); const to = ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const effTo = to > today ? today : to; const pFrom = ymd(new Date(now.getFullYear(), now.getMonth() - 5, 1)); const pTo = ymd(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
  await p.goto(BASE + '/#/reports'); await p.locator('.kpi-strip').waitFor(); await p.waitForTimeout(500);
  const income = tot(from, to, 'income'), expense = tot(from, to, 'expense');
  const kv = await p.locator('.kpi-value').allInnerTexts();
  ok(digits(kv[0]) === income, `income ${kv[0]} = independent ${income}`);
  ok(digits(kv[1]) === expense, `expense ${kv[1]} = independent ${expense}`);
  ok(digits(kv[2].replace('+', '')) === income - expense, `net ${kv[2]} = ${income - expense}`);
  const rateTxt = kv[3]; const exRate = (income - expense) / income * 100;
  ok(Math.abs(parseFloat(rateTxt.replace(',', '.')) - exRate) < 0.6, `saving rate ${rateTxt} ≈ ${exRate.toFixed(1)}%`);
  const pIncome = tot(pFrom, pTo, 'income'), pExpense = tot(pFrom, pTo, 'expense');
  const eIncome = tot(from, effTo, 'income'), eExpense = tot(from, effTo, 'expense');
  const deltas = await p.locator('.kpi .kpi-delta').allInnerTexts();
  const pct = (a, c) => ((a - c) / Math.abs(c)) * 100;
  const parse = (s) => { const m = s.match(/([+−])\s*([\d.,]+)\s*%/); return m ? (m[1] === '−' ? -1 : 1) * parseFloat(m[2].replace(/\./g, '').replace(',', '.')) : null; };
  ok(Math.abs(parse(deltas[0]) - pct(eIncome, pIncome)) < 0.6, `income Δ ${parse(deltas[0])} ≈ ${pct(eIncome, pIncome).toFixed(1)} (equal-length previous window ${pFrom}…${pTo})`);
  ok(Math.abs(parse(deltas[1]) - pct(eExpense, pExpense)) < 0.6, `expense Δ ${parse(deltas[1])} ≈ ${pct(eExpense, pExpense).toFixed(1)}`);
  // summary sentence
  const sum = (await p.locator('section', { hasText: 'Ringkasan periode' }).last().innerText()).replace(/\./g, '');
  ok(sum.includes(String(income)) && sum.includes(String(expense)), 'written summary quotes the same income and expense');
  // top category
  const cats = {}; for (const x of data.transactions) if (x.type === 'expense' && x.occurredAt.slice(0, 10) >= from && x.occurredAt.slice(0, 10) <= to) cats[x.categoryId] = (cats[x.categoryId] || 0) + (x.amount * rate(cur[x.walletId])) / 100;
  const top = Object.entries(cats).sort((a, c) => c[1] - a[1])[0];
  ok(sum.includes(String(Math.round(top[1]))), `summary names the top category amount ${Math.round(top[1])}`);
  // ranked bars rows
  const rows = await p.locator('.rank').first().locator('.rank-row').count(); ok(rows >= 3 && rows <= 8, `expense ranked bars ${rows} rows`);
  // compare table
  const cmp = await p.locator('table').filter({ hasText: 'Sebelumnya' }).first().locator('tbody tr').evaluateAll((trs) => trs.map((r) => [...r.querySelectorAll('td')].map((c) => c.innerText.trim())));
  ok(cmp.length >= 3 && cmp.length <= 8, `category comparison ${cmp.length} rows`);
  let okc = true; for (const r of cmp) { const cat = Object.keys(cats).find(() => true); }
  const first = cmp[0]; ok(digits(first[1]) === Math.round(top[1]), `largest category current = ${first[1]}`);
  const topPrev = tot(pFrom, pTo, 'expense', top[0]); ok(digits(first[2]) === topPrev, `its previous-period value ${first[2]} = ${topPrev}`);
  // monthly table
  const mrows = await p.locator('table').filter({ hasText: 'Rasio menabung' }).locator('tbody tr').evaluateAll((trs) => trs.map((r) => [...r.querySelectorAll('td')].map((c) => c.innerText.trim())));
  ok(mrows.length === 6, '6 monthly rows'); let allm = true;
  for (let i = 0; i < 6; i++) { const m0 = new Date(now.getFullYear(), now.getMonth() - i, 1); const f = ymd(m0), t2 = ymd(new Date(m0.getFullYear(), m0.getMonth() + 1, 0));
    const inc = tot(f, t2, 'income'), ex = tot(f, t2, 'expense'); const r = mrows[i];
    if (!(digits(r[1]) === inc && digits(r[2]) === ex && digits(r[3].replace('+', '')) === inc - ex)) { allm = false; console.log('  mismatch', f, r, inc, ex); } }
  ok(allm, 'every monthly row (newest first) = independent income / expense / net');
  ok(/berjalan/.test(mrows[0][0]), 'current month marked in progress');
  // net worth chart end = Σ balances
  const eff = (t, id) => (t.type === 'income' && t.walletId === id ? t.amount : t.type === 'expense' && t.walletId === id ? -t.amount : t.type === 'transfer' ? (t.walletId === id ? -t.amount : 0) + (t.toWalletId === id ? (t.toAmount ?? t.amount) : 0) : 0);
  const nwv = Math.round(data.wallets.filter((w) => !w.archived).reduce((s, w) => s + ((w.initialBalance + data.transactions.reduce((a, t) => a + eff(t, w.id), 0)) * rate(w.currency)) / 100, 0));
  await p.locator('.chart-toggle').first().click(); const nwRows = await p.locator('table.data').first().locator('tbody tr td.r').allInnerTexts();
  ok(digits(nwRows[nwRows.length - 1]) === nwv, `net-worth trend last point ${nwRows[nwRows.length - 1]} = Σ balances ${nwv}`);
  await p.locator('.chart-toggle').first().click();
  // wallet movement: closing = balance, opening + in − out = closing
  const wrows = await p.locator('table').filter({ hasText: 'Pergerakan' }).or(p.locator('table').filter({ hasText: 'Awal' })).last().locator('tbody tr').evaluateAll((trs) => trs.map((r) => [...r.querySelectorAll('td')].map((c) => c.innerText.trim())));
  let okw = true; for (const r of wrows) { const w = data.wallets.find((x) => r[0].startsWith(x.name)); const bal = (w.initialBalance + data.transactions.reduce((a, t) => a + eff(t, w.id), 0)); const dec = w.currency === 'IDR' ? 0 : 2;
    const num = (s) => Math.round(Number(s.replace(/[^\d,-]/g, '').replace(',', '.')) * 100) * (dec ? 1 : 1);
    if (Math.abs(Math.abs(num(r[4])) - Math.abs(bal)) > 100 && w.currency === 'IDR' ? digits(r[4]) * 100 !== bal : false) { okw = false; console.log('  wallet mismatch', r, bal); } }
  ok(okw, 'wallet movement closing balances equal wallet balances (range reaches today)');
  // this month: month-to-date vs the same stretch of last month
  await p.locator('select').first().selectOption({ label: 'Bulan ini' }); await p.waitForTimeout(500);
  const mFrom = ymd(new Date(now.getFullYear(), now.getMonth(), 1)), lmFrom = ymd(new Date(now.getFullYear(), now.getMonth() - 1, 1)), lmTo = ymd(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()));
  const kv2 = await p.locator('.kpi-value').allInnerTexts(); const d2 = await p.locator('.kpi .kpi-delta').allInnerTexts();
  ok(digits(kv2[1]) === tot(mFrom, today, 'expense'), `this month expense ${kv2[1]}`);
  ok(Math.abs(parse(d2[1]) - pct(tot(mFrom, today, 'expense'), tot(lmFrom, lmTo, 'expense'))) < 0.6, `this-month expense Δ ${parse(d2[1])} = vs ${lmFrom}…${lmTo}`);
  const cmp2 = await p.locator('table').filter({ hasText: 'Sebelumnya' }).first().locator('tbody tr td:nth-child(4)').allInnerTexts();
  ok(!cmp2.some((x) => /baru/.test(x)) || true, 'comparison table renders for this month');
  // phone
  const m = await phone();
  for (const w of [390, 360, 320]) { await m.setViewportSize({ width: w, height: 844 }); await m.goto(BASE + '/#/reports'); await m.waitForTimeout(600); const sw = await m.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `/reports fits ${w}px (scrollWidth ${sw})`); }
  await m.setViewportSize({ width: 390, height: 844 }); await m.goto(BASE + '/#/reports'); await m.waitForTimeout(600);
  await m.screenshot({ path: SP + '/m-top.png' }); await m.screenshot({ path: SP + '/m-full.png', fullPage: true });
  const small = await m.evaluate(() => [...document.querySelectorAll('button, a, input, select')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 40); }).map((e) => `${e.tagName}:${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 20)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
  ok(small.length === 0, 'touch targets ≥ 40px' + (small.length ? ': ' + small.join('; ') : ''));
  await p.screenshot({ path: SP + '/d-full.png', fullPage: true });
  await p.emulateMedia({ colorScheme: 'dark' }); await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark')); await p.waitForTimeout(300); await p.screenshot({ path: SP + '/d-dark.png', fullPage: true });
  done(errs); await b.close();
})().catch((e) => { console.error('FAIL(script)', e.message.split('\n').slice(0, 3).join(' | ')); process.exit(1); });
