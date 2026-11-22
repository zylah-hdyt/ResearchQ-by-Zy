import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { LogoMark, Wordmark } from '../components/Logo';
import { Credit } from '../components/Credit';

/** Shown after sign-in when the user has not accepted the current Terms / Privacy Policy version. */
export function ConsentScreen() {
  const { t } = useI18n();
  const { acceptTerms, signOut } = useAuth();
  const [agree, setAgree] = useState(false);
  return (
    <div className="state" style={{ minHeight: '100%', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ maxWidth: 440, width: '100%', textAlign: 'left' }}>
        <div className="row" style={{ marginBottom: 14 }}><LogoMark size={34} /><Wordmark /></div>
        <h1 style={{ fontSize: '1.25rem' }}>{t('consent.title')}</h1>
        <p className="muted">{t('consent.body')}</p>
        <label className="row" style={{ alignItems: 'flex-start', gap: 10, margin: '14px 0' }}>
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
          <span>{t('auth.agree')} <Link to="/terms" className="link">{t('legal.terms')}</Link> {t('auth.and')} <Link to="/privacy" className="link">{t('legal.privacy')}</Link>.</span>
        </label>
        <div className="row between">
          <button className="btn ghost" onClick={signOut}><LogOut size={16} />{t('nav.signOut')}</button>
          <button className="btn primary" disabled={!agree} onClick={acceptTerms}>{t('consent.accept')}</button>
        </div>
      </div>
      <Credit />
    </div>
  );
}
