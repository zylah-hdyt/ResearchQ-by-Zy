import { useMemo, useState } from 'react';
import { Plus, Archive, ArchiveRestore, Pencil } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import type { Wallet } from '../data/types';
import { WalletForm } from '../components/Forms';
import { Money } from '../components/Money';
import { ExportButton } from '../export/ExportDialog';
import { dedupe, walletBalance } from '../lib/finance';
import { convert } from '../lib/money';
import { formatMoney } from '../lib/format';

export function Accounts() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const [editing, setEditing] = useState<Wallet | 'new' | null>(null);
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);
  const base = profile!.preferredCurrency;
  const active = data.wallets.filter((w) => !w.archived);
  const archived = data.wallets.filter((w) => w.archived);

  const total = active.reduce((acc, w) => {
    const v = convert(walletBalance(w, txs), w.currency, base, base, data.rates);
    return v == null ? acc : acc + v;
  }, 0);

  const card = (w: Wallet) => {
    const bal = walletBalance(w, txs);
    return (
      <div key={w.id} className="card" style={{ borderTop: `4px solid ${w.color}`, opacity: w.archived ? 0.65 : 1 }}>
        <div className="row between">
          <div>
            <div style={{ fontWeight: 600 }}>{w.name}</div>
            <div className="muted small">{t(`acc.type.${w.type}` as MessageKey)} · {w.currency}</div>
          </div>
          <div className="row" style={{ gap: 2 }}>
            <button className="icon-btn" aria-label={t('common.edit')} onClick={() => setEditing(w)}><Pencil size={16} /></button>
            <button className="icon-btn" aria-label={w.archived ? t('acc.unarchive') : t('acc.archive')} title={w.archived ? t('acc.unarchive') : t('acc.archive')}
              onClick={() => data.saveWallet({ ...w, archived: !w.archived })}>
              {w.archived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            </button>
          </div>
        </div>
        <div style={{ marginTop: 14 }} className="muted small">{t('acc.balance')}</div>
        <Money value={bal} currency={w.currency} className={bal < 0 ? 'expense' : ''} />
      </div>
    );
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('acc.title')}</h1>
          <span className="muted small">{t('dash.totalBalance')}: <strong className="num">{formatMoney(total, base, lang)}</strong></span>
        </div>
        <div className="row">
          <ExportButton context="accounts" defaults={{ preset: 'all' }} />
          <button className="btn primary" onClick={() => setEditing('new')}><Plus size={16} />{t('acc.add')}</button>
        </div>
      </div>
      {data.wallets.length === 0 && <div className="card empty">{t('acc.empty')}</div>}
      <div className="grid grid-3">{active.map(card)}</div>
      {archived.length > 0 && (
        <>
          <h2 className="muted">{t('acc.archived')}</h2>
          <div className="grid grid-3">{archived.map(card)}</div>
        </>
      )}
      {editing && <WalletForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  );
}
