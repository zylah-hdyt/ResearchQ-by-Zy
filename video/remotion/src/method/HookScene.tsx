import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CL, EASE, Mark, MONO, Paper, SANS, T, pop, rise } from "../theory/kit";

// 0–5s hook: "Udah lewat BAB 2, terus BAB 3 mulai dari mana?" (progress BAB 1 ✓ BAB 2 ✓ BAB 3 ?),
// then at 2.5s "Ada 1 skill… jurusan apa pun" with a fast-cycling list of majors and the Method Master card.
const MAJORS = ["Manajemen", "Psikologi", "Pendidikan", "Kesehatan", "Akuntansi", "Komunikasi", "Biologi", "Lingkungan"];

export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const sw = f >= 75;
  const m = MAJORS[Math.floor(Math.max(0, f - 80) / 6) % MAJORS.length];
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      {!sw ? (
        <>
          <div style={{ position: "absolute", left: 80, right: 80, top: 250, fontWeight: 800, fontSize: 92, letterSpacing: -4, lineHeight: 1.04 }}>
            <div style={{ scale: `${interpolate(f, [0, 6], [1.12, 1], { ...CL, easing: EASE })}`, transformOrigin: "0 50%" }}>Udah lewat BAB 2,</div>
            <div>terus <Mark at={2}>BAB 3</Mark></div>
            <div style={{ color: "#E5484D" }}>mulai dari mana?</div>
          </div>
          <div style={{ position: "absolute", left: 70, right: 70, top: 690, display: "flex", flexDirection: "column", gap: 22 }}>
            {["BAB 1 · Pendahuluan", "BAB 2 · Tinjauan Pustaka", "BAB 3 · Metodologi"].map((t, i) => {
              const done = i < 2;
              return (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 24, padding: "26px 30px", borderRadius: 26, background: done ? "#fff" : T.ink, color: done ? T.ink : "#fff", border: `3px solid ${T.ink}`, boxShadow: done ? "10px 10px 0 rgba(26,26,26,.07)" : `10px 10px 0 ${T.orange}`, ...rise(f, 4 + i * 6, 40), rotate: !done ? `${Math.sin(f / 3) * 1.2}deg` : "0deg" }}>
                  <span style={{ width: 62, height: 62, borderRadius: 18, background: done ? T.green : T.orange, color: "#fff", fontWeight: 800, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center", scale: !done ? `${1 + Math.abs(Math.sin(f / 5)) * 0.12}` : "1" }}>{done ? "✓" : "?"}</span>
                  <span style={{ fontWeight: 800, fontSize: 44 }}>{t}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: T.orange, opacity: interpolate(f, [75, 81], [0.9, 0], CL) }} />
          <div style={{ position: "absolute", left: 80, right: 80, top: 260, fontWeight: 800, fontSize: 88, letterSpacing: -4, lineHeight: 1.04, ...rise(f, 75) }}>
            Ada <Mark at={82}>1 skill</Mark> buat<br />BAB 3, jurusan apa pun.
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 520, height: 120, display: "flex", alignItems: "center", gap: 20, ...rise(f, 80) }}>
            <span style={{ fontFamily: MONO, fontSize: 24, color: T.mut, letterSpacing: 2 }}>JURUSAN</span>
            <span style={{ padding: "14px 28px", borderRadius: 18, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 52 }}>{m}</span>
            <span style={{ width: 54, height: 54, borderRadius: "50%", background: T.green, color: "#fff", fontWeight: 800, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 720, padding: "40px 40px", borderRadius: 36, background: "#fff", border: `3px solid ${T.ink}`, boxShadow: `14px 14px 0 ${T.orange}`, display: "flex", alignItems: "center", gap: 30, ...pop(f, 90) }}>
            <Img src={staticFile("claude_logo.png")} style={{ width: 130, height: 130, rotate: `${interpolate(f, [90, 112], [-120, 0], { ...CL, easing: EASE })}deg` }} />
            <div>
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: T.orange }}>CLAUDE × SKILL RESEARCHQ</div>
              <div style={{ fontWeight: 800, fontSize: 88, letterSpacing: -4, lineHeight: 1 }}>Method Master</div>
              <div style={{ fontWeight: 700, fontSize: 30, color: T.mut, marginTop: 6 }}>BAB 3 · survei & eksperimen lab</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 1100, textAlign: "center", fontWeight: 800, fontSize: 62, letterSpacing: -2, ...rise(f, 120) }}>
            Contohnya kayak gini <span style={{ display: "inline-block", translate: `0px ${Math.abs(Math.sin(f / 5)) * 14}px` }}>👇</span>
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
