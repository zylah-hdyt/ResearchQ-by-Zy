import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { pushCut } from "@remotion/transitions/push-cut";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Subtitles } from "../scopus/Subtitles";
import { MONO } from "../theory/kit";
import { Drift, Finish, Stinger, zoomThrough } from "./fx";
import { D, S1Hook, S2Spss, S3Pls, S4Analysis, S5ProCon, S6When, S7Cta } from "./Scenes";
import subs from "./subs-id.json";

// "SPSS atau SmartPLS?" — premium dark explainer, 60s (1800 frames @30fps). Captions + music bed + SFX, no VO.
// Scene starts stay on the 120 BPM bar grid: 0 / 120 / 420 / 720 / 1080 / 1440 / 1650. Each scene is padded by the
// 14-frame transition into the next; stingers (diagonal brand bars) cover the cuts at 420 and 1080.
const TF = 14;
const STARTS = [0, 120, 420, 720, 1080, 1440, 1650];
const SCENES: [string, React.FC][] = [["PEMBUKA", S1Hook], ["SPSS", S2Spss], ["SMARTPLS", S3Pls], ["ANALISIS", S4Analysis], ["PLUS & MINUS", S5ProCon], ["KEPUTUSAN", S6When], ["PENUTUP", S7Cta]];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANS: TransitionPresentation<any>[] = [
  pushCut({ flashColor: "#FFFFFF", flashOpacity: 0.35 }),
  wipe({ direction: "from-right" }),
  zoomThrough(),
  slide({ direction: "from-bottom" }),
  pushCut({ flashColor: D.pls, flashOpacity: 0.25 }),
  zoomThrough(),
];
const DUR = STARTS.map((s, i) => (i < STARTS.length - 1 ? STARTS[i + 1] - s + TF : 1800 - s));

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
      <div style={{ position: "absolute", left: 92, right: 92, top: 186, height: 3, borderRadius: 2, background: "rgba(138,150,168,.22)" }}>
        <div style={{ width: `${(f / 1800) * 100}%`, height: "100%", borderRadius: 2, background: D.pls }} />
      </div>
    </>
  );
};

export const SpssVsPls: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: D.bg }}>
      <TransitionSeries>
        {SCENES.flatMap(([name, C], i) => [
          ...(i ? [<TransitionSeries.Transition key={`t${i}`} presentation={TRANS[i - 1]} timing={linearTiming({ durationInFrames: TF })} />] : []),
          <TransitionSeries.Sequence key={name} name={name} durationInFrames={DUR[i]} premountFor={fps}><Drift d={DUR[i]}><C /></Drift></TransitionSeries.Sequence>,
        ])}
      </TransitionSeries>
      {[420, 1080].map((t) => <Sequence key={t} from={t - 4} durationInFrames={26} name="Stinger"><Stinger /></Sequence>)}
      <Hud />
      <Subtitles subs={subs} top={1570} light />
      <Finish />
      <Audio src={staticFile("spss-pls-audio.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
