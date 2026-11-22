import type { CurrencyCode } from '../data/types';
import { formatMoney } from '../lib/format';
import { useI18n } from '../i18n';

export function Money({ value, currency, className = '', sign, compact }: { value: number; currency: CurrencyCode; className?: string; sign?: boolean; compact?: boolean }) {
  const { lang } = useI18n();
  return <span className={`num ${className}`}>{formatMoney(value, currency, lang, { sign, compact })}</span>;
}
