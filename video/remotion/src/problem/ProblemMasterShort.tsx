import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, staticFile, useVideoConfig } from "remotion";
import { DataScene } from "./DataScene";
import { DoneScene } from "./DoneScene";
import { FlowScene } from "./FlowScene";
import { GapScene } from "./GapScene";
import { HookScene } from "./HookScene";
import { PromptScene } from "./PromptScene";
import { YoutubeScene } from "./YoutubeScene";

// Problem Master skill short, 40s (1200 frames @30fps), no VO — hard cuts in the NotYourLecture thumbnail style.
export const ProblemMasterShort: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#04060C" }}>
      <Series>
        <Series.Sequence name="Hook" durationInFrames={96} premountFor={fps}>
          <HookScene />
        </Series.Sequence>
        <Series.Sequence name="Prompt" durationInFrames={150} premountFor={fps}>
          <PromptScene />
        </Series.Sequence>
        <Series.Sequence name="Flow" durationInFrames={174} premountFor={fps}>
          <FlowScene />
        </Series.Sequence>
        <Series.Sequence name="Data" durationInFrames={390} premountFor={fps}>
          <DataScene />
        </Series.Sequence>
        <Series.Sequence name="Gap" durationInFrames={120} premountFor={fps}>
          <GapScene />
        </Series.Sequence>
        <Series.Sequence name="Done" durationInFrames={90} premountFor={fps}>
          <DoneScene />
        </Series.Sequence>
        <Series.Sequence name="YouTube" durationInFrames={180} premountFor={fps}>
          <YoutubeScene />
        </Series.Sequence>
      </Series>
      <Audio src={staticFile("problem-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
