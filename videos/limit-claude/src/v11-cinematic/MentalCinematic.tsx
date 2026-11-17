import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../shared/fonts';
import {clamp, EASE_IN_OUT, prog, rand} from '../shared/timing';
import type {Pose} from '../v10-mental/Mascot';
import {MW} from '../v10-mental/words';
import {Narrator} from './Narrator';

// "Kenapa mental lu makin lembek?" told as a cinematic short: full-colour photography, slow camera,
// film grade, narrated by the user's mascot at the key beats.
export const CINE_FRAMES = 1770;

const T = (s: number) => Math.round(s * 30);
const INK = '#F7F3EA';
const AMBER = '#F4B860';

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1400`;
const IMG = {
	bedPhone: px(8070525),
	giveUp: px(6214833),
	lazy: px(5409046),
	teacher: px(6325934),
	confused: px(6958584),
	library: px(590493),
	magnifier: px(4494642),
	hourglass: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=1400&q=82&auto=format&fit=crop',
	climber: px(5907806),
	together: px(8199759),
	reader: px(9572630),
	highlight: px(8553917),
	runners: px(4604846),
	stopwatch: px(19730401),
	lamp: px(8005646),
	shelves: px(763135),
	bokeh: px(29419061),
};

// ---------- shot list ----------
type Shot = {
	at: number; // seconds
	img: string;
	focus?: string;
	zoom?: [number, number];
	pan?: [number, number, number, number];
	narrator?: {pose: Pose; cx: number; k: number; switchAt?: number; pose2?: Pose};
	text: 'low' | 'high';
	title?: string;
	titleTop?: number;
	chapter?: string;
};
const SHOTS: Shot[] = [
	{at: 0, img: IMG.bedPhone, focus: '35% 50%', zoom: [1.18, 1.06], text: 'low', chapter: 'BAB 1 · KENAPA?'},
	{at: 2.95, img: IMG.bedPhone, narrator: {pose: 'm_think', cx: 540, k: 1.55}, text: 'high'},
	{at: 5.2, img: IMG.giveUp, focus: '50% 40%', zoom: [1.05, 1.18], text: 'low'},
	{at: 7.1, img: IMG.lazy, focus: '45% 50%', zoom: [1.2, 1.08], pan: [-30, 0, 20, 0], text: 'low'},
	{at: 8.95, img: IMG.teacher, focus: '38% 40%', zoom: [1.06, 1.16], text: 'low'},
	{at: 12.1, img: IMG.confused, focus: '50% 40%', zoom: [1.25, 1.1], text: 'low'},
	{at: 14.45, img: IMG.library, narrator: {pose: 'n_present', cx: 560, k: 1.5, switchAt: 16.72, pose2: 'm_point'}, text: 'high', chapter: 'BAB 2 · KEBENARANNYA'},
	{at: 18.1, img: IMG.library, focus: '50% 50%', zoom: [1.05, 1.2], text: 'low'},
	{at: 20.65, img: IMG.magnifier, focus: '55% 45%', zoom: [1.3, 1.12], text: 'low', title: 'KETELITIAN'},
	{at: 22.2, img: IMG.hourglass, focus: '50% 55%', zoom: [1.15, 1.25], text: 'low', title: 'KESABARAN'},
	{at: 23.1, img: IMG.climber, focus: '45% 50%', zoom: [1.08, 1.2], pan: [0, 30, 0, -20], text: 'low', title: 'KEMAUAN', titleTop: 1180},
	{at: 25.05, img: IMG.together, focus: '50% 45%', zoom: [1.06, 1.16], text: 'low'},
	{at: 29.2, img: IMG.reader, focus: '55% 50%', zoom: [1.12, 1.04], text: 'low'},
	{at: 32.95, img: IMG.highlight, focus: '50% 50%', zoom: [1.04, 1.16], text: 'low'},
	{at: 36.85, img: IMG.bokeh, narrator: {pose: 'm_thumb', cx: 540, k: 1.55}, text: 'high', chapter: 'BAB 3 · PESANNYA'},
	{at: 38.55, img: IMG.runners, focus: '60% 50%', zoom: [1.1, 1.22], pan: [20, 0, -20, 0], text: 'low'},
	{at: 41.85, img: IMG.stopwatch, focus: '50% 45%', zoom: [1.3, 1.1], text: 'low'},
	{at: 45.3, img: IMG.lamp, focus: '60% 50%', zoom: [1.05, 1.16], text: 'low'},
	{at: 49.45, img: IMG.shelves, narrator: {pose: 'm_warn', cx: 540, k: 1.5}, text: 'high'},
	{at: 54.05, img: IMG.bokeh, narrator: {pose: 'n_wink', cx: 560, k: 1.5}, text: 'high'},
];
const shotIndex = (frame: number) => {
	let k = 0;
	SHOTS.forEach((s, i) => {
		if (frame >= T(s.at)) k = i;
	});
	return k;
};
const shotEnd = (i: number) => (i + 1 < SHOTS.length ? T(SHOTS[i + 1].at) : CINE_FRAMES);

// ---------- picture ----------
const GRADE = 'contrast(1.06) saturate(0.95) brightness(0.96) sepia(0.06)';

const Photo: React.FC<{shot: Shot; from: number; to: number; blur?: boolean}> = ({shot, from, to, blur}) => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [from, to + 15], [0, 1], clamp);
	const [z0, z1] = shot.zoom ?? [1.08, 1.16];
	const [ax, ay, bx, by] = shot.pan ?? [0, 0, 0, 0];
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#0b0b0b'}}>
			<Img
				src={shot.img}
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					objectPosition: shot.focus ?? '50% 50%',
					scale: blur ? 1.25 : interpolate(t, [0, 1], [z0, z1]),
					translate: `${ax + (bx - ax) * t}px ${ay + (by - ay) * t}px`,
					filter: blur ? `${GRADE} blur(26px) brightness(0.62)` : GRADE,
				}}
			/>
		</AbsoluteFill>
	);
};

/** Warm highlights / cool shadows, vignette and gradients that hold the type. */
const Grade: React.FC<{text: 'low' | 'high'}> = ({text}) => (
	<>
		<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,170,90,0.08), rgba(40,70,90,0.10))', mixBlendMode: 'soft-light'}} />
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 45%, transparent 50%, rgba(0,0,0,0.6) 100%)'}} />
		{text === 'low' ? (
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 22%, transparent 34%, transparent 48%, rgba(0,0,0,0.82) 100%)'}} />
		) : (
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 45%, transparent 60%)'}} />
		)}
	</>
);

const Grain: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{opacity: 0.1, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
			<svg width="100%" height="100%">
				<filter id="g">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 30} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#g)" />
			</svg>
		</AbsoluteFill>
	);
};

/** Warm light leak across a cut. */
const Leak: React.FC<{at: number; seed: number}> = ({at, seed}) => {
	const frame = useCurrentFrame();
	if (frame < at - 6 || frame > at + 12) return null;
	const p = interpolate(frame, [at - 6, at, at + 12], [0, 1, 0], clamp);
	const x = 20 + rand(seed) * 60;
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', opacity: p * 0.75}}>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 60% 45% at ${x}% ${30 + rand(seed + 3) * 40}%, rgba(255,190,120,1) 0%, rgba(255,120,60,0.45) 40%, transparent 72%)`}} />
		</AbsoluteFill>
	);
};

// ---------- type ----------
const ACCENT = new Set(['teknologi', 'lembek', 'menyerah', 'malas', 'dijelaskan', 'memahami', 'mampu', 'kecerdasan', 'ketelitian', 'kesabaran', 'kemauan', 'mencoba', 'bisa', 'satu', 'kali', 'dua', 'tiga', 'paham', 'masalah', 'kecepatan', 'berbeda', 'cepat', 'belajar', 'berkali-kali', 'menyimpulkan', 'berusaha', 'save']);
const clean = (w: string) => w.toLowerCase().replace(/[,.?!]/g, '');

/** The VO words of this shot, revealed on their own timestamps and wrapped inside a 950 px column. */
const Narration: React.FC<{from: number; to: number; place: 'low' | 'high'; strike?: string}> = ({from, to, place, strike}) => {
	const frame = useCurrentFrame();
	const words = MW.filter((w) => T(w.s) >= from - 2 && T(w.s) < to - 2);
	if (!words.length) return null;
	const chars = words.reduce((n, w) => n + w.w.length + 1, 0);
	const size = chars > 80 ? 58 : chars > 55 ? 66 : chars > 34 ? 76 : 88;
	const out = interpolate(frame, [to - 6, to], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', left: 64, right: 64, ...(place === 'low' ? {bottom: 250} : {top: 210}), fontFamily: FONT.serif, fontSize: size, lineHeight: 1.12, color: INK, opacity: out, textShadow: '0 4px 24px rgba(0,0,0,0.55)'}}>
			{words.map((w, i) => {
				const p = prog(frame, T(w.s) - 2, T(w.s) + 5);
				const acc = ACCENT.has(clean(w.w));
				const struck = strike && clean(w.w) === strike;
				const sp = struck ? prog(frame, T(w.s) + 10, T(w.s) + 18, EASE_IN_OUT) : 0;
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							position: 'relative',
							marginRight: '0.24em',
							opacity: p,
							translate: `0 ${(1 - p) * 18}px`,
							filter: `blur(${(1 - p) * 8}px)`,
							fontFamily: acc ? FONT.tight : FONT.serif,
							fontWeight: acc ? 800 : 400,
							fontSize: acc ? size * 0.86 : size,
							letterSpacing: acc ? '-0.01em' : 0,
							textTransform: acc ? 'uppercase' : 'none',
							color: acc ? AMBER : INK,
						}}
					>
						{w.w}
						{struck ? <span style={{position: 'absolute', left: -4, top: '52%', height: 8, width: `calc(${sp * 100}% + 8px)`, backgroundColor: INK, borderRadius: 4}} /> : null}
					</span>
				);
			})}
		</div>
	);
};

const Title: React.FC<{text: string; from: number; top?: number}> = ({text, from, top = 640}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, from + 2, from + 14);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', fontFamily: FONT.tight, fontWeight: 300, fontSize: 96, letterSpacing: interpolate(p, [0, 1], [40, 22]), color: INK, opacity: p, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>
			{text}
		</div>
	);
};

const Chapter: React.FC<{text: string; from: number}> = ({text, from}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [from + 2, from + 12, from + 60, from + 75], [0, 1, 1, 0], clamp);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: 8, color: AMBER, borderTop: `1px solid ${AMBER}`, borderBottom: `1px solid ${AMBER}`, padding: '10px 18px'}}>{text}</div>
		</div>
	);
};

// ---------- shot-specific overlays ----------
const Counter: React.FC<{from: number; to: number; marks: [number, string][]}> = ({from, to, marks}) => {
	const frame = useCurrentFrame();
	const shown = marks.filter(([s]) => frame >= T(s));
	if (!shown.length || frame >= to) return null;
	return (
		<div style={{position: 'absolute', left: 64, right: 64, top: 300, display: 'flex', gap: 26, alignItems: 'baseline'}}>
			{shown.map(([s, label], i) => {
				const k = interpolate(frame, [T(s), T(s) + 4, T(s) + 10], [0.6, 1.08, 1], clamp);
				return (
					<div key={i} style={{fontFamily: FONT.serif, fontSize: 200, lineHeight: 1, color: i === shown.length - 1 ? AMBER : INK, scale: k, opacity: interpolate(frame, [to - 6, to], [1, 0], clamp), textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>
						{label}
					</div>
				);
			})}
		</div>
	);
};

const Repeat: React.FC = () => {
	const frame = useCurrentFrame();
	const a = T(47.66);
	if (frame < a || frame >= T(49.45)) return null;
	const n = Math.min(7, 1 + Math.floor((frame - a) / 6));
	return (
		<div style={{position: 'absolute', right: 64, top: 300, textAlign: 'right'}}>
			<div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: 6, color: AMBER}}>ULANGI</div>
			<div style={{fontFamily: FONT.serif, fontSize: 190, lineHeight: 1, color: INK, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>{`×${n}`}</div>
		</div>
	);
};

const SaveMark: React.FC = () => {
	const frame = useCurrentFrame();
	const a = T(54.28);
	if (frame < a) return null;
	const k = interpolate(frame, [a, a + 5, a + 12], [0, 1.15, 1], clamp);
	const fill = prog(frame, a + 10, a + 16);
	return (
		<div style={{position: 'absolute', right: 70, top: 220, scale: k}}>
			<svg viewBox="0 0 60 80" width={120} height={160}>
				<path d="M8 6 H52 V74 L30 58 L8 74 Z" fill={fill > 0.5 ? AMBER : 'none'} stroke={AMBER} strokeWidth={5} strokeLinejoin="round" />
			</svg>
		</div>
	);
};

// ---------- sound ----------
type C = {at: number; s: string; v: number};
const sfx = (name: string) => staticFile(`sfx/cine/${name}.wav`);
const CUES: C[] = [
	{at: 0.02, s: 'riser_short', v: 0.35},
	{at: 0.8, s: 'boom', v: 0.5},
	{at: 1.6, s: 'tick', v: 0.25},
	{at: 1.95, s: 'tick', v: 0.25},
	{at: 2.3, s: 'notif', v: 0.35},
	{at: 2.4, s: 'whoosh', v: 0.35},
	{at: 4.42, s: 'thud', v: 0.6},
	{at: 5.15, s: 'whoosh_soft', v: 0.4},
	{at: 5.3, s: 'heartbeat', v: 0.55},
	{at: 6.15, s: 'heartbeat', v: 0.55},
	{at: 6.36, s: 'thud', v: 0.45},
	{at: 7.0, s: 'whoosh_soft', v: 0.35},
	{at: 7.1, s: 'heartbeat', v: 0.5},
	{at: 7.95, s: 'heartbeat', v: 0.5},
	{at: 8.3, s: 'thud', v: 0.4},
	{at: 8.88, s: 'whoosh', v: 0.35},
	{at: 9.1, s: 'scribble', v: 0.4},
	{at: 10.36, s: 'tick', v: 0.3},
	{at: 11.16, s: 'scribble', v: 0.35},
	{at: 12.05, s: 'whoosh_soft', v: 0.35},
	{at: 12.5, s: 'chime_low', v: 0.25},
	{at: 12.6, s: 'riser', v: 0.35},
	{at: 14.4, s: 'swell', v: 0.5},
	{at: 14.45, s: 'whoosh', v: 0.35},
	{at: 16.7, s: 'whoosh_fast', v: 0.3},
	{at: 17.5, s: 'boom', v: 0.45},
	{at: 17.6, s: 'sparkle', v: 0.35},
	{at: 18.05, s: 'whoosh_soft', v: 0.35},
	{at: 20.05, s: 'whoosh_fast', v: 0.4},
	{at: 20.6, s: 'whoosh', v: 0.35},
	{at: 21.05, s: 'chime', v: 0.25},
	{at: 22.15, s: 'whoosh_fast', v: 0.35},
	...[0, 1, 2, 3].map((i) => ({at: 22.25 + i * 0.22, s: 'tick', v: 0.28})),
	{at: 23.05, s: 'whoosh', v: 0.4},
	{at: 23.15, s: 'step', v: 0.45},
	{at: 23.55, s: 'step', v: 0.45},
	{at: 23.9, s: 'step', v: 0.45},
	{at: 24.2, s: 'riser_short', v: 0.35},
	{at: 25.0, s: 'boom', v: 0.35},
	{at: 26.84, s: 'chime', v: 0.2},
	{at: 28.9, s: 'thud', v: 0.45},
	{at: 29.15, s: 'whoosh_soft', v: 0.35},
	{at: 31.36, s: 'chime', v: 0.3},
	{at: 32.9, s: 'whoosh_soft', v: 0.35},
	{at: 34.2, s: 'chime_low', v: 0.3},
	{at: 34.9, s: 'chime', v: 0.3},
	{at: 36.2, s: 'sparkle', v: 0.35},
	{at: 36.8, s: 'whoosh', v: 0.35},
	{at: 37.65, s: 'chime', v: 0.35},
	{at: 38.5, s: 'whoosh_fast', v: 0.4},
	...Array.from({length: 10}).map((_, i) => ({at: 38.6 + i * 0.3, s: 'step', v: 0.3})),
	{at: 41.0, s: 'thud', v: 0.4},
	{at: 41.8, s: 'whoosh', v: 0.35},
	...Array.from({length: 8}).map((_, i) => ({at: 42.0 + i * 0.4, s: 'tick', v: 0.26})),
	{at: 44.0, s: 'whoosh_fast', v: 0.4},
	{at: 45.25, s: 'whoosh_soft', v: 0.35},
	{at: 45.4, s: 'scribble', v: 0.3},
	...Array.from({length: 7}).map((_, i) => ({at: 47.66 + i * 0.2, s: 'tick', v: 0.25})),
	{at: 48.0, s: 'riser', v: 0.4},
	{at: 49.4, s: 'boom', v: 0.6},
	{at: 50.34, s: 'thud', v: 0.45},
	{at: 51.4, s: 'thud', v: 0.5},
	{at: 52.4, s: 'heartbeat', v: 0.5},
	{at: 53.2, s: 'riser_short', v: 0.35},
	{at: 54.0, s: 'swell', v: 0.5},
	{at: 54.05, s: 'whoosh', v: 0.35},
	{at: 54.28, s: 'notif', v: 0.35},
	{at: 54.6, s: 'chime', v: 0.3},
	{at: 56.5, s: 'sparkle', v: 0.45},
	{at: 56.55, s: 'chime', v: 0.3},
];

export const MentalCinematic: React.FC = () => {
	const frame = useCurrentFrame();
	const idx = shotIndex(frame);
	const shot = SHOTS[idx];
	const from = T(shot.at);
	const to = shotEnd(idx);
	const prev = idx > 0 ? SHOTS[idx - 1] : null;
	const xf = idx > 0 ? prog(frame, from, from + 8, EASE_IN_OUT) : 1; // short dissolve from the previous shot
	const n = shot.narrator;
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{prev && xf < 1 ? <Photo shot={prev} from={T(prev.at)} to={from} blur={!!prev.narrator} /> : null}
			<AbsoluteFill style={{opacity: xf, scale: interpolate(xf, [0, 1], [1.04, 1])}}>
				<Photo shot={shot} from={from} to={to} blur={!!n} />
			</AbsoluteFill>
			<Grade text={shot.text} />
			{shot.title ? <Title text={shot.title} from={from} top={shot.titleTop} /> : null}
			{idx === 12 ? <Counter from={from} to={to} marks={[[31.38, '1×']]} /> : null}
			{idx === 13 ? <Counter from={from} to={to} marks={[[34.22, '2×'], [34.92, '3×']]} /> : null}
			{idx === 17 ? <Repeat /> : null}
			{idx === 19 ? <SaveMark /> : null}
			{n ? (
				n.switchAt ? (
					<>
						<Narrator pose={n.pose} cx={n.cx} k={n.k} from={from} to={T(n.switchAt)} exit={false} />
						<Narrator pose={n.pose2 ?? n.pose} cx={n.cx} k={n.k} from={T(n.switchAt)} to={to} enter={false} />
					</>
				) : (
					<Narrator pose={n.pose} cx={n.cx} k={n.k} from={from} to={idx === SHOTS.length - 1 ? CINE_FRAMES + 30 : to} />
				)
			) : null}
			<Narration from={from} to={idx === SHOTS.length - 1 ? CINE_FRAMES + 30 : to} place={shot.text} strike={idx === 7 ? 'kecerdasan' : undefined} />
			{shot.chapter ? <Chapter text={shot.chapter} from={from} /> : null}
			{SHOTS.slice(1).map((s, i) => (i % 3 === 0 ? <Leak key={i} at={T(s.at)} seed={i} /> : null))}
			<Grain />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(interpolate(frame, [0, 8], [1, 0], clamp), interpolate(frame, [CINE_FRAMES - 20, CINE_FRAMES - 1], [0, 1], clamp))}} />
			<Audio src={staticFile('vo_mental.wav')} />
			<Audio src={staticFile('music_mental.wav')} volume={0.9} />
			{CUES.map((c, i) => (
				<Sequence key={i} from={T(c.at)} layout="none" name={`sfx ${c.s}`}>
					<Audio src={sfx(c.s)} volume={c.v} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};

