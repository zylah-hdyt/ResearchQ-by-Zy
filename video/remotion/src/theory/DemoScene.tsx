import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Tap } from "../scopus/kit";
import { CL, EASE, MONO, Paper, SANS, StepBar, T, rise } from "./kit";

// 3.3–14.3s: Claude screen. Pick the skill, paste the BAB 1 variables, watch it search open-access sources and build BAB 2.
// App-local coordinates; frame sits at canvas (60, 300), 960 × 1110.
export const PROMPT = "Susun BAB 2 kuantitatif. X1 Social Media Marketing, X2 Online Customer Review, Y Keputusan Pembelian (Gen Z, TikTok Shop). APA 7, referensi open access.";

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
  const step = f < 90 ? 0 : f < 200 ? 1 : 2;
  const stepP = step === 0 ? f / 90 : step === 1 ? (f - 90) / 110 : Math.min(1, (f - 200) / 130);
  const label = ["Pilih skill Theory Master", "Tempel variabel dari BAB 1", "Claude cari & susun sendiri"][step];
  const skillOn = f >= 58;
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - 96) * 1.75)));
  const home = 1 - interpolate(f, [198, 206], [0, 1], CL);
  const conv = interpolate(f, [204, 212], [0, 1], CL);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <StepBar step={step} p={stepP} label={label} />
      <div style={{ position: "absolute", left: 60, top: 300, width: 960, height: 1110, borderRadius: 48, background: "#FDFCF9", border: `2px solid ${T.line}`, overflow: "hidden", boxShadow: "14px 14px 0 rgba(26,26,26,.07)", translate: `0px ${interpolate(f, [0, 16], [1300, 0], { ...CL, easing: EASE })}px` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, borderBottom: `2px solid #EFECE4`, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontWeight: 700, fontSize: 30, background: "#FDFCF9", zIndex: 2 }}>
          <Img src={staticFile("claude_logo.png")} style={{ width: 38, height: 38 }} />Claude
        </div>
        {/* home */}
        <div style={{ position: "absolute", inset: 0, opacity: home }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontWeight: 800, fontSize: 56, letterSpacing: -1.5 }}>
            <Img src={staticFile("claude_logo.png")} style={{ width: 56, height: 56, verticalAlign: -8, marginRight: 14 }} />Mau nyusun apa hari ini?
          </div>
          <div style={{ position: "absolute", left: 46, right: 46, top: 380, height: 280, borderRadius: 34, background: "#fff", border: `2px solid ${T.line}` }}>
            <div style={{ position: "absolute", left: 32, right: 32, top: 26, fontSize: 29, lineHeight: 1.42, color: typed || skillOn ? T.ink : "#B6B2A8" }}>
              {skillOn ? <span style={{ display: "inline-block", padding: "2px 16px", borderRadius: 999, background: T.orangeS, color: "#B5470F", fontWeight: 800, fontSize: 24, marginRight: 10, scale: `${interpolate(f, [58, 66], [0.6, 1], CL)}` }}>✦ Theory Master</span> : null}
              {typed || (skillOn ? "" : "Tulis pesan…")}
              {f >= 96 && f < 198 && Math.floor(f / 8) % 2 === 0 ? <span style={{ borderLeft: `3px solid ${T.ink}`, marginLeft: 2 }} /> : null}
            </div>
            <div style={{ position: "absolute", left: 26, bottom: 24, width: 62, height: 62, borderRadius: "50%", border: `2.5px solid ${T.line}`, fontSize: 40, lineHeight: "54px", textAlign: "center", color: T.mut }}>+</div>
            <div style={{ position: "absolute", left: 104, bottom: 24, height: 62, padding: "0 20px", borderRadius: 999, display: "flex", alignItems: "center", fontSize: 23, fontWeight: 700, background: "#EEF7E8", color: T.green }}>🌐 Search ON</div>
            <div style={{ position: "absolute", right: 24, bottom: 24, width: 66, height: 66, borderRadius: "50%", background: typed.length > 20 ? T.clay : "#E7C3B5", color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: "64px", textAlign: "center" }}>↑</div>
          </div>
          <div style={{ position: "absolute", left: 46, top: 684, width: 560, borderRadius: 26, background: "#fff", border: `2px solid ${T.line}`, padding: "16px 12px", boxShadow: "10px 10px 0 rgba(26,26,26,.06)", opacity: interpolate(f, [28, 34, 62, 70], [0, 1, 1, 0], CL), translate: `0px ${interpolate(f, [28, 38], [-16, 0], { ...CL, easing: EASE })}px` }}>
            <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 2, color: T.mut, padding: "4px 14px 8px" }}>SKILL RESEARCHQ</div>
            {["Judul Generator", "Problem Master · BAB 1", "Theory Master · BAB 2", "Scopus Finder"].map((s, i) => (
              <div key={s} style={{ height: 70, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", borderRadius: 16, fontSize: 28, fontWeight: 700, background: i === 2 && f >= 50 ? T.orangeS : "transparent" }}>
                <span style={{ color: T.orange }}>✦</span>{s}
              </div>
            ))}
          </div>
        </div>
        {/* conversation */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, bottom: 0, opacity: conv, padding: "30px 40px" }}>
          <div style={{ marginLeft: "auto", maxWidth: 780, width: "fit-content", background: "#EFEBE3", borderRadius: "32px 32px 12px 32px", padding: "20px 24px", fontSize: 26, lineHeight: 1.4, ...rise(f, 206) }}>
            <span style={{ display: "inline-block", padding: "2px 14px", borderRadius: 999, background: T.orangeS, color: "#B5470F", fontWeight: 800, fontSize: 21, marginRight: 8 }}>✦ Theory Master</span>
            {PROMPT}
          </div>
          <div style={{ position: "relative", marginTop: 26, paddingLeft: 66 }}>
            <Img src={staticFile("claude_logo.png")} style={{ position: "absolute", left: 0, top: 8, width: 46, height: 46, rotate: `${interpolate(f, [212, 300], [0, 360], CL)}deg` }} />
            <Row at={214} done={234} t="Deteksi jenis penelitian" res="KUANTITATIF" />
            <Row at={238} done={262} t="Cari jurnal open access 2022–2026" res="12 HASIL" />
            <Row at={256} done={280} t="Cek DOI & akses gratis" res="LOLOS" />
            <Row at={274} done={298} t="Susun kerangka pemikiran & hipotesis" res="SELESAI" />
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16, padding: "18px 20px", borderRadius: 22, background: "#fff", border: `2px solid ${T.line}`, ...rise(f, 304, 30) }}>
              <div style={{ width: 70, height: 82, borderRadius: 14, background: T.word, color: "#fff", fontWeight: 800, fontSize: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>W</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 27 }}>BAB2_Tinjauan_Pustaka.docx</div>
                <div style={{ fontSize: 21, color: T.mut }}>Siap dibuka & diedit</div>
              </div>
              <div style={{ padding: "12px 24px", borderRadius: 999, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 24 }}>Buka</div>
            </div>
          </div>
        </div>
      </div>
      <Tap show={[18, 328]} path={[[18, 720, 1300], [25, 163, 905, true], [55, 306, 1215, true], [190, 917, 905, true], [320, 872, 1032, true]]} />
    </AbsoluteFill>
  );
};
