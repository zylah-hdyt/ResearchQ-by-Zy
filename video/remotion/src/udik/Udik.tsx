import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CL, EASE, Mark, MONO, OR, SANS } from "../cine/Cine";
import { WORDS } from "./words";

// "Mahasiswa udik" — cut to the creator's own VO (Mahasiswa_udik.m4a, first 2.35s trimmed, voice cleaned/EQ'd), 48.5s, 9:16.
// Message: don't wait for others to explain Claude to you — just ask Claude. The middle of the film is a Claude-style chat screen
// where the three prompts are typed word by word exactly as the VO says them. Replies are skeleton lines only (no invented facts).
// Beats (video s): hook 0.15–6.0 · questions to friends 6.0–17.4 · Claude screen 16.8–30.7 · "Beres" 30.7–35.9 · "ingin tahu" 35.9–40.1
// · "kapan belajar sendiri?" 40.1–44.0 · end card 44.0–48.5.
loadFont({ family: "Tinos", url: staticFile("fonts/tinos-latin-400-normal.woff2"), weight: "400" });
const BG = "#FBFAF8", INK = "#151413", MUTE = "#6F6A63", RED = "#E5484D", GREEN = "#1F9D55";
const CL_BG = "#F5F3EC", CL_INK = "#1F1E1D", CL_CLAY = "#D97757", CL_BUB = "#E8E4D8", CL_LINE = "#DAD6C8";
const AV = ["#EE6A1F", "#2453E8", "#16A34A", "#7C3AED", "#E5398A"];
export const clean = (s: string) => s.toLowerCase().replace(/[.,?!]/g, "");
export const idx = (word: string, n = 0): number => {
  let c = 0;
  for (let i = 0; i < WORDS.length; i++) if (clean(WORDS[i][0]) === clean(word)) { if (c === n) return i; c++; }
  throw new Error("word not found: " + word + " #" + n);
};
export const ws = (word: string, n = 0) => WORDS[idx(word, n)][1];
export const wf = (word: string, n = 0) => Math.round(ws(word, n) * 30);
export const F = (s: number) => Math.round(s * 30);
export const rise = (g: number, at: number, d = 10) => interpolate(g, [at, at + d], [0, 1], { ...CL, easing: EASE });
export const pop = (g: number, at: number) => ({ opacity: g >= at ? 1 : 0, scale: `${interpolate(g, [at, at + 6], [1.35, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` });
export const sliceWords = (a: [string, number], b: [string, number]) => WORDS.slice(idx(a[0], a[1]), idx(b[0], b[1]) + 1);
export const T = { b: 6.0, c: 16.8, d: 30.71, e: 35.89, f: 40.13, end: 44.0, total: 48.5 };

/* ---------------- small parts ---------------- */
const KW: React.FC<{ g: number; at: number; acc?: boolean; red?: boolean; children: React.ReactNode }> = ({ g, at, acc, red, children }) => {
  const p = rise(g, at, 9);
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.1em", marginRight: "0.2em" }}>
      <span style={{ display: "inline-block", opacity: g >= at ? 1 : 0, transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 4}deg)`, color: red ? RED : acc ? OR : INK }}>{children}</span>
    </span>
  );
};
const Kin: React.FC<{ g: number; top: number; size: number; words: [string, number, ("acc" | "red" | "mute")?][]; mute?: boolean }> = ({ g, top, size, words, mute }) => (
  <div style={{ position: "absolute", left: 76, right: 76, top, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -2, lineHeight: 1.05, color: mute ? MUTE : INK }}>
    {words.map(([w, at, k], i) => <KW key={i} g={g} at={at} acc={k === "acc"} red={k === "red"}>{w}</KW>)}
  </div>
);
const Avatar: React.FC<{ i: number; size?: number; label?: string }> = ({ i, size = 110, label }) => (
  <div style={{ width: size, textAlign: "center", fontFamily: SANS }}>
    <div style={{ width: size, height: size, borderRadius: "50%", background: AV[i], display: "flex", alignItems: "center", justifyContent: "center", border: "5px solid #fff", boxShadow: "0 14px 30px -14px rgba(0,0,0,.45)" }}>
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c1.2-4 4-5.6 7-5.6s5.8 1.6 7 5.6" /></svg>
    </div>
    {label ? <div style={{ marginTop: 6, fontWeight: 700, fontSize: 24, color: INK }}>{label}</div> : null}
  </div>
);
const Icon: React.FC<{ n: string; c?: string; size: number; sw?: number }> = ({ n, c = INK, size, sw = 1.8 }) => {
  const P: Record<string, React.ReactNode> = {
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="M4 12.5l5 5L20 6.5" />,
    x: <path d="M5 5l14 14 M19 5L5 19" />,
    play: <><rect x="3" y="5" width="18" height="14" rx="4" /><path d="M10 9l5 3-5 3z" /></>,
    spoon: <g transform="rotate(-22 12 12)"><ellipse cx="12" cy="6.5" rx="3.6" ry="5" fill="#EDEBE6" /><path d="M12 11.5V22" /></g>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></>,
    menu: <path d="M4 7h16 M4 12h16 M4 17h16" />,
    plus: <path d="M12 5v14 M5 12h14" />,
    up: <path d="M12 19V6 M6 11l6-6 6 6" />,
    person: <><circle cx="12" cy="8" r="3.6" /><path d="M5 20c1-4 4-5.6 7-5.6s6 1.6 7 5.6" /></>,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ overflow: "visible" }}>{P[n]}</svg>;
};
const Shell: React.FC<{ g: number; from: number; label?: string; children: React.ReactNode }> = ({ g, from, label, children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, #FFEADB 0%, ${BG} 64%)`, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 80, right: 80, top: 120, fontFamily: MONO, fontSize: 22, letterSpacing: 5, color: MUTE, opacity: rise(g, from, 8) }}>TANYA CLAUDE{label ? ` · ${label}` : ""}</div>
    {children}
  </AbsoluteFill>
);

/* ---- A · Hook ---- */
const Hook: React.FC = () => {
  const g = useCurrentFrame();
  const wait = wf("nunggu");
  return (
    <Shell g={g} from={4}>
      <Kin g={g} top={260} size={104} words={[["Katanya", wf("katanya")], ["masih", wf("masih")], ["mahasiswa,", wf("mahasiswa"), "acc"]]} />
      <Kin g={g} top={520} size={84} words={[["tapi", wf("tapi")], ["mau", wf("mau")], ["pakai", wf("pake")], ["AI", wf("ai"), "acc"], ["aja", wf("aja")]]} />
      <Kin g={g} top={700} size={84} words={[["semua", wf("semua")], ["harus", wf("harus")], ["nunggu", wf("nunggu"), "red"], ["dijelasin", wf("dijelasin")], ["orang", wf("orang")], ["lain.", wf("lain")]]} />
      {/* waiting: the student, a ticking clock, and three people who haven't explained anything yet */}
      <div style={{ position: "absolute", left: 100, top: 1040, ...pop(g, wf("harus")) }}><Avatar i={0} size={150} label="Kamu" /></div>
      <div style={{ position: "absolute", left: 390, top: 1070, rotate: `${(g - wait) * 6}deg`, opacity: g >= wait ? 1 : 0 }}><Icon n="clock" c={RED} size={110} sw={1.6} /></div>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: 560 + (i - 1) * 140, top: 1040, ...pop(g, wf("orang") + (i - 1) * 4) }}>
          <Avatar i={i} size={110} />
          <div style={{ marginTop: 12, marginLeft: 10, display: "flex", gap: 8 }}>{[0, 1, 2].map((d) => <i key={d} style={{ width: 14, height: 14, borderRadius: "50%", background: "#9A958C", opacity: 0.35 + 0.65 * Math.max(0, Math.sin((g - d * 5) / 5)) }} />)}</div>
        </div>
      ))}
    </Shell>
  );
};

/* ---- B · The questions, asked to friends ---- */
export const QS: [string, string, number][] = [
  ["Claude bisa buat skripsi nggak?", "claude", 0], ["Limitnya biar nggak cepet habis gimana?", "limitnya", 0], ["Fiturnya apa aja?", "fiturnya", 0],
  ["Harga paketnya berapa?", "harga", 0], ["Apa kelebihannya dibandingkan AI lain?", "apakah", 0],
];
const Questions: React.FC = () => {
  const g = useCurrentFrame() + F(T.b);
  const bro = wf("bro");
  return (
    <Shell g={g} from={F(T.b)} label="GRUP CHAT">
      {QS.map(([t, w, n], k) => {
        const at = wf(w, n);
        return (
          <div key={k} style={{ position: "absolute", right: 70, top: 260 + k * 142, display: "flex", alignItems: "flex-end", gap: 16, ...pop(g, at) }}>
            <div style={{ maxWidth: 700, padding: "20px 30px", borderRadius: "34px 34px 8px 34px", background: OR, color: "#fff", fontFamily: SANS, fontWeight: 600, fontSize: 38, lineHeight: 1.2 }}>{t}</div>
            <Avatar i={0} size={74} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 70, top: 1030, display: "flex", alignItems: "flex-end", gap: 16, ...pop(g, bro) }}>
        <Avatar i={1} size={74} />
        <div style={{ maxWidth: 760, padding: "22px 30px", borderRadius: "34px 34px 34px 8px", background: "#fff", border: `3px solid ${INK}`, fontFamily: SANS, fontWeight: 700, fontSize: 42, lineHeight: 1.22, color: INK }}>
          Bro, kenapa nggak lu tanya langsung ke <span style={{ color: OR, background: g >= wf("claude-nya") ? "rgba(238,106,31,.16)" : "transparent" }}>Claude-nya</span> langsung?
        </div>
      </div>
    </Shell>
  );
};

/* ---- C · The Claude screen ---- */
export const P1 = sliceWords(["claude", 1], ["penggunaan", 0]);
export const P2 = sliceWords(["gimana", 1], ["habis", 1]);
export const P3 = sliceWords(["apa", 2], ["lainnya", 0]);
export const SEND = [ws("penggunaan") + 0.55, ws("habis", 1) + 0.5, ws("lainnya") + 0.5];
export const typed = (tokens: [string, number][], t: number) => tokens.filter(([, s]) => t >= s + 0.04).map(([w]) => w).join(" ");
const Skel: React.FC<{ g: number; at: number; widths: number[]; head?: string[] }> = ({ g, at, widths, head }) => (
  <div style={{ display: "flex", gap: 22, opacity: g >= at ? 1 : 0 }}>
    <Img src={staticFile("claude_logo_t.png")} style={{ width: 54, height: 54, flex: "none", marginTop: 4 }} />
    <div style={{ flex: 1 }}>
      {widths.map((w, k) => {
        const p = interpolate(g, [at + k * 5, at + k * 5 + 14], [0, 1], { ...CL, easing: EASE });
        return (
          <div key={k} style={{ marginTop: k ? 16 : 6 }}>
            {head?.[k] ? <div style={{ fontFamily: "Tinos, serif", fontSize: 36, color: CL_INK, opacity: p, marginBottom: 8 }}>{head[k]}</div> : null}
            <div style={{ height: 16, borderRadius: 8, background: "#D9D4C4", width: `${w * p}%` }} />
            {head ? <div style={{ height: 16, borderRadius: 8, background: "#E3DFD1", width: `${w * 0.7 * p}%`, marginTop: 8 }} /> : null}
          </div>
        );
      })}
    </div>
  </div>
);
const ClaudeScreen: React.FC = () => {
  const g = useCurrentFrame() + F(T.c);
  const t = g / 30;
  const reveal = interpolate(g, [F(T.c), F(T.c) + 16], [0, 1], { ...CL, easing: Easing.inOut(Easing.cubic) });
  const send = SEND;
  const scroll = interpolate(g, [F(send[2]), F(send[2]) + 14], [0, 360], { ...CL, easing: EASE });
  const phase = t < send[0] ? 1 : t < send[1] ? 2 : 3;
  const draft = phase === 1 ? typed(P1, t) : phase === 2 ? typed(P2, t) : t < send[2] ? typed(P3, t) : "";
  const caret = Math.floor(g / 8) % 2 === 0;
  const inputActive = t >= ws("tanya", 1) - 0.1 && t < send[2];
  const bub = (text: string, top: number, h: number, at: number) => (
    <div style={{ position: "absolute", right: 0, top, height: h, maxWidth: 880, padding: "20px 30px", boxSizing: "border-box", borderRadius: 30, background: CL_BUB, color: CL_INK, fontFamily: SANS, fontWeight: 500, fontSize: 34, lineHeight: "46px", opacity: g >= at ? 1 : 0, translate: `0px ${interpolate(g, [at, at + 8], [30, 0], { ...CL, easing: EASE })}px` }}>{text}</div>
  );
  return (
    <AbsoluteFill style={{ clipPath: `circle(${reveal * 2000}px at 540px 1100px)` }}>
      <AbsoluteFill style={{ background: CL_BG, fontFamily: SANS }}>
        {/* app header */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, height: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px" }}>
          <Icon n="menu" c={CL_INK} size={46} sw={1.8} />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}><Img src={staticFile("claude_logo_t.png")} style={{ width: 46, height: 46 }} /><span style={{ fontFamily: "Tinos, serif", fontSize: 50, color: CL_INK }}>Claude</span></div>
          <Icon n="plus" c={CL_INK} size={46} sw={1.8} />
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 212, height: 2, background: CL_LINE }} />
        {/* empty state greeting */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", opacity: t < send[0] ? 1 : 0 }}>
          <Img src={staticFile("claude_logo_t.png")} style={{ width: 96, height: 96 }} />
          <div style={{ fontFamily: "Tinos, serif", fontSize: 72, color: CL_INK, marginTop: 24, lineHeight: 1.1 }}>Mau tanya<br />apa hari ini?</div>
        </div>
        {/* conversation */}
        <div style={{ position: "absolute", left: 70, right: 70, top: 250, height: 980, overflow: "hidden", WebkitMaskImage: scroll > 4 ? "linear-gradient(to bottom, transparent 0, #000 60px)" : "none" }}>
          <div style={{ position: "relative", transform: `translateY(${-scroll}px)` }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>{bub(P1.map(([w]) => w).join(" "), 0, 190, F(send[0]))}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 225 }}><Skel g={g} at={F(send[0]) + 8} widths={[78, 64, 84, 58]} head={["Fitur", "Harga paket", "Kelebihan", "Cara memaksimalkan penggunaan"]} /></div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 650 }}>{bub(P2.map(([w]) => w).join(" "), 0, 96, F(send[1]))}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 800 }}><Skel g={g} at={F(send[1]) + 8} widths={[86, 70, 52]} /></div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 990 }}>{bub(P3.map(([w]) => w).join(" "), 0, 140, F(send[2]))}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 1160 }}><Skel g={g} at={F(send[2]) + 8} widths={[82, 66, 48]} /></div>
          </div>
        </div>
        {/* input */}
        <div style={{ position: "absolute", left: 50, right: 50, top: 1250, minHeight: 120, borderRadius: 40, background: "#fff", border: `3px solid ${inputActive ? CL_CLAY : CL_LINE}`, boxShadow: "0 24px 50px -30px rgba(60,40,10,.4)", padding: "26px 110px 26px 36px", fontSize: 32, lineHeight: "44px", color: CL_INK, fontWeight: 500, boxSizing: "border-box" }}>
          {draft ? <>{draft}{caret ? <span style={{ borderLeft: `3px solid ${CL_CLAY}`, marginLeft: 3 }} /> : null}</> : <span style={{ color: "#A8A395" }}>Tanya Claude…</span>}
          <div style={{ position: "absolute", right: 22, top: 22, width: 76, height: 76, borderRadius: "50%", background: draft ? CL_CLAY : "#E9C9BD", display: "flex", alignItems: "center", justifyContent: "center", scale: `${[send[0], send[1], send[2]].some((s) => g >= F(s) && g < F(s) + 6) ? 0.88 : 1}` }}><Icon n="up" c="#fff" size={42} sw={2.4} /></div>
        </div>
        <div style={{ position: "absolute", left: 60, top: 1385, fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: "#9A958C" }}>ILUSTRASI TAMPILAN</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---- D · Beres ---- */
const Done: React.FC = () => {
  const g = useCurrentFrame() + F(T.d);
  const strike = interpolate(g, [wf("tutorial"), wf("tutorial") + 10], [0, 1], { ...CL, easing: EASE });
  const rows: [string, string, number][] = [["check", "Penjelasan awal", wf("penjelasan")], ["person", "Tanpa nunggu orang lain", wf("tanpa")]];
  return (
    <Shell g={g} from={F(T.d)} label="HASILNYA">
      <div style={{ position: "absolute", left: 76, top: 260, display: "flex", alignItems: "center", gap: 28, ...pop(g, wf("beres")) }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 210, letterSpacing: -8, color: INK, lineHeight: 1 }}>Beres</div>
        <div style={{ width: 130, height: 130, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="check" c="#fff" size={84} sw={3} /></div>
      </div>
      <Kin g={g} top={560} size={64} mute words={[["lo", wf("lo")], ["bisa", wf("bisa", 1)], ["dapet", wf("dapet")]]} />
      {rows.map(([ic, t, at], k) => (
        <div key={t} style={{ position: "absolute", left: 76, right: 76, top: 700 + k * 190, height: 150, borderRadius: 30, background: "#141414", color: "#EDEBE6", display: "flex", alignItems: "center", gap: 28, padding: "0 40px", fontFamily: SANS, fontWeight: 800, fontSize: 52, opacity: g >= at - 2 ? 1 : 0, translate: `${interpolate(g, [at, at + 10], [200, 0], { ...CL, easing: EASE })}px 0px` }}>
          <Icon n={ic} c={OR} size={70} sw={1.8} />{t}
        </div>
      ))}
      <div style={{ position: "absolute", left: 76, right: 76, top: 1080, height: 150, borderRadius: 30, background: "#fff", border: `3px solid ${INK}`, display: "flex", alignItems: "center", gap: 28, padding: "0 40px", fontFamily: SANS, fontWeight: 800, fontSize: 50, color: INK, opacity: g >= wf("bikin") - 2 ? 1 : 0, translate: `${interpolate(g, [wf("bikin"), wf("bikin") + 10], [200, 0], { ...CL, easing: EASE })}px 0px` }}>
        <Icon n="play" c={MUTE} size={70} sw={1.6} />
        <span style={{ position: "relative", color: MUTE }}>tutorial orang lain<i style={{ position: "absolute", left: 0, top: "52%", height: 7, width: `${strike * 100}%`, background: RED, borderRadius: 4 }} /></span>
        <span style={{ marginLeft: "auto", opacity: strike }}><Icon n="x" c={RED} size={64} sw={2.6} /></span>
      </div>
    </Shell>
  );
};

/* ---- E · rasa ingin tahu ---- */
const Curious: React.FC = () => {
  const g = useCurrentFrame() + F(T.e);
  const sp = wf("disuapin");
  const strike = interpolate(g, [sp, sp + 10], [0, 1], { ...CL, easing: EASE });
  return (
    <Shell g={g} from={F(T.e)} label="INGAT">
      <Kin g={g} top={250} size={100} words={[["Lo", wf("lo", 1)], ["masih", wf("masih", 1)], ["mahasiswa,", wf("mahasiswa", 1), "acc"]]} />
      <Kin g={g} top={470} size={88} words={[["punya", wf("punya")], ["rasa", wf("rasa")], ["ingin", wf("ingin")], ["tahu", wf("tahu")], ["itu", wf("itu")], ["penting.", wf("penting"), "acc"]]} />
      <Kin g={g} top={930} size={60} mute words={[["Jangan", wf("jangan")], ["semua", wf("semua", 1)], ["hal", wf("hal")], ["harus", wf("harus", 2)]]} />
      <div style={{ position: "absolute", left: 76, right: 76, top: 1030, height: 230, borderRadius: 34, background: "#141414", display: "flex", alignItems: "center", gap: 36, padding: "0 50px", opacity: g >= sp - 4 ? 1 : 0, scale: `${interpolate(g, [sp - 4, sp + 6], [0.9, 1], { ...CL, easing: EASE })}` }}>
        <Icon n="spoon" c="#EDEBE6" size={150} sw={2.2} />
        <span style={{ position: "relative", fontFamily: SANS, fontWeight: 900, fontSize: 112, color: "#EDEBE6", letterSpacing: -3 }}>disuapin<i style={{ position: "absolute", left: -8, top: "54%", height: 10, width: `${strike * 104}%`, background: RED, borderRadius: 5 }} /></span>
        <span style={{ marginLeft: "auto", opacity: strike, scale: `${1.4 - strike * 0.4}` }}><Icon n="x" c={RED} size={90} sw={2.8} /></span>
      </div>
    </Shell>
  );
};

/* ---- F · kapan belajar mencari tahu sendiri? ---- */
export const Q3 = sliceWords(["belajar", 0], ["sendiri", 0]);
const When: React.FC = () => {
  const g = useCurrentFrame() + F(T.f);
  const t = g / 30;
  const text = typed(Q3, t);
  const done = t >= ws("sendiri") + 0.3;
  return (
    <Shell g={g} from={F(T.f)} label="PERTANYAANNYA">
      <Kin g={g} top={240} size={66} mute words={[["Kalau", wf("kalau")], ["semuanya", wf("semuanya")], ["harus", wf("harus", 3)], ["dijelaskan", wf("dijelaskan")], ["orang", wf("orang", 2)], ["lain,", wf("lain", 3)]]} />
      <Kin g={g} top={520} size={124} words={[["kapan", wf("kapan"), "acc"], ["lo", wf("lo", 2)], ["belajar", wf("belajar")], ["mencari", wf("mencari")], ["tahu", wf("tahu", 1)], ["sendiri?", wf("sendiri"), "acc"]]} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1090, minHeight: 130, borderRadius: 44, background: CL_BG, border: `3px solid ${done ? CL_CLAY : CL_LINE}`, boxShadow: "0 24px 50px -30px rgba(60,40,10,.4)", display: "flex", alignItems: "center", gap: 20, padding: "0 28px 0 36px", boxSizing: "border-box", fontFamily: SANS, fontWeight: 500, fontSize: 38, color: CL_INK, opacity: rise(g, wf("belajar") - 6, 8) }}>
        <Icon n="search" c="#8A8573" size={46} />
        <span style={{ flex: 1 }}>{text || <span style={{ color: "#A8A395" }}>Tanya Claude…</span>}{Math.floor(g / 8) % 2 === 0 && !done ? <span style={{ borderLeft: `3px solid ${CL_CLAY}`, marginLeft: 3 }} /> : null}</span>
        <div style={{ width: 84, height: 84, borderRadius: "50%", background: text ? CL_CLAY : "#E9C9BD", display: "flex", alignItems: "center", justifyContent: "center", scale: `${done ? 1 + 0.06 * Math.sin((g - F(ws("sendiri") + 0.3)) / 3) : 1}` }}><Icon n="up" c="#fff" size={46} sw={2.4} /></div>
      </div>
    </Shell>
  );
};

/* ---- G · end card ---- */
const End: React.FC = () => {
  const g = useCurrentFrame() + F(T.end);
  const word = "RESEARCHQ", s = F(T.end);
  return (
    <AbsoluteFill style={{ background: "#0E0D0C" }}>
      <div style={{ position: "absolute", left: 540 - 70, top: 640, scale: `${interpolate(g, [s, s + 8], [1.6, 1], { ...CL, easing: EASE })}`, rotate: `${(g - s) * 1.2}deg` }}><Mark size={140} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, fontFamily: SANS, fontWeight: 800, fontSize: 104, letterSpacing: 2, color: "#fff", display: "flex", justifyContent: "center" }}>
        {word.split("").map((ch, k) => <span key={k} style={{ opacity: interpolate(g, [s + 6 + k * 1.5, s + 9 + k * 1.5], [0, 1], CL), translate: `0px ${interpolate(g, [s + 6 + k * 1.5, s + 11 + k * 1.5], [26, 0], { ...CL, easing: EASE })}px` }}>{ch}</span>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 990, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 44, color: "#fff", opacity: rise(g, s + 24, 8) }}>Follow <span style={{ color: OR }}>@researchq.id</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1062, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 36, color: "#CFCAC1", opacity: rise(g, s + 32, 8) }}>tips riset pakai AI, tiap hari</div>
    </AbsoluteFill>
  );
};

/* ---- karaoke subtitles ---- */
const PHRASES: [string, number][][] = (() => {
  const out: [string, number][][] = []; let cur: [string, number][] = [];
  for (const w of WORDS) { cur.push(w); if (/[.,?!]$/.test(w[0]) || cur.length >= 6) { out.push(cur); cur = []; } }
  if (cur.length) out.push(cur); return out;
})();
export const Subs: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const i = PHRASES.findIndex((p, k) => t >= p[0][1] - 0.08 && t < (PHRASES[k + 1] ? PHRASES[k + 1][0][1] - 0.08 : p[p.length - 1][1] + 1.2));
  if (i < 0 || t > T.end + 0.3) return null;
  const p = PHRASES[i];
  const a = interpolate(t, [p[0][1] - 0.08, p[0][1] + 0.06], [0, 1], CL);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1440, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ maxWidth: 960, padding: "12px 26px", borderRadius: 18, background: "rgba(21,20,19,.86)", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.25 }}>
        {p.map(([w, s], k) => {
          const nextS = k + 1 < p.length ? p[k + 1][1] : s + 0.5;
          return <span key={k} style={{ color: t >= s && t < nextS ? OR : t >= s ? "#fff" : "rgba(255,255,255,.45)" }}>{w}{k < p.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};

export const MahasiswaUdik: React.FC<{ subs?: boolean }> = ({ subs = true }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence durationInFrames={F(T.b)} name="Hook"><Hook /></Sequence>
      <Sequence from={F(T.b)} durationInFrames={F(T.c + 0.8) - F(T.b)} name="Pertanyaan ke teman"><Questions /></Sequence>
      <Sequence from={F(T.c)} durationInFrames={F(T.d) - F(T.c)} name="Layar Claude"><ClaudeScreen /></Sequence>
      <Sequence from={F(T.d)} durationInFrames={F(T.e) - F(T.d)} name="Beres"><Done /></Sequence>
      <Sequence from={F(T.e)} durationInFrames={F(T.f) - F(T.e)} name="Rasa ingin tahu"><Curious /></Sequence>
      <Sequence from={F(T.f)} durationInFrames={F(T.end) - F(T.f)} name="Kapan belajar"><When /></Sequence>
      <Sequence from={F(T.end)} durationInFrames={F(T.total) - F(T.end)} name="End"><End /></Sequence>
      {subs ? <Subs /> : null}
      <Audio src={staticFile("udik-vo.wav")} premountFor={fps} />
      <Audio src={staticFile("udik-sfx.wav")} premountFor={fps} volume={0.8} />
    </AbsoluteFill>
  );
};
