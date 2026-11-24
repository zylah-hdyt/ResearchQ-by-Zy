import { describe, expect, it } from 'vitest';
import { findAmounts, matchCategory, normalizePhone, parseMessage, pickAmount, type CategoryRef, type WalletRef } from '../../../supabase/functions/chat-webhook/parser';
import { DEFAULT_CATEGORIES } from '../data/seed';

const wallets: WalletRef[] = [
  { id: 'w_bca', name: 'BCA', currency: 'IDR' }, { id: 'w_cash', name: 'Tunai', currency: 'IDR' },
  { id: 'w_gopay', name: 'GoPay', currency: 'IDR' }, { id: 'w_bcat', name: 'BCA Tahapan', currency: 'IDR' }, { id: 'w_old', name: 'Lama', currency: 'IDR', archived: true },
];
const categories: CategoryRef[] = [...DEFAULT_CATEGORIES.map((c) => ({ id: c.id, key: c.key, type: c.type })), { id: 'c_kucing', name: 'Kucing', type: 'expense' }];
const today = '2026-11-24';
const p = (t: string) => parseMessage(t, { wallets, categories, today });
const amount = (t: string) => { const r = pickAmount(t.toLowerCase()); return 'hit' in r ? r.hit.value : r.error; };

describe('amounts', () => {
  it.each([
    ['25rb', 25000], ['25 rb', 25000], ['25ribu', 25000], ['25k', 25000], ['1,5jt', 1500000], ['1.5jt', 1500000], ['2jt', 2000000], ['2 juta', 2000000],
    ['Rp 25.000', 25000], ['rp25.000', 25000], ['1.250.000', 1250000], ['25000', 25000], ['makan 15.500', 15500], ['bensin 50k', 50000], ['gaji 12,5jt', 12500000],
  ])('%s → %d', (t, v) => expect(amount(t)).toBe(v));
  it('prefers a strong amount over a bare quantity ("2 kopi 50rb")', () => expect(amount('beli 2 kopi 50rb')).toBe(50000));
  it('uses the larger bare number when there is no unit ("kopi 2 gelas 30000")', () => expect(amount('kopi 2 gelas 30000')).toBe(30000));
  it('refuses two different strong amounts instead of guessing', () => expect(amount('makan 25rb dan parkir 5rb')).toBe('ambiguous-amount'));
  it('accepts the same amount repeated', () => expect(amount('25rb (25rb)')).toBe(25000));
  it('no number → no-amount', () => expect(amount('makan siang')).toBe('no-amount'));
  it('ignores dates and times', () => expect(findAmounts('5/11 makan 20rb').map((x) => x.value)).toEqual([20000]));
});

describe('transactions', () => {
  it('expense with category from a keyword', () => expect(p('makan siang 25rb')).toMatchObject({ kind: 'transaction', type: 'expense', amount: 25000, categoryId: 'cat_food', description: 'Makan siang', date: today }));
  it('income from the word "gaji"', () => expect(p('gaji 5jt')).toMatchObject({ type: 'income', amount: 5000000, categoryId: 'cat_salary' }));
  it('wallet by name, removed from the description', () => expect(p('bensin 50rb pakai bca')).toMatchObject({ type: 'expense', amount: 50000, walletId: 'w_bca', categoryId: 'cat_transport', description: 'Bensin' }));
  it('longest wallet name wins', () => expect(p('makan 30rb bca tahapan')).toMatchObject({ walletId: 'w_bcat' }));
  it('archived wallets are never chosen', () => expect(p('makan 30rb lama')).toMatchObject({ walletId: undefined }));
  it('plus / minus signs', () => { expect(p('+200rb ojek')).toMatchObject({ type: 'income' }); expect(p('-15rb parkir')).toMatchObject({ type: 'expense', categoryId: 'cat_transport' }); });
  it('yesterday and N days ago', () => { expect(p('kopi 18rb kemarin')).toMatchObject({ date: '2026-11-23', description: 'Kopi' }); expect(p('listrik 350rb 3 hari lalu')).toMatchObject({ date: '2026-11-21', categoryId: 'cat_utilities' }); });
  it('custom category by its name', () => expect(p('pasir kucing 85rb')).toMatchObject({ categoryId: 'c_kucing' }));
  it('English works too', () => expect(p('lunch 45k')).toMatchObject({ type: 'expense', amount: 45000, categoryId: 'cat_food' }));
  it('falls back to "other" when nothing matches', () => expect(p('xyz 10rb')).toMatchObject({ categoryId: 'cat_other_out' }));
  it('income without a keyword category → other income', () => expect(p('terima 100rb')).toMatchObject({ type: 'income', categoryId: 'cat_other_in' }));
  it('never mixes up a bare quantity', () => expect(p('beli 2 baju 300rb')).toMatchObject({ amount: 300000, categoryId: 'cat_shopping' }));
});

describe('transfers', () => {
  it('"transfer 500rb bca ke gopay"', () => expect(p('transfer 500rb bca ke gopay')).toMatchObject({ kind: 'transfer', amount: 500000, fromId: 'w_bca', toId: 'w_gopay' }));
  it('"tf dari bca ke tunai 200rb"', () => expect(p('tf dari bca ke tunai 200rb')).toMatchObject({ fromId: 'w_bca', toId: 'w_cash', amount: 200000 }));
  it('"pindah 1jt ke gopay dari bca" reads the direction', () => expect(p('pindah 1jt ke gopay dari bca')).toMatchObject({ fromId: 'w_bca', toId: 'w_gopay' }));
  it('needs exactly two wallets', () => { expect(p('transfer 500rb bca')).toEqual({ kind: 'unknown', reason: 'transfer-wallets' }); expect(p('transfer 500rb')).toEqual({ kind: 'unknown', reason: 'transfer-wallets' }); });
  it('same wallet twice is refused', () => expect(p('transfer 100rb bca ke bca')).toMatchObject({ kind: 'unknown' }));
});

describe('commands', () => {
  it.each([['saldo', 'balance'], ['Cek Saldo', 'balance'], ['hari ini', 'today'], ['bulan ini', 'month'], ['anggaran', 'budget'], ['batal', 'undo'], ['undo', 'undo'], ['bantuan', 'help'], ['halo', 'help'], ['?', 'help']])('%s → %s', (t, k) => expect(p(t).kind).toBe(k));
  it('link code', () => { expect(p('MYFI-482913')).toEqual({ kind: 'link', code: '482913' }); expect(p('hubungkan 482913')).toEqual({ kind: 'link', code: '482913' }); });
  it('empty / no amount', () => { expect(p('   ')).toEqual({ kind: 'unknown', reason: 'empty' }); expect(p('makan siang')).toEqual({ kind: 'unknown', reason: 'no-amount' }); });
});

describe('helpers', () => {
  it('normalizePhone', () => { expect(normalizePhone('0812-3456-7890')).toBe('6281234567890'); expect(normalizePhone('+62 812 3456 7890')).toBe('6281234567890'); expect(normalizePhone('6281234567890')).toBe('6281234567890'); });
  it('matchCategory restricts to the type', () => expect(matchCategory('gaji', 'expense', categories).key).toBe('otherExpense'));
});
