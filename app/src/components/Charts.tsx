import { useEffect, useRef, useState } from 'react';
import type { CurrencyCode } from '../data/types';
import type { FlowPoint } from '../lib/periods';
import { barPath, niceRange, niceTicks } from '../lib/chart';
import { formatMoney, localeOf } from '../lib/format';
import { useI18n } from '../i18n';
import { usePrivacy } from './Privacy';

const usePrivacyHidden = () => usePrivacy().hidden;

/**
 * Income vs expense per month. One axis, thin bars (≤ 24px) with 4px rounded ends on a single baseline,
 * 2px surface gap between the pair, hairline solid grid, hover/focus tooltip listing every series,
 * a legend, and a table view as the accessible twin.
 */
export function CashflowChart({ points, currency }: { points: FlowPoint[]; currency: CurrencyCode }) {
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
  // Thin the axis labels so they never collide (e.g. 30 daily or 12 monthly buckets on a phone).
  const labelEvery = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(plotW / 46))));
  const money = (v: number) => formatMoney(v, currency, lang);
  const tip = active != null ? points[active] : null;
  const tipX = active != null ? Math.min(Math.max(padL + slot * active + slot / 2, 96), W - 96) : 0;

  return (
    <div ref={ref} className="chart-wrap">
      {table ? (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>{t('chart.period')}</th><th className="r">{t('dash.income')}</th><th className="r">{t('dash.expense')}</th><th className="r">{t('chart.net')}</th></tr></thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.key}>
                  <td>{p.longLabel}</td>
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
                <g key={p.key}>
                  {on && <rect x={padL + slot * i + 2} y={padT} width={slot - 4} height={plotH} rx={8} fill="var(--surface-2)" />}
                  <path className="bar" style={{ animationDelay: `${i * 18}ms` }} d={barPath(cx - bw - gap / 2, base, base - hi, bw)} fill="var(--chart-income)" opacity={active != null && !on ? 0.55 : 1} />
                  <path className="bar" style={{ animationDelay: `${i * 18 + 9}ms` }} d={barPath(cx + gap / 2, base, base - he, bw)} fill="var(--chart-expense)" opacity={active != null && !on ? 0.55 : 1} />
                  {(i % labelEvery === 0 || on) && <text x={cx} y={H - 8} textAnchor="middle" style={on ? { fill: 'var(--text)', fontWeight: 600 } : undefined}>{p.label}</text>}
                  {/* Hit target: the whole slot, far larger than the marks. */}
                  <rect
                    x={padL + slot * i} y={padT} width={slot} height={plotH + padB} fill="transparent" tabIndex={0} role="img" className="chart-hit"
                    aria-label={`${p.longLabel}: ${t('dash.income')} ${money(p.income)}, ${t('dash.expense')} ${money(p.expense)}`}
                    onPointerEnter={() => setActive(i)} onPointerMove={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                  />
                </g>
              );
            })}
            <line x1={padL} x2={W - padR} y1={base} y2={base} stroke="var(--chart-axis)" strokeWidth={1} />
          </svg>
          {tip && (
            <div className="chart-tip" style={{ left: tipX, top: 0 }} role="status">
              <div className="chart-tip-title">{tip.longLabel}</div>
              <div className="chart-tip-row"><i style={{ background: 'var(--chart-income)' }} /><strong>{money(tip.income)}</strong><span>{t('dash.income')}</span></div>
              <div className="chart-tip-row"><i style={{ background: 'var(--chart-expense)' }} /><strong>{money(tip.expense)}</strong><span>{t('dash.expense')}</span></div>
              <div className="chart-tip-net"><span>{t('chart.net')}</span><strong>{formatMoney(tip.income - tip.expense, currency, lang, { sign: true })}</strong></div>
            </div>
          )}
        </div>
      )}
      <div className="row between wrap" style={{ marginTop: 6 }}>
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

export interface TrendPoint { key: string; label: string; longLabel: string; value: number }

/**
 * One series over time (balance, net worth): 2px line, 10% area wash, end dot with a surface ring, crosshair + tooltip
 * on hover and arrow keys, table view as the accessible twin.
 */
export function TrendChart({ points, currency, name, color = 'var(--brand)', maskable }: { points: TrendPoint[]; currency: CurrencyCode; name: string; color?: string; maskable?: boolean }) {
  const { lang, t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const H = 232, padL = 64, padR = 12, padB = 28, padT = 14;
  const plotW = W - padL - padR, plotH = H - padT - padB, base = padT + plotH;
  const n = points.length;
  const { ticks, lo, hi } = niceRange(Math.min(...points.map((p) => p.value)), Math.max(...points.map((p) => p.value)));
  const xAt = (i: number) => padL + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const yAt = (v: number) => padT + plotH - ((v - lo) / (hi - lo)) * plotH;
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${xAt(i).toFixed(1)},${yAt(p.value).toFixed(1)}`).join('');
  const area = `${line}L${xAt(n - 1).toFixed(1)},${base}L${xAt(0).toFixed(1)},${base}Z`;
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW / 52))));
  const shown = active ?? n - 1;
  const fmtV = (v: number) => formatMoney(v, currency, lang);
  const tip = active != null ? points[active] : null;
  const tipX = active != null ? Math.min(Math.max(xAt(active), 84), W - 84) : 0;
  const moveTo = (clientX: number, el: Element) => {
    const r = el.getBoundingClientRect();
    const i = Math.round(((clientX - r.left - padL) / plotW) * (n - 1));
    setActive(Math.min(n - 1, Math.max(0, i)));
  };
  return (
    <div ref={ref} className="chart-wrap">
      {table ? (
        <div className="table-wrap"><table className="data"><thead><tr><th>{t('chart.period')}</th><th className="r">{name}</th></tr></thead>
          <tbody>{points.map((p) => <tr key={p.key}><td>{p.longLabel}</td><td className="r">{fmtV(p.value)}</td></tr>)}</tbody></table></div>
      ) : (
        <div style={{ position: 'relative' }} onPointerLeave={() => setActive(null)}>
          <svg className="chart" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" tabIndex={0} aria-label={`${name}: ${fmtV(points[n - 1].value)}`}
            onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(Math.max(0, (active ?? n - 1) - 1)); } if (e.key === 'ArrowRight') { e.preventDefault(); setActive(Math.min(n - 1, (active ?? n - 1) + 1)); } if (e.key === 'Escape') setActive(null); }}
            onBlur={() => setActive(null)}>
            {ticks.map((v) => (
              <g key={v}><line x1={padL} x2={W - padR} y1={yAt(v)} y2={yAt(v)} stroke="var(--chart-grid)" strokeWidth={1} />
                <text x={padL - 10} y={yAt(v) + 4} textAnchor="end">{formatMoney(v, currency, lang, { compact: true })}</text></g>
            ))}
            <path className="area-in" d={area} fill={color} opacity={0.1} />
            <path className="line-draw" pathLength={1} d={line} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {points.map((p, i) => (i % labelEvery === 0 || i === n - 1) && <text key={p.key} x={xAt(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{p.label}</text>)}
            {active != null && <line x1={xAt(active)} x2={xAt(active)} y1={padT} y2={base} stroke="var(--chart-axis)" strokeWidth={1} />}
            <circle cx={xAt(shown)} cy={yAt(points[shown].value)} r={6} fill="var(--surface)" />
            <circle cx={xAt(shown)} cy={yAt(points[shown].value)} r={4} fill={color} />
            <rect x={padL} y={padT} width={plotW} height={plotH + padB} fill="transparent" onPointerMove={(e) => moveTo(e.clientX, e.currentTarget)} onPointerDown={(e) => moveTo(e.clientX, e.currentTarget)} />
          </svg>
          {tip && (
            <div className="chart-tip" style={{ left: tipX, top: 0, minWidth: 150 }} role="status">
              <div className="chart-tip-title">{tip.longLabel}</div>
              <div className="chart-tip-row"><i style={{ background: color }} /><strong>{maskable && usePrivacyHidden() ? '••••••' : fmtV(tip.value)}</strong><span>{name}</span></div>
            </div>
          )}
        </div>
      )}
      <div className="row between wrap" style={{ marginTop: 6 }}>
        <span className="legend"><span><i className="swatch" style={{ background: color }} />{name}</span></span>
        <button className="btn ghost sm chart-toggle" onClick={() => setTable((v) => !v)}>{table ? t('chart.viewChart') : t('chart.viewTable')}</button>
      </div>
    </div>
  );
}

/** Smooth path through points (monotone-ish cubic, no overshoot below the baseline). */
function smooth(pts: [number, number][], floor: number): string {
  if (!pts.length) return '';
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += `C${cx.toFixed(1)},${Math.min(floor, y0).toFixed(1)} ${cx.toFixed(1)},${Math.min(floor, y1).toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return d;
}

/**
 * Income and expense over time as two smooth areas (the "cash flow trend"). Crosshair + tooltip with both series on
 * hover/arrow keys, legend, table view as the accessible twin.
 */
export function FlowAreaChart({ points, currency }: { points: FlowPoint[]; currency: CurrencyCode }) {
  const { lang, t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(640);
  const [active, setActive] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const H = 230, padL = 56, padR = 10, padB = 28, padT = 16;
  const plotW = W - padL - padR, plotH = H - padT - padB, base = padT + plotH;
  const n = points.length;
  const { ticks, top } = niceTicks(Math.max(1, ...points.flatMap((p) => [p.income, p.expense])));
  const xAt = (i: number) => padL + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const yAt = (v: number) => padT + plotH - (v / top) * plotH;
  const series = [
    { key: 'income' as const, name: t('dash.income'), color: 'var(--chart-income)' },
    { key: 'expense' as const, name: t('dash.expense'), color: 'var(--chart-expense)' },
  ];
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW / 52))));
  const money = (v: number) => formatMoney(v, currency, lang);
  const tip = active != null ? points[active] : null;
  const tipX = active != null ? Math.min(Math.max(xAt(active), 96), W - 96) : 0;
  const moveTo = (clientX: number, el: Element) => {
    const r = el.getBoundingClientRect();
    setActive(Math.min(n - 1, Math.max(0, Math.round(((clientX - r.left - padL) / plotW) * (n - 1)))));
  };
  return (
    <div ref={ref} className="chart-wrap">
      {table ? (
        <div className="table-wrap"><table className="data">
          <thead><tr><th>{t('chart.period')}</th><th className="r">{t('dash.income')}</th><th className="r">{t('dash.expense')}</th><th className="r">{t('chart.net')}</th></tr></thead>
          <tbody>{points.map((p) => <tr key={p.key}><td>{p.longLabel}</td><td className="r">{money(p.income)}</td><td className="r">{money(p.expense)}</td><td className="r"><strong>{formatMoney(p.income - p.expense, currency, lang, { sign: true })}</strong></td></tr>)}</tbody>
        </table></div>
      ) : (
        <div style={{ position: 'relative' }} onPointerLeave={() => setActive(null)}>
          <svg className="chart" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="group" tabIndex={0} aria-label={t('rep.cashTrend')}
            onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(Math.max(0, (active ?? n - 1) - 1)); } if (e.key === 'ArrowRight') { e.preventDefault(); setActive(Math.min(n - 1, (active ?? n - 1) + 1)); } if (e.key === 'Escape') setActive(null); }}
            onBlur={() => setActive(null)}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`flow-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            {ticks.map((v) => (
              <g key={v}><line x1={padL} x2={W - padR} y1={yAt(v)} y2={yAt(v)} stroke="var(--chart-grid)" strokeWidth={1} />
                <text x={padL - 10} y={yAt(v) + 4} textAnchor="end">{formatMoney(v, currency, lang, { compact: true })}</text></g>
            ))}
            {series.map((s) => {
              const line = smooth(points.map((p, i) => [xAt(i), yAt(p[s.key])]), base);
              return (
                <g key={s.key}>
                  <path className="area-in" d={`${line}L${xAt(n - 1).toFixed(1)},${base}L${xAt(0).toFixed(1)},${base}Z`} fill={`url(#flow-${s.key})`} />
                  <path className="line-draw" pathLength={1} d={line} fill="none" stroke={s.color} strokeWidth={2.4} strokeLinecap="round" />
                </g>
              );
            })}
            {points.map((p, i) => (i % labelEvery === 0 || i === n - 1) && <text key={p.key} x={xAt(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{p.label}</text>)}
            {active != null && <>
              <line x1={xAt(active)} x2={xAt(active)} y1={padT} y2={base} stroke="var(--chart-axis)" strokeWidth={1} />
              {series.map((s) => <circle key={s.key} cx={xAt(active)} cy={yAt(points[active][s.key])} r={4.5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />)}
            </>}
            <rect x={padL} y={padT} width={plotW} height={plotH + padB} fill="transparent" onPointerMove={(e) => moveTo(e.clientX, e.currentTarget)} onPointerDown={(e) => moveTo(e.clientX, e.currentTarget)} />
          </svg>
          {tip && (
            <div className="chart-tip" style={{ left: tipX, top: 0, minWidth: 170 }} role="status">
              <div className="chart-tip-title">{tip.longLabel}</div>
              {series.map((s) => <div key={s.key} className="chart-tip-row"><i style={{ background: s.color }} /><strong>{money(tip[s.key])}</strong><span>{s.name}</span></div>)}
            </div>
          )}
        </div>
      )}
      <div className="row between wrap" style={{ marginTop: 6 }}>
        <span className="legend">{series.map((s) => <span key={s.key}><i className="swatch" style={{ background: s.color }} />{s.name}</span>)}</span>
        <button className="btn ghost sm chart-toggle" onClick={() => setTable((v) => !v)}>{table ? t('chart.viewChart') : t('chart.viewTable')}</button>
      </div>
    </div>
  );
}

export interface DonutSlice { key: string; label: string; value: number; share: number; color: string }

/** Share of a total by category: donut plus a legend with percentages (the legend doubles as the text alternative). */
export function DonutChart({ slices, total, currency, title, max = 5 }: { slices: DonutSlice[]; total: number; currency: CurrencyCode; title: string; max?: number }) {
  const { lang, t } = useI18n();
  let rows = slices;
  if (slices.length > max) {
    const tail = slices.slice(max - 1);
    rows = [...slices.slice(0, max - 1), { key: 'other', label: t('chart.other'), value: tail.reduce((a, s) => a + s.value, 0), share: tail.reduce((a, s) => a + s.share, 0), color: '#9aa3a0' }];
  }
  const pct = new Intl.NumberFormat(localeOf(lang), { style: 'percent', maximumFractionDigits: 0 });
  const r = 46, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="donut-card">
      <div className="donut-side">
        <div className="donut-total"><span className="muted small">{title}</span><strong className="num">{formatMoney(total, currency, lang, { compact: true })}</strong></div>
        <svg className="donut" viewBox="0 0 120 120" width="132" height="132" role="img" aria-label={`${title}: ${rows.map((s) => `${s.label} ${pct.format(s.share)}`).join(', ')}`}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="18" />
          {rows.map((s, i) => {
            const len = Math.max(0, s.share * c - (rows.length > 1 ? 2 : 0));
            const el = <circle key={s.key} className="donut-seg" style={{ animationDelay: `${i * 60}ms` }} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="18" strokeDasharray={`${len} ${c}`} strokeDashoffset={-acc * c} transform="rotate(-90 60 60)" />;
            acc += s.share;
            return el;
          })}
        </svg>
      </div>
      <ul className="donut-legend">
        {rows.map((s) => <li key={s.key} title={formatMoney(s.value, currency, lang)}><i className="kdot" style={{ background: s.color }} /><span className="truncate">{s.label}</span><strong className="num">{pct.format(s.share)}</strong></li>)}
      </ul>
    </div>
  );
}
