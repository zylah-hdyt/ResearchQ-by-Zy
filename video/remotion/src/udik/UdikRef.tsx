import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CL, Cam, EASE, Grain, Mark, MONO, OR, Ribbons, SANS, Vignette } from "../cine/Cine";
import { F, QS, Q3, T, clean, rise, typed, wf, ws } from "./Udik";
import { WORDS } from "./words";
import { Backdrop, BackdropVariant } from "./backdrops";
import { ClaudeScreen, GREEN, INK, Icon, RED } from "./UdikCine";

// "Mahasiswa udik" — style 3, modelled on the @jipraks "Full otomatis" edit: a heavy condensed outlined-then-filled headline,
// mono step labels with a ghost number, node/diagram cards joined by lines with a travelling dot, a review card with corner brackets
// and a stamp, a perspective grid floor with a reflection, and TikTok-style word captions (spoken word in a box, keywords in accent).
// Colours stay ResearchQ (black / orange / white); every scene gets its own backdrop so the film never sits on one background.
// Same VO, word timings and sparse SFX as the other two versions.
loadFont({ family: "Anton", url: staticFile("fonts/anton-latin-400-normal.woff2"), weight: "400" });
const MUTE = "#9A958C", LINEC = "rgba(244,241,236,.28)";
const pop = (g: number, at: number) => ({ opacity: g >= at ? 1 : 0, scale: `${interpolate(g, [at, at + 6], [1.35, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` });

const Scene: React.FC<{ variant: BackdropVariant; n?: string; label?: string; g: number; from: number; children: React.ReactNode }> = ({ variant, n, label, g, from, children }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Backdrop variant={variant} />
    {n ? <div style={{ position: "absolute", right: 30, top: 40, fontFamily: "Anton, sans-serif", fontSize: 420, lineHeight: 1, color: "transparent", WebkitTextStroke: "3px rgba(244,241,236,.07)", opacity: rise(g, from, 12) }}>{n}</div> : null}
    {label ? <div style={{ position: "absolute", left: 80, top: 130, fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: "#CFCAC1", opacity: rise(g, from, 8) }}>{n ? `${n.padStart(2, "0")} ` : ""}<span style={{ color: OR }}>{label}</span></div> : null}
    {children}
    <Vignette />
    <Grain />
  </AbsoluteFill>
);
// Headline: dim outline first, filled when the word is spoken (like "FULL OTOMATIS").
const Head: React.FC<{ g: number; top: number; size: number; lines: { t: string; show: number; fill: number; acc?: boolean; sz?: number }[]; align?: "left" | "center" }> = ({ g, top, size, lines, align = "center" }) => (
  <div style={{ position: "absolute", left: 50, right: 50, top, textAlign: align, fontFamily: "Anton, sans-serif", fontSize: size, lineHeight: 1.04, letterSpacing: 2, textTransform: "uppercase" }}>
    {lines.map((l, i) => {
      const a = rise(g, l.show, 10), fl = rise(g, l.fill, 8);
      return (
        <div key={i} style={{ position: "relative", fontSize: l.sz ?? size, opacity: a, translate: `0px ${(1 - a) * 24}px` }}>
          <span style={{ color: "transparent", WebkitTextStroke: `3px ${l.acc ? "rgba(242,138,46,.55)" : "rgba(244,241,236,.4)"}` }}>{l.t}</span>
          <span style={{ position: "absolute", left: 0, right: 0, top: 0, color: l.acc ? OR : INK, opacity: fl, textShadow: l.acc ? "0 0 38px rgba(242,138,46,.45)" : "none" }}>{l.t}</span>
        </div>
      );
    })}
  </div>
);
const Brackets: React.FC<{ c?: string; inset?: number }> = ({ c = OR, inset = -22 }) => (
  <>
    {[[0, 0, "3px 0 0 3px"], [1, 0, "3px 3px 0 0"], [0, 1, "0 0 3px 3px"], [1, 1, "0 3px 3px 0"]].map(([r, b, w], i) => (
      <i key={i} style={{ position: "absolute", [r ? "right" : "left"]: inset, [b ? "bottom" : "top"]: inset, width: 54, height: 54, borderStyle: "solid", borderColor: c, borderWidth: w as string, opacity: 0.9 }} />
    ))}
  </>
);
const bez = (t: number, p: number[][]) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
};

/* ---- A · Hook ---- */
const Hook: React.FC = () => {
  const g = useCurrentFrame();
  const nodes: { t: string; at: number; red?: boolean }[] = [{ t: "Aku mau pakai AI", at: wf("pake") }, { t: "Nunggu", at: wf("nunggu"), red: true }, { t: "Dijelasin orang lain", at: wf("dijelasin") }];
  return (
    <Scene variant="ember" g={g} from={0}>
      <Head g={g} top={200} size={190} lines={[{ t: "Mahasiswa", show: 4, fill: wf("mahasiswa"), acc: true, sz: 200 }, { t: "nunggu dijelasin?", show: 14, fill: wf("nunggu"), sz: 124 }]} />
      <Cam s={interpolate(g, [0, F(T.b)], [1, 1.04])}>
        {nodes.map((n, k) => (
          <div key={k}>
            <div style={{ position: "absolute", left: 130, right: 130, top: 640 + k * 190, height: 120, borderRadius: 999, border: `3px solid ${n.red ? RED : LINEC}`, background: "rgba(10,8,7,.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, fontFamily: SANS, fontWeight: 800, fontSize: 54, color: n.red ? RED : INK, textTransform: "uppercase", letterSpacing: -1, ...pop(g, n.at) }}>
              {n.red ? <span style={{ display: "inline-block", rotate: `${(g - n.at) * 7}deg` }}><Icon n="clock" c={RED} size={64} sw={1.8} /></span> : null}{n.t}
            </div>
            {k < 2 ? <div style={{ position: "absolute", left: 0, right: 0, top: 764 + k * 190, textAlign: "center", fontFamily: SANS, fontSize: 52, color: MUTE, opacity: rise(g, nodes[k + 1].at - 2, 8) }}>↓</div> : null}
          </div>
        ))}
      </Cam>
    </Scene>
  );
};

/* ---- B · The questions: cards on the left, lines with a travelling dot into one unanswered pill ---- */
const Questions: React.FC = () => {
  const g = useCurrentFrame() + F(T.b);
  const bro = wf("bro"), cn = wf("claude-nya");
  const PILL = { x: 740, y: 1090 };
  const lit = g >= cn;
  return (
    <Scene variant="navy" n="1" label="PERTANYAAN" g={g} from={F(T.b)}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {QS.map(([, w, n], k) => {
          const at = wf(w, n);
          const y0 = 350 + k * 142, p = [[640, y0], [790, y0], [PILL.x + 60, PILL.y - 260], [PILL.x + 150, PILL.y - 20]];
          const prog = interpolate(g, [at + 4, at + 26], [0, 1], { ...CL, easing: Easing.inOut(Easing.cubic) });
          const d = `M${p[0][0]} ${p[0][1]} C${p[1][0]} ${p[1][1]} ${p[2][0]} ${p[2][1]} ${p[3][0]} ${p[3][1]}`;
          const [dx, dy] = bez(prog, p);
          return (
            <g key={k} opacity={g >= at ? 1 : 0}>
              <path d={d} fill="none" stroke="rgba(244,241,236,.3)" strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
              {prog > 0 && prog < 1 ? <circle cx={dx} cy={dy} r={9} fill={OR} /> : null}
            </g>
          );
        })}
      </svg>
      {QS.map(([t, w, n], k) => {
        const at = wf(w, n);
        const parts = t.split(" ");
        return (
          <div key={k} style={{ position: "absolute", left: 60, top: 300 + k * 142, width: 580, padding: "16px 24px", borderRadius: 22, background: "rgba(14,16,24,.88)", border: "2px solid rgba(244,241,236,.18)", boxShadow: "0 30px 60px -30px #000", fontFamily: SANS, ...pop(g, at) }}>
            <div style={{ fontFamily: MONO, fontSize: 17, letterSpacing: 4, color: OR }}>{`PERTANYAAN ${k + 1}`}</div>
            <div style={{ fontWeight: 700, fontSize: 31, lineHeight: 1.18, color: INK, marginTop: 4 }}>{parts.join(" ")}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: PILL.x, top: PILL.y, width: 290, height: 96, borderRadius: 999, border: `3px ${lit ? "solid" : "dashed"} ${lit ? OR : "rgba(244,241,236,.4)"}`, background: lit ? OR : "rgba(10,12,18,.8)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 38, color: lit ? "#1A0E04" : MUTE, scale: `${lit ? 1 + 0.05 * Math.sin((g - cn) / 3) : 1}` }}>
        {lit ? "▸ CLAUDE" : "JAWABAN ?"}
      </div>
      <div style={{ position: "absolute", left: 60, top: 1080, width: 620, padding: "18px 26px", borderRadius: 22, background: "rgba(14,16,24,.92)", border: `2px solid ${lit ? OR : "rgba(244,241,236,.18)"}`, fontFamily: SANS, ...pop(g, bro) }}>
        <div style={{ fontFamily: MONO, fontSize: 17, letterSpacing: 4, color: "#7FA2FF" }}>TEMEN</div>
        <div style={{ fontWeight: 700, fontSize: 34, lineHeight: 1.2, color: INK, marginTop: 4 }}>Bro, kenapa nggak lu tanya langsung ke <span style={{ color: OR }}>Claude-nya</span> langsung?</div>
      </div>
    </Scene>
  );
};

/* ---- C · Claude screen over a perspective grid floor, with viewfinder corners ---- */
const ClaudeScene: React.FC = () => {
  const g = useCurrentFrame() + F(T.c);
  const sc = rise(g, F(T.c) + 8, 14);
  return (
    <AbsoluteFill>
      <ClaudeScreen variant="grid" />
      <div style={{ position: "absolute", left: 30, right: 30, top: 90, height: 1320, pointerEvents: "none", opacity: sc }}><Brackets /></div>
      <div style={{ position: "absolute", left: 80, top: 36, fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: "#CFCAC1", opacity: sc }}>02 <span style={{ color: OR }}>TANYA CLAUDE</span></div>
    </AbsoluteFill>
  );
};

/* ---- D · Result card: review rows, scan line, BERES stamp ---- */
const Done: React.FC = () => {
  const g = useCurrentFrame() + F(T.d);
  const strike = interpolate(g, [wf("tutorial"), wf("tutorial") + 10], [0, 1], { ...CL, easing: EASE });
  const scan = interpolate(g, [F(T.d), F(T.e)], [0, 1], CL);
  const rows: [string, string, number, boolean][] = [["check", "Penjelasan awal", wf("penjelasan"), true], ["check", "Tanpa nunggu orang lain", wf("tanpa"), true], ["x", "Tutorial orang lain", wf("tutorial"), false]];
  const stamp = wf("beres");
  return (
    <Scene variant="scan" n="3" label="HASIL" g={g} from={F(T.d)}>
      <Head g={g} top={215} size={118} lines={[{ t: "Penjelasan awal", show: F(T.d), fill: wf("penjelasan") }, { t: "tanpa nunggu", show: F(T.d) + 4, fill: wf("tanpa"), acc: true }]} />
      <Cam rx={interpolate(g, [F(T.d), F(T.d) + 22], [14, 3], { ...CL, easing: EASE })} ry={interpolate(g, [F(T.d), F(T.e)], [-5, 5])} s={interpolate(g, [F(T.d), F(T.e)], [1.04, 1])}>
        <div style={{ position: "absolute", left: 110, right: 110, top: 600, height: 650, borderRadius: 26, background: "rgba(16,13,11,.92)", border: "2px solid rgba(244,241,236,.18)", boxShadow: "0 60px 110px -50px #000", fontFamily: SANS, overflow: "visible", opacity: rise(g, F(T.d), 8) }}>
          <Brackets />
          <div style={{ padding: "26px 34px", borderBottom: "2px solid rgba(244,241,236,.12)", display: "flex", alignItems: "center", gap: 14, color: INK, fontWeight: 800, fontSize: 36 }}><Icon n="search" c={OR} size={40} />Hasil tanya Claude<span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: MUTE }}>V1</span></div>
          {rows.map(([ic, t, at, ok], k) => (
            <div key={t} style={{ padding: "0 34px", height: 118, display: "flex", alignItems: "center", gap: 22, fontSize: 40, fontWeight: 700, color: ok ? INK : MUTE, opacity: g >= at - 3 ? 1 : 0, translate: `${interpolate(g, [at - 3, at + 7], [60, 0], { ...CL, easing: EASE })}px 0px`, borderBottom: k < 2 ? "2px solid rgba(244,241,236,.08)" : "none" }}>
              <span style={{ position: "relative" }}>{t}{!ok ? <i style={{ position: "absolute", left: 0, top: "54%", height: 6, width: `${strike * 100}%`, background: RED, borderRadius: 3 }} /> : null}</span>
              <span style={{ marginLeft: "auto", width: 56, height: 56, borderRadius: "50%", border: `3px solid ${ok ? GREEN : RED}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n={ic} c={ok ? GREEN : RED} size={30} sw={2.8} /></span>
            </div>
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 70 + scan * 560, height: 3, background: "linear-gradient(90deg, transparent, #F28A2E, transparent)", boxShadow: "0 0 24px rgba(242,138,46,.7)" }} />
          <div style={{ position: "absolute", left: 140, right: 140, bottom: 34, height: 130, borderRadius: 16, border: `6px solid ${GREEN}`, color: GREEN, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Anton, sans-serif", fontSize: 98, letterSpacing: 6, rotate: "-4deg", background: "rgba(61,214,140,.1)", ...pop(g, stamp) }}>BERES</div>
        </div>
      </Cam>
    </Scene>
  );
};

/* ---- E · rasa ingin tahu, disuapin ---- */
const Curious: React.FC = () => {
  const g = useCurrentFrame() + F(T.e);
  const sp = wf("disuapin");
  const strike = interpolate(g, [sp, sp + 10], [0, 1], { ...CL, easing: EASE });
  return (
    <Scene variant="dots" n="4" label="INGAT" g={g} from={F(T.e)}>
      <div style={{ position: "absolute", left: 76, right: 76, top: 215, fontFamily: SANS, fontWeight: 700, fontSize: 54, color: INK, opacity: rise(g, wf("lo", 1), 8) }}>Lo masih <span style={{ color: OR }}>mahasiswa,</span></div>
      <Head g={g} top={330} size={150} lines={[{ t: "Rasa ingin tahu", show: wf("lo", 1) + 4, fill: wf("rasa") }, { t: "itu penting.", show: wf("lo", 1) + 8, fill: wf("penting"), acc: true }]} />
      <Cam s={interpolate(g, [F(T.e), F(T.f)], [1.03, 1])}>
        <div style={{ position: "absolute", left: 76, right: 76, top: 920, height: 250, borderRadius: 34, background: "rgba(14,12,10,.92)", border: "2px solid rgba(244,241,236,.2)", display: "flex", alignItems: "center", gap: 36, padding: "0 50px", opacity: g >= sp - 4 ? 1 : 0, scale: `${interpolate(g, [sp - 4, sp + 6], [0.9, 1], { ...CL, easing: EASE })}` }}>
          <Icon n="spoon" c={INK} size={150} sw={2.2} />
          <span style={{ position: "relative", fontFamily: "Anton, sans-serif", fontSize: 128, color: INK, letterSpacing: 2, textTransform: "uppercase" }}>disuapin<i style={{ position: "absolute", left: -8, top: "54%", height: 12, width: `${strike * 104}%`, background: RED, borderRadius: 6 }} /></span>
          <span style={{ marginLeft: "auto", opacity: strike, scale: `${1.4 - strike * 0.4}` }}><Icon n="x" c={RED} size={90} sw={2.8} /></span>
        </div>
      </Cam>
      <Ribbons arcs={["M-60 880 C 300 810, 760 810, 1140 890"]} f={g} at={sp - 8} gap={4} len={20} />
    </Scene>
  );
};

/* ---- F · the question, typed into a search box ---- */
const When: React.FC = () => {
  const g = useCurrentFrame() + F(T.f);
  const t = g / 30;
  const text = typed(Q3, t);
  const done = t >= ws("sendiri") + 0.3;
  return (
    <Scene variant="plum" n="5" label="PERTANYAANNYA" g={g} from={F(T.f)}>
      <div style={{ position: "absolute", left: 76, right: 76, top: 215, fontFamily: SANS, fontWeight: 600, fontSize: 48, lineHeight: 1.2, color: MUTE, opacity: rise(g, wf("kalau"), 8) }}>Kalau semuanya harus dijelaskan orang lain,</div>
      <Head g={g} top={400} size={112} lines={[{ t: "Kapan lo belajar", show: wf("kalau") + 6, fill: wf("kapan") }, { t: "mencari tahu", show: wf("kalau") + 10, fill: wf("mencari") }, { t: "sendiri?", show: wf("kalau") + 14, fill: wf("sendiri"), acc: true, sz: 230 }]} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1120, minHeight: 130, borderRadius: 46, background: "rgba(16,10,22,.9)", border: `3px solid ${done ? OR : "rgba(244,241,236,.22)"}`, display: "flex", alignItems: "center", gap: 20, padding: "0 28px 0 36px", boxSizing: "border-box", fontFamily: SANS, fontWeight: 500, fontSize: 38, color: INK, opacity: rise(g, wf("belajar") - 6, 8) }}>
        <Icon n="search" c={MUTE} size={46} />
        <span style={{ flex: 1 }}>{text || <span style={{ color: "#8A857B" }}>Tanya Claude…</span>}{Math.floor(g / 8) % 2 === 0 && !done ? <span style={{ borderLeft: `3px solid ${OR}`, marginLeft: 3 }} /> : null}</span>
        <div style={{ width: 84, height: 84, borderRadius: "50%", background: text ? OR : "#5A3A22", display: "flex", alignItems: "center", justifyContent: "center", scale: `${done ? 1 + 0.06 * Math.sin((g - F(ws("sendiri") + 0.3)) / 3) : 1}` }}><Icon n="up" c="#1A0E04" size={46} sw={2.6} /></div>
      </div>
      <Ribbons arcs={["M-60 1090 C 300 1010, 760 1010, 1140 1100", "M1140 1330 C 780 1410, 300 1410, -60 1320"]} f={g} at={F(ws("sendiri") + 0.3)} gap={5} len={24} />
    </Scene>
  );
};

/* ---- G · end card on the grid floor, wordmark with a reflection ---- */
const End: React.FC = () => {
  const g = useCurrentFrame() + F(T.end);
  const s = F(T.end), word = "RESEARCHQ";
  const Word = () => <>{word.split("").map((ch, k) => <span key={k} style={{ opacity: interpolate(g, [s + 6 + k * 1.5, s + 9 + k * 1.5], [0, 1], CL), display: "inline-block", translate: `0px ${interpolate(g, [s + 6 + k * 1.5, s + 11 + k * 1.5], [26, 0], { ...CL, easing: EASE })}px` }}>{ch}</span>)}</>;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop variant="grid" />
      <div style={{ position: "absolute", left: 540 - 70, top: 560, scale: `${interpolate(g, [s, s + 8], [1.7, 1], { ...CL, easing: EASE })}`, rotate: `${(g - s) * 1.3}deg`, filter: `blur(${interpolate(g, [s, s + 5], [10, 0], CL)}px)` }}><Mark size={140} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 110, letterSpacing: 4, color: "#fff", lineHeight: 1.1 }}><Word /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 740 + 120, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 110, letterSpacing: 4, color: "#fff", lineHeight: 1.1, transform: "scaleY(-1)", opacity: 0.22, WebkitMaskImage: "linear-gradient(to bottom, transparent 30%, #000 100%)" }}><Word /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 44, color: "#fff", opacity: rise(g, s + 24, 8) }}>Follow <span style={{ color: OR }}>@researchq.id</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1160, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: "#CFCAC1", opacity: rise(g, s + 32, 8) }}>TIPS RISET PAKAI AI, TIAP HARI</div>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- TikTok-style captions: 3-word chunks, the spoken word in a box, keywords in accent ---- */
const KEYS = new Set(["mahasiswa", "ai", "nunggu", "claude", "claude-nya", "skripsi", "limitnya", "fiturnya", "harga", "kelebihannya", "beres", "tutorial", "disuapin", "sendiri", "penting", "tanya", "jelasin", "penjelasan", "kapan", "belajar"]);
const CHUNKS: [string, number][][] = (() => {
  const out: [string, number][][] = []; let cur: [string, number][] = [];
  for (const w of WORDS) { cur.push(w); if (/[.,?!]$/.test(w[0]) || cur.length >= 3) { out.push(cur); cur = []; } }
  if (cur.length) out.push(cur); return out;
})();
const Caps: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const i = CHUNKS.findIndex((p, k) => t >= p[0][1] - 0.05 && t < (CHUNKS[k + 1] ? CHUNKS[k + 1][0][1] - 0.05 : p[p.length - 1][1] + 1.0));
  if (i < 0 || t > T.end + 0.2) return null;
  const p = CHUNKS[i];
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1455, display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", fontFamily: SANS, fontWeight: 800, fontSize: 58 }}>
      {p.map(([w, s], k) => {
        const next = k + 1 < p.length ? p[k + 1][1] : s + 0.5;
        const act = t >= s && t < next, past = t >= s;
        const key = KEYS.has(clean(w));
        return (
          <span key={k} style={{ padding: "4px 18px", borderRadius: 14, background: act ? (key ? OR : "#fff") : "transparent", color: act ? "#111" : key && past ? OR : "#fff", opacity: past ? 1 : 0.35, textShadow: act ? "none" : "0 4px 18px rgba(0,0,0,.8)", transform: act ? "scale(1.06)" : "none" }}>{w}</span>
        );
      })}
    </div>
  );
};

export const MahasiswaUdikRef: React.FC<{ subs?: boolean }> = ({ subs = true }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#060504" }}>
      <Sequence durationInFrames={F(T.b)} name="Hook"><Hook /></Sequence>
      <Sequence from={F(T.b)} durationInFrames={F(T.c) - F(T.b)} name="Pertanyaan"><Questions /></Sequence>
      <Sequence from={F(T.c)} durationInFrames={F(T.d) - F(T.c)} name="Layar Claude"><ClaudeScene /></Sequence>
      <Sequence from={F(T.d)} durationInFrames={F(T.e) - F(T.d)} name="Hasil"><Done /></Sequence>
      <Sequence from={F(T.e)} durationInFrames={F(T.f) - F(T.e)} name="Ingat"><Curious /></Sequence>
      <Sequence from={F(T.f)} durationInFrames={F(T.end) - F(T.f)} name="Pertanyaannya"><When /></Sequence>
      <Sequence from={F(T.end)} durationInFrames={F(T.total) - F(T.end)} name="End"><End /></Sequence>
      {subs ? <Caps /> : null}
      <Audio src={staticFile("udik-vo.wav")} premountFor={fps} />
      <Audio src={staticFile("udik-sfx.wav")} premountFor={fps} volume={0.8} />
    </AbsoluteFill>
  );
};
