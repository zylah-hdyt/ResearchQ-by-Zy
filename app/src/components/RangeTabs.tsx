import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { CHART_RANGES, type ChartRange } from '../lib/periods';

/** 7D / 1M / 3M / 6M / 1Y. Short labels on the buttons, full wording for screen readers. */
export function RangeTabs({ value, onChange }: { value: ChartRange; onChange: (r: ChartRange) => void }) {
  const { t } = useI18n();
  return (
    <div className="segmented" role="group" aria-label={t('range.label')}>
      {CHART_RANGES.map((r) => (
        <button key={r} className={value === r ? 'on' : ''} aria-pressed={value === r} aria-label={t(`range.long.${r}` as MessageKey)} onClick={() => onChange(r)}>
          {t(`range.short.${r}` as MessageKey)}
        </button>
      ))}
    </div>
  );
}
