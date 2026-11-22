import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { LogoMark, Wordmark } from '../components/Logo';
import { Aurora, BarsObject, CardObject, CoinObject, Float } from '../components/Scene';
import { Credit } from '../components/Credit';

const SLIDES: { title: MessageKey; text: MessageKey; scene: 'coin' | 'card' | 'bars' }[] = [
  { title: 'welcome.1.title', text: 'welcome.1.text', scene: 'coin' },
  { title: 'welcome.2.title', text: 'welcome.2.text', scene: 'card' },
  { title: 'welcome.3.title', text: 'welcome.3.text', scene: 'bars' },
];

export const WELCOME_KEY = 'myfi.welcomed';
export const markWelcomed = () => { try { localStorage.setItem(WELCOME_KEY, '1'); } catch { /* private mode: it will simply show again */ } };
export const hasWelcomed = () => { try { return localStorage.getItem(WELCOME_KEY) === '1'; } catch { return false; } };

/** First-visit story: three cinematic slides, then sign-up or sign-in. */
export function Welcome({ onDone }: { onDone: (mode: 'in' | 'up') => void }) {
  const { t } = useI18n();
  const { guestLanguage, setGuestLanguage } = useAuth();
  const [i, setI] = useState(0);
  const last = i === SLIDES.length - 1;
  const s = SLIDES[i];
  const finish = (mode: 'in' | 'up') => { markWelcomed(); onDone(mode); };

  return (
    <div className="welcome">
      <Aurora strength={1.2} />
      <header className="welcome-top">
        <div className="brand" style={{ padding: 0 }}><LogoMark size={34} /><Wordmark /></div>
        <div className="row tight">
          <div className="segmented lang" role="group" aria-label={t('settings.language')}>
            {(['id', 'en'] as const).map((l) => <button key={l} className={guestLanguage === l ? 'on' : ''} aria-pressed={guestLanguage === l} onClick={() => setGuestLanguage(l)}>{l.toUpperCase()}</button>)}
          </div>
          {!last && <button className="btn ghost sm welcome-skip" onClick={() => finish('in')}>{t('welcome.skip')}</button>}
        </div>
      </header>

      <main className="welcome-main">
        <div className="welcome-stage" key={s.scene}>
          <Float>
            {s.scene === 'coin' && <CoinObject />}
            {s.scene === 'card' && <CardObject />}
            {s.scene === 'bars' && <BarsObject />}
          </Float>
        </div>
        <div className="welcome-copy" key={i}>
          <h1 className="welcome-title">{t(s.title)}</h1>
          <p className="welcome-text">{t(s.text)}</p>
          <div className="welcome-foot">
            <div className="dots" role="tablist" aria-label={t('welcome.progress')}>
              {SLIDES.map((_, n) => <button key={n} role="tab" aria-selected={n === i} aria-label={`${n + 1} / ${SLIDES.length}`} className={n === i ? 'on' : ''} onClick={() => setI(n)} />)}
            </div>
            {last ? (
              <div className="welcome-cta">
                <button className="btn light lg" onClick={() => finish('up')}>{t('welcome.start')}</button>
                <button className="btn outline lg" onClick={() => finish('in')}>{t('auth.signIn')}</button>
              </div>
            ) : (
              <button className="btn light lg welcome-next" onClick={() => setI(i + 1)} aria-label={t('welcome.next')}><ArrowRight size={20} aria-hidden /></button>
            )}
          </div>
        </div>
      </main>
      <footer className="welcome-credit"><Credit /></footer>
    </div>
  );
}
