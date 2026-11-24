// Shared helpers for the browser tests (local mode build served by `vite preview`).
const { chromium, devices } = require('playwright');
const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
// Suites run with reduced motion so figures are final at once; the motion suite opts back in.
async function boot({ lang = 'id-ID', seed = true, motion = false } = {}) {
  const b = await chromium.launch(); const errs = [];
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: lang, reducedMotion: motion ? 'no-preference' : 'reduce' });
  await ctx.addInitScript(() => { try { localStorage.setItem('myfi.welcomed', '1'); } catch (e) {} });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto(BASE + '/');
  await p.getByRole('button', { name: 'Buat akun' }).click();
  await p.getByLabel('Nama lengkap').fill('Siti Rahmawati'); await p.getByLabel('Email').fill('siti@example.com'); await p.getByLabel('Kata sandi').fill('password123');
  await p.getByRole('checkbox').check(); await p.waitForTimeout(2700); await p.locator('form button[type=submit]').click();
  if (seed) { await p.getByRole('button', { name: 'Muat data contoh' }).click(); await p.getByText('Total saldo').waitFor(); await p.waitForTimeout(400); }
  const phone = async (dev = 'iPhone 13') => { const st = await ctx.storageState(); const c = await b.newContext({ ...devices[dev], locale: lang, storageState: st, reducedMotion: motion ? 'no-preference' : 'reduce' }); const m = await c.newPage(); m.on('pageerror', (e) => errs.push('m ' + e.message)); m.on('console', (x) => x.type() === 'error' && errs.push('m ' + x.text())); return m; };
  return { b, ctx, p, errs, phone };
}
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const done = (errs) => { console.log('errors', JSON.stringify(errs)); console.log(fails ? fails + ' FAILED' : 'ALL PASSED'); if (fails) process.exitCode = 1; };
// Independent recomputation from the stored data (does not use app code)
const readData = (p) => p.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.endsWith(':data')); return JSON.parse(localStorage.getItem(k)); });
const digits = (s) => Number(String(s).replace(/[^\d-]/g, ''));
module.exports = { BASE, boot, ok, done, readData, digits, devices, get fails() { return fails; } };
