import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CL, Mark, MONO, Paper, SANS, T, pop, rise } from "./kit";

// 32–37s: price (Rp29.000) + comment CTA ("komen BAB 2, nanti aku kirim linknya").
const WORD = "BAB 2";

export const CtaScene: React.FC = () => {
  const f = useCurrentFrame();
  const typed = WORD.slice(0, Math.max(0, Math.floor((f - 58) / 3)));
  const sent = f >= 82;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <div style={{ position: "absolute", left: 80, right: 80, top: 250, padding: "34px 38px", borderRadius: 34, background: T.ink, color: "#fff", boxShadow: "12px 12px 0 rgba(26,26,26,.12)", ...pop(f, 0) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Img src={staticFile("claude_logo.png")} style={{ width: 44, height: 44 }} />
          <span style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: "#BDB8AD" }}>SKILL THEORY MASTER · BAB 2</span>
        </div>
        <div style={{ fontWeight: 800, fontSize: 44, marginTop: 26, color: "#BDB8AD" }}>cuma</div>
        <div style={{ fontWeight: 800, fontSize: 168, letterSpacing: -7, lineHeight: 1, color: T.orange, scale: `${interpolate(f, [8, 20], [0.8, 1], CL)}`, transformOrigin: "0 50%" }}>Rp29.000</div>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 720, fontWeight: 800, fontSize: 84, letterSpacing: -3, lineHeight: 1.05, ...rise(f, 24) }}>
        Komen <Mark at={36}>“BAB 2”</Mark>
        <div style={{ fontSize: 46, color: T.mut, marginTop: 14, letterSpacing: -1 }}>nanti aku kirim linknya 👇</div>
      </div>
      {/* comment bar mock */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 1080, ...rise(f, 46) }}>
        {sent ? (
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 22, ...pop(f, 82) }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#D9D5CC" }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 24, color: T.mut }}>kamu · baru saja</div>
              <div style={{ fontWeight: 800, fontSize: 36 }}>BAB 2</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 34, color: "#E5484D", scale: `${interpolate(f, [92, 98, 104], [1, 1.4, 1], CL)}` }}>{f >= 92 ? "♥" : "♡"}</div>
          </div>
        ) : null}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderRadius: 999, background: "#fff", border: `2px solid ${T.line}` }}>
          <span style={{ flex: 1, fontSize: 30, fontWeight: 700, color: typed && !sent ? T.ink : "#B6B2A8" }}>{sent ? "Tambahkan komentar…" : typed || "Tambahkan komentar…"}</span>
          <span style={{ width: 58, height: 58, borderRadius: "50%", background: typed ? T.orange : "#EAD8CC", color: "#fff", fontWeight: 800, fontSize: 30, display: "flex", alignItems: "center", justifyContent: "center", scale: `${interpolate(f, [78, 81, 84], [1, 0.85, 1], CL)}` }}>↑</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", fontWeight: 800, fontSize: 34, ...rise(f, 100) }}>
        Follow <span style={{ color: T.orange }}>@researchq.id</span> buat skill riset lainnya
      </div>
    </AbsoluteFill>
  );
};
