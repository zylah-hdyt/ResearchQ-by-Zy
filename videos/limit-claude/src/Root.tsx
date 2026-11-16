import React from 'react';
import {Composition, Folder} from 'remotion';
import {DURATION, FPS, H, W} from './shared/timing';
import {Cinematic3D} from './v1-cinematic3d/Cinematic3D';
import {KineticType} from './v2-kinetic/KineticType';
import {Documentary} from './v3-documentary/Documentary';
import {TechUI} from './v4-techui/TechUI';
import {PaperCraft} from './v5-paper/PaperCraft';

const common = {durationInFrames: DURATION, fps: FPS, width: W, height: H} as const;

export const RemotionRoot: React.FC = () => (
	<Folder name="Limit-Claude">
		<Composition id="V1-Cinematic3D" component={Cinematic3D} {...common} />
		<Composition id="V2-KineticType" component={KineticType} {...common} />
		<Composition id="V3-Documentary" component={Documentary} {...common} />
		<Composition id="V4-TechUI" component={TechUI} {...common} />
		<Composition id="V5-PaperCraft" component={PaperCraft} {...common} />
	</Folder>
);
