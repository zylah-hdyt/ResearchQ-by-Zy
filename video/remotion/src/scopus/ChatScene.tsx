import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { CL, EASE, K, MONO, Paper, SANS, SERIF, Step, Tap } from "./kit";

// 5–22s: screen-recording style. Turn on web search, pick the skill, type one sentence, watch it search + verify.
// App-local coordinates: frame at canvas (60, 300), 960 × 1120.
export const PROMPT = "Carikan artikel Scopus 2022–2026 tentang pengaruh social media marketing terhadap purchase intention";
const fade = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], CL);
const rise = (f: number, a: number) => ({ opacity: fade(f, a, a + 8), translate: `0px ${interpolate(f, [a, a + 14], [26, 0], { ...CL, easing: EASE })}px` });

const ToolRow: React.FC<{ at: number; done: number; q: string; res: string }> = ({ at, done, q, res }) => {
  const f = useCurrentFrame();
  const ok = f >= done;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", borderRadius: 22, background: "#F6F4EE", border: `2px solid ${K.line}`, marginTop: 14, ...rise(f, at) }}>
      <span style={{ fontSize: 30 }}>🔍</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 25 }}>Mencari web</div>
        <div style={{ fontFamily: MONO, fontSize: 19, color: K.mut, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q}</div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 20, padding: "8px 14px", borderRadius: 999, background: ok ? K.grns : "#EEEBE3", color: ok ? K.grn : K.mut }}>
        {ok ? `✓ ${res}` : ["◐", "◓", "◑", "◒"][Math.floor(f / 4) % 4] + " mencari"}
      </div>
    </div>
  );
};

const GateRow: React.FC<{ at: number; t: string; v: string; warn?: boolean }> = ({ at, t, v, warn }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: 26, fontWeight: 700, padding: "13px 0", borderTop: `2px dashed #EEEBE3`, ...rise(f, at) }}>
      {t}
      <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 19, padding: "7px 14px", borderRadius: 999, background: warn ? K.ambs : K.grns, color: warn ? K.amb : K.grn }}>{v}</span>
    </div>
  );
};

const LinkRow: React.FC<{ at: number; name: string; url: string }> = ({ at, name, url }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "13px 0", borderTop: `2px dashed #EEEBE3`, ...rise(f, at) }}>
      <span style={{ fontWeight: 800, fontSize: 26, width: 210 }}>{name}</span>
      <span style={{ fontFamily: MONO, fontSize: 18, color: "#2B5BD7", textDecoration: "underline", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>{url}</span>
    </div>
  );
};

export const ChatScene: React.FC = () => {
  const f = useCurrentFrame();
  const searchOn = f >= 45;
  const skillOn = f >= 110;
  const typed = PROMPT.slice(0, Math.max(0, Math.floor((f - 135) * 1.1)));
  const home = 1 - fade(f, 246, 256);
  const conv = fade(f, 252, 262);
  const scroll = interpolate(f, [404, 424], [0, -400], { ...CL, easing: EASE });
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: K.ink }}>
      <Paper label="SCOPUS FINDER" />
      <div
        style={{
          position: "absolute", left: 60, top: 300, width: 960, height: 1120, borderRadius: 50, background: "#FBFAF6", border: `2px solid ${K.line}`,
          boxShadow: "0 60px 110px -60px rgba(0,0,0,.35)", overflow: "hidden",
          translate: `0px ${interpolate(f, [0, 16], [1300, 0], { ...CL, easing: EASE })}px`,
        }}
      >
        {/* header */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96, borderBottom: `2px solid #EFECE4`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 30, background: "#FBFAF6", zIndex: 3 }}>
          <div style={{ position: "absolute", left: 40, top: 36, width: 38 }}>{[0, 1, 2].map((i) => <div key={i} style={{ height: 4, borderRadius: 2, background: K.ink, marginBottom: 8 }} />)}</div>
          <Img src={staticFile("claude_logo.png")} style={{ width: 38, height: 38, marginRight: 12 }} />Claude
          <div style={{ position: "absolute", right: 40, top: 28, width: 42, height: 42, borderRadius: "50%", background: K.lime }} />
        </div>

        {/* home view */}
        <div style={{ position: "absolute", inset: 0, opacity: home }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 72, letterSpacing: -1 }}>
            <Img src={staticFile("claude_logo.png")} style={{ width: 54, height: 54, marginRight: 16, verticalAlign: -6 }} />Mau riset apa hari ini?
          </div>
          <div style={{ position: "absolute", left: 50, right: 50, top: 420, height: 230, borderRadius: 36, background: "#fff", border: `2px solid ${K.line}`, boxShadow: "0 20px 40px -30px rgba(0,0,0,.3)" }}>
            <div style={{ position: "absolute", left: 34, right: 34, top: 26, fontSize: 30, lineHeight: 1.38, color: typed || skillOn ? K.ink : "#B5B2A8" }}>
              {skillOn ? <span style={{ display: "inline-block", padding: "2px 16px", borderRadius: 999, border: `2.5px solid ${K.clay}`, color: "#B8552F", fontWeight: 700, fontSize: 24, marginRight: 10, scale: `${interpolate(f, [110, 118], [0.6, 1], CL)}` }}>✦ Scopus Finder</span> : null}
              {typed || (skillOn ? "" : "Tulis pesan…")}
              {f >= 135 && f < 246 && Math.floor(f / 8) % 2 === 0 ? <span style={{ borderLeft: `3px solid ${K.ink}`, marginLeft: 2 }} /> : null}
            </div>
            <div style={{ position: "absolute", left: 30, bottom: 26, width: 64, height: 64, borderRadius: "50%", border: `2.5px solid ${K.line}`, fontSize: 40, lineHeight: "56px", textAlign: "center", color: K.mut }}>+</div>
            <div style={{ position: "absolute", left: 110, bottom: 26, height: 64, padding: "0 20px", borderRadius: 999, display: "flex", alignItems: "center", gap: 12, fontSize: 24, fontWeight: 700, background: searchOn ? "#EEF7D1" : "#F3F1EA", color: searchOn ? K.limeD : K.mut, border: `2px solid ${searchOn ? K.lime : K.line}` }}>
              🌐 Web search
              <span style={{ position: "relative", width: 54, height: 30, borderRadius: 999, background: searchOn ? K.limeD : "#CFCBC0" }}>
                <span style={{ position: "absolute", top: 3, left: searchOn ? 27 : 3, width: 24, height: 24, borderRadius: "50%", background: "#fff" }} />
              </span>
            </div>
            <div style={{ position: "absolute", right: 26, bottom: 26, width: 68, height: 68, borderRadius: "50%", background: typed.length > 10 ? K.clay : "#E7C3B5", color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: "66px", textAlign: "center" }}>↑</div>
          </div>
          {/* skill picker */}
          <div style={{ position: "absolute", left: 50, top: 672, width: 540, borderRadius: 28, background: "#fff", border: `2px solid ${K.line}`, boxShadow: "0 30px 50px -30px rgba(0,0,0,.35)", padding: "18px 14px", opacity: interpolate(f, [82, 88, 118, 126], [0, 1, 1, 0], CL), translate: `0px ${interpolate(f, [82, 92], [-16, 0], { ...CL, easing: EASE })}px` }}>
            <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: 2, color: K.mut, padding: "4px 14px 10px" }}>SKILL RESEARCHQ</div>
            {["Judul Generator", "Master Reviewer", "Scopus Finder", "Auto Revision"].map((s, i) => (
              <div key={s} style={{ height: 72, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", borderRadius: 18, fontSize: 28, fontWeight: 700, background: i === 2 && f >= 104 ? "#EEF7D1" : "transparent" }}>
                <span style={{ color: K.clay }}>✦</span>{s}
              </div>
            ))}
          </div>
        </div>

        {/* conversation view */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 96, bottom: 0, overflow: "hidden", opacity: conv }}>
          <div style={{ padding: "34px 44px", translate: `0px ${scroll}px` }}>
            <div style={{ marginLeft: "auto", maxWidth: 760, width: "fit-content", background: "#EFEBE3", borderRadius: "34px 34px 12px 34px", padding: "22px 26px", fontSize: 28, lineHeight: 1.4, ...rise(f, 254) }}>
              <span style={{ display: "inline-block", padding: "2px 14px", borderRadius: 999, border: `2.5px solid ${K.clay}`, color: "#B8552F", fontWeight: 700, fontSize: 22, marginRight: 8 }}>✦ Scopus Finder</span>
              {PROMPT}
            </div>
            <div style={{ position: "relative", marginTop: 30, paddingLeft: 70 }}>
              <Img src={staticFile("claude_logo.png")} style={{ position: "absolute", left: 0, top: 6, width: 48, height: 48, rotate: `${interpolate(f, [262, 300], [0, 360], CL)}deg`, opacity: fade(f, 262, 268) }} />
              <ToolRow at={266} done={298} q={'"social media marketing" "purchase intention" 2022..2026'} res="9 hasil" />
              <ToolRow at={302} done={330} q={'"purchase intention" "brand image" Scopus 2023'} res="7 hasil" />
              <div style={{ marginTop: 18, padding: "20px 26px", borderRadius: 26, background: "#fff", border: `2px solid ${K.line}`, ...rise(f, 338) }}>
                <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: K.mut, marginBottom: 6 }}>GATE VERIFIKASI SEBELUM DITAMPILKAN</div>
                <GateRow at={348} t="Tahun terbit 2022–2026" v="✓ LOLOS" />
                <GateRow at={360} t="Sumber kredibel" v="✓ LOLOS" />
                <GateRow at={372} t="Ada DOI & data asli" v="✓ LOLOS" />
                <GateRow at={384} t="Kuartil terlihat?" v="⚠️ CEK SCIMAGO" warn />
              </div>
              <div style={{ marginTop: 18, padding: "20px 26px", borderRadius: 26, background: "#fff", border: `2px solid ${K.line}`, ...rise(f, 424) }}>
                <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: K.mut, marginBottom: 6 }}>🔗 LINK PENCARIAN SIAP KLIK</div>
                <LinkRow at={434} name="Google Scholar" url="scholar.google.com/scholar?q=%22social+media+marketing%22+%22purchase+intention%22&as_ylo=2022" />
                <LinkRow at={446} name="Scopus" url="scopus.com/results/results.uri?st1=%22social+media+marketing%22..." />
                <LinkRow at={458} name="Garuda" url="garuda.kemdikbud.go.id/documents?q=social+media+marketing" />
                <LinkRow at={470} name="DOAJ" url="doaj.org/search/articles?source=social+media+marketing" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Tap show={[16, 252]} path={[[16, 720, 1300], [45, 340, 892, true], [80, 172, 892, true], [110, 360, 1220, true], [240, 910, 892, true]]} />
      <Step n="01" title="Nyalakan Web Search" sub="biar Claude cari sungguhan, bukan nebak" from={22} to={100} />
      <Step n="02" title="Pilih skill Scopus Finder" sub="dari library skill ResearchQ" from={100} to={176} />
      <Step n="03" title="Tulis topik, lalu kirim" sub="cukup satu kalimat" from={176} to={258} />
      <Step n="04" title="Claude cari & verifikasi" sub="tahun, sumber, DOI dicek dulu" from={262} to={418} />
      <Step n="05" title="Plus link pencarian siap klik" sub="Scholar · Scopus · Garuda · DOAJ" from={422} to={510} />
    </AbsoluteFill>
  );
};
