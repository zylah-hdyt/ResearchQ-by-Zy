import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CL, DOC, EASE, Mark, Paper, SANS, T, pop, rise } from "./kit";

// 0–3.3s hook: a copy-paste BAB 2 ("menurut ahli A… B… C…") gets crossed out, then the Theory Master promise.
const LINES = ["Menurut ahli A, pemasaran media sosial adalah…", "Menurut ahli B, pemasaran media sosial merupakan…", "Menurut ahli C, pemasaran media sosial yaitu…", "Menurut ahli D, ulasan online adalah…", "Menurut ahli E, keputusan pembelian ialah…"];

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const sw = f >= 54;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      {!sw ? (
        <>
          <div style={{ position: "absolute", left: 90, right: 90, top: 250, padding: "40px 46px", background: "#fff", border: `2px solid ${T.line}`, borderRadius: 10, rotate: `${interpolate(f, [0, 10], [-6, -2], { ...CL, easing: EASE })}deg`, boxShadow: "12px 12px 0 rgba(26,26,26,.08)" }}>
            <div style={{ fontFamily: DOC, fontWeight: 700, fontSize: 36, textAlign: "center" }}>BAB II TINJAUAN PUSTAKA</div>
            {LINES.map((l, i) => (
              <div key={i} style={{ position: "relative", fontFamily: DOC, fontSize: 31, lineHeight: 1.5, marginTop: 14, color: "#333" }}>
                <span style={{ background: "#FFF2A8" }}>{l}</span>
                <div style={{ position: "absolute", left: -6, top: "52%", height: 5, borderRadius: 3, background: "#E5484D", width: `${interpolate(f, [12 + i * 4, 20 + i * 4], [0, 104], CL)}%` }} />
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", right: 70, top: 720, width: 330, padding: "22px 24px", background: "#FFE27A", rotate: "5deg", boxShadow: "8px 8px 0 rgba(26,26,26,.12)", fontWeight: 800, fontSize: 34, lineHeight: 1.2, ...pop(f, 24) }}>
            Teorinya nyambung ke mana?
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, color: "#7A5B00" }}>— dosen pembimbing</div>
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 1010, fontWeight: 800, fontSize: 104, letterSpacing: -4, lineHeight: 1.02 }}>
            <div style={{ scale: `${interpolate(f, [0, 6], [1.15, 1], { ...CL, easing: EASE })}`, transformOrigin: "0 50%" }}>BAB 2 kamu</div>
            <div>cuma <Mark at={8}>copas</Mark></div>
            <div style={{ color: "#E5484D" }}>definisi?</div>
          </div>
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", ...pop(f, 56) }}>
            <Img src={staticFile("claude_logo.png")} style={{ width: 150, height: 150, rotate: `${interpolate(f, [56, 80], [-90, 0], { ...CL, easing: EASE })}deg` }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 610, textAlign: "center", fontFamily: "JetBrainsMono", fontSize: 26, letterSpacing: 4, color: T.orange, ...rise(f, 60) }}>CLAUDE × SKILL RESEARCHQ</div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 680, textAlign: "center", fontWeight: 800, fontSize: 130, letterSpacing: -5, lineHeight: 1, ...rise(f, 62) }}>
            <Mark at={74}>Theory Master</Mark>
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 860, textAlign: "center", fontWeight: 800, fontSize: 60, letterSpacing: -2, lineHeight: 1.15, ...rise(f, 68) }}>
            BAB 2 yang <span style={{ color: T.orange }}>nyambung</span>,<br />bukan tumpukan definisi.
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
