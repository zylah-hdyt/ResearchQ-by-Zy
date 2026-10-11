import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { SubsMode } from "./kit";
import { ScopusTimeline } from "./ScopusFinderDemo";
import { Subtitles } from "./Subtitles";

// English voiceover (Cartesia, "Brandon") + Indonesian subtitles. Same scenes, compact layout for the subtitle band.
export const ScopusFinderDemoEN: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <SubsMode.Provider value>
      <AbsoluteFill style={{ backgroundColor: "#F3F1EA" }}>
        <ScopusTimeline />
        <Subtitles />
        <Audio src={staticFile("scopus-mix-en.wav")} premountFor={fps} />
      </AbsoluteFill>
    </SubsMode.Provider>
  );
};
