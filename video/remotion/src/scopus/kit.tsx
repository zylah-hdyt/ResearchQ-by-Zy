import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

// "Satu prompt" editorial style (cream + lime + serif italic), adapted to 9:16.
export const K = {
  bg: "#F3F1EA",
  card: "#FFFFFF",
  ink: "#161616",
  mut: "#8B8A84",
  line: "#E4E1D8",
  lime: "#CDEB4B",
  limeD: "#5E7A00",
  clay: "#D97757",
  red: "#E5484D",
  reds: "#FDE8E8",
  amb: "#B7791F",
  ambs: "#FFF3D6",
  grn: "#1F9D5B",
  grns: "#E3F5EA",
};
export const SANS = "PlusJakarta";
export const SERIF = "InstrumentSerif";
export const MONO = "JetBrainsMono";

loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: SERIF, url: staticFile("fonts/instrument-serif-latin-400-italic.woff2"), weight: "400", style: "italic" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Serif-italic emphasis with a lime marker sweep (the reference's signature).
export const Em: React.FC<{ children: React.ReactNode; at: number; lime?: boolean }> = ({ children, at, lime = true }) => {
  const frame = useCurrentFrame();
  return (
    <span style={{ position: "relative", fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, letterSpacing: -1, zIndex: 0, display: "inline-block" }}>
      {lime ? (
        <span
          style={{
            position: "absolute", left: -8, right: -8, bottom: "8%", height: "34%", background: K.lime, borderRadius: 8, zIndex: -1,
            transformOrigin: "0 50%", scale: `${interpolate(frame, [at, at + 12], [0, 1], { ...CL, easing: EASE })} 1`,
          }}
        />
      ) : null}
      {children}
    </span>
  );
};

// Background: warm paper, faint grid, corner crop marks and the top HUD line.
export const Paper: React.FC<{ label: string }> = ({ label }) => {
  const corner = (s: React.CSSProperties) => <div style={{ position: "absolute", width: 34, height: 34, borderColor: "rgba(22,22,22,.22)", borderStyle: "solid", ...s }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: K.bg }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(22,22,22,.035) 2px, transparent 2px), linear-gradient(90deg, rgba(22,22,22,.035) 2px, transparent 2px)", backgroundSize: "60px 60px" }} />
      {corner({ left: 44, top: 176, borderWidth: "3px 0 0 3px" })}
      {corner({ right: 44, top: 176, borderWidth: "3px 3px 0 0" })}
      {corner({ left: 44, bottom: 44, borderWidth: "0 0 3px 3px" })}
      {corner({ right: 44, bottom: 44, borderWidth: "0 3px 3px 0" })}
      <div style={{ position: "absolute", left: 92, top: 196, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: K.mut }}>RESEARCHQ · SKILL DEMO</div>
      <div style={{ position: "absolute", right: 92, top: 196, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: K.mut }}>{label}</div>
      <div style={{ position: "absolute", left: 92, bottom: 62, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: K.ink }}>
        ResearchQ<span style={{ color: "#EE6A1F" }}>.</span>
      </div>
      <div style={{ position: "absolute", right: 92, bottom: 68, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: K.mut }}>@RESEARCHQ.ID</div>
    </AbsoluteFill>
  );
};

// Bottom-left step chip, as in the reference ("Buka claude.ai/code", "Pilih model", ...).
export const Step: React.FC<{ n: string; title: string; sub: string; from: number; to: number }> = ({ n, title, sub, from, to }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute", left: 72, top: 1468, display: "flex", alignItems: "center", gap: 20, padding: "18px 28px 18px 18px",
        borderRadius: 26, background: K.ink, color: "#fff", fontFamily: SANS, boxShadow: "0 24px 40px -24px rgba(0,0,0,.6)",
        opacity: interpolate(frame, [from, from + 8, to - 6, to], [0, 1, 1, 0], CL),
        translate: `0px ${interpolate(frame, [from, from + 12], [24, 0], { ...CL, easing: EASE })}px`,
      }}
    >
      <div style={{ width: 64, height: 64, borderRadius: 18, background: K.lime, color: K.ink, fontFamily: MONO, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 32 }}>{title}</div>
        <div style={{ fontSize: 23, color: "#A9A79F", fontWeight: 500, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
};

// Tap cursor with ripple. `path` = list of [frame, x, y, tap?]; position eases between keys.
export const Tap: React.FC<{ path: [number, number, number, boolean?][]; show: [number, number] }> = ({ path, show }) => {
  const frame = useCurrentFrame();
  let x = path[0][1], y = path[0][2];
  for (let i = 1; i < path.length; i++) {
    const [f0, x0, y0] = path[i - 1], [f1, x1, y1] = path[i];
    if (frame >= f0) { const p = interpolate(frame, [f1 - 12, f1], [0, 1], { ...CL, easing: Easing.inOut(Easing.cubic) }); x = x0 + (x1 - x0) * p; y = y0 + (y1 - y0) * p; }
  }
  const taps = path.filter((p) => p[3]).map((p) => p[0]);
  const last = taps.filter((t) => frame >= t).pop();
  const k = last === undefined ? 1 : frame - last;
  return (
    <div style={{ opacity: interpolate(frame, [show[0], show[0] + 6, show[1] - 6, show[1]], [0, 1, 1, 0], CL) }}>
      <div style={{ position: "absolute", left: x - 38, top: y - 38, width: 76, height: 76, borderRadius: "50%", border: "4px solid rgba(22,22,22,.45)", scale: interpolate(k, [0, 14], [0.6, 2.2], CL), opacity: interpolate(k, [0, 14], [1, 0], CL) }} />
      <div style={{ position: "absolute", left: x - 38, top: y - 38, width: 76, height: 76, borderRadius: "50%", background: "rgba(22,22,22,.28)", border: "4px solid rgba(255,255,255,.95)", boxShadow: "0 8px 20px rgba(0,0,0,.25)", scale: interpolate(k, [0, 3, 6], [1, 0.78, 1], CL) }} />
    </div>
  );
};
