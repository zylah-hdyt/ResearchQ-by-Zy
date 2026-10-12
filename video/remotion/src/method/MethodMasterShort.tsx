import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Subtitles } from "../scopus/Subtitles";
import { CtaScene, PerksScene } from "./CloseScenes";
import { DemoScene } from "./DemoScene";
import { HookScene } from "./HookScene";
import { ResultScene } from "./ResultScene";
import subs from "./subs-id.json";

// Method Master (BAB 3) short, 30s (900 frames @30fps). Subtitles + SFX, no voice (creator records VO).
// Scene starts: 0 / 150 / 441 / 668 / 790 — each scene is padded by the 10-frame slide into the next.
const TR = linearTiming({ durationInFrames: 10 });

export const MethodMasterShort: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#FAF8F4" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={160} premountFor={fps}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TR} />
        <TransitionSeries.Sequence name="Demo" durationInFrames={301} premountFor={fps}>
          <DemoScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Result" durationInFrames={237} premountFor={fps}>
          <ResultScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Perks" durationInFrames={132} premountFor={fps}>
          <PerksScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TR} />
        <TransitionSeries.Sequence name="CTA" durationInFrames={110} premountFor={fps}>
          <CtaScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Subtitles subs={subs} />
      <Audio src={staticFile("method-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
