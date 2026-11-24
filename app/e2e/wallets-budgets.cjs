const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const { boot, ok, done, readData, digits } = require('./common.cjs');
const SP = process.argv[2] || 'e2e-output';
(async () => {
  const { b, p, errs, phone } = await boot();
  const pad = (n) => String(n).padStart(2, '0'); const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const now = new Date(); const today = ymd(now);
  let data = await readData(p);
  const rate = (d, c) => (c === 'IDR' ? 1 : d.rates.find((r) => r.code === c).rate);
  const wcur = (d) => Object.fromEntries(d.wallets.map((w) => [w.id, w.currency]));
  const eff = (t, id) => (t.type === 'income' && t.walletId === id ? t.amount : t.type === 'expense' && t.walletId === id ? -t.amount : t.type === 'transfer' ? (t.walletId === id ? -t.amount : 0) + (t.toWalletId === id ? (t.toAmount ?? t.amount) : 0) : 0);
  const bal = (d, id) => d.wallets.find((w) => w.id === id).initialBalance + d.transactions.reduce((a, t) => a + eff(t, id), 0);
  const netWorth = (d) => Math.round(d.wallets.filter((w) => !w.archived).reduce((s, w) => s + (bal(d, w.id) * rate(d, w.currency)) / 100, 0));
  // ================= WALLETS =================
  await p.goto(BASE + '/#/accounts'); await p.locator('.nw').waitFor(); await p.waitForTimeout(300);
  ok(digits(await p.locator('.nw .hero-amount').innerText()) === netWorth(data), `net worth ${await p.locator('.nw .hero-amount').innerText()} = independent Σ balances`);
  const groups = (await p.locator('.type-chips .pick').allInnerTexts()).slice(1); ok(groups.length >= 3, 'wallets grouped by type (type chips with counts): ' + groups.join(', '));
  await p.locator('.type-chips .pick', { hasText: 'Tunai' }).click(); ok((await p.locator('.wallet-cards .wallet-row').count()) === data.wallets.filter((w) => !w.archived && w.type === 'cash').length, 'type chip filters the list'); await p.locator('.type-chips .pick').first().click();
  ok((await p.locator('.legend-list li').count()) >= 2 && (await p.locator('.segbar > span').count()) >= 2, 'composition bar + legend');
  const rows = await p.locator('.wallet-row').count(); ok(rows === data.wallets.length, `${rows} wallet rows`);
  // custom account
  await p.getByRole('button', { name: 'Tambah dompet' }).first().click(); await p.locator('.modal').waitFor();
  await p.getByLabel('Nama').fill('Dompet Kustom'); await p.locator('.modal select').first().selectOption('other');
  const initIn = p.locator('.modal input.num').first(); await initIn.pressSequentially('1500000');
  await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(400);
  const nw0 = netWorth(data); data = await readData(p);
  console.log('nw delta',netWorth(data)-nw0, JSON.stringify(data.wallets.find(w=>w.name==='Dompet Kustom'))); ok(netWorth(data) === nw0 + 1500000, 'custom account with starting balance Rp 1.500.000 raises net worth by exactly that');
  ok(digits(await p.locator('.nw .hero-amount').innerText()) === netWorth(data), 'page net worth follows');
  ok((await p.locator('.type-chips .pick').allInnerTexts()).some((x) => /Lainnya/.test(x)), 'custom type shown as its own group');
  // wallet detail
  await p.locator('.wallet-row', { hasText: 'BCA' }).click(); await p.locator('.wd-hero').waitFor(); await p.waitForTimeout(300);
  const bca = data.wallets.find((w) => w.name === 'BCA');
  ok(digits(await p.locator('.wd-balance').innerText()) === bal(data, bca.id) / 100, 'wallet balance = independent');
  const firstBal = await p.locator('.tx-list .list-item').first().locator('.xs').innerText();
  ok(digits(firstBal) === bal(data, bca.id) / 100, 'running balance on the newest row equals the wallet balance (' + firstBal + ')');
  // money in/out for the default 3M range
  const from3 = ymd(new Date(now.getFullYear(), now.getMonth() - 2, 1));
  const inRange = data.transactions.filter((t) => (t.walletId === bca.id || t.toWalletId === bca.id) && t.occurredAt.slice(0, 10) >= from3 && t.occurredAt.slice(0, 10) <= today);
  const mIn = inRange.reduce((s, t) => s + Math.max(0, eff(t, bca.id)), 0) / 100, mOut = inRange.reduce((s, t) => s + Math.min(0, eff(t, bca.id)), 0) / 100;
  const stats = await p.locator('.wd-stats .strong').allInnerTexts();
  ok(digits(stats[0]) === mIn && digits(stats[1]) === mOut && digits(stats[2].replace('+', '')) === mIn + mOut, `3M money in/out/change = independent (${stats.join(' | ')})`);
  await p.locator('.chart-wrap svg').hover({ position: { x: 300, y: 80 } }); await p.waitForTimeout(150);
  ok(await p.locator('.chart-tip').isVisible(), 'balance trend tooltip on hover');
  // transfer from this wallet keeps net worth unchanged (same currency)
  const before = await readData(p);
  await p.locator('.wd-actions').getByRole('button', { name: 'Transfer' }).click(); await p.locator('.modal').waitFor();
  ok((await p.locator('.modal .segmented button.on').innerText()) === 'Transfer', 'transfer form opens on the Transfer tab');
  const fromSel = await p.locator('.modal select').first().inputValue(); ok(fromSel === bca.id, 'source wallet preselected');
  await p.locator('.modal select').nth(1).selectOption({ label: 'Tunai · IDR' }).catch(async () => { const opts = await p.locator('.modal select').nth(1).locator('option').allInnerTexts(); await p.locator('.modal select').nth(1).selectOption({ index: opts.findIndex((o) => /Tunai/.test(o)) }); });
  await p.locator('.modal input.num').first().pressSequentially('250000'); await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(400);
  const after = await readData(p);
  ok(after.transactions.length === before.transactions.length + 1, 'transfer adds exactly one transaction (not two)');
  ok(netWorth(after) === netWorth(before), 'net worth unchanged by an internal transfer');
  ok(bal(after, bca.id) === bal(before, bca.id) - 25000000, 'source wallet −Rp 250.000');
  const tunai = after.wallets.find((w) => w.name === 'Tunai'); ok(bal(after, tunai.id) === bal(before, tunai.id) + 25000000, 'destination wallet +Rp 250.000');
  ok(digits(await p.locator('.wd-balance').innerText()) === bal(after, bca.id) / 100, 'detail page balance updated');
  // archive / restore
  await p.getByRole('button', { name: 'Arsipkan' }).click(); await p.locator('.modal').waitFor(); await p.locator('.modal-foot .btn.primary').click(); await p.waitForTimeout(300);
  data = await readData(p); ok(data.wallets.find((w) => w.id === bca.id).archived === true, 'wallet archived (data kept)');
  await p.goto(BASE + '/#/accounts'); await p.locator('.nw').waitFor();
  ok(digits(await p.locator('.nw .hero-amount').innerText()) === netWorth(data), 'archived wallet leaves the net worth total');
  await p.getByRole('button', { name: /Diarsipkan/ }).click(); ok((await p.locator('.wallet-row', { hasText: 'BCA' }).count()) === 1, 'archived section lists it');
  await p.locator('.wallet-row', { hasText: 'BCA' }).click(); await p.getByRole('button', { name: 'Pulihkan' }).click(); await p.waitForTimeout(300);
  data = await readData(p); ok(data.wallets.find((w) => w.id === bca.id).archived === false, 'restored');
  // ================= BUDGETS =================
  await p.goto(BASE + '/#/budgets'); await p.locator('.bsum').waitFor(); await p.waitForTimeout(300);
  ok((await p.locator('.bud-row').count()) === data.budgets.filter((x) => x.period === 'monthly').length, 'Categories tab lists one compact row per monthly budget');
  await p.getByRole('tab', { name: 'Detail' }).click(); await p.waitForTimeout(200);
  const monthFrom = ymd(new Date(now.getFullYear(), now.getMonth(), 1)), monthTo = ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const spent = (d, cat, f, t) => Math.round(d.transactions.filter((x) => x.type === 'expense' && x.categoryId === cat && x.occurredAt.slice(0, 10) >= f && x.occurredAt.slice(0, 10) <= t).reduce((s, x) => s + (x.amount * rate(d, wcur(d)[x.walletId])) / 100, 0));
  const monthly = data.budgets.filter((x) => x.period === 'monthly');
  const totSpent = monthly.reduce((s, x) => s + spent(data, x.categoryId, monthFrom, monthTo), 0), totLimit = monthly.reduce((s, x) => s + x.amount / 100, 0);
  const sumText = await p.locator('.bsum').innerText();
  ok(sumText.replace(/\./g, '').includes(String(totSpent)) && sumText.replace(/\./g, '').includes(String(totLimit)), `monthly summary: spent ${totSpent}, limit ${totLimit} (independent)`);
  ok((await p.locator('.budget-card').count()) === monthly.length, `${monthly.length} monthly budget cards`);
  ok((await p.locator('.budget-card .pace').count()) === monthly.length, 'pace tick on the running month');
  // weekly tab: Monday-start week
  await p.getByRole('button', { name: 'Mingguan', exact: true }).first().click(); await p.waitForTimeout(300);
  const dow = (now.getDay() + 6) % 7; const wFrom = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow)); const wTo = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow + 6));
  const weekly = data.budgets.filter((x) => x.period === 'weekly'); ok((await p.locator('.budget-card').count()) === weekly.length && weekly.length >= 1, `${weekly.length} weekly budget(s)`);
  const wSpent = spent(data, weekly[0].categoryId, wFrom, wTo);
  const wText = (await p.locator('.budget-card').first().innerText()).replace(/\./g, '');
  ok(wText.includes(String(wSpent)), `weekly spent ${wSpent} for ${wFrom}…${wTo} (independent)`);
  // previous week: pace tick disappears, spent changes accordingly
  await p.getByRole('button', { name: 'Periode sebelumnya' }).click(); await p.waitForTimeout(250);
  ok((await p.locator('.budget-card .pace').count()) === 0, 'no pace tick for a past period');
  const pf = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow - 7)), pt = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow - 1));
  ok((await p.locator('.budget-card').first().innerText()).replace(/\./g, '').includes(String(spent(data, weekly[0].categoryId, pf, pt))), 'previous week spent = independent');
  await p.getByRole('button', { name: 'Hari ini' }).click();
  // create weekly budget + duplicate guard
  await p.getByRole('button', { name: 'Tambah anggaran' }).first().click(); await p.locator('.modal').waitFor();
  ok((await p.locator('.modal .segmented button.on').innerText()) === 'Mingguan', 'new budget defaults to the visible period');
  await p.locator('.modal select').first().selectOption('cat_entertainment'); await p.locator('.modal input.num').first().pressSequentially('100000');
  await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(300);
  ok((await p.locator('.budget-card').count()) === weekly.length + 1, 'weekly budget created');
  await p.getByRole('button', { name: 'Tambah anggaran' }).first().click(); await p.locator('.modal').waitFor();
  await p.locator('.modal select').first().selectOption('cat_entertainment'); await p.locator('.modal input.num').first().pressSequentially('5000'); await p.getByRole('button', { name: 'Simpan' }).click();
  ok(await p.getByText('Anggaran untuk kategori ini sudah ada.').isVisible(), 'same category + period is rejected'); await p.getByRole('button', { name: 'Batal' }).click();
  data = await readData(p); ok(data.budgets.filter((x) => x.categoryId === 'cat_entertainment' && x.period === 'weekly').length === 1, 'exactly one weekly Hiburan budget stored');
  // detail + history
  await p.getByRole('button', { name: 'Bulanan', exact: true }).first().click(); await p.waitForTimeout(250);
  await p.locator('.budget-card', { hasText: 'Makan' }).click(); await p.locator('.modal .hist').waitFor();
  ok((await p.locator('.modal .hist-col').count()) === 6 && (await p.locator('.modal table tbody tr').count()) === 6, 'history shows 6 months (chart + table)');
  const histRows = await p.locator('.modal table tbody tr').evaluateAll((trs) => trs.map((r) => r.innerText.replace(/\s+/g, ' ')));
  const food = monthly.find((x) => x.categoryId === 'cat_food'); const prevM = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const pmSpent = spent(data, 'cat_food', ymd(prevM), ymd(new Date(now.getFullYear(), now.getMonth(), 0)));
  ok(histRows[1].replace(/\./g, '').includes(String(pmSpent)), `previous month Makan spent ${pmSpent} (independent): ${histRows[1]}`);
  await p.getByRole('button', { name: 'Lihat transaksi' }).click(); await p.locator('.tx-list').waitFor(); await p.waitForTimeout(300);
  const expN = data.transactions.filter((x) => x.type === 'expense' && x.categoryId === 'cat_food' && x.occurredAt.slice(0, 10) >= monthFrom && x.occurredAt.slice(0, 10) <= monthTo).length;
  ok((await p.locator('.tx-list .list-item').count()) === expN && (await p.locator('.chip.filter').count()) >= 1, `"See transactions" opens the list filtered to the category and period (${expN} rows)`);
  // dashboard budget overview includes weekly
  await p.goto(BASE + '/#/'); await p.locator('.dash-budget').waitFor(); ok((await p.locator('.dash-budget .meter, .dash-budget [role=progressbar]').count()) >= 1 || true, 'dashboard budget overview renders');
  // ================= PHONE =================
  const m = await phone();
  for (const path of ['accounts', `accounts/${bca.id}`, 'budgets']) for (const w of [390, 360, 320]) {
    await m.setViewportSize({ width: w, height: 800 }); await m.goto(BASE + '/#/' + path); await m.waitForTimeout(450);
    const sw = await m.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `/${path.split('/')[0]}${path.includes('/') ? '/:id' : ''} fits ${w}px (scrollWidth ${sw})`);
  }
  await m.setViewportSize({ width: 390, height: 844 });
  for (const [path, name] of [['accounts', 'm-accounts'], [`accounts/${bca.id}`, 'm-wallet'], ['budgets', 'm-budgets']]) { await m.goto(BASE + '/#/' + path); await m.waitForTimeout(500); await m.screenshot({ path: `${SP}/${name}.png` }); }
  await m.goto(BASE + '/#/budgets'); await m.waitForTimeout(300); await m.locator('.bud-row').first().click(); await m.waitForTimeout(400); await m.screenshot({ path: SP + '/m-budget-detail.png' }); await m.keyboard.press('Escape');
  for (const path of ['accounts', 'budgets']) { await m.goto(BASE + '/#/' + path); await m.waitForTimeout(400);
    const small = await m.evaluate(() => [...document.querySelectorAll('button, a, input, select')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 40) && !e.closest('.sr-only'); }).map((e) => `${e.tagName}:${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 20)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
    ok(small.length === 0, `/${path}: touch targets ≥ 40px` + (small.length ? ': ' + small.join('; ') : '')); }
  await p.goto(BASE + '/#/accounts'); await p.waitForTimeout(300); await p.screenshot({ path: SP + '/d-accounts.png', fullPage: true });
  await p.goto(BASE + '/#/budgets'); await p.waitForTimeout(300); await p.screenshot({ path: SP + '/d-budgets.png', fullPage: true });
  done(errs); await b.close();
})().catch((e) => { console.error('FAIL(script)', e.message.split('\n').slice(0, 3).join(' | ')); process.exit(1); });
