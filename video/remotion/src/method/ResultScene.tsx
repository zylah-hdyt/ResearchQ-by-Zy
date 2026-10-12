import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { CL, DOC, Paper, SANS, StepBar, T } from "../theory/kit";

// 14.7–22.3s: generated BAB 3 in Word. Scroll stops on 3.2 sample size (Cochran, worked out step by step),
// 3.3 operational definitions, and 3.8 SmartPLS thresholds (standard cut-offs, Hair et al. 2022).
const Bars: React.FC<{ n: number }> = ({ n }) => <>{Array.from({ length: n }).map((_, i) => <div key={i} style={{ height: 12, width: `${[100, 94, 98, 72][i % 4]}%`, borderRadius: 4, background: "#E3E0D8", marginTop: 12 }} />)}</>;
const H: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontFamily: DOC, fontWeight: 700, fontSize: 30, marginTop: 30 }}>{children}</div>;
const Note: React.FC<{ at: number; to: number; top: number; children: React.ReactNode }> = ({ at, to, top, children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", right: 34, top, padding: "14px 20px", borderRadius: 14, background: T.orange, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 28, rotate: "2deg", boxShadow: "8px 8px 0 rgba(26,26,26,.12)", opacity: interpolate(f, [at, at + 5, to - 5, to], [0, 1, 1, 0], CL), scale: `${interpolate(f, [at, at + 10], [0.7, 1], { ...CL, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })}` }}>{children}</div>;
};
const DEFOP = [
  ["Social Media Marketing (X1)", "Hiburan, interaksi, tren, kustomisasi, word of mouth"],
  ["Online Customer Review (X2)", "Kredibilitas, kualitas, kuantitas, valensi ulasan"],
  ["Keputusan Pembelian (Y)", "Pilihan produk, merek, waktu, jumlah pembelian"],
];
const THR = [["Outer loading", "> 0,70"], ["AVE", "> 0,50"], ["Composite reliability", "> 0,70"], ["HTMT", "< 0,90"], ["R²", "0,75 · 0,50 · 0,25"], ["Uji hipotesis", "t > 1,96 · p < 0,05"]];

export const ResultScene: React.FC = () => {
  const f = useCurrentFrame();
  const y = interpolate(f, [0, 14, 96, 116, 160, 182], [0, 0, 0, -620, -620, -900], { ...CL, easing: Easing.inOut(Easing.cubic) });
  const ln = (a: number) => ({ opacity: interpolate(f, [a, a + 6], [0, 1], CL), translate: `${interpolate(f, [a, a + 10], [-20, 0], CL)}px 0px` });
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <StepBar step={3} p={Math.min(1, f / 228)} label="Hasil: BAB 3 langsung di Word" />
      <div style={{ position: "absolute", left: 60, top: 300, width: 960, height: 1110, borderRadius: 30, overflow: "hidden", border: `2px solid ${T.line}`, background: "#E9E7E2", boxShadow: "14px 14px 0 rgba(26,26,26,.07)" }}>
        <div style={{ height: 76, background: T.word, color: "#fff", display: "flex", alignItems: "center", gap: 14, padding: "0 26px", fontWeight: 700, fontSize: 25, position: "relative", zIndex: 2 }}>
          <span style={{ width: 40, height: 40, borderRadius: 8, background: "#fff", color: T.word, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>W</span>
          BAB3_Metodologi.docx
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 110, translate: `0px ${y}px` }}>
          <div style={{ background: "#fff", padding: "46px 56px 70px", fontFamily: DOC, color: "#111" }}>
            <div style={{ fontWeight: 700, fontSize: 34, textAlign: "center" }}>BAB III<br />METODE PENELITIAN</div>
            <H>3.1 Jenis Penelitian</H>
            <Bars n={2} />
            <H>3.2 Populasi dan Sampel</H>
            <div style={{ fontSize: 23, lineHeight: 1.5, marginTop: 10, ...ln(18) }}>Populasi tidak diketahui jumlahnya, sehingga ukuran sampel dihitung dengan rumus Cochran:</div>
            <div style={{ margin: "18px 0", padding: "20px 24px", border: "2px solid #111", borderRadius: 8, fontSize: 30, textAlign: "center", lineHeight: 1.6 }}>
              <div style={ln(26)}>n = (Z² × p × q) / e²</div>
              <div style={ln(40)}>n = (1,96² × 0,5 × 0,5) / 0,1²</div>
              <div style={ln(54)}>n = 96,04 ≈ <b style={{ background: T.orangeS, padding: "0 8px" }}>97 → dibulatkan 100 responden</b></div>
            </div>
            <div style={{ fontSize: 20, color: "#444", ...ln(64) }}>Z = 1,96 (taraf kepercayaan 95%) · p = q = 0,5 · e = 10%</div>
            <H>3.3 Definisi Operasional Variabel</H>
            <div style={{ marginTop: 14, border: "2px solid #333", fontSize: 21 }}>
              <div style={{ display: "flex", background: "#F1EFEA", fontWeight: 700 }}>
                <div style={{ flex: 1, padding: "10px 12px" }}>Variabel</div><div style={{ flex: 1.4, padding: "10px 12px", borderLeft: "2px solid #333" }}>Indikator</div><div style={{ flex: 0.5, padding: "10px 12px", borderLeft: "2px solid #333" }}>Skala</div>
              </div>
              {DEFOP.map((r, k) => (
                <div key={k} style={{ display: "flex", borderTop: "2px solid #333", opacity: interpolate(f, [118 + k * 8, 124 + k * 8], [0, 1], CL) }}>
                  <div style={{ flex: 1, padding: "10px 12px", lineHeight: 1.3, fontWeight: 700 }}>{r[0]}</div>
                  <div style={{ flex: 1.4, padding: "10px 12px", borderLeft: "2px solid #333", lineHeight: 1.3 }}>{r[1]}</div>
                  <div style={{ flex: 0.5, padding: "10px 12px", borderLeft: "2px solid #333" }}>Likert 1–5</div>
                </div>
              ))}
            </div>
            <H>3.8 Teknik Analisis Data (SmartPLS)</H>
            <div style={{ marginTop: 14, border: "2px solid #333", fontSize: 23 }}>
              {THR.map((r, k) => (
                <div key={k} style={{ display: "flex", borderTop: k ? "2px solid #333" : "none", opacity: interpolate(f, [184 + k * 6, 190 + k * 6], [0, 1], CL) }}>
                  <div style={{ flex: 1, padding: "10px 14px" }}>{r[0]}</div>
                  <div style={{ flex: 1, padding: "10px 14px", borderLeft: "2px solid #333", fontWeight: 700 }}>{r[1]}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 400 }} />
          </div>
        </div>
      </div>
      <Note at={56} to={110} top={1080}>✓ Rumus sampel dihitung</Note>
      <Note at={120} to={176} top={1130}>✓ Indikator dari BAB 2</Note>
      <Note at={190} to={240} top={1190}>✓ Threshold SmartPLS</Note>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1424, fontFamily: "JetBrainsMono", fontSize: 18, color: T.mut, textAlign: "center", opacity: interpolate(f, [20, 30], [0, 1], CL) }}>
        CONTOH ILUSTRASI · NARASI DISAMARKAN
      </div>
    </AbsoluteFill>
  );
};
