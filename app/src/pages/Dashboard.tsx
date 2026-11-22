import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Plus, Lightbulb, Wallet as WalletIcon, Database } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import { GreetingHeader } from '../components/UserIdentity';
import { Money } from '../components/Money';
import { CashflowChart } from '../components/Charts';
import { TransactionForm, WalletForm } from '../components/Forms';
import { budgetLines, cashflowSeries, categoryTotals, collapse, dedupe, monthRange, summarize, walletBalance } from '../lib/finance';
import { convert } from '../lib/money';
import { formatDate, formatMoney, formatPercent, formatTime } from '../lib/format';
import type { CurrencyCode, Transaction } from '../data/types';
import type { TFn } from '../i18n';

export function Dashboard() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const base = profile!.preferredCurrency;
  const [txOpen, setTxOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const txs = useMemo(() => dedupe(data.transactions), [data.transactions]);
  const active = data.wallets.filter((w) => !w.archived);

  const balance = useMemo(() => {
    let value = 0;
    const missing = new Set<CurrencyCode>();
    for (const w of active) {
      const v = convert(walletBalance(w, txs), w.currency, base, base, data.rates);
      if (v == null) missing.add(w.currency);
      else value += v;
    }
    return { value, missing: [...missing] };
  }, [active, txs, base, data.rates]);

  const month = monthRange();
  const sum = summarize(txs, data.wallets, month);
  const income = collapse(sum.income, base, base, data.rates);
  const expense = collapse(sum.expense, base, base, data.rates);
  const net = income.value - expense.value;
  const flow = cashflowSeries(txs, data.wallets, 6, base, base, data.rates);
  const budgets = budgetLines(data.budgets, data.categories, txs, data.wallets, month, base, data.rates)
    .sort((a, b) => b.utilization - a.utilization);
  const recent = [...txs].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 6);
  const insights = buildInsights(t, lang, txs, data, base, budgets.filter((b) => b.status === 'exceeded').length);
  const missingAll = [...new Set([...balance.missing, ...income.missing, ...expense.missing])];

  return (
    <>
      {/* 1. Personalised greeting & identity */}
      <GreetingHeader />

      {data.wallets.length === 0 ? (
        <div className="card empty">
          <WalletIcon size={36} color="var(--brand)" />
          <h2>{t('dash.empty.title')}</h2>
          <p className="muted" style={{ margin: 0, maxWidth: 380 }}>{t('dash.empty.body')}</p>
          <div className="row wrap" style={{ justifyContent: 'center' }}>
            <button className="btn primary" onClick={() => setWalletOpen(true)}><Plus size={16} />{t('dash.empty.cta')}</button>
            <button className="btn" onClick={data.loadSample} title={t('dash.sampleHint')}><Database size={16} />{t('dash.sample')}</button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Total balance */}
          <section className="card balance-card">
            <div className="row between">
              <span className="muted small">{t('dash.totalBalance')}</span>
              <button className="btn sm hide-mobile" style={{ background: 'rgba(255,255,255,.16)', border: 'none', color: '#fff' }} onClick={() => setTxOpen(true)}>
                <Plus size={15} />{t('tx.add')}
              </button>
            </div>
            <div className="balance-value num">{formatMoney(balance.value, base, lang)}</div>
            <span className="muted small">{t('dash.acrossAccounts', { n: active.length })}</span>
            <div className="wallet-pills">
              {active.slice(0, 5).map((w) => (
                <span key={w.id}>{w.name} · {formatMoney(walletBalance(w, txs), w.currency, lang, { compact: true })}</span>
              ))}
            </div>
          </section>
          {missingAll.length > 0 && <div className="banner">{t('common.notConverted', { codes: missingAll.join(', ') })}</div>}

          {/* 3. Income & expense summary */}
          <section className="grid grid-3 stats" aria-label={t('dash.thisMonth')}>
            <Stat label={t('dash.income')} icon={<ArrowDownLeft size={16} />} color="var(--income)" value={income.value} currency={base} hint={t('dash.thisMonth')} />
            <Stat label={t('dash.expense')} icon={<ArrowUpRight size={16} />} color="var(--expense)" value={expense.value} currency={base} hint={t('dash.thisMonth')} />
            <Stat label={t('dash.net')} icon={<ArrowLeftRight size={16} />} color="var(--brand)" value={net} currency={base} hint={t('dash.thisMonth')} sign />
          </section>

          <div className="grid grid-2">
            {/* 4. Cashflow */}
            <section className="card">
              <div className="card-head"><h2>{t('dash.cashflow')}</h2><span className="muted small">{t('dash.last6')}</span></div>
              <CashflowChart points={flow.points} currency={base} />
            </section>

            {/* 5. Budget overview */}
            <section className="card">
              <div className="card-head"><h2>{t('dash.budgetOverview')}</h2><Link className="small muted" to="/budgets">{t('common.viewAll')}</Link></div>
              {budgets.length === 0 ? <p className="muted small">{t('dash.noBudgets')}</p> : (
                <div className="stack">
                  {budgets.slice(0, 4).map((b) => (
                    <div key={b.budget.id}>
                      <div className="row between small" style={{ marginBottom: 6 }}>
                        <span style={{ fontWeight: 550 }}>{categoryLabel(b.category, t)}</span>
                        <span className="muted num">{t('bud.of', { spent: formatMoney(b.spent, b.budget.currency, lang, { compact: true }), limit: formatMoney(b.limit, b.budget.currency, lang, { compact: true }) })}</span>
                      </div>
                      <div className={`progress ${b.status}`}><span style={{ width: `${Math.min(100, b.utilization * 100)}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="grid grid-2">
            {/* 6. Recent transactions */}
            <section className="card">
              <div className="card-head"><h2>{t('dash.recent')}</h2><Link className="small muted" to="/transactions">{t('common.viewAll')}</Link></div>
              {recent.length === 0 ? <p className="muted small">{t('dash.noTx')}</p> : (
                <div className="list">{recent.map((tx) => <TxRow key={tx.id} tx={tx} />)}</div>
              )}
            </section>

            {/* 7. Insights */}
            <section className="card">
              <div className="card-head"><h2>{t('dash.insights')}</h2></div>
              {insights.map((s, i) => (
                <div className="insight" key={i}><Lightbulb size={17} color="var(--brand)" style={{ flex: 'none', marginTop: 2 }} /><span>{s}</span></div>
              ))}
            </section>
          </div>
        </>
      )}

      {data.wallets.length > 0 && <button className="fab" aria-label={t('tx.add')} onClick={() => setTxOpen(true)}><Plus size={24} /></button>}
      {txOpen && <TransactionForm onClose={() => setTxOpen(false)} />}
      {walletOpen && <WalletForm onClose={() => setWalletOpen(false)} />}
    </>
  );
}

function Stat({ label, icon, color, value, currency, hint, sign }: { label: string; icon: React.ReactNode; color: string; value: number; currency: CurrencyCode; hint: string; sign?: boolean }) {
  return (
    <div className="card stat">
      <span className="label"><span className="stat-icon" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>{icon}</span>{label}</span>
      <Money className="value" value={value} currency={currency} sign={sign} />
      <span className="muted small">{hint}</span>
    </div>
  );
}

export function TxRow({ tx, onClick }: { tx: Transaction; onClick?: () => void }) {
  const { t, lang } = useI18n();
  const { wallets, categories } = useData();
  const w = wallets.find((x) => x.id === tx.walletId);
  const to = wallets.find((x) => x.id === tx.toWalletId);
  const cat = categories.find((c) => c.id === tx.categoryId);
  const color = tx.type === 'income' ? 'var(--income)' : tx.type === 'expense' ? (cat?.color ?? 'var(--expense)') : 'var(--transfer)';
  const Icon = tx.type === 'income' ? ArrowDownLeft : tx.type === 'expense' ? ArrowUpRight : ArrowLeftRight;
  const title = tx.description || (tx.type === 'transfer' ? t('tx.type.transfer') : categoryLabel(cat, t));
  const sub = tx.type === 'transfer'
    ? `${w?.name ?? ''} → ${to?.name ?? ''}`
    : `${categoryLabel(cat, t)} · ${w?.name ?? ''}`;
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className="list-item" onClick={onClick}>
      <span className="tx-icon" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}><Icon size={17} /></span>
      <span className="grow">
        <div className="title">{title}</div>
        <div className="sub">{sub} · {formatDate(tx.occurredAt, lang, { day: 'numeric', month: 'short' })} {formatTime(tx.occurredAt, lang)}</div>
      </span>
      {w && (
        <Money className={tx.type} value={tx.type === 'expense' ? -tx.amount : tx.amount} currency={w.currency} sign={tx.type !== 'transfer'} />
      )}
    </Tag>
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
  if (top) {
    const cat = data.categories.find((c) => c.id === top.categoryId);
    out.push(t('insight.topCategory', { category: categoryLabel(cat, t), amount: formatMoney(top.amount, top.currency, lang) }));
  }
  if (prevExp > 0 && exp > 0) {
    const change = (exp - prevExp) / prevExp;
    if (Math.abs(change) >= 0.05) out.push(t(change > 0 ? 'insight.spendUp' : 'insight.spendDown', { pct: formatPercent(Math.abs(change), lang) }));
  }
  if (inc > 0) {
    if (exp > inc) out.push(t('insight.negative', { amount: formatMoney(exp - inc, base, lang) }));
    else out.push(t('insight.savingsRate', { pct: formatPercent((inc - exp) / inc, lang) }));
  }
  if (exceeded > 0) out.push(t('insight.budgetExceeded', { n: exceeded }));
  if (out.length === 0) out.push(t('insight.none'));
  return out;
}
