import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, CalendarClock, CircleAlert, Sparkles } from 'lucide-react';
import { greetingName, useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { categoryLabel, useI18n } from '../i18n';
import { dayPart } from '../lib/greeting';
import { formatDate, formatMoney, formatPercent } from '../lib/format';
import { deriveNotifications } from '../lib/notifications';
import { Avatar } from './Avatar';
import { ThemeToggle } from './ThemeToggle';
import { AccountMenu } from './AccountMenu';
import { QuickAddButton } from './QuickAdd';
import { SearchButton } from './GlobalSearch';
import type { MessageKey } from '../i18n/en';

/** Re-renders every minute so the greeting follows the local clock. */
function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function NotificationBell() {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const data = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const items = useMemo(() => deriveNotifications(data, profile!), [data, profile]);
  const unread = items.filter((n) => !data.readNotifications.includes(n.id));

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="icon-btn" aria-label={t('nav.notifications')} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Bell size={20} />
        {unread.length > 0 && <span className="dot">{unread.length}</span>}
      </button>
      {open && (
        <div className="popover" role="dialog" aria-label={t('notif.title')}>
          <div className="row between" style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <strong>{t('notif.title')}</strong>
            {unread.length > 0 && (
              <button className="btn ghost sm" onClick={() => data.markNotificationsRead(unread.map((n) => n.id))}>{t('notif.markAll')}</button>
            )}
          </div>
          <div style={{ padding: '4px 14px 8px' }}>
            {items.length === 0 && <div className="empty small">{t('notif.empty')}</div>}
            {items.map((n) => {
              const isRead = data.readNotifications.includes(n.id);
              const l = n.line;
              const d = n.debt;
              const debtText = d ? t(`notif.${n.kind as 'debtDue' | 'debtOverdue'}.${d.side}` as MessageKey, { name: d.name, amount: formatMoney(d.remaining, profile!.preferredCurrency, lang), date: formatDate(d.due!, lang) }) : '';
              const text =
                n.kind === 'welcome' ? t('notif.welcome')
                : d ? debtText
                : n.kind === 'budgetWarning' ? t('notif.budgetWarning', { category: categoryLabel(l!.category, t), pct: formatPercent(l!.utilization, lang) })
                : t('notif.budgetExceeded', { category: categoryLabel(l!.category, t), amount: formatMoney(-l!.remaining, l!.budget.currency, lang) });
              const Icon = n.kind === 'welcome' ? Sparkles : d ? CalendarClock : n.kind === 'budgetWarning' ? AlertTriangle : CircleAlert;
              const color = n.kind === 'welcome' ? 'var(--brand)' : n.kind === 'budgetWarning' || n.kind === 'debtDue' ? 'var(--warn)' : 'var(--danger)';
              return (
                <Link key={n.id} to={n.kind === 'welcome' ? '/accounts' : d ? '/business' : '/budgets'} className="insight" style={{ opacity: isRead ? 0.6 : 1 }}
                  onClick={() => { data.markNotificationsRead([n.id]); setOpen(false); }}>
                  <Icon size={18} color={color} style={{ flex: 'none', marginTop: 2 }} />
                  <span>{text}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProfileChip() {
  const { profile } = useAuth();
  const { t } = useI18n();
  if (!profile) return null;
  return (
    <Link to="/profile" className="profile-chip" aria-label={t('nav.profile')}>
      <Avatar profile={profile} size={34} />
      <span className="name">{greetingName(profile)}</span>
    </Link>
  );
}

/** Dashboard header: local-time greeting, name from the authenticated profile, avatar, notifications. */
export function GreetingHeader() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const now = useNow();
  if (!profile) return null;
  const key = `greeting.${dayPart(now)}` as MessageKey;
  return (
    <section className="identity" aria-label={t('nav.profile')}>
      <div className="identity-main">
        <Link to="/profile" aria-label={t('nav.profile')}><Avatar profile={profile} size={48} /></Link>
        <div style={{ minWidth: 0 }}>
          <h1>{t(key, { name: greetingName(profile) })}</h1>
          <p>{t('greeting.subtitle')}</p>
        </div>
      </div>
      <div className="identity-actions">
        <SearchButton />
        <QuickAddButton className="mobile-only" />
        <ThemeToggle className="icon-btn desktop-only" />
        <NotificationBell />
        <AccountMenu />
      </div>
    </section>
  );
}
