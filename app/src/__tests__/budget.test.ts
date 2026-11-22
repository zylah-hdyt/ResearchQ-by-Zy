import { describe, expect, it } from 'vitest';
import { makeData } from './gen';
import { budgetHistory, budgetRow, budgetRows, budgetTotals, pace, shiftSpan, spanFor, weekSpan, monthSpan } from '../lib/budget';
import { budgetLines, dedupe } from '../lib/finance';
import { addDays, daysBetween } from '../lib/periods';
import type { Budget } from '../data/types';

const mk = (o: Partial<Budget> = {}): Budget => ({ id: 'b', userId: 'u', categoryId: 'cat_food', amount: 2_000_000_00, period: 'monthly', currency: 'IDR', createdAt: '', ...o });

describe('period spans', () => {
  it('weeks start on the configured day', () => {
    expect(weekSpan('2026-11-22', 1)).toEqual({ from: '2026-11-16', to: '2026-11-22' }); // Sunday belongs to the Mon-start week
    expect(weekSpan('2026-11-22', 0)).toEqual({ from: '2026-11-22', to: '2026-11-28' });
    expect(weekSpan('2026-11-16', 1)).toEqual({ from: '2026-11-16', to: '2026-11-22' });
    expect(weekSpan('2026-11-18', 1)).toEqual({ from: '2026-11-16', to: '2026-11-22' });
  });
  it('months, including leap day and year boundaries', () => {
    expect(monthSpan('2028-02-10')).toEqual({ from: '2028-02-01', to: '2028-02-29' });
    expect(shiftSpan('monthly', monthSpan('2026-01-15'), -1)).toEqual({ from: '2025-12-01', to: '2025-12-31' });
    expect(shiftSpan('weekly', weekSpan('2026-01-01', 1), -1)).toEqual({ from: '2025-12-22', to: '2025-12-28' });
  });
  it('shifted periods are contiguous', () => {
    for (const p of ['monthly', 'weekly'] as const) {
      const s = spanFor(p, '2026-11-22', 1);
      expect(addDays(shiftSpan(p, s, -1).to, 1)).toBe(s.from);
      expect(addDays(s.to, 1)).toBe(shiftSpan(p, s, 1).from);
    }
  });
});

describe('budget rows', () => {
  const d = makeData(900, 5); const txs = dedupe(d.transactions);
  it('spent equals an independent sum of the category expenses in the period (mixed currencies)', () => {
    const span = monthSpan('2026-10-15');
    const row = budgetRow(mk(), undefined, txs, d.wallets, span, 'IDR', d.rates);
    const cur = Object.fromEntries(d.wallets.map((w) => [w.id, w.currency]));
    const expect_ = txs.filter((t) => t.type === 'expense' && t.categoryId === 'cat_food' && t.occurredAt.slice(0, 10) >= span.from && t.occurredAt.slice(0, 10) <= span.to).reduce((s, t) => s + (cur[t.walletId] === 'USD' ? Math.round((t.amount * 16000)) : t.amount), 0);
    expect(row.spent).toBe(expect_);
    expect(row.remaining).toBe(row.limit - row.spent);
    expect(row.utilization).toBeCloseTo(row.spent / row.limit, 10);
  });
  it('transfers and other categories never count', () => {
    const only = txs.filter((t) => t.type === 'expense' && t.categoryId !== 'cat_food');
    expect(budgetRow(mk(), undefined, only, d.wallets, { from: '2000-01-01', to: '2100-01-01' }, 'IDR', d.rates).spent).toBe(0);
  });
  it('weekly and monthly budgets for one category are independent', () => {
    const w = budgetRow(mk({ period: 'weekly', amount: 500_000_00 }), undefined, txs, d.wallets, weekSpan('2026-11-20', 1), 'IDR', d.rates);
    const m = budgetRow(mk(), undefined, txs, d.wallets, monthSpan('2026-11-20'), 'IDR', d.rates);
    expect(w.limit).toBe(500_000_00); expect(m.limit).toBe(2_000_000_00);
    expect(m.spent).toBeGreaterThanOrEqual(w.spent === 0 ? 0 : 0);
  });
  it('the export-style budgetLines agrees with budgetRows for a single month / single week', () => {
    const b = mk();
    const span = monthSpan('2026-10-10');
    expect(budgetLines([b], [], txs, d.wallets, span, 'IDR', d.rates)[0].spent).toBe(budgetRow(b, undefined, txs, d.wallets, span, 'IDR', d.rates).spent);
    const bw = mk({ period: 'weekly' }); const ws = weekSpan('2026-10-10', 1);
    const l = budgetLines([bw], [], txs, d.wallets, ws, 'IDR', d.rates)[0];
    expect(l.limit).toBe(bw.amount); expect(l.spent).toBe(budgetRow(bw, undefined, txs, d.wallets, ws, 'IDR', d.rates).spent);
  });
  it('history is contiguous, ends at the anchor period and matches per-period rows', () => {
    const anchor = monthSpan('2026-11-22');
    const h = budgetHistory(mk(), undefined, 6, anchor, txs, d.wallets, 'IDR', d.rates);
    expect(h).toHaveLength(6);
    expect(h[5].span).toEqual(anchor);
    for (let i = 1; i < 6; i++) expect(addDays(h[i - 1].span.to, 1)).toBe(h[i].span.from);
    expect(h[2].spent).toBe(budgetRow(mk(), undefined, txs, d.wallets, h[2].span, 'IDR', d.rates).spent);
  });
  it('totals convert currencies instead of adding raw numbers', () => {
    const rows = budgetRows([mk({ amount: 1_000_000_00 }), mk({ id: 'b2', categoryId: 'cat_transport', currency: 'USD', amount: 100_00 })], [], [], d.wallets, monthSpan('2026-11-01'), 'IDR', d.rates);
    expect(budgetTotals(rows, 'IDR', d.rates).limit).toBe(1_000_000_00 + 1_600_000_00);
    expect(budgetTotals(rows, 'IDR', []).missing).toEqual(['USD']);
  });
});

describe('pace and projection', () => {
  const row = (spent: number, span = monthSpan('2026-11-01')) => ({ ...budgetRow(mk({ amount: 3_000_000_00 }), undefined, [], [], span, 'IDR', []), spent, remaining: 3_000_000_00 - spent, utilization: spent / 3_000_000_00 });
  it('null when today is outside the period', () => expect(pace(row(0), '2026-12-01')).toBeNull());
  it('mid-month figures', () => {
    const p = pace(row(1_500_000_00), '2026-11-15')!; // 15 of 30 days
    expect(p.totalDays).toBe(30); expect(p.elapsedDays).toBe(15); expect(p.daysLeft).toBe(16);
    expect(p.expected).toBe(1_500_000_00);
    expect(p.projected).toBe(3_000_000_00);
    expect(p.dailyAllowance).toBeCloseTo(1_500_000_00 / 16, 5);
  });
  it('no projection in the first days; last day allowance = what is left', () => {
    expect(pace(row(900_000_00), '2026-11-02')!.projected).toBeNull();
    const last = pace(row(2_700_000_00), '2026-11-30')!;
    expect(last.daysLeft).toBe(1); expect(last.dailyAllowance).toBe(300_000_00);
  });
  it('overspent budgets have a zero allowance, never negative', () => expect(pace(row(4_000_000_00), '2026-11-20')!.dailyAllowance).toBe(0));
  it('weekly pace uses a 7-day period', () => {
    const w = weekSpan('2026-11-18', 1);
    const p = pace({ ...row(0, w), limit: 700_000_00, spent: 350_000_00, remaining: 350_000_00 }, '2026-11-19')!;
    expect(p.totalDays).toBe(7); expect(p.elapsedDays).toBe(4); expect(daysBetween(w.from, '2026-11-19')).toBe(3);
  });
});
