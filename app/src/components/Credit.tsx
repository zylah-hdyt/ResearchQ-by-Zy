import { useI18n } from '../i18n';

/** Author credit shown on the sign-in page, in the sidebar and in settings. */
export function Credit({ className = '' }: { className?: string }) {
  const { t } = useI18n();
  return <span className={`credit ${className}`}>{t('app.credit')}</span>;
}
