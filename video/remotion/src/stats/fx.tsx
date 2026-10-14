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

type P = TransitionPresentationComponentProps<Record<string, never>>;
const sm = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));

// Zoom punch: dive into a point of the outgoing scene, the next scene zooms out into place.
const makePunch = (origin: string): React.FC<P> => ({ children, presentationDirection, presentationProgress: p }) => {
  const e = EASE(p);
  const style: React.CSSProperties = presentationDirection === "exiting"
    ? { transformOrigin: origin, scale: `${1 + e * 1.8}`, opacity: 1 - sm(0.45, 0.9, p), filter: `blur(${e * 10}px)` }
    : { scale: `${1.35 - e * 0.35}`, opacity: sm(0.25, 0.7, p), filter: `blur(${(1 - e) * 8}px)` };
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};
export const zoomPunch = (origin = "50% 50%"): TransitionPresentation<Record<string, never>> => ({ component: makePunch(origin), props: {} });

// Whip pan: fast horizontal throw with blur.
const Whip: React.FC<P> = ({ children, presentationDirection, presentationProgress: p }) => {
  const e = EASE(p);
  const out = presentationDirection === "exiting";
  return <AbsoluteFill style={{ translate: `${out ? -e * 1080 : (1 - e) * 1080}px 0px`, filter: `blur(${Math.sin(p * Math.PI) * 18}px)` }}>{children}</AbsoluteFill>;
};
export const whipPan = (): TransitionPresentation<Record<string, never>> => ({ component: Whip, props: {} });

// Card out: outgoing shrinks into a rounded card and drops away, incoming zooms out from slightly close.
const CardOut: React.FC<P> = ({ children, presentationDirection, presentationProgress: p }) => {
  const e = EASE(p);
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ scale: `${1 - e * 0.42}`, translate: `0px ${e * e * 700}px`, borderRadius: 70 * e, overflow: "hidden", opacity: 1 - sm(0.6, 1, p), boxShadow: "0 60px 80px -30px rgba(0,0,0,.8)" }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ scale: `${1.18 - e * 0.18}`, opacity: sm(0.1, 0.6, p) }}>{children}</AbsoluteFill>;
};
export const cardOut = (): TransitionPresentation<Record<string, never>> => ({ component: CardOut, props: {} });

// Iris: next scene opens from the centre in a growing circle.
const Iris: React.FC<P> = ({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill style={{ scale: `${1 + EASE(p) * 0.08}` }}>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ clipPath: `circle(${p * p * (3 - 2 * p) * 120}% at 50% 48%)` }}>{children}</AbsoluteFill>;
};
export const iris = (): TransitionPresentation<Record<string, never>> => ({ component: Iris, props: {} });

// Short white flash to sell a punch-in cut.
export const Flash: React.FC<{ c?: string }> = ({ c = "#FFFFFF" }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: c, opacity: interpolate(f, [0, 4, 14], [0, 0.55, 0], CL), pointerEvents: "none" }} />;
};
