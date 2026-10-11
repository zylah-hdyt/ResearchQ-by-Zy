import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Big, CL, MONO, P, SANS, Stage, glow, rise } from "./kit";

// 8.2–14s: the skill's variable-based flow for 1.1 Latar Belakang, lighting up node by node.
const NODES = [
  { n: "01", t: "Fenomena umum", s: "e-commerce & social commerce", c: P.amber },
  { n: "02", t: "Y · Keputusan Pembelian", s: "data sendiri", c: P.orange },
  { n: "03", t: "X1 · Social Media Marketing", s: "data sendiri", c: P.cyan },
  { n: "04", t: "X2 · Online Customer Review", s: "data sendiri", c: P.cyan },
  { n: "05", t: "X1 + X2 simultan", s: "kenapa diuji bersama", c: P.blue },
  { n: "06", t: "Objek · Gen Z TikTok Shop", s: "das sollen vs das sein", c: P.amber },
  { n: "07", t: "Research gap", s: "temuan tidak konsisten", c: P.red },
  { n: "08", t: "Urgensi & judul", s: "kenapa harus sekarang", c: P.green },
];

export const FlowScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: P.ink }}>
      <Stage hue="blue" />
      <div style={{ position: "absolute", left: 80, top: 270, ...rise(f, 0) }}>
        <Big size={110}>Alur latar</Big>
        <Big size={110} grad={`linear-gradient(90deg, ${P.cyan}, ${P.blue})`} g="rgba(47,123,255,.7)">belakang</Big>
      </div>
      <div style={{ position: "absolute", left: 120, top: 540, width: 4, height: 8 * 112 - 40, background: P.line }}>
        <div style={{ width: 4, height: `${interpolate(f, [14, 14 + 8 * 14], [0, 100], CL)}%`, background: `linear-gradient(${P.amber}, ${P.cyan}, ${P.green})`, boxShadow: glow("rgba(92,200,255,.6)", 0.5) }} />
      </div>
      {NODES.map((nd, i) => {
        const at = 14 + i * 14;
        const on = interpolate(f, [at, at + 6], [0, 1], CL);
        return (
          <div key={nd.n} style={{ position: "absolute", left: 92, right: 80, top: 520 + i * 112, display: "flex", alignItems: "center", gap: 26, ...rise(f, at, 24) }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: on ? nd.c : P.navy, color: P.bg, fontFamily: MONO, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: on ? `0 0 30px ${nd.c}` : "none" }}>{nd.n}</div>
            <div style={{ flex: 1, padding: "16px 22px", borderRadius: 16, background: P.panel, border: `2px solid ${on ? nd.c : P.line}` }}>
              <div style={{ fontWeight: 800, fontSize: 32 }}>{nd.t}</div>
              <div style={{ fontFamily: MONO, fontSize: 20, color: P.mut, marginTop: 2 }}>{nd.s.toUpperCase()}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1440, textAlign: "center", fontWeight: 800, fontStyle: "italic", fontSize: 38, color: P.amber, ...rise(f, 130) }}>
        Setiap variabel wajib punya data sendiri.
      </div>
    </AbsoluteFill>
  );
};
