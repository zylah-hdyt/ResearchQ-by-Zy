import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CL, DOC, EASE, MONO } from "../theory/kit";
import { alpha, Icon, SYSTEMS, tint } from "./data";

// ResearchQ Skills Library, 25s (750 frames @30fps). SFX only; the creator adds music.
// Everything sits on a 120 BPM grid (1 beat = 15 frames) so cuts land on the beat of any 120/60/240 BPM track.
// 0–60 universal hook (skripsi, tesis, disertasi, jurnal → semua ada skill-nya) · 60–120 core flow for every major
// · 120–150 levels S1/S2/S3/Dosen · 150–270 field-specific systems · 270–300 dosen (PRISM) · 300–450 demo · 450–600 wall · 600–750 CTA.
const BG = "#0B0D12", INK = "#F2EFE9", ORANGE = "#EE6A1F";
const SANS = "Poppins";
for (const [w, st] of [["400", "normal"], ["500", "normal"], ["600", "normal"], ["700", "normal"], ["800", "normal"], ["500", "italic"], ["600", "italic"]] as const) {
  loadFont({ family: SANS, url: staticFile(`fonts/poppins-latin-${w}-${st}.woff2`), weight: w, style: st });
}
// Accent line style (replaces the serif italic): Poppins medium italic.
const ACC: React.CSSProperties = { fontFamily: SANS, fontStyle: "italic", fontWeight: 500 };
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

/* ---- 1 · Hook 0–60: universal — every level, every major ---- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out1 = interpolate(f, [26, 32], [0, 1], CL);
  const push = interpolate(f, [50, 60], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  const lines: [string, number][] = [["Skripsi,", 0], ["tesis,", 6], ["disertasi,", 12], ["jurnal.", 18]];
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "50% 50%", scale: `${1 + push * 1.8}`, filter: `blur(${push * 8}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", ...ACC, fontSize: 132, lineHeight: 1.08, color: INK, opacity: 1 - out1, translate: `0px ${-out1 * 60}px`, filter: `blur(${out1 * 10}px)` }}>
          {lines.map(([t, at]) => <div key={t}><W at={at}>{t}</W></div>)}
        </div>
        {f >= 30 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 140, letterSpacing: -5, lineHeight: 1.02, color: INK }}>
            <div><W at={30}>Semua</W> <W at={34}>ada</W></div>
            <div style={{ position: "relative", display: "inline-block" }}>
              <W at={38} style={{ color: "#F59A5C" }}>skill-nya.</W>
              <svg width={700} height={50} style={{ position: "absolute", left: -10, top: 150 }}>
                <path d="M6 30 C 160 10, 400 14, 690 24" fill="none" stroke={ORANGE} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(f, [42, 52], [0, 1], { ...CL, easing: EASE })} />
              </svg>
            </div>
          </div>
        ) : null}
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 2 · Montage cut (30 frames, full-bleed system colour) ---- */
const Cut: React.FC<{ sys: number; label: string; skill: string; sub: string; flip?: boolean; kicker?: string }> = ({ sys, label, skill, sub, flip, kicker = "SISTEM KHUSUS BIDANG" }) => {
  const f = useCurrentFrame();
  const s = SYSTEMS[sys];
  const align = flip ? "right" : "left";
  const shake = f < 4 ? `${Math.sin(f * 7) * 8}px ${Math.cos(f * 9) * 6}px` : "0px 0px";
  return (
    <AbsoluteFill style={{ background: s.color, overflow: "hidden", translate: shake }}>
      <AbsoluteFill style={{ scale: `${1 + f * 0.0022}` }}>
        <div style={{ position: "absolute", [flip ? "left" : "right"]: -60, top: 1180, fontFamily: SANS, fontWeight: 800, fontSize: 700, lineHeight: 1, letterSpacing: -30, color: "transparent", WebkitTextStroke: "3px rgba(255,255,255,.22)" }}>{String(sys + 1).padStart(2, "0")}</div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 400, textAlign: align, fontFamily: MONO, fontSize: 28, letterSpacing: 8, color: "rgba(255,255,255,.75)" }}>{kicker}</div>
        <div style={{ position: "absolute", left: 70, right: 70, top: 460, textAlign: align, fontFamily: SANS, fontWeight: 800, fontSize: 116, letterSpacing: -4, lineHeight: 0.98, color: "#fff", transformOrigin: flip ? "100% 0%" : "0% 0%", ...slam(f, 0) }}>{label}</div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1000, height: 4, background: "rgba(255,255,255,.9)", transformOrigin: flip ? "100% 50%" : "0% 50%", scale: `${interpolate(f, [4, 10], [0, 1], { ...CL, easing: EASE })} 1` }} />
        <div style={{ position: "absolute", left: 80, right: 80, top: 1040, display: "flex", flexDirection: flip ? "row-reverse" : "row", alignItems: "center", gap: 28, ...slam(f, 8, 1.2) }}>
          <div style={{ width: 150, height: 150, borderRadius: 36, background: "rgba(255,255,255,.16)", border: "3px solid rgba(255,255,255,.7)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon i={sys} c="#fff" size={96} /></div>
          <div style={{ textAlign: align }}>
            <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: "rgba(255,255,255,.8)" }}>SISTEM</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 120, letterSpacing: -3, lineHeight: 1, color: "#fff" }}>{s.name}</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1250, display: "flex", justifyContent: flip ? "flex-end" : "flex-start", ...slam(f, 14, 1.25) }}>
          <span style={{ padding: "18px 30px", borderRadius: 999, background: "#fff", color: s.color, fontFamily: SANS, fontWeight: 800, fontSize: 46 }}>✦ {skill}</span>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1370, textAlign: align, ...ACC, fontSize: 52, color: "rgba(255,255,255,.9)", opacity: interpolate(f, [17, 21], [0, 1], CL) }}>{sub}</div>
      </AbsoluteFill>
      <Flash />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 2b · Core flow for every major (60 frames): 4 tiles, one per beat ---- */
const MAJORS = ["Manajemen", "Akuntansi", "Psikologi", "Komunikasi", "Ekonomi", "Sosiologi", "Ilmu Politik", "Bahasa & Sastra", "Agama Islam", "Pertanian", "Teknik Sipil", "Arsitektur", "Farmasi", "Keperawatan", "Statistika", "Pariwisata"];
const Quad: React.FC = () => {
  const f = useCurrentFrame();
  const word = MAJORS[Math.floor(f / 3) % MAJORS.length];
  const core = ["GENESIS", "CATALYST", "NEXUS", "ORACLE"].map(S);
  const hero = ["Judul Generator", "Theory Master", "SmartPLS Doctor", "Pembimbing Simulator"];
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: 230, fontFamily: MONO, fontSize: 26, letterSpacing: 7, color: "#8D95A3" }}>SEMUA JURUSAN · KUANTI & KUALI</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 280, fontFamily: SANS, fontWeight: 800, fontSize: 100, letterSpacing: -4, lineHeight: 1.02, color: INK, ...slam(f, 0, 1.15) }}>Dari judul<br />sampai sidang.</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 520, display: "flex", alignItems: "center", gap: 16, fontFamily: SANS, fontWeight: 600, fontSize: 38, color: "#CFCAC1", opacity: interpolate(f, [4, 8], [0, 1], CL) }}>
        untuk <span style={{ padding: "8px 22px", borderRadius: 999, background: "#1C2130", color: "#F59A5C", fontWeight: 700 }}>{word}</span>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 640, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {core.map((i, k) => {
          const sy = SYSTEMS[i];
          return (
            <div key={sy.name} style={{ height: 440, borderRadius: 34, background: sy.color, padding: "34px 32px", position: "relative", overflow: "hidden", ...slam(f, 6 + k * 15, 1.18) }}>
              <Icon i={i} c="#fff" size={80} />
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 5, color: "rgba(255,255,255,.8)", marginTop: 24 }}>{sy.verb}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 60, letterSpacing: -2, color: "#fff", lineHeight: 1 }}>{sy.name}</div>
              <div style={{ position: "absolute", left: 32, right: 32, bottom: 32, padding: "12px 18px", borderRadius: 16, background: "rgba(255,255,255,.95)", color: sy.color, fontFamily: SANS, fontWeight: 800, fontSize: 26 }}>✦ {hero[k]}</div>
            </div>
          );
        })}
      </div>
      {[6, 21, 36, 51].map((t) => <Sequence key={t} from={t} durationInFrames={4}><Flash /></Sequence>)}
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
  const ramp = interpolate(f, [50, 64, 150], [0, 0.82, 1], { ...CL, easing: Easing.out(Easing.quad) }); // fast in, slow-mo settle
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

/* ---- 3b · Levels beat 420–450: S1 → S2 → S3 → Dosen ---- */
const LEVELS: [string, string, string][] = [["S1", "Skripsi", "#2453E8"], ["S2", "Tesis", "#16A34A"], ["S3", "Disertasi", "#7C3AED"], ["Dosen", "Publikasi & penelitian", "#E11D2E"]];
const Levels: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {LEVELS.map(([lv, what, c], k) => {
        const at = Math.round(k * 7.5);
        return (
          <div key={lv} style={{ position: "absolute", left: 0, right: 0, top: 160 + k * 400, height: 380, background: c, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 80px", translate: `${f >= at ? interpolate(f, [at, at + 5], [k % 2 ? 1080 : -1080, 0], { ...CL, easing: Easing.out(Easing.cubic) }) : (k % 2 ? 1080 : -1080)}px 0px` }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 150, letterSpacing: -5, color: "#fff" }}>{lv}</span>
            <span style={{ fontFamily: SANS, fontStyle: "italic", fontWeight: 600, fontSize: 46, lineHeight: 1.15, color: "rgba(255,255,255,.92)", textAlign: "right", maxWidth: 360 }}>{what}</span>
          </div>
        );
      })}
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
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 230, letterSpacing: -6, lineHeight: 0.9, color: INK, ...slam(f, 60, 1.25) }}>44 skill</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 130, letterSpacing: -3, color: "#F59A5C", ...slam(f, 75, 1.25) }}>9 sistem</div>
        <div style={{ ...ACC, fontSize: 62, color: "#CFCAC1", marginTop: 14, opacity: interpolate(f, [90, 98], [0, 1], CL) }}>semua jurusan · S1–S3 · dosen</div>
      </div>
      <Flash />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---- 5 · CTA 600–750: price + "komen nama sistemnya" ---- */
const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const word = "NEXUS";
  const typed = word.slice(0, Math.max(0, Math.floor((f - 64) / 3)));
  const sent = f >= 82;
  const hi = Math.floor(f / 6) % 9;
  const end = interpolate(f, [136, 150], [0, 1], CL);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center" }}>
        <div style={{ ...ACC, fontSize: 64, color: "#CFCAC1" }}><W at={0}>Mulai</W> <W at={3}>dari</W></div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 180, letterSpacing: -7, lineHeight: 1.05, color: INK, ...slam(f, 6, 1.25) }}>Rp29.000</div>
        <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 5, color: "#8D95A3", opacity: interpolate(f, [12, 18], [0, 1], CL) }}>PER SKILL · AKUN CLAUDE GRATIS · SEKALI BELI</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: -3, lineHeight: 1.05, color: INK, ...slam(f, 24, 1.25) }}>Komen nama<br /><span style={{ color: "#F59A5C" }}>sistemnya</span> 👇</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 870, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
        {SYSTEMS.map((sy, i) => {
          const on = i === hi && f > 44;
          return <span key={sy.name} style={{ padding: "12px 22px", borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: on ? "#fff" : tint(sy.color, 0.35), background: on ? sy.color : alpha(sy.color, 0.14), border: `2px solid ${alpha(sy.color, 0.6)}`, ...slam(f, 34 + i * 2, 1.3) }}>{sy.name}</span>;
        })}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1110, opacity: interpolate(f, [56, 62], [0, 1], CL) }}>
        {sent ? (
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20, ...slam(f, 82, 1.15) }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#2A2F3A" }} />
            <div><div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: "#7E8592" }}>kamu · baru saja</div><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: INK }}>{word}</div></div>
            <div style={{ marginLeft: "auto", fontSize: 36, color: "#F0616D", opacity: interpolate(f, [92, 95], [0, 1], CL) }}>♥</div>
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderRadius: 999, background: "#161A22", border: "1.5px solid #2A2F3A" }}>
          <span style={{ flex: 1, fontFamily: SANS, fontSize: 30, fontWeight: 600, color: typed && !sent ? INK : "#5E6573" }}>{sent ? "Tambahkan komentar…" : typed || "Tambahkan komentar…"}</span>
          <span style={{ width: 58, height: 58, borderRadius: "50%", background: typed ? ORANGE : "#3A2A20", color: "#fff", fontWeight: 800, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", ...ACC, fontSize: 48, color: "#CFCAC1" }}><W at={98}>nanti aku kirim link-nya</W></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: "#7E8592", opacity: interpolate(f, [104, 110], [0, 1], CL) }}>LYNK.ID/RESQ · @RESEARCHQ.ID</div>
      <div style={{ position: "absolute", left: 80, bottom: 62, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK }}>ResearchQ<span style={{ color: ORANGE }}>.</span></div>
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
      <Sequence from={60} durationInFrames={60} name="Alur inti"><Quad /></Sequence>
      <Sequence from={120} durationInFrames={30} name="Jenjang"><Levels /></Sequence>
      {CUTS.map(([sys, label, skill, sub], k) => (
        <Sequence key={sys} from={150 + k * 30} durationInFrames={30} name={label}><Cut sys={S(sys)} label={label} skill={skill} sub={sub} flip={k % 2 === 1} /></Sequence>
      ))}
      <Sequence from={270} durationInFrames={30} name="Dosen"><Cut sys={S("PRISM")} label="Dosen & Peneliti" skill="Journal Matcher" sub="Dari manuskrip sampai terbit jurnal." kicker="PUBLIKASI JURNAL" /></Sequence>
      <Sequence from={300} durationInFrames={150} name="Demo"><Demo /></Sequence>
      <Sequence from={450} durationInFrames={150} name="Wall"><Wall /></Sequence>
      <Sequence from={600} durationInFrames={150} name="CTA"><Cta /></Sequence>
      <Audio src={staticFile("short-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
