import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CL, EASE, SANS } from "./kit";

// Indonesian subtitles; timings come from scripts/tts_scopus.py (subs-en.json / subs-id.json).
export type Sub = { start: number; end: number; id: string };
export const Subtitles: React.FC<{ subs: Sub[] }> = ({ subs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cur = subs.find((s) => t >= s.start - 0.05 && t <= s.end + 0.25);
  if (!cur) return null;
  const k = (t - (cur.start - 0.05)) * fps;
  return (
    <div style={{ position: "absolute", left: 72, right: 72, top: 1480, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          maxWidth: 936, padding: "16px 28px", borderRadius: 22, background: "rgba(22,22,22,.9)", color: "#fff", textAlign: "center",
          fontFamily: SANS, fontWeight: 700, fontSize: 38, lineHeight: 1.3, boxShadow: "0 20px 40px -24px rgba(0,0,0,.6)",
          opacity: interpolate(k, [0, 4], [0, 1], CL), translate: `0px ${interpolate(k, [0, 8], [14, 0], { ...CL, easing: EASE })}px`,
        }}
      >
        {cur.id}
      </div>
    </div>
  );
};
