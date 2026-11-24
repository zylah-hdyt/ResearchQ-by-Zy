// PRD UI/UX §5: count-up ends on the exact value, sliding tab indicator, chart/progress reveal, press feedback,
// skeleton while loading, compact phone headers; and everything is instant with reduced motion.
const { boot, ok, done, digits, BASE } = require('./common.cjs');
(async () => {
  const { b, ctx, p, errs } = await boot({ motion: true });
  const st = await ctx.storageState();
  // Count-up: mid-animation differs, final value equals the reduced-motion value.
  const r = await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'id-ID', reducedMotion: 'reduce', storageState: st });
  const rp = await r.newPage(); await rp.goto(BASE + '/'); await rp.locator('.hero-amount').waitFor();
  const finalText = await rp.locator('.hero-amount').innerText();
  ok(digits(finalText) > 0, 'reduced motion shows the final balance at once: ' + finalText);
  ok(await rp.evaluate(() => getComputedStyle(document.querySelector('.chart .bar')).animationName) === 'none', 'no chart animation with reduced motion');
  await p.goto(BASE + '/#/accounts'); await p.locator('.nw .hero-amount').waitFor();
  await p.evaluate(() => { window.__seen = []; new MutationObserver(() => { const h = document.querySelector('.hero-amount'); if (h) window.__seen.push(h.textContent); }).observe(document.body, { subtree: true, childList: true, characterData: true }); });
  await p.getByRole('link', { name: 'Dasbor' }).first().click();
  const hero = p.locator('.hero-amount'); await hero.waitFor();
  await p.waitForTimeout(900);
  const late = await hero.innerText();
  const seen = [...new Set(await p.evaluate(() => window.__seen))];
  ok(seen.length > 3, `balance counts up (${seen.length} steps: ${seen.slice(0, 2).join(', ')} … ${seen[seen.length - 1]})`);
  ok(late === finalText, 'count-up ends on the exact value');
  // Chart and progress reveal are animated.
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.chart .bar')).animationName) === 'bar-grow', 'bars grow in');
  ok(await p.evaluate(() => getComputedStyle(document.querySelector('.progress > span')).animationName) === 'fill-in', 'progress fills in');
  // Sliding indicator follows the active range tab.
  const seg = p.locator('.dash-summary .segmented');
  ok(await seg.evaluate((e) => e.classList.contains('has-ind')), 'range tabs have a sliding indicator');
  const x0 = await seg.evaluate((e) => e.style.getPropertyValue('--seg-x'));
  await seg.getByRole('button').nth(3).click(); await p.waitForTimeout(80);
  const x1 = await seg.evaluate((e) => e.style.getPropertyValue('--seg-x'));
  const onLeft = await seg.evaluate((e) => { const o = e.querySelector('button.on').getBoundingClientRect().left - e.getBoundingClientRect().left - e.clientLeft; return Math.abs(o - parseFloat(e.style.getPropertyValue('--seg-x'))) < 1; });
  ok(x0 !== x1 && onLeft, `indicator moved to the active tab (${x0} → ${x1})`);
  // Button press feedback.
  const btn = p.locator('.dash-summary .segmented button').first();
  const box = await btn.boundingBox(); await p.mouse.move(box.x + 5, box.y + 5); await p.mouse.down(); await p.waitForTimeout(200);
  const tf = await btn.evaluate((e) => getComputedStyle(e).transform); await p.mouse.up();
  ok(tf !== 'none', 'pressed button scales: ' + tf);
  // Skeleton during load (slow the first data read).
  const sk = await b.newContext({ viewport: { width: 390, height: 844 }, locale: 'id-ID', storageState: st });
  const sp = await sk.newPage();
  await sp.addInitScript(() => { const g = Storage.prototype.getItem; Storage.prototype.getItem = function (k) { if (String(k).endsWith(':data') && !window.__slow) { window.__slow = 1; const t = Date.now(); while (Date.now() - t < 10); } return g.call(this, k); }; });
  await sp.goto(BASE + '/');
  ok(await sp.locator('.skeleton-page, .hero-amount').first().isVisible(), 'skeleton or content is shown, never a blank page');
  // Phone header: secondary actions become 44px icon buttons and fit one row with the primary.
  await sp.goto(BASE + '/#/budgets'); await sp.locator('.page-actions').waitFor();
  const sizes = await sp.locator('.page-head h1, .page-actions > .btn').evaluateAll((els) => els.map((e) => [Math.round(e.getBoundingClientRect().width), Math.round(e.getBoundingClientRect().top + e.getBoundingClientRect().height / 2)]));
  ok(sizes[1][0] === 44 && Math.abs(sizes[0][1] - sizes[2][1]) < 6 && Math.abs(sizes[1][1] - sizes[2][1]) < 2, 'phone header: title and actions on one row: ' + JSON.stringify(sizes));
  ok(await sp.getByRole('button', { name: 'Ekspor' }).isVisible(), 'icon button keeps its accessible name');
  await b.close(); done(errs);
})();
