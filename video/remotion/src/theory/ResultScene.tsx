import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { CL, DOC, EASE, MONO, Paper, SANS, StepBar, T, pop } from "./kit";

// 14.3–26.3s: the generated BAB 2 opened as a Word document. The page scrolls and stops on
// 2.2 Penelitian Terdahulu (real, verified studies), 2.5 Kerangka Pemikiran (draws itself), 2.7 Hipotesis, Daftar Pustaka.
const REFS = [
  ["Ali & Naushad (2023)", "SMM → Brand Image → Purchase Intention", "SMM tidak signifikan langsung; dimediasi brand image"],
  ["Salhab dkk. (2023)", "SMM → Brand Trust & Image → Purchase Intention", "SMM signifikan lewat brand trust & image"],
  ["Alnaser dkk. (2024)", "SMMA → Perceived Value → Purchase Intention", "SMMA berpengaruh positif"],
];
const DAPUS = [
  ["Ali, I., & Naushad, M. (2023). Examining the influence of social media marketing on purchase intention: The mediating role of brand image. ", "Innovative Marketing, 19", "(4), 145–157. ", "https://doi.org/10.21511/im.19(4).2023.12"],
  ["Alnaser, F., Alghizzawi, M., Abualfalayeh, G., Omeish, F., Alharthi, S., & Al Koni, S. R. (2024). The impact of social media marketing activities on purchase intention. ", "International Review of Management and Marketing, 14", "(6), 288–300. ", "https://doi.org/10.32479/irmm.16839"],
  ["Salhab, H. A., Al-Amarneh, A., Aljabaly, S. M., Al Zoubi, M. M., & Othman, M. D. (2023). The impact of social media marketing on purchase intention: The mediating role of brand trust and image. ", "International Journal of Data and Network Science, 7", "(2), 591–600. ", "https://doi.org/10.5267/j.ijdns.2023.3.012"],
];

const Bars: React.FC<{ n: number; w?: number[] }> = ({ n, w = [100, 96, 100, 92, 98, 70] }) => (
  <>{Array.from({ length: n }).map((_, i) => <div key={i} style={{ height: 13, width: `${w[i % w.length]}%`, borderRadius: 4, background: "#E3E0D8", marginTop: 13 }} />)}</>
);
const H: React.FC<{ children: React.ReactNode }> = ({ children }) => <div style={{ fontFamily: DOC, fontWeight: 700, fontSize: 30, marginTop: 34 }}>{children}</div>;

const Note: React.FC<{ at: number; to: number; top: number; children: React.ReactNode }> = ({ at, to, top, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", right: 34, top, padding: "14px 20px", borderRadius: 14, background: T.orange, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 28, rotate: "2deg", boxShadow: "8px 8px 0 rgba(26,26,26,.12)", opacity: interpolate(f, [at, at + 5, to - 5, to], [0, 1, 1, 0], CL), scale: `${interpolate(f, [at, at + 10], [0.7, 1], { ...CL, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })}` }}>{children}</div>
  );
};

export const ResultScene: React.FC = () => {
  const f = useCurrentFrame();
  // scroll keyframes (page offset in px)
  const y = interpolate(f, [0, 34, 60, 120, 150, 210, 236, 286, 312], [0, 0, -560, -560, -1180, -1180, -1760, -1760, -2260], { ...CL, easing: Easing.inOut(Easing.cubic) });
  const draw = (a: number) => interpolate(f, [a, a + 18], [0, 1], { ...CL, easing: EASE });
  const box = (x: number, yy: number, w: number, label: string, sub: string, c: string, at: number) => (
    <div style={{ position: "absolute", left: x, top: yy, width: w, height: 110, border: `3px solid ${c}`, borderRadius: 14, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, ...pop(f, at) }}>
      <div style={{ fontWeight: 800, fontSize: 23, color: c, textAlign: "center", lineHeight: 1.15 }}>{label}</div>
      <div style={{ fontSize: 19, color: "#555", marginTop: 2 }}>{sub}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <StepBar step={3} p={Math.min(1, f / 330)} label="Hasil: BAB 2 langsung di Word" />
      <div style={{ position: "absolute", left: 60, top: 300, width: 960, height: 1110, borderRadius: 30, overflow: "hidden", border: `2px solid ${T.line}`, background: "#E9E7E2", boxShadow: "14px 14px 0 rgba(26,26,26,.07)" }}>
        <div style={{ height: 76, background: T.word, color: "#fff", display: "flex", alignItems: "center", gap: 14, padding: "0 26px", fontWeight: 700, fontSize: 25 }}>
          <span style={{ width: 40, height: 40, borderRadius: 8, background: "#fff", color: T.word, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>W</span>
          BAB2_Tinjauan_Pustaka.docx
        </div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 110, translate: `0px ${y}px` }}>
          <div style={{ background: "#fff", padding: "50px 56px 70px", fontFamily: DOC, color: "#111", boxShadow: "0 2px 0 rgba(0,0,0,.08)" }}>
            <div style={{ fontWeight: 700, fontSize: 34, textAlign: "center" }}>BAB II<br />TINJAUAN PUSTAKA</div>
            <H>2.1 Landasan Teori</H>
            <div style={{ fontWeight: 700, fontSize: 26, marginTop: 14 }}>2.1.1 Social Media Marketing</div>
            <Bars n={6} />
            <div style={{ fontWeight: 700, fontSize: 26, marginTop: 22 }}>2.1.2 Online Customer Review</div>
            <Bars n={5} />
            <H>2.2 Penelitian Terdahulu</H>
            <div style={{ marginTop: 14, border: "2px solid #333", fontSize: 21 }}>
              <div style={{ display: "flex", background: "#F1EFEA", fontWeight: 700 }}>
                {["Peneliti", "Variabel", "Temuan"].map((h, i) => <div key={h} style={{ flex: i === 0 ? 0.8 : 1.1, padding: "10px 12px", borderLeft: i ? "2px solid #333" : "none" }}>{h}</div>)}
              </div>
              {REFS.map((r, k) => (
                <div key={k} style={{ display: "flex", borderTop: "2px solid #333", opacity: interpolate(f, [62 + k * 8, 68 + k * 8], [0, 1], CL) }}>
                  {r.map((c, i) => <div key={i} style={{ flex: i === 0 ? 0.8 : 1.1, padding: "10px 12px", borderLeft: i ? "2px solid #333" : "none", lineHeight: 1.3 }}>{c}</div>)}
                </div>
              ))}
            </div>
            <H>2.3 Sintesis Literatur & Research Gap</H>
            <Bars n={4} />
            <H>2.5 Kerangka Pemikiran</H>
            <div style={{ position: "relative", height: 420, marginTop: 18 }}>
              {box(0, 40, 300, "Social Media Marketing", "X1", T.orange, 150)}
              {box(0, 270, 300, "Online Customer Review", "X2", T.orange, 156)}
              {box(470, 155, 280, "Keputusan Pembelian", "Y", T.word, 162)}
              <svg width="760" height="420" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                <defs><marker id="ah" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 z" fill="#111" /></marker></defs>
                {[["M300 95 L468 195", 168], ["M300 325 L468 225", 174], ["M150 150 L150 270", 180]].map(([d, a], k) => (
                  <path key={k} d={d as string} stroke="#111" strokeWidth={4} fill="none" strokeDasharray={k === 2 ? "10 8" : "300"} strokeDashoffset={k === 2 ? 0 : 300 * (1 - draw(a as number))} markerEnd={k < 2 ? "url(#ah)" : undefined} opacity={k === 2 ? draw(a as number) : 1} />
                ))}
              </svg>
              {[["H1", 370, 112, 172], ["H2", 370, 270, 178], ["H3", 600, 320, 186]].map(([h, x, yy, a]) => (
                <div key={h as string} style={{ position: "absolute", left: x as number, top: yy as number, padding: "4px 12px", borderRadius: 8, background: T.orangeS, fontFamily: SANS, fontWeight: 800, fontSize: 22, color: "#B5470F", ...pop(f, a as number) }}>{h}</div>
              ))}
              <div style={{ position: "absolute", left: 470, top: 300, fontFamily: SANS, fontSize: 17, color: "#666", ...pop(f, 186) }}>H3 = X1 & X2 simultan → Y</div>
            </div>
            <H>2.7 Hipotesis</H>
            {[
              "H1: Social media marketing berpengaruh positif dan signifikan terhadap keputusan pembelian Gen Z di TikTok Shop.",
              "H2: Online customer review berpengaruh positif dan signifikan terhadap keputusan pembelian Gen Z di TikTok Shop.",
              "H3: Social media marketing dan online customer review secara simultan berpengaruh terhadap keputusan pembelian.",
            ].map((h, k) => <div key={k} style={{ fontSize: 24, lineHeight: 1.5, marginTop: 12, opacity: interpolate(f, [240 + k * 8, 246 + k * 8], [0, 1], CL) }}><b>{h.slice(0, 3)}</b>{h.slice(3)}</div>)}
            <H>DAFTAR PUSTAKA</H>
            {DAPUS.map(([a, j, v, doi], k) => (
              <div key={k} style={{ fontSize: 21, lineHeight: 1.5, marginTop: 12, paddingLeft: 36, textIndent: -36, opacity: interpolate(f, [290 + k * 8, 296 + k * 8], [0, 1], CL) }}>
                {a}<i>{j}</i>{v}<span style={{ color: T.blue, textDecoration: "underline" }}>{doi}</span>
              </div>
            ))}
            <div style={{ height: 300 }} />
          </div>
        </div>
      </div>
      <Note at={64} to={118} top={560}>✓ Referensi asli + DOI</Note>
      <Note at={150} to={208} top={1200}>✓ Diagram + H1–H3 otomatis</Note>
      <Note at={240} to={284} top={1210}>✓ Hipotesis sinkron dengan model</Note>
      <Note at={292} to={360} top={1250}>✓ Link klik · open access</Note>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1440, fontFamily: MONO, fontSize: 19, color: T.mut, textAlign: "center", opacity: interpolate(f, [70, 80], [0, 1], CL) }}>
        REFERENSI DI LAYAR ASLI & TERVERIFIKASI · NARASI DISAMARKAN
      </div>
    </AbsoluteFill>
  );
};
