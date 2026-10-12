import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

// Claude-UI screen style, ResearchQ take: warm white, ResearchQ orange, bold sans + hand-drawn marker, story-style step bar.
export const T = {
  bg: "#FAF8F4",
  card: "#FFFFFF",
  ink: "#1A1A1A",
  mut: "#8A877F",
  line: "#E6E2D9",
  orange: "#EE6A1F",
  orangeS: "#FFE1CF",
  clay: "#D97757",
  blue: "#2B5BD7",
  word: "#2B579A",
  green: "#1F9D5B",
  greenS: "#E3F5EA",
};
export const SANS = "PlusJakarta";
export const MONO = "JetBrainsMono";
export const DOC = "Tinos";

loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: DOC, url: staticFile("fonts/tinos-latin-400-normal.woff2"), weight: "400" });
loadFont({ family: DOC, url: staticFile("fonts/tinos-latin-700-normal.woff2"), weight: "700" });

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const rise = (f: number, at: number, dy = 30) => ({
  opacity: interpolate(f, [at, at + 6], [0, 1], CL),
  translate: `0px ${interpolate(f, [at, at + 14], [dy, 0], { ...CL, easing: EASE })}px`,
});
export const pop = (f: number, at: number) => ({
  opacity: interpolate(f, [at, at + 5], [0, 1], CL),
  scale: `${interpolate(f, [at, at + 12], [0.7, 1], { ...CL, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })}`,
});

// Hand-drawn marker swipe behind a word (slightly tilted, uneven ends).
export const Mark: React.FC<{ at: number; children: React.ReactNode; c?: string }> = ({ at, children, c = T.orangeS }) => {
  const f = useCurrentFrame();
  return (
    <span style={{ position: "relative", display: "inline-block", zIndex: 0 }}>
      <span style={{ position: "absolute", left: -10, right: -12, top: "38%", bottom: "2%", background: c, borderRadius: "6px 14px 8px 18px", rotate: "-1.5deg", zIndex: -1, transformOrigin: "0 50%", scale: `${interpolate(f, [at, at + 12], [0, 1], { ...CL, easing: EASE })} 1` }} />
      {children}
    </span>
  );
};

// Paper background + HUD.
export const Paper: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: T.bg }}>
    <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(26,26,26,.08) 2px, transparent 2.5px)", backgroundSize: "34px 34px" }} />
    <div style={{ position: "absolute", left: 80, bottom: 62, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.ink }}>ResearchQ<span style={{ color: T.orange }}>.</span></div>
    <div style={{ position: "absolute", right: 80, bottom: 68, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: T.mut }}>@RESEARCHQ.ID</div>
  </AbsoluteFill>
);

// Story-style step bar at the top: 4 segments, the active one fills with progress.
export const StepBar: React.FC<{ step: number; p: number; label: string }> = ({ step, p, label }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top: 176 }}>
    <div style={{ display: "flex", gap: 10 }}>
      {[0, 1, 2, 3].map((k) => (
        <div key={k} style={{ flex: 1, height: 8, borderRadius: 4, background: T.line, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${k < step ? 100 : k === step ? p * 100 : 0}%`, background: T.orange }} />
        </div>
      ))}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
      <Img src={staticFile("claude_logo.png")} style={{ width: 40, height: 40 }} />
      <span style={{ fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: T.orange }}>STEP {step + 1}/4</span>
      <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: T.ink }}>{label}</span>
    </div>
  </div>
);
