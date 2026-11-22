import type { CurrencyCode } from '../data/types';
import { formatMoney } from '../lib/format';
import { useI18n } from '../i18n';
import { maskAmount, usePrivacy } from './Privacy';

/** Formatted amount. `maskable` amounts (balances) respect the "hide balance" switch. */
export function Money({ value, currency, className = '', sign, compact, maskable }: { value: number; currency: CurrencyCode; className?: string; sign?: boolean; compact?: boolean; maskable?: boolean }) {
  const { lang, t } = useI18n();
  const { hidden } = usePrivacy();
  const text = formatMoney(value, currency, lang, { compact, sign });
  if (maskable && hidden) return <span className={`num ${className}`} aria-label={t('privacy.hidden')}>{maskAmount(text)}</span>;
  return <span className={`num ${className}`}>{text}</span>;
}
