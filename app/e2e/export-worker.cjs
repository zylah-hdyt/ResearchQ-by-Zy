const BASE = (process.env.E2E_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const { chromium } = require('playwright'); const { ok, done } = require('./common.cjs');
async function run(b, noWorker) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true, locale: 'id-ID' });
  await ctx.addInitScript(() => localStorage.setItem('myfi.welcomed', '1'));
  if (noWorker) await ctx.addInitScript(() => { window.Worker = undefined; });
  const p = await ctx.newPage(); const workers = []; p.on('worker', (w) => workers.push(w.url())); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() !== 'log') errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  await p.goto(BASE + '/'); await p.getByRole('button', { name: 'Buat akun' }).click();
  await p.getByLabel('Nama lengkap').fill('Bench'); await p.getByLabel('Email').fill('bench@example.com'); await p.getByLabel('Kata sandi').fill('password123');
  await p.getByRole('checkbox').check(); await p.waitForTimeout(2700); await p.locator('form button[type=submit]').click();
  await p.getByRole('button', { name: 'Muat data contoh' }).click(); await p.getByText('Total saldo').waitFor(); await p.waitForTimeout(500);
  // grow to 10 000 transactions (copies of the sample, spread over 2026)
  await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => x.endsWith(':data')); const d = JSON.parse(localStorage.getItem(k)); const src = d.transactions; const out = [];
    for (let i = 0; out.length < 10000; i++) { const t = src[i % src.length]; const day = String(1 + (i % 28)).padStart(2, '0'); const mo = String(1 + (i % 11)).padStart(2, '0'); out.push({ ...t, id: 'bx' + i, occurredAt: `2026-${mo}-${day}T${t.occurredAt.slice(11)}` }); }
    d.transactions = out; localStorage.setItem(k, JSON.stringify(d)); });
  await p.reload(); await p.getByText('Total saldo').waitFor(); await p.goto(BASE + '/#/transactions'); await p.waitForTimeout(1500);
  await p.getByRole('button', { name: 'Ekspor' }).click(); await p.locator('.modal').waitFor();
  await p.locator('.modal select').first().selectOption({ index: 4 }).catch(() => {}); // "Semua waktu" if present
  await p.getByRole('button', { name: 'Lanjut' }).click(); await p.waitForTimeout(300);
  const rowsTxt = await p.locator('.modal').innerText();
  await p.evaluate(() => { window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime - window.__t0), Math.round(e.duration)]))).observe({ type: 'longtask', buffered: false }); });
  await p.evaluate(() => { window.__t0 = performance.now(); }); const t0 = Date.now();
  const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 120000 }), p.getByRole('button', { name: 'Buat & unduh' }).click()]);
  const ms = Date.now() - t0; const lt = await p.evaluate(() => window.__lt); const path = `${process.argv[2]}/${noWorker ? 'main' : 'worker'}.xlsx`; await dl.saveAs(path);
  console.log(noWorker ? 'main' : 'worker', 'longtasks [start,dur]:', JSON.stringify(lt)); const maxLt = Math.round(Math.max(0, ...lt.map((x) => x[1]))); await ctx.close();
  return { ms, maxLt, workers, errs, path, count: (rowsTxt.match(/([\d.]+)\s*transaksi/) || [])[1] };
}
(async () => { const b = await chromium.launch();
  const w = await run(b, false); console.log('worker:', JSON.stringify({ ms: w.ms, maxLongTask: w.maxLt, workers: w.workers.map((u) => u.split('/').pop()), count: w.count, errs: w.errs }));
  const m = await run(b, true); console.log('main  :', JSON.stringify({ ms: m.ms, maxLongTask: m.maxLt, workers: m.workers.length, count: m.count, errs: m.errs }));
  ok(w.workers.some((u) => /export\.worker/.test(u)), 'export ran in a Web Worker');
  ok(w.maxLt < m.maxLt / 3, `main thread longest block: worker ${w.maxLt} ms vs main-thread build ${m.maxLt} ms`);
  ok(m.workers.length === 0, 'fallback works when Worker is unavailable');
  done([]); await b.close(); })().catch((e) => { console.error('FAIL(script)', e.message.split('\n')[0]); process.exit(1); });
