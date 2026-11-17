import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {clamp, EASE_OUT} from '../shared/timing';
import {LIP_O, LIP_W} from '../v10-mental/lip';
import {MI} from '../v10-mental/mouthInfo';
import type {Pose} from '../v10-mental/Mascot';

// Row (in pose-PNG pixels) where each pose must be cut so the desk never shows.
// m_* poses: just above the desk band (measured from the PNGs). n_* poses: their own bottom edge.
const CUT: Record<Pose, number> = {
	m_open: 826,
	m_thumb: 842,
	m_think: 832,
	m_point: 822,
	m_warn: 847,
	n_present: 1177,
	n_idea: 1180,
	n_shrug: 1179,
	n_wink: 1182,
};

/**
 * The user's mascot as an on-camera narrator: half body, no desk.
 * The cut row is placed below the bottom edge of the frame (y = 1920 + 6), so the figure is framed like a presenter.
 */
export const Narrator: React.FC<{pose: Pose; cx: number; k: number; from: number; to: number; enter?: boolean; exit?: boolean; dim?: number}> = ({pose, cx, k, from, to, enter = true, exit = true}) => {
	const frame = useCurrentFrame();
	if (frame < from || frame >= to) return null;
	const i = MI[pose];
	const s = i.s * k;
	const W = (i.W ?? 900) * s;
	const mx = (i.x + i.w / 2) * s;
	const my = (i.y + i.h / 2) * s;
	const top = 1926 - CUT[pose] * s;
	const e = enter ? interpolate(frame, [from, from + 12], [1, 0], {...clamp, easing: EASE_OUT}) : 0;
	const x = exit ? interpolate(frame, [to - 8, to], [0, 1], clamp) : 0;
	const bounce = interpolate(frame, [from, from + 3, from + 9], [0.97, 1.025, 1], clamp);
	const breathe = 1 + Math.sin(frame / 18) * 0.007;
	const o = LIP_O[Math.min(LIP_O.length - 1, frame)] ?? 0;
	const w = LIP_W[Math.min(LIP_W.length - 1, frame)] ?? 0;
	const mn = pose === 'm_think' ? 0.3 : pose === 'm_warn' ? 0.22 : 0.13;
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - mx,
				top,
				width: W,
				transformOrigin: `${mx}px ${CUT[pose] * s}px`,
				scale: (enter ? bounce : 1) * breathe,
				rotate: `${Math.sin(frame / 24) * 0.7}deg`,
				translate: `0 ${(e + x) * 700 - o * 2}px`,
				opacity: 1 - x,
				filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.45))',
			}}
		>
			<Img src={staticFile(`mascot/b_${pose}.png`)} style={{display: 'block', width: '100%', clipPath: `inset(0 0 ${100 - (CUT[pose] / ((i.H ?? (pose.startsWith('m_') ? 876 : 1180)))) * 100}% 0)`}} />
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
