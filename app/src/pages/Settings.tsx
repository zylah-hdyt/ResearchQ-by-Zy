import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useData } from '../store/DataProvider';
import { useI18n } from '../i18n';
import { CURRENCIES, type CurrencyCode, type Language, type ThemePref } from '../data/types';
import { useToast } from '../components/Toast';
import { IdentityCard } from './Profile';
import { Credit } from '../components/Credit';
import { Modal } from '../components/Modal';
import { parseNumber } from '../lib/money';

export function Settings() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { profile, updateProfile, changePassword, deleteAccount } = useAuth();
  const data = useData();
  const [pw, setPw] = useState({ next: '', confirm: '' });
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwBusy, setPwBusy] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [delText, setDelText] = useState('');
  const [delBusy, setDelBusy] = useState(false);
  const [delErr, setDelErr] = useState<string | null>(null);
  const word = t('settings.deleteWord');
  const submitDelete = async () => {
    setDelBusy(true);
    const res = await deleteAccount();
    setDelBusy(false);
    if (res) return setDelErr(t('auth.err.generic'));
    toast(t('settings.accountDeleted'));
  };
  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8) return setPwErr(t('auth.err.password'));
    if (pw.next !== pw.confirm) return setPwErr(t('settings.passwordMismatch'));
    setPwBusy(true);
    const res = await changePassword(pw.next);
    setPwBusy(false);
    if (res) return setPwErr(t(res === 'password' ? 'auth.err.password' : 'auth.err.generic'));
    setPwErr(null);
    setPw({ next: '', confirm: '' });
    toast(t('settings.passwordChanged'));
  };
  const p = profile!;
  const others = [...new Set([...data.wallets.map((w) => w.currency), ...data.budgets.map((b) => b.currency), ...data.rates.map((r) => r.code)])].filter((c) => c !== p.preferredCurrency);
  const [rates, setRates] = useState<Record<string, string>>(() => Object.fromEntries(data.rates.map((r) => [r.code, String(r.rate)])));
  const [extra, setExtra] = useState<CurrencyCode | ''>('');
  const shown = [...new Set([...others, ...(extra ? [extra] : [])])];

  const changeBase = (c: CurrencyCode) => {
    // Rates are relative to the base; re-express them so existing values stay correct.
    const old = data.rates.find((r) => r.code === c)?.rate;
    if (old && old > 0) {
      const next = data.rates.filter((r) => r.code !== c).map((r) => ({ code: r.code, rate: Math.round((r.rate / old) * 1e6) / 1e6 }));
      next.push({ code: p.preferredCurrency, rate: Math.round((1 / old) * 1e6) / 1e6 });
      data.setRates(next);
      setRates(Object.fromEntries(next.map((r) => [r.code, String(r.rate)])));
    }
    updateProfile({ preferredCurrency: c });
    toast(t('common.saved'));
  };

  const saveRates = () => {
    const list = Object.entries(rates)
      .map(([code, v]) => ({ code: code as CurrencyCode, rate: parseNumber(String(v), lang) }))
      .filter((r) => r.code !== p.preferredCurrency && Number.isFinite(r.rate) && r.rate > 0);
    data.setRates(list);
    toast(t('common.saved'));
  };

  return (
    <>
      <IdentityCard>
        <Link to="/profile" className="btn"><User size={16} />{t('nav.profile')}</Link>
      </IdentityCard>

      <section className="card">
        <div className="card-head"><h2>{t('settings.preferences')}</h2></div>
        <div className="form-grid">
          <label className="field">{t('settings.language')}
            <select className="input" value={p.language} onChange={(e) => updateProfile({ language: e.target.value as Language })}>
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="field">{t('settings.currency')}
            <select className="input" value={p.preferredCurrency} onChange={(e) => changeBase(e.target.value as CurrencyCode)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <span className="hint">{t('settings.currencyHint')}</span>
          </label>
          <label className="field">{t('settings.theme')}
            <select className="input" value={p.theme} onChange={(e) => updateProfile({ theme: e.target.value as ThemePref })}>
              {(['system', 'light', 'dark'] as ThemePref[]).map((x) => <option key={x} value={x}>{t(`settings.theme.${x}`)}</option>)}
            </select>
          </label>
          <label className="field">{t('settings.weekStart')}
            <select className="input" value={p.weekStartsOn} onChange={(e) => updateProfile({ weekStartsOn: Number(e.target.value) as 0 | 1 })}>
              <option value={1}>{t('settings.monday')}</option>
              <option value={0}>{t('settings.sunday')}</option>
            </select>
          </label>
          <label className="field full row" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, color: 'var(--text)' }}>
            <input type="checkbox" checked={p.budgetAlerts} onChange={(e) => updateProfile({ budgetAlerts: e.target.checked })} style={{ marginTop: 3 }} />
            <span>{t('settings.budgetAlerts')}<br /><span className="hint">{t('settings.budgetAlertsHint')}</span></span>
          </label>
        </div>
      </section>

      <form className="card" onSubmit={submitPassword}>
        <div className="card-head"><h2>{t('settings.changePassword')}</h2></div>
        <div className="form-grid">
          <label className="field">{t('settings.newPassword')}
            <input className="input" type="password" autoComplete="new-password" minLength={8} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            <span className="hint">{t('settings.passwordHint')}</span>
          </label>
          <label className="field">{t('settings.confirmPassword')}
            <input className="input" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </label>
        </div>
        {pwErr && <div className="error" role="alert" style={{ marginTop: 10 }}>{pwErr}</div>}
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}><button className="btn primary" type="submit" disabled={pwBusy || !pw.next}>{t('common.save')}</button></div>
      </form>

      <section className="card">
        <div className="card-head"><h2>{t('settings.rates')}</h2></div>
        <p className="muted small" style={{ marginTop: 0 }}>{t('settings.ratesHint', { base: p.preferredCurrency })}</p>
        <div className="form-grid">
          {shown.map((c) => (
            <label key={c} className="field">1 {c} = ? {p.preferredCurrency}
              <input className="input num" inputMode="decimal" value={rates[c] ?? ''} onChange={(e) => setRates((r) => ({ ...r, [c]: e.target.value }))} />
            </label>
          ))}
          <label className="field">{t('common.add')}
            <select className="input" value="" onChange={(e) => setExtra(e.target.value as CurrencyCode)}>
              <option value="">—</option>
              {CURRENCIES.filter((c) => c !== p.preferredCurrency && !shown.includes(c)).map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 14 }}><button className="btn primary" onClick={saveRates}>{t('common.save')}</button></div>
      </section>

      <section className="card">
        <div className="card-head"><h2>{t('settings.danger')}</h2></div>
        <div className="stack">
          <div><button className="btn danger" onClick={() => { if (confirm(t('settings.deleteConfirm'))) { data.clearAll(); toast(t('common.saved')); } }}>{t('settings.deleteData')}</button></div>
          <div>
            <button className="btn danger" onClick={() => { setDelText(''); setDelErr(null); setDelOpen(true); }}>{t('settings.deleteAccount')}</button>
            <p className="hint" style={{ margin: '8px 0 0' }}>{t('settings.deleteAccountHint')}</p>
          </div>
        </div>
      </section>
      {delOpen && (
        <Modal
          title={t('settings.deleteAccount')}
          onClose={() => !delBusy && setDelOpen(false)}
          footer={<>
            <button className="btn" onClick={() => setDelOpen(false)} disabled={delBusy}>{t('common.cancel')}</button>
            <button className="btn danger" onClick={submitDelete} disabled={delBusy || delText.trim().toUpperCase() !== word}>{t('settings.deleteAccount')}</button>
          </>}
        >
          <p style={{ margin: 0 }}>{t('settings.deleteAccountHint')}</p>
          <label className="field">{t('settings.deleteAccountConfirm', { word })}
            <input className="input" value={delText} onChange={(e) => setDelText(e.target.value)} autoComplete="off" autoCapitalize="characters" />
          </label>
          {delErr && <div className="error" role="alert">{delErr}</div>}
        </Modal>
      )}
      <section className="card">
        <div className="card-head"><h2>{t('settings.about')}</h2></div>
        <div className="row between">
          <span><strong>{t('app.name')}</strong> <span className="muted">· {t('app.tagline')}</span></span>
          <Credit />
        </div>
        <div className="row wrap" style={{ marginTop: 10, gap: 16 }}>
          <Link to="/terms" className="link small">{t('legal.terms')}</Link>
          <Link to="/privacy" className="link small">{t('legal.privacy')}</Link>
        </div>
      </section>
    </>
  );
}
