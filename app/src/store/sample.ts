import type { Budget, CurrencyCode, Language, Transaction, UserData, Wallet } from '../data/types';
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

const TEXT = {
  id: { bank: 'BCA', cash: 'Tunai', ew: 'GoPay', sav: (c: string) => `Tabungan ${c}`, salary: 'Gaji bulanan', freelance: 'Proyek freelance', rent: 'Sewa rumah',
    util: 'Listrik & internet', stream: 'Langganan streaming', topup: 'Isi saldo e-wallet', atm: 'Tarik tunai ATM', saving: 'Tabungan bulanan', cross: 'Transfer lintas mata uang',
    lunch: 'Makan siang', groceries: 'Belanja bulanan', ride: 'Ojek online', shop: 'Belanja online', movie: 'Nonton bioskop', pharmacy: 'Apotek' },
  en: { bank: 'Main bank', cash: 'Cash', ew: 'E-wallet', sav: (c: string) => `Savings ${c}`, salary: 'Monthly salary', freelance: 'Freelance project', rent: 'Rent',
    util: 'Electricity & internet', stream: 'Streaming subscription', topup: 'Top up e-wallet', atm: 'ATM withdrawal', saving: 'Monthly saving', cross: 'Cross-currency transfer',
    lunch: 'Lunch', groceries: 'Groceries', ride: 'Ride', shop: 'Online shopping', movie: 'Movie night', pharmacy: 'Pharmacy' },
} as const;

export function buildSampleData(userId: string, base: CurrencyCode, d: UserData, lang: Language = 'id'): UserData {
  const X = TEXT[lang];
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
  const bank = mk(X.bank, 'bank', base, 1500, '#1d4ed8');
  const cash = mk(X.cash, 'cash', base, 60, '#15803d');
  const ew = mk(X.ew, 'ewallet', base, 40, '#0891b2');
  const sav = mk(X.sav(foreign), 'savings', foreign, 800, '#7c3aed');
  const wallets = [bank, cash, ew, sav];

  const txs: Transaction[] = [];
  const now = new Date();
  const add = (date: Date, t: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'occurredAt' | 'notes'> & { notes?: string }) => {
    if (date > now) return;
    txs.push({ notes: '', ...t, id: uid('tx_'), userId, createdAt: created, occurredAt: toLocalDateTime(date) });
  };
  const expenses: [string, string, number, number][] = [
    ['cat_food', X.lunch, 6, 14],
    ['cat_groceries', X.groceries, 4, 6],
    ['cat_transport', X.ride, 8, 4],
    ['cat_shopping', X.shop, 2, 30],
    ['cat_entertainment', X.movie, 1, 12],
    ['cat_health', X.pharmacy, 1, 10],
  ];
  for (let m = 5; m >= 0; m--) {
    const y = now.getFullYear();
    const mo = now.getMonth() - m;
    add(new Date(y, mo, 1, 9, 0), { type: 'income', walletId: bank.id, categoryId: 'cat_salary', amount: s(1200), description: X.salary });
    if (m % 2 === 0) add(new Date(y, mo, 12, 14, 30), { type: 'income', walletId: bank.id, categoryId: 'cat_business', amount: s(180 + r() * 120), description: X.freelance });
    add(new Date(y, mo, 2, 10, 0), { type: 'expense', walletId: bank.id, categoryId: 'cat_housing', amount: s(350), description: X.rent });
    add(new Date(y, mo, 5, 8, 15), { type: 'expense', walletId: bank.id, categoryId: 'cat_utilities', amount: s(45 + r() * 15), description: X.util });
    add(new Date(y, mo, 6, 8, 20), { type: 'expense', walletId: bank.id, categoryId: 'cat_bills', amount: s(12), description: X.stream });
    add(new Date(y, mo, 3, 18, 0), { type: 'transfer', walletId: bank.id, toWalletId: ew.id, amount: s(160), toAmount: s(160), description: X.topup });
    add(new Date(y, mo, 4, 12, 0), { type: 'transfer', walletId: bank.id, toWalletId: cash.id, amount: s(120), toAmount: s(120), description: X.atm });
    const usdAmt = s(100, foreign);
    add(new Date(y, mo, 25, 20, 0), { type: 'transfer', walletId: bank.id, toWalletId: sav.id, amount: Math.round((usdAmt / 100) * (USD_IN[base] / USD_IN[foreign])) * 100, toAmount: usdAmt, description: X.saving, notes: X.cross });
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
