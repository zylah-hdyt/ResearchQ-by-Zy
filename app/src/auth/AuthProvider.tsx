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
  requestPasswordReset: (email: string) => Promise<AuthError | null>;
  /** The visitor arrived through a password-reset link: ask for a new password before anything else. */
  recovery: boolean;
  /** The reset link could not be used (expired, already used, or opened in another browser). */
  resetLinkError: boolean;
  finishRecovery: () => void;
  /** The page was opened from an auth email link (reset or error): skip the welcome story. */
  fromAuthLink: boolean;
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

/** Reset links return to `/?reset=1` (plus Supabase's own `code` or `error*` parameters). */
const RESET_PARAM = 'reset';
function urlFlags() {
  try {
    const q = new URLSearchParams(window.location.search);
    return { reset: q.get(RESET_PARAM) === '1', error: q.has('error') || q.has('error_code') || /error_code=/.test(window.location.hash) };
  } catch {
    return { reset: false, error: false };
  }
}
function clearAuthParams() {
  try {
    const u = new URL(window.location.href);
    for (const k of [RESET_PARAM, 'code', 'error', 'error_code', 'error_description']) u.searchParams.delete(k);
    window.history.replaceState(window.history.state, '', u.toString());
  } catch { /* ignore */ }
}
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
  const [flags] = useState(urlFlags);
  const [recovery, setRecovery] = useState(flags.reset && !flags.error);
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
    }, () => setRecovery(true));
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
  const requestPasswordReset = useCallback((email: string) => {
    const back = `${window.location.origin}${window.location.pathname}?${RESET_PARAM}=1`;
    return authBackend.requestPasswordReset(email, back);
  }, []);
  const finishRecovery = useCallback(() => { clearAuthParams(); setRecovery(false); }, []);
  // A reset link that produced no session (expired, reused, other browser) or came back with an error.
  const resetLinkError = ready && !profile && (flags.error || (flags.reset && recovery));

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
    () => ({ profile, ready, signIn, signUp, signOut, changePassword, deleteAccount, acceptTerms, updateProfile, language, setLanguage, theme, setTheme, guestLanguage, setGuestLanguage, requestPasswordReset, recovery, resetLinkError, finishRecovery, fromAuthLink: flags.reset || flags.error }),
    [profile, ready, signIn, signUp, signOut, changePassword, deleteAccount, acceptTerms, updateProfile, language, setLanguage, theme, setTheme, guestLanguage, setGuestLanguage, requestPasswordReset, recovery, resetLinkError, finishRecovery, flags],
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
