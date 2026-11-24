// "+" works everywhere: with no wallet it creates one first and then opens the transaction form; with wallets it opens the form directly.
const { chromium, devices } = require('playwright'); const { ok, done, BASE, readData } = require('./common.cjs'); const out = process.argv[2] || 'e2e-output';
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [name, opts] of [['phone', devices['iPhone 13']], ['desktop', { viewport: { width: 1280, height: 800 } }]]) {
    const c = await b.newContext({ ...opts, locale: 'id-ID' }); await c.addInitScript(() => localStorage.setItem('myfi.welcomed', '1')); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + '/'); await p.getByRole('button', { name: 'Buat akun' }).click(); await p.getByLabel('Nama lengkap').fill('Dewi'); await p.getByLabel('Email').fill(`dewi.${name}@contoh.id`); await p.getByLabel('Kata sandi').fill('password123'); await p.getByRole('checkbox').check(); await p.waitForTimeout(2700); await p.locator('form button[type=submit]').click(); await p.getByText('Mulai dengan menambahkan dompet').waitFor();
    const plus = name === 'phone' ? p.locator('.identity-actions button[aria-label="Tambah transaksi"]') : p.locator('.side-add');
    ok(await plus.isEnabled(), `${name}: "+" is enabled with no wallet`);
    await plus.click(); await p.locator('.modal').waitFor();
    ok((await p.locator('.modal-head h2').innerText()) === 'Tambah dompet' && /Buat satu dulu/.test(await p.locator('.modal').innerText()), `${name}: "+" with no wallet asks for a wallet first, with an explanation`);
    await p.screenshot({ path: `${out}/${name}-wallet-first.png` });
    await p.getByLabel('Nama').fill('Tunai'); await p.locator('.modal input.num').first().pressSequentially('100000'); await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(400);
    ok((await p.locator('.modal-head h2').innerText()) === 'Tambah transaksi', `${name}: after saving the wallet the transaction form opens`);
    ok(/Tunai/.test(await p.locator('.modal select').first().locator('option:checked').innerText()), `${name}: the new wallet is preselected`);
    await p.locator('.modal input.num').first().pressSequentially('25000'); await p.getByRole('radio', { name: 'Transportasi' }).click(); await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(500);
    const d = await readData(p); ok(d.wallets.length === 1 && d.transactions.length === 1 && d.transactions[0].amount === 2500000, `${name}: one wallet and one Rp 25.000 transaction saved`);
    // with a wallet, + opens the form directly on other pages too
    for (const r of ['transactions', 'accounts', 'budgets', 'reports']) { await p.goto(BASE + '/#/' + r); await p.waitForTimeout(400);
      const btn = name === 'phone' ? p.locator('.topbar button[aria-label="Tambah transaksi"]') : p.locator('.side-add'); await btn.click(); await p.locator('.modal').waitFor();
      ok((await p.locator('.modal-head h2').innerText()) === 'Tambah transaksi', `${name} /${r}: "+" opens the transaction form`); await p.keyboard.press('Escape'); await p.waitForTimeout(200); }
    await c.close(); }
  done(errs); await b.close(); })().catch((e) => { console.error('FAIL(script)', e.message.split('\n')[0]); process.exit(1); });
