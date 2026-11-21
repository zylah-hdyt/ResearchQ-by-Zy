import { useState } from 'react';
import { Wallet, Languages } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { isCloud } from '../lib/supabase';
import { Credit } from '../components/Credit';

export function AuthPage() {
  const { t } = useI18n();
  const { signIn, signUp, guestLanguage, setGuestLanguage } = useAuth();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        <div className="brand" style={{ padding: 0 }}><span className="brand-mark" style={{ background: 'rgba(255,255,255,.18)' }}><Wallet size={17} /></span>{t('app.name')}<span style={{ fontWeight: 400, opacity: .75, marginLeft: 8 }}>{t('app.tagline')}</span></div>
        <div><h1>{t('auth.welcome')}</h1><p>{t('auth.subtitle')}</p></div>
        <button className="btn" style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,.14)', border: 'none', color: '#fff' }}
          onClick={() => setGuestLanguage(guestLanguage === 'id' ? 'en' : 'id')}>
          <Languages size={16} />{guestLanguage === 'id' ? 'English' : 'Bahasa Indonesia'}
        </button>
      </div>
      <div className="auth-form">
        <form onSubmit={submit} noValidate>
          <h1>{mode === 'in' ? t('auth.signIn') : t('auth.signUp')}</h1>
          {mode === 'up' && (
            <label className="field">{t('auth.fullName')}<input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>
          )}
          <label className="field">{t('auth.email')}<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
          <label className="field">{t('auth.password')}<input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} required minLength={8} /></label>
          {info && <div className="banner" role="status">{info}</div>}
          {err && <div className="error" role="alert">{err}</div>}
          <button className="btn primary" type="submit" disabled={busy} style={{ height: 44 }}>{busy ? t('common.loading') : mode === 'in' ? t('auth.signIn') : t('auth.signUp')}</button>
          <div className="small muted" style={{ textAlign: 'center' }}>
            {mode === 'in' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <button type="button" className="btn ghost sm" style={{ color: 'var(--brand)' }} onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setErr(null); setInfo(null); }}>
              {mode === 'in' ? t('auth.signUp') : t('auth.signIn')}
            </button>
          </div>
          {!isCloud && <p className="hint" style={{ textAlign: 'center' }}>{t('auth.localNote')}</p>}
        </form>
        <Credit className="auth-credit" />
      </div>
    </div>
  );
}
