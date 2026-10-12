import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Tap } from "../scopus/kit";
import { CL, EASE, MONO, Paper, SANS, StepBar, T, rise } from "../theory/kit";

// 5–14.7s: Claude screen. Pick Method Master, attach BAB 2, state population + analysis tool, watch it build BAB 3.
// App frame at canvas (60, 300), 960 × 1110.
export const PROMPT = "Susun BAB 3 dari BAB 2 ini. Populasi: Gen Z pengguna TikTok Shop (jumlah tidak diketahui). Analisis: SmartPLS.";

const Row: React.FC<{ at: number; done: number; t: string; res: string }> = ({ at, done, t, res }) => {
  const f = useCurrentFrame();
  const ok = f >= done;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 20, background: "#F6F3EC", border: `2px solid ${T.line}`, marginTop: 12, ...rise(f, at, 20) }}>
      <span style={{ width: 34, height: 34, borderRadius: "50%", border: `4px solid ${ok ? T.green : T.line}`, borderTopColor: ok ? T.green : T.orange, rotate: `${ok ? 0 : f * 18}deg`, background: ok ? T.green : "transparent", color: "#fff", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{ok ? "✓" : ""}</span>
      <span style={{ flex: 1, fontWeight: 700, fontSize: 27 }}>{t}</span>
      <span style={{ fontFamily: MONO, fontSize: 19, color: ok ? T.green : T.mut }}>{ok ? res : "…"}</span>
    </div>
  );
};

export const DemoScene: React.FC = () => {
  const f = useCurrentFrame();
  const step = f < 75 ? 0 : f < 182 ? 1 : 2;
  const stepP = step === 0 ? f / 75 : step === 1 ? (f - 75) / 107 : Math.min(1, (f - 182) / 108);
  const label = ["Pilih skill Method Master", "Upload BAB 2 + populasi & alat analisis", "Claude baca, pilih jalur, susun"][step];
  const skillOn = f >= 48;
  const fileOn = f >= 84;
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - 96) * 1.45)));
  const home = 1 - interpolate(f, [180, 188], [0, 1], CL);
  const conv = interpolate(f, [186, 194], [0, 1], CL);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <StepBar step={step} p={stepP} label={label} />
      <div style={{ position: "absolute", left: 60, top: 300, width: 960, height: 1110, borderRadius: 48, background: "#FDFCF9", border: `2px solid ${T.line}`, overflow: "hidden", boxShadow: "14px 14px 0 rgba(26,26,26,.07)", translate: `0px ${interpolate(f, [0, 14], [1300, 0], { ...CL, easing: EASE })}px` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, borderBottom: "2px solid #EFECE4", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontWeight: 700, fontSize: 30, background: "#FDFCF9", zIndex: 2 }}>
          <Img src={staticFile("claude_logo.png")} style={{ width: 38, height: 38 }} />Claude
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: home }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontWeight: 800, fontSize: 56, letterSpacing: -1.5 }}>
            <Img src={staticFile("claude_logo.png")} style={{ width: 56, height: 56, verticalAlign: -8, marginRight: 14 }} />Mau nyusun apa hari ini?
          </div>
          {fileOn ? (
            <div style={{ position: "absolute", left: 60, top: 330, display: "flex", alignItems: "center", gap: 12, padding: "10px 18px 10px 10px", borderRadius: 18, background: "#fff", border: `2px solid ${T.line}`, fontWeight: 700, fontSize: 24, scale: `${interpolate(f, [84, 92], [0.7, 1], CL)}` }}>
              <span style={{ width: 44, height: 50, borderRadius: 10, background: T.word, color: "#fff", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>W</span>BAB2_Tinjauan_Pustaka.docx
            </div>
          ) : null}
          <div style={{ position: "absolute", left: 46, right: 46, top: 400, height: 280, borderRadius: 34, background: "#fff", border: `2px solid ${T.line}` }}>
            <div style={{ position: "absolute", left: 32, right: 32, top: 26, fontSize: 29, lineHeight: 1.42, color: typed || skillOn ? T.ink : "#B6B2A8" }}>
              {skillOn ? <span style={{ display: "inline-block", padding: "2px 16px", borderRadius: 999, background: T.orangeS, color: "#B5470F", fontWeight: 800, fontSize: 24, marginRight: 10, scale: `${interpolate(f, [48, 56], [0.6, 1], CL)}` }}>✦ Method Master</span> : null}
              {typed || (skillOn ? "" : "Tulis pesan…")}
              {f >= 96 && f < 180 && Math.floor(f / 8) % 2 === 0 ? <span style={{ borderLeft: `3px solid ${T.ink}`, marginLeft: 2 }} /> : null}
            </div>
            <div style={{ position: "absolute", left: 26, bottom: 24, width: 62, height: 62, borderRadius: "50%", border: `2.5px solid ${T.line}`, fontSize: 40, lineHeight: "54px", textAlign: "center", color: T.mut }}>+</div>
            <div style={{ position: "absolute", left: 104, bottom: 24, height: 62, padding: "0 20px", borderRadius: 999, display: "flex", alignItems: "center", fontSize: 23, fontWeight: 700, background: "#EEF7E8", color: T.green }}>🌐 Search ON</div>
            <div style={{ position: "absolute", right: 24, bottom: 24, width: 66, height: 66, borderRadius: "50%", background: typed.length > 20 ? T.clay : "#E7C3B5", color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: "64px", textAlign: "center" }}>↑</div>
          </div>
          <div style={{ position: "absolute", left: 46, top: 704, width: 560, borderRadius: 26, background: "#fff", border: `2px solid ${T.line}`, padding: "16px 12px", boxShadow: "10px 10px 0 rgba(26,26,26,.06)", opacity: interpolate(f, [18, 24, 52, 60], [0, 1, 1, 0], CL), translate: `0px ${interpolate(f, [18, 28], [-16, 0], { ...CL, easing: EASE })}px` }}>
            <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 2, color: T.mut, padding: "4px 14px 8px" }}>SKILL RESEARCHQ</div>
            {["Problem Master · BAB 1", "Theory Master · BAB 2", "Method Master · BAB 3", "Scopus Finder"].map((s, i) => (
              <div key={s} style={{ height: 70, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", borderRadius: 16, fontSize: 28, fontWeight: 700, background: i === 2 && f >= 40 ? T.orangeS : "transparent" }}>
                <span style={{ color: T.orange }}>✦</span>{s}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, bottom: 0, opacity: conv, padding: "30px 40px" }}>
          <div style={{ marginLeft: "auto", maxWidth: 780, width: "fit-content", background: "#EFEBE3", borderRadius: "32px 32px 12px 32px", padding: "20px 24px", fontSize: 26, lineHeight: 1.4, ...rise(f, 188) }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 14, background: "#fff", fontWeight: 700, fontSize: 21, marginBottom: 10 }}>
              <span style={{ width: 32, height: 36, borderRadius: 7, background: T.word, color: "#fff", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>W</span>BAB2_Tinjauan_Pustaka.docx
            </div>
            <div><span style={{ display: "inline-block", padding: "2px 14px", borderRadius: 999, background: T.orangeS, color: "#B5470F", fontWeight: 800, fontSize: 21, marginRight: 8 }}>✦ Method Master</span>{PROMPT}</div>
          </div>
          <div style={{ position: "relative", marginTop: 26, paddingLeft: 66 }}>
            <Img src={staticFile("claude_logo.png")} style={{ position: "absolute", left: 0, top: 8, width: 46, height: 46, rotate: `${interpolate(f, [194, 280], [0, 360], CL)}deg` }} />
            <Row at={196} done={214} t="Baca variabel dari BAB 2" res="X1 · X2 · Y" />
            <Row at={214} done={232} t="Deteksi jalur penelitian" res="SURVEI KUANTITATIF" />
            <Row at={230} done={250} t="Pilih rumus sampel (populasi tak diketahui)" res="COCHRAN" />
            <Row at={246} done={266} t="Susun uji & threshold SmartPLS" res="SELESAI" />
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16, padding: "18px 20px", borderRadius: 22, background: "#fff", border: `2px solid ${T.line}`, ...rise(f, 270, 30) }}>
              <div style={{ width: 70, height: 82, borderRadius: 14, background: T.word, color: "#fff", fontWeight: 800, fontSize: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>W</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 27 }}>BAB3_Metodologi.docx</div>
                <div style={{ fontSize: 21, color: T.mut }}>Siap dibuka & diedit</div>
              </div>
              <div style={{ padding: "12px 24px", borderRadius: 999, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 24 }}>Buka</div>
            </div>
          </div>
        </div>
      </div>
      <Tap show={[12, 292]} path={[[12, 720, 1300], [16, 163, 925, true], [45, 306, 1235, true], [80, 163, 925, true], [176, 917, 925, true], [284, 880, 1058, true]]} />
    </AbsoluteFill>
  );
};
