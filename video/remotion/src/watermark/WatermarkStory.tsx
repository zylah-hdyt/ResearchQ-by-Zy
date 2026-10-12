import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Subtitles } from "../scopus/Subtitles";
import { S1Hook, S2Search, S3Myth, S4Explain, S5Copas, S6Right, S7Disclose, S8Cta } from "./Scenes";
import subs from "./subs-id.json";

// "Claude sekarang ada watermark" — storytelling cartoon, 30s (900 frames @30fps), subtitles + SFX for the creator's VO.
// Scene starts: 0 / 92 / 170 / 302 / 428 / 530 / 680 / 775 — each padded by the 8-frame slide into the next.
const TR = linearTiming({ durationInFrames: 8 });

export const WatermarkStory: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#F6EFE4" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={100} premountFor={fps}><S1Hook /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Search" durationInFrames={86} premountFor={fps}><S2Search /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TR} />
        <TransitionSeries.Sequence name="Myth" durationInFrames={140} premountFor={fps}><S3Myth /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Explain" durationInFrames={134} premountFor={fps}><S4Explain /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Copas" durationInFrames={110} premountFor={fps}><S5Copas /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TR} />
        <TransitionSeries.Sequence name="Right" durationInFrames={158} premountFor={fps}><S6Right /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={TR} />
        <TransitionSeries.Sequence name="Disclose" durationInFrames={103} premountFor={fps}><S7Disclose /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={TR} />
        <TransitionSeries.Sequence name="CTA" durationInFrames={125} premountFor={fps}><S8Cta /></TransitionSeries.Sequence>
      </TransitionSeries>
      <Subtitles subs={subs} top={1570} />
      <Audio src={staticFile("watermark-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
