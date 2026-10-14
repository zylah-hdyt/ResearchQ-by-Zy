import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Subtitles } from "../scopus/Subtitles";
import { MONO } from "../theory/kit";
import { D, S1Hook, S2Spss, S3Pls, S4Analysis, S5ProCon, S6When, S7Cta } from "./Scenes";
import subs from "./subs-id.json";

// "SPSS atau SmartPLS?" — dark cinematic explainer, 60s (1800 frames @30fps). On-screen captions + music bed + SFX, no VO.
// Scene starts: 0 / 120 / 420 / 720 / 1080 / 1440 / 1650 (on the 120 BPM bar grid, 1 bar = 60 frames).
const TR = linearTiming({ durationInFrames: 8 });
const SCENES: [string, number, React.FC, "from-right" | "from-bottom"][] = [
  ["PEMBUKA", 128, S1Hook, "from-right"], ["SPSS", 308, S2Spss, "from-right"], ["SMARTPLS", 308, S3Pls, "from-bottom"],
  ["ANALISIS", 368, S4Analysis, "from-right"], ["PLUS & MINUS", 368, S5ProCon, "from-bottom"], ["KEPUTUSAN", 218, S6When, "from-right"], ["PENUTUP", 150, S7Cta, "from-right"],
];
const STARTS = [0, 120, 420, 720, 1080, 1440, 1650];

// Documentary-style HUD: corner brackets, scene label, timecode.
const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const i = STARTS.filter((s) => f >= s).length - 1;
  const tc = (n: number) => String(n).padStart(2, "0");
  const br = (l: boolean): React.CSSProperties => ({ position: "absolute", top: 132, [l ? "left" : "right"]: 44, width: 34, height: 34, borderTop: `3px solid ${D.mut}`, [l ? "borderLeft" : "borderRight"]: `3px solid ${D.mut}`, opacity: 0.7 });
  const txt: React.CSSProperties = { position: "absolute", top: 148, fontFamily: MONO, fontSize: 20, letterSpacing: 2, color: D.mut };
  return (
    <>
      <div style={br(true)} /><div style={br(false)} />
      <div style={{ ...txt, left: 92 }}>SCN {tc(i + 1)} · {SCENES[i][0]}</div>
      <div style={{ ...txt, right: 92 }}>00:00:{tc(Math.floor(f / 30))}:{tc(f % 30)} · 30 FPS</div>
    </>
  );
};

export const SpssVsPls: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: D.bg }}>
      <TransitionSeries>
        {SCENES.flatMap(([name, d, C, dir], i) => [
          ...(i ? [<TransitionSeries.Transition key={`t${i}`} presentation={slide({ direction: dir })} timing={TR} />] : []),
          <TransitionSeries.Sequence key={name} name={name} durationInFrames={d} premountFor={fps}><C /></TransitionSeries.Sequence>,
        ])}
      </TransitionSeries>
      <Hud />
      <Subtitles subs={subs} top={1570} light />
      <Audio src={staticFile("spss-pls-audio.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
