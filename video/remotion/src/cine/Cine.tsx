import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { alpha, Icon, SYSTEMS, tint } from "../library/data";

// ResearchQ Skills Library, 25s (750 frames @30fps) re-shot in the dark "UI fly-through" style:
// black stage, orange light, a dark Claude-like UI filmed by a moving 3D camera, light streaks, white mark + wordmark.
// Same story and 120 BPM grid as SkillsShort (1 beat = 15 f), SFX only (the creator adds music):
// 0–60 hook · 60–120 core flow · 120–150 levels · 150–270 field systems · 270–300 dosen (PRISM) · 300–450 demo
// · 450–600 wall · 600–750 CTA → white mark → wordmark.
const SANS = "Poppins", MONO = "JetBrainsMono";
for (const [w, st] of [["400", "normal"], ["500", "normal"], ["600", "normal"], ["700", "normal"], ["800", "normal"], ["500", "italic"], ["600", "italic"]] as const) {
  loadFont({ family: SANS, url: staticFile(`fonts/poppins-latin-${w}-${st}.woff2`), weight: w, style: st });
}
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const OR = "#F28A2E", ORL = "#FFC46B", PANEL = "#141414", PANEL2 = "#1B1B1B", LINE = "#2A2A2A", TXT = "#EDEBE6", MUT = "#8A867F";
const ACC: React.CSSProperties = { fontFamily: SANS, fontStyle: "italic", fontWeight: 500 };
const S = (n: string) => SYSTEMS.findIndex((s) => s.name === n);

/* ---------------- shared pieces ---------------- */
const Glow: React.FC<{ x: number; y: number; r: number; o: number }> = ({ x, y, r, o }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(242,138,46,${o}) 0%, rgba(200,90,20,${o * 0.45}) 40%, rgba(0,0,0,0) 70%)` }} />
);
// Camera: moves the whole "world" of a scene (translate / scale / tilt / defocus).
const Cam: React.FC<{ x?: number; y?: number; s?: number; rx?: number; ry?: number; rz?: number; blur?: number; children: React.ReactNode }> = ({ x = 0, y = 0, s = 1, rx = 0, ry = 0, rz = 0, blur = 0, children }) => (
  <AbsoluteFill style={{ perspective: 1800 }}>
    <AbsoluteFill style={{ transformOrigin: "50% 50%", transform: `translate(${x}px, ${y}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>
  </AbsoluteFill>
);
const Mark: React.FC<{ size: number; c?: string }> = ({ size, c = "#fff" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={47} y={6} width={6} height={44} rx={3} fill={c} transform={`rotate(${k * 30} 50 50)`} />)}
  </svg>
);
// Light ribbons: short bright dashes travelling along curves (soft orange halo + hot core).
const Ribbons: React.FC<{ arcs: string[]; f: number; at?: number; gap?: number; len?: number; w?: number; h?: number }> = ({ arcs, f, at = 0, gap = 5, len = 26, w = 1080, h = 1920 }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {arcs.map((d, k) => {
      const p = interpolate(f, [at + k * gap, at + k * gap + len], [0, 1], { ...CL, easing: IO });
      if (p <= 0 || p >= 1) return null;
      const dash = { pathLength: 1, strokeDasharray: "0.36 1.4", strokeDashoffset: -p * 1.4 + 0.36, fill: "none", strokeLinecap: "round" as const };
      return (
        <g key={k}>
          <path d={d} {...dash} stroke={OR} strokeWidth={22} style={{ filter: "blur(12px)" }} opacity={0.85} />
          <path d={d} {...dash} stroke={ORL} strokeWidth={8} />
          <path d={d} {...dash} stroke="#FFF3DF" strokeWidth={2.5} />
        </g>
      );
    })}
  </svg>
);
// Cut accent: one fast streak across the frame (used on the big section changes).
const StreakCut: React.FC<{ dir?: 1 | -1 }> = ({ dir = 1 }) => {
  const f = useCurrentFrame();
  const d = dir === 1 ? "M-200 1500 C 300 1100, 700 800, 1300 300" : "M1280 1500 C 800 1150, 400 750, -200 350";
  return <AbsoluteFill style={{ pointerEvents: "none" }}><Ribbons arcs={[d, d.replace(/1500/g, "1650").replace(/300/g, "420")]} f={f} gap={2} len={11} /></AbsoluteFill>;
};
const Vignette: React.FC = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,.65) 100%)", pointerEvents: "none" }} />;
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const s = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.06, mixBlendMode: "overlay" }}>
        <filter id="gcine"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={s} /></filter>
        <rect width="100%" height="100%" filter="url(#gcine)" transform={`translate(${random(`x${s}`) * 16 - 8} ${random(`y${s}`) * 16 - 8})`} />
      </svg>
    </AbsoluteFill>
  );
};
// Word reveal: rises out of a blur.
const W: React.FC<{ f: number; at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ f, at, children, style }) => {
  const p = interpolate(f, [at, at + 7], [0, 1], { ...CL, easing: EASE });
  return <span style={{ display: "inline-block", opacity: p, filter: `blur(${(1 - p) * 12}px)`, translate: `0px ${(1 - p) * 34}px`, ...style }}>{children}</span>;
};
const slam = (f: number, at: number, from = 1.3) => ({ opacity: f >= at ? 1 : 0, scale: `${interpolate(f, [at, at + 5], [from, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` });
// Scene-in defocus: every scene arrives slightly out of focus and pushed, like a rack focus after a whip.
const inFocus = (f: number, n = 6) => interpolate(f, [0, n], [10, 0], CL);
const Spinner: React.FC<{ f: number; ok: boolean; size?: number }> = ({ f, ok, size = 34 }) => (
  <span style={{ width: size, height: size, borderRadius: "50%", border: `3px solid ${ok ? OR : MUT}`, borderTopColor: ok ? OR : "transparent", rotate: ok ? "0deg" : `${f * 16}deg`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, color: OR, fontWeight: 800, flex: "none" }}>{ok ? "✓" : ""}</span>
);

/* ---- 1 · Hook 0–60 ---- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out1 = interpolate(f, [25, 30], [0, 1], CL);
  const dive = interpolate(f, [50, 60], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  const lines: [string, number][] = [["Skripsi,", 0], ["tesis,", 6], ["disertasi,", 12], ["jurnal.", 18]];
  const markIn = interpolate(f, [29, 35], [0, 1], { ...CL, easing: EASE });
  return (
    <AbsoluteFill style={{ background: "#070402", overflow: "hidden" }}>
      <Glow x={540 + Math.sin(f / 11) * 60} y={1240} r={1000} o={0.5} />
      <Glow x={160} y={260} r={520} o={0.28} />
      <Cam s={interpolate(f, [0, 50], [1, 1.06]) + dive * 1.6} rx={interpolate(f, [0, 50], [6, 0])} blur={dive * 10}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 128, lineHeight: 1.08, letterSpacing: -3, color: TXT, opacity: 1 - out1, filter: `blur(${out1 * 14}px)`, scale: `${1 + out1 * 0.15}` }}>
          {lines.map(([t, at]) => <div key={t}><W f={f} at={at}>{t}</W></div>)}
        </div>
        {f >= 29 ? (
          <>
            <div style={{ position: "absolute", left: 540 - 70, top: 520, scale: `${2.2 - markIn * 1.2}`, rotate: `${(1 - markIn) * -90 + f * 0.6}deg`, opacity: markIn, filter: `blur(${(1 - markIn) * 8}px)` }}><Mark size={140} /></div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 138, letterSpacing: -5, lineHeight: 1.02, color: "#fff" }}>
              <div><W f={f} at={33}>Semua</W> <W f={f} at={36}>ada</W></div>
              <div style={{ position: "relative", display: "inline-block" }}>
                <W f={f} at={39} style={{ color: OR }}>skill-nya.</W>
              </div>
            </div>
            <Ribbons arcs={["M180 1080 C 400 1020, 700 1020, 930 1060"]} f={f} at={42} len={14} />
          </>
        ) : null}
      </Cam>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 2 · Core flow 60–120: a dark app panel, four systems tick in on the beat ---- */
const MAJORS = ["Manajemen", "Akuntansi", "Psikologi", "Komunikasi", "Ekonomi", "Sosiologi", "Ilmu Politik", "Bahasa & Sastra", "Agama Islam", "Pertanian", "Teknik Sipil", "Arsitektur", "Farmasi", "Keperawatan", "Statistika", "Pariwisata"];
const Quad: React.FC = () => {
  const f = useCurrentFrame();
  const word = MAJORS[Math.floor(f / 3) % MAJORS.length];
  const core = ["GENESIS", "CATALYST", "NEXUS", "ORACLE"].map(S);
  const hero = ["Judul Generator", "Theory Master", "SmartPLS Doctor", "Pembimbing Simulator"];
  const up = interpolate(f, [0, 12], [700, 0], { ...CL, easing: EASE });
  const allDone = f >= 54;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={980} y={1900} r={760} o={0.35} />
      <Cam y={interpolate(f, [0, 60], [20, -20])} blur={inFocus(f)}>
        <div style={{ position: "absolute", left: 80, right: 80, top: 230, fontFamily: MONO, fontSize: 26, letterSpacing: 7, color: OR }}>SEMUA JURUSAN · KUANTI & KUALI</div>
        <div style={{ position: "absolute", left: 76, right: 70, top: 280, fontFamily: SANS, fontWeight: 800, fontSize: 98, letterSpacing: -4, lineHeight: 1.02, color: "#fff" }}><W f={f} at={0}>Dari judul</W><br /><W f={f} at={3}>sampai sidang.</W></div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 520, display: "flex", alignItems: "center", gap: 16, fontFamily: SANS, fontWeight: 600, fontSize: 38, color: "#CFCAC1", opacity: interpolate(f, [4, 8], [0, 1], CL) }}>
          untuk <span style={{ padding: "8px 22px", borderRadius: 999, background: PANEL2, border: `2px solid ${LINE}`, color: OR, fontWeight: 700 }}>{word}</span>
        </div>
      </Cam>
      <Cam y={up} rx={interpolate(f, [0, 14, 60], [34, 8, 4], { ...CL, easing: EASE })} ry={interpolate(f, [0, 60], [-5, 5])} s={interpolate(f, [0, 60], [0.96, 1.02])}>
        <div style={{ position: "absolute", left: 60, right: 60, top: 640, height: 860, borderRadius: 30, background: PANEL, border: `2px solid ${LINE}`, overflow: "hidden", fontFamily: SANS, color: TXT, boxShadow: "0 80px 140px -50px rgba(0,0,0,.95)" }}>
          <div style={{ height: 64, display: "flex", alignItems: "center", gap: 12, padding: "0 26px", borderBottom: `2px solid ${LINE}`, background: "#101010" }}>
            {[0, 1, 2].map((k) => <span key={k} style={{ width: 16, height: 16, borderRadius: "50%", background: "#3A3A3A" }} />)}
            <Img src={staticFile("claude_logo_t.png")} style={{ width: 30, height: 30, marginLeft: 18 }} />
            <span style={{ fontSize: 24, color: MUT, fontWeight: 600 }}>Claude · ResearchQ Skills</span>
          </div>
          <div style={{ padding: "26px 30px 0", fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: MUT }}>{allDone ? "READY · 4 SISTEM INTI" : "IN PROGRESS · 4 SISTEM INTI"}</div>
          {core.map((i, k) => {
            const sy = SYSTEMS[i];
            const at = 6 + k * 15;
            return (
              <div key={sy.name} style={{ display: "flex", alignItems: "center", gap: 24, margin: "18px 22px 0", padding: "22px 24px", borderRadius: 22, background: f >= at && f < at + 15 ? "#202020" : "transparent", ...slam(f, at, 1.12) }}>
                <div style={{ width: 96, height: 96, borderRadius: 24, background: alpha(sy.color, 0.16), border: `2px solid ${alpha(sy.color, 0.55)}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Icon i={i} c={tint(sy.color, 0.35)} size={58} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: MUT }}>{sy.verb}</div>
                  <div style={{ fontWeight: 800, fontSize: 50, letterSpacing: -1.5, lineHeight: 1.05, color: "#fff" }}>{sy.name}</div>
                  <div style={{ fontSize: 26, fontWeight: 600, color: OR }}>✦ {hero[k]}</div>
                </div>
                <Spinner f={f} ok={f >= at + 9} size={40} />
              </div>
            );
          })}
        </div>
      </Cam>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 3 · Levels 120–150: a level picker, the highlight steps S1 → S2 → S3 → Dosen on the half-beat ---- */
const LEVELS: [string, string][] = [["S1", "Skripsi"], ["S2", "Tesis"], ["S3", "Disertasi"], ["Dosen", "Publikasi & penelitian"]];
const Levels: React.FC = () => {
  const f = useCurrentFrame();
  const sel = f < 7 ? 0 : f < 15 ? 1 : f < 22 ? 2 : 3;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={1000} y={1500} r={620} o={0.4} />
      <div style={{ position: "absolute", left: 90, right: 90, top: 330, fontFamily: MONO, fontSize: 26, letterSpacing: 7, color: OR, opacity: interpolate(f, [0, 4], [0, 1], CL) }}>JENJANG</div>
      <div style={{ position: "absolute", left: 86, right: 90, top: 375, fontFamily: SANS, fontWeight: 800, fontSize: 86, letterSpacing: -3, lineHeight: 1.02, color: "#fff" }}><W f={f} at={0}>Semua jenjang.</W></div>
      <Cam x={interpolate(f, [0, 30], [40, -20], { easing: IO })} s={interpolate(f, [0, 30], [1.12, 1.02])} rx={interpolate(f, [0, 8], [22, 6], { ...CL, easing: EASE })} ry={-5} blur={inFocus(f, 5)}>
        <div style={{ position: "absolute", left: 90, right: 90, top: 560, borderRadius: 30, background: "#161616", border: `2px solid ${LINE}`, padding: "18px 16px", fontFamily: SANS, color: TXT, boxShadow: "0 60px 100px -40px rgba(0,0,0,.95)" }}>
          {LEVELS.map(([lv, what], k) => (
            <div key={lv} style={{ display: "flex", alignItems: "center", gap: 26, height: 176, padding: "0 30px", borderRadius: 22, background: k === sel ? "#262626" : "transparent", opacity: k <= sel ? 1 : 0.45 }}>
              <span style={{ fontWeight: 800, fontSize: k === 3 ? 92 : 112, letterSpacing: -4, color: k === sel ? "#fff" : "#BDB8B0", width: 330 }}>{lv}</span>
              <span style={{ ...ACC, fontSize: 40, lineHeight: 1.15, color: k === sel ? TXT : MUT, flex: 1 }}>{what}</span>
              {k <= sel ? <span style={{ fontSize: 48, color: OR, fontWeight: 800 }}>✓</span> : null}
            </div>
          ))}
        </div>
      </Cam>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 4 · Field systems 150–300: one dark card per system, the camera whips in from alternating sides ---- */
const Cut: React.FC<{ sys: number; label: string; skill: string; sub: string; flip?: boolean; kicker?: string }> = ({ sys, label, skill, sub, flip, kicker = "SISTEM KHUSUS BIDANG" }) => {
  const f = useCurrentFrame();
  const s = SYSTEMS[sys];
  const d = flip ? -1 : 1;
  const whip = interpolate(f, [0, 7], [1, 0], { ...CL, easing: EASE });
  const align = flip ? "right" : "left";
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={flip ? 120 : 960} y={flip ? 1650 : 300} r={760} o={0.42} />
      <Cam x={d * whip * 520} ry={d * whip * -28} rz={d * whip * 2} s={interpolate(f, [0, 30], [1.08, 1.0])} blur={whip * 14}>
        <div style={{ position: "absolute", [flip ? "left" : "right"]: -40, top: 1120, fontFamily: SANS, fontWeight: 800, fontSize: 680, lineHeight: 1, letterSpacing: -30, color: "transparent", WebkitTextStroke: "3px rgba(255,255,255,.09)" }}>{String(sys + 1).padStart(2, "0")}</div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 400, textAlign: align, fontFamily: MONO, fontSize: 28, letterSpacing: 8, color: OR }}>{kicker}</div>
        <div style={{ position: "absolute", left: 72, right: 72, top: 455, textAlign: align, fontFamily: SANS, fontWeight: 800, fontSize: 114, letterSpacing: -4, lineHeight: 0.98, color: "#fff" }}>{label}</div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1000, height: 3, background: `linear-gradient(${flip ? "270deg" : "90deg"}, ${OR}, rgba(242,138,46,0))`, transformOrigin: flip ? "100% 50%" : "0% 50%", scale: `${interpolate(f, [4, 12], [0, 1], { ...CL, easing: EASE })} 1` }} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 1040, display: "flex", flexDirection: flip ? "row-reverse" : "row", alignItems: "center", gap: 28, ...slam(f, 8, 1.15) }}>
          <div style={{ width: 150, height: 150, borderRadius: 36, background: alpha(s.color, 0.16), border: `3px solid ${alpha(s.color, 0.7)}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon i={sys} c={tint(s.color, 0.4)} size={92} /></div>
          <div style={{ textAlign: align }}>
            <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: MUT }}>SISTEM</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 120, letterSpacing: -3, lineHeight: 1, color: "#fff" }}>{s.name}</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1250, display: "flex", justifyContent: flip ? "flex-end" : "flex-start", ...slam(f, 14, 1.2) }}>
          <span style={{ padding: "18px 30px", borderRadius: 999, background: PANEL2, border: `2px solid ${alpha("#F28A2E", 0.75)}`, color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 46 }}><span style={{ color: OR }}>✦</span> {skill}</span>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1372, textAlign: align, ...ACC, fontSize: 50, color: "#CFCAC1", opacity: interpolate(f, [17, 21], [0, 1], CL) }}>{sub}</div>
      </Cam>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 5 · Demo 300–450: prompt with light ribbons → camera dives into the document → checks tick ---- */
const PROMPT = "Susun BAB 1: Pengaruh Social Media Marketing terhadap Keputusan Pembelian Gen Z di TikTok Shop.";
const DOC: [string, string][] = [
  ["h", "# BAB I PENDAHULUAN"], ["k", "## 1.1 Latar Belakang"], ["t", "Ekonomi digital Indonesia tumbuh,"], ["t", "mencapai "], ["t", "Gen Z pengguna paling aktif"],
  ["k", "## 1.2 Rumusan Masalah"], ["t", "1. Apakah Social Media Marketing"], ["t", "   berpengaruh terhadap Keputusan"], ["t", "   Pembelian Gen Z?"], ["k", "## 1.3 Tujuan Penelitian"],
];
const Demo: React.FC = () => {
  const f = useCurrentFrame();
  const typed = PROMPT.slice(0, Math.floor(interpolate(f, [8, 44], [0, PROMPT.length], CL)));
  const sent = f >= 50;
  const dive = interpolate(f, [48, 60], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  const docIn = interpolate(f, [54, 70], [0, 1], { ...CL, easing: EASE });
  const stream = interpolate(f, [60, 118], [0, 1], CL);
  const checks = ["Data per variabel", "Referensi Scopus 2022–2026", "Langsung ke Word"];
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={540} y={sent ? 1900 : 760} r={sent ? 700 : 820} o={sent ? 0.3 : 0.5} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 210, fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -3.5, lineHeight: 1.02, color: "#fff" }}>
        <W f={f} at={0}>1 prompt</W> <W f={f} at={4} style={{ color: OR }}>→</W> <W f={f} at={8}>draft BAB 1.</W>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 322, fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: MUT }}><W f={f} at={10}>CONTOH · SKILL PROBLEM MASTER (GENESIS)</W></div>
      {/* phase A — prompt bar, light ribbons sweep around it */}
      {f < 60 ? (
        <Cam s={interpolate(f, [0, 48], [1.06, 1]) + dive * 1.2} rx={interpolate(f, [0, 10], [20, 6], { ...CL, easing: EASE })} y={interpolate(f, [0, 48], [30, 0])} blur={dive * 12 + inFocus(f, 6)}>
          <Ribbons arcs={["M-40 520 C 260 380, 760 380, 1120 560", "M1120 1200 C 820 1300, 300 1290, -40 1160", "M140 420 C 60 700, 80 1000, 260 1250", "M960 1260 C 1040 980, 1030 700, 840 430"]} f={f} at={2} gap={8} len={30} />
          <div style={{ position: "absolute", left: 60, right: 60, top: 600, borderRadius: 34, background: "rgba(20,14,8,.94)", border: `2px solid ${alpha("#F28A2E", interpolate(f, [0, 20], [0.25, 0.85], CL))}`, padding: "30px 32px 104px", fontFamily: SANS }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 700, fontSize: 28, color: "#C9C4BB", marginBottom: 18 }}><Img src={staticFile("claude_logo_t.png")} style={{ width: 40, height: 40 }} />Claude</div>
            <div style={{ fontSize: 36, lineHeight: 1.4, color: TXT }}>
              <span style={{ display: "inline-block", padding: "2px 16px", borderRadius: 999, border: `2px solid ${alpha("#F28A2E", 0.7)}`, color: OR, fontWeight: 700, fontSize: 28, marginRight: 10 }}>✦ Problem Master</span>
              {typed}{!sent && Math.floor(f / 6) % 2 === 0 ? <span style={{ borderLeft: `3px solid ${TXT}`, marginLeft: 2 }} /> : null}
            </div>
            <div style={{ position: "absolute", right: 28, bottom: 26, width: 66, height: 66, borderRadius: "50%", background: typed.length > 20 ? OR : "#3A2A20", color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", scale: `${interpolate(f, [46, 49, 52], [1, 0.8, 1], CL)}` }}>↑</div>
          </div>
        </Cam>
      ) : null}
      {/* phase B — document editor, camera drifts across it */}
      {f >= 54 ? (
        <Cam s={interpolate(f, [54, 150], [1.18, 1.04], { easing: Easing.out(Easing.quad) }) * (0.85 + docIn * 0.15)} ry={interpolate(f, [54, 150], [10, -4])} rx={interpolate(f, [54, 70], [16, 3], CL)} y={interpolate(f, [54, 150], [40, -10])} blur={(1 - docIn) * 14}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 440, height: 720, borderRadius: 28, background: PANEL, border: `2px solid ${LINE}`, overflow: "hidden", opacity: docIn, boxShadow: "0 80px 140px -50px rgba(0,0,0,.95)" }}>
            <div style={{ height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", borderBottom: `2px solid ${LINE}`, background: "#101010", fontFamily: MONO, fontSize: 20, color: MUT }}>
              {[0, 1, 2].map((k) => <span key={k} style={{ width: 14, height: 14, borderRadius: "50%", background: "#3A3A3A" }} />)}
              <span style={{ marginLeft: 14 }}>BAB1_Pendahuluan.md</span>
            </div>
            <div style={{ padding: "26px 34px", fontFamily: MONO, fontSize: 31, lineHeight: 1.62 }}>
              {DOC.map(([k, t], i) => {
                const vis = Math.max(0, Math.min(1, stream * DOC.length - i));
                if (vis <= 0) return null;
                const col = k === "h" ? "#F5B270" : k === "k" ? "#C7A6FF" : TXT;
                return (
                  <div key={i} style={{ color: col, whiteSpace: "pre", opacity: vis }}>
                    {t.slice(0, Math.ceil(t.length * vis))}
                    {i === 3 && vis > 0.9 ? <><span style={{ color: "#8FD18F" }}>US$90 miliar</span></> : null}
                    {i === 4 && vis > 0.9 ? <span style={{ color: OR }}> (Populix, 2022)</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
          {checks.map((t, k) => (
            <div key={t} style={{ position: "absolute", left: 80, top: 1200 + k * 104, display: "flex", alignItems: "center", gap: 20, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: f >= 92 + k * 15 ? "#fff" : MUT, ...slam(f, 84 + k * 15, 1.08) }}>
              <Spinner f={f} ok={f >= 92 + k * 15} size={44} />{t}
            </div>
          ))}
          <div style={{ position: "absolute", left: 80, top: 1520, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: "#5F5B55", opacity: interpolate(f, [100, 108], [0, 1], CL) }}>Contoh data: e-Conomy SEA 2024 · Populix 2022</div>
        </Cam>
      ) : null}
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 6 · Wall 450–600: 44 skills on a tilted plane, the camera flies over it, then the count lands ---- */
const ALL = SYSTEMS.flatMap((s) => s.skills.map((k) => ({ k, c: s.color })));
const Wall: React.FC = () => {
  const f = useCurrentFrame();
  const fly = interpolate(f, [0, 62], [0, 1], { ...CL, easing: Easing.out(Easing.cubic) });
  const dim = interpolate(f, [58, 66], [0, 1], CL);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={540} y={-120} r={900} o={0.42} />
      <Cam rx={interpolate(fly, [0, 1], [58, 24])} y={interpolate(fly, [0, 1], [900, 40])} s={interpolate(fly, [0, 1], [1.5, 0.98])} rz={interpolate(fly, [0, 1], [-6, 0])} blur={dim * 4 + inFocus(f, 5)}>
        <div style={{ position: "absolute", left: 30, right: 30, top: 280, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14, opacity: 1 - dim * 0.7 }}>
          {ALL.map(({ k, c }, j) => {
            const at = Math.round(random(`cw${j}`) * 14);
            return (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 22px", borderRadius: 999, background: PANEL2, border: `2px solid ${LINE}`, color: TXT, fontFamily: SANS, fontWeight: 600, fontSize: 30, ...slam(f, at, 1.4) }}>
                <span style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />{k}
              </span>
            );
          })}
        </div>
      </Cam>
      <Ribbons arcs={["M-100 300 C 300 600, 700 500, 1180 900", "M1180 1300 C 800 1100, 300 1300, -100 1000"]} f={f} at={4} gap={7} len={24} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", opacity: dim }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 230, letterSpacing: -6, lineHeight: 0.9, color: "#fff", ...slam(f, 60, 1.25) }}>44 skill</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 130, letterSpacing: -3, color: OR, ...slam(f, 75, 1.25) }}>9 sistem</div>
        <div style={{ ...ACC, fontSize: 60, color: "#CFCAC1", marginTop: 14, opacity: interpolate(f, [90, 98], [0, 1], CL) }}>semua jurusan · S1–S3 · dosen</div>
      </div>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 7 · CTA 600–750: price, "komen nama sistemnya", input with ribbons → white mark → wordmark ---- */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const word = "NEXUS";
  const typed = word.slice(0, Math.max(0, Math.floor((f - 62) / 3)));
  const sent = f >= 80;
  const hi = Math.floor(f / 6) % 9;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <Glow x={540} y={1260} r={760} o={0.38} />
      <Cam s={interpolate(f, [0, 110], [1.04, 1])} blur={inFocus(f, 6)}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
          <div style={{ ...ACC, fontSize: 62, color: "#CFCAC1" }}><W f={f} at={0}>Mulai</W> <W f={f} at={3}>dari</W></div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 180, letterSpacing: -7, lineHeight: 1.05, color: "#fff", ...slam(f, 6, 1.25) }}>Rp29.000</div>
          <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 5, color: MUT, opacity: interpolate(f, [12, 18], [0, 1], CL) }}>PER SKILL · AKUN CLAUDE GRATIS · SEKALI BELI</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -3, lineHeight: 1.05, color: "#fff", ...slam(f, 24, 1.2) }}>Komen nama<br /><span style={{ color: OR }}>sistemnya</span> 👇</div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 870, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
          {SYSTEMS.map((sy, i) => {
            const on = i === hi && f > 44;
            return <span key={sy.name} style={{ padding: "12px 22px", borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: on ? "#1A0E04" : TXT, background: on ? OR : PANEL2, border: `2px solid ${on ? OR : LINE}`, ...slam(f, 34 + i * 2, 1.3) }}>{sy.name}</span>;
          })}
        </div>
        <Ribbons arcs={["M-40 1060 C 300 980, 780 980, 1120 1080", "M1120 1290 C 800 1360, 300 1360, -40 1270"]} f={f} at={52} gap={6} len={26} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 1110, opacity: interpolate(f, [52, 58], [0, 1], CL) }}>
          {sent ? (
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, ...slam(f, 80, 1.15) }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#2A2A2A" }} />
              <div><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: MUT }}>kamu · baru saja</div><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: "#fff" }}>{word}</div></div>
              <div style={{ marginLeft: "auto", fontSize: 36, color: "#F0616D", opacity: interpolate(f, [88, 91], [0, 1], CL) }}>♥</div>
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderRadius: 999, background: "rgba(20,14,8,.94)", border: `2px solid ${alpha("#F28A2E", 0.6)}` }}>
            <span style={{ flex: 1, fontFamily: SANS, fontSize: 30, fontWeight: 600, color: typed && !sent ? TXT : "#6A655E" }}>{sent ? "Tambahkan komentar…" : typed || "Tambahkan komentar…"}</span>
            <span style={{ width: 58, height: 58, borderRadius: "50%", background: typed ? OR : "#3A2A20", color: "#fff", fontWeight: 800, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...ACC, fontSize: 48, color: "#CFCAC1" }}><W f={f} at={92}>nanti aku kirim link-nya</W></div>
      </Cam>
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
};
const WhiteMark: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div style={{ position: "absolute", left: 540 - 90, top: 870 - 90, scale: `${interpolate(f, [0, 6], [1.7, 1], { ...CL, easing: EASE })}`, rotate: `${f * 1.5}deg`, filter: `blur(${interpolate(f, [0, 4], [10, 0], CL)}px)` }}><Mark size={180} /></div>
    </AbsoluteFill>
  );
};
const Wordmark: React.FC = () => {
  const f = useCurrentFrame();
  const word = "RESEARCHQ";
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Glow x={540} y={1900} r={700} o={interpolate(f, [0, 20], [0, 0.3], CL)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 26, translate: `${interpolate(f, [0, 10], [170, 0], { ...CL, easing: EASE })}px 0px` }}>
        <Mark size={110} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 104, letterSpacing: 2, color: "#fff", display: "flex" }}>
          {word.split("").map((ch, k) => <span key={k} style={{ opacity: interpolate(f, [3 + k * 1.5, 6 + k * 1.5], [0, 1], CL), translate: `0px ${interpolate(f, [3 + k * 1.5, 8 + k * 1.5], [26, 0], { ...CL, easing: EASE })}px` }}>{ch}</span>)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 980, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 32, letterSpacing: 7, color: "#9A968F", opacity: interpolate(f, [18, 23], [0, 1], CL) }}>44 SKILL · 9 SISTEM</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: OR, opacity: interpolate(f, [15, 20], [0, 1], CL), scale: `${interpolate(f, [15, 20], [1.15, 1], { ...CL, easing: EASE })}` }}>LYNK.ID/RESQ · @RESEARCHQ.ID</div>
      <div style={{ position: "absolute", left: 80, bottom: 380, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: "#fff", opacity: interpolate(f, [8, 14], [0, 1], CL) }}>ResearchQ<span style={{ color: OR }}>.</span></div>
      <Grain />
    </AbsoluteFill>
  );
};

const CUTS: [string, string, string, string][] = [
  ["KERNEL", "Teknik Informatika", "Scaffold Designer", "UML, ERD, sampai pengujian sistem."],
  ["VERDICT", "Ilmu Hukum", "Statute Scanner", "Isu hukum, doktrin, analisis putusan."],
  ["SPIRAL", "Pendidikan · PTK", "Cycle Designer", "Rancang siklus tindakan kelas."],
  ["VITALS", "Kesehatan & Kedokteran", "Power Calculator", "Desain studi & biostatistik."],
];
export const SkillsCine: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={60} name="Hook"><Hook /></Sequence>
      <Sequence from={60} durationInFrames={60} name="Alur inti"><Quad /></Sequence>
      <Sequence from={120} durationInFrames={30} name="Jenjang"><Levels /></Sequence>
      {CUTS.map(([sys, label, skill, sub], k) => (
        <Sequence key={sys} from={150 + k * 30} durationInFrames={30} name={label}><Cut sys={S(sys)} label={label} skill={skill} sub={sub} flip={k % 2 === 1} /></Sequence>
      ))}
      <Sequence from={270} durationInFrames={30} name="Dosen"><Cut sys={S("PRISM")} label="Dosen & Peneliti" skill="Journal Matcher" sub="Dari manuskrip sampai terbit jurnal." kicker="PUBLIKASI JURNAL" /></Sequence>
      <Sequence from={300} durationInFrames={150} name="Demo"><Demo /></Sequence>
      <Sequence from={450} durationInFrames={150} name="Wall"><Wall /></Sequence>
      <Sequence from={600} durationInFrames={112} name="CTA"><Cta /></Sequence>
      <Sequence from={712} durationInFrames={10} name="Mark"><WhiteMark /></Sequence>
      <Sequence from={722} durationInFrames={28} name="Wordmark"><Wordmark /></Sequence>
      {/* streak accents on the section changes */}
      {([[56, 1], [146, -1], [296, 1], [446, -1], [596, 1]] as const).map(([t, d]) => (
        <Sequence key={t} from={t} durationInFrames={12}><StreakCut dir={d} /></Sequence>
      ))}
      <Audio src={staticFile("cine-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
