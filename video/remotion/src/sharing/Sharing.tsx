import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CL, EASE, Mark, MONO, OR, SANS } from "../cine/Cine";
import { WORDS } from "./words";

// "Akun Claude sharing: 3 risiko" — cut to the creator's own VO (Sharing_Claude.m4a, first 1.95s trimmed), 64.05s, 9:16.
// Every visual beat is keyed to a spoken word (WORDS: local Whisper pass, hand-corrected; video s = recording s − 1.95).
// All examples on screen are illustrations of what the VO says (US$20 shared by 5 = US$4 each, usage bar, memory chips, shared files).
// 0.1–6.7 hook · 6.7–23.9 risiko 1 limit · 23.9–40.8 risiko 2 memori · 40.8–50.1 risiko 3 privasi · 50.1–56.4 rangkuman
// · 56.4–60.6 "akun pribadi" · 60.6–64.05 end card.
const BG = "#FBFAF8", INK = "#151413", MUTE = "#6F6A63", LINE = "#2A2A2A", PANEL = "#141414", PANEL2 = "#1D1C1B", TXT = "#EDEBE6", RED = "#E5484D", GREEN = "#1F9D55";
const AV = ["#EE6A1F", "#2453E8", "#16A34A", "#7C3AED", "#E5398A"]; // Kamu, B, C, D, E
const clean = (s: string) => s.toLowerCase().replace(/[.,?!]/g, "");
const ws = (word: string, n = 0): number => {
  const hits = WORDS.filter(([t]) => clean(t) === clean(word));
  if (!hits.length) throw new Error("word not found: " + word);
  return hits[Math.min(n, hits.length - 1)][1];
};
const wf = (word: string, n = 0) => Math.round(ws(word, n) * 30);
const SC = { hook: 0, r1: 6.69, r2: 23.85, r3: 40.75, sum: 50.09, close: 56.43, end: 60.6 };
const F = (s: number) => Math.round(s * 30);
const dur = (a: number, b: number) => F(b) - F(a);
const rise = (g: number, at: number, d = 10) => interpolate(g, [at, at + d], [0, 1], { ...CL, easing: EASE });
const pop = (g: number, at: number) => ({ opacity: g >= at ? 1 : 0, scale: `${interpolate(g, [at, at + 6], [1.4, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` });

/* ---------------- small parts ---------------- */
const KW: React.FC<{ g: number; at: number; acc?: boolean; red?: boolean; children: React.ReactNode }> = ({ g, at, acc, red, children }) => {
  const p = rise(g, at, 9);
  return (
    <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.1em", marginRight: "0.2em" }}>
      <span style={{ display: "inline-block", opacity: g >= at ? 1 : 0, transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 4}deg)`, color: red ? RED : acc ? OR : INK }}>{children}</span>
    </span>
  );
};
const Kin: React.FC<{ g: number; top: number; size: number; words: [string, number, ("acc" | "red")?][] ; align?: "left" | "center" }> = ({ g, top, size, words, align = "left" }) => (
  <div style={{ position: "absolute", left: 76, right: 76, top, fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: -2, lineHeight: 1.04, textAlign: align }}>
    {words.map(([w, at, k], i) => <KW key={i} g={g} at={at} acc={k === "acc"} red={k === "red"}>{w}</KW>)}
  </div>
);
const Label: React.FC<{ g: number; at: number; top: number; children: React.ReactNode }> = ({ g, at, top, children }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top, fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: OR, textTransform: "uppercase", opacity: rise(g, at, 8), translate: `0px ${(1 - rise(g, at, 8)) * 10}px` }}>{children}</div>
);
const Avatar: React.FC<{ i: number; size?: number; label?: string; dim?: number }> = ({ i, size = 130, label, dim = 1 }) => (
  <div style={{ width: size, textAlign: "center", fontFamily: SANS, opacity: dim }}>
    <div style={{ width: size, height: size, borderRadius: "50%", background: AV[i], display: "flex", alignItems: "center", justifyContent: "center", border: "5px solid #fff", boxShadow: "0 14px 30px -14px rgba(0,0,0,.45)" }}>
      <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55} fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c1.2-4 4-5.6 7-5.6s5.8 1.6 7 5.6" /></svg>
    </div>
    {label ? <div style={{ marginTop: 8, fontWeight: 700, fontSize: 26, color: INK }}>{label}</div> : null}
  </div>
);
const Icon: React.FC<{ n: string; c?: string; size: number; sw?: number }> = ({ n, c = INK, size, sw = 1.8 }) => {
  const P: Record<string, React.ReactNode> = {
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
    eye: <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
    alert: <><path d="M12 3l10 18H2z" /><path d="M12 10v5 M12 18v.5" /></>,
    check: <path d="M4 12.5l5 5L20 6.5" />,
    x: <path d="M5 5l14 14 M19 5L5 19" />,
    file: <><path d="M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M15 3v4h4 M8 13h8 M8 17h6" /></>,
    chat: <path d="M4 5h16v11H9l-5 4z" />,
    layers: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5 M3 17.5l9 5 9-5" /></>,
    laptop: <><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 20h20" /></>,
    gauge: <><path d="M4 17a9 9 0 1 1 16 0" /><path d="M12 14l4-5" /></>,
  };
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ overflow: "visible" }}>{P[n]}</svg>;
};
const Chip: React.FC<{ children: React.ReactNode; c?: string; style?: React.CSSProperties }> = ({ children, c = OR, style }) => (
  <span style={{ display: "inline-block", padding: "10px 24px", borderRadius: 999, background: "#fff", border: `3px solid ${c}`, color: INK, fontFamily: SANS, fontWeight: 700, fontSize: 32, ...style }}>{children}</span>
);
const Shell: React.FC<{ g: number; from: number; step?: number; label?: string; children: React.ReactNode }> = ({ g, from, step, label, children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, #FFEADB 0%, ${BG} 64%)`, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 80, right: 80, top: 120, display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 5, color: MUTE, opacity: rise(g, from, 8) }}>
      <span>SHARING CLAUDE{label ? ` · ${label}` : ""}</span>
      {step ? <span style={{ display: "flex", gap: 10 }}>{[1, 2, 3].map((k) => <i key={k} style={{ width: 34, height: 8, borderRadius: 4, background: k <= step ? OR : "rgba(21,20,19,.16)" }} />)}</span> : null}
    </div>
    {children}
  </AbsoluteFill>
);
const Panel: React.FC<{ style: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", borderRadius: 30, background: PANEL, border: `2px solid ${LINE}`, boxShadow: "0 50px 90px -45px rgba(90,40,0,.55)", fontFamily: SANS, color: TXT, ...style }}>{children}</div>
);

/* ---- 1 · Hook ---- */
const Hook: React.FC = () => {
  const g = useCurrentFrame() + F(SC.hook);
  const out = interpolate(g, [F(3.95), F(4.25)], [0, 1], CL);
  const risk = rise(g, wf("beberapa"), 10);
  return (
    <Shell g={g} from={4}>
      <div style={{ opacity: 1 - out, translate: `0px ${-out * 50}px` }}>
        <Kin g={g} top={330} size={112} words={[["Akun", wf("akun")], ["Claude", wf("claude"), "acc"], ["sharing", wf("sharing")], ["lebih", wf("lebih")], ["murah?", wf("murah"), "acc"]]} />
        <div style={{ position: "absolute", left: 76, top: 760, fontFamily: SANS, fontWeight: 600, fontSize: 52, color: MUTE, opacity: rise(g, wf("tonton"), 10) }}>Tonton sampai habis.</div>
        <Panel style={{ left: 120, right: 120, top: 920, height: 330, padding: "34px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontWeight: 800, fontSize: 46 }}>
            <Mark size={46} c="#EE6A1F" />Claude Pro
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 22, color: "#8A867F", letterSpacing: 3 }}>1 AKUN</span>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 36 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ ...pop(g, wf("sharing") + 4 + i * 4) }}><Avatar i={i} size={118} /></div>
            ))}
          </div>
        </Panel>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1290, display: "flex", justifyContent: "center", ...pop(g, wf("murah")) }}>
          <span style={{ padding: "10px 28px", borderRadius: 999, background: OR, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 34 }}>↓ lebih murah</span>
        </div>
      </div>
      {/* "3 risiko" */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", alignItems: "center", justifyContent: "center", gap: 36, opacity: risk, translate: `0px ${(1 - risk) * 40}px` }}>
        <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 520, lineHeight: 0.8, color: OR, letterSpacing: -20, scale: `${interpolate(g, [wf("beberapa"), wf("beberapa") + 6], [1.3, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` }}>3</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, lineHeight: 1, color: INK }}>
          <div><KW g={g} at={wf("risiko")}>risiko</KW></div>
          <div style={{ fontSize: 50, fontWeight: 600, color: MUTE, marginTop: 14 }}><KW g={g} at={wf("wajib")}>wajib lo tahu</KW></div>
        </div>
      </div>
    </Shell>
  );
};

/* ---- 2 · Risiko 1: limit ---- */
const BAR = [0.11, 0.11, 0.11, 0.11, 0.11];
const Risk1: React.FC = () => {
  const g = useCurrentFrame() + F(SC.r1);
  const avAt = (i: number) => wf("dipakai") + i * 4;
  const split = rise(g, wf("4"), 10);
  const toBar = rise(g, wf("berbagi") - 6, 14);
  const grow = interpolate(g, [wf("memakai"), wf("habis", 1)], [0, 1], { ...CL, easing: Easing.in(Easing.quad) });
  const seg = BAR.map((b, i) => (i === 2 ? b + (0.58 - b) * grow : b + ((i === 0 ? 0.11 : 0.1) - b) * grow));
  const x = (i: number) => 540 + (i - 2) * 188;
  return (
    <Shell g={g} from={F(SC.r1)} step={1} label="RISIKO 1">
      <Label g={g} at={wf("pertama")} top={190}>Risiko 1 dari 3</Label>
      <Kin g={g} top={236} size={96} words={[["Limit", wf("limit"), "acc"], ["penggunaan", wf("penggunaan")]]} />
      {/* the account card */}
      <Panel style={{ left: 150, right: 150, top: 470, height: 190, padding: "30px 40px", opacity: g >= wf("pro") - 8 ? 1 - split * 0.9 : 0, scale: `${1 - split * 0.18}`, transformOrigin: "50% 0%", translate: `0px ${-split * 40}px` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontWeight: 800, fontSize: 44 }}><Mark size={44} c="#EE6A1F" />Claude Pro
          <span style={{ marginLeft: "auto", color: OR, fontSize: 64, letterSpacing: -2, ...pop(g, wf("20")) }}>US$20</span>
        </div>
        <div style={{ marginTop: 20, fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: "#8A867F", opacity: rise(g, wf("dibagi"), 8) }}>US$20 ÷ 5 ORANG</div>
      </Panel>
      {/* five people */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: "absolute", left: x(i) - 80, top: 720, ...pop(g, avAt(i)) }}>
          <Avatar i={i} size={150} label={i === 0 ? "Kamu" : undefined} />
          <div style={{ marginTop: i === 0 ? 8 : 40, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 46, color: OR, opacity: split * (1 - toBar), translate: `0px ${(1 - split) * -20}px` }}>US$4</div>
        </div>
      ))}
      {/* the shared usage bar */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 1060, opacity: toBar, translate: `0px ${(1 - toBar) * 30}px` }}>
        <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: MUTE, marginBottom: 14 }}>KAPASITAS · SATU AKUN UNTUK SEMUA · ILUSTRASI</div>
        <div style={{ height: 70, borderRadius: 18, border: `4px solid ${INK}`, background: "#fff", display: "flex", overflow: "hidden" }}>
          {seg.map((s, i) => <div key={i} style={{ width: `${s * 100}%`, background: AV[i] }} />)}
        </div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1190, padding: "22px 30px", borderRadius: 22, background: "#2A1513", border: `3px solid ${RED}`, display: "flex", alignItems: "center", gap: 20, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: "#FFD0CB", ...pop(g, wf("limitnya")) }}>
        <Icon n="bolt" c={RED} size={48} />Limit habis lebih cepat
      </div>
    </Shell>
  );
};

/* ---- 3 · Risiko 2: memori & konteks ---- */
const Risk2: React.FC = () => {
  const g = useCurrentFrame() + F(SC.r2);
  const fly = (at: number) => ({ opacity: interpolate(g, [at, at + 5], [0, 1], CL), translate: `0px ${interpolate(g, [at, at + 14], [-230, 0], { ...CL, easing: EASE })}px`, scale: `${interpolate(g, [at, at + 14], [0.7, 1], { ...CL, easing: EASE })}` });
  const memOn = rise(g, wf("fitur"), 8);
  const bad = rise(g, wf("kurang"), 8);
  return (
    <Shell g={g} from={F(SC.r2)} step={2} label="RISIKO 2">
      <Label g={g} at={wf("kedua")} top={190}>Risiko 2 dari 3</Label>
      <Kin g={g} top={236} size={96} words={[["Memori", wf("memori"), "acc"], ["&", wf("dan")], ["konteks", wf("konteks")]]} />
      {[[0, 150, wf("penelitian"), "penelitian"], [2, 540, wf("coding"), "coding"], [3, 930, wf("bisnis"), "bisnis"]].map(([i, cx, at, tag]) => (
        <div key={tag as string} style={{ position: "absolute", left: (cx as number) - 75, top: 470, ...pop(g, (at as number) - 14) }}>
          <Avatar i={i as number} size={120} label={i === 0 ? "Kamu" : undefined} />
        </div>
      ))}
      <Panel style={{ left: 70, right: 70, top: 700, height: 340, border: `3px solid ${memOn > 0.5 ? OR : LINE}`, padding: "26px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 38 }}><Icon n="layers" c={OR} size={44} />Memori akun
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: OR, opacity: memOn }}>AKTIF</span></div>
      </Panel>
      {[["penelitian", 130, 800, -4, 0, wf("penelitian")], ["coding", 440, 850, 3, 2, wf("coding")], ["bisnis", 700, 790, -2, 3, wf("bisnis")]].map(([t, cx, cy, rot, i, at]) => (
        <div key={t as string} style={{ position: "absolute", left: cx as number, top: cy as number, rotate: `${rot}deg`, ...fly(at as number) }}>
          <Chip c={AV[i as number]} style={{ fontSize: 36 }}>{t as string}</Chip>
        </div>
      ))}
      {/* a question, and the muddled answer */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 1075, fontFamily: SANS, fontSize: 30, opacity: rise(g, wf("pekerjaan", 1) - 4, 8) }}>
        <div style={{ display: "inline-block", padding: "12px 22px", borderRadius: 18, background: "#fff", border: `2px solid ${INK}`, fontWeight: 600 }}>Bantu susun kerangka BAB 2 penelitianku</div>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 1160, padding: "18px 24px", borderRadius: 18, background: PANEL, color: TXT, fontFamily: SANS, fontSize: 30, lineHeight: 1.35, opacity: rise(g, wf("informasi"), 8), border: `3px solid ${bad > 0.5 ? RED : LINE}` }}>
        Kerangka BAB 2 + <span style={{ background: bad > 0.5 ? "rgba(229,72,77,.4)" : "transparent" }}>strategi bisnis</span> + <span style={{ background: bad > 0.5 ? "rgba(229,72,77,.4)" : "transparent" }}>kode Python</span>…
        <div style={{ position: "absolute", right: 20, top: -30, padding: "6px 18px", borderRadius: 999, background: RED, color: "#fff", fontWeight: 800, fontSize: 24, opacity: bad, scale: `${0.8 + bad * 0.2}` }}>kurang sesuai</div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 1300, fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: MUTE, opacity: rise(g, wf("informasi"), 8) }}>ILUSTRASI</div>
    </Shell>
  );
};

/* ---- 4 · Risiko 3: privasi ---- */
const ROWS: [string, string][] = [["chat", "Draf BAB 4 · hasil olah data"], ["chat", "Kuesioner responden"], ["file", "data_responden.xlsx"], ["file", "transkrip_wawancara.docx"]];
const Risk3: React.FC = () => {
  const g = useCurrentFrame() + F(SC.r3);
  const intr = interpolate(g, [wf("diakses") - 6, wf("diakses") + 10], [0, 1], { ...CL, easing: EASE });
  const imp = rise(g, wf("apalagi"), 8);
  return (
    <Shell g={g} from={F(SC.r3)} step={3} label="RISIKO 3">
      <Label g={g} at={wf("ketiga")} top={190}>Risiko 3 dari 3</Label>
      <Kin g={g} top={236} size={96} words={[["Privasi", wf("privacy"), "acc"], ["data", wf("banget")], ["kamu", wf("banget") + 2]]} />
      <Panel style={{ left: 70, right: 70, top: 500, height: 640, padding: "28px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 800, fontSize: 38 }}><Avatar i={0} size={64} />Akun bersama
          <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: "#8A867F" }}>RIWAYAT & FILE</span></div>
        {ROWS.map(([ic, t], k) => {
          const at = k < 2 ? wf("percakapan") + k * 5 : wf("file") + (k - 2) * 5;
          const opened = intr > 0 && g >= wf("diakses") + k * 6;
          const key = k === 2;
          return (
            <div key={t} style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 18, padding: "20px 24px", borderRadius: 18, background: PANEL2, border: `3px solid ${key && imp > 0.5 ? RED : opened ? OR : LINE}`, opacity: g >= at ? 1 : 0, translate: `${interpolate(g, [at, at + 8], [-60, 0], { ...CL, easing: EASE })}px 0px`, fontSize: 34, fontWeight: 600 }}>
              <Icon n={ic} c={opened ? OR : "#9A968F"} size={44} />{t}
              {opened ? <span style={{ marginLeft: "auto" }}><Icon n="eye" c={OR} size={42} /></span> : null}
              {key ? <span style={{ marginLeft: opened ? 12 : "auto", padding: "4px 16px", borderRadius: 999, background: RED, color: "#fff", fontWeight: 800, fontSize: 24, opacity: imp, scale: `${0.8 + imp * 0.2}` }}>PENTING</span> : null}
            </div>
          );
        })}
      </Panel>
      {/* someone else walks in */}
      <div style={{ position: "absolute", right: 40, top: 1040, translate: `${(1 - intr) * 300}px 0px`, opacity: intr }}>
        <Avatar i={3} size={140} label="Pengguna lain" />
      </div>
      <div style={{ position: "absolute", left: 90, top: 1190, display: "flex", alignItems: "center", gap: 16, fontFamily: SANS, fontWeight: 700, fontSize: 40, color: RED, opacity: imp }}><Icon n="alert" c={RED} size={52} />berisiko diakses pengguna lain</div>
    </Shell>
  );
};

/* ---- 5 · Rangkuman ---- */
const Summary: React.FC = () => {
  const g = useCurrentFrame() + F(SC.sum);
  const TILES: [string, string, number][] = [["gauge", "Limit", wf("limit", 1)], ["lock", "Privasi", wf("privasi")], ["laptop", "Kenyamanan kerja", wf("kenyamanan")]];
  return (
    <Shell g={g} from={F(SC.sum)} label="RANGKUMAN">
      <Kin g={g} top={250} size={104} words={[["Memang", wf("emang")], ["hemat", wf("hemat"), "acc"]]} />
      <div style={{ position: "absolute", left: 76, top: 250, translate: `${interpolate(g, [wf("hemat"), wf("hemat") + 8], [0, 0], CL)}px 0px` }} />
      <div style={{ position: "absolute", right: 40, top: 262, opacity: rise(g, wf("hemat") + 8, 8), scale: `${interpolate(g, [wf("hemat") + 8, wf("hemat") + 14], [1.5, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` }}><Icon n="check" c={GREEN} size={96} sw={2.6} /></div>
      <Kin g={g} top={420} size={104} words={[["tapi", wf("tapi", 1), "red"], ["perlu", wf("perlu")], ["dipertimbangkan:", wf("mempertimbangkan")]]} />
      {TILES.map(([ic, t, at], k) => (
        <Panel key={t} style={{ left: 90, right: 90, top: 700 + k * 190, height: 150, display: "flex", alignItems: "center", gap: 28, padding: "0 40px", opacity: g >= at - 2 ? 1 : 0, translate: `${interpolate(g, [at, at + 10], [200, 0], { ...CL, easing: EASE })}px 0px` }}>
          <Icon n={ic} c={OR} size={70} sw={1.6} />
          <span style={{ fontWeight: 800, fontSize: 52 }}>{t}</span>
        </Panel>
      ))}
    </Shell>
  );
};

/* ---- 6 · Akun pribadi ---- */
const Close: React.FC = () => {
  const g = useCurrentFrame() + F(SC.close);
  const serius = wf("serius"), pribadi = wf("pribadi"), jelas = wf("jelas");
  return (
    <Shell g={g} from={F(SC.close)} label="KESIMPULAN">
      <Kin g={g} top={250} size={104} words={[["Buat", wf("buat", 3)], ["pekerjaan", wf("pekerjaan", 2)], ["serius,", serius, "acc"]]} />
      {/* shared card — fades and gets crossed out */}
      <Panel style={{ left: 120, right: 120, top: 620, height: 220, padding: "30px 40px", opacity: g >= pribadi ? 0.35 : 1 - 0 }}>
        <div style={{ fontWeight: 800, fontSize: 40 }}>Akun sharing</div>
        <div style={{ display: "flex", gap: 14, marginTop: 20 }}>{[0, 1, 2, 3, 4].map((i) => <Avatar key={i} i={i} size={80} />)}</div>
        <div style={{ position: "absolute", right: 40, top: 40, opacity: interpolate(g, [pribadi, pribadi + 6], [0, 1], CL) }}><Icon n="x" c={RED} size={70} sw={2.6} /></div>
      </Panel>
      <Panel style={{ left: 120, right: 120, top: 900, height: 330, padding: "34px 40px", border: `4px solid ${OR}`, opacity: g >= pribadi - 4 ? 1 : 0, scale: `${interpolate(g, [pribadi - 4, pribadi + 8], [0.86, 1], { ...CL, easing: EASE })}` }}>
        <div style={{ fontWeight: 800, fontSize: 52 }}>Akun pribadi</div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 28 }}>
          <Avatar i={0} size={120} />
          <div style={{ fontFamily: SANS, fontSize: 34, lineHeight: 1.5, color: "#CFCAC1" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center", opacity: rise(g, jelas, 8) }}><Icon n="lock" c={OR} size={36} />Memori & file milikmu saja</div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", opacity: rise(g, jelas + 6, 8) }}><Icon n="gauge" c={OR} size={36} />Limit tidak dibagi</div>
          </div>
        </div>
        <div style={{ position: "absolute", right: -26, top: -30, width: 84, height: 84, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", opacity: rise(g, jelas, 6), scale: `${interpolate(g, [jelas, jelas + 8], [1.6, 1], { ...CL, easing: Easing.out(Easing.cubic) })}` }}><Icon n="check" c="#fff" size={52} sw={3} /></div>
      </Panel>
      <div style={{ position: "absolute", left: 120, top: 1290, fontFamily: SANS, fontWeight: 800, fontSize: 60, color: INK, opacity: rise(g, wf("jauh"), 8) }}>jauh lebih <span style={{ color: OR }}>ideal.</span></div>
      <svg width={560} height={30} viewBox="0 0 560 30" style={{ position: "absolute", left: 120, top: 1362 }}><path d="M4 18 C 120 6, 300 24, 556 10" fill="none" stroke={OR} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - interpolate(g, [wf("ideal"), wf("ideal") + 14], [0, 1], { ...CL, easing: EASE })} /></svg>
    </Shell>
  );
};

/* ---- 7 · End card ---- */
const End: React.FC = () => {
  const g = useCurrentFrame() + F(SC.end);
  const word = "RESEARCHQ";
  return (
    <AbsoluteFill style={{ background: "#0E0D0C" }}>
      <div style={{ position: "absolute", left: 540 - 70, top: 640, scale: `${interpolate(g, [F(SC.end), F(SC.end) + 8], [1.6, 1], { ...CL, easing: EASE })}`, rotate: `${(g - F(SC.end)) * 1.2}deg` }}><Mark size={140} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 104, letterSpacing: 2, color: "#fff", display: "flex", justifyContent: "center" }}>
        {word.split("").map((ch, k) => <span key={k} style={{ opacity: interpolate(g, [F(SC.end) + 6 + k * 1.5, F(SC.end) + 9 + k * 1.5], [0, 1], CL), translate: `0px ${interpolate(g, [F(SC.end) + 6 + k * 1.5, F(SC.end) + 11 + k * 1.5], [26, 0], { ...CL, easing: EASE })}px` }}>{ch}</span>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 990, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 44, color: "#fff", opacity: rise(g, F(SC.end) + 24, 8) }}>Follow <span style={{ color: OR }}>@researchq.id</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1062, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 36, color: "#CFCAC1", opacity: rise(g, F(SC.end) + 32, 8) }}>tips riset pakai AI, tiap hari</div>
    </AbsoluteFill>
  );
};

/* ---- karaoke subtitles from the VO words ---- */
const PHRASES: [string, number][][] = (() => {
  const out: [string, number][][] = []; let cur: [string, number][] = [];
  for (const w of WORDS) { cur.push(w); if (/[.,?!]$/.test(w[0]) || cur.length >= 6) { out.push(cur); cur = []; } }
  if (cur.length) out.push(cur); return out;
})();
const Subs: React.FC = () => {
  const t = useCurrentFrame() / 30;
  const i = PHRASES.findIndex((p, k) => t >= p[0][1] - 0.08 && t < (PHRASES[k + 1] ? PHRASES[k + 1][0][1] - 0.08 : p[p.length - 1][1] + 1.2));
  if (i < 0 || t > SC.end + 0.3) return null;
  const p = PHRASES[i];
  const a = interpolate(t, [p[0][1] - 0.08, p[0][1] + 0.06], [0, 1], CL);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1400, display: "flex", justifyContent: "center", opacity: a }}>
      <div style={{ maxWidth: 960, padding: "12px 26px", borderRadius: 18, background: "rgba(21,20,19,.86)", textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.25 }}>
        {p.map(([w, s], k) => {
          const nextS = k + 1 < p.length ? p[k + 1][1] : s + 0.5;
          return <span key={k} style={{ color: t >= s && t < nextS ? OR : t >= s ? "#fff" : "rgba(255,255,255,.45)" }}>{w}{k < p.length - 1 ? " " : ""}</span>;
        })}
      </div>
    </div>
  );
};

export const SharingClaude: React.FC<{ subs?: boolean }> = ({ subs = true }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence durationInFrames={dur(0, SC.r1)} name="Hook"><Hook /></Sequence>
      <Sequence from={F(SC.r1)} durationInFrames={dur(SC.r1, SC.r2)} name="Risiko 1 · limit"><Risk1 /></Sequence>
      <Sequence from={F(SC.r2)} durationInFrames={dur(SC.r2, SC.r3)} name="Risiko 2 · memori"><Risk2 /></Sequence>
      <Sequence from={F(SC.r3)} durationInFrames={dur(SC.r3, SC.sum)} name="Risiko 3 · privasi"><Risk3 /></Sequence>
      <Sequence from={F(SC.sum)} durationInFrames={dur(SC.sum, SC.close)} name="Rangkuman"><Summary /></Sequence>
      <Sequence from={F(SC.close)} durationInFrames={dur(SC.close, SC.end)} name="Akun pribadi"><Close /></Sequence>
      <Sequence from={F(SC.end)} durationInFrames={1922 - F(SC.end)} name="End"><End /></Sequence>
      {subs ? <Subs /> : null}
      <Audio src={staticFile("sharing-vo.wav")} premountFor={fps} />
      <Audio src={staticFile("sharing-sfx.wav")} premountFor={fps} volume={0.8} />
    </AbsoluteFill>
  );
};
