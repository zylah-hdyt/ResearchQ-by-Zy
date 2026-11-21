import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, PieChart, BarChart3, Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { NotificationBell, ProfileChip } from './UserIdentity';
import { Credit } from './Credit';

const NAV: { to: string; label: MessageKey; short?: MessageKey; icon: typeof Wallet }[] = [
  { to: '/', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'nav.transactions', icon: ArrowLeftRight },
  { to: '/accounts', label: 'nav.accounts', short: 'nav.accountsShort', icon: Wallet },
  { to: '/budgets', label: 'nav.budgets', icon: PieChart },
  { to: '/reports', label: 'nav.reports', short: 'nav.reportsShort', icon: BarChart3 },
];

export function Layout() {
  const { t } = useI18n();
  const { signOut } = useAuth();
  const loc = useLocation();
  const current = [...NAV, { to: '/profile', label: 'nav.profile' as MessageKey }, { to: '/settings', label: 'nav.settings' as MessageKey }]
    .find((n) => (n.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(n.to)));
  const isDashboard = loc.pathname === '/';

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Wallet size={17} /></span>{t('app.name')}</div>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-link"><n.icon size={18} />{t(n.label)}</NavLink>
        ))}
        <div className="spacer" />
        <NavLink to="/profile" className="nav-link"><User size={18} />{t('nav.profile')}</NavLink>
        <NavLink to="/settings" className="nav-link"><Settings size={18} />{t('nav.settings')}</NavLink>
        <button className="nav-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={signOut}><LogOut size={18} />{t('nav.signOut')}</button>
        <Credit className="sidebar-credit" />
      </aside>
      <div className="main">
        {!isDashboard && (
          <header className="topbar">
            <span className="topbar-title">{current ? t(current.label) : ''}</span>
            <div className="topbar-actions">
              <NotificationBell />
              <ProfileChip />
            </div>
          </header>
        )}
        <main className="content"><Outlet /></main>
      </div>
      <nav className="bottom-nav" aria-label={t('nav.menu')}>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}><n.icon size={20} />{t(n.short ?? n.label)}</NavLink>
        ))}
      </nav>
    </div>
  );
}
