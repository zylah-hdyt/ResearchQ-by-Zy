import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import type { CurrencyCode } from '../data/types';
import { useI18n } from '../i18n';
import { formatPercent } from '../lib/format';
import { Money } from './Money';
import { Sparkline } from './Charts';

/** Headline figure: label with colour key, value, change versus the previous period, optional trend line. */
export function Kpi({ label, keyColor, value, currency, sign, change, upIsGood, trend, suffix, icon: Icon, iconInk = '#fff' }: {
  label: string; keyColor: string; value: number; currency: CurrencyCode; sign?: boolean;
  change?: number | null; upIsGood?: boolean; trend?: number[]; suffix?: string;
  /** Icon tile in the series colour (replaces the small swatch). */ icon?: LucideIcon; iconInk?: string;
}) {
  const { t, lang } = useI18n();
  const good = change != null && change !== 0 && (change > 0) === upIsGood;
  return (
    <div className="kpi">
      <span className="kpi-label">{Icon ? <span className="kpi-icon" style={{ background: keyColor, color: iconInk }}><Icon size={16} strokeWidth={2.4} aria-hidden /></span> : <i className="swatch" style={{ background: keyColor }} />}{label}</span>
      <Money className="kpi-value" value={value} currency={currency} sign={sign} animate />
      <div className="kpi-foot">
        <div className="kpi-main">
        {suffix && <span className="xs muted">{suffix}</span>}
        {change !== undefined && (
          <span className="kpi-delta">
            {change == null ? <span className="muted">—</span> : change === 0 ? <span className="muted">{formatPercent(0, lang)}</span> : (
              <span className={good ? 'good' : 'bad'}>
                {change > 0 ? <TrendingUp size={14} aria-hidden /> : <TrendingDown size={14} aria-hidden />}
                <span className="sr-only">{change > 0 ? t('chart.up') : t('chart.down')}</span>
                {change > 0 ? '+' : '−'}{formatPercent(Math.abs(change), lang)}
              </span>
            )}
            <span className="muted"> {t('chart.vsPeriod')}</span>
          </span>
        )}
        </div>
        {trend && trend.length > 1 && <Sparkline values={trend} accent={keyColor} label={t('chart.trend')} />}
      </div>
    </div>
  );
}
