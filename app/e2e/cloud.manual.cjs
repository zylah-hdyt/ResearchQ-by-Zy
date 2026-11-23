const { chromium, devices } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const digits = (s) => Number(String(s).replace(/[^\d-]/g, ''));
const U = (process.env.E2E_CLOUD_URL || 'http://localhost:4174').replace(/\/$/, '') + '/';
(async () => { const b = await chromium.launch(); const errs = [];
  const email = `myfi.e2e.${Date.now()}@example.com`; const pw1 = 'Testpass#2026', pw2 = 'Newpass#2026x';
  console.log('test account', email);
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: 'id-ID' }); await ctx.addInitScript(() => localStorage.setItem('myfi.welcomed', '1'));
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)));
  await p.goto(U); await p.getByRole('button', { name: 'Buat akun' }).click();
  await p.getByLabel('Nama lengkap').fill('Uji Otomatis'); await p.getByLabel('Email').fill(email); await p.getByLabel('Kata sandi').fill(pw1);
  await p.getByRole('checkbox').check(); await p.waitForTimeout(2700); await p.locator('form button[type=submit]').click();
  await p.getByRole('button', { name: 'Muat data contoh' }).waitFor({ timeout: 20000 }); ok(true, 'cloud sign-up works (email confirmation is currently off)');
  await p.getByRole('button', { name: 'Muat data contoh' }).click(); await p.getByText('Total saldo').waitFor(); await p.waitForTimeout(4000);
  const total0 = digits(await p.locator('.hero-amount').innerText());
  await p.reload(); await p.getByText('Total saldo').waitFor({ timeout: 20000 }); await p.waitForTimeout(800);
  ok(digits(await p.locator('.hero-amount').innerText()) === total0, `sample data persisted to Supabase: total ${total0} identical after reload`);
  const kpi0 = await p.locator('.kpi-value').allInnerTexts();
  // custom "other" wallet
  await p.goto(U + '#/accounts'); await p.locator('.nw').waitFor();
  await p.getByRole('button', { name: 'Tambah dompet' }).first().click(); await p.getByLabel('Nama').fill('Dompet Kustom'); await p.locator('.modal select').first().selectOption('other');
  await p.locator('.modal input.num').first().pressSequentially('1500000'); await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(3000);
  await p.reload(); await p.locator('.nw').waitFor({ timeout: 20000 }); await p.waitForTimeout(800);
  ok(digits(await p.locator('.nw-amount').innerText()) === total0 + 1500000, 'custom wallet (type "other", Rp 1.500.000) saved and reloaded from Supabase');
  ok((await p.locator('section[aria-label] .section-head h2').allInnerTexts()).some((x) => /Lainnya/.test(x)), 'custom type group shown after reload');
  // transfer BCA -> Tunai
  await p.locator('.wallet-row', { hasText: 'BCA' }).click(); await p.locator('.wd-hero').waitFor(); const bca0 = digits(await p.locator('.wd-balance').innerText());
  await p.locator('.wd-actions').getByRole('button', { name: 'Transfer' }).click(); await p.locator('.modal').waitFor();
  const opts = await p.locator('.modal select').nth(1).locator('option').allInnerTexts(); await p.locator('.modal select').nth(1).selectOption({ index: opts.findIndex((o) => /Tunai/.test(o)) });
  await p.locator('.modal input.num').first().pressSequentially('250000'); await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(3000);
  await p.reload(); await p.locator('.wd-hero').waitFor({ timeout: 20000 }); await p.waitForTimeout(800);
  ok(digits(await p.locator('.wd-balance').innerText()) === bca0 - 250000, 'transfer persisted: BCA −Rp 250.000 after reload');
  await p.goto(U + '#/'); await p.getByText('Total saldo').waitFor(); await p.waitForTimeout(800);
  ok(digits(await p.locator('.hero-amount').innerText()) === total0 + 1500000, 'transfer leaves the total unchanged (cloud)');
  // weekly budget from the sample + a new weekly one
  await p.goto(U + '#/budgets'); await p.locator('.bsum').waitFor(); await p.getByRole('button', { name: 'Mingguan', exact: true }).first().click(); await p.waitForTimeout(400);
  const w0 = await p.locator('.budget-card').count();
  await p.getByRole('button', { name: 'Tambah anggaran' }).first().click(); await p.locator('.modal select').first().selectOption('cat_entertainment'); await p.locator('.modal input.num').first().pressSequentially('100000'); await p.getByRole('button', { name: 'Simpan' }).click(); await p.waitForTimeout(3000);
  await p.reload(); await p.locator('.bsum').waitFor({ timeout: 20000 }); await p.getByRole('button', { name: 'Mingguan', exact: true }).first().click(); await p.waitForTimeout(500);
  ok(w0 >= 1 && (await p.locator('.budget-card').count()) === w0 + 1, `weekly budgets persisted in Supabase (${w0} → ${w0 + 1})`);
  // reports page and export
  await p.goto(U + '#/reports'); await p.locator('.kpi-strip').waitFor(); ok((await p.locator('.kpi-value').count()) === 4, 'reports render in cloud mode');
  // phone order
  const st = await ctx.storageState(); const mc = await b.newContext({ ...devices['iPhone 13'], locale: 'id-ID', storageState: st }); const m = await mc.newPage(); await m.goto(U); await m.getByText('Total saldo').waitFor({ timeout: 20000 }); await m.waitForTimeout(800);
  const order = await m.evaluate(() => [...document.querySelectorAll('.dash > *')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => [...e.classList].find((c) => c.startsWith('dash-'))).join(' → '));
  ok(order === 'dash-hero → dash-summary → dash-chart → dash-budget → dash-recent → dash-insights', 'cloud phone dashboard order: ' + order); await mc.close();
  // forgot password request (signed out)
  await p.goto(U); await p.getByRole('button', { name: 'Keluar' }).first().click(); await p.locator('form h1').waitFor();
  await p.getByRole('button', { name: 'Lupa kata sandi?' }).click(); await p.getByLabel('Email').fill(email); await p.getByRole('button', { name: 'Kirim tautan reset' }).click();
  await p.waitForSelector('.auth-form [role=status], .auth-form [role=alert]', { timeout: 20000 });
  const msg = await p.locator('.auth-form [role=status], .auth-form [role=alert]').first().innerText(); console.log('  reset request answer:', msg);
  ok(/sudah dikirim|layanan email belum dikonfigurasi|Terlalu sering/.test(msg), 'reset request gives a clear answer');
  // recovery screen with a real session → change password → sign in with the new one
  await p.getByRole('button', { name: 'Kembali ke halaman masuk' }).click(); await p.getByLabel('Email').fill(email); await p.getByLabel('Kata sandi').fill(pw1); await p.locator('form button[type=submit]').click(); await p.getByText('Total saldo').waitFor({ timeout: 20000 });
  await p.goto(U + '?reset=1#/'); await p.locator('.reset-card').waitFor({ timeout: 20000 });
  await p.getByLabel('Kata sandi baru', { exact: true }).fill(pw2); await p.getByLabel('Ulangi kata sandi baru').fill(pw2); await p.getByRole('button', { name: 'Simpan kata sandi' }).click(); await p.getByText('Total saldo').waitFor({ timeout: 20000 });
  await p.getByRole('button', { name: 'Keluar' }).first().click(); await p.locator('form h1').waitFor();
  await p.getByLabel('Email').fill(email); await p.getByLabel('Kata sandi').fill(pw1); await p.locator('form button[type=submit]').click(); await p.waitForTimeout(2500);
  ok((await p.locator('.auth-form [role=alert]').count()) === 1, 'old password no longer works');
  await p.getByLabel('Kata sandi').fill(pw2); await p.locator('form button[type=submit]').click(); await p.getByText('Total saldo').waitFor({ timeout: 20000 }); ok(true, 'new password signs in (Supabase updateUser)');
  // delete the test account through the app
  await p.goto(U + '#/settings'); await p.getByRole('button', { name: 'Hapus akun' }).first().click(); await p.locator('.modal input').fill('HAPUS'); await p.locator('.modal').getByRole('button', { name: 'Hapus akun' }).click();
  await p.locator('form h1').waitFor({ timeout: 20000 }); ok(true, 'test account deleted through Settings → Hapus akun');
  await p.getByLabel('Email').fill(email); await p.getByLabel('Kata sandi').fill(pw2); await p.locator('form button[type=submit]').click(); await p.waitForTimeout(2500);
  ok((await p.locator('.auth-form [role=alert]').count()) === 1, 'deleted account can no longer sign in');
  console.log('errors', JSON.stringify(errs)); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); console.log('EMAIL=' + email); await b.close();
})().catch((e) => { console.error('FAIL(script)', e.message.split('\n')[0]); process.exit(1); });
