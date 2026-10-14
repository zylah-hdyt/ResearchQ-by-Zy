import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CL, EASE, Mark, MONO, SANS, T, pop, rise } from "../theory/kit";
import { BG, Footer, Title } from "../watermark/Scenes";
import { Guy } from "../watermark/Guy";

// "SPSS atau SmartPLS?" — storytelling explainer (60s). Flat vector, warm palette, no glow.
// Character appears only in the hook, the decision scene, and the CTA.
const SPSS = "#2574B5", PLS = "#C98A00", PLS_S = "#FFF1C2", SPSS_S = "#DCEBF8";
const INK = "#2B2420";
const Room: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, bottom: 0, background: "#E4D3BC" }} />
    <div style={{ position: "absolute", left: -40, right: -40, top: 1220, height: 140, borderRadius: 30, background: "#7A9CC6" }} />
  </AbsoluteFill>
);

const Logo: React.FC<{ k: "spss" | "pls"; size: number; style?: React.CSSProperties }> = ({ k, size, style }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: `${Math.max(4, size / 40)}px solid ${INK}`, background: "#fff", boxShadow: "8px 8px 0 rgba(43,36,32,.14)", ...style }}>
    <Img src={staticFile(k === "spss" ? "spss_logo.png" : "pls_logo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", scale: k === "spss" ? "1.08" : "1.04" }} />
  </div>
);
const Chip: React.FC<{ at: number; c: string; bg: string; children: React.ReactNode }> = ({ at, c, bg, children }) => {
  const f = useCurrentFrame();
  return <div style={{ padding: "14px 24px", borderRadius: 999, background: bg, color: c, border: `3px solid ${c}`, fontWeight: 800, fontSize: 30, ...pop(f, at) }}>{children}</div>;
};
const Win: React.FC<{ left: number; top: number; w: number; h: number; title: string; at?: number; children: React.ReactNode }> = ({ left, top, w, h, title, at = 0, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left, top, width: w, height: h, borderRadius: 26, background: "#fff", border: `4px solid ${INK}`, overflow: "hidden", boxShadow: "12px 12px 0 rgba(43,36,32,.10)", ...rise(f, at, 40) }}>
      <div style={{ height: 58, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `3px solid ${INK}`, background: "#F3EEE6" }}>
        {["#E5484D", "#F5B83D", "#3DAA5C"].map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: "50%", background: c }} />)}
        <span style={{ marginLeft: 12, fontFamily: MONO, fontSize: 22, color: INK }}>{title}</span>
      </div>
      <div style={{ position: "relative", height: h - 58 }}>{children}</div>
    </div>
  );
};
const Head: React.FC<{ k: "spss" | "pls"; name: string; tag: string }> = ({ k, name, tag }) => {
  const f = useCurrentFrame();
  const c = k === "spss" ? SPSS : PLS;
  return (
    <div style={{ position: "absolute", left: 70, top: 220, display: "flex", alignItems: "center", gap: 26, ...rise(f, 0) }}>
      <Logo k={k} size={150} />
      <div>
        <div style={{ fontWeight: 800, fontSize: 92, letterSpacing: -3.5, lineHeight: 1, color: T.ink }}>{name}</div>
        <div style={{ marginTop: 12, display: "inline-block", padding: "8px 20px", borderRadius: 999, background: c, color: "#fff", fontWeight: 800, fontSize: 30 }}>{tag}</div>
      </div>
    </div>
  );
};

/* S1 · 0–4s hook: SPSS or SmartPLS? */
export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const look = Math.sin(f / 10) * 9;
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Room />
      <Title at={0} size={100}><span style={{ color: SPSS }}>SPSS</span> atau<br /><span style={{ color: PLS }}>SmartPLS</span>?</Title>
      <div style={{ position: "absolute", left: 70, top: 470, fontWeight: 800, fontSize: 44, color: T.ink, ...rise(f, 30) }}><Mark at={36}>Kenalan dengan 2 software ini</Mark></div>
      <Logo k="spss" size={250} style={{ position: "absolute", left: 90, top: 600 + Math.sin(f / 12) * 10, ...pop(f, 8) }} />
      <Logo k="pls" size={250} style={{ position: "absolute", right: 90, top: 600 + Math.cos(f / 12) * 10, ...pop(f, 16) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontWeight: 800, fontSize: 80, color: "#E5484D", ...pop(f, 24) }}>VS</div>
      <Guy expr="confused" look={look} armL={12} armR={140} style={{ left: 280, top: 920, width: 520, height: 780 }} />
      <div style={{ position: "absolute", left: 700, top: 900, fontWeight: 800, fontSize: 120, color: T.orange, rotate: "12deg", ...pop(f, 28) }}>?</div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S2 · 4–14s: SPSS — spreadsheet data + menu-driven analysis */
const DATA = [[4, 5, 4], [3, 4, 4], [5, 5, 5], [4, 3, 4], [2, 3, 3], [5, 4, 5], [4, 4, 4], [3, 3, 4]];
export const S2Spss: React.FC = () => {
  const f = useCurrentFrame();
  const menu = f >= 84 && f < 128;
  const out = f >= 128;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, background: BG }}>
      <Head k="spss" name="SPSS" tag="Statistik umum" />
      <Win left={60} top={450} w={960} h={600} title="SPSS · Data View" at={8}>
        <div style={{ display: "flex", gap: 26, padding: "12px 22px", borderBottom: "2px solid #E6E0D6", fontSize: 24, color: "#555" }}>
          {["File", "Edit", "Data", "Transform", "Analyze", "Graphs"].map((m) => (
            <span key={m} style={{ fontWeight: m === "Analyze" && f >= 70 ? 800 : 500, color: m === "Analyze" && f >= 70 ? SPSS : "#555", padding: "2px 8px", borderRadius: 8, background: m === "Analyze" && f >= 70 ? SPSS_S : "transparent" }}>{m}</span>
          ))}
        </div>
        <div style={{ position: "absolute", left: 22, top: 70, right: 22, fontFamily: MONO, fontSize: 24 }}>
          <div style={{ display: "flex", background: "#F3EEE6", fontWeight: 700 }}>
            {["#", "X1", "X2", "Y"].map((h, i) => <div key={h} style={{ flex: i ? 1 : 0.5, padding: "8px 14px", border: "1px solid #E0D9CE" }}>{h}</div>)}
          </div>
          {DATA.map((r, i) => (
            <div key={i} style={{ display: "flex", opacity: interpolate(f, [14 + i * 4, 20 + i * 4], [0, 1], CL) }}>
              <div style={{ flex: 0.5, padding: "7px 14px", border: "1px solid #E0D9CE", color: "#999" }}>{i + 1}</div>
              {r.map((v, j) => <div key={j} style={{ flex: 1, padding: "7px 14px", border: "1px solid #E0D9CE" }}>{v}</div>)}
            </div>
          ))}
        </div>
        {menu ? (
          <div style={{ position: "absolute", left: 360, top: 56, width: 380, borderRadius: 16, background: "#fff", border: `3px solid ${INK}`, padding: 10, boxShadow: "8px 8px 0 rgba(43,36,32,.12)", fontSize: 26, ...pop(f, 84) }}>
            {["Descriptive Statistics", "Compare Means", "Correlate", "Regression ▸"].map((m, i) => (
              <div key={m} style={{ padding: "10px 14px", borderRadius: 10, fontWeight: 700, background: i === 3 && f >= 100 ? SPSS_S : "transparent", color: i === 3 && f >= 100 ? SPSS : INK }}>{m}</div>
            ))}
            {f >= 108 ? <div style={{ position: "absolute", left: 360, top: 160, padding: "10px 18px", borderRadius: 12, background: SPSS, color: "#fff", fontWeight: 800, fontSize: 26, ...pop(f, 108) }}>Linear</div> : null}
          </div>
        ) : null}
        {out ? (
          <div style={{ position: "absolute", left: 120, right: 120, top: 150, borderRadius: 18, background: "#fff", border: `3px solid ${INK}`, padding: "18px 22px", boxShadow: "10px 10px 0 rgba(43,36,32,.12)", ...pop(f, 128) }}>
            <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 10 }}>Coefficients</div>
            <div style={{ fontFamily: MONO, fontSize: 24 }}>
              {[["Model", "B", "t", "Sig."], ["X1", "0,412", "4,87", ",000"], ["X2", "0,287", "3,12", ",002"]].map((r, i) => (
                <div key={i} style={{ display: "flex", borderTop: i ? "2px solid #E6E0D6" : "none", fontWeight: i ? 500 : 700, opacity: interpolate(f, [132 + i * 6, 138 + i * 6], [0, 1], CL) }}>
                  {r.map((c, j) => <div key={j} style={{ flex: 1, padding: "8px 6px" }}>{c}</div>)}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 18, color: T.mut }}>CONTOH ILUSTRASI</div>
          </div>
        ) : null}
      </Win>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1100, display: "flex", flexWrap: "wrap", gap: 16 }}>
        {["Regresi linear berganda", "Uji t & uji F", "ANOVA", "Korelasi"].map((t, i) => <Chip key={t} at={150 + i * 12} c={SPSS} bg={SPSS_S}>{t}</Chip>)}
      </div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S3 · 14–24s: SmartPLS — draw the path model, then calculate */
const CONS = [{ id: "X1", x: 300, y: 230 }, { id: "X2", x: 300, y: 590 }, { id: "Y", x: 700, y: 410 }];
const IND: { c: number; x: number; y: number; l: string }[] = [
  { c: 0, x: 80, y: 140, l: "0,81" }, { c: 0, x: 80, y: 230, l: "0,77" }, { c: 0, x: 80, y: 320, l: "0,84" },
  { c: 1, x: 80, y: 500, l: "0,79" }, { c: 1, x: 80, y: 590, l: "0,86" }, { c: 1, x: 80, y: 680, l: "0,74" },
  { c: 2, x: 870, y: 320, l: "0,82" }, { c: 2, x: 870, y: 410, l: "0,88" }, { c: 2, x: 870, y: 500, l: "0,80" },
];
export const S3Pls: React.FC = () => {
  const f = useCurrentFrame();
  const calc = f >= 176;
  const draw = (a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...CL, easing: EASE });
  return (
    <AbsoluteFill style={{ fontFamily: SANS, background: BG }}>
      <Head k="pls" name="SmartPLS" tag="PLS-SEM · model visual" />
      <Win left={40} top={450} w={1000} h={850} title="SmartPLS · Model" at={8}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#E3DCCF 2px, transparent 2px)", backgroundSize: "34px 34px" }} />
        <svg viewBox="0 0 1000 792" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill={INK} /></marker></defs>
          {IND.map((d, i) => {
            const c = CONS[d.c];
            const p = draw(54 + i * 4, 70 + i * 4);
            const x0 = d.c === 2 ? c.x + 80 : c.x - 80, x1 = d.c === 2 ? d.x - 46 : d.x + 46;
            return (
              <g key={i}>
                <line x1={x0} y1={c.y} x2={x0 + (x1 - x0) * p} y2={c.y + (d.y - c.y) * p} stroke={INK} strokeWidth={3} markerEnd={p > 0.95 ? "url(#ah)" : undefined} />
                {calc ? <text x={(x0 + x1) / 2} y={(c.y + d.y) / 2 - 8} fontFamily="JetBrainsMono" fontSize={20} fill={PLS} fontWeight={700} opacity={interpolate(f, [182 + i * 2, 188 + i * 2], [0, 1], CL)}>{d.l}</text> : null}
              </g>
            );
          })}
          {[[0, 0.42], [1, 0.31]].map(([ci, b], i) => {
            const c = CONS[ci]; const y = CONS[2];
            const p = draw(110 + i * 14, 136 + i * 14);
            const x1 = y.x - 84, y1 = y.y + (c.y - y.y) * 0.18;
            return (
              <g key={i}>
                <line x1={c.x + 80} y1={c.y} x2={c.x + 80 + (x1 - c.x - 80) * p} y2={c.y + (y1 - c.y) * p} stroke={INK} strokeWidth={5} markerEnd={p > 0.95 ? "url(#ah)" : undefined} />
                {calc ? <text x={(c.x + x1) / 2 + 40} y={(c.y + y1) / 2 - 14} fontFamily="JetBrainsMono" fontSize={30} fontWeight={800} fill={PLS} opacity={interpolate(f, [190, 198], [0, 1], CL)}>{String(b).replace(".", ",")}</text> : null}
              </g>
            );
          })}
        </svg>
        {CONS.map((c, i) => (
          <div key={c.id} style={{ position: "absolute", left: c.x - 80, top: c.y - 80, width: 160, height: 160, borderRadius: "50%", background: i === 2 ? PLS_S : SPSS_S, border: `4px solid ${INK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 40, ...pop(f, 18 + i * 10) }}>
            {c.id}
            {calc && i === 2 ? <span style={{ fontFamily: MONO, fontSize: 22, color: PLS, ...pop(f, 196) }}>R² 0,52</span> : null}
          </div>
        ))}
        {IND.map((d, i) => (
          <div key={i} style={{ position: "absolute", left: d.x - 46, top: d.y - 26, width: 92, height: 52, borderRadius: 8, background: "#FFE97A", border: `3px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 20, ...pop(f, 48 + i * 4) }}>
            {["X1", "X1", "X1", "X2", "X2", "X2", "Y", "Y", "Y"][i]}.{(i % 3) + 1}
          </div>
        ))}
        <div style={{ position: "absolute", left: 420, top: 640, padding: "14px 22px", borderRadius: 14, background: calc ? PLS : "#fff", color: calc ? "#fff" : INK, border: `3px solid ${INK}`, fontWeight: 800, fontSize: 26, ...pop(f, 150), scale: f >= 168 && f < 176 ? "0.94" : "1" }}>▶ Calculate PLS-SEM</div>
        {calc ? <div style={{ position: "absolute", left: 420, top: 726, fontFamily: MONO, fontSize: 17, color: T.mut }}>CONTOH ILUSTRASI</div> : null}
      </Win>
      <div style={{ position: "absolute", left: 40, right: 40, top: 1340, display: "flex", gap: 16 }}>
        <Chip at={70} c={SPSS} bg={SPSS_S}>◯ Variabel = lingkaran</Chip>
        <Chip at={84} c={PLS} bg={PLS_S}>▭ Indikator = kotak</Chip>
      </div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S4 · 24–36s: what each one analyses */
const Col: React.FC<{ k: "spss" | "pls"; left: number; on: boolean; at: number; items: [string, string][] }> = ({ k, left, on, at, items }) => {
  const f = useCurrentFrame();
  const c = k === "spss" ? SPSS : PLS;
  const r = rise(f, k === "spss" ? 4 : 12, 40);
  return (
    <div style={{ position: "absolute", left, top: 470, width: 455, borderRadius: 28, background: "#fff", border: `4px solid ${INK}`, overflow: "hidden", scale: on ? "1" : "0.97", boxShadow: on ? "12px 12px 0 rgba(43,36,32,.12)" : "none", ...r, opacity: r.opacity * (on ? 1 : 0.45) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", background: c, color: "#fff", fontWeight: 800, fontSize: 38 }}>
        <Logo k={k} size={64} />{k === "spss" ? "SPSS" : "SmartPLS"}
      </div>
      <div style={{ padding: "8px 26px 40px" }}>
        {items.map(([a, b], i) => (
          <div key={a} style={{ marginTop: 34, ...rise(f, at + i * 22, 20) }}>
            <div style={{ fontWeight: 800, fontSize: 38, color: T.ink }}>{a}</div>
            <div style={{ fontFamily: MONO, fontSize: 24, color: c, marginTop: 6, lineHeight: 1.35 }}>{b}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export const S4Analysis: React.FC = () => {
  const f = useCurrentFrame();
  const plsOn = f >= 176;
  return (
    <AbsoluteFill style={{ fontFamily: SANS, background: BG }}>
      <Title at={0}>Analisisnya<br /><Mark at={10}>beda alur</Mark></Title>
      <Col k="spss" left={60} on={!plsOn} at={16} items={[["Uji validitas", "Pearson · r hitung > r tabel"], ["Uji reliabilitas", "Cronbach's α > 0,60"], ["Uji asumsi klasik", "normalitas · multikol · hetero"], ["Regresi + uji t/F", "Sig. < 0,05"]]} />
      <Col k="pls" left={565} on={plsOn} at={186} items={[["Outer model", "loading > 0,70 · AVE > 0,50"], ["Reliabilitas", "CR > 0,70 · HTMT < 0,90"], ["Inner model", "R² · f² · Q²"], ["Bootstrapping", "t > 1,96 · p < 0,05"]]} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1440, fontFamily: MONO, fontSize: 19, color: T.mut, textAlign: "center", ...rise(f, 30) }}>THRESHOLD UMUM · PLS: HAIR ET AL. (2022) · IKUTI ACUAN DOSENMU</div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S5 · 36–48s: pros & cons */
const ProCon: React.FC<{ k: "spss" | "pls"; top: number; at: number; items: [boolean, string][] }> = ({ k, top, at, items }) => {
  const f = useCurrentFrame();
  const c = k === "spss" ? SPSS : PLS;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, borderRadius: 28, background: "#fff", border: `4px solid ${INK}`, padding: "22px 28px", boxShadow: "12px 12px 0 rgba(43,36,32,.10)", ...rise(f, at - 10, 40) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontWeight: 800, fontSize: 40, color: c }}><Logo k={k} size={70} />{k === "spss" ? "SPSS" : "SmartPLS"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px", marginTop: 20 }}>
        {items.map(([ok, t], i) => (
          <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "22px 18px", borderRadius: 18, background: ok ? "#E6F2E3" : "#FBE3E3", fontWeight: 700, fontSize: 32, lineHeight: 1.25, ...pop(f, at + i * 16) }}>
            <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: ok ? T.green : "#E5484D", color: "#fff", fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{ok ? "✓" : "✗"}</span>{t}
          </div>
        ))}
      </div>
    </div>
  );
};
export const S5ProCon: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: SANS, background: BG }}>
    <Title at={0}>Kelebihan &<br /><Mark at={10}>kekurangan</Mark></Title>
    <ProCon k="spss" top={460} at={14} items={[[true, "Mudah dipelajari"], [true, "Tutorial melimpah"], [false, "Asumsi klasik wajib terpenuhi"], [false, "Mediasi perlu macro (PROCESS)"]]} />
    <ProCon k="pls" top={1010} at={186} items={[[true, "Tidak wajib data normal"], [true, "Enak untuk model kompleks"], [true, "Fleksibel soal ukuran sampel"], [false, "Wajib paham outer & inner model"]]} />
    <Footer />
  </AbsoluteFill>
);

/* S6 · 48–55s: when to use which */
export const S6When: React.FC = () => {
  const f = useCurrentFrame();
  const br = (a: number) => interpolate(f, [a, a + 14], [0, 1], { ...CL, easing: EASE });
  return (
    <AbsoluteFill style={{ fontFamily: SANS, background: BG }}>
      <Title at={0}>Jadi, <Mark at={8}>kapan</Mark> pakai<br />yang mana?</Title>
      <div style={{ position: "absolute", left: 90, right: 90, top: 470, padding: "24px 30px", borderRadius: 24, background: T.ink, color: "#fff", fontWeight: 800, fontSize: 36, lineHeight: 1.3, textAlign: "center", ...pop(f, 10) }}>
        Variabel diukur banyak indikator + ada mediasi/moderasi?
      </div>
      <svg width={1080} height={160} style={{ position: "absolute", left: 0, top: 640 }}>
        <path d="M540 0 V50 H270 V150" fill="none" stroke={INK} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - br(30)} />
        <path d="M540 0 V50 H810 V150" fill="none" stroke={INK} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - br(60)} />
      </svg>
      {[{ x: 60, k: "pls" as const, a: 40, yes: true, t: "SmartPLS", s: "variabel laten · model kompleks" }, { x: 580, k: "spss" as const, a: 70, yes: false, t: "SPSS", s: "model sederhana · uji beda" }].map((b) => (
        <div key={b.t} style={{ position: "absolute", left: b.x, top: 800, width: 440, borderRadius: 26, background: "#fff", border: `4px solid ${INK}`, padding: "20px 24px", textAlign: "center", boxShadow: "10px 10px 0 rgba(43,36,32,.12)", ...pop(f, b.a) }}>
          <div style={{ display: "inline-block", padding: "6px 20px", borderRadius: 999, background: b.yes ? T.green : "#E5484D", color: "#fff", fontWeight: 800, fontSize: 28 }}>{b.yes ? "YA" : "TIDAK"}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 14, fontWeight: 800, fontSize: 44, color: b.k === "pls" ? PLS : SPSS }}><Logo k={b.k} size={70} />{b.t}</div>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 24, color: T.mut, lineHeight: 1.35 }}>{b.s}</div>
        </div>
      ))}
      <Guy expr="confident" armL={10} armR={120} style={{ left: 330, top: 1110, width: 420, height: 630 }} />
      <Footer />
    </AbsoluteFill>
  );
};

/* S7 · 55–60s: CTA text */
export const S7Cta: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Room />
      <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontWeight: 800, fontSize: 170, letterSpacing: -6, color: T.ink, ...pop(f, 4) }}>Mau?</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", ...pop(f, 14) }}>
        <div style={{ padding: "22px 40px", borderRadius: 999, background: T.orange, color: "#fff", border: `5px solid ${INK}`, fontWeight: 800, fontSize: 60, boxShadow: "10px 10px 0 rgba(43,36,32,.18)" }}>Klik link di bio ya 👆</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", gap: 40 }}>
        <Logo k="spss" size={170} style={pop(f, 24)} />
        <Logo k="pls" size={170} style={pop(f, 30)} />
      </div>
      <Guy expr="happy" armL={10} armR={168} style={{ left: 280, top: 900, width: 520, height: 780 }} />
      <Footer />
    </AbsoluteFill>
  );
};
