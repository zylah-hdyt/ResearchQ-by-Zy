import { Composition, Folder } from "remotion";
import { HelloRQ } from "./HelloRQ";
import { BrandScene } from "./intro/BrandScene";
import { ConvergeScene } from "./intro/ConvergeScene";
import { PainScene } from "./intro/PainScene";
import { ResearchQIntro } from "./intro/ResearchQIntro";
import { ChatScene } from "./scopus/ChatScene";
import { HonestScene } from "./scopus/HonestScene";
import { HookScene } from "./scopus/HookScene";
import { OutroScene } from "./scopus/OutroScene";
import { RevealScene } from "./scopus/RevealScene";
import { ScopusFinderDemo } from "./scopus/ScopusFinderDemo";
import { ScopusFinderDemoEN, ScopusFinderDemoID } from "./scopus/ScopusFinderDemoEN";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ResearchQIntro" component={ResearchQIntro} durationInFrames={450} fps={30} width={1080} height={1920} />
    <Folder name="Intro-scenes">
      <Composition id="IntroPain" component={PainScene} durationInFrames={126} fps={30} width={1080} height={1920} />
      <Composition id="IntroConverge" component={ConvergeScene} durationInFrames={69} fps={30} width={1080} height={1920} />
      <Composition id="IntroBrand" component={BrandScene} durationInFrames={255} fps={30} width={1080} height={1920} />
    </Folder>
    <Composition id="ScopusFinderDemo" component={ScopusFinderDemo} durationInFrames={1342} fps={30} width={1080} height={1920} />
    <Composition id="ScopusFinderDemoEN" component={ScopusFinderDemoEN} durationInFrames={1342} fps={30} width={1080} height={1920} />
    <Composition id="ScopusFinderDemoID" component={ScopusFinderDemoID} durationInFrames={1342} fps={30} width={1080} height={1920} />
    <Folder name="Scopus-scenes">
      <Composition id="ScopusHook" component={HookScene} durationInFrames={158} fps={30} width={1080} height={1920} />
      <Composition id="ScopusChat" component={ChatScene} durationInFrames={518} fps={30} width={1080} height={1920} />
      <Composition id="ScopusReveal" component={RevealScene} durationInFrames={368} fps={30} width={1080} height={1920} />
      <Composition id="ScopusHonest" component={HonestScene} durationInFrames={158} fps={30} width={1080} height={1920} />
      <Composition id="ScopusOutro" component={OutroScene} durationInFrames={172} fps={30} width={1080} height={1920} />
    </Folder>
    <Composition id="HelloRQ" component={HelloRQ} durationInFrames={150} fps={30} width={1080} height={1920}
      defaultProps={{ title: "Remotion siap dipakai", handle: "@researchq.id" }} />
  </>
);
