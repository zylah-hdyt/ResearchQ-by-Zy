import { ArrowDownToLine, ArrowUpRight, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import type { CurrencyCode } from '../data/types';
import { useI18n } from '../i18n';
import { formatPercent } from '../lib/format';
import { Money } from './Money';

export interface Stat {
  kind: 'income' | 'expense' | 'net';
  label: string;
  value: number;
  /** Change versus the comparable period (fraction), when known. */
  change?: number | null;
}

const ICON: Record<Stat['kind'], LucideIcon> = { income: ArrowDownToLine, expense: ArrowUpRight, net: TrendingUp };
const GOOD_UP: Record<Stat['kind'], boolean> = { income: true, expense: false, net: true };

/** Three headline tiles (income · expense · net): icon container, label, amount, optional change. */
export function StatTiles({ stats, currency, label }: { stats: Stat[]; currency: CurrencyCode; label: string }) {
  const { t, lang } = useI18n();
  return (
    <div className="stat-tiles" role="group" aria-label={label}>
      {stats.map((s) => {
        const Icon = ICON[s.kind];
        const up = s.change != null && s.change > 0;
        const good = s.change != null && s.change !== 0 && up === GOOD_UP[s.kind];
        return (
          <div key={s.kind} className={`stat-tile ${s.kind}`}>
            <span className="stat-icon" aria-hidden><Icon size={18} strokeWidth={2.4} /></span>
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">
              <Money className="st-full" value={s.value} currency={currency} sign={s.kind === 'net'} animate />
              <Money className="st-short" value={s.value} currency={currency} sign={s.kind === 'net'} compact />
            </span>
            {s.change !== undefined && (
              <span className={`stat-delta ${s.change == null || s.change === 0 ? 'flat' : good ? 'good' : 'bad'}`}>
                {s.change == null ? '—' : s.change === 0 ? formatPercent(0, lang) : (
                  <>{up ? <TrendingUp size={13} aria-hidden /> : <TrendingDown size={13} aria-hidden />}
                    <span className="sr-only">{up ? t('chart.up') : t('chart.down')} {t('chart.vsPeriod')}</span>
                    {up ? '+' : '−'}{formatPercent(Math.abs(s.change), lang)}</>
                )}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
