import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, ChevronRight, CircleAlert, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import type { Budget, BudgetPeriod } from '../data/types';
import { BudgetForm } from '../components/Forms';
import { Modal } from '../components/Modal';
import { ExportButton } from '../export/ExportDialog';
import { budgetHistory, budgetRows, budgetTotals, pace, shiftSpan, spanFor, type BudgetRow, type Pace } from '../lib/budget';
import { categoryIcon } from '../lib/categoryIcons';
import { dedupe } from '../lib/finance';
import { formatDate, formatMoney, formatPercent, localeOf, parseLocal, toLocalDate } from '../lib/format';
import type { DateSpan } from '../lib/periods';

const dayShort = (iso: string, lang: 'id' | 'en') => new Intl.DateTimeFormat(localeOf(lang), { day: 'numeric', month: 'short' }).format(parseLocal(iso));

function spanLabel(period: BudgetPeriod, span: DateSpan, lang: 'id' | 'en') {
  if (period === 'monthly') return new Intl.DateTimeFormat(localeOf(lang), { month: 'long', year: 'numeric' }).format(parseLocal(span.from));
  return `${dayShort(span.from, lang)} – ${formatDate(span.to, lang, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/** Meter with severity colour and, for the running period, a tick where spending "should" be by today. */
function Meter({ row, p, label }: { row: BudgetRow; p: Pace | null; label: string }) {
  const { t } = useI18n();
  return (
    <div className={`progress ${row.status}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(row.utilization * 100)} aria-label={label}>
      <span style={{ width: `${Math.min(100, row.utilization * 100)}%` }} />
      {p && <i className="pace" style={{ left: `${(p.elapsedDays / p.totalDays) * 100}%` }} title={t('bud.mark')} />}
    </div>
  );
}

const StatusFlag = ({ row }: { row: BudgetRow }) => {
  const { t } = useI18n();
  if (row.status === 'onTrack') return <span className="chip ok">{t('bud.status.onTrack')}</span>;
  return <span className={`chip ${row.status === 'exceeded' ? 'bad' : 'warn'}`}>{row.status === 'exceeded' ? <CircleAlert size={13} aria-hidden /> : <AlertTriangle size={13} aria-hidden />}{t(`bud.status.${row.status}` as MessageKey)}</span>;
};

export function Budgets() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const nav = useNavigate();
  const base = profile!.preferredCurrency;
  const week = profile!.weekStartsOn;
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<Budget | 'new' | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const today = toLocalDate(new Date());
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);
  const current = spanFor(period, today, week);
  const span = shiftSpan(period, current, offset);
  const isCurrent = offset === 0;

  const rows = useMemo(() => budgetRows(data.budgets.filter((b) => b.period === period), data.categories, txs, data.wallets, span, base, data.rates), [data.budgets, data.categories, txs, data.wallets, period, span.from, base, data.rates]);
  const totals = useMemo(() => budgetTotals(rows, base, data.rates), [rows, base, data.rates]);
  const totalRow: BudgetRow | null = rows.length ? { ...rows[0], limit: totals.limit, spent: totals.spent, remaining: totals.remaining, utilization: totals.utilization, status: totals.status } : null;
  const totalPace = totalRow && isCurrent ? pace(totalRow, today) : null;
  const over = rows.filter((r) => r.status === 'exceeded').length, near = rows.filter((r) => r.status === 'warning').length;
  const money = (v: number, c = base, compact = false) => formatMoney(v, c, lang, { compact });
  const sel = rows.find((r) => r.budget.id === detail) ?? null;

  const card = (r: BudgetRow) => {
    const p = isCurrent ? pace(r, today) : null;
    const Icon = categoryIcon(r.category);
    const cur = r.budget.currency;
    return (
      <button key={r.budget.id} className="card budget-card" onClick={() => setDetail(r.budget.id)}>
        <div className="row between">
          <span className="row"><span className="tile sm"><Icon size={16} aria-hidden /></span><span className="bc-name">{categoryLabel(r.category, t)}</span></span>
          <StatusFlag row={r} />
        </div>
        <Meter row={r} p={p} label={categoryLabel(r.category, t)} />
        <div className="row between small">
          <span className="muted">{t('bud.spent')} <strong className="num" style={{ color: 'var(--text)' }}>{money(r.spent, cur)}</strong> · {formatPercent(r.utilization, lang)}</span>
          <span className={r.remaining < 0 ? 'bad-text' : 'muted'}>{r.remaining >= 0 ? t('bud.remaining') : t('bud.over')} <strong className="num">{money(Math.abs(r.remaining), cur)}</strong></span>
        </div>
        {p && (
          <div className="xs muted bc-pace">
            {p.projected != null && r.limit > 0
              ? <span className={p.projected > r.limit ? 'bad-text' : ''}>{t(p.projected > r.limit ? 'bud.projectedOver' : 'bud.projected', { v: money(p.projected, cur, true) })}</span>
              : <span>{t('bud.dayOf', { d: p.elapsedDays, n: p.totalDays })}</span>}
            {' · '}{r.remaining > 0 ? t('bud.perDay', { v: money(p.dailyAllowance, cur, true) }) : t('bud.daysLeft', { n: p.daysLeft })}
          </div>
        )}
        {r.missing.length > 0 && <div className="banner">{t('common.notConverted', { codes: r.missing.join(', ') })}</div>}
      </button>
    );
  };

  return (
    <>
      <div className="page-head">
        <div><h1>{t('bud.title')}</h1><div className="sub">{spanLabel(period, span, lang)}</div></div>
        <div className="page-actions">
          <ExportButton context="budgets" defaults={{ preset: 'custom', range: span, type: 'expense' }} />
          <button className="btn primary" onClick={() => setEditing('new')}><Plus size={16} aria-hidden />{t('bud.add')}</button>
        </div>
      </div>

      <div className="budget-controls">
        <div className="segmented" role="group" aria-label={t('bud.period')}>
          {(['monthly', 'weekly'] as BudgetPeriod[]).map((x) => <button key={x} className={period === x ? 'on' : ''} aria-pressed={period === x} onClick={() => { setPeriod(x); setOffset(0); }}>{t(`bud.period.${x}` as MessageKey)}</button>)}
        </div>
        <div className="row tight">
          <button className="icon-btn" onClick={() => setOffset(offset - 1)} aria-label={t('bud.prev')}><ChevronLeft size={20} aria-hidden /></button>
          <span className="period-label">{isCurrent ? t('bud.thisPeriod') : spanLabel(period, span, lang)}</span>
          <button className="icon-btn" onClick={() => setOffset(offset + 1)} aria-label={t('bud.next')}><ChevronRight size={20} aria-hidden /></button>
          {!isCurrent && <button className="btn ghost sm" onClick={() => setOffset(0)}>{t('bud.today')}</button>}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card empty"><p>{t('bud.noneThisPeriod', { period: t(`bud.period.${period}` as MessageKey).toLowerCase() })}</p><button className="btn primary" onClick={() => setEditing('new')}><Plus size={16} aria-hidden />{t('bud.add')}</button></div>
      ) : (
        <>
          <section className="card bsum" aria-label={t('bud.summary')}>
            <div className="bsum-top">
              <div>
                <div className="muted small" style={{ fontWeight: 600 }}>{t('bud.summary')}</div>
                <div className={`bsum-amount${totals.remaining < 0 ? ' bad-text' : ''}`}>{money(Math.abs(totals.remaining))}</div>
                <div className="muted small">{totals.remaining >= 0 ? t('bud.leftOf', { v: money(totals.limit) }) : t('bud.overOf', { v: money(totals.limit) })}</div>
              </div>
              <div className="bsum-pct">{formatPercent(totals.utilization, lang)}<span className="xs muted"> {t('bud.ofLimit')}</span></div>
            </div>
            {totalRow && <Meter row={totalRow} p={totalPace} label={t('bud.summary')} />}
            <div className="row between wrap small muted">
              <span>{t('bud.spentOf', { spent: money(totals.spent), limit: money(totals.limit) })}</span>
              {totalPace && <span>{t('bud.dayOf', { d: totalPace.elapsedDays, n: totalPace.totalDays })} · {totals.remaining > 0 ? t('bud.perDay', { v: money(totalPace.dailyAllowance, base, true) }) : t('bud.daysLeft', { n: totalPace.daysLeft })}</span>}
            </div>
            {totalPace?.projected != null && totals.limit > 0 && <div className={`small ${totalPace.projected > totals.limit ? 'bad-text' : 'muted'}`}>{t(totalPace.projected > totals.limit ? 'bud.projectedOver' : 'bud.projected', { v: money(totalPace.projected) })}</div>}
            {(over > 0 || near > 0) && (
              <div className="chips">
                {over > 0 && <span className="chip bad"><CircleAlert size={13} aria-hidden />{t('bud.alertsOver', { n: over })}</span>}
                {near > 0 && <span className="chip warn"><AlertTriangle size={13} aria-hidden />{t('bud.alertsNear', { n: near })}</span>}
              </div>
            )}
            {totals.missing.length > 0 && <div className="banner">{t('common.notConverted', { codes: totals.missing.join(', ') })}</div>}
          </section>

          <div className="budget-grid">{rows.map(card)}</div>

          <section className="card">
            <div className="card-head"><h2>{t('bud.vsActual')}</h2></div>
            <div className="table-wrap">
              <table className="data stack-sm">
                <thead><tr><th>{t('tx.category')}</th><th className="r">{t('bud.limit')}</th><th className="r">{t('bud.actual')}</th><th className="r">{t('bud.diff')}</th><th className="r">%</th></tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.budget.id}>
                      <td data-label={t('tx.category')}>{categoryLabel(r.category, t)}</td>
                      <td className="r" data-label={t('bud.limit')}>{money(r.limit, r.budget.currency)}</td>
                      <td className="r" data-label={t('bud.actual')}>{money(r.spent, r.budget.currency)}</td>
                      <td className={`r ${r.remaining < 0 ? 'bad-text' : ''}`} data-label={t('bud.diff')}>{money(r.remaining, r.budget.currency)}</td>
                      <td className="r" data-label="%">{formatPercent(r.utilization, lang)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {sel && (
        <Modal title={categoryLabel(sel.category, t)} onClose={() => setDetail(null)} wide>
          <BudgetDetail row={sel} onEdit={() => { setDetail(null); setEditing(sel.budget); }} onSee={() => nav('/transactions', { state: { categoryId: sel.budget.categoryId, from: sel.span.from, to: sel.span.to } })} />
        </Modal>
      )}
      {editing && <BudgetForm initial={editing === 'new' ? undefined : editing} defaultPeriod={period} onClose={() => setEditing(null)} />}
    </>
  );
}

function BudgetDetail({ row, onEdit, onSee }: { row: BudgetRow; onEdit: () => void; onSee: () => void }) {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const base = profile!.preferredCurrency;
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);
  const today = toLocalDate(new Date());
  const cur = row.budget.currency;
  const history = useMemo(() => budgetHistory(row.budget, row.category, 6, row.span, txs, data.wallets, base, data.rates), [row, txs, data.wallets, base, data.rates]);
  const p = pace(row, today);
  const top = Math.max(...history.map((h) => Math.max(h.spent, h.limit)), 1);
  const money = (v: number, compact = false) => formatMoney(v, cur, lang, { compact });
  const label = (h: BudgetRow) => (row.budget.period === 'monthly' ? new Intl.DateTimeFormat(localeOf(lang), { month: 'short' }).format(parseLocal(h.span.from)) : dayShort(h.span.from, lang));
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="row between wrap"><span className="chip brand">{t(`bud.period.${row.budget.period}` as MessageKey)} · {money(row.limit)}</span><StatusFlag row={row} /></div>
      <div>
        <Meter row={row} p={p} label={categoryLabel(row.category, t)} />
        <div className="row between small" style={{ marginTop: 10 }}>
          <span className="muted">{t('bud.spent')} <strong className="num" style={{ color: 'var(--text)' }}>{money(row.spent)}</strong> · {formatPercent(row.utilization, lang)}</span>
          <span className={row.remaining < 0 ? 'bad-text' : 'muted'}>{row.remaining >= 0 ? t('bud.remaining') : t('bud.over')} <strong className="num">{money(Math.abs(row.remaining))}</strong></span>
        </div>
        {p && <div className="xs muted" style={{ marginTop: 6 }}>{t('bud.dayOf', { d: p.elapsedDays, n: p.totalDays })}{p.projected != null ? ` · ${t(p.projected > row.limit ? 'bud.projectedOver' : 'bud.projected', { v: money(p.projected, true) })}` : ''}{row.remaining > 0 ? ` · ${t('bud.perDay', { v: money(p.dailyAllowance, true) })}` : ''}</div>}
      </div>
      <div>
        <h3 style={{ marginBottom: 10 }}>{t('bud.history')}</h3>
        <div className="hist" role="img" aria-label={t('bud.history')}>
          {history.map((h) => (
            <div key={h.span.from} className="hist-col" title={`${label(h)}: ${money(h.spent)} / ${money(h.limit)}`}>
              <div className="hist-bar-wrap">
                <i className="hist-limit" style={{ bottom: `${(h.limit / top) * 100}%` }} />
                <span className={`hist-bar ${h.status}`} style={{ height: `${(h.spent / top) * 100}%` }} />
              </div>
              <span className="xs muted">{label(h)}</span>
            </div>
          ))}
        </div>
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="data stack-sm"><thead><tr><th>{t('chart.period')}</th><th className="r">{t('bud.actual')}</th><th className="r">{t('bud.limit')}</th><th className="r">%</th></tr></thead>
            <tbody>{[...history].reverse().map((h) => (
              <tr key={h.span.from}><td data-label={t('chart.period')}>{row.budget.period === 'monthly' ? new Intl.DateTimeFormat(localeOf(lang), { month: 'long', year: 'numeric' }).format(parseLocal(h.span.from)) : `${dayShort(h.span.from, lang)} – ${dayShort(h.span.to, lang)}`}</td>
                <td className="r" data-label={t('bud.actual')}>{money(h.spent)}</td><td className="r" data-label={t('bud.limit')}>{money(h.limit)}</td><td className={`r ${h.utilization > 1 ? 'bad-text' : ''}`} data-label="%">{formatPercent(h.utilization, lang)}</td></tr>
            ))}</tbody></table>
        </div>
      </div>
      <div className="row wrap">
        <button className="btn" onClick={onEdit}>{t('common.edit')}</button>
        <button className="btn" onClick={onSee}>{t('bud.seeTx')}</button>
      </div>
    </div>
  );
}
