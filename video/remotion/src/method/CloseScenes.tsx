import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CL, Mark, MONO, Paper, SANS, T, pop, rise } from "../theory/kit";

// 22.3–26.3s: why Method Master (all from the skill file). 26.3–30s: comment CTA.
const PERKS = [
  ["∀", "jurusan apa pun", "Jalur survei kuantitatif & eksperimen lab"],
  ["n", "rumus sampel lengkap", "Slovin · Cochran · Krejcie-Morgan · Isaac-Michael · rule SEM"],
  ["⚙", "SPSS atau SmartPLS", "Uji & threshold sesuai alat analisis"],
  ["↔", "konsisten BAB 1–2", "Baca BAB 2 yang kamu upload"],
];

export const PerksScene: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <div style={{ position: "absolute", left: 80, right: 80, top: 230, fontWeight: 800, fontSize: 92, letterSpacing: -4, lineHeight: 1.02, ...rise(f, 0) }}>
        Kenapa<br /><Mark at={8}>Method Master?</Mark>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 520, display: "flex", flexDirection: "column", gap: 20 }}>
        {PERKS.map(([n, t, s], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 26, padding: "24px 28px", borderRadius: 28, background: i === 0 ? T.ink : "#fff", color: i === 0 ? "#fff" : T.ink, border: `2px solid ${i === 0 ? T.ink : T.line}`, boxShadow: "10px 10px 0 rgba(26,26,26,.07)", ...pop(f, 10 + i * 8) }}>
            <div style={{ width: 96, height: 96, borderRadius: 24, background: i === 0 ? T.orange : T.orangeS, color: i === 0 ? "#fff" : T.orange, fontWeight: 800, fontSize: 52, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{n}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 40, lineHeight: 1.1 }}>{t}</div>
              <div style={{ fontSize: 23, marginTop: 6, color: i === 0 ? "#BDB8AD" : T.mut, lineHeight: 1.3 }}>{s}</div>
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const typed = "BAB 3".slice(0, Math.max(0, Math.floor((f - 34) / 3)));
  const sent = f >= 56;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <div style={{ position: "absolute", left: 80, right: 80, top: 300, fontWeight: 800, fontSize: 120, letterSpacing: -5, lineHeight: 1.02, ...rise(f, 0) }}>
        Komen<br /><Mark at={10}>“BAB 3”</Mark>
        <div style={{ fontSize: 52, color: T.mut, marginTop: 20, letterSpacing: -1.5 }}>nanti aku kirim link-nya 👇</div>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 900, ...rise(f, 16) }}>
        {sent ? (
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 22, ...pop(f, 56) }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#D9D5CC" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 24, color: T.mut }}>kamu · baru saja</div>
              <div style={{ fontWeight: 800, fontSize: 38 }}>BAB 3</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 36, color: "#E5484D", scale: `${interpolate(f, [66, 72, 78], [1, 1.4, 1], CL)}` }}>{f >= 66 ? "♥" : "♡"}</div>
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderRadius: 999, background: "#fff", border: `2px solid ${T.line}` }}>
          <span style={{ flex: 1, fontSize: 30, fontWeight: 700, color: typed && !sent ? T.ink : "#B6B2A8" }}>{sent ? "Tambahkan komentar…" : typed || "Tambahkan komentar…"}</span>
          <span style={{ width: 58, height: 58, borderRadius: "50%", background: typed ? T.orange : "#EAD8CC", color: "#fff", fontWeight: 800, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", scale: `${interpolate(f, [52, 55, 58], [1, 0.85, 1], CL)}` }}>↑</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontWeight: 800, fontSize: 34, ...rise(f, 70) }}>
        Follow <span style={{ color: T.orange }}>@researchq.id</span> · seri BAB 1 → BAB 3
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1310, textAlign: "center", fontFamily: MONO, fontSize: 20, color: T.mut, ...rise(f, 76) }}>PROBLEM MASTER · THEORY MASTER · METHOD MASTER</div>
    </AbsoluteFill>
  );
};
