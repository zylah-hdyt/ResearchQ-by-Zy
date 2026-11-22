import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Archive, ArchiveRestore, ArrowLeft, ArrowLeftRight, Pencil, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { TrendChart } from '../components/Charts';
import { WalletForm } from '../components/Forms';
import { Money } from '../components/Money';
import { EyeToggle } from '../components/Privacy';
import { useQuickAdd } from '../components/QuickAdd';
import { RangeTabs } from '../components/RangeTabs';
import { useToast } from '../components/Toast';
import { TxDetail } from '../components/TxDetail';
import { TxRow } from '../components/TxRow';
import { Modal } from '../components/Modal';
import { ExportButton } from '../export/ExportDialog';
import { useConfirm } from '../components/Confirm';
import { walletIcon } from '../lib/categoryIcons';
import { dedupe, effectOn, inRange, walletBalance } from '../lib/finance';
import { formatDate } from '../lib/format';
import { buildBuckets, rangeBounds, type ChartRange } from '../lib/periods';
import { balanceSeries, runningBalances, walletTransactions } from '../lib/wallets';
import { toLocalDate } from '../lib/format';
import { convert } from '../lib/money';
import type { Transaction } from '../data/types';

const PAGE = 100;

/** One wallet: balance, trend, money in/out for the range, and its full history with a running balance. */
export function WalletDetail() {
  const { id } = useParams();
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const { openAdd, openEdit, openDuplicate } = useQuickAdd();
  const toast = useToast();
  const confirm = useConfirm();
  const [range, setRange] = useState<ChartRange>('3M');
  const [editing, setEditing] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const w = data.wallets.find((x) => x.id === id);
  const base = profile!.preferredCurrency;
  const today = toLocalDate(new Date());
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);

  const own = useMemo(() => (w ? walletTransactions(w, txs) : []), [w, txs]);
  const running = useMemo(() => (w ? runningBalances(w, txs) : new Map<string, number>()), [w, txs]);
  const span = useMemo(() => rangeBounds(range, today), [range, today]);
  const series = useMemo(() => (w ? balanceSeries(w, txs, buildBuckets(range, today, lang)) : []), [w, txs, range, today, lang]);
  if (!w) return <Navigate to="/accounts" replace />;

  const balance = walletBalance(w, txs);
  const inRangeTx = own.filter((x) => inRange(x, span));
  const moneyIn = inRangeTx.reduce((s, x) => s + Math.max(0, effectOn(w.id, x)), 0);
  const moneyOut = inRangeTx.reduce((s, x) => s + Math.min(0, effectOn(w.id, x)), 0);
  const Icon = walletIcon(w.type);
  const converted = w.currency !== base ? convert(balance, w.currency, base, base, data.rates) : null;
  const days = new Map<string, Transaction[]>();
  for (const x of own.slice(0, limit)) { const d = x.occurredAt.slice(0, 10); days.set(d, [...(days.get(d) ?? []), x]); }

  const archive = async () => {
    if (!w.archived && !(await confirm({ title: t('acc.archive'), body: t('acc.archiveBody'), confirmLabel: t('acc.archive') }))) return;
    data.saveWallet({ ...w, archived: !w.archived });
    toast(t('common.saved'));
  };
  const remove = async (tx: Transaction) => {
    if (!(await confirm({ title: t('tx.deleteTitle'), body: t('tx.deleteBody'), confirmLabel: t('tx.delete'), danger: true }))) return;
    data.deleteTransaction(tx.id); setSelected(null);
    toast(t('tx.deleted'), { label: t('tx.undo'), onClick: () => { data.restoreTransaction(tx); toast(t('tx.restored')); } });
  };

  return (
    <>
      <div><Link to="/accounts" className="btn ghost sm" style={{ marginLeft: -10 }}><ArrowLeft size={16} aria-hidden />{t('acc.detail.back')}</Link></div>
      <section className="wd-hero">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div className="row">
            <span className="tile lg" style={{ color: w.color, background: `color-mix(in srgb, ${w.color} 16%, var(--surface))` }}><Icon size={24} aria-hidden /></span>
            <div style={{ minWidth: 0 }}><h1 className="wd-name">{w.name}</h1><div className="muted small">{t(`acc.type.${w.type}` as MessageKey)} · {w.currency}{w.archived ? ` · ${t('acc.archived')}` : ''}</div></div>
          </div>
          <div className="row tight">
            <EyeToggle />
            <button className="icon-btn" onClick={() => setEditing(true)} aria-label={t('acc.editWallet')} title={t('acc.editWallet')}><Pencil size={18} aria-hidden /></button>
            <button className="icon-btn" onClick={archive} aria-label={w.archived ? t('acc.unarchive') : t('acc.archive')} title={w.archived ? t('acc.unarchive') : t('acc.archive')}>{w.archived ? <ArchiveRestore size={18} aria-hidden /> : <Archive size={18} aria-hidden />}</button>
          </div>
        </div>
        <Money className="wd-balance" value={balance} currency={w.currency} maskable />
        {converted != null && <div className="muted small"><Money value={converted} currency={base} maskable /></div>}
        <div className="wd-actions">
          <button className="btn primary" onClick={() => openAdd({ walletId: w.id })}><Plus size={16} aria-hidden />{t('acc.addTx')}</button>
          <button className="btn" onClick={() => openAdd({ type: 'transfer', walletId: w.id })} disabled={data.wallets.filter((x) => !x.archived).length < 2}><ArrowLeftRight size={16} aria-hidden />{t('acc.transfer')}</button>
          <ExportButton context="accounts" defaults={{ walletId: w.id, preset: 'all' }} />
        </div>
      </section>

      <section className="card">
        <div className="card-head"><h2>{t('acc.balanceTrend')}</h2><RangeTabs value={range} onChange={setRange} /></div>
        <TrendChart points={series} currency={w.currency} name={t('acc.balanceAfter')} maskable />
        <div className="wd-stats">
          <div><span className="muted small">{t('acc.in')}</span><Money className="num strong income" value={moneyIn} currency={w.currency} /></div>
          <div><span className="muted small">{t('acc.out')}</span><Money className="num strong" value={moneyOut} currency={w.currency} /></div>
          <div><span className="muted small">{t('acc.change')}</span><Money className="num strong" value={moneyIn + moneyOut} currency={w.currency} sign /></div>
        </div>
      </section>

      <section>
        <div className="section-head"><h2>{t('acc.history')}</h2><span className="muted small">{t('tx.count', { n: own.length })}</span></div>
        <div className="card flush tx-list">
          {own.length === 0 && <div className="empty"><p>{t('acc.nothingYet')}</p></div>}
          {[...days.entries()].map(([day, items]) => (
            <div key={day} role="group" aria-label={formatDate(day, lang)}>
              <div className="date-head"><span>{formatDate(day, lang, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div className="list list-pad">{items.map((x) => <TxRow key={x.id} tx={x} forWallet={w.id} balanceAfter={running.get(x.id)} onClick={() => setSelected(x)} />)}</div>
            </div>
          ))}
          {own.length > limit && <div className="row" style={{ justifyContent: 'center', padding: '16px 0' }}><button className="btn" onClick={() => setLimit(limit + PAGE)}>{t('common.showMore')} ({own.length - limit})</button></div>}
        </div>
      </section>
      {selected && <Modal title={t('tx.details')} onClose={() => setSelected(null)}><TxDetail tx={selected} onEdit={() => { openEdit(selected); setSelected(null); }} onDuplicate={() => { openDuplicate(selected); setSelected(null); }} onDelete={() => remove(selected)} /></Modal>}
      {editing && <WalletForm initial={w} onClose={() => setEditing(false)} />}
    </>
  );
}
