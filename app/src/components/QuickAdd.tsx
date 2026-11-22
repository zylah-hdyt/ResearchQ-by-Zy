import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import type { Transaction, TxType } from '../data/types';
import { useData } from '../store/DataProvider';
import { useI18n } from '../i18n';
import { TransactionForm } from './Forms';

export interface AddPreset { type?: TxType; walletId?: string; toWalletId?: string }
interface QuickAddValue { openAdd: (preset?: AddPreset) => void; openEdit: (t: Transaction) => void; openDuplicate: (t: Transaction) => void }

const Ctx = createContext<QuickAddValue>({ openAdd: () => {}, openEdit: () => {}, openDuplicate: () => {} });

type State = { mode: 'add'; preset?: AddPreset } | { mode: 'edit'; tx: Transaction } | { mode: 'duplicate'; tx: Transaction } | null;

/** One transaction form for the whole app: add, edit or duplicate from any screen. */
export function QuickAddProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(null);
  const openAdd = useCallback((preset?: AddPreset) => setState({ mode: 'add', preset }), []);
  const openEdit = useCallback((tx: Transaction) => setState({ mode: 'edit', tx }), []);
  const openDuplicate = useCallback((tx: Transaction) => setState({ mode: 'duplicate', tx }), []);
  const close = useCallback(() => setState(null), []);
  const value = useMemo(() => ({ openAdd, openEdit, openDuplicate }), [openAdd, openEdit, openDuplicate]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {state?.mode === 'add' && <TransactionForm preset={state.preset} onClose={close} />}
      {state?.mode === 'edit' && <TransactionForm initial={state.tx} onClose={close} />}
      {state?.mode === 'duplicate' && <TransactionForm duplicateOf={state.tx} onClose={close} />}
    </Ctx.Provider>
  );
}
export const useQuickAdd = () => useContext(Ctx);

/** Icon button used in headers on phones (replaces the floating action button). Disabled until a wallet exists. */
export function QuickAddButton({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const { wallets } = useData();
  const { openAdd } = useQuickAdd();
  return (
    <button className={`icon-btn filled ${className}`} onClick={() => openAdd()} disabled={wallets.length === 0} aria-label={t('tx.add')} title={t('tx.add')}>
      <Plus size={20} aria-hidden />
    </button>
  );
}
