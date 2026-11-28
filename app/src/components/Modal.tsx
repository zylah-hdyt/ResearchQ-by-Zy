import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useI18n } from '../i18n';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const SHEET = '(max-width: 600px)';
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const EASE_DRAWER = 'cubic-bezier(0.32, 0.72, 0, 1)';

/** Where a released flick would come to rest (Apple's exponential-decay projection), in px for a velocity in px/s. */
const project = (v: number, rate = 0.998) => ((v / 1000) * rate) / (1 - rate);
/** Soft boundary: the further past the edge, the less the sheet follows. */
const rubberband = (over: number, dim: number, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));

/** Duration a swipe-dismiss hands to the exit animation, so the sheet leaves at the speed the finger let go (ms). */
let releaseExitMs: number | null = null;

/**
 * Dialog on desktop, bottom sheet on phones.
 * - Phones: the header is a drag handle. The sheet follows the finger 1:1, resists upwards (rubber band), and on
 *   release lands where the flick is heading (momentum projection) — dismissed past half height, otherwise it springs
 *   back. It can be caught mid-flight. Scrim fades with the drag.
 * - Every close (X, Escape, backdrop, swipe, Save, Cancel) plays an exit that mirrors the entrance: a ghost copy of the
 *   dialog animates out after the real one unmounts, so it works no matter how the parent closes it.
 */
export function Modal({ title, onClose, children, footer, wide }: { title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; startY: number; startOffset: number; offset: number; height: number; samples: { t: number; y: number }[] } | null>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Move focus into the dialog unless a field already took it (autoFocus).
    if (node && !node.contains(document.activeElement)) node.querySelector<HTMLElement>('.modal-body ' + FOCUSABLE.split(', ').join(', .modal-body '))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [onClose]);

  // Exit: on a real unmount, animate a non-interactive copy out (the DOM node is already detached by then).
  useEffect(() => {
    const overlay = overlayRef.current;
    return () => {
      if (!overlay || overlay.isConnected) return; // re-run of the effect, not a close
      const ms = releaseExitMs ?? (window.matchMedia(SHEET).matches ? 220 : 160);
      releaseExitMs = null;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const ghost = overlay.cloneNode(true) as HTMLElement;
      ghost.setAttribute('aria-hidden', 'true');
      ghost.inert = true;
      ghost.style.pointerEvents = 'none';
      ghost.style.animation = 'none';
      ghost.classList.remove('dragging');
      const card = ghost.querySelector<HTMLElement>('.modal');
      if (!card) return;
      card.classList.remove('modal', 'dragging');
      card.classList.add('sheet-ghost');
      card.removeAttribute('role');
      card.style.animation = 'none';
      document.body.appendChild(ghost);
      const done = () => ghost.remove();
      window.setTimeout(done, ms + 400); // safety net if the animation never reports back (hidden tab)
      ghost.style.transition = `--scrim-k ${ms}ms linear`;
      requestAnimationFrame(() => ghost.style.setProperty('--scrim-k', '0'));
      if (reduce) { const a = ghost.animate({ opacity: [1, 0] }, { duration: 120, easing: 'ease-out', fill: 'forwards' }); a.onfinish = done; }
      else if (window.matchMedia(SHEET).matches) {
        // Leaves downward, the way it came in; starts from wherever a drag left it.
        const a = card.animate({ transform: 'translateY(100%)' }, { duration: ms, easing: EASE_OUT, fill: 'forwards' });
        a.onfinish = done;
      } else {
        const a = card.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(0.97)' }], { duration: ms, easing: EASE_OUT, fill: 'forwards' });
        a.onfinish = done;
      }
    };
  }, []);

  const apply = (offset: number) => {
    const card = ref.current, overlay = overlayRef.current;
    if (!card || !overlay || !drag.current) return;
    drag.current.offset = offset;
    card.style.transform = `translateY(${offset}px)`;
    overlay.style.setProperty('--scrim-k', String(Math.max(0, Math.min(1, 1 - Math.max(0, offset) / drag.current.height))));
  };

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const card = ref.current, overlay = overlayRef.current;
    if (!card || !overlay || !window.matchMedia(SHEET).matches || (e.target as HTMLElement).closest('button')) return;
    // Catch the sheet wherever it is right now (a spring-back may still be running): start from the live value.
    const live = new DOMMatrix(getComputedStyle(card).transform).m42 || 0;
    card.getAnimations().forEach((a) => a.cancel());
    e.currentTarget.setPointerCapture(e.pointerId);
    card.classList.add('dragging');
    overlay.classList.add('dragging');
    drag.current = { id: e.pointerId, startY: e.clientY, startOffset: live, offset: live, height: card.offsetHeight, samples: [{ t: performance.now(), y: e.clientY }] };
    apply(live);
  };

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const raw = d.startOffset + (e.clientY - d.startY);
    apply(raw >= 0 ? raw : -rubberband(-raw, d.height));
    const now = performance.now();
    d.samples.push({ t: now, y: e.clientY });
    while (d.samples.length > 2 && now - d.samples[0].t > 100) d.samples.shift();
  };

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current, card = ref.current, overlay = overlayRef.current;
    if (!d || !card || !overlay || e.pointerId !== d.id) return;
    drag.current = null;
    // Velocity of the last 100 ms only: a finger that stopped before lifting carries no momentum.
    const now = performance.now();
    const recent = d.samples.filter((s) => now - s.t <= 100);
    const a = recent[0], b = recent[recent.length - 1];
    const v = recent.length >= 2 && b.t > a.t ? ((b.y - a.y) / (b.t - a.t)) * 1000 : 0; // px/s, positive = downwards
    const projected = d.offset + project(v);
    if (d.offset > 0 && (projected > d.height * 0.5 || v > 1000)) {
      releaseExitMs = Math.round(Math.max(140, Math.min(260, ((d.height - d.offset) / Math.max(Math.abs(v), 600)) * 1000)));
      onClose();
      return;
    }
    // Not far enough: spring back from where it is, carrying on smoothly from the finger.
    const from = d.offset;
    card.style.transform = 'translateY(0px)';
    overlay.classList.remove('dragging');
    overlay.style.setProperty('--scrim-k', '1');
    const anim = card.animate([{ transform: `translateY(${from}px)` }, { transform: 'translateY(0px)' }], { duration: 380, easing: EASE_DRAWER });
    const settle = () => { card.style.transform = ''; card.classList.remove('dragging'); };
    anim.onfinish = settle;
    anim.oncancel = () => card.classList.remove('dragging');
  };

  // Rendered on <body> so page-level animations and stacking never affect dialogs.
  return createPortal(
    <div className="overlay" ref={overlayRef} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" ref={ref}>
        <div className="modal-head" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t('common.close')}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
