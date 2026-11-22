import { Copy, Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../data/types';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { formatDate, formatMoney, formatTime } from '../lib/format';
import { categoryIcon, transferIcon } from '../lib/categoryIcons';

/** Full details of one transaction with Edit / Duplicate / Delete. Used as a side panel (desktop) and inside a sheet (phones). */
export function TxDetail({ tx, onEdit, onDuplicate, onDelete }: { tx: Transaction; onEdit: () => void; onDuplicate: () => void; onDelete: () => void }) {
  const { t, lang } = useI18n();
  const { wallets, categories } = useData();
  const w = wallets.find((x) => x.id === tx.walletId);
  const to = wallets.find((x) => x.id === tx.toWalletId);
  const cat = categories.find((c) => c.id === tx.categoryId);
  const Icon = tx.type === 'transfer' ? transferIcon : categoryIcon(cat);
  const title = tx.description || (tx.type === 'transfer' ? t('tx.type.transfer') : categoryLabel(cat, t));
  const tone = tx.type === 'income' ? 'income' : tx.type === 'transfer' ? 'transfer' : '';
  const amount = w ? formatMoney(tx.type === 'expense' ? -tx.amount : tx.amount, w.currency, lang, { sign: tx.type === 'income' }) : '';
  const rows: [MessageKey, string | null][] = [
    ['tx.d.when', `${formatDate(tx.occurredAt, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${formatTime(tx.occurredAt, lang)}`],
    ...(tx.type === 'transfer'
      ? ([['tx.d.from', w ? `${w.name} (${w.currency})` : null], ['tx.d.to', to ? `${to.name} (${to.currency})` : null], ['tx.d.received', to && tx.toAmount ? formatMoney(tx.toAmount, to.currency, lang) : null]] as [MessageKey, string | null][])
      : ([['tx.d.category', cat ? categoryLabel(cat, t) : null], ['tx.d.wallet', w ? `${w.name} (${w.currency})` : null]] as [MessageKey, string | null][])),
    ['tx.d.notes', tx.notes || null],
    ['tx.d.added', formatDate(tx.createdAt.slice(0, 10) || tx.occurredAt, lang, { day: 'numeric', month: 'short', year: 'numeric' })],
  ];
  return (
    <div className="tx-detail">
      <div className="tx-detail-head">
        <span className="tile lg" style={tx.type === 'income' ? { color: 'var(--income-ink)', background: 'var(--info-soft)' } : tx.type === 'transfer' ? { color: 'var(--transfer)' } : undefined}><Icon size={22} aria-hidden /></span>
        <div style={{ minWidth: 0 }}>
          <div className="chip">{t(`tx.type.${tx.type}` as MessageKey)}</div>
          <h2 className="tx-detail-title">{title}</h2>
        </div>
      </div>
      <div className={`tx-detail-amount ${tone}`}>{amount}</div>
      <dl className="detail-list">
        {rows.filter(([, v]) => v).map(([k, v]) => (<div key={k}><dt>{t(k)}</dt><dd>{v}</dd></div>))}
      </dl>
      <div className="tx-detail-actions">
        <button className="btn" onClick={onEdit}><Pencil size={16} aria-hidden />{t('common.edit')}</button>
        <button className="btn" onClick={onDuplicate}><Copy size={16} aria-hidden />{t('tx.duplicate').replace(/ transaksi| transaction/i, '')}</button>
        <button className="btn danger" onClick={onDelete}><Trash2 size={16} aria-hidden />{t('tx.delete')}</button>
      </div>
    </div>
  );
}
