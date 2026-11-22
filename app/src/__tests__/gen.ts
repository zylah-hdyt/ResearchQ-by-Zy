import type { CurrencyCode, Transaction, UserData, Wallet } from '../data/types';
import { DEFAULT_CATEGORIES } from '../data/seed';

export function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
}
const pad = (n: number) => String(n).padStart(2, '0');

/** Random but reproducible user data: 5 wallets (IDR + USD), income/expense/transfers over the last ~400 days before `today`. */
export function makeData(n: number, seed = 7, today = new Date(2026, 10, 22), currencies: CurrencyCode[] = ['IDR', 'IDR', 'IDR', 'USD', 'IDR']): UserData {
  const r = rng(seed);
  const U = 'u';
  const wallets: Wallet[] = currencies.map((currency, i) => ({
    id: 'w' + i, userId: U, name: 'W' + i, type: 'bank', currency, initialBalance: Math.round(r() * 1e6) * 100, color: '#000', archived: false, createdAt: '',
  }));
  const cats = DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: U }));
  const exp = cats.filter((c) => c.type === 'expense'), inc = cats.filter((c) => c.type === 'income');
  const txs: Transaction[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - Math.floor(r() * 400), Math.floor(r() * 24), Math.floor(r() * 60));
    const occurredAt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const w = wallets[Math.floor(r() * wallets.length)];
    const amount = (Math.round(r() * 2e6) + 1) * (w.currency === 'USD' ? 1 : 100);
    const base = { id: 't' + i, userId: U, walletId: w.id, amount, occurredAt, description: 'd' + i, notes: '', createdAt: '' };
    const k = r();
    if (k < 0.18) txs.push({ ...base, type: 'income', categoryId: inc[Math.floor(r() * inc.length)].id });
    else if (k < 0.86) txs.push({ ...base, type: 'expense', categoryId: exp[Math.floor(r() * exp.length)].id });
    else {
      const to = wallets[(wallets.indexOf(w) + 1 + Math.floor(r() * (wallets.length - 1))) % wallets.length];
      txs.push({ ...base, type: 'transfer', toWalletId: to.id, toAmount: to.currency === w.currency ? amount : Math.round(amount) });
    }
  }
  return { wallets, categories: cats, transactions: txs, budgets: [], rates: [{ code: 'USD', rate: 16000 }], readNotifications: [] };
}
