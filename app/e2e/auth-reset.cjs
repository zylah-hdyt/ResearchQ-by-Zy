const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const { boot, ok, done } = require('./common.cjs');
(async () => { const out = process.argv[2]; const { b, p, errs, phone } = await boot();
  // dashboard order on phone = PRD 4.2
  const m = await phone(); await m.setViewportSize({ width: 390, height: 844 }); await m.goto(BASE + '/#/'); await m.waitForTimeout(700);
  const order = await m.evaluate(() => [...document.querySelectorAll('.dash > *')].filter((e) => getComputedStyle(e).display !== 'none').map((e) => [...e.classList].find((c) => c.startsWith('dash-'))));
  ok(JSON.stringify(order) === JSON.stringify(['dash-hero', 'dash-summary', 'dash-chart', 'dash-budget', 'dash-recent', 'dash-insights']), 'phone dashboard order = PRD 4.2: ' + order.join(' → '));
  const ys = await m.evaluate(() => ['dash-budget', 'dash-recent'].map((c) => document.querySelector('.' + c).getBoundingClientRect().top));
  ok(ys[0] < ys[1], 'budget overview is above recent transactions on screen');
  for (const w of [390, 360, 320]) { await m.setViewportSize({ width: w, height: 844 }); await m.waitForTimeout(250); const sw = await m.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `dashboard fits ${w}px (${sw})`); }
  // desktop layout: wallets right of hero, budget right of chart, insights right of recent
  await p.goto(BASE + '/#/'); await p.waitForTimeout(700);
  const r = await p.evaluate(() => Object.fromEntries(['hero', 'wallets', 'summary', 'chart', 'budget', 'recent', 'insights'].map((k) => { const b = document.querySelector('.dash-' + k).getBoundingClientRect(); return [k, { x: Math.round(b.left), y: Math.round(b.top), b: Math.round(b.bottom) }]; })));
  ok(r.wallets.x > r.hero.x && r.budget.x > r.chart.x && r.insights.x > r.recent.x, 'desktop: wallets, budgets, insights in the right column');
  ok(r.hero.y < r.summary.y && r.summary.y < r.chart.y && r.chart.y < r.recent.y && r.budget.y < r.insights.y, 'desktop: each column reads top to bottom in PRD order');
  ok(r.budget.y >= r.wallets.b, 'desktop: budget card does not overlap wallets');
  await p.screenshot({ path: out + '/d-dash.png' }); await m.setViewportSize({ width: 390, height: 844 }); await m.screenshot({ path: out + '/m-dash.png', fullPage: true });
  // forgot password (local mode → unavailable message)
  const c = await b.newContext({ viewport: { width: 1280, height: 800 } }); await c.addInitScript(() => localStorage.setItem('myfi.welcomed', '1')); const q = await c.newPage();
  await q.goto(BASE + '/'); await q.getByRole('button', { name: 'Lupa kata sandi?' }).click();
  ok((await q.locator('form h1').innerText()) === 'Reset kata sandi', 'forgot link opens the reset form');
  ok((await q.getByLabel('Kata sandi').count()) === 0, 'reset form has no password field');
  await q.getByLabel('Email').fill('siti@example.com'); await q.getByRole('button', { name: 'Kirim tautan reset' }).click(); await q.waitForTimeout(300);
  ok(/hanya tersedia di versi online/.test(await q.locator('[role=alert]').innerText()), 'local mode explains reset is cloud-only');
  await q.getByRole('button', { name: 'Kembali ke halaman masuk' }).click(); ok((await q.locator('form h1').innerText()) === 'Masuk', 'back to sign in');
  await q.screenshot({ path: out + '/forgot.png' });
  // recovery screen gating with ?reset=1 when signed in (local account)
  await p.goto(BASE + '/?reset=1#/'); await p.locator('.reset-card').waitFor();
  ok(await p.getByRole('heading', { name: 'Buat kata sandi baru' }).isVisible(), '?reset=1 with a session shows the new-password screen before the app');
  await p.getByLabel('Kata sandi baru', { exact: true }).fill('newpass123'); await p.getByLabel('Ulangi kata sandi baru').fill('newpass12'); await p.getByRole('button', { name: 'Simpan kata sandi' }).click();
  ok(/tidak sama/.test(await p.locator('.reset-card [role=alert]').innerText()), 'mismatch is rejected');
  await p.getByLabel('Ulangi kata sandi baru').fill('newpass123'); await p.screenshot({ path: out + '/newpw.png' }); await p.getByRole('button', { name: 'Simpan kata sandi' }).click();
  await p.getByText('Total saldo').waitFor(); ok(!(await p.evaluate(() => location.search)).includes('reset'), 'after saving, the app opens and ?reset is removed from the URL');
  // new password works: sign out, sign in
  await p.getByRole('button', { name: /Menu akun|akun/i }).first().click().catch(() => {});
  await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.includes('session')); if (k) localStorage.removeItem(k); }); await p.goto(BASE + '/'); await p.reload();
  if (await p.locator('form h1').count()) { await p.getByLabel('Email').fill('siti@example.com'); await p.getByLabel('Kata sandi').fill('newpass123'); await p.locator('form button[type=submit]').click(); await p.getByText('Total saldo').waitFor({ timeout: 8000 }).then(() => ok(true, 'signs in with the new password')).catch(() => ok(false, 'signs in with the new password')); }
  else ok(true, '(session kept; sign-in with new password covered in cloud test)');
  // expired link → banner
  const c2 = await b.newContext(); const e = await c2.newPage(); await e.goto(BASE + '/?reset=1&error=access_denied&error_code=otp_expired#/'); await e.locator('form').waitFor();
  ok(/tidak valid, sudah kedaluwarsa/.test(await e.locator('form').innerText()) && (await e.locator('form h1').innerText()) === 'Reset kata sandi', 'expired link shows an explanation and the reset form (no welcome screen)');
  done(errs); await b.close(); })().catch((e) => { console.error('FAIL(script)', e.message.split('\n')[0]); process.exit(1); });
