import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Trash2, Settings, LogOut } from 'lucide-react';
import { greetingName, useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { Avatar } from '../components/Avatar';
import { useToast } from '../components/Toast';
import { resizeImage } from '../lib/avatar';
import { formatDate } from '../lib/format';
import { storage } from '../data/storage';

/** Shared identity card — same avatar + name presentation as the dashboard greeting. */
export function IdentityCard({ children }: { children?: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const { t, lang } = useI18n();
  const since = profile!.createdAt ?? storage.listAccounts().find((a) => a.id === profile!.userId)?.createdAt;
  return (
    <section className="card identity">
      <div className="identity-main">
        <Avatar profile={profile!} size={64} />
        <div style={{ minWidth: 0 }}>
          <h1>{profile!.fullName || greetingName(profile!)}</h1>
          <p>{profile!.email}</p>
          {since && <p className="small">{t('profile.memberSince', { date: formatDate(since.slice(0, 10), lang, { month: 'long', year: 'numeric' }) })}</p>}
        </div>
      </div>
      <div className="row wrap" style={{ justifyContent: 'flex-end' }}>
        {children}
        <button className="btn" onClick={signOut}><LogOut size={16} />{t('nav.signOut')}</button>
      </div>
    </section>
  );
}

export function Profile() {
  const { t } = useI18n();
  const toast = useToast();
  const { profile, updateProfile } = useAuth();
  const p = profile!;
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ fullName: p.fullName, displayName: p.displayName, phone: p.phone, country: p.country, dateOfBirth: p.dateOfBirth });
  const [err, setErr] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    try {
      updateProfile({ avatarDataUrl: await resizeImage(f) });
      setErr(null);
      toast(t('common.saved'));
    } catch {
      setErr(t('profile.err.photo'));
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return setErr(t('auth.err.name'));
    updateProfile({ ...form, fullName: form.fullName.trim(), displayName: form.displayName.trim() });
    setErr(null);
    toast(t('common.saved'));
  };

  return (
    <>
      <IdentityCard>
        <Link to="/settings" className="btn"><Settings size={16} />{t('nav.settings')}</Link>
      </IdentityCard>

      <section className="card">
        <div className="card-head"><h2>{t('profile.photo')}</h2></div>
        <div className="row wrap" style={{ gap: 16 }}>
          <Avatar profile={p} size={72} />
          <div className="stack" style={{ gap: 8 }}>
            <div className="row wrap">
              <button className="btn" onClick={() => fileRef.current?.click()}><Camera size={16} />{t('profile.upload')}</button>
              {p.avatarDataUrl && <button className="btn ghost danger" onClick={() => updateProfile({ avatarDataUrl: null })}><Trash2 size={16} />{t('profile.remove')}</button>}
            </div>
            <span className="hint">{t('profile.photoHint')}</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
        </div>
      </section>

      <form className="card" onSubmit={save}>
        <div className="card-head"><h2>{t('profile.personal')}</h2></div>
        <div className="form-grid">
          <label className="field">{t('profile.fullName')}<input className="input" value={form.fullName} onChange={set('fullName')} maxLength={80} autoComplete="name" /></label>
          <label className="field">{t('profile.displayName')}<input className="input" value={form.displayName} onChange={set('displayName')} maxLength={40} autoComplete="nickname" />
            <span className="hint">{t('profile.displayNameHint')}</span></label>
          <label className="field">{t('profile.email')}<input className="input" value={p.email} disabled /></label>
          <label className="field">{t('profile.phone')}<input className="input" value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" /></label>
          <label className="field">{t('profile.country')}<input className="input" value={form.country} onChange={set('country')} autoComplete="country-name" /></label>
          <label className="field">{t('profile.dob')}<input className="input" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} /></label>
        </div>
        {err && <div className="error" role="alert" style={{ marginTop: 12 }}>{err}</div>}
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}><button className="btn primary" type="submit">{t('common.save')}</button></div>
      </form>
    </>
  );
}
