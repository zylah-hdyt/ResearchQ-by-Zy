import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ACC, CL, Cam, EASE, Glow, Grain, inFocus, IO, LINE, MONO, MUT, OR, PANEL, PANEL2, Ribbons, SANS, slam, StreakCut, TXT, Vignette, W, Mark } from "../cine/Cine";

// Ad: AI Detection Reducer (ORACLE), 15s (450 frames @30fps), same dark cinematic look as SkillsCine. SFX only.
// Honest framing: detectors misjudge human writing (Liang et al., Patterns 2023); the 100% → 15% scores are an
// on-screen illustration, results vary per detector and are not guaranteed; the skill edits wording and keeps
// meaning, data and citations. 120 BPM grid (15 f):
// 0–60 hook · 60–150 detector says 100% · 150–240 skill prompt · 240–330 rewrite · 330–390 re-scan 15% · 390–450 CTA + claim.
const RED = "#FF5A4E", GREEN = "#5BD68A";
const SKILL = "AI Detection Reducer";

const Gauge: React.FC<{ v: number; c: string; size?: number }> = ({ v, c, size = 360 }) => {
  const r = 150, C = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 360 360" width={size} height={size} style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
        <circle cx={180} cy={180} r={r} fill="none" stroke="#222" strokeWidth={24} />
        <circle cx={180} cy={180} r={r} fill="none" stroke={c} strokeWidth={24} strokeLinecap="round" strokeDasharray={`${(C * v) / 100} ${C}`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
        <div style={{ fontWeight: 800, fontSize: size * 0.33, letterSpacing: -4, lineHeight: 1, color: "#fff" }}>{Math.round(v)}<span style={{ fontSize: size * 0.14, color: c }}>%</span></div>
        <div style={{ fontFamily: MONO, fontSize: size * 0.05, letterSpacing: 3, color: MUT, marginTop: 8 }}>AI</div>
      </div>
    </div>
  );
};
const Tag: React.FC<{ children: React.ReactNode; top: number }> = ({ children, top }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top, fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: OR }}>{children}</div>
);
const Note: React.FC<{ children: React.ReactNode; top: number; o?: number }> = ({ children, top, o = 1 }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 31, lineHeight: 1.4, color: "#A8A49D", opacity: o }}>{children}</div>
);

// The paragraph under test. Segments: [text, flagged?]. After the rewrite we show the edited version.
const BEFORE: [string, boolean][] = [
  ["Selain itu, penting untuk dicatat bahwa", true], [" media sosial memainkan peran yang ", false], ["sangat krusial", true],
  [" dalam membentuk keputusan pembelian Generasi Z (Populix, 2022). ", false], ["Dengan demikian, dapat disimpulkan bahwa", true],
  [" pemasaran digital merupakan aspek yang ", false], ["tidak dapat diabaikan.", true],
];
const AFTER: [string, boolean][] = [
  ["Media sosial ", false], ["ikut menentukan", true], [" apa yang dibeli Gen Z ", false], ["(Populix, 2022)", false], [". ", false],
  ["Karena itu,", true], [" pengaruh pemasaran digital ", false], ["perlu diuji lebih jauh", true], [", khususnya di TikTok Shop.", false],
];
const Paper: React.FC<{ f: number; mode: "flag" | "rewrite"; top: number }> = ({ f, mode, top }) => {
  const swap = mode === "rewrite" ? interpolate(f, [30, 40], [0, 1], CL) : 0;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, borderRadius: 28, background: PANEL, border: `2px solid ${LINE}`, overflow: "hidden", boxShadow: "0 80px 140px -50px rgba(0,0,0,.95)" }}>
      <div style={{ height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", borderBottom: `2px solid ${LINE}`, background: "#101010", fontFamily: MONO, fontSize: 20, color: MUT }}>
        {[0, 1, 2].map((k) => <span key={k} style={{ width: 14, height: 14, borderRadius: "50%", background: "#3A3A3A" }} />)}
        <span style={{ marginLeft: 14 }}>BAB2_Kajian_Pustaka.docx</span>
      </div>
      <div style={{ position: "relative", padding: "30px 36px 36px", fontFamily: SANS, fontSize: 36, lineHeight: 1.6, color: TXT, minHeight: 380 }}>
        <div style={{ opacity: 1 - swap, filter: `blur(${swap * 8}px)` }}>
          {BEFORE.map(([t, flag], k) => {
            const hl = mode === "flag" ? interpolate(f, [22 + k * 4, 30 + k * 4], [0, 1], CL) : 1;
            const strike = mode === "rewrite" ? interpolate(f, [4 + k * 3, 14 + k * 3], [0, 1], { ...CL, easing: EASE }) : 0;
            return flag ? (
              <span key={k} style={{ background: `rgba(255,90,78,${0.28 * hl})`, borderBottom: `3px solid rgba(255,90,78,${hl})`, color: hl > 0.5 ? "#FFD0CB" : TXT, textDecoration: strike > 0.5 ? "line-through" : "none", textDecorationColor: RED, textDecorationThickness: 4, opacity: 1 - strike * 0.45 }}>{t}</span>
            ) : <span key={k}>{t}</span>;
          })}
        </div>
        {mode === "rewrite" ? (
          <div style={{ position: "absolute", left: 36, right: 36, top: 30, opacity: swap, filter: `blur(${(1 - swap) * 8}px)` }}>
            {AFTER.map(([t, ed], k) => (
              <span key={k} style={ed ? { borderBottom: `3px solid ${OR}`, color: "#fff" } : t.startsWith("(") ? { color: OR } : undefined}>{t}</span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ---- 1 · Hook 0–60 ---- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const dive = interpolate(f, [50, 60], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  const shake = f >= 14 && f < 20 ? `${Math.sin(f * 7) * 10}px ${Math.cos(f * 9) * 6}px` : "0px 0px";
  return (
    <AbsoluteFill style={{ background: "#070402", overflow: "hidden" }}>
      <Glow x={540 + Math.sin(f / 11) * 60} y={1260} r={1000} o={0.48} />
      <Cam s={interpolate(f, [0, 50], [1, 1.05]) + dive * 1.6} blur={dive * 10}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: SANS, fontWeight: 800, letterSpacing: -4, lineHeight: 1.04, color: "#fff", translate: shake }}>
          <div style={{ fontSize: 120 }}><W f={f} at={0}>Nulis</W> <W f={f} at={4}>sendiri,</W></div>
          <div style={{ fontSize: 120 }}><W f={f} at={9}>dibilang</W> <W f={f} at={11}>AI</W></div>
          <div style={{ fontSize: 250, letterSpacing: -10, color: RED, ...slam(f, 14, 1.5) }}>100%?</div>
        </div>
      </Cam>
      <Note top={1430} o={interpolate(f, [26, 32], [0, 1], CL) * (1 - dive)}>AI detector bisa salah menilai tulisan manusia<br /><span style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 1, color: "#6A665F" }}>Liang dkk., Patterns, 2023</span></Note>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 2 · Detector 60–150: gauge climbs to 100%, phrases get flagged ---- */
const Detector: React.FC = () => {
  const f = useCurrentFrame();
  const v = interpolate(f, [6, 40], [0, 100], { ...CL, easing: Easing.out(Easing.cubic) });
  const pulse = f > 40 ? 1 + Math.sin((f - 40) / 3) * 0.02 : 1;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={540} y={720} r={620} o={interpolate(f, [30, 45], [0.2, 0.42], CL)} />
      <Tag top={220}>AI DETECTOR · ILUSTRASI</Tag>
      <div style={{ position: "absolute", left: 76, right: 80, top: 262, fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -3, color: "#fff" }}><W f={f} at={0}>Hasil cek:</W></div>
      <Cam y={interpolate(f, [0, 90], [20, -10])} rx={interpolate(f, [0, 10], [18, 4], { ...CL, easing: EASE })} ry={interpolate(f, [0, 90], [-4, 4])} s={interpolate(f, [0, 90], [1.04, 1])} blur={inFocus(f)}>
        <div style={{ position: "absolute", left: 540 - 180, top: 420, scale: `${pulse}` }}><Gauge v={v} c={RED} /></div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 36, color: v > 99 ? RED : MUT }}>Kemungkinan ditulis AI</div>
        <Paper f={f} mode="flag" top={890} />
      </Cam>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 3 · Skill 150–240: the prompt, light ribbons around it ---- */
const PROMPT = "Rapikan paragraf ini biar natural. Makna, data & sitasi jangan berubah.";
const Skill: React.FC = () => {
  const f = useCurrentFrame();
  const typed = PROMPT.slice(0, Math.floor(interpolate(f, [14, 62], [0, PROMPT.length], CL)));
  const dive = interpolate(f, [78, 90], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={540} y={860} r={800} o={0.48} />
      <Tag top={300}>PAKAI SKILL · SISTEM ORACLE</Tag>
      <div style={{ position: "absolute", left: 76, right: 70, top: 345, fontFamily: SANS, fontWeight: 800, fontSize: 96, letterSpacing: -4, lineHeight: 1.0, color: "#fff" }}><W f={f} at={0}>AI Detection</W><br /><W f={f} at={4} style={{ color: OR }}>Reducer</W></div>
      <Cam s={interpolate(f, [0, 78], [1.06, 1]) + dive * 1.2} rx={interpolate(f, [0, 10], [20, 6], { ...CL, easing: EASE })} blur={dive * 12 + inFocus(f)}>
        <Ribbons arcs={["M-40 700 C 260 560, 760 560, 1120 740", "M1120 1320 C 820 1420, 300 1410, -40 1280", "M140 640 C 60 900, 80 1150, 260 1380", "M960 1380 C 1040 1130, 1030 880, 840 640"]} f={f} at={6} gap={8} len={30} />
        <div style={{ position: "absolute", left: 60, right: 60, top: 780, borderRadius: 34, background: "rgba(20,14,8,.94)", border: `2px solid rgba(242,138,46,${interpolate(f, [0, 20], [0.25, 0.85], CL)})`, padding: "30px 32px 104px", fontFamily: SANS }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 700, fontSize: 28, color: "#C9C4BB", marginBottom: 18 }}><Img src={staticFile("claude_logo_t.png")} style={{ width: 40, height: 40 }} />Claude</div>
          <div style={{ fontSize: 38, lineHeight: 1.4, color: TXT }}>
            <span style={{ display: "inline-block", padding: "2px 16px", borderRadius: 999, border: "2px solid rgba(242,138,46,.7)", color: OR, fontWeight: 700, fontSize: 28, marginRight: 10 }}>✦ {SKILL}</span>
            <span style={{ display: "inline-block", padding: "2px 16px", borderRadius: 999, border: `2px solid ${LINE}`, color: MUT, fontWeight: 600, fontSize: 26, marginRight: 10 }}>📎 BAB2.docx</span>
            {typed}{f < 70 && Math.floor(f / 6) % 2 === 0 ? <span style={{ borderLeft: `3px solid ${TXT}`, marginLeft: 2 }} /> : null}
          </div>
          <div style={{ position: "absolute", right: 28, bottom: 26, width: 66, height: 66, borderRadius: "50%", background: typed.length > 20 ? OR : "#3A2A20", color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", scale: `${interpolate(f, [68, 71, 74], [1, 0.8, 1], CL)}` }}>↑</div>
        </div>
      </Cam>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 4 · Rewrite 240–330: flagged phrases struck, edited version fades in, checks ---- */
const Rewrite: React.FC = () => {
  const f = useCurrentFrame();
  const checks = ["Makna tetap", "Data & sitasi utuh", "Gaya bahasamu"];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={980} y={1800} r={700} o={0.32} />
      <Tag top={220}>DITULIS ULANG</Tag>
      <div style={{ position: "absolute", left: 76, right: 70, top: 262, fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -3, lineHeight: 1.02, color: "#fff" }}><W f={f} at={0}>Lebih natural,</W><br /><W f={f} at={4} style={{ color: OR }}>tetap tulisanmu.</W></div>
      <Cam s={interpolate(f, [0, 90], [1.1, 1.02], { easing: Easing.out(Easing.quad) })} ry={interpolate(f, [0, 90], [8, -3])} rx={interpolate(f, [0, 12], [14, 3], CL)} blur={inFocus(f, 8)}>
        <Paper f={f} mode="rewrite" top={520} />
        {checks.map((t, k) => (
          <div key={t} style={{ position: "absolute", left: 80, top: 1080 + k * 104, display: "flex", alignItems: "center", gap: 20, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: "#fff", ...slam(f, 48 + k * 12, 1.12) }}>
            <span style={{ width: 46, height: 46, borderRadius: "50%", border: `3px solid ${OR}`, color: OR, fontSize: 26, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>{t}
          </div>
        ))}
      </Cam>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 5 · Re-scan 330–390: gauge falls 100 → 15 ---- */
const Rescan: React.FC = () => {
  const f = useCurrentFrame();
  const v = interpolate(f, [6, 36], [100, 15], { ...CL, easing: Easing.inOut(Easing.cubic) });
  const t = interpolate(f, [6, 36], [0, 1], CL);
  const c = t < 0.6 ? RED : t < 0.85 ? OR : GREEN;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={540} y={820} r={640} o={0.3 * (1 - t) + 0.12} />
      <Tag top={300}>CEK ULANG · ILUSTRASI</Tag>
      <Cam s={interpolate(f, [0, 60], [1.12, 1.0], { easing: Easing.out(Easing.cubic) })} blur={inFocus(f)}>
        <div style={{ position: "absolute", left: 540 - 220, top: 420, scale: `${f > 36 ? interpolate(f, [36, 41], [1.06, 1], CL) : 1}` }}><Gauge v={v} c={c} size={440} /></div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 92, letterSpacing: -3, color: "#fff" }}>
          <span style={{ color: RED, textDecoration: f > 38 ? "line-through" : "none", textDecorationThickness: 6, opacity: f > 38 ? 0.6 : 1 }}>100%</span> <span style={{ color: OR }}>→</span> <span style={{ color: GREEN, opacity: interpolate(f, [34, 38], [0, 1], CL) }}>15%</span>
        </div>
      </Cam>
      <Note top={1080} o={interpolate(f, [30, 38], [0, 1], CL)}>*Ilustrasi pada satu contoh paragraf.<br />Hasil berbeda di tiap detektor dan tidak dijamin.</Note>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 6 · CTA 390–450 + claim ---- */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={540} y={1300} r={760} o={0.35} />
      <Cam s={interpolate(f, [0, 60], [1.05, 1])} blur={inFocus(f, 5)}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: OR }}>SKILL · {SKILL.toUpperCase()}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 132, letterSpacing: -5, lineHeight: 1.0, color: "#fff", ...slam(f, 2, 1.25) }}>Komen <span style={{ color: OR }}>AI</span> 👇</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", ...ACC, fontSize: 50, color: "#CFCAC1" }}><W f={f} at={8}>nanti aku kirim link-nya</W></div>
        <div style={{ position: "absolute", left: 90, right: 90, top: 700, padding: "28px 32px", borderRadius: 26, background: PANEL2, border: `2px solid ${LINE}`, fontFamily: SANS, fontSize: 32, lineHeight: 1.45, color: "#D6D1C8", opacity: interpolate(f, [12, 18], [0, 1], CL) }}>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: MUT, marginBottom: 10 }}>CATATAN</div>
          Untuk merapikan tulisanmu sendiri, bukan menyamarkan karya orang lain. Ikuti aturan kampus soal penggunaan AI dan cantumkan bila diwajibkan.
        </div>
      </Cam>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, opacity: interpolate(f, [20, 26], [0, 1], CL) }}>
        <Mark size={48} />
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: 1, color: "#fff" }}>RESEARCHQ<span style={{ color: OR }}>.</span>ID</span>
      </div>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

export const AiReducerAd: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={60} name="Hook"><Hook /></Sequence>
      <Sequence from={60} durationInFrames={90} name="Detector 100%"><Detector /></Sequence>
      <Sequence from={150} durationInFrames={90} name="Skill"><Skill /></Sequence>
      <Sequence from={240} durationInFrames={90} name="Rewrite"><Rewrite /></Sequence>
      <Sequence from={330} durationInFrames={60} name="Cek ulang 15%"><Rescan /></Sequence>
      <Sequence from={390} durationInFrames={60} name="CTA"><Cta /></Sequence>
      {([[56, 1], [146, -1], [236, 1], [326, -1], [386, 1]] as const).map(([t, d]) => (
        <Sequence key={t} from={t} durationInFrames={12}><StreakCut dir={d} /></Sequence>
      ))}
      <Audio src={staticFile("aireducer-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
