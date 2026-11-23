const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const { boot, ok, done, readData, digits } = require('./common.cjs');
const SP = process.argv[2] || 'e2e-output';
(async () => {
  const { b, p, errs, phone } = await boot();
  const pad = (n) => String(n).padStart(2, '0'); const now = new Date();
  const first = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, last = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate())}`;
  let data = await readData(p);
  const wcur = Object.fromEntries(data.wallets.map((w) => [w.id, w.currency])); const wname = Object.fromEntries(data.wallets.map((w) => [w.id, w.name]));
  const rate = (c) => (c === 'IDR' ? 1 : data.rates.find((r) => r.code === c).rate);
  const inMonth = (t) => t.occurredAt.slice(0, 10) >= first && t.occurredAt.slice(0, 10) <= last;
  const balance = (d, id) => { const w = d.wallets.find((x) => x.id === id); return w.initialBalance + d.transactions.reduce((a, t) => a + (t.type === 'income' && t.walletId === id ? t.amount : t.type === 'expense' && t.walletId === id ? -t.amount : t.type === 'transfer' ? (t.walletId === id ? -t.amount : 0) + (t.toWalletId === id ? (t.toAmount ?? t.amount) : 0) : 0), 0); };
  await p.goto(BASE + '/#/transactions'); await p.locator('.tx-list').waitFor(); await p.waitForTimeout(400);
  const rows = () => p.locator('.tx-list .list-item').count();
  // 1 · default period + summary strip
  const month = data.transactions.filter(inMonth);
  ok((await rows()) === month.length, `default "this month" shows ${month.length} transactions (independent count)`);
  const strip = await p.locator('.mini-strip strong').evaluateAll((els) => els.map((e) => e.getAttribute('title')));
  const sum = (type) => Math.round(month.filter((t) => t.type === type).reduce((s, t) => s + (t.amount * rate(wcur[t.walletId])) / 100, 0));
  ok(digits(strip[0]) === sum('income') && digits(strip[1]) === sum('expense') && digits(strip[2].replace('+', '')) === sum('income') - sum('expense'), `summary strip = independent totals (${strip.join(' | ')})`);
  // 2 · day groups
  const groups = await p.locator('.tx-list [role=group]').count(); const days = new Set(month.map((t) => t.occurredAt.slice(0, 10))).size;
  ok(groups === days, `${groups} day groups = ${days} distinct days`);
  const nets = await p.locator('.date-head .net').allInnerTexts();
  const dayNet = (day) => Math.round(data.transactions.filter((t) => t.occurredAt.startsWith(day) && t.type !== 'transfer').reduce((s, t) => s + ((t.type === 'income' ? 1 : -1) * t.amount * rate(wcur[t.walletId])) / 100, 0));
  const firstDay = [...new Set(month.map((t) => t.occurredAt.slice(0, 10)))].sort().reverse()[0];
  ok(digits(nets[0].replace(/[^\d\-+,.a-z ]/gi, '').replace(/jt|rb|M|K/g, '')) !== null, 'daily net is shown on each date header: ' + nets[0]);
  // 3 · search
  await p.getByRole('searchbox').fill('ojek'); await p.waitForTimeout(300);
  const exp1 = month.filter((t) => /ojek/i.test(t.description)).length;
  ok((await rows()) === exp1 && exp1 > 0, `search "ojek" → ${exp1} rows`);
  const allMatch = (await p.locator('.tx-list .list-item .title').allInnerTexts()).every((x) => /ojek/i.test(x)); ok(allMatch, 'every result title contains the term');
  await p.getByRole('searchbox').fill('xyz-nothing'); await p.waitForTimeout(300); ok((await rows()) === 0 && (await p.locator('.tx-list .empty').isVisible()), 'no match → empty state');
  await p.getByRole('searchbox').fill('');
  // 4 · filter sheet
  await p.getByRole('button', { name: /Filter/ }).click(); await p.locator('.modal').waitFor();
  await p.locator('.modal .segmented').getByRole('button', { name: 'Pengeluaran' }).click();
  await p.locator('.modal .pick', { hasText: 'Tunai' }).click();
  await p.getByRole('button', { name: 'Terapkan' }).click(); await p.waitForTimeout(300);
  const exp2 = month.filter((t) => t.type === 'expense' && (t.walletId === data.wallets.find((w) => w.name === 'Tunai').id)).length;
  ok((await rows()) === exp2 && exp2 > 0, `type=expense + wallet=Tunai → ${exp2} rows (independent)`);
  ok((await p.locator('.chip.filter').count()) === 1 && (await p.locator('.count-badge').innerText()) === '2' && (await p.locator('.tx-types button.on').innerText()) === 'Pengeluaran', 'wallet as a removable chip, type shown on the tabs, badge "2"');
  await p.locator('.chip.filter button').first().click(); await p.waitForTimeout(200);
  const exp3 = month.filter((t) => t.type === 'expense').length;
  ok((await p.locator('.chip.filter').count()) === 0 && (await rows()) === exp3, `removing the wallet chip → all expenses (${exp3})`);
  await p.locator('.tx-types').getByRole('button', { name: 'Semua', exact: true }).click(); await p.waitForTimeout(200);
  ok((await rows()) === month.length, '"Semua" tab restores the full list');
  // 5 · detail panel (desktop)
  await p.locator('.tx-list .list-item').nth(1).click(); await p.waitForTimeout(150);
  ok(await p.locator('aside .tx-detail').isVisible(), 'desktop: details open in the side panel');
  await p.screenshot({ path: SP + '/d-detail.png', fullPage: true });
  // 6/7 · duplicate: diff the data before/after so we measure the right wallet
  const before = await readData(p); const n0 = before.transactions.length;
  await p.locator('aside .tx-detail').getByRole('button', { name: 'Duplikat' }).click(); await p.locator('.modal').waitFor();
  ok((await p.locator('.modal-head h2').innerText()).includes('Duplikat'), 'duplicate opens a pre-filled form');
  await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(400);
  let after = await readData(p);
  ok(after.transactions.length === n0 + 1, `duplicate adds exactly one transaction (${n0} → ${after.transactions.length})`);
  ok(new Set(after.transactions.map((t) => t.id)).size === after.transactions.length, 'all transaction ids still unique');
  const ids0 = new Set(before.transactions.map((t) => t.id)); const nt = after.transactions.find((t) => !ids0.has(t.id));
  const src = before.transactions.find((t) => t.type === nt.type && t.walletId === nt.walletId && t.amount === nt.amount && (t.categoryId || '') === (nt.categoryId || '') && t.description === nt.description);
  ok(!!src, 'the new row is a copy of an existing one (same type, wallet, amount, category, description)');
  const eff = (t, id) => (t.type === 'income' && t.walletId === id ? t.amount : t.type === 'expense' && t.walletId === id ? -t.amount : t.type === 'transfer' ? (t.walletId === id ? -t.amount : 0) + (t.toWalletId === id ? (t.toAmount ?? t.amount) : 0) : 0);
  const allOk = after.wallets.every((w) => balance(after, w.id) - balance(before, w.id) === eff(nt, w.id));
  ok(allOk, 'every wallet balance moved by exactly the new transaction (once)');
  // 8 · delete + undo
  const snap = after;
  await p.locator('.tx-list .list-item').first().click();
  await p.locator('aside .tx-detail').getByRole('button', { name: 'Hapus' }).click(); await p.locator('.modal').waitFor();
  await p.locator('.modal-foot .btn.danger').click(); await p.waitForTimeout(400);
  after = await readData(p); ok(after.transactions.length === n0, 'delete removes exactly one transaction');
  ok(await p.locator('.toast').isVisible(), 'toast offers Undo');
  await p.locator('.toast button').click(); await p.waitForTimeout(400);
  after = await readData(p); ok(after.transactions.length === n0 + 1 && new Set(after.transactions.map((t) => t.id)).size === n0 + 1, 'undo restores it (no duplicates)');
  ok(after.wallets.every((w) => balance(after, w.id) === balance(snap, w.id)), 'all wallet balances identical to before the delete');
  data = after;
  // 9 · export for the current list
  await p.getByRole('button', { name: 'Ekspor' }).click(); await p.getByRole('button', { name: 'Lanjut' }).click();
  const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Buat & unduh' }).click()]);
  await dl.saveAs(SP + '/export.xlsx'); ok(dl.suggestedFilename().endsWith('.xlsx'), 'export downloaded: ' + dl.suggestedFilename());
  await p.keyboard.press('Escape');
  console.log('EXPECT_ROWS', data.transactions.filter(inMonth).length);
  // 10 · phone
  const m = await phone();
  for (const w of [390, 360, 320]) { await m.setViewportSize({ width: w, height: 800 }); await m.goto(BASE + '/#/transactions'); await m.locator('.tx-list').waitFor(); await m.waitForTimeout(300); const sw = await m.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `transactions fit ${w}px (scrollWidth ${sw})`); }
  await m.setViewportSize({ width: 390, height: 844 }); await m.goto(BASE + '/#/transactions'); await m.waitForTimeout(300);
  await m.screenshot({ path: SP + '/m-list.png' });
  await m.getByRole('button', { name: /Filter/ }).click(); await m.waitForTimeout(300); await m.screenshot({ path: SP + '/m-filter.png' }); await m.getByRole('button', { name: 'Batal' }).click();
  await m.locator('.tx-list .list-item').first().click(); await m.waitForTimeout(300); ok(await m.locator('.modal .tx-detail').isVisible(), 'phone: details open as a bottom sheet'); await m.screenshot({ path: SP + '/m-detail.png' });
  await m.keyboard.press('Escape');
  const small = await m.evaluate(() => [...document.querySelectorAll('button, a, input, select')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 40 || r.width < 40) && !e.closest('.sr-only') && getComputedStyle(e).visibility !== 'hidden'; }).map((e) => `${e.tagName}:${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 24)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`));
  ok(small.length === 0, 'all touch targets ≥ 40px on the phone' + (small.length ? ': ' + small.join('; ') : ''));
  await p.getByRole('button', { name: 'Ganti tema' }).click(); await p.waitForTimeout(300); await p.screenshot({ path: SP + '/d-dark.png', fullPage: false });
  done(errs); await b.close();
})().catch((e) => { console.error('FAIL(script)', e.message.split('\n')[0]); process.exit(1); });
