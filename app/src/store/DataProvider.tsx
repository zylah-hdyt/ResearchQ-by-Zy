import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Budget, ExchangeRate, Transaction, UserData, Wallet } from '../data/types';
import { dataBackend } from '../data';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../components/Toast';
import { translator, useI18n } from '../i18n';
import { uid } from '../lib/id';
import { dedupe } from '../lib/finance';
import { buildSampleData } from './sample';

interface DataValue extends UserData {
  saveWallet: (w: Omit<Wallet, 'id' | 'userId' | 'createdAt'> & { id?: string }) => void;
  deleteWallet: (id: string) => boolean;
  saveTransaction: (t: Omit<Transaction, 'id' | 'userId' | 'createdAt'> & { id?: string }) => void;
  deleteTransaction: (id: string) => void;
  /** Put a deleted transaction back exactly as it was (same id), used by Undo. */
  restoreTransaction: (t: Transaction) => void;
  saveBudget: (b: Omit<Budget, 'id' | 'userId' | 'createdAt'> & { id?: string }) => void;
  deleteBudget: (id: string) => void;
  setRates: (r: ExchangeRate[]) => void;
  markNotificationsRead: (ids: string[]) => void;
  loadSample: () => void;
  clearAll: () => void;
}

const Ctx = createContext<DataValue | null>(null);
const EMPTY: UserData = { wallets: [], categories: [], transactions: [], budgets: [], rates: [], readNotifications: [] };

export function DataProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const { t } = useI18n();
  const toast = useToast();
  const userId = profile!.userId;
  const [data, setData] = useState<UserData>(EMPTY);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const dataRef = useRef<UserData>(EMPTY);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const lang = profile!.language;

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      const d = await dataBackend.load(userId);
      dataRef.current = d;
      setData(d);
      setStatus('ready');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, [userId]);

  useEffect(() => { void reload(); }, [reload]);

  /** Apply a change immediately (optimistic), then persist it in order. On failure, reload the real state. */
  const commit = useCallback(
    (fn: (d: UserData) => UserData) => {
      const prev = dataRef.current;
      const next = fn(prev);
      next.transactions = dedupe(next.transactions);
      dataRef.current = next;
      setData(next);
      queue.current = queue.current
        .then(() => dataBackend.save(userId, prev, next))
        .catch(async (e) => {
          console.error(e);
          toast(translator(lang)('sync.error'));
          try {
            const d = await dataBackend.load(userId);
            dataRef.current = d;
            setData(d);
          } catch { /* keep optimistic state; user can refresh */ }
        });
    },
    [userId, toast, lang],
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
        if (dataRef.current.transactions.some((x) => x.walletId === id || x.toWalletId === id)) return false;
        commit((d) => ({ ...d, wallets: d.wallets.filter((w) => w.id !== id) }));
        return true;
      },
      saveTransaction: (tx) =>
        commit((d) => {
          const clean = { ...tx };
          if (clean.type === 'transfer') delete clean.categoryId;
          else {
            delete clean.toWalletId;
            delete clean.toAmount;
          }
          if (tx.id) return { ...d, transactions: d.transactions.map((x) => (x.id === tx.id ? ({ ...x, ...clean, id: x.id } as Transaction) : x)) };
          return { ...d, transactions: [{ ...clean, id: uid('tx_'), userId, createdAt: now() } as Transaction, ...d.transactions] };
        }),
      deleteTransaction: (id) => commit((d) => ({ ...d, transactions: d.transactions.filter((x) => x.id !== id) })),
      restoreTransaction: (tx) => commit((d) => ({ ...d, transactions: [tx, ...d.transactions.filter((x) => x.id !== tx.id)] })),
      saveBudget: (b) =>
        commit((d) => {
          if (b.id) return { ...d, budgets: d.budgets.map((x) => (x.id === b.id ? { ...x, ...b, id: x.id } : x)) };
          return { ...d, budgets: [...d.budgets, { ...b, id: uid('b_'), userId, createdAt: now() }] };
        }),
      deleteBudget: (id) => commit((d) => ({ ...d, budgets: d.budgets.filter((b) => b.id !== id) })),
      setRates: (rates) => commit((d) => ({ ...d, rates })),
      markNotificationsRead: (ids) =>
        commit((d) => ({ ...d, readNotifications: [...new Set([...d.readNotifications, ...ids])] })),
      loadSample: () => commit((d) => buildSampleData(userId, profile!.preferredCurrency, d, profile!.language)),
      clearAll: () => commit((d) => ({ ...d, wallets: [], transactions: [], budgets: [], readNotifications: [] })),
    }),
    [data, commit, userId, profile],
  );

  if (status !== 'ready') {
    return (
      <div className="state" style={{ minHeight: '100%', justifyContent: 'center' }} role={status === 'error' ? 'alert' : 'status'}>
        {status === 'loading' ? (
          <><div className="spinner" /><span className="muted">{t('common.loading')}</span></>
        ) : (
          <><strong>{t('sync.loadError')}</strong><button className="btn primary" onClick={reload}>{t('export.retry')}</button></>
        )}
      </div>
    );
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useData outside DataProvider');
  return v;
}
