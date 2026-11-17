import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp, EASE_OUT} from '../shared/timing';
import {LIP_O, LIP_W} from './lip';
import {MI} from './mouthInfo';

export type Pose = 'm_open' | 'm_thumb' | 'm_think' | 'm_point' | 'm_warn' | 'n_present' | 'n_idea' | 'n_shrug' | 'n_wink';

/**
 * The user's mascot (Studio Pack PNGs, unmodified) with a lip-synced mouth sprite.
 * (mx, my) is where the mouth centre lands on screen; k scales the whole figure.
 * Mouth model follows the pack's template: vertical scale = min + (1-min) * openness.
 */
export const Mascot: React.FC<{pose: Pose; mx: number; my: number; k: number; from: number; to: number; poseAt?: number}> = ({pose, mx, my, k, from, to, poseAt = from}) => {
	const frame = useCurrentFrame();
	if (frame < from - 1 || frame > to) return null;
	const i = MI[pose];
	const s = i.s * k;
	const W = (i.W ?? 900) * s;
	const enter = interpolate(frame, [from, from + 10], [1, 0], {...clamp, easing: EASE_OUT});
	const exit = interpolate(frame, [to - 7, to], [0, 1], clamp);
	const bounce = interpolate(frame, [poseAt, poseAt + 3, poseAt + 9], [0.96, 1.035, 1], clamp);
	const breathe = 1 + Math.sin(frame / 17) * 0.008;
	const o = LIP_O[Math.min(LIP_O.length - 1, frame)] ?? 0;
	const w = LIP_W[Math.min(LIP_W.length - 1, frame)] ?? 0;
	const mn = pose === 'm_think' ? 0.3 : pose === 'm_warn' ? 0.22 : 0.13;
	const left = mx - (i.x + i.w / 2) * s;
	const top = my - (i.y + i.h / 2) * s;
	return (
		<div
			style={{
				position: 'absolute',
				left,
				top,
				width: W,
				transformOrigin: `${(i.x + i.w / 2) * s}px ${(i.y + i.h / 2) * s}px`,
				scale: bounce * breathe,
				rotate: `${Math.sin(frame / 22) * 0.8}deg`,
				translate: `0 ${(enter + exit) * 900 - o * 2.5}px`,
			}}
		>
			<Img src={staticFile(`mascot/b_${pose}.png`)} style={{display: 'block', width: '100%'}} />
			<Img
				src={staticFile(`mascot/mo_${pose}.png`)}
				style={{
					position: 'absolute',
					left: i.x * s,
					top: i.y * s,
					width: i.w * s,
					height: i.h * s,
					transformOrigin: `50% ${(i.top + (i.h - 2 * i.top) * 0.18) * s}px`,
					scale: `${(0.9 + 0.16 * w - 0.06 * o).toFixed(3)} ${(mn + (1 - mn) * o).toFixed(3)}`,
				}}
			/>
		</div>
	);
};
