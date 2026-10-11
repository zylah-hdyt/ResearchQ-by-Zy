import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Big, CL, EASE, Label, MONO, P, SANS, Stage, pop, rise } from "./kit";

// 3.2–8.2s: title card + 3D prompt card with the quantitative marketing case and its variables.
export const CASE = "Susun BAB 1: Pengaruh Social Media Marketing dan Online Customer Review terhadap Keputusan Pembelian Gen Z di TikTok Shop";

export const PromptScene: React.FC = () => {
  const f = useCurrentFrame();
  const typed = CASE.slice(0, Math.floor(interpolate(f, [26, 92], [0, CASE.length], CL)));
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: P.ink }}>
      <Stage />
      <div style={{ position: "absolute", left: 80, top: 290, ...rise(f, 0) }}><Label a="THE RESEARCH JOURNEY" b="BAB 1" /></div>
      <div style={{ position: "absolute", left: 80, top: 350, ...rise(f, 2) }}>
        <Big size={150} grad={`linear-gradient(180deg, ${P.amber}, ${P.orange})`} g="rgba(255,122,26,.6)">Problem</Big>
        <Big size={150} style={{ marginTop: -6 }}>Master</Big>
      </div>
      <div style={{ position: "absolute", left: 80, top: 670, fontWeight: 700, fontSize: 34, color: P.mut, ...rise(f, 8) }}>Semua jurusan · semua metode · referensi asli</div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 760, perspective: 1600 }}>
        <div
          style={{
            padding: "30px 34px", borderRadius: 28, background: P.panel, border: `2px solid ${P.line}`, boxShadow: `0 60px 100px -40px rgba(0,0,0,.9), 0 0 60px -20px ${P.blue}`,
            rotate: `x ${interpolate(f, [10, 40], [28, 10], { ...CL, easing: EASE })}deg`, transform: `rotateY(${interpolate(f, [10, 40], [-30, -10], { ...CL, easing: EASE })}deg)`,
            opacity: interpolate(f, [10, 18], [0, 1], CL),
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ fontWeight: 800, fontSize: 24, padding: "6px 16px", borderRadius: 999, border: `2.5px solid ${P.orange}`, color: P.orange }}>✦ Problem Master</span>
            <span style={{ fontWeight: 800, fontSize: 24, padding: "6px 16px", borderRadius: 999, border: `2.5px solid ${P.green}`, color: P.green }}>🌐 Search ON</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 36, lineHeight: 1.4, fontWeight: 700, minHeight: 250 }}>
            {typed}
            {f < 100 && Math.floor(f / 7) % 2 === 0 ? <span style={{ borderLeft: `4px solid ${P.cyan}`, marginLeft: 3 }} /> : null}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1190, display: "flex", flexWrap: "wrap", gap: 14 }}>
        {[
          { k: "X1", v: "Social Media Marketing", c: P.cyan, at: 98 },
          { k: "X2", v: "Online Customer Review", c: P.cyan, at: 104 },
          { k: "Y", v: "Keputusan Pembelian", c: P.orange, at: 110 },
          { k: "OBJEK", v: "Gen Z · TikTok Shop", c: P.amber, at: 116 },
          { k: "METODE", v: "Kuantitatif", c: P.green, at: 122 },
        ].map((c) => (
          <div key={c.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 14, background: "rgba(4,6,12,.7)", border: `2px solid ${c.c}`, ...pop(f, c.at, 10) }}>
            <span style={{ fontFamily: MONO, fontSize: 22, color: c.c }}>{c.k}</span>
            <span style={{ fontWeight: 800, fontSize: 30 }}>{c.v}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
