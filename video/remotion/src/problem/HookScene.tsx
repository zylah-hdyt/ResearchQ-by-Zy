import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Big, CL, Label, P, SANS, Stage, glow, pop } from "./kit";

// 0–3.2s anti-scroll hook: a red-marked BAB 1 + "DATANYA MANA?" slam (visible on frame 0), then the promise.
export const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const sw = f >= 44;
  const shake = f < 12 ? Math.sin(f * 2.6) * (12 - f) * 1.4 : 0;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: P.ink }}>
      <Stage hue={sw ? "orange" : "red"} />
      {!sw ? (
        <AbsoluteFill style={{ translate: `${shake}px ${-shake * 0.6}px` }}>
          <div style={{ position: "absolute", left: 150, top: 300, width: 780, height: 520, borderRadius: 22, background: "#F2F0EA", rotate: "-5deg", padding: "40px 46px", boxShadow: "0 50px 90px -30px rgba(0,0,0,.8)" }}>
            <div style={{ fontWeight: 800, fontSize: 34, color: "#222" }}>BAB 1 · Latar Belakang</div>
            {[96, 88, 100, 70, 92, 84].map((w, i) => <div key={i} style={{ height: 18, width: `${w}%`, borderRadius: 9, background: "#D9D5CC", marginTop: 26 }} />)}
            <div style={{ position: "absolute", left: 40, top: 150, width: 560, height: 120, border: `7px solid ${P.red}`, borderRadius: "50%", rotate: "-3deg" }} />
            <div style={{ position: "absolute", right: 30, bottom: 34, fontFamily: "cursive", fontSize: 54, color: P.red, rotate: "-8deg", fontWeight: 700 }}>datanya??</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center" }}>
            <div style={{ display: "inline-block", fontWeight: 800, fontSize: 34, letterSpacing: 4, padding: "8px 22px", background: P.red, color: "#fff", borderRadius: 8 }}>DOSEN:</div>
            <Big size={210} style={{ marginTop: 18 }}>Datanya</Big>
            <Big size={250} color={P.red} style={{ textShadow: glow("rgba(255,59,59,.8)") }}>mana?</Big>
          </div>
          <div style={{ position: "absolute", left: 600, top: 680, padding: "8px 30px", border: `9px solid ${P.red}`, borderRadius: 18, color: P.red, fontFamily: "Anton", fontSize: 110, rotate: "-14deg", background: "rgba(4,6,12,.4)", opacity: interpolate(f, [14, 16], [0, 1], CL), scale: `${interpolate(f, [14, 20], [2.4, 1], CL)}` }}>REVISI</div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [44, 50], [0.8, 0], CL) }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", ...pop(f, 46, 8) }}>
            <Label a="SKILL" b="PROBLEM MASTER" />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center" }}>
            <div style={pop(f, 46, 10)}><Big size={190}>BAB 1 lengkap</Big></div>
            <div style={pop(f, 52, 10)}><Big size={200} grad={`linear-gradient(180deg, ${P.amber}, ${P.orange})`} g="rgba(255,122,26,.7)">+ data asli</Big></div>
          </div>
          {[
            { t: "4 GRAFIK DATA", x: 90, y: 1010, c: P.orange, at: 58 },
            { t: "REFERENSI SCOPUS", x: 520, y: 1100, c: P.cyan, at: 62 },
            { t: "RUMUSAN MASALAH", x: 120, y: 1200, c: P.cyan, at: 66 },
            { t: "SEMUA JURUSAN", x: 560, y: 1290, c: P.orange, at: 70 },
          ].map((c) => (
            <div key={c.t} style={{ position: "absolute", left: c.x, top: c.y, padding: "16px 26px", borderRadius: 14, border: `3px solid ${c.c}`, color: c.c, fontWeight: 800, fontStyle: "italic", fontSize: 38, letterSpacing: 1, background: "rgba(4,6,12,.6)", boxShadow: `0 0 30px -6px ${c.c}`, ...pop(f, c.at, 10) }}>{c.t}</div>
          ))}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
