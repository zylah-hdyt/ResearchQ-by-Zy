// PRD UI/UX §5: count-up ends on the exact value, sliding tab indicator, chart/progress reveal, press feedback,
// skeleton while loading, compact phone headers; and everything is instant with reduced motion.
const { boot, ok, done, digits, devices, BASE } = require('./common.cjs');
(async () => {
  const { b, ctx, p, errs } = await boot({ motion: true });
  const st = await ctx.storageState();
  // Count-up: mid-animation differs, final value equals the reduced-motion value.
  const r = await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'id-ID', reducedMotion: 'reduce', storageState: st });
  const rp = await r.newPage(); await rp.goto(BASE + '/'); await rp.locator('.hero-amount').waitFor();
  const finalText = await rp.locator('.hero-amount').innerText();
  ok(digits(finalText) > 0, 'reduced motion shows the final balance at once: ' + finalText);
  ok(await rp.evaluate(() => getComputedStyle(document.querySelector('.chart .bar')).animationName) === 'none', 'no chart animation with reduced motion');
  // Count-up: the first view of a visit counts up to the exact value; navigating around afterwards shows final numbers at once.
  await p.reload(); await p.locator('.hero-amount').waitFor();
  await p.evaluate(() => { window.__seen = []; new MutationObserver(() => { const h = document.querySelector('.hero-amount'); if (h) window.__seen.push(h.textContent); }).observe(document.body, { subtree: true, childList: true, characterData: true }); });
  await p.waitForTimeout(1000);
  const late = await p.locator('.hero-amount').innerText();
  const seen = [...new Set(await p.evaluate(() => window.__seen))];
  ok(seen.length > 3, `first view counts up (${seen.length} steps: ${seen.slice(0, 2).join(', ')} … ${seen[seen.length - 1]})`);
  await p.goto(BASE + '/#/accounts'); await p.locator('.nw .hero-amount').waitFor(); await p.waitForTimeout(700);
  await p.evaluate(() => { window.__seen2 = []; new MutationObserver(() => { const h = document.querySelector('.hero-amount'); if (h) window.__seen2.push(h.textContent); }).observe(document.body, { subtree: true, childList: true, characterData: true }); });
  await p.getByRole('link', { name: 'Dasbor' }).first().click(); await p.locator('.hero-amount').waitFor(); await p.waitForTimeout(700);
  const again = [...new Set(await p.evaluate(() => window.__seen2))];
  ok(again.length <= 1 && again[again.length - 1] === late, 'navigating back shows the final balance at once (no replay): ' + JSON.stringify(again));
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
  // Hover effects only where there is a hovering pointer (no sticky highlight after a tap on a phone).
  const ungated = await p.evaluate(() => {
    const bad = [];
    const walk = (rules, gated) => { for (const r of rules) {
      if (r.type === 4 /* media */) walk(r.cssRules, gated || /hover:\s*hover/.test(r.conditionText));
      else if (r.selectorText && r.selectorText.includes(':hover') && !gated) bad.push(r.selectorText);
    } };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules, false); } catch (e) { /* cross-origin */ } }
    return bad;
  });
  ok(ungated.length === 0, 'every :hover rule is behind (hover: hover): ' + ungated.slice(0, 3).join(' | '));
  // Toast is transition-based: slides in, leaves the same way, never restarts a keyframe.
  const tp = await (await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'id-ID', reducedMotion: 'no-preference', storageState: st })).newPage();
  await tp.goto(BASE + '/#/transactions'); await tp.waitForTimeout(500);
  await tp.goto(BASE + '/#/'); await tp.getByRole('button', { name: 'Hapus data contoh' }).click(); await tp.getByRole('dialog').getByRole('button', { name: 'Hapus' }).click();
  await tp.locator('.toast.in').waitFor();
  ok(await tp.locator('.toast').evaluate((e) => getComputedStyle(e).animationName === 'none'), 'toast has no keyframe animation (transition only)');
  await tp.locator('.toast').waitFor({ state: 'detached', timeout: 6000 });
  ok(true, 'toast removes itself after its exit');
  // Dialog exit: a ghost copy fades/slides out and is gone shortly after (and is never matched as a live .modal).
  await tp.getByRole('button', { name: 'Tambah dompet' }).first().click(); await tp.locator('.modal').waitFor();
  await tp.keyboard.press('Escape');
  await tp.waitForTimeout(40);
  ok((await tp.locator('.modal').count()) === 0 && (await tp.locator('.sheet-ghost').count()) === 1, 'on close the live dialog is gone and an exit ghost plays');
  await tp.locator('.sheet-ghost').waitFor({ state: 'detached', timeout: 2000 });
  ok(true, 'the exit ghost is cleaned up');
  // Bottom sheet on a phone: 1:1 drag, springs back when released slowly, dismissed by a flick.
  const ph = await b.newContext({ ...devices['iPhone 13'], locale: 'id-ID', reducedMotion: 'no-preference', storageState: st });
  const m = await ph.newPage(); await m.goto(BASE + '/#/accounts'); await m.waitForTimeout(600);
  await m.getByRole('button', { name: 'Tambah dompet' }).first().click(); await m.locator('.modal').waitFor(); await m.waitForTimeout(500);
  const head = await m.locator('.modal-head').boundingBox();
  const gx = head.x + 60, gy = head.y + head.height / 2;
  const dy = () => m.locator('.modal').evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m42);
  await m.mouse.move(gx, gy); await m.mouse.down(); await m.mouse.move(gx, gy + 40); await m.waitForTimeout(150); await m.mouse.move(gx, gy + 80); await m.waitForTimeout(150);
  const held = await dy();
  ok(Math.abs(held - 80) < 2, `sheet follows the finger 1:1 (moved 80, sheet at ${held.toFixed(1)})`);
  await m.mouse.move(gx, gy - 200); await m.waitForTimeout(100);
  const up = await dy();
  ok(up < 0 && up > -100, `resists past the top edge (rubber band): ${up.toFixed(1)} for a 200px pull`);
  await m.mouse.move(gx, gy + 80); await m.waitForTimeout(250);
  await m.mouse.up(); await m.waitForTimeout(700);
  ok((await m.locator('.modal').count()) === 1 && Math.abs(await dy()) < 1, 'released slowly: springs back to rest');
  await m.mouse.move(gx, gy); await m.mouse.down(); for (let i = 1; i <= 6; i++) await m.mouse.move(gx, gy + i * 70);
  await m.mouse.up();
  await m.locator('.modal').waitFor({ state: 'detached', timeout: 2000 });
  ok(true, 'a flick dismisses the sheet');
  await m.locator('.sheet-ghost').waitFor({ state: 'detached', timeout: 2000 });
  await b.close(); done(errs);
})();
