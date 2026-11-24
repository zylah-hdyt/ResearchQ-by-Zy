import { describe, expect, it } from 'vitest';
import { buildSampleData, sampleIds } from '../store/sample';
import { DEFAULT_CATEGORIES } from '../data/seed';
import type { UserData } from '../data/types';

const empty = (): UserData => ({ wallets: [], categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: 'u' })), transactions: [], budgets: [], rates: [], readNotifications: [] });
const strip = (id: string) => id.replace('_s_', '_');

describe('sampleIds', () => {
  it('finds marked sample records and nothing else', () => {
    const d = buildSampleData('u', 'IDR', empty());
    const own = { id: 'w_abc', userId: 'u', name: 'Kas', type: 'cash' as const, currency: 'IDR' as const, initialBalance: 0, color: '#15803d', archived: false, createdAt: '2026-11-01T00:00:00.000Z' };
    const ids = sampleIds({ ...d, wallets: [...d.wallets, own] });
    expect(ids.size).toBe(d.wallets.length + d.transactions.length + d.budgets.length);
    expect(ids.has('w_abc')).toBe(false);
  });

  it('recognises sample data loaded by older versions (no marker)', () => {
    const d = buildSampleData('u', 'IDR', empty());
    const legacy: UserData = {
      ...d,
      wallets: d.wallets.map((w) => ({ ...w, id: strip(w.id) })),
      // In the cloud each saved batch gets its own database timestamp, so transactions do not share the wallets' time.
      transactions: d.transactions.map((t, i) => ({ ...t, id: strip(t.id), walletId: strip(t.walletId), toWalletId: t.toWalletId && strip(t.toWalletId), createdAt: `2026-11-23T15:32:5${3 + Math.floor(i / 100)}.000Z` })),
      budgets: d.budgets.map((b) => ({ ...b, id: strip(b.id) })),
    };
    // Things the person entered: a wallet in a sample colour, a transaction in it, and a budget, each with its own time.
    const own = { id: 'w_own', userId: 'u', name: 'BCA', type: 'bank' as const, currency: 'IDR' as const, initialBalance: 0, color: '#1d4ed8', archived: false, createdAt: '2026-11-20T10:00:00.123Z' };
    const ownTx = { ...legacy.transactions[0], id: 'tx_own', walletId: 'w_own', toWalletId: undefined, createdAt: '2026-11-21T10:00:00.456Z' };
    const ownBudget = { ...legacy.budgets[0], id: 'b_own', categoryId: 'cat_bills', createdAt: legacy.wallets[0].createdAt.replace(/\d\d\dZ$/, '999Z') };
    const ids = sampleIds({ ...legacy, wallets: [...legacy.wallets, own], transactions: [...legacy.transactions, ownTx], budgets: [...legacy.budgets, ownBudget] });
    expect(ids.has('b_own')).toBe(false);
    expect(ids.size).toBe(legacy.wallets.length + legacy.transactions.length + legacy.budgets.length);
    expect(ids.has('w_own')).toBe(false);
    expect(ids.has('tx_own')).toBe(false);
  });

  it('ignores ordinary data', () => {
    const d = empty();
    d.wallets = ['#1d4ed8', '#15803d', '#0891b2', '#7c3aed'].map((color, i) => ({ id: 'w' + i, userId: 'u', name: 'W' + i, type: 'cash', currency: 'IDR', initialBalance: 0, color, archived: false, createdAt: `2026-11-0${i + 1}T00:00:00.000Z` }));
    expect(sampleIds(d).size).toBe(0);
  });
});
