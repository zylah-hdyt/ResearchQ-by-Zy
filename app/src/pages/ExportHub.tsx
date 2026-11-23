import { useState } from 'react';
import { ChevronRight, FileSpreadsheet, ListOrdered, PieChart, Wallet as WalletIcon, BarChart3 } from 'lucide-react';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { useData } from '../store/DataProvider';
import { ExportDialog, type ExportDefaults } from '../export/ExportDialog';
import type { ExportContext } from '../export/dataset';

const OPTIONS: { key: ExportContext; icon: typeof WalletIcon; title: MessageKey; text: MessageKey; defaults: ExportDefaults }[] = [
  { key: 'transactions', icon: ListOrdered, title: 'hub.tx.title', text: 'hub.tx.text', defaults: { preset: 'thisMonth' } },
  { key: 'reports', icon: BarChart3, title: 'hub.rep.title', text: 'hub.rep.text', defaults: { preset: 'last3' } },
  { key: 'accounts', icon: WalletIcon, title: 'hub.acc.title', text: 'hub.acc.text', defaults: { preset: 'thisMonth' } },
  { key: 'budgets', icon: PieChart, title: 'hub.bud.title', text: 'hub.bud.text', defaults: { preset: 'thisMonth', type: 'expense' } },
];

/** One place for every export. Each card opens the same export dialog with sensible starting choices. */
export function ExportHub() {
  const { t } = useI18n();
  const { transactions } = useData();
  const [open, setOpen] = useState<{ context: ExportContext; defaults: ExportDefaults } | null>(null);
  const sheets: MessageKey[] = ['xl.sheet.summary', 'xl.sheet.transactions', 'xl.sheet.income', 'xl.sheet.expenses', 'xl.sheet.transfers', 'xl.sheet.budget'];
  return (
    <>
      <div className="page-head">
        <div><h1>{t('hub.title')}</h1><div className="sub">{t('hub.sub')}</div></div>
        <div className="page-actions">
          <button className="btn primary" onClick={() => setOpen({ context: 'reports', defaults: { preset: 'thisYear' } })} disabled={transactions.length === 0}>
            <FileSpreadsheet size={16} aria-hidden />{t('hub.year')}
          </button>
        </div>
      </div>
      <section className="hub-grid" aria-label={t('hub.title')}>
        {OPTIONS.map((o) => (
          <button key={o.key} className="card hub-card" onClick={() => setOpen({ context: o.key, defaults: o.defaults })}>
            <span className="tile lg hub-icon"><o.icon size={22} aria-hidden /></span>
            <span className="grow"><span className="hub-title">{t(o.title)}</span><span className="muted small">{t(o.text)}</span></span>
            <ChevronRight size={18} aria-hidden className="muted" />
          </button>
        ))}
      </section>
      <section className="card">
        <div className="card-head"><h2>{t('hub.inside')}</h2></div>
        <ol className="hub-sheets">{sheets.map((s, i) => <li key={s}><span className="num muted">{i + 1}</span>{t(s)}</li>)}</ol>
        <p className="muted small" style={{ marginTop: 12 }}>{t('hub.rules')}</p>
      </section>
      {open && <ExportDialog context={open.context} defaults={open.defaults} onClose={() => setOpen(null)} />}
    </>
  );
}
