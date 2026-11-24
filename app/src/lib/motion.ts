import { useEffect, useRef, useState } from 'react';

export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Animates a number towards `target` (first render from 0, later from the value on screen).
 * Intermediate values are rounded to `step`; the final value is always exact. Instant with reduced motion.
 */
export function useCountUp(target: number, enabled = true, ms = 650, step = 100): number {
  const [shown, setShown] = useState(() => (enabled && !reducedMotion() ? 0 : target));
  const cur = useRef(shown);
  useEffect(() => {
    if (!enabled || reducedMotion() || cur.current === target) { cur.current = target; setShown(target); return; }
    const from = cur.current, t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const v = p >= 1 ? target : Math.round((from + (target - from) * e) / step) * step;
      cur.current = v; setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, enabled, ms, step]);
  return shown;
}

/**
 * Sliding active indicator for every `.segmented` group: one observer places a pill under the active button
 * (class "on" or aria-selected) and CSS moves it. Groups without an active button keep their own styling.
 */
export function installSegmentedIndicators() {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  let queued = false;
  const place = () => {
    queued = false;
    document.querySelectorAll<HTMLElement>('.segmented').forEach((seg) => {
      const on = seg.querySelector<HTMLElement>(':scope > button.on, :scope > button[aria-selected="true"]');
      if (!on || !on.offsetWidth) { seg.classList.remove('has-ind'); return; }
      // Measured from the group's padding box (offsetLeft would depend on which ancestor is positioned).
      const x = on.getBoundingClientRect().left - seg.getBoundingClientRect().left - seg.clientLeft + seg.scrollLeft;
      seg.style.setProperty('--seg-x', `${Math.round(x * 10) / 10}px`);
      seg.style.setProperty('--seg-w', `${on.getBoundingClientRect().width}px`);
      if (!seg.classList.contains('has-ind')) {
        seg.classList.add('has-ind');
        requestAnimationFrame(() => seg.classList.add('ind-ready'));
      }
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };
  new MutationObserver(queue).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'aria-selected'] });
  addEventListener('resize', queue);
  document.fonts?.ready.then(queue).catch(() => {});
  queue();
}
