import { useEffect, useRef, useState } from 'react';
import { categoryIcon } from '../lib/categoryIcons';
import type { Budget, BudgetPeriod, CurrencyCode, Transaction, TxType, Wallet, WalletType } from '../data/types';
import { CURRENCIES } from '../data/types';
import { useData } from '../store/DataProvider';
import { useAuth } from '../auth/AuthProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { toLocalDateTime } from '../lib/format';
import { parseAmount, toInputText } from '../lib/money';
import { AmountInput } from './AmountInput';
import { Modal } from './Modal';
import { useConfirm } from './Confirm';
import { useToast } from './Toast';


export function TransactionForm({ initial, preset, duplicateOf, onClose }: {
  initial?: Transaction; preset?: { type?: TxType; walletId?: string; toWalletId?: string }; duplicateOf?: Transaction; onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { wallets, categories, saveTransaction, deleteTransaction, restoreTransaction } = useData();
  const confirm = useConfirm();
  // A duplicate starts from an existing transaction but is saved as a NEW one dated now.
  const seed = initial ?? duplicateOf;
  const active = wallets.filter((w) => !w.archived || w.id === seed?.walletId || w.id === seed?.toWalletId || w.id === preset?.walletId);
  const [type, setType] = useState<TxType>(seed?.type ?? preset?.type ?? 'expense');
  const [walletId, setWalletId] = useState(seed?.walletId ?? preset?.walletId ?? active[0]?.id ?? '');
  const [toWalletId, setToWalletId] = useState(seed?.toWalletId ?? preset?.toWalletId ?? active.find((w) => w.id !== (seed?.walletId ?? preset?.walletId ?? active[0]?.id))?.id ?? '');
  const [categoryId, setCategoryId] = useState(seed?.categoryId ?? '');
  const initFrom = wallets.find((w) => w.id === (seed?.walletId ?? preset?.walletId ?? active[0]?.id));
  const initTo = wallets.find((w) => w.id === seed?.toWalletId);
  const [amount, setAmount] = useState(toInputText(seed?.amount, initFrom?.currency ?? 'IDR', lang));
  const [toAmount, setToAmount] = useState(toInputText(seed?.toAmount, initTo?.currency ?? 'IDR', lang));
  const [occurredAt, setOccurredAt] = useState(initial?.occurredAt ?? toLocalDateTime(new Date()));
  const [description, setDescription] = useState(seed?.description ?? '');
  const [notes, setNotes] = useState(seed?.notes ?? '');
  const [err, setErr] = useState<{ field: 'amount' | 'category' | 'wallet' | 'toWallet' | 'toAmount'; key: MessageKey } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  // Show the problem where it is: scroll to the field with the error and move focus to it.
  useEffect(() => {
    if (!err) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${err.field}"]`);
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    el?.querySelector<HTMLElement>('input, select, button')?.focus({ preventScroll: true });
  }, [err]);
  const fail = (field: NonNullable<typeof err>['field'], key: MessageKey) => setErr({ field, key });
  const errFor = (field: NonNullable<typeof err>['field']) => (err?.field === field ? <span className="field-error" role="alert">{t(err.key)}</span> : null);

  const from = wallets.find((w) => w.id === walletId);
  const to = wallets.find((w) => w.id === toWalletId);
  const crossCurrency = type === 'transfer' && from && to && from.currency !== to.currency;
  const cats = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));

  const submit = () => {
    if (!from) return fail('wallet', 'tx.err.wallet');
    const amt = parseAmount(amount, from.currency, lang);
    if (!(amt > 0)) return fail('amount', 'tx.err.amount');
    if (type === 'transfer') {
      if (!to) return fail('toWallet', 'tx.err.wallet');
      if (to.id === from.id) return fail('toWallet', 'tx.err.sameWallet');
    } else if (!categoryId || !cats.some((c) => c.id === categoryId)) return fail('category', 'tx.err.category');
    const recv = crossCurrency ? parseAmount(toAmount, to!.currency, lang) : amt;
    if (type === 'transfer' && !(recv > 0)) return fail('toAmount', 'tx.err.amount');
    saveTransaction({
      id: initial?.id, type, walletId, amount: amt, occurredAt, description: description.trim(), notes: notes.trim(),
      ...(type === 'transfer' ? { toWalletId, toAmount: recv } : { categoryId }),
    });
    toast(t('common.saved'));
    onClose();
  };

  return (
    <Modal
      title={initial ? t('tx.edit') : duplicateOf ? t('tx.duplicate') : t('tx.add')}
      onClose={onClose}
      footer={<>
        {initial && <button className="btn danger" style={{ marginRight: 'auto' }} onClick={async () => { if (await confirm({ title: t('tx.deleteTitle'), body: t('tx.deleteBody'), confirmLabel: t('common.delete'), danger: true })) { deleteTransaction(initial.id); onClose(); toast(t('tx.deleted'), { label: t('tx.undo'), onClick: () => restoreTransaction(initial) }); } }}>{t('common.delete')}</button>}
        <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
        <button className="btn primary" onClick={submit}>{t('common.save')}</button>
      </>}
    >
      <div ref={formRef} className="stack lg tx-form">
      <div className="segmented fill" role="tablist" aria-label={t('tx.type')}>
        {(['expense', 'income', 'transfer'] as TxType[]).map((x) => (
          <button key={x} role="tab" aria-selected={type === x} className={type === x ? 'on' : ''} onClick={() => { setType(x); setCategoryId(''); setErr(null); }}>{t(`tx.type.${x}` as MessageKey)}</button>
        ))}
      </div>
      <label className="field amount-field" data-field="amount">{t('tx.amount')}{from && ` (${from.currency})`}
        <AmountInput autoFocus currency={from?.currency ?? 'IDR'} value={amount} onChange={(v) => { setAmount(v); if (err?.field === 'amount') setErr(null); }} />
        {errFor('amount')}
      </label>
      {type !== 'transfer' && (
        <div className="field" data-field="category">
          <span id="cat-label">{t('tx.category')}</span>
          <div className="cat-grid" role="radiogroup" aria-labelledby="cat-label" aria-invalid={err?.field === 'category' || undefined}>
            {cats.map((c) => {
              const Icon = categoryIcon(c);
              const on = categoryId === c.id;
              return (
                <button type="button" key={c.id} role="radio" aria-checked={on} className={`cat-pick${on ? ' on' : ''}`} onClick={() => { setCategoryId(c.id); if (err?.field === 'category') setErr(null); }}>
                  <span className="cat-pick-icon"><Icon size={18} aria-hidden /></span>
                  <span className="cat-pick-label">{categoryLabel(c, t)}</span>
                </button>
              );
            })}
          </div>
          {errFor('category')}
        </div>
      )}
      <div className="form-grid">
        <label className="field" data-field="wallet">{type === 'transfer' ? t('tx.fromWallet') : t('tx.wallet')}
          <select className="input" value={walletId} onChange={(e) => setWalletId(e.target.value)}>
            {active.map((w) => <option key={w.id} value={w.id}>{w.name} · {w.currency}</option>)}
          </select>
          {errFor('wallet')}
        </label>
        {type === 'transfer' && (
          <label className="field" data-field="toWallet">{t('tx.toWallet')}
            <select className="input" value={toWalletId} onChange={(e) => { setToWalletId(e.target.value); if (err?.field === 'toWallet') setErr(null); }}>
              {active.map((w) => <option key={w.id} value={w.id}>{w.name} · {w.currency}</option>)}
            </select>
            {errFor('toWallet')}
          </label>
        )}
        {crossCurrency && (
          <label className="field full" data-field="toAmount">{t('tx.toAmount')} ({to!.currency})
            <AmountInput currency={to!.currency} value={toAmount} onChange={setToAmount} />
            {errFor('toAmount')}
          </label>
        )}
        <label className="field">{t('tx.date')}
          <input className="input" type="datetime-local" value={occurredAt} onChange={(e) => setOccurredAt(e.target.value)} />
        </label>
        <label className="field full">{t('tx.description')} <span className="hint">({t('common.optional')})</span>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={120} />
        </label>
        <label className="field full">{t('tx.notes')} <span className="hint">({t('common.optional')})</span>
          <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} />
        </label>
      </div>
      </div>
    </Modal>
  );
}

const WALLET_TYPES: WalletType[] = ['bank', 'cash', 'ewallet', 'savings', 'credit', 'investment', 'other'];
const WALLET_COLORS = ['#1d4ed8', '#15803d', '#0891b2', '#7c3aed', '#be185d', '#b45309', '#475569'];

export function WalletForm({ initial, onClose, onSaved, intro }: { initial?: Wallet; onClose: () => void; /** Called instead of onClose after a successful save. */ onSaved?: () => void; intro?: string }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { profile } = useAuth();
  const { saveWallet, deleteWallet } = useData();
  const confirm = useConfirm();
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<WalletType>(initial?.type ?? 'bank');
  const [currency, setCurrency] = useState<CurrencyCode>(initial?.currency ?? profile!.preferredCurrency);
  const [initialBalance, setInitial] = useState(initial ? toInputText(initial.initialBalance, initial.currency, lang) : '');
  const [color, setColor] = useState(initial?.color ?? WALLET_COLORS[0]);
  const [err, setErr] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim()) return setErr(t('acc.name'));
    saveWallet({ id: initial?.id, name: name.trim(), type, currency, initialBalance: parseAmount(initialBalance || '0', currency, lang), color, archived: initial?.archived ?? false });
    toast(t('common.saved'));
    if (onSaved) onSaved(); else onClose();
  };
  return (
    <Modal title={initial ? t('acc.edit') : t('acc.add')} onClose={onClose}
      footer={<>
        {initial && <button className="btn danger" style={{ marginRight: 'auto' }} onClick={async () => {
          if (!(await confirm({ title: t('common.confirmDelete'), confirmLabel: t('common.delete'), danger: true }))) return;
          if (deleteWallet(initial.id)) onClose(); else setErr(t('acc.deleteBlocked'));
        }}>{t('common.delete')}</button>}
        <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
        <button className="btn primary" onClick={submit}>{t('common.save')}</button>
      </>}>
      {intro && <div className="banner info">{intro}</div>}
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

export function BudgetForm({ initial, defaultPeriod = 'monthly', onClose }: { initial?: Budget; defaultPeriod?: BudgetPeriod; onClose: () => void }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { profile } = useAuth();
  const { categories, budgets, saveBudget, deleteBudget } = useData();
  const confirm = useConfirm();
  const cats = categories.filter((c) => c.type === 'expense');
  const [period, setPeriod] = useState<BudgetPeriod>(initial?.period ?? defaultPeriod);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? cats.find((c) => !budgets.some((b) => b.categoryId === c.id && b.period === (initial?.period ?? defaultPeriod)))?.id ?? '');
  const [currency, setCurrency] = useState<CurrencyCode>(initial?.currency ?? profile!.preferredCurrency);
  const [amount, setAmount] = useState(toInputText(initial?.amount, initial?.currency ?? profile!.preferredCurrency, lang));
  const [err, setErr] = useState<string | null>(null);
  const submit = () => {
    if (!categoryId) return setErr(t('tx.err.category'));
    if (!(parseAmount(amount, currency, lang) > 0)) return setErr(t('tx.err.amount'));
    if (budgets.some((b) => b.categoryId === categoryId && b.period === period && b.id !== initial?.id)) return setErr(t('bud.exists'));
    saveBudget({ id: initial?.id, categoryId, amount: parseAmount(amount, currency, lang), period, currency });
    toast(t('common.saved'));
    onClose();
  };
  return (
    <Modal title={initial ? t('bud.edit') : t('bud.add')} onClose={onClose}
      footer={<>
        {initial && <button className="btn danger" style={{ marginRight: 'auto' }} onClick={async () => { if (await confirm({ title: t('common.confirmDelete'), confirmLabel: t('common.delete'), danger: true })) { deleteBudget(initial.id); onClose(); } }}>{t('common.delete')}</button>}
        <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
        <button className="btn primary" onClick={submit}>{t('common.save')}</button>
      </>}>
      <div className="field">{t('bud.period')}
        <div className="segmented fill" role="group" aria-label={t('bud.period')}>
          {(['monthly', 'weekly'] as BudgetPeriod[]).map((x) => <button key={x} type="button" className={period === x ? 'on' : ''} aria-pressed={period === x} onClick={() => setPeriod(x)}>{t(`bud.period.${x}` as MessageKey)}</button>)}
        </div>
      </div>
      <div className="form-grid">
        <label className="field full">{t('tx.category')}
          <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">—</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{categoryLabel(c, t)}</option>)}
          </select>
        </label>
        <label className="field">{period === 'weekly' ? t('bud.weeklyLimit') : t('bud.monthly')}<AmountInput currency={currency} value={amount} onChange={setAmount} /></label>
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
