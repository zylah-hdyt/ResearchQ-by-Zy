import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

// "NotYourLecture" thumbnail style: near-black navy, orange + electric-blue glow, heavy condensed italic display type.
export const P = {
  bg: "#04060C",
  navy: "#0A1530",
  panel: "rgba(14,22,44,.86)",
  line: "rgba(120,160,255,.22)",
  ink: "#F5F7FF",
  mut: "#8E9AB8",
  orange: "#FF7A1A",
  amber: "#FFB547",
  blue: "#2F7BFF",
  cyan: "#5CC8FF",
  green: "#3DDC84",
  red: "#FF3B3B",
};
export const DISPLAY = "Anton";
export const SANS = "PlusJakarta";
export const MONO = "JetBrainsMono";

loadFont({ family: DISPLAY, url: staticFile("fonts/anton-latin-400-normal.woff2"), weight: "400" });
loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-500-normal.woff2"), weight: "500" });
loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-700-normal.woff2"), weight: "700" });
loadFont({ family: SANS, url: staticFile("fonts/plus-jakarta-sans-latin-800-normal.woff2"), weight: "800" });
loadFont({ family: MONO, url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
export const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const glow = (c: string, s = 1) => `0 0 ${18 * s}px ${c}, 0 0 ${48 * s}px ${c}`;

// Thumbnail-style display text: Anton, italic skew, optional gradient fill + glow.
export const Big: React.FC<{ size: number; color?: string; grad?: string; g?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size, color = P.ink, grad, g, style, children }) => (
  <div
    style={{
      fontFamily: DISPLAY, fontSize: size, lineHeight: 0.95, letterSpacing: 1, textTransform: "uppercase", transform: "skewX(-8deg)",
      color: grad ? "transparent" : color,
      backgroundImage: grad, backgroundClip: grad ? "text" : undefined, WebkitBackgroundClip: grad ? "text" : undefined,
      filter: g ? `drop-shadow(0 0 22px ${g})` : undefined,
      ...style,
    }}
  >
    {children}
  </div>
);

// "GENESIS | EPISODE 05" style label.
export const Label: React.FC<{ a: string; b: string; style?: React.CSSProperties }> = ({ a, b, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", fontFamily: SANS, fontWeight: 800, fontStyle: "italic", fontSize: 26, letterSpacing: 2, border: `2px solid ${P.cyan}`, borderRadius: 6, overflow: "hidden", ...style }}>
    <span style={{ padding: "6px 14px", background: P.cyan, color: P.bg }}>{a}</span>
    <span style={{ padding: "6px 14px", color: P.cyan }}>{b}</span>
  </div>
);

// Dark stage: orange + blue glows, light streaks, vignette, grain, and the channel HUD.
export const Stage: React.FC<{ hue?: "orange" | "blue" | "red" }> = ({ hue = "orange" }) => {
  const f = useCurrentFrame();
  const a = hue === "red" ? "rgba(255,59,59,.35)" : "rgba(255,122,26,.30)";
  return (
    <AbsoluteFill style={{ backgroundColor: P.bg, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -260, top: 120, width: 900, height: 900, borderRadius: "50%", background: `radial-gradient(circle, ${a}, transparent 62%)`, translate: `${interpolate(f, [0, 300], [0, 120])}px 0px` }} />
      <div style={{ position: "absolute", right: -300, top: 900, width: 1000, height: 1000, borderRadius: "50%", background: "radial-gradient(circle, rgba(47,123,255,.30), transparent 62%)", translate: `${interpolate(f, [0, 300], [0, -120])}px 0px` }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: -400, top: 300 + i * 520, width: 2000, height: 2, background: "linear-gradient(90deg, transparent, rgba(92,200,255,.45), transparent)", rotate: "-24deg", translate: `${((f * (6 + i * 3)) % 1600) - 800}px 0px` }} />
      ))}
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(120,160,255,.05) 2px, transparent 2px), linear-gradient(90deg, rgba(120,160,255,.05) 2px, transparent 2px)", backgroundSize: "72px 72px" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,.7) 100%)" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.08, mixBlendMode: "screen" }}>
        <filter id="pg"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 5} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="1080" height="1920" filter="url(#pg)" />
      </svg>
      <div style={{ position: "absolute", left: 80, top: 196, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: P.mut }}>RESEARCHQ · SKILL</div>
      <div style={{ position: "absolute", right: 80, top: 196, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: P.mut }}>PROBLEM MASTER</div>
      <div style={{ position: "absolute", left: 80, bottom: 64, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: P.ink }}>ResearchQ<span style={{ color: "#EE6A1F" }}>.</span></div>
      <div style={{ position: "absolute", right: 80, bottom: 70, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: P.mut }}>@RESEARCHQ.ID</div>
    </AbsoluteFill>
  );
};

export const pop = (f: number, at: number, d = 12) => ({
  opacity: interpolate(f, [at, at + 5], [0, 1], CL),
  scale: `${interpolate(f, [at, at + d], [0.6, 1], { ...CL, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })}`,
});
export const rise = (f: number, at: number, dy = 40) => ({
  opacity: interpolate(f, [at, at + 6], [0, 1], CL),
  translate: `0px ${interpolate(f, [at, at + 14], [dy, 0], { ...CL, easing: EASE })}px`,
});
