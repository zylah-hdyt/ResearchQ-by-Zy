import type { Budget, BudgetPeriod, Category, CurrencyCode, ExchangeRate, Transaction, Wallet } from '../data/types';
import { budgetStatus, spentIn, type BudgetStatus } from './finance';
import { parseLocal } from './format';
import { convert } from './money';
import { addDays, daysBetween, firstOfMonth, lastOfMonth, type DateSpan } from './periods';

export const monthSpan = (anchor: string): DateSpan => ({ from: firstOfMonth(anchor), to: lastOfMonth(anchor) });

/** The week containing `anchor`, starting on `weekStartsOn` (0 = Sunday, 1 = Monday). */
export function weekSpan(anchor: string, weekStartsOn: 0 | 1): DateSpan {
  const back = (parseLocal(anchor).getDay() - weekStartsOn + 7) % 7;
  const from = addDays(anchor, -back);
  return { from, to: addDays(from, 6) };
}

export const spanFor = (period: BudgetPeriod, anchor: string, weekStartsOn: 0 | 1): DateSpan => (period === 'weekly' ? weekSpan(anchor, weekStartsOn) : monthSpan(anchor));

/** The period `n` steps away from `span` (negative = earlier). */
export function shiftSpan(period: BudgetPeriod, span: DateSpan, n: number): DateSpan {
  if (period === 'weekly') { const from = addDays(span.from, 7 * n); return { from, to: addDays(from, 6) }; }
  return monthSpan(firstOfMonth(span.from, n));
}

export interface BudgetRow {
  budget: Budget;
  category?: Category;
  span: DateSpan;
  limit: number;
  spent: number;
  remaining: number;
  utilization: number;
  status: BudgetStatus;
  missing: CurrencyCode[];
}

/** One budget in one period: limit = the budget's amount, spent = category expenses inside the period. */
export function budgetRow(b: Budget, category: Category | undefined, txs: Transaction[], wallets: Wallet[], span: DateSpan, base: CurrencyCode, rates: ExchangeRate[]): BudgetRow {
  const { spent, missing } = spentIn(b, txs, wallets, span, base, rates);
  const utilization = b.amount > 0 ? spent / b.amount : 0;
  return { budget: b, category, span, limit: b.amount, spent, remaining: b.amount - spent, utilization, status: budgetStatus(utilization), missing };
}

export function budgetRows(budgets: Budget[], categories: Category[], txs: Transaction[], wallets: Wallet[], span: DateSpan, base: CurrencyCode, rates: ExchangeRate[]): BudgetRow[] {
  return budgets.map((b) => budgetRow(b, categories.find((c) => c.id === b.categoryId), txs, wallets, span, base, rates)).sort((a, b) => b.utilization - a.utilization);
}

export interface Pace {
  totalDays: number;
  elapsedDays: number;
  /** Days left including today. */
  daysLeft: number;
  /** Spending you would be at if it were spread evenly so far (limit × elapsed share). */
  expected: number;
  /** Where the period ends at the current pace; null in the first days when it would be guesswork. */
  projected: number | null;
  /** What you can still spend per day, today included. */
  dailyAllowance: number;
}

/** Pace of a budget in the period containing `today`; null if `today` is outside the period. */
export function pace(row: BudgetRow, today: string): Pace | null {
  const { from, to } = row.span;
  if (today < from || today > to) return null;
  const totalDays = daysBetween(from, to) + 1;
  const elapsedDays = daysBetween(from, today) + 1;
  const daysLeft = totalDays - elapsedDays + 1;
  const share = elapsedDays / totalDays;
  const minDays = totalDays > 10 ? 3 : 2;
  return {
    totalDays, elapsedDays, daysLeft,
    expected: row.limit * share,
    projected: elapsedDays >= minDays ? Math.round(row.spent / share) : null,
    dailyAllowance: Math.max(0, row.remaining) / daysLeft,
  };
}

/** The last `count` periods (oldest first, ending with the period containing `anchor`) for one budget. */
export function budgetHistory(b: Budget, category: Category | undefined, count: number, anchorSpan: DateSpan, txs: Transaction[], wallets: Wallet[], base: CurrencyCode, rates: ExchangeRate[]): BudgetRow[] {
  const out: BudgetRow[] = [];
  for (let i = count - 1; i >= 0; i--) out.push(budgetRow(b, category, txs, wallets, shiftSpan(b.period, anchorSpan, -i), base, rates));
  return out;
}

export interface BudgetTotals { limit: number; spent: number; remaining: number; utilization: number; status: BudgetStatus; missing: CurrencyCode[] }

/** All rows converted into `base` and added up (budgets may be in different currencies). */
export function budgetTotals(rows: BudgetRow[], base: CurrencyCode, rates: ExchangeRate[]): BudgetTotals {
  let limit = 0, spent = 0;
  const missing = new Set<CurrencyCode>();
  for (const r of rows) {
    const l = convert(r.limit, r.budget.currency, base, base, rates), s = convert(r.spent, r.budget.currency, base, base, rates);
    if (l == null || s == null) { missing.add(r.budget.currency); continue; }
    limit += l; spent += s;
  }
  const utilization = limit > 0 ? spent / limit : 0;
  return { limit, spent, remaining: limit - spent, utilization, status: budgetStatus(utilization), missing: [...missing] };
}
