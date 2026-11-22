export interface SegPart { key: string; value: number; color: string; label: string }

/** One whole split into parts (thin segmented bar): widths ∝ value, 2px surface gaps, no text on the bar. The legend lives beside it. */
export function SegmentBar({ parts, label }: { parts: SegPart[]; label: string }) {
  const shown = parts.filter((p) => p.value > 0);
  return (
    <div className="segbar" role="img" aria-label={label}>
      {shown.map((p) => <span key={p.key} style={{ flex: p.value, background: p.color }} title={p.label} />)}
    </div>
  );
}
