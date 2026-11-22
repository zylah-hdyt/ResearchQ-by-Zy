import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EllipsisVertical, LogOut, Settings as SettingsIcon, User } from 'lucide-react';
import { greetingName, useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import type { Language } from '../data/types';
import { Avatar } from './Avatar';
import { useResolvedTheme } from './ThemeToggle';

/** Account menu: profile, settings, language, theme and sign out — reachable on phones as well as desktop. */
export function AccountMenu({ variant = 'dots' }: { variant?: 'dots' | 'avatar' }) {
  const { t } = useI18n();
  const { profile, language, setLanguage, setTheme, signOut } = useAuth();
  const resolved = useResolvedTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!profile) return null;
  return (
    <div style={{ position: 'relative' }} ref={ref}>
      {variant === 'avatar' ? (
        <button className="profile-chip" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={t('menu.account')}>
          <Avatar profile={profile} size={34} />
          <span className="name">{greetingName(profile)}</span>
        </button>
      ) : (
        <button className="icon-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={t('menu.account')}>
          <EllipsisVertical size={20} />
        </button>
      )}
      {open && (
        <div className="popover menu" role="menu">
          <div className="menu-head">
            <Avatar profile={profile} size={40} />
            <div style={{ minWidth: 0 }}>
              <div className="menu-name">{profile.fullName || greetingName(profile)}</div>
              <div className="muted small menu-email">{profile.email}</div>
            </div>
          </div>
          <Link to="/profile" className="menu-item" role="menuitem"><User size={17} />{t('nav.profile')}</Link>
          <Link to="/settings" className="menu-item" role="menuitem"><SettingsIcon size={17} />{t('nav.settings')}</Link>
          <div className="menu-row">
            <span className="muted small">{t('settings.language')}</span>
            <div className="segmented">
              {(['id', 'en'] as Language[]).map((l) => (
                <button key={l} className={language === l ? 'on' : ''} onClick={() => setLanguage(l)}>{l === 'id' ? 'ID' : 'EN'}</button>
              ))}
            </div>
          </div>
          <div className="menu-row">
            <span className="muted small">{t('settings.theme')}</span>
            <div className="segmented">
              {(['light', 'dark'] as const).map((x) => (
                <button key={x} className={resolved === x ? 'on' : ''} onClick={() => setTheme(x)}>{t(`settings.theme.${x}`)}</button>
              ))}
            </div>
          </div>
          <button className="menu-item danger" role="menuitem" onClick={signOut}><LogOut size={17} />{t('nav.signOut')}</button>
        </div>
      )}
    </div>
  );
}
