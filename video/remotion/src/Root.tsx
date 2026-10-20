import { Composition, Folder } from "remotion";
import { HelloRQ } from "./HelloRQ";
import { BrandScene } from "./intro/BrandScene";
import { ConvergeScene } from "./intro/ConvergeScene";
import { PainScene } from "./intro/PainScene";
import { ResearchQIntro } from "./intro/ResearchQIntro";
import { ProblemMasterShort } from "./problem/ProblemMasterShort";
import { TheoryMasterShort } from "./theory/TheoryMasterShort";
import { MethodMasterShort } from "./method/MethodMasterShort";
import { WatermarkStory } from "./watermark/WatermarkStory";
import { SpssVsPls } from "./stats/SpssVsPls";
import { ProblemBab1 } from "./bab1/ProblemBab1";
import { SkillsLibrary } from "./library/Library";
import { SkillsShort } from "./library/Short";
import { PovResearchQ } from "./pov/Pov";
import { SkillsCine } from "./cine/Cine";
import { AiReducerAd } from "./ads/AiReducer";
import { ClaudeProVO } from "./claudepro/ClaudePro";
import { ReducerLight } from "./ads/ReducerLight";
import { SharingClaude } from "./sharing/Sharing";
import { MahasiswaUdik } from "./udik/Udik";
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
    <Composition id="SkillsShort" component={SkillsShort} durationInFrames={750} fps={30} width={1080} height={1920} />
    <Composition id="PovResearchQ" component={PovResearchQ} durationInFrames={420} fps={30} width={1080} height={1920} />
    <Composition id="SkillsCine" component={SkillsCine} durationInFrames={750} fps={30} width={1080} height={1920} />
    <Composition id="AiReducerAd" component={AiReducerAd} durationInFrames={450} fps={30} width={1080} height={1920} defaultProps={{ subs: true }} />
    <Composition id="ClaudeProVO" component={ClaudeProVO} durationInFrames={930} fps={30} width={1080} height={1920} defaultProps={{ subs: true }} />
    <Composition id="ReducerLight" component={ReducerLight} durationInFrames={586} fps={30} width={1080} height={1920} defaultProps={{ subs: true }} />
    <Composition id="SharingClaude" component={SharingClaude} durationInFrames={1922} fps={30} width={1080} height={1920} defaultProps={{ subs: true }} />
    <Composition id="MahasiswaUdik" component={MahasiswaUdik} durationInFrames={1455} fps={30} width={1080} height={1920} defaultProps={{ subs: true }} />
    <Composition id="SkillsLibrary" component={SkillsLibrary} durationInFrames={1530} fps={30} width={1080} height={1920} />
    <Composition id="ProblemBab1" component={ProblemBab1} durationInFrames={1440} fps={30} width={1080} height={1920} />
    <Composition id="SpssVsPls" component={SpssVsPls} durationInFrames={1800} fps={30} width={1080} height={1920} />
    <Composition id="WatermarkStory" component={WatermarkStory} durationInFrames={900} fps={30} width={1080} height={1920} />
    <Composition id="MethodMasterShort" component={MethodMasterShort} durationInFrames={900} fps={30} width={1080} height={1920} />
    <Composition id="TheoryMasterShort" component={TheoryMasterShort} durationInFrames={1125} fps={30} width={1080} height={1920} />
    <Composition id="ProblemMasterShort" component={ProblemMasterShort} durationInFrames={1200} fps={30} width={1080} height={1920} />
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
