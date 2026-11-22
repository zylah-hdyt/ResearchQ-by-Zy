import type { Budget, Category, CurrencyCode, ExchangeRate, Transaction, Wallet } from '../data/types';
import { addTo, convert, type CurrencyTotals } from './money';
import { monthKey, parseLocal, toLocalDate } from './format';

export interface DateRange {
  /** Inclusive, YYYY-MM-DD */
  from: string;
  /** Inclusive, YYYY-MM-DD */
  to: string;
}

export const txDate = (t: Transaction) => t.occurredAt.slice(0, 10);
export const inRange = (t: Transaction, r: DateRange) => txDate(t) >= r.from && txDate(t) <= r.to;

/** Remove duplicate records (same id) while keeping the first occurrence. */
export function dedupe(txs: Transaction[]): Transaction[] {
  const seen = new Set<string>();
  return txs.filter((t) => (seen.has(t.id) ? false : (seen.add(t.id), true)));
}

/** Signed effect of a transaction on a given wallet (minor units, wallet currency). */
export function effectOn(walletId: string, t: Transaction): number {
  if (t.type === 'income') return t.walletId === walletId ? t.amount : 0;
  if (t.type === 'expense') return t.walletId === walletId ? -t.amount : 0;
  let v = 0;
  if (t.walletId === walletId) v -= t.amount;
  if (t.toWalletId === walletId) v += t.toAmount ?? t.amount;
  return v;
}

/**
 * Balance of a wallet. With `beforeDate`, only transactions strictly before
 * that date count (= opening balance for a period starting on that date).
 */
export function walletBalance(w: Wallet, txs: Transaction[], beforeDate?: string): number {
  let bal = w.initialBalance;
  for (const t of txs) {
    if (beforeDate && txDate(t) >= beforeDate) continue;
    bal += effectOn(w.id, t);
  }
  return bal;
}

export interface WalletPeriod {
  wallet: Wallet;
  opening: number;
  inflow: number;
  outflow: number;
  closing: number;
}

/** Opening/closing per wallet; closing = opening + inflow − outflow (transfers included per wallet). */
export function walletPeriods(wallets: Wallet[], txs: Transaction[], r: DateRange): WalletPeriod[] {
  return wallets.map((w) => {
    const opening = walletBalance(w, txs, r.from);
    let inflow = 0;
    let outflow = 0;
    for (const t of txs) {
      if (!inRange(t, r)) continue;
      const e = effectOn(w.id, t);
      if (e > 0) inflow += e;
      else outflow -= e;
    }
    return { wallet: w, opening, inflow, outflow, closing: opening + inflow - outflow };
  });
}

export interface PeriodSummary {
  income: CurrencyTotals;
  expense: CurrencyTotals;
  net: CurrencyTotals;
}

/** Income/expense totals per currency. Transfers are excluded by definition. */
export function summarize(txs: Transaction[], wallets: Wallet[], r?: DateRange): PeriodSummary {
  const cur = new Map(wallets.map((w) => [w.id, w.currency]));
  const s: PeriodSummary = { income: {}, expense: {}, net: {} };
  for (const t of txs) {
    if (t.type === 'transfer') continue;
    if (r && !inRange(t, r)) continue;
    const c = cur.get(t.walletId);
    if (!c) continue;
    if (t.type === 'income') {
      addTo(s.income, c, t.amount);
      addTo(s.net, c, t.amount);
    } else {
      addTo(s.expense, c, t.amount);
      addTo(s.net, c, -t.amount);
    }
  }
  return s;
}

/** Convert per-currency totals into one currency; unconvertible currencies are reported, never mixed. */
export function collapse(
  totals: CurrencyTotals,
  target: CurrencyCode,
  base: CurrencyCode,
  rates: ExchangeRate[],
): { value: number; missing: CurrencyCode[] } {
  let value = 0;
  const missing: CurrencyCode[] = [];
  for (const [c, v] of Object.entries(totals) as [CurrencyCode, number][]) {
    const x = convert(v, c, target, base, rates);
    if (x == null) missing.push(c);
    else value += x;
  }
  return { value, missing };
}

export interface CategoryTotal {
  categoryId: string;
  type: 'income' | 'expense';
  currency: CurrencyCode;
  amount: number;
  count: number;
}

export function categoryTotals(txs: Transaction[], wallets: Wallet[], r?: DateRange): CategoryTotal[] {
  const cur = new Map(wallets.map((w) => [w.id, w.currency]));
  const map = new Map<string, CategoryTotal>();
  for (const t of txs) {
    if (t.type === 'transfer' || !t.categoryId) continue;
    if (r && !inRange(t, r)) continue;
    const c = cur.get(t.walletId);
    if (!c) continue;
    const key = `${t.categoryId}|${c}`;
    const e = map.get(key) ?? { categoryId: t.categoryId, type: t.type, currency: c, amount: 0, count: 0 };
    e.amount += t.amount;
    e.count += 1;
    map.set(key, e);
  }
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

export function monthRange(d: Date = new Date()): DateRange {
  const from = new Date(d.getFullYear(), d.getMonth(), 1);
  const to = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from: toLocalDate(from), to: toLocalDate(to) };
}

/** Calendar months touched by a range, e.g. ["2026-10", "2026-11"]. */
export function monthsIn(r: DateRange): string[] {
  const out: string[] = [];
  const d = parseLocal(r.from);
  const end = monthKey(r.to);
  let cur = new Date(d.getFullYear(), d.getMonth(), 1);
  while (monthKey(toLocalDate(cur)) <= end) {
    out.push(monthKey(toLocalDate(cur)));
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    if (out.length > 600) break;
  }
  return out;
}

export type BudgetStatus = 'onTrack' | 'warning' | 'exceeded';

export interface BudgetLine {
  budget: Budget;
  category?: Category;
  /** Budget limit for the range (monthly amount × months covered). */
  limit: number;
  spent: number;
  remaining: number;
  utilization: number;
  status: BudgetStatus;
  /** Wallet currencies whose spending could not be converted to the budget currency. */
  missing: CurrencyCode[];
}

export function budgetStatus(u: number): BudgetStatus {
  if (u > 1) return 'exceeded';
  if (u >= 0.8) return 'warning';
  return 'onTrack';
}

/** Spending on one budget's category inside `span`, converted into the budget's currency. Transfers never count. */
export function spentIn(b: Budget, txs: Transaction[], wallets: Wallet[], span: DateRange, base: CurrencyCode, rates: ExchangeRate[]): { spent: number; missing: CurrencyCode[] } {
  const cur = new Map(wallets.map((w) => [w.id, w.currency]));
  let spent = 0;
  const missing = new Set<CurrencyCode>();
  for (const t of txs) {
    if (t.type !== 'expense' || t.categoryId !== b.categoryId || !inRange(t, span)) continue;
    const c = cur.get(t.walletId);
    if (!c) continue;
    const v = convert(t.amount, c, b.currency, base, rates);
    if (v == null) missing.add(c); else spent += v;
  }
  return { spent, missing: [...missing] };
}

/**
 * Budget lines over an arbitrary range (used by exports and alerts). The limit is the per-period amount times the
 * number of periods the range covers: calendar months touched (monthly) or 7-day blocks, rounded up (weekly).
 */
export function budgetLines(
  budgets: Budget[],
  categories: Category[],
  txs: Transaction[],
  wallets: Wallet[],
  r: DateRange,
  base: CurrencyCode,
  rates: ExchangeRate[],
): BudgetLine[] {
  const months = monthsIn(r).length;
  const weeks = Math.max(1, Math.ceil((Math.round((parseLocal(r.to).getTime() - parseLocal(r.from).getTime()) / 86_400_000) + 1) / 7));
  return budgets.map((b) => {
    const { spent, missing } = spentIn(b, txs, wallets, r, base, rates);
    const limit = b.amount * (b.period === 'weekly' ? weeks : months);
    const utilization = limit > 0 ? spent / limit : 0;
    return { budget: b, category: categories.find((c) => c.id === b.categoryId), limit, spent, remaining: limit - spent, utilization, status: budgetStatus(utilization), missing };
  });
}
