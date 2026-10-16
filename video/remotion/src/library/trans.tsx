import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, Easing } from "remotion";

// Hand-built transitions for the Skills Library — each system boundary gets its own move. No glow; motion carries it.
type P = TransitionPresentationComponentProps<{ c: string }>;
const io = Easing.bezier(0.65, 0, 0.35, 1);   // editorial in-out
const snap = Easing.bezier(0.85, 0, 0.15, 1); // hard snap
const mk = (C: React.FC<P>) => (c = "#FFFFFF"): TransitionPresentation<{ c: string }> => ({ component: C, props: { c } });
const sm = (a: number, b: number, x: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));

// 1 · Iris that opens from the icon tile (top-left), with a thin ring in the system colour.
export const irisIcon = mk(({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill style={{ scale: `${1 + io(p) * 0.06}` }}>{children}</AbsoluteFill>;
  const r = io(p) * 2300;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at 155px 375px)` }}>{children}</AbsoluteFill>
      <div style={{ position: "absolute", left: 155 - r, top: 375 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `4px solid ${passedProps.c}`, opacity: 1 - p }} />
    </AbsoluteFill>
  );
});

// 2 · Colour block wipe: a solid panel in the next system colour sweeps across, the new scene trails behind it.
export const blockWipe = mk(({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill style={{ translate: `${-snap(p) * 160}px 0px` }}>{children}</AbsoluteFill>;
  const e = snap(p);
  const edge = e * 1400 - 160;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${Math.max(0, 1080 - (edge - 220))}px 0 0)` }}>{children}</AbsoluteFill>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: edge - 220, width: 220, background: passedProps.c }} />
    </AbsoluteFill>
  );
});

// 3 · Split shutter: the old scene tears into top/bottom halves that slide apart.
export const splitShutter = mk(({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === "entering") return <AbsoluteFill style={{ scale: `${1.08 - io(p) * 0.08}` }}>{children}</AbsoluteFill>;
  const e = io(p);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(0 0 50% 0)", translate: `0px ${-e * 980}px` }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ clipPath: "inset(50% 0 0 0)", translate: `0px ${e * 980}px` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
});

// 4 · Vertical push with a speed smear.
export const pushUp = mk(({ children, presentationDirection, presentationProgress: p }) => {
  const e = io(p);
  const blur = Math.sin(p * Math.PI) * 10;
  const y = presentationDirection === "exiting" ? -e * 1920 : (1 - e) * 1920;
  return <AbsoluteFill style={{ translate: `0px ${y}px`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>;
});

// 5 · Venetian blinds: horizontal slats of the new scene open top-to-bottom.
export const blinds = mk(({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  const H = 160;
  const stops: string[] = [];
  for (let k = 0; k < 12; k++) {
    const q = io(sm(k * 0.04, 0.56 + k * 0.04, p)) * H;
    stops.push(`#000 ${k * H}px, #000 ${k * H + q}px, transparent ${k * H + q}px, transparent ${(k + 1) * H}px`);
  }
  const m = `linear-gradient(to bottom, ${stops.join(", ")})`;
  return <AbsoluteFill style={{ WebkitMaskImage: m, maskImage: m }}>{children}</AbsoluteFill>;
});

// 6 · Dive: the camera flies into the icon tile; the next scene arrives from behind it.
export const dive = mk(({ children, presentationDirection, presentationProgress: p }) => {
  const e = Easing.in(Easing.cubic)(p);
  if (presentationDirection === "exiting") return <AbsoluteFill style={{ transformOrigin: "155px 375px", scale: `${1 + e * 7}`, opacity: 1 - sm(0.55, 0.95, p) }}>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ scale: `${0.82 + io(p) * 0.18}`, opacity: sm(0.35, 0.8, p) }}>{children}</AbsoluteFill>;
});

// 7 · Card swing: the old scene swings out on its bottom-left hinge, the new one swings in from the right.
export const swing = mk(({ children, presentationDirection, presentationProgress: p }) => {
  const e = io(p);
  if (presentationDirection === "exiting") return <AbsoluteFill style={{ transformOrigin: "0% 100%", rotate: `${-e * 14}deg`, translate: `${-e * 1200}px 0px` }}>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ transformOrigin: "100% 100%", rotate: `${(1 - e) * 14}deg`, translate: `${(1 - e) * 1200}px 0px` }}>{children}</AbsoluteFill>;
});

// 8 · Slices: five horizontal bands of the new scene slide in from alternating sides, staggered.
export const slices = mk(({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill style={{ opacity: 1 - sm(0.6, 1, p) }}>{children}</AbsoluteFill>;
  const B = 5, h = 1920 / B;
  return (
    <AbsoluteFill>
      {Array.from({ length: B }).map((_, k) => {
        const e = snap(sm(k * 0.08, 0.68 + k * 0.08, p));
        return <AbsoluteFill key={k} style={{ clipPath: `inset(${k * h}px 0 ${1920 - (k + 1) * h}px 0)`, translate: `${(k % 2 ? 1 : -1) * (1 - e) * 1080}px 0px` }}>{children}</AbsoluteFill>;
      })}
    </AbsoluteFill>
  );
});

// 9 · Ring from the track dot: the new scene opens from its own dot on the 9-dot journey track.
export const ringDot = mk(({ children, presentationDirection, presentationProgress: p, passedProps }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  const r = io(p) * 2300, x = 990, y = 1702;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${x}px ${y}px)` }}>{children}</AbsoluteFill>
      <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `5px solid ${passedProps.c}`, opacity: 1 - p }} />
    </AbsoluteFill>
  );
});

// 10 · Shrink to card: the last system scales down into a rounded card and drops, the wall rises behind.
export const toCard = mk(({ children, presentationDirection, presentationProgress: p }) => {
  const e = io(p);
  if (presentationDirection === "exiting") return <AbsoluteFill style={{ scale: `${1 - e * 0.6}`, borderRadius: 80 * e, overflow: "hidden", translate: `0px ${e * e * 900}px`, opacity: 1 - sm(0.7, 1, p) }}>{children}</AbsoluteFill>;
  return <AbsoluteFill style={{ opacity: sm(0, 0.5, p) }}>{children}</AbsoluteFill>;
});
