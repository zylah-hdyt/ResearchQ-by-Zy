import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SERIF } from "../scopus/kit";
import { CL, EASE, MONO, SANS } from "../theory/kit";
import { alpha, Icon, SYSTEMS, tint } from "./data";
import { blinds, blockWipe, dive, irisIcon, pushUp, ringDot, slices, splitShutter, swing, toCard } from "./trans";

// ResearchQ Skills Library — cinematic catalogue, 51s (1530 frames @30fps), no VO.
// Look taken from the reference analysis: dark stage + soft warm horizon, word-by-word serif italic, camera push-ins
// with defocus and a light chromatic split, cream logo reveal, fly-through of the 9 systems, white flash, CTA.
// Timeline: hook 0–120 · logo 120–285 · systems 285 + i·110 (each 124 long, 14-frame custom transitions) · wall 1275
// ("44 skill" at 1330) · flash 1385 · CTA 1383–1530. SFX only — the creator adds their own music.
const BG = "#0B0D12", ORANGE = "#EE6A1F", CREAM = "#F2EFE9";
const SLOT = 110, TF = 14;
// One transition per boundary: logo→GENESIS … PRISM→wall.
const TRANS = [irisIcon, blockWipe, splitShutter, pushUp, blinds, dive, swing, slices, ringDot, toCard];

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const s = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.5) 100%)" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.08, mixBlendMode: "overlay" }}>
        <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={s} /></filter>
        <rect width="100%" height="100%" filter="url(#gr)" transform={`translate(${random(`x${s}`) * 16 - 8} ${random(`y${s}`) * 16 - 8})`} />
      </svg>
    </AbsoluteFill>
  );
};
// Taste pass: no glowing horizon. A single hairline rule stands in for it.
const Horizon: React.FC<{ c?: string; o?: number }> = ({ c = ORANGE }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: 80, top: 1640, height: 2, width: interpolate(f, [0, 20], [0, 920], { ...CL, easing: EASE }), background: alpha(c, 0.5) }} />;
};
const Footer: React.FC<{ dark?: boolean }> = ({ dark = true }) => (
  <>
    <div style={{ position: "absolute", left: 80, bottom: 62, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: dark ? "#E9E6DF" : "#1B1A18" }}>ResearchQ<span style={{ color: ORANGE }}>.</span></div>
    <div style={{ position: "absolute", right: 80, bottom: 68, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: dark ? "#7E8592" : "#8C877E" }}>@RESEARCHQ.ID</div>
  </>
);
// Word that resolves from blur, like the reference's kinetic type.
const W: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 12], [0, 1], { ...CL, easing: EASE });
  return <span style={{ display: "inline-block", opacity: p, filter: `blur(${(1 - p) * 14}px)`, translate: `0px ${(1 - p) * 26}px`, ...style }}>{children}</span>;
};

/* ---------- 1 · Hook ---------- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out1 = interpolate(f, [52, 62], [0, 1], CL);
  const push = interpolate(f, [96, 120], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  const ca = push * 18;
  const orbX = interpolate(f, [0, 6, 16, 26, 36, 60, 74, 90], [300, 330, 760, 330, 760, 260, 820, 860], CL);
  const orbY = interpolate(f, [0, 6, 16, 26, 36, 60, 74, 90], [620, 640, 760, 880, 1000, 800, 940, 1000], CL);
  const lines: [string, number][] = [["Skripsi,", 6], ["tesis,", 16], ["disertasi,", 26], ["jurnal.", 36]];
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Horizon />
      <div style={{ position: "absolute", left: orbX - 9, top: orbY - 9, width: 18, height: 18, borderRadius: "50%", background: "#F6B27E", opacity: interpolate(f, [0, 4, 90, 96], [0, 1, 1, 0], CL) }} />
      <AbsoluteFill style={{ transformOrigin: "62% 52%", scale: `${1 + push * 2.6}`, filter: `blur(${push * 10}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 128, lineHeight: 1.0, color: "#ECE8E1", opacity: 1 - out1, filter: `blur(${out1 * 12}px)`, translate: `0px ${-out1 * 60}px` }}>
          {lines.map(([t, at]) => <div key={t}><W at={at}>{t}</W></div>)}
        </div>
        {f >= 58 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 150, lineHeight: 1.05, color: "#ECE8E1", textShadow: ca ? `${ca}px 0 rgba(255,40,70,.55), ${-ca}px 0 rgba(40,170,255,.55)` : "none" }}>
            <div><W at={60}>Semua</W> <W at={66}>ada</W></div>
            <div style={{ position: "relative", display: "inline-block" }}>
              <W at={74} style={{ color: "#F59A5C" }}>skill-nya.</W>
              <svg width={560} height={60} style={{ position: "absolute", left: 20, top: 150 }}>
                <path d="M6 34 C 140 14, 330 18, 550 30" fill="none" stroke={ORANGE} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(f, [84, 100], [0, 1], { ...CL, easing: EASE })} />
              </svg>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 2 · Logo + counters (cream) ---------- */
const Count: React.FC<{ to: number; at: number; label: string }> = ({ to, at, label }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [at, at + 36], [0, to], { ...CL, easing: Easing.out(Easing.cubic) }));
  return (
    <div style={{ textAlign: "center", opacity: interpolate(f, [at - 4, at + 4], [0, 1], CL) }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 190, letterSpacing: -8, lineHeight: 1, color: "#1B1A18" }}>{v}</div>
      <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 6, color: "#8C877E", marginTop: 6 }}>{label}</div>
    </div>
  );
};
const Logo: React.FC = () => {
  const f = useCurrentFrame();
  const ry = interpolate(f, [0, 165], [-46, 32]);
  const inP = interpolate(f, [0, 14], [0, 1], { ...CL, easing: EASE });
  return (
    <AbsoluteFill style={{ background: CREAM, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,.7) 0%, rgba(242,239,233,0) 60%, rgba(120,110,95,.25) 100%)" }} />
      <AbsoluteFill style={{ filter: `blur(${(1 - inP) * 10}px)`, scale: `${1.06 - inP * 0.06}` }}>
        <div style={{ position: "absolute", left: 340, top: 330, width: 400, height: 400, perspective: 1400 }}>
          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(14deg) rotateY(${ry}deg)` }}>
            {Array.from({ length: 14 }).map((_, k) => (
              <Img key={k} src={staticFile("claude_logo_t.png")} style={{ position: "absolute", inset: 0, width: 400, height: 400, transform: `translateZ(${(k - 13) * 2.4}px)`, filter: k < 13 ? `brightness(${0.42 + k * 0.025}) saturate(1.1)` : "none" }} />
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: MONO, fontSize: 26, letterSpacing: 8, color: "#8C877E", opacity: interpolate(f, [18, 28], [0, 1], CL) }}>RESEARCHQ SKILLS LIBRARY</div>
        <div style={{ position: "absolute", left: 120, right: 120, top: 900, display: "flex", justifyContent: "space-around", alignItems: "flex-start" }}>
          <Count to={44} at={36} label="SKILL" />
          <div style={{ width: 2, height: 200, background: "#D8D2C7", marginTop: 20 }} />
          <Count to={9} at={44} label="SISTEM" />
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1240, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 64, lineHeight: 1.15, color: "#1B1A18" }}>
          <W at={88}>Satu</W> <W at={92}>workspace.</W><br /><W at={100}>Dari</W> <W at={104}>ide</W> <W at={108}>sampai</W> <W at={112} style={{ color: ORANGE }}>terbit.</W>
        </div>
      </AbsoluteFill>
      <Footer dark={false} />
    </AbsoluteFill>
  );
};

/* ---------- 3 · One system ---------- */
const Track: React.FC<{ cur: number }> = ({ cur }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: 1690 }}>
    <div style={{ position: "absolute", left: 12, right: 12, top: 11, height: 2, background: "rgba(255,255,255,.12)" }} />
    <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
      {SYSTEMS.map((s, i) => (
        <div key={s.name} style={{ width: 24, height: 24, borderRadius: "50%", background: i < cur ? tint(s.color, 0.2) : i === cur ? s.color : "#1A1E27", border: `2px solid ${i <= cur ? tint(s.color, 0.3) : "rgba(255,255,255,.18)"}`, scale: i === cur ? "1.35" : "1" }} />
      ))}
    </div>
  </div>
);
const SystemScene: React.FC<{ i: number }> = ({ i }) => {
  const f = useCurrentFrame();
  const s = SYSTEMS[i];
  const c = tint(s.color, 0.32);
  const cam = interpolate(f, [0, SLOT + 14], [0, 1]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: BG }} />
      <div style={{ position: "absolute", right: -40, top: 1010, fontFamily: SANS, fontWeight: 800, fontSize: 620, letterSpacing: -30, lineHeight: 1, color: "transparent", WebkitTextStroke: `2px ${alpha(s.color, 0.32)}`, translate: `${-cam * 60}px 0px` }}>{String(i + 1).padStart(2, "0")}</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 210, height: 1, background: "rgba(255,255,255,.1)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 14, background: s.color }} />
      <AbsoluteFill style={{ translate: `0px ${-cam * 24}px` }}>
        <div style={{ position: "absolute", left: 80, top: 230, fontFamily: MONO, fontSize: 24, letterSpacing: 5, color: c }}>SISTEM {String(i + 1).padStart(2, "0")} / 09 · {s.verb}</div>
        <div style={{ position: "absolute", left: 80, top: 300, width: 150, height: 150, borderRadius: 38, background: alpha(s.color, 0.16), border: `2px solid ${alpha(s.color, 0.55)}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon i={i} c={c} size={96} draw={interpolate(f, [4, 30], [0, 1], { ...CL, easing: EASE })} />
        </div>
        <div style={{ position: "absolute", left: 260, top: 318, fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: "#8D95A3" }}>{s.role.toUpperCase()}</div>
        <div style={{ position: "absolute", left: 260, top: 360, padding: "8px 18px", borderRadius: 999, border: `2px solid ${alpha(s.color, 0.5)}`, color: c, fontFamily: SANS, fontWeight: 700, fontSize: 26 }}>{s.field}</div>
        <div style={{ position: "absolute", left: 72, top: 470, fontFamily: SANS, fontWeight: 800, fontSize: 168, letterSpacing: -6, lineHeight: 1, color: "#F1EEE8" }}>
          {s.name.split("").map((ch, k) => <W key={k} at={6 + k * 2}>{ch}</W>)}
        </div>
        <div style={{ position: "absolute", left: 80, right: 60, top: 660, fontFamily: SERIF, fontStyle: "italic", fontSize: 64, lineHeight: 1.1, color: c }}>
          {s.tag.split(" ").map((w, k) => <span key={k}><W at={18 + k * 3}>{w}</W> </span>)}
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 860 }}>
          {s.skills.map((k, j) => {
            const at = Math.round(27.5 + j * 6.875);
            const p = interpolate(f, [at, at + 12], [0, 1], { ...CL, easing: EASE });
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 26, height: 92, marginBottom: 12, padding: "0 28px", borderRadius: 20, background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.07)", borderLeft: `5px solid ${s.color}`, opacity: p, translate: `${(1 - p) * 80}px 0px`, filter: `blur(${(1 - p) * 8}px)` }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: c }}>{String(j + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, color: "#ECE9E3", letterSpacing: -1 }}>{k}</span>
              </div>
            );
          })}
        </div>
        {i === 4 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1570, display: "flex", justifyContent: "center", opacity: interpolate(f, [2, 8, 70, 80], [0, 1, 1, 0], CL), translate: `0px ${interpolate(f, [2, 12], [20, 0], { ...CL, easing: EASE })}px` }}>
            <span style={{ padding: "14px 30px", borderRadius: 999, background: "#ECE9E3", color: BG, fontFamily: SANS, fontWeight: 800, fontSize: 36 }}>Itu baru 4 dari 9. Lanjut per bidang →</span>
          </div>
        ) : null}
      </AbsoluteFill>
      <Track cur={i} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1736, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 5, color: "#6E7584" }}>{String(i + 1).padStart(2, "0")} / 09 · {s.verb}</div>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 4 · Wall of 44 ---------- */
const ALL = SYSTEMS.flatMap((s) => s.skills.map((k) => ({ k, c: s.color })));
const Wall: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 55], [2.3, 1], { ...CL, easing: Easing.out(Easing.cubic) });
  const dim = interpolate(f, [55, 60], [0, 1], CL);
  const flash = interpolate(f, [100, 110, 135], [0, 1, 1], CL);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <Horizon o={0.35} />
      <AbsoluteFill style={{ scale: `${z}`, rotate: `${(z - 1) * -3}deg`, filter: `blur(${dim * 3}px)`, opacity: 1 - dim * 0.55 }}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 260, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
          {ALL.map(({ k, c }, j) => (
            <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 22px", borderRadius: 999, background: alpha(c, 0.16), border: `1.5px solid ${alpha(c, 0.55)}`, color: "#ECE9E3", fontFamily: SANS, fontWeight: 700, fontSize: 30, opacity: interpolate(f, [j * 0.9, j * 0.9 + 6], [0, 1], CL) }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", background: tint(c, 0.2) }} />{k}
            </span>
          ))}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", opacity: dim, scale: `${0.9 + dim * 0.1}` }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 210, letterSpacing: -9, lineHeight: 0.95, color: "#F4F1EB" }}>44 skill</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 120, letterSpacing: -5, color: "#F59A5C" }}>9 sistem</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 64, color: "#CFCAC1", marginTop: 16 }}>S1 · S2 · S3 · dosen & peneliti</div>
      </div>
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash }} />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- 5 · CTA ---------- */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const word = "NEXUS";
  const typed = word.slice(0, Math.max(0, Math.floor((f - 60) / 3)));
  const sent = f >= 82;
  const hi = Math.floor(f / 7) % 9;
  const endFade = interpolate(f, [130, 145], [0, 1], CL);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "#FFFFFF", opacity: interpolate(f, [0, 10], [1, 0], CL) }} />
      <Horizon o={0.5} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 76, color: "#CFCAC1" }}><W at={6}>Mulai</W> <W at={9}>dari</W></div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 196, letterSpacing: -9, lineHeight: 1, color: "#F4F1EB" }}><W at={12}>Rp29.000</W></div>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: "#8D95A3", marginTop: 10 }}><W at={18}>PER SKILL · AKUN CLAUDE GRATIS · SEKALI BELI</W></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -3, lineHeight: 1.05, color: "#F4F1EB" }}>
        <W at={26}>Komen</W> <W at={30}>nama</W><br /><W at={34} style={{ color: "#F59A5C" }}>sistemnya</W>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 920, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
        {SYSTEMS.map((s, i) => {
          const on = i === hi && f > 44;
          return <span key={s.name} style={{ padding: "12px 22px", borderRadius: 999, fontFamily: MONO, fontSize: 28, letterSpacing: 2, color: on ? BG : tint(s.color, 0.35), background: on ? tint(s.color, 0.3) : alpha(s.color, 0.14), border: `1.5px solid ${alpha(s.color, 0.6)}`, opacity: interpolate(f, [38 + i * 2, 44 + i * 2], [0, 1], CL) }}>{s.name}</span>;
        })}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1150, opacity: interpolate(f, [52, 58], [0, 1], CL) }}>
        {sent ? (
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18, opacity: interpolate(f, [82, 88], [0, 1], CL), translate: `0px ${interpolate(f, [82, 92], [16, 0], { ...CL, easing: EASE })}px` }}>
            <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#2A2F3A" }} />
            <div><div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, color: "#7E8592" }}>kamu · baru saja</div><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 38, color: "#F4F1EB" }}>{word}</div></div>
            <div style={{ marginLeft: "auto", fontSize: 34, color: "#F0616D", opacity: interpolate(f, [92, 96], [0, 1], CL) }}>♥</div>
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", borderRadius: 999, background: "#161A22", border: "1.5px solid #2A2F3A" }}>
          <span style={{ flex: 1, fontFamily: SANS, fontSize: 28, fontWeight: 700, color: typed && !sent ? "#F4F1EB" : "#5E6573" }}>{sent ? "Tambahkan komentar…" : typed || "Tambahkan komentar…"}</span>
          <span style={{ width: 54, height: 54, borderRadius: "50%", background: typed ? ORANGE : "#3A2A20", color: "#fff", fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 52, color: "#CFCAC1" }}><W at={96}>nanti aku kirim link-nya</W></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1510, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: "#7E8592" }}><W at={102}>LYNK.ID/RESQ · @RESEARCHQ.ID</W></div>
      <Footer />
      <AbsoluteFill style={{ background: "#000", opacity: endFade * 0.85 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 40, color: "#ECE9E3", opacity: endFade }}>ResearchQ<span style={{ color: ORANGE }}>.</span></div>
      <Grain />
    </AbsoluteFill>
  );
};

export const SkillsLibrary: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence durationInFrames={150} name="Hook"><Hook /></Sequence>
      <Sequence from={120} durationInFrames={1277} name="Systems">
        <TransitionSeries>
          <TransitionSeries.Sequence durationInFrames={179} name="Logo"><Logo /></TransitionSeries.Sequence>
          {SYSTEMS.flatMap((sy, i) => [
            <TransitionSeries.Transition key={`t${i}`} presentation={TRANS[i](sy.color)} timing={linearTiming({ durationInFrames: TF })} />,
            <TransitionSeries.Sequence key={sy.name} durationInFrames={SLOT + TF} name={sy.name}><SystemScene i={i} /></TransitionSeries.Sequence>,
          ])}
          <TransitionSeries.Transition presentation={TRANS[9]("#FFFFFF")} timing={linearTiming({ durationInFrames: TF })} />
          <TransitionSeries.Sequence durationInFrames={122} name="Wall"><Wall /></TransitionSeries.Sequence>
        </TransitionSeries>
      </Sequence>
      <Sequence from={1383} durationInFrames={147} name="CTA"><Cta /></Sequence>
      <Audio src={staticFile("library-audio.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
