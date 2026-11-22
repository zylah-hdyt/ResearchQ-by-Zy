import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useI18n } from '../i18n';
import { Modal } from './Modal';

export interface ConfirmOptions { title: string; body?: string; confirmLabel?: string; danger?: boolean }
type Confirm = (o: ConfirmOptions) => Promise<boolean>;
const Ctx = createContext<Confirm>(async () => false);

/** Accessible replacement for window.confirm(): `if (await confirm({ title, danger })) …` */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [state, setState] = useState<{ opts: ConfirmOptions; resolve: (v: boolean) => void } | null>(null);
  const confirm = useCallback<Confirm>((opts) => new Promise<boolean>((resolve) => setState({ opts, resolve })), []);
  const close = (v: boolean) => { state?.resolve(v); setState(null); };
  return (
    <Ctx.Provider value={confirm}>
      {children}
      {state && (
        <Modal title={state.opts.title} onClose={() => close(false)}
          footer={<>
            <button className="btn" onClick={() => close(false)} autoFocus>{t('common.cancel')}</button>
            <button className={`btn ${state.opts.danger ? 'danger solid' : 'primary'}`} onClick={() => close(true)}>{state.opts.confirmLabel ?? t('common.confirm')}</button>
          </>}>
          {state.opts.body && <p className="muted" style={{ margin: 0 }}>{state.opts.body}</p>}
        </Modal>
      )}
    </Ctx.Provider>
  );
}
export const useConfirm = () => useContext(Ctx);
