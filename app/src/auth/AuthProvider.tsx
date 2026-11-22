import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Language, Profile, ThemePref } from '../data/types';
import { detectLanguage, I18nProvider, translator } from '../i18n';
import { useToast } from '../components/Toast';
import type { AuthError, SignUpResult } from './backend';
import { authBackend } from './index';
import { TERMS_VERSION } from '../lib/legal';

interface AuthValue {
  profile: Profile | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<AuthError | null>;
  signUp: (fullName: string, email: string, password: string) => Promise<SignUpResult>;
  signOut: () => void;
  changePassword: (newPassword: string) => Promise<AuthError | null>;
  deleteAccount: () => Promise<AuthError | null>;
  acceptTerms: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  /** Language / theme for the signed-in user, or the visitor's own choice before sign-in. */
  language: Language;
  setLanguage: (l: Language) => void;
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
  guestLanguage: Language;
  setGuestLanguage: (l: Language) => void;
}

const Ctx = createContext<AuthValue | null>(null);
const LANG_KEY = 'fa.v1:guestLang';
const THEME_KEY = 'fa.v1:guestTheme';

function readKey<T extends string>(key: string, allowed: T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const profileRef = useRef<Profile | null>(null);
  const [guestLanguage, setGuestLanguageState] = useState<Language>(() => readKey<Language>(LANG_KEY, ['id', 'en'], detectLanguage()));
  const [guestTheme, setGuestThemeState] = useState<ThemePref>(() => readKey<ThemePref>(THEME_KEY, ['light', 'dark', 'system'], 'dark'));

  useEffect(() => {
    const off = authBackend.init((p) => {
      // Ignore no-op refreshes so open forms keep their state.
      if (JSON.stringify(p) !== JSON.stringify(profileRef.current)) {
        profileRef.current = p;
        setProfile(p);
      }
      setReady(true);
    });
    return off;
  }, []);

  const setGuestLanguage = useCallback((l: Language) => {
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
    setGuestLanguageState(l);
  }, []);
  const setGuestTheme = useCallback((t: ThemePref) => {
    try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
    setGuestThemeState(t);
  }, []);

  const signIn = useCallback((email: string, password: string) => authBackend.signIn(email, password), []);
  const signUp = useCallback(
    (fullName: string, email: string, password: string) => authBackend.signUp(fullName, email, password, guestLanguage, guestTheme, TERMS_VERSION),
    [guestLanguage, guestTheme],
  );
  const signOut = useCallback(() => { void authBackend.signOut(); }, []);
  const changePassword = useCallback((pw: string) => authBackend.changePassword(pw), []);
  const deleteAccount = useCallback(() => authBackend.deleteAccount(), []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    const prev = profileRef.current;
    if (!prev) return;
    const next = { ...prev, ...patch, userId: prev.userId, email: prev.email, updatedAt: new Date().toISOString() };
    profileRef.current = next;
    setProfile(next);
    authBackend.saveProfile(next).catch((e) => {
      console.error(e);
      profileRef.current = prev;
      setProfile(prev);
      toast(translator(prev.language)('sync.error'));
    });
  }, [toast]);

  const acceptTerms = useCallback(() => updateProfile({ termsVersion: TERMS_VERSION, termsAcceptedAt: new Date().toISOString() }), [updateProfile]);

  const language = profile?.language ?? guestLanguage;
  const theme = profile?.theme ?? guestTheme;
  const setLanguage = useCallback((l: Language) => (profileRef.current ? updateProfile({ language: l }) : setGuestLanguage(l)), [updateProfile, setGuestLanguage]);
  const setTheme = useCallback((t: ThemePref) => (profileRef.current ? updateProfile({ theme: t }) : setGuestTheme(t)), [updateProfile, setGuestTheme]);

  // Apply theme and document language.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    root.lang = language;
  }, [theme, language]);

  const value = useMemo(
    () => ({ profile, ready, signIn, signUp, signOut, changePassword, deleteAccount, acceptTerms, updateProfile, language, setLanguage, theme, setTheme, guestLanguage, setGuestLanguage }),
    [profile, ready, signIn, signUp, signOut, changePassword, deleteAccount, acceptTerms, updateProfile, language, setLanguage, theme, setTheme, guestLanguage, setGuestLanguage],
  );

  return (
    <Ctx.Provider value={value}>
      <I18nProvider lang={language}>{children}</I18nProvider>
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
