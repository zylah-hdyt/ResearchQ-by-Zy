import { beforeEach, describe, expect, it } from 'vitest';
import { handleIncoming, wib, type BalanceRow, type NewTx, type Store, type Totals, type UserCtx } from '../../../supabase/functions/chat-webhook/core.ts';
import type { CategoryRef, WalletRef } from '../../../supabase/functions/chat-webhook/parser.ts';
import { DEFAULT_CATEGORIES } from '../data/seed';

interface Tx extends NewTx { id: string }
function memoryStore(language: 'id' | 'en' = 'id') {
  const wallets: (WalletRef & { initial: number })[] = [
    { id: 'w_bca', name: 'BCA', currency: 'IDR', initial: 100_000_000 }, { id: 'w_cash', name: 'Tunai', currency: 'IDR', initial: 0 },
    { id: 'w_usd', name: 'Dolar', currency: 'USD', initial: 50_000 }, { id: 'w_old', name: 'Lama', currency: 'IDR', initial: 0, archived: true },
  ];
  const categories: CategoryRef[] = DEFAULT_CATEGORIES.map((c) => ({ id: c.id, key: c.key, type: c.type }));
  const txs: Tx[] = []; const links = new Map<string, string>(); const codes = new Map<string, string>(); const seen = new Set<string>();
  const last: { txId?: string | null; walletId?: string } = {}; let n = 0;
  const eff = (w: string, t: Tx) => (t.type === 'income' && t.walletId === w ? t.amount : t.type === 'expense' && t.walletId === w ? -t.amount : t.type === 'transfer' ? (t.walletId === w ? -t.amount : 0) + (t.toWalletId === w ? t.toAmount ?? t.amount : 0) : 0);
  const store: Store = {
    seen: async (id) => (seen.has(id) ? true : (seen.add(id), false)),
    userByPhone: async (p) => links.get(p) ?? null,
    linkWithCode: async (code, phone) => { const u = codes.get(code); if (!u) return null; codes.delete(code); links.set(phone, u); return u; },
    context: async (userId): Promise<UserCtx> => ({ userId, language, currency: 'IDR', wallets, categories, lastWalletId: last.walletId, lastTxId: last.txId }),
    addTransaction: async (_u, t) => { const id = 'tx' + ++n; txs.push({ ...t, id }); return id; },
    deleteTransaction: async (_u, id) => { const i = txs.findIndex((x) => x.id === id); if (i < 0) return null; const [t] = txs.splice(i, 1); return { description: t.description, amount: t.amount, currency: wallets.find((w) => w.id === t.walletId)!.currency, type: t.type }; },
    setLast: async (_u, patch) => { Object.assign(last, patch); },
    balances: async (): Promise<BalanceRow[]> => wallets.map((w) => ({ wallet: w, balance: w.initial + txs.reduce((s, t) => s + eff(w.id, t), 0) })),
    totals: async (_u, from, to): Promise<Totals> => { const o: Totals = {}; for (const t of txs) { if (t.type === 'transfer' || t.occurredAt.slice(0, 10) < from || t.occurredAt.slice(0, 10) > to) continue; const c = wallets.find((w) => w.id === t.walletId)!.currency; (o[c] ??= { income: 0, expense: 0 })[t.type as 'income' | 'expense'] += t.amount; } return o; },
    budgets: async () => [{ label: 'Makan & minum', spent: 90_000_00, limit: 100_000_00, currency: 'IDR' }],
  };
  return { store, txs, links, codes, wallets };
}
const NOW = new Date('2026-11-24T03:30:00Z'); // 10:30 WIB
const send = (s: Store, text: string, extra: { eventId?: string; phone?: string } = {}) => handleIncoming({ phone: extra.phone ?? '0812 3456 7890', text, eventId: extra.eventId, now: NOW }, s);

let m: ReturnType<typeof memoryStore>;
beforeEach(() => { m = memoryStore(); m.codes.set('482913', 'user-1'); });
const link = async () => { await send(m.store, 'MYFI-482913'); };

describe('linking', () => {
  it('an unknown number is told how to link and nothing is recorded', async () => {
    const r = await send(m.store, 'makan siang 25rb');
    expect(r).toMatch(/belum terhubung/); expect(r).toMatch(/not linked/); expect(m.txs).toHaveLength(0);
  });
  it('a valid code links the number (normalised), a wrong one does not', async () => {
    expect(await send(m.store, 'MYFI-111111')).toMatch(/salah atau sudah kedaluwarsa/);
    expect(await send(m.store, 'MYFI-482913')).toMatch(/Terhubung/);
    expect([...m.links.keys()]).toEqual(['6281234567890']);
    expect(m.codes.size).toBe(0); // one use only
  });
  it('the same number written differently is the same account', async () => { await link(); expect(await send(m.store, 'saldo', { phone: '+62 812-3456-7890' })).toMatch(/BCA/); });
});

describe('recording', () => {
  beforeEach(link);
  it('expense: stored as minor units in the first active wallet with the right category and a clear reply', async () => {
    const r = await send(m.store, 'makan siang 25rb');
    expect(m.txs).toHaveLength(1);
    expect(m.txs[0]).toMatchObject({ type: 'expense', walletId: 'w_bca', categoryId: 'cat_food', amount: 2_500_000, description: 'Makan siang', occurredAt: '2026-11-24T10:30' });
    expect(r).toMatch(/Pengeluaran Rp 25\.000/); expect(r).toMatch(/Makan & minum · BCA/); expect(r).toMatch(/Saldo BCA: Rp 999\.750\.000|Saldo BCA: Rp 975\.000/);
  });
  it('balance after is the real balance (independent arithmetic)', async () => {
    const r = await send(m.store, 'bensin 50rb');
    expect(r).toContain('Saldo BCA: Rp ' + new Intl.NumberFormat('id-ID').format((100_000_000 - 5_000_000) / 100));
  });
  it('income, explicit wallet, and the wallet is remembered for the next message', async () => {
    await send(m.store, 'gaji 5jt tunai'); expect(m.txs[0]).toMatchObject({ type: 'income', walletId: 'w_cash', amount: 500_000_000, categoryId: 'cat_salary' });
    await send(m.store, 'kopi 18rb'); expect(m.txs[1].walletId).toBe('w_cash');
  });
  it('yesterday keeps the date and uses noon', async () => { await send(m.store, 'kopi 18rb kemarin'); expect(m.txs[0].occurredAt).toBe('2026-11-23T12:00'); });
  it('archived wallets are never used', async () => { await send(m.store, 'makan 10rb lama'); expect(m.txs[0].walletId).toBe('w_bca'); });
  it('two different amounts record nothing', async () => { const r = await send(m.store, 'makan 25rb dan parkir 5rb'); expect(m.txs).toHaveLength(0); expect(r).toMatch(/lebih dari satu nominal/); });
  it('no amount records nothing', async () => { const r = await send(m.store, 'makan siang'); expect(m.txs).toHaveLength(0); expect(r).toMatch(/nominalnya/); });
  it('an absurd amount is refused', async () => { const r = await send(m.store, 'beli 999000jt'); expect(m.txs).toHaveLength(0); expect(r).toMatch(/terlalu besar/); });
  it('the same delivery twice is recorded once', async () => {
    await send(m.store, 'makan 25rb', { eventId: 'evt-1' }); const again = await send(m.store, 'makan 25rb', { eventId: 'evt-1' });
    expect(again).toBeNull(); expect(m.txs).toHaveLength(1);
  });
});

describe('transfers', () => {
  beforeEach(link);
  it('same-currency transfer is one transaction and the total stays the same', async () => {
    const before = (await m.store.balances('u')).reduce((s, r) => s + (r.wallet.currency === 'IDR' ? r.balance : 0), 0);
    await send(m.store, 'transfer 500rb bca ke tunai');
    expect(m.txs).toHaveLength(1); expect(m.txs[0]).toMatchObject({ type: 'transfer', walletId: 'w_bca', toWalletId: 'w_cash', amount: 50_000_000, toAmount: 50_000_000 });
    const after = (await m.store.balances('u')).reduce((s, r) => s + (r.wallet.currency === 'IDR' ? r.balance : 0), 0);
    expect(after).toBe(before);
  });
  it('different currencies are refused (needs the received amount)', async () => { const r = await send(m.store, 'transfer 500rb bca ke dolar'); expect(m.txs).toHaveLength(0); expect(r).toMatch(/beda mata uang/); });
});

describe('undo and reports', () => {
  beforeEach(link);
  it('"batal" removes only the last chat entry, once', async () => {
    await send(m.store, 'makan 25rb'); await send(m.store, 'kopi 18rb');
    expect(await send(m.store, 'batal')).toMatch(/Dibatalkan: Kopi/); expect(m.txs).toHaveLength(1);
    expect(await send(m.store, 'batal')).toMatch(/Tidak ada catatan terakhir/); expect(m.txs).toHaveLength(1);
  });
  it('"hari ini" totals exclude transfers', async () => {
    await send(m.store, 'gaji 1jt'); await send(m.store, 'makan 25rb'); await send(m.store, 'transfer 300rb bca ke tunai');
    const r = (await send(m.store, 'hari ini'))!;
    expect(r).toMatch(/Pemasukan: Rp 1\.000\.000/); expect(r).toMatch(/Pengeluaran: Rp 25\.000/); expect(r).toMatch(/Bersih: Rp 975\.000/);
  });
  it('balance lists wallets and totals only the base currency', async () => {
    const r = (await send(m.store, 'saldo'))!;
    expect(r).toMatch(/BCA: Rp 1\.000\.000/); expect(r).toMatch(/Dolar: USD 500,00/); expect(r).not.toMatch(/Lama/); expect(r).toMatch(/Total \(IDR\):\* Rp 1\.000\.000/);
  });
  it('budget shows status', async () => expect(await send(m.store, 'anggaran')).toMatch(/🟠 Makan & minum: Rp 90\.000 \/ Rp 100\.000 \(90%\)/));
  it('help lists the commands', async () => expect(await send(m.store, 'bantuan')).toMatch(/\*Catat\*/));
});

describe('language and time', () => {
  it('replies in the account language', async () => {
    m = memoryStore('en'); m.codes.set('482913', 'user-1'); await link();
    const r = await send(m.store, 'lunch 25k'); expect(r).toMatch(/Expense Rp 25\.000/); expect(r).toMatch(/Type \*undo\*/);
    expect(await send(m.store, 'balance')).toMatch(/\*Balances\*/);
  });
  it('"today" is WIB: 22:00 UTC is already tomorrow in Jakarta', () => { expect(wib(new Date('2026-11-24T22:00:00Z')).date).toBe('2026-11-25'); expect(wib(NOW)).toMatchObject({ date: '2026-11-24', time: '10:30' }); });
});
