// Regenerates the PNG app icons from public/logo-icon.svg.
// Usage (needs Playwright's Chromium): node scripts/make-icons.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const pub = path.join(__dirname, '..', 'public');
const inner = fs.readFileSync(path.join(pub, 'logo-icon.svg'), 'utf8')
  .replace(/<rect[^>]*\/>/, '')
  .replace(/^[\s\S]*?<\/defs>/, '')
  .replace('</svg>', '');

/** Square icon. `bleed` = no rounded corners (stores/OS apply their own mask); `scale` shrinks art for maskable safe zone. */
const svg = (bleed, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14a89a"/><stop offset="1" stop-color="#0b5c56"/></linearGradient></defs>
  <rect width="120" height="120" ${bleed ? '' : 'rx="28"'} fill="url(#g)"/>
  <g transform="translate(${60 - 60 * scale} ${60 - 60 * scale}) scale(${scale})">${inner}</g></svg>`;

const jobs = [
  ['icon-192.png', 192, svg(false, 1)],
  ['icon-512.png', 512, svg(false, 1)],
  ['icon-maskable-512.png', 512, svg(true, 0.72)],
  ['apple-touch-icon.png', 180, svg(true, 0.9)],
];

(async () => {
  const b = await chromium.launch();
  for (const [file, size, markup] of jobs) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(`<body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px">${markup.replace('<svg ', `<svg width="${size}" height="${size}" `)}</div></body>`);
    await p.screenshot({ path: path.join(pub, file), omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
    await p.close();
    console.log('wrote', file);
  }
  await b.close();
})();
