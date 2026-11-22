import { describe, expect, it } from 'vitest';
import { makeData } from './gen';
import { categoryBreakdown, clampToToday, comparisonSpan, compareCategories, monthlyComparison } from '../lib/analytics';
import { dedupe, summarize } from '../lib/finance';
import { periodTotals } from '../lib/periods';

const d = makeData(900, 33); const txs = dedupe(d.transactions);
const span = { from: '2026-06-01', to: '2026-11-22' };
const rate = (c: string) => (c === 'USD' ? 16000 : 1);

describe('category breakdown', () => {
  it('sums to the period expense/income total, shares add up to 1, transfers excluded', () => {
    for (const type of ['expense', 'income'] as const) {
      const b = categoryBreakdown(txs, d.wallets, span, type, 'IDR', d.rates);
      const cur = new Map(d.wallets.map((w) => [w.id, w.currency]));
      const manual = txs.filter((t) => t.type === type && t.occurredAt.slice(0, 10) >= span.from && t.occurredAt.slice(0, 10) <= span.to).reduce((s, t) => s + (t.amount * rate(cur.get(t.walletId)!)), 0);
      expect(Math.abs(b.total - manual)).toBeLessThanOrEqual(b.slices.length + 1);
      expect(b.slices.reduce((s, x) => s + x.share, 0)).toBeCloseTo(1, 6);
      const p = periodTotals(txs, d.wallets, span, 'IDR', d.rates);
      expect(Math.abs(b.total - (type === 'expense' ? p.expense : p.income))).toBeLessThanOrEqual(b.slices.length + 1);
    }
  });
  it('is sorted largest first and reports unconvertible currencies instead of mixing them', () => {
    const b = categoryBreakdown(txs, d.wallets, span, 'expense', 'IDR', []);
    expect(b.missing).toEqual(['USD']);
    expect(b.slices.map((s) => s.value)).toEqual([...b.slices.map((s) => s.value)].sort((a, c) => c - a));
  });
});

describe('category comparison', () => {
  it('includes categories that only exist in one window and computes change', () => {
    const c = compareCategories([{ categoryId: 'a', value: 200, share: 0.8 }, { categoryId: 'n', value: 50, share: 0.2 }], [{ categoryId: 'a', value: 100, share: 0.5 }, { categoryId: 'g', value: 100, share: 0.5 }]);
    expect(c.find((x) => x.categoryId === 'a')).toMatchObject({ current: 200, previous: 100, change: 1 });
    expect(c.find((x) => x.categoryId === 'n')).toMatchObject({ previous: 0, change: null });
    expect(c.find((x) => x.categoryId === 'g')).toMatchObject({ current: 0, change: -1 });
  });
});

describe('monthly comparison', () => {
  const rows = monthlyComparison(txs, d.wallets, '2026-11-22', 6, 'IDR', d.rates);
  it('returns six calendar months ending with the current one', () => {
    expect(rows.map((r) => r.key)).toEqual(['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']);
  });
  it('each row equals the independent per-month summary; months add up to the whole range', () => {
    let inc = 0, exp = 0;
    for (const r of rows) {
      const s = summarize(txs, d.wallets, r.span);
      const cur = (o: Record<string, number>) => Object.entries(o).reduce((a, [c, v]) => a + v * rate(c), 0);
      expect(Math.abs(r.income - cur(s.income))).toBeLessThanOrEqual(1);
      expect(Math.abs(r.expense - cur(s.expense))).toBeLessThanOrEqual(1);
      expect(r.net).toBe(r.income - r.expense);
      inc += r.income; exp += r.expense;
    }
    const whole = periodTotals(txs, d.wallets, { from: '2026-06-01', to: '2026-11-30' }, 'IDR', d.rates);
    expect(Math.abs(inc - whole.income)).toBeLessThanOrEqual(6); expect(Math.abs(exp - whole.expense)).toBeLessThanOrEqual(6);
  });
  it('month-over-month change refers to the month before; saving rate is net ÷ income', () => {
    expect(rows[1].expenseChange).toBeCloseTo((rows[1].expense - rows[0].expense) / rows[0].expense, 9);
    for (const r of rows) expect(r.savingRate).toBe(r.income > 0 ? r.net / r.income : null);
  });
});

describe('clampToToday', () => {
  it('cuts an in-progress span at today and leaves finished spans alone', () => {
    expect(clampToToday({ from: '2026-11-01', to: '2026-11-30' }, '2026-11-22')).toEqual({ from: '2026-11-01', to: '2026-11-22' });
    expect(clampToToday({ from: '2026-10-01', to: '2026-10-31' }, '2026-11-22')).toEqual({ from: '2026-10-01', to: '2026-10-31' });
    expect(clampToToday({ from: '2026-12-01', to: '2026-12-31' }, '2026-11-22')).toEqual({ from: '2026-12-01', to: '2026-12-01' });
  });
});

describe('comparisonSpan', () => {
  it('month to date is compared with the same stretch of the previous month', () => {
    expect(comparisonSpan({ from: '2026-11-01', to: '2026-11-30' }, '2026-11-22')).toEqual({ current: { from: '2026-11-01', to: '2026-11-22' }, previous: { from: '2026-10-01', to: '2026-10-22' } });
  });
  it('a finished month is compared with the whole month before; 3 months with the 3 before', () => {
    expect(comparisonSpan({ from: '2026-10-01', to: '2026-10-31' }, '2026-11-22').previous).toEqual({ from: '2026-09-01', to: '2026-09-30' });
    expect(comparisonSpan({ from: '2026-09-01', to: '2026-11-30' }, '2026-11-22').previous).toEqual({ from: '2026-06-01', to: '2026-08-22' });
  });
  it('clamps the day when the earlier month is shorter, and handles year boundaries', () => {
    expect(comparisonSpan({ from: '2026-03-01', to: '2026-03-31' }, '2026-03-31').previous).toEqual({ from: '2026-02-01', to: '2026-02-28' });
    expect(comparisonSpan({ from: '2026-01-01', to: '2026-01-31' }, '2026-01-15').previous).toEqual({ from: '2025-12-01', to: '2025-12-15' });
  });
  it('a custom range falls back to an equally long window right before it', () => {
    expect(comparisonSpan({ from: '2026-11-10', to: '2026-11-16' }, '2026-11-22').previous).toEqual({ from: '2026-11-03', to: '2026-11-09' });
  });
});
