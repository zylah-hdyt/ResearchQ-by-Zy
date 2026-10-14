import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Subtitles } from "../scopus/Subtitles";
import { cardOut, Drift, Finish, Flash, iris, Stinger, whipPan, zoomPunch, zoomThrough } from "./fx";
import { D, S1Hook, S2Spss, S3Pls, S4Analysis, S5ProCon, S6When, S7Cta } from "./Scenes";
import subs from "./subs-id.json";

// "SPSS atau SmartPLS?" — premium dark explainer, 60s (1800 frames @30fps). Captions + music bed + SFX, no VO.
// Scene starts stay on the 120 BPM bar grid: 0 / 120 / 420 / 720 / 1080 / 1440 / 1650. Each scene is padded by the
// 14-frame transition into the next. Transitions: zoom punch · whip pan · card out · iris · zoom-through · zoom punch;
// stingers (diagonal brand bars) ride the cuts at 420 and 1440, white flashes sell the punch-ins at 120 and 1650.
const TF = 14;
const STARTS = [0, 120, 420, 720, 1080, 1440, 1650];
const SCENES: [string, React.FC][] = [["PEMBUKA", S1Hook], ["SPSS", S2Spss], ["SMARTPLS", S3Pls], ["ANALISIS", S4Analysis], ["PLUS & MINUS", S5ProCon], ["KEPUTUSAN", S6When], ["PENUTUP", S7Cta]];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANS: TransitionPresentation<any>[] = [
  zoomPunch("25% 41%"), // dive into the SPSS logo
  whipPan(),
  cardOut(),
  iris(),
  zoomThrough(),
  zoomPunch("50% 55%"),
];
const DUR = STARTS.map((s, i) => (i < STARTS.length - 1 ? STARTS[i + 1] - s + TF : 1800 - s));

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
      {[420, 1440].map((t) => <Sequence key={t} from={t - 2} durationInFrames={26} name="Stinger"><Stinger /></Sequence>)}
      {[120, 1650].map((t) => <Sequence key={t} from={t + 4} durationInFrames={14} name="Flash"><Flash /></Sequence>)}
      <Subtitles subs={subs} top={1440} light />
      <Finish />
      <Audio src={staticFile("spss-pls-audio.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
