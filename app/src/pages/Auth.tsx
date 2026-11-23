import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Languages } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { isCloud } from '../lib/supabase';
import { Credit } from '../components/Credit';
import { ThemeToggle } from '../components/ThemeToggle';
import { LogoMark, Wordmark } from '../components/Logo';
import { Aurora, CardObject, Float } from '../components/Scene';

export function AuthPage({ initialMode = 'in' }: { initialMode?: 'in' | 'up' }) {
  const { t } = useI18n();
  const { signIn, signUp, requestPasswordReset, resetLinkError, guestLanguage, setGuestLanguage } = useAuth();
  const [mode, setMode] = useState<'in' | 'up' | 'forgot'>(resetLinkError ? 'forgot' : initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [linkErr, setLinkErr] = useState(resetLinkError);
  const [busy, setBusy] = useState(false);
  const [agree, setAgree] = useState(false);
  // Basic bot friction: a hidden field humans never fill, and a minimum time on the form.
  const [trap, setTrap] = useState('');
  const shownAt = useRef(Date.now());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkErr(false);
    if (mode === 'forgot') {
      setBusy(true);
      const r = await requestPasswordReset(email);
      setBusy(false);
      if (r) { setInfo(null); setErr(t(`auth.err.${r}` as MessageKey)); } else { setErr(null); setInfo(t('auth.reset.sent')); }
      return;
    }
    if (mode === 'up') {
      if (!agree) return setErr(t('auth.err.consent'));
      if (trap || Date.now() - shownAt.current < 2500) return setErr(t('auth.err.generic'));
    }
    setBusy(true);
    const res = mode === 'in' ? await signIn(email, password) : await signUp(name, email, password);
    setBusy(false);
    if (res === 'confirm') {
      setErr(null);
      setInfo(t('auth.confirmEmail'));
      setMode('in');
      setPassword('');
      return;
    }
    setInfo(null);
    setErr(res ? t(`auth.err.${res}` as MessageKey) : null);
  };

  return (
    <div className="auth">
      <div className="auth-side">
        <Aurora strength={1.1} />
        <div className="brand" style={{ padding: 0 }}><LogoMark size={36} /><Wordmark tagline={t('app.tagline')} /></div>
        <div className="auth-art"><Float><CardObject /></Float></div>
        <div><h1>{t('auth.welcome')}</h1><p>{t('auth.subtitle')}</p></div>
        <button className="btn auth-lang"

          onClick={() => setGuestLanguage(guestLanguage === 'id' ? 'en' : 'id')}>
          <Languages size={16} />{guestLanguage === 'id' ? 'English' : 'Bahasa Indonesia'}
        </button>
      </div>
      <div className="auth-form">
        <div className="auth-tools"><ThemeToggle /></div>
        <form onSubmit={submit} noValidate>
          <h1>{mode === 'in' ? t('auth.signIn') : mode === 'up' ? t('auth.signUp') : t('auth.reset.title')}</h1>
          {linkErr && <div className="banner" role="alert">{t('auth.reset.linkError')}</div>}
          {mode === 'forgot' && <p className="muted">{t('auth.reset.intro')}</p>}
          {mode === 'up' && (
            <label className="field">{t('auth.fullName')}<input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>
          )}
          <label className="field">{t('auth.email')}<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
          {mode !== 'forgot' && <label className="field">{t('auth.password')}<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required minLength={8} /></label>}
          {mode === 'in' && <button type="button" className="btn ghost sm auth-forgot" onClick={() => { setMode('forgot'); setErr(null); setInfo(null); }}>{t('auth.forgot')}</button>}
          {mode === 'up' && (
            <>
              <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} />
              <label className="row" style={{ alignItems: 'flex-start', gap: 10, fontSize: '.88rem' }}>
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
                <span>{t('auth.agree')} <Link to="/terms" className="link">{t('legal.terms')}</Link> {t('auth.and')} <Link to="/privacy" className="link">{t('legal.privacy')}</Link>.</span>
              </label>
            </>
          )}
          {info && <div className="banner" role="status">{info}</div>}
          {err && <div className="error" role="alert">{err}</div>}
          <button className="btn primary lg" type="submit" disabled={busy}>{busy ? t('common.loading') : mode === 'in' ? t('auth.signIn') : mode === 'up' ? t('auth.signUp') : t('auth.reset.send')}</button>
          {mode === 'forgot' ? (
            <button type="button" className="btn ghost sm" style={{ alignSelf: 'center', color: 'var(--brand-ink)' }} onClick={() => { setMode('in'); setErr(null); setInfo(null); setLinkErr(false); }}>{t('auth.reset.back')}</button>
          ) : (
          <div className="small muted" style={{ textAlign: 'center' }}>
            {mode === 'in' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <button type="button" className="btn ghost sm" style={{ color: 'var(--brand)' }} onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setErr(null); setInfo(null); shownAt.current = Date.now(); }}>
              {mode === 'in' ? t('auth.signUp') : t('auth.signIn')}
            </button>
          </div>
          )}
          {!isCloud && <p className="hint" style={{ textAlign: 'center' }}>{t('auth.localNote')}</p>}
        </form>
        <div className="auth-credit">
          <Link to="/terms" className="link">{t('legal.terms')}</Link> · <Link to="/privacy" className="link">{t('legal.privacy')}</Link>
          <div><Credit /></div>
        </div>
      </div>
    </div>
  );
}
