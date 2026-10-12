import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { CtaScene } from "./CtaScene";
import { DemoScene } from "./DemoScene";
import { HookScene } from "./HookScene";
import { PerksScene } from "./PerksScene";
import { ResultScene } from "./ResultScene";

// Theory Master (BAB 2) short, 37s (1110 frames @30fps), no VO. Each scene is padded by the 10-frame slide that
// overlaps the next one, so scene starts stay at 0 / 100 / 430 / 790 / 960 (SFX cues use the same grid).
const TR = linearTiming({ durationInFrames: 10 });

export const TheoryMasterShort: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#FAF8F4" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={110} premountFor={fps}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TR} />
        <TransitionSeries.Sequence name="Demo" durationInFrames={340} premountFor={fps}>
          <DemoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Result" durationInFrames={370} premountFor={fps}>
          <ResultScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Perks" durationInFrames={180} premountFor={fps}>
          <PerksScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TR} />
        <TransitionSeries.Sequence name="CTA" durationInFrames={150} premountFor={fps}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio src={staticFile("theory-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
