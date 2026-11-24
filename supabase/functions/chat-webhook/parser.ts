/**
 * Reads a chat message ("makan siang 25rb", "gaji 5jt bca", "transfer 500rb bca ke gopay", "saldo") into an intent.
 * Pure and dependency-free: it runs in the Supabase Edge Function (Deno) and in the app's unit tests.
 * It never guesses silently: anything unclear becomes `unknown` with a reason, and the caller asks the user.
 */

export interface WalletRef { id: string; name: string; currency: string; archived?: boolean }
export interface CategoryRef { id: string; key?: string; name?: string; type: 'income' | 'expense' }

export type Intent =
  | { kind: 'transaction'; type: 'income' | 'expense'; amount: number; walletId?: string; categoryId?: string; categoryKey?: string; description: string; date: string }
  | { kind: 'transfer'; amount: number; fromId: string; toId: string; description: string; date: string }
  | { kind: 'balance' } | { kind: 'today' } | { kind: 'month' } | { kind: 'budget' } | { kind: 'undo' } | { kind: 'help' }
  | { kind: 'link'; code: string }
  | { kind: 'unknown'; reason: 'empty' | 'no-amount' | 'ambiguous-amount' | 'transfer-wallets' | 'unknown-wallet' };

const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const shift = (today: string, days: number) => { const d = new Date(today + 'T12:00:00'); d.setDate(d.getDate() + days); return ymd(d); };
const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ───────── amounts ─────────
interface AmountHit { value: number; start: number; end: number; strong: boolean }
const UNIT: Record<string, number> = { rb: 1e3, ribu: 1e3, k: 1e3, jt: 1e6, juta: 1e6, m: 1e6 };

/** "25rb", "1,5jt", "Rp 25.000", "1.250.000", "25000". Strong = has a unit, "Rp", or a thousands separator. */
export function findAmounts(text: string): AmountHit[] {
  const out: AmountHit[] = [];
  const re = /(rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(\s*(?:rb|ribu|k|jt|juta)\b)?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const [full, rp, numRaw, unitRaw] = m;
    const unit = unitRaw ? UNIT[unitRaw.trim().toLowerCase()] : undefined;
    const grouped = /^\d{1,3}([.,]\d{3})+$/.test(numRaw);
    let n: number;
    // with a unit, "1,5jt" / "1.5jt" are decimals; "1.250jt"-style groups are not used in practice
    if (unit) n = Number(grouped ? numRaw.replace(/[.,]/g, '') : numRaw.replace(',', '.')) * unit;
    else if (grouped) n = Number(numRaw.replace(/[.,]/g, ''));
    else n = Number(numRaw.replace(',', '.'));
    if (!Number.isFinite(n) || n <= 0) continue;
    // a number glued to letters ("a1b") or part of a date ("5/11") is not an amount
    const before = text[m.index - 1], after = text[m.index + full.length];
    if ((before && /[a-z]/i.test(before) && !rp) || (after && /[\/:]/.test(after)) || (before && /[\/:]/.test(before))) continue;
    out.push({ value: Math.round(n), start: m.index, end: m.index + full.length, strong: !!(rp || unit || grouped) });
  }
  return out;
}

/** Picks the amount, or says why it cannot. Bare small numbers ("2 kopi") lose to a strong one. */
export function pickAmount(text: string): { hit: AmountHit } | { error: 'no-amount' | 'ambiguous-amount' } {
  const hits = findAmounts(text);
  if (!hits.length) return { error: 'no-amount' };
  const strong = hits.filter((h) => h.strong);
  if (strong.length === 1) return { hit: strong[0] };
  if (strong.length > 1) {
    const distinct = new Set(strong.map((h) => h.value));
    return distinct.size === 1 ? { hit: strong[0] } : { error: 'ambiguous-amount' };
  }
  const bare = hits.filter((h) => h.value >= 100);
  if (bare.length === 1) return { hit: bare[0] };
  if (bare.length > 1) return { error: 'ambiguous-amount' };
  return hits.length === 1 ? { hit: hits[0] } : { error: 'ambiguous-amount' };
}

// ───────── dates ─────────
function findDate(text: string, today: string): { date: string; start: number; end: number } | null {
  const rules: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/\bkemarin lusa\b|\blusa\b/i, () => shift(today, -2)],
    [/\bkemarin\b|\byesterday\b/i, () => shift(today, -1)],
    [/\b(\d{1,2}) hari (?:yang )?lalu\b|\b(\d{1,2}) days? ago\b/i, (m) => shift(today, -Number(m[1] ?? m[2]))],
    [/\bhari ini\b|\btoday\b|\btadi\b|\bbarusan\b/i, () => today],
  ];
  for (const [re, f] of rules) { const m = text.match(re); if (m && m.index !== undefined) return { date: f(m), start: m.index, end: m.index + m[0].length }; }
  return null;
}

// ───────── categories ─────────
const KEYWORDS: Record<string, string[]> = {
  salary: ['gaji', 'salary', 'upah'],
  bonus: ['bonus', 'thr', 'insentif'],
  business: ['usaha', 'jualan', 'omzet', 'proyek', 'project', 'freelance', 'jasa', 'klien', 'penjualan'],
  investment: ['dividen', 'bunga', 'investasi', 'saham', 'profit', 'reksadana', 'crypto'],
  giftIn: ['hadiah', 'angpao', 'angpau', 'kado'],
  food: ['makan', 'minum', 'kopi', 'ngopi', 'sarapan', 'lunch', 'dinner', 'resto', 'restoran', 'warung', 'bakso', 'nasi', 'jajan', 'snack', 'boba', 'teh', 'gofood', 'grabfood', 'shopeefood', 'cafe', 'kafe', 'starbucks', 'mie', 'ayam', 'sate', 'es'],
  groceries: ['sembako', 'supermarket', 'indomaret', 'alfamart', 'pasar', 'sayur', 'groceries', 'belanja bulanan', 'belanja harian', 'galon', 'beras'],
  transport: ['bensin', 'ojek', 'ojol', 'gojek', 'grab', 'parkir', 'tol', 'bus', 'kereta', 'krl', 'mrt', 'taksi', 'taxi', 'transport', 'angkot', 'pertamax', 'pertalite', 'bbm', 'tiket pesawat', 'travel'],
  housing: ['sewa', 'kos', 'kost', 'kontrakan', 'kpr', 'rumah'],
  utilities: ['listrik', 'token', 'pln', 'pdam', 'air', 'internet', 'wifi', 'indihome', 'pulsa', 'kuota', 'gas'],
  shopping: ['baju', 'sepatu', 'tas', 'elektronik', 'shopee', 'tokopedia', 'lazada', 'belanja online', 'shopping', 'tiktok shop', 'beli'],
  health: ['dokter', 'obat', 'apotek', 'rumah sakit', 'klinik', 'vitamin', 'bpjs', 'gym', 'medis', 'dentist', 'gigi'],
  education: ['sekolah', 'kuliah', 'spp', 'buku', 'kursus', 'les', 'kelas', 'ukt', 'seminar'],
  entertainment: ['bioskop', 'nonton', 'film', 'game', 'konser', 'liburan', 'wisata', 'karaoke', 'hiburan', 'hotel'],
  bills: ['tagihan', 'langganan', 'netflix', 'spotify', 'youtube', 'asuransi', 'cicilan', 'kartu kredit', 'subscription'],
};
const INCOME_KEYS = new Set(['salary', 'bonus', 'business', 'investment', 'giftIn']);
const INCOME_WORDS = ['gaji', 'bonus', 'thr', 'terima', 'diterima', 'dapat', 'pemasukan', 'masuk', 'income', 'salary', 'untung', 'dividen', 'angpao', 'angpau', 'dibayar klien', 'cashback'];
const EXPENSE_WORDS = ['bayar', 'beli', 'belanja', 'keluar', 'pengeluaran', 'expense', 'jajan', 'makan', 'ngopi'];

const hasWord = (text: string, w: string) => new RegExp(`(^|[^a-z0-9])${escRe(w)}([^a-z0-9]|$)`).test(text);

function categoryScore(text: string, key: string): number {
  let best = 0;
  for (const w of KEYWORDS[key] ?? []) if (hasWord(text, w)) best = Math.max(best, w.includes(' ') ? 3 : w.length >= 4 ? 2 : 1);
  return best;
}

/** Custom category names win over built-in keywords. Falls back to "other" of the right type. */
export function matchCategory(text: string, type: 'income' | 'expense', cats: CategoryRef[]): { id?: string; key?: string } {
  const pool = cats.filter((c) => c.type === type);
  for (const c of pool) if (c.name && c.name.length >= 3 && hasWord(text, norm(c.name))) return { id: c.id, key: c.key };
  let best: { key: string; score: number } | null = null;
  for (const key of Object.keys(KEYWORDS)) {
    if (INCOME_KEYS.has(key) !== (type === 'income')) continue;
    const s = categoryScore(text, key);
    if (s > (best?.score ?? 0)) best = { key, score: s };
  }
  const key = best?.key ?? (type === 'income' ? 'otherIncome' : 'otherExpense');
  const found = pool.find((c) => c.key === key);
  return { id: found?.id, key };
}

// ───────── wallets ─────────
/** Wallet names found in the text with their position, longest names first so "BCA Tahapan" beats "BCA". */
function findWallets(text: string, wallets: WalletRef[]) {
  const hits: { wallet: WalletRef; start: number; end: number }[] = [];
  const taken: [number, number][] = [];
  for (const w of [...wallets.filter((x) => !x.archived)].sort((a, b) => b.name.length - a.name.length)) {
    const name = norm(w.name);
    if (!name) continue;
    const re = new RegExp(`(^|[^a-z0-9])(${escRe(name)})(?=$|[^a-z0-9])`, 'g');
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const start = m.index + m[1].length, end = start + name.length;
      if (taken.some(([a, b]) => start < b && end > a)) continue;
      taken.push([start, end]); hits.push({ wallet: w, start, end });
    }
  }
  return hits.sort((a, b) => a.start - b.start);
}

// ───────── main ─────────
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function parseMessage(raw: string, ctx: { wallets: WalletRef[]; categories: CategoryRef[]; today: string }): Intent {
  const original = (raw ?? '').replace(/[‎‏]/g, '').trim();
  const text = norm(original);
  if (!text) return { kind: 'unknown', reason: 'empty' };

  const link = text.match(/^(?:myfi[\s-]*|hubungkan\s+|link\s+|connect\s+|kode\s+)(\d{6})$/);
  if (link) return { kind: 'link', code: link[1] };
  if (/^(saldo|cek saldo|balance|sisa uang|sisa saldo)$/.test(text)) return { kind: 'balance' };
  if (/^(hari ini|hariini|rekap hari ini|today)$/.test(text)) return { kind: 'today' };
  if (/^(bulan ini|rekap|rekap bulan ini|ringkasan|summary|month|laporan)$/.test(text)) return { kind: 'month' };
  if (/^(anggaran|budget|cek anggaran)$/.test(text)) return { kind: 'budget' };
  if (/^(batal|undo|cancel|hapus terakhir|salah)$/.test(text)) return { kind: 'undo' };
  if (/^(bantuan|help|menu|\?|halo|hai|hi|hello|tolong|cara pakai)$/.test(text)) return { kind: 'help' };

  const amt = pickAmount(text);
  if ('error' in amt) return { kind: 'unknown', reason: amt.error };
  const { hit } = amt;

  const dateHit = findDate(text, ctx.today);
  const date = dateHit?.date ?? ctx.today;
  const wallets = findWallets(text, ctx.wallets);

  // remove what has been understood; the rest is the description
  const cuts: [number, number][] = [[hit.start, hit.end], ...wallets.map((w) => [w.start, w.end] as [number, number])];
  if (dateHit) cuts.push([dateHit.start, dateHit.end]);
  const describe = (extraWords: RegExp) => {
    let s = '';
    let i = 0;
    for (const [a, b] of cuts.sort((x, y) => x[0] - y[0])) { if (a >= i) { s += text.slice(i, a) + ' '; i = b; } }
    s += text.slice(i);
    return cap(s.replace(extraWords, ' ').replace(/\b(dari|ke|pakai|via|dengan|di|dgn|pake)\b(?=\s*$)/g, ' ').replace(/[+\-:,]/g, ' ').replace(/\s+/g, ' ').trim());
  };

  // transfer: "transfer 500rb bca ke gopay", "tf dari bca ke gopay", "pindah 1jt ke gopay dari bca"
  const startsTransfer = /^(transfer|tf|pindah|pindahkan|kirim)\b/.test(text);
  if (startsTransfer || (/\b(transfer|tf|pindah dana)\b/.test(text) && wallets.length >= 2)) {
    if (wallets.length !== 2) return { kind: 'unknown', reason: 'transfer-wallets' };
    const [first, second] = wallets;
    const dariBeforeSecond = /\bdari\s*$/.test(text.slice(0, second.start).trimEnd());
    const dariBeforeFirst = /\bdari\s*$/.test(text.slice(0, first.start).trimEnd());
    const [from, to] = dariBeforeSecond && !dariBeforeFirst ? [second, first] : [first, second];
    if (from.wallet.id === to.wallet.id) return { kind: 'unknown', reason: 'transfer-wallets' };
    return { kind: 'transfer', amount: hit.value, fromId: from.wallet.id, toId: to.wallet.id, description: describe(/\b(transfer|tf|pindahkan|pindah|kirim|dana)\b/g), date };
  }

  // wallet words that did not match any wallet: "pakai ovo" when the user has no "ovo"
  const unknownWallet = text.match(/\b(?:pakai|pake|via|dari|dgn|dengan)\s+([a-z0-9]{3,})\s*$/);
  if (unknownWallet && !wallets.length && ctx.wallets.length > 1 && /\b(pakai|pake|via|dgn|dengan)\b/.test(text)) return { kind: 'unknown', reason: 'unknown-wallet' };

  const sign = original.trim().startsWith('+') ? 'income' : original.trim().startsWith('-') ? 'expense' : null;
  const incomeScore = INCOME_WORDS.filter((w) => hasWord(text, w)).length + (sign === 'income' ? 2 : 0);
  const expenseScore = EXPENSE_WORDS.filter((w) => hasWord(text, w)).length + (sign === 'expense' ? 2 : 0);
  const type: 'income' | 'expense' = incomeScore > expenseScore ? 'income' : 'expense';
  const cat = matchCategory(text, type, ctx.categories);
  const stop = /\b(terima|diterima|dapat|pemasukan|masuk|income|keluar|pengeluaran|expense|bayar|dibayar)\b/g;
  return { kind: 'transaction', type, amount: hit.value, walletId: wallets[0]?.wallet.id, categoryId: cat.id, categoryKey: cat.key, description: describe(stop), date };
}

/** Normalises a phone number from a chat provider to digits with the country code ("0812…" → "62812…"). */
export function normalizePhone(raw: string): string {
  let d = String(raw ?? '').replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '62' + d.slice(1);
  return d;
}
