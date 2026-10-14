import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { CL, EASE } from "../theory/kit";
import { D } from "./Scenes";

// Zoom-through: outgoing scene pushes toward the camera and blurs out, incoming settles from slightly small.
const ZoomThrough: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const out = presentationDirection === "exiting";
  const e = EASE(p);
  const style: React.CSSProperties = out
    ? { scale: `${1 + e * 0.35}`, opacity: 1 - e, filter: `blur(${e * 14}px)` }
    : { scale: `${0.88 + e * 0.12}`, opacity: Math.min(1, p * 1.6), filter: `blur(${(1 - e) * 10}px)` };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};
export const zoomThrough = (): TransitionPresentation<Record<string, never>> => ({ component: ZoomThrough, props: {} });

// Stinger: three diagonal brand bars sweep across the cut.
export const Stinger: React.FC<{ dur?: number }> = ({ dur = 22 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {[D.spss, D.pls, D.text].map((c, i) => {
        const x = interpolate(f, [i * 3, dur - 6 + i * 3], [-1700, 1900], { ...CL, easing: EASE });
        return <div key={c} style={{ position: "absolute", top: -300, bottom: -300, left: x, width: [520, 380, 70][i], background: c, transform: "skewX(-18deg)", opacity: i === 2 ? 0.9 : 1 }} />;
      })}
    </AbsoluteFill>
  );
};

// Slow camera drift so no frame is ever fully static.
export const Drift: React.FC<{ d: number; children: React.ReactNode }> = ({ d, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ scale: `${interpolate(f, [0, d], [1, 1.035])}`, translate: `0px ${interpolate(f, [0, d], [0, -10])}px` }}>{children}</AbsoluteFill>;
};

// Film grain + vignette for a cinematic finish (no glow).
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" transform={`translate(${random(`gx${seed}`) * 20 - 10} ${random(`gy${seed}`) * 20 - 10})`} />
      </svg>
    </AbsoluteFill>
  );
};
