import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Big, CL, DISPLAY, MONO, P, SANS, Stage, pop, rise } from "./kit";

// 27–31s: research gap from real, verified studies whose findings disagree.
const Card: React.FC<{ at: number; c: string; head: string; who: string; src: string; note: string; shake?: number }> = ({ at, c, head, who, src, note, shake }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ flex: 1, padding: "26px 26px", borderRadius: 26, background: P.panel, border: `3px solid ${c}`, boxShadow: '8px 8px 0 rgba(0,0,0,.55)', ...pop(f, at, 12), translate: shake !== undefined ? `${interpolate(f, [at + 14, at + 16, at + 18, at + 20, at + 22], [0, -8, 7, -4, 0], CL)}px 0px` : undefined }}>
      <div style={{ fontFamily: MONO, fontSize: 20, color: c, letterSpacing: 2 }}>{head}</div>
      <div style={{ fontWeight: 800, fontSize: 34, marginTop: 12, lineHeight: 1.15 }}>{who}</div>
      <div style={{ fontSize: 22, color: P.mut, marginTop: 6, fontStyle: "italic" }}>{src}</div>
      <div style={{ fontSize: 25, marginTop: 14, lineHeight: 1.35, fontWeight: 600 }}>{note}</div>
    </div>
  );
};

export const GapScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: P.ink }}>
      <Stage hue="red" />
      <div style={{ position: "absolute", left: 80, top: 280, ...rise(f, 0) }}>
        <Big size={130} grad={`linear-gradient(90deg, ${P.red}, ${P.orange})`} g="rgba(255,59,59,.6)">Research gap</Big>
        <div style={{ fontWeight: 700, fontSize: 34, color: P.mut, marginTop: 14 }}>Pengaruh social media marketing ke keputusan beli:</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 580, display: "flex", gap: 22, alignItems: "stretch" }}>
        <Card at={10} c={P.green} head="BERPENGARUH SIGNIFIKAN" who="Salhab dkk. (2023) · Alnaser dkk. (2024)" src="IJDNS 7(2) · IRMM 14(6)" note="Social media marketing mendorong purchase intention." />
        <Card at={22} shake={f} c={P.red} head="TIDAK LANGSUNG" who="Ali & Naushad (2023)" src="Innovative Marketing 19(4)" note="Tidak signifikan langsung; pengaruhnya lewat brand image." />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", pointerEvents: "none" }}>
        <span style={{ fontFamily: DISPLAY, fontSize: 64, color: P.ink, width: 120, height: 120, lineHeight: "120px", borderRadius: "50%", background: P.bg, border: `3px solid ${P.ink}`, boxShadow: "6px 6px 0 rgba(0,0,0,.6)", opacity: interpolate(f, [30, 34], [0, 1], CL), display: "inline-block" }}>VS</span>
      </div>
      <svg width="1080" height="1920" style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {[["M 280 880 C 300 920, 420 930, 500 950", 36], ["M 800 880 C 780 920, 660 930, 580 950", 40]].map(([d, at], k) => (
          <path key={k} d={d as string} fill="none" stroke={P.amber} strokeWidth={6} strokeLinecap="round" strokeDasharray={400} strokeDashoffset={400 * (1 - interpolate(f, [at as number, (at as number) + 12], [0, 1], CL))} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 80, right: 80, top: 960, textAlign: "center", ...rise(f, 44) }}>
        <Big size={84}>Temuan belum konsisten</Big>
        <Big size={84} grad={`linear-gradient(90deg, ${P.amber}, ${P.orange})`} g="rgba(255,122,26,.6)" style={{ marginTop: 6 }}>= celah penelitianmu</Big>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1230, textAlign: "center", fontFamily: MONO, fontSize: 20, color: P.mut, ...rise(f, 60) }}>REFERENSI ASLI · ADA DOI · KUARTIL: CEK SCIMAGO</div>
    </AbsoluteFill>
  );
};
