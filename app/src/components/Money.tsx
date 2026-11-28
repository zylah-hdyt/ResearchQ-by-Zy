import type { CurrencyCode } from '../data/types';
import { formatMoney } from '../lib/format';
import { useI18n } from '../i18n';
import { maskAmount, usePrivacy } from './Privacy';
import { useCountUp } from '../lib/motion';

/** Formatted amount. `maskable` amounts (balances) respect the "hide balance" switch. */
/** `animate` counts up to the value on first render and when it changes (headline figures only). */
export function Money({ value, currency, className = '', sign, compact, maskable, animate }: { value: number; currency: CurrencyCode; className?: string; sign?: boolean; compact?: boolean; maskable?: boolean; animate?: boolean }) {
  const { lang, t } = useI18n();
  const { hidden } = usePrivacy();
  const shown = useCountUp(value, !!animate && !(maskable && hidden), 480, currency === 'IDR' || currency === 'JPY' ? 100_000 : 100);
  const text = formatMoney(shown, currency, lang, { compact, sign });
  if (maskable && hidden) return <span className={`num ${className}`} aria-label={t('privacy.hidden')}>{maskAmount(text)}</span>;
  return <span className={`num ${className}`}>{text}</span>;
}
