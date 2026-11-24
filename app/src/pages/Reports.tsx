import { useMemo, useState } from 'react';
import { BarChart3, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import { DonutChart, FlowAreaChart, RankedBars, TrendChart } from '../components/Charts';
import { StatTiles } from '../components/StatTiles';
import { Money } from '../components/Money';
import { ExportButton } from '../export/ExportDialog';
import { dedupe, walletPeriods } from '../lib/finance';
import { autoBuckets, flowByBucket, periodTotals } from '../lib/periods';
import { categoryBreakdown, compareCategories, comparisonSpan, monthlyComparison } from '../lib/analytics';
import { netWorthSeries } from '../lib/wallets';
import { pctChange } from '../lib/chart';
import { formatMoney, formatPercent, toLocalDate } from '../lib/format';
import { presetRange, type RangePreset } from '../lib/ranges';
import type { MessageKey } from '../i18n/en';

const TABS: RangePreset[] = ['thisMonth', 'last3', 'last6', 'last12', 'custom'];

/** "▲ +12%" / "▼ −8%" with an accessible text; `upIsGood` decides the colour. */
function Delta({ change, upIsGood }: { change: number | null; upIsGood: boolean }) {
  const { t, lang } = useI18n();
  if (change == null) return <span className="muted">{t('rep.new')}</span>;
  if (change === 0) return <span className="muted">{formatPercent(0, lang)}</span>;
  const good = (change > 0) === upIsGood;
  return (
    <span className={good ? 'good' : 'bad'} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {change > 0 ? <TrendingUp size={14} aria-hidden /> : <TrendingDown size={14} aria-hidden />}
      <span className="sr-only">{change > 0 ? t('chart.up') : t('chart.down')}</span>
      {change > 0 ? '+' : '−'}{formatPercent(Math.abs(change), lang)}
    </span>
  );
}

export function Reports() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const base = profile!.preferredCurrency;
  const today = toLocalDate(new Date());
  const [preset, setPreset] = useState<RangePreset>('last3');
  const [range, setRange] = useState(() => presetRange('last3', data.transactions));
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);

  const cur = useMemo(() => periodTotals(txs, data.wallets, range, base, data.rates), [txs, data.wallets, range, base, data.rates]);
  // An unfinished period is compared with an equally long window before it.
  const { current: effective, previous: prevSpan } = comparisonSpan(range, today);
  const prev = useMemo(() => periodTotals(txs, data.wallets, prevSpan, base, data.rates), [txs, data.wallets, prevSpan.from, prevSpan.to, base, data.rates]); // eslint-disable-line react-hooks/exhaustive-deps
  const curCompare = useMemo(() => periodTotals(txs, data.wallets, effective, base, data.rates), [txs, data.wallets, effective.from, effective.to, base, data.rates]); // eslint-disable-line react-hooks/exhaustive-deps

  const buckets = useMemo(() => autoBuckets(range, lang), [range, lang]);
  const flow = useMemo(() => flowByBucket(txs, data.wallets, buckets, base, base, data.rates), [txs, data.wallets, buckets, base, data.rates]);
  const nw = useMemo(() => netWorthSeries(data.wallets, txs, buckets, base, data.rates), [data.wallets, txs, buckets, base, data.rates]);
  const exp = categoryBreakdown(txs, data.wallets, range, 'expense', base, data.rates);
  const inc = categoryBreakdown(txs, data.wallets, range, 'income', base, data.rates);
  const expPrev = categoryBreakdown(txs, data.wallets, prevSpan, 'expense', base, data.rates);
  const compare = compareCategories(exp.slices, expPrev.slices).slice(0, 8);
  const months = useMemo(() => monthlyComparison(txs, data.wallets, effective.to, 6, base, data.rates), [txs, data.wallets, effective.to, base, data.rates]);
  const periods = walletPeriods(data.wallets, txs, range);
  const missing = [...new Set([...cur.missing, ...exp.missing, ...inc.missing, ...nw.missing])];
  const catOf = (id: string) => data.categories.find((c) => c.id === id);
  const money = (v: number, sign = false) => formatMoney(v, base, lang, { sign });
  const spendDelta = pctChange(curCompare.expense, prev.expense);
  const rateDelta = cur.savingRate != null && prev.savingRate != null ? (curCompare.savingRate ?? 0) - prev.savingRate : null;
  const hasData = cur.income > 0 || cur.expense > 0;
  const [allCats, setAllCats] = useState(false);
  const pick = (p: RangePreset) => { setPreset(p); if (p !== 'custom') setRange(presetRange(p, data.transactions)); };

  const rankItems = (slices: typeof exp.slices) => slices.map((s) => ({ key: s.categoryId, label: categoryLabel(catOf(s.categoryId), t), value: s.value, share: s.share }));
  const summary: string[] = [];
  if (hasData) {
    summary.push(t('rep.sum.main', { income: money(cur.income), expense: money(cur.expense), net: money(cur.net, true) }));
    if (cur.net >= 0 && cur.savingRate != null) summary.push(t('rep.sum.saved', { pct: formatPercent(cur.savingRate, lang) }));
    if (cur.net < 0) summary.push(t('rep.sum.overspent', { v: money(-cur.net) }));
    if (exp.slices[0]) summary.push(t('rep.sum.top', { cat: categoryLabel(catOf(exp.slices[0].categoryId), t), v: money(exp.slices[0].value), pct: formatPercent(exp.slices[0].share, lang) }));
    if (spendDelta != null) summary.push(spendDelta === 0 ? t('rep.sum.same') : t(spendDelta > 0 ? 'rep.sum.up' : 'rep.sum.down', { pct: formatPercent(Math.abs(spendDelta), lang) }));
  }

  return (
    <>
      <div className="page-head">
        <div><h1>{t('rep.title')}</h1><span className="muted small">{t('rep.reportingIn', { currency: base })}</span></div>
        <div className="page-actions"><ExportButton context="reports" defaults={{ preset, range }} /></div>
      </div>
      <div className="segmented fill rep-tabs" role="group" aria-label={t('range.label')}>
        {TABS.map((p) => <button key={p} className={preset === p ? 'on' : ''} aria-pressed={preset === p} aria-label={t(`range.${p}` as MessageKey)} onClick={() => pick(p)}>{t(`rep.tab.${p}` as MessageKey)}</button>)}
      </div>
      {preset === 'custom' && (
        <div className="row">
          <input className="input" type="date" aria-label={t('common.from')} value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          <input className="input" type="date" aria-label={t('common.to')} value={range.to} min={range.from} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        </div>
      )}
      {missing.length > 0 && <div className="banner">{t('common.notConverted', { codes: missing.join(', ') })}</div>}

      <StatTiles currency={base} label={t('rep.summary')} stats={[
        { kind: 'income', label: t('dash.income'), value: cur.income, change: pctChange(curCompare.income, prev.income) },
        { kind: 'expense', label: t('dash.expense'), value: cur.expense, change: spendDelta },
        { kind: 'net', label: t('dash.net'), value: cur.net, change: pctChange(curCompare.net, prev.net) },
      ]} />
      <section className="card saving-row" aria-label={t('rep.savingRate')}>
        <span className="row tight"><span className="stat-icon" style={{ background: 'linear-gradient(150deg, #8b7cf6, #5b4fd6)', width: 30, height: 30, margin: 0 }} aria-hidden><PiggyBank size={16} strokeWidth={2.4} /></span><span className="small" style={{ fontWeight: 600 }}>{t('rep.savingRate')}</span></span>
        <span className="row tight small">
          <strong className="num" style={{ fontSize: 'var(--fs-md)' }}>{cur.savingRate == null ? '—' : formatPercent(cur.savingRate, lang)}</strong>
          <span className="muted">{t('rep.ofIncome')}</span>
          {rateDelta != null && <span className="kpi-delta"><Delta change={Math.abs(rateDelta) < 0.0005 ? 0 : rateDelta} upIsGood />{' '}<span className="muted">{t('rep.pts')}</span></span>}
        </span>
      </section>

      {!hasData && (
        <EmptyState icon={BarChart3} title={t('rep.emptyTitle')} text={txs.length ? t('rep.emptyPeriod') : t('rep.emptyBody')}>
          {txs.length > 0 && preset !== 'last12' && <button className="btn" onClick={() => pick('last12')}>{t('rep.tryYear')}</button>}
        </EmptyState>
      )}
      {hasData && (
        <section className="card" aria-label={t('rep.summary')}>
          <div className="card-head"><h2>{t('rep.summary')}</h2></div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{summary.join(' ')}</p>
        </section>
      )}

      {hasData && (<>
      <section className="card"><div className="card-head"><h2>{t('rep.cashTrend')}</h2></div><FlowAreaChart points={flow.points} currency={base} /></section>

      <div className="grid grid-2">
        <section className="card" aria-label={t('rep.byCategory')}>
          <div className="card-head"><h2>{t('rep.byCategory')}</h2></div>
          {exp.slices.length ? (
            <>
              <DonutChart title={t('rep.spending')} total={cur.expense} currency={base} slices={exp.slices.map((s) => ({ key: s.categoryId, label: categoryLabel(catOf(s.categoryId), t), value: s.value, share: s.share, color: catOf(s.categoryId)?.color ?? '#9aa3a0' }))} />
              <button className="btn ghost sm chart-toggle" style={{ marginTop: 10 }} aria-expanded={allCats} onClick={() => setAllCats((v) => !v)}>{allCats ? t('rep.lessCategories') : t('rep.allCategories')}</button>
              {allCats && <div style={{ marginTop: 10 }}><RankedBars tone="expense" currency={base} items={rankItems(exp.slices)} max={99} /></div>}
            </>
          ) : <p className="muted small">{t('rep.noData')}</p>}
        </section>
        <section className="card"><div className="card-head"><h2>{t('rep.incomeByCategory')}</h2></div>{inc.slices.length ? <RankedBars tone="income" currency={base} items={rankItems(inc.slices)} /> : <p className="muted small">{t('rep.noData')}</p>}</section>
      </div>

      <section className="card"><div className="card-head"><h2>{t('rep.netWorthTrend')}</h2></div>
        <TrendChart points={nw.points.map((p) => ({ key: p.key, label: p.label, longLabel: p.longLabel, value: p.value }))} currency={base} name={t('acc.netWorth')} maskable />
      </section>

      {compare.length > 0 && (
        <section className="card">
          <div className="card-head"><h2>{t('rep.compare')}</h2></div>
          <div className="table-wrap">
            <table className="data stack-sm">
              <thead><tr><th>{t('rep.category')}</th><th className="r">{t('rep.thisPeriod')}</th><th className="r">{t('rep.prevPeriod')}</th><th className="r">{t('rep.change')}</th></tr></thead>
              <tbody>
                {compare.map((c) => (
                  <tr key={c.categoryId}>
                    <td data-label={t('rep.category')}>{categoryLabel(catOf(c.categoryId), t)}</td>
                    <td className="r" data-label={t('rep.thisPeriod')}>{money(c.current)}</td>
                    <td className="r" data-label={t('rep.prevPeriod')}>{money(c.previous)}</td>
                    <td className="r" data-label={t('rep.change')}><Delta change={c.change} upIsGood={false} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="card">
        <div className="card-head"><h2>{t('rep.monthly')}</h2></div>
        <div className="table-wrap">
          <table className="data stack-sm">
            <thead><tr><th>{t('rep.month')}</th><th className="r">{t('dash.income')}</th><th className="r">{t('dash.expense')}</th><th className="r">{t('rep.net')}</th><th className="r">{t('rep.savingRate')}</th><th className="r">{t('rep.mom')}</th></tr></thead>
            <tbody>
              {[...months].reverse().map((m) => {
                const label = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' }).format(new Date(m.span.from + 'T00:00'));
                return (
                  <tr key={m.key}>
                    <td data-label={t('rep.month')}>{label}{m.span.to > today && <span className="muted small"> · {t('rep.inProgress')}</span>}</td>
                    <td className="r income" data-label={t('dash.income')}>{money(m.income)}</td>
                    <td className="r expense" data-label={t('dash.expense')}>{money(m.expense)}</td>
                    <td className="r" data-label={t('rep.net')}><strong>{money(m.net, true)}</strong></td>
                    <td className="r" data-label={t('rep.savingRate')}>{m.savingRate == null ? '—' : formatPercent(m.savingRate, lang)}</td>
                    <td className="r" data-label={t('rep.mom')}><Delta change={m.expenseChange} upIsGood={false} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="card-head"><h2>{t('rep.walletMovement')}</h2></div>
        <div className="table-wrap">
          <table className="data stack-sm">
            <thead><tr><th>{t('xl.account')}</th><th className="r">{t('rep.opening')}</th><th className="r">{t('rep.inflow')}</th><th className="r">{t('rep.outflow')}</th><th className="r">{t('rep.closing')}</th></tr></thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.wallet.id}>
                  <td data-label={t('xl.account')}>{p.wallet.name} <span className="muted small">{p.wallet.currency}</span></td>
                  <td className="r" data-label={t('rep.opening')}><Money value={p.opening} currency={p.wallet.currency} /></td>
                  <td className="r income" data-label={t('rep.inflow')}>{formatMoney(p.inflow, p.wallet.currency, lang)}</td>
                  <td className="r expense" data-label={t('rep.outflow')}>{formatMoney(p.outflow ? -p.outflow : 0, p.wallet.currency, lang)}</td>
                  <td className="r" data-label={t('rep.closing')}><strong>{formatMoney(p.closing, p.wallet.currency, lang)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </>)}
    </>
  );
}
