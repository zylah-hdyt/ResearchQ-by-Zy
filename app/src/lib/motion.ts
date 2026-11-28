import { useEffect, useRef, useState } from 'react';

export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * True once the first headline figures of this visit have had their count-up. After that, screens show the final
 * numbers at once when you navigate (figures you read are not decoration); a figure that CHANGES still counts to its
 * new value from the one on screen. The flag is set a moment after the first use so every figure of that first
 * screen animates together.
 */
let sessionPlayed = false;
let sessionTimer = 0;

/**
 * Animates a number towards `target`. The first figures of a session count up from 0; later mounts start at the
 * final value; a change animates from the value on screen. Rounded to `step`, exact at the end, instant with
 * reduced motion, strong ease-out, 480 ms.
 */
export function useCountUp(target: number, enabled = true, ms = 480, step = 100): number {
  const [shown, setShown] = useState(() => (enabled && !sessionPlayed && !reducedMotion() ? 0 : target));
  const cur = useRef(shown);
  useEffect(() => {
    if (enabled && !sessionPlayed) {
      window.clearTimeout(sessionTimer);
      sessionTimer = window.setTimeout(() => { sessionPlayed = true; }, ms + 200);
    }
    if (!enabled || reducedMotion() || cur.current === target) { cur.current = target; setShown(target); return; }
    const from = cur.current, t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - p, 4); // ease-out quart
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
