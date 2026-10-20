import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CL, EASE, Mark, MONO, SANS } from "../cine/Cine";

// AI Detection Reducer ad, 17.3s (520 frames @30fps), English VO (Cartesia, voice "Julia") + Indonesian subtitles, light "product film" look modelled on the jup.creatives
// Apple Health edit: kinetic split-word type on off-white, a colour blob that morphs into UI cards, a ring collage
// around a question, a soft glass scene, the app icon, a closing line and a signature.
// On-screen words = the VO script (the creator records it), so the type doubles as subtitles.
// Claims follow the product guide (panduan-ai-detection-reducer.pdf): an editorial tool that removes AI-isms while
// keeping meaning, citations and the writer's voice; NOT a guarantee of passing AI detectors. The HIGH → LOW is the
// skill's own "AI-pattern status" metric, not a detector score.
// 0–66 hook · 66–180 three problem cards · 180–240 collage + question (drop) · 240–300 glass "it fixes it"
// · 300–330 icon · 330–375 closing line · 375–495 CTA: product card (cropped from the creator poster) + Rp29.000 or comment "AI".
const BG = "#FBFAF8", INK = "#151413", MUTE = "#8C877E", OR = "#EE6A1F", ORS = "#F59A5C";

/* ---- kinetic word: enters as two halves that slide together out of a blur; orange while it is the spoken word ---- */
const SplitWord: React.FC<{ f: number; at: number; until: number; children: string; accentEnd?: boolean }> = ({ f, at, until, children, accentEnd }) => {
  const p = interpolate(f, [at, at + 8], [0, 1], { ...CL, easing: EASE });
  const live = f >= at && f < until;
  const color = live || (accentEnd && f >= at) ? OR : INK;
  const half = (top: boolean) => (
    <span style={{ position: top ? "relative" : "absolute", left: 0, top: 0, display: "inline-block", clipPath: top ? "inset(0 0 50% 0)" : "inset(50% 0 0 0)", translate: `${(1 - p) * (top ? -46 : 46)}px 0px`, color }}>{children}</span>
  );
  return (
    <span style={{ position: "relative", display: "inline-block", opacity: p, filter: `blur(${(1 - p) * 9}px)`, margin: "0 0.14em" }}>
      {live || (accentEnd && f >= at) ? <span style={{ position: "absolute", left: "50%", top: "50%", width: 360, height: 220, translate: "-50% -50%", background: "radial-gradient(closest-side, rgba(238,106,31,.22), rgba(238,106,31,0))", pointerEvents: "none" }} /> : null}
      {half(true)}
      {half(false)}
    </span>
  );
};
const Line: React.FC<{ f: number; words: [string, number][]; end: number; top: number; size?: number; accentLast?: boolean }> = ({ f, words, end, top, size = 72, accentLast }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexWrap: "wrap", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: -1.5, lineHeight: 1.18 }}>
    {words.map(([w, at], k) => <SplitWord key={k} f={f} at={at} until={k + 1 < words.length ? words[k + 1][1] : end} accentEnd={accentLast && k === words.length - 1}>{w}</SplitWord>)}
  </div>
);

/* ---- 1 · Hook 0–66 ---- */
const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const out = interpolate(f, [58, 66], [0, 1], CL);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ opacity: 1 - out, filter: `blur(${out * 10}px)` }}>
        <Line f={f} top={760} size={88} end={60} words={[["Wrote", 2], ["your", 7], ["thesis", 11], ["with", 20], ["a", 28], ["little", 32], ["help", 35], ["from", 43], ["AI?", 49]]} />
      </div>
    </AbsoluteFill>
  );
};

/* ---- 2 · Problems 66–180: a blob morphs into each card, cards settle into a row ---- */
const Blob: React.FC<{ f: number; at: number; w: number; h: number; children: React.ReactNode; dark?: boolean }> = ({ f, at, w, h, children, dark }) => {
  const p = interpolate(f, [at, at + 14], [0, 1], { ...CL, easing: EASE });
  const c = interpolate(f, [at + 7, at + 14], [0, 1], CL);
  if (f < at) return null;
  return (
    <div style={{ position: "relative", width: w, height: h, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: interpolate(p, [0, 1], [w * 0.7, w]), height: interpolate(p, [0, 1], [h * 0.22, h]), borderRadius: interpolate(p, [0, 1], [h * 0.11, 46]), background: dark ? "#141414" : OR, filter: `blur(${(1 - p) * 10}px)`, boxShadow: "0 30px 60px -30px rgba(0,0,0,.35)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: OR, opacity: dark ? 1 - c : 0 }} />
      </div>
      <div style={{ position: "relative", width: w, height: h, opacity: c }}>{children}</div>
    </div>
  );
};
const CardHead: React.FC<{ dot: string; label: string }> = ({ dot, label }) => (
  <div style={{ position: "absolute", left: 22, top: -40, display: "flex", alignItems: "center", gap: 8, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: INK }}>
    <span style={{ width: 12, height: 12, borderRadius: "50%", background: dot }} />{label}
  </div>
);
const Problems: React.FC = () => {
  const f = useCurrentFrame() + 66;
  const W = 300, H = 380;
  const status = f >= 150 ? "HIGH" : "…";
  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* the sentence, small and anchored top-left like the reference caption line */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 470 }}>
        <Line f={f} top={0} size={60} end={180} words={[["Stiff", 70], ["sentences.", 78], ["Predictable", 102], ["patterns.", 115], ["Rising", 136], ["AI", 143], ["signals.", 152]]} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 30, scale: `${interpolate(f, [66, 180], [1.06, 1])}` }}>
        <Blob f={f} at={70} w={W} h={H} dark>
          <CardHead dot="#E5484D" label="Kalimat kaku" />
          <div style={{ padding: "34px 26px", fontFamily: SANS, color: "#EDEBE6" }}>
            <div style={{ fontWeight: 800, fontSize: 52, lineHeight: 1.1, color: "#fff" }}>Klise</div>
            <div style={{ marginTop: 22, fontSize: 24, lineHeight: 1.45 }}><span style={{ background: "rgba(229,72,77,.35)", borderBottom: "3px solid #E5484D" }}>Seiring dengan perkembangan zaman</span>, penting untuk…</div>
          </div>
        </Blob>
        <Blob f={f} at={102} w={W} h={H} dark>
          <CardHead dot={ORS} label="Pola AI" />
          <div style={{ padding: "34px 26px", fontFamily: SANS, color: "#EDEBE6" }}>
            <div style={{ fontWeight: 800, fontSize: 52, lineHeight: 1.1, color: "#fff" }}>Ketebak</div>
            {[["P0", "#E5484D", "Klaim tanpa sumber"], ["P1", ORS, "Pembuka formulaik"], ["P2", "#9A968F", "Selalu tiga-tiga"]].map(([t, c, d]) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, fontSize: 22 }}>
                <span style={{ padding: "4px 10px", borderRadius: 8, background: c, color: "#111", fontWeight: 800, fontFamily: MONO, fontSize: 18 }}>{t}</span>{d}
              </div>
            ))}
          </div>
        </Blob>
        <Blob f={f} at={136} w={W} h={H} dark>
          <CardHead dot="#E5484D" label="AI-pattern status" />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40, fontFamily: SANS }}>
            <svg width={190} height={190} viewBox="0 0 190 190" style={{ rotate: "-90deg" }}>
              <circle cx={95} cy={95} r={78} fill="none" stroke="#2A2A2A" strokeWidth={18} />
              <circle cx={95} cy={95} r={78} fill="none" stroke="#E5484D" strokeWidth={18} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 78 * interpolate(f, [141, 159], [0, 0.88], { ...CL, easing: EASE })} 999`} />
            </svg>
            <div style={{ marginTop: -132, fontWeight: 800, fontSize: 44, color: "#fff", height: 74 }}>{status}</div>
            <div style={{ marginTop: 60, fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: "#8A867F" }}>STATUS DARI SKILL</div>
          </div>
        </Blob>
      </div>
    </AbsoluteFill>
  );
};

/* ---- 3 · Collage 180–240: AI-ism snippets ring a question box (music drop here) ---- */
const SNIPS = [
  "Di era digital yang semakin…", "Tidak dapat dipungkiri bahwa…", "Selain itu,", "Hal ini menunjukkan bahwa…", "memiliki peran yang sangat penting",
  "secara komprehensif", "Seiring dengan perkembangan zaman…", "tidak hanya…, namun juga…", "tentunya", "penting untuk dipahami bahwa",
  "memberikan kontribusi yang signifikan", "Studies show…", "bukan hanya…, tetapi juga…", "Dalam era yang semakin berkembang…",
];
const Collage: React.FC = () => {
  const f = useCurrentFrame() + 180;
  const out = interpolate(f, [232, 240], [0, 1], CL);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #FFE3D3 0%, #FFF1E8 55%, #FFE6DA 100%)", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: `${interpolate(f, [180, 240], [1.08, 1.0])}`, filter: `blur(${out * 12}px)`, opacity: 1 - out * 0.4 }}>
        {SNIPS.map((t, k) => {
          const a = (k / SNIPS.length) * Math.PI * 2 - Math.PI / 2;
          const rx = 300 + (k % 3) * 18, ry = 600 + (k % 2) * 60;
          const x = 540 + Math.cos(a) * rx, y = 960 + Math.sin(a) * ry;
          const at = 182 + Math.round(random(`sn${k}`) * 16);
          const p = interpolate(f, [at, at + 10], [0, 1], { ...CL, easing: EASE });
          const rot = (random(`r${k}`) - 0.5) * 16;
          const dark = k % 3 === 0;
          return (
            <div key={k} style={{ position: "absolute", left: x, top: y, translate: `-50% -50%`, maxWidth: 290, padding: "14px 18px", borderRadius: 16, background: dark ? "#1A1918" : "#fff", color: dark ? "#F4F1EC" : INK, fontFamily: SANS, fontWeight: 600, fontSize: 24, lineHeight: 1.3, boxShadow: "0 20px 40px -24px rgba(0,0,0,.45)", rotate: `${rot + (1 - p) * 20}deg`, scale: `${0.7 + p * 0.3}`, opacity: p, marginLeft: (1 - p) * Math.cos(a) * 260, marginTop: (1 - p) * Math.sin(a) * 260 }}>
              <span style={{ textDecoration: f > 214 ? "line-through" : "none", textDecorationColor: OR, textDecorationThickness: 3 }}>{t}</span>
            </div>
          );
        })}
        {/* question box with thin guide lines */}
        <div style={{ position: "absolute", left: 170, right: 170, top: 840, height: 250, border: "1.5px solid rgba(21,20,19,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", left: -60, right: -60, top: -1, height: 0, borderTop: "1px solid rgba(21,20,19,.18)" }} />
          <div style={{ position: "absolute", left: -60, right: -60, bottom: -1, height: 0, borderTop: "1px solid rgba(21,20,19,.18)" }} />
          <Line f={f} top={40} size={48} end={238} words={[["So", 182], ["how", 188], ["do", 197], ["you", 200], ["make", 202], ["it", 207], ["sound", 211], ["like", 216], ["you?", 221]]} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---- 4 · Glass scene 240–300: warm gradient world, document + glass cards, status HIGH → LOW ---- */
const Glass: React.FC<{ children: React.ReactNode; style: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", padding: "22px 24px", borderRadius: 28, background: "rgba(255,255,255,.42)", border: "2px solid rgba(255,255,255,.75)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", boxShadow: "0 30px 60px -30px rgba(120,50,10,.35)", fontFamily: SANS, color: INK, ...style }}>{children}</div>
);
const Fix: React.FC = () => {
  const f = useCurrentFrame() + 240;
  const flash = interpolate(f, [240, 244, 252], [0, 0.85, 0], CL);
  const pop = (at: number) => ({ opacity: interpolate(f, [at, at + 8], [0, 1], CL), translate: `0px ${interpolate(f, [at, at + 10], [40, 0], { ...CL, easing: EASE })}px` });
  const low = f >= 278;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(170deg, #FFD2B5 0%, #FFE9D8 40%, #FFF6EE 100%)", overflow: "hidden" }}>
      {/* soft depth blobs */}
      <div style={{ position: "absolute", left: -200, top: 1100, width: 900, height: 900, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(238,106,31,.45), rgba(238,106,31,0))", translate: `${interpolate(f, [240, 300], [0, 60])}px 0px` }} />
      <div style={{ position: "absolute", left: 500, top: 200, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,140,170,.35), rgba(255,140,170,0))" }} />
      <AbsoluteFill style={{ scale: `${interpolate(f, [240, 300], [1.08, 1.0], { easing: Easing.out(Easing.cubic) })}` }}>
        <Line f={f} top={300} size={64} end={300} words={[["AI", 240], ["Detection", 245], ["Reducer", 257], ["cleans", 273], ["it", 283], ["all", 288], ["up.", 292]]} />
        {/* the document */}
        <div style={{ position: "absolute", left: 300, top: 700, width: 480, height: 600, borderRadius: 24, background: "#fff", boxShadow: "0 50px 90px -40px rgba(120,50,10,.5)", padding: "40px 40px", rotate: `${interpolate(f, [240, 300], [-6, -2])}deg`, ...pop(246) }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 30, color: INK }}>BAB 1 · Latar Belakang</div>
          {[100, 92, 96, 70, 100, 88, 94, 60].map((w, k) => <div key={k} style={{ height: 14, width: `${w}%`, borderRadius: 7, background: k === 2 || k === 5 ? "rgba(238,106,31,.35)" : "#E9E5DE", marginTop: 22 }} />)}
          <div style={{ position: "absolute", left: -26, top: -26, width: 92, height: 92, borderRadius: "50%", background: OR, color: "#fff", fontSize: 50, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", ...pop(276) }}>✓</div>
        </div>
        <Glass style={{ left: 60, top: 560, ...pop(256) }}><div style={{ fontWeight: 700, fontSize: 30 }}>Makna tetap <span style={{ color: OR }}>✓</span></div></Glass>
        <Glass style={{ right: 60, top: 640, ...pop(262) }}><div style={{ fontWeight: 700, fontSize: 30 }}>Sitasi utuh <span style={{ color: OR }}>✓</span></div></Glass>
        <Glass style={{ left: 50, top: 1180, ...pop(268) }}><div style={{ fontWeight: 700, fontSize: 30 }}>Gaya bahasamu <span style={{ color: OR }}>✓</span></div></Glass>
        <Glass style={{ right: 50, top: 1250, ...pop(272) }}>
          <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: MUTE }}>AI-PATTERN STATUS</div>
          <div style={{ fontWeight: 800, fontSize: 40, marginTop: 4 }}><span style={{ color: "#C9433F", textDecoration: low ? "line-through" : "none", opacity: low ? 0.5 : 1 }}>HIGH</span> → <span style={{ color: "#1F9D55", opacity: low ? 1 : 0.2 }}>LOW</span></div>
        </Glass>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: OR, opacity: flash, mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};

/* ---- 5 · Icon 300–330 ---- */
const IconScene: React.FC = () => {
  const f = useCurrentFrame() + 300;
  const s = interpolate(f, [300, 312], [0.6, 1], { ...CL, easing: Easing.out(Easing.back(1.6)) });
  const grow = interpolate(f, [322, 330], [1, 1.25], { ...CL, easing: Easing.in(Easing.cubic) });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 25%, #FF9A5C 0%, #EE6A1F 45%, #D9531A 100%)" }}>
      <div style={{ position: "absolute", left: 540 - 110, top: 860 - 110, width: 220, height: 220, borderRadius: 56, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", scale: `${s * grow}`, boxShadow: "0 40px 80px -30px rgba(80,20,0,.5)" }}>
        <Mark size={130} c={OR} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 52, color: "#fff", opacity: interpolate(f, [306, 312], [0, 1], CL) }}>ResearchQ</div>
    </AbsoluteFill>
  );
};

/* ---- 6 · Closing line 330–380 ---- */
const Closing: React.FC = () => {
  const f = useCurrentFrame() + 330;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Line f={f} top={830} size={84} end={390} accentLast words={[["Your", 333], ["writing,", 337], ["at", 355], ["its", 358], ["most", 364], ["natural.", 370]]} />
    </AbsoluteFill>
  );
};

/* ---- 7 · CTA 375–495: the product card + price, or comment "AI" ---- */
const Cta: React.FC = () => {
  const f = useCurrentFrame() + 375;
  const p = (at: number, d = 8) => interpolate(f, [at, at + d], [0, 1], { ...CL, easing: EASE });
  const card = p(376, 16);
  const float = Math.sin((f - 378) / 14) * 8;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, #FFE7D6 0%, #FBFAF8 62%)", overflow: "hidden" }}>
      <Img src={staticFile("oracle_badge.png")} style={{ position: "absolute", left: 540 - 220, top: 210, width: 440, opacity: p(378), translate: `0px ${(1 - p(378)) * -30}px` }} />
      <div style={{ position: "absolute", left: 540 - 300, top: 380, width: 600, perspective: 1600 }}>
        <Img src={staticFile("reducer_card.png")} style={{ width: 600, display: "block", borderRadius: 44, boxShadow: "0 60px 110px -40px rgba(140,50,0,.45)", transform: `translateY(${(1 - card) * 160 + float}px) rotateY(${(1 - card) * -28}deg) rotateX(${(1 - card) * 14}deg) scale(${0.86 + card * 0.14})`, opacity: card }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1130, textAlign: "center", fontFamily: SANS }}>
        <div style={{ fontWeight: 600, fontSize: 40, color: MUTE, opacity: p(382) }}>cuma</div>
        <div style={{ fontWeight: 800, fontSize: 150, letterSpacing: -6, lineHeight: 1, color: INK, opacity: f >= 388 ? 1 : 0, scale: `${interpolate(f, [388, 394], [1.35, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` }}>Rp<span style={{ color: OR }}>29.000</span></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1340, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, color: INK, opacity: p(451), translate: `0px ${(1 - p(451)) * 24}px` }}>atau komen <span style={{ color: OR }}>AI</span> 👇 aku kirim link-nya</div>
      <div style={{ position: "absolute", left: 100, right: 100, top: 1430, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 24, lineHeight: 1.4, color: "#9A958C", opacity: p(458) }}>Alat bantu editorial, bukan jaminan lolos AI detector.</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1490, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 30, color: INK, opacity: p(463) }}>researchq<span style={{ color: OR }}>.</span>id</div>
    </AbsoluteFill>
  );
};

// VO (English, on screen as kinetic type) and the Indonesian subtitle for each line, in seconds.
// Lines 5 and 7 have no subtitle bar: the icon says "ResearchQ" and the CTA copy on screen is already the translation.
export const REDUCER_VO: [number, number, string, string][] = [
  [0.0, 2.3, "Wrote your thesis with a little help from AI?", "Draf skripsimu dibantu AI?"],
  [2.4, 6.05, "Stiff sentences. Predictable patterns. Rising AI signals.", "Kalimat kaku. Pola ketebak. Sinyal AI makin tinggi."],
  [6.1, 7.9, "So how do you make it sound like you?", "Terus, gimana biar kedengeran kayak kamu?"],
  [7.95, 10.0, "AI Detection Reducer cleans it all up.", "AI Detection Reducer merapikan semuanya."],
  [10.1, 11.0, "ResearchQ.", ""],
  [11.05, 13.1, "Your writing, at its most natural.", "Tulisanmu, versi paling natural."],
  [13.2, 17.0, "Just twenty-nine thousand rupiah. Or comment AI for the link.", ""],
];
const SubsID: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const cue = REDUCER_VO.find(([a, b, , id]) => id && t >= a && t < b);
  if (!cue) return null;
  const p = interpolate(f, [cue[0] * 30, cue[0] * 30 + 5], [0, 1], { ...CL, easing: EASE });
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1440, display: "flex", justifyContent: "center", opacity: p, translate: `0px ${(1 - p) * 12}px` }}>
      <div style={{ maxWidth: 940, padding: "12px 26px", borderRadius: 18, background: "rgba(21,20,19,.8)", textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 42, lineHeight: 1.28, color: "#fff" }}>{cue[3]}</div>
    </div>
  );
};

export const ReducerLight: React.FC<{ subs?: boolean }> = ({ subs = true }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence durationInFrames={66} name="Hook"><Hook /></Sequence>
      <Sequence from={66} durationInFrames={114} name="Masalah"><Problems /></Sequence>
      <Sequence from={180} durationInFrames={60} name="Kolase"><Collage /></Sequence>
      <Sequence from={240} durationInFrames={60} name="Dirapikan"><Fix /></Sequence>
      <Sequence from={300} durationInFrames={30} name="Ikon"><IconScene /></Sequence>
      <Sequence from={330} durationInFrames={60} name="Penutup"><Closing /></Sequence>
      <Sequence from={390} durationInFrames={130} name="CTA"><Cta /></Sequence>
      {subs ? <SubsID /> : null}
      <Audio src={staticFile("reducerlight-vo.wav")} premountFor={fps} />
      <Audio src={staticFile("reducerlight-sfx.wav")} premountFor={fps} volume={0.8} />
    </AbsoluteFill>
  );
};
