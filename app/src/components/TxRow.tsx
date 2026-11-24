import type { Transaction } from '../data/types';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import { formatDate, formatMoney, formatTime } from '../lib/format';
import { categoryIcon, fillTile, transferIcon, TRANSFER_COLOR } from '../lib/categoryIcons';
import { effectOn } from '../lib/finance';

/** One transaction as a list row: icon tile, title, "category · wallet · time", signed amount. */
export function TxRow({ tx, onClick, selected, withDate, forWallet, balanceAfter }: { tx: Transaction; onClick?: () => void; selected?: boolean; withDate?: boolean; /** Show the effect on this wallet (signed, in its currency) and the running balance. */ forWallet?: string; balanceAfter?: number }) {
  const { t, lang } = useI18n();
  const { wallets, categories } = useData();
  const w = wallets.find((x) => x.id === tx.walletId);
  const to = wallets.find((x) => x.id === tx.toWalletId);
  const cat = categories.find((c) => c.id === tx.categoryId);
  const Icon = tx.type === 'transfer' ? transferIcon : categoryIcon(cat);
  const title = tx.description || (tx.type === 'transfer' ? t('tx.type.transfer') : categoryLabel(cat, t));
  const own = forWallet ? wallets.find((x) => x.id === forWallet) : undefined;
  const effect = forWallet ? effectOn(forWallet, tx) : 0;
  const when = withDate ? `${formatDate(tx.occurredAt, lang, { day: 'numeric', month: 'short' })} · ${formatTime(tx.occurredAt, lang)}` : formatTime(tx.occurredAt, lang);
  const sub = tx.type === 'transfer' ? (forWallet ? (effect < 0 ? `${t('tx.d.to')} ${to?.name ?? ''}` : `${t('tx.d.from')} ${w?.name ?? ''}`) + ` · ${when}` : `${w?.name ?? ''} → ${to?.name ?? ''} · ${when}`) : `${categoryLabel(cat, t)} · ${w?.name ?? ''} · ${when}`;
  const tone = forWallet ? (effect > 0 ? 'income' : '') : tx.type === 'income' ? 'income' : tx.type === 'transfer' ? 'transfer' : '';
  const amount = own ? formatMoney(effect, own.currency, lang, { sign: true }) : w ? formatMoney(tx.type === 'expense' ? -tx.amount : tx.amount, w.currency, lang, { sign: tx.type === 'income' }) : '';
  const received = tx.type === 'transfer' && to && w && to.currency !== w.currency && tx.toAmount ? formatMoney(tx.toAmount, to.currency, lang) : null;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`list-item${selected ? ' selected' : ''}`} onClick={onClick} {...(onClick ? { type: 'button' as const } : {})}>
      <span className="tile" style={fillTile(tx.type === 'transfer' ? TRANSFER_COLOR : cat?.color ?? '#6b7280')}><Icon size={19} strokeWidth={2.2} aria-hidden /></span>
      <span className="grow">
        <span className="title" style={{ display: 'block' }}>{title}</span>
        <span className="sub" style={{ display: 'block' }}>{sub}</span>
      </span>
      <span style={{ textAlign: 'right', flex: 'none' }}>
        <span className={`amount ${tone}`} style={{ display: 'block' }}>{amount}</span>
        {!forWallet && received && <span className="xs muted num" style={{ display: 'block' }}>→ {received}</span>}
        {forWallet && balanceAfter != null && own && <span className="xs muted num" style={{ display: 'block' }}>{t('acc.balanceAfter')} {formatMoney(balanceAfter, own.currency, lang)}</span>}
      </span>
    </Tag>
  );
}
