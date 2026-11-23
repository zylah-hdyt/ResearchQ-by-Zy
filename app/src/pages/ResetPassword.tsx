import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { useToast } from '../components/Toast';
import { LogoMark, Wordmark } from '../components/Logo';
import { Aurora } from '../components/Scene';

/** Shown after a password-reset link signed the user in: choose a new password before entering the app. */
export function ResetPassword() {
  const { t } = useI18n();
  const toast = useToast();
  const { profile, changePassword, finishRecovery } = useAuth();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setErr(t('auth.err.password'));
    if (pw !== pw2) return setErr(t('auth.newPw.mismatch'));
    setBusy(true);
    const r = await changePassword(pw);
    setBusy(false);
    if (r) return setErr(t(`auth.err.${r}` as MessageKey));
    toast(t('auth.newPw.done'));
    finishRecovery();
  };

  return (
    <div className="reset-page">
      <Aurora />
      <form className="card reset-card" onSubmit={submit} noValidate>
        <div className="brand" style={{ padding: 0 }}><LogoMark size={32} /><Wordmark /></div>
        <h1>{t('auth.newPw.title')}</h1>
        <p className="muted">{t('auth.newPw.intro', { email: profile?.email ?? '' })}</p>
        <label className="field">{t('auth.newPw.password')}<input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" minLength={8} required autoFocus /></label>
        <label className="field">{t('auth.newPw.confirm')}<input className="input" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" minLength={8} required /></label>
        {err && <div className="error" role="alert">{err}</div>}
        <button className="btn primary lg" type="submit" disabled={busy}>{busy ? t('common.loading') : t('auth.newPw.save')}</button>
        <button className="btn ghost" type="button" onClick={finishRecovery}>{t('auth.newPw.later')}</button>
      </form>
    </div>
  );
}
