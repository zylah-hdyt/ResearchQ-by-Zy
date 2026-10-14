import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CL, EASE, Mark, MONO, SANS, T, pop, rise } from "../theory/kit";
import { Guy } from "./Guy";

// Storytelling scenes for "Claude sekarang ada watermark" (30s). Flat vector, warm palette, no glow.
export const BG = "#F6EFE4";
export const Footer: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 80, bottom: 62, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: T.ink }}>ResearchQ<span style={{ color: T.orange }}>.</span></div>
    <div style={{ position: "absolute", right: 80, bottom: 68, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: T.mut }}>@RESEARCHQ.ID</div>
  </>
);
export const Title: React.FC<{ at?: number; top?: number; size?: number; children: React.ReactNode }> = ({ at = 0, top = 230, size = 86, children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: 70, right: 70, top, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -3.5, lineHeight: 1.04, color: T.ink, ...rise(f, at) }}>{children}</div>;
};

// Night bedroom (kos): wall, window with moon, poster, bed, floor.
export const Room: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: "#E4D3BC" }} />
    <div style={{ position: "absolute", left: 640, top: 560, width: 320, height: 380, borderRadius: 18, background: "#2E3A5C", border: "16px solid #FFFFFF" }}>
      <div style={{ position: "absolute", left: 180, top: 50, width: 70, height: 70, borderRadius: "50%", background: "#FCEBB6" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 12, background: "#fff" }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, left: "50%", width: 12, background: "#fff" }} />
    </div>
    <div style={{ position: "absolute", left: 110, top: 610, width: 190, height: 250, borderRadius: 10, background: T.orange, rotate: "-4deg" }}>
      <div style={{ margin: 22, height: 110, borderRadius: 8, background: "#FBE3D2" }} />
      <div style={{ marginLeft: 22, width: 120, height: 14, borderRadius: 7, background: "#FBE3D2" }} />
    </div>
    <div style={{ position: "absolute", left: -40, right: -40, top: 1220, height: 140, borderRadius: 30, background: "#7A9CC6" }} />
    <div style={{ position: "absolute", left: 60, top: 1180, width: 260, height: 90, borderRadius: 40, background: "#fff" }} />
  </AbsoluteFill>
);
// Desk scene: wall + desk top.
export const Desk: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1180, bottom: 0, background: "#B98552" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1180, height: 24, background: "#A3713F" }} />
    <div style={{ position: "absolute", left: 820, top: 1060, width: 110, height: 130, borderRadius: "10px 10px 26px 26px", background: "#fff", border: "6px solid #2B2420" }}>
      <div style={{ position: "absolute", right: -40, top: 24, width: 40, height: 56, border: "6px solid #2B2420", borderLeft: "none", borderRadius: "0 26px 26px 0" }} />
    </div>
  </AbsoluteFill>
);
const Laptop: React.FC<{ left: number; top: number; w: number; h: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ left, top, w, h, children, style }) => (
  <div style={{ position: "absolute", left, top, width: w, ...style }}>
    <div style={{ height: h, borderRadius: 24, background: "#2B2420", padding: 16 }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 12, background: "#fff", overflow: "hidden" }}>{children}</div>
    </div>
    <div style={{ height: 30, margin: "0 -40px", borderRadius: "0 0 24px 24px", background: "#4A403A" }} />
  </div>
);

/* S1 · 0–3s: notification "Claude sekarang menandai teks dengan watermark" → shock */
export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const shock = f >= 14;
  const jump = shock ? interpolate(f, [14, 20, 28], [0, -60, 0], { ...CL, easing: EASE }) : 0;
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Room />
      <div style={{ position: "absolute", left: 60, right: 60, top: 230, padding: "26px 30px", borderRadius: 30, background: "#fff", boxShadow: "10px 10px 0 rgba(43,36,32,.12)", border: "3px solid #2B2420", ...pop(f, 0) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontSize: 22, color: T.mut, letterSpacing: 1 }}>
          <Img src={staticFile("claude_logo.png")} style={{ width: 36, height: 36 }} /> BERITA · BARU SAJA
        </div>
        <div style={{ fontWeight: 800, fontSize: 46, lineHeight: 1.18, marginTop: 12, color: T.ink }}>Claude sekarang menandai teks dengan <Mark at={8}>watermark</Mark> tak terlihat</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", ...pop(f, 16), rotate: "-3deg" }}><span style={{ display: "inline-block", padding: "6px 34px 14px", borderRadius: 26, background: "#fff", border: "5px solid #2B2420", boxShadow: "10px 10px 0 rgba(43,36,32,.15)", fontWeight: 800, fontSize: 100, letterSpacing: -4, color: "#E5484D" }}>ADA WATERMARK?!</span></div>
      <Guy expr={shock ? "shock" : "neutral"} armR={shock ? 150 : 128} armL={10} style={{ left: 240, top: 720 + jump, width: 520, height: 780 }} />
      <div style={{ position: "absolute", left: 640, top: 900 + jump * 1.6, width: 120, height: 210, borderRadius: 22, background: "#2B2420", border: "6px solid #2B2420", rotate: shock ? `${interpolate(f, [14, 30], [0, 24], CL)}deg` : "0deg" }}>
        <div style={{ margin: 8, height: 180, borderRadius: 14, background: "#FFE1CF" }} />
      </div>
      {shock ? ["!", "!"].map((s, i) => <div key={i} style={{ position: "absolute", left: 300 + i * 380, top: 760, fontWeight: 800, fontSize: 110, color: T.orange, ...pop(f, 16 + i * 3), rotate: `${i ? 14 : -14}deg` }}>{s}</div>) : null}
      <Footer />
    </AbsoluteFill>
  );
};

/* S2 · 3–5.7s: panic search "cara hapus watermark claude" */
export const S2Search: React.FC = () => {
  const f = useCurrentFrame();
  const q = "cara hapus watermark claude";
  const typed = q.slice(0, Math.floor(interpolate(f, [4, 34], [0, q.length], CL)));
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Desk />
      <Title at={0} top={220}>Langsung panik,<br /><span style={{ color: "#E5484D" }}>nyari cara ngapusnya?</span></Title>
      <Laptop left={90} top={470} w={900} h={540}>
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 22px", borderRadius: 999, border: "3px solid #DADCE0", fontSize: 30, color: T.ink }}>
            🔍 <span>{typed}</span>{Math.floor(f / 7) % 2 === 0 && f < 40 ? <span style={{ borderLeft: "3px solid #2B2420", height: 32 }} /> : null}
          </div>
          {["🔥 Tools hapus karakter tersembunyi!", "Watermark remover GRATIS 100%", "Cara bypass watermark AI (works!)"].map((t, i) => (
            <div key={t} style={{ marginTop: 22, ...rise(f, 38 + i * 7, 16) }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1A0DAB" }}>{t}</div>
              <div style={{ height: 12, width: `${80 - i * 10}%`, borderRadius: 6, background: "#E8E8E8", marginTop: 10 }} />
            </div>
          ))}
        </div>
      </Laptop>
      <Footer />
    </AbsoluteFill>
  );
};

/* S3 · 5.7–10s: myth busted — no hidden characters; remover tools crossed out */
export const S3Myth: React.FC = () => {
  const f = useCurrentFrame();
  const mx = interpolate(f, [10, 60], [120, 700], { ...CL, easing: EASE });
  return (
    <AbsoluteFill style={{ fontFamily: SANS, background: BG }}>
      <Title at={0}>Tenang. <Mark at={10}>Bukan</Mark><br />karakter tersembunyi.</Title>
      <div style={{ position: "absolute", left: 80, right: 80, top: 500, padding: "34px 38px", borderRadius: 24, background: "#fff", border: "3px solid #2B2420", fontFamily: "Tinos", fontSize: 32, lineHeight: 1.6, color: "#333" }}>
        Media sosial kini ikut membentuk keputusan pembelian generasi muda, terutama lewat ulasan dan konten kreator…
      </div>
      <div style={{ position: "absolute", left: mx, top: 470, width: 230, height: 230, borderRadius: "50%", border: "16px solid #2B2420", background: "rgba(255,225,207,.35)" }}>
        <div style={{ position: "absolute", right: -70, bottom: -60, width: 110, height: 28, borderRadius: 14, background: "#2B2420", rotate: "45deg" }} />
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 790, display: "flex", alignItems: "center", gap: 16, fontFamily: MONO, fontSize: 28, color: T.ink, ...rise(f, 50) }}>
        KARAKTER TERSEMBUNYI: <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 56, color: T.green }}>0</span>
      </div>
      {["Hapus karakter tersembunyi", "Watermark remover", "Bypass AI watermark"].map((t, i) => (
        <div key={t} style={{ position: "absolute", left: 80, right: 200, top: 920 + i * 130, padding: "20px 26px", borderRadius: 20, background: "#fff", border: "3px solid #2B2420", fontWeight: 800, fontSize: 32, color: T.ink, ...rise(f, 60 + i * 6, 20) }}>
          {t}
          <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 8, background: "#E5484D", borderRadius: 4, transformOrigin: "0 50%", scale: `${interpolate(f, [76 + i * 10, 84 + i * 10], [0, 1], CL)} 1`, rotate: "-3deg" }} />
          <span style={{ position: "absolute", right: -70, top: 4, fontSize: 52, color: "#E5484D", opacity: interpolate(f, [80 + i * 10, 84 + i * 10], [0, 1], CL) }}>✗</span>
        </div>
      ))}
      <Footer />
    </AbsoluteFill>
  );
};

/* S4 · 10–14.3s: it's a statistical pattern in word choice, for transparency */
const WORDS = ["media", "sosial", "membentuk", "keputusan", "pembelian", "generasi", "ulasan", "konten", "kreator", "muda", "terutama", "lewat"];
export const S4Explain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS, background: BG }}>
      <Title at={0}>Watermark-nya =<br /><Mark at={10}>pola pilihan kata</Mark></Title>
      {WORDS.map((w, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const p = interpolate(f, [16 + i * 2, 50 + i * 2], [0, 1], { ...CL, easing: EASE });
        const x0 = 100 + ((i * 173) % 760), y0 = 520 + ((i * 97) % 380);
        const x1 = 150 + col * 210, y1 = 560 + row * 130;
        return (
          <div key={w} style={{ position: "absolute", left: x0 + (x1 - x0) * p, top: y0 + (y1 - y0) * p, padding: "12px 20px", borderRadius: 14, background: "#fff", border: `3px solid ${p > 0.98 && i % 3 === 0 ? T.orange : "#2B2420"}`, fontWeight: 700, fontSize: 28, color: T.ink }}>
            {w}{p > 0.98 && i % 3 === 0 ? <span style={{ position: "absolute", right: -10, top: -10, width: 22, height: 22, borderRadius: "50%", background: T.orange }} /> : null}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 80, right: 80, top: 960, textAlign: "center", fontFamily: MONO, fontSize: 24, color: T.mut, ...rise(f, 56) }}>POLA STATISTIK HALUS · TEKS TIDAK BERUBAH</div>
      <div style={{ position: "absolute", left: 120, top: 1040, display: "flex", alignItems: "center", gap: 20, padding: "22px 30px", borderRadius: 24, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 40, ...pop(f, 66) }}>🛡️ Tujuannya: transparansi</div>
      <div style={{ position: "absolute", left: 120, top: 1170, padding: "16px 24px", borderRadius: 18, background: "#fff", border: "3px solid #2B2420", fontWeight: 700, fontSize: 30, color: T.ink, ...pop(f, 82) }}>Detektornya tidak dibuka untuk umum</div>
      <div style={{ position: "absolute", left: 80, right: 80, top: 1290, fontFamily: MONO, fontSize: 19, color: T.mut, ...rise(f, 20) }}>SUMBER: ANTHROPIC, AGUSTUS 2026 · HOW CLAUDE MARKS AI-GENERATED CONTENT</div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S5 · 14.3–17.7s: the pattern fades when you paraphrase & edit the text yourself */
const SWAP: [string, string | null, number][] = [
  ["Media sosial", null, 0], ["kini ikut", "sekarang", 22], ["membentuk", "memengaruhi", 34], ["keputusan pembelian", "cara belanja", 46], ["generasi muda", "anak muda", 58], ["lewat ulasan.", null, 0],
];
export const S5Edit: React.FC = () => {
  const f = useCurrentFrame();
  const lvl = interpolate(f, [22, 34, 46, 58, 74], [1, 0.8, 0.58, 0.36, 0.16], CL);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, background: BG }}>
      <Title at={0}>Bisa pudar kalau kamu<br /><Mark at={10}>parafrase & edit</Mark></Title>
      <div style={{ position: "absolute", left: 70, right: 70, top: 500, padding: "36px 40px", borderRadius: 24, background: "#fff", border: "3px solid #2B2420", fontFamily: "Tinos", fontSize: 40, lineHeight: 1.75, color: "#222", ...rise(f, 4) }}>
        {SWAP.map(([w, nw, at]) => {
          const done = nw !== null && f >= at;
          const typed = nw ? nw.slice(0, Math.max(0, Math.floor((f - at - 4) * 1.6))) : "";
          return (
            <span key={w}>
              {nw === null ? w : (
                <>
                  <span style={{ background: done ? "transparent" : T.orangeS, color: done ? "#B9B2A6" : "#222", textDecoration: done ? "line-through" : "none", textDecorationColor: "#E5484D", textDecorationThickness: 4, borderRadius: 6, padding: "0 4px" }}>{w}</span>
                  {done ? <span style={{ marginLeft: 8, padding: "0 6px", borderRadius: 6, background: "#E6F2E3", color: "#1F6B3A", fontWeight: 700 }}>{typed}</span> : null}
                </>
              )}{" "}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, top: 1010, ...rise(f, 14) }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 26, letterSpacing: 2, color: T.ink }}>
          <span>POLA WATERMARK</span><span style={{ fontWeight: 700, color: lvl > 0.5 ? T.orange : T.mut }}>{lvl > 0.5 ? "KUAT" : "PUDAR"}</span>
        </div>
        <div style={{ marginTop: 14, height: 46, borderRadius: 23, background: "#fff", border: "3px solid #2B2420", overflow: "hidden" }}>
          <div style={{ width: `${lvl * 100}%`, height: "100%", background: lvl > 0.5 ? T.orange : "#C9C1B4" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 70, top: 1170, display: "flex", alignItems: "center", gap: 14, padding: "20px 28px", borderRadius: 22, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 36, ...pop(f, 74) }}>✍️ Makin kamu tulis ulang, makin pudar</div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S6 · 17.7–22.7s: the right way — Claude as assistant, you write */
export const S6Right: React.FC = () => {
  const f = useCurrentFrame();
  const own = "Menurut temuanku di lapangan, ulasan konsumen jadi pertimbangan utama…";
  const typed = own.slice(0, Math.floor(interpolate(f, [62, 140], [0, own.length], CL)));
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Desk />
      <Title at={0} size={80}>Pakai Claude sebagai <Mark at={8}>asisten</Mark>,<br />nulisnya tetap kamu.</Title>
      <div style={{ position: "absolute", left: 70, top: 500, width: 440, padding: "22px 24px", borderRadius: 28, background: "#fff", border: "3px solid #2B2420", ...pop(f, 6) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 800, fontSize: 30 }}><Img src={staticFile("claude_logo.png")} style={{ width: 40, height: 40 }} />Claude bantu:</div>
        {[["🔍", "Cari referensi"], ["🧩", "Susun kerangka"], ["✅", "Review tulisan"]].map(([e, t], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, padding: "14px 18px", borderRadius: 16, background: T.orangeS, fontWeight: 800, fontSize: 30, ...pop(f, 14 + i * 10) }}>{e} {t}</div>
        ))}
      </div>
      <Laptop left={560} top={520} w={460} h={420}>
        <div style={{ padding: 22, fontFamily: "Tinos", fontSize: 26, lineHeight: 1.5, color: "#222" }}>
          <div style={{ fontWeight: 700, textAlign: "center", marginBottom: 10 }}>BAB II</div>
          {typed}{f < 140 && Math.floor(f / 7) % 2 === 0 ? <span style={{ borderLeft: "3px solid #222" }} /> : null}
        </div>
      </Laptop>
      <div style={{ position: "absolute", left: 620, top: 1010, padding: "12px 22px", borderRadius: 14, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 28, ...pop(f, 70) }}>✍️ Kata-katamu sendiri</div>
      <Guy expr="confident" armL={62} armR={58} style={{ left: 150, top: 1020, width: 420, height: 630 }} />
      <Footer />
    </AbsoluteFill>
  );
};

/* S7 · 22.7–25.9s: disclosure per campus rules */
export const S7Disclose: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Room />
      <Title at={0} size={84}>Cantumkan<br /><Mark at={8}>disclosure AI</Mark></Title>
      <div style={{ position: "absolute", left: 270, top: 540, width: 540, height: 620, borderRadius: 14, background: "#fff", border: "5px solid #2B2420", padding: "30px 32px", rotate: "-3deg", boxShadow: "12px 12px 0 rgba(43,36,32,.12)", ...pop(f, 4), zIndex: 2 }}>
        <div style={{ fontWeight: 800, fontSize: 30, textAlign: "center", lineHeight: 1.2 }}>PERNYATAAN PENGGUNAAN AI</div>
        {[100, 92, 100, 70, 96].map((w, i) => <div key={i} style={{ height: 13, width: `${w}%`, borderRadius: 6, background: "#E3E0D8", marginTop: 20 }} />)}
        <div style={{ position: "absolute", right: 30, bottom: 40, width: 130, height: 130, borderRadius: "50%", border: `8px solid ${T.green}`, color: T.green, fontWeight: 800, fontSize: 70, display: "flex", alignItems: "center", justifyContent: "center", rotate: "-12deg", opacity: interpolate(f, [30, 33], [0, 1], CL), scale: `${interpolate(f, [30, 36], [1.8, 1], CL)}` }}>✓</div>
      </div>
      <div style={{ position: "absolute", left: 330, top: 1230, padding: "16px 28px", borderRadius: 14, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 30, rotate: "4deg", zIndex: 3, ...pop(f, 20) }}>📌 Ikuti aturan kampusmu</div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S8 · 25.9–30s: save + follow */
export const S8Cta: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Room />
      <Title at={0} size={92}><Mark at={8}>Simpan</Mark> biar nggak<br />salah langkah.</Title>
      <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", gap: 26 }}>
        {[["🔖", "Simpan"], ["➕", "Follow"]].map(([e, t], i) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 34px", borderRadius: 999, background: i ? T.orange : "#fff", color: i ? "#fff" : T.ink, border: "4px solid #2B2420", fontWeight: 800, fontSize: 40, boxShadow: "8px 8px 0 rgba(43,36,32,.15)", ...pop(f, 14 + i * 8) }}>{e} {t}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 670, textAlign: "center", zIndex: 2, ...rise(f, 30) }}><span style={{ display: "inline-block", padding: "8px 30px", borderRadius: 20, background: "#fff", border: "4px solid #2B2420", fontWeight: 800, fontSize: 56, color: T.orange }}>@researchq.id</span></div>
      <Guy expr="happy" armL={160} armR={20} style={{ left: 280, top: 820, width: 520, height: 780 }} />
      <div style={{ position: "absolute", left: 285, top: 935 + Math.sin(f / 6) * 8, fontSize: 110, ...pop(f, 20) }}>👍</div>
      <Footer />
    </AbsoluteFill>
  );
};
