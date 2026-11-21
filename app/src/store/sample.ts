import type { Budget, CurrencyCode, Transaction, UserData, Wallet } from '../data/types';
import { uid } from '../lib/id';
import { toLocalDateTime } from '../lib/format';

/** Approximate value of 1 USD in each currency, only for scaling sample amounts. */
const USD_IN: Record<CurrencyCode, number> = { IDR: 16000, USD: 1, EUR: 0.92, SGD: 1.34, MYR: 4.6, JPY: 150, GBP: 0.79, AUD: 1.52 };

/** Deterministic pseudo random so sample data is stable. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function buildSampleData(userId: string, base: CurrencyCode, d: UserData): UserData {
  const r = rng(42);
  const s = (usd: number, c: CurrencyCode = base) => {
    const v = usd * USD_IN[c];
    const unit = c === 'IDR' ? 1000 : c === 'JPY' ? 10 : 1;
    return Math.round(v / unit) * unit * 100;
  };
  const created = new Date().toISOString();
  const foreign: CurrencyCode = base === 'USD' ? 'EUR' : 'USD';
  const mk = (name: string, type: Wallet['type'], currency: CurrencyCode, initialUsd: number, color: string): Wallet => ({
    id: uid('w_'), userId, name, type, currency, initialBalance: s(initialUsd, currency), color, archived: false, createdAt: created,
  });
  const bank = mk(base === 'IDR' ? 'BCA' : 'Main bank', 'bank', base, 1500, '#1d4ed8');
  const cash = mk(base === 'IDR' ? 'Tunai' : 'Cash', 'cash', base, 60, '#15803d');
  const ew = mk(base === 'IDR' ? 'GoPay' : 'E-wallet', 'ewallet', base, 40, '#0891b2');
  const sav = mk(`Savings ${foreign}`, 'savings', foreign, 800, '#7c3aed');
  const wallets = [bank, cash, ew, sav];

  const txs: Transaction[] = [];
  const now = new Date();
  const add = (date: Date, t: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'occurredAt' | 'notes'> & { notes?: string }) => {
    if (date > now) return;
    txs.push({ notes: '', ...t, id: uid('tx_'), userId, createdAt: created, occurredAt: toLocalDateTime(date) });
  };
  const expenses: [string, string, number, number][] = [
    ['cat_food', 'Lunch', 6, 14],
    ['cat_groceries', 'Groceries', 4, 6],
    ['cat_transport', 'Ride', 8, 4],
    ['cat_shopping', 'Online shopping', 2, 30],
    ['cat_entertainment', 'Movie night', 1, 12],
    ['cat_health', 'Pharmacy', 1, 10],
  ];
  for (let m = 5; m >= 0; m--) {
    const y = now.getFullYear();
    const mo = now.getMonth() - m;
    add(new Date(y, mo, 1, 9, 0), { type: 'income', walletId: bank.id, categoryId: 'cat_salary', amount: s(1200), description: 'Monthly salary' });
    if (m % 2 === 0) add(new Date(y, mo, 12, 14, 30), { type: 'income', walletId: bank.id, categoryId: 'cat_business', amount: s(180 + r() * 120), description: 'Freelance project' });
    add(new Date(y, mo, 2, 10, 0), { type: 'expense', walletId: bank.id, categoryId: 'cat_housing', amount: s(350), description: 'Rent' });
    add(new Date(y, mo, 5, 8, 15), { type: 'expense', walletId: bank.id, categoryId: 'cat_utilities', amount: s(45 + r() * 15), description: 'Electricity & internet' });
    add(new Date(y, mo, 6, 8, 20), { type: 'expense', walletId: bank.id, categoryId: 'cat_bills', amount: s(12), description: 'Streaming subscription' });
    add(new Date(y, mo, 3, 18, 0), { type: 'transfer', walletId: bank.id, toWalletId: ew.id, amount: s(160), toAmount: s(160), description: 'Top up e-wallet' });
    add(new Date(y, mo, 4, 12, 0), { type: 'transfer', walletId: bank.id, toWalletId: cash.id, amount: s(120), toAmount: s(120), description: 'ATM withdrawal' });
    const usdAmt = s(100, foreign);
    add(new Date(y, mo, 25, 20, 0), { type: 'transfer', walletId: bank.id, toWalletId: sav.id, amount: Math.round((usdAmt / 100) * (USD_IN[base] / USD_IN[foreign])) * 100, toAmount: usdAmt, description: 'Monthly saving', notes: 'Cross-currency transfer' });
    for (const [cat, desc, times, usd] of expenses) {
      for (let i = 0; i < times; i++) {
        const day = 1 + Math.floor(r() * 27);
        const wallet = cat === 'cat_transport' || cat === 'cat_food' ? (r() > 0.5 ? ew : cash) : bank;
        add(new Date(y, mo, day, 8 + Math.floor(r() * 12), Math.floor(r() * 60)), {
          type: 'expense', walletId: wallet.id, categoryId: cat, amount: s(usd * (0.6 + r() * 0.8)), description: desc,
        });
      }
    }
  }
  txs.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const budgets: Budget[] = [
    ['cat_food', 110], ['cat_groceries', 30], ['cat_transport', 40], ['cat_shopping', 50], ['cat_entertainment', 15],
  ].map(([c, usd]) => ({ id: uid('b_'), userId, categoryId: c as string, amount: s(usd as number), currency: base, createdAt: created }));

  const rate = USD_IN[base] / USD_IN[foreign];
  return {
    ...d,
    wallets: [...d.wallets, ...wallets],
    transactions: [...txs, ...d.transactions],
    budgets: [...d.budgets.filter((b) => !budgets.some((x) => x.categoryId === b.categoryId)), ...budgets],
    rates: d.rates.some((x) => x.code === foreign) ? d.rates : [...d.rates, { code: foreign, rate: Math.round(rate * 100) / 100 }],
  };
}
