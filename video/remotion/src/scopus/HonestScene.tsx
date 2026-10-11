import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CL, EASE, Em, K, MONO, Paper, SANS } from "./kit";

// 34–39s: with web search off, the skill refuses to invent citations and hands over search links instead.
const MSG = "Search sedang tidak aktif, jadi aku nggak bisa memastikan artikel tertentu benar-benar ada. Aku nggak akan menulis daftar pustaka karangan. Ini link pencarian siap klik:";

export const HonestScene: React.FC = () => {
  const f = useCurrentFrame();
  const words = MSG.split(" ");
  const shown = Math.floor(interpolate(f, [26, 80], [0, words.length], CL));
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: K.ink }}>
      <Paper label="KALAU SEARCH MATI" />
      <div style={{ position: "absolute", left: 72, right: 72, top: 290, textAlign: "center", fontWeight: 800, fontSize: 96, letterSpacing: -3, opacity: interpolate(f, [0, 8], [0, 1], CL), translate: `0px ${interpolate(f, [0, 14], [40, 0], { ...CL, easing: EASE })}px` }}>
        Search <span style={{ fontSize: 116 }}><Em at={10} lime={false}>mati?</Em></span>
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 470, padding: "30px 34px 30px 110px", borderRadius: 34, background: K.card, border: `2px solid ${K.line}`, boxShadow: "0 40px 70px -44px rgba(0,0,0,.4)", opacity: interpolate(f, [18, 26], [0, 1], CL), translate: `0px ${interpolate(f, [18, 32], [40, 0], { ...CL, easing: EASE })}px` }}>
        <Img src={staticFile("claude_logo.png")} style={{ position: "absolute", left: 34, top: 32, width: 50, height: 50 }} />
        <div style={{ position: "absolute", left: 110, top: -18, fontFamily: MONO, fontSize: 18, padding: "6px 14px", borderRadius: 999, background: "#EEEBE3", color: K.mut }}>🌐 WEB SEARCH: OFF</div>
        <div style={{ fontSize: 31, lineHeight: 1.45, minHeight: 230 }}>{words.slice(0, shown).join(" ")}</div>
        {["Google Scholar", "Semantic Scholar"].map((n, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: `2px dashed #EEEBE3`, fontSize: 27, fontWeight: 800, opacity: interpolate(f, [82 + i * 8, 90 + i * 8], [0, 1], CL) }}>
            🔗 {n}
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 19, color: "#2B5BD7", textDecoration: "underline", fontWeight: 500 }}>klik → daftar artikel asli</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 72, right: 72, top: 1110, textAlign: "center", fontWeight: 800, fontSize: 88, letterSpacing: -3, lineHeight: 1.05, opacity: interpolate(f, [100, 108], [0, 1], CL), translate: `0px ${interpolate(f, [100, 114], [40, 0], { ...CL, easing: EASE })}px` }}>
        Skill-nya
        <br />
        <span style={{ fontSize: 112 }}><Em at={112}>nggak ngarang.</Em></span>
      </div>
    </AbsoluteFill>
  );
};
