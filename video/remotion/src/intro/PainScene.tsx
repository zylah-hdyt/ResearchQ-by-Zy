import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "./Backdrop";
import { C, MONO, SANS } from "./theme";

// Scene 1 (0–4.2s): the research questions that make students dizzy pop up around the frame.
const Q: React.FC<{ text: string; at: number; x: number; y: number; rot: number; dot: string }> = ({ text, at, x, y, rot, dot }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 11, stiffness: 160 } });
  return (
    <div
      style={{
        position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: 16,
        padding: "22px 30px", borderRadius: 999, background: C.surface, border: `2px solid ${C.line}`,
        color: C.ink, fontFamily: SANS, fontWeight: 700, fontSize: 40, whiteSpace: "nowrap",
        boxShadow: "0 30px 60px -30px rgba(0,0,0,.8)",
        opacity: interpolate(frame - at, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        scale: interpolate(s, [0, 1], [0.6, 1]),
        rotate: `${rot}deg`,
        translate: interpolate(frame, [at, at + 120], ["0px 0px", `0px ${-24 + rot * 2}px`], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}
    >
      <span style={{ width: 16, height: 16, borderRadius: "50%", background: dot }} />
      {text}
    </div>
  );
};

export const PainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Backdrop glow={0.4} />
      <Q text="Judulnya apa ya?" at={4} x={110} y={330} rot={-4} dot={C.amber} />
      <Q text="Populasi & sampel?" at={12} x={470} y={470} rot={3} dot={C.amber} />
      <Q text="SmartPLS merah semua" at={20} x={90} y={1180} rot={-2} dot={C.red} />
      <Q text="Revisi lagi…" at={28} x={600} y={1320} rot={5} dot={C.red} />
      <Q text="Dibilang pakai AI?" at={36} x={170} y={1460} rot={-3} dot={C.red} />
      <Q text="Deadline besok" at={44} x={560} y={610} rot={-5} dot={C.red} />
      <div
        style={{
          position: "absolute", left: 80, right: 80, top: 790, textAlign: "center", color: C.ink,
          fontWeight: 800, fontSize: 124, letterSpacing: -4, lineHeight: 1.02,
          opacity: interpolate(frame, [54, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [54, 70], ["0px 50px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        Riset bikin
        <br />
        <span style={{ color: C.orange }}>pusing?</span>
      </div>
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: MONO, fontSize: 26,
          letterSpacing: 4, color: C.mut,
          opacity: interpolate(frame, [1.6 * fps, 1.6 * fps + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        S1 · S2 · S3 · SEMUA PERNAH
      </div>
    </AbsoluteFill>
  );
};
