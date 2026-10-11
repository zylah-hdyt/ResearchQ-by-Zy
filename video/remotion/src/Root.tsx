import { Composition, Folder } from "remotion";
import { HelloRQ } from "./HelloRQ";
import { BrandScene } from "./intro/BrandScene";
import { ConvergeScene } from "./intro/ConvergeScene";
import { PainScene } from "./intro/PainScene";
import { ResearchQIntro } from "./intro/ResearchQIntro";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ResearchQIntro" component={ResearchQIntro} durationInFrames={450} fps={30} width={1080} height={1920} />
    <Folder name="Intro-scenes">
      <Composition id="IntroPain" component={PainScene} durationInFrames={126} fps={30} width={1080} height={1920} />
      <Composition id="IntroConverge" component={ConvergeScene} durationInFrames={69} fps={30} width={1080} height={1920} />
      <Composition id="IntroBrand" component={BrandScene} durationInFrames={255} fps={30} width={1080} height={1920} />
    </Folder>
    <Composition id="HelloRQ" component={HelloRQ} durationInFrames={150} fps={30} width={1080} height={1920}
      defaultProps={{ title: "Remotion siap dipakai", handle: "@researchq.id" }} />
  </>
);
