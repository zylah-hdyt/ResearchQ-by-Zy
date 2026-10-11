import { Composition } from "remotion";
import { HelloRQ } from "./HelloRQ";

export const RemotionRoot: React.FC = () => (
  <Composition id="HelloRQ" component={HelloRQ} durationInFrames={150} fps={30} width={1080} height={1920}
    defaultProps={{ title: "Remotion siap dipakai", handle: "@researchq.id" }} />
);
