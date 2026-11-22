import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import type { DateRange } from '../lib/finance';
import { PRESETS, presetRange, type RangePreset } from '../lib/ranges';
import { useData } from '../store/DataProvider';

export function RangePicker({ preset, range, onChange }: { preset: RangePreset; range: DateRange; onChange: (p: RangePreset, r: DateRange) => void }) {
  const { t } = useI18n();
  const { transactions } = useData();
  return (
    <div className="stack" style={{ gap: 8 }}>
      <select className="input" value={preset} onChange={(e) => {
        const p = e.target.value as RangePreset;
        onChange(p, p === 'custom' ? range : presetRange(p, transactions));
      }}>
        {PRESETS.map((p) => <option key={p} value={p}>{t(`range.${p}` as MessageKey)}</option>)}
      </select>
      {preset === 'custom' && (
        <div className="row">
          <input className="input" type="date" aria-label={t('common.from')} value={range.from} max={range.to} onChange={(e) => onChange('custom', { ...range, from: e.target.value })} />
          <input className="input" type="date" aria-label={t('common.to')} value={range.to} min={range.from} onChange={(e) => onChange('custom', { ...range, to: e.target.value })} />
        </div>
      )}
    </div>
  );
}
