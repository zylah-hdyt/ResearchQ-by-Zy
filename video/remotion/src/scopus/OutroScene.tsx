import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PROMPT } from "./ChatScene";
import { CL, EASE, Em, K, MONO, Paper, SANS } from "./kit";
import { REFS } from "./RevealScene";

// 39–45s: "Cuma satu kalimat." — the prompt card next to its results, then save / comment / follow.
export const OutroScene: React.FC = () => {
  const f = useCurrentFrame();
  const press = f >= 150;
  const up = (a: number) => ({ opacity: interpolate(f, [a, a + 8], [0, 1], CL), translate: `0px ${interpolate(f, [a, a + 14], [36, 0], { ...CL, easing: EASE })}px` });
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: K.ink }}>
      <Paper label="SCOPUS FINDER" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 280, fontWeight: 800, fontSize: 104, letterSpacing: -4, lineHeight: 1, ...up(0) }}>
        Cuma satu
        <br />
        <span style={{ fontSize: 132 }}><Em at={14}>kalimat.</Em></span>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 560, padding: "26px 30px", borderRadius: 28, background: K.ink, color: K.lime, fontFamily: MONO, fontSize: 26, lineHeight: 1.5, boxShadow: "0 40px 60px -40px rgba(0,0,0,.6)", ...up(20) }}>
        <div style={{ color: "#8C8A82", fontSize: 19, letterSpacing: 2, marginBottom: 8 }}>✦ SCOPUS FINDER · WEB SEARCH ON</div>
        “{PROMPT}”
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 830, display: "flex", flexWrap: "wrap", gap: 12 }}>
        {REFS.map((r, i) => (
          <span key={r.who} style={{ padding: "14px 20px", borderRadius: 999, background: K.card, border: `2px solid ${K.line}`, fontWeight: 800, fontSize: 26, ...up(40 + i * 8) }}>
            <span style={{ color: K.grn }}>✓ </span>{r.who}
          </span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 1000, textAlign: "center", ...up(80) }}>
        <div style={{ fontWeight: 800, fontSize: 64, letterSpacing: -2 }}>🔖 Simpan dulu</div>
        <div style={{ fontWeight: 700, fontSize: 38, color: K.mut, marginTop: 10 }}>Komen topik skripsimu 👇</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", ...up(110) }}>
        <span style={{ fontWeight: 800, fontSize: 52, marginRight: 22 }}>@researchq.id</span>
        <span
          style={{
            display: "inline-block", padding: "18px 44px", borderRadius: 999, fontWeight: 800, fontSize: 38,
            background: press ? K.ink : K.lime, color: press ? "#fff" : K.ink,
            boxShadow: press ? "0 3px 0 #000" : "0 10px 0 #8FA82C", translate: press ? "0px 8px" : "0px 0px",
          }}
        >
          {press ? "✓ Following" : "+ Follow"}
        </span>
      </div>
    </AbsoluteFill>
  );
};
