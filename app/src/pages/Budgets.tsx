import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import type { Budget } from '../data/types';
import { BudgetForm } from '../components/Forms';
import { ExportButton } from '../export/ExportDialog';
import { budgetLines, dedupe, monthRange } from '../lib/finance';
import { formatMoney, formatPercent, localeOf } from '../lib/format';

export function Budgets() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const [offset, setOffset] = useState(0);
  const [editing, setEditing] = useState<Budget | 'new' | null>(null);
  const now = new Date();
  const monthDate = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const range = monthRange(monthDate);
  const lines = useMemo(
    () => budgetLines(data.budgets, data.categories, dedupe(data.transactions), data.wallets, range, profile!.preferredCurrency, data.rates),
    [data, range.from, profile],
  );
  const monthLabel = new Intl.DateTimeFormat(localeOf(lang), { month: 'long', year: 'numeric' }).format(monthDate);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('bud.title')}</h1>
          <div className="row" style={{ gap: 4 }}>
            <button className="btn ghost sm" onClick={() => setOffset(offset - 1)} aria-label="previous">‹</button>
            <span className="small" style={{ fontWeight: 550, minWidth: 130, textAlign: 'center' }}>{monthLabel}</span>
            <button className="btn ghost sm" onClick={() => setOffset(offset + 1)} aria-label="next">›</button>
          </div>
        </div>
        <div className="row">
          <ExportButton context="budgets" defaults={{ preset: offset === 0 ? 'thisMonth' : 'custom', range: { from: range.from, to: range.to }, type: 'expense' }} />
          <button className="btn primary" onClick={() => setEditing('new')}><Plus size={16} />{t('bud.add')}</button>
        </div>
      </div>
      {lines.length === 0 && <div className="card empty">{t('bud.empty')}</div>}
      <div className="grid grid-2">
        {lines.map((l) => (
          <button key={l.budget.id} className="card" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => setEditing(l.budget)}>
            <div className="row between" style={{ marginBottom: 10 }}>
              <span className="row" style={{ fontWeight: 600 }}><i className="swatch" style={{ background: l.category?.color }} />{categoryLabel(l.category, t)}</span>
              <span className={`chip ${l.status === 'onTrack' ? 'ok' : l.status === 'warning' ? 'warn' : 'bad'}`}>{t(`bud.status.${l.status}` as MessageKey)}</span>
            </div>
            <div className={`progress ${l.status}`}><span style={{ width: `${Math.min(100, l.utilization * 100)}%` }} /></div>
            <div className="row between small" style={{ marginTop: 10 }}>
              <span className="muted">{t('bud.spent')} <strong className="num" style={{ color: 'var(--text)' }}>{formatMoney(l.spent, l.budget.currency, lang)}</strong> · {formatPercent(l.utilization, lang)}</span>
              <span className="muted">{l.remaining >= 0 ? t('bud.remaining') : t('bud.over')} <strong className={`num ${l.remaining < 0 ? 'expense' : ''}`}>{formatMoney(Math.abs(l.remaining), l.budget.currency, lang)}</strong></span>
            </div>
            <div className="muted small" style={{ marginTop: 4 }}>{t('bud.monthly')}: {formatMoney(l.limit, l.budget.currency, lang)}</div>
            {l.missing.length > 0 && <div className="banner" style={{ marginTop: 8 }}>{t('common.notConverted', { codes: l.missing.join(', ') })}</div>}
          </button>
        ))}
      </div>
      {editing && <BudgetForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  );
}
