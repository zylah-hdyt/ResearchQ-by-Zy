// Business & Loans with real entries: borrow → partial repayment → settled; lend; sale with the category preset.
// Every figure is checked against the stored data, independently of the app's code.
const { boot, ok, done, readData, digits, BASE } = require('./common.cjs');
(async () => {
  const { b, p, errs } = await boot();
  const bal = (d, id) => { const w = d.wallets.find((x) => x.id === id); return d.transactions.reduce((s, t) => s + (t.walletId === id ? (t.type === 'income' ? t.amount : -t.amount) : 0) + (t.toWalletId === id ? (t.toAmount ?? t.amount) : 0), w.initialBalance); };
  let d = await readData(p);
  const cash = d.wallets.find((w) => w.type === 'cash');
  const before = bal(d, cash.id);
  await p.goto(BASE + '/#/business'); await p.getByRole('tab', { name: 'Utang-piutang' }).waitFor();
  ok(await p.locator('.debt-card', { hasText: 'Budi' }).isVisible(), 'sample debt (Budi) listed');
  ok(await p.locator('.debt-card', { hasText: 'Rina' }).getByText(/Lewat jatuh tempo/).isVisible(), 'overdue receivable flagged');
  // overdue reminder in the bell, linking to this page
  await p.getByRole('button', { name: 'Notifikasi', exact: true }).first().click();
  const pop = p.getByRole('dialog', { name: 'Notifikasi' });
  ok(await pop.getByText(/Piutang dari Rina .* sudah lewat jatuh tempo/).isVisible(), 'bell: overdue receivable from Rina');
  await pop.getByText(/Piutang dari Rina/).click(); await p.waitForTimeout(200);
  ok(p.url().endsWith('#/business'), 'reminder opens Business & Loans');
  // borrow
  await p.getByRole('button', { name: 'Saya meminjam', exact: true }).click();
  await p.getByLabel('Pinjam dari siapa').fill('Andi');
  await p.locator('.modal .amount-field input').fill('500000');
  await p.locator('.modal select').selectOption(cash.id);
  await p.getByLabel(/Jatuh tempo/).fill('2027-01-31');
  await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(300);
  d = await readData(p);
  const loan = d.transactions.find((t) => t.description === 'Andi');
  ok(loan && loan.type === 'income' && loan.categoryId === 'cat_loan_in' && loan.amount === 50000000 && /Jatuh tempo: 2027-01-31/.test(loan.notes), 'loan stored as income "Pinjaman diterima" with due date');
  ok(bal(d, cash.id) === before + 50000000, 'cash wallet grows by the loan');
  const andi = p.locator('.debt-card', { hasText: 'Andi' });
  ok(/Sisa Rp\s?500\.000 dari Rp\s?500\.000/.test(await andi.innerText()), 'card: 500.000 left of 500.000');
  // partial repayment
  await andi.getByRole('button', { name: 'Catat pembayaran' }).click();
  await p.locator('.modal .amount-field input').fill('200000');
  await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(300);
  ok(/Sisa Rp\s?300\.000/.test(await andi.innerText()), 'after paying 200.000: 300.000 left');
  d = await readData(p);
  ok(bal(d, cash.id) === before + 30000000, 'repayment leaves the same wallet');
  // settle
  await andi.getByRole('button', { name: 'Catat pembayaran' }).click();
  ok(digits(await p.locator('.modal .amount-field input').inputValue()) === 300000, 'payment defaults to the remaining amount');
  await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(300);
  ok((await p.locator('.debt-list > .debt-card', { hasText: 'Andi' }).count()) === 0, 'settled debt leaves the open list');
  await p.getByRole('button', { name: /Lunas \(/ }).click();
  ok(await p.locator('.debt-card', { hasText: 'Andi' }).getByText('Lunas').isVisible(), 'and shows under Settled');
  // totals = independent
  d = await readData(p);
  const k = (id) => d.categories.find((c) => c.id === id)?.key;
  const sumBy = (key) => d.transactions.filter((t) => k(t.categoryId) === key).reduce((s, t) => s + t.amount, 0) / 100;
  const owe = Math.max(0, sumBy('loanIn') - sumBy('debtPaid'));
  ok(digits(await p.locator('.stat-tile.expense .stat-value').innerText()) === Math.round(owe), `"Utang saya" ${owe} = loans − repayments (independent)`);
  // sale with the category preset
  await p.getByRole('tab', { name: 'Jual beli' }).click();
  const salesBefore = digits(await p.locator('.stat-tile.income .st-full').innerText());
  await p.getByRole('button', { name: 'Catat penjualan' }).click();
  ok((await p.locator('.modal .cat-pick.on').innerText()).includes('Penjualan'), 'sale form opens with "Penjualan" selected');
  await p.locator('.modal .amount-field input').fill('750000');
  await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(300);
  ok(digits(await p.locator('.stat-tile.income .st-full').innerText()) === salesBefore + 750000, 'sales this month grow by 750.000');
  // phone: no horizontal scroll
  const m = await b.newContext({ viewport: { width: 320, height: 700 }, locale: 'id-ID', storageState: await p.context().storageState(), reducedMotion: 'reduce' });
  const mp = await m.newPage(); await mp.goto(BASE + '/#/business'); await mp.waitForTimeout(500);
  ok(await mp.evaluate(() => document.documentElement.scrollWidth <= 320), 'business page fits 320px');
  await b.close(); done(errs);
})();
