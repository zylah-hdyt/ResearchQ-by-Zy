import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

export interface ToastAction { label: string; onClick: () => void }
type Show = (msg: string, action?: ToastAction) => void;
const Ctx = createContext<Show>(() => {});

/** Time the exit transition needs before the toast is removed (matches .toast:not(.in) in components.css). */
const EXIT_MS = 170;

/**
 * Short message at the bottom; an optional action (e.g. Undo) keeps it up a little longer.
 * Enter and exit are CSS transitions, not keyframes: a second toast fired while one is showing retargets from where
 * it is instead of restarting, and it leaves the way it came in (down).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; action?: ToastAction } | null>(null);
  const [shown, setShown] = useState(false);
  const timer = useRef<number>();
  const gone = useRef<number>();

  const hide = useCallback(() => {
    window.clearTimeout(timer.current);
    setShown(false);
    window.clearTimeout(gone.current);
    gone.current = window.setTimeout(() => setToast(null), EXIT_MS);
  }, []);

  const show = useCallback<Show>((msg, action) => {
    window.clearTimeout(gone.current);
    setToast({ msg, action });
    // One frame in the resting-below state first, so the transition has somewhere to start from.
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(hide, action ? 7000 : 2800);
  }, [hide]);

  useEffect(() => () => { window.clearTimeout(timer.current); window.clearTimeout(gone.current); }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && (
        <div className={`toast${shown ? ' in' : ''}`} role="status">
          <span>{toast.msg}</span>
          {toast.action && <button onClick={() => { toast.action!.onClick(); hide(); }}>{toast.action.label}</button>}
        </div>
      )}
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);
