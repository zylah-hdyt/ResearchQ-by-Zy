import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Language, Profile } from '../data/types';
import { storage } from '../data/storage';
import { hashPassword, newSalt } from '../lib/password';
import { uid } from '../lib/id';
import { detectLanguage, I18nProvider } from '../i18n';

type AuthError = 'invalid' | 'exists' | 'password' | 'email' | 'name';

interface AuthValue {
  profile: Profile | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signUp: (fullName: string, email: string, password: string) => Promise<AuthError | null>;
  signOut: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  guestLanguage: Language;
  setGuestLanguage: (l: Language) => void;
}

const Ctx = createContext<AuthValue | null>(null);
const LANG_KEY = 'fa.v1:guestLang';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [guestLanguage, setGuestLanguageState] = useState<Language>(
    () => (localStorage.getItem(LANG_KEY) as Language) || detectLanguage(),
  );

  useEffect(() => {
    const s = storage.getSession();
    if (s) setProfile(storage.getProfile(s.userId));
    setReady(true);
  }, []);

  const setGuestLanguage = (l: Language) => {
    localStorage.setItem(LANG_KEY, l);
    setGuestLanguageState(l);
  };

  const signIn = useCallback(async (email: string, password: string) => {
    const acc = storage.listAccounts().find((a) => a.email === email.trim().toLowerCase());
    if (!acc) return 'invalid' as const;
    const h = await hashPassword(password, acc.salt);
    if (h !== acc.passwordHash) return 'invalid' as const;
    storage.setSession({ userId: acc.id });
    setProfile(storage.getProfile(acc.id));
    return null;
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      const e = email.trim().toLowerCase();
      if (!fullName.trim()) return 'name' as const;
      if (!EMAIL_RE.test(e)) return 'email' as const;
      if (password.length < 8) return 'password' as const;
      const accounts = storage.listAccounts();
      if (accounts.some((a) => a.email === e)) return 'exists' as const;
      const salt = newSalt();
      const now = new Date().toISOString();
      const acc = { id: uid('u_'), email: e, salt, passwordHash: await hashPassword(password, salt), createdAt: now };
      storage.saveAccounts([...accounts, acc]);
      const p: Profile = {
        userId: acc.id,
        email: e,
        fullName: fullName.trim(),
        displayName: '',
        avatarDataUrl: null,
        phone: '',
        country: guestLanguage === 'id' ? 'Indonesia' : '',
        dateOfBirth: '',
        preferredCurrency: guestLanguage === 'id' ? 'IDR' : 'USD',
        language: guestLanguage,
        theme: 'system',
        weekStartsOn: 1,
        budgetAlerts: true,
        updatedAt: now,
      };
      storage.saveProfile(p);
      storage.setSession({ userId: acc.id });
      setProfile(p);
      return null;
    },
    [guestLanguage],
  );

  const signOut = useCallback(() => {
    storage.setSession(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch, userId: prev.userId, email: prev.email, updatedAt: new Date().toISOString() };
      storage.saveProfile(next);
      return next;
    });
  }, []);

  // Apply theme preference.
  useEffect(() => {
    const theme = profile?.theme ?? 'system';
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    root.lang = profile?.language ?? guestLanguage;
  }, [profile?.theme, profile?.language, guestLanguage]);

  const value = useMemo(
    () => ({ profile, ready, signIn, signUp, signOut, updateProfile, guestLanguage, setGuestLanguage }),
    [profile, ready, signIn, signUp, signOut, updateProfile, guestLanguage],
  );

  return (
    <Ctx.Provider value={value}>
      <I18nProvider lang={profile?.language ?? guestLanguage}>{children}</I18nProvider>
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}

/** Name used in greetings: preferred display name, else first name, else email local part. */
export function greetingName(p: Profile): string {
  if (p.displayName.trim()) return p.displayName.trim();
  const first = p.fullName.trim().split(/\s+/)[0];
  return first || p.email.split('@')[0];
}
