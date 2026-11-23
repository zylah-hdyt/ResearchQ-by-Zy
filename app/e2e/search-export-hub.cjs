// Global search and the export hub.
const { boot, ok, done, readData, BASE } = require('./common.cjs');
const SP = process.argv[2] || 'e2e-output';
(async () => { const { b, p, errs, phone } = await boot(); const d = await readData(p);
  // search opens with Ctrl+K on the dashboard and with the button on other pages
  await p.goto(BASE + '/#/'); await p.getByText('Total saldo').waitFor(); await p.keyboard.press('Control+k');
  ok(await p.getByRole('combobox', { name: 'Cari' }).isVisible(), 'Ctrl+K opens search');
  await p.getByRole('combobox').fill('bca'); await p.waitForTimeout(200);
  ok((await p.locator('[role=group][aria-label=Dompet] [role=option]').count()) === 1, 'wallet "BCA" found');
  await p.keyboard.press('Enter'); await p.locator('.wd-hero').waitFor(); ok(/#\/accounts\//.test(p.url()), 'Enter opens the wallet detail');
  // transactions across all time, independent count
  await p.goto(BASE + '/#/transactions'); await p.locator('.search-trigger').click(); await p.getByRole('combobox').fill('sewa'); await p.waitForTimeout(200);
  const n = d.transactions.filter((t) => /sewa/i.test(t.description + ' ' + t.notes)).length;
  const shown = await p.locator('[role=group][aria-label=Transaksi] [role=option]').count();
  ok(shown === Math.min(8, n) || shown === 9, `transactions matching "sewa": ${n} in data, ${shown} rows shown (max 8 + "see all")`);
  await p.locator('[role=group][aria-label=Transaksi] [role=option]').first().click(); await p.locator('.tx-list').waitFor(); await p.waitForTimeout(300);
  ok((await p.locator('.tx-list .list-item').count()) === n, `opening a result lists all ${n} matches across all time`);
  ok(await p.locator('aside .tx-detail').isVisible(), 'and selects that transaction in the detail panel');
  // category result filters transactions
  await p.keyboard.press('Control+k'); await p.getByRole('combobox').fill('transport'); await p.waitForTimeout(200);
  await p.locator('[role=group][aria-label=Kategori] [role=option]').first().click(); await p.waitForTimeout(300);
  const nt = d.transactions.filter((t) => t.categoryId === 'cat_transport').length;
  ok((await p.locator('.tx-list .list-item').count()) === nt, `category result → ${nt} transport transactions (all time)`);
  // amount search
  await p.keyboard.press('Control+k'); await p.getByRole('combobox').fill('zzzz-none'); await p.waitForTimeout(200);
  ok(/Tidak ada hasil/.test(await p.locator('.search-results').innerText()), 'no-result message'); await p.keyboard.press('Escape');
  // export hub
  await p.goto(BASE + '/#/export'); await p.locator('.hub-card').first().waitFor();
  ok((await p.locator('.hub-card').count()) === 4 && (await p.locator('.hub-sheets li').count()) === 6, 'export hub: 4 choices and the 6 sheets');
  await p.locator('.hub-card', { hasText: 'Laporan keuangan' }).click(); await p.locator('.modal').waitFor();
  ok(/3 bulan terakhir/.test(await p.locator('.modal select').first().locator('option:checked').innerText()), 'financial report starts with the last 3 months');
  await p.getByRole('button', { name: 'Lanjut' }).click();
  const [dl] = await Promise.all([p.waitForEvent('download'), p.getByRole('button', { name: 'Buat & unduh' }).click()]);
  ok(dl.suggestedFilename().endsWith('.xlsx'), 'export from the hub downloads a workbook'); await p.keyboard.press('Escape');
  ok((await p.getByRole('link', { name: 'Export Excel' }).count()) >= 1, 'sidebar link to the hub');
  await p.screenshot({ path: SP + '/d-hub.png' });
  // phone: icon-only search, fits 320
  const m = await phone();
  for (const w of [390, 320]) { await m.setViewportSize({ width: w, height: 800 }); await m.goto(BASE + '/#/transactions'); await m.waitForTimeout(400);
    const sw = await m.evaluate(() => document.documentElement.scrollWidth); const r = await m.locator('.search-trigger').boundingBox();
    ok(sw <= w && r.width >= 44 && r.height >= 44, `phone ${w}px: search button 44px, no overflow`); }
  await m.locator('.search-trigger').click(); await m.getByRole('combobox').fill('gopay'); await m.waitForTimeout(300); await m.screenshot({ path: SP + '/m-search.png' });
  await m.goto(BASE + '/#/export'); await m.waitForTimeout(400); ok((await m.evaluate(() => document.documentElement.scrollWidth)) <= 320, 'hub fits 320px'); await m.screenshot({ path: SP + '/m-hub.png' });
  done(errs); await b.close(); })().catch((e) => { console.error('FAIL(script)', e.message.split('\n')[0]); process.exit(1); });
