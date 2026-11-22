import type { CurrencyCode, ExchangeRate, Transaction, TxType, Wallet } from '../data/types';
import { inRange, summarize, collapse, txDate, type DateRange } from './finance';
import { convert } from './money';
import type { RangePreset } from './ranges';

export interface TxFilters {
  q: string;
  preset: RangePreset;
  range: DateRange;
  type: 'all' | TxType;
  walletIds: string[];
  categoryIds: string[];
  /** Amount bounds in minor units of the preferred currency; null = no bound. */
  min: number | null;
  max: number | null;
}

export interface FilterCtx {
  wallets: Wallet[];
  base: CurrencyCode;
  rates: ExchangeRate[];
  categoryLabel: (id?: string) => string;
}

export const defaultFilters = (range: DateRange, preset: RangePreset = 'thisMonth'): TxFilters => ({ q: '', preset, range, type: 'all', walletIds: [], categoryIds: [], min: null, max: null });

/** Number of filters beyond the search box and the default period (shown as a badge on the Filter button). */
export function activeCount(f: TxFilters, defaultPreset: RangePreset = 'thisMonth'): number {
  return (f.preset !== defaultPreset ? 1 : 0) + (f.type !== 'all' ? 1 : 0) + (f.walletIds.length ? 1 : 0) + (f.categoryIds.length ? 1 : 0) + (f.min != null || f.max != null ? 1 : 0);
}

/** Every word of the query must appear in the description, notes, category or wallet names; digit-only words also match the amount. */
export function matchesQuery(tx: Transaction, q: string, ctx: FilterCtx): boolean {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const w = ctx.wallets.find((x) => x.id === tx.walletId);
  const to = ctx.wallets.find((x) => x.id === tx.toWalletId);
  const hay = [tx.description, tx.notes, ctx.categoryLabel(tx.categoryId), w?.name, to?.name].filter(Boolean).join(' ').toLowerCase();
  const amount = String(Math.round(tx.amount / 100));
  return words.every((word) => {
    if (hay.includes(word)) return true;
    const digits = word.replace(/[.,]/g, '');
    return /^\d{2,}$/.test(digits) && amount.includes(digits);
  });
}

/** Amount of a transaction in the preferred currency (falls back to its own amount when no rate exists). */
export function baseAmount(tx: Transaction, ctx: FilterCtx): number {
  const cur = ctx.wallets.find((x) => x.id === tx.walletId)?.currency;
  if (!cur) return tx.amount;
  return convert(tx.amount, cur, ctx.base, ctx.base, ctx.rates) ?? tx.amount;
}

export function applyFilters(txs: Transaction[], f: TxFilters, ctx: FilterCtx): Transaction[] {
  const wallets = new Set(f.walletIds), cats = new Set(f.categoryIds);
  return txs.filter((t) => {
    if (!inRange(t, f.range)) return false;
    if (f.type !== 'all' && t.type !== f.type) return false;
    if (wallets.size && !wallets.has(t.walletId) && !(t.toWalletId && wallets.has(t.toWalletId))) return false;
    if (cats.size && !(t.categoryId && cats.has(t.categoryId))) return false;
    if (f.min != null || f.max != null) {
      const a = baseAmount(t, ctx);
      if (f.min != null && a < f.min) return false;
      if (f.max != null && a > f.max) return false;
    }
    return matchesQuery(t, f.q, ctx);
  });
}

export interface ListTotals { income: number; expense: number; net: number; count: number; missing: CurrencyCode[] }

/** Income / expense / net of a list in the preferred currency. Transfers count toward `count` only. */
export function summarizeList(txs: Transaction[], ctx: FilterCtx): ListTotals {
  const s = summarize(txs, ctx.wallets);
  const inc = collapse(s.income, ctx.base, ctx.base, ctx.rates);
  const exp = collapse(s.expense, ctx.base, ctx.base, ctx.rates);
  return { income: inc.value, expense: exp.value, net: inc.value - exp.value, count: txs.length, missing: [...new Set([...inc.missing, ...exp.missing])] };
}

export interface DayGroup { day: string; items: Transaction[]; net: number }

/** Newest day first; `net` = income − expense of that day in the preferred currency (transfers excluded). */
export function groupByDay(txs: Transaction[], ctx: FilterCtx): DayGroup[] {
  const map = new Map<string, Transaction[]>();
  for (const t of txs) {
    const d = txDate(t);
    const list = map.get(d);
    if (list) list.push(t); else map.set(d, [t]);
  }
  return [...map.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, items]) => ({ day, items, net: summarizeList(items, ctx).net }));
}
