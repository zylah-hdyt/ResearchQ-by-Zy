import { useEffect, useRef, useState } from 'react';
import type { CurrencyCode } from '../data/types';
import type { CashflowPoint } from '../lib/finance';
import { barPath, niceTicks } from '../lib/chart';
import { formatMoney, localeOf } from '../lib/format';
import { useI18n } from '../i18n';

/**
 * Income vs expense per month. One axis, thin bars (≤ 24px) with 4px rounded ends on a single baseline,
 * 2px surface gap between the pair, hairline solid grid, hover/focus tooltip listing every series,
 * a legend, and a table view as the accessible twin.
 */
export function CashflowChart({ points, currency }: { points: CashflowPoint[]; currency: CurrencyCode }) {
  const { lang, t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const [table, setTable] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 236, padL = 64, padR = 6, padB = 28, padT = 12;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const base = padT + plotH;
  const max = Math.max(1, ...points.flatMap((p) => [p.income, p.expense]));
  const { ticks, top } = niceTicks(max);
  const y = (v: number) => padT + plotH - (v / top) * plotH;
  const slot = plotW / points.length;
  const bw = Math.max(6, Math.min(24, slot / 2 - 8));
  const gap = 2;
  const monthShort = (k: string) => new Intl.DateTimeFormat(localeOf(lang), { month: 'short' }).format(new Date(Number(k.slice(0, 4)), Number(k.slice(5)) - 1, 1));
  const monthLong = (k: string) => new Intl.DateTimeFormat(localeOf(lang), { month: 'long', year: 'numeric' }).format(new Date(Number(k.slice(0, 4)), Number(k.slice(5)) - 1, 1));
  const money = (v: number) => formatMoney(v, currency, lang);
  const tip = active != null ? points[active] : null;
  const tipX = active != null ? Math.min(Math.max(padL + slot * active + slot / 2, 96), W - 96) : 0;

  return (
    <div ref={ref} className="chart-wrap">
      {table ? (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>{t('chart.month')}</th><th className="r">{t('dash.income')}</th><th className="r">{t('dash.expense')}</th><th className="r">{t('chart.net')}</th></tr></thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.month}>
                  <td>{monthLong(p.month)}</td>
                  <td className="r">{money(p.income)}</td>
                  <td className="r">{money(p.expense)}</td>
                  <td className="r"><strong>{formatMoney(p.income - p.expense, currency, lang, { sign: true })}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ position: 'relative' }} onPointerLeave={() => setActive(null)}>
          <svg className="chart" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={t('dash.cashflow')}>
            {ticks.map((v) => (
              <g key={v}>
                <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="var(--chart-grid)" strokeWidth={1} />
                <text x={padL - 10} y={y(v) + 4} textAnchor="end">{formatMoney(v, currency, lang, { compact: true })}</text>
              </g>
            ))}
            {points.map((p, i) => {
              const cx = padL + slot * i + slot / 2;
              const on = active === i;
              const hi = Math.max(p.income > 0 ? 2 : 0, base - y(p.income));
              const he = Math.max(p.expense > 0 ? 2 : 0, base - y(p.expense));
              return (
                <g key={p.month}>
                  {on && <rect x={padL + slot * i + 2} y={padT} width={slot - 4} height={plotH} rx={8} fill="var(--surface-2)" />}
                  <path d={barPath(cx - bw - gap / 2, base, base - hi, bw)} fill="var(--chart-income)" opacity={active != null && !on ? 0.55 : 1} />
                  <path d={barPath(cx + gap / 2, base, base - he, bw)} fill="var(--chart-expense)" opacity={active != null && !on ? 0.55 : 1} />
                  <text x={cx} y={H - 8} textAnchor="middle" style={on ? { fill: 'var(--text)', fontWeight: 600 } : undefined}>{monthShort(p.month)}</text>
                  {/* Hit target: the whole slot, far larger than the marks. */}
                  <rect
                    x={padL + slot * i} y={padT} width={slot} height={plotH + padB} fill="transparent" tabIndex={0} role="img" className="chart-hit"
                    aria-label={`${monthLong(p.month)}: ${t('dash.income')} ${money(p.income)}, ${t('dash.expense')} ${money(p.expense)}`}
                    onPointerEnter={() => setActive(i)} onPointerMove={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                  />
                </g>
              );
            })}
            <line x1={padL} x2={W - padR} y1={base} y2={base} stroke="var(--chart-axis)" strokeWidth={1} />
          </svg>
          {tip && (
            <div className="chart-tip" style={{ left: tipX, top: 0 }} role="status">
              <div className="chart-tip-title">{monthLong(tip.month)}</div>
              <div className="chart-tip-row"><i style={{ background: 'var(--chart-income)' }} /><strong>{money(tip.income)}</strong><span>{t('dash.income')}</span></div>
              <div className="chart-tip-row"><i style={{ background: 'var(--chart-expense)' }} /><strong>{money(tip.expense)}</strong><span>{t('dash.expense')}</span></div>
              <div className="chart-tip-net"><span>{t('chart.net')}</span><strong>{formatMoney(tip.income - tip.expense, currency, lang, { sign: true })}</strong></div>
            </div>
          )}
        </div>
      )}
      <div className="row between" style={{ marginTop: 6 }}>
        <div className="legend">
          <span><i className="swatch" style={{ background: 'var(--chart-income)' }} />{t('dash.income')}</span>
          <span><i className="swatch" style={{ background: 'var(--chart-expense)' }} />{t('dash.expense')}</span>
        </div>
        <button className="btn ghost sm chart-toggle" onClick={() => setTable((v) => !v)}>{table ? t('chart.viewChart') : t('chart.viewTable')}</button>
      </div>
    </div>
  );
}

/** Tiny trend line for stat tiles: de-emphasised gray line, current period in the accent with a surface ring. */
export function Sparkline({ values, accent, label }: { values: number[]; accent: string; label: string }) {
  const W = 84, H = 30, pad = 5;
  if (values.length < 2) return null;
  const min = Math.min(...values), maxV = Math.max(...values);
  const span = maxV - min || 1;
  const pts = values.map((v, i) => [pad + (i * (W - pad * 2)) / (values.length - 1), pad + (H - pad * 2) * (1 - (v - min) / span)] as const);
  const last = pts[pts.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="spark">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="var(--chart-muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={5} fill="var(--surface)" />
      <circle cx={last[0]} cy={last[1]} r={3.5} fill={accent} />
    </svg>
  );
}

export interface RankItem { key: string; label: string; value: number; share: number }

/**
 * Part-to-whole as ranked horizontal bars (largest first, one hue = the measure, value at the bar tip).
 * Beyond `max` rows the tail is folded into "Other".
 */
export function RankedBars({ items, currency, tone, max = 8 }: { items: RankItem[]; currency: CurrencyCode; tone: 'income' | 'expense'; max?: number }) {
  const { lang, t } = useI18n();
  let rows = items;
  if (items.length > max) {
    const head = items.slice(0, max - 1);
    const tail = items.slice(max - 1);
    rows = [...head, { key: 'other', label: t('chart.other'), value: tail.reduce((s, i) => s + i.value, 0), share: tail.reduce((s, i) => s + i.share, 0) }];
  }
  const top = Math.max(...rows.map((r) => r.value), 1);
  const pct = new Intl.NumberFormat(localeOf(lang), { style: 'percent', maximumFractionDigits: 0 });
  return (
    <ol className="rank" aria-label={t(tone === 'expense' ? 'rep.byCategory' : 'rep.incomeByCategory')}>
      {rows.map((r) => (
        <li key={r.key} className="rank-row" title={`${r.label}: ${formatMoney(r.value, currency, lang)} (${pct.format(r.share)})`}>
          <span className="rank-name">{r.label}</span>
          <span className="rank-track"><span className="rank-fill" style={{ width: `${Math.max(2, (r.value / top) * 100)}%`, background: `var(--chart-${tone})` }} /></span>
          <span className="rank-val"><strong>{formatMoney(r.value, currency, lang)}</strong><span className="muted"> · {pct.format(r.share)}</span></span>
        </li>
      ))}
    </ol>
  );
}
