import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useI18n } from '../i18n';

function Fallback() {
  const { t } = useI18n();
  return (
    <div className="state" role="alert" style={{ minHeight: '100%', justifyContent: 'center' }}>
      <strong>{t('error.title')}</strong>
      <span className="muted">{t('error.body')}</span>
      <button className="btn primary" onClick={() => window.location.reload()}>{t('error.reload')}</button>
    </div>
  );
}

/** Catches rendering errors so a bug never leaves a blank screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info.componentStack); }
  render() { return this.state.failed ? <Fallback /> : this.props.children; }
}
