import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Tap } from "../scopus/kit";
import { CL, DOC, EASE, Mark, MONO, Paper, SANS, T, pop, rise } from "../theory/kit";

// Problem Master (BAB 1) — Claude chat/screen UI style, 48s. Case: SMM (X1) + Online Customer Review (X2) → Keputusan
// Pembelian (Y), Gen Z TikTok Shop. Every number on screen is a real, named source (web-verified 11 Oct 2026,
// see NASKAH-PROBLEM-MASTER-BAB1.md). Problem Master is a QUANTITATIVE BAB 1 skill — the video never claims otherwise.

const RED = "#E5484D";

/* S1 · 0–4s hook */
export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const sw = f >= 62;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      {!sw ? (
        <>
          <div style={{ position: "absolute", left: 80, right: 80, top: 240, fontWeight: 800, fontSize: 120, letterSpacing: -5, lineHeight: 1.0 }}>
            <div style={{ scale: `${interpolate(f, [0, 6], [1.12, 1], { ...CL, easing: EASE })}`, transformOrigin: "0 50%" }}>Bingung buat</div>
            <div><Mark at={4}>BAB 1</Mark><span style={{ color: RED, display: "inline-block", rotate: `${Math.sin(f / 4) * 8}deg` }}>?</span></div>
          </div>
          <div style={{ position: "absolute", left: 150, top: 580, width: 780, height: 780, perspective: 1600 }}>
            <div style={{ position: "absolute", inset: 0, background: "#fff", border: `2px solid ${T.line}`, borderRadius: 10, padding: "60px 64px", boxShadow: "18px 18px 0 rgba(26,26,26,.07)", transform: `rotateX(${interpolate(f, [0, 20], [24, 8], { ...CL, easing: EASE })}deg) rotateZ(-2deg)`, fontFamily: DOC }}>
              <div style={{ textAlign: "center", fontWeight: 700, fontSize: 34 }}>BAB I<br />PENDAHULUAN</div>
              <div style={{ fontWeight: 700, fontSize: 26, marginTop: 34 }}>1.1 Latar Belakang</div>
              <div style={{ marginTop: 18, height: 34, width: 4, background: Math.floor(f / 8) % 2 === 0 ? T.ink : "transparent" }} />
              {[100, 92, 97, 60, 100, 88].map((w, i) => <div key={i} style={{ height: 13, width: `${w}%`, borderRadius: 5, border: "2px dashed #E3E0D8", marginTop: 22 }} />)}
            </div>
          </div>
          {([["Mulai dari mana?", 90, 620, -4, 10], ["Datanya dari mana?", 560, 760, 5, 18], ["Gap-nya apa?", 120, 960, 3, 26], ["Rumusan masalahnya?", 520, 1150, -5, 34]] as const).map(([t, x, y, r, at]) => (
            <div key={t} style={{ position: "absolute", left: x, top: y + Math.sin(f / 9 + at) * 6, padding: "18px 26px", borderRadius: 22, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 36, rotate: `${r}deg`, boxShadow: `8px 8px 0 ${T.orange}`, ...pop(f, at) }}>{t}</div>
          ))}
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: T.orange, opacity: interpolate(f, [62, 68], [0.9, 0], CL) }} />
          <div style={{ position: "absolute", left: 80, right: 80, top: 250, fontWeight: 800, fontSize: 88, letterSpacing: -4, lineHeight: 1.04, ...rise(f, 62) }}>
            Ada <Mark at={68}>1 skill</Mark> yang nyusun<br />BAB 1 lengkap<br /><span style={{ color: T.orange }}>+ data asli.</span>
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 690, padding: "38px 40px", borderRadius: 36, background: "#fff", border: `3px solid ${T.ink}`, boxShadow: `14px 14px 0 ${T.orange}`, display: "flex", alignItems: "center", gap: 30, ...pop(f, 72) }}>
            <Img src={staticFile("claude_logo.png")} style={{ width: 130, height: 130, rotate: `${interpolate(f, [72, 94], [-120, 0], { ...CL, easing: EASE })}deg` }} />
            <div>
              <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: T.orange }}>CLAUDE × SKILL RESEARCHQ</div>
              <div style={{ fontWeight: 800, fontSize: 86, letterSpacing: -4, lineHeight: 1 }}>Problem Master</div>
              <div style={{ fontWeight: 700, fontSize: 30, color: T.mut, marginTop: 6 }}>BAB 1 · penelitian kuantitatif</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 1060, display: "flex", flexWrap: "wrap", gap: 14, ...rise(f, 90) }}>
            {["Data per variabel", "Referensi Scopus", "Rumusan masalah", "Langsung ke Word"].map((t) => (
              <span key={t} style={{ padding: "12px 22px", borderRadius: 999, background: T.orangeS, color: "#B5470F", fontWeight: 800, fontSize: 30 }}>{t}</span>
            ))}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};

/* S2 · 4–14s: Claude screen demo */
const PROMPT = "Susun BAB 1: Pengaruh Social Media Marketing dan Online Customer Review terhadap Keputusan Pembelian Gen Z di TikTok Shop. Metode SEM-PLS.";
const Row: React.FC<{ at: number; done: number; t: string; res: string }> = ({ at, done, t, res }) => {
  const f = useCurrentFrame();
  const ok = f >= done;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 20, background: "#F6F3EC", border: `2px solid ${T.line}`, marginTop: 12, ...rise(f, at, 20) }}>
      <span style={{ width: 34, height: 34, borderRadius: "50%", border: `4px solid ${ok ? T.green : T.line}`, borderTopColor: ok ? T.green : T.orange, rotate: `${ok ? 0 : f * 18}deg`, background: ok ? T.green : "transparent", color: "#fff", fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{ok ? "✓" : ""}</span>
      <span style={{ flex: 1, fontWeight: 700, fontSize: 26 }}>{t}</span>
      <span style={{ fontFamily: MONO, fontSize: 18, color: ok ? T.green : T.mut }}>{ok ? res : "…"}</span>
    </div>
  );
};
export const S2Demo: React.FC = () => {
  const f = useCurrentFrame();
  const skillOn = f >= 44;
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - 64) * 1.9)));
  const home = 1 - interpolate(f, [148, 156], [0, 1], CL);
  const conv = interpolate(f, [154, 162], [0, 1], CL);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <div style={{ position: "absolute", left: 80, top: 176, display: "flex", alignItems: "center", gap: 16, ...rise(f, 0) }}>
        <span style={{ padding: "8px 16px", borderRadius: 12, background: T.ink, color: "#fff", fontFamily: MONO, fontSize: 22, letterSpacing: 2 }}>TUTORIAL</span>
        <span style={{ fontWeight: 800, fontSize: 40 }}>{f < 64 ? "Pilih skill Problem Master" : f < 150 ? "Tulis judul & metodenya" : "Claude kerja, kamu tinggal cek"}</span>
      </div>
      <div style={{ position: "absolute", left: 60, top: 300, width: 960, height: 1110, borderRadius: 48, background: "#FDFCF9", border: `2px solid ${T.line}`, overflow: "hidden", boxShadow: "14px 14px 0 rgba(26,26,26,.07)", translate: `0px ${interpolate(f, [0, 14], [1300, 0], { ...CL, easing: EASE })}px` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, borderBottom: "2px solid #EFECE4", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontWeight: 700, fontSize: 30, background: "#FDFCF9", zIndex: 2 }}>
          <Img src={staticFile("claude_logo.png")} style={{ width: 38, height: 38 }} />Claude
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: home }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontWeight: 800, fontSize: 56, letterSpacing: -1.5 }}>
            <Img src={staticFile("claude_logo.png")} style={{ width: 56, height: 56, verticalAlign: -8, marginRight: 14 }} />Mau nyusun apa hari ini?
          </div>
          <div style={{ position: "absolute", left: 46, right: 46, top: 400, height: 280, borderRadius: 34, background: "#fff", border: `2px solid ${T.line}` }}>
            <div style={{ position: "absolute", left: 32, right: 32, top: 26, fontSize: 28, lineHeight: 1.42, color: typed || skillOn ? T.ink : "#B6B2A8" }}>
              {skillOn ? <span style={{ display: "inline-block", padding: "2px 16px", borderRadius: 999, background: T.orangeS, color: "#B5470F", fontWeight: 800, fontSize: 24, marginRight: 10, scale: `${interpolate(f, [44, 52], [0.6, 1], CL)}` }}>✦ Problem Master</span> : null}
              {typed || (skillOn ? "" : "Tulis pesan…")}
              {f >= 64 && f < 146 && Math.floor(f / 8) % 2 === 0 ? <span style={{ borderLeft: `3px solid ${T.ink}`, marginLeft: 2 }} /> : null}
            </div>
            <div style={{ position: "absolute", left: 26, bottom: 24, width: 62, height: 62, borderRadius: "50%", border: `2.5px solid ${T.line}`, fontSize: 40, lineHeight: "54px", textAlign: "center", color: T.mut }}>+</div>
            <div style={{ position: "absolute", left: 104, bottom: 24, height: 62, padding: "0 20px", borderRadius: 999, display: "flex", alignItems: "center", fontSize: 23, fontWeight: 700, background: "#EEF7E8", color: T.green, scale: `${interpolate(f, [126, 132, 138], [1, 1.12, 1], CL)}` }}>🌐 Search ON</div>
            <div style={{ position: "absolute", right: 24, bottom: 24, width: 66, height: 66, borderRadius: "50%", background: typed.length > 20 ? T.clay : "#E7C3B5", color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: "64px", textAlign: "center" }}>↑</div>
          </div>
          <div style={{ position: "absolute", left: 46, top: 704, width: 600, borderRadius: 26, background: "#fff", border: `2px solid ${T.line}`, padding: "16px 12px", boxShadow: "10px 10px 0 rgba(26,26,26,.06)", opacity: interpolate(f, [18, 24, 50, 58], [0, 1, 1, 0], CL), translate: `0px ${interpolate(f, [18, 28], [-16, 0], { ...CL, easing: EASE })}px` }}>
            <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 2, color: T.mut, padding: "4px 14px 8px" }}>SKILL RESEARCHQ</div>
            {["Judul Generator", "Problem Master · BAB 1", "Theory Master · BAB 2", "Method Master · BAB 3"].map((s, i) => (
              <div key={s} style={{ height: 70, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", borderRadius: 16, fontSize: 28, fontWeight: 700, background: i === 1 && f >= 38 ? T.orangeS : "transparent" }}>
                <span style={{ color: T.orange }}>✦</span>{s}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, bottom: 0, opacity: conv, padding: "30px 40px" }}>
          <div style={{ marginLeft: "auto", maxWidth: 800, width: "fit-content", background: "#EFEBE3", borderRadius: "32px 32px 12px 32px", padding: "20px 24px", fontSize: 25, lineHeight: 1.4, ...rise(f, 156) }}>
            <span style={{ display: "inline-block", padding: "2px 14px", borderRadius: 999, background: T.orangeS, color: "#B5470F", fontWeight: 800, fontSize: 21, marginRight: 8 }}>✦ Problem Master</span>{PROMPT}
          </div>
          <div style={{ position: "relative", marginTop: 26, paddingLeft: 66 }}>
            <Img src={staticFile("claude_logo.png")} style={{ position: "absolute", left: 0, top: 8, width: 46, height: 46, rotate: `${interpolate(f, [162, 250], [0, 360], CL)}deg` }} />
            <Row at={164} done={182} t="Cari data fenomena (Search)" res="4 SUMBER" />
            <Row at={180} done={198} t="1 visual per variabel" res="Y · X1 · X2" />
            <Row at={196} done={216} t="Cek referensi Scopus 2022–2026" res="OPEN ACCESS" />
            <Row at={212} done={234} t="Susun 1.1–1.6 + bridging" res="SELESAI" />
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 16, padding: "18px 20px", borderRadius: 22, background: "#fff", border: `2px solid ${T.line}`, ...rise(f, 238, 30) }}>
              <div style={{ width: 70, height: 82, borderRadius: 14, background: T.word, color: "#fff", fontWeight: 800, fontSize: 42, display: "flex", alignItems: "center", justifyContent: "center" }}>W</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 27 }}>BAB1_Pendahuluan.docx</div>
                <div style={{ fontSize: 21, color: T.mut }}>Siap dibuka & diedit</div>
              </div>
              <div style={{ padding: "12px 24px", borderRadius: 999, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 24 }}>Buka</div>
            </div>
          </div>
        </div>
      </div>
      <Tap show={[12, 296]} path={[[12, 720, 1300], [16, 163, 925, true], [40, 306, 1165, true], [130, 300, 925, true], [146, 917, 925, true], [284, 880, 1076, true]]} />
    </AbsoluteFill>
  );
};

/* S3 · 14–20s: background flow, block by block */
const FLOW: [string, string, string][] = [
  ["01", "Fenomena umum", "ekonomi digital & e-commerce"],
  ["02", "Keputusan Pembelian", "Y"],
  ["03", "Social Media Marketing", "X1 → Y"],
  ["04", "Online Customer Review", "X2 → Y"],
  ["05", "X1 & X2 simultan", "diuji bersamaan"],
  ["06", "Objek: Gen Z TikTok Shop", "das sollen vs das sein"],
  ["07", "Research gap", "temuan belum konsisten"],
  ["08", "Urgensi", "kenapa harus sekarang"],
];
export const S3Flow: React.FC = () => {
  const f = useCurrentFrame();
  const act = Math.min(7, Math.floor(Math.max(0, f - 16) / 16));
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <div style={{ position: "absolute", left: 80, right: 80, top: 210, fontWeight: 800, fontSize: 80, letterSpacing: -3.5, lineHeight: 1.04, ...rise(f, 0) }}>
        Alurnya kayak<br /><Mark at={8}>tulisan peneliti</Mark>
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 440, ...rise(f, 6) }}>
        {FLOW.map(([n, t, s], i) => {
          const on = f >= 16 + i * 16;
          const cur = i === act && f < 16 + 8 * 16 + 10;
          const yv = t.includes("Keputusan") || t.includes("Marketing") || t.includes("Review");
          return (
            <div key={n}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 22px", borderRadius: 20, background: on ? (cur ? T.ink : "#fff") : "#F1EEE7", color: on && cur ? "#fff" : on ? T.ink : "#B6B2A8", border: `2px solid ${on ? T.ink : T.line}`, boxShadow: cur ? `8px 8px 0 ${T.orange}` : "none", scale: cur ? "1.03" : "1", transition: "none" }}>
                <span style={{ fontFamily: MONO, fontSize: 22, color: on ? T.orange : "#C9C4B9" }}>{n}</span>
                <span style={{ flex: 1, fontWeight: 800, fontSize: 32 }}>{t}</span>
                <span style={{ fontFamily: MONO, fontSize: 19, padding: yv ? "4px 10px" : 0, borderRadius: 8, background: yv && on ? T.orangeS : "transparent", color: on ? (cur ? "#FFD3B8" : yv ? "#B5470F" : T.mut) : "#C9C4B9" }}>{s}</span>
              </div>
              {i < 7 ? <div style={{ height: 14, marginLeft: 40, borderLeft: `3px ${f >= 24 + i * 16 ? "solid" : "dashed"} ${f >= 24 + i * 16 ? T.orange : T.line}` }} /> : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1330, display: "flex", gap: 12, flexWrap: "wrap", ...rise(f, 150) }}>
        {["Bridging antar blok", "Tiap klaim ada data", "Bebas emoji"].map((t) => <span key={t} style={{ padding: "10px 18px", borderRadius: 999, background: T.greenS, color: T.green, fontWeight: 800, fontSize: 25 }}>✓ {t}</span>)}
      </div>
    </AbsoluteFill>
  );
};

/* S4 · 20–30s: one visual per variable, inside the Word document */
const FIG_H = 600;
const Fig: React.FC<{ n: string; tag: string; title: string; src: string; at: number; children: React.ReactNode }> = ({ n, tag, title, src, children }) => (
  <div style={{ height: FIG_H, padding: "26px 0 0", borderTop: "2px dashed #E6E2D9" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ padding: "4px 12px", borderRadius: 8, background: T.orange, color: "#fff", fontFamily: MONO, fontSize: 18 }}>{tag}</span>
      <span style={{ fontFamily: DOC, fontWeight: 700, fontSize: 26 }}>{title}</span>
    </div>
    <div style={{ position: "relative", height: 400, marginTop: 18 }}>{children}</div>
    <div style={{ fontFamily: DOC, fontSize: 22, textAlign: "center", fontWeight: 700 }}>Gambar {n}</div>
    <div style={{ fontFamily: DOC, fontSize: 19, textAlign: "center", color: "#555", marginTop: 4 }}>Sumber: {src}</div>
  </div>
);
const HBar: React.FC<{ lf: number; at: number; label: string; v: number; txt: string; hi?: boolean }> = ({ lf, at, label, v, txt, hi }) => {
  const p = interpolate(lf, [at, at + 20], [0, 1], { ...CL, easing: EASE });
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 800, fontSize: 26 }}><span>{label}</span><span style={{ color: hi ? T.orange : T.ink }}>{txt}</span></div>
      <div style={{ height: 40, marginTop: 8, borderRadius: 8, background: "#F1EEE7" }}><div style={{ height: "100%", width: `${v * p}%`, borderRadius: 8, background: hi ? T.orange : "#3A3A3A" }} /></div>
    </div>
  );
};
const STOPS = [18, 90, 162, 234];
export const S4Data: React.FC = () => {
  const f = useCurrentFrame();
  const k = STOPS.filter((s) => f >= s - 14).length - 1;
  const y = interpolate(f, [0, 14, 76, 90, 148, 162, 220, 234], [0, -240, -240, -240 - FIG_H, -240 - FIG_H, -240 - FIG_H * 2, -240 - FIG_H * 2, -240 - FIG_H * 3], { ...CL, easing: Easing.inOut(Easing.cubic) });
  const lf = (i: number) => f - STOPS[i];
  const notes = ["Fenomena umum", "Data Y · Keputusan Pembelian", "Data X1 · Social Media Marketing", "Data X2 · Online Customer Review"];
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <div style={{ position: "absolute", left: 80, right: 80, top: 176, fontWeight: 800, fontSize: 64, letterSpacing: -2.5, lineHeight: 1.05, ...rise(f, 0) }}>
        Tiap variabel, <Mark at={8}>datanya sendiri</Mark>
      </div>
      <div style={{ position: "absolute", left: 60, top: 330, width: 960, height: 1070, perspective: 2200 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 30, overflow: "hidden", border: `2px solid ${T.line}`, background: "#E9E7E2", boxShadow: "14px 14px 0 rgba(26,26,26,.07)", transform: `rotateX(${interpolate(f, [0, 16], [16, 4], { ...CL, easing: EASE })}deg) rotateY(${Math.sin(f / 40) * 2}deg)`, transformOrigin: "50% 0%" }}>
          <div style={{ height: 76, background: T.word, color: "#fff", display: "flex", alignItems: "center", gap: 14, padding: "0 26px", fontWeight: 700, fontSize: 25, position: "relative", zIndex: 2 }}>
            <span style={{ width: 40, height: 40, borderRadius: 8, background: "#fff", color: T.word, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>W</span>BAB1_Pendahuluan.docx
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 18, opacity: 0.8 }}>Gambar {k + 1}/4</span>
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 110, translate: `0px ${y}px` }}>
            <div style={{ background: "#fff", padding: "46px 56px 400px", color: "#111" }}>
              <div style={{ fontFamily: DOC, fontWeight: 700, fontSize: 34, textAlign: "center" }}>BAB I<br />PENDAHULUAN</div>
              <div style={{ fontFamily: DOC, fontWeight: 700, fontSize: 28, marginTop: 26 }}>1.1 Latar Belakang</div>
              <div style={{ fontFamily: DOC, fontSize: 23, lineHeight: 1.6, marginTop: 10, color: "#333", filter: "blur(3px)" }}>Perkembangan ekonomi digital di Indonesia mendorong perubahan pola belanja konsumen, terutama generasi muda yang semakin aktif bertransaksi melalui platform media sosial.</div>
              <Fig n="1.1" tag="FENOMENA" title="Nilai Ekonomi Digital Indonesia 2024 (GMV)" src="e-Conomy SEA 2024 (Google, Temasek, Bain & Company)" at={STOPS[0]}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 90, height: 380 }}>
                  {[["Ekonomi digital", 90, "US$90 M"], ["E-commerce", 65, "US$65 M"]].map(([l, v, t], i) => {
                    const p = interpolate(lf(0), [6 + i * 6, 28 + i * 6], [0, 1], { ...CL, easing: EASE });
                    return (
                      <div key={l as string} style={{ textAlign: "center", fontFamily: SANS }}>
                        <div style={{ fontWeight: 800, fontSize: 40, color: i ? T.orange : T.ink, opacity: p }}>{t}</div>
                        <div style={{ width: 170, height: (v as number) * 3.1 * p, borderRadius: "10px 10px 0 0", background: i ? T.orange : "#3A3A3A", marginTop: 10 }} />
                        <div style={{ fontWeight: 700, fontSize: 24, marginTop: 10 }}>{l}</div>
                      </div>
                    );
                  })}
                </div>
              </Fig>
              <Fig n="1.2" tag="Y" title="Platform Social Commerce yang Paling Sering Dipakai" src="Populix (2022), The Social Commerce Landscape in Indonesia, n = 1.020" at={STOPS[1]}>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, color: T.mut }}>86% responden pernah belanja lewat media sosial</div>
                <HBar lf={lf(1)} at={6} label="TikTok Shop" v={45 / 0.5} txt="45%" hi />
                <HBar lf={lf(1)} at={12} label="WhatsApp" v={21 / 0.5} txt="21%" />
                <HBar lf={lf(1)} at={18} label="Facebook / Instagram Shop" v={10 / 0.5} txt="10%" />
              </Fig>
              <Fig n="1.3" tag="X1" title="Gen Z dan Live Shopping" src="Jakpat (2024, semester 2), n = 2.474" at={STOPS[2]}>
                <div style={{ display: "flex", gap: 30, justifyContent: "center", alignItems: "center", height: 380, fontFamily: SANS }}>
                  <div style={{ textAlign: "center", ...pop(lf(2), 4) }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 40px)", gap: 10, justifyContent: "center" }}>
                      {Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ width: 40, height: 40, borderRadius: "50%", background: i < 9 && lf(2) >= 6 + i * 2 ? T.orange : "#E3E0D8" }} />)}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 44, marginTop: 20 }}>9 dari 10</div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: T.mut }}>Gen Z pernah nonton live shopping</div>
                  </div>
                  <div style={{ width: 2, height: 260, background: T.line }} />
                  <div style={{ textAlign: "center", ...pop(lf(2), 20) }}>
                    <div style={{ fontWeight: 800, fontSize: 110, letterSpacing: -4, color: T.orange }}>62%</div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: T.mut }}>di antaranya bertransaksi</div>
                  </div>
                </div>
              </Fig>
              <Fig n="1.4" tag="X2" title="Peran Ulasan Online sebelum Membeli" src="Accenture (2023), survei konsumen Indonesia" at={STOPS[3]}>
                <HBar lf={lf(3)} at={6} label="Riset produk online sebelum membeli" v={91.2} txt="91,2%" hi />
                <HBar lf={lf(3)} at={14} label="Terpengaruh likes & komentar positif" v={86} txt="86%" hi />
              </Fig>
            </div>
          </div>
        </div>
      </div>
      {STOPS.map((s, i) => (
        <div key={s} style={{ position: "absolute", right: 40, top: 1180, padding: "14px 20px", borderRadius: 14, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 26, rotate: "2deg", boxShadow: `8px 8px 0 ${T.orange}`, opacity: interpolate(f, [s + 8, s + 12, s + 58, s + 64], [0, 1, 1, 0], CL), scale: `${interpolate(f, [s + 8, s + 18], [0.7, 1], { ...CL, easing: Easing.bezier(0.34, 1.56, 0.64, 1) })}` }}>✓ {notes[i]}</div>
      ))}
    </AbsoluteFill>
  );
};

/* S5 · 30–34s: complete through rumusan masalah */
export const S5Done: React.FC = () => {
  const f = useCurrentFrame();
  const items: [string, string][] = [["1.1", "Latar Belakang"], ["1.2", "Identifikasi Masalah"], ["1.3", "Batasan Masalah"], ["1.4", "Rumusan Masalah"], ["1.5", "Tujuan Penelitian"], ["1.6", "Manfaat Penelitian"], ["APA", "Daftar Pustaka"], ["W", "File Word siap edit"]];
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <div style={{ position: "absolute", left: 80, right: 80, top: 210, fontWeight: 800, fontSize: 84, letterSpacing: -3.5, lineHeight: 1.03, ...rise(f, 0) }}>
        Lengkap sampai<br /><Mark at={8}>rumusan masalah</Mark>
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 460, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {items.map(([n, t], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, padding: "24px 22px", borderRadius: 24, background: i === 3 ? T.ink : "#fff", color: i === 3 ? "#fff" : T.ink, border: `2px solid ${i === 3 ? T.ink : T.line}`, boxShadow: i === 3 ? `8px 8px 0 ${T.orange}` : "8px 8px 0 rgba(26,26,26,.05)", ...pop(f, 10 + i * 6) }}>
            <span style={{ minWidth: 70, height: 56, padding: "0 10px", borderRadius: 14, background: n === "W" ? T.word : i === 3 ? T.orange : T.orangeS, color: n === "W" || i === 3 ? "#fff" : "#B5470F", fontFamily: MONO, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
            <span style={{ fontWeight: 800, fontSize: 28, lineHeight: 1.15 }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1080, padding: "22px 26px", borderRadius: 22, background: "#fff", border: `2px dashed ${T.orange}`, fontFamily: DOC, fontSize: 25, lineHeight: 1.5, ...rise(f, 64) }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: T.orange, marginBottom: 6 }}>CONTOH RUMUSAN MASALAH</div>
        1. Apakah Social Media Marketing berpengaruh terhadap Keputusan Pembelian Gen Z di TikTok Shop?
      </div>
    </AbsoluteFill>
  );
};

/* S6 · 34–40s: 3D phone scrolls the YouTube channel and stops on the BAB 1 tutorial */
const SCREEN_W = 560, SCREEN_H = 1000, STRIP_H = 2487 * (SCREEN_W / 720);
const ROW = { top: 361 * (SCREEN_W / 720), bot: 513 * (SCREEN_W / 720) };
export const S6Youtube: React.FC = () => {
  const f = useCurrentFrame();
  const start = -(STRIP_H - SCREEN_H), end = 0;
  const p = interpolate(f, [16, 92], [0, 1], { ...CL, easing: Easing.bezier(0.12, 0.75, 0.15, 1) });
  const yy = start + (end - start) * p;
  const vel = Math.abs(interpolate(f, [16, 92], [0, 1], CL) - interpolate(f - 1, [16, 92], [0, 1], CL)) * (end - start) * (1 - p) * 2.4;
  const hl = interpolate(f, [96, 104], [0, 1], CL);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      <div style={{ position: "absolute", left: 80, right: 80, top: 200, fontWeight: 800, fontSize: 80, letterSpacing: -3.5, lineHeight: 1.04, ...rise(f, 0) }}>
        Tutorial lengkapnya<br /><Mark at={8}>ada di YouTube</Mark>
      </div>
      <div style={{ position: "absolute", left: 260, top: 430, width: SCREEN_W + 40, height: SCREEN_H + 40, perspective: 2000 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 70, background: "#111", border: "3px solid #2A2A2A", padding: 20, boxShadow: "20px 24px 0 rgba(26,26,26,.12)", transform: `rotateY(${interpolate(f, [0, 30], [-38, -16], { ...CL, easing: EASE }) + interpolate(f, [100, 180], [0, 6], CL)}deg) rotateX(${interpolate(f, [0, 30], [18, 7], { ...CL, easing: EASE })}deg) translateY(${interpolate(f, [0, 22], [900, 0], { ...CL, easing: EASE })}px)` }}>
          <div style={{ position: "relative", width: SCREEN_W, height: SCREEN_H, borderRadius: 52, overflow: "hidden", background: "#0F0F0F" }}>
            <Img src={staticFile("problem/yt-strip.jpg")} style={{ position: "absolute", left: 0, top: 0, width: SCREEN_W, translate: `0px ${yy}px`, filter: `blur(${Math.min(6, vel / 6)}px)` }} />
            <div style={{ position: "absolute", left: 10, right: 10, top: ROW.top - 6, height: ROW.bot - ROW.top + 12, borderRadius: 18, border: `5px solid ${T.orange}`, opacity: hl }} />
            <div style={{ position: "absolute", left: 150, top: (ROW.top + ROW.bot) / 2 - 38, width: 76, height: 76, borderRadius: "50%", background: "rgba(255,255,255,.3)", border: "4px solid #fff", opacity: interpolate(f, [104, 110, 130, 140], [0, 1, 1, 0], CL), scale: `${interpolate(f, [110, 114, 118], [1, 0.8, 1], CL)}` }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, top: 1130, width: 460, padding: "18px 22px", borderRadius: 18, background: "#fff", border: `3px solid ${T.ink}`, boxShadow: `8px 8px 0 ${T.orange}`, ...pop(f, 106) }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: T.orange, letterSpacing: 2 }}>▶ TONTON FULL · 12:44</div>
        <div style={{ fontWeight: 800, fontSize: 28, marginTop: 8, lineHeight: 1.25 }}>Full Tutorial! Judul Sampai Bab 1 Dengan Claude AI!</div>
        <div style={{ fontWeight: 700, fontSize: 22, color: T.mut, marginTop: 6 }}>YouTube · NotYourLecture</div>
      </div>
    </AbsoluteFill>
  );
};

/* S7 · 40–48s: price + comment CTAs */
const CommentBox: React.FC<{ at: number; word: string }> = ({ at, word }) => {
  const f = useCurrentFrame();
  const typed = word.slice(0, Math.max(0, Math.floor((f - at) / 3)));
  const sent = f >= at + word.length * 3 + 8;
  return (
    <div>
      {sent ? (
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, ...pop(f, at + word.length * 3 + 8) }}>
          <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#D9D5CC" }} />
          <div><div style={{ fontWeight: 700, fontSize: 22, color: T.mut }}>kamu · baru saja</div><div style={{ fontWeight: 800, fontSize: 36 }}>{word}</div></div>
          <div style={{ marginLeft: "auto", fontSize: 34, color: RED }}>♥</div>
        </div>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderRadius: 999, background: "#fff", border: `2px solid ${T.line}` }}>
        <span style={{ flex: 1, fontSize: 28, fontWeight: 700, color: typed && !sent ? T.ink : "#B6B2A8" }}>{sent ? "Tambahkan komentar…" : typed || "Tambahkan komentar…"}</span>
        <span style={{ width: 54, height: 54, borderRadius: "50%", background: typed ? T.orange : "#EAD8CC", color: "#fff", fontWeight: 800, fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>↑</span>
      </div>
    </div>
  );
};
export const S7Cta: React.FC = () => {
  const f = useCurrentFrame();
  const b = f >= 128;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: T.ink }}>
      <Paper />
      {!b ? (
        <>
          <div style={{ position: "absolute", left: 80, right: 80, top: 210, fontWeight: 800, fontSize: 64, letterSpacing: -2.5, ...rise(f, 0) }}>Skill Problem Master</div>
          <div style={{ position: "absolute", left: 80, top: 300, display: "flex", alignItems: "center", gap: 24, ...pop(f, 8) }}>
            <span style={{ fontWeight: 800, fontSize: 64, color: T.mut }}>cuma</span>
            <span style={{ padding: "6px 34px 14px", borderRadius: 30, background: T.orange, color: "#fff", fontWeight: 800, fontSize: 150, letterSpacing: -6, boxShadow: `12px 12px 0 ${T.ink}`, rotate: "-2deg" }}>Rp29.000</span>
          </div>
          <div style={{ position: "absolute", left: 80, right: 80, top: 560, fontWeight: 800, fontSize: 92, letterSpacing: -4, lineHeight: 1.02, ...rise(f, 24) }}>
            Mau? Komen<br /><Mark at={32}>“BAB1”</Mark>
            <div style={{ fontSize: 46, color: T.mut, marginTop: 16, letterSpacing: -1.5 }}>nanti aku send link-nya 👇</div>
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 980, ...rise(f, 36) }}><CommentBox at={46} word="BAB1" /></div>
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: T.ink, opacity: interpolate(f, [128, 134], [0.9, 0], CL) }} />
          <div style={{ position: "absolute", left: 80, right: 80, top: 210, fontWeight: 800, fontSize: 70, letterSpacing: -3, lineHeight: 1.05, ...rise(f, 128) }}>
            Mau paket hemat?<br />Komen <Mark at={136}>“GENESIS”</Mark>
          </div>
          <div style={{ position: "absolute", left: 140, top: 470, width: 800, height: 440 }}>
            {[3, 2, 1, 0].map((i) => (
              <div key={i} style={{ position: "absolute", left: i * 34, top: i * 30, width: 640, height: 300, borderRadius: 30, background: i === 0 ? "#fff" : ["#fff", "#FFF4EC", "#FFE9DA", "#FFE1CF"][i], border: `3px solid ${T.ink}`, boxShadow: "10px 10px 0 rgba(26,26,26,.08)", padding: "30px 34px", ...pop(f, 140 + (3 - i) * 6), rotate: `${(i - 1.5) * 1.5}deg` }}>
                {i === 0 ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Img src={staticFile("claude_logo.png")} style={{ width: 60, height: 60 }} /><span style={{ fontFamily: MONO, fontSize: 20, color: T.orange, letterSpacing: 2 }}>PAKET GENESIS</span></div>
                    <div style={{ fontWeight: 800, fontSize: 64, letterSpacing: -3, marginTop: 14 }}>4 skill</div>
                    <div style={{ fontWeight: 700, fontSize: 30, color: T.mut, marginTop: 6 }}>biar workflow BAB 1 makin kuat</div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 990, ...rise(f, 160) }}><CommentBox at={168} word="GENESIS" /></div>
        </>
      )}
    </AbsoluteFill>
  );
};
