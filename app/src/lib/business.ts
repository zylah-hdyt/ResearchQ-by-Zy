import type { Category, CurrencyCode, ExchangeRate, Transaction, Wallet } from '../data/types';
import { convert } from './money';
import { txDate, type DateRange } from './finance';

/** Built-in categories that carry business and debt meaning (see data/seed.ts). */
const KEYS = { sales: 'sales', stock: 'stock', opex: 'opex', loanIn: 'loanIn', debtPaid: 'debtPaid', loanOut: 'loanOut', debtCollected: 'debtCollected' } as const;

export interface BusinessSummary {
  /** Any business or debt transaction exists at all (the card stays hidden otherwise). */
  active: boolean;
  /** This period. */
  sales: number;
  cost: number;
  profit: number;
  /** All time: still to be paid by me / still to be paid to me (never below zero). */
  owe: number;
  owed: number;
  missing: CurrencyCode[];
}

/** Totals in `base`. Sales/costs cover `span`; debts are running balances over all time. */
export function businessSummary(txs: Transaction[], wallets: Wallet[], categories: Category[], span: DateRange, base: CurrencyCode, rates: ExchangeRate[]): BusinessSummary {
  const keyOf = new Map(categories.map((c) => [c.id, c.key]));
  const cur = new Map(wallets.map((w) => [w.id, w.currency]));
  const missing = new Set<CurrencyCode>();
  const acc = { sales: 0, cost: 0, loanIn: 0, debtPaid: 0, loanOut: 0, debtCollected: 0 };
  let active = false;
  for (const t of txs) {
    if (t.type === 'transfer' || !t.categoryId) continue;
    const k = keyOf.get(t.categoryId);
    if (!k || !(k in KEYS)) continue;
    active = true;
    const from = cur.get(t.walletId);
    if (!from) continue;
    const v = convert(t.amount, from, base, base, rates);
    if (v == null) { missing.add(from); continue; }
    const d = txDate(t);
    const inSpan = d >= span.from && d <= span.to;
    if (k === KEYS.sales && inSpan) acc.sales += v;
    else if ((k === KEYS.stock || k === KEYS.opex) && inSpan) acc.cost += v;
    else if (k === KEYS.loanIn) acc.loanIn += v;
    else if (k === KEYS.debtPaid) acc.debtPaid += v;
    else if (k === KEYS.loanOut) acc.loanOut += v;
    else if (k === KEYS.debtCollected) acc.debtCollected += v;
  }
  return {
    active, sales: acc.sales, cost: acc.cost, profit: acc.sales - acc.cost,
    owe: Math.max(0, acc.loanIn - acc.debtPaid), owed: Math.max(0, acc.loanOut - acc.debtCollected), missing: [...missing],
  };
}
