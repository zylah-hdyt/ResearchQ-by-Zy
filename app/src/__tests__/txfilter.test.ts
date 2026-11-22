import { describe, expect, it } from 'vitest';
import { makeData } from './gen';
import { activeCount, applyFilters, baseAmount, defaultFilters, groupByDay, matchesQuery, summarizeList, type FilterCtx, type TxFilters } from '../lib/txFilter';
import { dedupe, summarize } from '../lib/finance';

const d = makeData(800, 11);
const txs = dedupe(d.transactions);
const ctx: FilterCtx = { wallets: d.wallets, base: 'IDR', rates: d.rates, categoryLabel: (id) => id ?? '' };
const wide = { from: '2000-01-01', to: '2100-01-01' };
const f = (o: Partial<TxFilters> = {}): TxFilters => ({ ...defaultFilters(wide, 'all'), ...o });

describe('filters', () => {
  it('no filters returns everything in range', () => expect(applyFilters(txs, f(), ctx)).toHaveLength(txs.length));
  it('type', () => {
    for (const type of ['income', 'expense', 'transfer'] as const) {
      const r = applyFilters(txs, f({ type }), ctx);
      expect(r.length).toBe(txs.filter((t) => t.type === type).length);
      expect(r.every((t) => t.type === type)).toBe(true);
    }
  });
  it('a wallet filter includes transfers into and out of that wallet', () => {
    const r = applyFilters(txs, f({ walletIds: ['w1'] }), ctx);
    expect(r.length).toBe(txs.filter((t) => t.walletId === 'w1' || t.toWalletId === 'w1').length);
    expect(r.some((t) => t.type === 'transfer' && t.toWalletId === 'w1')).toBe(true);
  });
  it('category filter excludes transfers', () => {
    const r = applyFilters(txs, f({ categoryIds: ['cat_food'] }), ctx);
    expect(r.every((t) => t.categoryId === 'cat_food' && t.type !== 'transfer')).toBe(true);
  });
  it('amount bounds are applied in the preferred currency', () => {
    const lo = 500_000_00, hi = 1_000_000_00;
    const r = applyFilters(txs, f({ min: lo, max: hi }), ctx);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((t) => baseAmount(t, ctx) >= lo && baseAmount(t, ctx) <= hi)).toBe(true);
    expect(r.length).toBe(txs.filter((t) => baseAmount(t, ctx) >= lo && baseAmount(t, ctx) <= hi).length);
    // a USD transaction of $100 counts as Rp 1.600.000
    const usd = d.wallets.find((w) => w.currency === 'USD')!;
    expect(baseAmount({ ...txs[0], walletId: usd.id, amount: 100_00 }, ctx)).toBe(1_600_000_00);
  });
  it('date range is inclusive on both ends', () => {
    const day = txs[5].occurredAt.slice(0, 10);
    const r = applyFilters(txs, f({ range: { from: day, to: day } }), ctx);
    expect(r.every((t) => t.occurredAt.startsWith(day))).toBe(true);
    expect(r).toContain(txs[5]);
  });
  it('filters combine (AND)', () => {
    const r = applyFilters(txs, f({ type: 'expense', walletIds: ['w0'], categoryIds: ['cat_food', 'cat_transport'] }), ctx);
    expect(r.every((t) => t.type === 'expense' && t.walletId === 'w0' && ['cat_food', 'cat_transport'].includes(t.categoryId!))).toBe(true);
  });
  it('active filter badge ignores search and counts each group once', () => {
    expect(activeCount(f({ q: 'abc' }), 'all')).toBe(0);
    expect(activeCount(f({ type: 'income', walletIds: ['a', 'b'], min: 1 }), 'all')).toBe(3);
  });
});

describe('search', () => {
  const sample = { ...txs[0], description: 'Makan siang Warteg', notes: 'dengan tim', amount: 125_000_00, categoryId: 'cat_food', walletId: 'w0' };
  it('matches words in any field, case-insensitively', () => {
    expect(matchesQuery(sample, 'warteg', ctx)).toBe(true);
    expect(matchesQuery(sample, 'TIM makan', ctx)).toBe(true);
    expect(matchesQuery(sample, 'cat_food', ctx)).toBe(true);
    expect(matchesQuery(sample, 'bensin', ctx)).toBe(false);
  });
  it('matches amounts typed with or without separators', () => {
    expect(matchesQuery(sample, '125000', ctx)).toBe(true);
    expect(matchesQuery(sample, '125.000', ctx)).toBe(true);
    expect(matchesQuery(sample, '999000', ctx)).toBe(false);
  });
});

describe('summaries', () => {
  it('list totals equal the finance summary and exclude transfers', () => {
    const t = summarizeList(txs, ctx), s = summarize(txs, d.wallets);
    const inc = (s.income.IDR ?? 0) + (s.income.USD ?? 0) * 16000;
    expect(t.income).toBe(inc);
    expect(t.net).toBe(t.income - t.expense);
    expect(t.count).toBe(txs.length);
  });
  it('day groups partition the list and their nets add up to the total net', () => {
    const groups = groupByDay(txs, ctx);
    expect(groups.reduce((n, g) => n + g.items.length, 0)).toBe(txs.length);
    expect(new Set(groups.flatMap((g) => g.items.map((x) => x.id))).size).toBe(txs.length);
    for (let i = 1; i < groups.length; i++) expect(groups[i - 1].day > groups[i].day).toBe(true);
    expect(groups.reduce((n, g) => n + g.net, 0)).toBe(summarizeList(txs, ctx).net);
  });
});
