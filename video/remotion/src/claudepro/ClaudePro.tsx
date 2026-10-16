import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ACC, CL, Cam, EASE, Glow, Grain, inFocus, LINE, Mark, MONO, MUT, OR, PANEL, PANEL2, SANS, slam, Spinner, StreakCut, TXT, Vignette, W } from "../cine/Cine";
import { WORDS } from "./words";

// "Claude Free vs Pro" — cut to the creator's own VO (Track_1, first 7.85s of room noise trimmed), 31s / 930 frames.
// Every visual beat is keyed to a spoken word (WORDS, from a local Whisper pass). Claims stay inside the VO:
// Anthropic's docs say Pro offers more usage capacity and access to certain extra features; no prices or numbers.
// Scenes: hook 0–95 · free covers it 95–265 · signals: quota 265–350 · documents 350–402 · Research 402–468
// · verdict 468–525 · Anthropic docs 525–712 · "not because of hype, because your research grew" 712–860 · end 860–930.
const RED = "#FF5A4E";
// Frame of the n-th occurrence of a spoken word (matched on its start, punctuation ignored).
const wf = (word: string, n = 0) => {
  const clean = (s: string) => s.toLowerCase().replace(/[.,?!]/g, "");
  const hits = WORDS.filter(([t]) => clean(t) === clean(word));
  return Math.round(hits[Math.min(n, hits.length - 1)][1] * 30);
};

/* ---------------- icons (simple line drawings, 24-grid) ---------------- */
const ICONS: Record<string, React.ReactNode> = {
  bulb: <path d="M9 18h6 M10 21h4 M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z" />,
  spark: <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z" />,
  pencil: <path d="M16.5 3.5l4 4L8 20H4v-4z M14 6l4 4" />,
  docs: <path d="M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M15 3v4h4 M8 12h8 M8 16h6" />,
  globe: <><circle cx="11" cy="11" r="7" /><path d="M4 11h14 M11 4c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z M16.5 16.5L21 21" /></>,
  scale: <path d="M12 4v16 M7 20h10 M5 7h14 M5 7l-3 6c1 2 5 2 6 0z M19 7l-3 6c1 2 5 2 6 0z" />,
  person: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c1-4 4-6 7-6s6 2 7 6" /></>,
  trend: <path d="M3 17l6-6 4 4 8-8 M15 7h6v6" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  unlock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 7.6-1.8" /></>,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  book: <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 21V5 M8 7h7" />,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
};
const Ico: React.FC<{ n: string; c?: string; size: number; sw?: number }> = ({ n, c = TXT, size, sw = 1.7 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ fill: "none", stroke: c, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", overflow: "visible" }}>{ICONS[n]}</svg>
);
const Tile: React.FC<{ n: string; size?: number; on?: boolean }> = ({ n, size = 110, on = true }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: on ? "rgba(242,138,46,.12)" : PANEL2, border: `2px solid ${on ? "rgba(242,138,46,.6)" : LINE}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
    <Ico n={n} c={on ? OR : MUT} size={size * 0.55} />
  </div>
);
const Cursor: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={44} height={52} viewBox="0 0 22 32" style={{ position: "absolute", left: x, top: y, scale: `${s}`, transformOrigin: "0 0", filter: "drop-shadow(0 6px 10px rgba(0,0,0,.6))" }}>
    <path d="M1 1 L1 27 L8 21 L13 31 L17 29 L12 19 L21 19 Z" fill="#fff" stroke="#111" strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);
const Tag: React.FC<{ children: React.ReactNode; top: number; o?: number }> = ({ children, top, o = 1 }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top, fontFamily: MONO, fontSize: 26, letterSpacing: 7, color: OR, opacity: o }}>{children}</div>
);
const Title: React.FC<{ children: React.ReactNode; top: number; size?: number }> = ({ children, top, size = 96 }) => (
  <div style={{ position: "absolute", left: 76, right: 70, top, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -3.5, lineHeight: 1.02, color: "#fff" }}>{children}</div>
);
const Shell: React.FC<{ children: React.ReactNode; glow?: [number, number, number, number] }> = ({ children, glow = [540, 1700, 760, 0.35] }) => (
  <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
    <Glow x={glow[0]} y={glow[1]} r={glow[2]} o={glow[3]} />
    {children}
    <Vignette />
    <Grain />
  </AbsoluteFill>
);

/* ---- 1 · Hook 0–95: "Jangan buang duit buat Claude Pro kalau lu belum butuh." ---- */
const Hook: React.FC = () => {
  const g = useCurrentFrame();
  const back = interpolate(g, [wf("belum"), wf("butuh") + 8], [0, 1], { ...CL, easing: EASE });
  const cx = interpolate(g, [0, wf("Pro")], [900, 690], { ...CL, easing: EASE }) + back * 200;
  const cy = interpolate(g, [0, wf("Pro")], [1400, 1135], { ...CL, easing: EASE }) + back * 160;
  const dive = interpolate(g, [86, 95], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  return (
    <Shell glow={[540, 1250, 1000, 0.45]}>
      <Cam s={interpolate(g, [0, 86], [1, 1.04]) + dive * 1.4} blur={dive * 10}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: SANS, fontWeight: 800, letterSpacing: -4, lineHeight: 1.04, color: "#fff" }}>
          <div style={{ fontSize: 118 }}><W f={g} at={wf("Jangan")}>Jangan</W> <W f={g} at={wf("buang")}>buang</W> <W f={g} at={wf("duit")} style={{ color: RED }}>duit</W></div>
          <div style={{ fontSize: 118 }}><W f={g} at={wf("buat")}>buat</W> <W f={g} at={wf("Claude")} style={{ color: OR }}>Claude</W> <W f={g} at={wf("Pro")} style={{ color: OR }}>Pro</W></div>
          <div style={{ fontSize: 62, fontWeight: 600, letterSpacing: -1, color: "#CFCAC1", marginTop: 18 }}><W f={g} at={wf("kalau")}>kalau</W> <W f={g} at={wf("lu")}>lu</W> <W f={g} at={wf("belum")}>belum</W> <W f={g} at={wf("butuh")} style={{ color: "#fff" }}>butuh.</W></div>
        </div>
        {/* plan card the cursor is drifting toward */}
        <div style={{ position: "absolute", left: 150, right: 150, top: 820, borderRadius: 34, background: PANEL, border: `2px solid ${LINE}`, padding: "40px 44px", fontFamily: SANS, boxShadow: "0 80px 140px -50px rgba(0,0,0,.95)", rotate: `${interpolate(g, [0, 95], [-2, 1])}deg`, ...slam(g, 4, 1.1) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Img src={staticFile("claude_logo_t.png")} style={{ width: 54, height: 54 }} /><span style={{ fontWeight: 800, fontSize: 52, color: "#fff" }}>Claude Pro</span></div>
          <div style={{ marginTop: 34, height: 96, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 38, color: back > 0.5 ? MUT : "#1A0E04", background: back > 0.5 ? "#262626" : OR, scale: `${interpolate(g, [wf("Pro") - 2, wf("Pro") + 4], [1, 1.04], CL) - back * 0.04}` }}>Upgrade ke Pro</div>
          <div style={{ marginTop: 22, textAlign: "center", fontSize: 30, fontWeight: 600, color: TXT, opacity: back }}>✋ Cek kebutuhanmu dulu</div>
        </div>
        <Cursor x={cx} y={cy} />
      </Cam>
    </Shell>
  );
};

/* ---- 2 · Free covers it 95–265 ---- */
const FREE: [string, string, string][] = [["bulb", "Cari ide judul", "cari"], ["spark", "Brainstorming", "brainstorming"], ["pencil", "Perbaiki tulisan", "memperbaiki"]];
const Free: React.FC = () => {
  const g = useCurrentFrame() + 95;
  const badge = wf("akun");
  return (
    <Shell glow={[980, 1650, 700, 0.35]}>
      <Cam y={interpolate(g, [95, 265], [20, -20])} rx={interpolate(g, [95, 108], [16, 3], { ...CL, easing: EASE })} blur={inFocus(g - 95)}>
        <Tag top={230}>KALAU CUMA BUTUH INI</Tag>
        <Title top={275}><W f={g} at={wf("Kalau", 1)}>Cukup pakai</W><br /><W f={g} at={wf("cuma")} style={{ color: OR }}>akun Free.</W></Title>
        {FREE.map(([ic, label, w], k) => {
          const at = wf(w);
          return (
            <div key={label} style={{ position: "absolute", left: 70, right: 70, top: 540 + k * 170, height: 146, borderRadius: 28, background: PANEL, border: `2px solid ${g >= at && g < at + 30 ? "rgba(242,138,46,.55)" : LINE}`, display: "flex", alignItems: "center", gap: 28, padding: "0 30px", fontFamily: SANS, ...slam(g, at, 1.12) }}>
              <Tile n={ic} size={96} />
              <span style={{ flex: 1, fontWeight: 700, fontSize: 48, color: "#fff" }}>{label}</span>
              <Spinner f={g} ok={g >= at + 10} size={44} />
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center", ...slam(g, badge, 1.25) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 38px", borderRadius: 999, background: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 46, color: "#111" }}>
            <Img src={staticFile("claude_logo_t.png")} style={{ width: 52, height: 52 }} />Free <span style={{ fontWeight: 600, color: "#555" }}>bisa jadi udah cukup</span>
            <span style={{ color: "#1F9D55", opacity: interpolate(g, [wf("cukup"), wf("cukup") + 4], [0, 1], CL) }}>✓</span>
          </div>
        </div>
      </Cam>
    </Shell>
  );
};

/* ---- 3a · Signal: quota runs out 265–350 ---- */
const Quota: React.FC = () => {
  const g = useCurrentFrame() + 265;
  const k = wf("kuota");
  const fill = interpolate(g, [275, k], [0.72, 0], { ...CL, easing: Easing.in(Easing.quad) });
  const toast = interpolate(g, [k, k + 8], [0, 1], { ...CL, easing: EASE });
  return (
    <Shell glow={[540, 1600, 700, 0.3]}>
      <Cam x={interpolate(g, [265, 273], [420, 0], { ...CL, easing: EASE })} ry={interpolate(g, [265, 273], [-24, 0], { ...CL, easing: EASE })} blur={inFocus(g - 265, 7)}>
        <Tag top={230}>TAPI KALAU…</Tag>
        <Title top={275}><W f={g} at={wf("sering")}>Sering</W> <W f={g} at={wf("kehabisan")} style={{ color: RED }}>kehabisan</W><br /><W f={g} at={k}>kuota</W></Title>
        <div style={{ position: "absolute", left: 70, right: 70, top: 560, borderRadius: 30, background: PANEL, border: `2px solid ${LINE}`, padding: "34px 36px", fontFamily: SANS }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 700, color: "#C9C4BB" }}><Img src={staticFile("claude_logo_t.png")} style={{ width: 40, height: 40 }} />Claude · BAB 4 skripsi</div>
          <div style={{ marginTop: 30, fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: MUT }}>SISA PENGGUNAAN · ILUSTRASI</div>
          <div style={{ marginTop: 14, height: 30, borderRadius: 999, background: "#222", overflow: "hidden" }}>
            <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 999, background: fill > 0.3 ? OR : RED }} />
          </div>
          <div style={{ marginTop: 30, height: 90, borderRadius: 999, background: "#191919", border: `2px solid ${LINE}`, display: "flex", alignItems: "center", padding: "0 28px", fontSize: 30, color: "#6A665F" }}>Lanjutkan analisis hipotesis…</div>
        </div>
        <div style={{ position: "absolute", left: 110, right: 110, top: 1030, padding: "26px 30px", borderRadius: 24, background: "#2A1513", border: `2px solid rgba(255,90,78,.6)`, display: "flex", alignItems: "center", gap: 20, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: "#FFD0CB", opacity: toast, translate: `0px ${(1 - toast) * 40}px` }}>
          <Ico n="bolt" c={RED} size={46} />Batas penggunaan tercapai
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1230, textAlign: "center", ...ACC, fontSize: 48, color: "#CFCAC1" }}><W f={g} at={wf("kerjain")}>pas lagi ngerjain skripsi</W></div>
      </Cam>
    </Shell>
  );
};

/* ---- 3b · Signal: many documents 350–402 ---- */
const FILES = ["jurnal_01.pdf", "jurnal_02.pdf", "kuesioner.xlsx", "transkrip_wawancara.docx", "jurnal_03.pdf"];
const Docs: React.FC = () => {
  const g = useCurrentFrame() + 350;
  return (
    <Shell glow={[120, 1600, 700, 0.32]}>
      <Cam x={interpolate(g, [350, 358], [-420, 0], { ...CL, easing: EASE })} ry={interpolate(g, [350, 358], [24, 0], { ...CL, easing: EASE })} blur={inFocus(g - 350, 7)}>
        <Tag top={230}>ATAU PERLU…</Tag>
        <Title top={275}><W f={g} at={wf("menganalisis")}>Analisis</W><br /><W f={g} at={wf("banyak")} style={{ color: OR }}>banyak dokumen</W></Title>
        {FILES.map((n, k) => {
          const at = 356 + k * 7;
          const p = interpolate(g, [at, at + 9], [0, 1], { ...CL, easing: EASE });
          return (
            <div key={n} style={{ position: "absolute", left: 120 + k * 22, top: 560 + k * 112, width: 780, height: 96, borderRadius: 22, background: PANEL, border: `2px solid ${LINE}`, display: "flex", alignItems: "center", gap: 20, padding: "0 26px", fontFamily: MONO, fontSize: 28, color: TXT, opacity: p, translate: `${(1 - p) * 300}px ${(1 - p) * -40}px`, rotate: `${(1 - p) * 8}deg`, boxShadow: "0 30px 50px -25px rgba(0,0,0,.9)" }}>
              <Ico n="docs" c={OR} size={44} />{n}
            </div>
          );
        })}
      </Cam>
    </Shell>
  );
};

/* ---- 3c · Signal: Research feature to trace sources 402–468 ---- */
const Research: React.FC = () => {
  const g = useCurrentFrame() + 402;
  const rows = [0, 1, 2, 3];
  return (
    <Shell glow={[960, 1650, 700, 0.32]}>
      <Cam x={interpolate(g, [402, 410], [420, 0], { ...CL, easing: EASE })} ry={interpolate(g, [402, 410], [-24, 0], { ...CL, easing: EASE })} blur={inFocus(g - 402, 7)}>
        <Tag top={230}>ATAU BUTUH…</Tag>
        <Title top={275}><W f={g} at={wf("fitur")}>Fitur</W> <W f={g} at={wf("Research")} style={{ color: OR }}>Research</W><br /><W f={g} at={wf("menelusuri")}>buat telusuri sumber</W></Title>
        <div style={{ position: "absolute", left: 70, right: 70, top: 580, borderRadius: 30, background: PANEL, border: `2px solid ${LINE}`, padding: "32px 34px", fontFamily: SANS }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontWeight: 700, fontSize: 34, color: "#fff" }}><Tile n="globe" size={80} />Menelusuri sumber…</div>
          {rows.map((k) => {
            const at = wf("Research") + 6 + k * 9;
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24, ...slam(g, at, 1.06) }}>
                <Spinner f={g} ok={g >= at + 8} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 18, width: `${[78, 64, 84, 58][k]}%`, borderRadius: 9, background: "#3A3733" }} />
                  <div style={{ height: 12, width: `${[46, 52, 38, 44][k]}%`, borderRadius: 6, background: "#262422", marginTop: 10 }} />
                </div>
                <Ico n="link" c={MUT} size={34} />
              </div>
            );
          })}
        </div>
      </Cam>
    </Shell>
  );
};

/* ---- 3d · Verdict 468–525: "Pro layak dipertimbangkan." ---- */
const Verdict: React.FC = () => {
  const g = useCurrentFrame() + 468;
  const p = wf("Pro", 1);
  const tilt = interpolate(g, [p, p + 14], [0, -12], { ...CL, easing: Easing.out(Easing.back(2)) });
  const chips: [string, string][] = [["bolt", "Kuota sering habis"], ["docs", "Banyak dokumen"], ["globe", "Research"]];
  return (
    <Shell glow={[540, 900, 700, 0.4]}>
      <Cam s={interpolate(g, [468, 525], [1.1, 1.0], { easing: Easing.out(Easing.cubic) })} blur={inFocus(g - 468, 6)}>
        <div style={{ position: "absolute", left: 540 - 150, top: 330, rotate: `${tilt}deg`, ...slam(g, 470, 1.2) }}><Ico n="scale" c={OR} size={300} sw={1.3} /></div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily: SANS, fontWeight: 800, letterSpacing: -4, lineHeight: 1.0, color: "#fff" }}>
          <div style={{ fontSize: 180, color: OR, ...slam(g, p, 1.3) }}>Pro</div>
          <div style={{ fontSize: 76 }}><W f={g} at={wf("layak")}>layak</W> <W f={g} at={wf("dipertimbangkan")}>dipertimbangkan.</W></div>
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 1110, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
          {chips.map(([ic, t], k) => (
            <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 24px", borderRadius: 999, background: PANEL2, border: `2px solid ${LINE}`, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: TXT, ...slam(g, 476 + k * 5, 1.2) }}><Ico n={ic} c={OR} size={32} />{t}</span>
          ))}
        </div>
      </Cam>
    </Shell>
  );
};

/* ---- 4 · What Anthropic's docs say 525–712 ---- */
const Source: React.FC = () => {
  const g = useCurrentFrame() + 525;
  const l1 = wf("kapasitas"), l2 = wf("akses");
  const bar = interpolate(g, [l1, l1 + 18], [0, 1], { ...CL, easing: EASE });
  const un = g >= l2 + 8;
  return (
    <Shell glow={[540, 1700, 760, 0.35]}>
      <Cam y={interpolate(g, [525, 712], [30, -20])} rx={interpolate(g, [525, 540], [20, 3], { ...CL, easing: EASE })} ry={interpolate(g, [525, 712], [-4, 4])} blur={inFocus(g - 525, 8)}>
        <Tag top={230}>MENURUT DOKUMENTASI RESMI</Tag>
        <Title top={275}><W f={g} at={wf("Menurut")}>Kata</W> <W f={g} at={wf("Anthropic")} style={{ color: OR }}>Anthropic:</W></Title>
        <div style={{ position: "absolute", left: 60, right: 60, top: 450, borderRadius: 30, background: PANEL, border: `2px solid ${LINE}`, overflow: "hidden", fontFamily: SANS, boxShadow: "0 80px 140px -50px rgba(0,0,0,.95)", ...slam(g, wf("dokumentasi"), 1.08) }}>
          <div style={{ height: 64, display: "flex", alignItems: "center", gap: 14, padding: "0 28px", borderBottom: `2px solid ${LINE}`, background: "#101010", fontFamily: MONO, fontSize: 22, color: MUT }}>
            <Ico n="book" c={MUT} size={30} />Dokumentasi · Paket Claude Pro
          </div>
          <div style={{ padding: "34px 36px 40px" }}>
            {/* line 1 — more usage capacity */}
            <div style={{ opacity: g >= l1 - 4 ? 1 : 0.25 }}>
              <div style={{ fontWeight: 800, fontSize: 44, color: "#fff", background: g >= l1 ? "rgba(242,138,46,.18)" : "transparent", borderRadius: 10, padding: "4px 10px", display: "inline-block" }}>Kapasitas penggunaan lebih besar</div>
              {[["Free", 0.34, "#4A4640"], ["Pro", 0.86, OR]].map(([n, v, c]) => (
                <div key={n as string} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 20 }}>
                  <span style={{ width: 90, fontWeight: 700, fontSize: 32, color: TXT }}>{n}</span>
                  <div style={{ flex: 1, height: 28, borderRadius: 999, background: "#1E1E1E" }}><div style={{ width: `${(v as number) * bar * 100}%`, height: "100%", borderRadius: 999, background: c as string }} /></div>
                </div>
              ))}
              <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 2, color: "#5F5B55", marginTop: 12 }}>BATANG = ILUSTRASI, BUKAN ANGKA RESMI</div>
            </div>
            {/* line 2 — access to certain extra features */}
            <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 22, opacity: g >= l2 - 4 ? 1 : 0.25 }}>
              <Tile n={un ? "unlock" : "lock"} size={92} on={g >= l2} />
              <div style={{ fontWeight: 800, fontSize: 44, lineHeight: 1.15, color: "#fff", background: g >= l2 ? "rgba(242,138,46,.18)" : "transparent", borderRadius: 10, padding: "4px 10px" }}>Akses ke fitur tambahan tertentu</div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 80, right: 80, top: 1250, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 28, color: "#9A968F", opacity: interpolate(g, [l2 + 10, l2 + 18], [0, 1], CL) }}>Detail & batas terbaru: cek halaman resmi Anthropic.</div>
      </Cam>
    </Shell>
  );
};

/* ---- 5 · Close 712–860: not because of hype, because your research needs grew ---- */
const Close: React.FC = () => {
  const g = useCurrentFrame() + 712;
  const hype = wf("ikut-ikutan"), tapi = wf("tapi", 1), up = wf("meningkat");
  const strike = interpolate(g, [hype + 6, hype + 14], [0, 1], { ...CL, easing: EASE });
  const partB = g >= tapi - 4;
  const draw = interpolate(g, [tapi + 4, up + 4], [0, 1], { ...CL, easing: Easing.inOut(Easing.cubic) });
  const click = up + 14;
  return (
    <Shell glow={[540, partB ? 1700 : 1900, 760, 0.38]}>
      {!partB ? (
        <Cam s={interpolate(g, [712, 780], [1.06, 1.0])} blur={inFocus(g - 712, 6)}>
          <Tag top={300}>JADI…</Tag>
          <Title top={345}><W f={g} at={wf("upgrade")}>Upgrade</W> <W f={g} at={wf("bukan")}>bukan</W><br /><W f={g} at={wf("karena")}>karena</W> <span style={{ position: "relative", display: "inline-block" }}><W f={g} at={hype} style={{ color: MUT }}>ikut-ikutan.</W><span style={{ position: "absolute", left: 0, top: "55%", height: 10, width: `${strike * 100}%`, background: RED, borderRadius: 5 }} /></span></Title>
          <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center", gap: 26, opacity: 1 - strike * 0.6 }}>
            {[0, 1, 2, 3, 4].map((k) => (
              <div key={k} style={{ translate: `${interpolate(g, [712 + k * 3, 770], [-60, 40])}px 0px`, ...slam(g, 716 + k * 4, 1.2) }}><Ico n="person" c={k === 2 ? OR : "#8F8A82"} size={120} sw={1.5} /></div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", fontSize: 90, color: RED, fontWeight: 800, fontFamily: SANS, opacity: strike, scale: `${1.3 - strike * 0.3}` }}>✕</div>
        </Cam>
      ) : (
        <Cam s={interpolate(g, [tapi, 860], [1.08, 1.0], { easing: Easing.out(Easing.cubic) })} blur={inFocus(g - tapi + 4, 6)}>
          <Tag top={230}>TAPI KARENA</Tag>
          <Title top={275}><W f={g} at={wf("kebutuhan")}>kebutuhan</W> <W f={g} at={wf("riset")} style={{ color: OR }}>riset</W> <W f={g} at={wf("lu", 3)}>lu</W><br /><W f={g} at={up}>udah meningkat.</W></Title>
          <div style={{ position: "absolute", left: 70, right: 70, top: 560, height: 480, borderRadius: 30, background: PANEL, border: `2px solid ${LINE}`, overflow: "hidden" }}>
            <svg width={940} height={480} style={{ position: "absolute", inset: 0 }}>
              {[120, 220, 320, 420].map((y) => <line key={y} x1={40} x2={900} y1={y} y2={y} stroke="#1F1F1F" strokeWidth={2} />)}
              <path d="M50 410 C 200 400, 300 360, 420 320 S 640 220, 720 170 S 840 80, 880 60" fill="none" stroke={OR} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
              {draw > 0.98 ? <circle cx={880} cy={60} r={14} fill={OR} /> : null}
            </svg>
            <div style={{ position: "absolute", left: 40, top: 30, fontFamily: MONO, fontSize: 22, letterSpacing: 3, color: MUT }}>KEBUTUHAN RISET ↑</div>
          </div>
          <div style={{ position: "absolute", left: 230, right: 230, top: 1110, height: 100, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 38, color: g >= up ? "#1A0E04" : MUT, background: g >= up ? OR : "#262626", scale: `${interpolate(g, [click, click + 3, click + 7], [1, 0.93, 1], CL)}` }}>Upgrade ke Pro</div>
          <Cursor x={interpolate(g, [up - 10, click], [860, 600], { ...CL, easing: EASE })} y={interpolate(g, [up - 10, click], [1340, 1170], { ...CL, easing: EASE })} />
        </Cam>
      )}
    </Shell>
  );
};

/* ---- 6 · End 860–930: white mark → wordmark + follow ---- */
const End: React.FC = () => {
  const g = useCurrentFrame() + 860;
  const word = "RESEARCHQ";
  const m = g < 872;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {m ? (
        <div style={{ position: "absolute", left: 540 - 90, top: 780, scale: `${interpolate(g, [860, 866], [1.7, 1], { ...CL, easing: EASE })}`, rotate: `${g * 1.5}deg`, filter: `blur(${interpolate(g, [860, 864], [10, 0], CL)}px)` }}><Mark size={180} /></div>
      ) : (
        <>
          <Glow x={540} y={1900} r={700} o={0.3} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", alignItems: "center", justifyContent: "center", gap: 26, translate: `${interpolate(g, [872, 882], [170, 0], { ...CL, easing: EASE })}px 0px` }}>
            <Mark size={110} />
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 104, letterSpacing: 2, color: "#fff", display: "flex" }}>
              {word.split("").map((ch, k) => <span key={k} style={{ opacity: interpolate(g, [874 + k * 1.5, 877 + k * 1.5], [0, 1], CL), translate: `0px ${interpolate(g, [874 + k * 1.5, 879 + k * 1.5], [26, 0], { ...CL, easing: EASE })}px` }}>{ch}</span>)}
            </div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 950, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 44, color: "#fff", ...slam(g, 892, 1.2) }}>Follow <span style={{ color: OR }}>@researchq.id</span></div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1020, textAlign: "center", ...ACC, fontSize: 38, color: "#CFCAC1", opacity: interpolate(g, [898, 904], [0, 1], CL) }}>tips riset pakai AI, tiap hari</div>
          <Grain />
        </>
      )}
    </AbsoluteFill>
  );
};

/* ---- karaoke subtitles from the VO words: phrase per line, spoken words light up ---- */
const PHRASES: [string, number, number][][] = (() => {
  const out: [string, number, number][][] = [];
  let cur: [string, number, number][] = [];
  for (const w of WORDS) {
    cur.push(w);
    // break on punctuation, or after 6 words so a line never wraps past two rows
    if (/[.,?!]$/.test(w[0]) || cur.length >= 6) { out.push(cur); cur = []; }
  }
  if (cur.length) out.push(cur);
  return out;
})();
const Subs: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const i = PHRASES.findIndex((p, k) => t >= p[0][1] - 0.1 && t < (PHRASES[k + 1] ? PHRASES[k + 1][0][1] - 0.1 : p[p.length - 1][2] + 0.6));
  if (i < 0) return null;
  const p = PHRASES[i];
  const a = interpolate(t, [p[0][1] - 0.1, p[0][1] + 0.05], [0, 1], CL);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1440, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ maxWidth: 960, padding: "12px 26px", borderRadius: 18, background: "rgba(0,0,0,.62)", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.25 }}>
        {p.map(([w, s, e], k) => (
          <span key={k} style={{ color: t >= s && t < e + 0.05 ? OR : t >= s ? "#fff" : "rgba(255,255,255,.45)" }}>{w}{k < p.length - 1 ? " " : ""}</span>
        ))}
      </div>
    </div>
  );
};

export const ClaudeProVO: React.FC<{ subs?: boolean }> = ({ subs = true }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence durationInFrames={95} name="Hook"><Hook /></Sequence>
      <Sequence from={95} durationInFrames={170} name="Free cukup"><Free /></Sequence>
      <Sequence from={265} durationInFrames={85} name="Kuota"><Quota /></Sequence>
      <Sequence from={350} durationInFrames={52} name="Dokumen"><Docs /></Sequence>
      <Sequence from={402} durationInFrames={66} name="Research"><Research /></Sequence>
      <Sequence from={468} durationInFrames={57} name="Pro layak"><Verdict /></Sequence>
      <Sequence from={525} durationInFrames={187} name="Dokumentasi"><Source /></Sequence>
      <Sequence from={712} durationInFrames={148} name="Penutup"><Close /></Sequence>
      <Sequence from={860} durationInFrames={70} name="End"><End /></Sequence>
      {([[91, 1], [261, -1], [521, 1], [708, -1]] as const).map(([t, d]) => (
        <Sequence key={t} from={t} durationInFrames={12}><StreakCut dir={d} /></Sequence>
      ))}
      {subs ? <Subs /> : null}
      <Audio src={staticFile("claudepro-vo.wav")} premountFor={fps} />
      <Audio src={staticFile("claudepro-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
