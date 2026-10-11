import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "./theme";

// Shared dark background: slow drifting orange glow, dot grid, vignette and film grain.
export const Backdrop: React.FC<{ glow?: number }> = ({ glow = 1 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", left: 140, top: 520, width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(238,106,31,.28), rgba(238,106,31,0) 65%)",
          opacity: glow,
          translate: interpolate(frame, [0, durationInFrames], ["-60px 40px", "60px -40px"]),
        }}
      />
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(244,239,231,.07) 2px, transparent 2.5px)", backgroundSize: "40px 40px" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,.65) 100%)" }} />
      <svg width="1080" height="1920" style={{ position: "absolute", opacity: 0.07, mixBlendMode: "screen" }}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 6} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="1080" height="1920" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};
