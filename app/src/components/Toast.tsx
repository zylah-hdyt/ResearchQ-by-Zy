import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

export interface ToastAction { label: string; onClick: () => void }
type Show = (msg: string, action?: ToastAction) => void;
const Ctx = createContext<Show>(() => {});

/** Short message at the bottom; an optional action (e.g. Undo) keeps it up a little longer. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; action?: ToastAction } | null>(null);
  const timer = useRef<number>();
  const show = useCallback<Show>((msg, action) => {
    setToast({ msg, action });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), action ? 7000 : 2800);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {toast && (
        <div className="toast" role="status">
          <span>{toast.msg}</span>
          {toast.action && <button onClick={() => { toast.action!.onClick(); setToast(null); }}>{toast.action.label}</button>}
        </div>
      )}
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);
