import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronRight, CircleAlert, Database, Lightbulb, Plus, Wallet as WalletIcon } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n, type TFn } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { GreetingHeader } from '../components/UserIdentity';
import { Money } from '../components/Money';
import { CashflowChart } from '../components/Charts';
import { EyeToggle } from '../components/Privacy';
import { Kpi } from '../components/Kpi';
import { RangeTabs } from '../components/RangeTabs';
import { TxRow } from '../components/TxRow';
import { WalletForm } from '../components/Forms';
import { useQuickAdd } from '../components/QuickAdd';
import { categoryTotals, collapse, dedupe, monthRange, summarize, walletBalance } from '../lib/finance';
import { budgetRows, spanFor } from '../lib/budget';
import { pctChange } from '../lib/chart';
import { convert } from '../lib/money';
import { formatMoney, formatPercent, toLocalDate } from '../lib/format';
import { buildBuckets, flowByBucket, periodTotals, previousSpan, rangeBounds, type ChartRange } from '../lib/periods';
import { walletIcon } from '../lib/categoryIcons';
import type { CurrencyCode, Transaction } from '../data/types';

const RANGE_KEY = 'fa.v1:dashRange';
const readRange = (): ChartRange => { try { const v = localStorage.getItem(RANGE_KEY) as ChartRange; return ['7D', '1M', '3M', '6M', '1Y'].includes(v) ? v : '1M'; } catch { return '1M'; } };

export function Dashboard() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const { openEdit } = useQuickAdd();
  const base = profile!.preferredCurrency;
  const [walletOpen, setWalletOpen] = useState(false);
  const [range, setRangeState] = useState<ChartRange>(readRange);
  const setRange = (r: ChartRange) => { setRangeState(r); try { localStorage.setItem(RANGE_KEY, r); } catch { /* ignore */ } };
  const today = toLocalDate(new Date());

  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);
  const active = useMemo(() => data.wallets.filter((w) => !w.archived), [data.wallets]);

  const balances = useMemo(() => {
    const missing = new Set<CurrencyCode>();
    let total = 0;
    const rows = active.map((w) => {
      const own = walletBalance(w, txs);
      const v = convert(own, w.currency, base, base, data.rates);
      if (v == null) missing.add(w.currency); else total += v;
      return { w, own, converted: v };
    });
    return { rows: rows.sort((a, b) => (b.converted ?? 0) - (a.converted ?? 0)), total, missing: [...missing] };
  }, [active, txs, base, data.rates]);

  // One range drives the summary strip and the chart, so the numbers always agree.
  const span = useMemo(() => rangeBounds(range, today), [range, today]);
  const cur = useMemo(() => periodTotals(txs, data.wallets, span, base, data.rates), [txs, data.wallets, span, base, data.rates]);
  const prev = useMemo(() => periodTotals(txs, data.wallets, previousSpan(span), base, data.rates), [txs, data.wallets, span, base, data.rates]);
  const flow = useMemo(() => flowByBucket(txs, data.wallets, buildBuckets(range, today, lang), base, base, data.rates), [txs, data.wallets, range, today, lang, base, data.rates]);

  const week = profile!.weekStartsOn;
  const budgets = useMemo(() => (['monthly', 'weekly'] as const)
    .flatMap((p) => budgetRows(data.budgets.filter((b) => b.period === p), data.categories, txs, data.wallets, spanFor(p, today, week), base, data.rates))
    .sort((a, b) => b.utilization - a.utilization), [data.budgets, data.categories, txs, data.wallets, today, week, base, data.rates]);
  const recent = useMemo(() => [...txs].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 6), [txs]);
  const insights = useMemo(() => buildInsights(t, lang, txs, data, base, budgets.filter((b) => b.status === 'exceeded').length), [t, lang, txs, data, base, budgets]);
  const missingAll = [...new Set([...balances.missing, ...cur.missing])];

  return (
    <>
      <GreetingHeader />
      {data.wallets.length === 0 ? (
        <div className="card empty">
          <WalletIcon size={36} color="var(--brand)" aria-hidden />
          <h2>{t('dash.empty.title')}</h2>
          <p style={{ maxWidth: 380 }}>{t('dash.empty.body')}</p>
          <div className="row wrap" style={{ justifyContent: 'center' }}>
            <button className="btn primary" onClick={() => setWalletOpen(true)}><Plus size={16} aria-hidden />{t('dash.empty.cta')}</button>
            <button className="btn" onClick={data.loadSample} title={t('dash.sampleHint')}><Database size={16} aria-hidden />{t('dash.sample')}</button>
          </div>
        </div>
      ) : (
        <div className="dash">
         <div className="dash-main">
          {/* 2 · Total balance */}
          <section className="dash-hero" aria-label={t('dash.totalBalance')}>
            <div className="row between">
              <span className="hero-eyebrow">{t('dash.totalBalance')}</span>
              <EyeToggle className="icon-btn hero-eye" />
            </div>
            <Money className="hero-amount" value={balances.total} currency={base} maskable />
            <Link to="/accounts" className="hero-sub">{t('dash.acrossAccounts', { n: active.length })}<ChevronRight size={15} aria-hidden /></Link>
            <div className="hero-wallets">
              {balances.rows.slice(0, 4).map(({ w, own }) => (
                <Link key={w.id} to={`/accounts/${w.id}`} className="wallet-chip"><span className="truncate">{w.name}</span><Money value={own} currency={w.currency} compact maskable /></Link>
              ))}
              {balances.rows.length > 4 && <Link to="/accounts" className="wallet-chip muted">{t('dash.moreWallets', { n: balances.rows.length - 4 })}</Link>}
            </div>
          </section>

          {missingAll.length > 0 && <div className="banner dash-banner">{t('common.notConverted', { codes: missingAll.join(', ') })}</div>}

          {/* 3 · Income & expense summary — scoped by the range */}
          <section className="dash-summary">
            <div className="section-head"><h2>{t('dash.summary')}</h2><RangeTabs value={range} onChange={setRange} /></div>
            <div className="card flush kpi-strip">
              <Kpi label={t('dash.income')} keyColor="var(--chart-income)" value={cur.income} currency={base} change={pctChange(cur.income, prev.income)} upIsGood trend={flow.points.map((p) => p.income)} />
              <Kpi label={t('dash.expense')} keyColor="var(--chart-expense)" value={cur.expense} currency={base} change={pctChange(cur.expense, prev.expense)} upIsGood={false} trend={flow.points.map((p) => p.expense)} />
              <Kpi label={t('dash.net')} keyColor="var(--brand)" value={cur.net} currency={base} sign change={pctChange(cur.net, prev.net)} upIsGood trend={flow.points.map((p) => p.income - p.expense)} />
            </div>
          </section>

          {/* 4 · Cashflow */}
          <section className="dash-chart card">
            <div className="card-head"><h2>{t('dash.cashflow')}</h2><span className="muted small">{t(`range.long.${range}` as MessageKey)}</span></div>
            <CashflowChart points={flow.points} currency={base} />
          </section>

          {/* 6 · Recent transactions */}
          <section className="dash-recent card">
            <div className="card-head"><h2>{t('dash.recent')}</h2><Link className="small link-quiet" to="/transactions">{t('common.viewAll')}</Link></div>
            {recent.length === 0 ? <p className="muted small">{t('dash.noTx')}</p> : <div className="list">{recent.map((tx) => <TxRow key={tx.id} tx={tx} onClick={() => openEdit(tx)} withDate />)}</div>}
          </section>

         </div>
         <div className="dash-aside">
          {/* Desktop-only wallet panel */}
          <section className="dash-wallets card">
            <div className="card-head"><h2>{t('dash.wallets')}</h2><Link className="small link-quiet" to="/accounts">{t('common.viewAll')}</Link></div>
            <div className="list">
              {balances.rows.slice(0, 6).map(({ w, own }) => {
                const Icon = walletIcon(w.type);
                return (
                  <Link key={w.id} to={`/accounts/${w.id}`} className="list-item">
                    <span className="tile sm"><Icon size={16} aria-hidden /></span>
                    <span className="grow"><span className="title" style={{ display: 'block' }}>{w.name}</span><span className="sub" style={{ display: 'block' }}>{t(`acc.type.${w.type}` as MessageKey)}{w.currency !== base ? ` · ${w.currency}` : ''}</span></span>
                    <Money className="amount" value={own} currency={w.currency} maskable />
                  </Link>
                );
              })}
            </div>
          </section>
          {/* 5 · Budget overview */}
          <section className="dash-budget card">
            <div className="card-head"><h2>{t('dash.budgetOverview')}</h2><Link className="small link-quiet" to="/budgets">{t('common.viewAll')}</Link></div>
            {budgets.length === 0 ? <p className="muted small">{t('dash.noBudgets')}</p> : (
              <div className="stack" style={{ gap: 18 }}>
                {budgets.slice(0, 4).map((b) => (
                  <div key={b.budget.id}>
                    <div className="row between small" style={{ marginBottom: 8 }}>
                      <span className="row tight" style={{ fontWeight: 550 }}>
                        {categoryLabel(b.category, t)}
                        {b.budget.period === 'weekly' && <span className="chip">{t('bud.period.weekly')}</span>}
                        {b.status !== 'onTrack' && (
                          <span className={`status-flag ${b.status}`}>
                            {b.status === 'exceeded' ? <CircleAlert size={14} aria-hidden /> : <AlertTriangle size={14} aria-hidden />}
                            <span className="sr-only">{t(`bud.status.${b.status}` as MessageKey)}</span>
                          </span>
                        )}
                      </span>
                      <span className="muted num">{t('bud.of', { spent: formatMoney(b.spent, b.budget.currency, lang, { compact: true }), limit: formatMoney(b.limit, b.budget.currency, lang, { compact: true }) })}</span>
                    </div>
                    <div className={`progress ${b.status}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(b.utilization * 100)} aria-label={categoryLabel(b.category, t)}>
                      <span style={{ width: `${Math.min(100, b.utilization * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 7 · Insights */}
          <section className="dash-insights card">
            <div className="card-head"><h2>{t('dash.insights')}</h2></div>
            <div className="insights">
              {insights.map((s, i) => <div className="insight" key={i}><Lightbulb size={17} aria-hidden /><span>{s}</span></div>)}
            </div>
          </section>

         </div>
        </div>
      )}
      {walletOpen && <WalletForm onClose={() => setWalletOpen(false)} />}
    </>
  );
}

function buildInsights(t: TFn, lang: 'id' | 'en', txs: Transaction[], data: ReturnType<typeof useData>, base: CurrencyCode, exceeded: number): string[] {
  const out: string[] = [];
  const now = new Date();
  const thisM = monthRange(now);
  const lastM = monthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const conv = (totals: Record<string, number>) => collapse(totals, base, base, data.rates).value;
  const s = summarize(txs, data.wallets, thisM);
  const prev = summarize(txs, data.wallets, lastM);
  const inc = conv(s.income), exp = conv(s.expense), prevExp = conv(prev.expense);
  const top = categoryTotals(txs, data.wallets, thisM).filter((c) => c.type === 'expense')[0];
  if (top) out.push(t('insight.topCategory', { category: categoryLabel(data.categories.find((c) => c.id === top.categoryId), t), amount: formatMoney(top.amount, top.currency, lang) }));
  if (prevExp > 0 && exp > 0) {
    const change = (exp - prevExp) / prevExp;
    if (Math.abs(change) >= 0.05) out.push(t(change > 0 ? 'insight.spendUp' : 'insight.spendDown', { pct: formatPercent(Math.abs(change), lang) }));
  }
  if (inc > 0) out.push(exp > inc ? t('insight.negative', { amount: formatMoney(exp - inc, base, lang) }) : t('insight.savingsRate', { pct: formatPercent((inc - exp) / inc, lang) }));
  if (exceeded > 0) out.push(t('insight.budgetExceeded', { n: exceeded }));
  return out.length ? out : [t('insight.none')];
}
