import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';

function systemDark() {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch { return false; }
}

/** Effective light/dark for the current preference ("system" follows the device). */
export function useResolvedTheme(): 'light' | 'dark' {
  const { theme } = useAuth();
  const [sys, setSys] = useState(systemDark);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setSys(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return theme === 'system' ? (sys ? 'dark' : 'light') : theme;
}

/** One-tap light ⇄ dark switch (icon shows the theme you will switch to). */
export function ThemeToggle({ className = 'icon-btn' }: { className?: string }) {
  const { setTheme } = useAuth();
  const { t } = useI18n();
  const resolved = useResolvedTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';
  return (
    <button className={className} onClick={() => setTheme(next)} aria-label={t('theme.toggle')} title={t('theme.toggle')}>
      {resolved === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
}
