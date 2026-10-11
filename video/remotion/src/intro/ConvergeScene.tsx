import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Backdrop } from "./Backdrop";
import { C, SANS } from "./theme";

// Scene 2 (4.2–6.5s): every question collapses into one orange dot, which pulses and launches upward.
const PILLS = [
  { t: "Judulnya apa ya?", x: -330, y: -560 },
  { t: "Populasi & sampel?", x: 160, y: -420 },
  { t: "Deadline besok", x: 210, y: -280 },
  { t: "SmartPLS merah semua", x: -280, y: 260 },
  { t: "Revisi lagi…", x: 260, y: 400 },
  { t: "Dibilang pakai AI?", x: -200, y: 540 },
];

export const ConvergeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const pull = (d: number) => interpolate(frame, [d, d + 16], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.7, 0, 0.84, 0) });
  const ring = (d: number) => ({
    position: "absolute" as const, left: 540 - 60, top: 960 - 60, width: 120, height: 120, borderRadius: "50%",
    border: `4px solid ${C.orange}`,
    scale: interpolate(frame, [d, d + 26], [0.4, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }),
    opacity: interpolate(frame, [d, d + 26], [0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  });
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Backdrop glow={interpolate(frame, [10, 30], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {PILLS.map((p, i) => (
        <div
          key={p.t}
          style={{
            position: "absolute", left: 540, top: 960, padding: "22px 30px", borderRadius: 999, background: C.surface,
            border: `2px solid ${C.line}`, color: C.ink, fontWeight: 700, fontSize: 40, whiteSpace: "nowrap",
            translate: `calc(-50% + ${p.x * pull(i * 2)}px) calc(-50% + ${p.y * pull(i * 2)}px)`,
            scale: interpolate(pull(i * 2), [0, 1], [0.05, 1]),
            opacity: interpolate(pull(i * 2), [0, 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {p.t}
        </div>
      ))}
      <div style={ring(26)} />
      <div style={ring(36)} />
      <div
        style={{
          position: "absolute", left: 540 - 40, top: 960 - 40, width: 80, height: 80, borderRadius: "50%", background: C.orange,
          boxShadow: "0 0 80px 20px rgba(238,106,31,.55)",
          scale: interpolate(frame, [18, 26, 32, 40], [0, 1.25, 0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [56, 68], ["0px 0px", "0px -1200px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.7, 0, 0.84, 0) }),
        }}
      />
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", color: C.mut, fontWeight: 700, fontSize: 48,
          opacity: interpolate(frame, [30, 38, 52, 58], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        tenang.
      </div>
    </AbsoluteFill>
  );
};
