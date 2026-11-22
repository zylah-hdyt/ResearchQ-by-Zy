import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, PieChart, BarChart3, Settings, LogOut, User, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { NotificationBell } from './UserIdentity';
import { ThemeToggle } from './ThemeToggle';
import { AccountMenu } from './AccountMenu';
import { Credit } from './Credit';
import { LogoMark, Wordmark } from './Logo';
import { QuickAddButton, QuickAddProvider, useQuickAdd } from './QuickAdd';
import { PrivacyProvider } from './Privacy';

const NAV: { to: string; label: MessageKey; short?: MessageKey; icon: typeof Wallet }[] = [
  { to: '/', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'nav.transactions', icon: ArrowLeftRight },
  { to: '/accounts', label: 'nav.accounts', short: 'nav.accountsShort', icon: Wallet },
  { to: '/budgets', label: 'nav.budgets', icon: PieChart },
  { to: '/reports', label: 'nav.reports', short: 'nav.reportsShort', icon: BarChart3 },
];
const EXTRA: { to: string; label: MessageKey }[] = [{ to: '/profile', label: 'nav.profile' }, { to: '/settings', label: 'nav.settings' }];

function SideAdd() {
  const { t } = useI18n();
  const { wallets } = useData();
  const { openAdd } = useQuickAdd();
  return <button className="btn primary side-add" onClick={() => openAdd()} disabled={wallets.length === 0}><Plus size={18} aria-hidden />{t('tx.add')}</button>;
}

function Shell() {
  const { t } = useI18n();
  const { signOut } = useAuth();
  const loc = useLocation();
  const isDashboard = loc.pathname === '/';
  const current = [...NAV, ...EXTRA].find((n) => (n.to === '/' ? isDashboard : loc.pathname.startsWith(n.to)));
  useEffect(() => { document.title = `${current ? t(current.label) + ' · ' : ''}MyFi`; }, [current, t]);

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="MyFi"><LogoMark size={32} /><Wordmark /></Link>
        <SideAdd />
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'} className="nav-link"><n.icon size={19} aria-hidden />{t(n.label)}</NavLink>
        ))}
        <div className="spacer" />
        <NavLink to="/profile" className="nav-link"><User size={19} aria-hidden />{t('nav.profile')}</NavLink>
        <NavLink to="/settings" className="nav-link"><Settings size={19} aria-hidden />{t('nav.settings')}</NavLink>
        <button className="nav-link" onClick={signOut}><LogOut size={19} aria-hidden />{t('nav.signOut')}</button>
        <Credit className="sidebar-credit" />
      </aside>
      <div className="main">
        {!isDashboard && (
          <header className="topbar">
            <Link to="/" className="mobile-only" aria-label="MyFi"><LogoMark size={30} /></Link>
            <div className="topbar-actions">
              <QuickAddButton className="mobile-only" />
              <ThemeToggle className="icon-btn desktop-only" />
              <NotificationBell />
              <AccountMenu variant="avatar" />
            </div>
          </header>
        )}
        <main className="content"><Outlet /></main>
      </div>
      <nav className="bottom-nav" aria-label={t('nav.menu')}>
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.to === '/'}><n.icon size={22} aria-hidden />{t(n.short ?? n.label)}</NavLink>
        ))}
      </nav>
    </div>
  );
}

export function Layout() {
  return <PrivacyProvider><QuickAddProvider><Shell /></QuickAddProvider></PrivacyProvider>;
}
