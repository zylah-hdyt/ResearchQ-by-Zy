import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CL, EASE, Em, K, MONO, Paper, SANS, SERIF } from "./kit";

// 0–5s: a made-up AI citation gets stamped "DOI tidak ditemukan", then the promise headline.
export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stamp = spring({ frame: frame - 20, fps, config: { damping: 12, stiffness: 220 } });
  const out = interpolate(frame, [64, 76], [0, 1], { ...CL, easing: EASE });
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: K.ink }}>
      <Paper label="SCOPUS FINDER" />
      <div style={{ opacity: 1 - out, translate: `0px ${-140 * out}px` }}>
        <div
          style={{
            position: "absolute", left: 110, right: 110, top: 380, padding: "34px 38px", borderRadius: 30, background: K.card,
            border: `2px solid ${K.line}`, boxShadow: "0 40px 70px -40px rgba(0,0,0,.35)",
            opacity: interpolate(frame, [0, 8], [0, 1], CL),
            translate: `${interpolate(frame, [22, 24, 26, 28, 30], [0, -10, 8, -4, 0], CL)}px ${interpolate(frame, [0, 12], [40, 0], { ...CL, easing: EASE })}px`,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: K.mut }}>CONTOH REFERENSI KARANGAN AI</div>
          <div style={{ marginTop: 16, fontSize: 31, lineHeight: 1.45, color: "#3E3D39" }}>
            Pratama, R. (2021). Pengaruh digital marketing terhadap loyalitas Gen Z. <i>Jurnal Bisnis Modern</i>, 12(3), 45–60.
          </div>
          <div
            style={{
              position: "absolute", right: 30, bottom: -46, padding: "12px 26px", border: `7px solid ${K.red}`, borderRadius: 20,
              color: K.red, fontWeight: 800, fontSize: 40, background: "rgba(255,255,255,.85)", rotate: "-8deg",
              scale: interpolate(stamp, [0, 1], [2.2, 1]), opacity: interpolate(frame, [20, 23], [0, 1], CL),
            }}
          >
            DOI tidak ditemukan ✗
          </div>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 860, textAlign: "center", fontWeight: 800, fontSize: 104, letterSpacing: -4, lineHeight: 1.05 }}>
          <div style={{ opacity: interpolate(frame, [10, 18], [0, 1], CL), translate: `0px ${interpolate(frame, [10, 24], [40, 0], { ...CL, easing: EASE })}px` }}>
            AI suka <span style={{ fontSize: 128 }}><Em at={30}>ngarang</Em></span>
          </div>
          <div style={{ opacity: interpolate(frame, [16, 24], [0, 1], CL), translate: `0px ${interpolate(frame, [16, 30], [40, 0], { ...CL, easing: EASE })}px` }}>referensi?</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 640, textAlign: "center", opacity: out }}>
        <div style={{ fontWeight: 800, fontSize: 122, letterSpacing: -5, lineHeight: 1, translate: `0px ${interpolate(frame, [70, 86], [50, 0], { ...CL, easing: EASE })}px` }}>Satu prompt,</div>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 150, letterSpacing: -3, lineHeight: 1.05, marginTop: 6, opacity: interpolate(frame, [80, 88], [0, 1], CL), translate: `0px ${interpolate(frame, [80, 96], [50, 0], { ...CL, easing: EASE })}px` }}>
          <Em at={92}>referensinya asli.</Em>
        </div>
        <div style={{ marginTop: 40, fontSize: 40, fontWeight: 700, color: K.mut, opacity: interpolate(frame, [100, 110], [0, 1], CL) }}>Skill Scopus Finder · ini buktinya 👇</div>
      </div>
    </AbsoluteFill>
  );
};
