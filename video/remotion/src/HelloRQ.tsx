import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// 5-second 9:16 smoke-test composition in the ResearchQ chat/screen-UI palette.
export const HelloRQ: React.FC<{ title: string; handle: string }> = ({ title, handle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12 } });
  const sub = interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bar = interpolate(frame, [0, 150], [0, 1]);
  return (
    <AbsoluteFill style={{ background: "#EFEAE2", fontFamily: "sans-serif", color: "#1F1E1B", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 234, left: 72, right: 72, height: 4, background: "rgba(31,30,27,.08)" }}>
        <div style={{ height: 4, width: `${bar * 100}%`, background: "#D97757" }} />
      </div>
      <div style={{ transform: `scale(${pop})`, fontSize: 110, fontWeight: 800, letterSpacing: -3, textAlign: "center", lineHeight: 1.05, padding: "0 72px" }}>
        {title}
      </div>
      <div style={{ opacity: sub, marginTop: 40, fontSize: 52, fontWeight: 800, color: "#B8552F" }}>{handle}</div>
    </AbsoluteFill>
  );
};
