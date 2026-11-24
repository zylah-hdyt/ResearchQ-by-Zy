import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import { useToast } from './Toast';
import { useConfirm } from './Confirm';
import { chatDeepLink, chatNumber, createLinkCode, linkedPhone, maskPhone, unlinkChat } from '../lib/chatLink';

/** Settings card: link a WhatsApp number to record transactions by chat. */
export function ChatLinkCard() {
  const { t } = useI18n();
  const toast = useToast();
  const confirm = useConfirm();
  const [phone, setPhone] = useState<string | null | undefined>(undefined);
  const [code, setCode] = useState<{ value: string; until: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const timer = useRef<number>();

  const refresh = useCallback(async () => { try { setPhone(await linkedPhone()); setErr(false); } catch { setErr(true); setPhone(null); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  // While a code is waiting, look for the link every 3 seconds; stop when it appears or the code expires.
  useEffect(() => {
    if (!code || phone) return;
    timer.current = window.setInterval(() => { void refresh(); if (Date.now() > code.until) setCode(null); }, 3000);
    return () => window.clearInterval(timer.current);
  }, [code, phone, refresh]);
  useEffect(() => { if (phone && code) { setCode(null); toast(t('chat.linkedToast')); } }, [phone]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => { setBusy(true); setErr(false); try { setCode({ value: await createLinkCode(), until: Date.now() + 10 * 60_000 }); } catch { setErr(true); } finally { setBusy(false); } };
  const stop = async () => { if (!(await confirm({ title: t('chat.unlinkTitle'), body: t('chat.unlinkBody'), confirmLabel: t('chat.unlink'), danger: true }))) return; try { await unlinkChat(); setPhone(null); } catch { setErr(true); } };

  return (
    <section className="card" aria-labelledby="chat-h">
      <div className="card-head"><h2 id="chat-h" className="row tight"><MessageCircle size={18} aria-hidden />{t('chat.title')}</h2></div>
      <p className="muted small" style={{ marginBottom: 12 }}>{t('chat.intro')}</p>
      {phone === undefined ? <div className="spinner" role="status" aria-label={t('common.loading')} /> : phone ? (
        <div className="stack">
          <div className="row between wrap"><span><span className="chip ok">{t('chat.connected')}</span> <span className="num">{maskPhone(phone)}</span></span><button className="btn danger sm" onClick={stop}>{t('chat.unlink')}</button></div>
          <div className="chat-examples"><strong className="small">{t('chat.try')}</strong><ul>{(['chat.ex1', 'chat.ex2', 'chat.ex3', 'chat.ex4', 'chat.ex5'] as const).map((k) => <li key={k}><code>{t(k)}</code></li>)}</ul></div>
        </div>
      ) : code ? (
        <div className="stack">
          <ol className="chat-steps">
            <li>{t('chat.step1', { number: `+${chatNumber}` })}</li>
            <li>{t('chat.step2')} <code className="chat-code">MYFI-{code.value}</code></li>
            <li>{t('chat.step3')}</li>
          </ol>
          <div className="row wrap"><a className="btn primary" href={chatDeepLink(code.value)} target="_blank" rel="noopener noreferrer">{t('chat.open')}</a><span className="muted small" role="status">{t('chat.waiting')}</span></div>
          <p className="hint">{t('chat.expires')}</p>
        </div>
      ) : (
        <button className="btn primary" onClick={start} disabled={busy}>{busy ? t('common.loading') : t('chat.connect')}</button>
      )}
      {err && <div className="error" role="alert" style={{ marginTop: 10 }}>{t('chat.error')}</div>}
    </section>
  );
}
