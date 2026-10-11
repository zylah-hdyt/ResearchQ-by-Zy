import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CL, EASE, Em, K, MONO, Paper, SANS, SERIF, useSubs } from "./kit";

// 22–34s: the three real articles found by web search (verified 11 Oct 2026). Quartile not visible → flagged, not guessed.
export const REFS = [
  {
    who: "Ali & Naushad (2023)",
    title: "Examining the influence of social media marketing on purchase intention: The mediating role of brand image",
    src: "Innovative Marketing, 19(4), 145–157",
    doi: "10.21511/im.19(4).2023.12",
  },
  {
    who: "Salhab dkk. (2023)",
    title: "The impact of social media marketing on purchase intention: The mediating role of brand trust and image",
    src: "Int. Journal of Data and Network Science, 7(2), 591–600",
    doi: "10.5267/j.ijdns.2023.3.012",
  },
  {
    who: "Alnaser dkk. (2024)",
    title: "The impact of social media marketing activities on purchase intention",
    src: "Int. Review of Management and Marketing, 14(6), 288–300",
    doi: "10.32479/irmm.16839",
  },
];

const RefCard: React.FC<{ i: number; at: number; top: number }> = ({ i, at, top }) => {
  const f = useCurrentFrame();
  const subs = useSubs();
  const r = REFS[i];
  return (
    <div
      style={{
        position: "absolute", left: 72, right: 72, top, padding: subs ? "16px 28px" : "24px 30px", borderRadius: 30, background: K.card, border: `2px solid ${K.line}`,
        boxShadow: "0 40px 60px -44px rgba(0,0,0,.4)",
        opacity: interpolate(f, [at, at + 8], [0, 1], CL),
        translate: `${interpolate(f, [at, at + 16], [i % 2 ? -120 : 120, 0], { ...CL, easing: EASE })}px 0px`,
        rotate: `${interpolate(f, [at, at + 16], [i % 2 ? -3 : 3, 0], { ...CL, easing: EASE })}deg`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 52, height: 52, borderRadius: 16, background: K.ink, color: K.lime, fontFamily: MONO, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>0{i + 1}</span>
        <span style={{ fontFamily: MONO, fontSize: 18, padding: "8px 12px", borderRadius: 999, background: K.grns, color: K.grn }}>✓ ADA DI HASIL PENCARIAN</span>
        <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 18, padding: "8px 12px", borderRadius: 999, background: K.ambs, color: K.amb, opacity: interpolate(f, [at + 30, at + 38], [0, 1], CL) }}>⚠️ KUARTIL: CEK SCIMAGO</span>
      </div>
      <div style={{ fontWeight: 800, fontSize: 36, marginTop: 14, letterSpacing: -0.5 }}>{r.who}</div>
      <div style={{ fontSize: 25, lineHeight: 1.35, color: "#3E3D39", marginTop: 6 }}>{r.title}</div>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 30, marginTop: 8 }}>{r.src}</div>
      <div style={{ position: "relative", display: "inline-block", fontFamily: MONO, fontSize: 21, marginTop: 8, zIndex: 0 }}>
        <span style={{ position: "absolute", left: -6, right: -6, top: 2, bottom: 0, background: K.lime, borderRadius: 6, zIndex: -1, transformOrigin: "0 50%", scale: `${interpolate(f, [at + 20, at + 32], [0, 1], { ...CL, easing: EASE })} 1` }} />
        doi: {r.doi}
      </div>
    </div>
  );
};

export const RevealScene: React.FC = () => {
  const f = useCurrentFrame();
  const subs = useSubs();
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: K.ink }}>
      <Paper label="HASIL ASLI" />
      <div style={{ position: "absolute", left: 72, right: 72, top: subs ? 252 : 270, fontWeight: 800, fontSize: subs ? 80 : 86, letterSpacing: -3, lineHeight: 1.05, opacity: interpolate(f, [0, 8], [0, 1], CL), translate: `0px ${interpolate(f, [0, 14], [40, 0], { ...CL, easing: EASE })}px` }}>
        3 artikel <span style={{ fontSize: 104 }}><Em at={12}>asli,</Em></span>
        <br />
        <span style={{ color: K.mut }}>bukan karangan.</span>
      </div>
      <RefCard i={0} at={24} top={subs ? 460 : 520} />
      <RefCard i={1} at={100} top={subs ? 770 : 838} />
      <RefCard i={2} at={176} top={subs ? 1080 : 1156} />
      <div style={{ position: "absolute", left: 72, right: 72, top: subs ? 1388 : 1478, fontFamily: MONO, fontSize: 19, color: K.mut, letterSpacing: 0.5, opacity: interpolate(f, [220, 232], [0, 1], CL) }}>
        HASIL PENCARIAN ASLI · 11 OKT 2026 · TETAP BUKA &amp; CEK SEBELUM DISITASI
      </div>
    </AbsoluteFill>
  );
};
