import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ChevronDown, ChevronRight, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import heroWallet from '../assets/hero-wallet.webp';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import type { Wallet, WalletType } from '../data/types';
import { WalletForm } from '../components/Forms';
import { Money } from '../components/Money';
import { EyeToggle } from '../components/Privacy';
import { useQuickAdd } from '../components/QuickAdd';
import { SegmentBar } from '../components/SegmentBar';
import { ExportButton, ExportIconButton } from '../export/ExportDialog';
import { fillTile, walletIcon } from '../lib/categoryIcons';
import { convert } from '../lib/money';
import { firstOfMonth } from '../lib/periods';
import { pctChange } from '../lib/chart';
import { usePrivacy } from '../components/Privacy';
import { dedupe, walletBalance } from '../lib/finance';
import { formatPercent, toLocalDate } from '../lib/format';
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
  const { hidden } = usePrivacy();
  const [typeFilter, setTypeFilter] = useState<WalletType | 'all'>('all');
  // Net worth at the start of this month, for "vs start of month".
  const monthStart = useMemo(() => {
    const start = firstOfMonth(toLocalDate(new Date()));
    return data.wallets.filter((w) => !w.archived).reduce((a, w) => a + (convert(walletBalance(w, txs, start), w.currency, base, base, data.rates) ?? 0), 0);
  }, [data.wallets, txs, base, data.rates]);
  const change = pctChange(ov.netWorth, monthStart);
  const rows = ov.groups.filter((g) => typeFilter === 'all' || g.type === typeFilter).flatMap((g) => g.rows);
  const activeCount = data.wallets.length - archived.length;

  const parts = ov.groups.filter((g) => g.subtotal > 0).map((g, i) => ({ key: g.type, value: g.subtotal, label: t(`acc.type.${g.type}` as MessageKey), color: `color-mix(in srgb, var(--brand) ${SHADES[i] ?? 12}%, var(--surface))` }));
  const positive = parts.reduce((s, p) => s + p.value, 0);

  const row = (r: WalletRow) => {
    const Icon = walletIcon(r.wallet.type);
    return (
      <Link key={r.wallet.id} to={`/accounts/${r.wallet.id}`} className="list-item wallet-row">
        <span className="tile lg" style={fillTile(r.wallet.color)}><Icon size={21} strokeWidth={2.2} aria-hidden /></span>
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
          {data.wallets.length === 0 && <ExportButton context="accounts" defaults={{ preset: 'all' }} />}
          <button className="btn primary" onClick={() => setEditing('new')} aria-label={t('acc.add')}><Plus size={16} aria-hidden />{t('acc.addShort')}</button>
        </div>
      </div>

      {data.wallets.length === 0 ? (
        <div className="card empty"><p>{t('acc.noWallets')}</p><button className="btn primary" onClick={() => setEditing('new')}><Plus size={16} aria-hidden />{t('acc.add')}</button></div>
      ) : (
        <>
          <div className="chips type-chips" role="group" aria-label={t('acc.filterType')}>
            <button className={`pick${typeFilter === 'all' ? ' on' : ''}`} aria-pressed={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>{t('common.all')} ({activeCount})</button>
            {ov.groups.map((g) => (
              <button key={g.type} className={`pick${typeFilter === g.type ? ' on' : ''}`} aria-pressed={typeFilter === g.type} onClick={() => setTypeFilter(g.type)}>{t(`acc.type.${g.type}` as MessageKey)} ({g.rows.length})</button>
            ))}
          </div>

          <section className="dash-hero nw" aria-label={t('acc.netWorth')}>
            <img className="hero-obj" src={heroWallet} width={480} height={390} alt="" aria-hidden decoding="async" />
            <div className="row between">
              <span className="hero-eyebrow">{t('acc.netWorth')}</span>
              <span className="hero-actions">
                <button className="icon-btn" onClick={() => openAdd({ type: 'transfer' })} disabled={activeCount < 2} aria-label={t('acc.transfer')} title={t('acc.transfer')}><ArrowLeftRight size={19} aria-hidden /></button>
                <ExportIconButton context="accounts" defaults={{ preset: 'all' }} />
                <EyeToggle className="icon-btn" />
              </span>
            </div>
            <Money className="hero-amount" value={ov.netWorth} currency={base} maskable animate />
            {change != null && change !== 0 && !hidden && (
              <span className={`hero-delta ${change > 0 ? 'up' : 'down'}`}>
                {change > 0 ? <TrendingUp size={15} aria-hidden /> : <TrendingDown size={15} aria-hidden />}
                <span className="sr-only">{change > 0 ? t('chart.up') : t('chart.down')}</span>
                {change > 0 ? '+' : '−'}{formatPercent(Math.abs(change), lang)}
                <span className="hero-delta-note">{t('dash.vsMonthStart')}</span>
              </span>
            )}
            <div className="nw-split">
              <span><span className="hero-muted">{t('acc.assets')}</span> <Money className="num" value={ov.assets} currency={base} maskable /></span>
              <span><span className="hero-muted">{t('acc.liabilities')}</span> <Money className="num" value={ov.liabilities} currency={base} maskable /></span>
            </div>
            {ov.missing.length > 0 && <div className="banner" style={{ marginTop: 12 }}>{t('common.notConverted', { codes: ov.missing.join(', ') })}</div>}
            {parts.length > 0 && (
              <div className="nw-comp">
                <SegmentBar parts={parts} label={t('acc.composition')} />
                <ul className="legend-list">
                  {parts.map((p) => <li key={p.key}><i className="swatch" style={{ background: p.color }} /><span>{p.label}</span><span className="hero-muted num">{formatPercent(p.value / positive, lang)}</span></li>)}
                </ul>
              </div>
            )}
          </section>

          <section className="wallet-cards" aria-label={t('acc.title')}>{rows.map(row)}</section>

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
