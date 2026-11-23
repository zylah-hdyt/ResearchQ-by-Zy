// Transaction form on phones: category grid, inline error inside the viewport, 44px targets, 320-390px.
const { boot, ok, done, BASE } = require('./common.cjs');
(async () => { const out = process.argv[2] || 'e2e-output'; const { b, errs, phone } = await boot(); const m = await phone();
  for (const w of [390, 320]) { await m.setViewportSize({ width: w, height: 844 }); await m.goto(BASE + '/#/transactions'); await m.waitForTimeout(400);
    await m.locator('.quick-add, button[aria-label*="Tambah transaksi"]').first().click(); await m.locator('.modal').waitFor(); await m.waitForTimeout(400);
    await m.screenshot({ path: `${out}/form-${w}.png` });
    await m.locator('.modal input.num').first().pressSequentially('45000'); await m.getByRole('button', { name: 'Simpan' }).click(); await m.waitForTimeout(700);
    await m.screenshot({ path: `${out}/form-${w}-error.png` });
    const sw = await m.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `form fits ${w}px`);
    const small = await m.evaluate(() => [...document.querySelectorAll('.cat-pick')].filter((e) => e.getBoundingClientRect().height < 44 || e.getBoundingClientRect().width < 44).length); ok(small === 0, `category tiles ≥ 44px at ${w}px`);
    await m.getByRole('radio', { name: 'Transportasi' }).click(); await m.getByRole('button', { name: 'Simpan' }).click(); await m.waitForTimeout(500);
    ok((await m.locator('.modal').count()) === 0, `saved after picking a category (${w}px)`); }
  done(errs); await b.close(); })().catch((e) => { console.error('FAIL(script)', e.message.split('\n')[0]); process.exit(1); });
