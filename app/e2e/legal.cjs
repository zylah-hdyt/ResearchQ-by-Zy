const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const { chromium, devices } = require('playwright');
const SP = process.argv[2] || 'e2e-output';
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 820 }, locale: 'en-US' });
  await ctx.addInitScript(() => { try { localStorage.setItem('myfi.welcomed', '1'); } catch (e) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  // 1. public legal pages without signing in
  await p.goto(BASE + '/#/terms');
  ok((await p.locator('article h1').innerText()) === 'Syarat Layanan MyFi', 'Terms page opens without login, in Indonesian first');
  await p.screenshot({ path: SP + '/terms-id.png', fullPage: true });
  await p.getByRole('button', { name: 'EN', exact: true }).click();
  ok((await p.locator('article h1').innerText()) === 'MyFi Terms of Service', 'language toggle on the legal page -> English');
  await p.getByRole('button', { name: 'ID', exact: true }).click();
  await p.goto(BASE + '/#/privacy');
  ok((await p.locator('article h1').innerText()) === 'Kebijakan Privasi MyFi', 'Privacy page opens without login');
  // 2. sign-up needs consent
  await p.goto(BASE + '/#/');
  await p.getByRole('button', { name: 'Buat akun' }).click();
  await p.getByLabel('Nama lengkap').fill('Dewi Lestari'); await p.getByLabel('Email').fill('dewi@example.com'); await p.getByLabel('Kata sandi').fill('password123');
  await p.waitForTimeout(2700);
  await p.locator('form button[type=submit]').click();
  ok(await p.getByText('Setujui Syarat Layanan dan Kebijakan Privasi untuk melanjutkan.').isVisible(), 'sign-up blocked until the box is ticked');
  // honeypot
  await p.getByRole('checkbox').check();
  await p.locator('input[name=website]').evaluate((el) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, 'http://spam'); el.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.locator('form button[type=submit]').click();
  ok(await p.getByText('Terjadi kesalahan. Silakan coba lagi.').isVisible(), 'filled honeypot is rejected');
  await p.locator('input[name=website]').evaluate((el) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, ''); el.dispatchEvent(new Event('input', { bubbles: true })); });
  await p.locator('form button[type=submit]').click();
  await p.getByText(/Selamat (pagi|siang|sore|malam), Dewi/).waitFor();
  const tv = await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.endsWith(':profile')); const j = JSON.parse(localStorage.getItem(k)); return j.termsVersion; });
  ok(tv === '2026-11-22', 'consent version stored on the profile: ' + tv);
  // 3. consent gate for an existing account that has not accepted
  await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.endsWith(':profile')); const j = JSON.parse(localStorage.getItem(k)); delete j.termsVersion; delete j.termsAcceptedAt; localStorage.setItem(k, JSON.stringify(j)); });
  await p.reload();
  await p.getByText('Syarat dan Kebijakan Privasi').first().waitFor();
  ok(await p.getByRole('button', { name: 'Setuju dan lanjutkan' }).isDisabled(), 'existing user sees the consent screen; Accept disabled until ticked');
  await p.screenshot({ path: SP + '/consent.png' });
  await p.getByRole('checkbox').check(); await p.getByRole('button', { name: 'Setuju dan lanjutkan' }).click();
  await p.getByText(/Selamat (pagi|siang|sore|malam), Dewi/).waitFor();
  ok(true, 'after accepting, the app opens');
  // 4. delete account
  await p.goto(BASE + '/#/settings');
  await p.getByRole('button', { name: 'Hapus akun' }).click();
  const confirm = p.locator('.modal .btn.danger');
  ok(await confirm.isDisabled(), 'delete button disabled until the word is typed');
  await p.locator('.modal input.input').fill('hapus');
  ok(await confirm.isEnabled(), 'typing HAPUS (any case) enables it');
  await p.screenshot({ path: SP + '/delete-modal.png' });
  await confirm.click();
  await p.locator('form h1').waitFor();
  ok((await p.locator('form h1').innerText()) === 'Masuk', 'after deletion the user is signed out');
  const left = await p.evaluate(() => Object.keys(localStorage).filter((k) => /:u:|accounts/.test(k)).map((k) => k + '=' + (localStorage.getItem(k) || '').slice(0, 40)));
  ok(left.every((x) => /accounts=\[\]/.test(x) || !/:u:/.test(x)), 'no user data left in storage: ' + JSON.stringify(left));
  await p.getByLabel('Email').fill('dewi@example.com'); await p.getByLabel('Kata sandi').fill('password123');
  await p.locator('form button[type=submit]').click();
  ok(await p.getByText('Email atau kata sandi salah.').isVisible(), 'deleted account can no longer sign in');
  // 5. mobile sign-up page
  const mc = await b.newContext({ ...devices['iPhone 13'], locale: 'en-US' }); await mc.addInitScript(() => { try { localStorage.setItem('myfi.welcomed', '1'); } catch (e) {} }); const m = await mc.newPage();
  await m.goto(BASE + '/#/'); await m.getByRole('button', { name: 'Buat akun' }).click(); await m.waitForTimeout(300);
  await m.screenshot({ path: SP + '/m-signup.png', fullPage: true });
  ok((await m.evaluate(() => document.documentElement.scrollWidth)) <= 390, 'mobile sign-up: no horizontal scroll');
  await m.goto(BASE + '/#/privacy'); await m.waitForTimeout(300);
  ok((await m.evaluate(() => document.documentElement.scrollWidth)) <= 390, 'mobile legal page: no horizontal scroll');
  console.log('errors', JSON.stringify(errs)); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); await b.close();
})().catch((e) => { console.error('FAIL(script)', e.message); process.exit(1); });
