import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile, useVideoConfig } from "remotion";
import { BrandScene } from "./BrandScene";
import { ConvergeScene } from "./ConvergeScene";
import { PainScene } from "./PainScene";

// 15s dark brand intro for @researchq.id (1080×1920, 30fps).
export const ResearchQIntro: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0E0D0C" }}>
      <Series>
        <Series.Sequence name="Pain" durationInFrames={126} premountFor={fps}>
          <PainScene />
        </Series.Sequence>
        <Series.Sequence name="Converge" durationInFrames={69} premountFor={fps}>
          <ConvergeScene />
        </Series.Sequence>
        <Series.Sequence name="Brand" durationInFrames={255} premountFor={fps}>
          <BrandScene />
        </Series.Sequence>
      </Series>
      <Audio src={staticFile("intro-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
