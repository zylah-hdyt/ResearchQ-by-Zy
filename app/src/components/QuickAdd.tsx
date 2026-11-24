import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import type { Transaction, TxType } from '../data/types';
import { useData } from '../store/DataProvider';
import { useI18n } from '../i18n';
import { TransactionForm, WalletForm } from './Forms';

export interface AddPreset { type?: TxType; walletId?: string; toWalletId?: string }
interface QuickAddValue { openAdd: (preset?: AddPreset) => void; openEdit: (t: Transaction) => void; openDuplicate: (t: Transaction) => void }

const Ctx = createContext<QuickAddValue>({ openAdd: () => {}, openEdit: () => {}, openDuplicate: () => {} });

type State = { mode: 'wallet-first'; preset?: AddPreset } | { mode: 'add'; preset?: AddPreset } | { mode: 'edit'; tx: Transaction } | { mode: 'duplicate'; tx: Transaction } | null;

/** One transaction form for the whole app: add, edit or duplicate from any screen. */
export function QuickAddProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { wallets } = useData();
  const [state, setState] = useState<State>(null);
  const hasWallet = wallets.length > 0;
  // A transaction needs a wallet: with none yet, "+" first asks for one and then opens the transaction form.
  const openAdd = useCallback((preset?: AddPreset) => setState({ mode: hasWallet ? 'add' : 'wallet-first', preset }), [hasWallet]);
  const openEdit = useCallback((tx: Transaction) => setState({ mode: 'edit', tx }), []);
  const openDuplicate = useCallback((tx: Transaction) => setState({ mode: 'duplicate', tx }), []);
  const close = useCallback(() => setState(null), []);
  const value = useMemo(() => ({ openAdd, openEdit, openDuplicate }), [openAdd, openEdit, openDuplicate]);
  return (
    <Ctx.Provider value={value}>
      {children}
      {state?.mode === 'wallet-first' && <WalletForm intro={t('tx.needWallet')} onClose={close} onSaved={() => setState({ mode: 'add', preset: state.preset })} />}
      {state?.mode === 'add' && <TransactionForm preset={state.preset} onClose={close} />}
      {state?.mode === 'edit' && <TransactionForm initial={state.tx} onClose={close} />}
      {state?.mode === 'duplicate' && <TransactionForm duplicateOf={state.tx} onClose={close} />}
    </Ctx.Provider>
  );
}
export const useQuickAdd = () => useContext(Ctx);

/** Icon button used in headers on phones (replaces the floating action button). Always clickable: with no wallet it starts by creating one. */
export function QuickAddButton({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  const { openAdd } = useQuickAdd();
  return (
    <button className={`icon-btn filled ${className}`} onClick={() => openAdd()} aria-label={t('tx.add')} title={t('tx.add')}>
      <Plus size={20} aria-hidden />
    </button>
  );
}
