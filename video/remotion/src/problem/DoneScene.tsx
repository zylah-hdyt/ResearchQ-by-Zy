import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Big, MONO, P, SANS, Stage, rise } from "./kit";

// 31–34s: every BAB 1 sub-chapter the skill drafts, ticked off fast.
const ITEMS = [
  ["1.1", "Latar Belakang", "4 GRAFIK DATA"],
  ["1.2", "Identifikasi Masalah", ""],
  ["1.3", "Batasan Masalah", ""],
  ["1.4", "Rumusan Masalah", "X1, X2, SIMULTAN"],
  ["1.5", "Tujuan Penelitian", ""],
  ["1.6", "Manfaat Penelitian", ""],
  ["DP", "Daftar Pustaka APA", "SCOPUS 2022–2026"],
  ["W", "Langsung ke Word", ""],
];

export const DoneScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: P.ink }}>
      <Stage hue="blue" />
      <div style={{ position: "absolute", left: 80, top: 270, ...rise(f, 0) }}>
        <Big size={120}>BAB 1</Big>
        <Big size={120} grad={`linear-gradient(90deg, ${P.green}, ${P.cyan})`} g="rgba(61,220,132,.6)">beres semua</Big>
      </div>
      {ITEMS.map(([n, t, s], i) => (
        <div key={n} style={{ position: "absolute", left: 80, right: 80, top: 560 + i * 104, display: "flex", alignItems: "center", gap: 22, padding: "16px 24px", borderRadius: 18, background: P.panel, border: `2px solid ${P.line}`, ...rise(f, 6 + i * 6, 30) }}>
          <span style={{ fontFamily: MONO, fontSize: 24, color: P.cyan, width: 60 }}>{n}</span>
          <span style={{ fontWeight: 800, fontSize: 34, flex: 1 }}>{t}</span>
          {s ? <span style={{ fontFamily: MONO, fontSize: 19, color: P.amber }}>{s}</span> : null}
          <span style={{ width: 46, height: 46, borderRadius: 12, background: f >= 12 + i * 6 ? P.green : "transparent", border: `3px solid ${P.green}`, color: P.bg, fontWeight: 800, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>{f >= 12 + i * 6 ? "✓" : ""}</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};
