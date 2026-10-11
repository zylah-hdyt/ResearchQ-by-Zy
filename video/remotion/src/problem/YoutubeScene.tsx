import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Big, CL, EASE, MONO, P, SANS, Stage, pop, rise } from "./kit";

// 34–40s: 3D phone scrolls the NotYourLecture channel and stops on the full "Judul → BAB 1" tutorial.
const SCREEN_W = 600, SCREEN_H = 1080, STRIP_H = 2487 * (SCREEN_W / 720);
const ROW = { top: 361 * (SCREEN_W / 720), bot: 513 * (SCREEN_W / 720) }; // tutorial row inside the strip

export const YoutubeScene: React.FC = () => {
  const f = useCurrentFrame();
  const start = -(STRIP_H - SCREEN_H), end = 0;
  const p = interpolate(f, [16, 92], [0, 1], { ...CL, easing: Easing.bezier(0.12, 0.75, 0.15, 1) });
  const y = start + (end - start) * p;
  const vel = Math.abs(interpolate(f, [16, 92], [0, 1], CL) - interpolate(f - 1, [16, 92], [0, 1], CL)) * (end - start) * (1 - p) * 2.4;
  const hl = interpolate(f, [96, 104], [0, 1], CL);
  return (
    <AbsoluteFill style={{ fontFamily: SANS, color: P.ink }}>
      <Stage hue="blue" />
      <div style={{ position: "absolute", left: 80, top: 250, ...rise(f, 0) }}>
        <Big size={104}>Tutorial lengkap</Big>
        <Big size={104} grad={`linear-gradient(90deg, ${P.amber}, ${P.orange})`} g="rgba(255,122,26,.6)">ada di YouTube</Big>
      </div>
      <div style={{ position: "absolute", left: 240, top: 520, width: SCREEN_W + 40, height: SCREEN_H + 40, perspective: 2000 }}>
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: 70, background: "#0B0B0F", border: "3px solid #2A2F3E", padding: 20,
            boxShadow: `0 80px 140px -40px rgba(0,0,0,.95), 0 0 90px -30px ${P.blue}`,
            transform: `rotateY(${interpolate(f, [0, 30], [-38, -16], { ...CL, easing: EASE }) + interpolate(f, [100, 180], [0, 6], CL)}deg) rotateX(${interpolate(f, [0, 30], [18, 7], { ...CL, easing: EASE })}deg) translateY(${interpolate(f, [0, 22], [900, 0], { ...CL, easing: EASE })}px)`,
          }}
        >
          <div style={{ position: "relative", width: SCREEN_W, height: SCREEN_H, borderRadius: 52, overflow: "hidden", background: "#0F0F0F" }}>
            <Img src={staticFile("problem/yt-strip.jpg")} style={{ position: "absolute", left: 0, top: 0, width: SCREEN_W, translate: `0px ${y}px`, filter: `blur(${Math.min(6, vel / 6)}px)` }} />
            <div style={{ position: "absolute", left: 10, right: 10, top: ROW.top - 6, height: ROW.bot - ROW.top + 12, borderRadius: 18, border: `4px solid ${P.orange}`, boxShadow: `0 0 40px ${P.orange}, inset 0 0 30px rgba(255,122,26,.25)`, opacity: hl }} />
            <div style={{ position: "absolute", left: 160, top: (ROW.top + ROW.bot) / 2 - 38, width: 76, height: 76, borderRadius: "50%", background: "rgba(255,255,255,.3)", border: "4px solid #fff", opacity: interpolate(f, [104, 110, 130, 140], [0, 1, 1, 0], CL), scale: `${interpolate(f, [110, 114, 118], [1, 0.8, 1], CL)}` }} />
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 60, top: 1180, width: 420, padding: "18px 22px", borderRadius: 18, background: "rgba(4,6,12,.85)", border: `2px solid ${P.orange}`, boxShadow: `0 0 40px -10px ${P.orange}`, ...pop(f, 106, 12) }}>
        <div style={{ fontFamily: MONO, fontSize: 18, color: P.orange, letterSpacing: 2 }}>▶ TONTON FULL · 12:44</div>
        <div style={{ fontWeight: 800, fontSize: 28, marginTop: 8, lineHeight: 1.25 }}>Full Tutorial! Judul Sampai Bab 1 Dengan Claude AI!</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1650, textAlign: "center", ...rise(f, 126) }}>
        <span style={{ fontWeight: 800, fontSize: 36 }}>YouTube: <span style={{ color: P.orange }}>NotYourLecture</span></span>
        <span style={{ fontWeight: 700, fontSize: 30, color: P.mut, marginLeft: 18 }}>· simpan & follow</span>
      </div>
    </AbsoluteFill>
  );
};
