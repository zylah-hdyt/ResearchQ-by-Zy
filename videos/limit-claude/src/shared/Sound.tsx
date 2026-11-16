import {Audio} from '@remotion/media';
import React from 'react';
import {Sequence, staticFile} from 'remotion';

export const VO = () => <Audio src={staticFile('vo.wav')} volume={1} />;

const REMOTE = 'https://remotion.media/';
const LOCAL = new Set([
	'drone',
	'techbed',
	'projector',
	'subhit',
	'riser',
	'tick',
	'glitch',
	'rustle',
	'thump',
	'pop',
	'shimmer',
]);

export type SfxName =
	| 'drone'
	| 'techbed'
	| 'projector'
	| 'subhit'
	| 'riser'
	| 'tick'
	| 'glitch'
	| 'rustle'
	| 'thump'
	| 'pop'
	| 'shimmer'
	| 'whoosh'
	| 'whip'
	| 'page-turn'
	| 'switch'
	| 'mouse-click'
	| 'shutter-modern'
	| 'shutter-old'
	| 'ding';

const src = (name: SfxName) =>
	LOCAL.has(name) ? staticFile(`sfx/${name}.wav`) : `${REMOTE}${name}.wav`;

export type Cue = {at: number; name: SfxName; vol: number};

/** Places each cue on the timeline at its frame. */
export const SfxTrack: React.FC<{cues: Cue[]}> = ({cues}) => (
	<>
		{cues.map((c, i) => (
			<Sequence key={i} from={c.at} name={`sfx ${c.name}`} layout="none">
				<Audio src={src(c.name)} volume={c.vol} />
			</Sequence>
		))}
	</>
);
