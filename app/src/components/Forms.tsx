import { useState } from 'react';
import type { Budget, CurrencyCode, Transaction, TxType, Wallet, WalletType } from '../data/types';
import { CURRENCIES } from '../data/types';
import { useData } from '../store/DataProvider';
import { useAuth } from '../auth/AuthProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { toLocalDateTime } from '../lib/format';
import { parseAmount, toInputText } from '../lib/money';
import { AmountInput } from './AmountInput';
import { Modal } from './Modal';
import { useToast } from './Toast';


export function TransactionForm({ initial, onClose }: { initial?: Transaction; onClose: () => void }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { wallets, categories, saveTransaction, deleteTransaction } = useData();
  const active = wallets.filter((w) => !w.archived || w.id === initial?.walletId || w.id === initial?.toWalletId);
  const [type, setType] = useState<TxType>(initial?.type ?? 'expense');
  const [walletId, setWalletId] = useState(initial?.walletId ?? active[0]?.id ?? '');
  const [toWalletId, setToWalletId] = useState(initial?.toWalletId ?? active[1]?.id ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '');
  const initFrom = wallets.find((w) => w.id === (initial?.walletId ?? active[0]?.id));
  const initTo = wallets.find((w) => w.id === initial?.toWalletId);
  const [amount, setAmount] = useState(toInputText(initial?.amount, initFrom?.currency ?? 'IDR', lang));
  const [toAmount, setToAmount] = useState(toInputText(initial?.toAmount, initTo?.currency ?? 'IDR', lang));
  const [occurredAt, setOccurredAt] = useState(initial?.occurredAt ?? toLocalDateTime(new Date()));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [err, setErr] = useState<MessageKey | null>(null);

  const from = wallets.find((w) => w.id === walletId);
  const to = wallets.find((w) => w.id === toWalletId);
  const crossCurrency = type === 'transfer' && from && to && from.currency !== to.currency;
  const cats = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  const submit = () => {
    if (!from) return setErr('tx.err.wallet');
    const amt = parseAmount(amount, from.currency, lang);
    if (!(amt > 0)) return setErr('tx.err.amount');
    if (type === 'transfer') {
      if (!to) return setErr('tx.err.wallet');
      if (to.id === from.id) return setErr('tx.err.sameWallet');
    } else if (!categoryId || !cats.some((c) => c.id === categoryId)) return setErr('tx.err.category');
    const recv = crossCurrency ? parseAmount(toAmount, to!.currency, lang) : amt;
    if (type === 'transfer' && !(recv > 0)) return setErr('tx.err.amount');
    saveTransaction({
      id: initial?.id, type, walletId, amount: amt, occurredAt, description: description.trim(), notes: notes.trim(),
      ...(type === 'transfer' ? { toWalletId, toAmount: recv } : { categoryId }),
    });
    toast(t('common.saved'));
    onClose();
  };

  return (
    <Modal
      title={initial ? t('tx.edit') : t('tx.add')}
      onClose={onClose}
      footer={<>
        {initial && <button className="btn danger" style={{ marginRight: 'auto' }} onClick={() => { if (confirm(t('common.confirmDelete'))) { deleteTransaction(initial.id); onClose(); } }}>{t('common.delete')}</button>}
        <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
        <button className="btn primary" onClick={submit}>{t('common.save')}</button>
      </>}
    >
      <div className="segmented" role="tablist">
        {(['expense', 'income', 'transfer'] as TxType[]).map((x) => (
          <button key={x} className={type === x ? 'on' : ''} onClick={() => { setType(x); setCategoryId(''); }}>{t(`tx.type.${x}` as MessageKey)}</button>
        ))}
      </div>
      <div className="form-grid">
        <label className="field">{t('tx.amount')}{from && ` (${from.currency})`}
          <AmountInput autoFocus currency={from?.currency ?? 'IDR'} value={amount} onChange={setAmount} />
        </label>
        <label className="field">{t('tx.date')}
          <input className="input" type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
        </label>
        <label className="field">{type === 'transfer' ? t('tx.fromWallet') : t('tx.wallet')}
          <select className="input" value={walletId} onChange={(e) => setWalletId(e.target.value)}>
            {active.map((w) => <option key={w.id} value={w.id}>{w.name} · {w.currency}</option>)}
          </select>
        </label>
        {type === 'transfer' ? (
          <label className="field">{t('tx.toWallet')}
            <select className="input" value={toWalletId} onChange={(e) => setToWalletId(e.target.value)}>
              {active.map((w) => <option key={w.id} value={w.id}>{w.name} · {w.currency}</option>)}
            </select>
          </label>
        ) : (
          <label className="field">{t('tx.category')}
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">—</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{categoryLabel(c, t)}</option>)}
            </select>
          </label>
        )}
        {crossCurrency && (
          <label className="field full">{t('tx.toAmount')} ({to!.currency})
            <AmountInput currency={to!.currency} value={toAmount} onChange={setToAmount} />
          </label>
        )}
        <label className="field full">{t('tx.description')}
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={120} />
        </label>
        <label className="field full">{t('tx.notes')} <span className="hint">({t('common.optional')})</span>
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
        </label>
      </div>
      {err && <div className="error" role="alert">{t(err)}</div>}
    </Modal>
  );
}

const WALLET_TYPES: WalletType[] = ['bank', 'cash', 'ewallet', 'savings', 'credit', 'investment'];
const WALLET_COLORS = ['#1d4ed8', '#15803d', '#0891b2', '#7c3aed', '#be185d', '#b45309', '#475569'];

export function WalletForm({ initial, onClose }: { initial?: Wallet; onClose: () => void }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { profile } = useAuth();
  const { saveWallet, deleteWallet } = useData();
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<WalletType>(initial?.type ?? 'bank');
  const [currency, setCurrency] = useState<CurrencyCode>(initial?.currency ?? profile!.preferredCurrency);
  const [initialBalance, setInitial] = useState(toInputText(initial?.initialBalance ?? 0, initial?.currency ?? profile!.preferredCurrency, lang));
  const [color, setColor] = useState(initial?.color ?? WALLET_COLORS[0]);
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) return setErr(t('acc.name'));
    saveWallet({ id: initial?.id, name: name.trim(), type, currency, initialBalance: parseAmount(initialBalance || '0', currency, lang), color, archived: initial?.archived ?? false });
    toast(t('common.saved'));
    onClose();
  };
  return (
    <Modal title={initial ? t('acc.edit') : t('acc.add')} onClose={onClose}
      footer={<>
        {initial && <button className="btn danger" style={{ marginRight: 'auto' }} onClick={() => {
          if (!confirm(t('common.confirmDelete'))) return;
          if (deleteWallet(initial.id)) onClose(); else setErr(t('acc.deleteBlocked'));
        }}>{t('common.delete')}</button>}
        <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
        <button className="btn primary" onClick={submit}>{t('common.save')}</button>
      </>}>
      <div className="form-grid">
        <label className="field full">{t('acc.name')}<input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></label>
        <label className="field">{t('acc.type')}
          <select className="input" value={type} onChange={(e) => setType(e.target.value as WalletType)}>
            {WALLET_TYPES.map((x) => <option key={x} value={x}>{t(`acc.type.${x}` as MessageKey)}</option>)}
          </select>
        </label>
        <label className="field">{t('acc.currency')}
          <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)} disabled={!!initial}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="field full">{t('acc.initial')}<AmountInput currency={currency} value={initialBalance} onChange={setInitial} /></label>
        <div className="field full">{t('acc.color')}
          <div className="row">{WALLET_COLORS.map((c) => (
            <button key={c} aria-label={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: color === c ? '3px solid var(--text)' : '2px solid transparent', cursor: 'pointer' }} />
          ))}</div>
        </div>
      </div>
      {err && <div className="error" role="alert">{err}</div>}
    </Modal>
  );
}

export function BudgetForm({ initial, onClose }: { initial?: Budget; onClose: () => void }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { profile } = useAuth();
  const { categories, budgets, saveBudget, deleteBudget } = useData();
  const cats = categories.filter((c) => c.type === 'expense');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? cats.find((c) => !budgets.some((b) => b.categoryId === c.id))?.id ?? '');
  const [currency, setCurrency] = useState<CurrencyCode>(initial?.currency ?? profile!.preferredCurrency);
  const [amount, setAmount] = useState(toInputText(initial?.amount, initial?.currency ?? profile!.preferredCurrency, lang));
  const [err, setErr] = useState<string | null>(null);
  const submit = () => {
    if (!categoryId) return setErr(t('tx.err.category'));
    if (!(parseAmount(amount, currency, lang) > 0)) return setErr(t('tx.err.amount'));
    if (budgets.some((b) => b.categoryId === categoryId && b.id !== initial?.id)) return setErr(t('bud.exists'));
    saveBudget({ id: initial?.id, categoryId, amount: parseAmount(amount, currency, lang), currency });
    toast(t('common.saved'));
    onClose();
  };
  return (
    <Modal title={initial ? t('bud.edit') : t('bud.add')} onClose={onClose}
      footer={<>
        {initial && <button className="btn danger" style={{ marginRight: 'auto' }} onClick={() => { if (confirm(t('common.confirmDelete'))) { deleteBudget(initial.id); onClose(); } }}>{t('common.delete')}</button>}
        <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
        <button className="btn primary" onClick={submit}>{t('common.save')}</button>
      </>}>
      <div className="form-grid">
        <label className="field full">{t('tx.category')}
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">—</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{categoryLabel(c, t)}</option>)}
          </select>
        </label>
        <label className="field">{t('bud.monthly')}<AmountInput currency={currency} value={amount} onChange={setAmount} /></label>
        <label className="field">{t('acc.currency')}
          <select className="input" value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      {err && <div className="error" role="alert">{err}</div>}
    </Modal>
  );
}
