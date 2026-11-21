import type { Category, CurrencyCode, ExchangeRate, Profile, Transaction, TxType, UserData, Wallet } from '../data/types';
import {
  budgetLines, dedupe, inRange, walletPeriods,
  type BudgetLine, type DateRange, type WalletPeriod,
} from '../lib/finance';
import { convert, type CurrencyTotals } from '../lib/money';

export type ExportContext = 'transactions' | 'reports' | 'accounts' | 'budgets';

export interface ExportOptions {
  range: DateRange;
  type: 'all' | TxType;
  categoryId: 'all' | string;
  walletId: 'all' | string;
  /** 'original' keeps each amount in its wallet currency; a code converts everything to it. */
  currency: 'original' | CurrencyCode;
  format: 'xlsx' | 'csv';
}

export interface ExportRow {
  tx: Transaction;
  wallet?: Wallet;
  toWallet?: Wallet;
  category?: Category;
  /** Amount in output currency (minor units, always positive). */
  amount: number;
  currency: CurrencyCode;
  toAmount?: number;
  toCurrency?: CurrencyCode;
}

export interface CurrencyBlock {
  currency: CurrencyCode;
  income: number;
  expense: number;
  net: number;
  opening: number | null;
  closing: number | null;
}

export interface ExportDataset {
  options: ExportOptions;
  profile: Pick<Profile, 'fullName' | 'displayName' | 'email' | 'preferredCurrency' | 'language'>;
  rows: ExportRow[];
  income: ExportRow[];
  expenses: ExportRow[];
  transfers: ExportRow[];
  blocks: CurrencyBlock[];
  categories: { category?: Category; type: 'income' | 'expense'; currency: CurrencyCode; amount: number; count: number; share: number }[];
  walletPeriods: (WalletPeriod & { currency: CurrencyCode })[];
  budgets: (BudgetLine & { currency: CurrencyCode })[];
  balancesApplicable: boolean;
  /** Currencies that could not be converted because a rate is missing. */
  missingRates: CurrencyCode[];
}

/**
 * Builds the export dataset from the authenticated user's own data only.
 * Pure function — used by both the preview and the workbook writer.
 */
export function buildDataset(data: UserData, profile: Profile, o: ExportOptions): ExportDataset {
  const base = profile.preferredCurrency;
  const rates: ExchangeRate[] = data.rates;
  const own = <T extends { userId: string }>(xs: T[]) => xs.filter((x) => x.userId === profile.userId);
  const wallets = own(data.wallets);
  const categories = own(data.categories);
  const allTx = dedupe(own(data.transactions));
  const wById = new Map(wallets.map((w) => [w.id, w]));
  const cById = new Map(categories.map((c) => [c.id, c]));
  const missing = new Set<CurrencyCode>();

  const out = (minor: number, c: CurrencyCode): { amount: number; currency: CurrencyCode } => {
    if (o.currency === 'original' || o.currency === c) return { amount: minor, currency: c };
    const v = convert(minor, c, o.currency, base, rates);
    if (v == null) {
      missing.add(c);
      return { amount: minor, currency: c };
    }
    return { amount: v, currency: o.currency };
  };

  const filtered = allTx
    .filter((t) => inRange(t, o.range))
    .filter((t) => o.type === 'all' || t.type === o.type)
    .filter((t) => o.categoryId === 'all' || (t.type !== 'transfer' && t.categoryId === o.categoryId))
    .filter((t) => o.walletId === 'all' || t.walletId === o.walletId || t.toWalletId === o.walletId)
    .filter((t) => wById.has(t.walletId))
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id));

  const rows: ExportRow[] = filtered.map((tx) => {
    const wallet = wById.get(tx.walletId)!;
    const toWallet = tx.toWalletId ? wById.get(tx.toWalletId) : undefined;
    const main = out(tx.amount, wallet.currency);
    const row: ExportRow = { tx, wallet, toWallet, category: tx.categoryId ? cById.get(tx.categoryId) : undefined, ...main };
    if (tx.type === 'transfer' && toWallet) {
      const recv = out(tx.toAmount ?? tx.amount, toWallet.currency);
      row.toAmount = recv.amount;
      row.toCurrency = recv.currency;
    }
    return row;
  });

  // Income / expense per output currency. Transfers never count.
  const inc: CurrencyTotals = {};
  const exp: CurrencyTotals = {};
  for (const r of rows) {
    if (r.tx.type === 'income') inc[r.currency] = (inc[r.currency] ?? 0) + r.amount;
    if (r.tx.type === 'expense') exp[r.currency] = (exp[r.currency] ?? 0) + r.amount;
  }

  // Opening/closing balances only make sense for an unfiltered (by type/category) view.
  const balancesApplicable = o.type === 'all' && o.categoryId === 'all';
  const scopeWallets = wallets.filter((w) => o.walletId === 'all' || w.id === o.walletId);
  const periods = walletPeriods(scopeWallets, allTx, o.range).map((p) => {
    const c = p.wallet.currency;
    const conv = (v: number) => out(v, c);
    const opening = conv(p.opening);
    return {
      ...p,
      opening: opening.amount,
      inflow: conv(p.inflow).amount,
      outflow: conv(p.outflow).amount,
      closing: conv(p.closing).amount,
      currency: opening.currency,
    };
  });
  const open: CurrencyTotals = {};
  const close: CurrencyTotals = {};
  for (const p of periods) {
    open[p.currency] = (open[p.currency] ?? 0) + p.opening;
    close[p.currency] = (close[p.currency] ?? 0) + p.closing;
  }

  const codes = new Set<CurrencyCode>([
    ...(Object.keys(inc) as CurrencyCode[]),
    ...(Object.keys(exp) as CurrencyCode[]),
    ...(balancesApplicable ? (Object.keys(open) as CurrencyCode[]) : []),
  ]);
  if (codes.size === 0) codes.add(o.currency === 'original' ? base : o.currency);
  const blocks: CurrencyBlock[] = [...codes].sort().map((c) => ({
    currency: c,
    income: inc[c] ?? 0,
    expense: exp[c] ?? 0,
    net: (inc[c] ?? 0) - (exp[c] ?? 0),
    opening: balancesApplicable ? open[c] ?? 0 : null,
    closing: balancesApplicable ? close[c] ?? 0 : null,
  }));

  // Category summary, from the filtered rows (output currency).
  const catMap = new Map<string, { category?: Category; type: 'income' | 'expense'; currency: CurrencyCode; amount: number; count: number }>();
  for (const r of rows) {
    if (r.tx.type === 'transfer') continue;
    const key = `${r.tx.categoryId}|${r.currency}`;
    const e = catMap.get(key) ?? { category: r.category, type: r.tx.type, currency: r.currency, amount: 0, count: 0 };
    e.amount += r.amount;
    e.count += 1;
    catMap.set(key, e);
  }
  const cats = [...catMap.values()]
    .map((e) => {
      const total = (e.type === 'income' ? inc : exp)[e.currency] ?? 0;
      return { ...e, share: total ? e.amount / total : 0 };
    })
    .sort((a, b) => (a.type === b.type ? b.amount - a.amount : a.type === 'income' ? -1 : 1));

  // Budgets: spending across all wallets for the category (budgets are not per wallet).
  const lines = budgetLines(own(data.budgets), categories, allTx, wallets, o.range, base, rates)
    .filter((l) => o.categoryId === 'all' || l.budget.categoryId === o.categoryId)
    .map((l) => {
      if (o.currency === 'original' || o.currency === l.budget.currency) return { ...l, currency: l.budget.currency };
      const lim = convert(l.limit, l.budget.currency, o.currency, base, rates);
      const sp = convert(l.spent, l.budget.currency, o.currency, base, rates);
      if (lim == null || sp == null) {
        missing.add(l.budget.currency);
        return { ...l, currency: l.budget.currency };
      }
      return { ...l, limit: lim, spent: sp, remaining: lim - sp, currency: o.currency };
    });
  for (const l of lines) l.missing.forEach((c) => missing.add(c));

  return {
    options: o,
    profile: { fullName: profile.fullName, displayName: profile.displayName, email: profile.email, preferredCurrency: base, language: profile.language },
    rows,
    income: rows.filter((r) => r.tx.type === 'income'),
    expenses: rows.filter((r) => r.tx.type === 'expense'),
    transfers: rows.filter((r) => r.tx.type === 'transfer'),
    blocks,
    categories: cats,
    walletPeriods: periods,
    budgets: lines,
    balancesApplicable,
    missingRates: [...missing],
  };
}

export function exportFileName(d: ExportDataset, ext: 'xlsx' | 'csv') {
  const prefix = d.profile.language === 'id' ? 'Laporan-Keuangan' : 'Financial-Report';
  return `${prefix}_${d.options.range.from}_${d.options.range.to}.${ext}`;
}
