const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const { chromium, devices } = require('playwright');
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [name, opts] of [['desktop', { viewport: { width: 1280, height: 800 } }], ['iphone', { ...devices['iPhone 13'] }]]) {
    const c = await b.newContext({ locale: 'en-US', ...opts }); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto(BASE + '/'); await p.locator('.welcome').waitFor();
    ok((await p.locator('.welcome-title').innerText()).startsWith('Semua keuanganmu'), `${name}: first visit shows the welcome story in Indonesian (browser is en-US)`);
    await p.getByRole('button', { name: 'EN', exact: true }).click(); ok((await p.locator('.welcome-title').innerText()).startsWith('All your finances'), `${name}: EN toggle translates the slide`);
    await p.getByRole('button', { name: 'ID', exact: true }).click();
    ok((await p.locator('.welcome-title').innerText()).startsWith('Semua keuanganmu'), `${name}: back to ID`);
    for (const w of name === 'iphone' ? [390, 360, 320] : [1280]) { await p.setViewportSize({ width: w, height: name === 'iphone' ? 844 : 800 }); await p.waitForTimeout(250); const sw = await p.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${name}: no horizontal overflow at ${w}px (${sw})`); }
    await p.setViewportSize(name === 'iphone' ? { width: 390, height: 844 } : { width: 1280, height: 800 });
    const small = await p.evaluate(() => [...document.querySelectorAll('button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 40 || r.width < (e.getAttribute('role') === 'tab' ? 24 : 40)); }).map((e) => (e.getAttribute('aria-label') || e.textContent).trim() + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height)));
    ok(small.length === 0, `${name}: welcome touch targets >= 40px` + (small.length ? ': ' + small.join('; ') : ''));
    await p.getByRole('button', { name: 'Berikutnya' }).click(); await p.getByRole('button', { name: 'Berikutnya' }).click();
    ok((await p.locator('.welcome-title').innerText()).startsWith('Laporan rapi'), `${name}: reaches slide 3`);
    ok((await p.getByRole('button', { name: 'Mulai sekarang' }).count()) === 1 && (await p.getByRole('button', { name: 'Masuk' }).count()) === 1, `${name}: last slide offers Start and Sign in`);
    await p.getByRole('button', { name: 'Mulai sekarang' }).click(); await p.locator('form').waitFor();
    ok((await p.locator('form h1').innerText()) === 'Buat akun', `${name}: Start opens sign-up`);
    await p.reload(); await p.locator('form').waitFor(); ok((await p.locator('.welcome').count()) === 0, `${name}: welcome is not shown again after the first visit`);
    ok((await p.locator('form h1').innerText()) === 'Masuk', `${name}: next visit goes straight to sign-in`);
    await c.close(); }
  // skip
  const c2 = await b.newContext({ viewport: { width: 1280, height: 800 } }); const q = await c2.newPage(); await q.goto(BASE + '/'); await q.getByRole('button', { name: 'Lewati' }).click(); await q.locator('form').waitFor();
  ok((await q.locator('form h1').innerText()) === 'Masuk', 'Skip goes to sign-in');
  // reduced motion
  const c3 = await b.newContext({ reducedMotion: 'reduce' }); const r = await c3.newPage(); await r.goto(BASE + '/'); await r.locator('.welcome').waitFor();
  ok((await r.evaluate(() => getComputedStyle(document.querySelector('.float')).animationName)) === 'float' ? (await r.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.float')).animationDuration)) < 0.01) : true, 'reduced motion stops the floating animation');
  console.log('errors', JSON.stringify(errs)); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); await b.close(); })();
