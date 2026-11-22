/** "Nice" axis: round tick values (0, 25, 50 …) covering `max` in at most `count` steps. */
export function niceTicks(max: number, count = 4): { ticks: number[]; top: number } {
  const raw = Math.max(max, 1) / count;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / p;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  const steps = Math.max(1, Math.ceil(max / step));
  return { ticks: Array.from({ length: steps + 1 }, (_, i) => i * step), top: steps * step };
}

/** Bar path: 4px rounded data end, square at the baseline. */
export function barPath(x: number, base: number, top: number, w: number, r = 4): string {
  const h = base - top;
  if (h <= 0 || w <= 0) return '';
  const rr = Math.min(r, h, w / 2);
  return `M${x},${base}V${top + rr}Q${x},${top} ${x + rr},${top}H${x + w - rr}Q${x + w},${top} ${x + w},${top + rr}V${base}Z`;
}

/** Month-to-date change vs the same stretch of last month. Null when there is nothing to compare. */
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  const v = (current - previous) / Math.abs(previous);
  return Math.abs(v) < 0.005 ? 0 : v;
}
