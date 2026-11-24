import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ChevronDown, ChevronLeft, ChevronRight, HandCoins, Handshake, Package, Plus, ReceiptText, Store, Wallet as WalletIcon } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { useI18n } from '../i18n';
import type { Wallet } from '../data/types';
import { Modal } from '../components/Modal';
import { AmountInput } from '../components/AmountInput';
import { Money } from '../components/Money';
import { StatTiles } from '../components/StatTiles';
import { EmptyState } from '../components/EmptyState';
import { TxRow } from '../components/TxRow';
import { useQuickAdd } from '../components/QuickAdd';
import { useToast } from '../components/Toast';
import { businessSummary } from '../lib/business';
import { composeNotes, debtLedger, DEBT_KEYS, type DebtEntry, type DebtSide } from '../lib/debts';
import { dedupe, monthRange } from '../lib/finance';
import { fillTile } from '../lib/categoryIcons';
import { formatDate, formatMoney, formatPercent, localeOf, toLocalDate, toLocalDateTime } from '../lib/format';
import { parseAmount, toInputText } from '../lib/money';

type Tab = 'debts' | 'trade';
const TAB_KEY = 'fa.v1:bizTab';
const readTab = (): Tab => { try { return localStorage.getItem(TAB_KEY) === 'trade' ? 'trade' : 'debts'; } catch { return 'debts'; } };

/** Small business (buy & sell) and debts / receivables, both recorded as ordinary transactions. */
export function Business() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>(readTab);
  const pick = (x: Tab) => { setTab(x); try { localStorage.setItem(TAB_KEY, x); } catch { /* ignore */ } };
  return (
    <>
      <div className="page-head"><div><h1>{t('biz.page')}</h1><div className="sub">{t('biz.pageSub')}</div></div></div>
      <div className="segmented fill bud-tabs" role="tablist" aria-label={t('biz.page')}>
        <button role="tab" aria-selected={tab === 'debts'} className={tab === 'debts' ? 'on' : ''} onClick={() => pick('debts')}>{t('biz.tab.debts')}</button>
        <button role="tab" aria-selected={tab === 'trade'} className={tab === 'trade' ? 'on' : ''} onClick={() => pick('trade')}>{t('biz.tab.trade')}</button>
      </div>
      {tab === 'debts' ? <Debts /> : <Trade />}
    </>
  );
}

function Debts() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const base = profile!.preferredCurrency;
  const today = toLocalDate(new Date());
  const [form, setForm] = useState<DebtSide | null>(null);
  const [pay, setPay] = useState<DebtEntry | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [showSettled, setShowSettled] = useState(false);
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);
  const { entries, missing } = useMemo(() => debtLedger(txs, data.wallets, data.categories, base, data.rates), [txs, data.wallets, data.categories, base, data.rates]);
  const openOnes = entries.filter((e) => e.remaining > 0);
  const settled = entries.filter((e) => e.remaining <= 0);
  const owe = openOnes.filter((e) => e.side === 'owe').reduce((a, e) => a + e.remaining, 0);
  const owed = openOnes.filter((e) => e.side === 'owed').reduce((a, e) => a + e.remaining, 0);
  const noWallet = data.wallets.filter((w) => !w.archived).length === 0;

  const card = (e: DebtEntry) => {
    const overdue = e.remaining > 0 && e.due != null && e.due < today;
    const soon = e.remaining > 0 && e.due != null && !overdue && e.due <= toLocalDate(new Date(Date.now() + 7 * 86_400_000));
    const u = e.principal ? Math.min(1, e.paid / e.principal) : 1;
    const expanded = open === e.key;
    return (
      <article key={e.key} className="card debt-card">
        <div className="debt-top">
          <span className="tile lg" style={fillTile(e.side === 'owe' ? '#c2410c' : '#2563c9')}>{e.side === 'owe' ? <HandCoins size={21} aria-hidden /> : <Handshake size={21} aria-hidden />}</span>
          <div className="grow">
            <div className="row between"><strong className="debt-name">{e.name}</strong><span className={`chip ${e.side === 'owe' ? 'warn' : 'brand'}`}>{e.side === 'owe' ? t('biz.iOwe') : t('biz.owesMe')}</span></div>
            <div className="small muted">{e.remaining > 0 ? t('biz.leftOf', { left: formatMoney(e.remaining, base, lang), total: formatMoney(e.principal, base, lang) }) : t('biz.settled')}</div>
          </div>
        </div>
        <div className={`progress ${overdue ? 'exceeded' : ''}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(u * 100)} aria-label={t('biz.paidPct', { pct: formatPercent(u, lang) })}><span style={{ width: `${u * 100}%` }} /></div>
        <div className="row between wrap small">
          <span className="muted">{t('biz.paid')} <strong className="num" style={{ color: 'var(--text)' }}>{formatMoney(e.paid, base, lang)}</strong> · {formatPercent(u, lang)}</span>
          {e.due && e.remaining > 0 && <span className={`row tight ${overdue ? 'bad-text' : soon ? 'warn-text' : 'muted'}`}><CalendarClock size={14} aria-hidden />{overdue ? t('biz.overdue', { date: formatDate(e.due, lang) }) : t('biz.dueOn', { date: formatDate(e.due, lang) })}</span>}
        </div>
        <div className="row wrap">
          {e.remaining > 0 && <button className="btn primary sm" onClick={() => setPay(e)}><Plus size={14} aria-hidden />{e.side === 'owe' ? t('biz.recordRepay') : t('biz.recordCollect')}</button>}
          <button className="btn ghost sm" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : e.key)}><ChevronDown size={14} style={{ transform: expanded ? 'none' : 'rotate(-90deg)' }} aria-hidden />{t('biz.history', { n: e.items.length })}</button>
        </div>
        {expanded && <div className="list">{e.items.map((x) => <TxRow key={x.id} tx={x} withDate />)}</div>}
      </article>
    );
  };

  return (
    <>
      <section className="stat-tiles two" aria-label={t('biz.tab.debts')}>
        <div className="stat-tile expense"><span className="stat-icon" aria-hidden><HandCoins size={18} strokeWidth={2.4} /></span><span className="stat-label">{t('biz.owe')}</span><span className="stat-value"><Money value={owe} currency={base} maskable animate /></span><span className="xs muted">{t('biz.oweHint')}</span></div>
        <div className="stat-tile income"><span className="stat-icon" aria-hidden><Handshake size={18} strokeWidth={2.4} /></span><span className="stat-label">{t('biz.owed')}</span><span className="stat-value"><Money value={owed} currency={base} maskable animate /></span><span className="xs muted">{t('biz.owedHint')}</span></div>
      </section>
      <div className="biz-actions">
        <button className="btn" onClick={() => setForm('owe')} disabled={noWallet}><HandCoins size={16} aria-hidden />{t('biz.borrow')}</button>
        <button className="btn" onClick={() => setForm('owed')} disabled={noWallet}><Handshake size={16} aria-hidden />{t('biz.lend')}</button>
      </div>
      {noWallet && <EmptyState icon={WalletIcon} text={t('biz.needWallet')}><Link className="btn primary" to="/accounts"><Plus size={16} aria-hidden />{t('acc.add')}</Link></EmptyState>}
      {missing.length > 0 && <div className="banner">{t('common.notConverted', { codes: missing.join(', ') })}</div>}
      {openOnes.length === 0 && !noWallet && <EmptyState icon={HandCoins} text={t('biz.noDebts')} />}
      <div className="debt-list">{openOnes.map(card)}</div>
      {settled.length > 0 && (
        <section>
          <button className="btn ghost sm" aria-expanded={showSettled} onClick={() => setShowSettled((v) => !v)}><ChevronDown size={16} style={{ transform: showSettled ? 'none' : 'rotate(-90deg)' }} aria-hidden />{t('biz.settledTitle', { n: settled.length })}</button>
          {showSettled && <div className="debt-list" style={{ marginTop: 8 }}>{settled.map(card)}</div>}
        </section>
      )}
      {form && <DebtForm side={form} onClose={() => setForm(null)} />}
      {pay && <PaymentForm entry={pay} onClose={() => setPay(null)} />}
    </>
  );
}

function useCatId(key: string) {
  const { categories } = useData();
  return categories.find((c) => c.key === key)?.id;
}

function WalletSelect({ wallets, value, onChange }: { wallets: Wallet[]; value: string; onChange: (v: string) => void }) {
  return <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>{wallets.map((w) => <option key={w.id} value={w.id}>{w.name} · {w.currency}</option>)}</select>;
}

/** New loan: who, how much, from/to which wallet, when, due date, note. Saved as a loanIn / loanOut transaction. */
function DebtForm({ side, onClose }: { side: DebtSide; onClose: () => void }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { wallets, saveTransaction } = useData();
  const active = wallets.filter((w) => !w.archived);
  const catId = useCatId(DEBT_KEYS[side].principal);
  const [person, setPerson] = useState('');
  const [walletId, setWalletId] = useState(active[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(toLocalDateTime(new Date()).slice(0, 10));
  const [due, setDue] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const w = wallets.find((x) => x.id === walletId);
  const submit = () => {
    if (!person.trim()) return setErr(t('biz.err.person'));
    if (!w || !catId) return setErr(t('tx.err.wallet'));
    const amt = parseAmount(amount, w.currency, lang);
    if (!(amt > 0)) return setErr(t('tx.err.amount'));
    if (due && due < date) return setErr(t('biz.err.due'));
    saveTransaction({ type: side === 'owe' ? 'income' : 'expense', walletId, categoryId: catId, amount: amt, occurredAt: `${date}T${toLocalDateTime(new Date()).slice(11)}`, description: person.trim(), notes: composeNotes(due || null, note, lang) });
    toast(t('common.saved'));
    onClose();
  };
  return (
    <Modal title={side === 'owe' ? t('biz.borrow') : t('biz.lend')} onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>{t('common.cancel')}</button><button className="btn primary" onClick={submit}>{t('common.save')}</button></>}>
      <div className="form-grid">
        <p className="small muted full" style={{ margin: 0 }}>{side === 'owe' ? t('biz.borrowHint') : t('biz.lendHint')}</p>
        <label className="field full">{side === 'owe' ? t('biz.fromWho') : t('biz.toWho')}<input className="input" value={person} onChange={(e) => setPerson(e.target.value)} placeholder={t('biz.personPh')} autoFocus maxLength={80} /></label>
        <label className="field full amount-field">{t('tx.amount')}{w && ` (${w.currency})`}<AmountInput value={amount} onChange={setAmount} currency={w?.currency ?? 'IDR'} /></label>
        <label className="field">{side === 'owe' ? t('biz.intoWallet') : t('biz.fromWallet')}<WalletSelect wallets={active} value={walletId} onChange={setWalletId} /></label>
        <label className="field">{t('biz.date')}<input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="field"><span>{t('biz.due')} <span className="muted">({t('common.optional')})</span></span><input className="input" type="date" value={due} min={date} onChange={(e) => setDue(e.target.value)} /></label>
        <label className="field full"><span>{t('tx.notes')} <span className="muted">({t('common.optional')})</span></span><input className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} /></label>
        {err && <span className="field-error full" role="alert">{err}</span>}
      </div>
    </Modal>
  );
}

/** Repayment of a debt (debtPaid) or collection of a receivable (debtCollected), same person name. */
function PaymentForm({ entry, onClose }: { entry: DebtEntry; onClose: () => void }) {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { profile } = useAuth();
  const { wallets, saveTransaction } = useData();
  const base = profile!.preferredCurrency;
  const active = wallets.filter((w) => !w.archived || w.id === entry.walletId);
  const catId = useCatId(DEBT_KEYS[entry.side].payment);
  const [walletId, setWalletId] = useState(active.some((w) => w.id === entry.walletId) ? entry.walletId : active[0]?.id ?? '');
  const w = wallets.find((x) => x.id === walletId);
  const [amount, setAmount] = useState(w?.currency === base ? toInputText(entry.remaining, base, lang) : '');
  const [date, setDate] = useState(toLocalDateTime(new Date()).slice(0, 10));
  const [err, setErr] = useState<string | null>(null);
  const submit = () => {
    if (!w || !catId) return setErr(t('tx.err.wallet'));
    const amt = parseAmount(amount, w.currency, lang);
    if (!(amt > 0)) return setErr(t('tx.err.amount'));
    saveTransaction({ type: entry.side === 'owe' ? 'expense' : 'income', walletId, categoryId: catId, amount: amt, occurredAt: `${date}T${toLocalDateTime(new Date()).slice(11)}`, description: entry.name, notes: '' });
    toast(t('common.saved'));
    onClose();
  };
  return (
    <Modal title={`${entry.side === 'owe' ? t('biz.recordRepay') : t('biz.recordCollect')} · ${entry.name}`} onClose={onClose}
      footer={<><button className="btn" onClick={onClose}>{t('common.cancel')}</button><button className="btn primary" onClick={submit}>{t('common.save')}</button></>}>
      <div className="form-grid">
        <p className="small muted full" style={{ margin: 0 }}>{t('biz.leftOf', { left: formatMoney(entry.remaining, base, lang), total: formatMoney(entry.principal, base, lang) })}</p>
        <label className="field full amount-field">{t('tx.amount')}{w && ` (${w.currency})`}<AmountInput value={amount} onChange={setAmount} currency={w?.currency ?? base} autoFocus /></label>
        <label className="field">{entry.side === 'owe' ? t('biz.fromWallet') : t('biz.intoWallet')}<WalletSelect wallets={active} value={walletId} onChange={setWalletId} /></label>
        <label className="field">{t('biz.date')}<input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        {err && <span className="field-error full" role="alert">{err}</span>}
      </div>
    </Modal>
  );
}

function Trade() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const { openAdd } = useQuickAdd();
  const base = profile!.preferredCurrency;
  const [offset, setOffset] = useState(0);
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);
  const now = new Date();
  const monthAt = (k: number) => new Date(now.getFullYear(), now.getMonth() + k, 1);
  const span = monthRange(monthAt(offset));
  const sum = useMemo(() => businessSummary(txs, data.wallets, data.categories, span, base, data.rates), [txs, data.wallets, data.categories, span.from, base, data.rates]); // eslint-disable-line react-hooks/exhaustive-deps
  const history = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = monthAt(offset - i);
    return { d, ...businessSummary(txs, data.wallets, data.categories, monthRange(d), base, data.rates) };
  }), [txs, data.wallets, data.categories, base, data.rates, offset]); // eslint-disable-line react-hooks/exhaustive-deps
  const keys = new Set(['sales', 'stock', 'opex']);
  const catKey = new Map(data.categories.map((c) => [c.id, c.key]));
  const list = txs.filter((x) => x.categoryId && keys.has(catKey.get(x.categoryId) ?? '') && x.occurredAt.slice(0, 10) >= span.from && x.occurredAt.slice(0, 10) <= span.to).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const id = (k: string) => data.categories.find((c) => c.key === k)?.id;
  const monthName = (d: Date) => new Intl.DateTimeFormat(localeOf(lang), { month: 'long', year: 'numeric' }).format(d);
  const margin = sum.sales ? sum.profit / sum.sales : null;
  return (
    <>
      <div className="biz-actions three">
        <button className="btn" onClick={() => openAdd({ type: 'income', categoryId: id('sales') })}><Store size={16} aria-hidden />{t('biz.addSale')}</button>
        <button className="btn" onClick={() => openAdd({ type: 'expense', categoryId: id('stock') })}><Package size={16} aria-hidden />{t('biz.addStock')}</button>
        <button className="btn" onClick={() => openAdd({ type: 'expense', categoryId: id('opex') })}><ReceiptText size={16} aria-hidden />{t('biz.addCost')}</button>
      </div>
      <div className="period-nav">
        <button className="icon-btn" onClick={() => setOffset(offset - 1)} aria-label={t('bud.prev')}><ChevronLeft size={20} aria-hidden /></button>
        <button className="period-pill" onClick={() => setOffset(0)} disabled={offset === 0}>{monthName(monthAt(offset))}</button>
        <button className="icon-btn" onClick={() => setOffset(offset + 1)} aria-label={t('bud.next')} disabled={offset >= 0}><ChevronRight size={20} aria-hidden /></button>
      </div>
      <StatTiles currency={base} label={t('biz.tab.trade')} stats={[
        { kind: 'income', label: t('biz.sales'), value: sum.sales },
        { kind: 'expense', label: t('biz.cost'), value: sum.cost },
        { kind: 'net', label: sum.profit < 0 ? t('biz.loss') : t('biz.profit'), value: sum.profit },
      ]} />
      {margin != null && <p className="small muted" style={{ margin: 0 }}>{t('biz.margin', { pct: formatPercent(margin, lang) })}</p>}
      <section className="card flush" aria-label={t('biz.monthTx')}>
        <div className="day-head"><span>{t('biz.monthTx')}</span><span className="net">{list.length}</span></div>
        {list.length === 0 ? <p className="muted small" style={{ padding: 'var(--s-4)' }}>{t('biz.noTrade')}</p> : <div className="list list-pad">{list.map((x) => <TxRow key={x.id} tx={x} withDate />)}</div>}
      </section>
      <section className="card">
        <div className="card-head"><h2>{t('biz.sixMonths')}</h2></div>
        <div className="table-wrap">
          <table className="data stack-sm">
            <thead><tr><th>{t('rep.month')}</th><th className="r">{t('biz.sales')}</th><th className="r">{t('biz.cost')}</th><th className="r">{t('biz.profit')}</th></tr></thead>
            <tbody>{history.map((h) => (
              <tr key={h.d.toISOString()}>
                <td data-label={t('rep.month')}>{monthName(h.d)}</td>
                <td className="r" data-label={t('biz.sales')}>{formatMoney(h.sales, base, lang)}</td>
                <td className="r" data-label={t('biz.cost')}>{formatMoney(h.cost, base, lang)}</td>
                <td className={`r ${h.profit < 0 ? 'bad-text' : ''}`} data-label={t('biz.profit')}><strong>{formatMoney(h.profit, base, lang, { sign: true })}</strong></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}

