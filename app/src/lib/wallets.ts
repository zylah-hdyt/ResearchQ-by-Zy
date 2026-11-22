import type { CurrencyCode, ExchangeRate, Transaction, Wallet, WalletType } from '../data/types';
import { effectOn, walletBalance } from './finance';
import { convert } from './money';
import { addDays, type Bucket } from './periods';

export const WALLET_TYPE_ORDER: WalletType[] = ['bank', 'cash', 'ewallet', 'savings', 'investment', 'credit', 'other'];

export interface WalletRow { wallet: Wallet; /** Balance in the wallet's own currency. */ balance: number; /** Same balance in the preferred currency; null when no rate exists. */ converted: number | null }
export interface WalletGroup { type: WalletType; rows: WalletRow[]; /** Σ converted balances of the rows that could be converted. */ subtotal: number }
export interface WalletOverview { groups: WalletGroup[]; assets: number; liabilities: number; netWorth: number; missing: CurrencyCode[] }

/**
 * Active wallets grouped by type. Assets = Σ positive balances, liabilities = Σ negative balances (shown as a negative
 * number), net worth = assets + liabilities. Everything is converted into `base`; wallets without a rate are reported.
 */
export function walletOverview(wallets: Wallet[], txs: Transaction[], base: CurrencyCode, rates: ExchangeRate[]): WalletOverview {
  const missing = new Set<CurrencyCode>();
  let assets = 0, liabilities = 0;
  const byType = new Map<WalletType, WalletRow[]>();
  for (const w of wallets.filter((x) => !x.archived)) {
    const balance = walletBalance(w, txs);
    const converted = convert(balance, w.currency, base, base, rates);
    if (converted == null) missing.add(w.currency);
    else if (converted >= 0) assets += converted; else liabilities += converted;
    byType.set(w.type, [...(byType.get(w.type) ?? []), { wallet: w, balance, converted }]);
  }
  const groups = WALLET_TYPE_ORDER.filter((t) => byType.has(t)).map((type) => {
    const rows = byType.get(type)!.sort((a, b) => (b.converted ?? 0) - (a.converted ?? 0));
    return { type, rows, subtotal: rows.reduce((s, r) => s + (r.converted ?? 0), 0) };
  });
  return { groups, assets, liabilities, netWorth: assets + liabilities, missing: [...missing] };
}

/** Transactions touching a wallet, in the order the app lists them (newest first). */
export const walletTransactions = (w: Wallet, txs: Transaction[]) =>
  txs.filter((t) => t.walletId === w.id || t.toWalletId === w.id).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id));

/** Balance of the wallet right after each of its transactions (id → balance), oldest to newest by (time, id). */
export function runningBalances(w: Wallet, txs: Transaction[]): Map<string, number> {
  const out = new Map<string, number>();
  let bal = w.initialBalance;
  const own = txs.filter((t) => effectOn(w.id, t) !== 0 || t.walletId === w.id || t.toWalletId === w.id).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id));
  for (const t of own) { bal += effectOn(w.id, t); out.set(t.id, bal); }
  return out;
}

export interface ValuePoint extends Bucket { value: number }

/** Balance of one wallet at the end of each bucket (own currency). */
export function balanceSeries(w: Wallet, txs: Transaction[], buckets: Bucket[]): ValuePoint[] {
  return buckets.map((b) => ({ ...b, value: walletBalance(w, txs, addDays(b.to, 1)) }));
}

/** Net worth (Σ converted balances of active wallets) at the end of each bucket. Wallets without a rate are left out and reported. */
export function netWorthSeries(wallets: Wallet[], txs: Transaction[], buckets: Bucket[], base: CurrencyCode, rates: ExchangeRate[]) {
  const active = wallets.filter((w) => !w.archived);
  const missing = new Set<CurrencyCode>();
  const points: ValuePoint[] = buckets.map((b) => {
    const before = addDays(b.to, 1);
    let total = 0;
    for (const w of active) {
      const v = convert(walletBalance(w, txs, before), w.currency, base, base, rates);
      if (v == null) missing.add(w.currency); else total += v;
    }
    return { ...b, value: total };
  });
  return { points, missing: [...missing] };
}
