import { describe, expect, it } from 'vitest';
import { makeData } from './gen';
import { addDays, autoBuckets, buildBuckets, CHART_RANGES, daysBetween, flowByBucket, periodTotals, previousSpan, rangeBounds } from '../lib/periods';
import { dedupe } from '../lib/finance';

const TODAYS = ['2026-11-22', '2026-11-30', '2026-12-31', '2027-01-01', '2028-02-29', '2026-03-29', '2026-10-25', '2026-01-31'];

describe('range bounds', () => {
  it('matches the documented definitions', () => {
    expect(rangeBounds('7D', '2026-11-22')).toEqual({ from: '2026-11-16', to: '2026-11-22' });
    expect(rangeBounds('1M', '2026-11-22')).toEqual({ from: '2026-10-24', to: '2026-11-22' });
    expect(rangeBounds('3M', '2026-11-22')).toEqual({ from: '2026-09-01', to: '2026-11-22' });
    expect(rangeBounds('6M', '2026-11-22')).toEqual({ from: '2026-06-01', to: '2026-11-22' });
    expect(rangeBounds('1Y', '2026-11-22')).toEqual({ from: '2025-12-01', to: '2026-11-22' });
  });
  it('previous span is contiguous and the same length', () => {
    for (const today of TODAYS) for (const r of CHART_RANGES) {
      const s = rangeBounds(r, today), p = previousSpan(s);
      expect(addDays(p.to, 1)).toBe(s.from);
      expect(daysBetween(p.from, p.to)).toBe(daysBetween(s.from, s.to));
    }
  });
});

describe('buckets cover the range exactly', () => {
  for (const lang of ['id', 'en'] as const) {
    it(`contiguous, no gaps or overlaps (${lang})`, () => {
      for (const today of TODAYS) for (const r of CHART_RANGES) {
        const b = buildBuckets(r, today, lang), s = rangeBounds(r, today);
        expect(b[0].from).toBe(s.from);
        expect(b[b.length - 1].to).toBe(s.to);
        for (let i = 1; i < b.length; i++) expect(addDays(b[i - 1].to, 1)).toBe(b[i].from);
        for (const x of b) expect(x.from <= x.to).toBe(true);
      }
    });
  }
  it('bucket counts', () => {
    expect(buildBuckets('7D', '2026-11-22', 'id')).toHaveLength(7);
    expect(buildBuckets('1M', '2026-11-22', 'id')).toHaveLength(6);
    expect(buildBuckets('3M', '2026-11-22', 'id')).toHaveLength(3);
    expect(buildBuckets('6M', '2026-11-22', 'id')).toHaveLength(6);
    expect(buildBuckets('1Y', '2026-11-22', 'id')).toHaveLength(12);
  });
  it('auto buckets cover arbitrary ranges', () => {
    for (const span of [{ from: '2026-11-01', to: '2026-11-10' }, { from: '2026-10-01', to: '2026-11-22' }, { from: '2025-01-15', to: '2026-11-22' }, { from: '2026-02-01', to: '2026-02-28' }]) {
      const b = autoBuckets(span, 'en');
      expect(b[0].from).toBe(span.from); expect(b[b.length - 1].to).toBe(span.to);
      for (let i = 1; i < b.length; i++) expect(addDays(b[i - 1].to, 1)).toBe(b[i].from);
    }
  });
});

describe('bucketed flow equals the period total', () => {
  it('sums match for every range, with mixed currencies and transfers present', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const d = makeData(500, seed); const txs = dedupe(d.transactions);
      for (const today of ['2026-11-22', '2026-11-30']) for (const r of CHART_RANGES) {
        const span = rangeBounds(r, today);
        const { points, missing } = flowByBucket(txs, d.wallets, buildBuckets(r, today, 'id'), 'IDR', 'IDR', d.rates);
        const tot = periodTotals(txs, d.wallets, span, 'IDR', d.rates);
        expect(missing).toEqual([]);
        expect(points.reduce((s, p) => s + p.income, 0)).toBe(tot.income);
        expect(points.reduce((s, p) => s + p.expense, 0)).toBe(tot.expense);
        expect(tot.net).toBe(tot.income - tot.expense);
      }
    }
  });
  it('includes the first and last minute of the range, excludes the neighbours', () => {
    const d = makeData(0);
    const mk = (id: string, at: string): never => ({ id, userId: 'u', type: 'income', walletId: 'w0', categoryId: 'cat_salary', amount: 100, occurredAt: at, description: '', notes: '', createdAt: '' } as never);
    const txs = [mk('a', '2026-11-15T23:59'), mk('b', '2026-11-16T00:00'), mk('c', '2026-11-22T23:59'), mk('d', '2026-11-23T00:00')];
    const tot = periodTotals(txs, d.wallets, rangeBounds('7D', '2026-11-22'), 'IDR', d.rates);
    expect(tot.income).toBe(200);
  });
  it('reports a missing exchange rate instead of guessing', () => {
    const d = makeData(300, 3); const txs = dedupe(d.transactions);
    const { missing } = flowByBucket(txs, d.wallets, buildBuckets('1Y', '2026-11-22', 'id'), 'IDR', 'IDR', []);
    expect(missing).toEqual(['USD']);
  });
  it('saving rate is net ÷ income, null without income', () => {
    const d = makeData(0);
    expect(periodTotals([], d.wallets, rangeBounds('1M', '2026-11-22'), 'IDR', []).savingRate).toBeNull();
  });
});
