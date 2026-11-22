import type { Transaction } from '../data/types';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import { formatDate, formatMoney, formatTime } from '../lib/format';
import { categoryIcon, transferIcon } from '../lib/categoryIcons';

/** One transaction as a list row: icon tile, title, "category · wallet · time", signed amount. */
export function TxRow({ tx, onClick, selected, withDate }: { tx: Transaction; onClick?: () => void; selected?: boolean; withDate?: boolean }) {
  const { t, lang } = useI18n();
  const { wallets, categories } = useData();
  const w = wallets.find((x) => x.id === tx.walletId);
  const to = wallets.find((x) => x.id === tx.toWalletId);
  const cat = categories.find((c) => c.id === tx.categoryId);
  const Icon = tx.type === 'transfer' ? transferIcon : categoryIcon(cat);
  const title = tx.description || (tx.type === 'transfer' ? t('tx.type.transfer') : categoryLabel(cat, t));
  const when = withDate ? `${formatDate(tx.occurredAt, lang, { day: 'numeric', month: 'short' })} · ${formatTime(tx.occurredAt, lang)}` : formatTime(tx.occurredAt, lang);
  const sub = tx.type === 'transfer' ? `${w?.name ?? ''} → ${to?.name ?? ''} · ${when}` : `${categoryLabel(cat, t)} · ${w?.name ?? ''} · ${when}`;
  const tone = tx.type === 'income' ? 'income' : tx.type === 'transfer' ? 'transfer' : '';
  const amount = w ? formatMoney(tx.type === 'expense' ? -tx.amount : tx.amount, w.currency, lang, { sign: tx.type === 'income' }) : '';
  const received = tx.type === 'transfer' && to && w && to.currency !== w.currency && tx.toAmount ? formatMoney(tx.toAmount, to.currency, lang) : null;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`list-item${selected ? ' selected' : ''}`} onClick={onClick} {...(onClick ? { type: 'button' as const } : {})}>
      <span className={`tile ${tone}`} style={tx.type === 'income' ? { color: 'var(--income-ink)', background: 'var(--info-soft)' } : tx.type === 'transfer' ? { color: 'var(--transfer)' } : undefined}><Icon size={18} aria-hidden /></span>
      <span className="grow">
        <span className="title" style={{ display: 'block' }}>{title}</span>
        <span className="sub" style={{ display: 'block' }}>{sub}</span>
      </span>
      <span style={{ textAlign: 'right', flex: 'none' }}>
        <span className={`amount ${tone}`} style={{ display: 'block' }}>{amount}</span>
        {received && <span className="xs muted num" style={{ display: 'block' }}>→ {received}</span>}
      </span>
    </Tag>
  );
}
