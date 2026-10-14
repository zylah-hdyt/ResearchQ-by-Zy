import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Subtitles } from "../scopus/Subtitles";
import { S1Hook, S2Spss, S3Pls, S4Analysis, S5ProCon, S6When, S7Cta } from "./Scenes";
import subs from "./subs-id.json";

// "SPSS atau SmartPLS?" — storytelling explainer, 60s (1800 frames @30fps), subtitles + SFX for the creator's VO.
// Scene starts: 0 / 120 / 420 / 720 / 1080 / 1440 / 1650 — each padded by the 8-frame slide into the next.
const TR = linearTiming({ durationInFrames: 8 });
const SCENES: [string, number, React.FC, "from-right" | "from-bottom"][] = [
  ["Hook", 128, S1Hook, "from-right"], ["SPSS", 308, S2Spss, "from-right"], ["SmartPLS", 308, S3Pls, "from-bottom"],
  ["Analisis", 368, S4Analysis, "from-right"], ["ProCon", 368, S5ProCon, "from-bottom"], ["Kapan", 218, S6When, "from-right"], ["CTA", 150, S7Cta, "from-right"],
];

export const SpssVsPls: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#F6EFE4" }}>
      <TransitionSeries>
        {SCENES.flatMap(([name, d, C, dir], i) => [
          ...(i ? [<TransitionSeries.Transition key={`t${i}`} presentation={slide({ direction: dir })} timing={TR} />] : []),
          <TransitionSeries.Sequence key={name} name={name} durationInFrames={d} premountFor={fps}><C /></TransitionSeries.Sequence>,
        ])}
      </TransitionSeries>
      <Subtitles subs={subs} top={1570} />
      <Audio src={staticFile("spss-pls-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
