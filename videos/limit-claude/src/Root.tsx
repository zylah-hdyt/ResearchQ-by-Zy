import React from 'react';
import {Composition, Folder} from 'remotion';
import {DURATION, FPS, H, W} from './shared/timing';
import {Cinematic3D} from './v1-cinematic3d/Cinematic3D';
import {KineticType} from './v2-kinetic/KineticType';
import {Documentary} from './v3-documentary/Documentary';
import {TechUI} from './v4-techui/TechUI';
import {PaperCraft} from './v5-paper/PaperCraft';
import {UiDemo} from './v6-uidemo/UiDemo';
import {SocialCut} from './v7-social/SocialCut';
import {Whiteboard} from './v8-whiteboard/Whiteboard';
import {SwissPoster} from './v9-swiss/SwissPoster';
import {MENTAL_FRAMES, MentalSwiss} from './v10-mental/MentalSwiss';
import {CINE_FRAMES, MentalCinematic} from './v11-cinematic/MentalCinematic';

const common = {durationInFrames: DURATION, fps: FPS, width: W, height: H} as const;

export const RemotionRoot: React.FC = () => (
	<Folder name="Limit-Claude">
		<Composition id="V1-Cinematic3D" component={Cinematic3D} {...common} />
		<Composition id="V2-KineticType" component={KineticType} {...common} />
		<Composition id="V3-Documentary" component={Documentary} {...common} />
		<Composition id="V4-TechUI" component={TechUI} {...common} />
		<Composition id="V5-PaperCraft" component={PaperCraft} {...common} />
		<Composition id="V6-UiDemo" component={UiDemo} {...common} />
		<Composition id="V7-SocialCut" component={SocialCut} {...common} />
		<Composition id="V8-Whiteboard" component={Whiteboard} {...common} />
		<Composition id="V9-SwissPoster" component={SwissPoster} {...common} />
		<Composition id="Mental-SwissTalk" component={MentalSwiss} {...common} durationInFrames={MENTAL_FRAMES} />
		<Composition id="Mental-Cinematic" component={MentalCinematic} {...common} durationInFrames={CINE_FRAMES} />
	</Folder>
);
