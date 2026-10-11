import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// "NotYourLecture" thumbnail type (heavy condensed italic) in a flat, print-like look: solid colours, hard offset shadows, no glow.
export const P = {
  bg: "#04060C",
  navy: "#0A1530",
  panel: "#161A23",
  line: "#2A303D",
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
// Hard offset shadow (no blur). The colour argument is kept for call-site compatibility.
export const glow = (_c?: string, s = 1) => `${6 * s}px ${6 * s}px 0 rgba(0,0,0,.55)`;
export const HARD = "10px 10px 0 rgba(0,0,0,.55)";

// Thumbnail-style display text: Anton, italic skew, solid fill + hard shadow. `grad` is reduced to its last colour.
export const Big: React.FC<{ size: number; color?: string; grad?: string; g?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size, color = P.ink, grad, style, children }) => (
  <div
    style={{
      fontFamily: DISPLAY, fontSize: size, lineHeight: 0.95, letterSpacing: 1, textTransform: "uppercase", transform: "skewX(-8deg)",
      color: grad ? (grad.match(/#[0-9A-Fa-f]{6}/g) || [color]).slice(-1)[0] : color,
      textShadow: "6px 6px 0 rgba(0,0,0,.6)",
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

// Flat dark stage: charcoal, faint grid, two solid colour slabs that slide slowly, grain, and the channel HUD.
export const Stage: React.FC<{ hue?: "orange" | "blue" | "red" }> = ({ hue = "orange" }) => {
  const f = useCurrentFrame();
  const slab = hue === "red" ? P.red : hue === "blue" ? P.blue : P.orange;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0F14", overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.035) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.035) 2px, transparent 2px)", backgroundSize: "72px 72px" }} />
      <div style={{ position: "absolute", right: -300, top: -230, width: 600, height: 240, background: slab, rotate: "-24deg", opacity: 0.9, translate: `${interpolate(f, [0, 240], [60, -40])}px 0px` }} />
      <div style={{ position: "absolute", left: -300, bottom: 180, width: 560, height: 90, background: hue === "blue" ? P.orange : P.blue, rotate: "-24deg", opacity: 0.85, translate: `${interpolate(f, [0, 240], [-50, 40])}px 0px` }} />
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.07, mixBlendMode: "screen" }}>
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

// Slow camera push on every scene so nothing sits perfectly still.
export const Cam: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return <AbsoluteFill style={{ scale: `${interpolate(f, [0, durationInFrames], [1, 1.035])}`, translate: `0px ${interpolate(f, [0, durationInFrames], [0, -14])}px` }}>{children}</AbsoluteFill>;
};

// Hand-drawn marker ellipse that draws itself (stroke-dashoffset).
export const Circle: React.FC<{ at: number; w: number; h: number; c?: string; style?: React.CSSProperties }> = ({ at, w, h, c = P.amber, style }) => {
  const f = useCurrentFrame();
  const len = Math.PI * (w + h) * 0.55;
  return (
    <svg width={w + 20} height={h + 20} style={{ position: "absolute", overflow: "visible", pointerEvents: "none", ...style }}>
      <ellipse cx={(w + 20) / 2} cy={(h + 20) / 2} rx={w / 2} ry={h / 2} fill="none" stroke={c} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - interpolate(f, [at, at + 14], [0, 1], { ...CL, easing: EASE }))} transform={`rotate(-4 ${(w + 20) / 2} ${(h + 20) / 2})`} />
    </svg>
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
