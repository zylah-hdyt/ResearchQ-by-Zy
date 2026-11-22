import { useEffect, useRef, useState } from 'react';
import type { CurrencyCode } from '../data/types';
import type { CashflowPoint } from '../lib/finance';
import { formatMoney, localeOf } from '../lib/format';
import { useI18n } from '../i18n';

/** Grouped bars: income vs expense per month. */
export function CashflowChart({ points, currency }: { points: CashflowPoint[]; currency: CurrencyCode }) {
  const { lang, t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = 220, padL = 64, padB = 26, padT = 10;
  const max = Math.max(1, ...points.flatMap((p) => [p.income, p.expense]));
  const nice = niceMax(max);
  const plotW = W - padL - 8;
  const plotH = H - padB - padT;
  const group = plotW / points.length;
  const bw = Math.min(22, group / 3.2);
  const y = (v: number) => padT + plotH - (v / nice) * plotH;
  const ticks = [0, 0.5, 1].map((f) => f * nice);
  const monthName = (k: string) => new Intl.DateTimeFormat(localeOf(lang), { month: 'short' }).format(new Date(Number(k.slice(0, 4)), Number(k.slice(5)) - 1, 1));
  return (
    <div ref={ref}>
      <svg className="chart" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('dash.cashflow')}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - 8} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeDasharray={v ? '3 4' : undefined} />
            <text x={padL - 8} y={y(v) + 4} textAnchor="end">{formatMoney(v, currency, lang, { compact: true })}</text>
          </g>
        ))}
        {points.map((p, i) => {
          const cx = padL + group * i + group / 2;
          return (
            <g key={p.month}>
              <rect x={cx - bw - 2} y={y(p.income)} width={bw} height={Math.max(0, padT + plotH - y(p.income))} rx={4} fill="var(--income)">
                <title>{`${t('dash.income')}: ${formatMoney(p.income, currency, lang)}`}</title>
              </rect>
              <rect x={cx + 2} y={y(p.expense)} width={bw} height={Math.max(0, padT + plotH - y(p.expense))} rx={4} fill="var(--expense)">
                <title>{`${t('dash.expense')}: ${formatMoney(p.expense, currency, lang)}`}</title>
              </rect>
              <text x={cx} y={H - 8} textAnchor="middle">{monthName(p.month)}</text>
            </g>
          );
        })}
      </svg>
      <div className="legend">
        <span><i className="swatch" style={{ background: 'var(--income)' }} />{t('dash.income')}</span>
        <span><i className="swatch" style={{ background: 'var(--expense)' }} />{t('dash.expense')}</span>
      </div>
    </div>
  );
}

function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

/** Donut chart for category shares. */
export function Donut({ items, size = 160 }: { items: { label: string; value: number; color: string }[]; size?: number }) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const r = 60, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" role="img">
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="22" />
      {items.map((it) => {
        const len = (it.value / total) * c;
        const el = (
          <circle key={it.label} cx="80" cy="80" r={r} fill="none" stroke={it.color} strokeWidth="22"
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} transform="rotate(-90 80 80)">
            <title>{it.label}</title>
          </circle>
        );
        acc += len;
        return el;
      })}
    </svg>
  );
}
