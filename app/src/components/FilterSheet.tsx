import { useMemo, useState } from 'react';
import type { TxType } from '../data/types';
import { useData } from '../store/DataProvider';
import { useAuth } from '../auth/AuthProvider';
import { categoryLabel, useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { parseAmount, toInputText } from '../lib/money';
import { presetRange } from '../lib/ranges';
import { defaultFilters, type TxFilters } from '../lib/txFilter';
import { AmountInput } from './AmountInput';
import { Modal } from './Modal';
import { RangePicker } from './RangePicker';

const TYPES: ('all' | TxType)[] = ['all', 'income', 'expense', 'transfer'];

/** Advanced filters in one compact sheet. Changes apply on "Apply" so the list never jumps while choosing. */
export function FilterSheet({ value, onApply, onClose }: { value: TxFilters; onApply: (f: TxFilters) => void; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const { wallets, categories, transactions } = useData();
  const base = profile!.preferredCurrency;
  const [f, setF] = useState<TxFilters>(value);
  const [min, setMin] = useState(toInputText(value.min ?? undefined, base, lang));
  const [max, setMax] = useState(toInputText(value.max ?? undefined, base, lang));
  const cats = useMemo(() => categories.filter((c) => f.type === 'all' || c.type === (f.type === 'income' ? 'income' : 'expense')), [categories, f.type]);
  const toggle = (key: 'walletIds' | 'categoryIds', id: string) => setF((x) => ({ ...x, [key]: x[key].includes(id) ? x[key].filter((v) => v !== id) : [...x[key], id] }));

  const apply = () => {
    const lo = min ? parseAmount(min, base, lang) : null, hi = max ? parseAmount(max, base, lang) : null;
    onApply({ ...f, categoryIds: f.type === 'transfer' ? [] : f.categoryIds.filter((id) => cats.some((c) => c.id === id)), min: lo, max: hi });
    onClose();
  };
  const reset = () => { const d = defaultFilters(presetRange('thisMonth', transactions)); setF({ ...d, q: f.q }); setMin(''); setMax(''); };

  return (
    <Modal title={t('tx.filterTitle')} onClose={onClose}
      footer={<><button className="btn ghost" style={{ marginRight: 'auto' }} onClick={reset}>{t('common.reset')}</button><button className="btn" onClick={onClose}>{t('common.cancel')}</button><button className="btn primary" onClick={apply}>{t('common.apply')}</button></>}>
      <div className="field">{t('tx.filter.period')}
        <RangePicker preset={f.preset} range={f.range} onChange={(p, r) => setF((x) => ({ ...x, preset: p, range: r }))} />
      </div>
      <div className="field">{t('tx.filter.type')}
        <div className="segmented fill" role="group" aria-label={t('tx.filter.type')}>
          {TYPES.map((x) => <button key={x} className={f.type === x ? 'on' : ''} aria-pressed={f.type === x} onClick={() => setF((s) => ({ ...s, type: x }))}>{x === 'all' ? t('common.all') : t(`tx.type.${x}` as MessageKey)}</button>)}
        </div>
      </div>
      <div className="field">{t('tx.filter.wallets')}
        <div className="chips">
          {wallets.map((w) => <button key={w.id} className={`pick${f.walletIds.includes(w.id) ? ' on' : ''}`} aria-pressed={f.walletIds.includes(w.id)} onClick={() => toggle('walletIds', w.id)}>{w.name}</button>)}
        </div>
      </div>
      {f.type !== 'transfer' && (
        <div className="field">{t('tx.filter.categories')}
          <div className="chips">
            {cats.map((c) => <button key={c.id} className={`pick${f.categoryIds.includes(c.id) ? ' on' : ''}`} aria-pressed={f.categoryIds.includes(c.id)} onClick={() => toggle('categoryIds', c.id)}>{categoryLabel(c, t)}</button>)}
          </div>
        </div>
      )}
      <div className="form-grid">
        <label className="field">{t('tx.filter.min')} ({base})<AmountInput currency={base} value={min} onChange={setMin} /></label>
        <label className="field">{t('tx.filter.max')} ({base})<AmountInput currency={base} value={max} onChange={setMax} /></label>
      </div>
    </Modal>
  );
}
