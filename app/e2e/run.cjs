// Runs every browser suite against a running preview (default http://localhost:4173, override with E2E_BASE_URL).
// Usage: npm run build:local && npm run preview:local & npm run e2e
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const out = path.resolve(process.argv[2] || 'e2e-output');
const only = process.argv.slice(3);
const suites = ['defaults-and-export', 'legal', 'welcome', 'auth-reset', 'dashboard', 'transactions', 'wallets-budgets', 'reports', 'mockup-polish', 'search-export-hub', 'tx-form', 'new-user', 'quick-add', 'export-worker', 'csp', 'sample-biz'].filter((s) => !only.length || only.includes(s));
let failed = [];
for (const s of suites) {
  const dir = path.join(out, s); fs.mkdirSync(dir, { recursive: true });
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [path.join(__dirname, s + '.cjs'), dir], { encoding: 'utf8', timeout: 600_000 });
  const text = (r.stdout || '') + (r.stderr || '');
  fs.writeFileSync(path.join(dir, 'log.txt'), text);
  const passed = r.status === 0 && /ALL PASSED/.test(text) && !/^FAIL/m.test(text);
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${s.padEnd(22)} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  if (!passed) { failed.push(s); console.log(text.split('\n').filter((l) => /^FAIL|Error/.test(l)).slice(0, 10).map((l) => '      ' + l).join('\n')); }
}
console.log(failed.length ? `\n${failed.length} suite(s) failed: ${failed.join(', ')}` : `\nAll ${suites.length} suites passed.`);
process.exit(failed.length ? 1 : 0);
