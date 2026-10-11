import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { ChatScene } from "./ChatScene";
import { HonestScene } from "./HonestScene";
import { HookScene } from "./HookScene";
import { OutroScene } from "./OutroScene";
import { RevealScene } from "./RevealScene";

// "Satu prompt, referensinya asli." — Scopus Finder demo, 45s, 1080×1920 @30fps.
// Scene lengths include the 8-frame fades: 158 + 518 + 368 + 158 + 172 − 4×8 = 1342 ≈ 44.7s.
export const ScopusFinderDemo: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#F3F1EA" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence name="Hook" durationInFrames={158} premountFor={fps}>
          <HookScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
        <TransitionSeries.Sequence name="Chat" durationInFrames={518} premountFor={fps}>
          <ChatScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
        <TransitionSeries.Sequence name="Reveal" durationInFrames={368} premountFor={fps}>
          <RevealScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
        <TransitionSeries.Sequence name="Honest" durationInFrames={158} premountFor={fps}>
          <HonestScene />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 8 })} />
        <TransitionSeries.Sequence name="Outro" durationInFrames={172} premountFor={fps}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Audio src={staticFile("scopus-sfx.wav")} premountFor={fps} />
    </AbsoluteFill>
  );
};
