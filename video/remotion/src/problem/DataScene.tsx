import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Big, CL, DISPLAY, EASE, MONO, P, SANS, Stage, rise } from "./kit";

// 14–27s: one visual per variable, each with its real, named source (verified by web search, 11 Oct 2026).
const SEG = 97; // frames per panel

const Panel: React.FC<{ i: number; tag: string; tagC: string; fig: string; src: string; children: (lf: number) => React.ReactNode }> = ({ i, tag, tagC, fig, src, children }) => {
  const f = useCurrentFrame();
  const lf = f - i * SEG;
  if (lf < -2 || lf > SEG + 2) return null;
  const inP = interpolate(lf, [0, 14], [0, 1], { ...CL, easing: EASE });
  const outP = interpolate(lf, [SEG - 10, SEG], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 470, height: 960, perspective: 1800 }}>
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: 34, background: P.panel, border: `2px solid ${P.line}`, padding: "34px 40px",
          boxShadow: `0 70px 120px -50px rgba(0,0,0,.95), 0 0 80px -30px ${tagC}`,
          transform: `rotateY(${(1 - inP) * 40 - outP * 40}deg) translateX(${(1 - inP) * 260 - outP * 260}px)`,
          opacity: Math.min(inP, 1 - outP),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: MONO, fontSize: 22, padding: "8px 14px", borderRadius: 10, background: tagC, color: P.bg }}>{tag}</span>
          <span style={{ fontFamily: MONO, fontSize: 22, color: P.mut }}>{fig}</span>
        </div>
        <div style={{ position: "relative", height: 740, marginTop: 20 }}>{children(lf)}</div>
        <div style={{ position: "absolute", left: 40, right: 40, bottom: 30, fontFamily: MONO, fontSize: 20, color: P.mut, borderTop: `2px dashed ${P.line}`, paddingTop: 16 }}>SUMBER: {src}</div>
      </div>
    </div>
  );
};

const Bar: React.FC<{ lf: number; at: number; label: string; v: number; max: number; txt: string; c: string; h?: number }> = ({ lf, at, label, v, max, txt, c, h = 64 }) => {
  const p = interpolate(lf, [at, at + 22], [0, 1], { ...CL, easing: EASE });
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 30 }}>
        <span>{label}</span>
        <span style={{ fontFamily: DISPLAY, fontSize: 44, color: c }}>{txt}</span>
      </div>
      <div style={{ height: h, borderRadius: 14, background: "rgba(120,160,255,.10)", marginTop: 10, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(v / max) * 100 * p}%`, borderRadius: 14, background: `linear-gradient(90deg, ${c}88, ${c})`, boxShadow: `0 0 30px ${c}` }} />
      </div>
    </div>
  );
};

const Count: React.FC<{ lf: number; at: number; to: number; dec?: number; pre?: string; suf?: string; size: number; c: string }> = ({ lf, at, to, dec = 0, pre = "", suf = "", size, c }) => {
  const v = interpolate(lf, [at, at + 26], [0, to], { ...CL, easing: EASE });
  return <span style={{ fontFamily: DISPLAY, fontSize: size, color: c, textShadow: `0 0 30px ${c}` }}>{pre}{v.toFixed(dec).replace(".", ",")}{suf}</span>;
};

export const DataScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: P.ink }}>
      <Stage />
      <div style={{ position: "absolute", left: 80, top: 270, ...rise(f, 0) }}>
        <Big size={96}>Data asli,</Big>
        <Big size={96} grad={`linear-gradient(90deg, ${P.amber}, ${P.orange})`} g="rgba(255,122,26,.6)">bukan placeholder</Big>
      </div>

      <Panel i={0} tag="01 · FENOMENA UMUM" tagC={P.amber} fig="GAMBAR 1.1" src="e-Conomy SEA 2024 · Google, Temasek, Bain & Company">
        {(lf) => (
          <>
            <div style={{ fontWeight: 800, fontSize: 34, color: P.mut }}>Nilai ekonomi digital Indonesia 2024 (GMV)</div>
            <div style={{ marginTop: 10 }}><Count lf={lf} at={6} to={90} pre="US$" suf=" M" size={150} c={P.amber} /></div>
            <Bar lf={lf} at={18} label="Ekonomi digital" v={90} max={90} txt="US$90 M" c={P.amber} />
            <Bar lf={lf} at={26} label="E-commerce (porsi terbesar)" v={65} max={90} txt="US$65 M" c={P.orange} />
            <div style={{ marginTop: 34, display: "inline-block", fontWeight: 800, fontSize: 32, padding: "12px 20px", borderRadius: 12, background: "rgba(61,220,132,.12)", color: P.green, ...rise(lf, 40) }}>▲ E-commerce tumbuh 11% dari 2023</div>
            <div style={{ marginTop: 18, fontFamily: MONO, fontSize: 19, color: P.mut }}>M = MILIAR · ANGKA PROYEKSI LAPORAN</div>
          </>
        )}
      </Panel>

      <Panel i={1} tag="02 · Y · KEPUTUSAN PEMBELIAN" tagC={P.orange} fig="GAMBAR 1.2" src="Populix (2022) · Social Commerce Landscape in Indonesia · n = 1.020">
        {(lf) => {
          const p = interpolate(lf, [6, 34], [0, 0.86], { ...CL, easing: EASE });
          return (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
                <div style={{ position: "relative", width: 300, height: 300, borderRadius: "50%", background: `conic-gradient(${P.orange} ${p * 360}deg, rgba(120,160,255,.12) 0deg)`, boxShadow: `0 0 50px -10px ${P.orange}` }}>
                  <div style={{ position: "absolute", inset: 46, borderRadius: "50%", background: P.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Count lf={lf} at={6} to={86} suf="%" size={110} c={P.orange} />
                  </div>
                </div>
                <div style={{ flex: 1, fontWeight: 800, fontSize: 38, lineHeight: 1.25 }}>responden pernah belanja lewat media sosial</div>
              </div>
              <div style={{ marginTop: 24, fontWeight: 800, fontSize: 28, color: P.mut }}>Platform social commerce paling sering dipakai</div>
              <Bar lf={lf} at={30} label="TikTok Shop" v={45} max={45} txt="45%" c={P.orange} h={44} />
              <Bar lf={lf} at={36} label="WhatsApp" v={21} max={45} txt="21%" c={P.cyan} h={44} />
              <Bar lf={lf} at={42} label="Facebook Shop · Instagram Shop" v={10} max={45} txt="10%" c={P.blue} h={44} />
            </>
          );
        }}
      </Panel>

      <Panel i={2} tag="03 · X1 · SOCIAL MEDIA MARKETING" tagC={P.cyan} fig="GAMBAR 1.3" src="Jakpat (2024, semester 2) · survei live shopping · n = 2.474">
        {(lf) => (
          <>
            <div style={{ fontWeight: 800, fontSize: 38, lineHeight: 1.25 }}>Live shopping di kalangan <span style={{ color: P.cyan }}>Gen Z</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18, marginTop: 30 }}>
              {Array.from({ length: 10 }).map((_, k) => {
                const on = k < 9 && lf >= 10 + k * 3;
                return (
                  <div key={k} style={{ height: 150, borderRadius: 20, background: on ? "rgba(92,200,255,.16)" : "rgba(120,160,255,.06)", border: `2px solid ${on ? P.cyan : P.line}`, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 14 }}>
                    <div style={{ width: 54, height: 54, borderRadius: "50%", background: on ? P.cyan : "#26304A", position: "absolute", marginBottom: 70 }} />
                    <div style={{ width: 80, height: 56, borderRadius: "40px 40px 10px 10px", background: on ? P.cyan : "#26304A" }} />
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 26, fontWeight: 800, fontSize: 40 }}><span style={{ fontFamily: DISPLAY, fontSize: 64, color: P.cyan }}>9 dari 10</span> pernah nonton live shopping</div>
            <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 20, ...rise(lf, 44) }}>
              <Count lf={lf} at={44} to={62} suf="%" size={120} c={P.amber} />
              <span style={{ fontWeight: 800, fontSize: 36, lineHeight: 1.2 }}>di antaranya sudah bertransaksi lewat live</span>
            </div>
          </>
        )}
      </Panel>

      <Panel i={3} tag="04 · X2 · ONLINE CUSTOMER REVIEW" tagC={P.cyan} fig="GAMBAR 1.4" src="Accenture (2023) · survei konsumen online Indonesia">
        {(lf) => (
          <>
            <div style={{ fontWeight: 800, fontSize: 38, lineHeight: 1.25 }}>Sebelum checkout, konsumen Indonesia…</div>
            <div style={{ marginTop: 40 }}><Count lf={lf} at={8} to={91.2} dec={1} suf="%" size={140} c={P.cyan} /></div>
            <Bar lf={lf} at={10} label="riset produk online dulu" v={91.2} max={100} txt="91,2%" c={P.cyan} />
            <div style={{ marginTop: 40 }}><Count lf={lf} at={30} to={86} suf="%" size={140} c={P.amber} /></div>
            <Bar lf={lf} at={32} label="terpengaruh likes & komentar positif" v={86} max={100} txt="86%" c={P.amber} />
          </>
        )}
      </Panel>
    </AbsoluteFill>
  );
};
