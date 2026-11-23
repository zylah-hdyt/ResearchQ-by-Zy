import { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Share2, CheckCircle2, XCircle } from 'lucide-react';
import { CURRENCIES, type CurrencyCode, type TxType } from '../data/types';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { Modal } from '../components/Modal';
import { RangePicker } from '../components/RangePicker';
import { presetRange, type RangePreset } from '../lib/ranges';
import { formatDate, formatMoney } from '../lib/format';
import { buildDataset, type ExportContext, type ExportOptions } from './dataset';
import { generateFile } from './generate';
import { canShareFile, downloadBlob, shareFile } from './share';

type Phase = 'options' | 'preview' | 'loading' | 'success' | 'error';

export interface ExportDefaults {
  preset?: RangePreset;
  range?: ExportOptions['range'];
  type?: ExportOptions['type'];
  categoryId?: string;
  walletId?: string;
}

/** Export flow: choose data → preview summary → generate → download / share. */
export function ExportDialog({ defaults, onClose }: { context: ExportContext; defaults?: ExportDefaults; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const [phase, setPhase] = useState<Phase>('options');
  const [preset, setPreset] = useState<RangePreset>(defaults?.preset ?? 'thisMonth');
  const [opts, setOpts] = useState<ExportOptions>(() => ({
    range: defaults?.range ?? presetRange(defaults?.preset ?? 'thisMonth', data.transactions),
    type: defaults?.type ?? 'all',
    categoryId: defaults?.categoryId ?? 'all',
    walletId: defaults?.walletId ?? 'all',
    currency: 'original',
    format: 'xlsx',
  }));
  const [file, setFile] = useState<{ blob: Blob; filename: string } | null>(null);
  const set = (p: Partial<ExportOptions>) => setOpts((o) => ({ ...o, ...p }));

  // Built once when leaving the options step, not again on every phase change (it is the slow part on large data).
  const inOptions = phase === 'options';
  const dataset = useMemo(() => (inOptions ? null : buildDataset(data, profile!, opts)), [inOptions, data, profile, opts]);
  const catsForType = data.categories.filter((c) => opts.type === 'all' || opts.type === c.type);
  const usedCurrencies = [...new Set(data.wallets.map((w) => w.currency))];

  const generate = async () => {
    if (!dataset) return;
    setPhase('loading');
    try {
      const f = await generateFile(dataset);
      setFile(f);
      setPhase('success');
      // Desktop: download right away. Mobile: let the user pick share or download.
      if (!canShareFile(f.blob, f.filename)) downloadBlob(f.blob, f.filename);
    } catch (e) {
      console.error(e);
      setPhase('error');
    }
  };

  const sheets: MessageKey[] = opts.format === 'xlsx'
    ? ['xl.sheet.summary', 'xl.sheet.transactions', 'xl.sheet.income', 'xl.sheet.expenses', 'xl.sheet.transfers', 'xl.sheet.budget']
    : ['xl.sheet.transactions'];

  let body: React.ReactNode;
  let footer: React.ReactNode;

  if (phase === 'options') {
    body = (
      <>
        <Steps step={0} />
        <div className="form-grid">
          <div className="field full">{t('export.dateRange')}
            <RangePicker preset={preset} range={opts.range} onChange={(p, r) => { setPreset(p); set({ range: r }); }} />
          </div>
          <label className="field">{t('export.txType')}
            <select className="input" value={opts.type} onChange={(e) => set({ type: e.target.value as 'all' | TxType, categoryId: 'all' })}>
              <option value="all">{t('common.all')}</option>
              {(['income', 'expense', 'transfer'] as TxType[]).map((x) => <option key={x} value={x}>{t(`tx.type.${x}` as MessageKey)}</option>)}
            </select>
          </label>
          <label className="field">{t('export.category')}
            <select className="input" value={opts.categoryId} disabled={opts.type === 'transfer'} onChange={(e) => set({ categoryId: e.target.value })}>
              <option value="all">{t('common.all')}</option>
              {catsForType.map((c) => <option key={c.id} value={c.id}>{categoryLabel(c, t)}</option>)}
            </select>
          </label>
          <label className="field">{t('export.wallet')}
            <select className="input" value={opts.walletId} onChange={(e) => set({ walletId: e.target.value })}>
              <option value="all">{t('common.all')}</option>
              {data.wallets.map((w) => <option key={w.id} value={w.id}>{w.name} · {w.currency}</option>)}
            </select>
          </label>
          <label className="field">{t('export.currency')}
            <select className="input" value={opts.currency} onChange={(e) => set({ currency: e.target.value as ExportOptions['currency'] })}>
              <option value="original">{t('export.currency.original')}</option>
              {CURRENCIES.filter((c) => c === profile!.preferredCurrency || usedCurrencies.includes(c) || data.rates.some((r) => r.code === c))
                .map((c) => <option key={c} value={c}>{t('export.currency.convert', { code: c })}</option>)}
            </select>
          </label>
          <label className="field full">{t('export.format')}
            <select className="input" value={opts.format} onChange={(e) => set({ format: e.target.value as 'xlsx' | 'csv' })}>
              <option value="xlsx">{t('export.format.xlsx')}</option>
              <option value="csv">{t('export.format.csv')}</option>
            </select>
          </label>
        </div>
      </>
    );
    footer = <>
      <button className="btn" onClick={onClose}>{t('common.cancel')}</button>
      <button className="btn primary" onClick={() => setPhase('preview')} disabled={opts.range.from > opts.range.to}>{t('common.next')}</button>
    </>;
  } else if (phase === 'preview' && dataset) {
    body = (
      <>
        <Steps step={1} />
        <h3 style={{ fontSize: '.95rem' }}>{t('export.summary')}</h3>
        <table className="summary-table"><tbody>
          <tr><td>{t('export.period')}</td><td>{formatDate(opts.range.from, lang)} – {formatDate(opts.range.to, lang)}</td></tr>
          <tr><td>{t('export.records')}</td><td>{dataset.rows.length}</td></tr>
          {dataset.blocks.filter((b) => b.income || b.expense || dataset.blocks.length === 1).map((b) => (
            <tr key={b.currency}><td>{t('xl.totalIncome')} / {t('xl.totalExpenses')} ({b.currency})</td>
              <td><span className="income">{formatMoney(b.income, b.currency, lang)}</span> / <span className="expense">{formatMoney(b.expense, b.currency, lang)}</span></td></tr>
          ))}
          {dataset.blocks.filter((b) => b.income || b.expense || dataset.blocks.length === 1).map((b) => (
            <tr key={`n${b.currency}`}><td>{t('xl.netCashflow')} ({b.currency})</td><td>{formatMoney(b.net, b.currency, lang, { sign: true })}</td></tr>
          ))}
          <tr><td>{t('export.format')}</td><td>{opts.format.toUpperCase()}</td></tr>
          <tr><td>{t('export.sheets')}</td><td>{sheets.map((s) => t(s)).join(', ')}</td></tr>
        </tbody></table>
        {dataset.rows.length === 0 && <div className="banner">{t('export.empty')}</div>}
        {dataset.missingRates.length > 0 && <div className="banner">{t('export.missingRates', { codes: dataset.missingRates.join(', ') })}</div>}
      </>
    );
    footer = <>
      <button className="btn" onClick={() => setPhase('options')}>{t('common.back')}</button>
      <button className="btn primary" onClick={generate}><Download size={16} />{t('export.generate')}</button>
    </>;
  } else if (phase === 'loading') {
    body = <div className="state" aria-live="polite"><div className="spinner" /><span>{t('export.generating')}</span></div>;
  } else if (phase === 'success' && file) {
    const shareable = canShareFile(file.blob, file.filename);
    body = (
      <div className="state" aria-live="polite">
        <CheckCircle2 size={40} color="var(--income)" />
        <strong>{t('export.success')}</strong>
        <span className="muted small row"><FileSpreadsheet size={16} />{file.filename}</span>
      </div>
    );
    footer = <>
      <button className="btn" onClick={() => downloadBlob(file.blob, file.filename)}><Download size={16} />{t('export.downloadAgain')}</button>
      {shareable && <button className="btn primary" onClick={() => shareFile(file.blob, file.filename, t('xl.title'))}><Share2 size={16} />{t('export.share')}</button>}
      {!shareable && <button className="btn primary" onClick={onClose}>{t('common.close')}</button>}
    </>;
  } else {
    body = <div className="state" role="alert"><XCircle size={40} color="var(--danger)" /><strong>{t('export.error')}</strong></div>;
    footer = <>
      <button className="btn" onClick={onClose}>{t('common.close')}</button>
      <button className="btn primary" onClick={generate}>{t('export.retry')}</button>
    </>;
  }

  return <Modal title={<span className="row"><FileSpreadsheet size={18} />{t('export.title')}</span>} onClose={onClose} footer={footer}>{body}</Modal>;

}

function Steps({ step }: { step: number }) {
  const { t } = useI18n();
  return (
    <div className="steps">
      <span className={step === 0 ? 'on' : ''}>1. {t('export.step.data')}</span>
      <span>›</span>
      <span className={step === 1 ? 'on' : ''}>2. {t('export.step.preview')}</span>
    </div>
  );
}

export function ExportButton({ context, defaults }: { context: ExportContext; defaults?: ExportDefaults }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn" onClick={() => setOpen(true)} aria-haspopup="dialog"><Download size={16} />{t('export.button')}</button>
      {open && <ExportDialog context={context} defaults={defaults} onClose={() => setOpen(false)} />}
    </>
  );
}

export type { CurrencyCode };
