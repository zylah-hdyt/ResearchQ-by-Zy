import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { CtaScene } from "./CtaScene";
import { DemoScene } from "./DemoScene";
import { HookScene } from "./HookScene";
import { PerksScene } from "./PerksScene";
import { ResultScene } from "./ResultScene";
import { Subtitles } from "../scopus/Subtitles";
import subs from "./subs-id.json";

// Theory Master (BAB 2) short, 37.5s (1125 frames @30fps), timed to the voice-over script (subs-id.json). Each scene is padded by the
// 10-frame slide that overlaps the next one, so scene starts sit at 0 / 132 / 462 / 792 / 999 (SFX cues use the same grid).
const TR = linearTiming({ durationInFrames: 10 });

const Timeline: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={142} premountFor={fps}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TR} />
        <TransitionSeries.Sequence name="Demo" durationInFrames={340} premountFor={fps}>
          <DemoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Result" durationInFrames={340} premountFor={fps}>
          <ResultScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Perks" durationInFrames={217} premountFor={fps}>
          <PerksScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TR} />
        <TransitionSeries.Sequence name="CTA" durationInFrames={126} premountFor={fps}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
  );
};

// Subtitles + SFX only (no voice). The creator records their own voice over it; subtitle timing follows the script.
export const TheoryMasterShort: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#FAF8F4" }}>
      <Timeline />
      <Subtitles subs={subs} />
      <Audio src={staticFile("theory-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
