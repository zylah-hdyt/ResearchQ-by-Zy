import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { DataScene } from "./DataScene";
import { DoneScene } from "./DoneScene";
import { FlowScene } from "./FlowScene";
import { GapScene } from "./GapScene";
import { HookScene } from "./HookScene";
import { Cam } from "./kit";
import { PromptScene } from "./PromptScene";
import { YoutubeScene } from "./YoutubeScene";

// Problem Master skill short, 40s (1200 frames @30fps), no VO. Each scene is 10 frames longer than its slot and
// overlaps the next by a 10-frame slide/wipe, so scene start times (and the SFX cues) stay on the original grid.
const T = linearTiming({ durationInFrames: 10 });

export const ProblemMasterShort: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0D0F14" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={106} premountFor={fps}>
          <Cam><HookScene /></Cam>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={T} />
        <TransitionSeries.Sequence name="Prompt" durationInFrames={160} premountFor={fps}>
          <Cam><PromptScene /></Cam>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={T} />
        <TransitionSeries.Sequence name="Flow" durationInFrames={184} premountFor={fps}>
          <Cam><FlowScene /></Cam>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={T} />
        <TransitionSeries.Sequence name="Data" durationInFrames={400} premountFor={fps}>
          <Cam><DataScene /></Cam>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom-left" })} timing={T} />
        <TransitionSeries.Sequence name="Gap" durationInFrames={130} premountFor={fps}>
          <Cam><GapScene /></Cam>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-left" })} timing={T} />
        <TransitionSeries.Sequence name="Done" durationInFrames={100} premountFor={fps}>
          <Cam><DoneScene /></Cam>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={T} />
        <TransitionSeries.Sequence name="YouTube" durationInFrames={180} premountFor={fps}>
          <Cam><YoutubeScene /></Cam>
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio src={staticFile("problem-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
