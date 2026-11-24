// Sample data can be removed or undone; business and debt categories exist and feed the dashboard card.
const { boot, ok, done, readData, digits } = require('./common.cjs');
(async () => {
  // 1. Load sample, then undo from the toast: back to the empty start screen.
  {
    const { b, p, errs } = await boot({ seed: false });
    await p.getByRole('button', { name: 'Muat data contoh' }).click();
    await p.getByText('Total saldo').waitFor();
    ok(await p.getByText('Data contoh dimuat.').isVisible(), 'toast confirms the sample data');
    await p.locator('.toast button', { hasText: 'Urungkan' }).click();
    await p.getByRole('button', { name: 'Muat data contoh' }).waitFor();
    const d = await readData(p);
    ok(d.wallets.length === 0 && d.transactions.length === 0 && d.budgets.length === 0, 'undo leaves the account empty');
    await b.close(); done(errs);
  }
  // 2. Seeded: new categories, the card with independent numbers, and removing the sample.
  {
    const { b, p, errs } = await boot();
    const d = await readData(p);
    for (const k of ['sales', 'loanIn', 'debtCollected', 'stock', 'opex', 'debtPaid', 'loanOut']) ok(d.categories.some((c) => c.key === k), 'category ' + k);
    const id = (key) => d.categories.find((c) => c.key === key).id;
    const sum = (key) => d.transactions.filter((t) => t.categoryId === id(key)).reduce((a, t) => a + t.amount, 0);
    const owe = Math.max(0, sum('loanIn') - sum('debtPaid')) / 100, owed = Math.max(0, sum('loanOut') - sum('debtCollected')) / 100;
    ok(owe > 0 && owed > 0, 'sample has an open debt and an open receivable');
    const card = p.locator('.dash-biz');
    ok(await card.isVisible(), 'business card visible');
    const vals = (await card.locator('.biz-val').allInnerTexts()).map(digits);
    ok(vals[3] === owe && vals[4] === owed, `owe ${vals[3]} = ${owe}, owed ${vals[4]} = ${owed}`);
    ok(vals[0] > 0 && vals[0] - vals[1] === vals[2], 'sales - costs = profit');
    ok(d.wallets.every((w) => w.id.includes('_s_')) && d.transactions.every((t) => t.id.includes('_s_')), 'sample ids are marked');
    // A record the user entered themselves must survive the removal.
    await p.evaluate(() => {
      const k = Object.keys(localStorage).find((x) => x.endsWith(':data')); const x = JSON.parse(localStorage.getItem(k));
      const uidv = x.wallets[0].userId;
      x.wallets.push({ id: 'w_abc123', userId: uidv, name: 'Kas Warung', type: 'cash', currency: 'IDR', initialBalance: 100000, color: '#15803d', archived: false, createdAt: new Date().toISOString() });
      x.transactions.push({ id: 'tx_abc123', userId: uidv, type: 'income', walletId: 'w_abc123', categoryId: 'cat_sales', amount: 500000, occurredAt: new Date().toISOString().slice(0, 16), description: 'Jual', notes: '', createdAt: new Date().toISOString() });
      localStorage.setItem(k, JSON.stringify(x));
    });
    await p.reload(); await p.getByText('Total saldo').waitFor();
    await p.getByRole('button', { name: 'Hapus data contoh' }).click();
    await p.getByText('Data contoh dihapus.').waitFor();
    const e = await readData(p);
    ok(e.wallets.length === 1 && e.wallets[0].id === 'w_abc123' && e.transactions.length === 1 && e.budgets.length === 0, 'only sample removed, own data kept');
    ok(!(await p.getByRole('button', { name: 'Hapus data contoh' }).count()), 'notice gone once no sample remains');
    await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.endsWith(':data')); const x = JSON.parse(localStorage.getItem(k)); x.wallets = []; x.transactions = []; localStorage.setItem(k, JSON.stringify(x)); });
    await p.reload(); await p.getByRole('button', { name: 'Muat data contoh' }).waitFor();
    ok(e.categories.some((c) => c.key === 'sales'), 'categories stay');
    ok(await p.locator('.dash-biz').count() === 0, 'card hidden again');
    await b.close(); done(errs);
  }
})();
