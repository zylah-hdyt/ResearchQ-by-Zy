import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "./Backdrop";
import { C, MONO, SANS } from "./theme";

// Scene 3 (6.5–15s): wordmark reveal, the dot drops in as the period, skills marquee, handle + follow.
const WORD = "ResearchQ";
const SKILLS_A = ["Judul Generator", "Master Reviewer", "Auto Revision", "SmartPLS Doctor", "SPSS Doctor"];
const SKILLS_B = ["AI Detection Reducer", "BAB 4 Writer", "Gap Finder", "Kuesioner Builder", "Scopus Finder"];

const Row: React.FC<{ items: string[]; y: number; dir: 1 | -1; start: number }> = ({ items, y, dir, start }) => {
  const frame = useCurrentFrame();
  const list = [...items, ...items, ...items];
  return (
    <div
      style={{
        position: "absolute", left: 0, top: y, width: "max-content", display: "flex", gap: 18, whiteSpace: "nowrap",
        opacity: interpolate(frame, [start, start + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        translate: interpolate(frame, [start, start + 150], dir === 1 ? ["-900px 0px", "-300px 0px"] : ["-200px 0px", "-800px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "extend" }),
      }}
    >
      {list.map((s, i) => (
        <div key={i} style={{ flexShrink: 0, padding: "20px 30px", borderRadius: 999, background: C.surface, border: `2px solid ${C.line}`, color: C.ink, fontFamily: SANS, fontWeight: 700, fontSize: 36 }}>
          <span style={{ color: C.orange, marginRight: 12 }}>✦</span>
          {s}
        </div>
      ))}
    </div>
  );
};

export const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame: frame - 16, fps, config: { damping: 9, stiffness: 140 } });
  const lift = interpolate(frame, [3.2 * fps, 3.2 * fps + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.65, 0, 0.35, 1) });
  const press = frame >= 7.3 * fps;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: C.ink }}>
      <Backdrop glow={1} />
      {/* wordmark + tagline group, lifts toward the top when the marquee arrives */}
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 800, textAlign: "center",
          translate: `0px ${-330 * lift}px`, scale: interpolate(lift, [0, 1], [1, 0.78]),
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 168, letterSpacing: -6, lineHeight: 1 }}>
          {WORD.split("").map((ch, i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: interpolate(frame, [2 + i * 2, 8 + i * 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                translate: interpolate(frame, [2 + i * 2, 14 + i * 2], ["0px 70px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
              }}
            >
              {ch}
            </span>
          ))}
          <span
            style={{
              display: "inline-block", width: 40, height: 40, marginLeft: 8, borderRadius: "50%", background: C.orange,
              boxShadow: "0 0 50px 10px rgba(238,106,31,.45)",
              translate: `0px ${interpolate(drop, [0, 1], [-1100, 0])}px`,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 34, fontWeight: 700, fontSize: 50, color: C.mut,
            opacity: interpolate(frame, [36, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            translate: interpolate(frame, [36, 50], ["0px 24px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
          }}
        >
          Teman riset mahasiswa
        </div>
        <div
          style={{
            marginTop: 22, fontFamily: MONO, fontSize: 26, letterSpacing: 6, color: C.orange,
            opacity: interpolate(frame, [52, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          S1 · S2 · S3
        </div>
      </div>
      <Row items={SKILLS_A} y={900} dir={1} start={3.4 * fps} />
      <Row items={SKILLS_B} y={1010} dir={-1} start={3.6 * fps} />
      <div
        style={{
          position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center",
          opacity: interpolate(frame, [5.2 * fps, 5.2 * fps + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          translate: interpolate(frame, [5.2 * fps, 5.2 * fps + 16], ["0px 30px", "0px 0px"], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 72, letterSpacing: -2, color: C.ink }}>@researchq.id</div>
        <div
          style={{
            display: "inline-block", marginTop: 34, padding: "24px 64px", borderRadius: 999, fontWeight: 800, fontSize: 44,
            background: press ? C.ink : C.orange, color: press ? C.bg : "#fff",
            boxShadow: press ? "0 4px 0 #8E877C" : "0 14px 0 #A9471A, 0 40px 60px -20px rgba(238,106,31,.6)",
            translate: press ? "0px 10px" : "0px 0px",
            scale: interpolate(frame, [5.6 * fps, 5.6 * fps + 10], [0.7, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.34, 1.56, 0.64, 1) }),
            opacity: interpolate(frame, [5.6 * fps, 5.6 * fps + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          {press ? "✓ Following" : "+ Follow"}
        </div>
      </div>
    </AbsoluteFill>
  );
};
