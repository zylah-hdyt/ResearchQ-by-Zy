import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CL, EASE, Mark, MONO, Paper, SANS, T, pop, rise } from "./kit";

// 0–4.4s direct hook: "Bingung bikin BAB 2, kuanti atau kuali?" (the choice flips back and forth),
// then at 2.7s "Ada 1 skill yang bisa bantu kamu" → Theory Master → "contohnya kayak gini".
export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const sw = f >= 80;
  const pick = Math.floor(f / 7) % 2;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      {!sw ? (
        <>
          <div style={{ position: "absolute", left: 80, right: 80, top: 250, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
            <div style={{ fontSize: 96, scale: `${interpolate(f, [0, 6], [1.12, 1], { ...CL, easing: EASE })}`, transformOrigin: "0 50%" }}>Bingung bikin</div>
            <div style={{ fontSize: 210, letterSpacing: -9, marginTop: 4 }}><Mark at={0}>BAB 2</Mark></div>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 680, display: "flex", gap: 22 }}>
            {["KUANTITATIF", "KUALITATIF"].map((t, i) => {
              const on = f < 62 ? pick === i : false;
              return (
                <div key={t} style={{ flex: 1, height: 230, borderRadius: 30, background: on ? T.ink : "#fff", color: on ? "#fff" : T.ink, border: `3px solid ${T.ink}`, boxShadow: on ? `10px 10px 0 ${T.orange}` : "10px 10px 0 rgba(26,26,26,.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: on ? -8 : 0, ...rise(f, i * 3, 40) }}>
                  <div style={{ fontWeight: 800, fontSize: 50, letterSpacing: -1 }}>{t}</div>
                  <div style={{ fontFamily: MONO, fontSize: 20, marginTop: 10, color: on ? "#BDB8AD" : T.mut }}>{i === 0 ? "HIPOTESIS · INDIKATOR" : "PROPOSISI · KONSEP"}</div>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontWeight: 800, fontSize: 120, color: T.orange, ...pop(f, 10) }}>
            <span style={{ display: "inline-block", rotate: `${Math.sin(f / 4) * 10}deg` }}>?</span>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 990, display: "flex", justifyContent: "center", gap: 14 }}>
            {["mixed method?", "R&D?", "SLR?"].map((t, i) => (
              <span key={t} style={{ padding: "14px 24px", borderRadius: 999, background: "#fff", border: `2px solid ${T.line}`, fontWeight: 800, fontSize: 32, color: T.mut, ...pop(f, 30 + i * 7) }}>{t}</span>
            ))}
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 1150, textAlign: "center", fontWeight: 800, fontSize: 64, letterSpacing: -2, ...rise(f, 50) }}>
            Struktur BAB 2-nya <span style={{ color: "#E5484D" }}>beda semua.</span>
          </div>
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: T.orange, opacity: interpolate(f, [80, 86], [0.9, 0], CL) }} />
          <div style={{ position: "absolute", left: 80, right: 80, top: 280, fontWeight: 800, fontSize: 92, letterSpacing: -4, lineHeight: 1.04, ...rise(f, 80) }}>
            Ada <Mark at={88}>1 skill</Mark><br />yang bisa bantu.
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 600, padding: "40px 40px", borderRadius: 36, background: "#fff", border: `3px solid ${T.ink}`, boxShadow: `14px 14px 0 ${T.orange}`, display: "flex", alignItems: "center", gap: 30, ...pop(f, 86) }}>
            <Img src={staticFile("claude_logo.png")} style={{ width: 130, height: 130, rotate: `${interpolate(f, [86, 108], [-120, 0], { ...CL, easing: EASE })}deg` }} />
            <div>
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: T.orange }}>CLAUDE × SKILL RESEARCHQ</div>
              <div style={{ fontWeight: 800, fontSize: 92, letterSpacing: -4, lineHeight: 1 }}>Theory Master</div>
              <div style={{ fontWeight: 700, fontSize: 30, color: T.mut, marginTop: 6 }}>BAB 2 semua jenis penelitian</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 980, textAlign: "center", fontWeight: 800, fontSize: 64, letterSpacing: -2, ...rise(f, 104) }}>
            Contohnya kayak gini <span style={{ display: "inline-block", translate: `0px ${Math.abs(Math.sin(f / 5)) * 14}px` }}>👇</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
