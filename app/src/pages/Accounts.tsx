import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import type { Wallet } from '../data/types';
import { WalletForm } from '../components/Forms';
import { Money } from '../components/Money';
import { EyeToggle } from '../components/Privacy';
import { useQuickAdd } from '../components/QuickAdd';
import { SegmentBar } from '../components/SegmentBar';
import { ExportButton } from '../export/ExportDialog';
import { walletIcon } from '../lib/categoryIcons';
import { dedupe, walletBalance } from '../lib/finance';
import { formatPercent } from '../lib/format';
import { walletOverview, type WalletRow } from '../lib/wallets';

const SHADES = [100, 75, 55, 38, 26, 18, 12];

export function Accounts() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const { openAdd } = useQuickAdd();
  const base = profile!.preferredCurrency;
  const [editing, setEditing] = useState<Wallet | 'new' | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);
  const ov = useMemo(() => walletOverview(data.wallets, txs, base, data.rates), [data.wallets, txs, base, data.rates]);
  const archived = data.wallets.filter((w) => w.archived);
  const activeCount = data.wallets.length - archived.length;

  const parts = ov.groups.filter((g) => g.subtotal > 0).map((g, i) => ({ key: g.type, value: g.subtotal, label: t(`acc.type.${g.type}` as MessageKey), color: `color-mix(in srgb, var(--brand) ${SHADES[i] ?? 12}%, var(--surface))` }));
  const positive = parts.reduce((s, p) => s + p.value, 0);

  const row = (r: WalletRow) => {
    const Icon = walletIcon(r.wallet.type);
    return (
      <Link key={r.wallet.id} to={`/accounts/${r.wallet.id}`} className="list-item wallet-row">
        <span className="tile" style={{ color: r.wallet.color, background: `color-mix(in srgb, ${r.wallet.color} 14%, var(--surface))` }}><Icon size={19} aria-hidden /></span>
        <span className="grow"><span className="title" style={{ display: 'block' }}>{r.wallet.name}</span><span className="sub" style={{ display: 'block' }}>{t(`acc.type.${r.wallet.type}` as MessageKey)} · {r.wallet.currency}</span></span>
        <span style={{ textAlign: 'right' }}>
          <Money className={`amount${r.balance < 0 ? ' neg' : ''}`} value={r.balance} currency={r.wallet.currency} maskable />
          {r.wallet.currency !== base && r.converted != null && <Money className="xs muted" value={r.converted} currency={base} maskable />}
        </span>
        <ChevronRight size={16} className="chev" aria-hidden />
      </Link>
    );
  };

  return (
    <>
      <div className="page-head">
        <div><h1>{t('acc.title')}</h1><div className="sub">{t('acc.count', { n: activeCount })}</div></div>
        <div className="page-actions">
          <ExportButton context="accounts" defaults={{ preset: 'all' }} />
          <button className="btn" onClick={() => openAdd({ type: 'transfer' })} disabled={activeCount < 2}><ArrowLeftRight size={16} aria-hidden />{t('acc.transfer')}</button>
          <button className="btn primary" onClick={() => setEditing('new')}><Plus size={16} aria-hidden />{t('acc.add')}</button>
        </div>
      </div>

      {data.wallets.length === 0 ? (
        <div className="card empty"><p>{t('acc.noWallets')}</p><button className="btn primary" onClick={() => setEditing('new')}><Plus size={16} aria-hidden />{t('acc.add')}</button></div>
      ) : (
        <>
          <section className="card nw">
            <div className="row between"><span className="muted small" style={{ fontWeight: 600 }}>{t('acc.netWorth')}</span><EyeToggle /></div>
            <Money className="nw-amount" value={ov.netWorth} currency={base} maskable />
            <div className="nw-split">
              <span><span className="muted">{t('acc.assets')}</span> <Money className="num" value={ov.assets} currency={base} maskable /></span>
              <span><span className="muted">{t('acc.liabilities')}</span> <Money className="num" value={ov.liabilities} currency={base} maskable /></span>
            </div>
            {ov.missing.length > 0 && <div className="banner" style={{ marginTop: 12 }}>{t('common.notConverted', { codes: ov.missing.join(', ') })}</div>}
            {parts.length > 0 && (
              <div className="nw-comp">
                <div className="muted small" style={{ fontWeight: 600, marginBottom: 8 }}>{t('acc.composition')}</div>
                <SegmentBar parts={parts} label={t('acc.composition')} />
                <ul className="legend-list">
                  {parts.map((p) => <li key={p.key}><i className="swatch" style={{ background: p.color }} /><span>{p.label}</span><span className="muted num">{formatPercent(p.value / positive, lang)}</span></li>)}
                </ul>
              </div>
            )}
          </section>

          {ov.groups.map((g) => (
            <section key={g.type} aria-label={t(`acc.type.${g.type}` as MessageKey)}>
              <div className="section-head"><h2>{t(`acc.type.${g.type}` as MessageKey)}</h2><Money className="num muted small" value={g.subtotal} currency={base} maskable /></div>
              <div className="card flush list-pad-sm">{g.rows.map(row)}</div>
            </section>
          ))}

          {archived.length > 0 && (
            <section>
              <button className="btn ghost sm" aria-expanded={showArchived} onClick={() => setShowArchived((v) => !v)}>
                <ChevronDown size={16} style={{ transform: showArchived ? 'none' : 'rotate(-90deg)' }} aria-hidden />{t('acc.archivedTitle', { n: archived.length })}
              </button>
              {showArchived && (
                <div className="card flush list-pad-sm" style={{ marginTop: 8 }}>
                  {archived.map((w) => row({ wallet: w, balance: walletBalance(w, txs), converted: null }))}
                </div>
              )}
            </section>
          )}
        </>
      )}
      {editing && <WalletForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  );
}
