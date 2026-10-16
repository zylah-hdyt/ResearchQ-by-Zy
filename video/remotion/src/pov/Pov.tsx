import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, SYSTEMS } from "../library/data";

// "pov" UI fly-through for ResearchQ, 14s (420 frames @30fps). Scene timing mirrors the reference edit second-for-second
// so the creator can attach the same trending sound in TikTok ("Use this sound") and every cut lands:
// 0–30 orange glow + object · 30–45 white mark · 45–63 window reveal · 63–120 UI pan (riser 96–120) · 120–156 document
// stream · 156–222 sidebar macro · 222–270 light streaks around the input · 270–300 skill picker · 300–330 prompt highlight
// · 330–360 white mark · 360–405 wordmark · 405–420 signature (impact at 405).
const SANS = "Poppins", MONO = "JetBrainsMono";
for (const [w, st] of [["400", "normal"], ["500", "normal"], ["600", "normal"], ["700", "normal"], ["800", "normal"]] as const) {
  loadFont({ family: SANS, url: staticFile(`fonts/poppins-latin-${w}-${st}.woff2`), weight: w, style: st });
}
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });
const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const IO = Easing.bezier(0.65, 0, 0.35, 1);
const OR = "#F28A2E", PANEL = "#141414", PANEL2 = "#1B1B1B", LINE = "#2A2A2A", TXT = "#E8E6E1", MUT = "#7D7A74";
const STAGE_TOP = 700, STAGE_H = 640;

// Stage: everything happens inside a 1080×640 band, like the reference.
const Stage: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#000" }) => (
  <div style={{ position: "absolute", left: 0, top: STAGE_TOP, width: 1080, height: STAGE_H, overflow: "hidden", background: bg }}>{children}</div>
);
const Glow: React.FC<{ x: number; y: number; r: number; o: number }> = ({ x, y, r, o }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(242,138,46,${o}) 0%, rgba(200,90,20,${o * 0.45}) 40%, rgba(0,0,0,0) 70%)` }} />
);
// Camera: translate/scale/rotate the "world" with optional defocus.
const Cam: React.FC<{ x?: number; y?: number; s?: number; rx?: number; ry?: number; blur?: number; children: React.ReactNode }> = ({ x = 0, y = 0, s = 1, rx = 0, ry = 0, blur = 0, children }) => (
  <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
    <div style={{ position: "absolute", inset: 0, transformOrigin: "50% 50%", transform: `translate(${x}px, ${y}px) scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg)`, filter: blur ? `blur(${blur}px)` : undefined }}>{children}</div>
  </div>
);
const Mark: React.FC<{ size: number; c?: string }> = ({ size, c = "#fff" }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={47} y={6} width={6} height={44} rx={3} fill={c} transform={`rotate(${k * 30} 50 50)`} />)}
  </svg>
);

/* ---------------- the app UI (drawn once, filmed by the camera) ---------------- */
const TASKS: [string, string, string][] = [["Susun BAB 1", "Problem Master", "Reading docs"], ["Uji outer model", "SmartPLS Doctor", "Fetching data"], ["Cari referensi Scopus", "Scopus Finder", "12 sumber"]];
const DOC: [string, string][] = [
  ["h", "# BAB I PENDAHULUAN"], ["k", "## 1.1 Latar Belakang"], ["t", "Ekonomi digital Indonesia tumbuh pesat,"], ["t", "mencapai "], ["t", "Gen Z pengguna paling aktif"],
  ["k", "## 1.2 Rumusan Masalah"], ["t", "1. Apakah Social Media Marketing"], ["t", "   berpengaruh terhadap Keputusan Pembelian?"], ["k", "## 1.3 Tujuan Penelitian"], ["t", "Untuk menganalisis pengaruh X1 dan X2 …"],
];
const App: React.FC<{ f: number; stream?: number; done?: number }> = ({ f, stream = 0, done = 0 }) => (
  <div style={{ position: "absolute", left: 40, top: 40, width: 1500, height: 900, borderRadius: 26, background: PANEL, border: `2px solid ${LINE}`, overflow: "hidden", fontFamily: SANS, color: TXT, boxShadow: "0 60px 120px -40px rgba(0,0,0,.9)" }}>
    <div style={{ height: 54, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", borderBottom: `2px solid ${LINE}`, background: "#101010" }}>
      {[0, 1, 2].map((k) => <span key={k} style={{ width: 15, height: 15, borderRadius: "50%", background: "#3A3A3A" }} />)}
      <span style={{ marginLeft: "auto", marginRight: "auto", fontSize: 20, color: MUT }}>Claude · ResearchQ Skills</span>
    </div>
    {/* sidebar */}
    <div style={{ position: "absolute", left: 0, top: 54, bottom: 0, width: 420, borderRight: `2px solid ${LINE}`, padding: "22px 20px" }}>
      <Img src={staticFile("claude_logo_t.png")} style={{ width: 36, height: 36 }} />
      <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: 2, color: MUT, margin: "26px 0 12px" }}>{done >= 3 ? "READY FOR REVIEW 3" : "IN PROGRESS 3"}</div>
      {TASKS.map(([t, sk, st], i) => {
        const ok = done > i;
        return (
          <div key={t} style={{ display: "flex", gap: 14, padding: "14px 14px", borderRadius: 14, background: i === 0 ? "#222" : "transparent", marginBottom: 8 }}>
            <span style={{ width: 24, height: 24, marginTop: 3, borderRadius: "50%", border: `2.5px solid ${ok ? TXT : MUT}`, borderTopColor: ok ? TXT : "transparent", rotate: ok ? "0deg" : `${f * 14}deg`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flex: "none" }}>{ok ? "✓" : ""}</span>
            <div><div style={{ fontSize: 21, fontWeight: 600 }}>{t}</div><div style={{ fontSize: 16, color: MUT }}><span style={{ color: OR }}>{sk}</span> · {st}</div></div>
          </div>
        );
      })}
    </div>
    {/* chat */}
    <div style={{ position: "absolute", left: 420, top: 54, bottom: 0, width: 520, borderRight: `2px solid ${LINE}`, padding: "22px 24px" }}>
      <div style={{ fontSize: 21, fontWeight: 600 }}>Susun BAB 1</div>
      <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, background: PANEL2, border: `2px solid ${LINE}`, fontSize: 17, lineHeight: 1.45 }}>susun BAB 1 dari judul & data yang aku lampirkan, pakai referensi <span style={{ color: OR }}>Scopus 2022–2026</span></div>
      {[["Read", "judul-skripsi.docx"], ["Read", "data-populix-2022.pdf"], ["Thought", "6s"]].map(([a, b]) => <div key={b} style={{ fontSize: 17, color: MUT, marginTop: 12 }}>{a} <span style={{ color: "#5C5A55" }}>{b}</span></div>)}
      <div style={{ fontSize: 17, lineHeight: 1.5, marginTop: 14 }}>Aku susun latar belakang berbasis variabel: fenomena → Y → X1 → X2 → gap → urgensi.</div>
      {["BAB1_Pendahuluan.docx", "Daftar_Pustaka_APA.docx"].map((n) => <div key={n} style={{ marginTop: 12, fontSize: 16, color: TXT, padding: "8px 12px", border: `2px solid ${LINE}`, borderRadius: 10, display: "inline-block", marginRight: 8 }}>▢ {n}</div>)}
    </div>
    {/* document "code" pane */}
    <div style={{ position: "absolute", left: 940, top: 54, right: 0, bottom: 0, padding: "22px 26px", fontFamily: MONO, fontSize: 18, lineHeight: 1.75 }}>
      <div style={{ color: MUT, fontSize: 15, marginBottom: 10 }}>BAB1_Pendahuluan.md</div>
      {DOC.map(([k, t], i) => {
        const vis = Math.max(0, Math.min(1, stream * DOC.length - i));
        if (vis <= 0) return null;
        const col = k === "h" ? "#F5B270" : k === "k" ? "#C7A6FF" : TXT;
        return (
          <div key={i} style={{ color: col, whiteSpace: "pre", opacity: vis }}>
            {t.slice(0, Math.ceil(t.length * vis))}
            {i === 3 && vis > 0.9 ? <><span style={{ color: "#8FD18F" }}>US$90 miliar</span> <span style={{ color: OR }}>(e-Conomy SEA, 2024)</span></> : null}
            {i === 4 && vis > 0.9 ? <span style={{ color: OR }}> (Populix, 2022)</span> : null}
          </div>
        );
      })}
    </div>
  </div>
);

/* ---------------- scenes ---------------- */
const S1: React.FC = () => { // 0–30 orange atmosphere, a small object drifts in and spins
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 30], [440, 560], { easing: IO }), y = interpolate(f, [0, 30], [380, 300], { easing: IO });
  return (
    <Stage bg="#0A0603">
      <Glow x={540 + Math.sin(f / 9) * 40} y={520} r={760} o={0.55} />
      <Glow x={220} y={-40} r={420} o={0.35} />
      <div style={{ position: "absolute", left: x - 26, top: y - 26, width: 52, height: 52, borderRadius: 8, background: OR, rotate: `${f * 9}deg`, scale: `${interpolate(f, [16, 30], [1, 2.6], CL)}`, filter: `blur(${interpolate(f, [0, 8, 22, 30], [6, 0, 0, 4], CL)}px)`, boxShadow: "0 0 40px rgba(242,138,46,.8)" }} />
    </Stage>
  );
};
const WhiteMark: React.FC = () => { // white mark on black, quick scale settle
  const f = useCurrentFrame();
  return (
    <Stage>
      <div style={{ position: "absolute", left: 540 - 60, top: 320 - 60, scale: `${interpolate(f, [0, 6], [1.6, 1], { ...CL, easing: EASE })}`, filter: `blur(${interpolate(f, [0, 4], [8, 0], CL)}px)` }}><Mark size={120} /></div>
    </Stage>
  );
};
const S3: React.FC = () => { // 45–120 window reveal then pan across sidebar → chat → doc
  const f = useCurrentFrame();
  const up = interpolate(f, [0, 16], [520, 0], { ...CL, easing: EASE });
  // keep the window filling the band: left edge on screen at the start, right edge at the end
  const pan = interpolate(f, [18, 75], [-100, -350], { ...CL, easing: IO });
  const s = interpolate(f, [0, 18, 75], [0.8, 0.8, 0.85], { ...CL, easing: IO });
  return (
    <Stage>
      <Cam x={pan} y={up - 56} s={s} rx={interpolate(f, [0, 18], [24, 6], { ...CL, easing: EASE })} ry={interpolate(f, [18, 75], [-6, 6], CL)} blur={interpolate(f, [0, 8], [6, 0], CL)}>
        <App f={f} stream={interpolate(f, [40, 75], [0, 0.25], CL)} />
      </Cam>
    </Stage>
  );
};
const S4: React.FC = () => { // 120–156 document pane streaming, camera close on the doc
  const f = useCurrentFrame();
  const sc = interpolate(f, [0, 36], [1.38, 1.5], { easing: IO });
  // pin the doc pane's left edge (app x 940) near screen x 70 and its first line near the top of the band
  return (
    <Stage>
      <Cam x={70 - 540 - 400 * sc} y={50 - 320 + 244 * sc - interpolate(f, [0, 36], [0, 40])} s={sc} ry={interpolate(f, [0, 36], [6, -2])}>
        <App f={f + 75} stream={interpolate(f, [0, 34], [0.25, 1], CL)} />
      </Cam>
    </Stage>
  );
};
const S5: React.FC = () => { // 156–222 macro on the sidebar tasks ticking to done, rack focus
  const f = useCurrentFrame();
  return (
    <Stage>
      <Cam x={interpolate(f, [0, 66], [380, 300], { easing: IO })} y={interpolate(f, [0, 66], [-40, -90])} s={interpolate(f, [0, 66], [1.9, 2.1])} rx={4} blur={interpolate(f, [0, 6, 58, 66], [5, 0, 0, 6], CL)}>
        <App f={f + 120} stream={1} done={f < 14 ? 0 : f < 28 ? 1 : f < 42 ? 2 : 3} />
      </Cam>
    </Stage>
  );
};
const Streaks: React.FC = () => { // 222–270 orange light ribbons sweep around a dark input bar
  const f = useCurrentFrame();
  const arcs = ["M-40 160 C 220 -60, 560 -60, 820 160", "M1120 60 C 900 260, 660 330, 520 470", "M200 -20 C 260 240, 540 380, 900 300", "M1100 420 C 880 300, 400 260, 60 520", "M-60 380 C 240 300, 700 600, 1140 340"];
  return (
    <Stage bg="#0C0702">
      <Glow x={540} y={-60} r={700} o={0.6} />
      <svg width={1080} height={640} style={{ position: "absolute", inset: 0 }}>
        {arcs.map((d, k) => {
          const p = interpolate(f, [k * 5, k * 5 + 26], [0, 1], { ...CL, easing: IO });
          const dash = { pathLength: 1, strokeDasharray: "0.38 1.4", strokeDashoffset: -p * 1.4 + 0.38, fill: "none", strokeLinecap: "round" as const };
          return (
            <g key={k}>
              <path d={d} {...dash} stroke="#F28A2E" strokeWidth={16} style={{ filter: "blur(10px)" }} opacity={0.8} />
              <path d={d} {...dash} stroke="#FFC46B" strokeWidth={6} />
              <path d={d} {...dash} stroke="#FFF3DF" strokeWidth={2} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 200, top: 360, width: 680, height: 120, borderRadius: 28, background: "rgba(20,14,8,.92)", border: `2px solid rgba(242,138,46,${interpolate(f, [24, 40], [0.25, 0.9], CL)})`, scale: `${interpolate(f, [0, 48], [1.08, 1])}`, display: "flex", alignItems: "center", padding: "0 30px", fontFamily: SANS, fontSize: 30, color: "#B9A48E" }}>
        <span style={{ opacity: interpolate(f, [30, 40], [0, 1], CL) }}>Mau nyusun apa hari ini?</span>
      </div>
    </Stage>
  );
};
const Picker: React.FC = () => { // 270–300 skill picker dropdown (camera tilts in)
  const f = useCurrentFrame();
  const core = ["GENESIS", "CATALYST", "NEXUS", "ORACLE"];
  const sel = f >= 16 ? 2 : -1;
  return (
    <Stage>
      <Glow x={980} y={640} r={420} o={0.3} />
      <Cam x={interpolate(f, [0, 30], [60, -20], { easing: IO })} y={0} s={interpolate(f, [0, 30], [1.25, 1.12])} rx={interpolate(f, [0, 10], [18, 6], { ...CL, easing: EASE })} ry={-6}>
        <div style={{ position: "absolute", left: 300, top: 70, width: 470, borderRadius: 22, background: "#161616", border: `2px solid ${LINE}`, padding: "14px 12px", fontFamily: SANS, color: TXT, boxShadow: "0 40px 80px -30px rgba(0,0,0,.9)" }}>
          {core.map((n, k) => {
            const i = SYSTEMS.findIndex((s) => s.name === n);
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 16px", borderRadius: 14, background: k === sel ? "#242424" : "transparent", fontSize: 30, fontWeight: 600 }}>
                <Icon i={i} c={k === sel ? OR : "#CFCAC1"} size={34} />{n}
                {k === sel ? <span style={{ marginLeft: "auto", fontSize: 26 }}>✓</span> : null}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 230, top: 470, width: 700, height: 96, borderRadius: 24, background: "#121212", border: `2px solid ${LINE}`, display: "flex", alignItems: "center", gap: 14, padding: "0 22px", fontFamily: SANS }}>
          <span style={{ padding: "8px 18px", borderRadius: 999, border: `2px solid ${LINE}`, color: TXT, fontSize: 24 }}>✦ {sel >= 0 ? "NEXUS" : "Skill"} ⌃</span>
          <span style={{ color: MUT, fontSize: 24 }}>SmartPLS Doctor ⌄</span>
        </div>
      </Cam>
    </Stage>
  );
};
const Prompt: React.FC = () => { // 300–330 prompt bar, text gets an orange selection sweep, send
  const f = useCurrentFrame();
  const txt = "Interpretasi output SmartPLS aku";
  const hl = interpolate(f, [12, 22], [0, 1], { ...CL, easing: IO });
  return (
    <Stage>
      <Glow x={0} y={640} r={520} o={0.35} />
      <Cam x={interpolate(f, [0, 30], [-40, 30], { easing: IO })} y={interpolate(f, [0, 30], [30, -10], { easing: IO })} s={interpolate(f, [0, 30], [1.35, 1.2])} rx={8}>
        <div style={{ position: "absolute", left: 170, top: 230, width: 740, height: 170, borderRadius: 28, background: "#131313", border: `2px solid ${LINE}`, padding: "26px 30px", fontFamily: SANS }}>
          <div style={{ position: "relative", display: "inline-block", fontSize: 34, fontWeight: 600, color: TXT }}>
            <span style={{ position: "absolute", left: -6, top: 2, bottom: 2, width: `calc(${hl * 100}% + 12px)`, background: "rgba(242,138,46,.85)", borderRadius: 6, zIndex: 0 }} />
            <span style={{ position: "relative", color: hl > 0.5 ? "#1A0E04" : TXT }}>{txt}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 30 }}>
            <span style={{ padding: "6px 16px", borderRadius: 999, border: `2px solid ${LINE}`, color: TXT, fontSize: 22 }}>✦ NEXUS</span>
            <span style={{ color: MUT, fontSize: 22 }}>SmartPLS Doctor ⌄</span>
            <span style={{ marginLeft: "auto", width: 52, height: 52, borderRadius: "50%", background: f >= 24 ? OR : "#2A2A2A", color: "#fff", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", scale: `${interpolate(f, [24, 27, 30], [1, 0.82, 1], CL)}` }}>↑</span>
          </div>
        </div>
      </Cam>
    </Stage>
  );
};
const Wordmark: React.FC = () => { // 360–405 mark slides left, "RESEARCHQ" reveals letter by letter
  const f = useCurrentFrame();
  const word = "RESEARCHQ";
  return (
    <Stage>
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, translate: `${interpolate(f, [0, 10], [150, 0], { ...CL, easing: EASE })}px 0px` }}>
        <Mark size={96} />
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 88, letterSpacing: 2, color: "#fff", display: "flex" }}>
          {word.split("").map((ch, k) => <span key={k} style={{ opacity: interpolate(f, [4 + k * 2, 7 + k * 2], [0, 1], CL), translate: `0px ${interpolate(f, [4 + k * 2, 9 + k * 2], [24, 0], { ...CL, easing: EASE })}px` }}>{ch}</span>)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 6, color: "#9A968F", opacity: interpolate(f, [26, 32], [0, 1], CL) }}>44 SKILL · 9 SISTEM</div>
    </Stage>
  );
};
const Signature: React.FC = () => { // 405–420 brand signature on black (impact)
  const f = useCurrentFrame();
  return (
    <Stage>
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontStyle: "normal", fontSize: 76, letterSpacing: 1, color: "#fff", scale: `${interpolate(f, [0, 5], [1.25, 1], { ...CL, easing: EASE })}` }}>RESEARCHQ<span style={{ color: OR }}>.</span>ID</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 30, color: "#9A968F", opacity: interpolate(f, [3, 7], [0, 1], CL) }}>komen nama sistemnya 👇</div>
    </Stage>
  );
};

const Caption: React.FC = () => (
  <div style={{ position: "absolute", left: 60, right: 60, top: 490, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 50, lineHeight: 1.22, color: "#fff" }}>
    pov: kamu mahasiswa akhir &amp; punya 44 skill riset di Claude
  </div>
);

export const PovResearchQ: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={30}><S1 /></Sequence>
      <Sequence from={30} durationInFrames={15}><WhiteMark /></Sequence>
      <Sequence from={45} durationInFrames={75}><S3 /></Sequence>
      <Sequence from={120} durationInFrames={36}><S4 /></Sequence>
      <Sequence from={156} durationInFrames={66}><S5 /></Sequence>
      <Sequence from={222} durationInFrames={48}><Streaks /></Sequence>
      <Sequence from={270} durationInFrames={30}><Picker /></Sequence>
      <Sequence from={300} durationInFrames={30}><Prompt /></Sequence>
      <Sequence from={330} durationInFrames={30}><WhiteMark /></Sequence>
      <Sequence from={360} durationInFrames={45}><Wordmark /></Sequence>
      <Sequence from={405} durationInFrames={15}><Signature /></Sequence>
      <Caption />
      <Audio src={staticFile("pov-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
