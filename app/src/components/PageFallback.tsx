import { useI18n } from '../i18n';

/** Shown for the split second a page's code is loading. */
export function PageFallback() {
  const { t } = useI18n();
  return <div className="state" role="status" style={{ minHeight: '40vh', justifyContent: 'center' }}><div className="spinner" /><span className="sr-only">{t('common.loading')}</span></div>;
}
