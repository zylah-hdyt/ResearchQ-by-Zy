import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '../i18n';

const KEY = 'fa.v1:hideBalance';
interface PrivacyValue { hidden: boolean; toggle: () => void }
const Ctx = createContext<PrivacyValue>({ hidden: false, toggle: () => {} });

/** "Hide balance" preference, remembered on this device. */
export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(() => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } });
  const toggle = useCallback(() => setHidden((h) => { const n = !h; try { localStorage.setItem(KEY, n ? '1' : '0'); } catch { /* ignore */ } return n; }), []);
  const value = useMemo(() => ({ hidden, toggle }), [hidden, toggle]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const usePrivacy = () => useContext(Ctx);

/** "Rp 107.325.000" → "Rp ••••••" (keeps the currency symbol and sign). */
export const maskAmount = (s: string) => s.replace(/\d+(?:[.,  ]\d+)*/g, '••••••');

export function EyeToggle({ className = 'icon-btn' }: { className?: string }) {
  const { t } = useI18n();
  const { hidden, toggle } = usePrivacy();
  const label = hidden ? t('privacy.show') : t('privacy.hide');
  return (
    <button className={className} onClick={toggle} aria-pressed={hidden} aria-label={label} title={label}>
      {hidden ? <EyeOff size={19} aria-hidden /> : <Eye size={19} aria-hidden />}
    </button>
  );
}
