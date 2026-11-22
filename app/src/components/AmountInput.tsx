import { decimalsOf } from '../lib/money';
import type { CurrencyCode } from '../data/types';
import { useI18n } from '../i18n';

/**
 * Amount field. Rupiah (and other zero-decimal currencies) are grouped live as you type ("1.250.000");
 * other currencies are a plain decimal field. Pair with `parseAmount(value, currency, lang)`.
 */
export function AmountInput({ value, onChange, currency, autoFocus, id }: {
  value: string; onChange: (v: string) => void; currency: CurrencyCode; autoFocus?: boolean; id?: string;
}) {
  const { lang } = useI18n();
  const grouped = decimalsOf(currency) === 0;
  return (
    <input
      id={id}
      className="input num"
      inputMode={grouped ? 'numeric' : 'decimal'}
      autoFocus={autoFocus}
      placeholder="0"
      value={value}
      onChange={(e) => {
        if (!grouped) return onChange(e.target.value);
        const digits = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
        onChange(digits ? new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US').format(Number(digits)) : '');
      }}
    />
  );
}
