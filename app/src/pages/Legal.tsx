import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useI18n } from '../i18n';
import { Credit } from '../components/Credit';
import { LogoMark, Wordmark } from '../components/Logo';
import { ThemeToggle } from '../components/ThemeToggle';
import { legalDocs, TERMS_VERSION } from '../lib/legal';
import { formatDate } from '../lib/format';
import type { Language } from '../data/types';

/** Public page (no sign-in needed) for the Terms of Service or the Privacy Policy. */
export function LegalPage({ kind }: { kind: 'terms' | 'privacy' }) {
  const { t, lang } = useI18n();
  const { profile, setLanguage } = useAuth();
  const nav = useNavigate();
  const doc = legalDocs(lang)[kind];
  const other = kind === 'terms' ? 'privacy' : 'terms';
  return (
    <div className="legal">
      <header className="legal-head">
        <Link to="/" className="brand" style={{ padding: 0 }} aria-label="MyFi"><LogoMark size={30} /><Wordmark /></Link>
        <div className="row">
          <div className="segmented">
            {(['id', 'en'] as Language[]).map((l) => (
              <button key={l} className={lang === l ? 'on' : ''} onClick={() => setLanguage(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </header>
      <article>
        <button className="btn ghost sm" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} style={{ marginLeft: -10 }}><ArrowLeft size={16} />{profile ? t('legal.back') : t('legal.signin')}</button>
        <h1 style={{ marginTop: 10 }}>{doc.title}</h1>
        <p className="muted small">{t('legal.updated', { date: formatDate(TERMS_VERSION, lang, { day: 'numeric', month: 'long', year: 'numeric' }) })}</p>
        <p>{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            {s.p?.map((x, i) => <p key={i}>{x}</p>)}
            {s.list && <ul>{s.list.map((x, i) => <li key={i}>{x}</li>)}</ul>}
          </section>
        ))}
      </article>
      <footer className="legal-foot">
        <Link to={`/${other}`}>{t(other === 'terms' ? 'legal.terms' : 'legal.privacy')}</Link>
        <Credit />
      </footer>
    </div>
  );
}
