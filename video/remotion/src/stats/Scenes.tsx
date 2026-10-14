import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CL, EASE, Mark, MONO, SANS, pop, rise } from "../theory/kit";

// "SPSS atau SmartPLS?" — dark cinematic explainer (60s), no character, no VO. Flat surfaces, no glow.
export const D = {
  bg: "#0D1117", bg2: "#121A26", card: "#161E2B", card2: "#1C2636", line: "#2C3849", dot: "#1E2836",
  text: "#E8ECF2", mut: "#8A96A8", spss: "#5AA2EA", spssS: "rgba(90,162,234,.16)", pls: "#F2B544", plsS: "rgba(242,181,68,.16)",
  green: "#4CC38A", greenS: "rgba(76,195,138,.14)", red: "#F0616D", redS: "rgba(240,97,109,.14)",
};
const HL = "rgba(242,181,68,.32)";

export const Bg: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${D.bg} 0%, ${D.bg2} 55%, ${D.bg} 100%)` }}>
    <AbsoluteFill style={{ backgroundImage: `radial-gradient(${D.dot} 2px, transparent 2px)`, backgroundSize: "44px 44px", opacity: 0.8 }} />
  </AbsoluteFill>
);
const Footer: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 80, bottom: 62, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: D.text }}>ResearchQ<span style={{ color: D.pls }}>.</span></div>
    <div style={{ position: "absolute", right: 80, bottom: 68, fontFamily: MONO, fontSize: 21, letterSpacing: 2, color: D.mut }}>@RESEARCHQ.ID</div>
  </>
);
const Title: React.FC<{ at?: number; top?: number; size?: number; center?: boolean; children: React.ReactNode }> = ({ at = 0, top = 240, size = 86, center, children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: 70, right: 70, top, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -3.5, lineHeight: 1.04, color: D.text, textAlign: center ? "center" : "left", ...rise(f, at) }}>{children}</div>;
};
const Logo: React.FC<{ k: "spss" | "pls"; size: number; style?: React.CSSProperties }> = ({ k, size, style }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", border: `${Math.max(3, size / 50)}px solid ${k === "spss" ? D.spss : D.pls}`, background: "#fff", boxShadow: "0 24px 40px -24px rgba(0,0,0,.8)", ...style }}>
    <Img src={staticFile(k === "spss" ? "spss_logo.png" : "pls_logo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", scale: k === "spss" ? "1.08" : "1.04" }} />
  </div>
);
const Chip: React.FC<{ at: number; c: string; bg: string; children: React.ReactNode }> = ({ at, c, bg, children }) => {
  const f = useCurrentFrame();
  return <div style={{ padding: "14px 24px", borderRadius: 999, background: bg, color: c, border: `2px solid ${c}`, fontWeight: 800, fontSize: 30, ...pop(f, at) }}>{children}</div>;
};
const Win: React.FC<{ left: number; top: number; w: number; h: number; title: string; at?: number; children: React.ReactNode }> = ({ left, top, w, h, title, at = 0, children }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left, top, width: w, height: h, borderRadius: 24, background: D.card, border: `2px solid ${D.line}`, overflow: "hidden", boxShadow: "0 40px 60px -40px rgba(0,0,0,.9)", ...rise(f, at, 40) }}>
      <div style={{ height: 56, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `2px solid ${D.line}`, background: D.card2 }}>
        {["#F0616D", "#F2B544", "#4CC38A"].map((c) => <span key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c, opacity: 0.85 }} />)}
        <span style={{ marginLeft: 12, fontFamily: MONO, fontSize: 21, color: D.mut }}>{title}</span>
      </div>
      <div style={{ position: "relative", height: h - 56 }}>{children}</div>
    </div>
  );
};
const Head: React.FC<{ k: "spss" | "pls"; name: string; tag: string }> = ({ k, name, tag }) => {
  const f = useCurrentFrame();
  const c = k === "spss" ? D.spss : D.pls;
  return (
    <div style={{ position: "absolute", left: 70, top: 230, display: "flex", alignItems: "center", gap: 26, ...rise(f, 0) }}>
      <Logo k={k} size={150} />
      <div>
        <div style={{ fontWeight: 800, fontSize: 92, letterSpacing: -3.5, lineHeight: 1, color: D.text }}>{name}</div>
        <div style={{ marginTop: 12, display: "inline-block", padding: "8px 20px", borderRadius: 999, background: c, color: D.bg, fontWeight: 800, fontSize: 30 }}>{tag}</div>
      </div>
    </div>
  );
};

/* S1 · 0–4s hook */
export const S1Hook: React.FC = () => {
  const f = useCurrentFrame();
  const split = interpolate(f, [0, 14], [0, 1], { ...CL, easing: EASE });
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Bg />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 540, background: D.spssS, translate: `${(split - 1) * 540}px 0px` }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 540, background: D.plsS, translate: `${(1 - split) * 540}px 0px` }} />
      <Title at={2} top={290} size={108} center><span style={{ color: D.spss }}>SPSS</span> atau<br /><span style={{ color: D.pls }}>SmartPLS</span>?</Title>
      {(["spss", "pls"] as const).map((k, i) => (
        <div key={k} style={{ position: "absolute", left: i ? 600 : 120, top: 640, width: 360, textAlign: "center", ...pop(f, 8 + i * 6) }}>
          <Logo k={k} size={300} style={{ margin: "0 auto", translate: `0px ${Math.sin(f / 12 + i * 2) * 10}px` }} />
          <div style={{ marginTop: 26, fontWeight: 800, fontSize: 48, color: i ? D.pls : D.spss }}>{i ? "SmartPLS" : "SPSS"}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 470, top: 720, width: 140, height: 140, borderRadius: "50%", background: D.bg, border: `3px solid ${D.text}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 52, color: D.text, ...pop(f, 20) }}>VS</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, display: "flex", justifyContent: "center", ...rise(f, 34) }}>
        <div style={{ padding: "18px 34px", borderRadius: 999, border: `2px solid ${D.line}`, background: D.card, fontWeight: 800, fontSize: 44, color: D.text }}>Kenalan dengan <Mark at={40} c={HL}>2 software ini</Mark></div>
      </div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S2 · 4–14s: SPSS */
const DATA = [[4, 5, 4], [3, 4, 4], [5, 5, 5], [4, 3, 4], [2, 3, 3], [5, 4, 5], [4, 4, 4], [3, 3, 4]];
const cell = { padding: "7px 14px", border: `1px solid ${D.line}` };
export const S2Spss: React.FC = () => {
  const f = useCurrentFrame();
  const menu = f >= 84 && f < 128;
  const out = f >= 128;
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Bg />
      <Head k="spss" name="SPSS" tag="Statistik umum" />
      <Win left={60} top={450} w={960} h={600} title="SPSS · Data View" at={8}>
        <div style={{ display: "flex", gap: 26, padding: "12px 22px", borderBottom: `1px solid ${D.line}`, fontSize: 24, color: D.mut }}>
          {["File", "Edit", "Data", "Transform", "Analyze", "Graphs"].map((m) => {
            const on = m === "Analyze" && f >= 70;
            return <span key={m} style={{ fontWeight: on ? 800 : 500, color: on ? D.spss : D.mut, padding: "2px 8px", borderRadius: 8, background: on ? D.spssS : "transparent" }}>{m}</span>;
          })}
        </div>
        <div style={{ position: "absolute", left: 22, top: 70, right: 22, fontFamily: MONO, fontSize: 24, color: D.text }}>
          <div style={{ display: "flex", background: D.card2, fontWeight: 700, color: D.mut }}>
            {["#", "X1", "X2", "Y"].map((h, i) => <div key={h} style={{ ...cell, flex: i ? 1 : 0.5 }}>{h}</div>)}
          </div>
          {DATA.map((r, i) => (
            <div key={i} style={{ display: "flex", opacity: interpolate(f, [14 + i * 4, 20 + i * 4], [0, 1], CL) }}>
              <div style={{ ...cell, flex: 0.5, color: D.mut }}>{i + 1}</div>
              {r.map((v, j) => <div key={j} style={{ ...cell, flex: 1 }}>{v}</div>)}
            </div>
          ))}
        </div>
        {menu ? (
          <div style={{ position: "absolute", left: 360, top: 56, width: 380, borderRadius: 16, background: D.card2, border: `2px solid ${D.line}`, padding: 10, fontSize: 26, color: D.text, ...pop(f, 84) }}>
            {["Descriptive Statistics", "Compare Means", "Correlate", "Regression ▸"].map((m, i) => (
              <div key={m} style={{ padding: "10px 14px", borderRadius: 10, fontWeight: 700, background: i === 3 && f >= 100 ? D.spssS : "transparent", color: i === 3 && f >= 100 ? D.spss : D.text }}>{m}</div>
            ))}
            {f >= 108 ? <div style={{ position: "absolute", left: 360, top: 160, padding: "10px 18px", borderRadius: 12, background: D.spss, color: D.bg, fontWeight: 800, fontSize: 26, ...pop(f, 108) }}>Linear</div> : null}
          </div>
        ) : null}
        {out ? (
          <div style={{ position: "absolute", left: 110, right: 110, top: 140, borderRadius: 18, background: D.card2, border: `2px solid ${D.spss}`, padding: "18px 22px", color: D.text, ...pop(f, 128) }}>
            <div style={{ fontWeight: 800, fontSize: 28, marginBottom: 10 }}>Coefficients</div>
            <div style={{ fontFamily: MONO, fontSize: 24 }}>
              {[["Model", "B", "t", "Sig."], ["X1", "0,412", "4,87", ",000"], ["X2", "0,287", "3,12", ",002"]].map((r, i) => (
                <div key={i} style={{ display: "flex", borderTop: i ? `1px solid ${D.line}` : "none", fontWeight: i ? 500 : 700, color: i ? D.text : D.mut, opacity: interpolate(f, [132 + i * 6, 138 + i * 6], [0, 1], CL) }}>
                  {r.map((c, j) => <div key={j} style={{ flex: 1, padding: "8px 6px", color: i && j === 3 ? D.green : undefined }}>{c}</div>)}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 18, color: D.mut }}>CONTOH ILUSTRASI</div>
          </div>
        ) : null}
      </Win>
      <div style={{ position: "absolute", left: 60, right: 60, top: 1100, display: "flex", flexWrap: "wrap", gap: 16 }}>
        {["Regresi linear berganda", "Uji t & uji F", "ANOVA", "Korelasi"].map((t, i) => <Chip key={t} at={150 + i * 12} c={D.spss} bg={D.spssS}>{t}</Chip>)}
      </div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S3 · 14–24s: SmartPLS */
const CONS = [{ id: "X1", x: 300, y: 230 }, { id: "X2", x: 300, y: 590 }, { id: "Y", x: 700, y: 410 }];
const IND: { c: number; x: number; y: number; l: string }[] = [
  { c: 0, x: 80, y: 140, l: "0,81" }, { c: 0, x: 80, y: 230, l: "0,77" }, { c: 0, x: 80, y: 320, l: "0,84" },
  { c: 1, x: 80, y: 500, l: "0,79" }, { c: 1, x: 80, y: 590, l: "0,86" }, { c: 1, x: 80, y: 680, l: "0,74" },
  { c: 2, x: 890, y: 320, l: "0,82" }, { c: 2, x: 890, y: 410, l: "0,88" }, { c: 2, x: 890, y: 500, l: "0,80" },
];
export const S3Pls: React.FC = () => {
  const f = useCurrentFrame();
  const calc = f >= 176;
  const draw = (a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...CL, easing: EASE });
  const ln = "#AEB8C6";
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Bg />
      <Head k="pls" name="SmartPLS" tag="PLS-SEM · model visual" />
      <Win left={40} top={450} w={1000} h={850} title="SmartPLS · Model" at={8}>
        <svg viewBox="0 0 1000 794" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill={ln} /></marker></defs>
          {IND.map((d, i) => {
            const c = CONS[d.c];
            const p = draw(54 + i * 4, 70 + i * 4);
            const x0 = d.c === 2 ? c.x + 80 : c.x - 80, x1 = d.c === 2 ? d.x - 46 : d.x + 46;
            return (
              <g key={i}>
                <line x1={x0} y1={c.y} x2={x0 + (x1 - x0) * p} y2={c.y + (d.y - c.y) * p} stroke={ln} strokeWidth={2.5} markerEnd={p > 0.95 ? "url(#ah)" : undefined} />
                {calc ? <text x={(x0 + x1) / 2 - 18} y={(c.y + d.y) / 2 - 8} fontFamily="JetBrainsMono" fontSize={19} fill={D.pls} fontWeight={700} opacity={interpolate(f, [182 + i * 2, 188 + i * 2], [0, 1], CL)}>{d.l}</text> : null}
              </g>
            );
          })}
          {[[0, "0,42"], [1, "0,31"]].map(([ci, b], i) => {
            const c = CONS[ci as number]; const y = CONS[2];
            const p = draw(110 + i * 14, 136 + i * 14);
            const x1 = y.x - 84, y1 = y.y + (c.y - y.y) * 0.18;
            return (
              <g key={i}>
                <line x1={c.x + 80} y1={c.y} x2={c.x + 80 + (x1 - c.x - 80) * p} y2={c.y + (y1 - c.y) * p} stroke={D.text} strokeWidth={4} markerEnd={p > 0.95 ? "url(#ah)" : undefined} />
                {calc ? <text x={(c.x + x1) / 2 + 40} y={(c.y + y1) / 2 - 14} fontFamily="JetBrainsMono" fontSize={30} fontWeight={800} fill={D.pls} opacity={interpolate(f, [190, 198], [0, 1], CL)}>{b}</text> : null}
              </g>
            );
          })}
        </svg>
        {CONS.map((c, i) => (
          <div key={c.id} style={{ position: "absolute", left: c.x - 80, top: c.y - 80, width: 160, height: 160, borderRadius: "50%", background: i === 2 ? D.plsS : D.spssS, border: `3px solid ${i === 2 ? D.pls : D.spss}`, color: D.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 40, ...pop(f, 18 + i * 10) }}>
            {c.id}
            {calc && i === 2 ? <span style={{ fontFamily: MONO, fontSize: 22, color: D.pls, ...pop(f, 196) }}>R² 0,52</span> : null}
          </div>
        ))}
        {IND.map((d, i) => (
          <div key={i} style={{ position: "absolute", left: d.x - 46, top: d.y - 26, width: 92, height: 52, borderRadius: 8, background: "#2A2414", border: `2px solid ${D.pls}`, color: D.pls, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 20, ...pop(f, 48 + i * 4) }}>
            {["X1", "X1", "X1", "X2", "X2", "X2", "Y", "Y", "Y"][i]}.{(i % 3) + 1}
          </div>
        ))}
        <div style={{ position: "absolute", left: 420, top: 640, padding: "14px 22px", borderRadius: 14, background: calc ? D.pls : D.card2, color: calc ? D.bg : D.text, border: `2px solid ${D.pls}`, fontWeight: 800, fontSize: 26, ...pop(f, 150), scale: f >= 168 && f < 176 ? "0.94" : "1" }}>▶ Calculate PLS-SEM</div>
        {calc ? <div style={{ position: "absolute", left: 420, top: 726, fontFamily: MONO, fontSize: 17, color: D.mut }}>CONTOH ILUSTRASI</div> : null}
      </Win>
      <div style={{ position: "absolute", left: 40, right: 40, top: 1340, display: "flex", gap: 16 }}>
        <Chip at={70} c={D.spss} bg={D.spssS}>◯ Variabel = lingkaran</Chip>
        <Chip at={84} c={D.pls} bg={D.plsS}>▭ Indikator = kotak</Chip>
      </div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S4 · 24–36s: analysis flow */
const Col: React.FC<{ k: "spss" | "pls"; left: number; on: boolean; at: number; items: [string, string][] }> = ({ k, left, on, at, items }) => {
  const f = useCurrentFrame();
  const c = k === "spss" ? D.spss : D.pls;
  const r = rise(f, k === "spss" ? 4 : 12, 40);
  return (
    <div style={{ position: "absolute", left, top: 470, width: 455, borderRadius: 26, background: D.card, border: `2px solid ${on ? c : D.line}`, overflow: "hidden", scale: on ? "1" : "0.97", ...r, opacity: r.opacity * (on ? 1 : 0.4) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", background: on ? c : D.card2, color: on ? D.bg : D.text, fontWeight: 800, fontSize: 38 }}>
        <Logo k={k} size={64} />{k === "spss" ? "SPSS" : "SmartPLS"}
      </div>
      <div style={{ padding: "8px 26px 40px" }}>
        {items.map(([a, b], i) => (
          <div key={a} style={{ marginTop: 34, ...rise(f, at + i * 22, 20) }}>
            <div style={{ fontWeight: 800, fontSize: 38, color: D.text }}><span style={{ fontFamily: MONO, fontSize: 24, color: c, marginRight: 10 }}>0{i + 1}</span>{a}</div>
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
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Bg />
      <Title at={0}>Analisisnya<br /><Mark at={10} c={HL}>beda alur</Mark></Title>
      <Col k="spss" left={60} on={!plsOn} at={16} items={[["Uji validitas", "Pearson · r hitung > r tabel"], ["Uji reliabilitas", "Cronbach's α > 0,60"], ["Asumsi klasik", "normalitas · multikol · hetero"], ["Regresi + uji t/F", "Sig. < 0,05"]]} />
      <Col k="pls" left={565} on={plsOn} at={186} items={[["Outer model", "loading > 0,70 · AVE > 0,50"], ["Reliabilitas", "CR > 0,70 · HTMT < 0,90"], ["Inner model", "R² · f² · Q²"], ["Bootstrapping", "t > 1,96 · p < 0,05"]]} />
      <div style={{ position: "absolute", left: 60, right: 60, top: 1440, fontFamily: MONO, fontSize: 19, color: D.mut, textAlign: "center", ...rise(f, 30) }}>THRESHOLD UMUM · PLS: HAIR ET AL. (2022) · IKUTI ACUAN DOSENMU</div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S5 · 36–48s: pros & cons */
const ProCon: React.FC<{ k: "spss" | "pls"; top: number; at: number; items: [boolean, string][] }> = ({ k, top, at, items }) => {
  const f = useCurrentFrame();
  const c = k === "spss" ? D.spss : D.pls;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, borderRadius: 26, background: D.card, border: `2px solid ${D.line}`, padding: "22px 28px", ...rise(f, at - 10, 40) }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontWeight: 800, fontSize: 40, color: c }}><Logo k={k} size={70} />{k === "spss" ? "SPSS" : "SmartPLS"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px", marginTop: 20 }}>
        {items.map(([ok, t], i) => (
          <div key={t} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "22px 18px", borderRadius: 18, background: ok ? D.greenS : D.redS, border: `2px solid ${ok ? "rgba(76,195,138,.35)" : "rgba(240,97,109,.35)"}`, color: D.text, fontWeight: 700, fontSize: 32, lineHeight: 1.25, ...pop(f, at + i * 16) }}>
            <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: "50%", background: ok ? D.green : D.red, color: D.bg, fontWeight: 800, fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{ok ? "✓" : "✗"}</span>{t}
          </div>
        ))}
      </div>
    </div>
  );
};
export const S5ProCon: React.FC = () => (
  <AbsoluteFill style={{ fontFamily: SANS }}>
    <Bg />
    <Title at={0}>Kelebihan &<br /><Mark at={10} c={HL}>kekurangan</Mark></Title>
    <ProCon k="spss" top={460} at={14} items={[[true, "Mudah dipelajari"], [true, "Tutorial melimpah"], [false, "Asumsi klasik wajib terpenuhi"], [false, "Mediasi perlu macro (PROCESS)"]]} />
    <ProCon k="pls" top={1010} at={186} items={[[true, "Tidak wajib data normal"], [true, "Enak untuk model kompleks"], [true, "Fleksibel soal ukuran sampel"], [false, "Wajib paham outer & inner model"]]} />
    <Footer />
  </AbsoluteFill>
);

/* S6 · 48–55s: decision */
export const S6When: React.FC = () => {
  const f = useCurrentFrame();
  const br = (a: number) => interpolate(f, [a, a + 14], [0, 1], { ...CL, easing: EASE });
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Bg />
      <Title at={0}>Jadi, <Mark at={8} c={HL}>kapan</Mark> pakai<br />yang mana?</Title>
      <div style={{ position: "absolute", left: 80, right: 80, top: 480, padding: "28px 32px", borderRadius: 24, background: D.card, border: `2px solid ${D.text}`, color: D.text, fontWeight: 800, fontSize: 40, lineHeight: 1.3, textAlign: "center", ...pop(f, 10) }}>
        Variabel diukur banyak indikator + ada mediasi/moderasi?
      </div>
      <svg width={1080} height={170} style={{ position: "absolute", left: 0, top: 680 }}>
        <path d="M540 0 V60 H280 V170" fill="none" stroke={D.green} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - br(30)} />
        <path d="M540 0 V60 H800 V170" fill="none" stroke={D.red} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - br(60)} />
      </svg>
      {[{ x: 60, k: "pls" as const, a: 40, yes: true, t: "SmartPLS", s: ["Variabel laten", "Mediasi / moderasi", "Model kompleks"] }, { x: 580, k: "spss" as const, a: 70, yes: false, t: "SPSS", s: ["Variabel langsung", "Model sederhana", "Uji beda (t-test, ANOVA)"] }].map((b) => {
        const c = b.k === "pls" ? D.pls : D.spss;
        return (
          <div key={b.t} style={{ position: "absolute", left: b.x, top: 850, width: 440, borderRadius: 26, background: D.card, border: `2px solid ${c}`, padding: "26px 26px 30px", textAlign: "center", ...pop(f, b.a) }}>
            <div style={{ display: "inline-block", padding: "6px 22px", borderRadius: 999, background: b.yes ? D.green : D.red, color: D.bg, fontWeight: 800, fontSize: 28 }}>{b.yes ? "YA" : "TIDAK"}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 18, fontWeight: 800, fontSize: 46, color: c }}><Logo k={b.k} size={76} />{b.t}</div>
            {b.s.map((t, i) => <div key={t} style={{ marginTop: i ? 10 : 22, fontSize: 28, fontWeight: 700, color: D.text, ...rise(f, b.a + 10 + i * 6, 14) }}>• {t}</div>)}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", fontFamily: MONO, fontSize: 22, color: D.mut, ...rise(f, 110) }}>MASIH RAGU? DISKUSIKAN DENGAN DOSEN PEMBIMBING</div>
      <Footer />
    </AbsoluteFill>
  );
};

/* S7 · 55–60s: CTA text */
export const S7Cta: React.FC = () => {
  const f = useCurrentFrame();
  const ring = (f % 40) / 40;
  return (
    <AbsoluteFill style={{ fontFamily: SANS }}>
      <Bg />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 40 }}>
        <Logo k="spss" size={180} style={pop(f, 2)} />
        <Logo k="pls" size={180} style={pop(f, 8)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontWeight: 800, fontSize: 200, letterSpacing: -8, color: D.text, ...pop(f, 12) }}>Mau?</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", ...pop(f, 22) }}>
        <div style={{ position: "relative", padding: "26px 46px", borderRadius: 999, background: D.pls, color: D.bg, fontWeight: 800, fontSize: 64 }}>
          Klik link di bio ya
          <div style={{ position: "absolute", inset: -4, borderRadius: 999, border: `3px solid ${D.pls}`, scale: `${1 + ring * 0.18} ${1 + ring * 0.5}`, opacity: f > 30 ? 1 - ring : 0 }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040 - Math.abs(Math.sin(f / 7)) * 24, textAlign: "center", fontSize: 90, fontWeight: 800, color: D.pls, ...rise(f, 30) }}>↑</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", fontFamily: MONO, fontSize: 26, letterSpacing: 3, color: D.mut, ...rise(f, 36) }}>@RESEARCHQ.ID</div>
      <Footer />
    </AbsoluteFill>
  );
};
