import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Mark, MONO, Paper, SANS, T, pop, rise } from "./kit";

// 26.3–32s: why Theory Master for BAB 2 (all taken from the skill itself).
const PERKS = [
  ["5", "jenis penelitian", "Kuanti · kuali · mixed · R&D · SLR"],
  ["6", "gaya sitasi", "APA · MLA · Chicago · Harvard · Vancouver · IEEE"],
  ["OA", "referensi open access", "Semua bisa dibuka gratis"],
  ["◇", "kerangka pemikiran visual", "Diagram + hipotesis sinkron"],
  ["✓", "nggak ngarang sitasi", "Kutipan 'dalam' ditulis benar"],
  ["W", "langsung jadi Word", "Daftar pustaka + link klik"],
];

export const PerksScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <div style={{ position: "absolute", left: 80, right: 80, top: 230, fontWeight: 800, fontSize: 92, letterSpacing: -4, lineHeight: 1.02, ...rise(f, 0) }}>
        Kenapa<br /><Mark at={10}>Theory Master?</Mark>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 520, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        {PERKS.map(([n, t, s], i) => (
          <div key={t} style={{ height: 270, padding: "26px 26px", borderRadius: 28, background: i === 0 ? T.ink : "#fff", color: i === 0 ? "#fff" : T.ink, border: `2px solid ${i === 0 ? T.ink : T.line}`, boxShadow: "10px 10px 0 rgba(26,26,26,.07)", ...pop(f, 14 + i * 9) }}>
            <div style={{ fontWeight: 800, fontSize: 76, letterSpacing: -3, color: T.orange, lineHeight: 1 }}>{n}</div>
            <div style={{ fontWeight: 800, fontSize: 36, marginTop: 12, lineHeight: 1.1 }}>{t}</div>
            <div style={{ fontSize: 22, marginTop: 10, color: i === 0 ? "#BDB8AD" : T.mut, lineHeight: 1.35 }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1440, textAlign: "center", fontFamily: MONO, fontSize: 20, color: T.mut, ...rise(f, 80) }}>BAHASA INDONESIA ATAU INGGRIS · S1 · S2 · S3</div>
    </AbsoluteFill>
  );
};
