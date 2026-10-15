import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import type { TransitionPresentation } from "@remotion/transitions";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Subtitles } from "../scopus/Subtitles";
import { cardOut, Drift, Flash, iris, Stinger, whipPan, zoomPunch, zoomThrough } from "../stats/fx";
import { T } from "../theory/kit";
import { S1Hook, S2Demo, S3Flow, S4Data, S5Done, S6Youtube, S7Cta } from "./Scenes";
import subs from "./subs-id.json";

// Problem Master (BAB 1) — Claude chat/screen UI short, 48s (1440 frames @30fps). Captions + music bed + SFX.
// Scene starts on the 120 BPM bar grid: 0 / 120 / 420 / 600 / 900 / 1020 / 1200; each scene is padded by the 14-frame
// transition into the next. Transitions: zoom punch · whip pan · card out · iris · zoom-through · zoom punch.
const TF = 14;
const STARTS = [0, 120, 420, 600, 900, 1020, 1200];
const SCENES: React.FC[] = [S1Hook, S2Demo, S3Flow, S4Data, S5Done, S6Youtube, S7Cta];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANS: TransitionPresentation<any>[] = [zoomPunch("40% 45%"), whipPan(), cardOut(), iris(), zoomThrough(), zoomPunch("50% 42%")];
const DUR = STARTS.map((s, i) => (i < STARTS.length - 1 ? STARTS[i + 1] - s + TF : 1440 - s));

export const ProblemBab1: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: T.bg }}>
      <TransitionSeries>
        {SCENES.flatMap((C, i) => [
          ...(i ? [<TransitionSeries.Transition key={`t${i}`} presentation={TRANS[i - 1]} timing={linearTiming({ durationInFrames: TF })} />] : []),
          <TransitionSeries.Sequence key={`s${i}`} durationInFrames={DUR[i]} premountFor={fps}><Drift d={DUR[i]}><C /></Drift></TransitionSeries.Sequence>,
        ])}
      </TransitionSeries>
      {[420, 1020].map((t) => <Sequence key={t} from={t - 2} durationInFrames={26} name="Stinger"><Stinger colors={[T.orange, T.ink, "#FFE1CF"]} /></Sequence>)}
      {[120, 1200].map((t) => <Sequence key={t} from={t + 4} durationInFrames={14} name="Flash"><Flash /></Sequence>)}
      <Subtitles subs={subs} top={1440} />
      <Audio src={staticFile("bab1-audio.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
