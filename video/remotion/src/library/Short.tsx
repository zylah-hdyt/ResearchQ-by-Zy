import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SERIF } from "../scopus/kit";
import { CL, DOC, EASE, MONO, SANS } from "../theory/kit";
import { alpha, Icon, SYSTEMS, tint } from "./data";

// "Jurusan kamu apa?" — ResearchQ Skills Library, 25s (750 frames @30fps). SFX only; the creator adds music.
// Everything sits on a 120 BPM grid (1 beat = 15 frames) so cuts land on the beat of any 120/60/240 BPM track.
// 0–60 hook · 60–270 montage (field → system, hard cuts every 2 beats, 4-tile beat at 180) · 270–450 slow demo moment
// (speed ramp into a real-looking BAB 1 output) · 450–600 wall of 44 · 600–750 CTA "komen jurusanmu".
const BG = "#0B0D12", INK = "#F2EFE9", ORANGE = "#EE6A1F";
const S = (n: string) => SYSTEMS.findIndex((s) => s.name === n);

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const s = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="g25"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={s} /></filter>
        <rect width="100%" height="100%" filter="url(#g25)" transform={`translate(${random(`x${s}`) * 16 - 8} ${random(`y${s}`) * 16 - 8})`} />
      </svg>
    </AbsoluteFill>
  );
};
const W: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 8], [0, 1], { ...CL, easing: EASE });
  return <span style={{ display: "inline-block", opacity: p, filter: `blur(${(1 - p) * 10}px)`, translate: `0px ${(1 - p) * 30}px`, ...style }}>{children}</span>;
};
// Slam-in: overshoots from big, settles in ~5 frames (feels cut, not animated).
const slam = (f: number, at: number, from = 1.35) => ({ opacity: f >= at ? 1 : 0, scale: `${interpolate(f, [at, at + 5], [from, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` });
const Flash: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 3], [0.85, 0], CL), pointerEvents: "none" }} />;
};

/* ---- 1 · Hook 0–60 ---- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [46, 60], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "50% 46%", scale: `${1 + push * 1.8}`, filter: `blur(${push * 8}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 190, lineHeight: 0.95, color: INK }}>
          <div><W at={0}>Jurusan</W></div>
          <div><W at={6}>kamu</W> <W at={12} style={{ color: "#F59A5C" }}>apa?</W></div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 50, letterSpacing: -1, color: "#B8B3AA" }}>
          <W at={24}>Tunggu jurusanmu muncul</W> <W at={30}><span style={{ display: "inline-block", translate: `0px ${Math.abs(Math.sin(f / 4)) * 10}px` }}>↓</span></W>
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 2 · Montage cut (30 frames, full-bleed system colour) ---- */
const Cut: React.FC<{ sys: number; label: string; skill: string; sub: string; flip?: boolean }> = ({ sys, label, skill, sub, flip }) => {
  const f = useCurrentFrame();
  const s = SYSTEMS[sys];
  const align = flip ? "right" : "left";
  const shake = f < 4 ? `${Math.sin(f * 7) * 8}px ${Math.cos(f * 9) * 6}px` : "0px 0px";
  return (
    <AbsoluteFill style={{ background: s.color, overflow: "hidden", translate: shake }}>
      <AbsoluteFill style={{ scale: `${1 + f * 0.0022}` }}>
        <div style={{ position: "absolute", [flip ? "left" : "right"]: -60, top: 1180, fontFamily: SANS, fontWeight: 800, fontSize: 700, lineHeight: 1, letterSpacing: -40, color: "transparent", WebkitTextStroke: "3px rgba(255,255,255,.22)" }}>{String(sys + 1).padStart(2, "0")}</div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 400, textAlign: align, fontFamily: MONO, fontSize: 28, letterSpacing: 8, color: "rgba(255,255,255,.75)" }}>JURUSAN / KEBUTUHAN</div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 460, textAlign: align, fontFamily: SANS, fontWeight: 800, fontSize: 132, letterSpacing: -6, lineHeight: 0.98, color: "#fff", transformOrigin: flip ? "100% 0%" : "0% 0%", ...slam(f, 0) }}>{label}</div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1000, height: 4, background: "rgba(255,255,255,.9)", transformOrigin: flip ? "100% 50%" : "0% 50%", scale: `${interpolate(f, [4, 10], [0, 1], { ...CL, easing: EASE })} 1` }} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 1040, display: "flex", flexDirection: flip ? "row-reverse" : "row", alignItems: "center", gap: 28, ...slam(f, 8, 1.2) }}>
          <div style={{ width: 150, height: 150, borderRadius: 36, background: "rgba(255,255,255,.16)", border: "3px solid rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon i={sys} c="#fff" size={96} /></div>
          <div style={{ textAlign: align }}>
            <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: "rgba(255,255,255,.8)" }}>SISTEM</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 120, letterSpacing: -5, lineHeight: 1, color: "#fff" }}>{s.name}</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1250, display: "flex", justifyContent: flip ? "flex-end" : "flex-start", ...slam(f, 14, 1.25) }}>
          <span style={{ padding: "18px 30px", borderRadius: 999, background: "#fff", color: s.color, fontFamily: SANS, fontWeight: 800, fontSize: 46 }}>✦ {skill}</span>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1370, textAlign: align, fontFamily: SERIF, fontStyle: "italic", fontSize: 52, color: "rgba(255,255,255,.9)", opacity: interpolate(f, [17, 21], [0, 1], CL) }}>{sub}</div>
      </AbsoluteFill>
      <Flash />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 2b · Four-tile beat: every other major → the core thesis flow (60 frames) ---- */
const MAJORS = ["Manajemen", "Akuntansi", "Psikologi", "Komunikasi", "Ekonomi", "Pendidikan", "Sosiologi", "Pertanian"];
const Quad: React.FC = () => {
  const f = useCurrentFrame();
  const word = MAJORS[Math.min(MAJORS.length - 1, Math.floor(f / 4))];
  const core = ["GENESIS", "CATALYST", "NEXUS", "ORACLE"].map(S);
  const hero = ["Judul Generator", "Theory Master", "SmartPLS Doctor", "Pembimbing Simulator"];
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 240, fontFamily: MONO, fontSize: 28, letterSpacing: 8, color: "#8D95A3" }}>JURUSAN LAIN?</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 290, fontFamily: SANS, fontWeight: 800, fontSize: 132, letterSpacing: -6, color: INK, scale: `${interpolate(f < 32 ? f % 4 : f - 32, [0, 3], [1.12, 1], CL)}` }}>{f < 32 ? word : "Semua jurusan."}</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 470, fontFamily: SERIF, fontStyle: "italic", fontSize: 58, color: "#CFCAC1", opacity: interpolate(f, [4, 10], [0, 1], CL) }}>Alur skripsi kuanti & kuali, dari judul sampai sidang:</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 640, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {core.map((i, k) => {
          const s = SYSTEMS[i];
          const at = 6 + k * 15;
          return (
            <div key={s.name} style={{ height: 440, borderRadius: 34, background: s.color, padding: "34px 32px", position: "relative", overflow: "hidden", ...slam(f, at, 1.18) }}>
              <Icon i={i} c="#fff" size={80} />
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 5, color: "rgba(255,255,255,.8)", marginTop: 24 }}>{s.verb}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: -3, color: "#fff", lineHeight: 1 }}>{s.name}</div>
              <div style={{ position: "absolute", left: 32, right: 32, bottom: 32, padding: "12px 18px", borderRadius: 16, background: "rgba(255,255,255,.95)", color: s.color, fontFamily: SANS, fontWeight: 800, fontSize: 28 }}>✦ {hero[k]}</div>
            </div>
          );
        })}
      </div>
      {[0, 15, 30, 45].map((t) => <Sequence key={t} from={t} durationInFrames={4}><Flash /></Sequence>)}
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 3 · Slow demo moment 270–450 (speed ramp into a BAB 1 output) ---- */
const PROMPT = "Susun BAB 1: Pengaruh Social Media Marketing terhadap Keputusan Pembelian Gen Z di TikTok Shop.";
const Demo: React.FC = () => {
  const f = useCurrentFrame();
  const typed = PROMPT.slice(0, Math.floor(interpolate(f, [8, 44], [0, PROMPT.length], CL)));
  const sent = f >= 50;
  const ramp = interpolate(f, [50, 64, 180], [0, 0.82, 1], { ...CL, easing: Easing.out(Easing.quad) }); // fast in, slow-mo settle
  const ui = interpolate(f, [50, 58], [1, 0], CL);
  const checks = ["Data per variabel", "Referensi Scopus 2022–2026", "Langsung ke Word"];
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 210, fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -3.5, lineHeight: 1.02, color: INK }}>
        <W at={0}>1 prompt</W> <W at={4} style={{ color: "#F59A5C" }}>→</W> <W at={8}>draft BAB 1.</W>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 320, fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: "#7E8592" }}><W at={10}>CONTOH · SKILL PROBLEM MASTER (GENESIS)</W></div>
      {/* chat input */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 520, borderRadius: 34, background: "#151922", border: "1.5px solid #2A2F3A", padding: "30px 32px 100px", opacity: ui, scale: `${1 - (1 - ui) * 0.08}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontWeight: 700, fontSize: 28, color: "#C9C4BB", marginBottom: 18 }}><Img src={staticFile("claude_logo_t.png")} style={{ width: 40, height: 40 }} />Claude</div>
        <div style={{ fontFamily: SANS, fontSize: 36, lineHeight: 1.4, color: INK }}>
          <span style={{ display: "inline-block", padding: "2px 16px", borderRadius: 999, background: alpha("#2453E8", 0.3), color: tint("#2453E8", 0.5), fontWeight: 800, fontSize: 28, marginRight: 10 }}>✦ Problem Master</span>
          {typed}{!sent && Math.floor(f / 6) % 2 === 0 ? <span style={{ borderLeft: `3px solid ${INK}`, marginLeft: 2 }} /> : null}
        </div>
        <div style={{ position: "absolute", right: 28, bottom: 26, width: 66, height: 66, borderRadius: "50%", background: typed.length > 20 ? ORANGE : "#3A2A20", color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", scale: `${interpolate(f, [46, 49, 52], [1, 0.8, 1], CL)}` }}>↑</div>
      </div>
      {/* document — flies up fast, then slow-motion settle */}
      <div style={{ position: "absolute", left: 120, top: 470, width: 840, height: 1120, perspective: 1800, opacity: sent ? 1 : 0 }}>
        <div style={{ position: "absolute", inset: 0, background: "#fff", borderRadius: 10, padding: "64px 70px", fontFamily: DOC, color: "#111", transform: `translateY(${(1 - ramp) * 900}px) rotateX(${(1 - ramp) * 38}deg) rotateZ(${(1 - ramp) * -6}deg) scale(${0.8 + ramp * 0.2})`, boxShadow: "0 50px 80px -40px rgba(0,0,0,.9)" }}>
          <div style={{ textAlign: "center", fontWeight: 700, fontSize: 36 }}>BAB I<br />PENDAHULUAN</div>
          <div style={{ fontWeight: 700, fontSize: 28, marginTop: 30 }}>1.1 Latar Belakang</div>
          {[100, 94, 98, 70, 100, 90].map((w, k) => <div key={k} style={{ height: 13, width: `${w * interpolate(f, [70 + k * 4, 82 + k * 4], [0, 1], CL)}%`, borderRadius: 5, background: "#DDD9D0", marginTop: 18 }} />)}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 46, height: 300, marginTop: 34 }}>
            {[["US$90 M", 90, "#3A3A3A"], ["US$65 M", 65, ORANGE]].map(([t, v, c], k) => {
              const p = interpolate(f, [100 + k * 8, 124 + k * 8], [0, 1], { ...CL, easing: EASE });
              return <div key={k} style={{ textAlign: "center", fontFamily: SANS }}><div style={{ fontWeight: 800, fontSize: 34, color: c as string, opacity: p }}>{t}</div><div style={{ width: 150, height: (v as number) * 2.6 * p, background: c as string, borderRadius: "8px 8px 0 0", marginTop: 8 }} /></div>;
            })}
          </div>
          <div style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginTop: 10 }}>Gambar 1.1</div>
          <div style={{ textAlign: "center", fontSize: 18, color: "#666" }}>Sumber: e-Conomy SEA 2024 (Google, Temasek, Bain & Company)</div>
        </div>
      </div>
      {checks.map((t, k) => (
        <div key={t} style={{ position: "absolute", right: 40, top: 760 + k * 120, padding: "18px 26px", borderRadius: 18, background: INK, color: BG, fontFamily: SANS, fontWeight: 800, fontSize: 34, rotate: `${[2, -1.5, 1][k]}deg`, boxShadow: "0 20px 30px -18px rgba(0,0,0,.9)", ...slam(f, 90 + k * 15, 1.3) }}>✓ {t}</div>
      ))}
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 4 · Wall 450–600 ---- */
const ALL = SYSTEMS.flatMap((s) => s.skills.map((k) => ({ k, c: s.color })));
const Wall: React.FC = () => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, 30], [1.9, 1], { ...CL, easing: Easing.out(Easing.cubic) });
  const dim = interpolate(f, [58, 64], [0, 1], CL);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: `${z}`, filter: `blur(${dim * 3}px)`, opacity: 1 - dim * 0.6 }}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 250, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
          {ALL.map(({ k, c }, j) => {
            const at = random(`w${j}`) * 14;
            return <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 22px", borderRadius: 999, background: c, color: "#fff", fontFamily: SANS, fontWeight: 700, fontSize: 30, ...slam(f, Math.round(at), 1.4) }}>{k}</span>;
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", opacity: dim }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 230, letterSpacing: -10, lineHeight: 0.9, color: INK, ...slam(f, 60, 1.25) }}>44 skill</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 130, letterSpacing: -5, color: "#F59A5C", ...slam(f, 75, 1.25) }}>9 sistem</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 62, color: "#CFCAC1", marginTop: 14, opacity: interpolate(f, [90, 98], [0, 1], CL) }}>semua jurusan · S1–S3 · dosen</div>
      </div>
      <Flash />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 5 · CTA 600–750 ---- */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const word = "Hukum";
  const typed = word.slice(0, Math.max(0, Math.floor((f - 34) / 3)));
  const sent = f >= 52;
  const v = SYSTEMS[S("VERDICT")];
  const end = interpolate(f, [136, 150], [0, 1], CL);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 110, lineHeight: 1, color: INK }}><W at={0}>Jurusanmu</W> <W at={5}>yang</W> <W at={9} style={{ color: "#F59A5C" }}>mana?</W></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 96, letterSpacing: -4, color: INK, ...slam(f, 15, 1.3) }}>Komen di bawah 👇</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 800 }}>
        {sent ? (
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, ...slam(f, 52, 1.15) }}>
            <div style={{ width: 62, height: 62, borderRadius: "50%", background: "#2A2F3A" }} />
            <div><div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: "#7E8592" }}>kamu · baru saja</div><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 42, color: INK }}>{word}</div></div>
          </div>
        ) : null}
        {f >= 66 ? (
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginLeft: 70, marginBottom: 24, ...slam(f, 66, 1.15) }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: ORANGE, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>R</div>
            <div><div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, color: "#7E8592" }}>@researchq.id · balasan</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SANS, fontWeight: 800, fontSize: 36, color: INK }}>pakai <span style={{ padding: "4px 16px", borderRadius: 999, background: v.color, color: "#fff" }}>VERDICT</span> ⚖️</div></div>
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderRadius: 999, background: "#161A22", border: "1.5px solid #2A2F3A", opacity: interpolate(f, [24, 30], [0, 1], CL) }}>
          <span style={{ flex: 1, fontFamily: SANS, fontSize: 32, fontWeight: 700, color: typed && !sent ? INK : "#5E6573" }}>{sent ? "Tambahkan komentar…" : typed || "Tambahkan komentar…"}</span>
          <span style={{ width: 58, height: 58, borderRadius: "50%", background: typed ? ORANGE : "#3A2A20", color: "#fff", fontWeight: 800, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 48, color: INK, ...slam(f, 90, 1.2) }}>Mulai <span style={{ color: "#F59A5C" }}>Rp29.000</span> / skill</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: "#7E8592", opacity: interpolate(f, [100, 108], [0, 1], CL) }}>AKUN CLAUDE GRATIS · LYNK.ID/RESQ</div>
      <div style={{ position: "absolute", left: 80, bottom: 62, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK }}>ResearchQ<span style={{ color: ORANGE }}>.</span></div>
      <div style={{ position: "absolute", right: 80, bottom: 68, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: "#7E8592" }}>@RESEARCHQ.ID</div>
      <AbsoluteFill style={{ background: "#000", opacity: end * 0.9 }} />
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
export const SkillsShort: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence durationInFrames={60} name="Hook"><Hook /></Sequence>
      {CUTS.map(([sys, label, skill, sub], k) => (
        <Sequence key={sys} from={60 + k * 30} durationInFrames={30} name={label}><Cut sys={S(sys)} label={label} skill={skill} sub={sub} flip={k % 2 === 1} /></Sequence>
      ))}
      <Sequence from={180} durationInFrames={60} name="Semua jurusan"><Quad /></Sequence>
      <Sequence from={240} durationInFrames={30} name="Publikasi"><Cut sys={S("PRISM")} label="Mau terbit jurnal?" skill="Journal Matcher" sub="Cocokkan jurnal sampai balas reviewer." /></Sequence>
      <Sequence from={270} durationInFrames={180} name="Demo"><Demo /></Sequence>
      <Sequence from={450} durationInFrames={150} name="Wall"><Wall /></Sequence>
      <Sequence from={600} durationInFrames={150} name="CTA"><Cta /></Sequence>
      <Audio src={staticFile("short-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
