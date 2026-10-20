import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CL, Cam, EASE, Glow, Grain, Mark, MONO, OR, Ribbons, SANS, Vignette } from "../cine/Cine";
import { F, P1, P2, P3, Q3, QS, SEND, Subs, T, rise, typed, wf, ws } from "./Udik";
import { Backdrop, BackdropVariant } from "./backdrops";

// "Mahasiswa udik" — style 1: dark cinematic UI fly-through (black stage, orange light, a 3D camera over a dark Claude-style screen,
// light streaks round the input, white mark → wordmark). Same VO, same word timings, same sparse SFX as the light version.
export const INK = "#F4F1EC", MUTE = "#9A958C", RED = "#FF5A4E", GREEN = "#3DD68C";
export const DK_BG = "#1F1E1D", DK_BUB = "#34322F", DK_LINE = "#3B3935", DK_PANEL = "#171615";
export const AV = ["#F28A2E", "#5B7CFA", "#3DD68C", "#A78BFA", "#F472B6"];
const pop = (g: number, at: number) => ({ opacity: g >= at ? 1 : 0, scale: `${interpolate(g, [at, at + 6], [1.35, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` });

export const Stage: React.FC<{ glow?: [number, number, number, number]; variant?: BackdropVariant; children: React.ReactNode }> = ({ glow = [540, 1500, 1000, 0.42], variant = "warm", children }) => (
  <AbsoluteFill style={{ background: "#060504", overflow: "hidden" }}>
    {variant === "warm" ? <Glow x={glow[0]} y={glow[1]} r={glow[2]} o={glow[3]} /> : <Backdrop variant={variant} />}
    {children}
    <Vignette />
    <Grain />
  </AbsoluteFill>
);
export const KW: React.FC<{ g: number; at: number; acc?: boolean; red?: boolean; children: React.ReactNode }> = ({ g, at, acc, red, children }) => {
  const p = rise(g, at, 9);
  return (
    <span style={{ display: "inline-block", opacity: g >= at ? p : 0, filter: `blur(${(1 - p) * 12}px)`, transform: `translateY(${(1 - p) * 34}px)`, color: red ? RED : acc ? OR : INK, marginRight: "0.2em" }}>{children}</span>
  );
};
export const Kin: React.FC<{ g: number; top: number; size: number; words: [string, number, ("acc" | "red")?][]; mute?: boolean; align?: "left" | "center" }> = ({ g, top, size, words, mute, align = "left" }) => (
  <div style={{ position: "absolute", left: 76, right: 76, top, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -2.5, lineHeight: 1.04, color: mute ? MUTE : INK, textAlign: align }}>
    {words.map(([w, at, k], i) => <KW key={i} g={g} at={at} acc={k === "acc"} red={k === "red"}>{w}</KW>)}
  </div>
);
export const Avatar: React.FC<{ i: number; size?: number }> = ({ i, size = 90 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: AV[i], display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #060504", flex: "none" }}>
    <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="#111" strokeWidth={1.9} strokeLinecap="round"><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c1.2-4 4-5.6 7-5.6s5.8 1.6 7 5.6" /></svg>
  </div>
);
export const Icon: React.FC<{ n: string; c?: string; size: number; sw?: number }> = ({ n, c = INK, size, sw = 1.8 }) => {
  const P: Record<string, React.ReactNode> = {
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="M4 12.5l5 5L20 6.5" />,
    x: <path d="M5 5l14 14 M19 5L5 19" />,
    play: <><rect x="3" y="5" width="18" height="14" rx="4" /><path d="M10 9l5 3-5 3z" /></>,
    spoon: <g transform="rotate(-22 12 12)"><ellipse cx="12" cy="6.5" rx="3.6" ry="5" fill={c} /><path d="M12 11.5V22" /></g>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></>,
    menu: <path d="M4 7h16 M4 12h16 M4 17h16" />,
    plus: <path d="M12 5v14 M5 12h14" />,
    up: <path d="M12 19V6 M6 11l6-6 6 6" />,
    person: <><circle cx="12" cy="8" r="3.6" /><path d="M5 20c1-4 4-5.6 7-5.6s6 1.6 7 5.6" /></>,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ overflow: "visible" }}>{P[n]}</svg>;
};
export const Tag: React.FC<{ g: number; at: number; children: React.ReactNode }> = ({ g, at, children }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top: 130, fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: OR, opacity: rise(g, at, 8) }}>{children}</div>
);
export const Win: React.FC<{ style: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", borderRadius: 30, background: DK_PANEL, border: `2px solid ${DK_LINE}`, boxShadow: "0 70px 120px -50px rgba(0,0,0,.95)", fontFamily: SANS, color: INK, ...style }}>{children}</div>
);

/* ---- A · Hook ---- */
const Hook: React.FC = () => {
  const g = useCurrentFrame();
  const wait = wf("nunggu");
  return (
    <Stage>
      <Tag g={g} at={4}>TANYA CLAUDE</Tag>
      <Cam s={interpolate(g, [0, F(T.b)], [1, 1.07])} y={interpolate(g, [0, F(T.b)], [0, -30])}>
        <Kin g={g} top={270} size={108} words={[["Katanya", wf("katanya")], ["masih", wf("masih")], ["mahasiswa,", wf("mahasiswa"), "acc"]]} />
        <Kin g={g} top={540} size={86} words={[["tapi", wf("tapi")], ["mau", wf("mau")], ["pakai", wf("pake")], ["AI", wf("ai"), "acc"], ["aja", wf("aja")]]} />
        <Kin g={g} top={720} size={86} words={[["semua", wf("semua")], ["harus", wf("harus")], ["nunggu", wait, "red"], ["dijelasin", wf("dijelasin")], ["orang", wf("orang")], ["lain.", wf("lain")]]} />
      </Cam>
      <Cam rx={interpolate(g, [0, 40], [30, 12], { ...CL, easing: EASE })} ry={interpolate(g, [0, F(T.b)], [-10, 8])} y={40} s={1}>
        <Win style={{ left: 110, right: 110, top: 1060, height: 250, padding: "30px 40px", opacity: rise(g, wf("harus"), 10), translate: `0px ${(1 - rise(g, wf("harus"), 10)) * 60}px` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Avatar i={0} size={92} />
            <div style={{ fontWeight: 700, fontSize: 38 }}>Kamu<div style={{ fontWeight: 500, fontSize: 28, color: MUTE }}>menunggu dijelasin…</div></div>
            <div style={{ marginLeft: "auto", rotate: `${(g - wait) * 6}deg`, opacity: g >= wait ? 1 : 0.25 }}><Icon n="clock" c={RED} size={84} sw={1.6} /></div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 26 }}>
            {[1, 2, 3].map((i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 999, background: DK_BUB, opacity: g >= wf("orang") + i * 3 ? 1 : 0 }}><Avatar i={i} size={40} />{[0, 1, 2].map((d) => <i key={d} style={{ width: 11, height: 11, borderRadius: "50%", background: "#B9B4A9", opacity: 0.3 + 0.7 * Math.max(0, Math.sin((g - d * 5) / 5)) }} />)}</div>)}
          </div>
        </Win>
      </Cam>
      <Ribbons arcs={["M-60 1010 C 300 940, 760 940, 1140 1010", "M1140 1380 C 780 1450, 300 1450, -60 1370"]} f={g} at={wait} gap={6} len={26} />
    </Stage>
  );
};

/* ---- B · The questions, dive into "Claude-nya" ---- */
const Questions: React.FC = () => {
  const g = useCurrentFrame() + F(T.b);
  const bro = wf("bro"), cn = wf("claude-nya");
  const dive = interpolate(g, [cn + 6, F(T.c) + 12], [0, 1], { ...CL, easing: Easing.in(Easing.cubic) });
  return (
    <Stage glow={[540, 900, 900, 0.35]}>
      <Tag g={g} at={F(T.b)}>GRUP CHAT</Tag>
      <Cam rx={interpolate(g, [F(T.b), F(T.b) + 24, F(T.c)], [26, 12, 6], { ...CL, easing: EASE })} ry={interpolate(g, [F(T.b), F(T.c)], [-12, 8])} y={interpolate(g, [wf("harga"), bro + 10], [0, -160], { ...CL, easing: EASE })}
        s={1 + dive * 5} blur={dive * 14} x={-dive * 40}>
        <div style={{ opacity: 1 - interpolate(dive, [0.55, 1], [0, 1], CL) }}>
          {QS.map(([t, w, n], k) => {
            const at = wf(w, n);
            return (
              <div key={k} style={{ position: "absolute", right: 70, top: 280 + k * 150, display: "flex", alignItems: "flex-end", gap: 16, ...pop(g, at) }}>
                <div style={{ maxWidth: 700, padding: "20px 30px", borderRadius: "34px 34px 8px 34px", background: OR, color: "#1A0E04", fontFamily: SANS, fontWeight: 700, fontSize: 38, lineHeight: 1.2 }}>{t}</div>
                <Avatar i={0} size={74} />
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 70, top: 1060, display: "flex", alignItems: "flex-end", gap: 16, ...pop(g, bro) }}>
            <Avatar i={1} size={74} />
            <div style={{ maxWidth: 760, padding: "22px 30px", borderRadius: "34px 34px 34px 8px", background: DK_BUB, border: `2px solid ${DK_LINE}`, fontFamily: SANS, fontWeight: 700, fontSize: 42, lineHeight: 1.22, color: INK }}>
              Bro, kenapa nggak lu tanya langsung ke <span style={{ color: OR, background: g >= cn ? "rgba(242,138,46,.2)" : "transparent" }}>Claude-nya</span> langsung?
            </div>
          </div>
        </div>
      </Cam>
      <Ribbons arcs={["M-60 1130 C 300 1040, 760 1040, 1140 1130", "M1140 1360 C 780 1440, 300 1440, -60 1360"]} f={g} at={cn} gap={5} len={22} />
    </Stage>
  );
};

/* ---- C · The Claude screen (dark), camera drifting, light streaks round the input ---- */
export const Skel: React.FC<{ g: number; at: number; widths: number[]; head?: string[] }> = ({ g, at, widths, head }) => (
  <div style={{ display: "flex", gap: 22, opacity: g >= at ? 1 : 0 }}>
    <Img src={staticFile("claude_logo_t.png")} style={{ width: 54, height: 54, flex: "none", marginTop: 4 }} />
    <div style={{ flex: 1 }}>
      {widths.map((w, k) => {
        const p = interpolate(g, [at + k * 5, at + k * 5 + 14], [0, 1], { ...CL, easing: EASE });
        return (
          <div key={k} style={{ marginTop: k ? 16 : 6 }}>
            {head?.[k] ? <div style={{ fontFamily: "Tinos, serif", fontSize: 36, color: INK, opacity: p, marginBottom: 8 }}>{head[k]}</div> : null}
            <div style={{ height: 16, borderRadius: 8, background: "#4A4742", width: `${w * p}%` }} />
            {head ? <div style={{ height: 16, borderRadius: 8, background: "#3A3835", width: `${w * 0.7 * p}%`, marginTop: 8 }} /> : null}
          </div>
        );
      })}
    </div>
  </div>
);
export const ClaudeScreen: React.FC<{ variant?: BackdropVariant }> = ({ variant = "warm" }) => {
  const g = useCurrentFrame() + F(T.c);
  const t = g / 30;
  const arrive = interpolate(g, [F(T.c), F(T.c) + 16], [0, 1], { ...CL, easing: EASE });
  const send = SEND;
  const scroll = interpolate(g, [F(send[2]), F(send[2]) + 14], [0, 360], { ...CL, easing: EASE });
  const phase = t < send[0] ? 1 : t < send[1] ? 2 : 3;
  const draft = phase === 1 ? typed(P1, t) : phase === 2 ? typed(P2, t) : t < send[2] ? typed(P3, t) : "";
  const caret = Math.floor(g / 8) % 2 === 0;
  const inputActive = t >= ws("tanya", 1) - 0.1 && t < send[2];
  const bub = (text: string, top: number, h: number, at: number) => (
    <div style={{ position: "absolute", right: 0, top, minHeight: h, maxWidth: 880, padding: "20px 30px", boxSizing: "border-box", borderRadius: 30, background: DK_BUB, color: INK, fontFamily: SANS, fontWeight: 500, fontSize: 34, lineHeight: "46px", opacity: g >= at ? 1 : 0, translate: `0px ${interpolate(g, [at, at + 8], [30, 0], { ...CL, easing: EASE })}px` }}>{text}</div>
  );
  const camX = interpolate(g, [F(T.c), F(T.d)], [30, -30]);
  const arcs = ["M-60 1170 C 300 1060, 760 1060, 1140 1180", "M1140 1440 C 780 1520, 300 1520, -60 1430", "M60 1000 C 20 1180, 30 1360, 140 1470"];
  return (
    <Stage glow={[540, 1400, 900, 0.3]} variant={variant}>
      <Cam x={camX} s={interpolate(arrive, [0, 1], [1.12, 1])} rx={interpolate(arrive, [0, 1], [24, 2])} ry={interpolate(g, [F(T.c), F(T.d)], [-8, 6])} blur={(1 - arrive) * 12} rz={interpolate(g, [F(T.c), F(T.d)], [0.8, -0.6])}>
        <div style={{ position: "absolute", left: 30, right: 30, top: 90, bottom: 510, borderRadius: 46, background: DK_BG, border: `2px solid ${DK_LINE}`, boxShadow: "0 80px 140px -50px rgba(0,0,0,.95)", overflow: "hidden", fontFamily: SANS }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 20, height: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
            <Icon n="menu" c={INK} size={44} /><div style={{ display: "flex", alignItems: "center", gap: 14 }}><Img src={staticFile("claude_logo_t.png")} style={{ width: 44, height: 44 }} /><span style={{ fontFamily: "Tinos, serif", fontSize: 50, color: INK }}>Claude</span></div><Icon n="plus" c={INK} size={44} />
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 122, height: 2, background: DK_LINE }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", opacity: t < send[0] ? 1 : 0 }}>
            <Img src={staticFile("claude_logo_t.png")} style={{ width: 96, height: 96 }} />
            <div style={{ fontFamily: "Tinos, serif", fontSize: 72, color: INK, marginTop: 24, lineHeight: 1.1 }}>Mau tanya<br />apa hari ini?</div>
          </div>
          <div style={{ position: "absolute", left: 50, right: 50, top: 150, height: 1010, overflow: "hidden", WebkitMaskImage: scroll > 4 ? "linear-gradient(to bottom, transparent 0, #000 60px)" : "none" }}>
            <div style={{ position: "relative", transform: `translateY(${-scroll}px)` }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0 }}>{bub(P1.map(([w]) => w).join(" "), 0, 190, F(send[0]))}</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 225 }}><Skel g={g} at={F(send[0]) + 8} widths={[78, 64, 84, 58]} head={["Fitur", "Harga paket", "Kelebihan", "Cara memaksimalkan penggunaan"]} /></div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 650 }}>{bub(P2.map(([w]) => w).join(" "), 0, 96, F(send[1]))}</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 800 }}><Skel g={g} at={F(send[1]) + 8} widths={[86, 70, 52]} /></div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 990 }}>{bub(P3.map(([w]) => w).join(" "), 0, 140, F(send[2]))}</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 1160 }}><Skel g={g} at={F(send[2]) + 8} widths={[82, 66, 48]} /></div>
            </div>
          </div>
        </div>
        {/* input bar */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 1250, minHeight: 120, borderRadius: 42, background: "#262524", border: `3px solid ${inputActive ? OR : DK_LINE}`, padding: "26px 110px 26px 36px", fontFamily: SANS, fontSize: 32, lineHeight: "44px", color: INK, fontWeight: 500, boxSizing: "border-box" }}>
          {draft ? <>{draft}{caret ? <span style={{ borderLeft: `3px solid ${OR}`, marginLeft: 3 }} /> : null}</> : <span style={{ color: "#8A857B" }}>Tanya Claude…</span>}
          <div style={{ position: "absolute", right: 22, top: 22, width: 76, height: 76, borderRadius: "50%", background: draft ? OR : "#5A3A22", display: "flex", alignItems: "center", justifyContent: "center", scale: `${send.some((s) => g >= F(s) && g < F(s) + 6) ? 0.88 : 1}` }}><Icon n="up" c="#1A0E04" size={42} sw={2.6} /></div>
        </div>
      </Cam>
      {/* light streaks: when each prompt starts, and when it is sent */}
      <Ribbons arcs={arcs} f={g} at={ws("claude", 1) * 30 - 6} gap={5} len={26} />
      <Ribbons arcs={arcs} f={g} at={F(send[0])} gap={4} len={20} />
      <Ribbons arcs={arcs} f={g} at={F(send[1])} gap={4} len={20} />
      <Ribbons arcs={arcs} f={g} at={F(send[2])} gap={4} len={20} />
      <div style={{ position: "absolute", left: 60, top: 1388, fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: "#7B766C" }}>ILUSTRASI TAMPILAN</div>
    </Stage>
  );
};

/* ---- D · Beres ---- */
const Done: React.FC = () => {
  const g = useCurrentFrame() + F(T.d);
  const strike = interpolate(g, [wf("tutorial"), wf("tutorial") + 10], [0, 1], { ...CL, easing: EASE });
  const rows: [string, string, number][] = [["check", "Penjelasan awal", wf("penjelasan")], ["person", "Tanpa nunggu orang lain", wf("tanpa")]];
  return (
    <Stage glow={[540, 1000, 900, 0.36]}>
      <Tag g={g} at={F(T.d)}>HASILNYA</Tag>
      <Cam s={interpolate(g, [F(T.d), F(T.e)], [1.06, 1])} rx={interpolate(g, [F(T.d), F(T.d) + 20], [14, 4], { ...CL, easing: EASE })} ry={interpolate(g, [F(T.d), F(T.e)], [-6, 6])}>
        <div style={{ position: "absolute", left: 76, top: 260, display: "flex", alignItems: "center", gap: 28, ...pop(g, wf("beres")) }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 220, letterSpacing: -9, color: INK, lineHeight: 1 }}>Beres</div>
          <div style={{ width: 130, height: 130, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon n="check" c="#052214" size={84} sw={3.2} /></div>
        </div>
        <Kin g={g} top={560} size={64} mute words={[["lo", wf("lo")], ["bisa", wf("bisa", 1)], ["dapet", wf("dapet")]]} />
        {rows.map(([ic, t, at], k) => (
          <Win key={t} style={{ left: 76, right: 76, top: 700 + k * 190, height: 150, display: "flex", alignItems: "center", gap: 28, padding: "0 40px", fontWeight: 800, fontSize: 52, opacity: g >= at - 2 ? 1 : 0, translate: `${interpolate(g, [at, at + 10], [200, 0], { ...CL, easing: EASE })}px 0px` }}>
            <Icon n={ic} c={OR} size={70} sw={1.8} />{t}
          </Win>
        ))}
        <Win style={{ left: 76, right: 76, top: 1080, height: 150, display: "flex", alignItems: "center", gap: 28, padding: "0 40px", fontWeight: 800, fontSize: 50, opacity: g >= wf("bikin") - 2 ? 1 : 0, translate: `${interpolate(g, [wf("bikin"), wf("bikin") + 10], [200, 0], { ...CL, easing: EASE })}px 0px` }}>
          <Icon n="play" c={MUTE} size={70} sw={1.6} />
          <span style={{ position: "relative", color: MUTE }}>tutorial orang lain<i style={{ position: "absolute", left: 0, top: "52%", height: 7, width: `${strike * 100}%`, background: RED, borderRadius: 4 }} /></span>
          <span style={{ marginLeft: "auto", opacity: strike }}><Icon n="x" c={RED} size={64} sw={2.8} /></span>
        </Win>
      </Cam>
    </Stage>
  );
};

/* ---- E · rasa ingin tahu ---- */
const Curious: React.FC = () => {
  const g = useCurrentFrame() + F(T.e);
  const sp = wf("disuapin");
  const strike = interpolate(g, [sp, sp + 10], [0, 1], { ...CL, easing: EASE });
  return (
    <Stage glow={[200, 1500, 900, 0.34]}>
      <Tag g={g} at={F(T.e)}>INGAT</Tag>
      <Cam s={interpolate(g, [F(T.e), F(T.f)], [1.05, 1])}>
        <Kin g={g} top={250} size={104} words={[["Lo", wf("lo", 1)], ["masih", wf("masih", 1)], ["mahasiswa,", wf("mahasiswa", 1), "acc"]]} />
        <Kin g={g} top={470} size={90} words={[["punya", wf("punya")], ["rasa", wf("rasa")], ["ingin", wf("ingin")], ["tahu", wf("tahu")], ["itu", wf("itu")], ["penting.", wf("penting"), "acc"]]} />
        <Kin g={g} top={930} size={60} mute words={[["Jangan", wf("jangan")], ["semua", wf("semua", 1)], ["hal", wf("hal")], ["harus", wf("harus", 2)]]} />
        <Win style={{ left: 76, right: 76, top: 1030, height: 230, display: "flex", alignItems: "center", gap: 36, padding: "0 50px", opacity: g >= sp - 4 ? 1 : 0, scale: `${interpolate(g, [sp - 4, sp + 6], [0.9, 1], { ...CL, easing: EASE })}` }}>
          <Icon n="spoon" c={INK} size={150} sw={2.2} />
          <span style={{ position: "relative", fontWeight: 900, fontSize: 112, color: INK, letterSpacing: -3 }}>disuapin<i style={{ position: "absolute", left: -8, top: "54%", height: 10, width: `${strike * 104}%`, background: RED, borderRadius: 5 }} /></span>
          <span style={{ marginLeft: "auto", opacity: strike, scale: `${1.4 - strike * 0.4}` }}><Icon n="x" c={RED} size={90} sw={2.8} /></span>
        </Win>
      </Cam>
      <Ribbons arcs={["M-60 1010 C 300 940, 760 940, 1140 1020"]} f={g} at={sp - 8} gap={4} len={20} />
    </Stage>
  );
};

/* ---- F · kapan belajar mencari tahu sendiri? ---- */
const When: React.FC = () => {
  const g = useCurrentFrame() + F(T.f);
  const t = g / 30;
  const text = typed(Q3, t);
  const done = t >= ws("sendiri") + 0.3;
  return (
    <Stage glow={[540, 1250, 900, 0.4]}>
      <Tag g={g} at={F(T.f)}>PERTANYAANNYA</Tag>
      <Cam s={interpolate(g, [F(T.f), F(T.end)], [1.05, 1])}>
        <Kin g={g} top={240} size={66} mute words={[["Kalau", wf("kalau")], ["semuanya", wf("semuanya")], ["harus", wf("harus", 3)], ["dijelaskan", wf("dijelaskan")], ["orang", wf("orang", 2)], ["lain,", wf("lain", 3)]]} />
        <Kin g={g} top={520} size={124} words={[["kapan", wf("kapan"), "acc"], ["lo", wf("lo", 2)], ["belajar", wf("belajar")], ["mencari", wf("mencari")], ["tahu", wf("tahu", 1)], ["sendiri?", wf("sendiri"), "acc"]]} />
        <div style={{ position: "absolute", left: 60, right: 60, top: 1090, minHeight: 130, borderRadius: 46, background: "#262524", border: `3px solid ${done ? OR : DK_LINE}`, display: "flex", alignItems: "center", gap: 20, padding: "0 28px 0 36px", boxSizing: "border-box", fontFamily: SANS, fontWeight: 500, fontSize: 38, color: INK, opacity: rise(g, wf("belajar") - 6, 8) }}>
          <Icon n="search" c={MUTE} size={46} />
          <span style={{ flex: 1 }}>{text || <span style={{ color: "#8A857B" }}>Tanya Claude…</span>}{Math.floor(g / 8) % 2 === 0 && !done ? <span style={{ borderLeft: `3px solid ${OR}`, marginLeft: 3 }} /> : null}</span>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: text ? OR : "#5A3A22", display: "flex", alignItems: "center", justifyContent: "center", scale: `${done ? 1 + 0.06 * Math.sin((g - F(ws("sendiri") + 0.3)) / 3) : 1}` }}><Icon n="up" c="#1A0E04" size={46} sw={2.6} /></div>
        </div>
      </Cam>
      <Ribbons arcs={["M-60 1040 C 300 960, 760 960, 1140 1050", "M1140 1290 C 780 1370, 300 1370, -60 1280"]} f={g} at={F(ws("sendiri") + 0.3)} gap={5} len={24} />
    </Stage>
  );
};

/* ---- G · end card: white mark → wordmark ---- */
const End: React.FC = () => {
  const g = useCurrentFrame() + F(T.end);
  const s = F(T.end), word = "RESEARCHQ";
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Glow x={540} y={1900} r={700} o={interpolate(g, [s + 6, s + 26], [0, 0.32], CL)} />
      <div style={{ position: "absolute", left: 540 - 70, top: 640, scale: `${interpolate(g, [s, s + 8], [1.7, 1], { ...CL, easing: EASE })}`, rotate: `${(g - s) * 1.3}deg`, filter: `blur(${interpolate(g, [s, s + 5], [10, 0], CL)}px)` }}><Mark size={140} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, fontFamily: SANS, fontWeight: 800, fontSize: 104, letterSpacing: 2, color: "#fff", display: "flex", justifyContent: "center" }}>
        {word.split("").map((ch, k) => <span key={k} style={{ opacity: interpolate(g, [s + 6 + k * 1.5, s + 9 + k * 1.5], [0, 1], CL), translate: `0px ${interpolate(g, [s + 6 + k * 1.5, s + 11 + k * 1.5], [26, 0], { ...CL, easing: EASE })}px` }}>{ch}</span>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 990, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 44, color: "#fff", opacity: rise(g, s + 24, 8) }}>Follow <span style={{ color: OR }}>@researchq.id</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1062, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 36, color: "#CFCAC1", opacity: rise(g, s + 32, 8) }}>tips riset pakai AI, tiap hari</div>
      <Ribbons arcs={["M-60 1250 C 300 1170, 760 1170, 1140 1260"]} f={g} at={s + 20} gap={4} len={22} />
      <Grain />
    </AbsoluteFill>
  );
};

export const MahasiswaUdikCine: React.FC<{ subs?: boolean }> = ({ subs = true }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#060504" }}>
      <Sequence durationInFrames={F(T.b)} name="Hook"><Hook /></Sequence>
      <Sequence from={F(T.b)} durationInFrames={F(T.c + 0.8) - F(T.b)} name="Pertanyaan ke teman"><Questions /></Sequence>
      <Sequence from={F(T.c)} durationInFrames={F(T.d) - F(T.c)} name="Layar Claude"><ClaudeScreen /></Sequence>
      <Sequence from={F(T.d)} durationInFrames={F(T.e) - F(T.d)} name="Beres"><Done /></Sequence>
      <Sequence from={F(T.e)} durationInFrames={F(T.f) - F(T.e)} name="Rasa ingin tahu"><Curious /></Sequence>
      <Sequence from={F(T.f)} durationInFrames={F(T.end) - F(T.f)} name="Kapan belajar"><When /></Sequence>
      <Sequence from={F(T.end)} durationInFrames={F(T.total) - F(T.end)} name="End"><End /></Sequence>
      {subs ? <Subs /> : null}
      <Audio src={staticFile("udik-vo.wav")} premountFor={fps} />
      <Audio src={staticFile("udik-sfx.wav")} premountFor={fps} volume={0.8} />
    </AbsoluteFill>
  );
};
