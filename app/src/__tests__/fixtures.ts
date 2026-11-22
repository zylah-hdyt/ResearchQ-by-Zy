import type { Profile, Transaction, UserData, Wallet } from '../data/types';
import { DEFAULT_CATEGORIES } from '../data/seed';

export const U = 'u_test';
export const profile: Profile = {
  userId: U, email: 'alex@example.com', fullName: 'Alex Morgan', displayName: 'Alex', avatarDataUrl: null,
  phone: '', country: '', dateOfBirth: '', preferredCurrency: 'IDR', language: 'en', theme: 'system',
  weekStartsOn: 1, budgetAlerts: true, updatedAt: '',
};
const w = (id: string, currency: Wallet['currency'], initial: number): Wallet => ({
  id, userId: U, name: id.toUpperCase(), type: 'bank', currency, initialBalance: initial, color: '#000', archived: false, createdAt: '',
});
const tx = (id: string, p: Partial<Transaction>): Transaction => ({
  id, userId: U, type: 'expense', walletId: 'bank', amount: 0, occurredAt: '2026-11-10T10:00', description: id, notes: '', createdAt: '', ...p,
});

export function fixture(): UserData {
  return {
    wallets: [w('bank', 'IDR', 1_000_000_00), w('cash', 'IDR', 100_000_00), w('usd', 'USD', 100_00)],
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: U })),
    transactions: [
      tx('t0', { type: 'income', categoryId: 'cat_salary', amount: 500_000_00, occurredAt: '2026-10-01T09:00' }),
      tx('t1', { type: 'income', categoryId: 'cat_salary', amount: 10_000_000_00, occurredAt: '2026-11-01T09:00' }),
      tx('t2', { type: 'expense', categoryId: 'cat_food', amount: 250_000_00, occurredAt: '2026-11-03T12:30' }),
      tx('t3', { type: 'transfer', walletId: 'bank', toWalletId: 'cash', amount: 500_000_00, toAmount: 500_000_00, occurredAt: '2026-11-04T08:00' }),
      tx('t4', { type: 'expense', walletId: 'cash', categoryId: 'cat_food', amount: 50_000_00, occurredAt: '2026-11-05T19:00' }),
      tx('t5', { type: 'transfer', walletId: 'bank', toWalletId: 'usd', amount: 1_600_000_00, toAmount: 100_00, occurredAt: '2026-11-06T08:00' }),
      tx('t6', { type: 'expense', walletId: 'usd', categoryId: 'cat_shopping', amount: 20_00, occurredAt: '2026-11-07T08:00' }),
      tx('t7', { type: 'expense', categoryId: 'cat_food', amount: 99_00, occurredAt: '2026-12-01T08:00' }),
      // Duplicate record of t2 must be ignored.
      tx('t2', { type: 'expense', categoryId: 'cat_food', amount: 250_000_00, occurredAt: '2026-11-03T12:30' }),
      // Another user's record must never be exported.
      { ...tx('foreign', { type: 'income', categoryId: 'cat_salary', amount: 1 }), userId: 'u_other' },
    ],
    budgets: [{ id: 'b1', userId: U, categoryId: 'cat_food', amount: 280_000_00, currency: 'IDR', createdAt: '' }],
    rates: [{ code: 'USD', rate: 16000 }],
    readNotifications: [],
  };
}
