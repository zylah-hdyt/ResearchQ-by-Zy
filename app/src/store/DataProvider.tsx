import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Budget, ExchangeRate, Transaction, UserData, Wallet } from '../data/types';
import { storage } from '../data/storage';
import { useAuth } from '../auth/AuthProvider';
import { uid } from '../lib/id';
import { dedupe } from '../lib/finance';
import { buildSampleData } from './sample';

interface DataValue extends UserData {
  saveWallet: (w: Omit<Wallet, 'id' | 'userId' | 'createdAt'> & { id?: string }) => void;
  deleteWallet: (id: string) => boolean;
  saveTransaction: (t: Omit<Transaction, 'id' | 'userId' | 'createdAt'> & { id?: string }) => void;
  deleteTransaction: (id: string) => void;
  saveBudget: (b: Omit<Budget, 'id' | 'userId' | 'createdAt'> & { id?: string }) => void;
  deleteBudget: (id: string) => void;
  setRates: (r: ExchangeRate[]) => void;
  markNotificationsRead: (ids: string[]) => void;
  loadSample: () => void;
  clearAll: () => void;
}

const Ctx = createContext<DataValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const userId = profile!.userId;
  const [data, setData] = useState<UserData>(() => storage.getData(userId));

  useEffect(() => setData(storage.getData(userId)), [userId]);

  const commit = useCallback(
    (fn: (d: UserData) => UserData) => {
      setData((prev) => {
        const next = fn(prev);
        next.transactions = dedupe(next.transactions);
        storage.saveData(userId, next);
        return next;
      });
    },
    [userId],
  );

  const now = () => new Date().toISOString();

  const value = useMemo<DataValue>(
    () => ({
      ...data,
      saveWallet: (w) =>
        commit((d) => {
          if (w.id) return { ...d, wallets: d.wallets.map((x) => (x.id === w.id ? { ...x, ...w, id: x.id } : x)) };
          return { ...d, wallets: [...d.wallets, { ...w, id: uid('w_'), userId, createdAt: now() }] };
        }),
      deleteWallet: (id) => {
        if (data.transactions.some((t) => t.walletId === id || t.toWalletId === id)) return false;
        commit((d) => ({ ...d, wallets: d.wallets.filter((w) => w.id !== id) }));
        return true;
      },
      saveTransaction: (t) =>
        commit((d) => {
          const clean = { ...t };
          if (clean.type === 'transfer') delete clean.categoryId;
          else {
            delete clean.toWalletId;
            delete clean.toAmount;
          }
          if (t.id) return { ...d, transactions: d.transactions.map((x) => (x.id === t.id ? { ...x, ...clean, id: x.id } as Transaction : x)) };
          return { ...d, transactions: [{ ...clean, id: uid('tx_'), userId, createdAt: now() } as Transaction, ...d.transactions] };
        }),
      deleteTransaction: (id) => commit((d) => ({ ...d, transactions: d.transactions.filter((t) => t.id !== id) })),
      saveBudget: (b) =>
        commit((d) => {
          if (b.id) return { ...d, budgets: d.budgets.map((x) => (x.id === b.id ? { ...x, ...b, id: x.id } : x)) };
          return { ...d, budgets: [...d.budgets, { ...b, id: uid('b_'), userId, createdAt: now() }] };
        }),
      deleteBudget: (id) => commit((d) => ({ ...d, budgets: d.budgets.filter((b) => b.id !== id) })),
      setRates: (rates) => commit((d) => ({ ...d, rates })),
      markNotificationsRead: (ids) =>
        commit((d) => ({ ...d, readNotifications: [...new Set([...d.readNotifications, ...ids])] })),
      loadSample: () => commit((d) => buildSampleData(userId, profile!.preferredCurrency, d)),
      clearAll: () =>
        commit((d) => ({ ...d, wallets: [], transactions: [], budgets: [], readNotifications: [] })),
    }),
    [data, commit, userId, profile],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useData outside DataProvider');
  return v;
}
