import type { CurrencyCode, ExchangeRate, Transaction, Wallet } from '../data/types';
import { convert } from './money';
import { inRange } from './finance';
import { firstOfMonth, lastOfMonth, periodTotals, previousSpan, type DateSpan, type PeriodTotals } from './periods';
import { monthsIn } from './finance';
import { parseLocal, toLocalDate } from './format';
import { pctChange } from './chart';

export interface CategorySlice { categoryId: string; value: number; share: number }

/** Spending (or income) per category inside `span`, converted into `base`. Transfers never count; unconvertible wallets are reported. */
export function categoryBreakdown(txs: Transaction[], wallets: Wallet[], span: DateSpan, type: 'income' | 'expense', base: CurrencyCode, rates: ExchangeRate[]) {
  const cur = new Map(wallets.map((w) => [w.id, w.currency]));
  const sums = new Map<string, number>();
  const missing = new Set<CurrencyCode>();
  for (const t of txs) {
    if (t.type !== type || !t.categoryId || !inRange(t, span)) continue;
    const c = cur.get(t.walletId);
    if (!c) continue;
    const v = convert(t.amount, c, base, base, rates);
    if (v == null) { missing.add(c); continue; }
    sums.set(t.categoryId, (sums.get(t.categoryId) ?? 0) + v);
  }
  const total = [...sums.values()].reduce((a, b) => a + b, 0);
  const slices: CategorySlice[] = [...sums.entries()].map(([categoryId, value]) => ({ categoryId, value, share: total ? value / total : 0 })).sort((a, b) => b.value - a.value);
  return { slices, total, missing: [...missing] };
}

export interface CategoryChange { categoryId: string; current: number; previous: number; change: number | null }

/** Category totals now versus the previous window (union of categories, largest current first). */
export function compareCategories(current: CategorySlice[], previous: CategorySlice[]): CategoryChange[] {
  const prev = new Map(previous.map((s) => [s.categoryId, s.value]));
  const ids = new Set([...current.map((s) => s.categoryId), ...previous.map((s) => s.categoryId)]);
  const cur = new Map(current.map((s) => [s.categoryId, s.value]));
  return [...ids].map((categoryId) => {
    const c = cur.get(categoryId) ?? 0, p = prev.get(categoryId) ?? 0;
    return { categoryId, current: c, previous: p, change: pctChange(c, p) };
  }).sort((a, b) => b.current - a.current || b.previous - a.previous);
}

export interface MonthRow extends PeriodTotals { key: string; span: DateSpan; /** Change of expense versus the month before (null when that month had none). */ expenseChange: number | null }

/** The last `months` calendar months ending with the month that contains `end`, oldest first, each with totals and month-over-month expense change. */
export function monthlyComparison(txs: Transaction[], wallets: Wallet[], end: string, months: number, base: CurrencyCode, rates: ExchangeRate[]): MonthRow[] {
  const starts: string[] = [];
  for (let i = months; i >= 0; i--) starts.push(firstOfMonth(end, -i));
  const rows = starts.map((s) => {
    const span = { from: s, to: lastOfMonth(s) };
    return { key: s.slice(0, 7), span, ...periodTotals(txs, wallets, span, base, rates) };
  });
  return rows.slice(1).map((r, i) => ({ ...r, expenseChange: pctChange(r.expense, rows[i].expense) }));
}

/** Last day that is not in the future: used so an in-progress period is compared with an equally long previous one. */
export const clampToToday = (span: DateSpan, today: string): DateSpan => (span.to > today ? { from: span.from, to: today < span.from ? span.from : today } : span);

/**
 * The window to compare `range` with. A range made of whole calendar months is compared with the same number of months
 * before it, cut at the same day of the month when the current one is unfinished (Nov 1–22 vs Oct 1–22). Anything else
 * falls back to an equally long window right before it.
 */
export function comparisonSpan(range: DateSpan, today: string): { current: DateSpan; previous: DateSpan } {
  const current = clampToToday(range, today);
  const wholeMonths = range.from === firstOfMonth(range.from) && range.to === lastOfMonth(range.to);
  if (!wholeMonths) return { current, previous: previousSpan(current) };
  const n = monthsIn(range).length;
  const from = firstOfMonth(range.from, -n);
  const end = parseLocal(current.to);
  const shifted = new Date(end.getFullYear(), end.getMonth() - n + 1, 0); // last day of the target month
  const day = Math.min(end.getDate(), shifted.getDate());
  return { current, previous: { from, to: toLocalDate(new Date(shifted.getFullYear(), shifted.getMonth(), day)) } };
}
